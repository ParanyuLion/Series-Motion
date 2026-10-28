# "1 ดาว" Part 3 (finale) "ป้าอร" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build, render and ship the finale of "1 ดาว": a Thai-narrated, code-drawn 9:16 of about 1:55 in the Part 1/2 night-blue look, with the quality bar the user set on 2026-10-28 (fewer, richer, longer angles; no flat filler; no ghosted cross-fades).

**Architecture:** Same pipeline as Part 2: narration JSON → Gemini TTS (Vertex, Charon) → `manifest.mjs` cues → one composition `OneStar3` in `src/onestar3/` that reuses `src/onestar1/` and `src/onestar2/` pieces. New: a `Set` layer pattern (each set is one fully drawn world: platform, house interior, rating close world) and a `Dip` transition (the old angle falls to near-black over 8 frames, the new rises over 8; no two busy pictures overlap). Within a set, angles are slow camera moves (`makeCamera`-style pans and pushes) rather than cuts.

**Tech Stack:** Remotion 4, React/TS SVG, 1080x1920 at 30 fps, Python (numpy/scipy) for the bed, Node scripts, ffprobe/ffmpeg.

**Spec:** `docs/superpowers/specs/rating-series-part3-script-draft.md` (the approved 22 lines, countdown rule, twists, picture plan) and `docs/superpowers/specs/2026-10-26-one-star-series-design.md`.

## Global Constraints

- Narration exactly the 22 approved lines in `scripts/onestar3/part3.narration.json` (verbatim); each at most 56 Thai characters without spaces; lines 0 and 1 stand alone.
- Voice: `--voice Charon --speed 1.1 --post-speed 1.245`, env `TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview GOOGLE_CLOUD_LOCATION=global`, cold style from `scripts/onestar1/voice.txt`; never print keys; never read `.env`.
- Timing only from `src/onestar3/manifest.json`; total 80 to 125 s, story end at most 118 s.
- Safe area: subtitles Prompt 500 size 52, left 60 / right 160 / bottom 340, at most 2 lines; figures above y 1414; cards inside x 140 to 890.
- QUALITY (user, 2026-10-28): each angle holds 4 to 6 s with a slow move; every angle, close-ups included, is in a full set (buildings or walls, sky or ceiling, ground, props, depth layers, light and rim); no flat bust on an empty backdrop; no cross-fade that stacks two busy pictures; a still of every angle and every transition frame is read before the render.
- Look as Part 1/2 (`PAL`, `#os-rim`, rain at gain 0.4, app yellow `#f2c230`, HUD top-left). The driver is never shown. Countdown HUD: shows "ถึงแล้ว"-to-25 rise at line 4, then 25, 15, 8, 3; from line 19 the HUD is gone from the user's screen and the number shows on the aunt's phone.
- Finale card: "จบ" / "ขอบคุณที่ติดตาม"; no "ตอนต่อไป".
- Commit and push to `main` after each task with the session's attribution line.

## Review Focus

1. No frame of any transition shows two busy pictures stacked (check the dip frames and the first and last frame of every angle).
2. Every close-up (the aunt, the user, hands, phones) stands in a detailed set, and none is a flat shape on bokeh.
3. The countdown never rises after line 4; the number leaves the user's HUD at line 19 and appears on the aunt's phone.
4. The two chimes: the aunt's pocket glows and sounds before the user's phone, at line 12.
5. The user's thumb really presses one star on the aunt's phone before the number moves; the driver is never shown.

---

### Task 1: Narration, voice, manifest, verify

