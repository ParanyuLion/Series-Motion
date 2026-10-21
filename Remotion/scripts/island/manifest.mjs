// Reads the narration audio lengths and writes src/island/manifest.json: the single source of truth for Part 1 timing.
// Nothing downstream hard-codes frame numbers; re-run this after regenerating the audio.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const HOOK_FRAMES = 150;      // 5 s opening hook; narration line 0 plays inside it
const HOOK_LEAD = 21;         // 0.7 s of waves before the first word
const LEAD = 15;              // 0.5 s before each later line
const TAIL = 27;              // 0.9 s after each later line
const OUTRO_GAP = 12;         // gap between the last word and the outro card
const OUTRO_FRAMES = 135;     // 4.5 s "next part" card

const lines = JSON.parse(readFileSync("scripts/island/part1.narration.json", "utf8"));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/island1/n${i}.mp3`]).toString();
  return Math.ceil(parseFloat(out) * FPS);
});

const shots = lines.map((text, i) => {
  const audioFrames = lengths[i];
  const leadFrames = i === 0 ? HOOK_LEAD : LEAD;
  let frames = leadFrames + audioFrames + (i === lines.length - 1 ? OUTRO_GAP : TAIL);
  if (i === 0) {
    if (leadFrames + audioFrames + 15 > HOOK_FRAMES) throw new Error(`line 0 is too long for the ${HOOK_FRAMES / FPS}s hook`);
    frames = HOOK_FRAMES;
  }
  return { text, audio: `island1/n${i}.mp3`, audioFrames, leadFrames, frames };
});

const starts = [];
let acc = 0;
for (const s of shots) { starts.push(acc); acc += s.frames; }
const outroStart = acc;
const total = outroStart + OUTRO_FRAMES;
const last = shots.length - 1;
const storyEnd = starts[last] + shots[last].leadFrames + shots[last].audioFrames;

const lineStart = (i) => starts[i] + shots[i].leadFrames;
const lineEnd = (i) => lineStart(i) + shots[i].audioFrames;
const cues = { hookCut: HOOK_FRAMES, mapIn: lineStart(3), mapOut: lineEnd(5), skyChange: lineStart(9) };
shots.forEach((_, i) => { cues[`lineStart${i}`] = lineStart(i); cues[`lineEnd${i}`] = lineEnd(i); });

writeFileSync("src/island/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
