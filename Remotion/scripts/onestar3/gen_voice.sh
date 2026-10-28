#!/bin/bash
cd /e/Coding/animation/Remotion
export PYTHONIOENCODING=utf-8
export TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview GOOGLE_CLOUD_LOCATION=global
export GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project 2>/dev/null)
export GEMINI_TTS_STYLE="อ่านเป็นภาษาไทยด้วยน้ำเสียงเรียบ นิ่ง เย็น เหมือนผู้เล่าเรื่องลึกลับที่กระซิบเบาๆ จังหวะช้า มีหยุดสั้นๆ ไม่ตื่นเต้นเกินจริง:"
python scripts/tts_gemini.py --script scripts/onestar3/part3.narration.json --out-dir public/onestar3 --voice Charon --speed 1.1 --post-speed 1.245 > out/os3_voice.log 2>&1
echo done >> out/os3_voice.log
