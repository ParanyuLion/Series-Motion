# Blind Village Series, Part 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `out/blind_part2.mp4`, Part 2 ("คนที่มองเห็น... เคยมาที่นี่ก่อนคุณ") of "หมู่บ้านที่ทุกคนตาบอด", from the approved script, so that a viewer who never saw Part 1 understands the premise from the first two lines.

**Architecture:** Composition `Blind2` in `src/blind2/` and `scripts/blind2/`, copied in structure from `Blind1` (manifest-driven cues from the narration audio lengths, `makeCamera`, `Passenger` rig, `SceneBox` cross-fades, the grey grade `saturate(0.5) brightness(0.82) contrast(1.12)`). New: the dusk supper table scene, a shadow-puppet cloth, the hand-guiding close-up, the "all eyes turn" beat. Reused unchanged: `Village` scenery (`BellPost`, trees, dusk), `FaceHead`, `FaceYou`, `SnakeTile`, cast ids `bvYou bvHead bvCook bvChild bvMan bvWoman bvElder`.

**Tech Stack:** Remotion 4, React, TypeScript, SVG, Python 3.13 (numpy, scipy), TTS via the Vertex backend of `scripts/tts_gemini.py` (run as a subprocess, never imported), ffmpeg, node 22.

**Spec:** `docs/superpowers/specs/blind-village-part2-script-draft.md` (approved by the user on 2026-10-24: script and hook option A), on `2026-10-23-blind-village-series-design.md` and `2026-10-23-blind-village-story-plan.md`. Rules: `series-animation/SKILL.md` and `references/`. Templates: `src/blind1/`, `scripts/blind1/`, `docs/superpowers/plans/2026-10-23-blind-village-part1.md`.

## Global Constraints

- 1080x1920, 30 fps, H.264 plus AAC; total 80 to 100 s; story ends by 96 s; the 15 narration lines verbatim from the draft (at most 56 Thai characters without spaces each). Voice **Charon**, model `gemini-3.1-flash-tts-preview`, Vertex backend, speed 1.1, post-speed 1.245, the cold style of `scripts/blind1/voice.txt`. Stop and tell the user on any key, auth or quota error.
- The first two lines (index 0 and 1) are the hook and carry the whole premise; the title card shows "ตอนที่ 2", the title and a small "หมู่บ้านที่ทุกคนตาบอด".
- Horror from the abnormal only: no ghosts, no jump scare, no gore; the blinding is only told. The shadow play shows silhouettes only. "You" never show that they can see; the only pupils are "you"'s. No mirrors, no still water, nobody says "you"'s name. The snakes are not shown: only "something on the tree" as a dark shape in the shadow play.
- Quiet sound: forest ambience, low drones, the bell once; short deliberate pause only; no loud stingers. Loudness -20 to -14 LUFS; bed `<Audio volume={0.5}>`, bed peak at most -3 dBFS.
- Safe area: subtitles Prompt 500 size 52, `left 60, right 160, bottom 340`, two lines; figures above screen y 1414; tags inside x 130 to 880; nothing floats; cross-fades, no hard cuts; face-on close-ups at key beats.
- Rig edits only as optional props (Bts 1 to 5 and Blind1 must render unchanged). Never print or commit secrets. Commit after each task and push to `main`.

## Review Focus

- Hook for a cold viewer: lines 0 and 1 spoken over picture that shows a seeing "you" among clouded-eyed villagers; the title card names the series.
- The villagers never blink and never spill (no animated blink on any `blind` figure at the table); only "you" blink.
- The unison turn toward "you" lasts about one second and happens once; the bell turn toward the forest is the second, different, turn; the camera stays on "you", who do not turn.
- The shadow play is readable as silhouettes (cloth, light from behind), has no gore and no snake; three blind villagers face the way the man ran.
- Spoken words and picture agree at the line starts (line 3 table, line 4 hand, line 7 trip, line 8 tree and run, line 12 spoon); no card or tag appears before its words.
- Blind1, Bts4, Bts5 stills unchanged.

---

### Task 1: Narration and cues

**Files:** Create `scripts/blind2/part2.narration.json`, `manifest.mjs`, `verify.mjs`, `subtitle-check.mjs`, `voice.txt`; output `public/blind2/n0.mp3` to `n14.mp3`, `src/blind2/manifest.json`.

