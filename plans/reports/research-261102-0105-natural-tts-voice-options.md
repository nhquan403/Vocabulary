# Natural English voice for the vocabulary site — options and cost

Researched: 2026-11-02 (UTC). Prices are from vendor pages and third-party aggregators that sometimes disagree; verify on the vendor page before paying.

## Answer

The site only needs to pronounce a fixed list: 3,336 words, 19,888 characters in total. So the right design is to **generate one MP3 per word once, commit the files, and play them from GitHub Pages**. No API key in the browser, no monthly bill, works offline after load. With that design every option below costs between $0 and well under $1 one-time, and the free tiers of Google, Azure, Polly and ElevenLabs each cover the whole list.

Recommendation: **Kokoro-82M (free, open source, Apache-2.0)** first. If its quality is not good enough for you, use **Azure neural voices** (free tier 0.5M chars/month covers the list 25 times) or **ElevenLabs** (best realism; free 10k credits/month, so two months, or one month of Starter at about $5–6).

## Comparison (for ~20,000 characters, generated once)

| Option | Realism | Cost for this site | Notes |
|---|---|---|---|
| Kokoro-82M (open source) | Good, natural; top community TTS arena rank at release | $0 | Runs locally on CPU; American and British voices; Apache-2.0 allows commercial use. |
| Azure Neural TTS | Very good | $0 (free tier 0.5M chars/month); paid ≈ $15–16 per 1M chars → ≈ $0.30 | Needs an Azure account and key (used only by the build script). |
| Google Cloud TTS (Neural2 / Chirp 3 HD) | Very good | Likely $0 in free tier (sources conflict); paid $16 (Neural2) or $30 (Chirp 3 HD) per 1M → $0.32–0.60 | Needs a billing account even for free tier. |
| Amazon Polly (Neural / Generative) | Good / very good | $0 (12-month free tier: 1M neural, 100k generative chars/month); paid $30 per 1M generative → ≈ $0.60 | Free tier only for the first 12 months. |
| OpenAI TTS (tts-1 / tts-1-hd) | Very good | $15 / $30 per 1M chars → $0.30–0.60 | No free tier. |
| ElevenLabs | Most human-like | Free 10k credits/month (two months for the list) or Starter ≈ $5–6/month for 30k credits | Paid plan gives commercial license; prices changed during 2026. |
| Browser default (current) | Robotic, varies by device | $0 | What the site uses now. |

## Integration sketch

```text
scripts/gen-audio.(py|js)  --(TTS engine)-->  audio/<word>.mp3   (committed, ~3,336 files, roughly 20–40 MB)
js/common.js  speak(word): play audio/<word>.mp3; fall back to speechSynthesis if the file is missing
```

GitHub Pages limits a site to 1 GB, so the audio fits easily. Build-time generation keeps any API key out of the public website.

## Sources

- Google Cloud TTS pricing: https://cloud.google.com/text-to-speech/pricing ; https://costbench.com/software/ai-voice-tools/google-cloud-text-to-speech/
- Azure Speech pricing: https://azure.microsoft.com/en-us/pricing/details/speech/ ; https://www.beri.net/article/elevenlabs-vs-cartesia-vs-azure-tts-latency-pricing-voice-cloning-2026
- Amazon Polly pricing: https://aws.amazon.com/polly/pricing/
- OpenAI TTS pricing: https://costgoat.com/pricing/openai-tts ; https://community.openai.com/t/new-tts-api-pricing-and-gotchas/1150616
- ElevenLabs pricing: https://dupple.com/learn/is-elevenlabs-free ; https://www.cloudzero.com/blog/elevenlabs-pricing/
- Kokoro-82M: https://together.ai/models/kokoro-82m ; https://vast.ai/model/kokoro

## Unresolved questions

- Which voice the user prefers (American or British, male or female) — best decided by listening to samples.
- Whether Kokoro can be installed in this cloud container (network access to Python packages and model files is untested).
