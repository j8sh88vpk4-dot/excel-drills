/*
 * Excel-Drills – Zellbezüge per Klick in die Formel einfügen (wie in Excel).
 * Gemeinsam für Übungs-App (app/app.js), Assessment (app/assessment.js) und Kampagne (app/campaign.js).
 *
 * Aufruf nach jedem renderSheet:
 *   ExcelDrillsSheetPick.attach({ table, input, locale, onChange, ort, texts })
 *   -> { detach(), refresh() }
 * Ein erneutes attach auf dieselbe Tabelle oder dasselbe Feld entfernt die alten Listener (detach).
 *
 * Verhalten:
 *  - Klick auf Datenzelle: Bezug (B3) an der Cursorposition einfügen, Fokus bleibt im Feld.
 *    Leeres Feld: «=» wird vorangestellt. Direkt hinter Buchstabe, Ziffer oder «)» wird nichts eingefügt.
 *    Folgt ein Klick direkt auf einen eingefügten Bezug (Feld unverändert), wird dieser ersetzt (Zeigemodus wie Excel).
 *  - Klick auf Spaltenkopf: A:A, auf Zeilennummer: 2:2. Ziehen oder Shift-Klick: Bereich B2:B7 (bzw. A:C, 2:4).
 *  - Zielzelle ist nicht wählbar (Zirkelbezug), sie wird nur kurz markiert.
 *  - Bezüge im Feld werden farbig umrandet (6 Farben, Klassen .ref-1 … .ref-6, Styles in assets/sheet-pick.css).
 *  - F4 im Feld: B3 -> $B$3 -> B$3 -> $B3 -> B3 beim Bezug unter dem Cursor.
 *
 * Die reinen Funktionen (ohne DOM) sind für scripts/test-sheet-pick.mjs exportiert.
 */
