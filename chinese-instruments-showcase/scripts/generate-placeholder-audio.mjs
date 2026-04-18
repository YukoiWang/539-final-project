/**
 * Generates short mono 44.1kHz WAV previews (placeholder tones).
 * Replace files in assets/audio with real instrument recordings when available.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "assets", "audio");

const SAMPLE_RATE = 44100;
const DURATION_SEC = 2.8;

function writeWav(filepath, samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  let o = 0;
  buffer.write("RIFF", o);
  o += 4;
  buffer.writeUInt32LE(36 + dataSize, o);
  o += 4;
  buffer.write("WAVE", o);
  o += 4;
  buffer.write("fmt ", o);
  o += 4;
  buffer.writeUInt32LE(16, o);
  o += 4;
  buffer.writeUInt16LE(1, o);
  o += 2;
  buffer.writeUInt16LE(numChannels, o);
  o += 2;
  buffer.writeUInt32LE(SAMPLE_RATE, o);
  o += 4;
  buffer.writeUInt32LE(byteRate, o);
  o += 4;
  buffer.writeUInt16LE(blockAlign, o);
  o += 2;
  buffer.writeUInt16LE(bitsPerSample, o);
  o += 2;
  buffer.write("data", o);
  o += 4;
  buffer.writeUInt32LE(dataSize, o);
  o += 4;
  for (let i = 0; i < samples.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), o);
  }
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, buffer);
}

function envelope(t, attack, release, total) {
  if (t < attack) return t / attack;
  if (t > total - release) return Math.max(0, (total - t) / release);
  return 1;
}

function genSine(freqHz, seconds, vibratoDepth = 0, vibratoRate = 5) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.08, 0.35, seconds);
    const vib = 1 + vibratoDepth * Math.sin(2 * Math.PI * vibratoRate * t);
    const f = freqHz * vib;
    out[i] = env * Math.sin(2 * Math.PI * f * t);
  }
  return out;
}

function genPluck(freqHz, seconds) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const decay = Math.exp(-3.2 * t);
    const partials =
      Math.sin(2 * Math.PI * freqHz * t) * 0.55 +
      Math.sin(2 * Math.PI * freqHz * 2.01 * t) * 0.25 +
      Math.sin(2 * Math.PI * freqHz * 3.97 * t) * 0.12;
    out[i] = decay * partials * envelope(t, 0.002, 0.4, seconds);
  }
  return out;
}

function genReed(freqHz, seconds) {
  const n = Math.floor(SAMPLE_RATE * seconds);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const env = envelope(t, 0.04, 0.3, seconds);
    const buzz = Math.sign(Math.sin(2 * Math.PI * freqHz * t)) * 0.35;
    const body = Math.sin(2 * Math.PI * freqHz * t) * 0.65;
    out[i] = env * (body + buzz * 0.25);
  }
  return out;
}

function mix(a, b, gainB = 0.5) {
  const n = Math.min(a.length, b.length);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] + b[i] * gainB;
  return out;
}

function normalize(samples, peak = 0.85) {
  let m = 0;
  for (let i = 0; i < samples.length; i++) m = Math.max(m, Math.abs(samples[i]));
  if (m < 1e-6) return samples;
  const g = peak / m;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * g;
  return out;
}

const instruments = [
  { id: "erhu", gen: () => mix(genSine(293.66, DURATION_SEC, 0.012, 4.2), genSine(440, DURATION_SEC, 0.006, 3.1), 0.08) },
  { id: "guzheng", gen: () => genPluck(196, DURATION_SEC) },
  { id: "guqin", gen: () => mix(genPluck(174.61, DURATION_SEC), genSine(130.81, DURATION_SEC, 0.008, 3), 0.2) },
  { id: "pipa", gen: () => genPluck(246.94, DURATION_SEC) },
  { id: "dizi", gen: () => genReed(659.25, DURATION_SEC) },
  { id: "yangqin", gen: () => mix(genPluck(329.63, DURATION_SEC * 0.6), genPluck(493.88, DURATION_SEC * 0.55), 0.45) },
  { id: "suona", gen: () => genReed(391.99, DURATION_SEC) },
  { id: "sheng", gen: () => mix(genSine(220, DURATION_SEC, 0.003, 2.5), genSine(277.18, DURATION_SEC, 0.004, 2.7), 0.35) },
  { id: "bianzhong", gen: () => mix(genSine(130.81, DURATION_SEC, 0, 0), genSine(196, DURATION_SEC, 0, 0), 0.25) },
];

for (const { id, gen } of instruments) {
  const samples = normalize(gen());
  writeWav(path.join(outDir, `${id}.wav`), samples);
  console.log("Wrote", path.join("assets", "audio", `${id}.wav`));
}
