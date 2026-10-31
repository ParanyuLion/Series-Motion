# Sound bed for dorm Part 2: a siren wail only while rule 2 is announced, a quiet countdown tick each second from line 8 to zero, a short flat tone at each of the two deaths,
# a PA click, mop swishes near the door, a low drone. The siren and the ticks share the 42-frame heart-monitor rhythm of Part 1.
import json, numpy as np, wave
m = json.load(open("src/dorm2/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
mid = lambda i, k: L(i) + k * (E(i) - L(i))
rng = np.random.default_rng(52); t = np.arange(n) / SR
env = lambda a, b, f=0.5: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
bed = 0.08 * np.sin(2 * np.pi * 52 * t) * env(0, E(13) + 0.5, 1.0)
ann_a = L(2) + 4 / fps; ann_b = mid(3, 0.5) + 96 / fps
P = 42 / fps
wail = np.sin(2 * np.pi * np.cumsum(560 + 140 * np.sin(2 * np.pi * t / (2 * P))) / SR)
bed += 0.2 * wail * env(ann_a, ann_b, 0.25)
def tone(a, d, f=880, amp=0.12):
    return amp * np.sin(2 * np.pi * f * t) * env(a, a + d, 0.08)
beep = np.zeros(n)
for k in range(int(ann_a / P), int(ann_b / P) + 1):
    s0 = k * P
    if not (ann_a <= s0 < ann_b): continue
    i0 = int(s0 * SR); Lb = int(0.09 * SR)
    if i0 + Lb < n: beep[i0:i0 + Lb] = np.sin(2 * np.pi * 880 * np.arange(Lb) / SR) * np.exp(-np.arange(Lb) / (0.05 * SR))
bed += 0.2 * beep
# the countdown: a quiet tick every second from line 8 to zero, a short falling tone at zero
cd_a = L(8); zero = c["lineStart12"] / fps + 14 / fps
s = cd_a
while s < zero:
    i0 = int(s * SR); Lb = int(0.05 * SR)
    bed[i0:i0 + Lb] += 0.22 * np.sin(2 * np.pi * 1200 * np.arange(Lb) / SR) * np.exp(-np.arange(Lb) / (0.02 * SR))
    s += 1.0
i0 = int(zero * SR); Lb = int(0.9 * SR); tt = np.arange(Lb) / SR
bed[i0:i0 + Lb] += 0.2 * np.sin(2 * np.pi * np.cumsum(500 - 380 * tt) / SR) * np.exp(-tt * 3)
# a short flat tone at each death (about 1 s)
for d in (mid(6, 0.86), mid(7, 0.72)):
    bed += tone(d, 1.0)
for a, amp in ((ann_a, 0.5), (mid(3, 0.5), 0.5)):
    i0 = int(a * SR); Lc = int(0.1 * SR); bed[i0:i0 + Lc] += amp * np.exp(-np.arange(Lc) / 500) * rng.normal(0, 1, Lc)
# mop swishes near the door
for k in range(10):
    p = int(rng.uniform(L(4), E(12)) * SR); Ls = int(0.35 * SR)
    sw = rng.normal(0, 1, Ls); sw = np.convolve(sw, np.ones(60) / 60, "same") * np.hanning(Ls)
    bed[p:p + Ls] += 0.4 * sw
tail = int((E(13) + 0.8) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/dorm2v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
