# Series 6: "กฎเหล็กหอพัก ตี 3" (dorm iron rules)

Design: `docs/superpowers/specs/2026-10-31-dorm-rules-design.md`. Five parts, one hour each (03:00 to dawn), first person "ผม", rules as puzzles with a fair loophole, deaths shown bloodless (a limp corpse with an agonised face; blood only in the narration), the truth is a hospital bed (a coma "game" between life and death).

## Voice (user, 2026-10-31)
Gemini Sulafat, a normal speaking level with a cold, slightly eerie calm (not whispering, not slow), `--speed 1.25`, post-speed 1.0. Style string in `scripts/dorm1/gen_voice.sh`. The female voice narrating a male "ผม" is the user's choice. Importing `scripts/tts_gemini.py` as a module runs its main routine and overwrites `public/audio`: only run it from the command line.

## Part 1 "03:00 กฎข้อแรก"
- Script `docs/superpowers/specs/dorm-rules-part1-script-draft.md` (approved 2026-10-31), 87.9 s. Code `src/dorm1/Part1.tsx`, timing `scripts/dorm1/manifest.mjs`, sound `scripts/dorm1/bed.py`, composition `DormRules1`, voice `scripts/dorm1/gen_voice.sh`.
- Backdrops: `bg_dext.png` (Dormitory of Oulu Vocational College, Wikimedia Commons, CC0), `bg_dcorr.png` (Academic Block Corridor, Wikimedia Commons, CC0), `bg_home.png` as the dorm room (public domain). No credit needed.
- New: `Traveller` mood "agony" and a `colors` prop; the siren and the heart-monitor beep share one 42-frame rhythm; a small heart-monitor line in the corner that goes flat at the death; a lanyard on "you"; the cleaner (`LOOKS.cleaner`) with a trolley (a medicine tray under the cloth) and a mop.