**Files:**
- Create: `Remotion/scripts/onestar3/part3.narration.json`, `voice.txt`, `gen_voice.sh`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`; outputs `Remotion/public/onestar3/n0..n21.mp3`, `Remotion/src/onestar3/manifest.json`

**Interfaces:**
- Produces: manifest `fps, total, storyEnd, outroStart, shots, starts, cues`; cues (each the `lineStart` of the 0-based line): `titleAt, trainAt (2), riseAt (3), benchAt (5), nameAt (6), loopholeAt (8), houseAt (9), teaAt (10), chimeAt (11), pinAt (12), starAt (13), sorryAt (14), lockAt (15), threeAt (16), keyAt (17), pressAt (18), moveAt (19), exitAt (20), guiltAt (21), hookCut`, plus `lineStart0..21`, `lineEnd0..21`.

- [ ] **Step 1: Failing verify**: copy `scripts/onestar2/verify.mjs` for 22 shots, total 80 to 125 s, story end at most 118 s, cue order above. Run `node scripts/onestar3/verify.mjs`. Expected: FAIL (manifest missing).
- [ ] **Step 2: Narration JSON** (22 lines verbatim from the script draft) and `subtitle-check.mjs` (at most 56 characters without spaces). Expected: all pass.
- [ ] **Step 3: Generate the voice** with `gen_voice.sh` (copy of onestar2 with paths changed) in the background; wait with an until-loop on the log. Expected: 22 mp3.
- [ ] **Step 4: `manifest.mjs`** (same constants as onestar2) then `node scripts/onestar3/verify.mjs`. Expected: `OK`. If story end exceeds 118 s, cut line 10 (index 10, the tea line) first and record a Ruling.
- [ ] **Step 5: Commit and push.**

### Task 2: Sets and transitions (the quality foundation)

**Files:**
- Create: `Remotion/src/onestar3/Sets.tsx`, `Dip.tsx`, `util.tsx`

**Interfaces:**
- Produces: `Platform3` (the last station: rails, a roof with lights, a bench, a flower stall with buckets, far lit windows, wet ground with reflections, rain, bokeh), `House` (low lamp, shelves, buckets of dead flowers, a table with a steaming cup, curtains with a window, a door with a lock, damp stains on the wall; light from the lamp as a warm pool, blue spill from the window), each as `React.FC<{ g: number; from: number; to: number; cam: Cam; children?: React.ReactNode }>` drawing the world only; `Cam = { x: number; y: number; z: number; rot?: number }` and `camMove(g, from, to, a: Cam, b: Cam): Cam` (smooth ease); `dipOpacity(g, from, to, dip = 8): number` (0 to 1 to 0 with dip frames each side); `Aunt` actor props `pose: "sit" | "stand" | "hold" | "sleep"` using the `osFlower` rig, pale skin and cold rim.
- Consumes: `src/onestar1/Look.tsx`, `Scenery.tsx`, `Phone.tsx`, `src/onestar2/util.tsx` (`clamp01, ramp, smooth, rnd, Rain`).

- [ ] **Step 1: Write a still-test composition entry `OneStar3Still` listing each set with three camera positions.** Render stills; read them. Expected: every set looks as rich as the Part 1 doorstep scene; if any looks empty, add detail before going on.
- [ ] **Step 2: Implement `dipOpacity` test as a node script** (`scripts/onestar3/dip.test.mjs`): at the midpoint of a boundary opacity is at most 0.15 for both neighbours; between boundaries it is 1. Run, watch fail, implement, pass.
- [ ] **Step 3: Commit and push.**

### Task 3: Angles for the station (lines 0 to 8)

**Files:**
- Create: `Remotion/src/onestar3/Angles3.tsx` (station part)

**Interfaces:**
- Produces: `Carriage` (the empty carriage, you seated alone, window with the platform sliding in and the rain; held 5 s, a slow push), `PhoneRise` (the phone in your hand in the carriage; text "ถึงแล้ว" becomes "ถึงใน 25 นาที"; the HUD number is the same as the phone's), `PlatformWide` (the platform wide, a slow tracking pan to the bench with the aunt already sitting there), `AuntFace` (a front close-up of the aunt in the station's set, sodium-yellow light from the stall on one side and blue from the platform on the other, her breath in the cold, the rain behind her, NOT a flat bust), `TwoShot` (you and the aunt on the bench from behind, the lane lights ahead).
- Hook: lines 0 and 1 over the `Carriage` (rain at the window and the ghost of her face reflected in the glass).

- [ ] **Step 1: Write each angle; render stills at 25 %, 50 % and 90 % of its span.** Read them all. Expected: no empty backdrop; faces have depth layers.
- [ ] **Step 2: Fix any angle that fails the quality constraint** before moving on.
- [ ] **Step 3: Commit and push.**

### Task 4: Angles for the house and the reveal (lines 9 to 17)

**Files:**
- Modify: `Remotion/src/onestar3/Angles3.tsx`

**Interfaces:**
- Produces: `HouseWide` (the door opens on the house; a slow push through the dead flowers), `TeaHands` (the cup, steam, her cold pale hand on yours), `PocketChime` (the aunt's apron pocket glows and the chime ring appears, THEN your phone lights; the order and the gap of 18 frames), `PinReveal` (her phone screen, a map with a yellow pin on the bench, text "ดาวของคุณ ยังอยู่"), `LockKey` (the key turns, goes into her pocket), `ThreeMin` (the HUD at 3 and her closed eyes in lamp light, her phone on her lap with the rating screen open).

- [ ] **Step 1: Write each angle; read stills at 25 %, 50 % and 90 % of its span and at every dip boundary.** Expected: as Task 3.
- [ ] **Step 2: Commit and push.**

### Task 5: The ending angles and finale (lines 18 to 21)

**Files:**
- Modify: `Remotion/src/onestar3/Angles3.tsx`; create `Remotion/src/onestar3/Part3.tsx`, register `OneStar3` in `Remotion/src/Root.tsx`

**Interfaces:**
- Produces: `StarPress` (your hand on her phone, the five stars, the thumb on one star, the typed "ไม่ควรขับรถ" in her name), `NumberMoves` (your HUD number drops out to nothing and the number appears on her screen as 3 and falls; her face calm), `Exit` (you walk out through the door the lock popped; the lane and a glow of headlights behind you on the wet ground, you do not look back), `FiveStars` (your hand over the five empty stars on your own phone, the rain, the last line); `Part3: React.FC` with the dip transitions, subtitles, title card (with "ตอนจบ"), finale card, `PART3_TOTAL`.

- [ ] **Step 1: Write the angles and `Part3.tsx`**; add `countdown(g)`: null before riseAt; 25 at riseAt; 15 at houseAt+60; 8 at chimeAt; 3 at lockAt; null from pressAt+40 for the user's HUD. Run `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 2: Render stills** at every angle's start, middle and end and at the middle of every dip (about 40 stills at scale 0.5); read all of them. Expected: no ghosted frames, no empty set. Fix and re-render any failing frame.
- [ ] **Step 3: Commit and push.**

