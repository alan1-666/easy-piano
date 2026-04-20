import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/storage';

// Base URL is env-driven: set EXPO_PUBLIC_API_BASE_URL at build/run time
// to point at whichever environment you want. Fallback is a localhost
// SSH tunnel used during staging (see server/README for the tunnel
// command) — the iOS simulator's NSURLSession doesn't honour the
// host's system proxy, so we terminate that traffic on localhost.
//
// Prod will eventually be https://api.easypiano.app/v1 or similar,
// served by Caddy (see server/Caddyfile).
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:18080/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

client.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Single in-flight refresh promise — parallel 401s wait on the same one
// instead of each firing its own refresh.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { timeout: 15000 },
    );
    const payload = data?.data;
    if (payload?.access_token && payload?.refresh_token) {
      tokenStorage.setTokens(payload.access_token, payload.refresh_token);
      return payload.access_token as string;
    }
    return null;
  } catch {
    tokenStorage.clearTokens();
    return null;
  }
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client.request(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
export { API_BASE_URL };
