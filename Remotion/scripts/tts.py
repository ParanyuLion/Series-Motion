import json, asyncio, sys, edge_tts
VOICE = "th-TH-PremwadeeNeural"
lines = json.load(open("scripts/narration.json", encoding="utf-8"))
async def one(i, t):
    for attempt in range(6):
        try:
            await edge_tts.Communicate(t, VOICE).save(f"public/audio/n{i}.mp3"); return
        except Exception:
            await asyncio.sleep(1.5)
    sys.exit(f"failed line {i}")
async def main():
    for i, t in enumerate(lines): await one(i, t)
asyncio.run(main())
