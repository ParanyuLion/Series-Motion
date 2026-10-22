// Reads the narration audio lengths and writes src/bts/manifest.json: the single source of truth for BTS Part 1 timing.
// Nothing downstream hard-codes frame numbers; re-run this after regenerating the audio.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const MIN_HOOK_FRAMES = 180;  // at least 6 s; narration line 0 plays inside it, then the title card holds
const HOOK_LEAD = 21;      // 0.7 s before the first word
const LEAD = 15;           // 0.5 s before each later line
const TAIL = 27;           // 0.9 s after each later line
const OUTRO_GAP = 12;      // gap between the last word and the outro card
const OUTRO_FRAMES = 135;  // 4.5 s "next part" card

const HOOK_TAIL = 70;       // frames after the first line for the doors, the zombie hand and the title card
const lines = JSON.parse(readFileSync("scripts/bts/part1.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/bts1/n${i}.mp3`]).toString();
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
  return { text, audio: `bts1/n${i}.mp3`, audioFrames, leadFrames, frames };
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
  doorsClose: le(0) - 30,   // the doors shut as the first line ends ("...ซอมบี้เข้ามาพอดี")
  manTurns: ls(2),
  biteAt: ls(3) + 20,
  countdownStart: ls(3) + 30,
  womanRises: le(4),
  stationPass: ls(5) + 30,
  retreatStart: ls(6),
  mapIn: ls(6) + 40,
  mapOut: le(7),
  announceStart: ls(8),
  cabOpens: ls(9) + 40,
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/bts/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
