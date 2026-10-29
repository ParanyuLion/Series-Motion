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
