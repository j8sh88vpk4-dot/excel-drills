/* Excel-Drills – Rollen-Assessment (Vanilla JS). Ablauf: Start, Timer, 5 Aufgaben, Auswertung, 7-Tage-Plan, Share-Bild.
 * Prüflogik: app/engine.js (window.ExcelDrillsEngine), Fehlerkategorien: app/errors.js (window.ExcelDrillsErrors).
 * Inhalte: app/assessments.json, Übungen für den Plan: app/exercises.json. Sprache: DE-CH. */
(function () {
  'use strict';

  var E = window.ExcelDrillsEngine;
  var ERR = window.ExcelDrillsErrors;
  var Keys = window.ExcelDrillsKeys;
  var HF = null;

  var STORAGE_RESULTS = 'excelDrillsAssessments'; // { <id>: { best, last, date } }
  var STORAGE_KEY = 'excelDrillsKey';             // Premium-Code (wie app/app.js)
  var BASE = '../app/';
  var MAX_ATTEMPTS = 2;
  var POINTS_FIRST = 20, POINTS_SECOND = 10;
  var SITE = 'excel-drills.ch';

  var assessments = [], exercises = {}, current = null;
  var state = null;   // { index, tasks: [{ attempts, ok, points, formula, result, diag, done }], endsAt, timer, finished }

  function $(id) { return document.getElementById(id); }
  var els = {};

  /* ---------- Hilfen ---------- */

  function track(name, props) {
    try { if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack(name, props); } catch (e) { /* ignorieren */ }
  }
  function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* privater Modus */ } }
  function loadResults() {
    try { var o = JSON.parse(storageGet(STORAGE_RESULTS) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function saveResult(id, pct) {
    var all = loadResults(), prev = all[id] || {};
    all[id] = { best: Math.max(typeof prev.best === 'number' ? prev.best : 0, pct), last: pct, date: new Date().toISOString().slice(0, 10) };
    storageSet(STORAGE_RESULTS, JSON.stringify(all));
    return all[id];
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function fmtTime(sec) {
    sec = Math.max(0, Math.ceil(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  function hasPremium() {
    try { return !!(Keys && Keys.isValid(storageGet(STORAGE_KEY))); } catch (e) { return false; }
  }
  function notice(msg, err) {
    els.notice.textContent = msg;
    els.notice.className = 'notice' + (err ? ' err' : '');
    els.notice.hidden = !msg;
  }

  // Einstufung nach Gesamtprozent
  function levelOf(pct) {
    if (pct >= 90) return 'Sehr sicher';
    if (pct >= 70) return 'Bereit';
    if (pct >= 40) return 'Fast bereit';
    return 'Grundlagen festigen';
  }
  function levelText(pct) {
    if (pct >= 90) return 'Du rechnest sicher und sauber. So gehst du entspannt in ein Excel-Assessment.';
    if (pct >= 70) return 'Du bist bereit für ein Excel-Assessment. Mit den Übungen unten machst du die letzten Lücken zu.';
    if (pct >= 40) return 'Die Basis sitzt, einzelne Kategorien wackeln noch. Eine Woche gezielt üben reicht oft.';
    return 'Festige zuerst die Grundlagen. Der 7-Tage-Plan unten zeigt dir, womit du anfängst.';
  }

  /* ---------- Rollenwahl ---------- */

  function roleFromUrl() {
    var p = new URLSearchParams(window.location.search);
    return (p.get('rolle') || '').toLowerCase();
  }
  function byId(id) { return assessments.filter(function (a) { return a.id === id; })[0] || null; }

  function selectRole(id, opts) {
    opts = opts || {};
    var as = byId(id);
    Array.prototype.forEach.call(document.querySelectorAll('[data-rolle]'), function (a) {
      if (a.getAttribute('data-rolle') === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (!as) { els.app.hidden = true; return; }
    current = as;
    if (opts.push) {
      try { window.history.pushState(null, '', '?rolle=' + encodeURIComponent(id)); } catch (e) { /* ignorieren */ }
    }
    showStart();
    if (opts.scroll) els.start.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (opts.focus) els.startTitle.focus({ preventScroll: true });
  }

  /* ---------- Start-Screen ---------- */

  function showStart() {
    stopTimer();
    state = null;
    els.app.hidden = false;
    els.start.hidden = false;
    els.run.hidden = true;
    els.result.hidden = true;
    els.intro.hidden = false;

    els.startRole.textContent = current.role;
    els.startTitle.textContent = current.title;
    els.startIntro.textContent = current.intro;
    els.startMeta.textContent = current.tasks.length + ' Aufgaben · ' + current.minutes + ' Minuten · ' + (current.tasks.length * POINTS_FIRST) + ' Punkte';
    var prev = loadResults()[current.id];
    if (prev && typeof prev.best === 'number') {
      els.startPrev.textContent = 'Dein bisher bestes Ergebnis: ' + prev.best + ' % (' + levelOf(prev.best) + '), zuletzt ' + prev.last + ' %.';
      els.startPrev.hidden = false;
    } else els.startPrev.hidden = true;

    var locked = current.free === false && !hasPremium();
    els.startBtn.hidden = locked;
    els.startLocked.hidden = !locked;
    els.startBtn.disabled = !HF;
    els.startBtnNote.hidden = !!HF;
  }

  /* ---------- Ablauf ---------- */

  function startTest() {
    if (!current || !HF) return;
    state = {
      index: 0,
      finished: false,
      endsAt: Date.now() + current.minutes * 60 * 1000,
      tasks: current.tasks.map(function () { return { attempts: 0, ok: false, points: 0, formula: '', result: null, done: false }; })
    };
    els.intro.hidden = true;
    els.start.hidden = true;
    els.result.hidden = true;
    els.run.hidden = false;
    track('assessment_start', { rolle: current.id });
    startTimer();
    showTask(0);
    els.run.scrollIntoView({ block: 'start' });
  }

  function startTimer() {
    stopTimer();
    tick();
    state.timer = window.setInterval(tick, 1000);
  }
  function stopTimer() {
    if (state && state.timer) { window.clearInterval(state.timer); state.timer = null; }
  }
  function tick() {
    if (!state || state.finished) return;
    var left = (state.endsAt - Date.now()) / 1000;
    els.timerValue.textContent = fmtTime(left);
    els.timer.classList.toggle('warn', left <= 120 && left > 30);
    els.timer.classList.toggle('alarm', left <= 30);
    // Ansage für Screenreader nur an wichtigen Punkten, nicht jede Sekunde
    var whole = Math.ceil(left);
    if (whole === 300 || whole === 60 || whole === 10) els.timerSr.textContent = 'Noch ' + fmtTime(whole) + ' Minuten.';
    if (left <= 0) { els.timerSr.textContent = 'Die Zeit ist abgelaufen.'; finish(true); }
  }

  function task() { return current.tasks[state.index]; }
  function taskState() { return state.tasks[state.index]; }

  function showTask(i) {
    state.index = i;
    var ex = task(), ts = taskState();
    els.progress.textContent = 'Aufgabe ' + (i + 1) + ' von ' + current.tasks.length;
    els.progressBar.style.width = ((i) / current.tasks.length * 100) + '%';
    els.taskTag.textContent = ex.topic || ERR.label(ex.category);
    els.taskTitle.textContent = ex.title;
    els.taskText.textContent = ex.task;
    els.input.value = ts.formula || '';
    els.input.disabled = false;
    els.input.removeAttribute('aria-invalid');
    els.checkBtn.disabled = false;
    els.checkBtn.hidden = false;
    els.skipBtn.hidden = false;
    els.nextBtn.hidden = true;
    els.attempts.textContent = 'Versuch 1 von ' + MAX_ATTEMPTS;
    setFeedback('', '');
    renderSheet(ex);
    els.taskTitle.focus({ preventScroll: true });
  }

  // Schlanke Tabellen-Darstellung (wie renderSheet in app.js): Spalten A, B, ..., Zeilennummern, Zielzelle markiert
  function renderSheet(ex, resultValue) {
    var data = E.normalizeData(ex.data, ex.target);
    var t = E.parseA1(ex.target);
    var table = els.sheet;
    clear(table);
    var cap = el('caption', 'visually-hidden', 'Tabelle zu «' + ex.title + '», Zielzelle ' + ex.target);
    table.appendChild(cap);
    var thead = el('thead'), hr = el('tr');
    var corner = el('th');
    corner.scope = 'col';
    corner.appendChild(el('span', 'visually-hidden', 'Zeile'));
    hr.appendChild(corner);
    for (var c = 0; c < data[0].length; c++) {
      var th = el('th', null, E.indexToCol(c));
      th.scope = 'col';
      hr.appendChild(th);
    }
    thead.appendChild(hr);
    var tbody = el('tbody');
    data.forEach(function (row, r) {
      var tr = el('tr', r === 0 ? 'header-row' : null);
      var rh = el('th', null, String(r + 1));
      rh.scope = 'row';
      tr.appendChild(rh);
      row.forEach(function (v, ci) {
        var td = el('td');
        if (r === t.row && ci === t.col) {
          td.className = 'target' + (resultValue !== undefined ? ' solved' : '');
          if (resultValue !== undefined) {
            td.textContent = E.formatValue(resultValue);
            if (typeof resultValue === 'number') td.classList.add('num');
          } else td.appendChild(el('span', 'visually-hidden', 'Zielzelle ' + ex.target + ', leer'));
        } else {
          td.textContent = E.formatValue(v);
          if (typeof v === 'number') td.classList.add('num');
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
  }

  function setFeedback(kind, text, extra) {
    els.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
    clear(els.feedback);
    if (!text) return;
    els.feedback.appendChild(el('p', null, text));
    if (extra) els.feedback.appendChild(el('p', 'fine', extra));
  }

  function onCheck(e) {
    e.preventDefault();
    if (!state || state.finished) return;
    var ex = task(), ts = taskState();
    if (ts.done) return;
    var f = els.input.value;
    var r;
    try { r = E.check(HF, ex, f); } catch (err) {
      if (window.console) console.error(err);
      r = { ok: false, message: (E.MSG && E.MSG.genericFallback) || 'Prüfe deine Formel.' };
    }
    // Leere Eingabe zählt nicht als Versuch
    if (!r.ok && !String(f).trim()) { setFeedback('err', r.message); els.input.focus(); return; }
    ts.attempts++;
    ts.formula = f;
    ts.result = r;
    if (r.ok) {
      ts.ok = true;
      ts.done = true;
      ts.points = ts.attempts === 1 ? POINTS_FIRST : POINTS_SECOND;
      renderSheet(ex, r.value);
      setFeedback('ok', 'Richtig! +' + ts.points + ' Punkte.', r.tip || null);
      endTask();
      return;
    }
    els.input.setAttribute('aria-invalid', 'true');
    if (ts.attempts >= MAX_ATTEMPTS) {
      ts.done = true;
      setFeedback('err', r.message, 'Kein Versuch mehr. In der Auswertung siehst du die Musterlösung.');
      endTask();
    } else {
      els.attempts.textContent = 'Versuch 2 von ' + MAX_ATTEMPTS + ' (gibt noch ' + POINTS_SECOND + ' Punkte)';
      setFeedback('err', r.message, 'Du hast noch einen Versuch.');
      els.input.focus();
    }
  }

  function endTask() {
    els.input.disabled = true;
    els.checkBtn.hidden = true;
    els.skipBtn.hidden = true;
    els.nextBtn.hidden = false;
    els.nextBtn.textContent = state.index < current.tasks.length - 1 ? 'Nächste Aufgabe →' : 'Zur Auswertung →';
    els.nextBtn.focus();
  }

  function onSkip() {
    if (!state || state.finished) return;
    var ts = taskState();
    ts.done = true;
    ts.formula = els.input.value;
    next();
  }

  function next() {
    if (state.index < current.tasks.length - 1) showTask(state.index + 1);
    else finish(false);
  }

  /* ---------- Auswertung ---------- */

  function finish(timeUp) {
    if (!state || state.finished) return;
    state.finished = true;
    stopTimer();
    var total = current.tasks.length * POINTS_FIRST;
    var points = state.tasks.reduce(function (s, t) { return s + t.points; }, 0);
    var pct = Math.round(points / total * 100);
    var level = levelOf(pct);
    state.points = points; state.pct = pct; state.level = level;
    saveResult(current.id, pct);
    track('assessment_done', { rolle: current.id, punkte: points });

    els.run.hidden = true;
    els.result.hidden = false;
    els.intro.hidden = false;
    els.resTimeUp.hidden = !timeUp;
    els.resScore.textContent = pct + ' %';
    els.resLevel.textContent = level;
    els.resLevel.setAttribute('data-level', level);
    els.resPoints.textContent = points + ' von ' + total + ' Punkten · ' + levelText(pct);
    renderDiagnosis();
    renderPlan();
    renderShare();
    mountInterview(points);
    els.resTitle.focus({ preventScroll: true });
    els.result.scrollIntoView({ block: 'start' });
  }

  // KI-Interviewerin (app/interview.js): nur wenn geladen; Premium-Prüfung macht die Komponente selbst.
  function mountInterview(points) {
    var box = document.getElementById('as-interview-mount');
    var IV = window.ExcelDrillsInterview;
    if (!box || !IV || typeof IV.mount !== 'function') return;
    while (box.firstChild) box.removeChild(box.firstChild);
    try {
      IV.mount(box, {
        role: current.id,
        assessment: current.title,
        score: points,
        answersSummary: diagnoses().map(function (d, i) {
          return { aufgabe: d.ex.title, ok: d.ts.ok, punkte: d.ts.points, formel: d.ts.formula,
                   ergebnis: d.ts.result && d.ts.result.value, fehler: d.ts.ok ? null : d.diag.label };
        })
      });
    } catch (e) { /* Interview ist optional */ }
  }

  function diagnoses() {
    return current.tasks.map(function (ex, i) {
      var ts = state.tasks[i];
      var d = ERR.classify(ts.result && ts.attempts ? ts.result : null, ts.formula, ex);
      return { ex: ex, ts: ts, diag: d };
    });
  }

  function renderDiagnosis() {
    var list = els.resDiag;
    clear(list);
    diagnoses().forEach(function (item, i) {
      var li = el('li', 'diag-item ' + (item.ts.ok ? 'is-ok' : 'is-err'));
      var head = el('p', 'diag-head');
      head.appendChild(el('span', 'diag-status', item.ts.ok ? 'Richtig' : 'Falsch'));
      head.appendChild(document.createTextNode(' Aufgabe ' + (i + 1) + ': ' + item.ex.title));
      li.appendChild(head);
      var meta = el('p', 'diag-meta', 'Kategorie: ' + ERR.label(item.ex.category) + ' · ' + item.ts.points + ' Punkte');
      li.appendChild(meta);
      if (!item.ts.ok) {
        if (item.diag.category !== item.ex.category) li.appendChild(el('p', 'diag-meta', 'Fehlerart: ' + item.diag.label));
        li.appendChild(el('p', 'diag-tip', item.diag.tip));
        if (item.ts.formula) {
          var yours = el('p', 'diag-formula');
          yours.appendChild(document.createTextNode('Deine Formel: '));
          yours.appendChild(el('code', null, item.ts.formula));
          li.appendChild(yours);
        }
        var sol = el('p', 'diag-formula');
        sol.appendChild(document.createTextNode('Musterlösung: '));
        sol.appendChild(el('code', null, item.ex.solution));
        li.appendChild(sol);
      }
      list.appendChild(li);
    });
  }

  // Schwache Kategorien: Kategorie jeder falschen Aufgabe, dazu die erkannte Fehlerart (z. B. Syntax in einer SUMMEWENN-Aufgabe)
  function weakCategories() {
    var cats = [];
    diagnoses().forEach(function (item) {
      if (item.ts.ok) return;
      [item.ex.category, item.diag.category].forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });
    });
    return cats;
  }

  function planItems(cats) {
    var lists = cats.map(function (c) {
      var ids = (current.categories && current.categories[c] && current.categories[c].exercises) || [];
      return ids.filter(function (id) { return exercises[id] && exercises[id].free; }).map(function (id) { return { id: id, cat: c }; });
    });
    // Reihum aus jeder Kategorie eine Übung, doppelte Übungen nur einmal
    var out = [], seen = {}, more = true;
    for (var round = 0; more; round++) {
      more = false;
      lists.forEach(function (l) {
        if (round < l.length) { more = true; if (!seen[l[round].id]) { seen[l[round].id] = true; out.push(l[round]); } }
      });
    }
    return out;
  }

  function exLink(item, again) {
    var ex = exercises[item.id];
    var a = el('a', null, ex.title);
    a.href = BASE + '#' + encodeURIComponent(item.id);
    var span = el('span');
    span.appendChild(a);
    span.appendChild(document.createTextNode(' (' + ERR.label(item.cat) + (again ? ', nochmal mit anderen Zahlen' : '') + ')'));
    return span;
  }

  function renderPlan() {
    var box = els.resPlan;
    clear(box);
    var cats = weakCategories();
    if (!cats.length) {
      box.appendChild(el('p', null, 'Kein Fehler, stark! Für dich gibt es keinen Lückenplan. Als nächsten Schritt empfehlen wir dir den Pfad mit den Premium-Aufgaben deiner Rolle.'));
      var p = el('p');
      var a = el('a', 'btn', 'Weiter zum Pfad ' + current.role);
      a.href = BASE + '?pfad=' + encodeURIComponent(current.nextTrack || current.id);
      p.appendChild(a);
      box.appendChild(p);
      return;
    }
    box.appendChild(el('p', null, 'Jeden Tag 10 bis 15 Minuten, passend zu deinen Lücken: ' + cats.map(ERR.label).join(', ') + '. Alle Übungen sind gratis.'));
    var items = planItems(cats);
    var ol = el('ol', 'plan-days');
    for (var d = 0; d < 6; d++) {
      var li = el('li');
      li.appendChild(el('strong', null, 'Tag ' + (d + 1) + ': '));
      if (items.length) {
        // Weniger als 6 Übungen: ab der zweiten Runde dieselbe Übung mit anderen Zahlen wiederholen
        var perDay = Math.max(1, Math.ceil(items.length / 6));
        for (var k = 0; k < perDay; k++) {
          var idx = d * perDay + k;
          var again = idx >= items.length;
          if (again && perDay > 1) break;
          if (k) li.appendChild(document.createTextNode(' · '));
          li.appendChild(exLink(items[idx % items.length], again));
        }
      }
      ol.appendChild(li);
    }
    var last = el('li');
    last.appendChild(el('strong', null, 'Tag 7: '));
    var again = el('a', null, 'Assessment wiederholen');
    again.href = '?rolle=' + encodeURIComponent(current.id);
    last.appendChild(again);
    last.appendChild(document.createTextNode(' und das Ergebnis mit heute vergleichen.'));
    ol.appendChild(last);
    box.appendChild(ol);
  }

  /* ---------- Teilen: Canvas 1080×1080 ---------- */

  function shareText() {
    return current.title + ': ' + state.pct + ' % · ' + state.level + ' · ' + SITE;
  }

  function cssVar(name, fallback) {
    try { var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fallback; } catch (e) { return fallback; }
  }

  function drawCard() {
    var c = els.canvas, ctx = c.getContext('2d');
    if (!ctx) return null;
    var W = 1080, H = 1080;
    c.width = W; c.height = H;
    var font = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    // Feste Markenfarben (unabhängig vom Dark Mode, damit das Bild überall gleich aussieht)
    var green = '#107C41', dark = '#0b5c30', soft = '#e7f3ec';
    ctx.fillStyle = green;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = dark;
    ctx.fillRect(0, H - 150, W, 150);
    // Logo
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 80, 80, 96, 96, 18); ctx.fill();
    ctx.fillStyle = green;
    ctx.font = '700 64px ' + font;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('X', 128, 132);
    ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff';
    ctx.font = '700 44px ' + font;
    ctx.fillText('Excel-Drills', 200, 130);
    // Titel
    ctx.fillStyle = soft;
    ctx.font = '600 52px ' + font;
    ctx.fillText('Excel-Assessment', 80, 330);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 92px ' + font;
    ctx.fillText(current.role, 80, 430);
    // Ergebnis
    ctx.font = '800 260px ' + font;
    ctx.fillText(state.pct + ' %', 70, 650);
    ctx.font = '700 72px ' + font;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, 80, 760, ctx.measureText(state.level).width + 80, 110, 55);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.fillText(state.level, 120, 818);
    // Fusszeile
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 44px ' + font;
    ctx.fillText(SITE, 80, H - 75);
    ctx.textAlign = 'right';
    ctx.fillStyle = soft;
    ctx.font = '500 34px ' + font;
    ctx.fillText('Excel üben, Schweizer Version', W - 80, H - 75);
    return c;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function fileName() { return 'excel-assessment-' + current.id + '-' + state.pct + '.png'; }

  function renderShare() {
    els.shareText.textContent = shareText();
    var ok = !!drawCard();
    els.shareArea.hidden = !ok;
    var canShare = typeof navigator.share === 'function';
    els.shareBtn.hidden = !canShare;
  }

  function toBlob(cb) {
    try { els.canvas.toBlob(function (b) { cb(b); }, 'image/png'); } catch (e) { cb(null); }
  }

  function onDownload() {
    track('share_click', { rolle: current.id, art: 'download' });
    toBlob(function (blob) {
      var a = document.createElement('a');
      a.download = fileName();
      a.href = blob ? URL.createObjectURL(blob) : els.canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (blob) window.setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
  }

  function onShare() {
    track('share_click', { rolle: current.id, art: 'share' });
    var url = 'https://' + SITE + '/assessment/?rolle=' + encodeURIComponent(current.id);
    var text = shareText();
    toBlob(function (blob) {
      var data = { title: current.title, text: text, url: url };
      try {
        if (blob && typeof File === 'function') {
          var file = new File([blob], fileName(), { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) data = { title: current.title, text: text + ' ' + url, files: [file] };
        }
      } catch (e) { /* ohne Bild teilen */ }
      navigator.share(data).catch(function () { /* abgebrochen */ });
    });
  }

  /* ---------- Initialisierung ---------- */

  function initSymbolBar() {
    els.symbols.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-insert]');
      if (!b || els.input.disabled) return;
      var inp = els.input, text = b.getAttribute('data-insert');
      var start = typeof inp.selectionStart === 'number' ? inp.selectionStart : inp.value.length;
      var end = typeof inp.selectionEnd === 'number' ? inp.selectionEnd : start;
      inp.value = inp.value.slice(0, start) + text + inp.value.slice(end);
      inp.focus();
      try { inp.setSelectionRange(start + text.length, start + text.length); } catch (err) { /* ignorieren */ }
    });
  }

  function init() {
    ['notice', 'intro', 'app', 'start', 'start-role', 'start-title', 'start-intro', 'start-meta', 'start-prev', 'start-btn', 'start-btn-note',
      'start-locked', 'run', 'timer', 'timer-value', 'timer-sr', 'progress', 'progress-bar', 'task-tag', 'task-title', 'task-text', 'sheet',
      'form', 'input', 'check-btn', 'skip-btn', 'next-btn', 'attempts', 'feedback', 'symbols', 'result', 'res-title', 'res-time-up',
      'res-score', 'res-level', 'res-points', 'res-diag', 'res-plan', 'share-area', 'canvas', 'share-text', 'download-btn', 'share-btn',
      'restart-btn', 'loading'].forEach(function (id) {
      els[id.replace(/-(\w)/g, function (m, c) { return c.toUpperCase(); })] = $('as-' + id);
    });
    if (!E || !ERR) { notice('Das Assessment konnte nicht geladen werden. Lade die Seite neu.', true); return; }
    E.setLocale('de-CH');

    try {
      HF = window.HyperFormula || null;
      if (HF) E.init(HF);
    } catch (e) { HF = null; }
    if (!HF) notice('Die Formel-Engine konnte nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite neu.', true);

    els.form.addEventListener('submit', onCheck);
    els.skipBtn.addEventListener('click', onSkip);
    els.nextBtn.addEventListener('click', next);
    els.startBtn.addEventListener('click', startTest);
    els.downloadBtn.addEventListener('click', onDownload);
    els.shareBtn.addEventListener('click', onShare);
    els.restartBtn.addEventListener('click', function () { showStart(); els.startTitle.focus(); });
    els.input.addEventListener('input', function () { els.input.removeAttribute('aria-invalid'); });
    initSymbolBar();
    // Rollen-Karten: ohne Neuladen wechseln (Links funktionieren auch ohne JS)
    Array.prototype.forEach.call(document.querySelectorAll('a[data-rolle]'), function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || !assessments.length) return;
        if (state && !state.finished && !window.confirm('Der laufende Test wird abgebrochen. Trotzdem wechseln?')) { e.preventDefault(); return; }
        e.preventDefault();
        selectRole(a.getAttribute('data-rolle'), { push: true, scroll: true, focus: true });
      });
    });
    window.addEventListener('popstate', function () { if (assessments.length) selectRole(roleFromUrl()); });
    window.addEventListener('beforeunload', function (e) {
      if (state && !state.finished) { e.preventDefault(); e.returnValue = ''; }
    });

    Promise.all([
      fetch(BASE + 'assessments.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
      fetch(BASE + 'exercises.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : { exercises: [] }; }).catch(function () { return { exercises: [] }; })
    ]).then(function (res) {
      assessments = (res[0] && res[0].assessments) || [];
      (res[1].exercises || []).forEach(function (ex) { exercises[ex.id] = ex; });
      els.loading.hidden = true;
      var role = roleFromUrl();
      if (role && !byId(role)) notice('Diese Rolle gibt es (noch) nicht. Wähle Consulting oder Accounting.', true);
      selectRole(role);
    }).catch(function (e) {
      if (window.console) console.error(e);
      els.loading.hidden = true;
      notice('Die Aufgaben konnten nicht geladen werden. Lade die Seite neu.', true);
    });
  }

  init();
})();
