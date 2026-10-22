# Feedback log

Newest at the bottom. One line per piece of feedback: what the user said, what was done, where. When the user gives new feedback, append here and also promote lasting rules into the other references and into "Standing preferences" in SKILL.md.

## Pilot (boy and firefly, 30 s)

- 2026-10-21: "transitions between scenes are not smooth" → the pilot became one continuous world with scene changes driven by time (`src/Story.tsx`); later parts use one continuous camera instead of cuts.
- 2026-10-21: wants music and sound effects that fit the scene → synthesised bed (`scripts/bed.py`).
- 2026-10-21: wants a more human Thai voice → switched to Gemini TTS; chose Charon at 1.1x; use a `.env` file for the key.
- 2026-10-21: music a bit quieter, no re-render → `scripts/remix.py` with a lower bed gain.

## Series planning

- 2026-10-21: chose the survival-with-a-hated-hero type; bleak, hopeless look; stranded on a deserted island; seven people who just wake up there; the villain is an ego-driven rich young woman, not a killer; people who ignore the hero die; five parts; one narrator, first person; opening hook only in part 1; every part ends on a cliffhanger; island map and plan diagrams as explainer animations. Recorded in `series-bible.md`.
- 2026-10-21: approved the Part 1 script and names ("โอเคละ") → `docs/superpowers/specs/part1-script-draft.md`.
- 2026-10-21: workflow: script approved in chat first, then build; one part at a time; code goes to `main` of Series-Motion.

## Part 1

