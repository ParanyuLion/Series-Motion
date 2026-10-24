# Blind Village Series, Part 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `out/blind_part3.mp4`, Part 3 ("อย่ากะพริบตา", the old Parts 3 and 4 merged) of "หมู่บ้านที่ทุกคนตาบอด", from the approved 20-line script, about 1:50 and never over 125 s.

**Architecture:** Composition `Blind3` in `src/blind3/` and `scripts/blind3/`, copied in structure from `Blind2` (manifest-driven cues from the narration audio lengths, `makeCamera`, `Passenger` rig, cross-fades, the grey grade). New: the night hut with the cook feeding "you", the chair test in the village by day (a chair in the path, the head's stick nudges it), the shirt, the roof shirt and the scratched post, the leaves memory flash, the bell and the moving trees, the dawn forest (parallax trunks, fog, the shoe), the crowd of pale masks in the dark, the lowered face with "you" reflected in its eye, the leaning crowd and the road. Reused: `Village`, `HutInterior` (night overlay), `FaceYou`, `FaceHead`, `PatternCard`, `SupperTable` not needed; mask and body parts from `src/blind1/SnakePreview.tsx` (`MaskHead`, `Flesh`, `Head`, `Branch`, `Pose` get an `export`).

**Tech Stack:** Remotion 4, React, TypeScript, SVG, Python 3.13 (numpy, scipy), TTS via the Vertex backend of `scripts/tts_gemini.py` (run as a subprocess, never imported), ffmpeg, node 22.

**Spec:** `docs/superpowers/specs/blind-village-part3-script-draft.md` (approved by the user on 2026-10-24: "อนุมัติ"), on `2026-10-23-blind-village-series-design.md` and `2026-10-23-blind-village-story-plan.md`. Rules: `series-animation/SKILL.md` and `references/`. Templates: `src/blind2/`, `scripts/blind2/`, `docs/superpowers/plans/2026-10-24-blind-village-part2.md`.

## Global Constraints

- 1080x1920, 30 fps, H.264 plus AAC; total 80 to 125 s; story ends by 118 s; the 20 narration lines verbatim from the draft (at most 56 Thai characters without spaces each). Voice **Charon**, model `gemini-3.1-flash-tts-preview`, Vertex backend, speed 1.1, post-speed 1.245, the cold style of `scripts/blind1/voice.txt`. Stop and tell the user on any key, auth or quota error. If the story runs past 118 s, tell the user instead of cutting the script.
- The first two lines (index 0 and 1) are the hook and carry the whole premise; the title card shows "ตอนที่ 3", "อย่ากะพริบตา" and a small "หมู่บ้านที่ทุกคนตาบอด".
- Horror from the abnormal only: no ghosts, no jump scare, no gore. **The unseen stays unseen (user, 2026-10-24):** the crowd is shown only as pale masks and coils in the dark, never a full lit view; the memory flash shows leaves only; the thing that moves in the trees is only trunks and darkness. The one reflection of "you" in the series is in the lowered mask's eye (a deliberate exception). "You" never show that they can see: the only pupils are "you"'s; during the crossing the eyes stay dead still.
- Use only common Thai words in the narration and on cards (เก้าอี้, not ตั่ง).
- Quiet sound: forest ambience, low drones, the bell once, a total drop-out of insects in the forest, soft laughter at the end; no loud stingers. Loudness -20 to -14 LUFS; bed `<Audio volume={0.5}>`, bed peak at most -3 dBFS.
- Safe area: subtitles Prompt 500 size 52, `left 60, right 160, bottom 340`, two lines; figures above screen y 1414; tags and cards inside x 140 to 890; nothing floats; cross-fades, no hard cuts, every pose change cross-faded or squashed; face-on close-ups at key beats; each object a line names must be in frame at that line (the chair, the bell, the shoe).
- Rig edits only as optional props or new exports (Bts 1 to 5, Blind1 and Blind2 must render unchanged). Never print or commit secrets. Commit after each task and push to `main`.

## Review Focus

- The hook for a cold viewer: lines 0 and 1 over a picture that shows a seeing "you" among clouded-eyed villagers; the title card names the series and "ตอนที่ 3".
- The chair is in frame from line 3; every villager walks around it without looking; "you" step toward it and the stick nudges it a moment BEFORE the foot; no flinch.
- The crowd never appears in full light: pale masks and coil shapes in the dark only; nothing jumps; the lowered mask comes slowly; "you" never blink (no blink animation on "you" from line 16 to line 19).
- The forest goes quiet: the sound bed has no insects from line 12; the shoe is in frame at line 13.
- Words and pictures agree at line starts; no card before its words; the cards use common words.
- Blind1, Blind2 and Bts5 stills unchanged.

---

### Task 1: Narration and cues

**Files:** Create `scripts/blind3/part3.narration.json`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`, `voice.txt`; output `public/blind3/n0.mp3` to `n19.mp3`, `src/blind3/manifest.json`.

**Interfaces:** `manifest.json` as in Blind2. Cues (global frames): `hookCut` (= `starts[2]`), `titleAt` (= `lineEnd1` + 4), then `nightAt` (= `lineStart2`), `chairAt` (3), `nudgeAt` (4), `smileAt` (5), `shirtAt` (6), `roofAt` (7), `postAt` (8), `carriedAt` (9), `bellAt` (10), `dawnAt` (11), `quietAt` (12), `shoeAt` (13), `faceAt` (14), `crowdAt` (15), `blindAt` (16), `lowerAt` (17), `leanAt` (18), `roadAt` (19), plus `lineStart0..19` and `lineEnd0..19`.

- [ ] **Step 1:** copy `scripts/blind2/verify.mjs` and `subtitle-check.mjs` to `blind3` with paths changed; 20 shots; total 80 to 125 s; story end at most 118 s; cue order `titleAt < nightAt < chairAt < ... < roadAt` and `hookCut <= lineStart2`. Run verify. Expected: FAIL (manifest missing).
- [ ] **Step 2:** write the 20 lines of the draft verbatim to `part3.narration.json`; `node scripts/blind3/subtitle-check.mjs`. Expected: `OK`.
- [ ] **Step 3:** run `scripts/tts_gemini.py` as a subprocess with the Blind2 command (`--script scripts/blind3/part3.narration.json --out-dir public/blind3`); record in `voice.txt`. Expected: 20 files.
- [ ] **Step 4:** `manifest.mjs` from `scripts/blind2/manifest.mjs` with the cues above (hook lines 0 and 1, title hold 50 frames, `LEAD 6`, `TAIL 8`, outro 135). Run it and verify. Expected: `OK`.
- [ ] **Step 5:** commit.

### Task 2: Scenery and close-ups

**Files:** Modify `src/blind1/SnakePreview.tsx` (add `export` to `Head`, `MaskHead`, `Flesh`, `Branch`, `Pose`). Create `src/blind3/Forest.tsx` (the dawn forest with parallax trunks, fog, the shoe, `CrowdLayer`), `src/blind3/Cards.tsx` (`PostCard`, `RoofCard`, `LeavesFlash`, `LowerFace`), `src/blind3/Props.tsx` (`Chair`, `Rustle`).

**Interfaces:**
- `Chair: React.FC<{ x: number; y: number; slide: number }>` (`slide` 0..1 moves it 90 px sideways, tilted); `Rustle: React.FC<{ g: number; from: number; x0: number; x1: number }>`: dark trunks at the forest line that sway and, at `from`, one trunk leans a few degrees.
- `Forest: React.FC<{ g: number; dawn: number }>` (world 0 to 6000 wide, trunks in three depth layers, ground fog, grey dawn light, no insects drawn) and `Shoe: React.FC<{ x: number; y: number }>`; `CrowdLayer: React.FC<{ g: number; from: number; to: number; n: number; lean: number; x0: number; x1: number }>`: `n` pale masks (`MaskHead kind 3` at small scale, with the cut-off body coils or a branch) hidden deep in dark, appearing one by one from `from`; `lean` 0..1 tilts all of them toward the walker.
- `PostCard: React.FC<{ g: number; from: number; to: number }>`: a wooden post lit from the side, scratches in groups of five appearing one group after another. `RoofCard`: the thatch seen from below with a pale folded shirt without any pattern between two beams. `LeavesFlash: React.FC<{ g: number; from: number; to: number }>`: soft dark leaves sliding across warm light with a rocking motion, out of focus, no snake. `LowerFace: React.FC<{ g: number; from: number; to: number }>`: a dark frame; a large pale mask descends slowly from the top to fill the lower two thirds; in each hollow black eye a tiny reflection of "you" (a small face with two white eyes and pupils); no body shown.

- [ ] **Step 1:** add a temporary import of `./blind3/Forest` in `src/Root.tsx`; `npx tsc -p . --noEmit`. Expected: error (module missing).
- [ ] **Step 2:** implement the components; remove the temporary import.
- [ ] **Step 3:** `npx tsc -p . --noEmit`; check stills of each piece through the Task 3 composition (no full lit view of the crowd, the mask descending slowly).
- [ ] **Step 4:** commit.

### Task 3: Composition

**Files:** Create `src/blind3/Part3.tsx`; modify `src/Root.tsx` (register `Blind3`).

| Cue range | Picture |
|---|---|
| 0 to `titleAt` | hook: the village by day, "you" standing among clouded-eyed villagers, slow push-in on "you"; title card from `titleAt` to `hookCut` |
| `nightAt` | the hut at night (`HutInterior` under a dark blue overlay and a lantern glow); the cook feeds "you"; face-on close-up of "you", the eyes still while the spoon waits |
| `chairAt` to `nudgeAt` | morning; the chair in the path (`Chair`); villagers walk around it without looking; "you" walk toward it; the camera holds the chair in frame |
| `nudgeAt` to `smileAt` | the head's stick swings and nudges the chair before the foot; "you" step on; at `smileAt` `FaceHead` close-up with the smile |
| `shirtAt` | the cook hands over the shirt; close-up of the pattern on the chest (`PatternCard`) |
| `roofAt` | `RoofCard`, then `PostCard` at `postAt` |
| `carriedAt` | `LeavesFlash` |
| `bellAt` | the village at dusk, the bell struck once (the camera cuts to the bell first), the villagers turn to the forest, "you" turn the head a little; `Rustle` at the tree line |
| `dawnAt` | "you" leave the hut and cross the village in the grey dawn, then enter the forest (`Forest`); scenes cross-fade |
| `quietAt` to `shoeAt` | the forest, too quiet, "you" walk; the shoe in frame at `shoeAt` |
| `faceAt` to `crowdAt` | a single pale mask above, then many in the dark (`CrowdLayer`), the camera looking up past "you" |
| `blindAt` | the blind walk under the branches; face-on `FaceYou` (eyes still) |
| `lowerAt` | `LowerFace` |
| `leanAt` | `FaceYou` without blink, then the whole `CrowdLayer` leans toward "you" |
| `roadAt` to outro | "you" walk to a pale road, the crowd soft behind; the push-in on "you"'s back; "you" do not turn |
| outro | "ตอนต่อไป: ทางกลับบ้าน..." then "ติดตามตอนที่ 4" |

**Interfaces:** consumes the cues of Task 1 and the components of Task 2; `Part3: React.FC`, `PART3_TOTAL: number`.

- [ ] **Step 1:** `npx remotion still src/index.ts Blind3 out/b3_check.png --frame=100`. Expected: fails (not registered).
- [ ] **Step 2:** implement `Part3.tsx` (cameras with `makeCamera`, 10-frame cross-fades, subtitles in the safe area, title and outro cards), register `Blind3`.
- [ ] **Step 3:** `node scripts/blind3/subtitle-check.mjs && npx tsc -p . --noEmit`; stills across all ranges (about 30 frames, contact sheets). Expected: the Review Focus items hold.
- [ ] **Step 4:** commit.

### Task 4: Sound bed, render, review, notes

**Files:** Create `scripts/blind3/bed.py`; output `public/blind3/bed.wav`, `out/blind_part3.mp4`, `finished/2-หมู่บ้านที่ทุกคนตาบอด/ตอน3.mp4`.

- [ ] **Step 1:** `bed.py` from `scripts/blind2/bed.py`: night ambience in the hut (crickets, a low drone, the spoon's tiny click); daytime village; one stick tap and the chair's scrape at `nudgeAt`; cloth rustle at `shirtAt`; wood creak at `roofAt`; a scratch-scratch rhythm under `postAt`; a muffled rocking rush with soft leaves at `carriedAt`; the bell once at `bellAt` with a long tail and a pause of all ambience; at `dawnAt` birds far away; from `quietAt` NO insects and a dead hush with a low beating drone; a faint creak at `faceAt`; a slow hiss-like breath bed (no snake sound) at `crowdAt`; heartbeat from `blindAt`; a held low note at `lowerAt`; at `leanAt` a soft shared exhale; at `roadAt` quiet laughter (many soft low voices) behind "you"; outro sting; swishes at line changes; ducking 0.55.
- [ ] **Step 2:** `python scripts/blind3/bed.py && node scripts/blind3/verify.mjs`. Expected: peak at most -3 dBFS; `OK`.
- [ ] **Step 3:** render `npx remotion render src/index.ts Blind3 out/blind_part3.mp4 --codec=h264` in the background; check size, 80 to 125 s, -20 to -14 LUFS; stills of Blind1, Blind2 and Bts5 unchanged.
- [ ] **Step 4:** final Opus review of the whole branch (Agent tool, model opus), one fix pass, re-render, copy to `finished/`, update `series-animation/references/feedback-log.md` and `series-bible-blind-village.md`, commit and push to `main`; then write the Part 3 captions (TikTok uses the user's hashtag set).
