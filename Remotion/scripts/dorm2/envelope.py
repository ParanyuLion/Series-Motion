# Loudness per frame of the narration lines that the loudspeaker "speaks" (lines 1, 2 and 3), so the speaker picture moves with the voice.
import json, subprocess, numpy as np
m = json.load(open("src/dorm2/manifest.json", encoding="utf-8"))
fps = m["fps"]; out = {}
for i in (1, 2, 3):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"public/dorm2v/n{i}.mp3", "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    hop = 16000 // fps
    n = len(x) // hop
    r = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2)) for k in range(n)])
    r = r / max(1e-6, np.percentile(r, 95)); r = np.clip(r, 0, 1)
    r = np.convolve(r, np.ones(3) / 3, "same")
    out[str(i)] = [round(float(v), 3) for v in r]
json.dump(out, open("src/dorm2/env.json", "w"))
print({k: len(v) for k, v in out.items()})
