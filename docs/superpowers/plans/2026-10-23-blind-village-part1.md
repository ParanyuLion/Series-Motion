# Blind Village Series, Part 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `out/blind_part1.mp4`, Part 1 ("ตื่นขึ้นมา") of the series "หมู่บ้านที่ทุกคนตาบอด", from the approved Thai script.

**Architecture:** Composition `Blind1` in `src/blind1/` and `scripts/blind1/`; timing from the narration audio through `src/blind1/manifest.json` (every cue derived from line timings); a synthesised sound bed; reuse of `Passenger` (side-view rig) and `makeCamera` (`src/bts4/camera.ts`). New: cast data for the villagers (white clouded eyes, the snake-shirt pattern), a `Stick` item, village scenery, face-on close-ups (the waking eye, the head, "you", the pattern tile), the dusk bell.

**Tech Stack:** Remotion 4, React, TypeScript, SVG, Python 3.13 (numpy, scipy), TTS via the Vertex AI backend of `scripts/tts_gemini.py` (run as a subprocess, never imported), ffmpeg, node 22.

**Spec:** `docs/superpowers/specs/blind-village-part1-script-draft.md` (approved by the user on 2026-10-23, "อนุมัติ"), on `docs/superpowers/specs/2026-10-23-blind-village-series-design.md` and `2026-10-23-blind-village-story-plan.md`. Rules: `series-animation/SKILL.md` and `references/`. Templates: `src/bts5/`, `scripts/bts5/`, `docs/superpowers/plans/2026-10-23-bts-part5.md`.

## Global Constraints

- 1080x1920, 30 fps, H.264 plus AAC; total 80 to 100 s; story ends by 96 s; the 15 narration lines verbatim from the draft (at most 56 Thai characters without spaces). Voice **Charon**, model `gemini-3.1-flash-tts-preview`, Vertex backend, speed 1.1, post-speed 1.245 (total about 1.37, chosen by the user), a cold calm style via `GEMINI_TTS_STYLE`. Stop and tell the user on any key, auth or quota error; never change the voice without the user's say.
- Horror from the abnormal only: no ghosts, no jump scare, no gore. "You" never show that they can see: the only eyes with pupils are "you"'s. The villagers' eyes are clouded white and drawn without pupils.
- Quiet sound: forest ambience, soft drones, the dusk bell once; silence only as a short deliberate beat; no loud stingers.
- Safe area: subtitles Prompt 500, size 52, `left 60, right 160, bottom 340`, two lines; figures above screen y 1414; tags inside x 130 to 880; nothing floats; cross-fades, no hard cuts; face-on close-ups at the key beats.
- Loudness -20 to -14 LUFS; bed `<Audio volume={0.5}>`. Never print or commit secrets. Commit after each task and push to `main`.

## Review Focus

- The eyes: every villager has clouded eyes with no pupils; only "you" have pupils; the head's eyes are clouded too (his secret is only in the behaviour).
- The bell moment: all villagers turn toward the forest at the same moment and the camera is on "you", who do not.
- The pattern tile is the same everywhere (shirts, cups, the close-up) and its face is blank and calm.
- No mirror, no still water; nobody says "you"'s name.
- Parts 1 to 5 of the zombie series unchanged (rig edits are optional props).

---

### Task 1: Narration and cues

