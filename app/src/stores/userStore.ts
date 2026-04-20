import { create } from 'zustand';
import * as authApi from '../api/auth';
import { tokenStorage, userStorage } from '../utils/storage';
import { syncQueue } from '../offline/syncQueue';
import type { User, AuthTokens } from '../types/user';

// The server emits snake_case. This is the shape as received over the wire.
interface ServerUser {
  id: number;
  username: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  level: number;
  xp: number;
  is_child?: boolean;
}

function toUser(raw: ServerUser): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    phone: raw.phone ?? '',
    avatarUrl: raw.avatar_url ?? '',
    level: raw.level,
    xp: raw.xp,
    isChild: raw.is_child ?? false,
  };
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  tokens: AuthTokens | null;

  hydrate: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  tokens: null,

  // Rehydrate from MMKV on app start so a previously-logged-in user
  // doesn't get kicked to the login screen every launch.
  hydrate: () => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();
    const cachedUser = userStorage.getUser<User>();
    if (accessToken && refreshToken && cachedUser) {
      set({
        user: cachedUser,
        isLoggedIn: true,
        tokens: { accessToken, refreshToken, expiresIn: 3600 },
      });
    }
  },

  login: async (email, password) => {
    // Normalize email — users regularly type it with a leading space /
    // an auto-capped first letter / mobile autocomplete artefacts.
    // Emails are case-insensitive per RFC 5321 so lowercasing is safe.
    const normalizedEmail = email.trim().toLowerCase();
    const res = (await authApi.login(normalizedEmail, password)) as unknown as {
      user: ServerUser;
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    const user = toUser(res.user);
    tokenStorage.setTokens(res.access_token, res.refresh_token);
    userStorage.setUser(user);
    set({
      user,
      isLoggedIn: true,
      tokens: {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        expiresIn: res.expires_in,
      },
    });
    // Anything queued while logged-out (or while the previous session
    // was offline) is now eligible to ship — fire and forget.
    void syncQueue.flush();
  },

  logout: () => {
    tokenStorage.clearTokens();
    userStorage.clearUser();
    set({ user: null, isLoggedIn: false, tokens: null });
  },

  register: async (username, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const res = (await authApi.register(username, normalizedEmail, '', password)) as unknown as {
      user: ServerUser;
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    const user = toUser(res.user);
    tokenStorage.setTokens(res.access_token, res.refresh_token);
    userStorage.setUser(user);
    set({
      user,
      isLoggedIn: true,
      tokens: {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        expiresIn: res.expires_in,
      },
    });
    void syncQueue.flush();
  },

  refreshToken: async () => {
    const current = tokenStorage.getRefreshToken();
    if (!current) {
      get().logout();
      return;
    }
    const res = (await authApi.refreshToken(current)) as unknown as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
    tokenStorage.setTokens(res.access_token, res.refresh_token);
    set({
      tokens: {
        accessToken: res.access_token,
        refreshToken: res.refresh_token,
        expiresIn: res.expires_in,
      },
    });
  },

  updateProfile: async (_updates: Partial<User>) => {
    // TODO: call PATCH /v1/users/me once the backend endpoint exists
  },
}));
