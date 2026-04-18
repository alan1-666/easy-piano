import { create } from 'zustand';
import type { User, AuthTokens } from '../types/user';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  tokens: AuthTokens | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  tokens: null,

  login: async (_email: string, _password: string) => {
    // TODO: call auth API
    set({ isLoggedIn: false });
  },

  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
      tokens: null,
    }),

  register: async (_username: string, _email: string, _password: string) => {
    // TODO: call auth API
  },

  refreshToken: async () => {
    // TODO: call refresh token API
  },

  updateProfile: async (_updates: Partial<User>) => {
    // TODO: call update profile API
  },
}));
