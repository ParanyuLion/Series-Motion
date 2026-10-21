# Character rigging, motion, art sourcing, lip-sync and LLM workflow for code-drawn 2D cartoons

Research depth note: about 13 tool calls, mostly search snippets. Few primary pages were fetched in full. The Instagram reference post could not be read (the page returned only "Instagram"). Items marked "UNVERIFIED" or "general knowledge" are not backed by a fetched source.

## 1. Rigged/puppet characters in code: structure, libraries, licenses

### Takeaway
The pattern that works for LLMs is a data-driven rig: generic runtime code plus a per-character JSON package (parts, parents, pivots, rotation limits, explicit z-layers), animated frame by frame in a deterministic renderer (Remotion). Spine runtimes need a paid editor licence for end users. Rive's runtime is MIT. GSAP is now free. Remotion is free only for companies of 3 or fewer people.

### Cited Findings
- An existing agent skill, "character-rigging" (OpenMontage repo, installable via `npx skillscat add calesthio/openmontage/character-rigging`), teaches this approach.
  - Split the character into independent parts.
  - Define each pivot in the same coordinate space as the art.
  - Use parent-child hierarchy (head on body).
  - Set rotation limits per joint.
  - Assign explicit layer numbers instead of relying on SVG source order.
  - Keep mouth shapes, eyes, pupils and props as separate assets.
  - It gives a JSON rig schema: `character_id`, `rig_type: svg_rig`, `parts[{id, kind, layer, parent}]`, `joints{pivot, rotation range}`.
  - It names GSAP (`svgOrigin` for explicit SVG-coordinate pivots) and Remotion (frame-driven, deterministic) as the animation and render pairing. It gives no formulas. — [SkillsCat: character-rigging](https://skills.cat/skills/calesthio/openmontage/character-rigging)
- SVG `transform-origin` behaviour differs by browser, which is why explicit `svgOrigin` pivots are recommended. — [same skill page](https://skills.cat/skills/calesthio/openmontage/character-rigging)
- Spine runtimes:
  - They can be integrated free of charge, but end users of your software must hold their own Spine licence.
  - pixi-spine wraps the official spine-ts runtime, so a Spine licence is still needed.
  - Exported data belongs to the author.
  - One forum post says Spine Essential ($69) suffices under $500k/yr revenue. That post is dated, so verify the price.
  - Sources conflict on the runtime licence text (BSD claim vs. a restrictive internal-use grant). Read the repo LICENSE. — [Esoteric forum 4984](https://it.esotericsoftware.com/forum/d/4984), [spine-runtimes repo](https://github.com/EsotericSoftware/spine-runtimes)
- Rive: the runtime is described as MIT-licensed and open source. The evidence is the Maven listing for rive-android and a third-party NOTICE file. The rive-runtime LICENSE itself was not seen. — [Maven rive-android](https://central.sonatype.com/artifact/app.rive/rive-android/11.9.2), [Rive runtimes docs](https://rive.app/docs/runtimes)
- DragonBones: only old or indirect results. Maintenance status is unclear, and I found no authoritative current statement. — [MonoGame thread](https://community.monogame.net/t/skeletal-animation/7556)
- Live2D Cubism SDK:
  - It is free to develop with. Releases by small-scale enterprises or individuals with under 10M yen annual sales need no contract.
  - The SDK is proprietary, not open source.
  - Inochi2D / Inochi Creator is described as free and open source (by a comparison site only; check the repo licence). — [Live2D help](https://help.live2d.com/en/?p=2181), [AlternativeTo](https://alternativeto.net/software/live2d)
- Remotion: free for individuals, non-profits and for-profits with up to 3 employees. Larger companies need a paid licence. The licence says it changes slightly in Remotion 5.0. — [Remotion license](https://remotion.dev/license), [pricing](https://www.remotion.dev/docs/pricing)
- GSAP: free for everyone including commercial use since the Webflow acquisition. It bars using GSAP to build visual animation-builder tools that compete with Webflow. — [Webflow](https://webflow.com/blog/gsap-becomes-free), [GSAP license](https://gsap.com/community/standard-license/)
- Claude Code plus Remotion is an established workflow.
  - Guides describe installing the Remotion best-practices agent skill, then using an art-direction file, a scene timeline and rounds of specific feedback.
  - Guides advise checking current docs because the model may remember older APIs. — [Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code.md), [VideoHighlight](https://videohighlight.com/v/xAUifztpib8)
  - None of the guides cover rigged character animation.

### Inferences
- For a pure code pipeline, skip Spine, DragonBones and Live2D. Use a custom JSON rig (above) with SVG or Canvas in Remotion, since this avoids licence friction and the LLM can author and debug every file. This is an inference from the sources, not a tested claim.
- General knowledge, UNVERIFIED here, but standard and reliably LLM-writable:
  - Forward kinematics: nested `<g transform="translate(x,y) rotate(a)">` per joint.
  - Walk cycle: `phase = 2π·f/period`.
    - Thigh angle = A·sin(phase), opposite leg offset by π.
    - Knee bend = max(0, sin(phase+offset)).
    - Arms counter-swing at half amplitude.
    - Body bob = |sin(phase)|·h, i.e. twice per cycle.
    - Torso lean and head counter-rotation add secondary motion.
  - Two-bone analytic IK via the law of cosines. Use it for foot planting and for hands reaching or pointing.
  - Easing: easeInOutCubic and spring/damped-oscillator for overshoot.
  - Overlap and follow-through: lag children's phase by 2 to 4 frames.
  - Blink every 3 to 5 s, plus slow noise-based idle breathing.
  - Use seeded random so that renders are deterministic.

### Gaps
- No verified open-source "svg puppet" library comparison (e.g. specific GitHub libraries). I did not search for specific ones.
- No confirmed current status or licence for pixi-spine alternatives or DragonBones.
- No Mixamo-like 2D auto-rigging service was verified.

## 2. Getting good-looking character art (LLM SVG vs AI images, layer cutting, assets)

### Takeaway
LLM-written SVG is controllable and rig-friendly. AI image generation gives richer art, but it needs layer separation (SAM-based or Qwen-Image-Layered) plus manual cleanup to be puppetable. Consistency across poses is reliable only for 1 to 2 characters.

### Cited Findings
- Qwen-Image-Layered (arXiv 2512.15603, Dec 2025) decomposes one image into RGBA layers.
  - Replicate lists 2 to 8 layers, and layers can be split again.
  - It runs via diffusers (`QwenImageLayeredPipeline`) and has a ComfyUI workflow and a Gradio app that exports pptx, zip or psd.
  - The prompt describes the whole image, including hidden parts. — [GitHub](https://github.com/QwenLM/Qwen-Image-Layered), [Replicate](https://replicate.com/qwen/qwen-image-layered), [arXiv](https://arxiv.org/pdf/2512.15603)
  - I did not check its model licence.
- img2rig is an open-source pipeline (DINO+SAM text-prompted masks) that splits a character into layer PNGs with rig data. It needs a local A1111 WebUI with the segment-anything extension. — [img2rig](https://github.com/SSnemo/img2rig)
- ComfyUI "SAM MultiLayer" node (original SAM ViT-H) makes one layer per clicked region. — [comfy.icu](https://comfy.icu/node/SAM-MultiLayer)
- APES (CVPR 2022) is an academic method that extracts articulated parts from sprite sheets of a few poses. — [paper](https://openaccess.thecvf.com/content/CVPR2022/papers/Xu_APES_Articulated_Part_Extraction_From_Sprite_Sheets_CVPR_2022_paper.pdf)
- Layer.ai markets a Spine-component generator, with its underlying method unverified. Studios still pay humans to split art into rig layers. — [Layer.ai](https://layer.ai/tools/layer--create-spine-components)
- Nano Banana consistency:
  - Nano Banana 2 holds one or two characters reasonably well.
  - Three or more characters are less reliable. For multi-character shots, generate each separately and composite them.
  - The turnaround workflow is: lock a portrait, then generate front/3-4/side/back views, with props removed to avoid drift.
  - Treat claims like "95%+ consistency" (SelfieLab) as unverified. — [Zilliz FAQ](https://zilliz.com/ai-faq/how-many-consistent-characters-can-nano-banana-2-maintain-across-a-workflow), [invideo](https://invideo.io/faq/how-do-you-create-a-character-reference-sheet-using-nano/), [Morph Studio](https://www.morphstudio.com/article/efficient-character-design-with-nano-banana-pro)
- Free assets:
  - Kenney packs are CC0 (e.g. Animated Characters 3 and Character Assets), but these are 3D/low-poly, not flat 2D.
  - The OpenGameArt "Game character" pack is CC0, with loose body parts for Flash and a 2017 spritesheet/vector update.
  - Confirm licences on the download page. — [Kenney Animated Characters 3](https://kenney-assets.itch.io/animated-characters-3), [OpenGameArt](https://opengameart.org/content/game-character)

### Inferences
- Recommended hybrid: have the LLM write SVG parts for characters (it keeps style consistent and pivots clean), and use AI images for backgrounds and props, which need no rigging. Image-to-layers is a fallback for rich character art.
- A rig built from AI image cutouts will have hidden-area holes at joints (shoulder/hip). Plan overlapping parts and hide the joints with sleeves or shapes.
- The 1 to 2 character limit suggests designing scenes around few hero characters, with crowds drawn as simple code-made variants.

### Gaps
- No source on prompting for isolated body parts on transparent backgrounds.
- Midjourney and Flux character-consistency options were not researched.
- Licences for Qwen-Image-Layered, SAM and Nano Banana output were not checked.

## 3. Backgrounds, lighting, parallax, camera, particles, crowds

### Takeaway
I found no sourced material specific to this question. The notes below are general knowledge, UNVERIFIED and not sourced from this research.

### Cited Findings
- Remotion is deterministic and frame-driven, so a camera, parallax and particles should all be pure functions of the frame number. — [SkillsCat character-rigging](https://skills.cat/skills/calesthio/openmontage/character-rigging)

### Inferences
- General knowledge, standard techniques:
  - Camera: wrap the whole scene in a `<g>` whose transform is the inverse camera (translate, scale), with eased keyframes.
  - Parallax: layer offset = camera_x × depth factor, with far layers moving less.
  - Light rays: semi-transparent gradient polygons with `mix-blend-mode: screen` or additive blending, slowly rotating or fading.
  - Depth: atmospheric tint for far layers, blurred foreground, drop shadows under feet.
  - Particles: seeded PRNG, with position as a closed-form function of frame, e.g. `x0 + v·t`.
  - Crowd/zombie scenes: instance one rig function with per-instance seed (colour, size, phase offset, gait) and sort by y for depth.
  - Reuse one rig for many zombies with a lurch variant: forward arms, head tilt, uneven gait.
  - Cost: SVG with hundreds of nested groups is slow, so use Canvas, or cap crowd detail.

### Gaps
- No tutorials, repos or creator posts on these topics were retrieved.

## 4. Mouth / lip-sync (including Thai)

### Takeaway
Rhubarb Lip Sync gives timed mouth-shape cues, but its Thai accuracy is untested. For Thai, an audio-amplitude mouth-flap is the safe baseline. Forced alignment of the Thai script is the higher-quality route.

### Cited Findings
- Rhubarb Lip Sync takes a voice recording and outputs 2D mouth animation timing. It has 9 mouth shapes: A to F basic, and G, H, X extended. The six basic shapes originated at Hanna-Barbera. — [Rhubarb repo mirror](https://github.com/wzpan/rhubarb-lip-sync), [Spine forum on Rhubarb](https://en.esotericsoftware.com/forum/d/10769-mouth-animation-using-rhubarb-lip-sync)
- It has two recognizers. PocketSphinx is English only. The phonetic recognizer is language-independent but less precise, and the docs advise it for non-English audio. — [Rhubarb mirror](https://github.com/despossivel/rhubarb-lip-sync), [Replicate readme](https://replicate.com/emiliacb/rhubarb/readme)
- Version 1.9 added basic non-English support. The maintainer named French, Italian, German and Spanish; Thai is not mentioned. — [sourcepulse](https://www.sourcepulse.org/projects/1841021)
- A Chulalongkorn thesis, "Thai LIP-SYNC", used Thai speech plus phonemic script, force-alignment to get phoneme timestamps, and a phoneme-to-viseme mapping. It reported good accuracy against artist-animated mouths. — [Thai LIP-SYNC thesis](https://doi.nrct.go.th/ListDoi/listDetail/10.14457%2FCU.the.2011.1311)
- A JS package, LipSyncEngine.js (lip-sync-engine), exists, but I did not verify its language support. — [README](https://cdn.jsdelivr.net/npm/lip-sync-engine@1.0.3/README.md)

### Inferences
- Because the narration is AI-generated (TTS), a practical approach is:
  1. Compute an RMS amplitude envelope per video frame (ffmpeg or Python), smooth it, and map it to 3 to 4 mouth openings.
  2. Optionally use Rhubarb's phonetic mode and compare. This is an experiment for the user, since nothing shows it works on Thai.
  3. Optionally use TTS word timings plus the Thai script for forced alignment.
- Thai considerations (general knowledge, UNVERIFIED): Thai syllables are short and tonal, and tone has no visible mouth effect. Visemes matter less than timing, because rounded vowels (อู, โอ, อุ) versus wide vowels (อา, แอ) are the main visible differences. Amplitude-driven open/close with a few vowel shapes is likely acceptable for a stylised cartoon.

### Gaps
- No evidence of Rhubarb tested on Thai.
- No source for Thai phoneme-to-viseme tables beyond the thesis, which was not read in full.

## 5. Workflow tricks for LLM consistency and existing skills

### Takeaway
Keep runtime code generic, put all content in schema JSON (rig packages, scene timeline), reuse an art-direction file, and iterate with visual review of rendered frames. An existing rigging skill and Remotion skills can be installed.

### Cited Findings
- Existing skills and workflows:
  - OpenMontage `character-rigging` skill (above).
  - Remotion best-practices agent skills for Claude Code (commands like `/remotion-render` and `/remotion-captions` are mentioned in one guide).
  - A workflow of art direction file, then scene timeline, then targeted feedback rounds. — [Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code.md), [MindStudio](https://mindstudio.ai/blog/remotion-claude-code-animated-logo-reveals-motion-graphics), [Timewell](https://timewell.jp/en/columns/remotion-claude-code-programmatic-video)
- The character-rigging skill's quality checklist is a usable review rubric: every moving part has a pivot, parents are set where hierarchy matters, and separate assets exist for mouth shapes, eyes, pupils and props. — [SkillsCat](https://skills.cat/skills/calesthio/openmontage/character-rigging)
- Remotion advice: verify current docs, since the model may recall outdated APIs. — [Tella](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code.md)

### Inferences
- Suggested loop (general, untested by sources): storyboard to a scene JSON (shots, characters, actions, dialogue timing, camera keyframes). Then render still frames with `npx remotion still` at several frames per shot, view them with the Read tool (it can view images), compare to the checklist, and fix. Render pose-test contact sheets (e.g. walk cycle at 8 phases) to catch broken joints before full renders.
- Keep a component library: `Character({rig, pose})`, `walk(phase)`, `gesture(name,t)`, `Mouth(viseme)`, `Camera`, `Parallax`, `Particles`.
- Prompt style: name the exact function signature the LLM must call, and ban inline free-form transforms.

### Gaps
- I could not read the @promptkub Instagram post, so its actual workflow is unknown.
- No Reddit/YouTube creator workflows specific to LLM-written character animation were found in this pass.
- No other published Claude skills for 2D character animation were found beyond OpenMontage.
