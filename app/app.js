/* Excel-Drills – Übungs-App (Vanilla JS, keine Abhängigkeiten ausser HyperFormula) */
(function () {
  'use strict';

  var STORAGE_PROGRESS = 'excelDrillsProgress';
  var STORAGE_KEY = 'excelDrillsKey';
  var STORAGE_TRACK = 'excelDrillsTrack';
  var STORAGE_STEPS = 'excelDrillsProjectSteps'; // abgehakte Schritte der Projekt-Übungen: { <id>: [Indizes] }
  var STORAGE_LOCALE = 'excelDrillsLocale';      // Sprache/Land: de-CH (Standard), de-DE, fr-CH, it-CH (alt: ch, de)
  var STORAGE_MINI = 'excelDrillsMiniSolved';    // von assets/mini-drill.js gesetzt: Mini-Übung der Startseite gelöst
  var MINI_EXERCISE = 'summe-1';                 // wird beim ersten App-Start als gelöst übernommen
  var LEVELUP_MODAL_FROM = 4;                    // Level-up unter diesem Level nur als Toast, ab hier als Dialog
  var DEFAULT_TRACK = 'basis';
  var MOBILE_QUERY = '(max-width: 800px)';
  var STORAGE_INSTALL = 'excelDrillsInstallHint';  // Zeitpunkt (ms), zu dem die Installations-Karte zuletzt kam
  var INSTALL_AFTER_SOLVED = 2;                    // Karte frühestens ab der zweiten gelösten Übung
  var INSTALL_PAUSE_MS = 7 * 24 * 3600 * 1000;     // höchstens einmal pro 7 Tage

  var E = window.ExcelDrillsEngine;
  var Keys = window.ExcelDrillsKeys;
  var G = window.ExcelDrillsGamification;
  var Badges = window.ExcelDrillsBadges;
  var Access = window.ExcelDrillsAccess;
  var Pwa = window.ExcelDrillsPwa;  // assets/pwa.js (optional: ohne Service Worker läuft die App wie bisher)
  var ERR = window.ExcelDrillsErrors; // app/errors.js: Fehlerkategorie und Lerntipp (für die Fehler-DNA)
  // Fehler-DNA: Kategorie pro Übung (exercises.json hat kein Feld «category»). Fehlt eine ID, gilt «modell».
  var EX_CATEGORY = {
    'summe-1': 'syntax', 'mittelwert-1': 'syntax', 'max-1': 'syntax', 'textkette-1': 'syntax',
    'wenn-1': 'logik', 'wennfehler-1': 'logik', 'wenn-verschachtelt-1': 'logik', 'acc-duplikate-1': 'logik',
    'acc-sollhaben-1': 'logik', 'acc-alterung-1': 'logik',
    'zaehlenwenn-1': 'lookup', 'summewenn-1': 'lookup', 'summewenn-2': 'lookup', 'sverweis-1': 'lookup', 'sverweis-2': 'lookup',
    'acc-summewenns-1': 'lookup', 'acc-abstimmung-1': 'lookup', 'fin-praemienstaffel-1': 'lookup',
    'runden-1': 'rundung', 'acc-rundung-1': 'rundung', 'fin-breakeven-1': 'rundung',
    'absolut-1': 'bezug', 'acc-anteil-1': 'bezug', 'acc-mwst-1': 'bezug'
  };
  // Passende Gratis-Übung zum Üben der schwächsten Kategorie
  var CATEGORY_EXERCISE = {
    bezug: 'absolut-1', syntax: 'summe-1', logik: 'wenn-1', lookup: 'summewenn-1', rundung: 'runden-1', modell: 'acc-abweichung-1'
  };
  var wrongCounted = false;        // Fehlversuch dieser Runde schon in der Fehler-DNA verbucht (zählt einmal pro Runde)
  var AccountMod = window.ExcelDrillsAccount;   // freiwilliges Konto (app/account.js), nur aktiv mit app/config.js
  var account = null;              // Rückgabe von AccountMod.boot, null ohne Konto-Funktion
  var accountPremium = false;      // Premium aus einer Lizenz im Konto (zusätzlich zum lokalen Code)
  var paywallExercise = null;      // gesperrte Übung, die den Paywall-Dialog ausgelöst hat
  var HF = null;
  var exercises = [];
  var tracks = [];          // sortiert nach order; jeder Pfad hat .items (Übungen in Reihenfolge)
  var trackById = {};
  var currentTrack = null;
  var current = null;
  var stored = storageGet(STORAGE_PROGRESS);
  var migratedFromV1 = false;
  var progress = loadProgress();   // Gamification-Stand (siehe app/gamification.js)
  var unlocked = false;
  var lastTrigger = null;
  var dataset = 0;                 // aktueller Datensatz der Übung: 0 = Originaldaten, 1.. = alt
  var attemptCounted = false;      // diese Runde wurde schon verbucht (erneutes Prüfen zählt nicht doppelt)
  var locale = 'de-CH';            // Sprache und Land der Anzeige und Prüfung (siehe resolveLocale)
  var localized = {};              // Cache: Übungs-ID → Übung im aktuellen Land (E.localize)
  var UI_DE = window.ExcelDrillsUiDe || {};
  var uiDict = null;               // ui-Texte aus i18n/fr.json bzw. it.json, null für Deutsch
  var htmlDe = null;               // deutsche Originaltexte der statischen Elemente (data-i18n)
  var i18nLoading = {};            // laufende Ladevorgänge: lang → Promise
  var packLoading = {};            // HyperFormula-Sprachpakete frFR/itIT: lang → Promise
  // Sprachpakete für FR/IT werden erst geladen, wenn die Sprache gewählt ist (DE-CH braucht nur deDE aus index.html).
  // SRI-Hashes aus node_modules/hyperformula/dist/languages (Version 3.0.0, wie in index.html).
  var HF_CDN = 'https://cdn.jsdelivr.net/npm/hyperformula@3.0.0/dist/languages/';
  var LANG_PACKS = {
    fr: { code: 'frFR', sri: 'sha384-q1L6SEj5wqXtGFt3wP1YsMToQdosF2+uMVCn7LbvfVc+yhV9sjz9axE2+5xW7ldc' },
    it: { code: 'itIT', sri: 'sha384-LfEYBjeJ7xWrtp8QmXQLFou81VNnMPeD5nvymC+nKrSnLNxsIGl7lxlpJkyIauK9' }
  };

  // Oberflächentext im aktuellen Land. Platzhalter {name} aus params.
  function T(key, params) {
    var v = uiDict && typeof uiDict[key] === 'string' ? uiDict[key] : UI_DE[key];
    if (typeof v !== 'string') v = htmlDe && htmlDe[key] !== undefined ? htmlDe[key] : key;
    return E.fill(v, params);
  }

  var $ = function (id) { return document.getElementById(id); };
  var els = {
    notice: $('notice'), list: $('exercise-list'), listProgress: $('list-progress'), listHeading: $('list-heading'),
    loading: $('loading'), trackPicker: $('track-picker'), trackTabs: $('track-tabs'), trackSelect: $('track-select'),
    trackEmpty: $('track-empty'), trackEmptyText: $('track-empty-text'), trackEmptyLink: $('track-empty-link'),
    view: $('exercise-view'), topic: $('ex-topic'), title: $('ex-title'), task: $('ex-task'), fill: $('ex-fill'),
    sheet: $('sheet'), caption: $('sheet-caption'), form: $('formula-form'), input: $('formula'),
    label: $('formula-label'), checkBtn: $('check-btn'), hintBtn: $('hint-btn'), nextBtn: $('next-btn'),
    feedback: $('feedback'), trackDone: $('track-done'), paywall: $('paywall'),
    paywallClose: $('paywall-close'), main: $('exercise'), againBtn: $('again-btn'), variant: $('ex-variant'),
    medal: $('ex-medal'), mastery: $('ex-mastery'),
    formulaPart: $('formula-part'), project: $('project-part'), pjDownload: $('pj-download'), pjFile: $('pj-file'),
    pjSteps: $('pj-steps'), pjForm: $('pj-form'), pjQuestions: $('pj-questions'), pjCheck: $('pj-check'),
    formulaHelp: $('formula-help'), pjNote: $('pj-q-note'), localeSwitch: $('locale-switch'), profileClose: $('profile-close'),
    localePicker: $('locale-picker'), localeSelect: $('locale-select'),
    exerciseNav: $('exercise-nav'), listToggle: $('list-toggle'), skipLink: $('skip-link'), symbolBar: $('symbol-bar'),
    paywallLead: $('paywall-lead'), paywallList: $('paywall-list'), paywallMore: $('paywall-more'), gami: $('gami'),
    codeForm: $('paywall-code-form'), codeInput: $('paywall-code'), codeMsg: $('paywall-code-msg'),
    pfAccess: $('pf-access'), accessCode: $('access-code'), accessCopy: $('access-copy'), accessLink: $('access-link'),
    accessLinkCopy: $('access-link-copy'), accessMsg: $('access-msg'), dueBox: $('due-box'), dueList: $('due-list')
  };

  /* ---------- Speicher (localStorage, mit Fallback falls blockiert) ---------- */

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* z. B. privater Modus: Fortschritt nur für diese Sitzung */ }
  }
  function storageRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignorieren */ }
  }
  // Schlüssel bleibt excelDrillsProgress. Alter Stand { points, solved } wird verlustfrei migriert
  // (Punkte = XP, gelöste Übungen = Bronze); «points» und «solved» bleiben im gespeicherten Objekt erhalten.
  // v2 wird beim Laden zu v3 (Fehler-DNA und Wiederholung starten leer).
  function loadProgress() {
    var raw = null;
    try { raw = stored ? JSON.parse(stored) : null; } catch (e) { raw = null; }
    migratedFromV1 = !!raw && raw.v !== 2 && raw.v !== 3;
    return G.migrate(raw);
  }
  function saveProgress() {
    storageSet(STORAGE_PROGRESS, JSON.stringify(G.serialize(progress)));
    if (account) account.notifyChange();   // Konto: Abgleich mit 2 s Verzögerung
  }

  /* ---------- Freischaltung (MVP) ----------
   * Bewusst einfacher MVP-Mechanismus: Der Code kommt per ?key=... (Weiterleitung von Stripe
   * nach der Zahlung) oder steht schon in localStorage und wird gegen app/keys.js geprüft.
   * Das ist clientseitig umgehbar und ersetzt keine serverseitige Lizenzprüfung.
   */
  // Analytics (Plausible, siehe assets/analytics.js): nur senden, wenn vorhanden; darf nie die App stören.
  function track(name, props, revenue) {
    try { if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack(name, props, revenue); } catch (e) { /* ignorieren */ }
  }
  var PLAN_PRICE = { jahr: 49, monat: 9, lifetime: 149 };
  function trackPurchase(plan) {
    plan = plan ? String(plan).toLowerCase() : '';
    if (PLAN_PRICE.hasOwnProperty(plan)) track('kauf', { plan: plan }, { currency: 'CHF', amount: PLAN_PRICE[plan] });
    else track('kauf', { plan: 'unbekannt' });
  }

  function resolveUnlock() {
    var params = new URLSearchParams(window.location.search);
    var urlKey = params.get('key');
    var planParam = params.get('plan');
    params.delete('plan');
    if (urlKey !== null) {
      params.delete('key');
      var clean = window.location.pathname + (params.toString() ? '?' + params : '') + window.location.hash;
      window.history.replaceState(null, '', clean);
      if (Keys.isValid(urlKey)) {
        var normKey = Keys.normalize(urlKey);
        // Kauf nur beim ersten Akzeptieren des Codes melden, nicht bei jedem Laden mit ?key=
        var firstTime = storageGet(STORAGE_KEY) !== normKey;
        storageSet(STORAGE_KEY, normKey);
        if (firstTime) trackPurchase(planParam);
        showNotice(T('notice.unlocked'), false);
        return true;
      }
      showNotice(T('notice.invalidKey'), true);
    }
    // Konto: zwischengespeicherte Lizenz gilt sofort (der Server-Check folgt in app/account.js)
    accountPremium = !!(AccountMod && AccountMod.enabled() && AccountMod.cachedPremium());
    return Keys.isValid(storageGet(STORAGE_KEY)) || accountPremium;
  }

  /* ---------- Sprache und Land (DE-CH / FR-CH / IT-CH / DE-DE) ----------
   * ?lang=fr|it|de bzw. ?land=de|ch (z. B. aus Marketing-Links) hat Vorrang und wird gespeichert, sonst gilt der
   * gespeicherte Wert, sonst DE-CH. Alte gespeicherte Werte «ch»/«de» werden zu de-CH/de-DE.
   * Der Fortschritt hängt nur an den Übungs-IDs und bleibt beim Umschalten gleich.
   */
  function resolveLocale() {
    var params = new URLSearchParams(window.location.search);
    var lang = params.get('lang'), land = params.get('land');
    var fromUrl = null;
    if (lang && /^(de|fr|it)(-ch)?$/i.test(lang.trim())) fromUrl = /^de/i.test(lang) ? 'de-CH' : E.normalizeLocale(lang);
    else if (land && /^(ch|de)$/i.test(land.trim())) fromUrl = E.normalizeLocale(land);
    if (fromUrl) { storageSet(STORAGE_LOCALE, fromUrl); return fromUrl; }
    return E.normalizeLocale(storageGet(STORAGE_LOCALE));
  }

  // Übersetzung (fr/it) laden und in der Engine registrieren. Deutsch braucht nichts.
  function loadI18n(loc) {
    var lang = E.langOf(loc);
    if (lang === 'de' || E.i18n(lang)) return Promise.resolve(true);
    if (!i18nLoading[lang]) {
      i18nLoading[lang] = fetch('i18n/' + lang + '.json', { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (json) { E.registerI18n(lang, json); return true; })
        .catch(function (e) { delete i18nLoading[lang]; if (window.console) console.error(e); return false; });
    }
    return i18nLoading[lang];
  }

  // HyperFormula-Sprachpaket (frFR/itIT) nachladen und registrieren. Deutsch ist immer geladen.
  // Ergebnis false: Paket nicht verfügbar (offline, Blocker); die Texte wechseln trotzdem, Prüfen bleibt gesperrt.
  function loadLangPack(loc) {
    var pack = LANG_PACKS[E.langOf(loc)];
    var H = window.HyperFormula;
    if (!pack) return Promise.resolve(true);
    if (!H) return Promise.resolve(false);
    if (H.languages && H.languages[pack.code]) return Promise.resolve(true);
    if (!packLoading[pack.code]) {
      packLoading[pack.code] = new Promise(function (resolve) {
        var tag = document.createElement('script');
        tag.src = HF_CDN + pack.code + '.js';
        tag.integrity = pack.sri;
        tag.crossOrigin = 'anonymous';
        tag.onload = function () { resolve(true); };
        tag.onerror = function () { delete packLoading[pack.code]; tag.remove(); resolve(false); };
        document.head.appendChild(tag);
      }).then(function (okLoaded) {
        // Neu geladenes Paket registrieren (idempotent); vor dem Start der Engine übernimmt das init().
        if (okLoaded && HF) { try { E.init(HF); } catch (e) { if (window.console) console.error(e); } }
        return okLoaded;
      });
    }
    return packLoading[pack.code];
  }

  // Übung im aktuellen Land (Texte, Daten, Musterlösung). Fortschritt und IDs nutzen weiterhin die Originalübung.
  function lx(ex) {
    if (!ex) return ex;
    if (!localized[ex.id]) localized[ex.id] = E.localize(ex, locale);
    return localized[ex.id];
  }

  // Statische Texte (data-i18n, data-i18n-attr) aus app/index.html übersetzen bzw. auf Deutsch zurücksetzen.
  function applyStaticTexts() {
    var nodes = document.querySelectorAll('[data-i18n]');
    var attrNodes = document.querySelectorAll('[data-i18n-attr]');
    if (!htmlDe) {
      htmlDe = {};
      Array.prototype.forEach.call(nodes, function (n) { if (htmlDe[n.dataset.i18n] === undefined) htmlDe[n.dataset.i18n] = n.textContent; });
      Array.prototype.forEach.call(attrNodes, function (n) {
        n.dataset.i18nAttr.split(',').forEach(function (pair) {
          var p = pair.split(':');
          if (htmlDe[p[1]] === undefined) htmlDe[p[1]] = n.getAttribute(p[0]) || '';
        });
      });
    }
    Array.prototype.forEach.call(nodes, function (n) { n.textContent = T(n.dataset.i18n); });
    Array.prototype.forEach.call(attrNodes, function (n) {
      n.dataset.i18nAttr.split(',').forEach(function (pair) { var p = pair.split(':'); n.setAttribute(p[0], T(p[1])); });
    });
    document.title = T('doc.title');
  }

  function applyLocaleUi() {
    var t = E.uiText(locale);
    var lang = E.langOf(locale);
    uiDict = lang === 'de' ? null : (E.i18n(lang) || {}).ui || null;
    document.documentElement.lang = t.lang;
    applyStaticTexts();
    if (els.formulaHelp) els.formulaHelp.textContent = t.formulaHelp;
    if (els.pjNote) els.pjNote.textContent = t.projectNote;
    if (els.profileClose) els.profileClose.setAttribute('aria-label', t.close);
    if (els.localeSwitch) {
      Array.prototype.forEach.call(els.localeSwitch.querySelectorAll('button[data-locale]'), function (b) {
        b.setAttribute('aria-pressed', b.dataset.locale === locale ? 'true' : 'false');
      });
    }
    if (els.localeSelect) els.localeSelect.value = locale;
    relabelTracks();
    if (HF) els.checkBtn.disabled = !E.hasLanguage(locale);
    if (Pwa) Pwa.refresh();
  }

  function setAppLocale(next) {
    next = E.normalizeLocale(next);
    if (next === locale) return;
    Promise.all([loadI18n(next), loadLangPack(next)]).then(function (res) {
      var okLoaded = res[0];
      if (!okLoaded) { showNotice(T('notice.langFailed'), true); if (els.localeSelect) els.localeSelect.value = locale; return; }
      locale = E.setLocale(next);
      localized = {};
      storageSet(STORAGE_LOCALE, locale);
      var params = new URLSearchParams(window.location.search);
      params.delete('land'); params.delete('lang');
      if (locale === 'de-DE') params.set('land', 'de');
      else if (locale !== 'de-CH') params.set('lang', E.langOf(locale));
      window.history.replaceState(null, '', window.location.pathname + (params.toString() ? '?' + params : '') + window.location.hash);
      clearToasts();
      applyLocaleUi();
      track('land', { land: locale });
      if (HF && !E.hasLanguage(locale)) showNotice(T('notice.langEngine'), true);
      if (!exercises.length) return;
      renderHeader();
      if (current) { rerenderCurrent(); renderMastery(); }
      renderAll();
      setFeedback('info', [E.uiText(locale).switched]);
    });
  }

  function initLocaleSwitch() {
    if (!els.localeSwitch) return;
    if (els.localePicker) els.localePicker.hidden = false;
    els.localeSwitch.hidden = false;
    Array.prototype.forEach.call(els.localeSwitch.querySelectorAll('button[data-locale]'), function (b) {
      b.addEventListener('click', function () { setAppLocale(b.dataset.locale); });
    });
    if (els.localeSelect) els.localeSelect.addEventListener('change', function () { setAppLocale(els.localeSelect.value); });
  }

  function showNotice(text, isError) {
    els.notice.className = 'notice' + (isError ? ' err' : '');
    els.notice.textContent = text;
  }

  function isLocked(ex) { return !ex.free && !unlocked; }
  function isSolved(ex) { return !!progress.solved[ex.id]; }

  /* ---------- Pfade ---------- */

  // Baut die Pfadliste aus json.tracks und ordnet jede Übung ihrem Pfad zu. Übungen ohne (bekannten)
  // Pfad landen in «basis» bzw. in einem automatisch angelegten Pfad, damit nie eine Übung verloren geht.
  function buildTracks(json) {
    var defs = Array.isArray(json.tracks) ? json.tracks.slice() : [];
    tracks = [];
    trackById = {};
    defs.forEach(function (t, i) {
      if (!t || !t.id || trackById[t.id]) return;
      var tr = {
        id: String(t.id), name: t.name || String(t.id), claim: t.claim || '', audience: t.audience || '',
        baseName: t.name || String(t.id), baseClaim: t.claim || '',
        order: typeof t.order === 'number' ? t.order : 100 + i, comingSoon: !!t.comingSoon, items: []
      };
      trackById[tr.id] = tr;
      tracks.push(tr);
    });
    if (!trackById[DEFAULT_TRACK]) {
      trackById[DEFAULT_TRACK] = { id: DEFAULT_TRACK, name: 'Basis', claim: '', audience: '', order: 0, comingSoon: false, items: [] };
      tracks.push(trackById[DEFAULT_TRACK]);
    }
    exercises.forEach(function (ex) {
      var id = ex.track ? String(ex.track) : DEFAULT_TRACK;
      if (!trackById[id]) {
        trackById[id] = { id: id, name: id, claim: '', audience: '', order: 1000 + tracks.length, comingSoon: false, items: [] };
        tracks.push(trackById[id]);
      }
      trackById[id].items.push(ex);
    });
    tracks.sort(function (a, b) { return a.order - b.order; });
    // Ein leerer Fallback-Pfad «basis» ohne Definition wird nicht angezeigt
    tracks = tracks.filter(function (t) { return t.items.length || defs.some(function (d) { return d && d.id === t.id; }); });
  }

  // Pfadnamen und Claims im aktuellen Land (Schlüssel «track.<id>.name» / «.claim»)
  function relabelTracks() {
    tracks.forEach(function (tr) {
      var n = T('track.' + tr.id + '.name'), c = T('track.' + tr.id + '.claim');
      tr.name = uiDict && n !== 'track.' + tr.id + '.name' ? n : (tr.baseName || tr.name);
      tr.claim = uiDict && c !== 'track.' + tr.id + '.claim' ? c : (tr.baseClaim || tr.claim);
    });
  }

  function isAvailable(tr) { return !!tr && !tr.comingSoon && tr.items.length > 0; }
  function trackOf(ex) { return trackById[ex.track ? String(ex.track) : DEFAULT_TRACK]; }
  function solvedCount(tr) { return tr.items.filter(isSolved).length; }
  function goldCount(tr) { return G.countMedals(progress, tr.items, 3); }
  function progressLabel(tr) {
    if (!isAvailable(tr)) return T('track.soon');
    var gold = goldCount(tr);
    return T('track.progress', { solved: solvedCount(tr), total: tr.items.length }) + (gold ? T('track.progressGold', { n: gold }) : '');
  }
  function nextAvailableTrack(tr) {
    var idx = tracks.indexOf(tr);
    for (var i = idx + 1; i < tracks.length; i++) if (isAvailable(tracks[i])) return tracks[i];
    return null;
  }
  function landingUrl(tr) { return '../pfad/' + encodeURIComponent(tr.id) + '.html'; }
  function trackUrl(tr) { return '?pfad=' + encodeURIComponent(tr.id); }

  // Schreibt ?pfad=<id> (andere Parameter bleiben) und optional #<übung> in die Adresszeile.
  function updateUrl(trackId, exId) {
    var params = new URLSearchParams(window.location.search);
    params.set('pfad', trackId);
    var url = window.location.pathname + '?' + params.toString() + (exId ? '#' + exId : '');
    window.history.replaceState(null, '', url);
  }

  function firstOpenExercise(tr) {
    return tr.items.filter(function (e) { return !isSolved(e) && !isLocked(e); })[0] ||
      tr.items.filter(function (e) { return !isLocked(e); })[0] || null;
  }

  function renderTrackPicker() {
    // Fokus auf einem Pfad-Button merken, weil die Buttons neu aufgebaut werden
    var focused = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.track : null;
    els.trackTabs.innerHTML = '';
    els.trackSelect.innerHTML = '';
    tracks.forEach(function (tr) {
      var label = progressLabel(tr);
      var active = currentTrack && currentTrack.id === tr.id;

      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.track = tr.id;
      btn.className = isAvailable(tr) ? '' : 'soon';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      var name = document.createElement('span');
      name.className = 'track-name';
      name.textContent = tr.name;
      var count = document.createElement('span');
      count.className = 'track-count';
      count.textContent = label;
      btn.append(name, document.createTextNode(' '), count); // Leerzeichen für den zugänglichen Namen
      btn.addEventListener('click', function () { selectTrack(tr, { trigger: btn }); });
      li.appendChild(btn);
      els.trackTabs.appendChild(li);

      var opt = document.createElement('option');
      opt.value = tr.id;
      opt.textContent = tr.name + ' (' + label + ')';
      if (active) opt.selected = true;
      els.trackSelect.appendChild(opt);
    });
    if (focused) {
      var again = els.trackTabs.querySelector('button[data-track="' + focused + '"]');
      if (again) again.focus();
    }
  }

  // Wechselt den angezeigten Pfad. Öffnet die erste offene Übung des Pfads, ausser opts.exercise ist gesetzt.
  function selectTrack(tr, opts) {
    opts = opts || {};
    if (!tr) return;
    currentTrack = tr;
    storageSet(STORAGE_TRACK, tr.id);
    clearTrackDone();
    if (!isAvailable(tr)) {
      updateUrl(tr.id, null);
      renderAll();
      return;
    }
    var ex = opts.exercise || firstOpenExercise(tr);
    if (ex) {
      openExercise(ex, opts.trigger || null, { noFocus: true });
    } else {
      // Nur gesperrte Übungen im Pfad: Liste zeigen, aktuelle Übung bleibt stehen
      updateUrl(tr.id, null);
      renderAll();
    }
  }

  /* ---------- Liste ---------- */

  function renderAll() {
    renderTrackPicker();
    renderList();
  }

  // «Heute fällig»: Wiederholungen aus allen Pfaden (höchstens 5, älteste zuerst). Leer: ausgeblendet.
  function exerciseById(id) { return exercises.filter(function (e) { return e.id === id; })[0] || null; }
  function renderDue() {
    if (!els.dueBox || !els.dueList || !G.dueToday) return;
    var ids = G.dueToday(progress, today(), {
      filter: function (id) { var ex = exerciseById(id); return !!ex && !isLocked(ex) && !E.isProject(ex); }
    });
    els.dueList.innerHTML = '';
    els.dueBox.hidden = !ids.length;
    ids.forEach(function (id) {
      var ex = exerciseById(id);
      var lex = lx(ex);
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'due-chip';
      btn.dataset.id = id;
      if (current && current.id === id) btn.setAttribute('aria-current', 'true');
      btn.textContent = lex.title;
      btn.setAttribute('aria-label', T('due.chipAria', { topic: lex.topic, title: lex.title }));
      btn.addEventListener('click', function () {
        track('review_open', { uebung: id });
        openExercise(ex, isMobile() ? null : btn);
      });
      li.appendChild(btn);
      els.dueList.appendChild(li);
    });
  }

  function renderList() {
    var tr = currentTrack;
    renderDue();
    els.list.innerHTML = '';
    els.listHeading.textContent = T('list.heading', { track: tr.name });
    renderHeader();

    if (!isAvailable(tr)) {
      els.list.hidden = true;
      els.listToggle.hidden = true;
      els.trackEmpty.hidden = false;
      els.trackEmptyText.textContent = T('list.emptyText', { track: tr.name });
      els.trackEmptyLink.href = landingUrl(tr);
      els.trackEmptyLink.textContent = T('list.emptyLink', { track: tr.name });
      els.listProgress.textContent = T('list.progressSoon', { track: tr.name });
      return;
    }
    els.list.hidden = false;
    els.trackEmpty.hidden = true;
    renderListToggle();

    tr.items.forEach(function (ex, i) {
      var lex = lx(ex);
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.id = ex.id;
      if (current && current.id === ex.id) btn.setAttribute('aria-current', 'true');

      var topic = document.createElement('span');
      topic.className = 'topic';
      topic.textContent = lex.topic;
      var project = E.isProject(ex);
      if (project) {
        // Projekt statt Formel: kleines Symbol, damit man sieht, dass hier Excel selbst gebraucht wird
        var kind = document.createElement('span');
        kind.className = 'kind-badge';
        kind.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 4h16v16H4zM4 9h16M9 9v11"/></svg>';
        kind.appendChild(document.createTextNode(T('list.project')));
        topic.append(' ', kind);
      }
      var title = document.createElement('span');
      title.className = 'title';
      title.textContent = (i + 1) + '. ' + lex.title;
      var state = document.createElement('span');
      state.className = 'state';
      var stateLabel = '';
      var md = G.medalOf(progress, ex);
      if (md) { state.classList.add('done'); state.innerHTML = medalSvg(md); stateLabel = T('list.solvedState', { medal: medalName(md) }); }
      else if (isLocked(ex)) { state.classList.add('locked'); state.textContent = '🔒'; stateLabel = T('list.lockedState'); }
      state.setAttribute('aria-hidden', 'true');

      btn.append(topic, title, state);
      btn.setAttribute('aria-label', (i + 1) + '. ' + (project ? T('list.projectAria') : '') + lex.topic + ': ' + lex.title + (stateLabel ? ' (' + stateLabel + ')' : ''));
      btn.addEventListener('click', function () {
        // Mobil: Liste nach der Wahl wieder einklappen, damit die Übung oben bleibt
        if (isMobile() && !isLocked(ex)) setListCollapsed(true);
        openExercise(ex, isMobile() ? null : btn);
      });
      li.appendChild(btn);
      els.list.appendChild(li);
    });
    els.listProgress.textContent = T('list.progress', { track: tr.name, solved: solvedCount(tr), total: tr.items.length, gold: goldCount(tr) });
  }

  /* Mobil (< 801 px): Übungsliste unter der Übung, eingeklappt. Auf breiten Bildschirmen ist der Knopf ausgeblendet. */
  function isMobile() { return !!(window.matchMedia && window.matchMedia(MOBILE_QUERY).matches); }
  function listCollapsed() { return els.exerciseNav.dataset.collapsed === 'true'; }
  function renderListToggle() {
    var collapsed = listCollapsed();
    els.listToggle.hidden = false;
    els.listToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    els.listToggle.textContent = collapsed ? T('list.showAll', { n: currentTrack ? currentTrack.items.length : exercises.length }) : T('list.hideAll');
  }
  function setListCollapsed(collapsed) {
    els.exerciseNav.dataset.collapsed = collapsed ? 'true' : 'false';
    renderListToggle();
  }

  /* ---------- Tabelle ---------- */

  // Übung mit dem aktuell gewählten Datensatz (für Anzeige und Prüfung)
  function activeExercise() { return current ? E.variant(lx(current), dataset) : null; }

  function renderSheet(ex, resultValue) {
    var data = E.normalizeData(ex.data, ex.target);
    var t = E.parseA1(ex.target);
    var table = els.sheet;
    while (table.rows.length) table.deleteRow(0);
    Array.prototype.slice.call(table.querySelectorAll('thead, tbody')).forEach(function (n) { n.remove(); });

    var thead = document.createElement('thead');
    var hr = document.createElement('tr');
    var corner = document.createElement('th');
    corner.scope = 'col';
    corner.innerHTML = '<span class="visually-hidden">' + escapeHtml(T('sheet.row')) + '</span>';
    hr.appendChild(corner);
    for (var c = 0; c < data[0].length; c++) {
      var th = document.createElement('th');
      th.scope = 'col';
      th.textContent = E.indexToCol(c);
      hr.appendChild(th);
    }
    thead.appendChild(hr);

    var tbody = document.createElement('tbody');
    data.forEach(function (row, r) {
      var tr = document.createElement('tr');
      if (r === 0) tr.className = 'header-row';
      var rh = document.createElement('th');
      rh.scope = 'row';
      rh.textContent = String(r + 1);
      tr.appendChild(rh);
      row.forEach(function (v, c) {
        var td = document.createElement('td');
        if (r === t.row && c === t.col) {
          td.className = 'target' + (resultValue !== undefined ? ' solved' : '');
          td.id = 'target-cell';
          if (resultValue !== undefined) {
            td.textContent = E.formatValue(resultValue);
            if (typeof resultValue === 'number') td.classList.add('num');
          } else {
            td.innerHTML = '<span class="visually-hidden">' + escapeHtml(T('sheet.targetEmpty', { cell: ex.target })) + '</span>';
          }
        } else {
          td.textContent = E.formatValue(v);
          if (typeof v === 'number') td.classList.add('num');
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    els.caption.textContent = T('sheet.caption', { title: ex.title, cell: ex.target });
    attachSheetPick();
  }

  // Zellbezüge per Klick (app/sheet-pick.js): nach jedem Neu-Rendern neu anbinden, alte Listener fallen weg
  function attachSheetPick() {
    var SP = window.ExcelDrillsSheetPick;
    if (!SP) return;
    var texts = {};
    ['tip', 'tipClose', 'target', 'targetPicked', 'refLabel', 'inserted', 'refused'].forEach(function (k) {
      // Platzhalter ({cell}, {ref}, {content}) füllt sheet-pick.js selbst
      var key = 'pick.' + k;
      var v = uiDict && typeof uiDict[key] === 'string' ? uiDict[key] : UI_DE[key];
      if (typeof v === 'string') texts[k] = v;
    });
    SP.attach({ table: els.sheet, input: els.input, locale: function () { return locale; }, ort: 'app', texts: texts });
  }

  /* ---------- Übung öffnen ---------- */

  function openExercise(ex, trigger, opts) {
    opts = opts || {};
    if (isLocked(ex)) { openPaywall(trigger, ex); return; }
    current = ex;
    dataset = 0;
    attemptCounted = false;
    wrongCounted = false;
    currentTrack = trackOf(ex);
    storageSet(STORAGE_TRACK, currentTrack.id);
    if (!opts.keepUrl) updateUrl(currentTrack.id, ex.id);

    var project = E.isProject(ex);
    renderExerciseText(ex);
    els.input.value = '';
    clearFeedback();
    clearTrackDone();
    els.nextBtn.hidden = true;
    els.variant.hidden = true;
    if (project) renderProject(lx(ex));
    else renderSheet(activeExercise());
    renderAll();
    renderMastery();
    if (isSolved(ex)) {
      setFeedback('info', [project ? T('ex.solvedProject') : T('ex.solved')]);
      els.nextBtn.hidden = !nextExercise();
    }
    if (!opts.noFocus) (project ? els.title : els.input).focus();
  }

  // Kopf und Aufgabentext der Übung im aktuellen Land
  function renderExerciseText(ex) {
    var lex = lx(ex);
    var project = E.isProject(ex);
    els.topic.textContent = lex.topic + (ex.free ? '' : T('ex.premium'));
    els.topic.className = 'tag' + (ex.free ? '' : ' premium');
    els.title.textContent = lex.title;
    els.formulaPart.hidden = project;
    els.project.hidden = !project;
    els.task.textContent = project ? lex.intro : lex.task;
    if (project) {
      els.fill.hidden = true;
    } else if (ex.fillDown) {
      els.fill.hidden = false;
      els.fill.textContent = T('ex.fill', { range: ex.fillDown, cell: ex.target });
    } else {
      els.fill.hidden = true;
    }
    els.label.textContent = T('ex.formulaLabel', { cell: ex.target });
  }

  // Nach dem Umschalten des Lands: aktuelle Übung neu darstellen. Datensatz, Runde und Eingaben bleiben.
  function rerenderCurrent() {
    renderExerciseText(current);
    if (E.isProject(current)) {
      var values = projectInputs().map(function (inp) { return inp.value; });
      renderProject(lx(current));
      projectInputs().forEach(function (inp, i) { if (values[i]) inp.value = values[i]; });
    } else {
      renderSheet(activeExercise());
    }
    clearTrackDone();
  }

  /* ---------- Projekt-Übungen ---------- */

  function loadSteps() {
    try { var o = JSON.parse(storageGet(STORAGE_STEPS) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; }
  }
  function saveStep(id, index, done) {
    var all = loadSteps();
    var list = Array.isArray(all[id]) ? all[id].filter(function (n) { return typeof n === 'number'; }) : [];
    var pos = list.indexOf(index);
    if (done && pos === -1) list.push(index);
    if (!done && pos !== -1) list.splice(pos, 1);
    if (list.length) all[id] = list; else delete all[id];
    storageSet(STORAGE_STEPS, JSON.stringify(all));
  }

  function renderProject(ex) {
    var fileName = String(ex.file || '').split('/').pop();
    els.pjDownload.href = ex.file;
    els.pjDownload.setAttribute('download', fileName);
    els.pjFile.textContent = T('pj.file', { file: fileName, kind: ex.free ? T('pj.free') : T('pj.premium') });

    var done = loadSteps()[ex.id] || [];
    els.pjSteps.innerHTML = '';
    (ex.steps || []).forEach(function (text, i) {
      var li = document.createElement('li');
      var label = document.createElement('label');
      label.className = 'pj-step';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = done.indexOf(i) !== -1;
      cb.addEventListener('change', function () { saveStep(ex.id, i, cb.checked); li.classList.toggle('done', cb.checked); });
      var span = document.createElement('span');
      span.textContent = text;
      label.append(cb, span);
      li.appendChild(label);
      if (cb.checked) li.classList.add('done');
      els.pjSteps.appendChild(li);
    });

    els.pjQuestions.innerHTML = '';
    (ex.questions || []).forEach(function (q, i) {
      var li = document.createElement('li');
      li.className = 'pj-q';
      var label = document.createElement('label');
      label.htmlFor = 'pj-a-' + i;
      label.textContent = q.q;
      var row = document.createElement('div');
      row.className = 'pj-row';
      var input = document.createElement('input');
      input.type = 'text';
      input.id = 'pj-a-' + i;
      input.className = 'formula-input pj-input';
      input.setAttribute('inputmode', 'decimal');
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('aria-describedby', 'pj-fb-' + i);
      row.appendChild(input);
      if (q.unit) {
        var unit = document.createElement('span');
        unit.className = 'pj-unit';
        unit.textContent = q.unit;
        row.appendChild(unit);
      }
      var fb = document.createElement('p');
      fb.className = 'pj-fb';
      fb.id = 'pj-fb-' + i;
      li.append(label, row, fb);
      els.pjQuestions.appendChild(li);
    });
  }

  function projectInputs() { return Array.prototype.slice.call(els.pjQuestions.querySelectorAll('input')); }

  function clearProjectAnswers() {
    projectInputs().forEach(function (inp, i) {
      inp.value = '';
      inp.removeAttribute('aria-invalid');
      var li = inp.closest('li');
      if (li) li.classList.remove('ok', 'err');
      var fb = document.getElementById('pj-fb-' + i);
      if (fb) fb.textContent = '';
    });
  }

  function onProjectCheck(evt) {
    evt.preventDefault();
    if (!current || !E.isProject(current)) return;
    var inputs = projectInputs();
    var result = E.checkProject(lx(current), inputs.map(function (inp) { return inp.value; }));
    var firstWrong = null;
    result.results.forEach(function (r, i) {
      var inp = inputs[i];
      var li = inp.closest('li');
      li.classList.toggle('ok', r.ok);
      li.classList.toggle('err', !r.ok);
      if (r.ok) inp.removeAttribute('aria-invalid'); else inp.setAttribute('aria-invalid', 'true');
      document.getElementById('pj-fb-' + i).textContent = (r.ok ? '✓ ' : '✗ ') + r.message;
      if (!r.ok && !firstWrong) firstWrong = inp;
    });
    if (result.ok) {
      var lines = [result.message];
      var outcome = countSolve(lines);
      setFeedback('ok', lines);
      afterSolve(outcome);
    } else {
      setFeedback('err', [result.message]);
      els.nextBtn.hidden = true;
      if (firstWrong) firstWrong.focus();
    }
  }

  // «Nochmal mit anderen Zahlen»: neuer Datensatz (zufällig, nicht derselbe wie zuletzt)
  function startAgain() {
    if (!current) return;
    var m = progress.mastery[current.id];
    dataset = G.pickDataset(current, m && typeof m.last === 'number' ? m.last : dataset);
    attemptCounted = false;
    wrongCounted = false;
    els.input.value = '';
    if (E.isProject(current)) {
      clearTrackDone();
      els.nextBtn.hidden = true;
      clearProjectAnswers();
      els.variant.hidden = false;
      els.variant.textContent = T('again.projectNote');
      renderMastery();
      setFeedback('info', [T('again.projectRound')]);
      var first = projectInputs()[0];
      if (first) first.focus();
      return;
    }
    clearTrackDone();
    els.nextBtn.hidden = true;
    var total = G.datasetCount(current);
    els.variant.hidden = false;
    if (total > 1) {
      els.variant.textContent = dataset === 0 ? T('again.original') : T('again.other', { n: dataset + 1, total: total });
    } else {
      els.variant.textContent = T('again.noAlt');
    }
    renderSheet(activeExercise());
    renderMastery();
    setFeedback('info', [T('again.round')]);
    els.input.focus();
  }

  // Medaille und nächstes Ziel im Übungskopf, Text auf dem «Nochmal»-Button
  function renderMastery() {
    if (!current) return;
    var m = progress.mastery[current.id];
    var md = G.medal(m, current);
    els.medal.innerHTML = md ? medalSvg(md) + '<span>' + escapeHtml(medalName(md) + (G.hasAlt(current) || md < 3 ? '' : T('mastery.repeatSuffix'))) + '</span>' : '';
    els.medal.className = 'ex-medal' + (md ? ' has-medal' : '');
    var info = G.nextMedalInfo(m, current);
    els.mastery.textContent = md && md < 3 ? T('mastery.' + info.key, { n: info.n }) : '';
    els.againBtn.textContent = G.hasAlt(current) ? T('again.btnAlt') : T('again.btnRepeat');
    els.againBtn.hidden = !md;
  }

  // Nächste Übung innerhalb des Pfads der aktuellen Übung
  function nextExercise() {
    if (!current) return null;
    var items = trackOf(current).items;
    var idx = items.indexOf(current);
    return idx >= 0 && idx < items.length - 1 ? items[idx + 1] : null;
  }

  /* ---------- Abschluss eines Pfads ---------- */

  function clearTrackDone() { els.trackDone.hidden = true; els.trackDone.innerHTML = ''; }

  function showTrackDone(tr) {
    var total = tr.items.length;
    var solved = solvedCount(tr);
    var open = tr.items.filter(function (e) { return !isSolved(e); });
    var lockedOpen = open.filter(isLocked).length;
    els.trackDone.innerHTML = '';

    var h = document.createElement('h2');
    var p = document.createElement('p');
    var actions = document.createElement('p');
    actions.className = 'actions';

    if (solved === total) {
      h.textContent = T('done.title', { track: tr.name });
      p.textContent = T('done.all', { n: total });
      var next = nextAvailableTrack(tr);
      if (next) {
        var a = document.createElement('a');
        a.className = 'btn';
        a.href = trackUrl(next);
        a.textContent = T('done.next', { track: next.name });
        a.addEventListener('click', function (e) {
          e.preventDefault();
          selectTrack(next, { trigger: a });
          if (current && trackOf(current) === next) (E.isProject(current) ? els.title : els.input).focus();
        });
        actions.appendChild(a);
      } else {
        var more = document.createElement('a');
        more.className = 'btn btn-secondary';
        more.href = '../pfad/';
        more.textContent = T('done.allTracks');
        actions.appendChild(more);
        p.textContent += T('done.more');
      }
    } else {
      h.textContent = T('done.lastTitle', { track: tr.name });
      p.textContent = T('done.count', { solved: solved, total: total });
      if (lockedOpen === open.length) {
        p.textContent += T('done.premiumRest', { n: lockedOpen });
        var prem = document.createElement('a');
        prem.className = 'btn';
        prem.href = '../premium.html';
        prem.hreflang = 'de-CH';
        prem.textContent = T('paywall.cta');
        actions.appendChild(prem);
      } else {
        var firstOpen = open.filter(function (e) { return !isLocked(e); })[0];
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn';
        b.textContent = T('done.firstOpen');
        b.addEventListener('click', function () { openExercise(firstOpen, b); });
        actions.appendChild(b);
      }
    }
    els.trackDone.append(h, p, actions);
    els.trackDone.hidden = false;
  }

  /* ---------- Feedback ---------- */

  function clearFeedback() { els.feedback.className = 'feedback'; els.feedback.innerHTML = ''; }
  function setFeedback(kind, lines) {
    els.feedback.className = 'feedback ' + kind;
    els.feedback.innerHTML = '';
    lines.forEach(function (line) {
      var p = document.createElement('p');
      p.textContent = line;
      els.feedback.appendChild(p);
    });
  }

  function onCheck(evt) {
    evt.preventDefault();
    if (!current || !HF) return;
    var formula = els.input.value;
    var result;
    try {
      result = E.check(HF, activeExercise(), formula);
    } catch (e) {
      setFeedback('err', [T('check.unexpected')]);
      if (window.console) console.error(e);
      return;
    }
    recordDna(result, formula);

    if (result.ok) {
      var lines = [result.message];
      var outcome = countSolve(lines);
      if (result.tip) lines.push(result.tip);
      setFeedback('ok', lines);
      renderSheet(activeExercise(), result.value);
      afterSolve(outcome);
    } else {
      var errLines = [result.message];
      // #ERROR! ist ein HyperFormula-Parsefehler; echtes Excel zeigt dafür eine Meldung statt eines Zellwerts.
      if (result.errorValue && result.errorValue !== '#ERROR!') errLines.push(T('check.excelShows', { err: result.errorValue }));
      else if (result.value !== undefined && result.value !== null) errLines.push(T('check.yourResult', { value: E.formatValue(result.value) }));
      setFeedback('err', errLines);
      els.nextBtn.hidden = true;
    }
  }

  // Fehler-DNA und Wiederholung: Kategorie bestimmen (app/errors.js) und Versuch verbuchen.
  // Pro Runde zählt höchstens ein Fehlversuch und eine korrekte Lösung, damit mehrfaches Prüfen nichts verzerrt.
  function recordDna(result, formula) {
    if (!current || !G.recordAttempt) return;
    if (result.ok ? attemptCounted : wrongCounted) return;
    if (!result.ok) wrongCounted = true;
    var category = null;
    try {
      var info = ERR ? ERR.classify(result, formula, { category: EX_CATEGORY[current.id] || 'modell', mustUse: current.mustUse, mustContain: current.mustContain, hints: current.hints }) : null;
      category = info ? info.category : null;
    } catch (e) { if (window.console) console.error(e); }
    G.recordAttempt(progress, current.id, category, !!result.ok, today());
    saveProgress();
  }

  // Verbucht eine korrekte Lösung (einmal pro Runde) und ergänzt die erste Feedback-Zeile um Medaille/XP.
  function countSolve(lines) {
    if (attemptCounted) {
      lines.push(T('solve.counted', { btn: els.againBtn.textContent }));
      return null;
    }
    attemptCounted = true;
    var outcome = G.recordSolve(progress, current, dataset, new Date());
    saveProgress();
    lines[0] += solveText(outcome);
    return outcome;
  }

  // Gemeinsamer Abschluss nach einer korrekten Lösung (Formel und Projekt)
  function afterSolve(outcome) {
    renderAll();
    renderMastery();
    els.variant.hidden = true;
    if (outcome) {
      celebrate(outcome);
      if (outcome.first) track('uebung_geloest', { uebung: current.id, pfad: trackOf(current).id });
      if (outcome.goalReached && outcome.streak === 3) track('streak_3');
      if (outcome.first) maybeOfferInstall();
    }
    var next = nextExercise();
    els.nextBtn.hidden = !next;
    if (next) {
      els.nextBtn.focus();
    } else {
      // Letzte Übung des Pfads: Abschlussmeldung bzw. Hinweis auf offene Übungen
      showTrackDone(trackOf(current));
      var focusTarget = els.trackDone.querySelector('a, button');
      if (focusTarget) focusTarget.focus();
    }
  }

  /* ---------- Installation als App (PWA) ----------
   * Nach der zweiten gelösten Übung eine Karte «Auf dem Home-Bildschirm installieren», höchstens einmal pro 7 Tage.
   * Chrome/Edge/Android: eigener Button ruft den gespeicherten beforeinstallprompt auf (assets/pwa.js).
   * Safari auf iOS kennt das nicht: dort nur der Hinweis «Teilen › Zum Home-Bildschirm». Sonst (Firefox Desktop,
   * schon installiert) gar nichts.
   */
  function maybeOfferInstall() {
    if (!Pwa || Pwa.isStandalone()) return;
    if (exercises.filter(isSolved).length < INSTALL_AFTER_SOLVED) return;
    var last = Number(storageGet(STORAGE_INSTALL)) || 0;
    if (Date.now() - last < INSTALL_PAUSE_MS) return;
    var mode = Pwa.canPrompt() ? 'prompt' : (Pwa.isIosSafari() ? 'ios' : null);
    if (!mode) return;
    storageSet(STORAGE_INSTALL, String(Date.now()));
    var title = function () { return T('pwa.installTitle'); };
    if (mode === 'ios') {
      Pwa.showCard('install', { title: title, text: function () { return T('pwa.iosText'); },
        actions: [{ label: function () { return T('pwa.iosOk'); }, primary: true }] });
      return;
    }
    Pwa.showCard('install', {
      title: title,
      text: function () { return T('pwa.installText'); },
      actions: [
        { label: function () { return T('pwa.installBtn'); }, primary: true, onClick: function () {
          Pwa.promptInstall().then(function (outcome) {
            if (outcome !== 'unavailable') track('pwa_install', { ergebnis: outcome === 'accepted' ? 'akzeptiert' : 'abgelehnt' });
          });
        } },
        { label: function () { return T('pwa.later'); } }
      ]
    });
  }

  function onHint() {
    if (!current) return;
    var lex = lx(current);
    var h = (lex.hints && lex.hints.generic) || T('hint.default');
    setFeedback('info', [T('hint.prefix', { hint: h })]);
  }

  /* ---------- Paywall ---------- */

  // Inhalt je Pfad: gesperrte Übungen des Pfads (Thema und Titel im aktuellen Land), Preis, Verweis auf die Preisseite.
  function renderPaywall(tr) {
    var locked = tr ? tr.items.filter(isLocked) : [];
    els.paywallList.innerHTML = '';
    if (!locked.length) {
      els.paywallLead.textContent = T('paywall.leadGeneric');
      els.paywallList.hidden = true;
      els.paywallMore.hidden = true;
      return;
    }
    var intro = T('paywall.track.' + tr.id);
    els.paywallLead.textContent = T('paywall.lead', { n: locked.length, track: tr.name }) +
      (intro !== 'paywall.track.' + tr.id ? ' ' + intro : '');
    locked.forEach(function (ex) {
      var lex = lx(ex);
      var li = document.createElement('li');
      var topic = document.createElement('strong');
      topic.textContent = lex.topic;
      li.append(topic, document.createTextNode(': ' + lex.title));
      els.paywallList.appendChild(li);
    });
    els.paywallList.hidden = false;
    els.paywallMore.textContent = T('paywall.more');
    els.paywallMore.hidden = false;
  }

  function openPaywall(trigger, ex) {
    lastTrigger = trigger || document.activeElement;
    paywallExercise = ex || null;
    var tr = ex ? trackOf(ex) : currentTrack;
    renderPaywall(tr);
    els.codeInput.value = '';
    els.codeInput.removeAttribute('aria-invalid');
    els.codeMsg.textContent = '';
    track('paywall_gezeigt', { pfad: tr ? tr.id : 'unbekannt', uebung: ex ? ex.id : '' });
    if (typeof els.paywall.showModal === 'function') {
      els.paywall.showModal();
    } else {
      window.location.href = '../premium.html';
    }
  }
  function closePaywall() { els.paywall.close(); }

  // «Hast du schon einen Code?»: gleicher Prüfweg wie ?key= (Keys.isValid), Eingabe als Code oder ganzer Link
  function onCodeSubmit(evt) {
    evt.preventDefault();
    var raw = els.codeInput.value;
    var fail = function (msg) {
      els.codeInput.setAttribute('aria-invalid', 'true');
      els.codeMsg.className = 'fine code-err';
      els.codeMsg.textContent = msg;
      els.codeInput.focus();
    };
    if (!String(raw).trim()) { fail(T('code.empty')); return; }
    var code = Access ? Access.redeem(raw, Keys) : (Keys.isValid(raw) ? Keys.normalize(raw) : null);
    if (!code) { fail(T('code.invalid')); return; }
    storageSet(STORAGE_KEY, code);
    unlocked = true;
    var ex = paywallExercise;
    paywallExercise = null;
    lastTrigger = null;              // Fokus geht an die freigeschaltete Übung, nicht zurück zum Auslöser
    closePaywall();
    els.notice.className = '';
    els.notice.textContent = '';
    settleProgress(true);            // Level-Grenze ohne Premium entfällt
    if (ex) openExercise(ex, null);
    else { if (current) renderExerciseText(current); renderAll(); }
    toast(T('code.ok'), T('code.okText'));
  }

  // Text in die Zwischenablage; Fallback über ein markiertes Feld (ältere Browser, http)
  function copyText(text, statusEl, selectEl) {
    var done = function (okCopied) { statusEl.textContent = okCopied ? T('copy.ok') : T('copy.failed'); };
    var legacy = function () {
      var field = selectEl;
      var temp = null;
      if (!field) {
        temp = document.createElement('textarea');
        temp.value = text;
        temp.setAttribute('readonly', '');
        temp.style.position = 'fixed'; temp.style.opacity = '0';
        (gx.profile || document.body).appendChild(temp);
        field = temp;
      }
      field.focus(); field.select();
      var okCopied = false;
      try { okCopied = document.execCommand('copy'); } catch (e) { okCopied = false; }
      if (temp) temp.remove();
      done(okCopied);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, legacy);
    } else {
      legacy();
    }
  }

  // Profil: «Dein Zugangscode», nur mit Premium
  function renderAccess() {
    var code = unlocked ? storageGet(STORAGE_KEY) : null;
    els.pfAccess.hidden = !code;
    if (!code) return;
    els.accessCode.textContent = code;
    els.accessLink.value = Access ? Access.accessLink(code) : 'https://excel-drills.ch/app/?key=' + encodeURIComponent(code);
  }

  /* ---------- Gamification: Anzeige ---------- */

  var SVG_NS = 'http://www.w3.org/2000/svg';
  function weekday(i) { return T('weekdays').split(',')[i] || ''; }
  var gx = {}; // DOM-Referenzen der Gamification-Elemente
  var toastQueue = [];

  function today() { return G.dayKey(new Date()); }
  function plural(n, one, many) { return n === 1 ? one : many; }
  function dayUnit(n) { return plural(n, T('day.one'), T('day.many')); }
  function daysText(n) { return n + ' ' + dayUnit(n); }
  function medalName(md) { return T('medal.' + md); }
  function levelName(lv) { var k = 'level.name.' + lv; var v = T(k); return v === k ? G.LEVELS[lv - 1].name : v; }
  function escapeHtml(t) {
    return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // Medaille als inline SVG (1 Bronze, 2 Silber, 3 Gold)
  function medalSvg(level) {
    var cls = ['', 'bronze', 'silver', 'gold'][level] || 'bronze';
    return '<svg class="medal medal-' + cls + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path class="medal-ribbon" d="M7 2h4l2.2 7H9.2zM17 2h-4l-2.2 7h4z"/>' +
      '<circle class="medal-disc" cx="12" cy="15" r="6.5"/>' +
      '<circle class="medal-ring" cx="12" cy="15" r="4.2"/></svg>';
  }
  function badgeIconSvg(icon) {
    return '<svg class="badge-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' +
      (Badges.ICONS[icon] || Badges.ICONS.star) + '"/></svg>';
  }

  function badgeCtx() {
    return { state: progress, exercises: exercises, tracks: tracks, unlocked: unlocked, today: today(), t: uiDict ? T : null };
  }

  // Text hinter «Richtig!» je nach Ergebnis der Verbuchung
  function solveText(o) {
    var parts = [];
    if (o.medalAfter > o.medalBefore) parts.push(o.first ? medalName(o.medalAfter) : T('solve.medalReached', { medal: medalName(o.medalAfter) }));
    if (o.xp) parts.push(T('solve.xp', { n: o.xp }));
    else if (o.medalBefore === 3) parts.push(T('solve.goldDaily'));
    else parts.push(T('solve.noXp', { what: G.hasAlt(current) ? T('solve.otherNumbers') : T('solve.anotherRepeat') }));
    return ' ' + parts.join(' · ') + '.';
  }

  /* Kopfzeile: Streak, Tagesziel, Level */
  function renderHeader() {
    var t = today();
    var streak = G.currentStreak(progress, t);
    var n = G.todayCount(progress, t);
    var goal = progress.goal;
    var lv = G.levelFor(progress.xp, unlocked);

    // Vor der ersten Lösung keine Zähler mit 0 im Kopf
    if (els.gami) els.gami.hidden = !(progress.xp > 0 || Object.keys(progress.solved || {}).length > 0);
    gx.streakValue.textContent = String(streak);
    gx.streakChip.title = T('streak.inRow', { days: daysText(streak) });
    gx.streakLabel.textContent = ' ' + T('streak.label', { unit: dayUnit(streak) });
    gx.streakChip.classList.toggle('active', streak > 0);

    gx.goalText.textContent = T('goal.today', { n: Math.min(n, goal), goal: goal });
    var pct = Math.min(1, n / goal) * 100;
    gx.goalRing.setAttribute('stroke-dasharray', pct + ' 100');
    gx.goalBtn.classList.toggle('done', n >= goal);

    gx.levelNum.textContent = T('level.short', { level: lv.level });
    gx.levelName.textContent = levelName(lv.level);
    gx.levelFill.style.width = Math.round(lv.progress * 100) + '%';
    gx.levelSr.textContent = ', ' + progress.xp + ' XP' + (lv.next && !lv.nextLocked ? T('level.srToNext', { n: lv.toNext, level: lv.next.level }) : '') + T('level.srOpen');
    gx.levelBtn.title = T('level.title', { level: lv.level, name: levelName(lv.level), xp: progress.xp });
    syncGoalInputs();
    if (gx.profile.open) renderProfile();
  }

  function syncGoalInputs() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-goal-group] input'), function (inp) {
      inp.checked = Number(inp.value) === progress.goal;
    });
  }

  // Beim Sprachwechsel: wartende und sichtbare Toasts entfernen, sonst erscheinen sie in der alten Sprache
  function clearToasts() {
    toastQueue = [];
    if (gx.toasts) gx.toasts.innerHTML = '';
  }

  /* Toasts: dezent, verschwinden nach ein paar Sekunden, einer nach dem anderen */
  function toast(title, text, icon) {
    toastQueue.push({ title: title, text: text, icon: icon });
    if (toastQueue.length === 1) showNextToast();
  }
  function showNextToast() {
    var item = toastQueue[0];
    if (!item) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (item.icon ? '<span class="toast-icon">' + item.icon + '</span>' : '') +
      '<span class="toast-body"><strong>' + escapeHtml(item.title) + '</strong>' + (item.text ? ' <span>' + escapeHtml(item.text) + '</span>' : '') + '</span>';
    gx.toasts.appendChild(el);
    var hide = function () {
      el.classList.add('leaving');
      setTimeout(function () {
        if (!el.parentNode) return; // durch clearToasts() schon entfernt
        el.remove(); toastQueue.shift(); showNextToast();
      }, 200);
    };
    var timer = setTimeout(hide, 4200);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', function () { timer = setTimeout(hide, 1500); });
  }

  // Nach einer verbuchten Lösung: Tagesziel-Toast, Abzeichen, Level-up
  function celebrate(outcome) {
    if (outcome.goalReached) {
      toast(T('goal.reached'), T('goal.streak', { days: daysText(outcome.streak) }), flameSvg());
    }
    settleProgress(false);
  }

  // Abzeichen prüfen und Level-up erkennen. silent: ohne Toast/Overlay (z. B. nach Migration).
  function settleProgress(silent) {
    var earned = Badges.evaluate(badgeCtx(), new Date());
    var lv = G.levelFor(progress.xp, unlocked).level;
    var up = progress.levelSeen !== null && lv > progress.levelSeen;
    if (progress.levelSeen === null || lv > progress.levelSeen) progress.levelSeen = lv;
    saveProgress();
    renderHeader();
    if (silent) return;
    earned.forEach(function (b) { toast(T('badge.toast', { name: b.name }), b.desc, badgeIconSvg(b.icon)); });
    if (up) {
      if (lv >= LEVELUP_MODAL_FROM) openLevelUp(lv);
      else toast(T('levelup.toast', { level: lv, name: levelName(lv) }), '', badgeIconSvg('star'));
    }
  }

  function flameSvg() {
    return '<svg class="flame" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + Badges.ICONS.flame + '"/></svg>';
  }

  /* Dialoge: Fokus-Falle und Rückgabe des Fokus */
  function focusables(root) {
    return Array.prototype.filter.call(
      root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'),
      function (n) { return n.offsetParent !== null || n === document.activeElement; }
    );
  }
  function trapFocus(dialog) {
    dialog.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var list = focusables(dialog);
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  function openDialog(dialog, focusEl) {
    dialog._returnFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    if (focusEl) focusEl.focus();
  }
  function wireDialog(dialog) {
    trapFocus(dialog);
    dialog.addEventListener('close', function () {
      var back = dialog._returnFocus;
      dialog._returnFocus = null;
      if (back && back.focus && document.contains(back)) back.focus();
    });
    // Klick auf den Hintergrund schliesst
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  /* Level-up-Overlay */
  function openLevelUp(level) {
    gx.levelupNum.textContent = String(level);
    gx.levelupTitle.textContent = levelName(level);
    var lv = G.levelFor(progress.xp, unlocked);
    var text = T('levelup.text', { level: level, xp: progress.xp });
    if (lv.next && !lv.nextLocked) text += T('levelup.next', { name: levelName(lv.next.level), min: lv.next.min });
    else if (lv.nextLocked) text += T('levelup.locked');
    gx.levelupText.textContent = text;
    if (gx.levelup.open) return;
    openDialog(gx.levelup, gx.levelupOk);
  }

  /* Tagesziel-Menü im Kopf */
  function toggleGoalMenu(open) {
    var isOpen = typeof open === 'boolean' ? open : gx.goalMenu.hidden;
    gx.goalMenu.hidden = !isOpen;
    gx.goalBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      var checked = gx.goalMenu.querySelector('input:checked') || gx.goalMenu.querySelector('input');
      checked.focus();
    }
  }
  function changeGoal(value) {
    if (Number(value) === progress.goal) return;
    var reached = G.setGoal(progress, value, today());
    saveProgress();
    if (reached) toast(T('goal.reached'), T('goal.streak', { days: daysText(G.currentStreak(progress, today())) }), flameSvg());
    settleProgress(false);
  }

  /* Profil-Panel */
  function renderProfile() {
    var t = today();
    var lv = G.levelFor(progress.xp, unlocked);
    var streak = G.currentStreak(progress, t);

    var nextLine;
    if (!lv.next) nextLine = escapeHtml(T('profile.maxLevel'));
    else if (lv.nextLocked) nextLine = escapeHtml(T('profile.nextLocked', { level: lv.next.level, name: levelName(lv.next.level) })) + ' <a href="../premium.html">' + escapeHtml(T('profile.premiumReach')) + '</a>';
    else nextLine = escapeHtml(T('profile.toNext', { n: lv.toNext, level: lv.next.level, name: levelName(lv.next.level) }));
    gx.pfLevel.innerHTML =
      '<p class="pf-level-line"><span class="pf-level-num">' + escapeHtml(T('level.word', { level: lv.level })) + '</span> <strong>' + escapeHtml(levelName(lv.level)) + '</strong> <span class="pf-xp">' + progress.xp + ' XP</span></p>' +
      '<div class="xp-bar" role="progressbar" aria-label="' + escapeHtml(T('profile.barLabel')) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(lv.progress * 100) + '">' +
      '<span style="width:' + Math.round(lv.progress * 100) + '%"></span></div>' +
      '<p class="fine">' + nextLine + '</p>';

    var best = Math.max(progress.bestStreak || 0, streak);
    gx.pfStreak.innerHTML = flameSvg() + ' <strong>' + escapeHtml(T('streak.inRow', { days: daysText(streak) })) + '</strong>' +
      (best > streak ? ' <span class="fine">' + escapeHtml(T('profile.best', { days: daysText(best) })) + '</span>' : '');

    var week = G.last7(progress, t);
    var max = Math.max(progress.goal, Math.max.apply(null, week.map(function (d) { return d.count; })));
    gx.pfWeek.innerHTML = '';
    week.forEach(function (d) {
      var date = new Date(Number(d.date.slice(0, 4)), Number(d.date.slice(5, 7)) - 1, Number(d.date.slice(8, 10)));
      var li = document.createElement('li');
      li.className = (d.met ? 'met' : '') + (d.today ? ' today' : '');
      var label = T('profile.dayLabel', { weekday: weekday(date.getDay()), date: date.getDate() + '.' + (date.getMonth() + 1) + '.', n: d.count, unit: plural(d.count, T('exercise.one'), T('exercise.many')) }) +
        (d.met ? T('profile.dayMet') : '');
      li.setAttribute('aria-label', label);
      li.innerHTML = '<span class="week-bar" aria-hidden="true"><span style="height:' + Math.round((d.count / max) * 100) + '%"></span></span>' +
        '<span class="week-count" aria-hidden="true">' + d.count + '</span>' +
        '<span class="week-day" aria-hidden="true">' + escapeHtml(d.today ? T('profile.today') : weekday(date.getDay())) + '</span>';
      gx.pfWeek.appendChild(li);
    });

    var solved = exercises.filter(isSolved).length;
    var gold = G.countMedals(progress, exercises, 3);
    var silver = G.countMedals(progress, exercises, 2) - gold;
    gx.pfStats.innerHTML =
      '<div><dt>' + escapeHtml(T('profile.solved')) + '</dt><dd>' + solved + ' <span>' + escapeHtml(T('profile.of', { n: exercises.length })) + '</span></dd></div>' +
      '<div><dt>' + escapeHtml(T('profile.gold')) + '</dt><dd>' + gold + (silver ? ' <span>' + escapeHtml(T('profile.silver', { n: silver })) + '</span>' : '') + '</dd></div>' +
      '<div><dt>' + escapeHtml(T('profile.xp')) + '</dt><dd>' + progress.xp + '</dd></div>';

    renderDna();
    renderBadges();
    renderAccess();
    if (account) account.render();
  }

  /* Fehler-DNA im Profil: Fehlerquote pro Kategorie, schwächste Kategorie mit Tipp und passender Gratis-Übung */
  function dnaLabel(c) { var k = 'dna.cat.' + c; var v = T(k); return v === k ? (ERR ? ERR.label(c) : c) : v; }
  // Deutsch: Tipp direkt aus app/errors.js; FR/IT: Übersetzung «dna.tip.<Kategorie>» aus fr.json/it.json
  function dnaTip(c) { var k = 'dna.tip.' + c; var v = T(k); return v === k ? (ERR ? ERR.tip(c) : '') : v; }
  function renderDna() {
    if (!gx.pfDna || !G.profileSummary) return;
    var sum = G.profileSummary(progress);
    gx.pfDna.innerHTML = '';
    if (!sum.attempts) {
      var empty = document.createElement('p');
      empty.className = 'fine';
      empty.textContent = T('dna.empty');
      gx.pfDna.appendChild(empty);
      return;
    }
    var ul = document.createElement('ul');
    ul.className = 'dna-bars';
    sum.categories.forEach(function (x) {
      var pct = Math.round(x.rate * 100);
      var li = document.createElement('li');
      li.className = 'dna-row' + (x.enough ? '' : ' dna-few');
      li.innerHTML = '<span class="dna-label">' + escapeHtml(dnaLabel(x.category)) + '</span>' +
        '<span class="dna-bar" role="img" aria-label="' + escapeHtml(T('dna.barAria', { pct: pct, wrong: x.wrong, total: x.total })) + '"><span style="width:' + pct + '%"></span></span>' +
        '<span class="dna-pct" aria-hidden="true">' + pct + ' %</span>';
      ul.appendChild(li);
    });
    gx.pfDna.appendChild(ul);
    var note = document.createElement('p');
    note.className = 'fine';
    note.textContent = T('dna.note', { n: G.MIN_ATTEMPTS });
    gx.pfDna.appendChild(note);

    var weak = sum.weakest;
    var box = document.createElement('div');
    box.className = 'dna-weak';
    if (!weak) {
      box.innerHTML = '<p>' + escapeHtml(T('dna.noWeak', { n: G.MIN_ATTEMPTS })) + '</p>';
      gx.pfDna.appendChild(box);
      return;
    }
    box.innerHTML = '<p><strong>' + escapeHtml(T('dna.weakest', { category: dnaLabel(weak.category) })) + '</strong></p>' +
      '<p>' + escapeHtml(dnaTip(weak.category)) + '</p>';
    var ex = exerciseById(CATEGORY_EXERCISE[weak.category]);
    if (ex && !isLocked(ex)) {
      var p = document.createElement('p');
      var a = document.createElement('a');
      a.href = '?pfad=' + encodeURIComponent(trackOf(ex).id) + '#' + encodeURIComponent(ex.id);
      a.textContent = T('dna.practice', { title: lx(ex).title });
      a.addEventListener('click', function (e) {
        e.preventDefault();
        gx.profile._returnFocus = null; // Fokus geht auf die Übung, nicht zurück auf den Level-Knopf
        gx.profile.close();
        openExercise(ex, null);
      });
      p.appendChild(a);
      box.appendChild(p);
    }
    gx.pfDna.appendChild(box);
  }

  function renderBadges() {
    var list = Badges.status(badgeCtx());
    gx.pfBadges.innerHTML = '';
    list.forEach(function (b) {
      var li = document.createElement('li');
      li.className = 'badge-card ' + b.status;
      var statusHtml;
      if (b.status === 'earned') statusHtml = '<span class="visually-hidden">' + escapeHtml(T('badge.earned')) + '</span>';
      else if (b.status === 'gated') statusHtml = '<a class="badge-premium" href="../premium.html">' + escapeHtml(T('profile.premiumReach')) + '</a>';
      else statusHtml = '<span class="visually-hidden">' + escapeHtml(T('badge.locked')) + '</span>';
      li.innerHTML = '<span class="badge-medallion">' + badgeIconSvg(b.icon) + '</span>' +
        '<span class="badge-name">' + escapeHtml(b.name) + '</span>' +
        '<span class="badge-desc">' + escapeHtml(b.desc) + '</span>' + statusHtml;
      if (b.status === 'earned') {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-secondary btn-small';
        btn.textContent = T('badge.share');
        btn.setAttribute('aria-label', T('badge.shareAria', { name: b.name }));
        btn.addEventListener('click', function () { shareBadge(b, btn); });
        li.appendChild(btn);
      }
      gx.pfBadges.appendChild(li);
    });
  }

  function openProfile(scrollTo) {
    gx.resetConfirm.hidden = true;
    gx.resetBtn.hidden = false;
    gx.shareArea.hidden = true;
    els.accessMsg.textContent = '';
    renderProfile();
    openDialog(gx.profile, gx.profileClose);
    if (scrollTo && scrollTo.scrollIntoView) scrollTo.scrollIntoView({ block: 'start' });
  }

  /* ---------- Konto (app/account.js) ---------- */

  // Stand vom Server (bzw. vereinigt) übernehmen und alles neu zeichnen, ohne Toasts
  function applyRemoteState(state) {
    progress = G.migrate(state);
    if (!exercises.length) { saveProgress(); renderHeader(); return; }   // Übungen noch nicht geladen: init zeichnet später
    settleProgress(true);
    if (currentTrack) renderAll();
    if (current) renderMastery();
    if (gx.profile.open) renderProfile();   // Fehler-DNA und Medaillen im offenen Profil nachführen
  }

  // Lizenz aus dem Konto: decision von licenseDecision (oder null = abgemeldet / unbekannt)
  function setAccountPremium(decision) {
    accountPremium = !!(decision && decision.source === 'license');
    var next = Keys.isValid(storageGet(STORAGE_KEY)) || accountPremium;
    if (next !== unlocked) {
      unlocked = next;
      if (exercises.length) settleProgress(true);
      if (current) renderExerciseText(current);
      if (currentTrack) renderAll();
      if (unlocked && els.paywall.open && paywallExercise) {
        var ex = paywallExercise;
        paywallExercise = null;
        lastTrigger = null;
        closePaywall();
        openExercise(ex, null);
      }
    }
    if (gx.profile.open) renderProfile();
  }

  function initAccount() {
    if (!AccountMod || !AccountMod.enabled()) return;
    account = AccountMod.boot({
      T: T, escapeHtml: escapeHtml, toast: toast, notice: showNotice, track: track,
      openDialog: openDialog, wireDialog: wireDialog, openProfile: openProfile,
      getState: function () { return G.serialize(progress); },
      setState: applyRemoteState,
      setPremium: setAccountPremium,
      localCodeValid: function () { return Keys.isValid(storageGet(STORAGE_KEY)); }
    });
  }

  function resetProgress() {
    var goal = progress.goal;
    progress = G.emptyState();
    progress.goal = goal;
    progress.levelSeen = 1;
    saveProgress();
    gx.resetConfirm.hidden = true;
    gx.resetBtn.hidden = false;
    gx.shareArea.hidden = true;
    if (current) openExercise(current, null, { noFocus: true, keepUrl: true });
    renderHeader();
    renderProfile();
    gx.resetBtn.focus();
    toast(T('profile.reset'), '');
  }

  /* Teilen: 1080×1080-PNG per Canvas (nur Systemschriften) */
  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

  function fitText(ctx, text, maxWidth, size, weight) {
    var s = size;
    do { ctx.font = weight + ' ' + s + 'px ' + FONT; s -= 4; } while (ctx.measureText(text).width > maxWidth && s > 24);
  }

  function renderShareCanvas(badge) {
    var W = 1080;
    var c = document.createElement('canvas');
    c.width = W; c.height = W;
    var ctx = c.getContext('2d');
    var green = '#107C41';

    ctx.fillStyle = green;
    ctx.fillRect(0, 0, W, W);
    // dezente Rasterlinien wie in einer Tabelle
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 2;
    for (var x = 0; x <= W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, W); ctx.stroke(); }
    for (var y = 0; y <= W; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Medaillon
    var cx = W / 2, cy = 380, r = 190;
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy + 10, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#e7f3ec'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(cx, cy, r - 26, 0, Math.PI * 2); ctx.stroke();
    var icon = new Path2D(Badges.ICONS[badge.icon] || Badges.ICONS.star);
    ctx.save();
    var scale = 9;
    ctx.translate(cx - 12 * scale, cy - 12 * scale);
    ctx.scale(scale, scale);
    ctx.strokeStyle = green; ctx.lineWidth = 1.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(icon);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '700 34px ' + FONT;
    ctx.fillText(T('share.eyebrow'), cx, 660);
    ctx.fillStyle = '#ffffff';
    fitText(ctx, badge.name, W - 160, 92, '800');
    ctx.fillText(badge.name, cx, 760);

    var lv = G.levelFor(progress.xp, unlocked);
    var streak = G.currentStreak(progress, today());
    ctx.font = '600 40px ' + FONT;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillText(T('share.line', { level: T('level.word', { level: lv.level }), name: levelName(lv.level), days: daysText(streak) }), cx, 840);

    // Wortmarke
    var markY = 960;
    ctx.font = '800 46px ' + FONT;
    var word = 'excel-drills';
    var ww = ctx.measureText(word).width;
    var box = 58, gap = 18, total = box + gap + ww, left = cx - total / 2;
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, left, markY - box + 8, box, box, 12);
    ctx.fill();
    ctx.fillStyle = green;
    ctx.font = '800 36px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('X', left + box / 2, markY - 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 46px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText(word, left + box + gap, markY);
    return c;
  }
  function roundRect(ctx, x, y, w, h, rr) {
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  var shareUrl = null;
  function shareBadge(badge, trigger) {
    var canvas = renderShareCanvas(badge);
    canvas.toBlob(function (blob) {
      if (!blob) { toast(T('share.failed'), ''); return; }
      if (shareUrl) URL.revokeObjectURL(shareUrl);
      shareUrl = URL.createObjectURL(blob);
      var fileName = T('share.file', { id: badge.id });
      var area = gx.shareArea;
      area.innerHTML = '';
      var h = document.createElement('h4');
      h.textContent = T('share.title', { name: badge.name });
      var img = document.createElement('img');
      img.src = shareUrl;
      img.alt = T('share.alt', { name: badge.name });
      img.width = 1080; img.height = 1080;
      img.className = 'share-preview';
      var row = document.createElement('div');
      row.className = 'actions';
      var a = document.createElement('a');
      a.className = 'btn btn-small';
      a.href = shareUrl;
      a.download = fileName;
      a.id = 'share-download';
      a.textContent = T('share.download');
      row.appendChild(a);
      var file = null;
      try { file = new File([blob], fileName, { type: 'image/png' }); } catch (e) { file = null; }
      if (file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
        var sb = document.createElement('button');
        sb.type = 'button';
        sb.className = 'btn btn-secondary btn-small';
        sb.textContent = T('share.button');
        sb.addEventListener('click', function () {
          navigator.share({ files: [file], title: 'Excel-Drills: ' + badge.name, text: T('share.text', { name: badge.name }) })
            .catch(function () { /* abgebrochen */ });
        });
        row.appendChild(sb);
      }
      area.append(h, img, row);
      area.hidden = false;
      area.dataset.size = canvas.width + 'x' + canvas.height;
      a.focus();
    }, 'image/png');
  }

  function initGamification() {
    gx = {
      streakChip: $('streak-chip'), streakValue: $('streak-value'), streakLabel: $('streak-label'),
      goalBtn: $('goal-btn'), goalMenu: $('goal-menu'), goalText: $('goal-text'), goalRing: $('goal-ring-fg'),
      levelBtn: $('level-btn'), levelNum: $('level-num'), levelName: $('level-name'), levelFill: $('level-fill'), levelSr: $('level-sr'),
      profile: $('profile'), profileClose: $('profile-close'), pfLevel: $('pf-level'), pfStreak: $('pf-streak'), pfWeek: $('pf-week'),
      pfStats: $('pf-stats'), pfBadges: $('pf-badges'), shareArea: $('share-area'), pfDna: $('pf-dna'),
      resetBtn: $('reset-btn'), resetConfirm: $('reset-confirm'), resetYes: $('reset-yes'), resetNo: $('reset-no'),
      levelup: $('levelup'), levelupNum: $('levelup-num'), levelupTitle: $('levelup-title'), levelupText: $('levelup-text'), levelupOk: $('levelup-ok'),
      toasts: $('toasts')
    };
    wireDialog(gx.profile);
    wireDialog(gx.levelup);
    gx.levelBtn.addEventListener('click', function () { openProfile(null); });
    gx.profileClose.addEventListener('click', function () { gx.profile.close(); });
    gx.levelupOk.addEventListener('click', function () { gx.levelup.close(); });

    gx.goalBtn.addEventListener('click', function () { toggleGoalMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !gx.goalMenu.hidden) { e.preventDefault(); toggleGoalMenu(false); gx.goalBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!gx.goalMenu.hidden && !gx.goalMenu.contains(e.target) && !gx.goalBtn.contains(e.target)) toggleGoalMenu(false);
    });
    gx.goalMenu.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !gx.goalMenu.contains(e.relatedTarget) && e.relatedTarget !== gx.goalBtn) toggleGoalMenu(false);
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-goal-group] input'), function (inp) {
      inp.addEventListener('change', function () { if (inp.checked) changeGoal(inp.value); });
    });

    gx.resetBtn.addEventListener('click', function () { gx.resetBtn.hidden = true; gx.resetConfirm.hidden = false; gx.resetNo.focus(); });
    gx.resetNo.addEventListener('click', function () { gx.resetConfirm.hidden = true; gx.resetBtn.hidden = false; gx.resetBtn.focus(); });
    gx.resetYes.addEventListener('click', resetProgress);

    renderHeader();
  }

  /* ---------- Start ---------- */

  function fail(message) {
    els.loading.hidden = true;
    showNotice(message, true);
  }

  // Startpfad und Startübung: #<id> hat Vorrang (wählt den Pfad der Übung), dann ?pfad=, dann zuletzt
  // benutzter Pfad, dann der erste Pfad mit Übungen.
  function chooseStart() {
    var fromHash = decodeURIComponent(window.location.hash.slice(1));
    var hashEx = exercises.filter(function (e) { return e.id === fromHash; })[0] || null;
    var params = new URLSearchParams(window.location.search);
    var tr = (hashEx && trackOf(hashEx)) ||
      trackById[params.get('pfad')] ||
      (isAvailable(trackById[storageGet(STORAGE_TRACK)]) ? trackById[storageGet(STORAGE_TRACK)] : null) ||
      tracks.filter(isAvailable)[0] || tracks[0];
    var ex = hashEx && !isLocked(hashEx) ? hashEx : null;
    return { track: tr, exercise: ex, lockedHash: hashEx && isLocked(hashEx) ? hashEx : null };
  }

  // Mini-Übung der Startseite (assets/mini-drill.js) als Übung 1 übernehmen: Bronze, XP, Abzeichen «Erste Formel»
  function importMiniSolve() {
    if (!storageGet(STORAGE_MINI)) return;
    storageRemove(STORAGE_MINI);
    var ex = exercises.filter(function (e) { return e.id === MINI_EXERCISE; })[0];
    if (!ex || isSolved(ex)) return;
    var outcome = G.recordSolve(progress, ex, 0, new Date());
    saveProgress();
    toast(T('mini.imported'), T('mini.importedText', { xp: outcome.xp }), medalSvg(1));
    track('uebung_geloest', { uebung: ex.id, pfad: trackOf(ex).id, ort: 'startseite' });
    settleProgress(false);
  }

  // Zeichenleiste über dem Formelfeld (nur mobil sichtbar): fügt an der Cursorposition ein
  function initSymbolBar() {
    if (!els.symbolBar) return;
    // Knopf soll den Fokus nicht aus dem Feld nehmen (Tastatur bleibt offen)
    els.symbolBar.addEventListener('mousedown', function (e) { if (e.target.closest('button')) e.preventDefault(); });
    els.symbolBar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-insert]');
      if (!b) return;
      var inp = els.input;
      var text = b.dataset.insert;
      var start = typeof inp.selectionStart === 'number' ? inp.selectionStart : inp.value.length;
      var end = typeof inp.selectionEnd === 'number' ? inp.selectionEnd : start;
      inp.value = inp.value.slice(0, start) + text + inp.value.slice(end);
      inp.focus();
      try { inp.setSelectionRange(start + text.length, start + text.length); } catch (err) { /* ignorieren */ }
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  function init() {
    if (!E || !Keys || !G || !Badges) { fail(T('notice.appFailed')); return; }
    var wanted = resolveLocale();
    locale = E.setLocale(E.langOf(wanted) === 'de' ? wanted : 'de-CH');
    if (Pwa) Pwa.setTranslator(T);
    applyLocaleUi();
    unlocked = resolveUnlock();
    initLocaleSwitch();

    els.form.addEventListener('submit', onCheck);
    els.pjForm.addEventListener('submit', onProjectCheck);
    els.hintBtn.addEventListener('click', onHint);
    els.nextBtn.addEventListener('click', function () {
      var n = nextExercise();
      if (n) openExercise(n, els.nextBtn);
    });
    els.trackSelect.addEventListener('change', function () {
      selectTrack(trackById[els.trackSelect.value], { trigger: els.trackSelect });
    });
    els.againBtn.addEventListener('click', startAgain);
    // Direktlink innerhalb der Seite (nur Hash ändert sich, z.B. aus Artikeln im selben Tab)
    window.addEventListener('hashchange', function () {
      var id = decodeURIComponent(window.location.hash.slice(1));
      var ex = id && exercises.filter(function (e) { return e.id === id; })[0];
      if (ex && (!current || current.id !== ex.id)) openExercise(ex, null, { keepUrl: true });
    });
    els.paywallClose.addEventListener('click', closePaywall);
    els.codeForm.addEventListener('submit', onCodeSubmit);
    els.codeInput.addEventListener('input', function () { els.codeInput.removeAttribute('aria-invalid'); });
    els.accessCopy.addEventListener('click', function () { copyText(els.accessCode.textContent, els.accessMsg, null); });
    els.accessLinkCopy.addEventListener('click', function () { copyText(els.accessLink.value, els.accessMsg, els.accessLink); });
    els.accessLink.addEventListener('focus', function () { els.accessLink.select(); });
    els.listToggle.addEventListener('click', function () { setListCollapsed(!listCollapsed()); });
    // Skip-Link: direkt ins Formelfeld (bei Projekten auf den Titel), nicht nur auf <main>
    els.skipLink.addEventListener('click', function (e) {
      var target = !els.view.hidden && current && !E.isProject(current) && !els.input.disabled ? els.input
        : (!els.view.hidden ? els.title : els.main);
      e.preventDefault();
      target.focus();
    });
    initSymbolBar();
    initGamification();
    initAccount();
    els.paywall.addEventListener('close', function () { if (lastTrigger && lastTrigger.focus) lastTrigger.focus(); });
    els.paywall.addEventListener('click', function (e) { if (e.target === els.paywall) closePaywall(); });

    // Übungen und (für FR/IT) die Übersetzung parallel laden. Schlägt die Übersetzung fehl, bleibt die App auf Deutsch.
    var i18nReady = Promise.all([loadI18n(wanted), loadLangPack(wanted)]).then(function (res) {
      var okLoaded = res[0];
      if (okLoaded && wanted !== locale) { locale = E.setLocale(wanted); applyLocaleUi(); }
      else if (!okLoaded) showNotice(T('notice.langFailed'), true);
    });
    Promise.all([fetch('exercises.json', { cache: 'no-cache' }), i18nReady])
      .then(function (res) { var r = res[0]; if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        exercises = json.exercises || [];
        if (!exercises.length) { fail(T('notice.noExercises')); return; }
        buildTracks(json);
        relabelTracks();
        settleProgress(migratedFromV1);
        importMiniSolve();
        var engineReady = false;
        try {
          HF = window.HyperFormula;
          if (!HF) throw new Error('HyperFormula fehlt');
          E.init(HF);
          engineReady = true;
        } catch (e) {
          HF = null;
          showNotice(T('notice.engineFailed'), true);
        }
        els.checkBtn.disabled = !engineReady || !E.hasLanguage(locale);
        if (engineReady && !E.hasLanguage(locale)) showNotice(T('notice.langEngine'), true);
        els.loading.hidden = true;
        els.trackPicker.hidden = false;
        els.view.hidden = false;

        var start = chooseStart();
        currentTrack = start.track;
        if (isAvailable(start.track)) {
          var ex = start.exercise || firstOpenExercise(start.track);
          if (ex) {
            // Desktop: Formelfeld gleich fokussieren. Mobil nicht (die Bildschirmtastatur würde die Aufgabe verdecken).
            openExercise(ex, null, { noFocus: isMobile() });
          } else {
            // Pfad enthält nur Premium-Übungen: erste verfügbare Übung eines anderen Pfads zeigen
            var other = exercises.filter(function (e) { return !isLocked(e); })[0] || exercises[0];
            openExercise(other, null, { noFocus: true, keepUrl: true });
            currentTrack = start.track;
            updateUrl(start.track.id, null);
            renderAll();
          }
        } else {
          // «Bald verfügbar»: Liste zeigt den Hinweis, im Hauptbereich steht die erste Übung des ersten Pfads
          var fallback = tracks.filter(isAvailable)[0];
          var fbEx = fallback && firstOpenExercise(fallback);
          if (fbEx) openExercise(fbEx, null, { noFocus: true, keepUrl: true });
          currentTrack = start.track;
          updateUrl(start.track.id, null);
          renderAll();
        }
        if (start.lockedHash) openPaywall(null, start.lockedHash);
      })
      .catch(function (e) {
        if (window.console) console.error(e);
        fail(T('notice.loadFailed'));
      });
  }

  init();
})();
