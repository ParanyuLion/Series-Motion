# Pipeline: from script to video

Run everything from `E:\Coding\animation\Remotion` (Windows 11, Node 22, ffmpeg, Python 3.13 with numpy, scipy, edge-tts). Update this file when a command, a limit or a model quirk changes.

## The chain

1. **Script** → `scripts/island/part1.narration.json`: a JSON array. A line is a string, or `{"text": "...", "segments": [{"voice": "Leda", "text": "..."}, {"voice": "Charon", "text": "..."}]}` when several speakers share one subtitle (`text` is the subtitle).
2. **Voice** → `public/island1/n0.mp3 ... n9.mp3` (see Gemini below).
3. **Timing** → `node scripts/island/manifest.mjs` writes `src/island/manifest.json` (30 fps; the 6 s hook; 0.5 s before and 0.9 s after each later line; a 4.5 s outro; cues: `hookCut`, `aerialStart/End`, `mapIn/Out`, `skyChange`, `walkOutStart/End`, `walkBackStart/End`, `flash0/1`, `lineStart0..9`, `lineEnd0..9`). Nothing downstream hard-codes frame numbers; `Part1.tsx`, `camera.ts` and `bed.py` all read the cues.
4. **Sound** → `python scripts/island/bed.py` synthesises `public/island1/bed.wav` (low drone, a sparse lonely bell, wind, waves, rain and thunder in the hook, footsteps only while the hero walks, ducking under speech, a rumble into the sky change). Re-run it whenever the manifest changes.
5. **Checks** → `node scripts/island/verify.mjs` (30 fps, 10 shots, total 55 to 70 s, story end at most 65 s, bed length matches) and `node scripts/island/subtitle-check.mjs` (a line over 56 Thai characters fails).
6. **Pictures** → `npx remotion still src/index.ts Island1 out/x.png --frame=N --scale=0.3` for key frames, then look at them. Render with `npx remotion render src/index.ts Island1 out/island_part1.mp4 --codec=h264` (about 6 minutes).
7. **Loudness** → `ffmpeg -i out/island_part1.mp4 -af ebur128=peak=true -f null -`; target -20 to -14 LUFS (Part 1 is about -18.4).
8. **Audio-only changes** → `python scripts/remix.py out/in.mp4 out/new.mp4 --bed-gain 0.5 --manifest src/island/manifest.json --bed public/island1/bed.wav` (the video stream is copied; keep the gain equal to the bed `<Audio volume>` in `Part1.tsx`).
9. **Commit and push** to `main` of Series-Motion. `out/` (videos, stills, the TTS cache), `.env`, `node_modules/` and `.superpowers/` are git-ignored.

New part: add `Island2` next to `Island1` in `src/Root.tsx`, a `part2.narration.json`, `public/island2/`, and its own manifest, bed and verify scripts (copy and rename the Part 1 ones; keep the same structure and cue names where they apply).

## Gemini TTS (key in `Remotion/.env` as `GEMINI_API_KEY`; never print it)

Command: `GEMINI_TTS_MODEL=<model> python scripts/tts_gemini.py --script <json> --out-dir public/island1 --voice Charon --speed 1.1 [--post-speed 1.25]`.

- **Models in this account:** `gemini-2.5-flash-preview-tts` and `gemini-3.1-flash-tts-preview` work well (a style prefix in the prompt is not read aloud). **`gemini-3.8-flash-tts` reads the style prefix aloud** (a 3 s line became 16 to 30 s), so do not use it with the current style prompt. `gemini-3.8-flash-lite-tts` is not known to support Thai.
- **Quotas:** the free tier gives about 10 requests per day per model per project, plus a per-minute limit. The script waits out per-minute limits itself (up to 90 s). A daily limit (retryDelay of many hours) cannot be waited out: use another model whose quota is untouched, switch to a new key/project, enable billing, or use the Edge fallback. A line with a second speaker costs two requests.
- **Safety nets built into the script:** each finished line is cached in `out/tts_cache/<hash>` (keyed by script, voice, speed, model and style), so a re-run resumes without new requests; real files in `public/island1` are replaced only when every line succeeded; a failure names the line. `--post-speed` applies an extra speed-up when copying from the cache, which costs nothing.
- **Processing applied to every line:** atempo (the `--speed`), trim silence at both ends, loudnorm to -17 LUFS.
- **Part 1 audio as shipped:** lines 0 to 8 from `gemini-3.1-flash-tts-preview` (Charon, Irin's quote in Leda), line 9 from `gemini-2.5-flash-preview-tts` (the 3.1 daily quota ran out), speed 1.1 then post-speed 1.25. Recorded in `scripts/island/voice.txt`.
- **Charon is slow:** unsped it would run the story to about 75 s. Check the length after generating: `node scripts/island/manifest.mjs` (it throws if line 0 does not fit the hook) then `node scripts/island/verify.mjs`.

**Edge TTS fallback** (no key, provisional only): `python scripts/island/tts_edge.py --script <json> --out-dir public/island1` maps Charon to `th-TH-NiwatNeural` (rate -27%, pitch -6Hz) and Leda to `th-TH-PremwadeeNeural`. The service is unofficial and flaky (the script retries). Use it to keep working when Gemini is out of quota, then regenerate with Gemini; timing follows automatically.

## Practical notes

- Write files with the Write tool, not shell heredocs: a heredoc containing Thai or quotes once broke the shell command.
- A script that changes only pictures never needs the audio steps. After changing the manifest constants or the audio, re-run manifest, bed, verify, then render.
- Remotion is free for individuals and companies of up to 3 people; mention the licence if the user's situation changes.
- The brainstorming skill's visual companion (a local browser page for mockups) writes to `.superpowers/`; it is git-ignored and was stopped after use.
- Platform policy notes from earlier research: YouTube asks for disclosure only for realistic AI content, not for stylised animation; "inauthentic content" rules target mass-produced repetitive videos, so each part needs a real story. TikTok and Meta rules for 2026 were not verified.

## BTS series commands (same chain, folder `bts`)

Run from `Remotion/`: `GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview python scripts/tts_gemini.py --script scripts/bts/part1.narration.json --out-dir public/bts1 --voice Charon --speed 1.1 --post-speed 1.2`, then `node scripts/bts/manifest.mjs`, `python scripts/bts/bed.py`, `node scripts/bts/verify.mjs`, `node scripts/bts/subtitle-check.mjs`, and `npx remotion render src/index.ts Bts1 out/bts_part1.mp4 --codec=h264` (about 6 minutes). Preview compositions for review stills: `BtsCastPreview`, `BtsSetPreview`, `BtsGraphicsPreview`. The cues (`doorsClose`, `manTurns`, `biteAt`, `countdownStart`, `womanRises`, `stationPass`, `retreatStart`, `mapIn/Out`, `announceStart`, `cabOpens`) drive the picture, the camera (`src/bts/camera.ts`) and the sound (`scripts/bts/bed.py`); change the audio speed and everything follows. For a new part copy the `bts` folders and compositions and keep the same cue style.

