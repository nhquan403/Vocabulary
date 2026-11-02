#!/usr/bin/env python3
"""Generate a full-story MP3 with the Kokoro TTS model (free, Apache-2.0).

Usage:
  pip install kokoro-onnx soundfile numpy
  # model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
  python scripts/generate-story-audio.py --model DIR 01-a-day-with-my-family [more story ids]

Writes audio/stories/<story-id>.mp3 (needs ffmpeg). Run `node scripts/build.js` afterwards
so the reading page shows the audio player for that story.
"""
import argparse
import os
import subprocess
import tempfile

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = "af_heart"  # American English, female
PAUSE_AFTER_TITLE = 1.0
PAUSE_BETWEEN_PARAGRAPHS = 0.7


def read_story(story_id):
    path = os.path.join(ROOT, "data", "src", "stories", story_id + ".txt")
    with open(path, encoding="utf-8") as f:
        title, _, rest = f.read().replace("\r", "").partition("\n")
    paragraphs = [" ".join(p.split()) for p in rest.split("\n\n") if p.strip()]
    return title.strip(), paragraphs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True, help="folder with kokoro-v1.0.onnx and voices-v1.0.bin")
    ap.add_argument("stories", nargs="+")
    args = ap.parse_args()

    tts = Kokoro(os.path.join(args.model, "kokoro-v1.0.onnx"), os.path.join(args.model, "voices-v1.0.bin"))
    out_dir = os.path.join(ROOT, "audio", "stories")
    os.makedirs(out_dir, exist_ok=True)

    for story_id in args.stories:
        title, paragraphs = read_story(story_id)
        parts, rate = [], 24000
        for i, text in enumerate([title] + paragraphs):
            audio, rate = tts.create(text, voice=VOICE, speed=1.0, lang="en-us")
            pause = PAUSE_AFTER_TITLE if i == 0 else PAUSE_BETWEEN_PARAGRAPHS
            parts += [audio, np.zeros(int(rate * pause), dtype=audio.dtype)]
            print(f"{story_id}: {i}/{len(paragraphs)}", flush=True)
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            sf.write(tmp.name, np.concatenate(parts), rate)
        mp3 = os.path.join(out_dir, story_id + ".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-b:a", "64k", mp3], check=True)
        os.unlink(tmp.name)
        print("wrote", os.path.relpath(mp3, ROOT))


if __name__ == "__main__":
    main()
