"""Synthesises the music + sound-effect bed (public/audio/bed.wav) from src/manifest.json.
Everything is generated from scratch with numpy, so there are no licensing issues.
Re-run after changing narration: node scripts/manifest.mjs && python scripts/bed.py
"""
import json
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, lfilter, fftconvolve

SR = 44100
m = json.load(open("src/manifest.json", encoding="utf-8"))
FPS = m["fps"]
cues, starts, shots = m["cues"], m["starts"], m["shots"]
dur = m["total"] / FPS
N = int(dur * SR) + SR
rng = np.random.default_rng(11)
sec = lambda frames: frames / FPS


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


def reverb(buf, seconds=1.8, decay=0.55):
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros_like(buf)
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-t / decay)
        ir = lowpass(ir, 5000)
        ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
        out[ch] = fftconvolve(buf[ch], ir)[: buf.shape[1]]
    return out


# ---------------- music ----------------
pad = np.zeros((2, N))
mel = np.zeros((2, N))

CHORDS = {  # midi voicings, bass note
    "Dmaj7": ([50, 54, 57, 61], 38),
    "Gmaj7": ([50, 54, 55, 59], 43),
    "Bm7": ([50, 54, 57, 59], 47),
    "D": ([50, 54, 57, 62], 38),
    "A": ([52, 57, 61, 64], 45),
}
# (shot index, offset seconds, chord): warm -> mysterious -> hopeful -> home
PROG = [(0, 0.0, "Dmaj7"), (0, 3.6, "Gmaj7"), (1, 0.0, "Bm7"), (1, 3.6, "Gmaj7"),
        (2, 0.0, "D"), (2, 3.6, "A"), (3, 0.0, "Gmaj7"), (3, 3.2, "A"), (3, 5.8, "D")]
ends = [t for t in [sec(starts[s]) + o for s, o, _ in PROG[1:]]] + [dur + 1.0]
for (s, o, name), t_end in zip(PROG, ends):
    t0 = sec(starts[s]) + o
    L = t_end - t0 + 1.8
    t = np.arange(int(L * SR)) / SR
    env = np.minimum(1, t / 1.1) * np.minimum(1, np.maximum(0, (L - t) / 1.8))
    env = env ** 1.5
    notes, bass = CHORDS[name]
    sig = np.zeros_like(t)
    for k, n in enumerate(notes):
        f = midi(n)
        sig += (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.003 * t) + 0.6 * np.sin(2 * np.pi * f * 1.004 * t + k))
    sig = lowpass(sig / len(notes), 1800) * 0.13
    sig += np.sin(2 * np.pi * midi(bass) * t) * 0.10
    put(pad, sig * env, t0, 0.5)


def bell(f, length=3.0, vel=1.0):
    t = np.arange(int(length * SR)) / SR
    s = (np.sin(2 * np.pi * f * t) * np.exp(-2.6 * t)
         + 0.45 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-5.5 * t)
         + 0.22 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-9 * t)
         + 0.08 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-16 * t))
    s *= np.minimum(1, t / 0.004)
    return s * vel * 0.16


# music-box phrases per shot: (offset seconds, midi note, velocity)
PHRASES = {
    0: [(0.7, 78, 0.8), (1.7, 76, 0.7), (2.7, 74, 0.8), (3.9, 76, 0.7), (4.9, 78, 0.8), (5.9, 81, 0.9)],
    1: [(1.0, 83, 0.6), (2.5, 81, 0.5), (4.2, 78, 0.6), (5.4, 74, 0.6)],
    2: [(0.8 + 0.6 * i, n, 0.7) for i, n in enumerate([74, 78, 81, 78, 76, 78, 81, 83, 81, 78])],
    3: [(0.8, 81, 0.7), (2.0, 78, 0.7), (3.2, 76, 0.7), (4.4, 74, 0.8), (5.6, 86, 0.9)],
}
for s, notes in PHRASES.items():
    for off, n, vel in notes:
        put(mel, bell(midi(n), vel=vel), sec(starts[s]) + off, 0.4 + 0.2 * ((n * 7) % 3) / 2)

