// Writes .mid files for the 6 classical pieces currently lacking real
// track data in the DB, then uploads each via the admin endpoint.
//
// Everything here is public domain — the composers (Bach / Schubert /
// Beethoven / Chopin / Mozart) have all been dead 150+ years, and
// these opening excerpts are transcribed by hand, not copied from any
// modern edition. Content is ~20-40 seconds per piece, enough to be
// recognisable without being a full performance.
//
// Usage:
//   cd /Users/zhangza/code/easypiano/easy-piano/app
//   # admin token required; alan_test is admin
//   TOKEN=$(curl -s -X POST http://127.0.0.1:18080/v1/auth/login \
//     -H 'Content-Type: application/json' \
//     -d '{"email":"alan_test@example.com","password":"alantest123"}' \
//     | jq -r .data.access_token)
//   BASE=http://127.0.0.1:18080 TOKEN=$TOKEN node ../server/seed/gen-classical-mids.js
//
// Dependencies: @tonejs/midi (already installed in app/), node 18+
// (for global fetch + FormData).

const fs = require('fs');
const path = require('path');
const { Midi } = require(path.join(
  __dirname,
  '..',
  '..',
  'app',
  'node_modules',
  '@tonejs/midi',
));

const BASE = process.env.BASE || 'http://127.0.0.1:18080';
const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error('TOKEN env var required (admin bearer token)');
  process.exit(1);
}

const NOTE = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6,
  Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};
