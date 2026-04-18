import client from './client';
import type { Song } from '../types/song';

interface SongsResponse {
  items: Song[];
  total: number;
  page: number;
  page_size: number;
}

export async function getSongs(
  page = 1,
  pageSize = 20,
  difficulty?: number,
  query?: string
): Promise<SongsResponse> {
  const params: Record<string, string | number> = { page, page_size: pageSize };
  if (difficulty !== undefined) params.difficulty = difficulty;
  if (query) params.q = query;
  const { data } = await client.get('/songs', { params });
  return data.data;
}

export async function getSong(id: number): Promise<Song> {
  const { data } = await client.get(`/songs/${id}`);
  return data.data;
}
