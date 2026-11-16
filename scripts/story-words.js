#!/usr/bin/env node
// Print the dictionary headwords used in the given stories, one per line, sorted.
// Uses the same word -> headword rule as the reading page (js/lemma.js).
// Usage: node scripts/story-words.js 01-a-day-with-my-family [more story ids]
'use strict';
const fs = require('fs');
const path = require('path');
const { lemma, TOKEN_RE } = require('../js/lemma.js');

global.window = {};
eval(fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8'));
const { DICT, IRREG, STORIES } = global.window;

const ids = process.argv.slice(2);
const words = new Set();
for (const id of ids) {
  const story = STORIES.find((s) => s.id === id);
  if (!story) { console.error(`unknown story: ${id}`); process.exit(1); }
  for (const text of [story.title, ...story.paragraphs]) {
    for (const tok of text.match(TOKEN_RE) || []) {
      const l = lemma(tok, DICT, IRREG);
      if (l && DICT[l].p !== 'name') words.add(l);
    }
  }
}
console.log([...words].sort().join('\n'));
