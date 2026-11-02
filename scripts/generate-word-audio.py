#!/usr/bin/env python3
"""Generate one MP3 per dictionary word with the Kokoro TTS model (free, Apache-2.0).

Usage:
  pip install kokoro-onnx soundfile numpy
  node scripts/build.js            # js/data.js must exist
  python scripts/generate-word-audio.py --model DIR [--force]

Writes audio/words/<file>.mp3, where <file> is the lowercase headword with "'" replaced
by "_" (same rule as wordAudioPath() in js/common.js). Existing files are skipped unless
--force is given, so the script can be stopped and resumed. Needs ffmpeg.
"""
import argparse
import json
import os
import re
import subprocess
import tempfile

import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = "af_heart"  # American English, female
# Abbreviations the model would otherwise spell letter by letter.
SPOKEN = {"mr": "Mister", "mrs": "Missus", "ms": "Miz", "tv": "T V"}


def load_dict():
    with open(os.path.join(ROOT, "js", "data.js"), encoding="utf-8") as f:
        src = f.read()
    return json.loads(re.search(r"window\.DICT = (\{.*?\});\n", src, re.S).group(1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="folder with kokoro-v1.0.onnx and voices-v1.0.bin")
    ap.add_argument("--force", action="store_true", help="regenerate files that already exist")
    args = ap.parse_args()

    entries = {k: v for k, v in load_dict().items() if v["p"] != "name"}
    out_dir = os.path.join(ROOT, "audio", "words")
    os.makedirs(out_dir, exist_ok=True)
    tts = Kokoro(os.path.join(args.model, "kokoro-v1.0.onnx"), os.path.join(args.model, "voices-v1.0.bin"))

    done = 0
    for key in sorted(entries):
        mp3 = os.path.join(out_dir, key.replace("'", "_") + ".mp3")
        done += 1
        if os.path.exists(mp3) and not args.force:
            continue
        text = SPOKEN.get(key, entries[key]["w"])
        audio, rate = tts.create(text, voice=VOICE, speed=0.9, lang="en-us")
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            sf.write(tmp.name, audio, rate)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-b:a", "48k", mp3], check=True)
        os.unlink(tmp.name)
        if done % 100 == 0:
            print(f"{done}/{len(entries)}", flush=True)
    print(f"done {len(entries)} words", flush=True)


if __name__ == "__main__":
    main()
