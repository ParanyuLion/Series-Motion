"""Image-to-video with Veo on Vertex AI (REST).
Usage: python scripts/onestar2/veo.py <ref image> <out mp4> "<prompt>"
Auth: gcloud application-default token; project from `gcloud config get-value project`. Prints only the output path.
Output: 1080x1920, 8 s, no audio (veo-3.1-fast-generate-001)."""
import base64, json, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

IMG, OUT, PROMPT = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
import os
MODEL, LOC = os.environ.get("VEO_MODEL", "veo-3.1-fast-generate-001"), "us-central1"


def sh(c):
    return subprocess.run(c, shell=True, capture_output=True, text=True).stdout.strip()


proj = sh("gcloud config get-value project")
tok = sh("gcloud auth application-default print-access-token")
img = base64.b64encode(IMG.read_bytes()).decode()
base = f"https://{LOC}-aiplatform.googleapis.com/v1/projects/{proj}/locations/{LOC}/publishers/google/models/{MODEL}"


def call(url, body):
    req = urllib.request.Request(url, json.dumps(body).encode(), {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    try:
        return json.load(urllib.request.urlopen(req, timeout=120))
    except urllib.error.HTTPError as e:
        sys.exit(f"HTTP {e.code}: {e.read().decode()[:400]}")


import os
inst = {"prompt": PROMPT, "image": {"bytesBase64Encoded": img, "mimeType": "image/png"}}
if os.environ.get("VEO_REF"):  # use the photo as a subject reference instead of the first frame
    inst = {"prompt": PROMPT, "referenceImages": [{"image": {"bytesBase64Encoded": img, "mimeType": "image/png"}, "referenceType": "asset"}]}
body = {"instances": [inst],
        "parameters": {"aspectRatio": "9:16", "durationSeconds": 8, "resolution": "1080p", "sampleCount": 1, "generateAudio": False, "personGeneration": "allow_adult"}}
op = call(base + ":predictLongRunning", body)["name"]
for _ in range(60):
    time.sleep(10)
    s = call(base + ":fetchPredictOperation", {"operationName": op})
    if s.get("done"):
        vids = (s.get("response") or {}).get("videos") or []
        if not vids or not vids[0].get("bytesBase64Encoded"):
            sys.exit("no video: " + json.dumps(s)[:400])
        OUT.write_bytes(base64.b64decode(vids[0]["bytesBase64Encoded"]))
        print(OUT)
        break
else:
    sys.exit("timeout")
