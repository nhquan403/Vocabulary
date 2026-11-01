// Resolve an English token (as it appears in a text) to a dictionary headword.
// Shared by the browser pages and the Node build script.
(function (root) {
  var VOWELS = 'aeiou';

  function candidates(w) {
    var c = [];
    var n = w.length;
    function add(x) { if (x && x.length > 0) c.push(x); }
    function undouble(stem) {
      var l = stem.length;
      if (l > 2 && stem[l - 1] === stem[l - 2] && VOWELS.indexOf(stem[l - 1]) < 0) return stem.slice(0, -1);
      return null;
    }
    if (/ies$/.test(w)) add(w.slice(0, -3) + 'y');
    if (/ves$/.test(w)) { add(w.slice(0, -3) + 'f'); add(w.slice(0, -3) + 'fe'); }
    if (/es$/.test(w)) add(w.slice(0, -2));
    if (/s$/.test(w) && !/ss$/.test(w)) add(w.slice(0, -1));
    if (/ied$/.test(w)) add(w.slice(0, -3) + 'y');
    if (/ed$/.test(w)) {
      var s = w.slice(0, -2);
      add(s); add(s + 'e'); add(undouble(s));
    }
    if (/ing$/.test(w) && n > 4) {
      var g = w.slice(0, -3);
      if (/y$/.test(g) && g.length <= 2) add(g.slice(0, -1) + 'ie'); // dying -> die, lying -> lie
      add(g); add(g + 'e'); add(undouble(g));
    }
    if (/ier$/.test(w)) add(w.slice(0, -3) + 'y');
    if (/iest$/.test(w)) add(w.slice(0, -4) + 'y');
    if (/er$/.test(w)) { var e = w.slice(0, -2); add(e); add(e + 'e'); add(undouble(e)); }
    if (/est$/.test(w)) { var t = w.slice(0, -3); add(t); add(t + 'e'); add(undouble(t)); }
    if (/ily$/.test(w)) add(w.slice(0, -3) + 'y');
    if (/ly$/.test(w)) { add(w.slice(0, -2)); add(w.slice(0, -2) + 'le'); }
    return c;
  }

  // dict: object keyed by lowercase headword; irr: object form -> headword
  function lemma(token, dict, irr) {
    var w = token.toLowerCase().replace(/[’]/g, "'");
    if (dict[w]) return w;
    if (irr[w] && dict[irr[w]]) return irr[w];
    // possessive
    if (/'s$/.test(w) || /s'$/.test(w)) {
      var base = /'s$/.test(w) ? w.slice(0, -2) : w.slice(0, -1);
      var r = lemma(base, dict, irr);
      if (r) return r;
    }
    var found = [];
    candidates(w).forEach(function (c) {
      if (dict[c]) found.push(c);
      else if (irr[c] && dict[irr[c]]) found.push(irr[c]);
    });
    if (!found.length) return null;
    // "-ing"/"-ed" forms come from verbs: prefer "use" over "us", "shine" over "shin".
    if (/(ing|ed)$/.test(w)) {
      for (var i = 0; i < found.length; i++) {
        if (/(^|\/)(v|modal)(\/|$)/.test(dict[found[i]].p)) return found[i];
      }
    }
    return found[0];
  }

  var TOKEN_RE = /[A-Za-z]+(?:['’][A-Za-z]+)?/g;

  var api = { lemma: lemma, TOKEN_RE: TOKEN_RE };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Lemma = api;
})(this);
