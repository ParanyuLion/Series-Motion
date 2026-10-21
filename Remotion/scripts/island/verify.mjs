// Sanity checks for src/island/manifest.json. Exits non-zero with a message on the first failure.
import { existsSync, readFileSync } from "node:fs";

const path = "src/island/manifest.json";
const fail = (msg) => { console.error("FAIL:", msg); process.exit(1); };
if (!existsSync(path)) fail(`${path} is missing (run: node scripts/island/manifest.mjs)`);

const m = JSON.parse(readFileSync(path, "utf8"));
if (m.fps !== 30) fail(`fps must be 30, got ${m.fps}`);
if (m.shots.length !== 10) fail(`expected 10 shots, got ${m.shots.length}`);
const secs = m.total / m.fps;
if (secs < 55 || secs > 70) fail(`total ${secs.toFixed(1)} s is outside 55-70 s`);
if (m.storyEnd / m.fps > 65) fail(`story ends at ${(m.storyEnd / m.fps).toFixed(1)} s, over the 65 s limit: raise the voice speed or shorten the script`);
for (let i = 1; i < m.starts.length; i++) if (m.starts[i] <= m.starts[i - 1]) fail(`starts not increasing at shot ${i}`);
for (const [k, v] of Object.entries(m.cues)) if (!(v >= 0 && v <= m.total)) fail(`cue ${k}=${v} outside 0..${m.total}`);
if (!(m.cues.hookCut < m.cues.lineStart1)) fail("cues.hookCut must come before cues.lineStart1");
console.log(`OK: ${secs.toFixed(1)} s total, story ends ${(m.storyEnd / m.fps).toFixed(1)} s`);
