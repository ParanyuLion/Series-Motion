#!/bin/bash
cd /e/Coding/animation/Remotion
export PYTHONIOENCODING=utf-8
export TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview GOOGLE_CLOUD_LOCATION=global
export GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project 2>/dev/null)
export GEMINI_TTS_STYLE="อ่านเป็นภาษาไทยด้วยน้ำเสียงปกติของผู้หญิง ระดับเสียงพูดทั่วไป ชัดเจน จังหวะเป็นธรรมชาติ ไม่กระซิบ ไม่ช้า แต่มีความเย็นและขนลุกนิดๆ ในน้ำเสียง เหมือนคนเล่าเรื่องผีที่ใจเย็นเกินไป:"
python scripts/tts_gemini.py --script scripts/dorm2/part2.narration.json --out-dir public/dorm2v --voice Sulafat --speed 1.25 --post-speed ${POST:-1.0} > out/dorm2_voice.log 2>&1
echo done >> out/dorm2_voice.log