**Interfaces:** `manifest.json` has `{ fps, total, storyEnd, outroStart, shots, starts, cues }` as in Blind1. Cues (global frames): `hookCut` (= `starts[2]`; the hook is lines 0 and 1), `titleAt` (= `lineEnd1`), `tableAt` (= `lineStart2`), `handAt` (= `lineStart3`), `wonderAt` (= `lineStart4`), `tellAt` (= `lineStart5`), `tripAt` (= `lineStart6`), `runAt` (= `lineStart7`), `sighAt` (= `lineStart8`), `nodAt` (= `lineStart9`), `gentleAt` (= `lineStart10`), `gripAt` (= `lineStart11`), `stareAt` (= `lineStart11` + 30), `bellAt` (= `lineStart12`), `smileAt` (= `lineStart13`), `questionAt` (= `lineStart14`), plus `lineStart0..14`, `lineEnd0..14`.

- [ ] **Step 1:** copy `scripts/blind1/verify.mjs` and `subtitle-check.mjs` to `blind2` with paths changed; cue order `titleAt < tableAt < handAt < wonderAt < tellAt < tripAt < runAt < sighAt < nodAt < gentleAt < gripAt < stareAt < bellAt < smileAt < questionAt` and `hookCut < lineStart2`; 15 shots; total 80 to 100 s; story end at most 96 s. Run verify. Expected: FAIL (manifest missing).
- [ ] **Step 2:** write the 15 lines of the draft verbatim to `part2.narration.json`; `node scripts/blind2/subtitle-check.mjs`. Expected: `OK` (every line at most 56 characters without spaces; line 2 and line 3 are the longest, trim spaces-free count if over).
- [ ] **Step 3:** run `scripts/tts_gemini.py` as a subprocess with the Blind1 command (`--script scripts/blind2/part2.narration.json --out-dir public/blind2`), record it in `voice.txt`. Expected: 15 files.
- [ ] **Step 4:** write `manifest.mjs` from `scripts/blind1/manifest.mjs`: the hook covers shots 0 and 1 (shot 0 frames = `HOOK_LEAD + audio + 4`; shot 1 frames = `LEAD + audio + 50` for the title card, so `hookCut = starts[2]`); other shots use `LEAD 6`, `TAIL 8`; outro 135 frames. Run it, then verify. Expected: `OK`, story end at most 96 s (if over, rewrite nothing: report to the user).
- [ ] **Step 5:** commit.

### Task 2: Scenery, props and close-ups

**Files:** Create `src/blind2/Supper.tsx` (the dusk table), `src/blind2/Puppet.tsx` (the cloth), `src/blind2/Faces2.tsx` (hand close-up, the stare). Do not edit `src/blind1/*` except exporting `GROUND_Y` users already have.

**Interfaces:**
- `Supper: React.FC<{ g: number; eatFrom: number }>`: a long bench table (about 1500 wide) at ground `GROUND_Y`, pattern cups, bowls, spoons, drawn at dusk light with a hanging lantern glow; no seated figures (the composition places `Passenger` with `pose="sit"` and `item={null}`, `swing` driving the spoon arm at a steady identical rhythm for every villager).
- `Puppet: React.FC<{ t: number }>` where `t` is frames since `tellAt`: a cloth lit from behind, silhouettes only: the man (quick clear walk) joined by a rope to three blind villagers (slow, sure steps) entering a tree line; at `runAt - tellAt` he stops, tilts his head up to a dark shape in the branches (a plain dark blob, not a snake), runs off the cloth; the three stand and turn their faces to where he went; the cloth goes dark at the end. Props: none beyond `t`.
- `HandGuide: React.FC<{ g: number; from: number; to: number }>` (in `Faces2.tsx`): face-on close-up of "you" at the table, with a woman's hand (clouded-eye woman in frame edge) taking "your" hand and placing it on the bowl rim with exact, unhesitating movement; the pupils of "you" stay fixed.
- `Stare: React.FC<{ g: number; from: number; to: number; n: number }>`: n clouded faces side by side turning toward the camera together within 12 frames, holding about 30 frames, turning back.

- [ ] **Step 1:** add a temporary import of `./blind2/Supper` in `src/Root.tsx`; `npx tsc -p . --noEmit`. Expected: error (module missing).
- [ ] **Step 2:** implement the four components, reusing `FaceYou`, `SnakeTile` and the village palette; remove the temporary import.
- [ ] **Step 3:** `npx tsc -p . --noEmit`; render a still of each (a temporary one-frame composition or the Task 3 composition) and check against the Review Focus (no blinking on villagers, silhouettes only).
- [ ] **Step 4:** commit.