**Files:** Create `scripts/blind1/part1.narration.json`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`, `voice.txt`; output `public/blind1/n0.mp3` to `n14.mp3`, `src/blind1/manifest.json`.

**Interfaces:** cue keys (global frames): `hookCut`, `lineStart0..14`, `lineEnd0..14`, `eyeOpenAt` (= `lineStart1`), `stickAt` (= `lineStart2` + 40), `headEnters` (= `lineStart3`), `askAt` (= `lineStart4`), `answerAt` (= `lineStart5`), `smileAt` (= `lineStart6`), `walkAt` (= `lineStart6` + 60), `eyesAt` (= `lineStart7`), `shirtAt` (= `lineStart8`), `patternAt` (= `lineStart9`), `fearAt` (= `lineStart10`), `noMirrorAt` (= `lineStart11`), `bellAt` (= `lineStart12`), `turnAt` (= `lineStart13`), `questionAt` (= `lineStart14`).

- [ ] **Step 1:** copy `scripts/bts5/verify.mjs` and `subtitle-check.mjs` to `blind1` with paths changed; cue order `eyeOpenAt < stickAt < headEnters < askAt < answerAt < smileAt < walkAt < eyesAt < shirtAt < patternAt < fearAt < noMirrorAt < bellAt < turnAt < questionAt`; total 80 to 100 s; story end at most 96 s; 15 shots. Run verify. Expected: FAIL (manifest missing).
- [ ] **Step 2:** write the 15 lines; `node scripts/blind1/subtitle-check.mjs`. Expected: `OK`.
- [ ] **Step 3:** `GEMINI_TTS_STYLE="<cold style>" TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview python scripts/tts_gemini.py --script scripts/blind1/part1.narration.json --out-dir public/blind1 --voice Charon --speed 1.1 --post-speed 1.245`; record the exact command in `voice.txt`. Expected: 15 files.
- [ ] **Step 4:** write `manifest.mjs` from `scripts/bts5/manifest.mjs` (constants `LEAD 6`, `TAIL 8`, `HOOK_LEAD 21`, outro 135 frames) with the cues; run it and verify. Expected: `OK`.
- [ ] **Step 5:** commit.

### Task 2: Cast and scenery

**Files:** Modify `src/bts/cast.ts` (new optional fields and ids), `src/bts/Passenger.tsx` (optional `blind` look, `snake shirt` pattern, `stick` item); create `src/blind1/Village.tsx` (scenery), `src/blind1/Faces.tsx` (face-on close-ups), `src/blind1/Tile.tsx` (the pattern tile).

**Interfaces:** `PassengerId` gains `"bvYou" | "bvHead" | "bvCook" | "bvChild" | "bvMan" | "bvWoman" | "bvElder"`; `PassengerData` gains optional `blind?: boolean` (clouded white eyes, no pupils) and accessories gain `"snakeShirt"` (the tile drawn on the torso); `Passenger` `item` gains `"stick"`. `Tile: React.FC<{ size: number }>`: a snake body in a gentle S ending in a round human head with a blank calm face. `Village: React.FC<{ scroll: number; dusk: number }>` (huts, well, long table, trees, fog, ground; `dusk` 0..1 warms and darkens the grade). `Faces`: `EyeOpen`, `FaceHead`, `FaceYou`, `PatternCard` (each `{ g: number; from: number; to: number }` plus props).

- [ ] **Step 1:** `npx tsc -p . --noEmit` after adding a temporary use of `id="bvHead"` in `src/bts/CastPreview.tsx`. Expected: type error.
- [ ] **Step 2:** implement the rig additions and the scenery files.
- [ ] **Step 3:** `npx tsc -p . --noEmit`; stills of `BtsCastPreview` (revert the temporary use) and of `Bts1` to `Bts5` must look as before.
- [ ] **Step 4:** commit.

### Task 3: Composition

**Files:** Create `src/blind1/Part1.tsx`; modify `src/Root.tsx` (register `Blind1`).

| Cue range | Picture |
|---|---|
| 0 to `hookCut` | the waking: extreme close-up of a closed eye, pupils moving under the lid; at `eyeOpenAt` the eye opens (the only pupil in the series); the hut interior (woven mat, light through the door); "you" sit up; title card after line 0 |
| `stickAt` to `headEnters` | a stick taps on the floor outside; the head's shape in the doorway |
| `headEnters` to `answerAt` | the head (clouded eyes, stick, pattern shirt); card "มีคนมาที่นี่อีกแล้วหรอ"; card "คุณตาบอดใช่ไหม"; face-on close-up of "you": the eyes stay still: "ใช่" |
| `smileAt` | the head's smile a half-second too long (`FaceHead`) |
| `walkAt` to `patternAt` | the village walk (side-scrolling): huts, a well, a long table, hanging herbs; villagers with clouded eyes walk surely; the same pattern shirt on everyone; a pattern cup |
| `patternAt` | close-up card of the pattern tile |
| `fearAt` to `noMirrorAt` | "you" walk slowly, stiff; no mirror, a covered bowl; villagers call "คนใหม่" (text) |
| `bellAt` | dusk grade; the bell rings once |
| `turnAt` | every villager turns toward the forest at once and says "ยินดีต้อนรับ" (text); only "you" look at them |
| `questionAt` to outro | slow push-in on the line of trees; the pattern on a shirt seems to look at "you"; the question |
| outro | "ตอนต่อไป: คนที่มองเห็น..." then "ติดตามตอนที่ 2" |

- [ ] **Step 1:** `npx remotion still src/index.ts Blind1 out/bl_check.png --frame=100`. Expected: fails (not registered).
- [ ] **Step 2:** implement `Part1.tsx` (cameras with `makeCamera`, cross-fades between scenes), register `Blind1`.
- [ ] **Step 3:** `node scripts/blind1/subtitle-check.mjs && npx tsc -p . --noEmit`; stills at about 25 frames across all ranges. Expected: the Review Focus items hold.
- [ ] **Step 4:** commit.

### Task 4: Sound bed, render, notes

**Files:** Create `scripts/blind1/bed.py`; output `public/blind1/bed.wav`, `out/blind_part1.mp4`.

- [ ] **Step 1:** `bed.py` (numpy): forest ambience (crickets, wind, far birds) throughout; a low soft drone that grows toward the bell; a slow heartbeat under the fear lines; stick taps from `stickAt` (taps keep a steady rhythm); footsteps on dirt during the walk; one bell strike at `bellAt` with a long tail; a sudden pause in all ambience at `turnAt` (the deliberate beat) and then the villagers' murmured "ยินดีต้อนรับ" as a low unison tone; a slow riser into the question; outro sting; swishes at line changes; ducking 0.55.
- [ ] **Step 2:** `python scripts/blind1/bed.py && node scripts/blind1/verify.mjs`. Expected: peak at most -3 dBFS; `OK`.
- [ ] **Step 3:** render `npx remotion render src/index.ts Blind1 out/blind_part1.mp4 --codec=h264`; check size, duration 80 to 100 s, -20 to -14 LUFS.
- [ ] **Step 4:** final Opus review, one fix pass, update `feedback-log.md`, add `series-animation/references/series-bible-blind-village.md`, commit and push to `main`.
