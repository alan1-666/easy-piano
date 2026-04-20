import { Audio, AVPlaybackSource } from 'expo-av';

// Minimum viable audio engine: 3 base samples (A3/A4/A5) pitch-shifted via
// playback rate to cover MIDI notes ~45..93 (E3..A6). expo-av's rate is
// clamped to [0.5, 2.0] so each sample covers ±12 semitones.
//
// The samples are synthesized sine-plus-harmonic tones, not real piano
// recordings — they sound fake but the plumbing matters more than the
// timbre right now. Drop real .wav files in app/assets/audio/ with the
// same names to upgrade.

const BASE_NOTES: Array<{ midi: number; source: AVPlaybackSource }> = [
  { midi: 57, source: require('../../assets/audio/piano-a3.wav') },
  { midi: 69, source: require('../../assets/audio/piano-a4.wav') },
  { midi: 81, source: require('../../assets/audio/piano-a5.wav') },
];

// Pool a few Sound instances per base so we can play overlapping notes
// without re-creating them every keypress (cheaper + lower latency).
const POOL_PER_BASE = 4;

interface PooledSound {
  sound: Audio.Sound;
  busyUntilMs: number;
}

let pools: Map<number, PooledSound[]> = new Map();
let initPromise: Promise<void> | null = null;
let initialised = false;
let enabled = true;

async function init(): Promise<void> {
  if (initialised) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        staysActiveInBackground: false,
      });
      for (const base of BASE_NOTES) {
        const entries: PooledSound[] = [];
        for (let i = 0; i < POOL_PER_BASE; i++) {
          const { sound } = await Audio.Sound.createAsync(base.source, {
            shouldPlay: false,
          });
          entries.push({ sound, busyUntilMs: 0 });
        }
        pools.set(base.midi, entries);
      }
      initialised = true;
    } catch (err) {
      console.warn('[audio] init failed:', err);
      enabled = false;
    }
  })();
  return initPromise;
}

// Pick the base sample with the smallest pitch shift from the target midi
// note (ties broken by going up). Keeps expo-av's rate within the safe
// ±12 semitone window whenever possible.
function pickBase(midi: number): typeof BASE_NOTES[number] {
  let best = BASE_NOTES[0];
  let bestDist = Math.abs(midi - best.midi);
  for (const b of BASE_NOTES) {
    const d = Math.abs(midi - b.midi);
    if (d < bestDist) {
      best = b;
      bestDist = d;
    }
  }
  return best;
}

function rateFor(targetMidi: number, baseMidi: number): number {
  const semitones = targetMidi - baseMidi;
  const r = Math.pow(2, semitones / 12);
  // Clamp to expo-av's supported range so we never hit invalid-rate errors.
  return Math.max(0.5, Math.min(2.0, r));
}

async function playNote(midi: number, velocity = 80): Promise<void> {
  if (!enabled) return;
  if (!initialised) {
    await init();
    if (!enabled) return;
  }
  const base = pickBase(midi);
  const pool = pools.get(base.midi);
  if (!pool) return;

  const now = Date.now();
  // Pick a free (or least-recently-busy) instance.
  let chosen = pool[0];
  for (const p of pool) {
    if (p.busyUntilMs <= now) {
      chosen = p;
      break;
    }
    if (p.busyUntilMs < chosen.busyUntilMs) chosen = p;
  }

  try {
    await chosen.sound.stopAsync().catch(() => {});
    await chosen.sound.setPositionAsync(0);
    await chosen.sound.setRateAsync(rateFor(midi, base.midi), true);
    await chosen.sound.setVolumeAsync(Math.max(0.1, Math.min(1, velocity / 127)));
    await chosen.sound.playAsync();
    chosen.busyUntilMs = now + 1500; // same as DUR in gen-piano-samples.js
  } catch (err) {
    // Swallow — audio failures shouldn't crash the game loop.
    console.warn('[audio] play failed:', err);
  }
}

async function unload(): Promise<void> {
  for (const pool of pools.values()) {
    for (const p of pool) {
      await p.sound.unloadAsync().catch(() => {});
    }
  }
  pools = new Map();
  initialised = false;
  initPromise = null;
}

export const audio = {
  init,
  playNote,
  unload,
  get enabled() {
    return enabled;
  },
};
