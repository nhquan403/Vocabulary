"""Recorded voices shared by the audio scripts. Keep in sync with VOICES in js/common.js."""

# name -> output folder, Kokoro voice (or a blend recipe), phoneme language, speed factor
VOICES = {
    # American English, female
    "us": {"root": "audio", "voice": "af_heart", "lang": "en-us", "speed": 1.0},
    # Indian male voice reading with American phonemes
    "in": {"root": "audio/in", "voice": "hm_omega", "lang": "en-us", "speed": 1.0},
    # Stronger Indian accent: hm_omega pushed further away from the American male voice,
    # British (non-rhotic) phonemes, slightly faster.
    "in-strong": {"root": "audio/in-strong", "voice": ("hm_omega", "am_michael", 0.6), "lang": "en-gb", "speed": 1.15},
}


def voice_style(tts, name):
    """The Kokoro voice argument for `name`: a voice id, or a blended style vector."""
    voice = VOICES[name]["voice"]
    if isinstance(voice, str):
        return voice
    base, away_from, amount = voice
    a, b = tts.get_voice_style(base), tts.get_voice_style(away_from)
    return a + amount * (a - b)
