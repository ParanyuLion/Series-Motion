// Reads the narration audio lengths and writes src/bts3/manifest.json: the single source of truth for BTS Part 3 timing.
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
const lines = JSON.parse(readFileSync("scripts/bts3/part3.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/bts3/n${i}.mp3`]).toString();
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
  return { text, audio: `bts3/n${i}.mp3`, audioFrames, leadFrames, frames };
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
const third = Math.floor(shots[1].audioFrames / 3);
const cues = {
  hookCut: HOOK_FRAMES,
  board0: ls(1) + 5,            // three station boards slide past during line 1
  board1: ls(1) + third + 5,
  board2: ls(1) + 2 * third + 5,
  mapIn: ls(2),
  mapOut: le(2),
  enterAt: ls(2),               // the zombies come out of the walkway, the survivors back away
  nunPoints: ls(3),
  mikeNo: ls(3) + 40,
  argueAt: ls(4),
  shoveAt: ls(5) - 15,          // ไมค์ shoves พี่นุ่น
  fallAt: ls(5) + 25,           // she staggers into น้องเต้ย and he topples toward the zombie
  biteAt: ls(6) + 25,
  countdownStart: ls(6) + 40,   // the clock "น้องเต้ย" runs to the end of the part
  countAt: ls(7) + 10,          // survivors 5 -> 4
  faceAt: ls(7) + 40,           // close-up of "you" deciding
  cabGlassAt: ls(8),            // the view down the train to the slumped driver
  cabGlassEnd: le(8) + 10,
  questionAt: ls(9),
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/bts3/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
