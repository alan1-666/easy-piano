import type { NoteData, Track } from '../types/song';
import type { VisibleNote, HitResult, HitGrade } from '../types/game';

interface GameNote {
  id: string;
  note: number;
  startMs: number;
  durationMs: number;
  velocity: number;
  hand: 'left' | 'right';
  isHit: boolean;
  hitTime: number | null;
  hitGrade: HitGrade | null;
}

interface GameSong {
  id: number;
  title: string;
  bpm: number;
  duration: number;
  tracks: Track[];
}

/**
 * GameEngine orchestrates note scheduling, hit detection, and scoring.
 * Uses absolute time (performance.now()) for all calculations.
 */
export class GameEngine {
  private notes: GameNote[] = [];
  private songStartTime: number = 0;
  private bpm: number = 120;
  private speed: number = 1.0;
  private pixelsPerMs: number = 0.3;
  private judgmentLineY: number = 500;
  private screenHeight: number = 800;
  private totalDurationMs: number = 0;
  private songTitle: string = '';

  static PERFECT_WINDOW = 50;
  static GREAT_WINDOW = 100;
  static GOOD_WINDOW = 200;

  /**
   * Initialize the engine with song data and screen dimensions.
   */
  init(song: GameSong, screenHeight: number, judgmentLineY: number): void {
    this.screenHeight = screenHeight;
    this.judgmentLineY = judgmentLineY;
    this.bpm = song.bpm;
    this.songTitle = song.title;
    this.totalDurationMs = song.duration * 1000;
    this.notes = [];

    // Calculate pixels per ms based on speed
    // At 1x speed, notes should take about 2 seconds to traverse the visible area
    const fallDurationMs = 2000 / this.speed;
    this.pixelsPerMs = judgmentLineY / fallDurationMs;

    // Flatten all tracks into a single sorted list of notes
    let noteIndex = 0;
    for (const track of song.tracks) {
      for (const noteData of track.notes) {
        this.notes.push({
          id: `note_${noteIndex++}`,
          note: noteData.note,
          startMs: noteData.start,
          durationMs: noteData.duration,
          velocity: noteData.velocity,
          hand: track.hand,
          isHit: false,
          hitTime: null,
          hitGrade: null,
        });
      }
    }

    // Sort by start time
    this.notes.sort((a, b) => a.startMs - b.startMs);
  }

  /**
   * Set the playback speed multiplier.
   */
  setSpeed(speed: number): void {
    this.speed = speed;
    const fallDurationMs = 2000 / this.speed;
    this.pixelsPerMs = this.judgmentLineY / fallDurationMs;
  }

  /**
   * Start the game — record the song start time.
   */
  start(timestamp?: number): void {
    this.songStartTime = timestamp ?? performance.now();
  }

  /**
   * Get the song title.
   */
  getTitle(): string {
    return this.songTitle;
  }

  /**
   * Get all notes currently visible on screen based on absolute time.
   * Each note's Y position is calculated relative to the judgment line.
   */
  getVisibleNotes(currentTime: number, keyboardWidth: number, startNote: number = 60): VisibleNote[] {
    const elapsedMs = currentTime - this.songStartTime;
    const visible: VisibleNote[] = [];
    const whiteKeyWidth = keyboardWidth / 14;

    for (const note of this.notes) {
      // Skip notes that were hit and have faded out
      if (note.isHit && note.hitTime !== null) {
        const fadeElapsed = currentTime - note.hitTime;
        if (fadeElapsed > 300) continue;
      }

      // Calculate Y position: judgment line is where note.startMs aligns with elapsed time
      // When elapsedMs === note.startMs, note bottom edge should be at judgmentLineY
      const timeDiff = note.startMs - elapsedMs;
      const noteBottomY = this.judgmentLineY - timeDiff * this.pixelsPerMs;
      const noteHeight = Math.max(16, note.durationMs * this.pixelsPerMs);
      const noteTopY = noteBottomY - noteHeight;

      // Only include notes that are within screen bounds (with some buffer)
      if (noteTopY > this.screenHeight + 50) continue;
      if (noteBottomY < -50) continue;

      // Calculate opacity for hit notes (fade out)
      let opacity = 1.0;
      if (note.isHit && note.hitTime !== null) {
        const fadeElapsed = currentTime - note.hitTime;
        opacity = Math.max(0, 1 - fadeElapsed / 300);
      }

      // Calculate X position and width
      const x = noteToKeyPosition(note.note, keyboardWidth, startNote);
      const isBlack = isBlackKey(note.note);
      const width = isBlack ? whiteKeyWidth * 0.6 - 2 : whiteKeyWidth - 2;

      visible.push({
        id: note.id,
        note: note.note,
        hand: note.hand,
        currentY: noteTopY,
        width,
        height: noteHeight,
        isHit: note.isHit,
        opacity,
      });
    }

    return visible;
  }

