// Sanity checks for src/blind3/manifest.json. Exits non-zero with a message on the first failure.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const path = "src/blind3/manifest.json";
const fail = (msg) => { console.error("FAIL:", msg); process.exit(1); };
if (!existsSync(path)) fail(`${path} is missing (run: node scripts/blind3/manifest.mjs)`);

const m = JSON.parse(readFileSync(path, "utf8"));
if (m.fps !== 30) fail(`fps must be 30, got ${m.fps}`);
if (m.shots.length !== 20) fail(`expected 20 shots, got ${m.shots.length}`);
const secs = m.total / m.fps;
if (secs < 80 || secs > 130) fail(`total ${secs.toFixed(1)} s is outside 80-130 s`);
if (m.storyEnd / m.fps > 123) fail(`story ends at ${(m.storyEnd / m.fps).toFixed(1)} s, over the 123 s limit: raise the voice speed (--post-speed) or shorten the script`);
for (let i = 1; i < m.starts.length; i++) if (m.starts[i] <= m.starts[i - 1]) fail(`starts not increasing at shot ${i}`);
for (const [k, v] of Object.entries(m.cues)) if (!(v >= 0 && v <= m.total)) fail(`cue ${k}=${v} outside 0..${m.total}`);
if (!(m.cues.hookCut <= m.cues.lineStart2)) fail("cues.hookCut must not pass cues.lineStart2");
const order = ["titleAt", "nightAt", "chairAt", "nudgeAt", "smileAt", "shirtAt", "roofAt", "postAt", "carriedAt", "bellAt", "dawnAt", "quietAt", "shoeAt", "faceAt", "crowdAt", "blindAt", "lowerAt", "leanAt", "roadAt"];
for (const k of order) if (!(k in m.cues)) fail(`cue ${k} is missing: re-run node scripts/blind3/manifest.mjs`);
for (let i = 1; i < order.length; i++) if (!(m.cues[order[i - 1]] < m.cues[order[i]])) fail(`cue ${order[i - 1]} must come before ${order[i]}`);
for (const shot of m.shots) {
  const f = `public/${shot.audio}`;
  if (!existsSync(f)) fail(`${f} is missing`);
  const d = parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());
  if (!(d > 1)) fail(`${f} is only ${d.toFixed(2)} s long`);
}
const bed = "public/blind3/bed.wav";
if (existsSync(bed)) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", bed]).toString();
  const bedSecs = parseFloat(out);
  if (Math.abs(bedSecs - m.total / m.fps) > 0.15) fail(`bed.wav is ${bedSecs.toFixed(1)} s but the video is ${secs.toFixed(1)} s: re-run python scripts/blind3/bed.py`);
}
console.log(`OK: ${secs.toFixed(1)} s total, story ends ${(m.storyEnd / m.fps).toFixed(1)} s`);
