import { create } from 'zustand';
import type { GameStatus, GameMode, HitGrade } from '../types/game';

interface GameState {
  status: GameStatus;
  mode: GameMode;
  speed: number;
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  greatCount: number;
  goodCount: number;
  missCount: number;
  progress: number;
  songId: number | null;

  loadSong: (songId: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  setMode: (mode: GameMode) => void;
  setSpeed: (speed: number) => void;
  recordHit: (grade: HitGrade) => void;
  recordMiss: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as GameStatus,
  mode: 'standard' as GameMode,
  speed: 1.0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  perfectCount: 0,
  greatCount: 0,
  goodCount: 0,
  missCount: 0,
  progress: 0,
  songId: null as number | null,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialState,

  loadSong: (songId: number) => set({ songId, status: 'loading' }),

  startGame: () => set({ status: 'playing' }),

  pauseGame: () => set({ status: 'paused' }),

  resumeGame: () => set({ status: 'playing' }),

  endGame: () => set({ status: 'completed' }),

  setMode: (mode: GameMode) => set({ mode }),

  setSpeed: (speed: number) => set({ speed }),

  recordHit: (grade: HitGrade) =>
    set((state) => {
      const newCombo = state.combo + 1;
      return {
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        [`${grade}Count`]: (state as unknown as Record<string, number>)[`${grade}Count`] + 1,
      };
    }),

  recordMiss: () =>
    set((state) => ({
      combo: 0,
      missCount: state.missCount + 1,
    })),

  reset: () => set(initialState),
}));
