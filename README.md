# Series-Motion

Thai-narrated AI cartoon series, drawn entirely by code (SVG animated with Remotion) instead of AI video generation. Vertical 9:16, about one minute per part, made for Reels and TikTok.

- `Remotion/` the animation project (React, TypeScript, Python helpers for voice and sound)
- `series-animation/` a Claude skill that holds the workflow, the story bible, the visual rules, the pipeline and a log of feedback, so an AI assistant can keep making new parts consistently
- `docs/` design documents, scripts and implementation plans
- `research_notes/`, `reports/` the research behind the tool choices

Use the skill with Claude Code: open this folder and ask for the next part. A copy of the pointer lives in `.claude/skills/series-animation/` so Claude Code finds it automatically.
