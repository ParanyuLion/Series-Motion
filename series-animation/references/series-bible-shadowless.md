# Series 5: "หมู่บ้านที่ไม่มีใครมีเงา" (the village where nobody has a shadow)

Design: `docs/superpowers/specs/2026-10-29-shadowless-village-design.md`. Four parts planned, about 1:25 each, vertical 9:16, Charon narration (cold, calm).

## Look (decided with the user, 2026-10-29)
- Characters (`src/shadow1/Figure.tsx`, `Traveller.tsx`): rough dark outlines, flesh skin, dot eyes, round heads; "you" is a turnable model (any yaw) with bowl-cut hair, round glasses, black jacket over a white shirt; villagers share a village badge (a cream circle with a red ring, like an eye) that "you" lacks. Creepy-head blend for the head (kind to creepy).
- Backdrop: a painted-over CC0 photo of a stilt village (Wikimedia Commons, Myanmar), cartoonised with OpenCV (14 colours, wobbling ink edge) in `public/shadow1/bg_asia.png`; the code-drawn pier, props, characters are graded to it (`pv-grade` filter) with a thin haze (user said thick fog is too much) and a vignette.
- Mood: creepy first, glare second: pale overcast sky but razor-sharp shadows (never explained). Light from the upper right, shadows skewX(-55) squash 0.34. Only "you" and objects/animals cast shadows; villagers never do.
- Characters sit around mid-screen height (user asked), the lower third is left for subtitles.

## Part 1 "เงาของคุณ"
- Script v2: `docs/superpowers/specs/shadowless-village-part1-script-draft.md` (16 lines, voice 75.8 s, total 88.7 s). Code: `src/shadow1/Part1.tsx`, timing `scripts/shadow1/manifest.mjs`, sound `scripts/shadow1/bed.py`, voice `scripts/shadow1/gen_voice.sh`. Composition `ShadowVillage1`.
- Opus review (proxy contact sheet) found: empty filler shots, empty sweat and clapper shots, subtitle on white robes, no hat shade, no turn at the end. One fix pass done: straight cut to the child (bucket and its shadow beside), a sweating villager and a drop for line 10, a villager striking the clapper, a dark plate behind subtitles, you in front of the head under the brim, a slow push-in at the end and no blinking in the final stare, camera clamped inside the backdrop.
- Known gaps: the villagers do not turn their heads toward your shadow in the last set (the rig has no head turn); the title card and sound levels are unchecked by ear.

## Part 2 "ห้ามยืนในที่ร่ม"
- Script: `docs/superpowers/specs/shadowless-village-part2-script-draft.md` (14 lines, approved 2026-10-29); voice post-speed 1.32, total 67.7 s. Code `src/shadow2/Part2.tsx` (imports the shared pieces exported from `src/shadow1/Part1.tsx`), timing `scripts/shadow2/manifest.mjs`, sound `scripts/shadow2/bed.py`. Composition `ShadowVillage2`.
- Places: lane (hook in the eave's shade, the noon meal at a long table), granary (`bg_barn.png`, from a public-domain Isaac van Ostade painting, cold grade), alley (the head waits, speaks, points), the great tree (`bg_tree.png`, a banyan in Punjab by Satdeep Gill, CC BY 4.0: credit needed in the post caption). Photo backdrops are made with `scripts/shadow1/cartoon.py SRC OUT CX [cold]`.
- Beats: the hand sliding a plate over your shadow is a full-screen insert; the thing in the granary is a shifting dark patch with two pale points; the tree's cold shadow pool lies the wrong way and stays put while a post's shadow sweeps round (time-lapse).

## Part 3 "ต้นไม้ที่มีเงาเยอะเกินไป"
- Script: `docs/superpowers/specs/shadowless-village-part3-script-draft.md` (14 lines, approved 2026-10-31); voice post-speed 1.32, total 76.1 s. Code `src/shadow3/Part3.tsx` (imports shared pieces from `src/shadow1/Part1.tsx`), timing `scripts/shadow3/manifest.mjs`, sound `scripts/shadow3/bed.py`. Composition `ShadowVillage3`.
- Places: hook (tree backdrop, wide, two rows of staring villagers), lane (the head invites you, the village files in behind you), under the tree (cold blue shadow pool, thin leaning silhouettes, hundreds of tiny silhouettes, the child's pale silhouette waves), the wall (code-drawn plaster, a lantern lit in daylight, hand-shadow puppet play, insert of the mother's grip, your shadow slides sideways toward the tree), dusk (lane backdrop, a clapper post, villagers light lantern posts together). No new photos: reuses `bg_tree.png` and `bg_lane.png` (so the Part 2 credit for the banyan photo applies).
- Beats: your shadow slides sideways on its own (skew -55 to +80); the pool's crowd is the "truth" shown, never said; the head never says the villagers sold theirs (Part 4).
