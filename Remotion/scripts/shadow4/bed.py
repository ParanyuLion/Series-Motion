# Sound bed for Part 4: a night wind with lantern crackle and a growing murmur, a hush when the lantern is blown out, a cold hum in the dark, dawn wind and a truck engine, a lamp click, then a noon still and a soft end.
import json, numpy as np, wave
m = json.load(open("src/shadow4/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
rng = np.random.default_rng(41); t = np.arange(n) / SR
def lp(x, k):
    s = np.cumsum(np.insert(x, 0, 0)); return (s[k:] - s[:-k]) / k
env = lambda a, b, f=0.6: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
wind = lp(rng.normal(0, 1, n + 3000), 900)[:n] * 7 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t))
bed = 0.5 * wind
blow = L(5) + 24 / fps
dark_a, dark_b = blow, L(9)
# a murmur of many voices that swells as the lanterns close in (lines 1-4), then stops at the blow
mur = lp(rng.normal(0, 1, n + 400), 40)[:n] - lp(rng.normal(0, 1, n + 400), 200)[:n]
bed += 0.6 * mur * env(L(1), blow, 2.0) * (0.55 + 0.45 * np.sin(2 * np.pi * 2.7 * t))
for k in range(90):  # lantern crackle
    p = int(rng.uniform(0, blow) * SR); bed[p:p + 200] += 0.09 * np.exp(-np.arange(200) / 30) * rng.normal(0, 1, 200)
# a low pulse that rises with the chase (lines 2-4)
bed += 0.12 * np.sin(2 * np.pi * 55 * t) * env(L(2), blow, 1.0) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.9 * t))
# the blow: a short breath of noise, then the dark: a cold hum and quiet
i0 = int(blow * SR); Lb = int(0.5 * SR); bed[i0:i0 + Lb] += 0.45 * np.exp(-np.arange(Lb) / SR * 7) * rng.normal(0, 1, Lb)
bed *= 1 - 0.7 * env(dark_a, dark_b, 0.3)
bed += env(dark_a, dark_b, 0.8) * (0.07 * np.sin(2 * np.pi * 49 * t) + 0.04 * np.sin(2 * np.pi * 73.4 * t))
for k in range(14):  # far lantern ticks in the dark
    p = int(rng.uniform(dark_a + 0.4, dark_b - 0.3) * SR); bed[p:p + 300] += 0.06 * np.exp(-np.arange(300) / 50) * rng.normal(0, 1, 300)
# dawn: a truck engine that comes and stops (line 9)
a, b = L(9) - 0.2, E(9) + 0.3
eng = env(a, b, 0.5) * (0.12 * np.sin(2 * np.pi * (38 + 6 * np.sin(2 * np.pi * 5 * t)) * t) + 0.05 * rng.normal(0, 1, n) * 0.5)
bed += eng
# home: the lamp's click and the still (line 10)
i1 = int((L(10) + 50 / fps) * SR); Lc = int(0.12 * SR); bed[i1:i1 + Lc] += 0.5 * np.exp(-np.arange(Lc) / 400) * rng.normal(0, 1, Lc)
bed += env(L(10), E(11), 0.8) * 0.05 * np.sin(2 * np.pi * 120 * t)
# a low swell on the bare wall (line 11) and the noon tick at the end
bed += 0.1 * np.sin(2 * np.pi * 55 * t) * env(L(11), E(11) + 0.3, 1.0)
tail = int((E(13) + 0.9) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/shadow4v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