- 2026-10-21: tone A (grey) chosen over sepia → `visual-style.md`.
- 2026-10-22: "make Irin smile" → `smile` prop on `Person`, Irin smiles on the line about her smile.
- 2026-10-22: narrator Charon is right; use Leda when a woman speaks → `segments` in the narration JSON (Irin's quote).
- 2026-10-22: asked whether visual changes require new voice recording → no; audio is cached and independent.
- 2026-10-22: "more zoom so it is not static, nicer light and shadow, several camera angles to see the island" → `camera.ts`, `IslandAerial.tsx`, light shafts, soft shadows, vignette, grade, grain.
- 2026-10-22: "the background is too empty" → `IslandDetails.tsx` (sea stacks, sand detail, vegetation, foreground frame).
- 2026-10-22: "when a character smiles, change the camera to see them face-on" → `FaceFront.tsx`, cut-in on Irin's smile.
- 2026-10-22: "there is floating grass at the left of the screen" → removed the foreground fern; rule: nothing floats.
- 2026-10-22: turned the whole workflow into this skill so preferences are not forgotten.
- 2026-10-22: wants the skill in a visible folder at the repository root so it is easy to find if the project is open-sourced → moved to `series-animation/` (master); `.claude/skills/series-animation/SKILL.md` is a pointer.

## BTS zombie series

- 2026-10-22: changed the story to "what if you were on the BTS with zombies and had to survive"; student male; second-person "คุณ"; slow zombies, bite, 1 minute to turn; the driver is bitten and turns in the cab; the cab door opens from both sides; cars joined by an open walkway; ending: glad to survive but must run; the island series is paused. Recorded in `series-bible-bts.md`.
- 2026-10-22: look: option A (bright morning carriage) with yellow seats; student in a white long-sleeve shirt, green tie, black trousers.
- 2026-10-22: wanted more content per clip: 3 to 5 events per part; more carried by on-screen graphics (countdown, train map, station boards) than by narration.
- 2026-10-22: "you" must have a near-bite (not an infection); approved the design document, including the cast and the order of deaths ("ok") → `docs/superpowers/specs/2026-10-22-bts-zombie-series-design.md`.
- 2026-10-22: BTS Part 1 built (`Remotion/src/bts/`, `scripts/bts/`, composition `Bts1`, output `out/bts_part1.mp4`, 61.7 s, -18.3 LUFS): narration Charon via gemini-3.1-flash-tts-preview at 1.1 x 1.2; cues drive the camera, countdown, map and sound. Not yet judged by the user: watching it, the sound, Thai pronunciation, pacing.
- 2026-10-23: approved the Part 2 script ("พาท2 ผมโอเคละ") → `docs/superpowers/specs/bts-part2-script-draft.md`, plan `docs/superpowers/plans/2026-10-22-bts-part2.md`; BTS Part 2 built (`src/bts2/`, `scripts/bts2/`, composition `Bts2`, `out/bts_part2.mp4`, 56.2 s, -18.0 LUFS). Voice first from gemini-2.5-flash-preview-tts (3.1 quota was used up), then regenerated the same day with a new API key on gemini-3.1-flash-tts-preview at 1.1 x 1.2, same as Part 1; final 55.7 s, -18.1 LUFS. Not yet judged by the user: watching it, the sound, Thai pronunciation, pacing.
- 2026-10-23: viewer feedback relayed by the user: silences between sentences are too long and viewers lose focus; add exciting sound → manifest `LEAD` 15→6, `TAIL` 27→8, `HOOK_TAIL` 70→50 (verify range now 50 to 72 s), a camera key fixed; `bed.py` got an energy layer (accelerating bass pulse, risers with boom, screech stingers, swishes; duck 0.55). Part 1 re-rendered without re-voicing: 54.5 s, -18.2 LUFS. Lasting rule in SKILL.md (Tight pacing). The user posts with a caption of: hook line, a question to the viewer, "ตอนที่ N | ติดตามไว้ ตอน N+1 ...", hashtags.
- 2026-10-23: wanted the first spoken sentence to be the hook and to mention the zombies; chose the wording "จะเกิดอะไรขึ้น ถ้าคุณอยู่บน BTS ตอนซอมบี้เข้ามาพอดี" → narration line 0 changed (only that line regenerated with `--reuse-from ... --redo 0`), the hook is now computed from the line length (at least 6 s), the doors close as the line ends, the title card appears after it. Lasting rule: every part opens with a spoken hook of the "จะเกิดอะไรขึ้น ถ้าคุณ..." form that names the zombies.
- 2026-10-23: wants Part 2 changed: the driver walks over to see the commotion, steps up in front of the zombies to warn them, realises something is wrong, the passengers shout at him to run, he is too late, a zombie jumps and bites the tip of his finger, he panics and runs back to his cab → `docs/superpowers/specs/bts-part2-script-draft-v2.md` (waiting for approval before any rebuild; the current `out/bts_part2.mp4` is the old version).
- 2026-10-23: approved the v2 script after the user's edits: hook "จะเกิดอะไรขึ้น ถ้าคุณเห็นคนขับ BTS เดินเข้าไปเตือนซอมบี้" (the old hook gave away the bite, "spoil"), and the zombie falls onto the driver instead of jumping → Part 2 rebuilt (`docs/superpowers/plans/2026-10-23-bts-part2-v2.md`), `out/bts_part2.mp4` 54.2 s, -18.1 LUFS. Lasting rules: hooks and title cards must not give away the event they introduce; zombies never jump or run. Not yet judged by the user: watching it, the sound, Thai pronunciation, pacing.
- 2026-10-23: the free Gemini quota kept running out (new API keys in the same Google project share it) → added a Vertex AI backend to `scripts/tts_gemini.py` for the user's project (see pipeline.md).
- 2026-10-23: Part 3 script draft: the user wants น้องเต้ย bitten because the survivors quarrel and shove each other, the shove sends him falling next to a zombie (not because he sat alone) → `docs/superpowers/specs/bts-part3-script-draft.md` (waiting for approval).
- 2026-10-23: approved the Part 3 script ("ok") → `docs/superpowers/specs/bts-part3-script-draft.md`, plan `docs/superpowers/plans/2026-10-23-bts-part3.md`; BTS Part 3 built (`src/bts3/`, `scripts/bts3/`, composition `Bts3`, `out/bts_part3.mp4`, 56.5 s, -18.3 LUFS); narration via the Vertex AI backend (3.1 model, location global). `TrainInterior` got an optional `mirror`, `TrainMap` labels follow the "you" marker's car, `Passenger` has a `mark` prop (a red mark on the front fingertip), all backward compatible. Not yet judged by the user: watching it, the sound, Thai pronunciation, pacing.
- 2026-10-23: "พี่นุ่นคุยกับไมค์ก็ควรหันหน้าไปทางไมค์" → in Part 3 she faces ไมค์ from `mikeNo` until just after she hits the boy; lasting rule in SKILL.md (characters who talk face each other). Part 3 re-rendered, no re-voicing.
