"""Sound bed for "1 ดาว" Part 3 -> public/onestar3/bed.wav
Everything is synthesised with numpy. Reads src/onestar3/manifest.json; every event time comes from its cues.
  python scripts/onestar3/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/onestar3/manifest.json", encoding="utf-8"))
FPS, cues, shots, starts = m["fps"], m["cues"], m["shots"], m["starts"]
dur = m["total"] / FPS
N = int(dur * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(63)
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


# ---- rain everywhere, but thin inside the carriage and the house, louder on the platform and in the lane ----
rain = band(rng.standard_normal(N), 1400, 7500)
rain_amp = 0.04 * ramp(0.2, 2) * (1 - ramp(T["benchAt"] - 1.0, T["benchAt"]))
rain_amp = rain_amp + 0.10 * ramp(T["benchAt"] - 0.5, T["benchAt"] + 0.8) * (1 - ramp(T["houseAt"] - 0.6, T["houseAt"] + 0.4))
rain_amp = rain_amp + 0.03 * ramp(T["houseAt"], T["houseAt"] + 1.5) * (1 - ramp(T["exitAt"] + 1.5, T["exitAt"] + 3.0))
rain_amp = rain_amp + 0.11 * ramp(T["exitAt"] + 2.5, T["exitAt"] + 4.0)
music += stereo(rain * rain_amp, 0.5) * 0.4
music += stereo(lowpass(rng.standard_normal(N), 420) * 0.05 * ramp(0, 3), 0.5)

# ---- the hook: a low sting on the title, the train's slow hiss and the hum of the carriage ----
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.8) * 0.45, T["titleAt"], 0.5)
n = int((T["benchAt"] - 0.5) * SR)
tk = np.arange(n) / SR
carriage = (np.sin(2 * np.pi * 110 * tk) * 0.4 + lowpass(rng.standard_normal(n), 260) * 0.5) * np.minimum(1, tk / 1.5) * np.minimum(1, (n / SR - tk) / 1.0)
put(music, carriage * 0.07, 0.0, 0.5)
n = int(1.4 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 2500, 8000) * np.sin(np.pi * np.clip(tk / 1.4, 0, 1)) ** 2 * 0.07, T["trainAt"] + 0.2, 0.5)

# ---- the number: an app chime and a low swell when it rises, the first time the number goes up ----
chime(T["riseAt"] + 1.6, 988, 1318, 0.6, level=0.22)
n = int(2.4 * SR)
tk = np.arange(n) / SR
put(music, lowpass(np.sin(2 * np.pi * 55 * tk) + 0.6 * np.sin(2 * np.pi * 82.4 * tk), 240) * np.sin(np.pi * np.clip(tk / 2.4, 0, 1)) ** 1.2 * 0.22, T["lineStart4"] - 0.2, 0.5)
thump(T["lineStart4"] + 0.4, 0.3, 58.0)

# ---- the station: steps, a far buzz of the canopy lights, the bench creak, her low hum ----
t = T["benchAt"] + 0.3
while t < T["benchAt"] + 6.0:
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 900) * np.exp(-tk / 0.035) * 0.12, t, 0.5 + 0.1 * np.sin(t * 9))
    t += 0.55
n = int((T["houseAt"] - T["benchAt"]) * SR)
tk = np.arange(n) / SR
put(music, (np.sin(2 * np.pi * 100 * tk) * 0.5 + lowpass(rng.standard_normal(n), 300) * 0.4) * 0.018 * np.minimum(1, tk / 1.0) * np.minimum(1, (n / SR - tk) / 1.0), T["benchAt"], 0.5)
chime(T["nameAt"] + 1.0, 659, 880, 1.2, detune=0.02, vib=0.01, level=0.12)
thump(T["loopholeAt"] + 0.4, 0.26, 56.0)

# ---- the house: a door, the lamp's hum, a clock, the cup; low drone ----
n = int(0.4 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 200, 1800) * np.exp(-tk / 0.12) * 0.2, T["houseAt"] + 0.2, 0.55)
n = int((T["exitAt"] + 1.0 - T["houseAt"]) * SR)
tk = np.arange(n) / SR
drone = (np.sin(2 * np.pi * 55 * tk) + 0.5 * np.sin(2 * np.pi * 82.4 * tk * 1.002)) * np.minimum(1, tk / 2.0)
put(music, lowpass(drone, 200) * 0.1, T["houseAt"], 0.5)
t = T["houseAt"] + 1.0
while t < T["exitAt"]:
    n = int(0.03 * SR)
    tk = np.arange(n) / SR
    put(sfx, band(rng.standard_normal(n), 1500, 5000) * np.exp(-tk / 0.01) * 0.05, t, 0.4)
    t += 1.0

# ---- the two chimes: hers first, then yours; the app chime gets slower ----
chime(T["chimeAt"] + 14 / FPS, 880, 1175, 0.55, level=0.24)
chime(T["chimeAt"] + 62 / FPS, 880, 1175, 0.55, level=0.24)
thump(T["chimeAt"] + 62 / FPS, 0.2, 60.0)
chime(T["pinAt"] + 1.6, 659, 880, 1.0, detune=0.02, vib=0.01, level=0.14)
thump(T["starAt"] + 0.2, 0.3, 56.0)
chime(T["starAt"] + 2.2, 740, 988, 1.2, detune=0.012, vib=0.004, level=0.16)

# ---- the lock: a heavy key scrape, a clunk, then her breath and the clock ----
n = int(0.5 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 800, 4500) * np.exp(-tk / 0.2) * 0.14, T["lockAt"] + 8 / FPS, 0.6)
put(sfx, band(rng.standard_normal(int(0.08 * SR)), 300, 2500) * np.exp(-np.arange(int(0.08 * SR)) / SR / 0.02) * 0.5, T["lockAt"] + 70 / FPS, 0.6)
put(sfx, np.sin(2 * np.pi * 110 * np.arange(int(0.35 * SR)) / SR) * np.exp(-np.arange(int(0.35 * SR)) / SR / 0.1) * 0.5, T["lockAt"] + 70 / FPS, 0.6)
thump(T["lockAt"] + 1.8, 0.3, 54.0)
thump(T["threeAt"] + 0.2, 0.28, 52.0)
thump(T["threeAt"] + 1.1, 0.22, 50.0)

# ---- the press: a riser under "คุณคว้ามือถือป้า", a soft tap on the star, the number leaving ----
rs = (T["pressAt"] + 70 / FPS) - T["pressAt"]
n = int(rs * SR)
tk = np.arange(n) / SR
put(music, band(rng.standard_normal(n), 400, 6000) * (tk / rs) ** 2.0 * 0.12, T["pressAt"], 0.5)
put(sfx, np.sin(2 * np.pi * 1600 * np.arange(int(0.05 * SR)) / SR) * np.exp(-np.arange(int(0.05 * SR)) / SR / 0.012) * 0.3, T["pressAt"] + 70 / FPS, 0.5)
thump(T["pressAt"] + 70 / FPS, 0.5, 60.0)
chime(T["pressAt"] + 80 / FPS, 1568, 1175, 0.4, level=0.18)
chime(T["moveAt"] + 0.4, 1175, 880, 0.9, detune=0.012, vib=0.004, level=0.18)
whoosh(T["moveAt"] + 0.6, 0.9, 0.1, 0.35)
chime(T["moveAt"] + 1.6, 988, 1318, 0.8, level=0.14)

# ---- the lock pops, the door, the lane: a click, the creak, rain and headlights far away; then only rain ----
put(sfx, band(rng.standard_normal(int(0.05 * SR)), 1500, 6500) * np.exp(-np.arange(int(0.05 * SR)) / SR / 0.01) * 0.45, T["exitAt"] + 0.15, 0.5)
put(sfx, np.sin(2 * np.pi * 150 * np.arange(int(0.2 * SR)) / SR) * np.exp(-np.arange(int(0.2 * SR)) / SR / 0.06) * 0.3, T["exitAt"] + 0.17, 0.5)
n = int(1.0 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 250, 1200) * np.sin(np.pi * np.clip(tk / 1.0, 0, 1)) * 0.1, T["exitAt"] + 0.5, 0.5)
t = T["exitAt"] + 3.2
while t < T["guiltAt"] - 0.5:
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 800) * np.exp(-tk / 0.04) * 0.1, t, 0.5 + 0.05 * np.sin(t * 7))
    t += 0.6
rs = outro - T["exitAt"] - 3.0
n = int(rs * SR)
tk = np.arange(n) / SR
eng = (np.sin(2 * np.pi * 46 * tk) + 0.5 * np.sin(2 * np.pi * 92 * tk)) * (tk / rs) ** 1.2
put(music, lowpass(eng, 240) * 0.1, T["exitAt"] + 3.0, 0.4)
put(sfx, np.sin(2 * np.pi * 523 * np.arange(int(2.0 * SR)) / SR) * np.exp(-np.arange(int(2.0 * SR)) / SR / 0.6) * 0.1, T["guiltAt"] + 0.4, 0.5)

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
wavfile.write("public/onestar3/bed.wav", SR, (bed.T * 32767).astype(np.int16))
