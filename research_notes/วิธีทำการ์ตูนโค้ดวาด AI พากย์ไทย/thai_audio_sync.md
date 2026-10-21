# Thai AI narration, subtitles, SFX and music synced to code-driven 2D animation (Remotion)

Research date: 2026-10-21. About 20 tool calls. Search results are often from snippets or summarised pages; items marked UNVERIFIED need a hands-on test. Several fetched facts (for example the model name "Gemini 3.8 Flash TTS") come from a single page summary and should be re-checked.

## 1. Narration-first workflow: audio duration drives shot length in Remotion

### Takeaway
Remotion's `calculateMetadata` on a `<Composition>` can read an audio file's duration (via Mediabunny, or `parseMedia` in older docs) and return `durationInFrames`. So the pipeline is: script, per-shot TTS mp3, a manifest with durations and timestamps, then Remotion derives each shot's length. Props are overridable at render time, so a JSON manifest can be passed in.

### Cited Findings
- The official dynamic-metadata page shows `calculateMetadata` returning `durationInFrames` (and optionally fps, width, height) computed from media length. Current docs use a Mediabunny helper: `new Input({formats: ALL_FORMATS, source: new UrlSource(src)})` then `input.computeDuration()`. Older docs used `parseMedia` from `@remotion/media-parser`. — [Remotion dynamic metadata](https://www.remotion.dev/docs/dynamic-metadata.md)
- The audio version of that helper (`getAudioDuration(src)` via `computeDuration()`) and the `Math.floor(durationInSeconds * 30)` example were extrapolated from the video example by the fetch tool, not shown verbatim on the page; the page does not document an audio-specific example. Use `Math.ceil` to avoid clipping the tail. — [Remotion dynamic metadata](https://www.remotion.dev/docs/dynamic-metadata.md)
- `props` defaults to `defaultProps` but input props passed at render time override it. For `<Player>`, reuse the same `calculateMetadata()` function. — [Remotion dynamic metadata](https://www.remotion.dev/docs/dynamic-metadata.md)
- The docs say `useEffect()` data fetching for metadata is "not recommended anymore since v4.0" because it also runs when a render worker spawns. — [Remotion dynamic metadata](https://www.remotion.dev/docs/dynamic-metadata.md)
- A third-party guide shows summing the durations of several sources with `Promise.all` and rounding up to frames. — [calculate-metadata skill mirror](https://docs.creem.io/.cursor/skills/remotion-best-practices/rules/calculate-metadata)
- Frame-based volume is done with `interpolate(frame, [...], [...], {extrapolateLeft:'clamp', extrapolateRight:'clamp'})` passed to `<Audio volume={...}>`; values below 0 are not allowed. — [Remotion volume docs](https://www.remotion.dev/docs/audio/volume)

### Inferences
- Recommended structure (my design, not from one source):
  - `script/shots.json`: `[{id, speaker, text_th, sfx:[...], music_cue}]`
  - `scripts/tts.mjs`: for each shot, call TTS, save `public/audio/<id>.mp3`, and write `public/audio/<id>.json` with `{durationSec, words:[{text,startMs,endMs}]}`. Cache by hash of (text+voice+model+settings) so reruns are free and deterministic.
  - `src/Root.tsx`: one `<Composition id="Film">` whose `calculateMetadata` loads the manifest, computes `pad = 0.3 s` plus `ceil(dur*fps)` per shot, and returns total `durationInFrames` and per-shot `{from, durationInFrames}` in props.
  - `src/Film.tsx`: map shots to `<Sequence from durationInFrames>`; inside each, an `<Audio src>`, the scene component (receives `durationInFrames` and word timings), and `<Captions>`. Animation timing within a shot is expressed as fractions of shot length or as word-anchored frames (`frameOfWord(i)`), so a longer narration automatically stretches the animation.
  - Alternative to per-shot concatenation: use `<Series>`; if shots must overlap (transitions), subtract overlap in the sum.
- Generate per-shot audio rather than one long file so a re-recorded sentence changes only one shot. Pass `previous_text`/`next_text` (ElevenLabs) for prosody continuity across separately generated clips (see section 2).

### Gaps
- Not verified: exact current helper names in the user's installed Remotion version (docs changed from `parseMedia` to Mediabunny); no Windows run was done.
- Not verified: how well `UrlSource` handles `staticFile()` local paths during render (likely fine over the dev server; test).

## 2. Word-level timestamps for Thai: TTS-native alignment vs Whisper/forced alignment; Thai word segmentation

### Takeaway
ElevenLabs returns character-level alignment with the audio (convert-with-timestamps), and Azure emits WordBoundary events; both avoid a second ASR pass. Thai support in these timestamp paths is NOT confirmed by docs, and Thai has no spaces so word-level output must be re-grouped with a segmenter. Gemini TTS docs mention no timestamps, so use Whisper-type ASR on its output. Forced alignment tools have weak out-of-the-box Thai support.

### Cited Findings
- ElevenLabs `convert-with-timestamps` returns `audio_base64`, `alignment` (original text) and `normalized_alignment` (after normalization), each with `characters`, `character_start_times_seconds`, `character_end_times_seconds`. The page lists no supported-model table and no Thai notes; default model is `eleven_multilingual_v2`. Params include `previous_text`, `next_text`, `previous_request_ids`/`next_request_ids` (up to 3), `seed` (best-effort determinism only). — [ElevenLabs convert-with-timestamps](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)
- A streaming-with-timestamps variant exists in the official API reference. — [ElevenLabs streaming with timestamps](https://elevenlabs.io/docs/api-reference/streaming-with-timestamps)
- Eleven v3 supports Thai (70+ languages); Multilingual v2 (29 languages) and Flash v2.5 (32) do not list Thai. v3 limit is 5,000 characters per request. The models page does not say whether v3 supports with-timestamps. — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- ElevenLabs text-to-dialogue with timestamps: `inputs` list of `{text, voice_id}`, default model `eleven_v3`, response includes `voice_segments` (`voice_id`, `start_time_seconds`, `end_time_seconds`, character indices, `dialogue_input_index`) plus character `alignment`. Max 10 unique voices per request; keep total text at or below 2,000 characters for reliability. — [ElevenLabs dialogue with timestamps](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps.md)
- ElevenLabs Forced Alignment: audio plus plain-text transcript in, word/phrase timestamps out; its language list (29 languages) does not include Thai, so Thai likely unsupported. Billed like Speech to Text. — [ElevenLabs Forced Alignment](https://elevenlabs.io/docs/overview/capabilities/forced-alignment)
- Azure `WordBoundary` event fires at the start of each spoken word, punctuation mark and sentence; fields `audio_offset` (100 ns ticks; ms = (offset+5000)/10000), `text`, `text_offset`, `word_length`, `boundary_type` (Word/Punctuation/Sentence), `duration`. Sentence boundaries need `SpeechServiceResponse_RequestSentenceBoundary=true`. Also `BookmarkReached` via SSML `<bookmark mark=.../>` and viseme events. — [Azure speech synthesis how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis#subscribe-to-synthesizer-events)
- Azure Thai voices include th-TH-PremwadeeNeural, NiwatNeural, AcharaNeural. — [json2video voice listing](https://json2video.com/ai-voices/azure/voices/th-th-premwadeeneural/)
- Azure WordBoundary known issues reported in Microsoft Q&A: offset/duration all zero in SDK 1.33.0 and 1.36.0 in one report; event not fired from the neural TTS container over HTTP (needs websocket). — [MS Q&A offset zero](https://learn.microsoft.com/en-sg/answers/questions/1651510/azure-text-to-speech-wordboundary-event-always-ret), [MS Q&A container](https://learn.microsoft.com/en-us/answers/questions/1613851/wordboundary-event-not-called-when-using-neural-te)
- A Microsoft Q&A thread reports Thai prosody control (break, rate, pitch) problems that other languages do not show. — [MS Q&A](https://learn.microsoft.com/en-us/answers/questions/1146448/(text-to-speech)-break-rate-pitch-is-a-problem-wit)
- Gemini API speech docs: the fetched page lists models "Gemini 3.8 Flash TTS", "3.8 Flash-Lite TTS", "3.1 Flash TTS Preview", "2.5 Pro Preview TTS" (names as reported by the fetch tool; verify). Thai is marked supported for 3.8 Flash TTS and unsupported for 3.8 Flash-Lite TTS. The page mentions no timestamps. — [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- Remotion transcription options: `@remotion/install-whisper-cpp` (local, free, needs server), `@remotion/whisper-webgpu`, `@remotion/whisper-web` (WASM), `@remotion/openai-whisper` (cloud), `@remotion/elevenlabs` (cloud STT). Output converts to the `Caption` type used by `@remotion/captions` (`createTikTokStyleCaptions()`). — [Remotion transcribing](https://www.remotion.dev/docs/captions/transcribing)
- `convertToCaptions()` deprecated since Remotion 4.0.216; use `toCaptions()` from `@remotion/install-whisper-cpp`. For non-English, change `WHISPER_MODEL` in the TikTok template's `whisper-config.mjs` to a model without the `.en` suffix. — [Remotion convert-to-captions](https://www.remotion.dev/docs/install-whisper-cpp/convert-to-captions), [template-tiktok](https://github.com/remotion-dev/template-tiktok)
- Thai Whisper fine-tunes: biodatlab Thonburian `whisper-th-medium-combined` reports WER 7.42 on Common Voice 13 Thai (Deepcut tokenizer); the `-timestamp` variant reports 15.57 WER and its card warns timestamps are less precise than manual annotation and trained with pseudo-timestamps. — [HF whisper-th-medium-combined](https://huggingface.co/biodatlab/whisper-th-medium-combined), [HF whisper-th-medium-timestamp](https://huggingface.co/biodatlab/whisper-th-medium-timestamp)
- Vendor-run (ElevenLabs, biased) FLEURS Thai comparison: Whisper Large v3 35.6% WER vs Scribe v1 11.6%. — [ElevenLabs Thai STT page](https://elevenlabs.io/speech-to-text/thai)
- WhisperX default alignment models (per a third-party mirror of `alignment.py`) cover en, fr, de, es, it and a few others, no Thai; a custom `--align_model` (Hugging Face wav2vec2 CTC) can be supplied. Unverified against current upstream. — [mirror of alignment.py](https://huggingface.co/spaces/Sven33/SATEv1.5/blob/main/transcription/whisperx/alignment.py), [WhisperX README](https://github.com/jebdu/whisperX/blob/main/README.md)
- `Intl.Segmenter` is Baseline 2024; `granularity:'word'` gives segments with `isWordLike`. MDN notes `split(" ")` fails for Thai, Lao, Khmer etc. — [MDN Intl.Segmenter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- ICU's classic Thai engine is dictionary-based with lookahead; ICU4X uses LSTM for Thai by default. Which one Chrome ships was not confirmed. — [ICU dictbe.cpp](https://opensource.apple.com/source/ICU/ICU-66108/icuSources/common/dictbe.cpp.auto.html), [ICU4X WordSegmenter](https://icu4x.unicode.org/1_5/tsdoc/classes/WordSegmenter.html)
- W3C CSS discussion: dictionary matching alone is inadequate for Thai word breaking; browsers disagree on Thai breaks. — [W3C CSS archive](https://lists.w3.org/Archives/Public/public-css-archive/2018Mar/0780.html)

### Inferences
- Recommended order of preference for timing (my judgment): (a) ElevenLabs with-timestamps character alignment, test it with a Thai v3 call first; (b) Azure WordBoundary if Azure voice is chosen (test Thai output); (c) for Gemini/Botnoi/F5-TTS or any audio with no timing, run whisper.cpp or faster-whisper on the generated audio. Because the script text is known, a hybrid is best: use ASR only for timing, and map back to the original script text by character-proportional alignment inside each ASR segment.
- Character alignment can be grouped into words by running `Intl.Segmenter('th',{granularity:'word'})` (or PyThaiNLP `newmm`/`attacut`, server-side) on the same text and summing char indices; Thai combining marks mean the alignment array may index by code point vs UTF-16, so check lengths.
- Subtitle line breaking: segment first, then build lines at word boundaries, and render with `word-break: keep-all`-style control by inserting `<wbr>`/zero-width spaces (U+200B) between segmented words so the browser does not split mid-word. UNVERIFIED in practice.
- Simplest robust fallback for karaoke: highlight by phrase chunks (3-6 words) rather than single Thai words, since Thai readers parse phrases and ASR word boundaries are noisy.

### Gaps
- No source confirms that ElevenLabs v3 returns correct alignment for Thai (nor whether v3 accepts the with-timestamps endpoint). Needs a test call.
- No source confirms Azure WordBoundary quality for Thai (no spaces; boundaries may be per word or per syllable chunk).
- No measured Thai word-timestamp error (ms) for any Whisper variant; no Pathumma or Thonburian large-v3 results found. faster-whisper/whisper.cpp Thai timing accuracy not benchmarked in sources.
- No source on Intl.Segmenter Thai quality vs PyThaiNLP; wordcut not researched.
- Gemini TTS: absence of timestamps is not explicitly confirmed, only unmentioned.

## 3. Thai subtitle rendering in Remotion/browser; fonts; karaoke captions

### Takeaway
Use `@remotion/google-fonts` with an explicit Thai subset and weights, a generous line-height (about 1.5-1.7) to avoid clipping stacked vowels and tone marks, and Remotion's `@remotion/captions` for page grouping. Test rendering in the actual headless Chrome, not just Studio.

### Cited Findings
- `loadFont` from `@remotion/google-fonts/<Font>` accepts `weights` and `subsets`; calling without arguments in v4 loads everything and may cause many requests or timeouts; from v5.0 weights and subsets must be non-empty. Load multiple fonts in one module with a `waitForFonts()` helper. The fetched page did not mention Noto Sans Thai; the path `@remotion/google-fonts/NotoSansThai` with subset `thai` is assumed. — [Remotion loadFont](https://www.remotion.dev/docs/google-fonts/load-font)
- An informal SuttaCentral test found tall scripts including Thai clipped at line-height 1.1 and needed about 1.6. — [SuttaCentral forum](https://discourse.suttacentral.net/t/testing-for-line-height-with-tall-scripts/6196)
- Vendor page: Thai vowels and tone marks stack up to two levels above and one below the base; lack of spaces means whitespace wrapping can leave unbreakable runs that overflow. (Marketing source.) — [appscreenshotstudio](https://appscreenshotstudio.com/thai-app-store-screenshots)
- W3C Thai Layout Requirements covers line breaking and line height (content not retrieved). — [W3C thai-lreq](https://www.w3.org/TR/2024/DNOTE-thai-lreq-20240430/)
- Remotion `createTikTokStyleCaptions()` from `@remotion/captions` groups `Caption` items into pages for TikTok-style captions; the TikTok template installs whisper.cpp and downloads a large model. — [Remotion transcribing](https://www.remotion.dev/docs/captions/transcribing), [template-tiktok](https://github.com/remotion-dev/template-tiktok)

### Inferences
- Candidate fonts (from my knowledge, not verified in sources): Noto Sans Thai, Sarabun, Prompt, Kanit, Mitr, Noto Sans Thai Looped (looped vs loopless styles; children's cartoons often use Mitr/Prompt/Kanit for bold titles, Sarabun/Noto Sans Thai for subtitles). Check each font actually includes the Thai subset via `getInfo`.
- Rendering tips: set `line-height:1.6`, `padding-top` for caption box, `text-rendering: optimizeLegibility`, avoid `letter-spacing` and avoid `text-transform` and CSS `font-variant`, since letter-spacing can break Thai cluster shaping. Use text stroke via `paint-order: stroke fill` and `-webkit-text-stroke`, or `text-shadow` for readability. UNVERIFIED but standard practice; verify by rendering a stress string with stacked marks (e.g. "ผู้ปั้น", "ที่นี่", "กรุ๊ป").
- Karaoke: each caption page = array of `{text,startMs,endMs}` words; per frame compute the active word with `frame/fps*1000`, and colour or scale it. Because Remotion's `Caption` convention (from English) prefixes tokens with spaces, for Thai concatenate tokens without inserting spaces.
- Alternative: generate SRT/VTT with a script and burn with ffmpeg `subtitles` (libass), but libass Thai shaping and font fallback on Windows needs `fontsdir`; the Remotion/React route gives better control. UNVERIFIED.

### Gaps
- No source comparing Sarabun/Prompt/Kanit/Noto Sans Thai clipping behaviour; no Remotion-specific Thai caption example found; `Caption` type page returned 404, so its exact fields (text, startMs, endMs, timestampMs, confidence) are from memory (UNVERIFIED).

## 4. Sound effects and music: sources, licensing, mixing and ducking

### Takeaway
Use CC0/Pixabay-style libraries or paid-plan AI SFX with clear commercial terms; treat Suno/Udio as legally riskier and check current terms. Do ducking either with Remotion keyframed volume (deterministic from the known narration timings) or ffmpeg `sidechaincompress`.

### Cited Findings
- ElevenLabs sound effects are described on official pages as royalty-free for commercial projects; the free tier requires attribution to elevenlabs.io, paid plans do not; licence tied to the plan; reselling the tools or building competing products is barred. Source quality: mostly official marketing pages plus aggregators. — [ElevenLabs commercial SFX page](https://elevenlabs.io/ko/sound-effects/commercial), [smallest.ai licensing checklist](https://smallest.ai/blog/elevenlabs-alternatives-for-commercial-use-licensing-checklist-and-safe-workflows)
- Suno ToS (as quoted by a blog): no warranty that copyright vests in outputs; paid tiers grant commercial use rights. Udio settled with UMG and later Warner; reports conflict on export (one says WAV/stem downloads suspended April 2026). Affiliate-blog sources; check official terms. — [Dubspot AI music licensing 2026](https://blog.dubspot.com/ai-music-licensing-explained-2026), [Dupple Suno vs Udio](https://dupple.com/learn/suno-vs-udio)
- Pixabay Content License: commercial use without attribution, but no resale of sounds as standalone files. Freesound: per-file CC0 / CC-BY / CC-BY-NC, so filter for CC0 or track attribution. YouTube Audio Library: some tracks CC-BY needing credit; SFX rights outside YouTube unclear. All via secondary guides. — [Cinevva guide](https://app.cinevva.com/guides/free-sound-effects-music), [vidIQ YouTube Audio Library](https://www.vidiq.com/blog/post/royalty-free-music-youtube-audio-library)
- ffmpeg ducking: `sidechaincompress` with voice as key and music as signal; a skill doc template: `[music][vo_sc]sidechaincompress=threshold=<t>:ratio=<r>:attack=20:release=600[ducked]`, then combine with `amix` (not `amerge`, which errored in one forum thread). Not verified by running. — [mix-master skill](https://tessl.io/registry/skills/github/gooseworks-ai/goose-skills/mix-master), [ffmpeg-user thread](https://lists.ffmpeg.org/pipermail/ffmpeg-user/2018-August/040933.html)
- Remotion ducking example: `interpolate(frame,[30,40,90,100],[1,0.2,0.2,1],{...clamp})` passed as `volume`. — [Remotion volume docs](https://www.remotion.dev/docs/audio/volume)

### Inferences
- Because narration timings are known from the manifest, Remotion-side ducking is deterministic: build a `duckEnvelope(frame)` from the union of narration `[start,end]` windows with 6-10 frame ramps. This keeps everything in one render and avoids ffmpeg filter graphs. ffmpeg `sidechaincompress` is better as a post-process if audio is mixed outside Remotion.
- Place SFX by tagging shots in the script (`sfx:[{name,atWord|atFrame}]`) and anchoring to word timestamps; wrap each in `<Sequence from><Audio src/></Sequence>`.
- Safe default: SFX from CC0 sources (Freesound CC0 filter, Pixabay) or ElevenLabs SFX on a paid plan; music from CC0/Pixabay or a licensed library; keep a `credits.json` with source and licence per asset; loudness target about -16 LUFS for web (my knowledge, UNVERIFIED here).
- Thai-specific (UNVERIFIED): no source checked for Thai-friendly music libraries.

### Gaps
- No primary-source text of Pixabay, Freesound, Suno or Udio licences retrieved; no ElevenLabs official SFX API licence text read; no Remotion `<Sequence>`/`<Audio>` trimming docs fetched (`trimBefore`, `loop`, `playbackRate`); ffmpeg command not tested; Kevin MacLeod/Incompetech and others not researched.

## 5. Multi-character Thai dialogue: multi-voice workflows, consistency, emotion tags

### Takeaway
Two practical routes: ElevenLabs text-to-dialogue (up to 10 voices per request, v3, with timing and per-voice segments) or one TTS call per line with a fixed voice ID per character. Gemini does 2 speakers per request with prebuilt voices, and supports style instructions and inline sound tags.

### Cited Findings
- ElevenLabs text-to-dialogue: `inputs:[{text,voice_id}]`, max 10 unique voices, keep total at or below 2,000 characters for reliability, response `voice_segments` give per-line start/end seconds. `settings.stability` default 0.5; `seed` best-effort determinism; `previous_text`/`future_text` up to 100 characters each. — [ElevenLabs dialogue with timestamps](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps.md)
- Eleven v3 supports Thai; audio tags are not listed for v3 on the models page (listed for v3 Conversational), so tag support for Thai must be tested. — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- Gemini TTS: up to 2 speakers in one request, only with prebuilt voices; custom voices must be synthesized turn by turn. Delivery via `speech_metadata.style` (e.g. "whispered urgently"), inline `<laugh>` or `<short pause>`; the `text` field is treated as a verbatim transcript. Voice design/replication only on the 3.8 models; stateful custom voices capped at 200 per project (1-year TTL), stateless voice keys 7-day TTL. — [Gemini API speech generation](https://ai.google.dev/gemini-api/docs/speech-generation)
- Azure Thai offers three named voices (Premwadee, Niwat, Achara); SSML bookmarks available for event timing. Style support (`mstts:express-as`) for Thai not confirmed. — [json2video](https://json2video.com/ai-voices/azure/voices/th-th-premwadeeneural/), [Azure how-to](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis#subscribe-to-synthesizer-events)

### Inferences
- Voice consistency per character: store `characters.json` mapping `name -> {provider, voiceId, model, stability, seed, style}` and cache-key every line; avoid changing model versions mid-project.
- Per-line generation gives per-line durations, which maps cleanly onto Remotion shots and lets lip-flap/mouth animation key off each line's word timings; the dialogue endpoint gives more natural turn-taking but one 2,000-character request yields one audio that must be sliced with `voice_segments` (use it for scenes, then slice or use `<Audio startFrom/endAt>`).
- Emotion: keep a tag vocabulary in the script (e.g. `[excited]`, `[whispers]`) and test per provider; strip tags from the subtitle text so they are not burned in.

### Gaps
- No data on Thai emotion-tag quality in v3; no Botnoi/iApp/F5-TTS-THAI multi-voice or timestamp API details (covered by prior research, not rechecked); Gemini 3.8 model names unconfirmed by a second source.

## 6. Windows 11 setup: Node, ffmpeg, Chrome headless, GPU, render speed

### Takeaway
Remotion renders in headless Chrome and encodes with its bundled ffmpeg; the render is mostly CPU-bound and parallelised by concurrency. GPU is optional and mainly helps WebGL/canvas-heavy scenes.

### Cited Findings
- `setConcurrency()` / `--concurrency` sets the number of browser tabs rendering in parallel; default is half of the CPU threads. — [Remotion config](https://www.remotion.dev/docs/config)
- In headless mode Chrome historically disabled the GPU; since Chrome 98 GPU can be used; `npx remotion gpu --gl=angle` shows how Chrome uses the GPU. `--gl=angle` was removed as default after a memory leak (render long videos in parts). In Remotion 5.0 docs say WebGL/WebGPU are enabled automatically where possible. Default chrome mode is `headless-shell`; `chrome-for-testing` is suggested for GPU drivers on Linux. — [Remotion GPU docs](https://www.remotion.dev/docs/cli/gpu), [Remotion WebGL](https://www.remotion.dev/docs/webgl)
- The `remotion benchmark` CLI exists for tuning concurrency. — [Remotion benchmark](https://www.remotion.dev/docs/cli/benchmark)
- whisper.cpp via `@remotion/install-whisper-cpp` is local and free; Remotion's template downloads whisper.cpp and a roughly 1.5 GB model. — [Remotion transcribing](https://www.remotion.dev/docs/captions/transcribing), [template-tiktok](https://github.com/remotion-dev/template-tiktok)

### Inferences
- Likely setup (my knowledge, verify against docs): Node 20+ LTS, `npx create-video@latest`, Remotion downloads its own Chrome Headless Shell and ffmpeg on first render (no separate ffmpeg install required for rendering; install a system ffmpeg only for post-processing such as sidechain ducking: `winget install Gyan.FFmpeg`). 2D vector/CSS/SVG shots do not need a GPU. Run `npx remotion benchmark` to choose concurrency; on 16 GB RAM keep concurrency at or below roughly 6-8. Whisper on Windows: whisper.cpp builds via Remotion's installer (needs a C++ toolchain/cmake in some cases, UNVERIFIED on Windows); faster-whisper with CUDA is an alternative if an NVIDIA GPU exists.
- Use `staticFile()` and keep audio under `public/` so `calculateMetadata` and renders can fetch them over the bundler's server.

### Gaps
- The Remotion Windows page returned 404; no Windows-specific caveats were retrieved (e.g. path length, antivirus, Visual C++ requirements). No render-speed benchmarks for 2D shots found. GPU memory/`--gl` defaults for the user's Remotion version unconfirmed.
