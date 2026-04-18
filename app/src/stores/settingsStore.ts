import { create } from 'zustand';
import type { UserSettings } from '../types/user';

interface SettingsState extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fallSpeed: 1.0,
  leftHandColor: '#4A90D9',
  rightHandColor: '#50C878',
  soundFont: 'default',
  metronomeOn: false,
  dailyGoalMin: 30,
  locale: 'zh-CN',

  updateSettings: (settings: Partial<UserSettings>) => set(settings),

  loadSettings: async () => {
    // TODO: load settings from local storage or API
  },
}));
