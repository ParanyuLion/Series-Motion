// Reads the narration audio lengths and writes src/blind1/manifest.json: the single source of truth for BTS Blind Village Part 1 timing.
// Nothing downstream hard-codes frame numbers; re-run this after regenerating the audio.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const MIN_HOOK_FRAMES = 180;  // at least 6 s; narration line 0 plays inside it, then the title card holds
const HOOK_LEAD = 21;      // 0.7 s before the first word
const LEAD = 6;            // 0.2 s before each later line (viewers lose focus in long silences)
const TAIL = 8;            // 0.27 s after each later line
const OUTRO_GAP = 12;      // gap between the last word and the outro card
const OUTRO_FRAMES = 135;  // 4.5 s "next part" card

const HOOK_TAIL = 50;       // frames after the first line for the doors, the zombie hand and the title card
const lines = JSON.parse(readFileSync("scripts/blind1/part1.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/blind1/n${i}.mp3`]).toString();
  return Math.ceil(parseFloat(out) * FPS);
});

const HOOK_FRAMES = Math.max(MIN_HOOK_FRAMES, HOOK_LEAD + lengths[0] + HOOK_TAIL);
const shots = lines.map((text, i) => {
  const audioFrames = lengths[i];
  const leadFrames = i === 0 ? HOOK_LEAD : LEAD;
  let frames = leadFrames + audioFrames + (i === lines.length - 1 ? OUTRO_GAP : TAIL);
  if (i === 0) {
    if (leadFrames + audioFrames + 15 > HOOK_FRAMES) throw new Error(`line 0 is too long for the ${HOOK_FRAMES / FPS}s hook`);
    frames = HOOK_FRAMES;
  }
  return { text, audio: `blind1/n${i}.mp3`, audioFrames, leadFrames, frames };
});

const starts = [];
let acc = 0;
for (const s of shots) { starts.push(acc); acc += s.frames; }
const outroStart = acc;
const total = outroStart + OUTRO_FRAMES;
const last = shots.length - 1;
const storyEnd = starts[last] + shots[last].leadFrames + shots[last].audioFrames;

const ls = (i) => starts[i] + shots[i].leadFrames;
const le = (i) => ls(i) + shots[i].audioFrames;
const cues = {
  hookCut: HOOK_FRAMES,
  eyeOpenAt: ls(1),
  stickAt: ls(2) + 40,
  headEnters: ls(3),
  askAt: ls(4),
  answerAt: ls(5),
  smileAt: ls(6),
  walkAt: ls(6) + 60,
  eyesAt: ls(7),
  shirtAt: ls(8),
  patternAt: ls(9),
  fearAt: ls(10),
  noMirrorAt: ls(11),
  bellAt: ls(12),
  turnAt: ls(13),
  questionAt: ls(14),
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/blind1/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
