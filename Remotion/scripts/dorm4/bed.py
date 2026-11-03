# Sound bed for dorm Part 4: a siren wail only while rule 4 is announced, PA clicks, a very quiet beep on the siren's rhythm while the red light blinks on you (a planted clue),
# a short flat tone when the man behind the door falls, a countdown tick for the last minute, a low drone, and a soft chord-less hush when the count reaches zero.
import json, numpy as np, wave
m = json.load(open("src/dorm4/manifest.json", encoding="utf-8"))
SR = 44100; fps = m["fps"]; n = int(m["total"] / fps * SR)
c = m["cues"]; L = lambda i: c[f"lineStart{i}"] / fps; E = lambda i: c[f"lineEnd{i}"] / fps
mid = lambda i, k: L(i) + k * (E(i) - L(i))
rng = np.random.default_rng(61); t = np.arange(n) / SR
env = lambda a, b, f=0.5: np.clip(np.minimum((t - a) / f, (b - t) / f), 0, 1)
zero = L(12) + 14 / fps
bed = 0.08 * np.sin(2 * np.pi * 52 * t) * env(0, E(13) + 0.5, 1.0)
bed *= 1 - 0.6 * env(zero, zero + 3.0, 0.3)
ann_a = L(2) + 4 / fps; ann_b = mid(2, 0.62) + 96 / fps
P = 42 / fps
wail = np.sin(2 * np.pi * np.cumsum(560 + 140 * np.sin(2 * np.pi * t / (2 * P))) / SR)
bed += 0.2 * wail * env(ann_a, ann_b, 0.25)
def pings(a, b, f0, amp, per):
    out = np.zeros(n)
    for k in range(int(a / per), int(b / per) + 1):
        s0 = k * per
        if not (a <= s0 < b): continue
        i0 = int(s0 * SR); Lb = int(0.09 * SR)
        if i0 + Lb < n: out[i0:i0 + Lb] = np.sin(2 * np.pi * f0 * np.arange(Lb) / SR) * np.exp(-np.arange(Lb) / (0.05 * SR))
    return amp * out
bed += pings(ann_a, ann_b, 880, 0.2, P)
bed += pings(L(3) + 1.0, L(4) + 1.0, 880, 0.035, P)      # the faint beep on the siren's rhythm while the light blinks on you
bed += pings(L(6), zero, 1200, 0.07, 1.0)                # one tick a second for the countdown
fall = mid(7, 0.55)
bed += 0.12 * np.sin(2 * np.pi * 880 * t) * env(fall, fall + 1.0, 0.08)
for a, amp in ((ann_a, 0.5), (mid(2, 0.62), 0.5), (L(3), 0.4)):
    i0 = int(a * SR); Lc = int(0.1 * SR); bed[i0:i0 + Lc] += amp * np.exp(-np.arange(Lc) / 500) * rng.normal(0, 1, Lc)
for k in range(6):
    p = int(rng.uniform(L(3), L(12)) * SR); Ls = int(0.35 * SR)
    sw = rng.normal(0, 1, Ls); sw = np.convolve(sw, np.ones(60) / 60, "same") * np.hanning(Ls)
    bed[p:p + Ls] += 0.25 * sw
tail = int((E(13) + 0.8) * SR); f = np.ones(n); f[tail:] = np.linspace(1, 0, n - tail) ** 2; bed *= f
bed *= 0.9 / max(1e-6, np.abs(bed).max())
with wave.open("public/dorm4v/bed.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((bed * 32767 * 0.8).astype(np.int16).tobytes())
print("bed", n / SR)
