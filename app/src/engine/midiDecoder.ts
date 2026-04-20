import { Midi } from '@tonejs/midi';
import type { Track, NoteData } from '../types/song';

// Decodes the `midi_data` column from the server into the engine's
// Track[] shape. Two wire formats are supported:
//
//   1. JSON — a stringified Track[] (or {tracks: Track[]}). Human-
//      editable; how our initial seed SQL is written. Detected by the
//      first non-space character being `[` or `{`.
//   2. Base64 .mid — real MIDI files uploaded via POST /v1/admin/songs/
//      :id/midi. Parsed through @tonejs/midi.
//
// Hand assignment for MIDI files: the GameEngine wants each track
// tagged 'left' or 'right'. Real .mid files don't carry that metadata,
// so we infer it — any track whose average pitch sits at or below C4
// (MIDI 60) is the left hand, the rest are right. Not perfect but
// matches how most piano arrangements are written.
export function decodeMidiData(raw: string | undefined | null): Track[] {
  if (!raw) return [];
  const s = raw.trim();
  if (s === '') return [];

  if (s.startsWith('[') || s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s);
      const tracks = Array.isArray(parsed) ? parsed : parsed?.tracks;
      if (!Array.isArray(tracks)) return [];
      return tracks.map(normalizeTrack).filter((t): t is Track => t !== null);
    } catch (err) {
      console.warn('[midiDecoder] invalid JSON in midi_data:', err);
      return [];
    }
  }

  // Assume base64 .mid
  try {
    return parseBase64Midi(s);
  } catch (err) {
    console.warn('[midiDecoder] base64 MIDI parse failed:', err);
    return [];
  }
}

function base64ToBytes(b64: string): Uint8Array {
  // Hermes has atob available globally; use it. Fallback path would be
  // to pull in a polyfill, not needed for our targets.
  const bin = globalThis.atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function parseBase64Midi(b64: string): Track[] {
  const bytes = base64ToBytes(b64);
  const midi = new Midi(bytes);

  const tracks: Track[] = [];
  for (const t of midi.tracks) {
    if (!t.notes.length) continue;
    // Average pitch → hand assignment.
    const avg = t.notes.reduce((s, n) => s + n.midi, 0) / t.notes.length;
    const hand: 'left' | 'right' = avg < 60 ? 'left' : 'right';
    const notes: NoteData[] = t.notes.map((n) => ({
      note: n.midi,
      // @tonejs/midi gives time/duration in seconds; engine wants ms.
      start: Math.round(n.time * 1000),
      duration: Math.max(50, Math.round(n.duration * 1000)),
      velocity: Math.round(n.velocity * 127),
    }));
    tracks.push({ hand, notes });
  }
  return tracks;
}

function normalizeTrack(raw: unknown): Track | null {
  if (!raw || typeof raw !== 'object') return null;
  const t = raw as { hand?: string; notes?: unknown };
  const hand = t.hand === 'left' ? 'left' : 'right';
  if (!Array.isArray(t.notes)) return null;
  const notes: NoteData[] = [];
  for (const n of t.notes) {
    if (!n || typeof n !== 'object') continue;
    const nn = n as Record<string, unknown>;
    const note = Number(nn.note);
    const start = Number(nn.start);
    const duration = Number(nn.duration);
    const velocity = Number(nn.velocity ?? 80);
    if (!Number.isFinite(note) || !Number.isFinite(start) || !Number.isFinite(duration)) {
      continue;
    }
    notes.push({ note, start, duration, velocity });
  }
  return { hand, notes };
}
