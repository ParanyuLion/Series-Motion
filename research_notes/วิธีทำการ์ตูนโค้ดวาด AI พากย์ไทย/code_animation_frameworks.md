# Code-driven 2D animation frameworks for LLM-authored cartoon scenes (as of Oct 2026)

Note on sourcing: about 10 searches/fetches were done. Items marked [UNVERIFIED] come from background knowledge, not from a source fetched in this session. The Instagram post (instagram.com/p/DecTQRbOcXU/) could not be read (login wall); its tool stack is unknown.

## Framework comparison (character animation, LLM-friendliness, MP4 rendering, audio, license, Windows)

### Takeaway
Two browser-based stacks fit best: Remotion (React, frame-driven, the most documented for Claude Code) and HyperFrames (HTML + GSAP, Apache-2.0, built for agents). Both capture frames in headless Chrome, so SVG and CSS are rendered deterministically. Motion Canvas is good for diagrams but weaker for character rigs. Rive, Theatre.js, Lottie, and Manim are poor fits for "LLM writes everything".

### Cited Findings
- Remotion renders by launching headless Chromium and screenshotting each frame (30 s at 30 fps = 900 screenshots). Skills install with `npx skills add remotion-dev/skills` per third-party tutorials, which warn the command varies; the official docs give `npx remotion skills add`. — [timewell.jp](https://timewell.jp/en/columns/remotion-claude-code-programmatic-video); [Remotion docs](https://www.remotion.dev/docs/ai/claude-code)
- Remotion official Claude Code setup: `npx create-video --yes --blank my-video`, `npm run dev`, then prompt the agent. The docs give no Windows-specific notes. — [Remotion docs](https://www.remotion.dev/docs/ai/claude-code)
- Remotion GitHub: ~65.9k stars, 39.5k commits. License is custom/source-available, with a company license required in some cases. — [GitHub](https://github.com/remotion-dev/remotion)
- Remotion pricing: free for individuals, non-profits, and for-profits of up to 3 employees. Creators tier is $25/seat/month (3-seat minimum, $100/month). Automators is $0.01 per render with a $100/month minimum. Enterprise starts at $500/month. — [Remotion pricing](https://www.remotion.dev/docs/license/pricing)
- Common Remotion pitfall: simultaneous animations because `<Sequence>` `from` offsets are missing. — [timewell.jp](https://timewell.jp/en/columns/remotion-claude-code-programmatic-video)
- HyperFrames (HeyGen): HTML + CSS + GSAP timeline to deterministic MP4. It uses Puppeteer and FFmpeg and needs Node 22+. GSAP, Lottie, Three.js, Anime.js, CSS, and WAAPI are supported as seekable adapters. The CLI is non-interactive and agent-oriented, with skills for Claude Code, Cursor, Codex, and others. License is Apache-2.0. GitHub shows ~68.9k stars. Audio is placed via `<audio>` elements and mixed with an audio skill, and a media skill can generate TTS/music. No specific TTS provider is named on the page. Rendering is single-machine. Windows guidance covers only Git LFS (winget install GitHub.GitLFS); the repo has ~240 MB of LFS test baselines. — [GitHub](https://github.com/heygen-com/hyperframes); [aggregator summary](https://developers.heygen.com/hyperframes-overview)
- HyperFrames is inspired by Remotion but authored in HTML rather than React. One comparison claims it is fully open source, while Remotion is source-available. The v0.7.42 / 33.7k-stars figures from a third-party listing conflict with the 68.9k stars on GitHub, so the repo is growing fast or the aggregator is stale. — [aggregator](https://bestofjs.org/projects/hyperframes); [GitHub](https://github.com/heygen-com/hyperframes)
- Motion Canvas: MIT license, ~18.9k stars (Aug 2026 snapshot). — [Star History](https://www.star-history.com/motion-canvas/motion-canvas/); [AlternativeTo](https://alternativeto.net/software/motion-canvas/about)
- Motion Canvas has third-party Claude skills (e.g. apoorvlathey/motion-canvas-skills). — [skills.sh](https://www.skills.sh/apoorvlathey/motion-canvas-skills/motion-canvas)
- Manim Community on Windows: easiest via `choco install manimce`, or install python.org Python plus ffmpeg, then `pip install manim`. Avoid the Windows Store Python. LaTeX is optional. — [Manim docs](https://docs.manim.community/en/stable/installation/windows.html)
- Rive vs Lottie: Rive is interactive (state machines) and its format is proprietary, controlled by the Rive team. Lottie is plain JSON from After Effects. Neither source addresses LLM authoring. — [LottieFiles blog](https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive.md); [toolradar](https://toolradar.com/compare/rive-vs-lottie)
- An SVG character-animation skill (in the OpenMontage repo) covers GSAP rigs built from SVG parts. It advises animating transforms, using timelines, and setting stable pivot points. In Remotion, GSAP must be driven by the current frame and not by requestAnimationFrame. It is HyperFrames-compatible. — [claudeskills.info](https://claudeskills.info/skills/calesthio/openmontage/svg-character-animation/)

### Inferences
- The remaining entries are my own assessment and [UNVERIFIED] unless noted above.
- Remotion: React/SVG/CSS. Characters are SVG groups with frame-driven `interpolate`/`spring`. Audio sync is built in (`<Audio>`, `<Sequence>`, durations from audio length, `calculateMetadata`). Rendering is deterministic and the CLI renders MP4 via FFmpeg. Typical cost is minutes per short video on a laptop. Highest LLM-friendliness, given the most tutorials and an official skill.
- HyperFrames: similar quality ceiling, and plain HTML/GSAP is the most common animation code in LLM training data. It is Apache-2.0, so it is the safer license for commercial use. It is newer, so API churn risk is higher.
- Motion Canvas: generator-function timeline model, good for diagrams and kinetic text. Scene description is declarative TSX. Audio sync is weaker and it is less used for characters. It is less common in LLM training data than React or GSAP.
- GSAP/anime.js + SVG alone: excellent character rigging (pivots, nested groups, easing) but no MP4 export by itself. It needs HyperFrames, Remotion, or a Puppeteer capture loop. GSAP became free for all uses after the Webflow acquisition [UNVERIFIED; check gsap.com/licensing].
- Theatre.js: a visual keyframe editor aimed at humans, with little value when the LLM writes the code. Rive: needs the Rive editor for rigs, with little LLM support. Lottie: a playback format, so the LLM would be writing JSON by hand, which is brittle. Lottie is useful only as a pre-made asset inside HyperFrames or Remotion.
- Three.js/Babylon: good for 2.5D parallax and camera moves, but heavier. Headless WebGL capture on Windows works but is slower and less deterministic. PixiJS/p5.js/Phaser: real-time loops, so frame-accurate capture needs extra work.
- Manim: designed for math, and poor for cartoon characters. Python (Cairo/Skia/Pillow + moviepy): fully deterministic and simple to install, but there is no ready-made animation layer, and the LLM would hand-roll rigs and easing. Slower iteration and lower visual polish.
- HTML plus headless-capture is the common mechanism under Remotion and HyperFrames, so a DIY version (Playwright screenshots, then FFmpeg) is possible but reinvents both.
- Windows 11: all Node-based options need Node LTS (HyperFrames needs 22+), FFmpeg on PATH, and Chrome/Chromium (downloaded automatically by Remotion [UNVERIFIED]). Walk through the install once and verify.

### Gaps
- No Windows-specific install gotchas were found in official docs for Remotion or HyperFrames.
- Theatre.js, PixiJS, Phaser, Three.js, Babylon, Skia, and moviepy were not researched directly; their entries above are background knowledge.
- Exact last-commit dates and current release numbers were not retrievable.
- The Instagram post content could not be accessed, so the claim that @promptkub used a specific framework is unverified.

## Real examples of LLM-generated animation

### Takeaway
Remotion plus Claude Code is the best-documented path (many tutorials, official skill), but almost all examples are motion graphics, logo reveals, and explainers, not walking characters. I found no verified end-to-end walk-cycle cartoon example.

### Cited Findings
- Multiple tutorials and videos cover Claude Code + Remotion for motion graphics, lower thirds, and transitions. Most are SEO or video-summary pages of mixed quality. — [OpenReplay](https://blog.openreplay.com/making-videos-claude-code-remotion/); [videohighlight](https://videohighlight.com/v/xAUifztpib8); [mindstudio](https://mindstudio.ai/blog/remotion-claude-code-animated-logo-reveals-motion-graphics)
- A newsletter prompt set recommends generating all visuals as SVG with no external assets, for fast-paced explainers. — [sabrina.dev](https://www.sabrina.dev/p/5-insane-claude-code-video-prompts)
- Codrops article: a developer rebuilt Claude's mascot animations by hand with SVG + GSAP + React (not shown to be LLM-written). — [Codrops](https://tympanus.net/codrops/?p=114688)
- GSAP MCP servers exist for LLM-driven GSAP code generation. — [glama.ai](https://glama.ai/mcp/servers/@glorynguyen/gsap-mcp/blob/282ab501ec51826502996fff45577b6bbffef34e/README.md)
- HeyGen's HyperFrames is explicitly designed for agents, and Hermes Agent ships a hyperframes skill. — [tessl.io](https://tessl.io/registry/skills/github/NousResearch/hermes-agent/hyperframes); [GitHub](https://github.com/heygen-com/hyperframes)

### Inferences
- Character motion (walk cycles) will likely need a reusable hand-authored rig library (SVG body parts with pivots plus parametric walk/gesture functions) that the LLM calls, rather than letting it freehand every shot. This is my judgment and is untested.
- LLMs draw simple flat SVG shapes well but struggle with complex anatomy and spatial layout, so a feedback loop (render frames, view PNGs, fix) matters [UNVERIFIED in sources].

### Gaps
- No Reddit/HN threads were retrieved. No verified repo that produces a full LLM-written walking-character cartoon.
- Quality of Claude's SVG character output has no benchmark found.

## Tradeoffs and recommendation

### Takeaway
Primary stack: Remotion + Claude Code + hand-built SVG character rig library + TTS audio. Alternative: HyperFrames (HTML/GSAP) if you prefer a permissive license or plain-HTML authoring. Use the license term as the tiebreaker.

### Cited Findings
- Remotion is free for individuals and companies of up to 3 employees; otherwise a paid company license is required. — [Remotion pricing](https://www.remotion.dev/docs/license/pricing)
- HyperFrames is Apache-2.0. — [GitHub](https://github.com/heygen-com/hyperframes)

### Inferences
- Authoring speed: Remotion and HyperFrames are both high, and a live preview (`npm run dev`) supports edit-code-and-reload iteration.
- Quality ceiling: SVG/CSS flat style is high. Add parallax layers, light-ray gradients with blend modes, camera via a wrapping transform group, and easing with squash/stretch.
- Render speed/cost: both are screenshot-bound (minutes per short video on a laptop, free locally). Remotion can parallelize across CPU cores via its concurrency setting [UNVERIFIED].
- Audio and Thai narration: generate the TTS audio first (Thai-capable engines such as Google/Azure/ElevenLabs, not researched here), measure durations, and set scene lengths from the audio. Remotion's `calculateMetadata` is the natural hook [UNVERIFIED].
- Recommendation 1: Remotion + Claude Code with the official skills. Safest for iteration and support, and the biggest community.
- Recommendation 2: HyperFrames + GSAP, for the same workflow with plain HTML/GSAP and the Apache license, accepting a younger project.
- Avoid for this goal: Rive, Theatre.js, Manim, Lottie hand-authoring, Phaser/p5 (all poor LLM-authoring or deterministic-render fit).
- Suggested next step: a 10-second spike on both (one character, walk cycle, one camera move, one TTS line) to compare how Claude does.

### Gaps
- No head-to-head test of Remotion vs HyperFrames for character animation found.
- Thai TTS options and lip-sync were out of scope and not researched.
