# Blind Village Series, Part 4 (finale) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `out/blind_part4.mp4`, Part 4 ("ทางกลับบ้าน", the finale) of "หมู่บ้านที่ทุกคนตาบอด", from the approved 20-line script, about 1:55 and never over 125 s.

**Architecture:** Composition `Blind4` in `src/blind4/` and `scripts/blind4/`, copied in structure from `Blind3` (manifest-driven cues from the narration audio lengths, `makeCamera`, `Passenger` rig, 10-frame cross-fades, the grey grade, vignette and grain). New: the forest edge with the head waiting, a dark road with headlights, the home room at dawn, a longer memory flash with pale kind faces, the mirror scene (cloth pulled, pattern with your face, eye with a narrowing pupil), the name call, the bell at home, the change (shirt collapsing, dot trail), the village edge with two dim shapes among trees, the loop (a new sleeper wakes, the head takes human shape) and the last picture of "you" among masks in the trees. Reused: `Forest`, `Shoe`-free dawn forest, `CrowdLayer`, `LowerFace`-style masks from `src/blind3/`, `Village`, `HutInterior`, `FaceYou` (`noBlink`), `FaceHead`, `PatternCard`, `MaskHead`, `Flesh`, `Branch`, `Pose`.

**Tech Stack:** Remotion 4, React, TypeScript, SVG, Python 3.13 (numpy, scipy), TTS via the Vertex backend of `scripts/tts_gemini.py` (subprocess only), ffmpeg, node 22.

**Spec:** `docs/superpowers/specs/blind-village-part4-script-draft.md` (approved by the user on 2026-10-25: "อนุมัติ"), on `2026-10-23-blind-village-series-design.md` and `2026-10-23-blind-village-story-plan.md`. Rules: `series-animation/SKILL.md` and `references/`. Templates: `src/blind3/`, `scripts/blind3/`, `docs/superpowers/plans/2026-10-24-blind-village-part3.md`.

## Global Constraints

- 1080x1920, 30 fps, H.264 plus AAC; total 80 to 130 s; story ends by 123 s; the 20 narration lines verbatim from the draft (at most 56 Thai characters without spaces each). Voice **Charon**, model `gemini-3.1-flash-tts-preview`, Vertex backend, speed 1.1, post-speed 1.245, the cold style of `scripts/blind1/voice.txt`. Stop and tell the user on any key, auth or quota error. If the story runs past 123 s, tighten gaps first and tell the user; never cut the script.
- Lines 0 and 1 are the hook and carry the whole premise for a cold viewer; the title card shows "ตอนที่ 4 (ตอนจบ)", "ทางกลับบ้าน" and a small "หมู่บ้านที่ทุกคนตาบอด".
- Horror from the abnormal only: no ghosts, no jump scare, no gore. **The unseen stays unseen:** the change is shown only by the shirt collapsing, a dot trail, reflections and the eye; the snakes of the last scenes only as dim long shapes with pale masks among trunks; the memory shows pale faces in dark, no bodies. No blink on "you" from line 11 to the end; blind eyes never blink.
- Common Thai words only on cards and in narration.
- Quiet sound: forest ambience, low drones, car engine and headlights hum, the bell once (line 13), soft hiss in the memory, soft laughter at the very end; no loud stingers. Loudness -20 to -14 LUFS; bed `<Audio volume={0.5}>`, bed peak at most -3 dBFS.
- Safe area: subtitles Prompt 500 size 52, `left 60, right 160, bottom 340`, two lines; figures above screen y 1414; cards inside x 140 to 890; no hard cuts; every pose change cross-faded or squashed; each object a line names must be in frame at that line (the road and car at line 5, the mirror at line 9, the bell at line 13, the mat at line 17).
- Rig edits only as optional props or new exports (Bts 1 to 5, Blind1 to Blind3 must render unchanged). Never print or commit secrets. Commit after each task and push to `main`.
- Finale card: "จบแล้ว... แต่ยังมีคนใหม่มาเรื่อยๆ" then "ขอบคุณที่ดูจนจบ"; no "next part".

## Review Focus

