# Claude Code skills, MCP servers, plugins and open-source pipelines for AI cartoons with voice-over

Note: research was done via WebSearch snippets (about 14 calls) with one primary-page fetch (Remotion docs). Most star counts and "last updated" values were NOT verified on GitHub (GitHub MCP was unavailable). Verify before depending on any item. Date of research: 2026-10-21.

## Q1. Which published skills / MCP servers / plugins exist for each pipeline stage?

### Takeaway
Video assembly (Remotion), TTS (ElevenLabs), and multi-model generation (fal.ai, Runway, Gemini/Veo) have first-party or official tooling that works from Claude Code. Storyboarding skills exist but are mostly community-made, small, and aimed at specific video models. Lip-sync and ComfyUI control are only available as community MCP servers or standalone models.

### Cited Findings

**Video assembly / editing**
- Remotion publishes official Agent Skills. Install: `npx skills add remotion-dev/skills`, or accept the prompt during `bun create video`. The skills list includes `/remotion-captions` (captions and subtitles), `/remotion-markup` (compositions, animation, audio, typography, fonts, timing), and `/remotion-multimedia` (Mediabunny metadata). Whisper and Thai are not mentioned on that page. — [Remotion AI skills docs](https://www.remotion.dev/docs/ai/skills)
- The skills CLI installs into `.agents/skills`, and `.claude/skills` is symlinked to it for Claude Code. `npx remotion skills` also has add/update subcommands. — [Remotion CLI skills](https://www.remotion.dev/docs/cli/skills), as summarized by search (page not fetched directly)
- A third-party write-up says the main bundle is named `remotion-best-practices` and covers animation, timing, audio, captions and 3D. — [mer.vin](https://mer.vin/2026/05/remotion-agent-skills-install-remotion-dev-skills-for-claude-code-and-cursor/) (secondary source)
- A community skill `remotion-video-creation` (affaan-m/ecc): `npx -y skills add affaan-m/ecc --skill remotion-video-creation --agent claude-code`. — [claudemarketplaces.com](https://claudemarketplaces.com/skills/affaan-m/ecc/remotion-video-creation)
- A Portuguese guide claims a plugin marketplace `claude plugin marketplace add remotion-dev/claude-code-plugin`. UNVERIFIED; not confirmed on Remotion's pages. — [horadecodar](https://horadecodar.com.br/?p=44180)
- ffmpeg MCP servers (all found via directory listings, repos not opened):
  - `ffmpeg-mcp-server` (PedroMarianoAlmeida/ffmpeg-mcp, npm). Tools: cut_video, image_to_video, concat_videos, convert, remove_silence, ffmpeg_raw. Bundles ffmpeg-static, so no system ffmpeg is needed, which is useful on Windows. Install: `npm install -g ffmpeg-mcp-server`. — [Socket](https://socket.dev/npm/package/ffmpeg-mcp-server)
  - `mcp-video` (kyanitelabs): Python server, library and CLI wrapping ffmpeg, with subtitles, audio generation, effects and rendering. Listed as Apache 2.0. — [mcpservers.org](https://mcpservers.org/es/servers/kyanitelabs/mcp-video)
  - `video-creator/ffmpeg-mcp`: natural-language cut/stitch/overlay. A directory reports 134 stars (unverified). — [enterprisedna](https://enterprisedna.co/directories/mcp/video-creator-ffmpeg-mcp)

**Storyboard / script skills**
- `elementsix/elementsix-skills` (seedance-storyboard): storyboard prompts for Seedance 2.0 (style, camera, motion, sound, shot breakdown). MIT. Installed via the Claude Code plugin marketplace. Aimed at Chinese users. — [sourcepulse](https://www.sourcepulse.org/projects/29109188)
- `majiayu000/claude-skill-registry` create-storyboard: turns a screenplay into an animatic through dialogue, with an auto-approve mode. — [openskillindex](https://openskillindex.com/skills/majiayu000-claude-skill-registry-create-storyboard)
- `pexoai/pexo-skills` videoagent-director: idea to a 3-9 shot plan. Install: `npx -y skills add pexoai/pexo-skills --skill videoagent-director --agent claude-code`. — [claudemarketplaces](https://claudemarketplaces.com/skills/pexoai/pexo-skills/videoagent-director)
- `t0ugh/videoclaw` video-i2v-from-storyboard: about 110 stars per the listing. — [skillselion](https://skillselion.com/skills/t0ugh/videoclaw/video-i2v-from-storyboard)
- Vendor skills also exist: Pictory (Claude skills over its API) — [docs](https://docs.pictory.ai/claude-skills/overview.md); HeyGen skills repo (mentioned in search results only). Both are paid SaaS.
- I did not find a canonical "awesome-claude-skills" repo or the anthropics/skills contents in the results. Not researched further (gap).

**Image / video generation MCP**
- Official fal.ai MCP at `mcp.fal.ai/mcp`, HTTP transport, your fal API key in an Authorization header, giving access to 1,000+ models (model search, schema check, inference). Works with Claude Code. — [fal docs](https://fal.ai/docs/model-apis/mcp), [fal blog](https://blog.fal.ai/connect-your-ai-to-1-000-models-with-the-fal-mcp-server)
- Community fal servers exist (raveenb/fal-mcp-server, others) with Kling, Veo, Sora and LTX tools. Maintenance unverified. — [glama](https://glama.ai/mcp/servers/raveenb/fal-mcp-server)
- Runway's official hosted MCP server, opened 2026-05-27. Models listed: Gen-4.5, Seedance, Kling 3.0, Veo 3.1, GPT Image 2, Nano Banana Pro. It uses Runway credits and needs no API key. — [AI Weekly](https://aiweekly.co/alerts/runway-opens-mcp-server-for-chatgpt-claude-cursor-replit), [Runway help](https://help.runwayml.com/hc/en-us/articles/51931843164691-Runway-MCP)
- Gemini/Nano Banana/Veo community MCP servers (directory listings only; maintenance unverified):
  - seungmanchoi/nano-banana-mcp (images + Veo 3.1/3/2) — [glama](https://glama.ai/mcp/servers/seungmanchoi/nano-banana-mcp)
  - u2n4/gemini-media-mcp (Veo 3.1 with text-to-video, image-to-video, extend, interpolate; NanoBanana) — [glama](https://glama.ai/mcp/servers/u2n4/gemini-media-mcp)
  - riotofgeese/gemini-mcp — [glama](https://glama.ai/mcp/servers/riotofgeese/gemini-mcp)
- Replicate: I found only community MCP servers (e.g. gerred/mcp-server-replicate) and no confirmed official one. — [glama](https://glama.ai/mcp/servers/@gerred/mcp-server-replicate/blob/568024cbab6f7da22a85d7bd5787f2e835e4e54a/src/mcp_server_replicate/__init__.py)
- No standalone Kling MCP found. Kling is reachable through fal.ai or Runway. — [lobehub](https://lobehub.com/mcp?q=veo)
- ComfyUI:
  - Comfy-Org/comfy-mcp (built on comfy-cli) — [GitHub](https://github.com/Comfy-Org/comfy-mcp)
  - zturner1/comfyui-mcp: `claude mcp add comfyui -- comfyui-mcp`, needs `COMFYUI_ROOT`, execution off unless `COMFYUI_ENABLE_EXECUTE=1` — [glama](https://glama.ai/mcp/servers/@zturner1/comfyui-mcp/blob/a7ca2334f6e6ddaea2357d959032a5b2694e1ee6/README.md)
  - christian-byrne/comfy-mcp: DSL-to-JSON workflows, `pip install comfy-mcp` — [glama](https://glama.ai/mcp/servers/christian-byrne/comfy-mcp)
  - The official local/cloud Comfy MCP is described as private testing or limited early access, and sources disagree on status. — [Comfy docs](https://docs.comfy.org/agent-tools/local), [Comfy Cloud MCP](https://docs.comfy.org/development/cloud/mcp-server)

**TTS / voice**
- The official ElevenLabs MCP (elevenlabs/elevenlabs-mcp) is MIT and Python. Tools: TTS, speech-to-text, sound effects, voice management/cloning, Conversational AI agents. Run with `uvx elevenlabs-mcp` plus an API key env var. An aggregator reports about 1.5k stars (unverified). Do not confuse it with taigrr/elevenlabs-mcp (a separate, unaffiliated Go project). — [ElevenLabs blog](https://elevenlabs.io/blog/introducing-elevenlabs-mcp), [docsearch](https://docsearch.algolia.com/mcp/docs/repo/elevenlabs/elevenlabs-mcp), [pkg.go.dev](https://pkg.go.dev/github.com/taigrr/elevenlabs-mcp)

**Subtitles / transcription**
- Remotion `@remotion/install-whisper-cpp`: `installWhisperCpp()`, `transcribe()` with a language option, `convertToCaptions()` which groups tokens (`combineTokensWithinMilliseconds`). Input must be 16-bit 16 kHz WAV (convert with ffmpeg). The docs' example uses `medium.en`, which is English-only, so Thai would need a multilingual model. On Windows a non-semver version string throws an error. — [Remotion transcribe](https://www.remotion.dev/docs/install-whisper-cpp/transcribe), [install](https://remotion.dev/docs/install-whisper-cpp/install-whisper-cpp), [captions](https://www.remotion.dev/docs/captions/transcribing)

**Lip-sync (open source models, not MCP/skills)**
- LatentSync (ByteDance, Apache 2.0, diffusion, best quality but slow), MuseTalk (Tencent, MIT, fast/realtime), Wav2Lip (2020 baseline, light, accurate sync, no stylization). Sources are vendor blogs (sync.so, Pixazo). None tested cartoon or non-photoreal faces. — [sync.so LatentSync](https://sync.so/blog/what-is-latentsync), [sync.so open-source lipsync](https://sync.so/blog/the-best-free-open-source-lipsync-tools-2), [Pixazo](https://www.pixazo.ai/blog/best-open-source-lip-sync-models)
- I found no lip-sync MCP or SKILL.md (gap).

### Inferences
- A practical Claude Code stack today would be: Remotion skills for assembly and captions, ElevenLabs MCP (or a local Thai TTS) for voice, and fal.ai or Runway MCP for image and video generation. Those are the three most "official" pieces found.
- Because fal.ai and Runway both expose Kling/Veo/Seedance, a separate Kling/Veo MCP is probably unnecessary.
- On Windows, ffmpeg-mcp-server (bundled ffmpeg-static) and Remotion (it ships its own ffmpeg) avoid a manual ffmpeg install.

### Gaps
- Star counts and last-commit dates were not checked for any repo. The anthropics/skills repo, awesome-claude-skills lists, and skills.sh, smithery and mcp.so listings were not searched or opened.
- The remotion-dev/claude-code-plugin marketplace claim is unconfirmed.
- Whether any maintained subtitle, Whisper or lip-sync skill exists was not established.

## Q2. Thai support (TTS, subtitles/word segmentation, fonts)

### Takeaway
Thai TTS is available commercially through ElevenLabs (per its marketing pages) and openly through Thai fine-tunes (KhanomTan, ThonburianTTS, F5-TTS-THAI). Segmentation is covered by PyThaiNLP. Whisper, Thai-font and Remotion handling for Thai are not documented in what I found.

### Cited Findings
- ElevenLabs lists Thai among its 70+ languages. Eleven v3 (alpha) appears as a model option on Thai pages, but Thai support in v3 is not confirmed by official model docs. — [ElevenLabs Thai TTS](https://elevenlabs.io/text-to-speech/thai)
- KhanomTan TTS (VITS/YourTTS-based, by Wannaphong Phatthiyaphaibun) is reported as Apache 2.0, trained on permissive Thai corpora. The source is a third-party listing, so verify the license. — [tts.ai](https://tts.ai/voices/khanomtan/?lang=hi)
- ThonburianTTS (Mahidol / biodatlab, F5-TTS/E2-TTS fine-tune, iSAI-NLP 2025): best model reports WER 25.72% and SIM-O 88.30%. Code at github.com/biodatlab/thonburian-tts. — [Mahidol repository](https://repository.li.mahidol.ac.th/handle/123456789/115796)
- F5-TTS-THAI (VIZINTZOR), a community fine-tune of F5-TTS on Common Voice Thai and Porjai (about 460 hours), 1M steps. It mispronounces some words and long passages. The license is inconsistent (cc-by-4.0 on the model card, MIT on a Space). — [HF model card](https://huggingface.co/Bird/F5-TTS-THAI/blob/main/README.md)
- Stock F5-TTS does not support Thai, so a fine-tune is required. — [pyvideotrans forum](https://bbs.pyvideotrans.com/show/5943)
- PyThaiNLP provides `word_tokenize` (default engine newmm) and Thai Character Cluster subword tokenization, useful for line-breaking captions. — [PyThaiNLP paper](https://export.arxiv.org/pdf/2312.04649)
- MoneyPrinterTurbo's Thai support was not verified.

### Inferences
- Thai captions in Remotion will likely need explicit line-breaking via PyThaiNLP, plus a Thai-capable font such as Noto Sans Thai or Sarabun. This is my inference and is unverified. It is a candidate for a custom skill.
- Cloned or open Thai TTS would need a Thai-aware forced-alignment or Whisper pass to get word timings for captions.

### Gaps
- Whisper Thai timestamp quality and whether Remotion's transcribe list includes Thai (snippet cut off before "Thai").
- Thai fonts in Remotion (@remotion/google-fonts) and Thai text wrapping behavior.
- Other Thai TTS options (Google Cloud, Azure, Botnoi, Typhoon) were not searched.

## Q3. Complete open-source AI video / short-drama / cartoon pipelines worth building on

### Takeaway
ViMax (HKUDS) is the closest match to a script-to-storyboard-to-video agentic pipeline. MoneyPrinterTurbo is a mature but stock-footage-based short-video generator, a weak fit for cartoons.

### Cited Findings
- ViMax (github.com/HKUDS/ViMax), MIT, multi-agent framework with Idea2Video, Script2Video, Novel2Video and AutoCameo workflows. Agents cover screenwriter, storyboard, character designer, director and producer (reviews count 12 agents) and aim at cross-shot character consistency. Reported 3.5k-5.5k stars (sources disagree). A release in 2026-06 reportedly added an interactive, resumable workflow. Backends mentioned: Veo, Nano Banana, possibly SD/ComfyUI. Primary repo not opened. — [DEV review](https://dev.to/dibi8/vimax-review-agentic-multi-scene-video-generation-from-hkuds-5dc1), [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2FHKUDS%2FViMax), [pyshine](https://pyshine.com/ViMax-Agentic-Video-Generation-Multi-Agent-Framework/)
- MoneyPrinterTurbo (harry0703/MoneyPrinterTurbo), MIT, Python. Topic to LLM script, Pexels/Pixabay stock clips, TTS, subtitles, BGM, 9:16 or 16:9 up to 1080p. Has WebUI and API. No built-in auth. Supports many LLMs (Moonshot, OpenAI, Gemini, DeepSeek, Qwen, Ollama). — [Verdent guide](https://www.verdent.ai/guides/moneyprinterturbo-github), [Docker Hub](https://hub.docker.com/r/oryzen/moneyprinterturbo)
- ComfyUI workflows (via the MCP servers in Q1) are the open-source route for consistent cartoon images and video, controllable from Claude Code.

### Inferences
- For cartoons, ViMax's character-consistency design is worth studying or forking, but it is generation-API-heavy (cost) and Thai TTS and captions would need to be plugged in.
- MoneyPrinterTurbo's script/TTS/subtitle/assembly modules could be reused, but its stock-footage core does not produce cartoons.

### Gaps
- Primary repos not opened, so star counts, last commits and Windows install status are unverified.
- Other pipelines (ComfyUI cartoon workflows, other short-drama generators) were not surveyed.

## Q4. Gaps where the user would write their own skill

### Takeaway
No skill was found that ties the whole cartoon-with-Thai-voice chain together; the integration layer is the user's to write.

### Cited Findings
- Search results contained no Thai-specific skill and no lip-sync skill (see Q1/Q2 gaps). Existing storyboard skills target Seedance or generic video. — sources as in Q1

### Inferences
Candidate custom skills (my suggestions, not sourced):
- Thai script and storyboard skill: scene/shot JSON schema, character bible, consistent style prompts.
- Thai voice skill: TTS provider routing (ElevenLabs vs local Thai model), per-character voices, pronunciation fixes.
- Thai caption skill: PyThaiNLP segmentation, forced alignment or Whisper multilingual, Thai font and line-break rules for Remotion.
- Character-consistency skill: reference images, seed or LoRA management via ComfyUI or Nano Banana.
- Lip-sync/animation skill: for cartoons, simpler mouth-flap or viseme animation from audio in Remotion may be more reliable than photoreal lip-sync models.
- Windows PowerShell render/assembly runbook (ffmpeg paths, Remotion render) and a cost/budget tracker for generation APIs.

### Gaps
- Whether better existing skills exist on skills.sh or the awesome lists was not checked, so confirm there before writing.
