import client from './client';
import { decodeMidiData } from '../engine/midiDecoder';
import type { Song } from '../types/song';

// Shape as it arrives from the Go server (snake_case, tags is a raw string,
// tracks is not sent — midi_data is a blob that still needs parsing before
// it can drive the game engine).
interface ServerSong {
  id: number;
  title: string;
  artist: string;
  difficulty: number;
  bpm: number;
  duration: number;
  time_signature?: string;
  key_signature?: string;
  midi_data?: string;
  tags?: string;
  cover_url?: string;
  is_free: boolean;
  locale?: string;
}

interface ServerSongsResponse {
  items: ServerSong[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
}

export interface SongsPage {
  items: Song[];
  total: number;
  page: number;
  pageSize: number;
}

function splitTags(raw?: string): string[] {
  if (!raw) return [];
  // Backend stores tags as a single text column. Prefer JSON if present,
  // fall back to comma / slash / space separated.
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      /* fall through */
    }
  }
  return trimmed
    .split(/[,;/\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function toSong(raw: ServerSong): Song {
  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    difficulty: raw.difficulty,
    bpm: raw.bpm,
    duration: raw.duration,
    timeSignature: raw.time_signature ?? '4/4',
    keySignature: raw.key_signature ?? 'C',
    tags: splitTags(raw.tags),
    coverUrl: raw.cover_url ?? '',
    isFree: raw.is_free,
    // midi_data may be either our JSON track format or (eventually) a
    // base64 .mid blob. decodeMidiData handles the first and politely
    // returns [] for the second, which the game engine treats as
    // "fall back to the demo melody".
    tracks: decodeMidiData(raw.midi_data),
  };
}

export async function getSongs(
  page = 1,
  pageSize = 20,
  difficulty?: number,
  query?: string,
): Promise<SongsPage> {
  const params: Record<string, string | number> = { page, page_size: pageSize };
  if (difficulty !== undefined) params.difficulty = difficulty;
  if (query) params.q = query;
  const { data } = await client.get<{ data: ServerSongsResponse }>('/songs', {
    params,
  });
  const payload = data.data;
  return {
    items: payload.items.map(toSong),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
  };
}

export async function getSong(id: number): Promise<Song> {
  const { data } = await client.get<{ data: ServerSong }>(`/songs/${id}`);
  return toSong(data.data);
}
