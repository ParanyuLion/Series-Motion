"""Sound bed for BTS Part 4 -> public/bts4/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/bts/manifest.json; every event time comes from its cues.
  python scripts/bts4/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/bts4/manifest.json", encoding="utf-8"))
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
    speed = 4.0 + 1.4 * float(np.clip((t - T["car2At"]) / 3.0, 0, 1))  # clacks per second
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


def thwack(t0, vel=1.0, pan=0.5):
    n = int(0.2 * SR)
    tk = np.arange(n) / SR
    put(sfx, (highpass(rng.standard_normal(n), 1200) * np.exp(-tk / 0.025) * 0.7 + np.sin(2 * np.pi * 150 * tk) * np.exp(-tk / 0.06) * 0.6) * vel, t0, pan)


def tick(t0, vel=1.0):
    n = int(0.05 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * 1800 * tk) * np.exp(-tk / 0.008) * 0.3 * vel, t0, 0.5)


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


# ---- the hook: the clock ticks down while a heartbeat quickens; at 0:00 a flat tone ----
clock0 = T["clockZero"]
t = 0.7
while t < clock0:
    tick(t, 0.6 + 0.4 * (t / clock0))
    t += 1.0
t = 0.5
while t < clock0:
    prog = t / clock0
    period = 0.9 - 0.4 * prog
    for off, a in ((0.0, 1.0), (0.2 * period, 0.7)):
        n = int(0.22 * SR)
        tk = np.arange(n) / SR
        put(sfx, np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 0.07) * a * 0.9 * (0.5 + 0.5 * prog), t + off, 0.5)
    t += period
n = int(1.6 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 600 * tk) * np.exp(-tk / 0.9) * 0.12 + np.sin(2 * np.pi * 70 * tk) * np.exp(-tk / 0.5) * 0.4, clock0, 0.5)
riser(T["riseAt"], 1.1, 0.8)
put(sfx, groan(vel=0.9), T["riseAt"] + 0.1, 0.5)
stinger(T["riseAt"], 0.9)
put(sfx, groan(length=1.1, f0=150.0, vel=0.5), T["runAt"] - 0.3, 0.2)
put(sfx, groan(length=1.2, f0=115.0, vel=0.5), T["runAt"] + 0.5, 0.3)


# ---- scene changes: a swish each ----
def whoosh(t0, length=0.9, vel=0.45, pan=0.5):
    n = int(length * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 3200) * np.sin(np.pi * np.clip(tk / length, 0, 1)) ** 2 * vel, t0, pan)


for key in ("itemsAt", "car2At", "doorAt"):
    whoosh(T[key] - 0.25, 0.7, 0.5)
whoosh(T["skinAt"] + 1.0, 0.7, 0.5)

# ---- the map and the items card ----
n = int(0.5 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 700 * tk) * np.exp(-tk / 0.2) * 0.14, T["mapIn"], 0.5)
for dt in (45, 60, 75, 90):
    tick(T["mapIn"] + dt / 30, 0.8)
for dt in (20, 50, 85):
    n = int(0.4 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * (900 + 200 * dt / 85) * tk) * np.exp(-tk / 0.14) * 0.16, T["itemsAt"] + dt / 30, 0.5)
thud(T["itemsAt"] + 58 / 30, 0.5, 90)  # the extinguisher comes off its bracket

# ---- car 2: a rising pulse, groans, the fight ----
for k in range(6):
    put(sfx, groan(length=1.2, f0=[120.0, 150.0, 135.0, 105.0, 160.0, 125.0][k], vel=0.35 + 0.05 * k), T["car2At"] + 0.5 + 0.55 * k, 0.15 + 0.14 * k)
riser(T["fightAt"], 1.5, 0.9)
stinger(T["fightAt"], 0.8)
for f in (12, 28, 44):  # umbrella jabs
    thwack(T["fightAt"] + (f - 4) / 30, 0.9, 0.4)
    thud(T["fightAt"] + (f + 8) / 30, 0.6, 55, 0.35)
    put(sfx, groan(length=0.5, f0=170.0, vel=0.35), T["fightAt"] + (f + 2) / 30, 0.3)
n = int((T["sprayEnd"] - T["sprayAt"]) * SR)
tk = np.arange(n) / SR
span = max(tk[-1], 1e-6)
hiss = highpass(rng.standard_normal(n), 2500) * 0.3 * np.minimum(1, tk / 0.1) * np.minimum(1, (span - tk) / 0.6) * (0.8 + 0.2 * np.sin(2 * np.pi * 11 * tk))
put(sfx, hiss, T["sprayAt"], 0.6)
for f in (8, 22, 36):  # zombies reel in the cloud and fall
    put(sfx, groan(length=0.8, f0=140.0, vel=0.4), T["sprayAt"] + f / 30, 0.3)
    thud(T["sprayAt"] + (f + 30) / 30, 0.6, 52, 0.3)
for f in (8, 22, 36):  # the bag hits
    thwack(T["swingAt"] + (f - 5) / 30, 0.9, 0.65)
    thud(T["swingAt"] + (f + 8) / 30, 0.7, 58, 0.5)
riser(T["swingAt"], 1.0, 0.6)

# ---- the door: pounding, a slam, then the silhouette hit ----
t = T["holdAt"]
while t < T["endAt"]:
    thud(t, 0.55 + 0.3 * (t - T["holdAt"]) / (T["endAt"] - T["holdAt"]), 75, 0.7)
    t += 0.22
for k in range(5):
    put(sfx, groan(length=1.0, f0=[110.0, 140.0, 125.0, 150.0, 100.0][k], vel=0.4), T["doorAt"] + 0.4 + 0.45 * k, 0.8)
n = int(0.5 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 1500) * np.exp(-tk / 0.05) * 0.5 + np.sin(2 * np.pi * 70 * tk) * np.exp(-tk / 0.2) * 0.9, T["endAt"] - 0.05, 0.5)
stinger(T["endAt"], 1.0)
riser(T["endAt"], 1.2, 0.8)

# ---- the near-bite: a snap of the strap, then a heartbeat and a relief tone ----
n = int(0.3 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 1800) * np.exp(-tk / 0.03) * 0.8 + np.sin(2 * np.pi * 220 * tk) * np.exp(-tk / 0.05) * 0.5, T["biteAt"], 0.5)
put(sfx, groan(length=0.9, f0=170.0, vel=0.8), T["biteAt"] - 0.1, 0.4)
riser(T["biteAt"] + 0.03, 1.2, 0.9)
stinger(T["biteAt"], 1.0)
t = T["biteAt"] + 0.2
while t < T["skinAt"] + 0.2:
    for off, a in ((0.0, 1.0), (0.14, 0.7)):
        n = int(0.22 * SR)
        tk = np.arange(n) / SR
        put(sfx, np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 0.07) * a * 0.9, t + off, 0.5)
    t += 0.5
n = int(1.4 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 600) * np.exp(-tk / 0.5) * 0.18 + np.sin(2 * np.pi * 196 * tk) * np.exp(-tk / 0.6) * 0.1, T["skinAt"], 0.5)  # an exhale

# ---- the cab door: a low hum, muffled pounding far behind, a riser to the question ----
n = int((m["outroStart"] / FPS - T["cabAt"]) * SR)
tk = np.arange(n) / SR
span = max(tk[-1], 1e-6)
put(sfx, np.sin(2 * np.pi * np.cumsum(80 + 50 * tk / span) / SR) * (tk / span) ** 1.3 * 0.2 + lowpass(rng.standard_normal(n), 700) * (tk / span) * 0.1, T["cabAt"], 0.5)
t = T["cabAt"] + 0.3
while t < T["questionAt"] + 1.5:
    thud(t, 0.3, 80, 0.85)
    t += 0.55
riser(T["questionAt"], 1.0, 0.9)
stinger(T["questionAt"], 0.8)

# ---- tension drone and an accelerating bass pulse through the fight ----
drone = np.zeros(N)
for f, a in [(55.0, 0.5), (82.4, 0.28), (116.5, 0.16)]:
    drone += a * np.sin(2 * np.pi * f * tt + 0.8 * np.sin(2 * np.pi * 0.09 * tt))
drone = lowpass(drone, 300) * 0.15 * (0.5 + 0.5 * ramp(T["mapIn"], T["fightAt"]))
music += stereo(drone, 0.5)
t = T["car2At"] - 1.0
while t < T["doorAt"]:
    prog = min(1.0, max(0.0, (t - T["car2At"]) / max(1.0, T["doorAt"] - T["car2At"])))
    period = 0.6 - 0.22 * prog
    n = int(0.3 * SR)
    tk = np.arange(n) / SR
    hit = np.sin(2 * np.pi * (48 + 10 * np.exp(-tk / 0.05)) * tk) * np.exp(-tk / 0.11) * 0.5
    put(music, hit * (0.45 + 0.55 * prog), t, 0.5)
    t += period

# ---- a low sting as the outro card appears ----
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.9) * 0.5, outro, 0.5)

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
wavfile.write("public/bts4/bed.wav", SR, (bed.T * 32767).astype(np.int16))