- The hook for a cold viewer: lines 0 and 1 over a picture that shows a seeing "you" at a forest edge facing the village; the title card names the series and "ตอนที่ 4 (ตอนจบ)".
- The head stands exactly where "you" come out and turns clouded eyes to "you" at line 3; his two sentences (lines 4 and 16) are on screen with his face.
- The mirror is in frame at line 9, the pattern face at line 10, the eye close-up at line 11; the transformation never shows a body (shirt, trail, reflection only).
- The loop: the sleeper's waking shot matches Part 1's framing; the last picture shows "you" among masks, dim, with the seam smile.
- Words and pictures agree at line starts; no card before its words.
- Blind1 to Blind3 and Bts5 stills unchanged.

---

### Task 1: Narration and cues

**Files:** Create `scripts/blind4/part4.narration.json`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`, `voice.txt`; output `public/blind4/n0.mp3` to `n19.mp3`, `src/blind4/manifest.json`.

**Interfaces:** `manifest.json` as in Blind3. Cues (global frames): `hookCut` (= `starts[2]`), `titleAt` (= `lineEnd1` + 4), `edgeAt` (line 2), `smileAt` (3), `speakAt` (4), `roadAt` (5), `homeAt` (6), `memoryAt` (7), `chosenAt` (8), `mirrorAt` (9), `patternAt` (10), `pupilAt` (11), `nameAt` (12), `bellAt` (13), `changeAt` (14), `villageEdgeAt` (15), `confessAt` (16), `newAt` (17), `welcomeAt` (18), `lastAt` (19), plus `lineStart0..19`, `lineEnd0..19`.

- [ ] **Step 1:** copy `scripts/blind3/verify.mjs` and `subtitle-check.mjs` to `blind4` with paths changed; 20 shots; total 80 to 130 s; story end at most 123 s; cue order `titleAt < edgeAt < ... < lastAt`, `hookCut <= lineStart2`. Run verify. Expected: FAIL (manifest missing).
- [ ] **Step 2:** write the 20 lines of the draft verbatim to `part4.narration.json`; `node scripts/blind4/subtitle-check.mjs`. Expected: `OK`.
- [ ] **Step 3:** run `scripts/tts_gemini.py` as a subprocess with the Blind3 command (`--script scripts/blind4/part4.narration.json --out-dir public/blind4`); record in `voice.txt`. Expected: 20 files.
- [ ] **Step 4:** `manifest.mjs` from `scripts/blind3/manifest.mjs` with the cues above (title hold 42, `LEAD 6`, `TAIL 6`, finale outro 130 frames). Run it and verify. Expected: `OK`.
- [ ] **Step 5:** commit.

### Task 2: New pieces

**Files:** Create `src/blind4/Pieces.tsx`.

**Interfaces (all `React.FC`, `g` = global frame, `from`/`to` = frame range):**
- `RoadCard<{ g; from; to }>`: dark road, two headlights growing out of the dark, a car body as a dark shape stopping, a window shape; no person drawn.
- `HomeRoom<{ g; from; to }>`: the plain room at grey dawn (bed, window, table, a cloth-covered mirror on the wall).
- `MemoryFaces<{ g; from; to }>`: leaves sliding over warm light (as `LeavesFlash`), then dim pale kind faces looking down out of dark; no bodies.
- `MirrorCard<{ g; from; to; stage: 0|1|2 }>`: stage 0 cloth pulled down from the mirror; stage 1 the shirt pattern with "your" face in the snake pattern; stage 2 a large eye whose pupil narrows to a slit.
- `ChangeCard<{ g; from; to }>`: night room, window open, the shirt collapsing on the floor, a trail of dots leaving through the window; nothing else.
- `EdgeShapes<{ g; from; to; speaker: "head"|"you" }>`: two long dim shapes with pale masks between trunks, the speaker's mask tilts.
- `Sleeper<{ g; from; to }>`: face-on close-up of a new person on a woven mat, eyes opening with pupils (Part 1 waking framing).
- `LastTrees<{ g; from; to }>`: the trees at night with many pale masks and "you" among them with the seam smile; hold.

- [ ] **Step 1:** temporary import of `./blind4/Pieces` in `src/Root.tsx`; `npx tsc -p . --noEmit`. Expected: error (module missing).
- [ ] **Step 2:** implement the components; remove the temporary import.
- [ ] **Step 3:** `npx tsc -p . --noEmit`.
- [ ] **Step 4:** commit.

### Task 3: Composition

**Files:** Create `src/blind4/Part4.tsx`; modify `src/Root.tsx` (register `Blind4`).

| Cue range | Picture |
|---|---|
| 0 to `titleAt` | hook: "you" at the forest edge (dawn grey), the village behind in distance; title card `titleAt` to `hookCut` |
| `edgeAt` to `speakAt` | the head at the edge exactly in front of "you"; clouded eyes turn; `FaceHead` close-up with the gentle smile at `smileAt`; his line at `speakAt` |
| `roadAt` | "you" walk on, `RoadCard` with the car stopping; cross-fade to `HomeRoom` at `homeAt` |
| `memoryAt` to `chosenAt` | `MemoryFaces` |
| `mirrorAt` to `pupilAt` | `MirrorCard` stages 0, 1, 2 |
| `nameAt` | `FaceYou` turning a beat late, the window glass with a seam smile for a flash |
| `bellAt` | dusk at home, the head of "you" turns to the window by itself |
| `changeAt` | `ChangeCard` |
| `villageEdgeAt` to `confessAt` | the village at night, `EdgeShapes` with speaker switching to the head |
| `newAt` | `Sleeper` |
| `welcomeAt` | the head takes human shape (stick, shirt, clouded eyes) and walks to the mat |
| `lastAt` to outro | `LastTrees`; finale card |

**Interfaces:** consumes Task 1 cues and Task 2 components; `Part4: React.FC`, `PART4_TOTAL: number`.

- [ ] **Step 1:** `npx remotion still src/index.ts Blind4 out/b4_check.png --frame=100`. Expected: fails (not registered).
- [ ] **Step 2:** implement `Part4.tsx` (cameras with `makeCamera`, 10-frame cross-fades, subtitles in the safe area, title and finale cards), register `Blind4`.
- [ ] **Step 3:** `node scripts/blind4/subtitle-check.mjs && npx tsc -p . --noEmit`; stills across all ranges (about 30 frames, contact sheets). Expected: the Review Focus items hold.
- [ ] **Step 4:** commit.

### Task 4: Sound bed, render, review, notes

**Files:** Create `scripts/blind4/bed.py`; output `public/blind4/bed.wav`, `out/blind_part4.mp4`, `finished/2-หมู่บ้านที่ทุกคนตาบอด/ตอน4.mp4`.

- [ ] **Step 1:** `bed.py` from `scripts/blind3/bed.py`: dawn forest hush and one bird; car engine and tyre hiss on gravel at `roadAt`; room tone and a clock at `homeAt`; soft leaves and a gentle hiss at `memoryAt`; cloth slide at `mirrorAt`; a heartbeat from `pupilAt`; a muffled name call at `nameAt`; the bell once at `bellAt` with a long tail; a wet soft slide at `changeAt`; night insects at `villageEdgeAt`; mat rustle at `newAt`; stick taps at `welcomeAt`; soft low laughter and a held note at `lastAt`; swishes at line changes; ducking 0.55.
- [ ] **Step 2:** run `bed.py` in the background, then `node scripts/blind4/verify.mjs`. Expected: peak at most -3 dBFS; `OK`.
- [ ] **Step 3:** render `npx remotion render src/index.ts Blind4 out/blind_part4.mp4 --codec=h264` in the background; check size, 80 to 130 s, -20 to -14 LUFS; stills of Blind1 to Blind3 and Bts5 unchanged.
- [ ] **Step 4:** final Opus review of the whole branch (Agent tool, model opus), one fix pass, re-render, copy to `finished/`, update `series-animation/references/feedback-log.md` and `series-bible-blind-village.md`, commit and push to `main`; then write the Part 4 captions (TikTok uses the user's hashtag set).
