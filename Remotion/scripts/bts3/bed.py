"""Sound bed for BTS Part 3 -> public/bts3/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/bts/manifest.json; every event time comes from its cues.
  python scripts/bts3/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/bts3/manifest.json", encoding="utf-8"))
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
moving = ramp(dstart + 0.6, dstart + 3.0)
rumble = lowpass(rng.standard_normal(N), 150) * 0.34 * moving
sfx += np.stack([rumble, np.roll(rumble, 400)])
hum = lowpass(rng.standard_normal(N), 700) * 0.04 * moving
sfx += np.stack([hum, np.roll(hum, 900)])
t = 0.4
while t < dur:
    speed = 4.0 + 1.2 * float(np.clip((t - T["board0"]) / 3.0, 0, 1))  # clacks per second
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


# ---- the hook: a platform with waving people flashes past, then three station boards ----
whoosh(0.7, 1.0, 0.4, 0.4)
whoosh(2.2, 0.9, 0.35, 0.6)
whoosh(4.6, 0.9, 0.35, 0.5)
for key, pan in (("board0", 0.35), ("board1", 0.5), ("board2", 0.65)):
    whoosh(T[key] - 0.15, 0.8, 0.5, pan)
    n = int(0.25 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * 70 * tk) * np.exp(-tk / 0.1) * 0.5, T[key] + 0.05, 0.5)  # a pass-by thump

# ---- tension drone ----
drone = np.zeros(N)
for f, a in [(55.0, 0.5), (82.4, 0.28), (116.5, 0.16)]:
    drone += a * np.sin(2 * np.pi * f * tt + 0.8 * np.sin(2 * np.pi * 0.09 * tt))
drone = lowpass(drone, 300) * 0.15 * (0.4 + 0.6 * ramp(T["board0"], T["biteAt"]))
music += stereo(drone, 0.5)


# ---- voiced noise: zombie groans and the survivors' shouting ----
def groan(length=1.4, f0=130.0, vel=1.0):
    n = int(length * SR)
    tg = np.arange(n) / SR
    f = f0 * (1 - 0.35 * tg / length)
    ph = 2 * np.pi * np.cumsum(f) / SR
    core = sum(np.sin(ph * k + 0.3 * k) / k for k in (1, 2, 3, 4)) * (1 + 0.3 * np.sin(2 * np.pi * 7 * tg))
    breath = highpass(lowpass(rng.standard_normal(n), 1800), 250) * 0.6
    env = np.minimum(1, tg / 0.12) * np.minimum(1, (length - tg) / 0.5)
    return lowpass((core * 0.5 + breath * 0.5) * env, 1300) * 0.5 * vel


put(sfx, groan(vel=0.7), T["enterAt"] - 0.3, 0.2)
put(sfx, groan(length=1.2, f0=150.0, vel=0.6), T["enterAt"] + 0.9, 0.25)
put(sfx, groan(length=1.2, f0=115.0, vel=0.5), T["enterAt"] + 2.0, 0.3)
# the argument: overlapping shouts that get louder, then the shove and a thud
for k in range(14):
    t0 = T["nunPoints"] + 0.15 * k * 3
    f0 = [330.0, 270.0, 390.0, 300.0][k % 4]
    put(sfx, groan(length=0.5, f0=f0, vel=0.25 + 0.4 * min(1.0, k / 10)), t0 + 0.1 * (k % 3), 0.55 + 0.35 * ((k % 2) * 2 - 1))
n = int(0.3 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 90 * tk) * np.exp(-tk / 0.07) * 0.8 + highpass(rng.standard_normal(n), 900) * np.exp(-tk / 0.03) * 0.35, T["shoveAt"], 0.55)  # the shove
n = int(0.5 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 0.16) * 0.9 + highpass(lowpass(rng.standard_normal(n), 900), 120) * np.exp(-tk / 0.05) * 0.5, T["fallAt"] + 0.9, 0.4)  # the boy hits the floor

# ---- the bite: a hard cut of sound (silhouette shot) ----
n = int(0.35 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 800) * np.exp(-tk / 0.05) * 0.7 + np.sin(2 * np.pi * 60 * tk) * np.exp(-tk / 0.2) * 0.8, T["biteAt"] - 0.02, 0.45)
put(sfx, groan(vel=1.0), T["biteAt"] - 0.1, 0.35)

# ---- the countdown: a heartbeat that quickens to the end of the part ----
t = T["countdownStart"]
end = dur - 1.0
while t < end:
    prog = (t - T["countdownStart"]) / (end - T["countdownStart"])
    period = 0.95 - 0.35 * prog
    for off, a in ((0.0, 1.0), (0.2 * period, 0.7)):
        n = int(0.22 * SR)
        tk = np.arange(n) / SR
        beat = np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 0.07) * a * 0.9
        put(sfx, beat * (0.5 + 0.5 * prog), t + off, 0.5)
    t += period

# ---- the survivors card: a ping and a falling tone as the number drops ----
n = int(0.6 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 880 * tk) * np.exp(-tk / 0.25) * 0.14, T["countAt"], 0.5)
put(sfx, np.sin(2 * np.pi * np.cumsum(520 - 260 * tk / 0.6) / SR) * np.exp(-tk / 0.3) * 0.16, T["countAt"] + 0.45, 0.5)

# ---- the view down the train: a rising hum and a dull rush, the lights failing ----
n = int((T["cabGlassEnd"] - T["cabGlassAt"]) * SR)
tk = np.arange(n) / SR
span = max(tk[-1], 1e-6)
hum2 = np.sin(2 * np.pi * np.cumsum(70 + 90 * tk / span) / SR) * (tk / span) ** 1.5 * 0.22
rush2 = lowpass(rng.standard_normal(n), 900) * (tk / span) * 0.18
put(sfx, hum2 + rush2, T["cabGlassAt"], 0.5)

# ---- a low sting as the outro card appears ----
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.9) * 0.5, outro, 0.5)


# ---- energy layer: a bass pulse that quickens, risers with a boom, screech stingers, swishes ----
t = T["enterAt"] - 1.5
while t < dur - 1.5:
    prog = min(1.0, max(0.0, (t - T["enterAt"]) / max(1.0, T["biteAt"] - T["enterAt"])))
    period = 0.66 - 0.2 * prog
    n = int(0.3 * SR)
    tk = np.arange(n) / SR
    hit = np.sin(2 * np.pi * (48 + 10 * np.exp(-tk / 0.05)) * tk) * np.exp(-tk / 0.11) * 0.5
    put(music, hit * (0.45 + 0.55 * min(1.0, max(0.0, (t - T["enterAt"] + 1.5) / 2.0))), t, 0.5)
    t += period


def riser(t_end, length=1.4, vel=1.0):
    """noise and a sine sweeping up, ending in a low boom at t_end"""
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
    """a rising string-like screech with vibrato"""
    n = int(0.7 * SR)
    ts = np.arange(n) / SR
    f = 700 + 1500 * ts / 0.7
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.012 * np.sin(2 * np.pi * 9 * ts))) / SR
    sig = (np.sin(ph) + 0.4 * np.sin(2 * ph)) * np.exp(-ts / 0.45) * np.minimum(1, ts / 0.02) * 0.18 * vel
    put(music, sig, t0, 0.5)


riser(T["enterAt"] + 0.05, 1.3, 0.7)        # the zombies come out of the walkway
riser(T["shoveAt"], 1.2, 0.8)
riser(T["biteAt"] + 0.03, 1.4, 1.0)
stinger(T["biteAt"], 1.0)
riser(T["cabGlassAt"] + 0.05, 1.0, 0.8)
stinger(T["cabGlassAt"] + 0.4, 0.8)
riser(T["questionAt"], 1.0, 0.9)
stinger(T["questionAt"], 0.8)
for i in range(1, len(shots)):
    n = int(0.28 * SR)
    ts = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 3800) * np.sin(np.pi * np.clip(ts / 0.28, 0, 1)) ** 2 * 0.12, T[f"lineStart{i}"] - 0.2, 0.3 + 0.4 * (i % 2))

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
wavfile.write("public/bts3/bed.wav", SR, (bed.T * 32767).astype(np.int16))
