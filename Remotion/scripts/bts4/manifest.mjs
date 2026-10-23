// Reads the narration audio lengths and writes src/bts4/manifest.json: the single source of truth for BTS Part 4 timing.
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
const lines = JSON.parse(readFileSync("scripts/bts4/part4.narration.json", "utf8")).map((l) => (typeof l === "string" ? l : l.text));
const lengths = lines.map((_, i) => {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", `public/bts4/n${i}.mp3`]).toString();
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
  return { text, audio: `bts4/n${i}.mp3`, audioFrames, leadFrames, frames };
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
  clockZero: le(1) - 15,        // the clock "น้องเต้ย" reaches 0:00
  riseAt: ls(2),                // he rises
  faceEnd: ls(2) + 55,
  letGoAt: ls(2) + 70,          // ป้าสมจิตร lets go
  runAt: ls(2) + 100,           // everybody runs left through the walkway
  mapIn: ls(3),
  mapOut: le(3),
  itemsAt: ls(4),               // car 3: umbrella, extinguisher, bags
  car2At: ls(5),                // car 2 full of zombies
  fightAt: ls(6),
  jabAt: ls(6) + 10,
  sprayAt: ls(6) + 55,
  swingAt: ls(6) + 105,
  sprayEnd: le(6) - 10,
  doorAt: ls(7),                // the sliding door of car 1
  holdAt: ls(7) + 25,
  endAt: ls(7) + 85,            // silhouette and sound for ป้าสมจิตร
  biteAt: ls(8) + 20,           // the boy's teeth catch the bag strap
  skinAt: ls(8) + 60,           // unbroken skin
  cabAt: ls(9),
  questionAt: ls(9) + 20,
};
shots.forEach((_, i) => { cues[`lineStart${i}`] = ls(i); cues[`lineEnd${i}`] = le(i); });

writeFileSync("src/bts4/manifest.json", JSON.stringify({ fps: FPS, total, storyEnd, outroStart, shots, starts, cues }, null, 1));
console.log(`total ${total} frames = ${(total / FPS).toFixed(1)} s; story ends ${(storyEnd / FPS).toFixed(1)} s`);
