# Examples and pipelines: AI writes code to draw animated shorts (as of Oct 2026)

Research limits: Instagram could not be read (WebFetch returned only "Instagram"), so the reference post's caption, comments and any follow-ups were NOT verified. Searches found nothing on "Stickocalypse", "stickocalypse_shorts", "The Last Farm" or "promptkub". Star counts below come from an aggregator list page and were not checked on GitHub itself. Reddit/X/HN threads were not retrieved (search returned none). Cost and time figures for this exact style were not found in any source.

## Q1. Which tools do @promptkub / @stickocalypse_shorts likely use? (confirmed vs guess)

### Takeaway
Nothing could be confirmed about either account's tools. The only evidence is the caption the user supplied (code-drawn shots, AI narration). The stack is inferred from the popular code-to-video options below.

### Cited Findings
- Instagram post fetch returned no caption or comments; the page text was only "Instagram" — [Instagram post](https://www.instagram.com/p/DecTQRbOcXU/)
- Web search found no pages mentioning "Stickocalypse" or "The Last Farm" (results were generic stick-figure Fiverr listings and unrelated projects) — search queries run, no URL to cite
- Web search found no pages on "promptkub" (results were generic AI animation generators) — search queries run, no URL to cite
- Official Remotion agent skills exist for coding agents including Claude Code, installed with `npx skills add remotion-dev/skills` — [Remotion docs](https://www.remotion.dev/docs/ai/skills)

### Inferences (guesses, not facts)
- Most likely candidates: Remotion (React/SVG/CSS) or HTML/Canvas rendered headless, driven by Claude Code or similar. This is a guess based on the 2026 ecosystem, not on any statement by the creators.
- "Flat 2D, walking, light rays" fits SVG rigs plus GSAP/Remotion `interpolate`, or Canvas 2D/p5.
- The narration is probably TTS. For Thai, a Thai-capable engine is needed (candidates: Gemini TTS, Azure, Google Cloud, Botnoi). Unverified: no source found tying any of them to this post.

### Gaps
- Open the IG post in a logged-in browser and read the caption, comments and pinned comments for tool names. Check @stickocalypse_shorts' profile/bio and the YouTube/TikTok versions.
- Search the original channel's Linktree or Patreon for a process post.

## Q2. Other creators, tutorials and repos (Claude Code / Remotion / SVG / p5 / Manim)

### Takeaway
There is a large 2026 ecosystem of Claude Code + Remotion tutorials and many small GitHub skills for code-drawn explainers and story shorts. Mature, official pieces are the Remotion skills and Manim skills. Story/character-focused repos are small and early.

### Cited Findings
- Remotion official skill pack. Skills include remotion-best-practices, create, markup, studio, render, captions, docs, upgrade, multimedia and others. Source lives in the Remotion repo under `packages/skills` — [Remotion docs](https://www.remotion.dev/docs/ai/skills)
- Guide to Claude Code + Remotion workflow: plan mode, then write `video_prompt.md` spec (timeline table, animation specs, asset checklist, constants), then "Create this video project using Remotion based on @video_prompt.md", then preview in Studio — [zerofuturetech Substack](https://zerofuturetech.substack.com/p/generate-videos-with-claude-code)
- Prompt pack for Claude Code + Remotion: begin each prompt with "Use the Remotion best practices skill", ask Claude to pause for script approval before coding, use safe zones and minimum font sizes; correction prompts after first render (e.g. "make the bars wider"). Examples are 15-30 s vertical videos, not stories — [sabrina.dev](https://www.sabrina.dev/p/5-insane-claude-code-video-prompts)
- Claude Code + Remotion tutorials: German Apidog guide (Thai version exists: [apidog.com/th](https://apidog.com/th/blog/claude-code-remotion/)), [Heyuan110 blog](https://www.heyuan110.com/posts/ai/2026-01-26-claude-code-remotion-video/), [Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code), [OpenReplay](https://blog.openreplay.com/making-videos-claude-code-remotion/). Search snippets warn install commands vary between posts (`npx skills add remotion-dev/skills` is the one on the official page; a mid-2026 third-party post cites `npx remotion skills add`, which I could not confirm).
- Thai-language source: Apidog Thai tutorial on turning Claude Code into a video director with Remotion — [apidog.com/th](https://apidog.com/th/blog/claude-code-remotion/) (I only saw the search summary; not fetched).
- Remotion tip (German guide summary): if all animations start together, missing `from` on `<Sequence>` is the usual cause — [apidog.com/de](https://apidog.com/de/blog/claude-code-remotion/) (via search summary)
- Aggregator list "awesome-claude-video-skills" (180 repos; star counts as shown there, unverified by me). Relevant entries — [list](https://github.com/zhuyansen/awesome-claude-video-skills):
  - ClaudeAnimationBase (p5.js + p5.brush, hand-painted cartoons with Claude, ~1.3k stars): https://github.com/JohnHeibel/ClaudeAnimationBase
  - code-animations (Claude Code skill, "a program draws every frame", Canvas 2D + Web Audio, headless to MP4, ~5 stars): https://github.com/beriki770-ship-it/code-animations (spelling as listed on the aggregator; verify)
  - git-story-film (2-minute hand-drawn film from Git history, in Raven repo): https://github.com/EverMind-AI/Raven/tree/HEAD/skills/git-story-film
  - dashi-animationstyle (narration to HTML/Canvas explainers, 7 styles): https://github.com/chuspeeism/dashi-animationstyle
  - whiteboard-video-skill (voice-over and captions): https://github.com/Matteoikarieth96/whiteboard-video-skill
  - doudou-remotion-whiteboard-skill: https://github.com/undsky/doudou-remotion-whiteboard-skill
  - animated-explainer-skills (single HTML + GSAP): https://github.com/BusyBee3333/animated-explainer-skills
  - claude-motion-skill: https://github.com/Hype-yolo/claude-motion-skill
  - manim_skill (~1.2k stars): https://github.com/adithya-s-k/manim_skill
  - notes-to-video (Manim + TTS + ffmpeg): https://github.com/cymcymcymcym/notes-to-video
- OpenMontage skills: svg-character-animation (SVG rigs with GSAP, CSS transforms, Remotion frame control), character-rigging (parts, pivots, constraints, reusable rig packages), character-animation-qa (schema checks, Playwright previews, frame sampling, ffprobe). Listing is marked unsigned/unverified — [skills-hub](https://skills-hub.ai/skills/openmontage-svg-character-animation); repo https://github.com/calesthio/OpenMontage
- alfredang/videocreation: topic to narrated video; Claude (via CLI) writes scene script, Edge TTS voiceover, Remotion renders; 9:16 or 16:9; web UI. Verified by me: 1 star, 0 forks, 11 commits, MIT badge; no subtitles mentioned — [repo](https://github.com/alfredang/videocreation)
- wshuyi/remotion-video-skill: Claude Code skill with Edge TTS (free) or MiniMax TTS, subtitles; MIT; last commit ~4 months before the search snapshot (per aggregator) — [SourcePulse](https://www.sourcepulse.org/projects/30711608)
- The Stickverse (Python + Gemini + OpenCV + MoviePy): Gemini parses story to JSON storyboard, human-recorded voice, loudness-driven lip flap, OpenCV frames. Verified by me: 0 stars, 4 commits — [repo](https://github.com/damianwgriggs/The-Stickverse), [HackerNoon write-up](https://hackernoon.com/i-built-a-poor-mans-pixar-using-python-gemini-and-my-sense-of-humor)
- Manim + LLM: manim-mcp (MCP server wrapping manimgl) — [README](https://cdn.jsdelivr.net/gh/paulnegz/manim-mcp@main/README.md); Generative Manim — [repo](https://github.com/raficharm/generative-manim); Manimator paper — [arXiv](https://arxiv.org/html/2507.14306v1)
- Comparison of Remotion vs Motion Canvas vs Manim — [beginnersinai](https://beginnersinai.org/remotion-vs-motion-canvas-vs-manim/) (low-authority blog)
- Search summary mentions a one-prompt ~8.7k-line Steve Jobs animation in Remotion + React + SVG and a Claude Code plugin where "every frame is drawn in code" — surfaced in a search result summary; I did not locate the primary source (unverified). Starting point list: [pexo.ai guide](https://pexo.ai/blog/best-video-generation-skills-for-claude-code-agents-2026-3772)

### Inferences
- For character-driven story shorts, the best-fit starting points are Remotion + official skills, plus OpenMontage's SVG rigging/QA skills and p5-based ClaudeAnimationBase for painted looks. All story-oriented repos are small; treat as references, not dependencies.

### Gaps
- No Reddit/X/HN threads or YouTube videos by hands-on creators of code-drawn story shorts were retrieved. Search for "Claude Code animated short" on X/Reddit with a browser.
- Motion Canvas: no LLM-specific open-source pipeline found.
- Maturity (stars, last commit) of the aggregator entries was not independently checked.

## Q3. Typical pipeline, prompts that work, failure modes

### Takeaway
Consensus pattern: plan first, write a spec file with timeline and constants, have the agent implement in code, preview in Studio, iterate with small correction prompts. Sources say little about character consistency and Thai-specific issues.

### Cited Findings
- Pipeline in tutorials: plan mode storyboard and copy, then spec file (project structure, timeline table in frames, animation specs, assets, copy), then implement, preview, render. Put frame counts and constants in the spec so edits are easy — [zerofuturetech](https://zerofuturetech.substack.com/p/generate-videos-with-claude-code)
- Approval gates: ask the agent to wait for script approval before coding — [sabrina.dev](https://www.sabrina.dev/p/5-insane-claude-code-video-prompts)
- Remotion output is deterministic (same code gives same video) per a search-result summary — [pexo.ai](https://pexo.ai/blog/programmatic-vs-ai-generated-video-with-claude-code-remotion-hyperframes-and-pexo-compared-6108) (vendor blog, treat with caution)
- Whole-pipeline example with a JSON storyboard from an LLM: strict "JSON only" prompts are needed or the animator crashes; loudness-based lip sync is crude — [HackerNoon](https://hackernoon.com/i-built-a-poor-mans-pixar-using-python-gemini-and-my-sense-of-humor)
- Remotion is stated to be unsuited to traditional editing and tends toward animated-presentation output — [zerofuturetech](https://zerofuturetech.substack.com/p/generate-videos-with-claude-code)
- OpenMontage's QA skill approach: schema checks, browser preview, frame sampling, ffprobe — [skills-hub](https://skills-hub.ai/skills/openmontage-svg-character-animation)
- Thai TTS/subtitle retiming: a search found only commercial tools (VMEG, HeyGen, GhostCut) noting Thai translation changes speech length so subtitles must be retimed; nothing Remotion-specific — [VMEG](https://www.vmeg.ai/tools/text-to-speech/thai/)

### Inferences (my suggestions, not sourced)
- Character consistency fix: define one shared SVG character component/rig (parts, pivots, palette constants) once and import it in every shot; never let the agent redraw per shot.
- Timing: generate narration first, measure each clip's duration, and compute scene frame counts from audio durations; use Whisper or the TTS word timestamps for subtitles.
- Rendering performance: render per scene, use Remotion concurrency options, avoid heavy SVG filters/blur for light rays (use gradients/opacity); preview at low resolution.
- Thai subtitles: use a Thai font (e.g. Noto Sans Thai / Sarabun) and word-segmented line breaks; verify in a rendered still.
- Expect roughly several iteration rounds per shot (unsourced estimate).

### Gaps
- No source documenting real failure modes for story shorts (walk cycles, light rays) or fixes.
- No source on Thai line-breaking in Remotion captions.

## Q4. Time, cost, iterations per minute

### Takeaway
No source gave measured time, cost or iteration counts for code-drawn story shorts.

### Cited Findings
- Tutorial examples are 15-60 s videos with no time/cost data; the prompt-pack author only notes similar videos sell for $200-500 on Fiverr (a market price, not a workflow cost) — [sabrina.dev](https://www.sabrina.dev/p/5-insane-claude-code-video-prompts)
- One Thai blog reports ~4 hours working with AI to build a cartoon-generating tool (different task; shows scale only) — [tommytalk](https://tommytalk.substack.com/p/ai)
- Claude Code needs a paid plan or API billing per tutorials; plan availability changes — [OpenReplay ES guide](https://blog.openreplay.com/es/crear-videos-claude-code-remotion/) (via search summary)
- Edge TTS is free (per repo descriptions above); MiniMax TTS is paid — [SourcePulse](https://www.sourcepulse.org/projects/30711608)

### Inferences
- Budget must be measured by the user with a pilot 15-second scene; any per-minute number would be a guess.

### Gaps
- Real per-minute token cost and wall-clock hours: not found.

## Q5. Related Claude skills / MCP / open-source projects (existence checked)

### Takeaway
Existence verified by fetch: Remotion skills page, alfredang/videocreation, The-Stickverse, skills-hub OpenMontage listing, awesome list. Others are listed only via aggregators/search snippets.

### Cited Findings
- Verified by fetch: Remotion skills (official, mature) — [docs](https://www.remotion.dev/docs/ai/skills); videocreation (1 star, early) — [repo](https://github.com/alfredang/videocreation); The-Stickverse (0 stars, hobby) — [repo](https://github.com/damianwgriggs/The-Stickverse); OpenMontage skills (listing unverified publisher) — [skills-hub](https://skills-hub.ai/skills/openmontage-svg-character-animation)
- Listed by aggregator only (not directly fetched): all repos in Q2, and manim-mcp, generative-manim (search results)
- Directory sites: [awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills), [agentskillshub](https://agentskillshub.top/best/claude-video-skills/)

### Gaps
- Security review of third-party skills not done; read SKILL.md before installing.
