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
ap.add_argument("--rate", default="-27%", help="slower than default so total length matches the ~7.5 chars/s budget")
ap.add_argument("--pitch", default="-6Hz")
a = ap.parse_args()

lines = json.load(open(a.script, encoding="utf-8"))
# Gemini voice name -> provisional Edge voice for lines made of several speakers (see "segments" in the script)
EDGE_FOR = {"Charon": (a.voice, a.pitch), "Leda": ("th-TH-PremwadeeNeural", "+0Hz")}
out = Path(a.out_dir); out.mkdir(parents=True, exist_ok=True)


async def speak(text: str, voice: str, pitch: str, dest: Path) -> None:
    for _ in range(8):
        try:
            await edge_tts.Communicate(text, voice, rate=a.rate, pitch=pitch).save(str(dest))
            return
        except Exception:
            await asyncio.sleep(1.5)
    sys.exit(f"Edge TTS failed on: {text[:30]}")


async def one(i: int, line) -> None:
    segs = line["segments"] if isinstance(line, dict) else [{"voice": "Charon", "text": line}]
    parts = []
    for j, seg in enumerate(segs):
        voice, pitch = EDGE_FOR.get(seg["voice"], (a.voice, a.pitch))
        part = out / f"n{i}.p{j}.mp3"
        part.unlink(missing_ok=True)
        await speak(seg["text"], voice, pitch, part)
        parts.append(part)
    raw = out / f"n{i}.raw.mp3"
    raw.unlink(missing_ok=True)
    if len(parts) == 1:
        parts[0].replace(raw)
    else:  # join the speakers with a short gap
        cmd = ["ffmpeg", "-y", "-loglevel", "error"]
        for part in parts:
            cmd += ["-i", str(part)]
        gap = "aevalsrc=0:d=0.14[gap];"
        chain = gap + "".join(f"[{k}:a]" + ("[gap]" if k < len(parts) - 1 else "") for k in range(len(parts)))
        cmd += ["-filter_complex", chain + f"concat=n={2 * len(parts) - 1}:v=0:a=1[o]", "-map", "[o]", str(raw)]
        subprocess.run(cmd, check=True)
        for part in parts:
            part.unlink(missing_ok=True)
    # trim leading/trailing silence like the Gemini path does, then normalise loudness
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af",
                    "silenceremove=start_periods=1:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_threshold=-48dB,areverse,loudnorm=I=-17:TP=-1.5:LRA=11",
                    "-b:a", "192k", str(out / f"n{i}.mp3")], check=True)
    raw.unlink(missing_ok=True)
    print("wrote", out / f"n{i}.mp3")


async def main() -> None:
    for i, t in enumerate(lines):
        await one(i, t)

asyncio.run(main())
