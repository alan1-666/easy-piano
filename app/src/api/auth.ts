import client from './client';
import type { AuthTokens, User } from '../types/user';

interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await client.post('/auth/login', { email, password });
  return data.data;
}

export async function register(
  username: string,
  email: string,
  phone: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await client.post('/auth/register', { username, email, phone, password });
  return data.data;
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  const { data } = await client.post('/auth/refresh', { refresh_token: token });
  return data.data;
}

export async function appleLogin(identityToken: string): Promise<LoginResponse> {
  const { data } = await client.post('/auth/apple', { identity_token: identityToken });
  return data.data;
}
