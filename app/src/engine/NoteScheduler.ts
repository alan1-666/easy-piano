import type { VisibleNote } from '../types/game';
import type { NoteData } from '../types/song';
import type { MIDINoteEvent } from '../types/midi';

/**
 * NoteScheduler manages the lifecycle of notes in the game:
 * advancing positions, checking misses, finding matches, and tracking visibility.
 *
 * Note: The primary game logic is now in GameEngine.ts.
 * This class provides utility methods for note management.
 */
export class NoteScheduler {
  private notes: NoteData[] = [];

  /**
   * Load notes for the current song.
   */
  loadNotes(notes: NoteData[]): void {
    this.notes = [...notes].sort((a, b) => a.start - b.start);
  }

  /**
   * Get the loaded notes.
   */
  getNotes(): NoteData[] {
    return this.notes;
  }

  /**
   * Get the total number of notes.
   */
  getNoteCount(): number {
    return this.notes.length;
  }
}
