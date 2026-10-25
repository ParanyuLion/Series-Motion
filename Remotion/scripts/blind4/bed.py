"""Sound bed for Blind Village Part 4 -> public/blind4/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/blind4/manifest.json; every event time comes from its cues.
  python scripts/blind4/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/blind4/manifest.json", encoding="utf-8"))
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


def groan(length=1.4, f0=130.0, vel=1.0):
    n = int(length * SR)
    tg = np.arange(n) / SR
    f = f0 * (1 - 0.2 * tg / length)
    ph = 2 * np.pi * np.cumsum(f) / SR
    core = sum(np.sin(ph * k + 0.3 * k) / k for k in (1, 2, 3, 4)) * (1 + 0.2 * np.sin(2 * np.pi * 5 * tg))
    breath = highpass(lowpass(rng.standard_normal(n), 1600), 250) * 0.5
    env = np.minimum(1, tg / 0.25) * np.minimum(1, (length - tg) / 0.5)
    return lowpass((core * 0.5 + breath * 0.5) * env, 1100) * 0.45 * vel


def tap(t0, vel=1.0, pan=0.5):
    n = int(0.12 * SR)
    tk = np.arange(n) / SR
    put(sfx, (np.sin(2 * np.pi * 700 * tk) * np.exp(-tk / 0.012) * 0.5 + highpass(rng.standard_normal(n), 1500) * np.exp(-tk / 0.008) * 0.3) * vel, t0, pan)


def step(t0, vel=1.0, pan=0.5):
    n = int(0.16 * SR)
    tk = np.arange(n) / SR
    put(sfx, (lowpass(rng.standard_normal(n), 700) * np.exp(-tk / 0.04) * 0.5 + np.sin(2 * np.pi * 70 * tk) * np.exp(-tk / 0.05) * 0.3) * vel, t0, pan)


def whoosh(t0, length=0.9, vel=0.1, pan=0.5):
    n = int(length * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), 2800) * np.sin(np.pi * np.clip(tk / length, 0, 1)) ** 2 * vel, t0, pan)

# ---- the heartbeat: slow while waking, faster as the fear grows ----
def heart(t_from, t_to, per0, per1, vel):
    t = t_from
    while t < t_to:
        prog = (t - t_from) / max(1e-6, (t_to - t_from))
        period = per0 + (per1 - per0) * prog
        for off, a in ((0.0, 1.0), (0.2 * period, 0.6)):
            n = int(0.2 * SR)
            tk = np.arange(n) / SR
            put(sfx, np.sin(2 * np.pi * 50 * tk) * np.exp(-tk / 0.07) * a * vel, t + off, 0.5)
        t += period



def clink(t0, vel=1.0, pan=0.5):
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    put(sfx, (np.sin(2 * np.pi * 1850 * tk) * np.exp(-tk / 0.01) * 0.35 + np.sin(2 * np.pi * 2900 * tk) * np.exp(-tk / 0.006) * 0.15) * vel, t0, pan)


def tap(t0, vel=1.0, pan=0.5):
    n = int(0.12 * SR)
    tk = np.arange(n) / SR
    put(sfx, (np.sin(2 * np.pi * 700 * tk) * np.exp(-tk / 0.012) * 0.5 + highpass(rng.standard_normal(n), 1500) * np.exp(-tk / 0.008) * 0.3) * vel, t0, pan)


bell_t = T["bellAt"]
road_t = T["roadAt"]
home_t = T["homeAt"]
change_t = T["changeAt"]
edge2_t = T["villageEdgeAt"]
new_t = T["newAt"]
last_t = T["lastAt"]


def swish(t0, length, vel, lo=3000, pan=0.5):
    n = int(length * SR)
    tk = np.arange(n) / SR
    put(sfx, lowpass(rng.standard_normal(n), lo) * np.sin(np.pi * np.clip(tk / length, 0, 1)) ** 2 * vel, t0, pan)


# ---- ambience: dawn forest hush (wind, one far bird), then room tone, dusk, night insects at the village edge ----
wind = lowpass(rng.standard_normal(N), 340) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.06 * tt + 0.7)) * 0.1
forest_gate = 1.0 - ramp(road_t - 0.3, road_t + 0.6)
amb = wind * (0.4 + 0.6 * forest_gate)
crick_gate = (np.sin(2 * np.pi * 15 * tt) > 0.2).astype(float) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.29 * tt))
crick = highpass(lowpass(rng.standard_normal(N), 5200), 3600) * crick_gate * 0.05
night_gate = ramp(change_t - 1.0, change_t + 1.0) * (1.0 - ramp(new_t - 0.5, new_t + 0.8))
night_gate = np.maximum(night_gate, ramp(edge2_t - 0.5, edge2_t + 1.0) * (1.0 - ramp(new_t - 0.5, new_t + 0.8)))
bell_pause = 1.0 - ramp(bell_t + 0.1, bell_t + 0.2) * (1 - ramp(bell_t + 2.2, bell_t + 3.0))
amb = amb * bell_pause + crick * night_gate
sfx += np.stack([amb, np.roll(amb, 700)])
n = int(0.35 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * np.cumsum(2600 + 700 * np.sin(2 * np.pi * 8 * tk) * np.exp(-tk / 0.12)) / SR) * np.exp(-tk / 0.1) * 0.04, T["edgeAt"] - 0.3, 0.8)

drone = np.zeros(N)
for f_, a_ in [(55.0, 0.5), (82.4, 0.3), (110.0, 0.14)]:
    drone += a_ * np.sin(2 * np.pi * f_ * tt + 0.5 * np.sin(2 * np.pi * 0.08 * tt))
music += stereo(lowpass(drone, 260) * 0.12 * (0.4 + 0.6 * ramp(T["patternAt"], last_t)), 0.5)

# ---- steps at the forest edge, the stick of the head ----
t = 1.0
while t < T["edgeAt"] + 3.9:
    step(t, 0.18, 0.45)
    t += 0.6
tap(T["speakAt"] - 1.2, 0.35, 0.6)
t = T["speakAt"] + 1.4
while t < road_t + 0.1:
    step(t, 0.2, 0.5)
    t += 0.55

# ---- the road: an engine and tyres on gravel growing, then idling; a door never opens ----
n = int((home_t - road_t) * SR)
tk = np.arange(n) / SR
swell = np.clip(tk / 3.5, 0, 1) ** 1.5 * (1 - 0.5 * np.clip((tk - 5.0) / 1.5, 0, 1))
eng = lowpass(np.sin(2 * np.pi * 62 * tk + 2 * np.sin(2 * np.pi * 7 * tk)) + 0.5 * np.sin(2 * np.pi * 124 * tk), 400) * swell * 0.25
gravel = highpass(lowpass(rng.standard_normal(n), 3000), 500) * swell * 0.07 * (1 - np.clip((tk - 4.8) / 0.8, 0, 1))
put(sfx, eng + gravel, road_t, 0.5)

# ---- home: room tone and a clock; the memory: soft leaves rocking, a gentle hiss ----
t = home_t + 1.0
while t < T["memoryAt"] - 0.4:
    tap(t, 0.12, 0.35)
    t += 1.0
n = int((T["mirrorAt"] - T["memoryAt"]) * SR)
tk = np.arange(n) / SR
dur_m = n / SR
put(sfx, lowpass(rng.standard_normal(n), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * tk)) * np.sin(np.pi * np.clip(tk / dur_m, 0, 1)) ** 1.2 * 0.1, T["memoryAt"], 0.5)
put(sfx, highpass(lowpass(rng.standard_normal(n), 6500), 3500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * tk)) * np.sin(np.pi * np.clip((tk - 2.0) / max(0.5, dur_m - 2.0), 0, 1)) * 0.05, T["memoryAt"], 0.55)

# ---- the mirror: the cloth slides down; a heartbeat from the pupil on ----
swish(T["mirrorAt"] + 1.0, 0.7, 0.12, 1800, 0.35)
heart(T["pupilAt"] - 0.5, T["nameAt"] + 2.0, 0.95, 0.75, 0.4)

# ---- the name: a muffled voice behind (a soft vowel), one beat before she turns ----
n = int(1.1 * SR)
tk = np.arange(n) / SR
voice = (np.sin(2 * np.pi * 150 * tk) + 0.5 * np.sin(2 * np.pi * 300 * tk) + 0.25 * np.sin(2 * np.pi * 450 * tk)) * np.sin(np.pi * np.clip(tk / 1.1, 0, 1)) ** 2
put(sfx, lowpass(voice, 900) * 0.08, T["nameAt"] + 0.9, 0.85)

# ---- the bell: once, a long tail, in a house without a bell ----
n = int(5.0 * SR)
tk = np.arange(n) / SR
bell = np.zeros(n)
for f_, a_, d_ in [(392.0, 1.0, 2.2), (588.0, 0.55, 1.6), (1010.0, 0.35, 1.1), (1480.0, 0.2, 0.7), (196.0, 0.5, 3.0)]:
    bell += a_ * np.sin(2 * np.pi * f_ * tk) * np.exp(-tk / d_)
bell *= np.minimum(1, tk / 0.004) * 0.3
put(sfx, bell, bell_t, 0.55)
put(sfx, np.sin(2 * np.pi * 60 * tk) * np.exp(-tk / 0.25) * 0.5, bell_t, 0.5)

# ---- the change: a wet, soft slide, a window creak, then a long quiet ----
n = int(2.2 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 520) * (0.5 + 0.5 * np.sin(2 * np.pi * 1.4 * tk)) * np.sin(np.pi * np.clip(tk / 2.2, 0, 1)) ** 1.5 * 0.14, change_t + 1.4, 0.5)
n = int(0.9 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 180 * tk * (1 + 0.25 * tk)) * np.sin(np.pi * np.clip(tk / 0.9, 0, 1)) ** 2 * 0.06, change_t + 0.4, 0.7)

# ---- the village edge: a low hush and two soft hisses (no snake sounds beyond that) ----
n = int(3.0 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(lowpass(rng.standard_normal(n), 2400), 800) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.3 * tk) ** 2) * np.sin(np.pi * np.clip(tk / 3.0, 0, 1)) * 0.07, T["confessAt"] + 0.4, 0.5)
put(music, np.sin(2 * np.pi * 73.4 * tk) * np.sin(np.pi * np.clip(tk / 3.0, 0, 1)) ** 1.4 * 0.2 + np.sin(2 * np.pi * 77.8 * tk) * np.sin(np.pi * np.clip(tk / 3.0, 0, 1)) ** 1.4 * 0.12, edge2_t, 0.5)

# ---- the new sleeper: a mat rustle and a first breath; the head's stick on the ground ----
swish(new_t + 0.4, 0.9, 0.09, 2400, 0.45)
t = new_t + 3.2
while t < T["welcomeAt"] + 3.2:
    tap(t, 0.5, 0.45)
    step(t + 0.05, 0.15, 0.45)
    t += 0.62

# ---- the last picture: a held low note, soft laughter of many ----
n = int(4.0 * SR)
tk = np.arange(n) / SR
put(music, np.sin(2 * np.pi * 73.4 * tk) * np.sin(np.pi * np.clip(tk / 4.0, 0, 1)) ** 1.4 * 0.24 + np.sin(2 * np.pi * 77.8 * tk) * np.sin(np.pi * np.clip(tk / 4.0, 0, 1)) ** 1.4 * 0.14, last_t, 0.5)
for k, f0 in enumerate([140.0, 165.0, 185.0, 210.0, 120.0, 150.0]):
    t0 = last_t + 0.9 + 0.3 * k
    n = int(1.1 * SR)
    tk = np.arange(n) / SR
    for j in range(3):
        tj = j * 0.33
        mk = (tk > tj) & (tk < tj + 0.28)
        env = np.where(mk, np.sin(np.pi * np.clip((tk - tj) / 0.28, 0, 1)) ** 2, 0)
        voice = (np.sin(2 * np.pi * f0 * tk) + 0.5 * np.sin(2 * np.pi * 2 * f0 * tk)) * env
        put(sfx, lowpass(voice, 1400) * 0.05, t0, 0.08 + 0.17 * k)

# ---- a low sting as the finale card appears, faint swishes at the line changes ----
outro = sec(m["outroStart"])
n = int(2.0 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 55 * tk) * np.exp(-tk / 0.9) * 0.4, outro, 0.5)
for i in range(1, len(shots)):
    whoosh(T[f"lineStart{i}"] - 0.2, 0.28, 0.06, 0.3 + 0.4 * (i % 2))

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
wavfile.write("public/blind4/bed.wav", SR, (bed.T * 32767).astype(np.int16))
