// Reading page: render a story with clickable words and a meaning popup.
(function () {
  var esc = App.escapeHtml;
  var Store = App.Store;
  var params = new URLSearchParams(location.search);
  var index = Math.max(0, STORIES.findIndex(function (s) { return s.id === params.get('id'); }));
  var story = STORIES[index];
  var sheet = document.getElementById('sheet');
  var popup = document.getElementById('popup');
  var current = null; // { lemma, el }

  document.title = story.title;
  document.getElementById('info').textContent = story.words + ' từ';

  // Wrap every word token in a span carrying its dictionary headword.
  function renderText(text) {
    var out = '';
    var last = 0;
    text.replace(Lemma.TOKEN_RE, function (tok, offset) {
      out += esc(text.slice(last, offset));
      var l = App.lookup(tok);
      out += l ? '<span class="w" data-l="' + esc(l) + '">' + esc(tok) + '</span>' : esc(tok);
      last = offset + tok.length;
      return tok;
    });
    return out + esc(text.slice(last));
  }

  sheet.innerHTML = '<h1>' + renderText(story.title) + '</h1>' +
    story.paragraphs.map(function (p) { return '<p>' + renderText(p) + '</p>'; }).join('');

  function refreshMarks() {
    var unknown = Store.all();
    var set = {};
    unknown.forEach(function (w) { set[w] = true; });
    sheet.querySelectorAll('.w').forEach(function (el) {
      el.classList.toggle('unknown', !!set[el.dataset.l]);
    });
    document.getElementById('badge').textContent = unknown.length;

    // unknown words that appear in this story, in order of first appearance
    var seen = {};
    var inStory = [];
    sheet.querySelectorAll('.w').forEach(function (el) {
      var l = el.dataset.l;
      if (set[l] && !seen[l]) { seen[l] = true; inStory.push(l); }
    });
    document.getElementById('sw-count').textContent = inStory.length;
    document.getElementById('sw-empty').hidden = inStory.length > 0;
    document.getElementById('chips').innerHTML = inStory.map(function (l) {
      return '<span class="chip" data-l="' + esc(l) + '"><b>' + esc(DICT[l].w) + '</b> <small>' + esc(DICT[l].m) + '</small></span>';
    }).join('');
  }

  function updateToggle() {
    var btn = document.getElementById('p-toggle');
    var on = Store.has(current.lemma);
    btn.textContent = on ? '✓ Đang ôn tập (bấm để bỏ)' : '＋ Chưa biết – thêm vào ôn tập';
    btn.classList.toggle('on', on);
  }

  function openPopup(lemma, el, form) {
    var e = DICT[lemma];
    if (!e) return;
    if (current && current.el) current.el.classList.remove('selected');
    current = { lemma: lemma, el: el };
    if (el) el.classList.add('selected');
    document.getElementById('p-word').textContent = e.w;
    var f = form && form.toLowerCase() !== e.w.toLowerCase() ? 'trong bài: “' + form + '”' : '';
    document.getElementById('p-form').textContent = f;
    document.getElementById('p-pos').textContent = App.posLabel(e.p);
    document.getElementById('p-meaning').textContent = e.m;
    document.getElementById('p-dict').href = 'dictionary.html?q=' + encodeURIComponent(e.w);
    updateToggle();

    popup.hidden = false;
    var r = (el || sheet).getBoundingClientRect();
    var pw = popup.offsetWidth;
    var left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - pw - 8);
    var top = r.bottom + window.scrollY + 8;
    if (r.bottom + popup.offsetHeight + 16 > window.innerHeight && r.top > popup.offsetHeight + 16) {
      top = r.top + window.scrollY - popup.offsetHeight - 8;
    }
    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
  }

  function closePopup() {
    popup.hidden = true;
    if (current && current.el) current.el.classList.remove('selected');
    current = null;
  }

  sheet.addEventListener('click', function (ev) {
    var el = ev.target.closest('.w');
    if (!el) return;
    ev.stopPropagation();
    openPopup(el.dataset.l, el, el.textContent);
  });
  document.getElementById('chips').addEventListener('click', function (ev) {
    var chip = ev.target.closest('.chip');
    if (!chip) return;
    ev.stopPropagation();
    var first = sheet.querySelector('.w[data-l="' + CSS.escape(chip.dataset.l) + '"]');
    if (first) first.scrollIntoView({ block: 'center' });
    openPopup(chip.dataset.l, first, first && first.textContent);
  });
  document.getElementById('p-speak').addEventListener('click', function () {
    if (current) App.speak(DICT[current.lemma].w);
  });
  document.getElementById('p-toggle').addEventListener('click', function () {
    if (!current) return;
    Store.toggle(current.lemma);
    updateToggle();
    refreshMarks();
  });
  document.getElementById('p-close').addEventListener('click', closePopup);
  popup.addEventListener('click', function (ev) { ev.stopPropagation(); });
  document.addEventListener('click', closePopup);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closePopup(); });
  document.getElementById('print').addEventListener('click', function () { closePopup(); window.print(); });

  var prev = STORIES[index - 1];
  var next = STORIES[index + 1];
  document.getElementById('pager').innerHTML =
    (prev ? '<a class="btn" href="read.html?id=' + encodeURIComponent(prev.id) + '">← ' + esc(prev.title) + '</a>' : '<span></span>') +
    (next ? '<a class="btn" href="read.html?id=' + encodeURIComponent(next.id) + '">' + esc(next.title) + ' →</a>' : '<span></span>');

  refreshMarks();
})();
