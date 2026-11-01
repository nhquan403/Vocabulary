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

  // Speak an English word. Only English is ever spoken.
  function speak(text) {
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

  window.App = { Store: Store, speak: speak, lookup: lookup, posLabel: posLabel, escapeHtml: escapeHtml };
})();
