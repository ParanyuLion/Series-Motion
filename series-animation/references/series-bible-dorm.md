# Series 6: "กฎเหล็กหอพัก ตี 3" (dorm iron rules)

Design: `docs/superpowers/specs/2026-10-31-dorm-rules-design.md`. Five parts, one hour each (03:00 to dawn), first person "ผม", rules as puzzles with a fair loophole, deaths shown bloodless (a limp corpse with an agonised face; blood only in the narration), the truth is a hospital bed (a coma "game" between life and death).

## Voice (user, 2026-10-31)
Gemini Sulafat, a normal speaking level with a cold, slightly eerie calm (not whispering, not slow), `--speed 1.25`, post-speed 1.0. Style string in `scripts/dorm1/gen_voice.sh`. The female voice narrating a male "ผม" is the user's choice. Importing `scripts/tts_gemini.py` as a module runs its main routine and overwrites `public/audio`: only run it from the command line.

## Part 1 "03:00 กฎข้อแรก"
- Script `docs/superpowers/specs/dorm-rules-part1-script-draft.md` (approved 2026-10-31), 73.4 s after the round-2 changes (voice post-speed 1.25). Code `src/dorm1/Part1.tsx`, timing `scripts/dorm1/manifest.mjs`, sound `scripts/dorm1/bed.py`, composition `DormRules1`, voice `scripts/dorm1/gen_voice.sh`.
- Backdrops (made with the softer `scripts/shadow1/cartoon_soft.py`): `bg_dext.png` (Dormitory of Oulu Vocational College, CC0), `bg_dcorr.png` (Academic Block Corridor, CC0), `bg_droom.png` (Twin room in a German youth hostel with single beds and wardrobe A, CC0; all Wikimedia Commons). No credit needed.
- New: moods "agony" in `Traveller` and `Figure`, a `colors` prop on `Traveller`; a lanyard on "you"; the cleaner (`LOOKS.cleaner`) with a trolley (a medicine tray under the cloth) and a mop. ต้น is a `Figure` (`LOOKS.ton`: messy hair, orange tee, no glasses), never a recoloured traveller.

## Round-2 rules from the user (2026-10-31)
- Voice 1.25x faster again (post-speed 1.25). Subtitles higher (bottom 420 px in this series).
- The siren sounds only while the rule is announced, shown as a loudspeaker-with-siren picture, then the rule card. No constant siren, no constant beep.
- The red light breathes slowly (a 4 s breath, a slow soft band); fast pulses made the user dizzy. No heart-monitor line in the corner.
- Backdrops must stay readable: the soft cartoon pass, not the heavy 14-colour one. The room photo must contain beds.
- Code-drawn props get gradients. A second character is a new design (hair, clothes, no glasses), never a recoloured main character.

## Round-3 rules from the user (2026-10-31)
- Never keep one establishing picture for more than about 5 s (the exterior hook was 10 s and felt too long): cut to the room as soon as the premise lines allow.
- A loudspeaker/PA speaks as an overlay on the picture with a speaking effect tied to the voice loudness, not as a separate full-screen picture.
- A character who speaks on screen moves the mouth. A dead face gets dark shadows to look scarier. The lanyard on the main character looked like a bug and was removed (the wristband clue is dropped). Render with `--crf=15`.
