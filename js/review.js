// Review page: black flashcards, Vietnamese first, reveal English, speak English.
(function () {
  var Store = App.Store;
  var words = Store.all();
  var i = 0;
  var revealed = false;
  var $ = function (id) { return document.getElementById(id); };

  function empty() {
    $('card').innerHTML = '<div class="empty"><p>Bạn chưa có từ nào để ôn tập.</p>' +
      '<p>Hãy mở một <a href="index.html">bài đọc</a> hoặc <a href="dictionary.html">từ điển</a>, ' +
      'rồi bấm “Chưa biết” ở những từ bạn chưa biết.</p></div>';
  }

  function show() {
    if (!words.length) { empty(); return; }
    if (i >= words.length) i = 0;
    if (i < 0) i = words.length - 1;
    var e = DICT[words[i]];
    revealed = false;
    $('counter').textContent = (i + 1) + ' / ' + words.length;
    $('vi').textContent = e.m;
    $('pos').textContent = App.posLabel(e.p);
    $('en').textContent = e.w;
    $('en').hidden = true;
    $('reveal').textContent = 'Hiện tiếng Anh';
  }

  function toggleReveal() {
    if (!words.length) return;
    revealed = !revealed;
    $('en').hidden = !revealed;
    $('reveal').textContent = revealed ? 'Ẩn tiếng Anh' : 'Hiện tiếng Anh';
  }

  function speak() { if (words.length) App.speak(DICT[words[i]].w); }

  $('reveal').addEventListener('click', toggleReveal);
  $('next').addEventListener('click', function () { i++; show(); });
  $('prev').addEventListener('click', function () { i--; show(); });
  $('speak').addEventListener('click', speak);
  $('shuffle').addEventListener('click', function () {
    for (var j = words.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = words[j]; words[j] = words[k]; words[k] = t;
    }
    i = 0; show();
  });
  $('learned').addEventListener('click', function () {
    if (!words.length) return;
    Store.remove(words[i]);
    words.splice(i, 1);
    show();
  });
  document.addEventListener('keydown', function (ev) {
    // Enter on a focused button keeps its normal click; Space always reveals.
    if (ev.key === 'Enter' && ev.target.tagName === 'BUTTON') return;
    if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); toggleReveal(); }
    else if (ev.key === 'ArrowRight') { i++; show(); }
    else if (ev.key === 'ArrowLeft') { i--; show(); }
    else if (ev.key === 's' || ev.key === 'S') speak();
  });

  show();
})();
