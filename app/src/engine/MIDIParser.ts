import type { Song } from '../types/song';

/**
 * Parse raw MIDI data (from the server) into structured Song track data.
 * The server already provides parsed JSON; this handles any client-side
 * transformations needed.
 */
export function parseMIDIData(_rawData: string): Song | null {
  // TODO: parse MIDI JSON data from server response
  return null;
}
