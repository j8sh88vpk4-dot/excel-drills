/*
 * Excel-Drills – Mini-Übung auf der Startseite.
 * Nutzt dieselbe Prüf-Engine wie die App (app/engine.js + HyperFormula deDE).
 * HyperFormula wird erst bei Fokus im Formelfeld oder nach 3 s Leerlauf geladen (Ladezeit der Startseite).
 * Ohne JavaScript oder wenn das CDN nicht lädt, bleibt bzw. erscheint der Link zur App.
 * Eine Lösung wird in localStorage (excelDrillsMiniSolved) vermerkt; die App übernimmt sie als Übung 1.
 * Land (CH / DE): derselbe Wert wie in der App (localStorage excelDrillsLocale, ?land=de hat Vorrang).
 * Die Startseite ist deutsch und lädt nur das Sprachpaket deDE: Ist in der App FR oder IT gewählt, zeigt die
 * Mini-Übung DE-CH, ohne die gespeicherte Wahl zu ändern.
 */
(function () {
  'use strict';

  // Verkürzte Variante von «summe-1» aus app/exercises.json (4 statt 5 Filialen).
  var EXERCISE = {
    id: 'home-summe',
    data: [
      ['Filiale', 'Umsatz CHF'],
      ['Zürich', 12500],
      ['Bern', 8300],
      ['Basel', 9100],
      ['Luzern', 4700],
      ['Total', null]
    ],
    alt: [{ data: [['Filiale', 'Umsatz CHF'], ['Zürich', 11000], ['Bern', 7600], ['Basel', 9900], ['Luzern', 5200], ['Total', null]] }],
    target: 'B6',
    solution: '=SUMME(B2:B5)',
    mustUse: ['SUMME'],
    hints: {
      noRange: 'Tipp: Verwende einen Bereich wie B2:B5 statt einzelne Zellen.',
      generic: 'Die Funktion heisst SUMME. Schreibweise: =SUMME(Bereich).'
    }
  };

  var STORAGE_LOCALE = 'excelDrillsLocale';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('mini-form'), input = $('mini-formula'), feedback = $('mini-feedback');
  var target = $('mini-target'), next = $('mini-next'), fallback = $('mini-fallback');
  var sheet = $('mini-sheet'), help = $('mini-help'), switcher = $('mini-locale');
  if (!form || !input || !feedback || !target) return;

  var E = window.ExcelDrillsEngine;
  var HF = null;
  var checkBtn = $('mini-check');
  var engineState = 'idle';   // idle → loading → ready | failed
  var pending = false;        // Prüfen gedrückt, bevor die Engine bereit war
  var solvedTracked = false;
  if (!E) return; // engine.js fehlt: Fallback-Link bleibt sichtbar

  // HyperFormula (ca. 700 KB) erst laden, wenn jemand die Mini-Übung benutzt (Fokus im Formelfeld)
  // oder 3 s nach dem Laden der Seite im Leerlauf. Gleiche Version und SRI-Hashes wie in app/index.html.
  var HF_SCRIPTS = [
    { src: 'https://cdn.jsdelivr.net/npm/hyperformula@3.0.0/dist/hyperformula.full.min.js',
      sri: 'sha384-J7i5jngggSLZ7jIxuRKLh1jM0ZzhEZOPdCX6KrBHZXyWn4WYxANOzzWioi+nEK7w' },
    { src: 'https://cdn.jsdelivr.net/npm/hyperformula@3.0.0/dist/languages/deDE.js',
      sri: 'sha384-jWD9rgGJKCeZXZfD9IcDj4ex7PkMA3oQZbqPtUPh8VB0iQdD3DmT84VMqb2UB0nO' }
  ];
  function loadScript(item) {
    return new Promise(function (resolve, reject) {
      var tag = document.createElement('script');
      tag.src = item.src;
      tag.integrity = item.sri;
      tag.crossOrigin = 'anonymous';
      tag.onload = resolve;
      tag.onerror = function () { reject(new Error('Laden fehlgeschlagen: ' + item.src)); };
      document.head.appendChild(tag);
    });
  }
  function setButton(loading) {
    if (!checkBtn) return;
    checkBtn.textContent = loading ? 'Engine wird geladen …' : 'Prüfen';
    if (loading) checkBtn.setAttribute('aria-disabled', 'true'); else checkBtn.removeAttribute('aria-disabled');
  }
  function loadEngine() {
    if (engineState !== 'idle') return;
    engineState = 'loading';
    setButton(true);
    var chain = window.HyperFormula ? Promise.resolve() : loadScript(HF_SCRIPTS[0]);
    chain
      .then(function () { return window.HyperFormula && window.HyperFormula.languages && window.HyperFormula.languages.deDE ? null : loadScript(HF_SCRIPTS[1]); })
      .then(function () {
        HF = window.HyperFormula;
        if (!HF) throw new Error('Formel-Engine nicht geladen');
        E.init(HF);
        engineState = 'ready';
        setButton(false);
        if (pending) { pending = false; runCheck(); }
      })
      .catch(function (e) {
        engineState = 'failed';
        if (window.console) console.error(e);
        // Fallback: Link zur App
        form.hidden = true;
        feedback.className = 'feedback';
        feedback.innerHTML = '';
        fallback.hidden = false;
        fallback.textContent = 'Die Formel-Engine konnte gerade nicht geladen werden. ';
        var a = document.createElement('a');
        a.href = 'app/#summe-1';
        a.textContent = 'Übung in der App lösen →';
        fallback.appendChild(a);
      });
  }

  form.hidden = false;
  fallback.hidden = true;
  input.addEventListener('focus', loadEngine);
  form.addEventListener('pointerdown', loadEngine);
  // Leerlauf: 3 s nach dem Laden der Seite (und wenn der Browser gerade nichts anderes tut)
  function scheduleIdle() {
    setTimeout(function () {
      if (window.requestIdleCallback) window.requestIdleCallback(loadEngine, { timeout: 2000 });
      else loadEngine();
    }, 3000);
  }
  if (document.readyState === 'complete') scheduleIdle(); else window.addEventListener('load', scheduleIdle);

  function storageGet(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function storageSet(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* ignorieren */ } }

  var param = new URLSearchParams(window.location.search).get('land');
  var locale = E.normalizeLocale(param && /^(ch|de)$/i.test(param.trim()) ? param : storageGet(STORAGE_LOCALE));
  if (param && /^(ch|de)$/i.test(param.trim())) storageSet(STORAGE_LOCALE, locale);
  if (E.langOf(locale) !== 'de') locale = 'de-CH';
  var exercise = EXERCISE;

  // Tabelle (Kopfzeile, Orte, Beträge) im Landesformat neu schreiben. Die Zielzelle bleibt dasselbe Element.
  function renderTable() {
    var rows = sheet ? sheet.tBodies[0].rows : [];
    for (var r = 0; r < rows.length && r < exercise.data.length; r++) {
      var cells = rows[r].cells; // [0] ist die Zeilennummer (th)
      for (var c = 1; c < cells.length; c++) {
        var v = exercise.data[r][c - 1];
        if (cells[c] === target || v === null || v === undefined) continue;
        cells[c].textContent = E.formatValue(v);
      }
    }
  }

  function applyLocale(next) {
    locale = E.setLocale(next);
    exercise = E.localize(EXERCISE, locale);
    renderTable();
    if (help) help.textContent = E.uiText(locale).miniHelp;
    if (switcher) {
      Array.prototype.forEach.call(switcher.querySelectorAll('button[data-locale]'), function (b) {
        b.setAttribute('aria-pressed', E.normalizeLocale(b.dataset.locale) === locale ? 'true' : 'false');
      });
    }
  }

  if (switcher) {
    switcher.hidden = false;
    Array.prototype.forEach.call(switcher.querySelectorAll('button[data-locale]'), function (b) {
      b.addEventListener('click', function () {
        if (E.normalizeLocale(b.dataset.locale) === locale) return;
        applyLocale(b.dataset.locale);
        storageSet(STORAGE_LOCALE, locale);
        setTarget(undefined);
        next.hidden = true;
        show('info', [E.uiText(locale).switched]);
        try { if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack('land', { land: locale, ort: 'startseite' }); } catch (e) { /* ignorieren */ }
      });
    });
  }
  applyLocale(locale);

  function setTarget(value) {
    if (value === undefined) {
      target.className = 'target';
      target.innerHTML = '<span class="visually-hidden">Zielzelle B6, leer</span>';
      return;
    }
    target.className = 'target solved num';
    target.textContent = E.formatValue(value);
  }

  function show(kind, lines) {
    feedback.className = 'feedback ' + kind;
    feedback.innerHTML = '';
    lines.forEach(function (text) {
      if (!text) return;
      var p = document.createElement('p');
      p.textContent = text;
      feedback.appendChild(p);
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (engineState !== 'ready') {
      // Engine noch nicht da: merken und nach dem Laden automatisch prüfen
      pending = true;
      show('info', ['Die Formel-Engine wird geladen, deine Formel wird gleich geprüft …']);
      loadEngine();
      return;
    }
    runCheck();
  });

  function runCheck() {
    var result;
    try {
      result = E.check(HF, exercise, input.value);
    } catch (e) {
      show('err', ['Die Formel konnte nicht geprüft werden. Versuch es nochmals oder öffne die Übung in der App.']);
      return;
    }
    if (result.ok) {
      setTarget(result.value);
      show('ok', [result.message, result.tip]);
      input.setAttribute('aria-invalid', 'false');
      next.hidden = false;
      // Für die App: Übung 1 wird beim nächsten App-Start als gelöst übernommen (app/app.js, importMiniSolve)
      storageSet('excelDrillsMiniSolved', '1');
      if (!solvedTracked) {
        solvedTracked = true;
        try { if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack('mini_geloest', { land: locale }); } catch (e) { /* ignorieren */ }
      }
    } else {
      setTarget(undefined);
      var lines = [result.message];
      if (result.errorValue && result.errorValue !== '#ERROR!') lines.push('Excel würde hier ' + result.errorValue + ' anzeigen.');
      show('err', lines);
      input.setAttribute('aria-invalid', 'true');
      next.hidden = true;
    }
  }

  input.addEventListener('input', function () {
    if (input.getAttribute('aria-invalid') === 'true') input.removeAttribute('aria-invalid');
  });
})();
