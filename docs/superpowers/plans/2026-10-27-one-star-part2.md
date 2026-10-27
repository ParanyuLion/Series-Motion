# "1 ดาว" Part 2 "ห้ามขึ้นรถคันนี้" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user's habit is native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build, render and ship Part 2 of "1 ดาว": a Thai-narrated, code-drawn 9:16 chase of about 1:50 in the same night-blue look as Part 1, with one 7-second AI-generated power bank insert (the affiliate) and a short second insert near the end.

**Architecture:** Same pipeline as Part 1: narration JSON → Gemini TTS (Vertex, Charon) → `manifest.mjs` cues → one composition `OneStar2` driven only by manifest cues, `makeCamera` cameras, 10-frame cross-fades, overlay angle gates, subtitles, a synthesized bed and a verify script. New scenes live in `src/onestar2/` and reuse `src/onestar1/` (`Look.tsx`, `Scenery.tsx`, `Phone.tsx`, `Angles.tsx`, `Ride.tsx` pieces) without changing them except by adding optional props. The two product clips are generated with Veo on Vertex (`veo-3.1-fast-generate-001`, 1080p, 8 s, image-to-video from the user's two product photos) by `scripts/onestar2/veo.py`, then played with `<OffthreadVideo>` under the night grade.

**Tech Stack:** Remotion 4, React/TS SVG, 1080x1920 at 30 fps, Python (numpy/scipy, urllib, gcloud ADC token) for the bed and Veo, Node scripts, ffprobe/ffmpeg.

**Spec:** `docs/superpowers/specs/2026-10-26-one-star-series-design.md` (rule, cast, look) and `docs/superpowers/specs/rating-series-part2-script-draft.md` (the approved 20 lines, affiliate beats, twists, picture plan).

## Global Constraints

- Narration exactly the 20 approved lines in `scripts/onestar2/part2.narration.json` (verbatim from the script draft); each line at most 56 Thai characters without spaces; the hook (lines 0 and 1) stands alone.
- Voice: `--voice Charon --speed 1.1 --post-speed 1.245`, env `TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview GOOGLE_CLOUD_LOCATION=global` and the cold style from `scripts/onestar1/voice.txt`; never print keys; never read `.env`.
- Timing only from `src/onestar2/manifest.json`; no hard-coded frame numbers in the composition. Total 70 to 125 s, story end at most 118 s.
- Safe area as Part 1: subtitles Prompt 500 size 52, left 60 / right 160 / bottom 340, at most 2 lines; figures above y 1414; cards inside x 140 to 890; no hard cuts (10-frame fades); a new camera angle every 2 to 3 seconds; every object a line names is in frame at that line.
- Look: as Part 1 (`PAL`, `#os-rim`, beams, bokeh, rain at gain 0.4, app yellow `#f2c230`, HUD top-left with the countdown on EVERY screen from line 5 on). The driver's face is never shown: from the platform he is a small dark shape with a raised hand.
- Product clips: 1080x1920, trimmed to the narrated span; graded to the night-blue look (darker, blue shift, vignette, grain, same 10-frame fades). The only product claims are the three in lines 7 and 8 (LED battery display, fast charge, charges anything on USB); no capacity number, no "120W", no durable/standard claims. The product is never tied to the driver or the danger. No advertising wording on screen (user's call 2026-10-27); the finale card shows the small line "ของในตอนนี้: พาวเวอร์แบงก์ · ลิงก์ในคอมเมนต์ปักหมุด".
- Commit and push to `main` after each task; commit messages end with the attribution line the session gives.

## Review Focus

1. The power bank insert reads as a story object: narration around it never praises the product beyond lines 7 and 8, and the cut in and out is not a visible break in tone or look.
2. The countdown on every screen (store screen 3, station board 2, HUD) matches narration at lines 9 and 11 and never goes up.
3. The AI clip is 1080x1920 and its text on the case (the "120W" print) is not garbled or, if it is, the shot is cropped so it does not read.
4. The cable-plug shot is drawn (not AI), the plug really goes into the port, and the dark phone lights up only after it.
5. The driver stays faceless in every new angle, and he does not board the train.

---

### Task 1: Narration, voice, manifest, verify

**Files:**
- Create: `Remotion/scripts/onestar2/part2.narration.json`, `voice.txt`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`; output `Remotion/public/onestar2/n0..n19.mp3`, `Remotion/src/onestar2/manifest.json`

**Interfaces:**
- Produces: manifest `fps, total, storyEnd, outroStart, shots, starts, cues`; cues (each the `lineStart` of the named line index, 0-based): `titleAt` (after line 1 + 4), `climbAt` (2), `fenceAt` (3), `storeAt` (4), `grabAt` (5), `prodAt` (6), `prodEnd` (`lineEnd` of 7), `screenAt` (8), `payAt` (9), `boardAt` (10), `thinkAt` (11), `lanyardAt` (12), `tearAt` (13), `flowerAt` (14), `tunnelAt` (15), `boardTrainAt` (16), `waveAt` (17), `plugAt` (18), `msgAt` (19), plus `hookCut`, `lineStart0..19`, `lineEnd0..19`.

- [ ] **Step 1: Write the failing verify**: copy `scripts/onestar1/verify.mjs` with 20 shots, total 70 to 125 s, story end at most 118 s, the cue order above, the `prodEnd - prodAt` span between 6.0 and 8.0 s, the bed length check. Run `node scripts/onestar2/verify.mjs`. Expected: FAIL (manifest missing).
- [ ] **Step 2: Write the narration JSON** (20 lines verbatim) and `subtitle-check.mjs` (at most 56 characters without spaces). Run it. Expected: all pass.
- [ ] **Step 3: Generate the voice** in the background with the command in `scripts/onestar2/voice.txt` (copy of onestar1 with paths changed); about 20 requests. Expected: 20 mp3.
- [ ] **Step 4: Write `manifest.mjs`** (same constants as onestar1) and run it, then `node scripts/onestar2/verify.mjs`. Expected: `OK: <90..120> s total`. If the span `prodEnd - prodAt` is outside 6 to 8 s, re-voice lines 7 and 8 only (`--reuse-from ... --redo`) with a changed pace, or trim the words; if story end exceeds 118 s, cut line 12 (index 11) first and record a Ruling.
- [ ] **Step 5: Commit and push.**

### Task 2: Product clips (Veo) and the Product component

**Files:**
- Create: `Remotion/scripts/onestar2/veo.py`, `Remotion/src/onestar2/Product.tsx`; inputs `Remotion/public/onestar2/ref/pb1.png`, `pb2.png` (the user's two photos; copy from the session images folder `...\images\5.png` and `6.png`); outputs `Remotion/public/onestar2/prodA.mp4`, `prodB.mp4`

**Interfaces:**
- Produces: `veo.py <ref image> <out mp4> "<prompt>"` (REST `predictLongRunning` on `veo-3.1-fast-generate-001`, `aspectRatio 9:16`, `durationSeconds 8`, `resolution 1080p`, `generateAudio false`; token from `gcloud auth application-default print-access-token`; polls `fetchPredictOperation`; prints only the output path); `ProductClip: React.FC<{ g: number; from: number; to: number; src: string; startFrom?: number }>` (an `<OffthreadVideo>` filling 1080x1920 with `object-fit: cover`, muted, graded with a night-blue CSS filter and `Grade`-style vignette and grain, 10-frame fade in and out, retimed with `playbackRate` so the playable span exactly fills `from..to`).

- [ ] **Step 1: Write the failing check**: `ffprobe` on `public/onestar2/prodA.mp4`. Expected: FAIL (file missing).
- [ ] **Step 2: Write `veo.py`** (adapt the working test script from this session's scratchpad `veo_test.py`; project from `gcloud config get-value project`).
- [ ] **Step 3: Generate A and B**: A = `pb2.png` (single unit), prompt "Cinematic night shot inside a convenience store, a white power bank standing on a shelf under cold fluorescent light, slow gentle camera push-in and a slight rotation to show the LED display and the ports, shallow depth of field, moody blue-green tones, dark shelves in the background, realistic product video, no text changes, no people"; B = `pb1.png` (two units, ports visible), prompt "Close-up of a white power bank in a dark train carriage at night, its small LED display glowing, slow camera drift, cold blue light, shallow depth of field, no text changes, no people". Run in the background; each takes about 1 to 3 minutes. Expected: two files, `ffprobe` shows 1080,1920 and 8.0 s.
- [ ] **Step 4: Check frames**: extract a contact sheet per clip (`ffmpeg ... tile`), read it; the first second of A may show the square photo being extended: record the safe `startFrom` (usually 24 to 30 frames) to skip it. If the "120W" print is garbled, regenerate once; if still bad, crop in `ProductClip` so it is out of frame and record a Ruling.
- [ ] **Step 5: Write `Product.tsx`**; `npx tsc --noEmit`. Expected: no errors. Commit and push.

### Task 3: Scenes (fence, store, station, train, phone)

**Files:**
- Create: `Remotion/src/onestar2/Scenes.tsx`; extend `Remotion/src/bts/cast.ts` with `osFlower` (older woman, flower basket, dark scarf)

**Interfaces:**
- Consumes: `Look.tsx` (`Actor`, `Beam`, `Car`, `Hud`), `Scenery.tsx`, `Phone.tsx` (`Countdown`), `Angles.tsx` (`YouFace`, `PhoneDesk`, `Silhouette`, `FeetClose`).
- Produces (all `React.FC<{ g: number; from: number; to: number; solid?: boolean; ... }>`): `FenceScene` (dead-end alley, fence, "you" climbs over; `ThroughFence` look back through the bars at slow headlights); `StoreScene` ({ grabAt, screenAt, payAt }: shop wide, the rack, a hand taking the power bank (SVG), small counter screen showing the countdown 3, register chime macro, back door); `StationScene` ({ boardAt, lanyardAt, tearAt, flowerAt, tunnelAt }: platform wide, board with the countdown 2, the lanyard falling to the track as a low angle, the flower seller's hand on the arm, the tunnel with headlights as a point of view); `TrainScene` ({ boardTrainAt, waveAt, plugAt, msgAt }: the door closing, the driver as a small dark shape on the platform with a slow raised hand, the cable going into the power bank, the indicator lights, the dark phone lighting up with the message "ผมไปรอที่บ้านคุณแล้วนะครับ"); `HudCountdown: React.FC<{ g: number; cues }>` returning minutes as a pure non-increasing function of `g` (screen 3 at `screenAt`, 2 at `boardAt`, 1 after `tunnelAt`, 0 at `msgAt`).

- [ ] **Step 1: Write the four scenes and `HudCountdown`.** Overlay angles follow Part 1's `win(from,to)` pattern with `solid` chains for any angle followed by another.
- [ ] **Step 2: Render stills** at the start of each angle via a temporary `Part2Still` composition (delete after); read them; check: no face on the driver, the plug enters the port, the lanyard shows name, workplace and a photo, the board number is large and inside the safe area.
- [ ] **Step 3: `npx tsc --noEmit`, commit and push.**

### Task 4: Composition, subtitles, title and finale, Root

**Files:**
- Create: `Remotion/src/onestar2/Part2.tsx`
- Modify: `Remotion/src/Root.tsx` (register `OneStar2`, `durationInFrames = manifest.total`)

**Interfaces:**
- Consumes: everything above, `makeCamera` from `../bts4/camera`, `fontFamily`.
- Produces: `Part2: React.FC` with stages FENCE, STORE, PRODUCT A (`ProductClip` over `prodAt..prodEnd`), STATION, TRAIN (`ProductClip` B inside the plug beat, 2 to 3 s, `plugAt..plugAt + 75`), PHONE; title card "1 ดาว · ตอนที่ 2" / "ห้ามขึ้นรถคันนี้" at `titleAt`; finale card "ตอนต่อไป: คนที่ช่วยคุณ" with the small line "ของในตอนนี้: พาวเวอร์แบงก์ · ลิงก์ในคอมเมนต์ปักหมุด"; subtitles as Part 1 (word-joiner in "คนขับ"); `<Audio>` per shot and `bed.wav` at volume 0.5.

- [ ] **Step 1: Write `Part2.tsx`** and register it; `npx tsc --noEmit`. Expected: no errors.
- [ ] **Step 2: Render stills** at every `lineStart` (20 frames); read each; check: no empty frame, the named object is present (store at line 5, the clip at line 7 and 8, the board at line 11, the flower seller at line 15, the tunnel at line 16, the driver at line 18), subtitles inside the band, the HUD number never rises. Fix and re-render.
- [ ] **Step 3: Commit and push.**

### Task 5: Sound bed and checks

**Files:**
- Create: `Remotion/scripts/onestar2/bed.py` (helper files in `Remotion/out/`); output `Remotion/public/onestar2/bed.wav`

**Interfaces:**
- Consumes: the manifest.
- Produces: a stereo bed of the manifest length: rain (gain 0.4) outdoors and in the store doorway, shop hum and fridge in the store, the register chime at `screenAt` (same pitch as the app chime), station hall ambience, the train rumble from `tunnelAt` and the door chime at `boardTrainAt`, a soft click at `plugAt`, a phone-light swell at `msgAt`; ducking 0.55 under speech; peak at most −3 dBFS.

- [ ] **Step 1: Write and run `bed.py` in the background**, then `node scripts/onestar2/verify.mjs`. Expected: OK with the bed length matching.
- [ ] **Step 2: Measure loudness** of the render later (Task 6). Expected −20 to −14 LUFS.
- [ ] **Step 3: Commit and push.**

### Task 6: Review, fix pass, render, notes, hand-over

- [ ] **Step 1: Render** `npx remotion render OneStar2 out/onestar_part2.mp4` in the background (retry on errno 1455).
- [ ] **Step 2: Final review**: one Opus reviewer on the whole branch with this plan's Review Focus verbatim and the stills; fix Critical and Important in ONE pass (before and after stills), re-render; measure loudness with `ebur128`.
- [ ] **Step 3: Notes**: add the build to `series-animation/references/feedback-log.md` (include the Veo recipe and its limits) and update `series-bible-one-star.md` and `SKILL.md`.
- [ ] **Step 4: Copy** to `finished/3-1ดาว/ตอน2.mp4`, commit and push, then hand over: path, length, loudness, what could not be checked, captions (Instagram about 9 hashtags; TikTok 5), the reminders to tick the platform's paid-partnership / content-disclosure and AI-generated labels in the app, the note that the product listing (20,000 / 50,000 mAh) and the photo (120W) disagree, and the next question (Part 3).