# firefly twinkle when it appears
t_ff = sec(cues["fireflyIn"] + 14)
for i, n in enumerate([86, 90, 93, 98]):
    put(mel, bell(midi(n), length=2.5, vel=1.1), t_ff + 0.09 * i, 0.3 + 0.13 * i)
# final glow note on arriving home
put(mel, bell(midi(62), length=4.0, vel=1.0), sec(starts[3]) + 5.6, 0.5)

mel_wet = reverb(mel)
music = pad + mel * 0.8 + mel_wet * 0.9

# ---------------- sound effects ----------------
sfx = np.zeros((2, N))

# wind: low, slowly breathing
wind = lowpass(rng.standard_normal(N), 450)
tt = np.arange(N) / SR
wind *= (0.55 + 0.45 * np.sin(2 * np.pi * tt / 7.0 + 1)) * 0.06
wind *= np.minimum(1, tt / 2.0) * np.minimum(1, np.maximum(0, (dur - tt) / 2.0))
sfx += np.stack([wind, np.roll(wind, 900)])

# crickets (fade in with the night)
night = np.clip((tt - sec(cues["nightFrom"] + 40)) / 4.0, 0, 1)
for v in range(4):
    f = 4300 + 330 * v
    period = 0.95 + 0.19 * v
    layer = np.zeros(N)
    t0 = 0.3 * v
    while t0 < dur:
        for p in range(3):
            n = int(0.03 * SR)
            tp = np.arange(n) / SR
            pulse = np.sin(2 * np.pi * f * tp) * np.hanning(n) * 0.5
            i = int((t0 + p * 0.055) * SR)
            if i + n < N:
                layer[i:i + n] += pulse
        t0 += period + rng.uniform(-0.08, 0.08)
    sfx += stereo(layer * night * 0.028, 0.25 + 0.17 * v)

# footsteps on soft grass, one per recorded foot contact
for k, st in enumerate(m["steps"]):
    n = int(0.14 * SR)
    t = np.arange(n) / SR
    noise = highpass(lowpass(rng.standard_normal(n), rng.uniform(1500, 2600)), 250)
    s = noise * np.exp(-t / 0.028) * 0.55 + np.sin(2 * np.pi * rng.uniform(85, 115) * t) * np.exp(-t / 0.045) * 0.5
    put(sfx, s * 0.26 * st["vol"], sec(st["g"]), 0.45 + 0.1 * (k % 2))

# soft whoosh for the wave
n = int(0.45 * SR)
t = np.arange(n) / SR
whoosh = lowpass(rng.standard_normal(n), 1400) * np.sin(np.pi * t / 0.45) ** 2 * 0.08
put(sfx, whoosh, sec(cues["waveIn"]), 0.4)

# ---------------- mix with ducking under the narration ----------------
duck = np.ones(N)
for s, shot in enumerate(shots):
    a = int(sec(starts[s] + shot["leadFrames"]) * SR)
    b = int(sec(starts[s] + shot["leadFrames"] + shot["audioFrames"]) * SR)
    duck[a:b] = 0.5
k = int(0.25 * SR)
duck = np.convolve(duck, np.ones(k) / k, mode="same")

bed = (music * 0.9 + sfx) * duck
fade = np.minimum(1, np.maximum(0, (dur - tt) / 2.0)) * np.minimum(1, tt / 0.5)
bed *= fade
bed = bed[:, : int(dur * SR)]
peak = np.max(np.abs(bed))
bed = bed / peak * 0.55  # peak about -5 dBFS; narration stays on top thanks to the ducking
rms = np.sqrt(np.mean(bed ** 2))
print(f"bed: {dur:.1f}s, peak {20*np.log10(np.max(np.abs(bed))):.1f} dBFS, rms {20*np.log10(rms):.1f} dBFS")
wavfile.write("public/audio/bed.wav", SR, (bed.T * 32767).astype(np.int16))