### Task 6: Sound bed

**Files:**
- Create: `Remotion/scripts/onestar3/bed.py`; output `Remotion/public/onestar3/bed.wav`

**Interfaces:**
- Produces: a bed as in Part 2 (rain 0.4, ducked 0.55, peak −5.2 dBFS) with: the chime that slows; a low drone under the house; the aunt's chime then yours at chimeAt; the lock click at lockAt; a rising swell at pressAt; the number's blip leaving your HUD at moveAt; a clear exhale and then only rain at guiltAt.

- [ ] **Step 1: Write and run `bed.py` in the background** (about 5 min); wait with an until-loop. Expected: length = manifest total.
- [ ] **Step 2: Commit and push.**

### Task 7: Render, check, final review, ship

**Files:**
- Output `Remotion/out/onestar_part3.mp4`, `finished/3-1ดาว/ตอน3.mp4`; notes in `series-animation/references/series-bible-one-star.md` and `feedback-log.md`

- [ ] **Step 1: Free C: space (delete `%TEMP%\remotion-webpack-bundle-*`), render in the background**; wait with an until-loop. Expected: 1080x1920, total frames equal the manifest, loudness about −18.8 LUFS.
- [ ] **Step 2: Contact sheet of the whole video** (one frame per 2 s) and a second sheet at every dip; read both.
- [ ] **Step 3: Final Opus review (Agent)** of the branch with the Review Focus above; one fix pass for Critical and Important; defer Minor to the ledger.
- [ ] **Step 4: Re-render if fixed, copy to `finished/`, update the notes (the series is complete after 3 parts), commit and push.**
- [ ] **Step 5: Write the Part 3 captions in chat** (Instagram and TikTok, final-episode wording, no product, no "ตอนต่อไป").
