# Island Survival Series, Part 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `out/island_part1.mp4`, the first of five roughly 60-second vertical Thai videos of the island survival series, from the approved Part 1 script.

**Architecture:** One Remotion composition `Island1` inside the existing project at `E:\Coding\animation\Remotion`, in a new `src/island/` folder so the finished pilot (`Story`) is untouched. Timing comes from the narration audio lengths through a generated `manifest.json` (same pattern as the pilot). All pictures are SVG drawn by code. The sound bed is synthesised with numpy.

**Tech Stack:** Remotion 4, React, TypeScript, SVG, Python 3.13 (numpy, scipy), Gemini TTS via `.env`, ffmpeg, node 22.

**Spec:** `docs/superpowers/specs/2026-10-21-island-survival-series-design.md`. The approved script is `docs/superpowers/specs/part1-script-draft.md`; the narration lines in it are the source of truth and must be copied verbatim.

## Global Constraints

- Video 1080x1920, 30 fps, H.264 plus AAC, one MP4 per part. (spec: Assistant's calls)
- About 60 s of story plus a 4 to 5 s outro on top; total between 55 s and 70 s. (spec: Goals)
- Tone "A": steel grey, heavy dull sea, overcast sky, thin fog, desaturated; light only from small sources such as a torch or campfire. (spec: Look and feel)
- One narrator, Thai, first person "ผม", calm and low. No character voices. Narration budget is about 7.5 Thai characters per second, excluding spaces; the approved script has 425. (spec: Voice and sound)
- No AI-generated video. Music and effects synthesised in code. (spec: Non-goals)
- Burned-in Thai subtitles, kept away from the bottom and right edges that Reels/TikTok interface covers. (spec: Assistant's calls)
- Deaths implied, never graphic (applies from Part 2; Part 1 has none). (spec: Assistant's calls)
- Names: นที (hero, narrator), ไอริณ (villain), ก้อง (bodyguard), เจ (teen), คุณวิชัย (businessman), พลอย (nurse), ต้น (student).
- `GEMINI_API_KEY` is read only from `.env`; never print it, log it, or put it in any file other than `.env`.
- The project is not a git repository, so there are no commit steps. Keep each finished deliverable under `out/` with a version suffix instead.

## Review Focus

- A Thai subtitle line that wraps to three lines or runs outside the safe area (the longest are lines 7 and 8). Expected: stays inside two lines within the safe area. Pinned in Task 5.
- Narration longer than the budget after the real TTS run (voice reads slower than 7.5 chars/s). Expected: total story time stays under 65 s or the build stops with a clear message. Pinned in Task 1.
- Gemini returns text instead of audio, or rate-limits, mid-run. Expected: retry, then fail with a readable message and no half-written files kept as final. Pinned in Task 1.
- Two characters standing close so their name tags overlap. Expected: tags stay readable and do not overlap. Pinned in Task 4.
- Audio and picture drift when a narration file is regenerated with a different length. Expected: re-running manifest and render keeps every cue aligned, with nothing hard-coded in frames. Pinned in Task 5.

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/island/part1.narration.json` | The 10 approved narration lines (array of strings). |
| `scripts/tts_gemini.py` (modify) | Add `--script` and `--out-dir` options so it can write Part 1 audio. |
| `scripts/island/manifest.mjs` | Reads audio lengths, writes `src/island/manifest.json` (starts, cues, totals). |
| `scripts/island/verify.mjs` | Asserts the manifest is sane (length, cue order). |
| `src/island/cast.ts` | Data for the seven characters (colours, accessories, names). |
| `src/island/Person.tsx` | One configurable rigged person, from `cast.ts` data. |
| `src/island/IslandWorld.tsx` | Tone A backdrop, sea, beach, trees with waterline marks, camp, high ground. |
| `src/island/MapCard.tsx` | Animated island map overlay. |
| `src/island/Part1.tsx` | The composition: scenes, subtitles, hook, outro, audio. |
| `src/Root.tsx` (modify) | Register `Island1` next to `Story`. |
| `scripts/island/bed.py` | Gloomy music and sound-effect bed for Part 1. |
| `scripts/remix.py` (reuse) | Re-mix audio without re-rendering the picture. |

---

### Task 1: Narration audio and timing manifest

**Files:**
- Create: `scripts/island/part1.narration.json`, `scripts/island/manifest.mjs`, `scripts/island/verify.mjs`
- Modify: `scripts/tts_gemini.py`
- Output: `public/island1/n0.mp3` to `n9.mp3`, `src/island/manifest.json`

**Interfaces:**
- Produces `src/island/manifest.json` with this exact shape, used by Tasks 3 to 6:
  `{ fps: 30, total: number, storyEnd: number, outroStart: number, shots: { text: string, audio: string, audioFrames: number, leadFrames: number, frames: number }[], starts: number[], cues: Record<string, number> }`
  - `audio` is a path relative to `public/`, such as `island1/n3.mp3`.
  - `starts[i]` is the global frame where shot i begins; `leadFrames` is silence before the voice.
  - `storyEnd` is the frame where the last narration ends; `outroStart` equals `storyEnd + 12`; `total = outroStart + 135` (4.5 s outro).
  - `cues` has these keys, each a global frame: `hookCut` (end of the 5 s opening hook), `lineStart0` to `lineStart9` (frame where narration line i starts speaking), `mapIn` (= `lineStart3`), `mapOut` (= `lineEnd5`, the frame where line 5 finishes), `skyChange` (= `lineStart9`).

- [ ] **Step 1: Create `scripts/island/part1.narration.json`** containing the 10 approved lines from `part1-script-draft.md` as a JSON array of strings, copied verbatim (line 8 keeps its straight quotation marks).

- [ ] **Step 2: Write `scripts/island/verify.mjs`** that loads `src/island/manifest.json` and exits non-zero with a clear message unless all of these hold: `fps === 30`; `shots.length === 10`; `total / fps` is between 55 and 70; `storyEnd / fps` is at most 65; `starts` is strictly increasing; every cue is within `0..total`; `cues.hookCut < cues.lineStart1`.

- [ ] **Step 3: Run it before the manifest exists**

Run: `node scripts/island/verify.mjs`
Expected: FAIL with a message saying the manifest is missing.

- [ ] **Step 4: Modify `scripts/tts_gemini.py`** to add `--script PATH` (default `scripts/narration.json`) and `--out-dir DIR` (default `public/audio`), and to skip the Edge-backup logic when `--out-dir` is not the default. Keep `--voice` and `--speed`. Output files stay named `n{i}.mp3` inside the out dir.

- [ ] **Step 5: Choose and lock the narrator voice.** Run `python scripts/tts_gemini.py --sample` after temporarily pointing the sample text to Part 1 lines 7-8 (sentences with emotion). Listen-test is the user's job: present `out/voice_test/` to the user and ask which voice and speed fits a calm, low, first-person narrator. Record the chosen `--voice` and `--speed` at the top of `scripts/island/part1.narration.json`'s sibling file `scripts/island/voice.txt` (one line: `voice=NAME speed=X.X`). Do not proceed to Step 6 until the user has chosen. The previously used default was Charon at 1.1.

- [ ] **Step 6: Generate the audio**

Run: `python scripts/tts_gemini.py --script scripts/island/part1.narration.json --out-dir public/island1 --voice <chosen> --speed <chosen>`
Expected: ten `public/island1/n{i}.mp3` files, each longer than 1 s. If the script exits with a Gemini error, it must say which line failed.

- [ ] **Step 7: Implement `scripts/island/manifest.mjs`** following `scripts/manifest.mjs`: lead 0.5 s, tail 0.9 s between shots, except line 0 (the hook) which starts at frame 150 (after a 5 s silent hook visual) so the hook has its own picture time. Compute every cue from the actual audio lengths; no frame number may be typed in by hand except the constants named above.

- [ ] **Step 8: Run manifest and verify**

Run: `node scripts/island/manifest.mjs && node scripts/island/verify.mjs`
Expected: prints total seconds and `OK`. If `storyEnd` exceeds 65 s, verify fails: shorten the voice speed (raise `--speed`) or tell the user the script is too long.

---

### Task 2: Seven-character rig

**Files:**
- Create: `src/island/cast.ts`, `src/island/Person.tsx`, `src/island/CastPreview.tsx`

**Interfaces:**
- `cast.ts` exports `type CastId = "nathee" | "irin" | "kong" | "jay" | "wichai" | "ploy" | "ton"` and `CAST: Record<CastId, { name: string; skin: string; hair: string; top: string; bottom: string; shoe: string; torso: number; width: number; legLength: number; accessories: ("beard" | "glasses" | "shades" | "cap" | "bun" | "bald" | "longHair" | "dress" | "tie" | "belly" | "backpack")[] }>`. Values come from the approved lineup mockup in `.superpowers/brainstorm/*/content/cast-and-tone.html`.
- `Person.tsx` exports `Person: React.FC<{ id: CastId; x: number; y: number; scale?: number; phase: number; walk: number; frame: number; dirt?: number; facing?: 1 | -1; pose?: "stand" | "point" | "sit" | "lie"; label?: boolean }>`. `x, y` is the ground point under the feet. `phase` is walk-cycle radians, `walk` is 0..1 intensity (same meaning as in `src/Boy.tsx`). `dirt` is 0..1 and darkens and tears the costume progressively (for the villain's dress this is the main storytelling device). `label` draws the Thai name tag above the head.
- `CastPreview.tsx` exports `CastPreview: React.FC` showing all seven in a row for review.

- [ ] **Step 1: Write `cast.ts`** with the seven entries.

- [ ] **Step 2: Implement `Person`** by generalising `src/Boy.tsx`: reuse its swing math (negative rotation is forward). Side-on walking is required for the hero and everyone who walks; front-facing stand is acceptable for group shots. `dirt` mixes colours toward `#3b342c` and adds tear shapes at hem and sleeves when above 0.5.

- [ ] **Step 3: Implement `CastPreview`** and register it as a temporary `Composition id="CastPreview"` (1080x600) in `src/Root.tsx`.

- [ ] **Step 4: Render a still**

Run: `npx remotion still src/index.ts CastPreview out/cast.png`
Expected: `out/cast.png` exists. View it: seven figures, each clearly different by silhouette or colour at 25% size.

- [ ] **Step 5: Render a walk-cycle still pair** (`dirt=0` and `dirt=1` for the villain, frames 0 and 15) and check by viewing that dirt visibly changes the dress and that legs and arms swing opposite to each other.

---

### Task 3: Island world, tone A

**Files:**
- Create: `src/island/IslandWorld.tsx`

**Interfaces:**
- Consumes: `W`, `H`, `GROUND_Y` from `src/World.tsx` (pilot) are 1080, 1920, 1450; keep the same values.
- Produces: `IslandWorld: React.FC<{ frame: number; scroll: number; stormAmount: number; showWaterline?: boolean; showCamp?: boolean }>` drawing, back to front: overcast sky, heavy sea with slow motion, fog band, beach, trees (with a visible waterline stain high on the trunks when `showWaterline`), and a small campfire area when `showCamp`. `stormAmount` 0..1 changes the sky from grey to a sick yellow-green at 1 (used by line 10).
- Also exports `PALETTE_A` with the exact colours: sky `#59626b` to `#8c949a`, sea `#3c444c`, sand `#6b6e6a`, hills `#2e343a`, fog `#cfd5d8` (from the approved mockup).

- [ ] **Step 1: Implement `IslandWorld`** using the pilot's `Backdrop` as a reference for parallax; island silhouette hills on the right, open sea on the left.

- [ ] **Step 2: Add a temporary `WorldPreview` composition** (1080x1920, 1 frame) in `src/Root.tsx` with `showWaterline` and `showCamp`.

- [ ] **Step 3: Render stills at `stormAmount` 0 and 1**

Run: `npx remotion still src/index.ts WorldPreview out/world0.png` and the same with `--props='{"storm":1}'`
Expected: view both; the first is the grey tone A, the second visibly sicker in colour; waterline marks are above head height of a person at scale 1.5.

---

### Task 4: Island map overlay

**Files:**
- Create: `src/island/MapCard.tsx`

**Interfaces:**
- Produces: `MapCard: React.FC<{ progress: number; markers: { id: string; x: number; y: number; label: string; appearAt: number }[]; highlight?: string }>` where `progress` is 0..1 draw-in of the whole card and `markers[].appearAt` is 0..1 within that progress. Coordinates are inside a 900x700 card.
- Part 1 marker set, exported as `PART1_MARKERS`: `wake` "จุดที่ตื่น", `waterline` "รอยน้ำ", `high` "ที่สูง", `camp` "แคมป์ของไอริณ". `camp` must sit lower than `high` and nearer the waterline to show the danger.

- [ ] **Step 1: Implement `MapCard`:** a hand-drawn-looking island outline, markers popping in with a small scale animation, a dashed route line from `wake` to `high` for the hero's plan and a second dashed route from `wake` to `camp` for the villain's.

- [ ] **Step 2: Add a temporary `MapPreview` composition** in `src/Root.tsx` (1080x1920, three frames at progress 0.3, 0.7, 1).

- [ ] **Step 3: Render stills and view them**

Run: `npx remotion still src/index.ts MapPreview out/map.png --frame=2`
Expected: four labels visible, none overlapping each other, Thai text not clipped, `camp` clearly lower than `high`.

---

### Task 5: Part 1 composition

**Files:**
- Create: `src/island/Part1.tsx`
- Modify: `src/Root.tsx` (register `Island1` with `durationInFrames` from `src/island/manifest.json`, 1080x1920, 30 fps)

**Interfaces:**
- Consumes: manifest (Task 1), `Person`/`CAST` (Task 2), `IslandWorld` (Task 3), `MapCard`/`PART1_MARKERS` (Task 4).
- Produces: `Part1: React.FC`.

Shots, all positioned from manifest cues (no hand-typed frame numbers):

| Cue range | Picture |
|---|---|
| 0 to `hookCut` (5 s) | Black fade in, waves sound, a storm sky flash-forward (`stormAmount` 1) and a hand slipping out of frame (a silhouette arm, not a named character), then the series title card "ตื่นมาบนเกาะร้างพร้อมคนแปลกหน้า 6 คน... มีแค่ผมที่รู้ว่าเราไม่ควรอยู่ที่นี่" (the approved on-screen title) and "เมื่อวาน" fading to the beach. Narration line 0 plays over this. |
| `lineStart1` to `lineStart3` | Grey beach at dawn; the seven wake one by one (lie, then stand) with name tags; the hero first. |
| `mapIn` to `mapOut` | Hero walks the shoreline; `MapCard` slides in as a bottom overlay inside the safe area and draws; trees show the waterline. |
| `lineStart6` to `lineStart8` | Group scene; ไอริณ smiles; the group turns to face her; the hero stays at the edge of frame. |
| `skyChange` to `storyEnd` | `stormAmount` rises 0 to 1 over the line; hero looks up. |
| `outroStart` to `total` | Dark card: "ตอนต่อไป: คืนแรก... มีคนไม่ได้ตื่นขึ้นมาอีก" then "ติดตามตอนที่ 2". |

Subtitles: one `Subtitle` component per narration line, shown from `starts[i] + leadFrames` for `audioFrames`, font Prompt 500 (as in the pilot), size 52, line-height 1.6, inside a box that leaves 160 px free on the right edge and 340 px free at the bottom.

- [ ] **Step 1: Implement the shot table above** as `Part1.tsx`, using `useCurrentFrame()` as the global frame like the pilot's `World`.

- [ ] **Step 2: Subtitle fit check.** Write a small test script `scripts/island/subtitle-check.mjs` that launches nothing but reads the narration JSON and fails if any line has more than 56 Thai characters after removing spaces (rule of thumb: about 30 characters per line at size 52 in an 850 px wide safe box, two lines maximum). Lines 6 to 8 are the longest (about 54); the script prints every line's length.

Run: `node scripts/island/subtitle-check.mjs`
Expected: `OK` (if it fails, the script says which line; reduce the font size to 48 in `Part1.tsx` first and re-run with the limit raised to 62).

- [ ] **Step 3: Render stills at the hook, line 3, map, group, sky and outro** (six frames, scale 0.4) and view them.

Run: `npx remotion still src/index.ts Island1 out/p1_<frame>.png --frame=<frame> --scale=0.4` for each cue frame taken from `manifest.json`.
Expected: no subtitle outside the safe area; no overlapping name tags (hero and group shots); the map does not cover the narrator's subtitle.

- [ ] **Step 4: Resync check.** Change `speed` by 0.1 in `voice.txt`, regenerate audio and manifest, re-render one still at `cues.skyChange`.
Expected: the sky is mid-change at that frame without editing any code. Restore the chosen speed afterwards.

---

### Task 6: Sound bed and final render

**Files:**
- Create: `scripts/island/bed.py`
- Output: `public/island1/bed.wav`, `out/island_part1.mp4`

**Interfaces:**
- Consumes: `src/island/manifest.json`.
- Produces: `public/island1/bed.wav` (stereo 44.1 kHz, same duration as the video) referenced by `Part1.tsx`'s bed `<Audio volume={0.5}>`.

- [ ] **Step 1: Write `scripts/island/bed.py`** adapted from `scripts/bed.py` with: sparse low drone and a lonely single-note melody (no cheerful music-box phrases), wind throughout, distant waves, a low rumble rising into `cues.skyChange`, a sting at `cues.hookCut`, no footstep sounds except where the hero walks the shoreline (lines 4 to 5), and ducking under the narration windows at 0.5.

- [ ] **Step 2: Generate and check loudness**

Run: `python scripts/island/bed.py`
Expected: prints duration, peak, rms; peak at most -3 dBFS.

- [ ] **Step 3: Full render**

Run: `npx tsc -p . && npx remotion render src/index.ts Island1 out/island_part1.mp4 --codec=h264`
Expected: no type errors; file exists.

- [ ] **Step 4: Verify the output**

Run: `ffprobe -v error -show_entries stream=codec_type,width,height,duration -of csv=p=0 out/island_part1.mp4`
Expected: one video stream 1080x1920 and one audio stream, duration between 55 and 70 seconds. Measure loudness with `ffmpeg -i out/island_part1.mp4 -af ebur128 -f null -` and report integrated loudness between -20 and -14 LUFS.

- [ ] **Step 5: Hand over to the user** with the file path, the list of things the maker could not check (actual sound, Thai pronunciation, feel of pacing), and the Part 2 script question. If the user wants the music quieter or louder, adapt `scripts/remix.py` (it currently reads `src/manifest.json` and `public/audio`; add `--manifest` and `--audio-dir` options, defaulting to the old paths) instead of re-rendering the picture.
