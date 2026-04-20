import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'easypiano' });

// Keys are centralized so the set of persisted values is visible at a glance.
const K = {
  accessToken: 'auth.access_token',
  refreshToken: 'auth.refresh_token',
  user: 'auth.user',
} as const;

export const tokenStorage = {
  getAccessToken(): string | null {
    return storage.getString(K.accessToken) ?? null;
  },
  getRefreshToken(): string | null {
    return storage.getString(K.refreshToken) ?? null;
  },
  setTokens(accessToken: string, refreshToken: string) {
    storage.set(K.accessToken, accessToken);
    storage.set(K.refreshToken, refreshToken);
  },
  clearTokens() {
    storage.delete(K.accessToken);
    storage.delete(K.refreshToken);
  },
};

export const userStorage = {
  getUser<T = unknown>(): T | null {
    const raw = storage.getString(K.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  setUser<T>(user: T) {
    storage.set(K.user, JSON.stringify(user));
  },
  clearUser() {
    storage.delete(K.user);
  },
};
