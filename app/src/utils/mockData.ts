import type { User, PracticeLog, Achievement, Course, Lesson, UserProgress } from '../types/user';
import type { Song, Track } from '../types/song';

export const mockUser: User = {
  id: 1,
  username: '钢琴学习者',
  email: 'user@example.com',
  phone: '13800138000',
  avatarUrl: '',
  level: 10,
  xp: 2000,
  isChild: false,
};

export const mockXpToNextLevel = 3000;

export const mockStreak = 7;

export const mockTodayPracticeMinutes = 15;
export const mockDailyGoalMinutes = 30;

type StepPitch = string | string[] | null;
type TrackStep = [StepPitch, number, number?];

const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
};

function noteNameToMidi(noteName: string): number {
  const match = noteName.match(/^([A-G][b#]?)(\d)$/);
  if (!match) {
    throw new Error(`Unsupported note name: ${noteName}`);
  }

  const [, pitchClass, octaveRaw] = match;
  const semitone = NOTE_TO_SEMITONE[pitchClass];

  if (semitone === undefined) {
    throw new Error(`Unsupported pitch class: ${pitchClass}`);
  }

  const octave = Number(octaveRaw);
  return (octave + 1) * 12 + semitone;
}

function buildTrack(hand: 'left' | 'right', bpm: number, steps: TrackStep[]): Track {
  const beatMs = 60000 / bpm;
  let currentTime = 0;

  return {
    hand,
    notes: steps.flatMap(([pitch, beats, velocity = 84]) => {
      const start = currentTime;
      const duration = Math.round(beatMs * beats);
      currentTime += duration;

      if (pitch === null) {
        return [];
      }

      const chord = Array.isArray(pitch) ? pitch : [pitch];

      return chord.map((noteName) => ({
        note: noteNameToMidi(noteName),
        start,
        duration,
        velocity,
      }));
    }),
  };
}

const SONG_TRACKS: Record<number, Track[]> = {
  1: [
    buildTrack('right', 120, [
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['G4', 1], ['G4', 1], ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 2],
      ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
      ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
    ]),
    buildTrack('left', 120, [
      ['C3', 2], ['G3', 2], ['C3', 2], ['G3', 2],
      ['F3', 2], ['C3', 2], ['G2', 2], ['D3', 2],
      ['C3', 2], ['G3', 2], ['G2', 2], ['D3', 2],
      ['C3', 2], ['G3', 2], ['F3', 2], ['C3', 2],
      ['C3', 2], ['G3', 2], ['C3', 2], ['G3', 2],
      ['F3', 2], ['C3', 2], ['G2', 2], ['C3', 2],
    ]),
  ],
  2: [
    buildTrack('right', 108, [
      ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1],
      ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
      ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1],
      ['E4', 1.5], ['D4', 0.5], ['D4', 2],
      ['E4', 1], ['E4', 1], ['F4', 1], ['G4', 1],
      ['G4', 1], ['F4', 1], ['E4', 1], ['D4', 1],
      ['C4', 1], ['C4', 1], ['D4', 1], ['E4', 1],
      ['D4', 1.5], ['C4', 0.5], ['C4', 2],
    ]),
    buildTrack('left', 108, [
      ['C3', 2], ['G2', 2], ['C3', 2], ['G2', 2],
      ['F3', 2], ['C3', 2], ['G2', 2], ['G2', 2],
      ['C3', 2], ['G2', 2], ['C3', 2], ['G2', 2],
      ['F3', 2], ['C3', 2], ['G2', 2], ['C3', 2],
    ]),
  ],
  3: [
    buildTrack('right', 100, [
      ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
      ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
      ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
      ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
    ]),
  ],
  4: [
    buildTrack('right', 72, [
      ['D4', 1], ['F#4', 1], ['A4', 1], ['F#4', 1],
      ['B4', 1], ['A4', 1], ['F#4', 1], ['D4', 1],
      ['G4', 1], ['F#4', 1], ['E4', 1], ['D4', 1],
      ['G4', 1], ['A4', 1], ['B4', 1], ['A4', 1],
      ['D5', 1], ['A4', 1], ['F#4', 1], ['A4', 1],
      ['B4', 1], ['F#4', 1], ['D4', 1], ['F#4', 1],
      ['G4', 1], ['D4', 1], ['E4', 1], ['F#4', 1],
      ['G4', 1], ['A4', 1], ['D5', 2],
    ]),
    buildTrack('left', 72, [
      ['D3', 2], ['A2', 2], ['B2', 2], ['F#2', 2],
      ['G2', 2], ['D3', 2], ['G2', 2], ['A2', 2],
      ['D3', 2], ['A2', 2], ['B2', 2], ['F#2', 2],
      ['G2', 2], ['D3', 2], ['A2', 2], ['D3', 2],
    ]),
  ],
  5: [
    buildTrack('right', 66, [
      ['F4', 1], ['A4', 1], ['C5', 1], ['A4', 1],
      ['Bb4', 1], ['D5', 1], ['F5', 1], ['D5', 1],
      ['A4', 1], ['C5', 1], ['D5', 1], ['C5', 1],
      ['G4', 1], ['A4', 1], ['Bb4', 1], ['A4', 1],
      ['F4', 1], ['A4', 1], ['C5', 1], ['F5', 1],
      ['Eb5', 1], ['D5', 1], ['C5', 1], ['Bb4', 2],
    ]),
  ],
  6: [
    buildTrack('right', 120, [
      ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['B4', 0.5], ['D5', 0.5], ['C5', 0.5],
      ['A4', 1], [null, 0.5], ['C4', 0.5], ['E4', 0.5], ['A4', 0.5], ['B4', 1],
      [null, 0.5], ['E4', 0.5], ['G#4', 0.5], ['B4', 0.5], ['C5', 1],
      [null, 0.5], ['E4', 0.5], ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['B4', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 1.5],
    ]),
    buildTrack('left', 120, [
      ['A3', 2], ['E3', 2], ['A3', 2], ['E3', 2],
      ['G#3', 2], ['E3', 2], ['A3', 2], ['E3', 2],
    ]),
  ],
  7: [
    buildTrack('right', 80, [
      ['G4', 1], ['A4', 1], ['B4', 1], ['D5', 1],
      ['B4', 1], ['D5', 1], ['E5', 2],
      ['D5', 1], ['B4', 1], ['A4', 1], ['G4', 1],
      ['A4', 1], ['B4', 1], ['A4', 2],
      ['G4', 1], ['A4', 1], ['B4', 1], ['D5', 1],
      ['B4', 1], ['D5', 1], ['E5', 2],
      ['G5', 1], ['E5', 1], ['D5', 1], ['B4', 1],
      ['A4', 1], ['G4', 1], ['A4', 2],
    ]),
    buildTrack('left', 80, [
      ['E3', 2], ['B3', 2], ['C3', 2], ['G3', 2],
      ['G2', 2], ['D3', 2], ['D3', 2], ['A3', 2],
      ['E3', 2], ['B3', 2], ['C3', 2], ['G3', 2],
      ['G2', 2], ['D3', 2], ['E3', 2], ['B3', 2],
    ]),
  ],
  8: [
    buildTrack('right', 120, [
      ['C4', 1], ['D4', 1], ['E4', 1], ['C4', 1],
      ['C4', 1], ['D4', 1], ['E4', 1], ['C4', 1],
      ['E4', 1], ['F4', 1], ['G4', 2],
      ['E4', 1], ['F4', 1], ['G4', 2],
      ['G4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 1], ['C4', 1],
      ['G4', 0.5], ['A4', 0.5], ['G4', 0.5], ['F4', 0.5], ['E4', 1], ['C4', 1],
      ['C4', 1], ['G4', 1], ['C4', 2],
      ['C4', 1], ['G4', 1], ['C4', 2],
    ]),
  ],
  9: [
    buildTrack('right', 56, [
      ['G#4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['G#5', 0.5],
      ['G#4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['G#5', 0.5],
      ['A4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['A5', 0.5],
      ['G#4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['G#5', 0.5],
      ['F#4', 0.5], ['B4', 0.5], ['D#5', 0.5], ['F#5', 0.5],
      ['G#4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['G#5', 0.5],
      ['A4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['A5', 0.5],
      ['G#4', 0.5], ['C#5', 0.5], ['E5', 0.5], ['G#5', 0.5],
    ]),
    buildTrack('left', 56, [
      ['C#3', 2], ['G#3', 2], ['A2', 2], ['E3', 2],
      ['F#2', 2], ['C#3', 2], ['A2', 2], ['G#2', 2],
    ]),
  ],
  10: [
    buildTrack('right', 96, [
      ['E4', 1], ['G4', 1], ['A4', 1], ['B4', 1],
      ['A4', 1], ['G4', 1], ['E4', 2],
      ['D4', 1], ['E4', 1], ['G4', 1], ['A4', 1],
      ['G4', 1], ['E4', 1], ['D4', 2],
      ['E4', 1], ['G4', 1], ['A4', 1], ['B4', 1],
      ['D5', 1], ['B4', 1], ['A4', 2],
      ['G4', 1], ['E4', 1], ['D4', 1], ['E4', 1],
      ['G4', 1], ['E4', 1], ['D4', 2],
    ]),
    buildTrack('left', 96, [
      ['C3', 2], ['G3', 2], ['A2', 2], ['E3', 2],
      ['F2', 2], ['C3', 2], ['G2', 2], ['G2', 2],
      ['C3', 2], ['G3', 2], ['A2', 2], ['E3', 2],
      ['F2', 2], ['C3', 2], ['G2', 2], ['C3', 2],
    ]),
  ],
  11: [
    buildTrack('right', 88, [
      ['E4', 1], ['G4', 1], ['A4', 1], ['B4', 1],
      ['A4', 1], ['E4', 1], ['D4', 1], ['E4', 1],
      ['G4', 1], ['A4', 1], ['B4', 1], ['D5', 1],
      ['B4', 1], ['A4', 1], ['G4', 2],
      ['E4', 1], ['G4', 1], ['A4', 1], ['B4', 1],
      ['A4', 1], ['E4', 1], ['D4', 1], ['E4', 1],
      ['A4', 1], ['B4', 1], ['D5', 1], ['E5', 1],
      ['D5', 1], ['B4', 1], ['A4', 2],
    ]),
  ],
  12: [
    buildTrack('right', 110, [
      ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['B4', 0.5], ['D5', 0.5], ['C5', 0.5],
      ['A4', 1], [null, 0.5], ['C4', 0.5], ['E4', 0.5], ['A4', 0.5], ['B4', 1],
      [null, 0.5], ['E4', 0.5], ['G#4', 0.5], ['B4', 0.5], ['C5', 1],
      [null, 0.5], ['E4', 0.5], ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5], ['D#5', 0.5],
      ['E5', 0.5], ['B4', 0.5], ['D5', 0.5], ['C5', 0.5], ['A4', 1.5],
    ]),
    buildTrack('left', 110, [
      ['A3', 2], ['E3', 2], ['A3', 2], ['E3', 2],
      ['G#3', 2], ['E3', 2], ['A3', 2], ['E3', 2],
    ]),
  ],
};

export const mockSongs: Song[] = [
  {
    id: 1,
    title: '小星星',
    artist: '莫扎特',
    difficulty: 1,
    bpm: 120,
    duration: 45,
    timeSignature: '4/4',
    keySignature: 'C',
    tags: ['入门', '儿歌'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[1] ?? [],
  },
  {
    id: 2,
    title: '欢乐颂',
    artist: '贝多芬',
    difficulty: 2,
    bpm: 108,
    duration: 80,
    timeSignature: '4/4',
    keySignature: 'C',
    tags: ['古典', '入门'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[2] ?? [],
  },
  {
    id: 3,
    title: '生日快乐',
    artist: '传统歌曲',
    difficulty: 1,
    bpm: 100,
    duration: 30,
    timeSignature: '3/4',
    keySignature: 'C',
    tags: ['儿歌', '入门'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[3] ?? [],
  },
  {
    id: 4,
    title: '卡农',
    artist: '帕赫贝尔',
    difficulty: 3,
    bpm: 72,
    duration: 195,
    timeSignature: '4/4',
    keySignature: 'D',
    tags: ['古典'],
    coverUrl: '',
    isFree: false,
    tracks: SONG_TRACKS[4] ?? [],
  },
  {
    id: 5,
    title: '梦中的婚礼',
    artist: '理查德·克莱德曼',
    difficulty: 4,
    bpm: 66,
    duration: 270,
    timeSignature: '4/4',
    keySignature: 'Bb',
    tags: ['古典', '浪漫'],
    coverUrl: '',
    isFree: false,
    tracks: SONG_TRACKS[5] ?? [],
  },
  {
    id: 6,
    title: '致爱丽丝',
    artist: '贝多芬',
    difficulty: 3,
    bpm: 120,
    duration: 165,
    timeSignature: '3/8',
    keySignature: 'Am',
    tags: ['古典'],
    coverUrl: '',
    isFree: false,
    tracks: SONG_TRACKS[6] ?? [],
  },
  {
    id: 7,
    title: '天空之城',
    artist: '久石让',
    difficulty: 3,
    bpm: 80,
    duration: 180,
    timeSignature: '4/4',
    keySignature: 'Em',
    tags: ['动漫', '流行'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[7] ?? [],
  },
  {
    id: 8,
    title: '两只老虎',
    artist: '传统歌曲',
    difficulty: 1,
    bpm: 120,
    duration: 25,
    timeSignature: '4/4',
    keySignature: 'C',
    tags: ['儿歌', '入门'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[8] ?? [],
  },
  {
    id: 9,
    title: '月光奏鸣曲',
    artist: '贝多芬',
    difficulty: 5,
    bpm: 56,
    duration: 360,
    timeSignature: '4/4',
    keySignature: 'C#m',
    tags: ['古典'],
    coverUrl: '',
    isFree: false,
    tracks: SONG_TRACKS[9] ?? [],
  },
  {
    id: 10,
    title: '菊次郎的夏天',
    artist: '久石让',
    difficulty: 2,
    bpm: 96,
    duration: 150,
    timeSignature: '4/4',
    keySignature: 'C',
    tags: ['动漫', '流行'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[10] ?? [],
  },
  {
    id: 11,
    title: '千与千寻',
    artist: '久石让',
    difficulty: 3,
    bpm: 88,
    duration: 200,
    timeSignature: '4/4',
    keySignature: 'C',
    tags: ['动漫'],
    coverUrl: '',
    isFree: false,
    tracks: SONG_TRACKS[11] ?? [],
  },
  {
    id: 12,
    title: '献给爱丽丝',
    artist: '贝多芬',
    difficulty: 2,
    bpm: 110,
    duration: 60,
    timeSignature: '4/4',
    keySignature: 'C',
    tags: ['古典', '入门'],
    coverUrl: '',
    isFree: true,
    tracks: SONG_TRACKS[12] ?? [],
  },
];

export const mockPracticeLogs: PracticeLog[] = [
  {
    id: 1,
    songId: 1,
    mode: 'standard',
    speed: 1.0,
    score: 9200,
    accuracy: 95.5,
    maxCombo: 48,
    perfectCount: 42,
    greatCount: 12,
    goodCount: 5,
    missCount: 1,
    duration: 45,
    playedAt: '2026-04-18T10:30:00Z',
  },
  {
    id: 2,
    songId: 2,
    mode: 'standard',
    speed: 1.0,
    score: 8750,
    accuracy: 92.0,
    maxCombo: 45,
    perfectCount: 38,
    greatCount: 12,
    goodCount: 5,
    missCount: 3,
    duration: 80,
    playedAt: '2026-04-18T09:15:00Z',
  },
  {
    id: 3,
    songId: 3,
    mode: 'standard',
    speed: 1.0,
    score: 9800,
    accuracy: 98.0,
    maxCombo: 30,
    perfectCount: 28,
    greatCount: 2,
    goodCount: 0,
    missCount: 0,
    duration: 30,
    playedAt: '2026-04-17T20:00:00Z',
  },
  {
    id: 4,
    songId: 7,
    mode: 'wait',
    speed: 0.8,
    score: 7500,
    accuracy: 85.0,
    maxCombo: 32,
    perfectCount: 30,
    greatCount: 15,
    goodCount: 8,
    missCount: 5,
    duration: 180,
    playedAt: '2026-04-17T15:30:00Z',
  },
  {
    id: 5,
    songId: 10,
    mode: 'standard',
    speed: 1.0,
    score: 8200,
    accuracy: 88.5,
    maxCombo: 38,
    perfectCount: 35,
    greatCount: 10,
    goodCount: 6,
    missCount: 4,
    duration: 150,
    playedAt: '2026-04-16T19:00:00Z',
  },
  {
    id: 6,
    songId: 8,
    mode: 'standard',
    speed: 1.0,
    score: 10000,
    accuracy: 100,
    maxCombo: 20,
    perfectCount: 20,
    greatCount: 0,
    goodCount: 0,
    missCount: 0,
    duration: 25,
    playedAt: '2026-04-16T14:00:00Z',
  },
  {
    id: 7,
    songId: 12,
    mode: 'standard',
    speed: 1.0,
    score: 7800,
    accuracy: 82.0,
    maxCombo: 25,
    perfectCount: 28,
    greatCount: 14,
    goodCount: 8,
    missCount: 6,
    duration: 60,
    playedAt: '2026-04-15T21:00:00Z',
  },
  {
    id: 8,
    songId: 1,
    mode: 'wait',
    speed: 0.5,
    score: 6500,
    accuracy: 78.0,
    maxCombo: 18,
    perfectCount: 22,
    greatCount: 15,
    goodCount: 10,
    missCount: 8,
    duration: 45,
    playedAt: '2026-04-14T16:00:00Z',
  },
];

export const mockLessons: Lesson[] = [
  { id: 1, courseId: 1, title: '认识键盘', description: '了解钢琴键盘的基本构成，认识白键与黑键', orderIndex: 1, type: 'teach', songId: 1 },
  { id: 2, courseId: 1, title: '坐姿与手型', description: '正确的弹琴坐姿和手型指导', orderIndex: 2, type: 'teach' },
  { id: 3, courseId: 1, title: '找到中央C', description: '学会在键盘上找到中央C的位置', orderIndex: 3, type: 'practice', songId: 1 },
  { id: 4, courseId: 1, title: '右手 do re mi', description: '学习用右手弹奏 C-D-E 三个音', orderIndex: 4, type: 'practice', songId: 1 },
  { id: 5, courseId: 1, title: '右手五音', description: '扩展到五个音 C-D-E-F-G', orderIndex: 5, type: 'practice', songId: 1 },
  { id: 6, courseId: 1, title: '节奏入门', description: '认识全音符、二分音符和四分音符', orderIndex: 6, type: 'teach' },
  { id: 7, courseId: 1, title: '简单旋律', description: '弹奏你的第一首简单旋律', orderIndex: 7, type: 'practice', songId: 8 },
  { id: 8, courseId: 1, title: '左手初体验', description: '用左手弹奏简单的音符', orderIndex: 8, type: 'practice', songId: 1 },
  { id: 9, courseId: 1, title: '双手协作', description: '初步尝试双手同时弹奏', orderIndex: 9, type: 'practice', songId: 3 },
  { id: 10, courseId: 1, title: '结业挑战', description: '完成 Level 1 的综合挑战', orderIndex: 10, type: 'challenge', songId: 1 },
];

export const mockCourses: Course[] = [
  {
    id: 1,
    title: '钢琴启蒙',
    description: '从零开始学习钢琴，掌握基本知识和简单弹奏',
    level: 1,
    orderIndex: 1,
    isFree: true,
    lessons: mockLessons,
  },
  {
    id: 2,
    title: '基础演奏',
    description: '学习基础的演奏技巧和乐理知识',
    level: 2,
    orderIndex: 2,
    isFree: false,
    lessons: [],
  },
  {
    id: 3,
    title: '进阶技巧',
    description: '提升演奏技巧，挑战更复杂的曲目',
    level: 3,
    orderIndex: 3,
    isFree: false,
    lessons: [],
  },
];

export const mockUserProgress: UserProgress[] = [
  { lessonId: 1, status: 'completed', bestScore: 9500, stars: 3, attempts: 2 },
  { lessonId: 2, status: 'completed', bestScore: 8800, stars: 2, attempts: 1 },
  { lessonId: 3, status: 'completed', bestScore: 9200, stars: 3, attempts: 3 },
  { lessonId: 4, status: 'unlocked', stars: 0, attempts: 0 },
  { lessonId: 5, status: 'locked', stars: 0, attempts: 0 },
  { lessonId: 6, status: 'locked', stars: 0, attempts: 0 },
  { lessonId: 7, status: 'locked', stars: 0, attempts: 0 },
  { lessonId: 8, status: 'locked', stars: 0, attempts: 0 },
  { lessonId: 9, status: 'locked', stars: 0, attempts: 0 },
  { lessonId: 10, status: 'locked', stars: 0, attempts: 0 },
];

export const mockAchievements: Achievement[] = [
  { id: 'first_key', name: '初次触键', description: '完成第一次 MIDI 连接', icon: '🎹', unlockedAt: '2026-01-15T10:00:00Z' },
  { id: 'first_song', name: '第一首歌', description: '完成第一首曲目', icon: '🎵', unlockedAt: '2026-01-16T14:30:00Z' },
  { id: 'perfectionist', name: '完美主义', description: '单曲全部 Perfect', icon: '💎', unlockedAt: '2026-02-20T18:00:00Z' },
  { id: 'persistent', name: '坚持不懈', description: '连续练习 7 天', icon: '🔥', unlockedAt: '2026-03-01T09:00:00Z' },
  { id: 'hundred_songs', name: '百曲斩', description: '完成 100 首曲目', icon: '👑' },
  { id: 'speed_demon', name: '速度恶魔', description: '以 2x 速度完成一首曲目', icon: '⚡' },
];

export const mockWeeklyPractice = [30, 45, 20, 35, 15, 0, 10]; // Mon-Sun in minutes

export function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 14) return '中午好';
  if (hour >= 14 && hour < 18) return '下午好';
  return '晚上好';
}

export function getDifficultyStars(difficulty: number): string {
  return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
}

export function getSongById(id: number): Song | undefined {
  return mockSongs.find((s) => s.id === id);
}
