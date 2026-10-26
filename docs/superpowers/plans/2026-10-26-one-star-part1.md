# "1 ดาว" Part 1 "คะแนนที่คุณให้" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user's habit is native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build, render and ship Part 1 of the new series: a Thai-narrated, code-drawn 9:16 chase thriller of about 1:30 in a new "night-blue silhouette with rim light" look.

**Architecture:** Same pipeline as Blind Village Part 4: narration JSON → Gemini TTS (Vertex, Charon) → `manifest.mjs` writes cue frames → one Remotion composition `OneStar1` whose stages are driven only by manifest cues, with `makeCamera` cameras, 10-frame cross-fades, subtitles, a synthesized sound bed (`bed.py`) and a verify script. New code lives in `src/onestar1/` and `scripts/onestar1/`; nothing in earlier series is modified.

**Tech Stack:** Remotion 4, React/TS SVG (1080x1920, 30 fps), Python (numpy/scipy) for the bed, Node scripts, ffprobe/ffmpeg.

**Spec:** `docs/superpowers/specs/2026-10-26-one-star-series-design.md` (design, rule, look reference) and `docs/superpowers/specs/rating-series-part1-script-draft.md` (the approved 17-line script, the picture plan).

## Global Constraints

- Narration exactly the 17 approved lines in `scripts/onestar1/part1.narration.json` (copy verbatim from the script draft); Thai only; each line at most 56 Thai characters without spaces; the hook (lines 0 and 1) stands alone.
- Voice: `--voice Charon --speed 1.1 --post-speed 1.245`, env `TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview GOOGLE_CLOUD_LOCATION=global` and the cold `GEMINI_TTS_STYLE` from `scripts/blind4/voice.txt`; never import `tts_gemini.py`; never print the key.
- Timing only from `src/onestar1/manifest.json` (written by `manifest.mjs`); no hard-coded frame numbers in the composition.
- Gaps between lines at most about 0.5 s (LEAD 6, TAIL 6); the title card after line 1; finale card with the teaser "ตอนต่อไป: ห้ามขึ้นรถคันนี้".
- Safe area: subtitles Prompt 500 size 52, left 60, right 160, bottom 340, at most 2 lines; figures above y 1414; cards inside x 140 to 890; no hard cuts (10-frame cross-fades); every object a line names is in frame at that line.
- Look: near-black blue night (`#05070f` to `#0b1220`), characters as flat dark silhouettes with a thin pale rim-light outline (`#9fb4d6`), one strong light with a soft volumetric beam and dust specks, blurred bokeh street lights and rain, one accent colour (app yellow `#f2c230`), a small flat HUD in the top-left corner; vignette and grain. The app is a made-up app, no real brand. Never copy the reference reel's characters.
- The unseen stays unseen: no face is shown except the driver's two pale eyes in the rear-view mirror; no gore; the car and its lights are the threat.
- Commit and push to `main` after each task; commit messages end with the attribution line the session gives.

## Review Focus

1. A viewer who never saw anything else understands who "you" are, what the 1 star did and what the countdown means (hook, title card, HUD).
2. The countdown on screen matches the narrated numbers at lines 9, 11, 13 (12, 5, 1) and never goes backwards.
3. The circling is visible as the same alley sign three times, not only told.
4. The silhouettes still read at phone size on a bright screen (rim light not lost to grain or the vignette).
5. The last beat (the car fills the alley, the lock pops up) is in frame while line 16 is spoken and holds without a cut.

---

### Task 1: Look kit and one style test still (gate: the user approves the look)

**Files:**
- Create: `Remotion/src/onestar1/Look.tsx`, `Remotion/src/onestar1/StyleStill.tsx`
- Modify: `Remotion/src/Root.tsx` (register still `OneStarStyle`, 1080x1920, 1 frame)

**Interfaces:**
- Produces (all in `Look.tsx`): `NightBackdrop: React.FC<{ g: number; tint?: string }>` (gradient + far bokeh lights + rain streaks); `Beam: React.FC<{ x: number; y: number; angle: number; length: number; op?: number }>` (soft volumetric cone with dust specks); `Rim: React.FC<{ children: React.ReactNode; color?: string; width?: number }>` (wraps a dark silhouette group and adds a pale outline via stroke); `Figure: React.FC<{ x: number; y: number; scale: number; facing: 1 | -1; pose: "stand" | "run" | "sit"; g: number; op?: number }>` (a flat silhouette person, run cycle by `g`); `Hud: React.FC<{ lines: string[]; accent?: boolean }>` (top-left, Prompt font, small); `Grade: React.FC<{ children: React.ReactNode }>` (CSS grade, vignette, grain).
- Constants: `PAL = { bg0: "#05070f", bg1: "#0b1220", rim: "#9fb4d6", beam: "#cfe0ff", accent: "#f2c230" }`.