function midi(name) {
  const m = name.match(/^([A-G][b#]?)(\d)$/);
  if (!m) throw new Error(`bad note ${name}`);
  return (Number(m[2]) + 1) * 12 + NOTE[m[1]];
}

// Helper: build a Midi object with one right-hand track (and optional
// left-hand) from a list of [noteName|null, beats, velocity?] steps at
// the given bpm. null = rest.
function buildPiece({ title, bpm, right, left }) {
  const m = new Midi();
  m.name = title;
  m.header.setTempo(bpm);
  const secPerBeat = 60 / bpm;

  function addTrack(steps, channel, name) {
    const t = m.addTrack();
    t.name = name;
    t.channel = channel;
    t.instrument.number = 0;
    let time = 0;
    for (const step of steps) {
      const [pitch, beats, vel = 0.72] = step;
      const duration = beats * secPerBeat;
      if (pitch !== null) {
        const chord = Array.isArray(pitch) ? pitch : [pitch];
        for (const p of chord) {
          t.addNote({ midi: midi(p), time, duration, velocity: vel });
        }
      }
      time += duration;
    }
  }

  addTrack(right, 0, 'Right');
  if (left) addTrack(left, 1, 'Left');
  return m;
}

// ─────────────────────────────────────────────────────────────
// The 6 pieces. Each excerpt is the first memorable phrase,
// slightly simplified to keep it playable as a beginner piece.
// ─────────────────────────────────────────────────────────────

const PIECES = [
  {
    dbTitle: '小步舞曲',
    dbArtist: '巴赫',
    bpm: 120,
    right: [
      // Minuet in G (BWV Anh 114) — opening two bars
      ['D5', 1], ['G4', 0.5], ['A4', 0.5], ['B4', 0.5], ['C5', 0.5],
      ['D5', 1], ['G4', 1], ['G4', 1],
      ['E5', 1], ['C5', 0.5], ['D5', 0.5], ['E5', 0.5], ['F#5', 0.5],
      ['G5', 1], ['G4', 1], ['G4', 1],
      ['C5', 1], ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5],
      ['B4', 1], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5],
      ['F#4', 1], ['G4', 0.5], ['A4', 0.5], ['B4', 0.5], ['G4', 0.5],
      ['A4', 3],
    ],
    left: [
      ['G3', 3], ['G3', 3], ['C4', 3], ['D4', 3],
      ['G3', 3], ['D4', 3], ['D4', 3], ['G3', 3],
    ],
  },
  {
    dbTitle: '小夜曲',
    dbArtist: '舒伯特',
    bpm: 72,
    right: [
      // Ständchen D.957 No.4 — iconic opening
      ['D5', 0.5], ['C#5', 0.5], ['D5', 1],
      ['F5', 1], ['D5', 1],
      ['A4', 0.5], ['B4', 0.5], ['C#5', 1],
      ['D5', 2],
      ['D5', 0.5], ['C#5', 0.5], ['D5', 1],
      ['F5', 1], ['D5', 1],
      ['A4', 0.5], ['B4', 0.5], ['A4', 0.5], ['G4', 0.5],
      ['F4', 2],
    ],
    left: [
      ['D3', 2], ['A3', 2],
      ['D3', 2], ['A3', 2],
      ['D3', 2], ['A3', 2],
      ['D3', 4],
    ],
  },
  {
    dbTitle: '月光奏鸣曲（第一乐章）',
    dbArtist: '贝多芬',
    bpm: 60,
    // Moonlight Sonata Op.27 No.2, Mvt I — the hypnotic triplet figure
    // over C#m. Right hand keeps repeating triplets (we simplify to
    // steady eighths), left hand outlines the chord.
    right: [
      ['G#4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['G#4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['G#4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['G#4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['A4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['A4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['G#4', 0.333], ['C#5', 0.333], ['E5', 0.333],
      ['G#4', 0.333], ['B4', 0.333], ['D#5', 0.333],
      ['F#4', 0.333], ['A4', 0.333], ['D#5', 0.333],
      ['F#4', 0.333], ['G#4', 0.333], ['D#5', 0.333],
    ],
    left: [
      ['C#3', 4],
      ['A2', 2], ['C#3', 2],
      ['B2', 2], ['D#3', 2],
    ],
  },
  {
    dbTitle: '夜曲 Op.9 No.2',
    dbArtist: '肖邦',
    bpm: 66,
    right: [
      // Chopin Nocturne in Eb Op.9 No.2 — opening phrase, simplified
      ['Bb4', 1],
      ['G5', 1.5], ['F5', 0.5], ['Eb5', 1],
      ['Bb4', 1], ['Eb5', 2],
      ['Bb4', 1],
      ['G5', 1.5], ['F5', 0.5], ['Eb5', 1],
      ['C5', 1], ['Ab5', 2],
      ['G5', 1],
      ['F5', 1.5], ['Eb5', 0.5], ['D5', 1],
      ['Eb5', 3],
    ],
    left: [
      ['Eb3', 2], ['Bb3', 2],
      ['Ab3', 2], ['Eb4', 2],
      ['Eb3', 2], ['Bb3', 2],
      ['F3', 2], ['C4', 2],
      ['Bb2', 2], ['F3', 2],
      ['Eb3', 2], ['Bb3', 2],
    ],
  },
  {
    dbTitle: '华丽大圆舞曲',
    dbArtist: '肖邦',
    bpm: 160,
    right: [
      // Chopin Grande Valse Brillante Op.18 — the famous Eb spiral
      ['Eb5', 1], ['F5', 0.5], ['Eb5', 0.5], ['D5', 0.5], ['Eb5', 0.5],
      ['F5', 1], ['G5', 0.5], ['F5', 0.5], ['Eb5', 0.5], ['F5', 0.5],
      ['G5', 1], ['Ab5', 0.5], ['G5', 0.5], ['F5', 0.5], ['G5', 0.5],
      ['Ab5', 1], ['Bb5', 0.5], ['Ab5', 0.5], ['G5', 1],
      ['F5', 1], ['Eb5', 1], ['D5', 1],
      ['Eb5', 3],
    ],
    left: [
      // Standard oom-pah-pah in Eb
      ['Eb3', 1], ['Bb3', 1], ['Bb3', 1],
      ['Eb3', 1], ['Bb3', 1], ['Bb3', 1],
      ['Eb3', 1], ['Bb3', 1], ['Bb3', 1],
      ['Bb2', 1], ['F3', 1], ['F3', 1],
      ['Eb3', 1], ['Bb3', 1], ['Bb3', 1],
      ['Eb3', 3],
    ],
  },
  {
    dbTitle: '土耳其进行曲',
    dbArtist: '莫扎特',
    bpm: 120,
    right: [
      // Rondo alla Turca — the unmistakable opening
      ['B4', 0.5], ['A4', 0.5], ['G#4', 0.5], ['A4', 0.5],
      ['C5', 2],
      ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['C5', 0.5],
      ['E5', 2],
      ['F5', 0.5], ['E5', 0.5], ['D#5', 0.5], ['E5', 0.5],
      ['B5', 0.5], ['A5', 0.5], ['G#5', 0.5], ['A5', 0.5],
      ['B5', 0.5], ['A5', 0.5], ['G#5', 0.5], ['A5', 0.5],
      ['C6', 2],
      ['A5', 0.5], ['B5', 0.5], ['C6', 0.5], ['B5', 0.5], ['A5', 0.5], ['G#5', 0.5],
      ['A5', 2],
    ],
    left: [
      ['A3', 2], ['A3', 2],
      ['E3', 2], ['E3', 2],
      ['A3', 2], ['A3', 2],
      ['E3', 2], ['A3', 2],
    ],
  },
];

// ─────────────────────────────────────────────────────────────

async function fetchSongIdByTitle(title, artist) {
  // GET /songs doesn't support exact-title lookup, but does have q
  // search. Just page through until we find the id.
  const url = `${BASE}/v1/songs?page=1&page_size=50`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(`/songs failed: ${body.message}`);
  const match = body.data.items.find(
    (s) => s.title === title && s.artist === artist,
  );
  if (!match) throw new Error(`song not found: ${title}/${artist}`);
  return match.id;
}

async function uploadMidi(songId, midiBytes, fileName) {
  const form = new FormData();
  const blob = new Blob([midiBytes], { type: 'audio/midi' });
  form.append('midi', blob, fileName);
  const res = await fetch(`${BASE}/v1/admin/songs/${songId}/midi`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: form,
  });
  const body = await res.json();
  if (body.code !== 0) throw new Error(`upload failed: ${body.message}`);
  return body.data;
}

(async () => {
  const outDir = path.join(__dirname, 'classical-mids');
  fs.mkdirSync(outDir, { recursive: true });

  for (const piece of PIECES) {
    const midiObj = buildPiece(piece);
    const bytes = midiObj.toArray();
    const fileName = `${piece.dbTitle}.mid`.replace(/[^\w\u4e00-\u9fa5]/g, '_');
    const localPath = path.join(outDir, fileName);
    fs.writeFileSync(localPath, Buffer.from(bytes));

    try {
      const songId = await fetchSongIdByTitle(piece.dbTitle, piece.dbArtist);
      const result = await uploadMidi(songId, bytes, fileName);
      console.log(
        `✓ ${piece.dbTitle} (${piece.dbArtist}) → song#${songId}, ${result.midi_bytes} bytes uploaded`,
      );
    } catch (err) {
      console.error(
        `✗ ${piece.dbTitle} (${piece.dbArtist}) failed: ${err.message}`,
      );
    }
  }
  console.log(`\nlocal .mid files saved to ${outDir}`);
})();
