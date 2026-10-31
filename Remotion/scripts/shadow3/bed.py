# Sound bed for Part 3: a hot noon wind, a cold hum under the tree with a murmur of tiny voices, a lantern crackle, a wooden clap at the dusk bell, then silence.
import json, numpy as np, wave
m = json.load(open("src/shadow3/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
rng = np.random.default_rng(31); t = np.arange(n) / SR
def lp(x, k):
    s = np.cumsum(np.insert(x, 0, 0)); return (s[k:] - s[:-k]) / k
env = lambda a, b, f=0.6: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
wind = lp(rng.normal(0, 1, n + 3000), 900)[:n] * 7 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t))
bed = 0.45 * wind
tree_a, tree_b = L(4) - 0.2, L(8)
bed *= 1 - 0.6 * env(tree_a, tree_b)
bed += env(tree_a, tree_b, 1.0) * (0.08 * np.sin(2 * np.pi * 49 * t) + 0.05 * np.sin(2 * np.pi * 73.4 * t))
# a murmur of thousands of tiny voices: band-passed noise swelling with the crowd (lines 6-7)
mur = lp(rng.normal(0, 1, n + 400), 40)[:n] - lp(rng.normal(0, 1, n + 400), 200)[:n]
bed += 0.55 * mur * env(L(6) - 0.5, E(7) + 0.6, 1.5) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * t))
# lantern crackle (lines 8-11)
for k in range(60):
    p = int(rng.uniform(L(8) + 0.9, E(11)) * SR); bed[p:p + 200] += 0.1 * np.exp(-np.arange(200) / 30) * rng.normal(0, 1, 200)
# a low pulse as the shadow slides (line 11)
bed += 0.1 * np.sin(2 * np.pi * 55 * t) * np.clip((t - L(11)) / (E(11) - L(11)), 0, 1) * (t < E(11) + 0.4)
# the wooden clap at the dusk bell (line 13) then lantern hush
i0 = int((L(13) + 6 / fps) * SR); Lc = int(0.9 * SR); tt = np.arange(Lc) / SR
bed[i0:i0 + Lc] += 0.8 * np.exp(-tt * 9) * (np.sin(2 * np.pi * 410 * tt) + 0.6 * np.sin(2 * np.pi * 690 * tt)) * (rng.normal(0, 0.25, Lc) + 0.9)
bed[i0:i0 + Lc] += 0.5 * np.exp(-tt * 3) * np.sin(2 * np.pi * 98 * tt)
tail = int((E(13) + 0.8) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/shadow3v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
