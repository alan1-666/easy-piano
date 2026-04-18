const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEY_INDICES = new Set([1, 3, 6, 8, 10]);

/**
 * Convert a MIDI note number (0-127) to a note name (e.g., "C4", "F#3").
 */
export function midiNoteToName(note: number): string {
  const name = NOTE_NAMES[note % 12];
  const octave = Math.floor(note / 12) - 1;
  return `${name}${octave}`;
}

/**
 * Get the octave of a MIDI note number.
 */
export function midiNoteToOctave(note: number): number {
  return Math.floor(note / 12) - 1;
}

/**
 * Check if a MIDI note number corresponds to a black key.
 */
export function isBlackKey(note: number): boolean {
  return BLACK_KEY_INDICES.has(note % 12);
}

/**
 * Get the rendering color for a note based on hand and key type.
 */
export function getNoteColor(
  hand: 'left' | 'right',
  note: number,
  leftColor = '#4A90D9',
  rightColor = '#50C878'
): string {
  const baseColor = hand === 'left' ? leftColor : rightColor;
  // Slightly darken for black keys
  if (isBlackKey(note)) {
    return darkenColor(baseColor, 0.15);
  }
  return baseColor;
}

function darkenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.floor(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0xff) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
