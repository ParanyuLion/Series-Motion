# Sound bed for Part 2: a hot still noon (wind, ticks), a cold hum in the granary, a sting when the eyes appear, a white burst out into the sun, a low swell at the tree, silence at the end.
import json, numpy as np, wave
m = json.load(open("src/shadow2/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
rng = np.random.default_rng(21); t = np.arange(n) / SR
def lp(x, k):
    s = np.cumsum(np.insert(x, 0, 0)); return (s[k:] - s[:-k]) / k
wind = lp(rng.normal(0, 1, n + 3000), 900)[:n] * 7 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t))
bed = 0.45 * wind
for k in range(40):  # dry ticks in the heat
    p = int(rng.uniform(0, L(6)) * SR); bed[p:p + 300] += 0.08 * np.exp(-np.arange(300) / 40) * rng.normal(0, 1, 300)
env = lambda a, b, f=0.6: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
barn_a, barn_b = L(6), L(9) + 0.45 * (E(9) - L(9))
bed += env(barn_a, barn_b) * (0.08 * np.sin(2 * np.pi * 49 * t) + 0.05 * np.sin(2 * np.pi * 73.4 * t))
bed *= 1 - 0.6 * env(barn_a, barn_b)
s0 = L(8) + 0.6 * (E(8) - L(8)); i0 = int(s0 * SR); Ls = int(1.2 * SR); tt = np.arange(Ls) / SR
bed[i0:i0 + Ls] += 0.35 * np.exp(-tt * 2.5) * (np.sin(2 * np.pi * 311 * tt) + 0.7 * np.sin(2 * np.pi * 329.6 * tt))
i1 = int(barn_b * SR); Lb = int(0.6 * SR)
bed[i1:i1 + Lb] += 0.4 * np.exp(-np.arange(Lb) / SR * 5) * rng.normal(0, 1, Lb)
a, b = L(12), E(13); sw = np.clip((t - a) / (b - a), 0, 1) ** 2 * (t < b + 0.5)
bed += 0.12 * sw * (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.4 * t))
tail = int((E(13) + 0.7) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/shadow2v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
