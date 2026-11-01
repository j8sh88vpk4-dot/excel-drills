/* Excel-Drills: Story-Kampagnen (Vanilla JS), Seite kampagne/.
 * Ablauf: Timeline der Tage (gelöst / offen / gesperrt), pro Tag Story, Tabelle, Formelfeld, Prüfen mit
 * unbegrenzten Versuchen, nach Erfolg «Was du gelernt hast» und Button zum nächsten Tag.
 * Prüflogik: app/engine.js (window.ExcelDrillsEngine), Premium-Prüfung: app/keys.js (wie app/access.js).
 * Inhalte: app/campaigns.json. Fortschritt: localStorage excelDrillsCampaigns { <id>: { done: [Tag], last: Tag } }. */
(function () {
  'use strict';

  var E = window.ExcelDrillsEngine;
  var Keys = window.ExcelDrillsKeys;
  var HF = null;

  var STORAGE_PROGRESS = 'excelDrillsCampaigns';
  var STORAGE_KEY = 'excelDrillsKey';   // Premium-Code (wie app/app.js und app/assessment.js)
  var BASE = '../app/';
  var DEFAULT_ID = 'controlling-monat-1';

  var campaign = null;   // aktuelle Kampagne aus campaigns.json
  var current = null;    // aktueller Tag (Objekt aus campaign.days)
  var els = {};

  function $(id) { return document.getElementById(id); }

  /* ---------- Hilfen ---------- */

  function track(name, props) {
    try { if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack(name, props); } catch (e) { /* ignorieren */ }
  }
  function storageGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function storageSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* privater Modus */ } }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function notice(msg, err) {
    els.notice.textContent = msg;
    els.notice.className = 'notice' + (err ? ' err' : '');
    els.notice.hidden = !msg;
  }
  function hasPremium() {
    try { return !!(Keys && Keys.isValid(storageGet(STORAGE_KEY))); } catch (e) { return false; }
  }
  function isLocked(day) { return day.free === false && !hasPremium(); }

  /* ---------- Fortschritt ---------- */

  function loadAll() {
    try { var o = JSON.parse(storageGet(STORAGE_PROGRESS) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function progress() {
    var p = loadAll()[campaign.id] || {};
    return { done: Array.isArray(p.done) ? p.done.filter(function (n) { return typeof n === 'number'; }) : [], last: typeof p.last === 'number' ? p.last : null };
  }
  function saveProgress(p) {
    var all = loadAll();
    all[campaign.id] = { done: p.done, last: p.last };
    storageSet(STORAGE_PROGRESS, JSON.stringify(all));
  }
  function isDone(dayNo) { return progress().done.indexOf(dayNo) !== -1; }
  // Tag als gelöst speichern; true, wenn er zum ersten Mal gelöst wurde
  function markDone(dayNo) {
    var p = progress();
    var first = p.done.indexOf(dayNo) === -1;
    if (first) p.done.push(dayNo);
    p.done.sort(function (a, b) { return a - b; });
    p.last = dayNo;
    saveProgress(p);
    return first;
  }
  function rememberLast(dayNo) {
    var p = progress();
    p.last = dayNo;
    saveProgress(p);
  }

  function dayByNo(n) { return campaign.days.filter(function (d) { return d.day === n; })[0] || null; }
  function nextDay(day) {
    var i = campaign.days.indexOf(day);
    return i >= 0 && i < campaign.days.length - 1 ? campaign.days[i + 1] : null;
  }
  function dayFromHash() {
    var m = /^#tag-(\d+)$/.exec(window.location.hash || '');
    return m ? dayByNo(parseInt(m[1], 10)) : null;
  }
  // Startpunkt: Link-Anker, sonst zuletzt bearbeiteter Tag, sonst erster offener, sonst Tag 1
  function initialDay() {
    var fromHash = dayFromHash();
    if (fromHash) return fromHash;
    var p = progress();
    if (p.last !== null && dayByNo(p.last)) {
      var last = dayByNo(p.last);
      if (p.done.indexOf(last.day) === -1) return last;
      var nx = nextDay(last);
      return nx || last;
    }
    var open = campaign.days.filter(function (d) { return p.done.indexOf(d.day) === -1 && !isLocked(d); })[0];
    return open || campaign.days[0];
  }

  /* ---------- Timeline ---------- */

  function statusOf(day) {
    if (isDone(day.day)) return { cls: 'is-done', label: 'Gelöst' };
    if (isLocked(day)) return { cls: 'is-locked', label: 'Premium' };
    return { cls: 'is-open', label: 'Offen' };
  }

  function renderTimeline() {
    var ol = els.timeline;
    clear(ol);
    campaign.days.forEach(function (day) {
      var st = statusOf(day);
      var li = el('li', 'kp-step ' + st.cls);
      li.setAttribute('data-day', String(day.day));
      var a = el('a', 'kp-step-link');
      a.href = '#tag-' + day.day;
      if (current && current.day === day.day) a.setAttribute('aria-current', 'step');
      a.appendChild(el('span', 'kp-step-day', 'Tag ' + day.day));
      a.appendChild(el('span', 'kp-step-title', day.exercise.title));
      var status = el('span', 'kp-step-status', st.label);
      a.appendChild(status);
      a.setAttribute('aria-label', 'Tag ' + day.day + ': ' + day.exercise.title + ', ' + st.label);
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openDay(day, { push: true, focus: true, scroll: true });
      });
      li.appendChild(a);
      ol.appendChild(li);
    });
    var n = progress().done.filter(function (d) { return !!dayByNo(d); }).length;
    var total = campaign.days.length;
    els.progress.textContent = n + ' von ' + total + ' Tagen gelöst';
    els.progressBar.style.width = (n / total * 100) + '%';
  }

  /* ---------- Tagesansicht ---------- */

  // Schlanke Tabellen-Darstellung (wie renderSheet in assessment.js): Spalten A, B, ..., Zeilennummern, Zielzelle markiert
  function renderSheet(ex, resultValue) {
    var data = E.normalizeData(ex.data, ex.target);
    var t = E.parseA1(ex.target);
    var table = els.sheet;
    clear(table);
    table.appendChild(el('caption', 'visually-hidden', 'Tabelle zu «' + ex.title + '», Zielzelle ' + ex.target));
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
    // Zellbezüge per Klick (app/sheet-pick.js), Texte deutsch; bei jedem Neu-Rendern neu angebunden
    if (window.ExcelDrillsSheetPick) window.ExcelDrillsSheetPick.attach({ table: table, input: els.input, locale: 'de-CH', ort: 'kampagne' });
  }

  function setFeedback(kind, text, extra) {
    els.feedback.className = 'feedback' + (kind ? ' ' + kind : '');
    clear(els.feedback);
    if (!text) return;
    els.feedback.appendChild(el('p', null, text));
    if (extra) els.feedback.appendChild(el('p', 'fine', extra));
  }

  function openDay(day, opts) {
    opts = opts || {};
    current = day;
    var ex = day.exercise;
    var locked = isLocked(day);
    var done = isDone(day.day);

    els.day.hidden = false;
    els.dayTag.textContent = 'Tag ' + day.day + (day.free ? '' : ' · Premium');
    els.dayTopic.textContent = ex.topic || '';
    els.dayTopic.hidden = !ex.topic;
    els.dayTitle.textContent = ex.title;
    els.story.textContent = day.story;
    els.storyFrom.textContent = day.from + ', ' + campaign.firma;

    els.locked.hidden = !locked;
    els.work.hidden = locked;
    els.finish.hidden = true;
    els.attempts.textContent = done ? 'Schon gelöst. Du kannst die Aufgabe beliebig oft wiederholen.' : 'Unbegrenzte Versuche.';
    setFeedback('', '');
    els.input.value = '';
    els.input.removeAttribute('aria-invalid');
    els.input.disabled = locked || !HF;
    els.checkBtn.disabled = locked || !HF;

    if (!locked) {
      els.task.textContent = ex.task;
      renderSheet(ex);
    }
    showLearned(done && !locked);

    if (opts.push) {
      try { window.history.pushState(null, '', '#tag-' + day.day); } catch (e) { /* ignorieren */ }
    }
    if (!locked) rememberLast(day.day);
    renderTimeline();
    if (opts.scroll) els.day.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (opts.focus) els.dayTitle.focus({ preventScroll: true });
  }

  function showLearned(show) {
    var day = current;
    els.learned.hidden = !show;
    els.nextBtn.hidden = true;
    if (!show) return;
    els.learnedText.textContent = day.learned;
    els.solution.textContent = day.exercise.solution;
    var nx = nextDay(day);
    if (nx) {
      els.nextBtn.textContent = 'Weiter zu Tag ' + nx.day + (isLocked(nx) ? ' (Premium)' : '') + ' →';
      els.nextBtn.hidden = false;
    } else {
      var allDone = campaign.days.every(function (d) { return isDone(d.day); });
      els.finish.hidden = !allDone;
    }
  }

  function onCheck(e) {
    e.preventDefault();
    if (!current || !HF || isLocked(current)) return;
    var ex = current.exercise;
    var f = els.input.value;
    var r;
    try { r = E.check(HF, ex, f); } catch (err) {
      if (window.console) console.error(err);
      r = { ok: false, message: (E.MSG && E.MSG.genericFallback) || 'Prüfe deine Formel.' };
    }
    if (r.ok) {
      els.input.removeAttribute('aria-invalid');
      renderSheet(ex, r.value);
      setFeedback('ok', r.message, r.tip || null);
      var first = markDone(current.day);
      if (first) track('campaign_day_done', { kampagne: campaign.id, tag: current.day });
      els.attempts.textContent = 'Gelöst.';
      renderTimeline();
      showLearned(true);
      if (!els.nextBtn.hidden) els.nextBtn.focus();
      return;
    }
    // Falsch: Feedback der Engine anzeigen, beliebig viele weitere Versuche
    els.input.setAttribute('aria-invalid', 'true');
    setFeedback('err', r.message, String(f).trim() ? 'Versuch es nochmal, du hast unbegrenzte Versuche.' : null);
    els.input.focus();
  }

  function onNext() {
    var nx = current && nextDay(current);
    if (nx) openDay(nx, { push: true, focus: true, scroll: true });
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

  function campaignIdFromUrl() {
    try { return (new URLSearchParams(window.location.search).get('kampagne') || '').toLowerCase(); } catch (e) { return ''; }
  }

  function init() {
    ['notice', 'loading', 'progress', 'progress-bar', 'timeline', 'day', 'day-tag', 'day-topic', 'day-title', 'story', 'story-from',
      'locked', 'work', 'task', 'sheet', 'form', 'input', 'check-btn', 'symbols', 'attempts', 'feedback', 'learned', 'learned-text',
      'solution', 'next-btn', 'finish'].forEach(function (id) {
      els[id.replace(/-(\w)/g, function (m, c) { return c.toUpperCase(); })] = $('kp-' + id);
    });
    if (!E) { notice('Die Kampagne konnte nicht geladen werden. Lade die Seite neu.', true); return; }
    E.setLocale('de-CH');

    try {
      HF = window.HyperFormula || null;
      if (HF) E.init(HF);
    } catch (e) { HF = null; }
    if (!HF) notice('Die Formel-Engine konnte nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite neu.', true);

    els.form.addEventListener('submit', onCheck);
    els.nextBtn.addEventListener('click', onNext);
    els.input.addEventListener('input', function () { els.input.removeAttribute('aria-invalid'); });
    initSymbolBar();
    window.addEventListener('hashchange', function () {
      var d = campaign && dayFromHash();
      if (d && d !== current) openDay(d, { focus: true, scroll: true });
    });

    fetch(BASE + 'campaigns.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        var list = (json && json.campaigns) || [];
        var wanted = campaignIdFromUrl() || DEFAULT_ID;
        campaign = list.filter(function (c) { return c.id === wanted; })[0] || list[0] || null;
        els.loading.hidden = true;
        if (!campaign || !campaign.days || !campaign.days.length) { notice('Diese Kampagne gibt es (noch) nicht.', true); return; }
        // Mit Anker (#tag-5) direkt zum Tag scrollen; der Tag steht unter Einleitung und Timeline
        openDay(initialDay(), { focus: !!dayFromHash(), scroll: !!dayFromHash() });
      })
      .catch(function (e) {
        if (window.console) console.error(e);
        els.loading.hidden = true;
        notice('Die Aufgaben konnten nicht geladen werden. Lade die Seite neu.', true);
      });
  }

  init();
})();
