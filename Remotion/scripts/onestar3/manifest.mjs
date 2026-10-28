// Reads the narration audio lengths and writes src/onestar3/manifest.json: the single source of truth for "1 ดาว" Part 3 timing.
// Nothing downstream hard-codes frame numbers; re-run this after regenerating the audio.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const HOOK_LEAD = 21;      // 0.7 s before the first word
const LEAD = 6;            // 0.2 s before each later line
const TAIL = 6;            // 0.2 s after each later line
const HOOK_GAP = 6;        // between hook lines 0 and 1
const TITLE_HOLD = 42;     // frames after line 1 for the title card
const OUTRO_GAP = 12;
const OUTRO_FRAMES = 130;  // 4.5 s finale card

const lines = JSON.parse(readFileSync("scripts/onestar3/part3.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/onestar3/n${i}.mp3`]).toString();
  return Math.ceil(parseFloat(out) * FPS);
});

const last = lines.length - 1;
const shots = lines.map((text, i) => {
  const audioFrames = lengths[i];
  const leadFrames = i === 0 ? HOOK_LEAD : LEAD;
  const tail = i === 0 ? HOOK_GAP : i === 1 ? TITLE_HOLD : i === last ? OUTRO_GAP : TAIL;
  return { text, audio: `onestar3/n${i}.mp3`, audioFrames, leadFrames, frames: leadFrames + audioFrames + tail };
});

const starts = [];
let acc = 0;
for (const s of shots) { starts.push(acc); acc += s.frames; }
const outroStart = acc;
const total = outroStart + OUTRO_FRAMES;
const storyEnd = starts[last] + shots[last].leadFrames + shots[last].audioFrames;

const ls = (i) => starts[i] + shots[i].leadFrames;
const le = (i) => ls(i) + shots[i].audioFrames;
const cues = {
  hookCut: starts[2],
  titleAt: le(1) + 4,
  trainAt: ls(2),
  riseAt: ls(3),
  benchAt: ls(5),
  nameAt: ls(6),
  loopholeAt: ls(7),
  houseAt: ls(8),
  chimeAt: ls(9),
  pinAt: ls(10),
  starAt: ls(11),
  sorryAt: ls(12),
  lockAt: ls(13),
  threeAt: ls(14),
  keyAt: ls(15),
  pressAt: ls(16),
  moveAt: ls(17),
  exitAt: ls(18),
  guiltAt: ls(19),
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/onestar3/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
