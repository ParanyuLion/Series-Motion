"""Gloomy music + sound-effect bed for Island Part 1 -> public/island1/bed.wav
Everything is synthesised with numpy (no licensing issues). Reads src/island/manifest.json.
  python scripts/island/bed.py
Walk windows and flash frames come from the manifest cues (single source of truth with Part1.tsx).
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/island/manifest.json", encoding="utf-8"))
FPS, cues, shots, starts = m["fps"], m["cues"], m["shots"], m["starts"]
dur = m["total"] / FPS
N = int(dur * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(23)
sec = lambda f: f / FPS


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def stereo(sig, pan=0.5):
    return np.stack([sig * np.cos(pan * np.pi / 2), sig * np.sin(pan * np.pi / 2)]) * 1.41


def put(buf, sig, t0, pan=0.5):
    i = int(t0 * SR)
    if i >= buf.shape[1]:
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


def reverb(buf, seconds=2.6, decay=0.9):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(buf)
    for ch in range(2):
        ir = lowpass(rng.standard_normal(n) * np.exp(-t / decay), 4000)
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        out[ch] = fftconvolve(buf[ch], ir)[: buf.shape[1]]
    return out


def ramp(t0, t1):
    """0 before t0, linear up to 1 at t1, stays 1."""
    return np.clip((tt - t0) / max(1e-6, t1 - t0), 0, 1)


hook_end = sec(cues["hookCut"])
sky = sec(cues["skyChange"])
outro = sec(m["outroStart"])

# ---------------- music: low drone + a lonely bell ----------------
music = np.zeros((2, N))
drone = np.zeros(N)
for f, a in [(73.42, 0.5), (110.0, 0.3), (174.6, 0.18)]:  # D2, A2, F3 (D minor)
    drift = 1 + 0.004 * ramp(sky, outro)  # the pitch creeps up as the sky turns
    drone += a * np.sin(2 * np.pi * f * tt * drift + 0.6 * np.sin(2 * np.pi * 0.07 * tt))
drone = lowpass(drone, 380) * (0.55 + 0.25 * np.sin(2 * np.pi * tt / 11.0))
drone *= 0.16 * (0.4 + 0.6 * ramp(hook_end, hook_end + 4)) * (1 + 0.9 * ramp(sky, outro))
music += stereo(drone, 0.5)

mel = np.zeros((2, N))


def bell(f, length=4.5, vel=1.0):
    t = np.arange(int(length * SR)) / SR
    s = (np.sin(2 * np.pi * f * t) * np.exp(-1.6 * t)
         + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-3.4 * t)
         + 0.15 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-7 * t))
    s *= np.minimum(1, t / 0.006)
    return s * vel * 0.18


# sparse D-minor phrase, one note every few seconds, starting after the hook
phrase = [(hook_end + 2.0, 69), (hook_end + 6.5, 72), (hook_end + 11.0, 74), (hook_end + 17.5, 69),
          (hook_end + 24.0, 65), (hook_end + 29.0, 69), (hook_end + 34.5, 72), (hook_end + 40.0, 62)]
for t0, n in phrase:
    if t0 < outro - 1:
        put(mel, bell(midi(n), vel=0.8), t0, 0.35 + 0.3 * ((n * 5) % 3) / 2)
put(mel, bell(midi(86), length=5.0, vel=0.9), sec(m["outroStart"]) + 0.3, 0.5)  # a last high note on the outro card
music += mel * 0.8 + reverb(mel) * 1.0

# ---------------- sound effects ----------------
sfx = np.zeros((2, N))

# wind, always, low and breathing
wind = lowpass(rng.standard_normal(N), 420) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 8.0 + 1.3)) * 0.07
sfx += np.stack([wind, np.roll(wind, 1100)])

# distant waves: slow swells of filtered noise, loudest after the hook
waves = lowpass(rng.standard_normal(N), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 6.5)) ** 2 * 0.09
sfx += np.stack([waves, np.roll(waves, 2300)]) * (0.35 + 0.65 * ramp(hook_end - 0.5, hook_end + 1.5))

# rain: heavy during the hook, back as the sky turns
rain = highpass(lowpass(rng.standard_normal(N), 7500), 1400)
rain_gain = 0.085 * (np.where(tt < hook_end - 0.2, 1.0, 0.0) * ramp(0.0, 1.0)) + 0.06 * ramp(sky, outro) * (tt < outro + 0.5)
sfx += np.stack([rain * rain_gain, np.roll(rain, 700) * rain_gain])

# thunder at the two flashes of the hook (frames 62 and 90) and a rumble into the sky change
for fr in (cues["flash0"], cues["flash1"]):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    thunder = lowpass(rng.standard_normal(n), 140) * np.exp(-t / 0.9) * np.minimum(1, t / 0.05) * 0.6
    put(sfx, thunder, sec(fr), 0.5)
rumble = lowpass(rng.standard_normal(N), 90) * ramp(sky - 1.0, outro) ** 2 * 0.3 * (tt < outro + 1.0)
sfx += np.stack([rumble, np.roll(rumble, 500)])

# the sting at the hook cut: a low hit plus a short metallic burst
n = int(2.5 * SR)
t = np.arange(n) / SR
hit = np.sin(2 * np.pi * 52 * t) * np.exp(-t / 0.7) * 0.7 + highpass(rng.standard_normal(n), 2500) * np.exp(-t / 0.06) * 0.25
put(sfx, hit, hook_end - 0.04, 0.5)

# footsteps on wet sand: the hero walks out to the palm and back (same windows as Part1.tsx)
windows = [(cues["walkOutStart"], cues["walkOutEnd"]), (cues["walkBackStart"], cues["walkBackEnd"])]
step_frames = []
for a, b in windows:
    k = int(np.floor((a * 0.2 - np.pi / 2) / np.pi)) + 1
    while True:
        g = (np.pi / 2 + k * np.pi) / 0.2
        if g >= b:
            break
        if g >= a:
            step_frames.append(g)
        k += 1
for i, g in enumerate(step_frames):
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    noise = highpass(lowpass(rng.standard_normal(n), rng.uniform(900, 1700)), 160)
    s = noise * np.exp(-t / 0.035) * 0.5 + np.sin(2 * np.pi * rng.uniform(70, 95) * t) * np.exp(-t / 0.05) * 0.5
    put(sfx, s * 0.3, sec(g), 0.45 + 0.1 * (i % 2))

# ---------------- mix, duck under the narration, fade ----------------
duck = np.ones(N)
for i, s in enumerate(shots):
    a = int(sec(starts[i] + s["leadFrames"]) * SR)
    b = int(sec(starts[i] + s["leadFrames"] + s["audioFrames"]) * SR)
    duck[a:b] = 0.5
k = int(0.25 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode="same")

bed = (music + sfx) * duck
bed *= np.minimum(1, tt / 0.6) * np.minimum(1, np.maximum(0, (dur - tt) / 1.5))
bed = bed[:, : int(dur * SR)]
bed = bed / np.max(np.abs(bed)) * 0.55
rms = np.sqrt(np.mean(bed ** 2))
print(f"bed: {dur:.1f}s, steps {len(step_frames)}, peak {20 * np.log10(np.max(np.abs(bed))):.1f} dBFS, rms {20 * np.log10(rms):.1f} dBFS")
wavfile.write("public/island1/bed.wav", SR, (bed.T * 32767).astype(np.int16))
