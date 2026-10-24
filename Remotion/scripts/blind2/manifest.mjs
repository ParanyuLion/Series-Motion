// Reads the narration audio lengths and writes src/blind2/manifest.json: the single source of truth for Blind Village Part 2 timing.
// Nothing downstream hard-codes frame numbers; re-run this after regenerating the audio.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const HOOK_LEAD = 21;      // 0.7 s before the first word
const LEAD = 6;            // 0.2 s before each later line (viewers lose focus in long silences)
const TAIL = 8;            // 0.27 s after each later line
const HOOK_GAP = 6;        // between hook lines 0 and 1
const TITLE_HOLD = 50;     // frames after line 1 for the title card
const OUTRO_GAP = 12;      // gap between the last word and the outro card
const OUTRO_FRAMES = 135;  // 4.5 s "next part" card

const lines = JSON.parse(readFileSync("scripts/blind2/part2.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/blind2/n${i}.mp3`]).toString();
  return Math.ceil(parseFloat(out) * FPS);
});

const last = lines.length - 1;
// the hook is lines 0 and 1; line 1 is followed by the title card
const shots = lines.map((text, i) => {
  const audioFrames = lengths[i];
  const leadFrames = i === 0 ? HOOK_LEAD : LEAD;
  const tail = i === 0 ? HOOK_GAP : i === 1 ? TITLE_HOLD : i === last ? OUTRO_GAP : TAIL;
  return { text, audio: `blind2/n${i}.mp3`, audioFrames, leadFrames, frames: leadFrames + audioFrames + tail };
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
  tableAt: ls(2),
  handAt: ls(3),
  wonderAt: ls(4),
  tellAt: ls(5),
  tripAt: ls(6),
  runAt: ls(7),
  sighAt: ls(8),
  nodAt: ls(9),
  gentleAt: ls(10),
  gripAt: ls(11),
  stareAt: ls(11) + 80,
  bellAt: ls(12),
  smileAt: ls(13),
  questionAt: ls(14),
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/blind2/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
