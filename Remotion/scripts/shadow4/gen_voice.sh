#!/bin/bash
cd /e/Coding/animation/Remotion
export PYTHONIOENCODING=utf-8
export TTS_BACKEND=vertex GEMINI_TTS_MODEL=gemini-3.1-flash-tts-preview GOOGLE_CLOUD_LOCATION=global
export GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project 2>/dev/null)
export GEMINI_TTS_STYLE="อ่านเป็นภาษาไทยด้วยน้ำเสียงเรียบ นิ่ง เย็น เหมือนผู้เล่าเรื่องลึกลับที่กระซิบเบาๆ จังหวะช้า มีหยุดสั้นๆ ไม่ตื่นเต้นเกินจริง:"
python scripts/tts_gemini.py --script scripts/shadow4/part4.narration.json --out-dir public/shadow4v --voice Charon --speed 1.1 --post-speed 1.32 > out/sh4_voice.log 2>&1
echo done >> out/sh4_voice.log
