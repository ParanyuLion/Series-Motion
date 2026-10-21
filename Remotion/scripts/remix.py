"""Re-mix the audio of an already-rendered video WITHOUT re-rendering the picture.
  python scripts/remix.py out/story_v3.mp4 out/story_v4.mp4 --bed-gain 0.6
The video stream is copied untouched; only the audio is rebuilt (narration + bed.wav * gain).
Keep --bed-gain in sync with the volume on the bed <Audio> in src/Story.tsx.
"""
import argparse, json, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("dst")
ap.add_argument("--bed-gain", type=float, default=0.6)
ap.add_argument("--manifest", default="src/manifest.json")
ap.add_argument("--bed", default="public/audio/bed.wav")
a = ap.parse_args()

m = json.load(open(a.manifest, encoding="utf-8"))
cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", a.src, "-i", a.bed]
for s in m["shots"]:
    cmd += ["-i", f"public/{s['audio']}"]
chains, labels = [f"[1:a]volume={a.bed_gain}[bed]"], ["[bed]"]
for i, s in enumerate(m["shots"]):
    ms = round((m["starts"][i] + s["leadFrames"]) / m["fps"] * 1000)
    chains.append(f"[{i + 2}:a]aresample=44100,aformat=channel_layouts=stereo,adelay={ms}|{ms}[n{i}]")
    labels.append(f"[n{i}]")
chains.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{m['total'] / m['fps']:.3f}[a]")
cmd += ["-filter_complex", ";".join(chains), "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", a.dst]
subprocess.run(cmd, check=True)
print("wrote", a.dst)
