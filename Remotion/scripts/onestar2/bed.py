"""Sound bed for "1 ดาว" Part 2 -> public/onestar2/bed.wav
Everything is synthesised with numpy. Reads src/onestar2/manifest.json; every event time comes from its cues.
  python scripts/onestar2/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/onestar2/manifest.json", encoding="utf-8"))
FPS, cues, shots, starts = m["fps"], m["cues"], m["shots"], m["starts"]
dur = m["total"] / FPS
N = int(dur * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(52)
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


# ---- rain: heavy outdoors (alley, fence), thin in the shop, light in the station, almost none in the train ----
rain = band(rng.standard_normal(N), 1400, 7500)
rain_amp = 0.10 * ramp(0.2, 2) * (1 - ramp(T["storeAt"] + 1.5, T["storeAt"] + 3.0))
rain_amp = rain_amp + 0.035 * ramp(T["storeAt"] + 1.5, T["storeAt"] + 3.0) * (1 - ramp(T["payAt"], T["payAt"] + 2))
rain_amp = rain_amp + 0.09 * ramp(T["payAt"], T["payAt"] + 1.5) * (1 - ramp(T["boardTrainAt"] - 0.5, T["boardTrainAt"] + 0.6))
rain_amp = rain_amp + 0.025 * ramp(T["boardTrainAt"] + 0.5, T["boardTrainAt"] + 2.0)
music += stereo(rain * rain_amp, 0.5) * 0.4
music += stereo(lowpass(rng.standard_normal(N), 420) * 0.05 * ramp(0, 3), 0.5)

# ---- the hook: a tick for the star, a low sting on the title ----
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.8) * 0.45, T["titleAt"], 0.5)
for k in range(5):
    put(sfx, np.sin(2 * np.pi * 1800 * np.arange(int(0.03 * SR)) / SR) * np.exp(-np.arange(int(0.03 * SR)) / SR / 0.006) * 0.18, 0.5 + 0.12 * k, 0.5)

# ---- the fence: a scrape, steps, a slow engine and headlights behind the bars ----
for k in range(6):
    n = int(0.12 * SR)
    tk = np.arange(n) / SR
    put(sfx, band(rng.standard_normal(n), 900, 4200) * np.exp(-tk / 0.05) * 0.1, T["climbAt"] + 0.8 + 0.28 * k, 0.6)
thump(T["climbAt"] + 2.4, 0.3, 70.0, 0.7)
n = int((T["storeAt"] - T["fenceAt"] + 0.5) * SR)
tk = np.arange(n) / SR
eng = (np.sin(2 * np.pi * 48 * tk) + 0.6 * np.sin(2 * np.pi * 96 * tk) + 0.3 * np.sin(2 * np.pi * 144 * tk)) * (0.8 + 0.2 * np.sin(2 * np.pi * 12 * tk))
put(music, lowpass(eng, 260) * np.minimum(1, tk / 0.8) * np.minimum(1, (n / SR - tk) / 0.8) * 0.17, T["fenceAt"] - 0.2, 0.3)
whoosh(T["fenceAt"] + 0.3, 1.8, 0.1, 0.7)

# ---- the shop: a door chime, fridge hum, soft music-less fluorescent buzz, the shelf, the phone switched off ----
chime(T["storeAt"] + 1.7, 1046, 784, 0.25, level=0.2)
hum = np.sin(2 * np.pi * 100 * tt) * 0.5 + np.sin(2 * np.pi * 200 * tt) * 0.2 + lowpass(rng.standard_normal(N), 300) * 0.4
shop = ramp(T["storeAt"] + 1.7, T["storeAt"] + 2.4) * (1 - ramp(T["payAt"] - 0.2, T["payAt"] + 0.6))
music += stereo(hum * shop * 0.016, 0.5)
n = int(0.1 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 1800) * np.exp(-tk / 0.04) * 0.22, T["grabAt"] + 0.6, 0.45)
put(sfx, np.sin(2 * np.pi * np.cumsum(np.linspace(900, 260, int(0.45 * SR))) / SR) * np.exp(-np.arange(int(0.45 * SR)) / SR / 0.2) * 0.12, T["grabAt"] + 1.9, 0.5)

# ---- the product beat: a calm lift under the product insert, no sales sound ----
n = int((T["screenAt"] - T["prodAt"] + 0.5) * SR)
tk = np.arange(n) / SR
pad = (np.sin(2 * np.pi * 220 * tk) + 0.6 * np.sin(2 * np.pi * 330 * tk * 1.003)) * np.sin(np.pi * np.clip(tk / (n / SR), 0, 1)) ** 1.3
put(music, pad * 0.05, T["prodAt"], 0.5)

# ---- the counter: the register's tick-chime, the same pitch as the app's chime ----
chime(T["screenAt"] + 2.3, 988, 1318, 0.5, level=0.22)
thump(T["screenAt"] + 2.6, 0.2, 60.0)

# ---- the back door, the run, the station: steps, a far announcement hum, the countdown board ----
whoosh(T["payAt"] + 0.2, 0.5, 0.08, 0.7)
t = T["payAt"] + 0.9
while t < T["boardAt"] + 1.0:
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 900) * np.exp(-tk / 0.035) * 0.13, t, 0.5 + 0.1 * np.sin(t * 9))
    t += 0.3
n = int((T["boardTrainAt"] - T["boardAt"]) * SR)
tk = np.arange(n) / SR
hall = lowpass(rng.standard_normal(n), 380) * 0.5 * np.minimum(1, tk / 1.0) * np.minimum(1, (n / SR - tk) / 1.0)
put(music, hall * 0.09, T["boardAt"], 0.5)
chime(T["boardAt"] + 3.0, 740, 988, 0.9, detune=0.012, vib=0.004, level=0.18)
thump(T["thinkAt"] + 0.3, 0.28, 56.0)
thump(T["thinkAt"] + 1.0, 0.2, 52.0)

# ---- the lanyard torn off and dropped; the flower seller's hand; the tunnel rising ----
whoosh(T["tearAt"] + 0.2, 0.35, 0.12, 0.5)
n = int(0.3 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 2000, 7000) * np.exp(-tk / 0.05) * 0.18, T["tearAt"] + 2.2, 0.45)
chime(T["tearAt"] + 2.6, 659, 880, 1.2, detune=0.02, vib=0.01, level=0.15)
thump(T["flowerAt"] + 0.2, 0.3, 60.0)
rs = T["boardTrainAt"] - T["tunnelAt"]
n = int(rs * SR)
tk = np.arange(n) / SR
rum = lowpass(rng.standard_normal(n), 150) * (tk / rs) ** 1.6 * 0.5 + np.sin(2 * np.pi * np.cumsum(60 + 80 * (tk / rs) ** 2) / SR) * (tk / rs) ** 1.4 * 0.3
put(music, rum * 0.25, T["tunnelAt"], 0.5)
put(sfx, band(rng.standard_normal(n), 800, 6000) * (tk / rs) ** 2.2 * 0.08, T["tunnelAt"], 0.5)

# ---- the train: door chime and slide, then a steady rumble; the wave is silent; the plug clicks; the phone wakes ----
for k in range(3):
    chime(T["boardTrainAt"] + 0.3 + 0.22 * k, 1175, 1175, 0.12, level=0.14)
n = int(0.6 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 300, 2500) * np.sin(np.pi * np.clip(tk / 0.6, 0, 1)) * 0.12, T["boardTrainAt"] + 1.0, 0.5)
n = int((outro - T["boardTrainAt"] - 1.0) * SR)
tk = np.arange(n) / SR
rumble = lowpass(rng.standard_normal(n), 180) * 0.5 * (0.8 + 0.2 * np.sin(2 * np.pi * 2.2 * tk)) * np.minimum(1, tk / 1.0)
put(music, rumble * 0.18, T["boardTrainAt"] + 1.0, 0.5)
n = int(0.05 * SR)
tk = np.arange(n) / SR
put(sfx, band(rng.standard_normal(n), 1800, 6500) * np.exp(-tk / 0.01) * 0.4, T["plugAt"] + 1.5, 0.45)
put(sfx, np.sin(2 * np.pi * 150 * np.arange(int(0.2 * SR)) / SR) * np.exp(-np.arange(int(0.2 * SR)) / SR / 0.06) * 0.3, T["plugAt"] + 1.52, 0.5)
chime(T["plugAt"] + 2.3, 880, 1175, 0.7, level=0.2)
n = int(2.6 * SR)
tk = np.arange(n) / SR
put(music, lowpass(np.sin(2 * np.pi * 55 * tk) + 0.5 * np.sin(2 * np.pi * 82 * tk), 240) * np.sin(np.pi * np.clip(tk / 2.6, 0, 1)) ** 1.2 * 0.2, T["msgAt"] - 0.4, 0.5)
chime(T["msgAt"] + 0.2, 523, 698, 1.7, detune=0.02, vib=0.01, level=0.22)

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
wavfile.write("public/onestar2/bed.wav", SR, (bed.T * 32767).astype(np.int16))