  /**
   * Handle input when a piano key is pressed.
   * Finds the closest matching note near the judgment line.
   */
  handleNoteInput(noteNumber: number, timestamp: number): HitResult | null {
    const elapsedMs = timestamp - this.songStartTime;

    // Find the closest unhit note with the same note number within the GOOD window
    let bestNote: GameNote | null = null;
    let bestDiff = Infinity;

    for (const note of this.notes) {
      if (note.isHit) continue;
      if (note.note !== noteNumber) continue;

      const timeDiff = Math.abs(note.startMs - elapsedMs);
      if (timeDiff <= GameEngine.GOOD_WINDOW && timeDiff < bestDiff) {
        bestDiff = timeDiff;
        bestNote = note;
      }
    }

    if (!bestNote) return null;

    const timeDiff = bestNote.startMs - elapsedMs;
    const absDiff = Math.abs(timeDiff);

    let grade: HitGrade;
    if (absDiff <= GameEngine.PERFECT_WINDOW) {
      grade = 'perfect';
    } else if (absDiff <= GameEngine.GREAT_WINDOW) {
      grade = 'great';
    } else {
      grade = 'good';
    }

    bestNote.isHit = true;
    bestNote.hitTime = timestamp;
    bestNote.hitGrade = grade;

    return {
      grade,
      score: 0, // Score is calculated by ScoreCalculator
      combo: 0, // Combo is tracked by ScoreCalculator
      timeDiff,
    };
  }

  /**
   * Check for notes that have passed the judgment line + GOOD_WINDOW without being hit.
   * Returns array of missed note IDs.
   */
  checkMissedNotes(currentTime: number): string[] {
    const elapsedMs = currentTime - this.songStartTime;
    const missed: string[] = [];

    for (const note of this.notes) {
      if (note.isHit) continue;
      // Note has passed the judgment line by more than the GOOD window
      if (elapsedMs - note.startMs > GameEngine.GOOD_WINDOW) {
        note.isHit = true;
        note.hitTime = currentTime;
        note.hitGrade = 'miss';
        missed.push(note.id);
      }
    }

    return missed;
  }

  /**
   * Get the current progress (0 to 1) through the song.
   */
  getProgress(currentTime: number): number {
    if (this.totalDurationMs === 0) return 0;
    const elapsedMs = currentTime - this.songStartTime;
    return Math.min(1, Math.max(0, elapsedMs / this.totalDurationMs));
  }

  /**
   * Reset the engine state.
   */
  reset(): void {
    this.songStartTime = 0;
    for (const note of this.notes) {
      note.isHit = false;
      note.hitTime = null;
      note.hitGrade = null;
    }
  }
}

/**
 * Map a MIDI note number to an X position on the keyboard.
 */
export function noteToKeyPosition(note: number, keyboardWidth: number, startNote: number = 60): number {
  const whiteKeyWidth = keyboardWidth / 14;
  const noteOffset = note - startNote;
  const octaveOffset = Math.floor(noteOffset / 12);
  const noteInOctave = ((note % 12) + 12) % 12;

  // White key indices for each note in octave: C=0 D=1 E=2 F=3 G=4 A=5 B=6
  const whiteKeyIndex = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][noteInOctave];
  const black = isBlackKey(note);

  const x = (octaveOffset * 7 + whiteKeyIndex) * whiteKeyWidth;
  if (black) {
    return x + whiteKeyWidth * 0.65;
  }
  return x;
}

/**
 * Check if a MIDI note is a black key.
 */
export function isBlackKey(note: number): boolean {
  const noteInOctave = ((note % 12) + 12) % 12;
  return [false, true, false, true, false, false, true, false, true, false, true, false][noteInOctave];
}
