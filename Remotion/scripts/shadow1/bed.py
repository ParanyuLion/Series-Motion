# Sound bed for Part 1: water lapping, creaking planks, a low drone, the clapper at noon, a swell as the shadow stretches, deliberate silence at the end.
import json, numpy as np, wave
m = json.load(open("src/shadow1/manifest.json", encoding="utf-8"))
SR = 44100
fps = m["fps"]
n = int((m["total"] / fps) * SR)
rng = np.random.default_rng(11)
t = np.arange(n) / SR
def lp(x, k):
    c = np.cumsum(np.insert(x, 0, 0)); return (c[k:] - c[:-k]) / k
water = lp(rng.normal(0, 1, n + 2000), 600)[:n] * 6 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t))
drone = 0.05 * np.sin(2 * np.pi * 55 * t) + 0.03 * np.sin(2 * np.pi * 82.4 * t + 1)
bed = 0.5 * water + drone
for k in range(12):  # creaks
    c0 = int(rng.uniform(3, m["total"] / fps - 6) * SR); L = int(0.4 * SR)
    env = np.hanning(L); f = 180 + 60 * rng.random()
    bed[c0:c0 + L] += 0.06 * env * np.sin(2 * np.pi * (f + 40 * np.linspace(0, 1, L)) * np.arange(L) / SR)
def hit(at_frame):
    c0 = int(at_frame / fps * SR); L = int(0.5 * SR); tt = np.arange(L) / SR
    env = np.exp(-tt * 14)
    bed[c0:c0 + L] += 0.7 * env * (np.sin(2 * np.pi * 880 * tt) * 0.6 + np.sin(2 * np.pi * 1320 * tt) * 0.3 + rng.normal(0, 0.4, L))
hit(m["cues"]["clapAt"])
# swell while the shadow stretches (lines 14-15), then silence
a = int(m["cues"]["stretchAt"] / fps * SR); b = int(m["cues"]["lineEnd13"] / fps * SR)
sw = np.zeros(n); L = b - a
sw[a:b] = np.linspace(0, 1, L) ** 2
bed += 0.12 * sw * (np.sin(2 * np.pi * 73 * t) + 0.6 * np.sin(2 * np.pi * 110 * t))
tail = int((m["cues"]["lineEnd13"] + 20) / fps * SR)
fade = np.ones(n); fade[tail:] = np.linspace(1, 0, n - tail) ** 2
bed *= fade
bed *= 0.9 / max(1e-6, np.abs(bed).max())
pcm = (bed * 32767 * 0.8).astype(np.int16)
with wave.open("public/shadow1v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("bed", n / SR, "s")
