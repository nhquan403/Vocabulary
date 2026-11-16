// Shared helpers: unknown-word storage, English speech, dictionary lookup.
(function () {
  var KEY = 'vocab.unknownWords';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; }
  }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  var Store = {
    all: function () { return load().filter(function (w) { return window.DICT[w]; }); },
    has: function (w) { return load().indexOf(w) >= 0; },
    add: function (w) { var l = load(); if (l.indexOf(w) < 0) { l.push(w); save(l); } },
    remove: function (w) { save(load().filter(function (x) { return x !== w; })); },
    toggle: function (w) { if (Store.has(w)) { Store.remove(w); return false; } Store.add(w); return true; },
    clear: function () { save([]); }
  };

  var enVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var voices = speechSynthesis.getVoices();
    enVoice = voices.filter(function (v) { return v.lang === 'en-US'; })[0] ||
      voices.filter(function (v) { return /^en/i.test(v.lang); })[0] || null;
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  // Recorded voices. Same folders as VOICES in scripts/voices.py.
  var VOICES = {
    us: { label: '🇺🇸 Giọng Mỹ', short: '🇺🇸 Mỹ', root: 'audio' },
    in: { label: '🇮🇳 Giọng Ấn Độ', short: '🇮🇳 Ấn', root: 'audio/in' },
    'in-strong': { label: '🇮🇳 Ấn Độ (đậm)', short: '🇮🇳 Ấn đậm', root: 'audio/in-strong' }
  };
  var VOICE_KEY = 'vocab.voice';

  function getVoice() {
    var v = null;
    try { v = localStorage.getItem(VOICE_KEY); } catch (e) { /* storage unavailable */ }
    return VOICES[v] ? v : 'us';
  }
  function setVoice(v) {
    if (!VOICES[v]) return;
    try { localStorage.setItem(VOICE_KEY, v); } catch (e) { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent('voicechange', { detail: v }));
  }

  // File naming rule shared with scripts/generate-word-audio.py.
  function wordAudioPath(word, voice) {
    return VOICES[voice].root + '/words/' + encodeURIComponent(word.toLowerCase().replace(/'/g, '_')) + '.mp3';
  }
  function storyAudioPath(id, voice) {
    return VOICES[voice].root + '/stories/' + encodeURIComponent(id) + '.mp3';
  }

  var player = null;

  // Speak an English word: play the chosen voice's MP3, then the American MP3,
  // then the browser voice, stopping at the first one that works.
  function speak(text) {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    if (!player) player = new Audio();
    player.pause();
    var sources = [wordAudioPath(text, getVoice())];
    if (getVoice() !== 'us') sources.push(wordAudioPath(text, 'us'));
    var attempt = 0;
    // onerror and the play() rejection can both report one failure; only the
    // first report for the current attempt moves on to the next source.
    function next() {
      var src = sources.shift();
      if (!src) { speakWithBrowser(text); return; }
      var mine = ++attempt;
      player.onerror = function () { if (mine === attempt) next(); };
      player.src = src;
      var p = player.play();
      if (p && p.catch) p.catch(function (e) { if (e.name !== 'AbortError' && mine === attempt) next(); });
    }
    next();
  }

  // Voice picker: inside the sticky audio player when the page shows one
  // (an element with id "voice-slot"), otherwise in the top bar.
  function addVoicePicker() {
    var slot = document.getElementById('voice-slot');
    var inPlayer = !!slot && !slot.closest('[hidden]');
    var bar = inPlayer ? slot : document.querySelector('.topbar');
    if (!bar) return;
    var sel = document.createElement('select');
    sel.className = inPlayer ? 'voice-picker pbtn' : 'voice-picker';
    sel.title = 'Chọn giọng đọc';
    sel.setAttribute('aria-label', 'Chọn giọng đọc');
    Object.keys(VOICES).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k;
      o.textContent = inPlayer ? VOICES[k].short : VOICES[k].label;
      sel.appendChild(o);
    });
    sel.value = getVoice();
    sel.addEventListener('change', function () { setVoice(sel.value); });
    if (inPlayer) slot.replaceWith(sel);
    else bar.appendChild(sel);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addVoicePicker);
  else addVoicePicker();

  function speakWithBrowser(text) {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt này không hỗ trợ đọc phát âm. Hãy dùng Chrome, Edge hoặc Safari.');
      return;
    }
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    if (enVoice) u.voice = enVoice;
    u.rate = 0.85;
    speechSynthesis.speak(u);
  }

  function lookup(token) {
    return window.Lemma.lemma(token, window.DICT, window.IRREG);
  }

  var POS = {
    n: 'danh từ', v: 'động từ', adj: 'tính từ', adv: 'trạng từ', prep: 'giới từ',
    pron: 'đại từ', conj: 'liên từ', det: 'từ hạn định', num: 'số từ', int: 'thán từ',
    modal: 'động từ khuyết thiếu', phr: 'dạng rút gọn', name: 'tên riêng'
  };
  function posLabel(p) {
    return p.split('/').map(function (x) { return POS[x] || x; }).join(' / ');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.App = {
    Store: Store, speak: speak, lookup: lookup, posLabel: posLabel, escapeHtml: escapeHtml,
    getVoice: getVoice, storyAudioPath: storyAudioPath
  };
})();