### Task 3: Composition

**Files:** Create `src/blind2/Part2.tsx`; modify `src/Root.tsx` (register `Blind2`, same format as `Blind1`).

| Cue range | Picture |
|---|---|
| 0 to `titleAt` | hook: "you" at the edge of the table at dusk, the only figure with pupils among clouded-eyed villagers; a slow push-in on "you"'s face as line 1 ("และคุณต้องแกล้งทำเป็นตาบอด...") is spoken |
| `titleAt` to `hookCut` | title card: "ตอนที่ 2", "คนที่มองเห็น... เคยมาที่นี่ก่อนคุณ", small "หมู่บ้านที่ทุกคนตาบอด" |
| `tableAt` to `handAt` | wide shot of the table: the head walks "you" to a seat; everyone eats in unison without a spill (`Supper`); villagers do not blink; a face-on cut of a still clouded eye |
| `handAt` to `wonderAt` | `HandGuide`: the woman's hand guides yours to the bowl, too exact |
| `wonderAt` to `tellAt` | the head puts his spoon down; his face turned to "you" (`FaceHead`) with the card "ทำไมเราระวังคนแปลกหน้า" only if spoken words match (otherwise no card) |
| `tellAt` to `nodAt` | the cloth (`Puppet`) fills the frame, table edges and heads in silhouette at the bottom; `sighAt`: cut to `FaceHead` close-up for the two-sided line |
| `nodAt` to `gripAt` | villagers nod; a woman speaks gently; no blinding is shown; the table in soft dusk |
| `gripAt` to `bellAt` | `FaceYou`/spoon close-up with white knuckles; at `stareAt`, `Stare` (every face turns to "you" for about one second) |
| `bellAt` | the bell rings once (`BellPost`, `bell` angle), everyone turns to the forest together; the camera stays on "you" who do not |
| `smileAt` | `FaceHead` close-up, the smile, the spoken last line |
| `questionAt` to outro | "you" alone in frame, the table behind, all faces toward the forest; slow push-in on the pupils; hold |
| outro | "ตอนต่อไป: คืนแรก..." then "ติดตามตอนที่ 3" |

**Interfaces:** consumes the manifest cues of Task 1 and the components of Task 2; `Part2: React.FC`, `PART2_TOTAL: number`.

- [ ] **Step 1:** `npx remotion still src/index.ts Blind2 out/b2_check.png --frame=100`. Expected: fails (not registered).
- [ ] **Step 2:** implement `Part2.tsx` (cameras with `makeCamera`, 10-frame cross-fades, subtitles in the safe area, title and outro cards as in `Part1.tsx`), register `Blind2`.
- [ ] **Step 3:** `node scripts/blind2/subtitle-check.mjs && npx tsc -p . --noEmit`; stills across all ranges (about 25 frames, contact sheet). Expected: the Review Focus items hold; tags only after the words.
- [ ] **Step 4:** commit.

### Task 4: Sound bed, render, review, notes

**Files:** Create `scripts/blind2/bed.py`; output `public/blind2/bed.wav`, `out/blind_part2.mp4`, `finished/2-หมู่บ้านที่ทุกคนตาบอด/ตอน2.mp4`.

- [ ] **Step 1:** `bed.py` from `scripts/blind1/bed.py`: forest ambience and evening insects throughout; a low drone under the hook; soft spoon-on-bowl clicks in perfect unison from `tableAt`; a quiet creak of the cloth frame and a rising, dull rhythm of footsteps during `Puppet`; a short breath and a dull pause at the run; a soft shared murmur at `nodAt`; a held low note at `stareAt` with a tiny pause of all ambience; one bell strike at `bellAt` with a long tail; a slow riser into the question; outro sting; swishes at line changes; ducking 0.55.
- [ ] **Step 2:** `python scripts/blind2/bed.py && node scripts/blind2/verify.mjs`. Expected: peak at most -3 dBFS; `OK`.
- [ ] **Step 3:** render `npx remotion render src/index.ts Blind2 out/blind_part2.mp4 --codec=h264` in the background; check size, 80 to 100 s, -20 to -14 LUFS; stills of Blind1 frame 100 and Bts5 unchanged.
- [ ] **Step 4:** final Opus review of the whole branch (Agent tool, model opus), one fix pass, re-render, copy to `finished/`, update `series-animation/references/feedback-log.md` (including the "hook must work for a cold viewer" rule) and `series-bible-blind-village.md`, commit and push to `main`; then write the Part 2 captions.
