import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import type { UserSettings } from '../types/user';

// Device-local settings. We don't round-trip these through the server
// for now (the /users/me/settings endpoints exist but syncing client-
// server is its own can of worms). MMKV-backed so toggles survive app
// restarts and are available synchronously at read time — matters for
// audio gating, which runs inside a 60Hz game loop.
const storage = new MMKV({ id: 'easypiano' });
const KEY = 'user.settings';

const DEFAULTS: UserSettings = {
  fallSpeed: 1.0,
  leftHandColor: '#4A90D9',
  rightHandColor: '#50C878',
  soundFont: 'default',
  metronomeOn: false,
  dailyGoalMin: 30,
  locale: 'zh-CN',
  keyEcho: true,
  autoPlay: true,
};

function readFromStorage(): UserSettings {
  const raw = storage.getString(KEY);
  if (!raw) return DEFAULTS;
  try {
    // Merge with defaults so adding a new setting later doesn't wipe
    // users who already have serialised data without that key.
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<UserSettings>) };
  } catch {
    return DEFAULTS;
  }
}

function writeToStorage(s: UserSettings): void {
  storage.set(KEY, JSON.stringify(s));
}

interface SettingsState extends UserSettings {
  updateSettings: (settings: Partial<UserSettings>) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...readFromStorage(),

  updateSettings: (partial) => {
    const next = { ...get(), ...partial };
    writeToStorage({
      fallSpeed: next.fallSpeed,
      leftHandColor: next.leftHandColor,
      rightHandColor: next.rightHandColor,
      soundFont: next.soundFont,
      metronomeOn: next.metronomeOn,
      dailyGoalMin: next.dailyGoalMin,
      locale: next.locale,
      keyEcho: next.keyEcho,
      autoPlay: next.autoPlay,
    });
    set(partial);
  },

  reset: () => {
    writeToStorage(DEFAULTS);
    set(DEFAULTS);
  },
}));
