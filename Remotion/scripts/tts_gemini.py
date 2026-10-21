"""Thai narration with Gemini TTS (needs the GEMINI_API_KEY environment variable).

  python scripts/tts_gemini.py --sample            # same line in several voices -> out/voice_test/*.mp3
  python scripts/tts_gemini.py --voice Sulafat     # real narration -> public/audio/n0..n3.mp3 (Edge TTS files are backed up)

Optional env vars: GEMINI_TTS_MODEL (default gemini-3.8-flash-tts), GEMINI_TTS_STYLE.
The key is only read from the environment and is never printed or written to disk.
"""
import argparse, base64, hashlib, json, os, re, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.request, wave
from pathlib import Path

def load_dotenv(path: str = ".env") -> None:
    """Tiny .env reader (KEY=value per line); real environment variables take priority."""
    p = Path(path)
    if not p.exists():
        return
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_dotenv()
MODEL = os.environ.get("GEMINI_TTS_MODEL", "gemini-3.8-flash-tts")
STYLE = os.environ.get(
    "GEMINI_TTS_STYLE",
    "อ่านเป็นภาษาไทยด้วยน้ำเสียงผู้เล่านิทานที่อบอุ่น นุ่มนวล เป็นธรรมชาติเหมือนคนจริงๆ จังหวะช้าสบายๆ มีหยุดหายใจตามเครื่องหมายวรรคตอน:",
)
SAMPLE_VOICES = ["Sulafat", "Achird", "Kore", "Leda", "Puck", "Charon"]
KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")


def synth(text: str, voice: str, out_mp3: Path, speed: float = 1.0) -> None:
    body = {
        "contents": [{"parts": [{"text": f"{STYLE}\n{text}"}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
        },
    }
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", "x-goog-api-key": KEY})
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = json.load(r)
            part = data["candidates"][0]["content"]["parts"][0]["inlineData"]
            pcm = base64.b64decode(part["data"])
            break
        except urllib.error.HTTPError as e:
            raw = e.read().decode(errors="replace")
            msg = raw[:400]
            if e.code == 429:
                m = re.search(r'"retryDelay":\s*"(\d+)', raw)
                delay = int(m.group(1)) if m else None
                if delay is not None and delay <= 90 and attempt < 7:  # per-minute limit: wait it out
                    print(f"  rate limited, waiting {delay + 2}s ...", flush=True)
                    time.sleep(delay + 2)
                    continue
            elif e.code in (500, 503) and attempt < 7:
                time.sleep(4 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code} from Gemini (model {MODEL}): {msg}")
        except (KeyError, IndexError):
            if attempt < 3:  # the TTS models occasionally return text instead of audio
                time.sleep(2)
                continue
            raise RuntimeError("Gemini did not return audio: " + json.dumps(data)[:400])
    wav_path = out_mp3.with_suffix(".wav")
    with wave.open(str(wav_path), "wb") as w:  # Gemini returns raw 24 kHz, 16-bit, mono PCM
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path), "-af", f"atempo={speed},silenceremove=start_periods=1:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_threshold=-48dB,areverse,loudnorm=I=-17:TP=-1.5:LRA=11", "-ar", "44100", "-b:a", "192k", str(out_mp3)], check=True)
    wav_path.unlink(missing_ok=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", action="store_true")
    ap.add_argument("--voice", default="Sulafat")
    ap.add_argument("--speed", type=float, default=1.0, help="playback speed, pitch preserved (e.g. 1.1)")
    ap.add_argument("--post-speed", type=float, default=1.0, help="extra speed-up applied when copying cached lines into place (free: no new API calls)")
    ap.add_argument("--script", default="scripts/narration.json", help="JSON array of narration lines")
    ap.add_argument("--out-dir", default="public/audio", help="where n0.mp3, n1.mp3 ... are written")
    args = ap.parse_args()
    if not KEY:
        sys.exit("GEMINI_API_KEY is not set in this terminal. Set it, then restart the terminal / VS Code.")
    lines = json.load(open(args.script, encoding="utf-8"))
    if args.sample:
        out = Path("out/voice_test"); out.mkdir(parents=True, exist_ok=True)
        for v in SAMPLE_VOICES:
            synth(lines[0] + " " + lines[1], v, out / f"{v}.mp3"); print("wrote", out / f"{v}.mp3")
        return
    audio = Path(args.out_dir); audio.mkdir(parents=True, exist_ok=True)
    backup = Path("public/audio_edge")
    keep_backup = audio == Path("public/audio")  # only the pilot's Edge TTS files are backed up
    # Synthesise everything into a temp folder first; the real files are replaced only if EVERY line succeeded,
    # so a quota error or an interruption can never leave a mix of two voices behind.
    # Finished lines are cached (keyed by script, voice, speed and model) so a re-run after a quota error
    # does not pay for lines that already succeeded.
    key = hashlib.sha1(json.dumps([lines, args.voice, args.speed, MODEL, STYLE], ensure_ascii=False).encode()).hexdigest()[:12]
    tmp = Path("out/tts_cache") / key
    tmp.mkdir(parents=True, exist_ok=True)
    for i, t in enumerate(lines):
        if (tmp / f"n{i}.mp3").exists():
            print("cached line", i)
            continue
        try:
            synth(t, args.voice, tmp / f"n{i}.mp3", args.speed)
        except (RuntimeError, subprocess.CalledProcessError) as e:
            sys.exit(f"Line {i} failed, nothing was replaced in {audio} (finished lines are cached, re-run to resume): {e}")
        print("synthesised line", i, flush=True)
    if keep_backup:
        backup.mkdir(exist_ok=True)
    for i in range(len(lines)):
        f = audio / f"n{i}.mp3"
        if keep_backup and f.exists() and not (backup / f.name).exists():
            shutil.copy(f, backup / f.name)
        if args.post_speed == 1.0:
            shutil.copy(str(tmp / f"n{i}.mp3"), str(f))
        else:
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp / f"n{i}.mp3"), "-af", f"atempo={args.post_speed}", "-b:a", "192k", str(f)], check=True)
        print("wrote", f)
    if keep_backup:
        print("Now run: node scripts/manifest.mjs && python scripts/bed.py && npx remotion render src/index.ts Story out/story.mp4")
    else:
        print("Now run: node scripts/island/manifest.mjs && python scripts/island/bed.py && node scripts/island/verify.mjs && npx remotion render src/index.ts Island1 out/island_part1.mp4")

main()
