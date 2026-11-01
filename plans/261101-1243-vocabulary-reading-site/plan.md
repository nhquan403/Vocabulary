# Vocabulary reading site — plan

Status: in progress

## Outcome
Static website (no server, works offline from `index.html`) to learn English vocabulary:
1. ~20 everyday-life reading passages, ~1500 words each, printable on A4.
2. Dictionary of >= 3000 common words (word, part of speech, Vietnamese meaning) that covers every word used in the passages; the learner can click a word to see its meaning and mark it as "unknown".
3. Review mode: black background, Vietnamese meaning in white in the center, button to reveal English, speaker button that reads the English word (Web Speech API).

## Constraints
- Simple, high-frequency words only. Plain HTML/CSS/JS, data bundled as JS so `file://` works.
- Unknown-word list stored in `localStorage`.

## Non-goals
Accounts, backend, sync, recorded audio, deployment.

## Acceptance criteria
- `node scripts/build.js` builds `js/data.js` and fails if any passage token cannot be resolved to a dictionary entry, or if the dictionary has < 3000 entries (names excluded).
- Passages print cleanly on A4 (UI hidden).
- Browser check: click word -> meaning popup, mark unknown, dictionary search/filter, review reveal + speak.

## Layout
- `data/src/words-*.txt` — `word|pos|meaning`
- `data/src/irregular.txt` — `form|lemma`
- `data/src/stories/NN-slug.txt` — first line title, blank line, paragraphs
- `scripts/build.js` — build + coverage check
- `js/lemma.js` — shared word -> lemma resolver (browser + node)
- `index.html`, `read.html`, `dictionary.html`, `review.html`, `css/`, `js/`
