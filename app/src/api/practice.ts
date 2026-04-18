import client from './client';
import type { PracticeLog } from '../types/user';

interface SubmitLogRequest {
  song_id: number;
  mode: string;
  speed: number;
  score: number;
  accuracy: number;
  max_combo: number;
  perfect_count: number;
  great_count: number;
  good_count: number;
  miss_count: number;
  duration: number;
}

export async function submitPracticeLog(log: SubmitLogRequest): Promise<void> {
  await client.post('/practice/log', log);
}

export async function syncOfflineLogs(logs: SubmitLogRequest[]): Promise<void> {
  await client.post('/practice/sync', { logs });
}

export async function getHistory(page = 1, pageSize = 20): Promise<PracticeLog[]> {
  const { data } = await client.get('/practice/history', {
    params: { page, page_size: pageSize },
  });
  return data.data;
}

export async function getStreak(): Promise<{ streak: number }> {
  const { data } = await client.get('/practice/streak');
  return data.data;
}
