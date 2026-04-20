import client from './client';
import type { PracticeLog } from '../types/user';

export interface SubmitLogRequest {
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
  played_at?: string; // RFC3339; if omitted, server stamps it
}

interface ServerPracticeLog {
  id: number;
  user_id: number;
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
  played_at: string;
  synced: boolean;
}

function toLog(raw: ServerPracticeLog): PracticeLog {
  return {
    id: raw.id,
    songId: raw.song_id,
    mode: raw.mode,
    speed: raw.speed,
    score: raw.score,
    accuracy: raw.accuracy,
    maxCombo: raw.max_combo,
    perfectCount: raw.perfect_count,
    greatCount: raw.great_count,
    goodCount: raw.good_count,
    missCount: raw.miss_count,
    duration: raw.duration,
    playedAt: raw.played_at,
  };
}

export async function submitPracticeLog(log: SubmitLogRequest): Promise<{
  log: PracticeLog;
  newAchievements: unknown[];
}> {
  const payload = { ...log, played_at: log.played_at ?? new Date().toISOString() };
  const { data } = await client.post<{
    data: { log: ServerPracticeLog; new_achievements: unknown[] };
  }>('/practice/log', payload);
  return {
    log: toLog(data.data.log),
    newAchievements: data.data.new_achievements ?? [],
  };
}

export async function syncOfflineLogs(logs: SubmitLogRequest[]): Promise<void> {
  await client.post('/practice/sync', logs);
}

interface HistoryPage {
  items: PracticeLog[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getHistory(page = 1, pageSize = 20): Promise<HistoryPage> {
  const { data } = await client.get<{
    data: { items: ServerPracticeLog[]; total: number; page: number; page_size: number };
  }>('/practice/history', { params: { page, page_size: pageSize } });
  return {
    items: data.data.items.map(toLog),
    total: data.data.total,
    page: data.data.page,
    pageSize: data.data.page_size,
  };
}

export async function getStreak(): Promise<number> {
  const { data } = await client.get<{ data: { streak: number } }>('/practice/streak');
  return data.data.streak;
}
