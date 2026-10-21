"""Provisional Thai narration with Edge TTS (no key). Used while the Gemini free-tier quota is exhausted;
swap in the real voice later with scripts/tts_gemini.py and re-run manifest + render (timing is automatic).

  python scripts/island/tts_edge.py --script scripts/island/part1.narration.json --out-dir public/island1
"""
import argparse, asyncio, json, subprocess, sys
from pathlib import Path
import edge_tts

ap = argparse.ArgumentParser()
ap.add_argument("--script", required=True)
ap.add_argument("--out-dir", required=True)
ap.add_argument("--voice", default="th-TH-NiwatNeural")
ap.add_argument("--rate", default="-17%", help="slower than default so total length matches the ~7.5 chars/s budget")
ap.add_argument("--pitch", default="-6Hz")
a = ap.parse_args()

lines = json.load(open(a.script, encoding="utf-8"))
out = Path(a.out_dir); out.mkdir(parents=True, exist_ok=True)


async def one(i: int, text: str) -> None:
    raw = out / f"n{i}.raw.mp3"
    for _ in range(8):
        try:
            await edge_tts.Communicate(text, a.voice, rate=a.rate, pitch=a.pitch).save(str(raw))
            break
        except Exception:
            await asyncio.sleep(1.5)
    else:
        sys.exit(f"Edge TTS failed on line {i}")
    # trim leading/trailing silence like the Gemini path does
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                    "silenceremove=start_periods=1:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_threshold=-48dB,areverse",
                    "-b:a", "192k", str(out / f"n{i}.mp3")], check=True)
    raw.unlink()
    print("wrote", out / f"n{i}.mp3")


async def main() -> None:
    for i, t in enumerate(lines):
        await one(i, t)

asyncio.run(main())
