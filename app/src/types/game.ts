export type GameStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'completed';
export type GameMode = 'standard' | 'wait' | 'free';
export type HitGrade = 'perfect' | 'great' | 'good' | 'miss';
export type SongHand = 'left' | 'right';

export interface HitResult {
  grade: HitGrade;
  score: number;
  combo: number;
  timeDiff: number;
  hand: SongHand;
  note: number;
  noteId: string;
  requiresHold: boolean;
}

export interface NoteJudgment {
  id: string;
  note: number;
  hand: SongHand;
  grade: HitGrade;
}

export interface HandResultSummary {
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  totalNotes: number;
  accuracy: number;
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
  leftHand: HandResultSummary;
  rightHand: HandResultSummary;
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
  x: number;
  currentY: number;
  width: number;
  height: number;
  isSustain: boolean;
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
