"""Sound bed for "1 ดาว" Part 1 -> public/onestar1/bed.wav
Everything is synthesised with numpy. Reads src/onestar1/manifest.json; every event time comes from its cues.
  python scripts/onestar1/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/onestar1/manifest.json", encoding="utf-8"))
FPS, cues, shots, starts = m["fps"], m["cues"], m["shots"], m["starts"]
dur = m["total"] / FPS
N = int(dur * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(41)
sec = lambda f: f / FPS
T = {k: sec(v) for k, v in cues.items()}
outro = sec(m["outroStart"])


def stereo(sig, pan=0.5):
    return np.stack([sig * np.cos(pan * np.pi / 2), sig * np.sin(pan * np.pi / 2)]) * 1.41


def put(buf, sig, t0, pan=0.5):
    i = int(t0 * SR)
    if i >= buf.shape[1] or i < 0:
        return
    s = stereo(sig, pan)
    n = min(s.shape[1], buf.shape[1] - i)
    buf[:, i:i + n] += s[:, :n]


def lowpass(x, hz, order=2):
    b, a = butter(order, hz / (SR / 2), "low")
    return lfilter(b, a, x)


def highpass(x, hz, order=2):
    b, a = butter(order, hz / (SR / 2), "high")
    return lfilter(b, a, x)


def band(x, lo, hi):
    return highpass(lowpass(x, hi), lo)


def ramp(t0, t1):
    return np.clip((tt - t0) / max(1e-6, t1 - t0), 0, 1)


def reverb(buf, seconds=1.2, decay=0.35):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(buf)
    for ch in range(2):
        ir = lowpass(rng.standard_normal(n) * np.exp(-t / decay), 4500)
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        out[ch] = fftconvolve(buf[ch], ir)[: buf.shape[1]]
    return out


music = np.zeros((2, N))   # drones, pulse (gets reverb)
sfx = np.zeros((2, N))     # dry events


def env_noise(seconds, lo, hi, level, shape=1.5):
    n = int(seconds * SR)
    tk = np.arange(n) / SR
    return band(rng.standard_normal(n), lo, hi) * np.sin(np.pi * np.clip(tk / seconds, 0, 1)) ** shape * level


def whoosh(t0, seconds, level, pan):
    n = int(seconds * SR)
    tk = np.arange(n) / SR
    sweep = band(rng.standard_normal(n), 500, 4200) * np.sin(np.pi * np.clip(tk / seconds, 0, 1)) ** 2
    put(sfx, sweep * level, t0, pan)


def chime(t0, f1, f2, decay, detune=0.0, vib=0.0, level=0.22):
    n = int((decay * 5 + 0.2) * SR)
    tk = np.arange(n) / SR
    wob = 1 + vib * np.sin(2 * np.pi * 5 * tk)
    s = np.sin(2 * np.pi * f1 * wob * tk) + 0.7 * np.sin(2 * np.pi * f1 * (1 + detune) * tk)
    s2 = np.sin(2 * np.pi * f2 * wob * tk) * (tk > 0.14)
    sig = (s * np.exp(-tk / decay) + 0.8 * s2 * np.exp(-(tk - 0.14).clip(0) / decay)) * np.minimum(1, tk / 0.004)
    put(sfx, sig * level, t0, 0.5)


def thump(t0, level=0.5, f=62.0, pan=0.5):
    n = int(0.5 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * (f + 40 * np.exp(-tk / 0.03)) * tk) * np.exp(-tk / 0.13) * level, t0, pan)


# ---- the rain, all the way through, thinner at the hook and in the room, heavy in the street ----
rain = band(rng.standard_normal(N), 1400, 7500)
rain_amp = 0.09 + 0.05 * ramp(T["pickupAt"], T["pickupAt"] + 2) * (1 - ramp(T["arriveAt"] + 2, T["rateAt"]))
rain_amp = rain_amp + 0.07 * ramp(T["runAt"] + 2, T["runAt"] + 4)
rain_amp = rain_amp * (1 - 0.35 * ramp(T["buzzAt"], T["buzzAt"] + 1) * (1 - ramp(T["runAt"], T["runAt"] + 2)))
music += stereo(rain * rain_amp, 0.5) * 0.4
music += stereo(lowpass(rng.standard_normal(N), 420) * 0.05 * ramp(0, 3), 0.5)

# ---- the hook: a low sting on the title card, a tick for the star ----
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.8) * 0.45, T["titleAt"], 0.5)
for k in range(5):
    put(sfx, np.sin(2 * np.pi * 1800 * np.arange(int(0.03 * SR)) / SR) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.006) * 0.18, 0.5 + 0.12 * k, 0.5)

# ---- the booking: the app's soft chime, a car approaching ----
chime(T["bookAt"] + 1.4, 988, 1318, 0.35, level=0.16)

# ---- the ride: engine idle, wipers, the mirror's low pulse, the sign passing three times ----
n = int((T["arriveAt"] - T["pickupAt"] + 1.0) * SR)
tk = np.arange(n) / SR
engine = (np.sin(2 * np.pi * 48 * tk) + 0.6 * np.sin(2 * np.pi * 96 * tk * (1 + 0.004 * np.sin(2 * np.pi * 7 * tk))) + 0.3 * np.sin(2 * np.pi * 144 * tk)) * (0.8 + 0.2 * np.sin(2 * np.pi * 13 * tk))
engine = lowpass(engine, 260) * np.minimum(1, tk / 0.8) * np.minimum(1, (n / SR - tk) / 0.8)
put(music, engine * 0.17, T["pickupAt"] - 0.3, 0.45)
t = T["pickupAt"] + 0.6
k = 0
while t < T["arriveAt"]:
    n = int(0.42 * SR)
    tk = np.arange(n) / SR
    put(sfx, band(rng.standard_normal(n), 600, 3200) * np.sin(np.pi * np.clip(tk / 0.42, 0, 1)) ** 2 * 0.07, t, 0.3 + 0.4 * (k % 2))
    t += 1.15
    k += 1
for i in range(3):
    t0 = T["circleAt"] + (T["arriveAt"] - T["circleAt"]) * i / 3
    whoosh(t0 + 0.3, 0.9, 0.09, 0.8 - 0.3 * i)
    thump(t0 + 1.0, 0.18 + 0.06 * i, 52.0, 0.5)
n = int(2.2 * SR)
tk = np.arange(n) / SR
put(music, np.sin(2 * np.pi * 41 * tk) * np.sin(np.pi * np.clip(tk / 2.2, 0, 1)) ** 1.4 * 0.2, T["pickupAt"] + 0.4, 0.5)

# ---- arriving: the door, steps, the rating taps ----
whoosh(T["arriveAt"] + 0.2, 0.5, 0.08, 0.2)
for k in range(8):
    n = int(0.08 * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 700) * np.exp(-tk / 0.03) * 0.12, T["arriveAt"] + 1.2 + 0.36 * k, 0.5 - 0.02 * k)
for k in range(11):
    n = int(0.03 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * (1500 + 40 * (k % 3)) * tk) * np.exp(-tk / 0.006) * 0.2, T["rateAt"] + 0.6 + 0.1 * k, 0.5)
chime(T["rateAt"] + 2.2, 1175, 784, 0.25, level=0.13)

# ---- the buzz, the message and its countdown: the chime gets slower, lower, more wrong each time ----
for k in range(3):
    n = int(0.18 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * 150 * tk) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * tk))) * 0.2, T["buzzAt"] + 0.9 + 0.3 * k, 0.5)
chime(T["thanksAt"] + 0.1, 880, 1175, 0.5)
chime(T["againAt"] + 0.1, 740, 988, 1.0, detune=0.012, vib=0.004, level=0.2)
chime(T["runAt"] - 0.6, 523, 698, 1.7, detune=0.02, vib=0.01, level=0.2)
thump(T["thanksAt"] + 1.9, 0.25)

# ---- the headlights across the wall, a car slowing in the street ----
whoosh(T["lightsAt"] + 0.1, 1.5, 0.12, 0.8)
n = int(3.0 * SR)
tk = np.arange(n) / SR
put(music, lowpass(np.sin(2 * np.pi * 55 * tk * (1 + 0.1 * tk / 3)) + 0.5 * np.sin(2 * np.pi * 110 * tk), 220) * np.sin(np.pi * np.clip(tk / 3.0, 0, 1)) ** 1.2 * 0.2, T["lightsAt"] + 0.2, 0.7)

# ---- the chase: steps, a heartbeat that speeds up, the car's engine behind, a riser into the lock ----
t = T["runAt"] + 1.8
while t < T["deadEndAt"] - 0.3:
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 900) * np.exp(-tk / 0.035) * 0.14, t, 0.5 + 0.1 * np.sin(t * 9))
    t += 0.29
t = T["followAt"]
gap = 0.95
while t < T["deadEndAt"] + 0.2:
    thump(t, 0.32, 58.0)
    thump(t + 0.17, 0.2, 52.0)
    gap = max(0.42, gap * 0.93)
    t += gap
n = int((T["unlockAt"] - T["followAt"] + 1.5) * SR)
tk = np.arange(n) / SR
eng = (np.sin(2 * np.pi * 52 * tk) + 0.7 * np.sin(2 * np.pi * 104 * tk) + 0.4 * np.sin(2 * np.pi * 156 * tk)) * (0.8 + 0.2 * np.sin(2 * np.pi * 11 * tk))
put(music, lowpass(eng, 280) * np.minimum(1, tk / 1.0) * (0.12 + 0.12 * np.clip(tk / ((T["deadEndAt"] - T["followAt"])), 0, 1)) * np.minimum(1, (n / SR - tk) / 0.4), T["followAt"] - 0.2, 0.3)
rs = T["unlockAt"] - T["deadEndAt"]
n = int(rs * SR)
tk = np.arange(n) / SR
rise = np.sin(2 * np.pi * np.cumsum(80 + 420 * (tk / rs) ** 2) / SR) * (tk / rs) ** 1.5
put(sfx, rise * 0.14 + band(rng.standard_normal(n), 800, 6000) * (tk / rs) ** 2 * 0.09, T["deadEndAt"], 0.5)

# ---- the lock: a hard silence-cut, a servo thunk, a soft unlock chime ----
sil = int(0.0 * SR)
n = int(0.06 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 1500, 6000) * np.exp(-tk / 0.012) * 0.5, T["unlockAt"] + 0.06, 0.4)
put(sfx, np.sin(2 * np.pi * (95 + 60 * np.exp(-np.arange(int(0.4 * SR)) / SR / 0.05)) * np.arange(int(0.4 * SR)) / SR) * np.exp(-np.arange(int(0.4 * SR)) / SR / 0.12) * 0.6, T["unlockAt"] + 0.08, 0.5)
chime(T["unlockAt"] + 0.45, 659, 880, 1.2, detune=0.02, level=0.16)

# ---- the finale card: a low sting; faint swishes at the line changes ----
n = int(2.2 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 1.0) * 0.4, outro, 0.5)
for i in range(1, len(shots)):
    whoosh(T[f"lineStart{i}"] - 0.2, 0.28, 0.05, 0.3 + 0.4 * (i % 2))

music_wet = reverb(music)

# ---- mix, duck under the narration, fade ----
duck = np.ones(N)
for i, s in enumerate(shots):
    a = int(sec(starts[i] + s["leadFrames"]) * SR)
    b = int(sec(starts[i] + s["leadFrames"] + s["audioFrames"]) * SR)
    duck[a:b] = 0.55
k = int(0.25 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode="same")

bed = (music + 0.4 * music_wet + sfx) * duck
bed *= np.minimum(1, tt / 0.3) * np.minimum(1, np.maximum(0, (dur - tt) / 1.5))
bed = bed[:, : int(dur * SR)]
bed = bed / np.max(np.abs(bed)) * 0.55
rms = np.sqrt(np.mean(bed ** 2))
print(f"bed: {dur:.1f}s, peak {20 * np.log10(np.max(np.abs(bed))):.1f} dBFS, rms {20 * np.log10(rms):.1f} dBFS")
wavfile.write("public/onestar1/bed.wav", SR, (bed.T * 32767).astype(np.int16))