(function (root) {
  'use strict';

  var COLORS = 6;
  var DEBOUNCE_MS = 80;
  var TIP_KEY = 'excelDrillsPickTip';

  var TEXTS_DE = {
    tip: 'Tipp: Klicke eine Zelle an, um den Bezug einzufügen. Ziehen für Bereiche, F4 für $.',
    tipClose: 'Tipp ausblenden',
    target: 'Zielzelle {cell}, nicht als Bezug wählbar',
    targetPicked: 'Die Zielzelle {cell} kannst du nicht in ihre eigene Formel einfügen (Zirkelbezug).',
    refLabel: '{content}, in der Formel als {ref}',
    inserted: '{ref} eingefügt',
    refused: 'Hier fügt Excel keinen Bezug ein. Setze zuerst einen Operator, eine Klammer oder ein Trennzeichen.'
  };

  /* ---------- Reine Funktionen ---------- */

  function fill(s, params) {
    return String(s).replace(/\{(\w+)\}/g, function (m, k) { return params && params[k] !== undefined ? String(params[k]) : m; });
  }

  function colToIndex(col) {
    var s = String(col).replace(/\$/g, '').toUpperCase(), n = 0;
    for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64);
    return n - 1;
  }

  function indexToCol(i) {
    var s = '';
    i = i + 1;
    while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }

  // «B3», «$B$3» -> { col: 1, row: 2, absCol, absRow }; ungültig -> null
  function parseCell(ref) {
    var m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(String(ref || ''));
    if (!m || +m[4] < 1) return null;
    return { col: colToIndex(m[2]), row: +m[4] - 1, absCol: !!m[1], absRow: !!m[3] };
  }

  function cellName(col, row) { return indexToCol(col) + (row + 1); }

  // Argumenttrenner des Lands: englisches Excel Komma, sonst Semikolon
  function sepOf(locale) { return /^en/i.test(String(locale || '')) ? ',' : ';'; }

  // Steht pos innerhalb eines Text-Literals ("…")?
  function inString(text, pos) {
    var q = 0;
    for (var i = 0; i < pos; i++) if (text[i] === '"') q++;
    return q % 2 === 1;
  }

  /*
   * Darf an pos ein Bezug eingefügt werden? Wie Excel nur nach einem Operator, «(», Trenner, Leerzeichen
   * oder «=», nicht hinter Buchstabe, Ziffer, «)», «$», «.» und nicht in einem Text-Literal.
   * Leeres Feld (nur Leerzeichen) ist erlaubt, dort kommt «=» davor.
   */
  function canInsertAt(text, pos, locale) {
    text = String(text || '');
    if (!text.trim()) return true;
    if (pos <= 0) return false;
    if (inString(text, pos)) return false;
    var ch = text[pos - 1];
    var allowed = '=+-*/^&(<>: {' + sepOf(locale);
    return allowed.indexOf(ch) !== -1;
  }

  // Ergebnis: { value, start, end, cursor } mit Lage des Bezugs im neuen Text
  function replaceRange(text, start, end, ref) {
    text = String(text || '');
    var v = text.slice(0, start) + ref + text.slice(end);
    return { ok: true, value: v, start: start, end: start + ref.length, cursor: start + ref.length };
  }

  /*
   * Bezug an der Auswahl [start, end] einfügen. Leeres Feld -> «=» + Bezug.
   * Nicht erlaubte Position -> { ok: false, value: text } (unverändert).
   */
  function insertRef(text, start, end, ref, locale) {
    text = String(text || '');
    if (start == null) start = text.length;
    if (end == null || end < start) end = start;
    if (!text.trim()) return replaceRange('=', 1, 1, ref);
    if (!canInsertAt(text, start, locale)) return { ok: false, value: text, start: start, end: start, cursor: start };
    return replaceRange(text, start, end, ref);
  }

  // Bereich aus zwei Zellen, sortiert: (C5, A2) -> «A2:C5»; gleiche Zelle -> «A2»
  function rangeRef(a, b) {
    var p = parseCell(a), q = parseCell(b);
    if (!p || !q) return null;
    var c1 = Math.min(p.col, q.col), c2 = Math.max(p.col, q.col);
    var r1 = Math.min(p.row, q.row), r2 = Math.max(p.row, q.row);
    var s = cellName(c1, r1), e = cellName(c2, r2);
    return s === e ? s : s + ':' + e;
  }

  // Spaltenbereich (Index 0-basiert): (0, 2) -> «A:C», (1, 1) -> «B:B»
  function colRef(a, b) { return indexToCol(Math.min(a, b)) + ':' + indexToCol(Math.max(a, b)); }
  // Zeilenbereich (Index 0-basiert): (1, 1) -> «2:2»
  function rowRef(a, b) { return (Math.min(a, b) + 1) + ':' + (Math.max(a, b) + 1); }

  // F4-Zyklus einer Zelle: B3 -> $B$3 -> B$3 -> $B3 -> B3
  function cycleCell(ref) {
    var m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(ref);
    if (!m) return ref;
    var c = m[2], r = m[4], ac = !!m[1], ar = !!m[3];
    if (!ac && !ar) return '$' + c + '$' + r;
    if (ac && ar) return c + '$' + r;
    if (!ac && ar) return '$' + c + r;
    return c + r;
  }

  // Ganze Spalte/Zeile: A -> $A -> A (Excel zeigt nur diese zwei Formen)
  function cyclePart(p) { return p.charAt(0) === '$' ? p.slice(1) : '$' + p; }

  // F4 auf einen ganzen Bezug (Zelle, Bereich, Spalten- oder Zeilenbereich). Bereiche: beide Teile im Gleichschritt.
  function cycleRef(ref) {
    ref = String(ref);
    var parts = ref.split(':');
    if (parts.length === 1) return cycleCell(ref);
    if (parts.length !== 2) return ref;
    if (parseCell(parts[0]) && parseCell(parts[1])) {
      // Zustand des ersten Teils bestimmt den nächsten Zustand für beide
      var next = cycleCell(parts[0]);
      var p = parseCell(next), q = parseCell(parts[1]);
      var second = (p.absCol ? '$' : '') + indexToCol(q.col) + (p.absRow ? '$' : '') + (q.row + 1);
      return next + ':' + second;
    }
    var toggled = cyclePart(parts[0]);
    var abs = toggled.charAt(0) === '$';
    var b = parts[1].replace(/^\$/, '');
    return toggled + ':' + (abs ? '$' + b : b);
  }

  /*
   * Bezüge im Formeltext finden (ausserhalb von Text-Literals, keine Funktionsnamen wie LOG10( ).
   * Rückgabe: [{ start, end, text, kind: 'cell'|'range'|'col'|'row', c1, r1, c2, r2, color }]
   * c/r 0-basiert; bei 'col' sind r1/r2 null, bei 'row' c1/c2 null. color 1..6 pro eindeutigem Bezug.
   */
  var REF_RE = /(\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?)|(\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3})|(\$?\d+:\$?\d+)/g;

  function maskStrings(text) {
    var out = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '"') { q = !q; out += ch; } else out += q ? ' ' : ch;
    }
    return out;
  }

  function findRefs(text) {
    text = String(text || '');
    var masked = maskStrings(text);
    var res = [], colors = {}, nextColor = 0, m;
    REF_RE.lastIndex = 0;
    while ((m = REF_RE.exec(masked)) !== null) {
      var s = m.index, t = m[0], e = s + t.length;
      var before = masked[s - 1] || '', after = masked[e] || '';
      // Teil eines Namens, einer Zahl oder Funktion (SUMME, LOG10(, Tabelle1!) -> überspringen
      if (/[A-Za-z0-9_.$!]/.test(before) || /[A-Za-z0-9_.(!]/.test(after)) {
        if (t.length > 1) REF_RE.lastIndex = s + 1;
        continue;
      }
      var item = { start: s, end: e, text: text.slice(s, e) };
      if (m[1]) {
        var parts = t.split(':');
        var p = parseCell(parts[0]), q = parts[1] ? parseCell(parts[1]) : p;
        if (!p || !q) continue;
        item.kind = parts[1] ? 'range' : 'cell';
        item.c1 = Math.min(p.col, q.col); item.c2 = Math.max(p.col, q.col);
        item.r1 = Math.min(p.row, q.row); item.r2 = Math.max(p.row, q.row);
      } else if (m[2]) {
        var cs = t.split(':');
        var a = colToIndex(cs[0]), b = colToIndex(cs[1]);
        item.kind = 'col'; item.c1 = Math.min(a, b); item.c2 = Math.max(a, b); item.r1 = null; item.r2 = null;
      } else {
        var rs = t.replace(/\$/g, '').split(':');
        var x = +rs[0] - 1, y = +rs[1] - 1;
        if (x < 0 || y < 0) continue;
        item.kind = 'row'; item.r1 = Math.min(x, y); item.r2 = Math.max(x, y); item.c1 = null; item.c2 = null;
      }
      var key = item.text.replace(/\$/g, '').toUpperCase();
      if (!colors[key]) colors[key] = (nextColor++ % COLORS) + 1;
      item.color = colors[key];
      res.push(item);
    }
    return res;
  }

  // Bezug, in dem pos liegt oder an dessen Ende der Cursor steht
  function refAt(text, pos) {
    var refs = findRefs(text);
    for (var i = 0; i < refs.length; i++) if (pos >= refs[i].start && pos <= refs[i].end) return refs[i];
    return null;
  }

  // F4 an Cursorposition: { value, start, end, cursor } oder null, wenn dort kein Bezug steht
  function toggleAbsAt(text, pos) {
    text = String(text || '');
    var r = refAt(text, pos);
    if (!r) return null;
    return replaceRange(text, r.start, r.end, cycleRef(r.text));
  }

  /* ---------- DOM ---------- */

  var active = [];          // laufende Anbindungen
  var trackedPick = false;  // Plausible: nur das erste Einfügen pro Seite

  function storageGet(k) { try { return root.localStorage ? root.localStorage.getItem(k) : null; } catch (e) { return null; } }
  function storageSet(k, v) { try { if (root.localStorage) root.localStorage.setItem(k, v); } catch (e) { /* ignorieren */ } }

  function attach(opts) {
    opts = opts || {};
    var table = opts.table, input = opts.input;
    if (!table || !input || typeof document === 'undefined') return { detach: function () {}, refresh: function () {} };
    // Alte Anbindung an dieselbe Tabelle oder dasselbe Feld lösen
    active.slice().forEach(function (a) { if (a.table === table || a.input === input) a.detach(); });

    var texts = {};
    Object.keys(TEXTS_DE).forEach(function (k) { texts[k] = opts.texts && typeof opts.texts[k] === 'string' ? opts.texts[k] : TEXTS_DE[k]; });
    var locale = opts.locale || 'de-CH';
    var getLocale = typeof locale === 'function' ? locale : function () { return locale; };
    var ort = opts.ort || 'app';
    var listeners = [];
    var timer = null;
    var drag = null;          // { kind, anchor, start, end } während Ziehen
    var lastPick = null;      // { start, end, value, kind, anchor } letzter eingefügter Bezug (Zeigemodus)
    var lastSel = null;       // { start, end, value } letzte bekannte Auswahl im Feld
    var marked = [];
    var grid = [];            // grid[r][c] = td
    var colHeads = [], rowHeads = [];
    var target = null;

    function on(node, type, fn, o) { node.addEventListener(type, fn, o); listeners.push([node, type, fn, o]); }

    // Tabelle einlesen: Datenzellen mit Koordinaten, Kopfzellen, Zielzelle
    function scan() {
      grid = []; colHeads = []; rowHeads = []; target = null;
      var head = table.tHead && table.tHead.rows[0];
      if (head) {
        for (var i = 1; i < head.cells.length; i++) {
          var th = head.cells[i];
          th.setAttribute('data-pick-col', String(i - 1));
          colHeads[i - 1] = th;
        }
      }
      var body = table.tBodies[0];
      if (!body) return;
      Array.prototype.forEach.call(body.rows, function (tr, r) {
        grid[r] = [];
        Array.prototype.forEach.call(tr.cells, function (cell, ci) {
          if (ci === 0 && cell.tagName === 'TH') { cell.setAttribute('data-pick-row', String(r)); rowHeads[r] = cell; return; }
          var c = ci - 1; // Spalte 0 ist die Zeilennummer
          var ref = cellName(c, r);
          cell.setAttribute('data-ref', ref);
          cell.tabIndex = -1;
          grid[r][c] = cell;
          if (cell.classList.contains('target')) {
            target = { col: c, row: r, ref: ref, td: cell };
            cell.setAttribute('aria-label', (cell.textContent && !cell.querySelector('.visually-hidden') ? cell.textContent + ', ' : '') + fill(texts.target, { cell: ref }));
            cell.setAttribute('data-pick-target', '');
          }
        });
      });
      table.classList.add('sheet-pick');
      table.setAttribute('data-sheet-pick', 'on');
    }

    function inTarget(c1, r1, c2, r2) {
      if (!target) return false;
      var cOk = c1 == null || (target.col >= c1 && target.col <= c2);
      var rOk = r1 == null || (target.row >= r1 && target.row <= r2);
      return cOk && rOk;
    }

    function flash(node, cls) {
      if (!node) return;
      node.classList.remove(cls);
      void node.offsetWidth; // Animation neu starten
      node.classList.add(cls);
      setTimeout(function () { node.classList.remove(cls); }, 650);
    }

    function announce(msg) {
      var live = liveRegion();
      if (!live) return;
      live.textContent = '';
      setTimeout(function () { live.textContent = msg; }, 30);
    }

    // Hinweis und Live-Region unter der Tabelle (einmal pro Tabelle, bei erneutem attach wiederverwendet)
    function anchorNode() {
      var p = table.parentNode;
      return p && p.classList && p.classList.contains('grid-scroll') ? p : table;
    }
    function liveRegion() {
      var a = anchorNode(), n = a.nextElementSibling;
      while (n && n.hasAttribute && n.hasAttribute('data-pick-ui')) {
        if (n.classList.contains('sheet-pick-live')) return n;
        n = n.nextElementSibling;
      }
      var live = document.createElement('p');
      live.className = 'visually-hidden sheet-pick-live';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('data-pick-ui', '');
      a.parentNode.insertBefore(live, a.nextSibling);
      return live;
    }
    function renderTip() {
      var a = anchorNode();
      if (!a.parentNode) return;
      var existing = null, n = a.nextElementSibling;
      while (n && n.hasAttribute && n.hasAttribute('data-pick-ui')) { if (n.classList.contains('sheet-pick-tip')) existing = n; n = n.nextElementSibling; }
      if (storageGet(TIP_KEY) === 'aus') { if (existing) existing.remove(); return; }
      var tip = existing || document.createElement('p');
      tip.className = 'sheet-pick-tip';
      tip.setAttribute('data-pick-ui', '');
      while (tip.firstChild) tip.removeChild(tip.firstChild);
      var span = document.createElement('span');
      span.textContent = texts.tip;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sheet-pick-tip-close';
      btn.setAttribute('aria-label', texts.tipClose);
      btn.title = texts.tipClose;
      btn.textContent = '×';
      btn.addEventListener('click', function () { storageSet(TIP_KEY, 'aus'); tip.remove(); try { input.focus({ preventScroll: true }); } catch (e) { /* ignorieren */ } });
      tip.appendChild(span);
      tip.appendChild(btn);
      if (!existing) a.parentNode.insertBefore(tip, a.nextSibling);
    }

    /* Markierungen der Bezüge im Feld */
    function clearMarks() {
      marked.forEach(function (cell) {
        cell.classList.remove('ref-1', 'ref-2', 'ref-3', 'ref-4', 'ref-5', 'ref-6', 'ref-t', 'ref-b', 'ref-l', 'ref-r', 'ref-in');
        if (cell.hasAttribute('data-pick-label')) {
          var old = cell.getAttribute('data-pick-label');
          if (old) cell.setAttribute('aria-label', old); else cell.removeAttribute('aria-label');
          cell.removeAttribute('data-pick-label');
        }
      });
      marked = [];
    }

    function mark(cell, color, edges, label) {
      if (!cell) return;
      cell.classList.add('ref-' + color, 'ref-in');
      edges.forEach(function (e) { cell.classList.add('ref-' + e); });
      if (cell.tagName === 'TD' && label && !cell.hasAttribute('data-pick-target')) {
        if (!cell.hasAttribute('data-pick-label')) cell.setAttribute('data-pick-label', cell.getAttribute('aria-label') || '');
        cell.setAttribute('aria-label', fill(texts.refLabel, { content: cell.textContent.trim() || '-', ref: label }));
      }
      if (marked.indexOf(cell) === -1) marked.push(cell);
    }

    function highlight() {
      clearMarks();
      var rows = grid.length, cols = 0;
      grid.forEach(function (r) { cols = Math.max(cols, r.length); });
      if (!rows || !cols) return;
      findRefs(input.value).forEach(function (ref) {
        var c1 = ref.c1 == null ? 0 : ref.c1, c2 = ref.c2 == null ? cols - 1 : ref.c2;
        var r1 = ref.r1 == null ? 0 : ref.r1, r2 = ref.r2 == null ? rows - 1 : ref.r2;
        if (c1 > cols - 1 || r1 > rows - 1) return;
        var ce = Math.min(c2, cols - 1), re = Math.min(r2, rows - 1);
        for (var r = r1; r <= re; r++) {
          for (var c = c1; c <= ce; c++) {
            var edges = [];
            if (r === r1) edges.push('t');
            if (r === r2) edges.push('b');
            if (c === c1) edges.push('l');
            if (c === c2) edges.push('r');
            mark(grid[r] && grid[r][c], ref.color, edges, ref.text);
          }
        }
        // Spalten- und Zeilenköpfe ganzer Spalten/Zeilen mitfärben
        if (ref.kind === 'col') for (var hc = c1; hc <= ce; hc++) mark(colHeads[hc], ref.color, [], null);
        if (ref.kind === 'row') for (var hr = r1; hr <= re; hr++) mark(rowHeads[hr], ref.color, [], null);
      });
    }

    function scheduleHighlight() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; highlight(); }, DEBOUNCE_MS);
    }

    function rememberSel() {
      if (typeof input.selectionStart === 'number') lastSel = { start: input.selectionStart, end: input.selectionEnd, value: input.value };
    }

    // Aktuelle Auswahl im Feld; ohne Fokus die zuletzt bekannte, sonst das Ende
    function selection() {
      var focused = document.activeElement === input;
      if (focused && typeof input.selectionStart === 'number') return { start: input.selectionStart, end: input.selectionEnd };
      if (lastSel && lastSel.value === input.value) return { start: lastSel.start, end: lastSel.end };
      return { start: input.value.length, end: input.value.length };
    }

    function apply(res) {
      input.value = res.value;
      try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
      try { input.setSelectionRange(res.cursor, res.cursor); } catch (e) { /* ignorieren */ }
      rememberSel();
      // Gleicher Weg wie die Zeichenleiste: input-Ereignis, damit die Apps reagieren (aria-invalid usw.)
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (typeof opts.onChange === 'function') { try { opts.onChange(input.value); } catch (e) { /* ignorieren */ } }
      highlight();
    }

    // Bezug einfügen; replaceLast: letzten Klick-Bezug ersetzen (Ziehen, Shift-Klick, Zeigemodus)
    function pick(ref, meta) {
      var sel = selection();
      var res;
      var pointMode = lastPick && lastPick.value === input.value && sel.start === lastPick.end && sel.end === lastPick.end;
      if (pointMode) res = replaceRange(input.value, lastPick.start, lastPick.end, ref);
      else res = insertRef(input.value, sel.start, sel.end, ref, getLocale());
      if (!res.ok) return false;
      apply(res);
      lastPick = { start: res.start, end: res.end, value: input.value, kind: meta.kind, anchor: meta.anchor };
      announce(fill(texts.inserted, { ref: ref }));
      if (!trackedPick) {
        trackedPick = true;
        try { if (typeof root.ExcelDrillsTrack === 'function') root.ExcelDrillsTrack('zellklick', { ort: ort }); } catch (e) { /* ignorieren */ }
      }
      return true;
    }

    // Was liegt unter dem Zeiger? { kind: 'cell'|'col'|'row', col, row, node }
    function hit(node) {
      var cell = node && node.closest ? node.closest('td, th') : null;
      if (!cell || !table.contains(cell)) return null;
      if (cell.hasAttribute('data-ref')) { var p = parseCell(cell.getAttribute('data-ref')); return { kind: 'cell', col: p.col, row: p.row, node: cell }; }
      if (cell.hasAttribute('data-pick-col')) return { kind: 'col', col: +cell.getAttribute('data-pick-col'), node: cell };
      if (cell.hasAttribute('data-pick-row')) return { kind: 'row', row: +cell.getAttribute('data-pick-row'), node: cell };
      return null;
    }

    function refFor(anchor, h) {
      if (h.kind !== anchor.kind) return null;
      if (h.kind === 'col') return inTarget(Math.min(anchor.col, h.col), null, Math.max(anchor.col, h.col), null) ? null : colRef(anchor.col, h.col);
      if (h.kind === 'row') return inTarget(null, Math.min(anchor.row, h.row), null, Math.max(anchor.row, h.row)) ? null : rowRef(anchor.row, h.row);
      if (inTarget(Math.min(anchor.col, h.col), Math.min(anchor.row, h.row), Math.max(anchor.col, h.col), Math.max(anchor.row, h.row))) return null;
      return rangeRef(cellName(anchor.col, anchor.row), cellName(h.col, h.row));
    }

    function onMouseDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      var h = hit(e.target);
      if (!h) return;
      if (input.disabled || input.readOnly) return;
      e.preventDefault(); // Fokus bleibt im Formelfeld, keine Textauswahl
      if (h.kind === 'cell' && target && h.col === target.col && h.row === target.row) {
        flash(h.node, 'pick-target-flash');
        announce(fill(texts.targetPicked, { cell: target.ref }));
        return;
      }
      var sel = selection();
      var pointMode = lastPick && lastPick.value === input.value && sel.start === lastPick.end && sel.end === lastPick.end;
      // Shift-Klick: Bereich vom Anker des letzten Bezugs bis hier
      if (e.shiftKey && pointMode && lastPick.anchor && lastPick.kind === h.kind) {
        var ref = refFor(lastPick.anchor, h);
        if (ref) pick(ref, { kind: h.kind, anchor: lastPick.anchor });
        return;
      }
      var anchor = { kind: h.kind, col: h.col, row: h.row };
      var first = refFor(anchor, h);
      if (!first) return;
      if (!pick(first, { kind: h.kind, anchor: anchor })) {
        flash(h.node, 'pick-refused');
        flash(input, 'pick-refused');
        announce(texts.refused);
        return;
      }
      drag = { anchor: anchor, last: first };
      table.classList.add('sheet-pick-dragging');
    }

    function onMouseOver(e) {
      if (!drag) return;
      var h = hit(e.target);
      if (!h) return;
      var ref = refFor(drag.anchor, h);
      if (!ref || ref === drag.last) return;
      // Nur ersetzen, solange das Feld seit dem Einfügen unverändert ist
      if (!lastPick || lastPick.value !== input.value) { drag = null; return; }
      replaceLastPick(ref);
      drag.last = ref;
    }

    function replaceLastPick(ref) {
      var res = replaceRange(input.value, lastPick.start, lastPick.end, ref);
      apply(res);
      lastPick = { start: res.start, end: res.end, value: input.value, kind: lastPick.kind, anchor: lastPick.anchor };
    }

    function onMouseUp() {
      if (!drag) return;
      if (drag.last.indexOf(':') !== -1) announce(fill(texts.inserted, { ref: drag.last }));
      drag = null;
      table.classList.remove('sheet-pick-dragging');
    }

    function onKeyDown(e) {
      if (e.key !== 'F4' || e.altKey || e.ctrlKey || e.metaKey) return;
      var pos = typeof input.selectionStart === 'number' ? input.selectionStart : input.value.length;
      var res = toggleAbsAt(input.value, pos);
      if (!res) return;
      e.preventDefault();
      var keepPoint = lastPick && lastPick.value === input.value;
      apply(res);
      if (keepPoint) lastPick = null; // nach F4 nicht mehr im Zeigemodus
      announce(fill(texts.inserted, { ref: res.value.slice(res.start, res.end) }));
    }

    function onFieldActivity() { rememberSel(); scheduleHighlight(); }

    scan();
    renderTip();
    on(table, 'mousedown', onMouseDown);
    on(table, 'mouseover', onMouseOver);
    on(document, 'mouseup', onMouseUp);
    on(input, 'keydown', onKeyDown);
    on(input, 'input', onFieldActivity);
    on(input, 'keyup', onFieldActivity);
    on(input, 'click', onFieldActivity);
    on(input, 'select', rememberSel);
    on(input, 'blur', rememberSel);
    highlight();

    var handle = {
      table: table,
      input: input,
      refresh: highlight,
      detach: function () {
        listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
        listeners = [];
        if (timer) clearTimeout(timer);
        clearMarks();
        drag = null;
        table.classList.remove('sheet-pick', 'sheet-pick-dragging');
        table.removeAttribute('data-sheet-pick');
        var i = active.indexOf(handle);
        if (i !== -1) active.splice(i, 1);
      }
    };
    active.push(handle);
    return handle;
  }

  root.ExcelDrillsSheetPick = {
    attach: attach,
    texts: TEXTS_DE,
    // reine Funktionen (Tests)
    colToIndex: colToIndex,
    indexToCol: indexToCol,
    parseCell: parseCell,
    canInsertAt: canInsertAt,
    insertRef: insertRef,
    replaceRange: replaceRange,
    rangeRef: rangeRef,
    colRef: colRef,
    rowRef: rowRef,
    cycleRef: cycleRef,
    findRefs: findRefs,
    refAt: refAt,
    toggleAbsAt: toggleAbsAt
  };
})(typeof window !== 'undefined' ? window : globalThis);
