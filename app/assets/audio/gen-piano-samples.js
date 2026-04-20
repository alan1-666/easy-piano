#!/usr/bin/env node
// Generates piano-like sample WAVs used by src/services/audio.ts. Three
// samples cover ~4 octaves via in-app pitch shifting:
//
//   piano-a3.wav (MIDI 57, 220 Hz)
//   piano-a4.wav (MIDI 69, 440 Hz)
//   piano-a5.wav (MIDI 81, 880 Hz)
//
// The synthesis models a grand piano with four ingredients:
//   1. Hammer attack   — short filtered noise burst (felt striking string)
//   2. Inharmonic partials — partial n sits at n·f0·sqrt(1+B·n²), where
//      the stiffness B grows with pitch. This is THE perceptual cue
//      that makes sines-plus-harmonics sound like a cheap synth and
//      real partials sound like a piano.
//   3. Per-partial decay — higher partials fade faster (initial "ping"
//      settles into a warmer body).
//   4. Two-stage amplitude envelope — fast initial decay then a much
//      slower sustain decay (exponential).
//
// All output is 44.1 kHz mono 16-bit PCM WAV. Swapping in real
// Salamander-style samples later = drop in .wav of same name.

const fs = require('fs');
const path = require('path');

const SR = 44100;
const DUR = 1.8; // seconds — enough headroom before the game re-triggers

function softClip(x) {
  return Math.tanh(x);
}

// Simple 2-pole one-pole-looks-dumb-but-fine lowpass for filtering the
// hammer noise burst.
function lowpass(inBuf, cutoffHz) {
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const dt = 1 / SR;
  const alpha = dt / (rc + dt);
  const out = new Float32Array(inBuf.length);
  let prev = 0;
  for (let i = 0; i < inBuf.length; i++) {
    prev = prev + alpha * (inBuf[i] - prev);
    out[i] = prev;
  }
  return out;
}

function buildSample(f0) {
  const n = Math.floor(SR * DUR);
  const out = new Float32Array(n);

  // 1. Hammer transient: 6 ms of white noise, lowpassed so it sounds
  // like hitting a damped surface, ramped down in amplitude.
  const transLen = Math.floor(SR * 0.006);
  const noise = new Float32Array(transLen);
  for (let i = 0; i < transLen; i++) noise[i] = (Math.random() * 2 - 1);
  const filtered = lowpass(noise, 3500);
  const transientGain = Math.min(1, 220 / f0); // louder thump on low notes
  for (let i = 0; i < transLen; i++) {
    const env = 1 - i / transLen;
    out[i] += filtered[i] * env * 0.25 * transientGain;
  }

  // 2 & 3. Inharmonic partials with per-partial decay.
  // Stiffness coefficient B scales with pitch — stiffer (higher B) for
  // higher notes, small for bass. Typical upright values B ≈ 1e-4..1e-3
  // for mid-range; we cheat a bit for perceptible colour.
  const B = 0.00015 * (f0 / 440);
  const numPartials = 12;

  for (let k = 1; k <= numPartials; k++) {
    const kf = k * f0 * Math.sqrt(1 + B * k * k);
    if (kf > SR / 2.2) break; // anti-alias — skip above ~20 kHz
    // Amplitude: 1/k for fundamentalish roll-off, odd partials slightly
    // louder than even (piano's spectral signature).
    const oddBoost = k % 2 === 1 ? 1.0 : 0.75;
    const amp = (1 / k) * oddBoost;
    // Decay: higher partials fall off faster. Bass notes decay slower
    // across the board.
    const decayK = (1.8 + k * 0.6) * (440 / f0) ** 0.3;
    const phase = Math.random() * 2 * Math.PI;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const env = Math.exp(-t * decayK);
      out[i] += Math.sin(2 * Math.PI * kf * t + phase) * amp * env;
    }
  }

  // 4. Two-stage amplitude envelope modulates the sum: fast initial
  // decay (body settling) + slow sustain decay.
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const attack = Math.min(1, t / 0.003);
    const fast = 0.35 * Math.exp(-t * 12) + 0.65;
    const slow = Math.exp(-t * 1.3);
    const env = attack * fast * slow;
    out[i] = softClip(out[i] * env * 0.9);
  }

  // Convert Float32 → 16-bit PCM.
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, out[i]));
    pcm.writeInt16LE(Math.round(v * 32767 * 0.85), i * 2);
  }
  return pcm;
}

function wavHeader(dataLen) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + dataLen, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(dataLen, 40);
  return h;
}

const samples = [
  { name: 'piano-a3.wav', freq: 220.0 },
  { name: 'piano-a4.wav', freq: 440.0 },
  { name: 'piano-a5.wav', freq: 880.0 },
];

for (const s of samples) {
  const pcm = buildSample(s.freq);
  const out = path.join(__dirname, s.name);
  fs.writeFileSync(out, Buffer.concat([wavHeader(pcm.length), pcm]));
  console.log('Wrote', out, `${(fs.statSync(out).size / 1024).toFixed(1)} KB`);
}
