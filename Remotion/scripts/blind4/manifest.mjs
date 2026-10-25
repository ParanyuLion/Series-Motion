// Reads the narration audio lengths and writes src/blind4/manifest.json: the single source of truth for Blind Village Part 4 timing.
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

const lines = JSON.parse(readFileSync("scripts/blind4/part4.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/blind4/n${i}.mp3`]).toString();
  return Math.ceil(parseFloat(out) * FPS);
});

const last = lines.length - 1;
const shots = lines.map((text, i) => {
  const audioFrames = lengths[i];
  const leadFrames = i === 0 ? HOOK_LEAD : LEAD;
  const tail = i === 0 ? HOOK_GAP : i === 1 ? TITLE_HOLD : i === last ? OUTRO_GAP : TAIL;
  return { text, audio: `blind4/n${i}.mp3`, audioFrames, leadFrames, frames: leadFrames + audioFrames + tail };
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
  edgeAt: ls(2),
  smileAt: ls(3),
  speakAt: ls(4),
  roadAt: ls(5),
  homeAt: ls(6),
  memoryAt: ls(7),
  chosenAt: ls(8),
  mirrorAt: ls(9),
  patternAt: ls(10),
  pupilAt: ls(11),
  nameAt: ls(12),
  bellAt: ls(13),
  changeAt: ls(14),
  villageEdgeAt: ls(15),
  confessAt: ls(16),
  newAt: ls(17),
  welcomeAt: ls(18),
  lastAt: ls(19),
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/blind4/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
