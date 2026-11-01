// Dictionary page: search, filter, mark unknown words, speak.
(function () {
  var esc = App.escapeHtml;
  var Store = App.Store;
  var PAGE = 200;
  var shown = PAGE;
  var letter = '';

  // Words used in at least one story.
  var inStories = {};
  STORIES.forEach(function (s) {
    [s.title].concat(s.paragraphs).forEach(function (t) {
      (t.match(Lemma.TOKEN_RE) || []).forEach(function (tok) {
        var l = App.lookup(tok);
        if (l) inStories[l] = true;
      });
    });
  });

  var keys = Object.keys(DICT).sort(function (a, b) { return a.localeCompare(b); });

  // Vietnamese search ignores accents: "nha bep" finds "nhà bếp".
  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }
  var folded = {};
  keys.forEach(function (k) { folded[k] = fold(DICT[k].m); });

  var q = document.getElementById('q');
  var filter = document.getElementById('filter');
  var list = document.getElementById('dict');
  var more = document.getElementById('more');

  var initial = new URLSearchParams(location.search).get('q');
  if (initial) q.value = initial;

  var letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  document.getElementById('letters').innerHTML = '<button type="button" data-k="" class="active">Tất cả</button>' +
    letters.map(function (c) { return '<button type="button" data-k="' + c + '">' + c.toUpperCase() + '</button>'; }).join('');
  document.getElementById('letters').addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    letter = b.dataset.k;
    this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('active', x === b); });
    shown = PAGE;
    render();
  });

  function matches() {
    var term = q.value.trim().toLowerCase();
    var fterm = fold(term);
    var mode = filter.value;
    var res = keys.filter(function (k) {
      if (mode === 'unknown' && !Store.has(k)) return false;
      if (mode === 'story' && !inStories[k]) return false;
      if (letter && k[0] !== letter) return false;
      if (!term) return true;
      return k.indexOf(term) >= 0 || folded[k].indexOf(fterm) >= 0;
    });
    if (term) {
      // exact and prefix matches first
      res.sort(function (a, b) {
        function score(k) { return k === term ? 0 : k.indexOf(term) === 0 ? 1 : k.indexOf(term) >= 0 ? 2 : 3; }
        return score(a) - score(b) || a.localeCompare(b);
      });
    }
    return res;
  }

  function row(k) {
    var e = DICT[k];
    var on = Store.has(k);
    return '<li data-k="' + esc(k) + '" class="' + (on ? 'unknown' : '') + '">' +
      '<button class="speak" type="button" data-act="speak" title="Nghe phát âm" aria-label="Nghe phát âm">🔊</button>' +
      '<span class="en">' + esc(e.w) + '</span>' +
      '<span class="pos">' + esc(App.posLabel(e.p)) + '</span>' +
      '<span class="vi">' + esc(e.m) + '</span>' +
      '<button class="btn small' + (on ? ' on' : '') + '" type="button" data-act="toggle">' + (on ? '✓ Chưa biết' : '＋ Chưa biết') + '</button>' +
      '</li>';
  }

  function render() {
    var res = matches();
    document.getElementById('count').textContent = res.length + ' từ';
    list.innerHTML = res.slice(0, shown).map(row).join('') || '<li class="muted">Không tìm thấy từ nào.</li>';
    more.hidden = res.length <= shown;
    document.getElementById('badge').textContent = Store.all().length;
  }

  list.addEventListener('click', function (ev) {
    var btn = ev.target.closest('button');
    if (!btn) return;
    var li = btn.closest('li');
    var k = li.dataset.k;
    if (btn.dataset.act === 'speak') App.speak(DICT[k].w);
    if (btn.dataset.act === 'toggle') {
      Store.toggle(k);
      if (filter.value === 'unknown') { render(); return; }
      li.outerHTML = row(k);
      document.getElementById('badge').textContent = Store.all().length;
    }
  });
  q.addEventListener('input', function () { shown = PAGE; render(); });
  filter.addEventListener('change', function () { shown = PAGE; render(); });
  more.addEventListener('click', function () { shown += PAGE; render(); });

  render();
})();