- [ ] **Step 1: Write `Look.tsx`** with the exports above, silhouettes `#04060b` with a 3 px `PAL.rim` stroke at 0.7 opacity.
- [ ] **Step 2: Write `StyleStill.tsx`**: a rainy alley at night, a silhouette "you" running left to right, a car's headlights behind as two beams with dust, blurred yellow and cyan bokeh, HUD "ถึงใน 5 นาที" with a small car icon at top-left, one subtitle line in the standard style.
- [ ] **Step 3: Register `OneStarStyle`** in `Root.tsx`; run `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 4: Render** `npx remotion still OneStarStyle out/onestar_style.png`; read the image and judge: rim readable, beam soft, bokeh not noisy, HUD legible. Fix and re-render until it reads.
- [ ] **Step 5: Commit and push**, then STOP and show the still to the user. Do not start Task 2 until the user says the look is right (a user decision, not a stall).

### Task 2: Narration, voice, manifest, verify

**Files:**
- Create: `Remotion/scripts/onestar1/part1.narration.json`, `voice.txt`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`; output `Remotion/public/onestar1/n0..n16.mp3`, `Remotion/src/onestar1/manifest.json`

**Interfaces:**
- Produces: manifest with `fps, total, storyEnd, outroStart, shots, starts, cues`; cues in this order (each is `lineStart` of the named line index): `titleAt` (after line 1 + 4), `bookAt` (2), `pickupAt` (3), `smellAt` (4), `circleAt` (5), `arriveAt` (6), `rateAt` (7), `buzzAt` (8), `thanksAt` (9), `laughAt` (10), `againAt` (11), `lightsAt` (12), `runAt` (13), `followAt` (14), `deadEndAt` (15), `unlockAt` (16), plus `hookCut` (start of line 2), `lineStart0..16`, `lineEnd0..16`.

- [ ] **Step 1: Write the failing verify**: `verify.mjs` copied from `scripts/blind4/verify.mjs` with 17 shots, total 70 to 125 s, story end at most 118 s, the cue order above, the bed length check. Run `node scripts/onestar1/verify.mjs`. Expected: FAIL (manifest missing).
- [ ] **Step 2: Write the narration JSON** (the 17 lines verbatim) and `subtitle-check.mjs` (copy from blind4: at most 56 characters without spaces per line). Run it. Expected: all lines pass.
- [ ] **Step 3: Generate the voice** in the background (command in `scripts/blind4/voice.txt`, paths changed to onestar1); about 17 requests. Expected: 17 mp3 files.
- [ ] **Step 4: Write `manifest.mjs`** (copy from blind4: HOOK_LEAD 21, LEAD 6, TAIL 6, HOOK_GAP 6, TITLE_HOLD 42, OUTRO_FRAMES 130; cues as above) and run it.
- [ ] **Step 5: Run verify.** Expected: `OK: <80..110> s total`. If story end exceeds 118 s, raise `--post-speed` and regenerate.
- [ ] **Step 6: Commit and push.**

### Task 3: Phone UI cards

**Files:**
- Create: `Remotion/src/onestar1/Phone.tsx`

**Interfaces:**
- Consumes: `Look.tsx` (`PAL`, `Rim`), manifest cues.
- Produces (each takes `g` and its own `from`/`to` frames, safe-area inside x 140 to 890): `BookCard` (rain-streaked booking screen, a car icon approaching, "ถึงใน 10 นาที"), `RateCard` (five stars, one filled, the typed text "ไม่ควรขับรถ" appearing letter by letter, send), `MessageCard` (notification "ขอบคุณสำหรับดาวนะครับ" with the countdown number as a prop `minutes: number`), `MapCard` (dark map, a car dot approaching the house pin); `Countdown: React.FC<{ minutes: number }>` used by the HUD.

- [ ] **Step 1: Write the four cards and `Countdown`.** Draw only with SVG; Thai text in Prompt; the app is generic (a yellow car glyph, no brand).
- [ ] **Step 2: Render stills** at one frame per card via a temporary `PhoneStill` composition (delete after); read them; check the countdown digits are large and inside the safe area.
- [ ] **Step 3: `npx tsc --noEmit`, commit and push.**

### Task 4: The ride scenes (car cutaway, mirror, circling)

**Files:**
- Create: `Remotion/src/onestar1/Ride.tsx`

**Interfaces:**
- Consumes: `Look.tsx`.
- Produces: `RideScene: React.FC<{ g: number; from: number; circleAt: number; arriveAt: number; to: number }>`: night street seen side-on, the car cutaway with the silhouette driver (older, pale eyes only visible in the rear-view mirror, the eyes turn to "you" at `circleAt`) and "you" in the back seat, wet window with bokeh, a shop sign "ร้านป้าแดง" passing at three set times between `circleAt` and `arriveAt` (a visible counter dot 1, 2, 3 on the sign), a damp-shine on the seat, wipers; `DoorStep: React.FC<{ g: number; from: number; to: number }>` (you step out at your building in the rain).

