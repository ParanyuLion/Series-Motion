"""Sound bed for BTS Part 5 -> public/bts5/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/bts/manifest.json; every event time comes from its cues.
  python scripts/bts5/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/bts5/manifest.json", encoding="utf-8"))
FPS, cues, shots, starts = m["fps"], m["cues"], m["shots"], m["starts"]
dur = m["total"] / FPS
N = int(dur * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(31)
sec = lambda f: f / FPS


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


def ramp(t0, t1):
    return np.clip((tt - t0) / max(1e-6, t1 - t0), 0, 1)


def reverb(buf, seconds=1.4, decay=0.4):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(buf)
    for ch in range(2):
        ir = lowpass(rng.standard_normal(n) * np.exp(-t / decay), 4500)
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        out[ch] = fftconvolve(buf[ch], ir)[: buf.shape[1]]
    return out


T = {k: sec(v) for k, v in cues.items()}
outro = sec(m["outroStart"])
sfx = np.zeros((2, N))
music = np.zeros((2, N))
dstart = -0.6  # the train is already moving when the part starts

# ---- the train: a fast, low rumble and rail clacks; the speed is the point of the part ----
moving = ramp(dstart + 0.6, dstart + 3.0) * (1 - 0.92 * ramp(cues["brakeAt"] / FPS, cues["stopAt"] / FPS))
rumble = lowpass(rng.standard_normal(N), 150) * 0.34 * moving
sfx += np.stack([rumble, np.roll(rumble, 400)])
hum = lowpass(rng.standard_normal(N), 700) * 0.04 * moving
sfx += np.stack([hum, np.roll(hum, 900)])
t = 0.4
while t < dur - 3.0:
    speed = max(0.6, (4.0 + 1.2 * float(np.clip(t / 3.0, 0, 1))) * (1 - 0.85 * float(np.clip((t - T["brakeAt"]) / (T["stopAt"] - T["brakeAt"]), 0, 1))))  # clacks per second
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    clack = highpass(lowpass(rng.standard_normal(n), 2600), 500) * np.exp(-tk / 0.02) * 0.55
    put(sfx, clack * 0.24, t, 0.5 + 0.2 * np.sin(t))
    put(sfx, clack * 0.13, t + 0.07, 0.5)
    t += 1.0 / speed


def whoosh(t0, length=0.9, vel=0.45, pan=0.5):
    n = int(length * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 3200) * np.sin(np.pi * np.clip(tk / length, 0, 1)) ** 2 * vel, t0, pan)



def thud(t0, vel=1.0, f=60.0, pan=0.5):
    n = int(0.45 * SR)
    tk = np.arange(n) / SR
    put(sfx, (np.sin(2 * np.pi * f * tk) * np.exp(-tk / 0.12) * 0.9 + highpass(lowpass(rng.standard_normal(n), 900), 100) * np.exp(-tk / 0.04) * 0.5) * vel, t0, pan)


def tick(t0, vel=1.0):
    n = int(0.05 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * 1800 * tk) * np.exp(-tk / 0.008) * 0.3 * vel, t0, 0.5)


def whoosh(t0, length=0.9, vel=0.45, pan=0.5):
    n = int(length * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 3200) * np.sin(np.pi * np.clip(tk / length, 0, 1)) ** 2 * vel, t0, pan)


def groan(length=1.4, f0=130.0, vel=1.0):
    n = int(length * SR)
    tg = np.arange(n) / SR
    f = f0 * (1 - 0.35 * tg / length)
    ph = 2 * np.pi * np.cumsum(f) / SR
    core = sum(np.sin(ph * k + 0.3 * k) / k for k in (1, 2, 3, 4)) * (1 + 0.3 * np.sin(2 * np.pi * 7 * tg))
    breath = highpass(lowpass(rng.standard_normal(n), 1800), 250) * 0.6
    env = np.minimum(1, tg / 0.12) * np.minimum(1, (length - tg) / 0.5)
    return lowpass((core * 0.5 + breath * 0.5) * env, 1300) * 0.5 * vel


def riser(t_end, length=1.4, vel=1.0):
    n = int(length * SR)
    tr = np.arange(n) / SR
    env = (tr / length) ** 2.2
    sweep = np.sin(2 * np.pi * np.cumsum(180 + 1500 * (tr / length) ** 2) / SR) * env * 0.16
    noise = highpass(lowpass(rng.standard_normal(n), 5000), 600) * env * 0.22
    put(music, (sweep + noise) * vel, t_end - length, 0.5)
    nb = int(1.0 * SR)
    tb = np.arange(nb) / SR
    put(sfx, np.sin(2 * np.pi * 42 * tb) * np.exp(-tb / 0.3) * 0.9 * vel + highpass(rng.standard_normal(nb), 900) * np.exp(-tb / 0.06) * 0.25 * vel, t_end, 0.5)


def stinger(t0, vel=1.0):
    n = int(0.7 * SR)
    ts = np.arange(n) / SR
    f = 700 + 1500 * ts / 0.7
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.012 * np.sin(2 * np.pi * 9 * ts))) / SR
    sig = (np.sin(ph) + 0.4 * np.sin(2 * ph)) * np.exp(-ts / 0.45) * np.minimum(1, ts / 0.02) * 0.18 * vel
    put(music, sig, t0, 0.5)


stop_t = T["stopAt"]

# ---- the hook: a heartbeat, dull thumps from inside the cab; the door slides up ----
t = 0.5
while t < T["doorOpenAt"]:
    prog = t / T["doorOpenAt"]
    period = 0.85 - 0.3 * prog
    for off, a in ((0.0, 1.0), (0.2 * period, 0.7)):
        n = int(0.22 * SR)
        tk = np.arange(n) / SR
        put(sfx, np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 0.07) * a * 0.9 * (0.5 + 0.5 * prog), t + off, 0.5)
    t += period
for dt in (1.3, 3.1, 4.4, 5.9):
    thud(dt, 0.45, 85, 0.45)
n = int(0.9 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 1500) * np.sin(np.pi * np.clip(tk / 0.9, 0, 1)) * 0.3 + np.sin(2 * np.pi * 120 * tk) * np.exp(-tk / 0.5) * 0.3, T["doorOpenAt"], 0.5)  # the door slides up
riser(T["doorOpenAt"] + 0.4, 1.0, 0.7)
stinger(T["doorOpenAt"] + 0.4, 0.8)
whoosh(T["doorOpenAt"] + 0.9, 0.7, 0.4)

# ---- the driver turns; the hit; the fall ----
put(sfx, groan(vel=1.0), T["turnAt"] + 0.2, 0.4)
riser(T["turnAt"] + 0.1, 1.0, 0.8)
stinger(T["turnAt"], 0.9)
put(sfx, groan(length=1.0, f0=110.0, vel=0.7), T["swingAt"] - 0.1, 0.4)
whoosh(T["swingAt"], 0.4, 0.4, 0.6)
n = int(0.4 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 900) * np.exp(-tk / 0.04) * 0.7 + np.sin(2 * np.pi * 110 * tk) * np.exp(-tk / 0.12) * 0.9, T["hitAt"], 0.5)  # a metal clang and a thud
put(sfx, np.sin(2 * np.pi * 1500 * tk) * np.exp(-tk / 0.15) * 0.15, T["hitAt"], 0.5)
thud(T["hitAt"] + 0.5, 0.8, 55, 0.4)
stinger(T["hitAt"], 1.0)

# ---- the drag, the push, the horde ----
t = T["dragAt"] + 0.9
while t < T["pushAt"] + 1.2:
    n = int(0.3 * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 1100) * np.sin(np.pi * np.clip(tk / 0.3, 0, 1)) * 0.2, t, 0.55)  # scuffing on the floor
    t += 0.33
thud(T["pushAt"] + 1.2, 0.8, 60, 0.6)
for k in range(6):
    put(sfx, groan(length=1.2, f0=[120.0, 150.0, 135.0, 105.0, 160.0, 125.0][k], vel=0.35 + 0.05 * k), T["hordeAt"] - 0.4 + 0.5 * k, 0.85 - 0.1 * k)
riser(T["lockAt"], 1.4, 0.9)
n = int(0.5 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 1500) * np.exp(-tk / 0.05) * 0.6 + np.sin(2 * np.pi * 80 * tk) * np.exp(-tk / 0.2) * 1.0, T["lockAt"], 0.6)  # the door slams
tick(T["lockAt"] + 0.35, 1.5)
t = T["lockAt"] + 0.6
while t < T["brakeAt"] + 1.5:
    thud(t, 0.5, 78, 0.75)  # the horde on the door
    t += 0.28

# ---- the brake: a long screech, the pitch falling as the train slows ----
b0 = T["brakeAt"]
n = int((stop_t - b0 + 0.8) * SR)
tk = np.arange(n) / SR
span = stop_t - b0
frac = np.clip(tk / max(span, 1e-6), 0, 1)
f = 2200 - 1300 * frac
ph = 2 * np.pi * np.cumsum(f * (1 + 0.01 * np.sin(2 * np.pi * 13 * tk))) / SR
screech = (np.sin(ph) + 0.5 * np.sin(2 * ph) * np.sin(2 * np.pi * 5 * tk)) * 0.1 * np.minimum(1, tk / 0.1) * np.clip(1 - (tk - span) / 0.8, 0, 1)
grind = highpass(lowpass(rng.standard_normal(n), 4500), 1500) * 0.14 * (1 - 0.6 * frac) * np.minimum(1, tk / 0.1) * np.clip(1 - (tk - span) / 0.8, 0, 1)
put(sfx, screech + grind, b0, 0.5)
stinger(b0, 1.0)
riser(b0 + 0.05, 0.8, 0.8)

# ---- the stop: a long hiss, a chime, a held breath, then the doors ----
n = int(1.6 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 2500) * np.exp(-tk / 0.7) * 0.25, stop_t, 0.5)
for k, fr in enumerate((784.0, 659.3, 523.3)):
    n = int(1.2 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * fr * tk) * np.exp(-tk / 0.5) * 0.12, stop_t + 0.3 + 0.35 * k, 0.5)
n = int(0.9 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 1400) * np.sin(np.pi * np.clip(tk / 0.9, 0, 1)) * 0.25, T["sideDoorAt"], 0.5)  # the side door
# morning on the platform: soft birdsong
for k in range(14):
    t0 = T["outAt"] + 0.3 * k + 0.2 * (k % 3)
    n = int(0.12 * SR)
    tk = np.arange(n) / SR
    fb = 2600 + 900 * ((k * 37) % 7) / 7
    put(sfx, np.sin(2 * np.pi * np.cumsum(fb * (1 + 0.4 * tk / 0.12)) / SR) * np.exp(-tk / 0.05) * 0.07, t0, 0.2 + 0.6 * ((k * 13) % 5) / 5)

# ---- the end: shadows, dull thumps in the train, a drone and a riser to the question ----
for k in range(4):
    put(sfx, groan(length=1.3, f0=[105.0, 125.0, 95.0, 140.0][k], vel=0.3 + 0.08 * k), T["shadowsAt"] + 0.4 + 0.8 * k, 0.15)
t = T["shadowsAt"]
while t < T["questionAt"] + 1.5:
    thud(t, 0.3, 80, 0.8)
    t += 0.7
riser(T["questionAt"], 1.2, 0.8)
stinger(T["questionAt"], 0.7)

# ---- the train: rumble and clacks that fall away with the speed ----

# ---- low sting as the outro card appears, swishes at line changes ----
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.9) * 0.5, outro, 0.5)
for i in range(1, len(shots)):
    n = int(0.28 * SR)
    ts = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 3800) * np.sin(np.pi * np.clip(ts / 0.28, 0, 1)) ** 2 * 0.12, T[f"lineStart{i}"] - 0.2, 0.3 + 0.4 * (i % 2))

drone = np.zeros(N)
for f_, a_ in [(55.0, 0.5), (82.4, 0.28), (116.5, 0.16)]:
    drone += a_ * np.sin(2 * np.pi * f_ * tt + 0.8 * np.sin(2 * np.pi * 0.09 * tt))
drone = lowpass(drone, 300) * 0.15 * (0.4 + 0.6 * ramp(0, T["hordeAt"])) * (1 - 0.7 * ramp(T["stopAt"], T["outAt"])) + lowpass(drone, 300) * 0.12 * ramp(T["shadowsAt"] - 1, T["shadowsAt"] + 2)
music += stereo(drone, 0.5)
music_wet = reverb(music)

# ---- mix, duck under the narration, fade ----
duck = np.ones(N)
for i, s in enumerate(shots):
    a = int(sec(starts[i] + s["leadFrames"]) * SR)
    b = int(sec(starts[i] + s["leadFrames"] + s["audioFrames"]) * SR)
    duck[a:b] = 0.55
k = int(0.25 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode="same")

bed = (music + 0.5 * music_wet + sfx) * duck
bed *= np.minimum(1, tt / 0.3) * np.minimum(1, np.maximum(0, (dur - tt) / 1.5))
bed = bed[:, : int(dur * SR)]
bed = bed / np.max(np.abs(bed)) * 0.55
rms = np.sqrt(np.mean(bed ** 2))
print(f"bed: {dur:.1f}s, peak {20 * np.log10(np.max(np.abs(bed))):.1f} dBFS, rms {20 * np.log10(rms):.1f} dBFS")
wavfile.write("public/bts5/bed.wav", SR, (bed.T * 32767).astype(np.int16))
