export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  avatarUrl: string;
  level: number;
  xp: number;
  isChild: boolean;
}

export interface UserSettings {
  fallSpeed: number;
  leftHandColor: string;
  rightHandColor: string;
  soundFont: string;
  metronomeOn: boolean;
  dailyGoalMin: number;
  locale: string;
}

export interface PracticeLog {
  id: number;
  songId: number;
  mode: string;
  speed: number;
  score: number;
  accuracy: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  duration: number;
  playedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface Subscription {
  plan: 'monthly' | 'yearly' | 'lifetime';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  level: number;
  orderIndex: number;
  isFree: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  courseId: number;
  title: string;
  description: string;
  orderIndex: number;
  type: 'teach' | 'practice' | 'challenge';
  songId?: number;
}

export interface UserProgress {
  lessonId: number;
  status: 'locked' | 'unlocked' | 'completed';
  bestScore?: number;
  stars: number;
  attempts: number;
}
