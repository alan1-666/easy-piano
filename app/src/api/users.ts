import client from './client';
import type { User, UserProgress, Achievement } from '../types/user';

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

interface ServerStats {
  total_practice_seconds: number;
  total_songs_played: number;
  total_sessions: number;
  current_streak: number;
}

export interface UserStats {
  totalPracticeSeconds: number;
  totalSongsPlayed: number;
  totalSessions: number;
  currentStreak: number;
}

interface ServerProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  status: string;
  best_score?: number | null;
  stars: number;
  attempts: number;
  completed_at?: string | null;
}

interface ServerAchievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  condition_type?: string;
  condition_value?: number;
}

interface ServerUserAchievement {
  achievement_id: number;
  unlocked_at: string;
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

function toProgress(raw: ServerProgress): UserProgress {
  return {
    lessonId: raw.lesson_id,
    status: (raw.status as UserProgress['status']) ?? 'locked',
    bestScore: raw.best_score ?? undefined,
    stars: raw.stars,
    attempts: raw.attempts,
  };
}

export async function getMe(): Promise<User> {
  const { data } = await client.get<{ data: ServerUser }>('/users/me');
  return toUser(data.data);
}

export async function getMyStats(): Promise<UserStats> {
  const { data } = await client.get<{ data: ServerStats }>('/users/me/stats');
  return {
    totalPracticeSeconds: data.data.total_practice_seconds,
    totalSongsPlayed: data.data.total_songs_played,
    totalSessions: data.data.total_sessions,
    currentStreak: data.data.current_streak,
  };
}

export async function getMyProgress(): Promise<UserProgress[]> {
  const { data } = await client.get<{ data: ServerProgress[] }>('/users/me/progress');
  return data.data.map(toProgress);
}

export interface AchievementWithUnlock extends Achievement {
  unlocked: boolean;
}

export async function getMyAchievements(): Promise<AchievementWithUnlock[]> {
  const { data } = await client.get<{
    data: { achievements: ServerAchievement[]; unlocked: ServerUserAchievement[] };
  }>('/users/me/achievements');
  const unlockedSet = new Set(data.data.unlocked.map((u) => u.achievement_id));
  const unlockedDates = new Map(
    data.data.unlocked.map((u) => [u.achievement_id, u.unlocked_at]),
  );
  return data.data.achievements.map((a) => ({
    id: String(a.id),
    name: a.name,
    description: a.description,
    icon: a.icon,
    unlockedAt: unlockedDates.get(a.id),
    unlocked: unlockedSet.has(a.id),
  }));
}
