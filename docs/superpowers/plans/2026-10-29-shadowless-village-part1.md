# Shadowless village, Part 1 "เงาของคุณ" Implementation Plan

> For agentic workers: execute natively with a ledger (`.superpowers/sdd/...`), one review pass at the end.

**Goal:** a 9:16 Thai-narrated clip (about 1:20) from the approved script `docs/superpowers/specs/shadowless-village-part1-script-draft.md` (v2, stilt village).

**Architecture:** manifest-driven timing from the narration audio (`scripts/shadow1/manifest.mjs` -> `src/shadow1/manifest.json`, same pattern as `onestar3`); one backdrop photo painted over with OpenCV (`public/shadow1/bg_asia.png`, CC0) plus code-drawn pier, props and cast; the traveller is the turnable `Traveller` model, villagers are `Figure`; five sets (A landing, B platform, C walkways, D noon at the post, E afternoon) viewed through a moving camera, cut-ins drawn over a blurred copy of the same set, dips to dark only between sets.

**Spec:** `docs/superpowers/specs/2026-10-29-shadowless-village-design.md`.

## Global constraints
- Vertical 1080x1920, 30 fps; subtitle margins 60 left, 160 right, 340 bottom; each subtitle line at most 56 Thai characters without spaces.
- Only "you" and objects/animals cast shadows; villagers never do. Light from the upper right: skewX(-55), squash 0.34.
- The look is graded to the backdrop (`pv-grade` filter) with a thin haze overlay; no thick fog.
- Quality over speed: whole sets, 4 to 6 s holds, no ghosted cross-fades; stills of every angle and transition before rendering.
- Voice: Gemini Charon via Vertex (`scripts/shadow1/gen_voice.sh`); never re-voice for visual changes.

## Tasks
1. Voice + manifest + verify scripts (audio lengths drive every frame).
2. Sets A to E and the camera (`WorldCam`), cast poses (walk, point, sit, hat-brim shade), hard shadows.
3. Cut-ins (child's feet, goat/crate shadow, head's face and eyes drop, clapper, sweat drop, face line-up), title and teaser cards, subtitles, sound bed.
4. Stills check, proxy render, Opus review, one fix pass, final render, notes, copy to `finished/`, commit, push.
