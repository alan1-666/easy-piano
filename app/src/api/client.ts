import axios from 'axios';

const API_BASE_URL = 'https://api.easypiano.app/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token
client.interceptors.request.use(
  (config) => {
    // TODO: get token from userStore or MMKV storage
    const token = '';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // TODO: attempt token refresh and retry request
    }

    return Promise.reject(error);
  }
);

export default client;
