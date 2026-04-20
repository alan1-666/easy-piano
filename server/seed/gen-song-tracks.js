// Generates UPDATE SQL to populate songs.midi_data for seeded songs.
// Run: node /tmp/gen-song-tracks.js > /tmp/seed-song-tracks.sql
//
// The melodies here are:
//   - 小星星 (Twinkle Twinkle) — Mozart, public domain
//   - 欢乐颂 (Ode to Joy)     — Beethoven, public domain
//   - 生日快乐                 — Public domain since 2016 (Warner settlement)
//   - 两只老虎                 — Traditional, public domain
//   - 卡农                     — Pachelbel, public domain
//   - 致爱丽丝                 — Beethoven, public domain
//
// All six songs are legally clean to ship.

const NOTE_TO_SEMITONE = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

function noteNameToMidi(name) {
  const m = name.match(/^([A-G][b#]?)(\d)$/);
  if (!m) throw new Error(`bad note: ${name}`);
  const semi = NOTE_TO_SEMITONE[m[1]];
  if (semi === undefined) throw new Error(`bad pitch: ${m[1]}`);
  return (Number(m[2]) + 1) * 12 + semi;
}

function buildTrack(hand, bpm, steps) {
  const beatMs = 60000 / bpm;
  let t = 0;
  const notes = [];
  for (const step of steps) {
    const [pitch, beats, velocity = 84] = step;
    const start = t;
    const duration = Math.round(beatMs * beats);
    t += duration;
    if (pitch === null) continue;
    const chord = Array.isArray(pitch) ? pitch : [pitch];
    for (const pn of chord) {
      notes.push({ note: noteNameToMidi(pn), start, duration, velocity });
    }
  }
  return { hand, notes };
}

const SONGS = [
  {
    title: '小星星',
    artist: '莫扎特',
    tracks: [
      buildTrack('right', 120, [
        ['C4', 1], ['C4', 1], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['G4', 2],
        ['F4', 1], ['F4', 1], ['E4', 1], ['E4', 1], ['D4', 1], ['D4', 1], ['C4', 2],
      ]),
    ],
  },
  {
    title: '两只老虎',
    artist: '传统',
    tracks: [
      buildTrack('right', 100, [
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
  },
  {
    title: '生日快乐',
    artist: '传统',
    tracks: [
      buildTrack('right', 100, [
        ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
        ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
        ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
        ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
      ]),
    ],
  },
  {
    title: '欢乐颂',
    artist: '贝多芬',
    tracks: [
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
  },
  {
    title: '卡农',
    artist: '帕赫贝尔',
    tracks: [
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
  },
  {
    title: '致爱丽丝',
    artist: '贝多芬',
    tracks: [
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
  },
];

// Emit idempotent UPDATEs keyed on title+artist (we never have dupes on
// that pair). Using dollar-quoted string literal avoids quote escaping
// pain in JSON.
const lines = [
  '-- Regenerated by /tmp/gen-song-tracks.js',
  '-- Populates songs.midi_data with structured tracks JSON.',
  '',
];
for (const s of SONGS) {
  const json = JSON.stringify(s.tracks);
  lines.push(
    `UPDATE songs SET midi_data = $$${json}$$ WHERE title = '${s.title}' AND artist = '${s.artist}';`,
  );
}
lines.push('');
lines.push('SELECT id, title, artist, LENGTH(midi_data) AS midi_len FROM songs ORDER BY id;');

console.log(lines.join('\n'));
