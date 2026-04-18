export type GameStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed';
export type GameMode = 'standard' | 'wait' | 'free';
export type HitGrade = 'perfect' | 'great' | 'good' | 'miss';

export interface HitResult {
  grade: HitGrade;
  score: number;
  combo: number;
  timeDiff: number;
}

export interface GameResult {
  score: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  accuracy: number;
  stars: number;
  xpEarned: number;
}

export interface FrameData {
  visibleNotes: VisibleNote[];
  barLines: BarLine[];
  hitEffects: HitEffect[];
  score: number;
  combo: number;
  progress: number;
}

export interface VisibleNote {
  id: string;
  note: number;
  hand: 'left' | 'right';
  currentY: number;
  width: number;
  height: number;
  isHit: boolean;
  opacity: number;
}

export interface BarLine {
  id: string;
  y: number;
}

export interface HitEffect {
  id: string;
  x: number;
  y: number;
  grade: HitGrade;
  startTime: number;
}
