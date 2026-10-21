// Single source of truth for timing: reads narration audio lengths, writes src/manifest.json.
// Both the Remotion project (src/Story.tsx) and the sound-bed generator (scripts/bed.py) read it.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FPS = 30, LEAD = 0.5, TAIL = 0.9, PHASE_SPEED = 0.2;
const lines = JSON.parse(readFileSync("scripts/narration.json", "utf8"));

const shots = lines.map((text, i) => {
  const secs = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/audio/n${i}.mp3`]).toString());
  const audioFrames = Math.ceil(secs * FPS);
  const leadFrames = Math.round(LEAD * FPS);
  return { text, audio: `audio/n${i}.mp3`, audioFrames, leadFrames, frames: leadFrames + audioFrames + Math.round(TAIL * FPS) };
});

const starts = [];
let acc = 0;
for (const s of shots) { starts.push(acc); acc += s.frames; }
const total = acc;

// Story cues (global frame numbers). The whole piece is ONE continuous world, no scene cuts.
const cues = {
  stop: starts[1] + 6,          // boy stops as the firefly is about to appear
  fireflyIn: starts[1] + 20,    // firefly starts flying in
  fireflyHover: starts[1] + 80, // ...and hovers in front of the boy
  go: starts[2] + 10,           // boy starts following it
  houseWalkEnd: starts[3] + 72, // boy reaches the house
  waveIn: starts[3] + 96,
  waveOut: total - 36,
  nightFrom: 120,               // dusk -> night colour transition
  nightTo: starts[1] + 70,
};

const w = Array.from({ length: total + 1 }, (_, g) => {
  if (g < cues.stop) return 1;
  if (g < cues.stop + 12) return 1 - (g - cues.stop) / 12;
  if (g < cues.go) return 0;
  if (g < cues.go + 12) return (g - cues.go) / 12;
  if (g < cues.houseWalkEnd) return 1;
  if (g < cues.houseWalkEnd + 10) return 1 - (g - cues.houseWalkEnd) / 10;
  return 0;
}).map((v) => Math.round(v * 1000) / 1000);

// Footstep frames: foot contact when |sin(phase)| peaks, i.e. phase = pi/2 + k*pi
const steps = [];
let lastK = Math.floor((0 - Math.PI / 2) / Math.PI);
for (let g = 1; g <= total; g++) {
  const k = Math.floor((g * PHASE_SPEED - Math.PI / 2) / Math.PI);
  if (k !== lastK) { lastK = k; if (w[g] > 0.25) steps.push({ g, vol: w[g] }); }
}

writeFileSync("src/manifest.json", JSON.stringify({ fps: FPS, total, phaseSpeed: PHASE_SPEED, starts, cues, shots, w, steps }, null, 1));
console.log("total", total, "frames =", (total / FPS).toFixed(1), "s; steps:", steps.length);
