"""Sound bed for BTS Part 1 -> public/bts1/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/bts/manifest.json; every event time comes from its cues.
  python scripts/bts/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/bts/manifest.json", encoding="utf-8"))
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
dstart = T["doorsClose"]
outro = sec(m["outroStart"])
sfx = np.zeros((2, N))
music = np.zeros((2, N))

# ---- the train: low rumble that starts when the doors close, and rail clacks that speed up ----
moving = ramp(dstart + 0.6, dstart + 3.0)
rumble = lowpass(rng.standard_normal(N), 140) * 0.30 * moving
sfx += np.stack([rumble, np.roll(rumble, 400)])
hum = lowpass(rng.standard_normal(N), 700) * 0.035 * moving
sfx += np.stack([hum, np.roll(hum, 900)])
t = dstart + 2.0
while t < dur:
    speed = 1.6 + 2.4 * min(1.0, (t - dstart) / 6.0)  # clacks per second
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    clack = highpass(lowpass(rng.standard_normal(n), 2600), 500) * np.exp(-tk / 0.02) * 0.55
    put(sfx, clack * 0.22, t, 0.5 + 0.2 * np.sin(t))
    put(sfx, clack * 0.12, t + 0.07, 0.5)
    t += 1.0 / speed

# ---- station: the platform ambience before the doors close, and the door hit ----
crowd = lowpass(rng.standard_normal(N), 1600) * 0.05 * (1 - ramp(dstart - 0.3, dstart + 0.4))
sfx += np.stack([crowd, np.roll(crowd, 1500)])
n = int(0.5 * SR)
tk = np.arange(n) / SR
door = (np.sin(2 * np.pi * 70 * tk) * np.exp(-tk / 0.12) * 0.9 + highpass(rng.standard_normal(n), 1500) * np.exp(-tk / 0.05) * 0.4)
put(sfx, door, dstart + 0.45, 0.5)  # the doors finish closing about 15 frames after the cue
n = int(1.2 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 900) * np.sin(np.pi * np.clip(tk / 1.2, 0, 1)) ** 2 * 0.2, dstart - 0.2, 0.4)  # the doors' pneumatic hiss

# ---- tension drone ----
drone = np.zeros(N)
for f, a in [(55.0, 0.5), (82.4, 0.28), (116.5, 0.16)]:
    drone += a * np.sin(2 * np.pi * f * tt + 0.8 * np.sin(2 * np.pi * 0.09 * tt))
drone = lowpass(drone, 300) * 0.14 * (0.35 + 0.65 * ramp(T["manTurns"] - 1.0, T["biteAt"]))
music += stereo(drone, 0.5)

# ---- zombie groans: a voiced noise with a falling pitch ----
def groan(length=1.4, f0=130.0, vel=1.0):
    n = int(length * SR)
    tg = np.arange(n) / SR
    f = f0 * (1 - 0.35 * tg / length)
    ph = 2 * np.pi * np.cumsum(f) / SR
    core = sum(np.sin(ph * k + 0.3 * k) / k for k in (1, 2, 3, 4)) * (1 + 0.3 * np.sin(2 * np.pi * 7 * tg))
    breath = highpass(lowpass(rng.standard_normal(n), 1800), 250) * 0.6
    env = np.minimum(1, tg / 0.12) * np.minimum(1, (length - tg) / 0.5)
    return lowpass((core * 0.5 + breath * 0.5) * env, 1300) * 0.5 * vel


for key, vel, pan in (("manTurns", 0.6, 0.3), ("biteAt", 1.0, 0.4), ("womanRises", 1.0, 0.45)):
    put(sfx, groan(vel=vel), T[key] - 0.1, pan)
put(sfx, groan(length=1.1, f0=150.0, vel=0.5), T["womanRises"] + 1.4, 0.35)

# ---- the bite: a hard cut of sound (silhouette shot), then a breath ----
n = int(0.35 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(rng.standard_normal(n), 800) * np.exp(-tk / 0.05) * 0.7 + np.sin(2 * np.pi * 60 * tk) * np.exp(-tk / 0.2) * 0.8, T["biteAt"] - 0.02, 0.5)

# ---- the countdown: a heartbeat that quickens ----
t = T["countdownStart"]
end = T["womanRises"]
while t < end:
    prog = (t - T["countdownStart"]) / (end - T["countdownStart"])
    period = 1.0 - 0.55 * prog
    for off, a in ((0.0, 1.0), (0.2 * period, 0.7)):
        n = int(0.22 * SR)
        tk = np.arange(n) / SR
        beat = np.sin(2 * np.pi * 52 * tk) * np.exp(-tk / 0.07) * a * 0.9
        put(sfx, beat * (0.5 + 0.5 * prog), t + off, 0.5)
    t += period
# a tick on every second of the countdown, getting sharper
for k in range(int((end - T["countdownStart"]) * 2)):
    tk0 = T["countdownStart"] + k * 0.5
    n = int(0.04 * SR)
    tk = np.arange(n) / SR
    put(sfx, np.sin(2 * np.pi * 1800 * tk) * np.exp(-tk / 0.012) * 0.07, tk0, 0.6)
# a low hit when she stands
n = int(1.2 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 45 * tk) * np.exp(-tk / 0.35) * 0.9, T["womanRises"], 0.5)

# ---- panic: scuffles and a rising rush while the others flee ----
rush = lowpass(rng.standard_normal(N), 2500) * 0.06 * ramp(T['lineStart5'], T['lineStart5'] + 1.0) * (1 - ramp(T['lineStart6'] + 1.5, T['lineStart6'] + 4.0))
sfx += np.stack([rush, np.roll(rush, 600)])
for k in range(14):
    tk0 = T['lineStart5'] + 0.3 + k * 0.28
    n = int(0.11 * SR)
    tk = np.arange(n) / SR
    put(sfx, highpass(lowpass(rng.standard_normal(n), 1800), 200) * np.exp(-tk / 0.04) * 0.35, tk0, 0.25 + 0.5 * rng.random())

# ---- a station board flashes past: a quick doppler whoosh ----
n = int(0.9 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 3000) * np.sin(np.pi * np.clip(tk / 0.9, 0, 1)) ** 2 * 0.45, T["stationPass"] - 0.1, 0.6)

# ---- the announcement: a two-note chime and a speaker crackle ----
def tone(f, length=0.6, vel=1.0):
    n = int(length * SR)
    tk = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tk) + 0.35 * np.sin(2 * np.pi * 2 * f * tk)) * np.exp(-tk / 0.25) * 0.22 * vel


put(sfx, tone(784), T["announceStart"] - 0.1, 0.5)
put(sfx, tone(587), T["announceStart"] + 0.35, 0.5)
n = int(max(0.5, sec(m["cues"]["lineEnd8"] - m["cues"]["lineStart8"])) * SR)
crack = highpass(rng.standard_normal(n), 3000) * (rng.random(n) > 0.995) * 0.9
put(sfx, crack * 0.3, T["announceStart"] + 0.6, 0.5)
fl = lowpass(rng.standard_normal(n), 400) * 0.1
put(sfx, fl, T["announceStart"], 0.5)

# ---- the cab door: a heavy clunk and a slow slide ----
n = int(0.6 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 80 * tk) * np.exp(-tk / 0.15) * 0.8 + highpass(rng.standard_normal(n), 1200) * np.exp(-tk / 0.04) * 0.35, T["cabOpens"], 0.5)
n = int(1.1 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 700) * np.sin(np.pi * np.clip(tk / 1.1, 0, 1)) * 0.2, T["cabOpens"] + 0.1, 0.5)
# a low sting as the outro card appears
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.9) * 0.5, outro, 0.5)


# ---- energy layer (viewer feedback: silence loses attention; make it exciting) ----
# a driving bass pulse that speeds up from the first shake to the end, so there is never a flat moment between lines
t = T["manTurns"] - 1.0
while t < dur - 1.5:
    prog = min(1.0, (t - T["manTurns"]) / max(1.0, T["announceStart"] - T["manTurns"]))
    period = 0.62 - 0.22 * max(0.0, prog)
    n = int(0.3 * SR)
    tk = np.arange(n) / SR
    hit = np.sin(2 * np.pi * (48 + 10 * np.exp(-tk / 0.05)) * tk) * np.exp(-tk / 0.11) * 0.5
    put(music, hit * (0.5 + 0.5 * min(1.0, max(0.0, (t - T["manTurns"] + 1.0) / 2.0))), t, 0.5)
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

riser(T["biteAt"] + 0.03, 1.2, 0.9)
stinger(T["biteAt"], 1.0)
riser(T["womanRises"], 1.6, 1.0)
stinger(T["womanRises"], 1.0)
riser(T["announceStart"] + 0.0, 1.0, 0.6)
riser(T["cabOpens"], 1.2, 0.8)
# a short swish on every line change keeps the edit alive
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
wavfile.write("public/bts1/bed.wav", SR, (bed.T * 32767).astype(np.int16))
