# Sound bed for dorm Part 1: a siren wail with the heart-monitor beep on the same 42-frame rhythm (the planted clue), a PA click, a lamp click and a long flat tone at the death, mop swishes in the corridor, a low drone.
import json, numpy as np, wave
m = json.load(open("src/dorm1/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
rng = np.random.default_rng(51); t = np.arange(n) / SR
env = lambda a, b, f=0.5: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
bed = 0.08 * np.sin(2 * np.pi * 52 * t) * env(0, E(13) + 0.5, 1.0)
P = 42 / fps
# the siren: a slow two-tone wail locked to the beat period; the monitor beep (880 Hz, short) lands on every beat
wail = np.sin(2 * np.pi * np.cumsum(560 + 140 * np.sin(2 * np.pi * t / (2 * P))) / SR)
bed += 0.13 * wail * env(0, E(13), 0.4) * (0.5 + 0.5 * np.sin(2 * np.pi * t / P) ** 2)
die = L(6) + 0.62 * (E(6) - L(6)); flat_a, flat_b = die, L(9) + 0.6
beep = np.zeros(n)
for k in range(int(E(13) / P) + 1):
    s = k * P
    if flat_a <= s < flat_b: continue
    i0 = int(s * SR); Lb = int(0.09 * SR)
    if i0 + Lb < n: beep[i0:i0 + Lb] = np.sin(2 * np.pi * 880 * np.arange(Lb) / SR) * np.exp(-np.arange(Lb) / (0.05 * SR))
bed += 0.22 * beep * (t > L(2) - 0.2)
# the flatline: a long steady tone from the death
bed += 0.12 * np.sin(2 * np.pi * 880 * t) * env(flat_a, flat_b, 0.15)
# PA click at the rule, the lamp switch, the lamp's bright burst
for a, amp in ((L(3) + 0.46 * (E(3) - L(3)), 0.5), (L(6) + 6 / fps, 0.7)):
    i0 = int(a * SR); Lc = int(0.1 * SR); bed[i0:i0 + Lc] += amp * np.exp(-np.arange(Lc) / 500) * rng.normal(0, 1, Lc)
i0 = int((L(6) + 6 / fps) * SR); Lb = int(0.8 * SR); tt = np.arange(Lb) / SR
bed[i0:i0 + Lb] += 0.25 * np.exp(-tt * 4) * np.sin(2 * np.pi * 1500 * tt)
# mop swishes in the corridor
for k in range(12):
    p = int(rng.uniform(L(9), E(12)) * SR); Ls = int(0.35 * SR)
    sw = rng.normal(0, 1, Ls); sw = np.convolve(sw, np.ones(60) / 60, "same") * np.hanning(Ls)
    bed[p:p + Ls] += 0.5 * sw
tail = int((E(13) + 0.8) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/dorm1v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