- [ ] **Step 1: Write both pieces.** The sign passes at `circleAt + 0`, `+ (arriveAt - circleAt) / 3`, `+ 2 * (arriveAt - circleAt) / 3`.
- [ ] **Step 2: Render stills** at `pickupAt`, the middle of `circleAt..arriveAt`, `arriveAt`; check the driver's face is NOT visible except two eyes in the mirror, and the sign reads each time.
- [ ] **Step 3: Commit and push.**

### Task 5: Home, the chase and the dead end

**Files:**
- Create: `Remotion/src/onestar1/Chase.tsx`

**Interfaces:**
- Consumes: `Look.tsx` (`Beam`, `Figure`, `Rim`), manifest cues.
- Produces: `HomeScene: React.FC<{ g: number; from: number; lightsAt: number; runAt: number; to: number }>` (the room, rim-lit window, headlights sliding across the wall at `lightsAt`, "you" at the window, then grabbing the bag), `AlleyChase: React.FC<{ g: number; from: number; followAt: number; deadEndAt: number; unlockAt: number; to: number }>` (back door and alley, "you" running as a silhouette, two headlight beams behind at constant speed and constant distance, the dead-end wall, the car fills the frame at `deadEndAt`, a yellow lock icon pops up at `unlockAt` with the click sound cue).

- [ ] **Step 1: Write both scenes.** The car follows slowly and keeps the same gap while "you" run; only at `deadEndAt` does it close in.
- [ ] **Step 2: Render stills** at `lightsAt`, `followAt`, `deadEndAt`, `unlockAt`; check the beam is soft, the silhouette reads and the car is in frame at `unlockAt`.
- [ ] **Step 3: Commit and push.**

### Task 6: Composition, subtitles, title and finale, Root

**Files:**
- Create: `Remotion/src/onestar1/Part1.tsx`
- Modify: `Remotion/src/Root.tsx` (register `OneStar1`, `durationInFrames = manifest.total`)

**Interfaces:**
- Consumes: all of the above, `makeCamera` from `../bts4/camera`, `fontFamily` from `../island/fonts`.
- Produces: `Part1: React.FC` with the stages BOOK, RIDE, DOOR, PHONE (rate, message, countdown), HOME, CHASE (all from manifest cues, cross-fades of 10 frames), the HUD showing the countdown at `thanksAt` onwards (12, then 5, then 1; the value is a pure function of `g` and the cues), subtitles as in blind4 (Prompt 500, 52 px, safe area), title card "1 ดาว" / "ตอนที่ 1: คะแนนที่คุณให้" at `titleAt`, finale card with "ตอนต่อไป: ห้ามขึ้นรถคันนี้", `<Audio>` per shot, `<Audio src="onestar1/bed.wav" volume={0.5}>`.

- [ ] **Step 1: Write `Part1.tsx`** and register it; `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 2: Render stills** at every `lineStart` (17 frames) via a loop `npx remotion still OneStar1 out/os1_<n>.png --frame=<f>`; read each; check: no empty frame, every named object is present (the app screen at 7 to 11, the headlights at 12, the car at 15), subtitles inside the band.
- [ ] **Step 3: Commit and push.**

### Task 7: Sound bed and checks

**Files:**
- Create: `Remotion/scripts/onestar1/bed.py` (write helper files into `Remotion/out/`, never `/tmp`); output `Remotion/public/onestar1/bed.wav`

**Interfaces:**
- Consumes: the manifest (line starts and the cue frames).
- Produces: a stereo bed of the manifest's length: rain, low engine idle that rises at `followAt`, the app chime that gets slower at each of `thanksAt`, `againAt`, `runAt`, a riser into `unlockAt` and a short click at `unlockAt`, ducking 0.55 under speech, peak at most −3 dBFS.

- [ ] **Step 1: Write and run `bed.py` in the background** (about 5 minutes); then `node scripts/onestar1/verify.mjs`. Expected: OK with the bed length matching.
- [ ] **Step 2: Measure loudness** `ffmpeg -i out/onestar_part1.mp4 -af ebur128 -f null -`. Expected: −20 to −14 LUFS.
- [ ] **Step 3: Commit and push.**

### Task 8: Review, fix pass, render, notes, hand-over

- [ ] **Step 1: Render** `npx remotion render OneStar1 out/onestar_part1.mp4` in the background (about 10 to 15 minutes).
- [ ] **Step 2: Final review**: dispatch one Opus reviewer on the whole branch with this plan's Review Focus verbatim and the stills; fix Critical and Important in ONE pass (each with a before-and-after still), re-render.
- [ ] **Step 3: Notes**: add the build to `series-animation/references/feedback-log.md`, a new `series-bible-one-star.md`, the series list in `SKILL.md`.
- [ ] **Step 4: Copy** to `finished/3-1ดาว/ตอน1.mp4`, commit and push, then hand over: the path, length, loudness, what could not be checked (not watched, not heard), the captions (Instagram about 9 hashtags; TikTok 5: "#สยองขวัญ #เรื่องลี้ลับ #เอาชีวิตรอด #fyp #aianimation"), and the next question.
