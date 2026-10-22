// Sanity checks for src/bts/manifest.json. Exits non-zero with a message on the first failure.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const path = "src/bts/manifest.json";
const fail = (msg) => { console.error("FAIL:", msg); process.exit(1); };
if (!existsSync(path)) fail(`${path} is missing (run: node scripts/bts/manifest.mjs)`);

const m = JSON.parse(readFileSync(path, "utf8"));
if (m.fps !== 30) fail(`fps must be 30, got ${m.fps}`);
if (m.shots.length !== 10) fail(`expected 10 shots, got ${m.shots.length}`);
const secs = m.total / m.fps;
if (secs < 55 || secs > 72) fail(`total ${secs.toFixed(1)} s is outside 55-72 s`);
if (m.storyEnd / m.fps > 67) fail(`story ends at ${(m.storyEnd / m.fps).toFixed(1)} s, over the 67 s limit: raise the voice speed (--post-speed) or shorten the script`);
for (let i = 1; i < m.starts.length; i++) if (m.starts[i] <= m.starts[i - 1]) fail(`starts not increasing at shot ${i}`);
for (const [k, v] of Object.entries(m.cues)) if (!(v >= 0 && v <= m.total)) fail(`cue ${k}=${v} outside 0..${m.total}`);
if (!(m.cues.hookCut < m.cues.lineStart1)) fail("cues.hookCut must come before cues.lineStart1");
if (!(m.cues.countdownStart < m.cues.womanRises)) fail("the countdown must start before the woman rises");
for (const shot of m.shots) {
  const f = `public/${shot.audio}`;
  if (!existsSync(f)) fail(`${f} is missing`);
  const d = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
  if (!(d > 1)) fail(`${f} is only ${d.toFixed(2)} s long`);
}
const bed = "public/bts1/bed.wav";
if (existsSync(bed)) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", bed]).toString();
  const bedSecs = parseFloat(out);
  if (Math.abs(bedSecs - m.total / m.fps) > 0.15) fail(`bed.wav is ${bedSecs.toFixed(1)} s but the video is ${secs.toFixed(1)} s: re-run python scripts/bts/bed.py`);
}
console.log(`OK: ${secs.toFixed(1)} s total, story ends ${(m.storyEnd / m.fps).toFixed(1)} s`);
