"""Sound bed for Blind Village Part 2 -> public/blind2/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/blind2/manifest.json; every event time comes from its cues.
  python scripts/blind2/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/blind2/manifest.json", encoding="utf-8"))
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
    """a spoon on a bowl: a small dry click"""
    n = int(0.09 * SR)
    tk = np.arange(n) / SR
    put(sfx, (np.sin(2 * np.pi * 1850 * tk) * np.exp(-tk / 0.01) * 0.35 + np.sin(2 * np.pi * 2900 * tk) * np.exp(-tk / 0.006) * 0.15) * vel, t0, pan)


# ---- the evening forest all the way through; it stops dead at the stare and again at the bell ----
stare_t = T["stareAt"]
bell_t = T["bellAt"]
pause = 1.0 - ramp(stare_t - 0.1, stare_t) * (1 - ramp(stare_t + 0.7, stare_t + 1.1))
pause *= 1.0 - ramp(bell_t + 0.55, bell_t + 0.7) * (1 - ramp(bell_t + 1.7, bell_t + 2.3))
crick_gate = (np.sin(2 * np.pi * 15 * tt) > 0.2).astype(float) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.29 * tt))
crick = highpass(lowpass(rng.standard_normal(N), 5200), 3600) * crick_gate * 0.05 * ramp(0.0, 2.0)
wind = lowpass(rng.standard_normal(N), 360) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.06 * tt + 0.7)) * 0.12
amb = (crick + wind) * pause
sfx += np.stack([amb, np.roll(amb, 700)])
for k in range(10):
    t0 = 4.0 + k * 8.3 + (k % 3)
    if abs(t0 - stare_t) < 1.5 or abs(t0 - bell_t) < 2.5:
        continue
    n = int(0.35 * SR)
    tk = np.arange(n) / SR
    f = 2100 + 900 * np.sin(2 * np.pi * 9 * tk) * np.exp(-tk / 0.15) + 600 * ((k * 37) % 5) / 5
    put(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tk / 0.12) * 0.05, t0, 0.15 + 0.7 * ((k * 13) % 7) / 7)

# ---- the supper: every spoon on every bowl at the same instant, a perfectly even rhythm (the abnormal detail) ----
t = T["lineStart0"] + 0.4
while t < T["wonderAt"] + 0.6:
    clink(t, 0.5, 0.35)
    clink(t + 0.003, 0.4, 0.65)
    t += 0.8

# ---- a low drone under the hook, then under the whole supper ----
drone = np.zeros(N)
for f_, a_ in [(55.0, 0.5), (82.4, 0.3), (110.0, 0.14)]:
    drone += a_ * np.sin(2 * np.pi * f_ * tt + 0.5 * np.sin(2 * np.pi * 0.08 * tt))
drone = lowpass(drone, 260) * 0.13 * (0.35 + 0.65 * ramp(T["wonderAt"], bell_t)) * pause
music += stereo(drone, 0.5)

# ---- the woman takes your hand: a soft cloth rustle and one small exact tap on the bowl ----
n = int(0.7 * SR)
tk = np.arange(n) / SR
put(sfx, highpass(lowpass(rng.standard_normal(n), 3200), 700) * np.sin(np.pi * np.clip(tk / 0.7, 0, 1)) ** 2 * 0.07, T["handAt"] + 0.5, 0.6)
clink(T["handAt"] + 2.3, 0.9, 0.5)

# ---- the shadow play: the cloth creaks, even steps, a dull rhythm; a breath and a pause at the run ----
t = T["tellAt"]
while t < T["runAt"] + 1.0:
    step(t, 0.12, 0.5)
    t += 0.5
n = int(2.5 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.8 * tk)) * 0.04, T["tellAt"], 0.5)
n = int(0.9 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 1700) * np.sin(np.pi * np.clip(tk / 0.9, 0, 1)) ** 2 * 0.11, T["runAt"] + 1.0, 0.5)
t = T["runAt"] + 2.6  # his running: quick hard steps going away
for k in range(9):
    step(t + k * 0.22, 0.5 * (1 - 0.07 * k), 0.5 - 0.04 * k)
heart(T["runAt"] + 1.0, T["sighAt"], 0.7, 0.9, 0.4)

# ---- the head sighs: a soft breath out ----
n = int(1.1 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 1400) * np.sin(np.pi * np.clip(tk / 1.1, 0, 1)) ** 2 * 0.09, T["sighAt"] + 0.2, 0.5)

# ---- the villagers nod and murmur kindly: a low unison tone ----
for k, f0 in enumerate([98.0, 110.0, 123.0, 131.0]):
    put(sfx, groan(length=1.8, f0=f0, vel=0.3), T["nodAt"] + 0.3 + 0.05 * k, 0.2 + 0.2 * k)

# ---- the spoon grips: a tight small creak; then the stare: a held low note and every ambience stops ----
heart(T["gripAt"], bell_t - 0.2, 0.9, 0.7, 0.45)
n = int(1.6 * SR)
tk = np.arange(n) / SR
put(music, np.sin(2 * np.pi * 73.4 * tk) * np.sin(np.pi * np.clip(tk / 1.6, 0, 1)) ** 1.5 * 0.2, stare_t - 0.1, 0.5)

# ---- the bell: once, with a long tail ----
n = int(5.0 * SR)
tk = np.arange(n) / SR
bell = np.zeros(n)
for f_, a_, d_ in [(392.0, 1.0, 2.2), (588.0, 0.55, 1.6), (1010.0, 0.35, 1.1), (1480.0, 0.2, 0.7), (196.0, 0.5, 3.0)]:
    bell += a_ * np.sin(2 * np.pi * f_ * tk) * np.exp(-tk / d_)
bell *= np.minimum(1, tk / 0.004) * 0.3
put(sfx, bell, bell_t, 0.55)
put(sfx, np.sin(2 * np.pi * 60 * tk) * np.exp(-tk / 0.25) * 0.5, bell_t, 0.5)
# everyone turns toward the forest at once: one soft shuffle
n = int(0.5 * SR)
tk = np.arange(n) / SR
put(sfx, lowpass(rng.standard_normal(n), 900) * np.sin(np.pi * np.clip(tk / 0.5, 0, 1)) ** 2 * 0.14, bell_t + 22 / FPS, 0.5)

# ---- the head smiles: a held, warm-cold chord that does not resolve ----
n = int(2.6 * SR)
tk = np.arange(n) / SR
chord = sum(np.sin(2 * np.pi * f_ * tk) * a_ for f_, a_ in [(110.0, 0.5), (131.0, 0.4), (185.0, 0.25)])
put(music, chord * np.sin(np.pi * np.clip(tk / 2.6, 0, 1)) ** 1.5 * 0.12, T["smileAt"], 0.5)

# ---- the question: a soft riser, then a low hit as the pupils fill the frame ----
n = int(1.8 * SR)
tk = np.arange(n) / SR
put(music, np.sin(2 * np.pi * np.cumsum(100 + 140 * (tk / 1.8) ** 2) / SR) * (tk / 1.8) ** 2 * 0.12 + highpass(lowpass(rng.standard_normal(n), 3000), 500) * (tk / 1.8) ** 2.5 * 0.05, T["questionAt"], 0.5)
n = int(1.4 * SR)
tk = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 44 * tk) * np.exp(-tk / 0.5) * 0.8 + np.sin(2 * np.pi * 1760 * tk) * np.exp(-tk / 0.5) * 0.04, T["questionAt"] + 58 / FPS, 0.5)

# ---- a low sting as the outro card appears, faint swishes at the line changes ----
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
wavfile.write("public/blind2/bed.wav", SR, (bed.T * 32767).astype(np.int16))
