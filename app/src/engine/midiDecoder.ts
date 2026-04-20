import type { Track, NoteData } from '../types/song';

// Decodes the `midi_data` column from the server into the engine's
// Track[] shape. Two formats are supported:
//
//   1. JSON — a stringified Track[] (or {tracks: Track[]}). Cheap,
//      human-editable, what we seed with initially. Detected by the
//      first non-space character being `[` or `{`.
//   2. Base64 .mid — real MIDI files uploaded by users later. Not yet
//      implemented; returns [] and logs a warning so callers fall back
//      to the demo melody rather than crash. When we're ready, wire in
//      @tonejs/midi (or midi-file) here — the rest of the pipeline
//      already reads from the returned Track[].
export function decodeMidiData(raw: string | undefined | null): Track[] {
  if (!raw) return [];
  const s = raw.trim();
  if (s === '') return [];

  if (s.startsWith('[') || s.startsWith('{')) {
    try {
      const parsed = JSON.parse(s);
      const tracks = Array.isArray(parsed) ? parsed : parsed?.tracks;
      if (!Array.isArray(tracks)) return [];
      return tracks
        .map(normalizeTrack)
        .filter((t): t is Track => t !== null);
    } catch (err) {
      console.warn('[midiDecoder] invalid JSON in midi_data:', err);
      return [];
    }
  }

  // Looks like a non-JSON blob — assume base64 MIDI. Not supported yet.
  console.warn('[midiDecoder] base64 MIDI parsing not implemented, falling back');
  return [];
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
