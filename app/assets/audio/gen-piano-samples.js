#!/usr/bin/env node
// Generates 3 piano-like tone WAV files covering ~4 octaves via pitch
// shifting in the app's AudioEngine. Output:
//   piano-a3.wav (MIDI 57, 220 Hz)
//   piano-a4.wav (MIDI 69, 440 Hz)
//   piano-a5.wav (MIDI 81, 880 Hz)
//
// Each sample is a 1.5s mono 44.1 kHz 16-bit WAV with:
//   - additive synthesis: fundamental + 2 harmonics (-6dB, -12dB)
//   - light inharmonic detune so it doesn't sound too pure
//   - short attack + exponential decay envelope (piano-ish, not real piano)
//
// Not a real piano. Good enough as scaffolding; swap for real samples
// later by just replacing these WAVs with same names.
const fs = require('fs');
const path = require('path');

const SR = 44100;
const DUR = 1.5; // seconds
const BIT = 16;

function writeWav(outPath, freq) {
  const n = Math.floor(SR * DUR);
  const data = Buffer.alloc(n * 2);

  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // ADSR-ish: fast attack, exp decay
    const attack = Math.min(1, t / 0.005);
    const decay = Math.exp(-t * 2.5);
    const env = attack * decay;

    // Fundamental + harmonics. Slight detune on higher harmonics so it
    // doesn't sound synthy-square.
    const s =
      Math.sin(2 * Math.PI * freq * t) * 0.6 +
      Math.sin(2 * Math.PI * freq * 2.001 * t) * 0.25 +
      Math.sin(2 * Math.PI * freq * 3.003 * t) * 0.1;

    // Soft-clip to avoid peak overshoot near t=0.
    const x = Math.tanh(s * env * 1.2);
    const v = Math.round(x * 32767 * 0.8);
    data.writeInt16LE(v, i * 2);
  }

  // WAV header (PCM, mono)
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(BIT, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);

  fs.writeFileSync(outPath, Buffer.concat([header, data]));
}

const samples = [
  { name: 'piano-a3.wav', freq: 220.0 },
  { name: 'piano-a4.wav', freq: 440.0 },
  { name: 'piano-a5.wav', freq: 880.0 },
];

for (const s of samples) {
  const out = path.join(__dirname, s.name);
  writeWav(out, s.freq);
  console.log('Wrote', out, `${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
}
