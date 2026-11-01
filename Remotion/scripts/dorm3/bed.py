# Sound bed for dorm Part 3: a siren wail only while rule 3 is announced, PA clicks, a short flat tone when the two friends fall, mop swishes, a low drone that drops out
# completely while you keep your mouth shut (the silence is the answer) and a short rising hum when the loudspeaker cuts out.
import json, numpy as np, wave
m = json.load(open("src/dorm3/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
mid = lambda i, k: L(i) + k * (E(i) - L(i))
rng = np.random.default_rng(53); t = np.arange(n) / SR
env = lambda a, b, f=0.5: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
quiet_a, quiet_b = L(11), mid(12, 0.5)
drone = 0.08 * np.sin(2 * np.pi * 52 * t) * env(0, E(13) + 0.5, 1.0)
drone *= 1 - env(quiet_a, quiet_b, 0.4)
bed = drone
ann_a = L(2) + 4 / fps; ann_b = mid(2, 0.62) + 96 / fps
P = 42 / fps
wail = np.sin(2 * np.pi * np.cumsum(560 + 140 * np.sin(2 * np.pi * t / (2 * P))) / SR)
bed += 0.2 * wail * env(ann_a, ann_b, 0.25)
beep = np.zeros(n)
for k in range(int(ann_a / P), int(ann_b / P) + 1):
    s0 = k * P
    if not (ann_a <= s0 < ann_b): continue
    i0 = int(s0 * SR); Lb = int(0.09 * SR)
    if i0 + Lb < n: beep[i0:i0 + Lb] = np.sin(2 * np.pi * 880 * np.arange(Lb) / SR) * np.exp(-np.arange(Lb) / (0.05 * SR))
bed += 0.2 * beep
fall = mid(6, 0.4)
bed += 0.12 * np.sin(2 * np.pi * 880 * t) * env(fall, fall + 1.0, 0.08)
for a, amp in ((ann_a, 0.5), (mid(2, 0.62), 0.5), (L(4), 0.5), (L(7), 0.4)):
    i0 = int(a * SR); Lc = int(0.1 * SR); bed[i0:i0 + Lc] += amp * np.exp(-np.arange(Lc) / 500) * rng.normal(0, 1, Lc)
# the loudspeaker cutting out: a click and a short falling hum
cut = mid(12, 0.5)
i0 = int(cut * SR); Lh = int(0.6 * SR); tt = np.arange(Lh) / SR
bed[i0:i0 + Lh] += 0.18 * np.sin(2 * np.pi * np.cumsum(420 - 300 * tt) / SR) * np.exp(-tt * 4)
for k in range(8):
    p = int(rng.uniform(L(2), L(11)) * SR); Ls = int(0.35 * SR)
    sw = rng.normal(0, 1, Ls); sw = np.convolve(sw, np.ones(60) / 60, "same") * np.hanning(Ls)
    bed[p:p + Ls] += 0.3 * sw
tail = int((E(13) + 0.8) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/dorm3v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
