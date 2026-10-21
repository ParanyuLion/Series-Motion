# Thai-language AI voice-over tools for AI cartoons (as of Oct 2026)

Note: research was limited to ~22 tool calls. Thai-specific independent listening tests/benchmarks and Pantip/Facebook/YouTube reviews were NOT found; most quality claims are vendor claims. Treat everything as "test with your own Thai script".

## Which TTS/voice-cloning services support Thai well, and how natural is Thai?

### Takeaway
Confirmed Thai support: ElevenLabs (only v3/v4/v4 Turbo, NOT Multilingual v2/Flash v2.5), Google Gemini-TTS (th-TH GA), Azure (3 neural voices), Botnoi (Thai-native), iApp (Thai-native), and open-source F5-TTS-THAI. Fish Audio's current docs do NOT list Thai (conflicts with older OpenRouter-derived info). No independent Thai naturalness benchmarks were found.

### Cited Findings
- ElevenLabs docs: Thai (`th`) supported by Eleven v4, v4 Turbo (90+ languages) and v3 (70+); NOT listed for Multilingual v2 (29 langs), Flash v2.5 or Turbo v2.5 (32 langs). Turbo v2.5 deprecated and its replacement Flash v2.5 lacks Thai — [ElevenLabs models](https://elevenlabs.io/docs/overview/models)
- ElevenLabs marketing says Thai TTS adapts to regional accents; v3 was listed as "alpha" on the Thai page; this is vendor claim, no independent test found — [ElevenLabs Thai TTS](https://elevenlabs.io/text-to-speech/thai)
- A third-party video-tool changelog warns v3 often needs several takes to get a good output (not Thai-specific) — [AdGreetz](https://app.adgreetz.com/changelog/10-elevenlabs-v3-model-integration)
- Thai-language reviews: one finds ElevenLabs good for Thai voice clone/dubbing; another says Thai is "not perfect" (snippets only, not verified in depth) — [Lemon8 IVC guide](https://www.lemon8-app.com/@nitaextra/7533989228322046480?region=th), [IDM Council](https://www.idmcouncil.com/blog/elevenlabs-ai-voice-marketing/)
- Google Gemini-TTS: Thai (th-TH) listed GA in language table; models gemini-3.1-flash-tts-preview, 2.5-flash-tts, 2.5-pro-tts; 30 voices — [Google Cloud docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts). Docs caveat: confirm Thai per model (3.1 Flash section doesn't link the table).
- English review claims Gemini 3.1 Flash TTS has broader language support and finer emotion/pace control, quality "closer than expected" to ElevenLabs for Thai audiences; secondary source, no Thai tests shown — [MindStudio](https://www.mindstudio.ai/blog/gemini-31-flash-tts-review)
- Azure: Thai neural voices th-TH-PremwadeeNeural, NiwatNeural, AcharaNeural (3 voices; Premwadee female, Niwat male) — [json2video listing](https://json2video.com/ai-voices/azure/languages/thai/). A 2022 (possibly outdated) MS Q&A reports unwanted pauses between words in Premwadee — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/1146448/(text-to-speech)-break-rate-pitch-is-a-problem-wit)
- Botnoi Voice: 200+ voices in 20+ languages per one source; 525 voices per developer guide; speed 0.25–2.0; API key only after subscription — [Botnoi API guide](https://botnoigroup.com/botnoivoice/doc/api-user-guide), [TheSILab](https://www.thesilab.com/vendor-directory/botnoi-voice), AWS Marketplace listing ([link](https://aws.amazon.com/marketplace/pp/prodview-36kove2muvo2g)) says monthly usage billed via AWS. No independent reviews found. Rates not retrieved.
- iApp Technology (Thai provider): Thai TTS API with V1–V3 ("Kaitom" voices; V3 recommended), free trial credits; details not retrievable — [iApp docs](https://iapp.co.th/docs/speech/text-to-speech)
- F5-TTS-THAI (VIZINTZOR): fine-tune of F5-TTS, Thai+English, 1M steps, trained on Common Voice TH (~160h), Porjai (~300h), CV-EN (~40h); license cc-by-4.0; `pip install f5-tts-th`; reference audio 2–8 s with Thai text; long texts/some words mispronounced; foreign words should be written phonetically in Thai; 24 kHz output — [HF model card](https://huggingface.co/VIZINTZOR/F5-TTS-THAI). Note: training-data licenses (Common Voice CC0, Porjai) not checked for commercial use; base F5-TTS weights licence is separately reported as non-commercial (CC-BY-NC) by some — unverified here.
- Fish Audio: current docs list S2.1-Pro (83 languages), S2-Pro (80+), S1 (13 langs, Thai not listed); S1 deprecated, retires Dec 31 2026. Thai is not explicitly confirmed on that page; contradicts an earlier OpenRouter-sourced claim of Thai in S1 — [Fish docs](https://docs.fish.audio/developer-platform/models-pricing/models-overview), [OpenRouter listing](https://openrouter.ai/fish-audio/s1)
- OpenAI gpt-4o-mini-tts: no official Thai quality source found; community reports non-English often has American accent; instructions field allows accent/emotion steering — [HyperTTS note via search](https://www.vocab.ai/updates/openai-gpt-4o-mini-tts)
- Not verified: XTTS (Coqui, Thai not in official XTTS v2 language list per my background knowledge, not sourced here), VAJA/AIFORTHAI (search returned nothing relevant).

### Inferences
- For cartoon dubbing, best-evidenced candidates to A/B test: ElevenLabs v3/v4, Gemini-TTS, Botnoi, F5-TTS-THAI (free/local).
- Thai tone errors typically show up in loanwords/numbers/names; expect to spell phonetically in Thai across all tools.

### Gaps
- No Thai MOS/benchmark or Pantip/FB/YouTube comparison found. VAJA/AIFORTHAI, XTTS Thai, OpenAI Thai quality, Typecast Thai, Botnoi pricing unverified.

## Distinct character voices, emotion control, kid/animal/cartoon voices in Thai

### Takeaway
Emotion steering exists (ElevenLabs v3 audio tags, Gemini style prompts + tags, Fish S2 free-form tags), but no source confirms Thai kid/animal/cartoon voice libraries. Voice design/cloning plus pitch tweaks is the likely route.

### Cited Findings
- Gemini-TTS: natural-language style prompt plus bracket tags ([sigh], [whispering], [scared], [short pause]); multi-speaker supported on several models — [Google docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
- ElevenLabs v3: dialogue/audio tags for tone/emotion; MCP server mentions voice design from text descriptions (age, accent, tone) — [ElevenLabs Thai page](https://elevenlabs.io/text-to-speech/thai), [MCP listing](https://glama.ai/mcp/servers/elevenlabs/elevenlabs-mcp)
- Fish Audio S2: free-form [bracket] emotion cues; S1 had 64+ (parenthesis) emotions — [Fish docs](https://docs.fish.audio/developer-platform/models-pricing/models-overview)
- Typecast: kid/character/cartoon voices and Smart Emotion exist but Thai not named among its languages (English, Spanish, Korean, Japanese, Chinese, Vietnamese + "35+") — [Typecast TTS](https://typecast.ai/text-to-speech/), [cartoon page](https://typecast.ai/voices/cartoon-character-voice-generator)
- Botnoi: voices of "various ages and styles"; cartoon voices not confirmed — [TheSILab](https://www.thesilab.com/vendor-directory/botnoi-voice)
- Azure Thai: SSML pitch/rate/emphasis (3rd-party description) — [json2video](https://json2video.com/ai-voices/azure/voices/th-th-premwadeeneural/)

### Inferences
- Voice cloning from a human actor's Thai clip (ElevenLabs IVC, F5-TTS-THAI) is the most reliable way to get distinct kids/animal characters.

### Gaps
- No Thai kid/animal/cartoon voice evidence. Typecast Thai support unconfirmed.

## Pricing, free tiers, licensing, API, Claude Code/MCP

### Takeaway
ElevenLabs has the clearest commercial terms and an official MCP; Gemini/Azure are pay-as-you-go APIs; F5-TTS-THAI is free/local (check licenses).

### Cited Findings
- ElevenLabs: Free 10k credits/month, no commercial license; Starter ~$5–6/mo 30k credits with commercial rights + instant cloning; Creator ~$22 (professional cloning); Pro $99; Scale $299; Business $990. Sources disagree on exact credits; ~1000 credits ≈ 1 min — [HappyRobot](https://www.happyrobot.ai/hub/elevenlabs-pricing), [Smallest.ai](https://smallest.ai/blog/elevenlabs-pricing-plans-cost-what-you-get-in-2026), [Magic Hour](https://magichour.ai/blog/elevenlabs-pricing)
- ElevenLabs MCP: GitHub elevenlabs/elevenlabs-mcp (MIT) now DEPRECATED/unmaintained in favor of hosted MCP `https://api.elevenlabs.io/v1/mcp` (OAuth, no install). Local setup `uvx elevenlabs-mcp` with ELEVENLABS_API_KEY; works with Claude Desktop, Cursor, Windsurf; Claude Code not covered in README (likely works via `claude mcp add`; unverified) — [GitHub](https://github.com/elevenlabs/elevenlabs-mcp)
- Fish Audio: s2.1-pro-free at $0 for dev/testing with fair use; OpenRouter listed S1/S2 Pro at $15/M UTF-8 bytes (Thai is 3 bytes/char; Thai support itself unconfirmed) — [Fish docs](https://docs.fish.audio/developer-platform/models-pricing/models-overview), [OpenRouter](https://openrouter.ai/fish-audio/s1)
- Gemini-TTS via Cloud TTS API: needs billing; limits 4,000 bytes text + 4,000 bytes prompt (8,000 combined), ~655 s audio cap; rates not retrieved — [Google docs](https://docs.cloud.google.com/text-to-speech/docs/gemini-tts)
- Botnoi: API key after subscription; REST API; n8n integration exists — [Botnoi docs](https://botnoigroup.com/botnoivoice/doc/api-user-guide), [n8n note](https://www.hackceleration.com/resources/integrations/n8n/botnoi-voice)
- F5-TTS-THAI: free, cc-by-4.0 per model card — [HF](https://huggingface.co/VIZINTZOR/F5-TTS-THAI)

### Inferences
- Thai is 3 bytes/char in UTF-8, so byte-priced APIs cost more per Thai character; and ElevenLabs must use v3/v4 (not cheaper Flash) for Thai.

### Gaps
- Official ElevenLabs pricing page, Azure/Google/Botnoi/iApp rates not fetched. No Claude Code skills for Thai TTS found.

## Thai speech-to-speech / voice changer

### Takeaway
ElevenLabs voice changer does NOT support Thai (29-language multilingual STS v2 only). Thai options for performing characters yourself remain unverified (RVC etc.).

### Cited Findings
- ElevenLabs voice changer: models eleven_multilingual_sts_v2 (29 langs, Thai not listed) and english-only; 5 min per segment; billed 1,000 chars per minute — [ElevenLabs docs](https://elevenlabs.io/docs/product/speech-synthesis/speech-to-speech)

### Inferences
- RVC-style voice conversion is largely language-agnostic (works on timbre) so Thai performance likely works, but this was not sourced here. Alternative: record yourself, then clone via F5-TTS-THAI reference or use pitch/formant shifting.

### Gaps
- No evidence retrieved on RVC/so-vits Thai, Thai-specific voice changer apps, or AI dubbing (ElevenLabs Dubbing Studio, HeyGen, Rask) Thai support.
