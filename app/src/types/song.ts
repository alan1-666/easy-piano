export interface Song {
  id: number;
  title: string;
  artist: string;
  difficulty: number;
  bpm: number;
  duration: number;
  timeSignature: string;
  keySignature: string;
  tags: string[];
  coverUrl: string;
  isFree: boolean;
  tracks: Track[];
}

export interface Track {
  hand: 'left' | 'right';
  notes: NoteData[];
}

export interface NoteData {
  note: number;
  start: number;
  duration: number;
  velocity: number;
}
