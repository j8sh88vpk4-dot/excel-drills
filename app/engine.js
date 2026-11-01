/*
 * Excel-Drills – Prüf-Engine
 * Bewertet eine Nutzerformel gegen die Musterlösung einer Übung mit HyperFormula (deDE).
 * Läuft im Browser (window.ExcelDrillsEngine) und in Node (scripts/check-exercises.mjs lädt
 * diese Datei per vm-Kontext), damit App und Prüfskript dieselbe Logik verwenden.
 */
(function (root) {
  'use strict';

  // Hinweis: HyperFormula 3.0.0 akzeptiert als thousandSeparator nur '', ',', ' ' oder '.'.
  // Das Schweizer Hochkomma (') ist dort nicht erlaubt. Für die Formelauswertung spielt das
  // keine Rolle (es betrifft nur das Parsen von eingetippten Zahlentexten); in der Anzeige
  // formatieren wir Zahlen selbst mit Hochkomma (formatNumber).
  var HF_CONFIG = {
    licenseKey: 'gpl-v3',
    language: 'deDE',
    functionArgSeparator: ';',
    decimalSeparator: '.',
    thousandSeparator: ''
  };

  /* ---------- Varianten (Locale) ----------
   * «de-CH» (Standard): Deutsch, Dezimalpunkt, Hochkomma als Tausendertrennzeichen, CHF, Schreibweise mit ss.
   * «de-DE»: Deutsch, Dezimalkomma, Tausenderpunkt, EUR, Schreibweise mit ß.
   * «fr-CH» / «it-CH»: Excel in der Romandie bzw. im Tessin: französische bzw. italienische Funktionsnamen
   *   (HyperFormula-Sprachpakete frFR / itIT), Zahlen wie in DE-CH (Punkt, Hochkomma), CHF.
   * «en-CH»: englisches Excel in der Schweiz (z. B. Konzernsprache Englisch): englische Funktionsnamen
   *   (HyperFormula-Standardsprache enGB, kein Sprachpaket nötig), Komma als Argumenttrenner, Zahlen wie in DE-CH, CHF.
   * Argumenttrenner in den deutschen, französischen und italienischen Varianten: «;», in en-CH «,».
   * arrayColumnSeparator bleibt ',' (Array-Konstanten kommen nicht vor).
   * Die Übungen in exercises.json sind in DE-CH geschrieben; localize() erzeugt daraus die anderen Varianten.
   * Texte für FR/IT stehen in app/i18n/fr.json und it.json (registerI18n), nicht in exercises.json.
   * en-CH: Texte bleiben deutsch, ausser die Übung hat Overrides in ex.locale.en (task, title, hints, ...).
   * Alte Werte bleiben gültig: «ch» → de-CH, «de» → de-DE (localStorage, ?land=).
   */
  var LOCALES = ['de-CH', 'de-DE', 'fr-CH', 'it-CH', 'en-CH'];
  var LOCALE_INFO = {
    'de-CH': { lang: 'de', hf: 'deDE', num: 'ch', sep: ';' },
    'de-DE': { lang: 'de', hf: 'deDE', num: 'de', sep: ';' },
    'fr-CH': { lang: 'fr', hf: 'frFR', num: 'ch', sep: ';' },
    'it-CH': { lang: 'it', hf: 'itIT', num: 'ch', sep: ';' },
    'en-CH': { lang: 'en', hf: 'enGB', num: 'ch', sep: ',', currency: 'CHF' }
  };
  var HF_CONFIG_DE = {
    licenseKey: 'gpl-v3',
    language: 'deDE',
    functionArgSeparator: ';',
    decimalSeparator: ',',
    thousandSeparator: '.'
  };
  var currentLocale = 'de-CH';
  var HFREF = null;          // HyperFormula (nach init), für die Sprachpakete
  var I18N = {};             // registrierte Übersetzungen: { fr: {...}, it: {...} }

  function normalizeLocale(l) {
    var s = String(l || '').trim().toLowerCase().replace('_', '-');
    if (s === 'de' || s === 'de-de' || s === 'dede') return 'de-DE';
    if (/^fr/.test(s)) return 'fr-CH';
    if (/^it/.test(s)) return 'it-CH';
    // Englisch: en, en-CH, en-GB, en-US (alle mit Schweizer Zahlen und CHF)
    if (/^en(-|$)/.test(s)) return 'en-CH';
    return 'de-CH';
  }
  function info(locale) { return LOCALE_INFO[normalizeLocale(locale || currentLocale)]; }
  function langOf(locale) { return info(locale).lang; }
  // Zahlenschreibweise: 'de' (Dezimalkomma) nur für de-DE, sonst 'ch'
  function numStyle(locale) { return info(locale).num; }
  function numDe(locale) { return numStyle(locale) === 'de'; }
  // Argumenttrenner der Variante: ';' (DE/FR/IT) oder ',' (en-CH)
  function argSep(locale) { return info(locale).sep; }
  function setLocale(l) { currentLocale = normalizeLocale(l); return currentLocale; }
  function getLocale() { return currentLocale; }
  function configFor(locale) {
    var i = info(locale);
    if (i.num === 'de') return HF_CONFIG_DE;
    if (i.hf === 'deDE') return HF_CONFIG;
    return { licenseKey: 'gpl-v3', language: i.hf, functionArgSeparator: i.sep, decimalSeparator: '.', thousandSeparator: '' };
  }

  /* ---------- Übersetzungen (FR/IT) ---------- */
  function registerI18n(lang, json) { I18N[String(lang)] = json || {}; msgCache[lang] = null; return I18N[lang]; }
  function i18n(lang) { return I18N[lang] || null; }
  // en-CH braucht keine Übersetzungsdatei (Meldungen in MSG_EN, Texte deutsch oder aus ex.locale.en)
  function hasI18n(locale) { var l = langOf(locale); return l === 'de' || l === 'en' || !!I18N[l]; }
  // Platzhalter {name} ersetzen
  function fill(str, params) {
    if (typeof str !== 'string' || !params) return str;
    return str.replace(/\{(\w+)\}/g, function (m, k) { return params[k] === undefined || params[k] === null ? m : String(params[k]); });
  }
  // UI-Text aus i18n/<lang>.json (ui). Rückgabe null, wenn nicht vorhanden (Aufrufer nimmt dann Deutsch).
  function uiString(lang, key) {
    var d = I18N[lang];
    return d && d.ui && typeof d.ui[key] === 'string' ? d.ui[key] : null;
  }

  /* ---------- Funktionsnamen je Sprache (aus den HyperFormula-Sprachpaketen) ----------
   * Kanonischer Schlüssel = englischer Name in HyperFormula (SUM, IF, ...). deDE.functions.SUM = 'SUMME',
   * frFR.functions.SUM = 'SOMME', itIT.functions.SUM = 'SOMMA'. Zusätzlich CONCAT (fehlt in HyperFormula):
   * DE «TEXTKETTE», FR/IT «CONCAT» (wird vor der Auswertung zu VERKETTEN/CONCATENER/CONCATENA, siehe ALIASES).
   */
  // en: enGB ist die Standardsprache von HyperFormula (immer registriert, functions.SUM = 'SUM').
  var HF_LANG = { de: 'deDE', fr: 'frFR', it: 'itIT', en: 'enGB' };
  var EXTRA_NAMES = { de: { CONCAT: 'TEXTKETTE' }, fr: { CONCAT: 'CONCAT' }, it: { CONCAT: 'CONCAT' }, en: { CONCAT: 'CONCAT' } };
  var BOOL_NAMES = { de: ['WAHR', 'FALSCH'], fr: ['VRAI', 'FAUX'], it: ['VERO', 'FALSO'], en: ['TRUE', 'FALSE'] };
  var tableCache = {};
  function langPack(lang) {
    var H = HFREF || root.HyperFormula;
    if (!H) return null;
    var pack = H.languages ? H.languages[HF_LANG[lang]] || null : null;
    // enGB steckt im Bundle; falls languages es nicht führt, über getLanguage holen
    if (!pack && lang === 'en' && typeof H.getLanguage === 'function') { try { pack = H.getLanguage('enGB'); } catch (e) { pack = null; } }
    return pack;
  }
  function fnTables(lang) {
    if (tableCache[lang]) return tableCache[lang];
    var pack = langPack(lang);
    if (!pack) return null;
    var fromKey = {}, toKey = {};
    Object.keys(pack.functions).forEach(function (k) { fromKey[k] = pack.functions[k]; });
    Object.keys(EXTRA_NAMES[lang]).forEach(function (k) { fromKey[k] = EXTRA_NAMES[lang][k]; });
    Object.keys(fromKey).forEach(function (k) { if (!toKey[fromKey[k]]) toKey[fromKey[k]] = k; });
    tableCache[lang] = { fromKey: fromKey, toKey: toKey };
    return tableCache[lang];
  }
  // Funktionsname von Sprache from nach to ('de' | 'fr' | 'it' | 'en'). Unbekannte Namen bleiben unverändert.
  function translateFunctionName(name, from, to) {
    if (from === to) return name;
    var a = fnTables(from), b = fnTables(to);
    if (!a || !b) return name;
    var key = a.toKey[String(name).toUpperCase()];
    return key && b.fromKey[key] ? b.fromKey[key] : name;
  }
  // Name in der Zielsprache für einen DE-Namen (z. B. 'SUMME' → 'SOMME' für fr-CH)
  function fnName(deName, locale) { return translateFunctionName(deName, 'de', langOf(locale)); }

  // Englische Namen, die in FR/IT anders heissen (aus dem Sprachpaket abgeleitet). Ausgenommen sind
  // englische Namen, die zugleich ein gültiger Name der Zielsprache sind (FR: TRIM, VAR.P).
  var enCache = {};
  function enMap(lang) {
    if (lang === 'de') return EN_TO_DE;
    if (lang === 'en') return {}; // in en-CH sind englische Namen richtig
    if (enCache[lang]) return enCache[lang];
    var t = fnTables(lang);
    if (!t) return {};
    var out = {};
    Object.keys(t.fromKey).forEach(function (k) {
      var v = t.fromKey[k];
      if (v !== k && !t.toKey[k]) out[k] = v;
    });
    enCache[lang] = out;
    return out;
  }
  // Deutsche Namen, die in FR/IT anders heissen (nur Namen, die in der Zielsprache nicht gültig sind)
  var deCache = {};
  function deMap(lang) {
    if (deCache[lang]) return deCache[lang];
    var d = fnTables('de'), t = fnTables(lang);
    if (!d || !t) return {};
    var out = {};
    Object.keys(d.fromKey).forEach(function (k) {
      var de = d.fromKey[k], target = t.fromKey[k];
      if (target && de !== target && !t.toKey[de]) out[de] = target;
    });
    deCache[lang] = out;
    return out;
  }

  // Englische Funktionsnamen, die in der deutschen/Schweizer Excel-Version anders heissen.
  // Achtung: HyperFormula akzeptiert englische Namen auch in deDE (z. B. SUM). Deshalb prüfen
  // wir sie vor der Auswertung, sonst würde =SUM(...) als korrekt gelten.
  var EN_TO_DE = {
    SUM: 'SUMME', AVERAGE: 'MITTELWERT', IF: 'WENN', VLOOKUP: 'SVERWEIS', COUNTIF: 'ZÄHLENWENN',
    SUMIF: 'SUMMEWENN', ROUND: 'RUNDEN', IFERROR: 'WENNFEHLER', CONCAT: 'TEXTKETTE',
    SUMPRODUCT: 'SUMMENPRODUKT', CONCATENATE: 'VERKETTEN', COUNT: 'ANZAHL', COUNTIFS: 'ZÄHLENWENNS',
    SUMIFS: 'SUMMEWENNS', AVERAGEIF: 'MITTELWERTWENN', ROUNDUP: 'AUFRUNDEN', ROUNDDOWN: 'ABRUNDEN',
    HLOOKUP: 'WVERWEIS', XLOOKUP: 'XVERWEIS', INDEX: null, MATCH: 'VERGLEICH', AND: 'UND', OR: 'ODER',
    PMT: 'RMZ', PV: 'BW', FV: 'ZW', EDATE: 'EDATUM', EOMONTH: 'MONATSENDE', MROUND: 'VRUNDEN', POWER: 'POTENZ',
    DAYS: 'TAGE', DATE: 'DATUM', TODAY: 'HEUTE', CHOOSE: 'WAHL', MAX: null, MIN: null, LEN: 'LÄNGE', LEFT: 'LINKS', RIGHT: 'RECHTS', MID: 'TEIL', TRIM: 'GLÄTTEN'
  };
  var EN_CONSTANTS = { TRUE: 'WAHR', FALSE: 'FALSCH' };

  // Funktionen, die echtes Excel kennt, HyperFormula 3.0.0 aber nicht. Wir übersetzen sie vor
  // der Auswertung in eine gleichwertige Funktion.
  // TEXTKETTE (CONCAT) fehlt in HyperFormula; VERKETTEN verhält sich dort gleich (inkl. Bereichen).
  // Zusätzlich werden die Konstanten WAHR/FALSCH zu WAHR()/FALSCH() (siehe applyAliases).
  var ALIASES = { de: { 'TEXTKETTE': 'VERKETTEN' }, fr: { 'CONCAT': 'CONCATENER' }, it: { 'CONCAT': 'CONCATENA' }, en: { 'CONCAT': 'CONCATENATE' } };

  var MSG = {
    noEquals: 'Eine Formel beginnt immer mit =, zum Beispiel =SUMME(…).',
    empty: 'Gib zuerst eine Formel ein.',
    comma: 'Trenne die Argumente mit Semikolon (;), nicht mit Komma (,).',
    decimalComma: 'Dezimalzahlen schreibst du in der Schweizer Excel-Version mit Punkt, z. B. 0.5.',
    english: function (en, de) { return 'Auf Deutsch heisst die Funktion ' + de + ' (nicht ' + en + ').'; },
    englishConst: function (en, de) { return 'Auf Deutsch schreibst du ' + de + ' statt ' + en + '.'; },
    unknownFn: function (name) { return 'Die Funktion ' + name + ' kennt Excel nicht. Prüfe die Schreibweise.'; },
    quotesGeneric: 'Text in Formeln gehört in Anführungszeichen, z. B. "OK".',
    cycle: 'Zirkelbezug: Deine Formel bezieht sich auf die Zielzelle selbst. Wähle einen Bereich ohne die Zielzelle.',
    noRef: 'Verwende Zellbezüge statt fester Zahlen.',
    mustUse: function (fn) { return 'Verwende in dieser Übung die Funktion ' + fn + '.'; },
    mustContain: function (s) { return 'Deine Formel muss ' + s + ' enthalten.'; },
    alt: 'Fast: Deine Formel stimmt für diese Zahlen, aber mit anderen Werten in der Tabelle käme etwas Falsches heraus. Prüfe deine Bedingung und tippe keine Ergebnisse fest ein.',
    wrong: 'Noch nicht richtig.',
    genericFallback: 'Prüfe Aufbau, Bereiche und Trennzeichen deiner Formel.',
    success: 'Richtig! Deine Formel liefert das korrekte Ergebnis.'
  };

  /* ---------- Zentrale Textabbildung CH → DE ----------
   * Wird zur Laufzeit beim Rendern angewendet (nicht in exercises.json). Reihenfolge zählt.
   * whole: nur ganze Wörter; sonst Wortteil (z. B. «gröss» in «Bestellgrössen»). Bei Wortteilen wird
   * automatisch auch die Variante mit grossem Anfangsbuchstaben ersetzt. Keine blinde ss→ß-Ersetzung:
   * «dass», «muss», «lassen», «Klasse» usw. bleiben, weil sie nicht in der Liste stehen.
   */
  var TEXT_DE = [
    // Orte (Reihenfolge der Filialen: Zürich, Bern, Basel, Luzern, Lugano, St. Gallen) und weitere Orte aus pq-1
    ['St. Gallen', 'Stuttgart', true], ['Zürich', 'München', true], ['Bern', 'Hamburg', true], ['Basel', 'Köln', true],
    ['Luzern', 'Frankfurt', true], ['Lugano', 'Berlin', true], ['Winterthur', 'Nürnberg', true], ['Aarau', 'Bremen', true],
    ['Thun', 'Leipzig', true], ['Chur', 'Dresden', true],
    // Firmen und Begriffe mit Schweiz-Bezug (Projekt-Dateien, Portfolio)
    ['Swiss Retail Group AG', 'Retail Group Deutschland AG', true], ['Helvetia Logistik AG', 'Germania Logistik AG', true],
    ['Weinhandel Ticino SA', 'Weinhandel Mosel GmbH', true], ['Kantonsspital', 'Klinikum', true], ['Velo', 'Fahrrad', true],
    ['CH-Aktien', 'DE-Aktien', true], ['Obligationen', 'Anleihen', true], ['Schweizer Bankusanz', 'Eurozins-Methode', true],
    // Währung
    ['Schweizer Franken', 'Euro', true], ['Franken', 'Euro', true], ['Rappen', 'Cent', true], ['CHF', 'EUR', true],
    // Tastatur
    ['Ctrl+', 'Strg+', false],
    // Schreibweise ss → ß (nur diese Wörter und Wortteile)
    ['gröss', 'größ', false], ['gross', 'groß', false], ['heiss', 'heiß', false], ['chliess', 'chließ', false],
    ['äusser', 'äußer', false], ['ausser', 'außer', false], ['strasse', 'straße', false], ['massnahme', 'maßnahme', false],
    ['massstab', 'maßstab', false], ['gemäss', 'gemäß', false], ['mässig', 'mäßig', false], ['grüss', 'grüß', false],
    ['gruss', 'gruß', false], ['fuss', 'fuß', false], ['spass', 'spaß', false], ['fliess', 'fließ', false],
    ['weiss', 'weiß', false], ['stoss', 'stoß', false], ['bloss', 'bloß', true], ['Mass', 'Maß', true], ['Busse', 'Buße', true]
  ];
  var WORD_CHARS = 'A-Za-z0-9À-ÖØ-öø-ÿ';
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var TEXT_DE_RULES = [];
  TEXT_DE.forEach(function (e) {
    var variants = [[e[0], e[1]]];
    if (!e[2]) variants.push([e[0].charAt(0).toUpperCase() + e[0].slice(1), e[1].charAt(0).toUpperCase() + e[1].slice(1)]);
    variants.forEach(function (v) {
      if (variants.length > 1 && v === variants[1] && v[0] === variants[0][0]) return;
      TEXT_DE_RULES.push({
        re: e[2] ? new RegExp('(^|[^' + WORD_CHARS + '])' + escapeRe(v[0]) + '(?![' + WORD_CHARS + '])', 'g') : new RegExp('()' + escapeRe(v[0]), 'g'),
        to: v[1]
      });
    });
  });

  // Zahlen in Fliesstext: 0.05 → 0,05 und 12'500.50 → 12.500,50. Datumsangaben (31.10.2026) bleiben.
  var TEXT_NUMBER_RE = /(^|[^\w.,'])(\d{1,3}(?:'\d{3})+|\d+)(?:\.(\d+))?(?!\d|\.\d|')/g;
  function localizeNumbersInText(s) {
    return s.replace(TEXT_NUMBER_RE, function (m, pre, int, dec) {
      if (int.indexOf("'") === -1 && dec === undefined) return m;
      return pre + int.replace(/'/g, '.') + (dec !== undefined ? ',' + dec : '');
    });
  }

  // Wendet die Textabbildung an (nur für «de»; «ch» gibt den Text unverändert zurück). Nicht doppelt anwenden.
  function mapText(s, locale) {
    if (typeof s !== 'string' || normalizeLocale(locale || currentLocale) !== 'de-DE') return s;
    TEXT_DE_RULES.forEach(function (r) { s = s.replace(r.re, '$1' + r.to); });
    s = s.replace(/(^|[^\w])S?Fr\.\s?(?=\d)/g, '$1€ ');
    return localizeNumbersInText(s);
  }

  // Meldungen für DE: aus MSG abgebildet, dazu eigene Hinweise zu Trennzeichen
  var MSG_DE = {};
  Object.keys(MSG).forEach(function (k) {
    var v = MSG[k];
    MSG_DE[k] = typeof v === 'function' ? function () { return mapText(v.apply(null, arguments), 'de'); } : mapText(v, 'de');
  });
  MSG_DE.comma = 'In der deutschen Excel-Version trennst du Argumente mit Semikolon (;) und Dezimalzahlen mit Komma (,).';
  MSG_DE.decimalDot = 'In der deutschen Excel-Version schreibst du Dezimalzahlen mit Komma, z. B. 0,05 statt 0.05. Einen Punkt wie in 1.5 liest Excel als Tausendertrennzeichen oder Datum, nicht als Dezimalzahl.';
  MSG.german = function (de, name) { return 'Die Funktion heisst ' + name + '.'; };
  MSG.germanConst = function (de, name) { return 'Du schreibst ' + name + ' statt ' + de + '.'; };
  MSG_DE.german = MSG.german;
  MSG_DE.germanConst = MSG.germanConst;

  // Meldungen für en-CH (englisches Excel, Komma als Argumenttrenner, Dezimalpunkt). Gleiche Schlüssel wie MSG.
  // german/germanConst: deutscher Name in einer englischen Formel (z. B. SUMME statt SUM).
  var MSG_EN = {
    noEquals: 'A formula always starts with =, for example =SUM(…).',
    empty: 'Enter a formula first.',
    comma: 'Use a comma (,) to separate arguments, not a semicolon (;).',
    decimalComma: 'Write decimal numbers with a point, for example 0.5.',
    english: function (en, name) { return 'The function is called ' + name + ' (not ' + en + ').'; },
    englishConst: function (en, name) { return 'Write ' + name + ' instead of ' + en + '.'; },
    unknownFn: function (name) { return 'Excel does not know the function ' + name + '. Check the spelling.'; },
    quotesGeneric: 'Text in formulas goes in quotation marks, for example "OK".',
    cycle: 'Circular reference: your formula refers to the target cell itself. Choose a range without the target cell.',
    noRef: 'Use cell references instead of fixed numbers.',
    mustUse: function (fn) { return 'Use the function ' + fn + ' in this exercise.'; },
    mustContain: function (s) { return 'Your formula must contain ' + s + '.'; },
    alt: 'Almost: your formula works for these numbers, but with other values in the table it would give a wrong result. Check your condition and do not type results in directly.',
    wrong: 'Not quite right yet.',
    genericFallback: 'Check the structure, ranges and separators of your formula.',
    success: 'Correct! Your formula returns the right result.',
    german: function (de, name) { return 'In English Excel the function is called ' + name + ' (not ' + de + ').'; },
    germanConst: function (de, name) { return 'In English Excel you write ' + name + ' instead of ' + de + '.'; }
  };

  // Meldungen FR/IT aus i18n/<lang>.json (ui: «msg.<Schlüssel>», Platzhalter {en}, {name}, {de}, {fn}, {s})
  var MSG_PARAMS = {
    english: ['en', 'name'], englishConst: ['en', 'name'], german: ['de', 'name'], germanConst: ['de', 'name'], unknownFn: ['name'], mustUse: ['fn'], mustContain: ['s']
  };
  var msgCache = {};
  function msgsFor(lang) {
    if (msgCache[lang]) return msgCache[lang];
    if (!I18N[lang]) return MSG;
    var out = {};
    Object.keys(MSG).forEach(function (k) {
      var tpl = uiString(lang, 'msg.' + k);
      if (tpl === null) { out[k] = MSG[k]; return; }
      if (MSG_PARAMS[k]) {
        out[k] = function () {
          var p = {}, args = arguments;
          MSG_PARAMS[k].forEach(function (name, i) { p[name] = args[i]; });
          return fill(tpl, p);
        };
      } else out[k] = tpl;
    });
    msgCache[lang] = out;
    return out;
  }
  function msgs() {
    var l = langOf(currentLocale);
    if (l === 'fr' || l === 'it') return msgsFor(l);
    if (l === 'en') return MSG_EN;
    return currentLocale === 'de-DE' ? MSG_DE : MSG;
  }

  // Feste Texte der Oberfläche, die vom Land abhängen
  var UI_TEXT = {
    ch: {
      formulaHelp: 'Mit Enter prüfen. Argumente trennst du mit Semikolon (;), Dezimalzahlen mit Punkt.',
      miniHelp: 'Mit Enter prüfen. Argumente trennst du mit Semikolon (;).',
      projectNote: 'Gib die Zahlen ein, wie sie in deiner Pivot oder Abfrage stehen. Komma oder Punkt als Dezimaltrennzeichen, Hochkomma und % sind optional.',
      switched: 'Schweiz: Dezimalpunkt, Hochkomma für Tausender, Beträge in CHF.',
      lang: 'de-CH', name: 'Schweiz', close: 'Schliessen'
    },
    de: {
      formulaHelp: 'Mit Enter prüfen. Argumente trennst du mit Semikolon (;), Dezimalzahlen mit Komma.',
      miniHelp: 'Mit Enter prüfen. Argumente trennst du mit Semikolon (;), Dezimalzahlen mit Komma.',
      projectNote: 'Gib die Zahlen ein, wie sie in deiner Pivot oder Abfrage stehen. Komma oder Punkt als Dezimaltrennzeichen, Tausenderpunkt und % sind optional.',
      switched: 'Deutschland: Dezimalkomma, Punkt für Tausender, Beträge in Euro.',
      lang: 'de-DE', name: 'Deutschland', close: 'Schließen'
    },
    en: {
      formulaHelp: 'Press Enter to check. Separate arguments with a comma (,), decimal numbers with a point.',
      miniHelp: 'Press Enter to check. Separate arguments with a comma (,).',
      projectNote: 'Enter the numbers as they appear in your pivot table or query. Comma or point as decimal separator, apostrophe and % are optional.',
      switched: 'English Excel (Switzerland): English function names, comma between arguments, decimal point, amounts in CHF.',
      lang: 'en-CH', name: 'English', close: 'Close'
    }
  };
  var UI_TEXT_KEYS = ['formulaHelp', 'miniHelp', 'projectNote', 'switched', 'name', 'close'];
  function uiText(locale) {
    var loc = normalizeLocale(locale || currentLocale), l = langOf(loc);
    if (l === 'de') return UI_TEXT[loc === 'de-DE' ? 'de' : 'ch'];
    if (l === 'en') return UI_TEXT.en;
    var out = { lang: loc };
    UI_TEXT_KEYS.forEach(function (k) { var v = uiString(l, 'locale.' + k); out[k] = v === null ? UI_TEXT.ch[k] : v; });
    return out;
  }

  /* ---------- Hilfsfunktionen für Formeltext ---------- */

  // Typografische Anführungszeichen (z. B. von Handy-Tastaturen) in gerade umwandeln.
  function normalizeQuotes(f) {
    return String(f).replace(/[“”„‟″]/g, '"');
  }

  // Ersetzt den Inhalt von String-Literalen durch Leerzeichen (Länge bleibt gleich),
  // damit Kommas, Funktionsnamen usw. in Texten nicht fälschlich erkannt werden.
  function maskStrings(f) {
    var out = '', inStr = false;
    for (var i = 0; i < f.length; i++) {
      var c = f[i];
      if (c === '"') {
        if (inStr && f[i + 1] === '"') { out += '  '; i++; continue; }
        inStr = !inStr; out += c; continue;
      }
      out += inStr ? ' ' : c;
    }
    return out;
  }

  // Wendet fn auf alle Teile ausserhalb von String-Literalen an.
  function mapOutsideStrings(f, fn) {
    var parts = f.split('"');
    for (var i = 0; i < parts.length; i += 2) parts[i] = fn(parts[i]);
    return parts.join('"');
  }

  var L = 'A-Za-zÀ-ÖØ-öø-ÿ'; // Buchstaben in Funktionsnamen (inkl. Ä, Ö, Ü, É, Ù ...)
  function applyAliases(f) {
    var aliases = ALIASES[langOf(currentLocale)] || {};
    var consts = 'WAHR|FALSCH|VRAI|FAUX|VERO|FALSO' + (langOf(currentLocale) === 'en' ? '|TRUE|FALSE' : '');
    return mapOutsideStrings(f, function (part) {
      Object.keys(aliases).forEach(function (from) {
        var re = new RegExp('(^|[^' + L + '0-9._])' + from + '(?=\\s*\\()', 'gi');
        part = part.replace(re, '$1' + aliases[from]);
      });
      // Excel kennt WAHR/FALSCH (VRAI/FAUX, VERO/FALSO) als Konstanten, HyperFormula nur als Funktionen WAHR() usw.
      // In en-CH zusätzlich TRUE/FALSE.
      part = part.replace(new RegExp('(^|[^' + L + '0-9._])(' + consts + ')(?![' + L + '0-9._]|\\s*\\()', 'gi'), '$1$2()');
      return part;
    });
  }

  // Liste aller aufgerufenen Funktionsnamen (Grossbuchstaben).
  function functionNames(f) {
    var masked = maskStrings(f), names = [], m;
    var re = new RegExp('(^|[^' + L + '0-9._$])([' + L + '][' + L + '0-9._]*)\\s*\\(', 'g');
    while ((m = re.exec(masked))) {
      names.push(m[2].toUpperCase());
      // Die Klammer nicht verbrauchen, sonst wird eine direkt folgende Funktion (WENN(ZÄHLENWENN( ...) übersehen.
      re.lastIndex = m.index + m[0].length - 1;
    }
    return names;
  }

  // Englischer (oder in FR/IT deutscher) Funktionsname bzw. Wahrheitswert? Rückgabe: Hinweistext oder null.
  // In en-CH umgekehrt: englische Namen sind richtig, deutsche Namen (SUMME, WAHR) werden gemeldet.
  function findEnglish(f) {
    var lang = langOf(currentLocale);
    var names = functionNames(f), en = enMap(lang), de = lang === 'de' ? {} : deMap(lang);
    var has = Object.prototype.hasOwnProperty;
    for (var i = 0; i < names.length; i++) {
      if (has.call(en, names[i]) && en[names[i]]) return msgs().english(names[i], en[names[i]]);
      if (has.call(de, names[i])) return msgs().german(names[i], de[names[i]]);
    }
    var bools = BOOL_NAMES[lang];
    var masked = maskStrings(f), m;
    var re = new RegExp('(^|[^' + L + '0-9._])(TRUE|FALSE|WAHR|FALSCH)(?![' + L + '0-9._])', 'gi');
    while ((m = re.exec(masked))) {
      var c = m[2].toUpperCase();
      var idx = c === 'TRUE' || c === 'WAHR' ? 0 : 1;
      if (c === 'TRUE' || c === 'FALSE') { if (lang === 'en') continue; return msgs().englishConst(c, bools[idx]); }
      if (lang !== 'de') return msgs().germanConst(c, bools[idx]);
    }
    return null;
  }

  // Steht vor Index i (rückwärts) ein reines Zahlenliteral, also kein Zellbezug wie B2 oder $F$1?
  function numberBefore(masked, i) {
    var j = i - 1;
    while (j >= 0 && /\d/.test(masked[j])) j--;
    if (j === i - 1) return false;
    return j < 0 || !/[A-Za-zÄÖÜäöüß0-9_.$]/.test(masked[j]);
  }

  /*
   * Komma ausserhalb von Strings. Rückgabe 'separator' (Komma als Argumenttrenner), 'decimal'
   * (Dezimalkomma, nur in CH ein Fehler) oder null.
   * CH: Jedes Komma innerhalb einer Klammer gilt als Argumenttrenner.
   * DE: Das Komma ist das Dezimalzeichen. Nur ein Komma, das nicht zwischen den Ziffern eines
   *     Zahlenliterals steht (z. B. «B2,B6»), ist ein falscher Argumenttrenner.
   */
  /*
   * en-CH: Das Komma ist der Argumenttrenner. 'separator' heisst dort: Semikolon statt Komma (Meldung MSG.comma).
   *        'decimal': Komma zwischen Ziffern ausserhalb einer Klammer (=A2*1,5).
   */
  function commaKind(f, locale) {
    var de = numDe(locale);
    var masked = maskStrings(f), depth = 0;
    if (argSep(locale) === ',') {
      if (masked.indexOf(';') !== -1) return 'separator';
      for (var j = 0; j < masked.length; j++) {
        if (masked[j] === '(') depth++;
        else if (masked[j] === ')') depth--;
        else if (masked[j] === ',' && depth <= 0 && /\d/.test(masked[j - 1] || '') && /\d/.test(masked[j + 1] || '')) return 'decimal';
      }
      return null;
    }
    for (var i = 0; i < masked.length; i++) {
      var c = masked[i];
      if (c === '(') depth++;
      else if (c === ')') depth--;
      else if (c === ',') {
        var isDecimal = /\d/.test(masked[i + 1] || '') && (numberBefore(masked, i) || /[^A-Za-zÄÖÜäöüß0-9_.$]/.test(masked[i - 1] || '('));
        if (de) { if (isDecimal) continue; return 'separator'; }
        if (depth > 0) return 'separator';
        if (/\d/.test(masked[i - 1] || '') && /\d/.test(masked[i + 1] || '')) return 'decimal';
        return 'separator';
      }
    }
    return null;
  }

  // Dezimalpunkt in einem Zahlenliteral (z. B. 0.05) ausserhalb von Strings. In DE ein Fehler.
  function hasDecimalDot(f) {
    var masked = maskStrings(f);
    for (var i = 0; i < masked.length; i++) {
      if (masked[i] === '.' && /\d/.test(masked[i + 1] || '') && numberBefore(masked, i)) return true;
    }
    return false;
  }

  /*
   * Wandelt die Zahlenliterale einer Formel zwischen CH-Notation (0.05) und DE-Notation (0,05) um.
   * Unverändert bleiben: Text in Anführungszeichen ("1.5"), Zellbezüge und Bereiche (A2:B6, $F$1),
   * Funktionsnamen und der Argumenttrenner «;» (gilt in beiden Ländern).
   * Reine Funktion: convertFormulaLocale('=RUNDEN(B2/0.05;0)*0.05', 'ch', 'de') → '=RUNDEN(B2/0,05;0)*0,05'.
   */
  /*
   * Zusätzlich übersetzt convertFormulaLocale die Funktionsnamen und Wahrheitswerte ausserhalb von Strings,
   * wenn sich die Sprache ändert: convertFormulaLocale('=SUMME(B2:B6)', 'de-CH', 'fr-CH') → '=SOMME(B2:B6)',
   * '=SVERWEIS(D2;A2:B6;2;FALSCH)' → '=RECHERCHEV(D2;A2:B6;2;FAUX)'. Zuordnung über die HyperFormula-Sprachpakete.
   */
  function convertFormulaLocale(formula, from, to) {
    if (typeof formula !== 'string') return formula;
    from = normalizeLocale(from); to = normalizeLocale(to);
    if (from === to) return formula;
    var nFrom = numStyle(from), nTo = numStyle(to), lFrom = langOf(from), lTo = langOf(to);
    var re = nFrom === 'ch' ? /(^|[^A-Za-zÄÖÜäöüß0-9_.,$])(\d*)\.(\d)/g : /(^|[^A-Za-zÄÖÜäöüß0-9_.,$])(\d*),(\d)/g;
    var sep = nTo === 'de' ? ',' : '.';
    var fnRe = new RegExp('(^|[^' + L + '0-9._$])([' + L + '][' + L + '0-9._]*)(?=\\s*\\()', 'g');
    var boolRe = new RegExp('(^|[^' + L + '0-9._$])([' + L + ']+)(?![' + L + '0-9._(])', 'g');
    var bFrom = BOOL_NAMES[lFrom], bTo = BOOL_NAMES[lTo];
    // Argumenttrenner (en-CH: «,»): zuerst «,» → «;», dann Dezimalzeichen umwandeln, zuletzt «;» → «,»,
    // damit ein Dezimalkomma aus de-DE nie als Trenner gilt.
    var sFrom = argSep(from), sTo = argSep(to);
    return mapOutsideStrings(formula, function (part) {
      if (sFrom === ',' && sTo !== ',') part = part.replace(/,/g, ';');
      if (nFrom !== nTo) part = part.replace(re, '$1$2' + sep + '$3');
      if (sTo === ',' && sFrom !== ',') part = part.replace(/;/g, ',');
      if (lFrom !== lTo) {
        part = part.replace(fnRe, function (m, pre, name) { return pre + translateFunctionName(name, lFrom, lTo); });
        part = part.replace(boolRe, function (m, pre, name) {
          var i = bFrom.indexOf(name.toUpperCase());
          return i === -1 ? m : pre + bTo[i];
        });
      }
      return part;
    });
  }

  // Zellbezug wie B2, $F$1, AA10 oder Spaltenbereich A:B.
  var CELL_REF_RE = /(^|[^A-Za-zÄÖÜäöü0-9._])\$?[A-Za-z]{1,3}\$?\d+(?![A-Za-z0-9(])|(^|[^A-Za-zÄÖÜäöü0-9._])\$?[A-Za-z]{1,3}:\$?[A-Za-z]{1,3}(?![A-Za-z0-9(])/;
  function hasCellRef(f) {
    return CELL_REF_RE.test(maskStrings(f));
  }

  function usesFunction(f, name) {
    return functionNames(f).indexOf(name.toUpperCase()) !== -1;
  }

  // Top-Level-Argumente eines Funktionsaufrufs ab Index der öffnenden Klammer.
  // DE/FR/IT: «;» (in CH-Notation zählt auch ein falsches Komma), en-CH: nur «,».
  function callArgs(masked, openIdx) {
    var depth = 0, args = [], start = openIdx + 1, en = argSep() === ',';
    for (var i = openIdx; i < masked.length; i++) {
      var c = masked[i];
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) { args.push(masked.slice(start, i)); return args; } }
      else if ((en ? c === ',' : (c === ';' || (c === ',' && !numDe()))) && depth === 1) { args.push(masked.slice(start, i)); start = i + 1; }
    }
    args.push(masked.slice(start));
    return args;
  }

  // Kriterium von SUMMEWENN/ZÄHLENWENN ohne Anführungszeichen (z. B. >3 oder Ost)?
  function hasUnquotedCriterion(f) {
    var masked = maskStrings(f), m;
    // ZÄHLENWENN/SUMMEWENN in DE, NB.SI/SOMME.SI in FR, CONTA.SE/SOMMA.SE in IT, COUNTIF/SUMIF in en-CH
    // (nicht die ...S-/.ENS-Varianten). In DE/FR/IT meldet findEnglish COUNTIF/SUMIF schon vorher.
    var re = new RegExp('(^|[^' + L + '0-9._])(ZÄHLENWENN|SUMMEWENN|NB\\.SI|SOMME\\.SI|CONTA\\.SE|SOMMA\\.SE|COUNTIF|SUMIF)\\s*\\(', 'gi');
    while ((m = re.exec(masked))) {
      var args = callArgs(masked, m.index + m[0].length - 1);
      var crit = (args[1] || '').trim();
      if (!crit) continue;
      if (/^[<>=]/.test(crit)) return true;
      var isRef = /^\$?[A-Za-z]{1,3}\$?\d+$/.test(crit);
      if (!isRef && /^[A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü\s-]*$/.test(crit)) return true;
    }
    return false;
  }

  /* ---------- Tabellen-Hilfen ---------- */

  function colToIndex(letters) {
    var n = 0;
    for (var i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64);
    return n - 1;
  }
  function indexToCol(i) {
    var s = '';
    i += 1;
    while (i > 0) { var r = (i - 1) % 26; s = String.fromCharCode(65 + r) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }
  function parseA1(a1) {
    var m = /^([A-Z]+)(\d+)$/.exec(String(a1).toUpperCase());
    if (!m) throw new Error('Ungültige Zelladresse: ' + a1);
    return { col: colToIndex(m[1]), row: parseInt(m[2], 10) - 1 };
  }

  // Kopie mit rechteckiger Form (fehlende Zellen = null), gross genug für die Zielzelle.
  function normalizeData(data, target) {
    var t = parseA1(target);
    var width = t.col + 1, height = Math.max(data.length, t.row + 1);
    data.forEach(function (r) { width = Math.max(width, r.length); });
    var out = [];
    for (var r = 0; r < height; r++) {
      var row = [];
      for (var c = 0; c < width; c++) {
        var v = data[r] && data[r][c] !== undefined ? data[r][c] : null;
        row.push(v);
      }
      out.push(row);
    }
    return out;
  }

  /* ---------- Auswertung ---------- */

  function isCellError(HF, v) {
    return !!v && typeof v === 'object' && (v instanceof HF.DetailedCellError || ('type' in v && 'value' in v));
  }

  // Formel in eine Kopie des Datensatzes setzen und Wert der Zielzelle lesen.
  function evaluate(HF, data, target, formula) {
    var grid = normalizeData(data, target), t = parseA1(target), hf;
    grid[t.row][t.col] = null;
    try {
      hf = HF.buildFromArray(grid, configFor());
      hf.setCellContents({ sheet: 0, row: t.row, col: t.col }, [[applyAliases(formula)]]);
      var v = hf.getCellValue({ sheet: 0, row: t.row, col: t.col });
      if (isCellError(HF, v)) return { error: { value: v.value, type: v.type, message: v.message || '' } };
      return { value: v };
    } catch (e) {
      return { error: { value: '#ERROR!', type: 'ERROR', message: e && e.message ? e.message : String(e) } };
    } finally {
      if (hf && hf.destroy) hf.destroy();
    }
  }

  function valuesEqual(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9;
    if (a === null || b === null) return a === b;
    return typeof a === typeof b && a === b;
  }

  function datasets(ex) {
    var list = [ex.data];
    (ex.alt || []).forEach(function (a) { list.push(a.data); });
    return list;
  }

  function errorFeedback(ex, f, err) {
    var hints = ex.hints || {};
    var MSG = msgs();
    var ck = commaKind(f);
    if (ck === 'separator') return MSG.comma;
    if (ck === 'decimal') return MSG.decimalComma;
    if (numDe() && hasDecimalDot(f)) return MSG.decimalDot;
    var en = findEnglish(f);
    if (en) return en;
    if (hasUnquotedCriterion(f)) return hints.quotes || MSG.quotesGeneric;
    if (err.type === 'CYCLE') return MSG.cycle;
    var fnMatch = /Function name (.+) not recognized/.exec(err.message);
    if (fnMatch) return MSG.unknownFn(fnMatch[1]);
    if (/Named expression .+ not recognized/.test(err.message)) return hints.quotes || MSG.quotesGeneric;
    var missingDollar = (ex.mustContain || []).some(function (s) { return s.indexOf('$') !== -1 && f.indexOf(s) === -1; });
    if (missingDollar && hints.dollar) return hints.dollar;
    return hints.generic || MSG.genericFallback;
  }

  /*
   * Prüft eine Nutzerformel. Rückgabe:
   *  { ok: true, message, tip?, value }
   *  { ok: false, message, value?, errorValue? }
   */
  function check(HF, ex, input) {
    var MSG = msgs();
    var f = normalizeQuotes(String(input || '')).trim();
    var hints = ex.hints || {};
    if (!f) return { ok: false, message: MSG.empty };
    if (f[0] !== '=') return { ok: false, message: MSG.noEquals };

    var en = findEnglish(f);
    if (en) return { ok: false, message: commaKind(f) === 'separator' ? en + ' ' + MSG.comma : en };

    var mine = evaluate(HF, ex.data, ex.target, f);
    if (mine.error) {
      return { ok: false, message: errorFeedback(ex, f, mine.error), errorValue: mine.error.value };
    }

    if (!hasCellRef(f)) return { ok: false, message: MSG.noRef, value: mine.value };

    var mustContain = ex.mustContain || [];
    for (var i = 0; i < mustContain.length; i++) {
      if (f.toUpperCase().indexOf(mustContain[i].toUpperCase()) === -1) {
        var msg = mustContain[i].indexOf('$') !== -1 && hints.dollar ? hints.dollar : MSG.mustContain(mustContain[i]);
        return { ok: false, message: msg, value: mine.value };
      }
    }
    var mustUse = ex.mustUse || [];
    for (var j = 0; j < mustUse.length; j++) {
      if (!usesFunction(f, mustUse[j])) return { ok: false, message: MSG.mustUse(mustUse[j]), value: mine.value };
    }

    var expected = evaluate(HF, ex.data, ex.target, ex.solution);
    if (expected.error) throw new Error('Musterlösung von ' + ex.id + ' liefert ' + expected.error.value);
    if (!valuesEqual(mine.value, expected.value)) {
      return { ok: false, message: MSG.wrong + ' ' + (hints.generic || MSG.genericFallback), value: mine.value };
    }

    var alts = ex.alt || [];
    for (var k = 0; k < alts.length; k++) {
      var a = evaluate(HF, alts[k].data, ex.target, f);
      var b = evaluate(HF, alts[k].data, ex.target, ex.solution);
      if (a.error || !valuesEqual(a.value, b.value)) return { ok: false, message: MSG.alt, value: mine.value };
    }

    var result = { ok: true, message: MSG.success, value: mine.value };
    if (hints.noRange && f.indexOf(':') === -1) result.tip = hints.noRange;
    return result;
  }

  /*
   * Variante einer Übung für «Nochmal mit anderen Zahlen»: Datensatz index (0 = data, 1.. = alt[index-1])
   * wird zu data, die übrigen Datensätze zu alt. So prüft check() unverändert gegen den gewählten Datensatz.
   */
  function variant(ex, index) {
    var all = datasets(ex);
    index = Number(index) || 0;
    if (index <= 0 || index >= all.length) return ex;
    var copy = {};
    Object.keys(ex).forEach(function (k) { copy[k] = ex[k]; });
    copy.data = all[index];
    copy.alt = all.filter(function (d, i) { return i !== index; }).map(function (d) { return { data: d }; });
    return copy;
  }

  /* ---------- Übung für ein Land aufbereiten ----------
   * localize(ex, 'de') liefert eine Kopie der Übung für Deutschland:
   *  1. Overrides aus ex.locale.de übernehmen (task, title, data, alt, solution, hints, accept, ...).
   *     hints werden zusammengeführt, alle anderen Felder ersetzt. Overrides sind wie exercises.json in
   *     CH-Notation geschrieben (Zahlen mit Punkt) und durchlaufen danach dieselben Schritte.
   *  2. Textabbildung (CHF → EUR, Orte, ss → ß, Zahlen im Text) auf alle Texte und Text-Zellen.
   *  3. Formeln (solution, accept) in DE-Notation umwandeln, Projekt-Datei aus files/de/.
   * Übungs-IDs, Antworten und Zahlen in den Daten bleiben gleich. Für «ch» kommt ex unverändert zurück.
   */
  var TEXT_FIELDS = ['topic', 'title', 'task', 'intro'];
  function mapCell(v, locale) {
    if (typeof v !== 'string' || v.charAt(0) === '=') return v;
    return mapText(v, locale);
  }
  function mapData(data, locale) {
    return (data || []).map(function (row) { return (row || []).map(function (v) { return mapCell(v, locale); }); });
  }
  function localize(ex, locale) {
    locale = normalizeLocale(locale || currentLocale);
    if (!ex || locale === 'de-CH' || ex.localeApplied === locale) return ex;
    if (langOf(locale) === 'en') return localizeEn(ex, locale);
    if (langOf(locale) !== 'de') return localizeLang(ex, locale);
    var copy = JSON.parse(JSON.stringify(ex));
    var ov = ex.locale && ex.locale.de;
    delete copy.locale;
    if (ov) {
      Object.keys(ov).forEach(function (k) {
        var v = JSON.parse(JSON.stringify(ov[k]));
        if (k === 'hints' && copy.hints && v && typeof v === 'object') Object.keys(v).forEach(function (h) { copy.hints[h] = v[h]; });
        else copy[k] = v;
      });
    }
    TEXT_FIELDS.forEach(function (k) { if (typeof copy[k] === 'string') copy[k] = mapText(copy[k], locale); });
    if (copy.hints) Object.keys(copy.hints).forEach(function (h) { copy.hints[h] = mapText(copy.hints[h], locale); });
    if (Array.isArray(copy.steps)) copy.steps = copy.steps.map(function (t) { return mapText(t, locale); });
    if (Array.isArray(copy.questions)) {
      copy.questions.forEach(function (q) {
        q.q = mapText(q.q, locale);
        if (q.hint) q.hint = mapText(q.hint, locale);
        if (q.unit) q.unit = mapText(q.unit, locale);
      });
    }
    if (copy.data) copy.data = mapData(copy.data, locale);
    if (Array.isArray(copy.alt)) copy.alt.forEach(function (a) { a.data = mapData(a.data, locale); });
    // Text in Formeln (z. B. "Zürich" als Kriterium) gleich abbilden wie die Daten, Zahlen ins DE-Format
    var formula = function (f) {
      return convertFormulaLocale(f, 'ch', locale)
        .split('"').map(function (part, i) { return i % 2 ? mapText(part, locale) : part; }).join('"');
    };
    if (typeof copy.solution === 'string') copy.solution = formula(copy.solution);
    if (Array.isArray(copy.accept)) copy.accept = copy.accept.map(formula);
    if (typeof copy.file === 'string') copy.file = copy.file.replace(/^files\//, 'files/de/');
    copy.localeApplied = locale;
    return copy;
  }

  /*
   * FR/IT: Texte aus i18n/<lang>.json, exercises[<id>]:
   *   topic, title, task (Formel-Übungen) bzw. intro, steps, questions [{ q, hint, unit? }] (Projekte), hints { alle Schlüssel },
   *   data { Originaltext: Übersetzung } für Kopfzeilen und Text-Zellen,
   *   terms { Originaltext: Übersetzung } für Texte, auf die Formeln Bezug nehmen ("offen", "Ost", "Überzogen").
   * data und terms gelten für alle Text-Zellen (data und alt). terms gilt zusätzlich für Text in Anführungszeichen in
   * solution und accept, damit die übersetzte Musterlösung mit den übersetzten Daten dasselbe Ergebnis liefert.
   * Funktionsnamen in solution, accept, mustUse und mustContain werden über die Sprachpakete übersetzt.
   * Zahlen, Zielzelle, IDs und Antworten bleiben gleich. Die Projekt-Datei kommt aus files/<lang>/.
   */
  function exerciseText(ex, lang) {
    var d = I18N[lang];
    return d && d.exercises ? d.exercises[ex.id] || null : null;
  }
  function localizeLang(ex, locale) {
    var lang = langOf(locale);
    if (!I18N[lang]) throw new Error('Übersetzung ' + lang + ' ist nicht geladen (registerI18n).');
    var tr = exerciseText(ex, lang) || {};
    var copy = JSON.parse(JSON.stringify(ex));
    delete copy.locale;
    ['topic', 'title', 'task', 'intro'].forEach(function (k) { if (typeof tr[k] === 'string') copy[k] = tr[k]; });
    if (tr.hints && copy.hints) Object.keys(tr.hints).forEach(function (h) { copy.hints[h] = tr.hints[h]; });
    if (Array.isArray(tr.steps)) copy.steps = tr.steps.slice();
    if (Array.isArray(copy.questions) && Array.isArray(tr.questions)) {
      copy.questions.forEach(function (q, i) {
        var t = tr.questions[i] || {};
        if (t.q) q.q = t.q;
        if (t.hint) q.hint = t.hint;
        if (q.unit !== undefined && t.unit !== undefined) q.unit = t.unit;
      });
    }
    var cellMap = {};
    [tr.data || {}, tr.terms || {}].forEach(function (m) { Object.keys(m).forEach(function (k) { cellMap[k] = m[k]; }); });
    var terms = tr.terms || {};
    var has = Object.prototype.hasOwnProperty;
    var mapCellLang = function (v) { return typeof v === 'string' && v.charAt(0) !== '=' && has.call(cellMap, v) ? cellMap[v] : v; };
    var mapRows = function (data) { return (data || []).map(function (row) { return (row || []).map(mapCellLang); }); };
    if (copy.data) copy.data = mapRows(copy.data);
    if (Array.isArray(copy.alt)) copy.alt.forEach(function (a) { a.data = mapRows(a.data); });
    var formula = function (f) {
      return convertFormulaLocale(f, 'de-CH', locale)
        .split('"').map(function (part, i) { return i % 2 && has.call(terms, part) ? terms[part] : part; }).join('"');
    };
    if (typeof copy.solution === 'string') copy.solution = formula(copy.solution);
    if (Array.isArray(copy.accept)) copy.accept = copy.accept.map(formula);
    if (Array.isArray(copy.mustUse)) copy.mustUse = copy.mustUse.map(function (n) { return fnName(n, locale); });
    if (Array.isArray(copy.mustContain)) copy.mustContain = copy.mustContain.map(function (n) { return /^[A-ZÄÖÜ][A-ZÄÖÜ0-9.]*$/.test(n) ? fnName(n, locale) : n; });
    if (typeof copy.file === 'string') copy.file = copy.file.replace(/^files\//, 'files/' + lang + '/');
    copy.localeApplied = locale;
    return copy;
  }

  /*
   * en-CH: englisches Excel mit Schweizer Zahlen. Texte bleiben deutsch, ausser ex.locale.en enthält Overrides
   * (topic, title, task, intro, steps, hints, ...; hints werden zusammengeführt, alles andere ersetzt).
   * Funktionsnamen in solution, accept, mustUse und mustContain: DE → EN (enGB-Namen aus HyperFormula),
   * Argumenttrenner «;» → «,» ausserhalb von Strings. Daten, Zahlen, Zielzelle, IDs und Antworten bleiben gleich.
   * Overrides in ex.locale.en für solution/accept sind wie exercises.json in DE-CH-Notation geschrieben.
   * Projekt-Dateien bleiben die deutschen (es gibt kein files/en/).
   */
  function localizeEn(ex, locale) {
    var copy = JSON.parse(JSON.stringify(ex));
    var ov = ex.locale && ex.locale.en;
    delete copy.locale;
    if (ov) {
      Object.keys(ov).forEach(function (k) {
        var v = JSON.parse(JSON.stringify(ov[k]));
        if (k === 'hints' && copy.hints && v && typeof v === 'object') Object.keys(v).forEach(function (h) { copy.hints[h] = v[h]; });
        else copy[k] = v;
      });
    }
    var formula = function (f) { return convertFormulaLocale(f, 'de-CH', locale); };
    if (typeof copy.solution === 'string') copy.solution = formula(copy.solution);
    if (Array.isArray(copy.accept)) copy.accept = copy.accept.map(formula);
    if (Array.isArray(copy.mustUse)) copy.mustUse = copy.mustUse.map(function (n) { return fnName(n, locale); });
    if (Array.isArray(copy.mustContain)) copy.mustContain = copy.mustContain.map(function (n) { return /^[A-ZÄÖÜ][A-ZÄÖÜ0-9.]*$/.test(n) ? fnName(n, locale) : n; });
    copy.localeApplied = locale;
    return copy;
  }

  /* ---------- Projekt-Übungen (type "project") ----------
   * Nutzer bauen in Excel eine Pivot-Tabelle oder Power-Query-Abfrage und beantworten Kontrollfragen.
   * Geprüft werden nur Zahlen, ohne HyperFormula. Frage: { q, answer, tolerance?, unit?, hint }.
   */

  var PROJECT_MSG = {
    empty: 'Gib hier eine Zahl ein.',
    invalid: 'Das ist keine Zahl. Schreib zum Beispiel 1234.50, 1\'234,50 oder 12.5 %.',
    wrong: 'Noch nicht richtig.',
    right: 'Richtig.',
    allRight: 'Alles richtig! Dein Report liefert die korrekten Zahlen.',
    some: function (n, total) { return n + ' von ' + total + ' Antworten richtig. Prüfe die markierten Fragen.'; }
  };
  var PROJECT_MSG_CH = PROJECT_MSG;
  var PROJECT_MSG_DE = {};
  Object.keys(PROJECT_MSG).forEach(function (k) { PROJECT_MSG_DE[k] = PROJECT_MSG[k]; });
  PROJECT_MSG_DE.invalid = 'Das ist keine Zahl. Schreib zum Beispiel 1234,50, 1.234,50 oder 12,5 %.';
  var PROJECT_MSG_EN = {
    empty: 'Enter a number here.',
    invalid: 'That is not a number. Write for example 1234.50, 1\'234.50 or 12.5 %.',
    wrong: 'Not quite right yet.',
    right: 'Correct.',
    allRight: 'All correct! Your report returns the right numbers.',
    some: function (n, total) { return n + ' of ' + total + ' answers correct. Check the marked questions.'; }
  };
  // FR/IT: ui «pmsg.<Schlüssel>», «pmsg.some» mit {n} und {total}
  function projectMsgs() {
    var l = langOf(currentLocale);
    if (l === 'de') return currentLocale === 'de-DE' ? PROJECT_MSG_DE : PROJECT_MSG_CH;
    if (l === 'en') return PROJECT_MSG_EN;
    var out = {};
    Object.keys(PROJECT_MSG).forEach(function (k) {
      var tpl = uiString(l, 'pmsg.' + k);
      if (tpl === null) out[k] = PROJECT_MSG[k];
      else out[k] = k === 'some' ? function (n, total) { return fill(tpl, { n: n, total: total }); } : tpl;
    });
    return out;
  }

  function isProject(ex) { return !!ex && ex.type === 'project'; }

  /*
   * Liest eine eingetippte Zahl. Akzeptiert Komma oder Punkt als Dezimaltrennzeichen, ignoriert Hochkomma
   * und Leerzeichen als Tausendertrennzeichen, «CHF»/«Fr.» und ein Prozentzeichen.
   * Kommen Punkt und Komma vor, gilt das letzte Zeichen als Dezimaltrennzeichen (1.234,50 und 1,234.50).
   * Mehrere gleiche Trennzeichen ohne das andere gelten als Tausendertrennzeichen (1.234.567).
   * In DE gilt ein einzelner Punkt mit genau drei Ziffern danach als Tausenderpunkt (1.234 = 1234).
   * Rückgabe: { value, percent } | { empty: true } | { invalid: true }
   */
  function parseAnswer(input, locale) {
    var de = numDe(locale);
    var s = String(input === null || input === undefined ? '' : input).trim();
    if (!s) return { empty: true };
    var percent = s.indexOf('%') !== -1;
    s = s.replace(/%/g, '').replace(/\b(CHF|SFr\.?|Fr\.?|EUR)/gi, '').replace(/€/g, '')
      .replace(/[\s\u00a0\u2009\u202f'\u2019\u02bc`\u00b4]/g, '')
      .replace(/^[\u2212\u2013]/, '-');
    if (!s) return { empty: true };
    if (!/^[+-]?[\d.,]*\d[\d.,]*$/.test(s)) return { invalid: true };
    var dots = (s.match(/\./g) || []).length, commas = (s.match(/,/g) || []).length;
    if (dots && commas) {
      var dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
      var thou = dec === '.' ? ',' : '.';
      if ((dec === '.' ? dots : commas) > 1) return { invalid: true };
      s = s.split(thou).join('').replace(dec, '.');
    } else if (commas) {
      s = commas > 1 ? s.replace(/,/g, '') : s.replace(',', '.');
    } else if (dots > 1) {
      s = s.replace(/\./g, '');
    } else if (dots === 1 && de && /^[+-]?[1-9]\d{0,2}\.\d{3}$/.test(s)) {
      // DE: «1.234» ist ein Tausenderpunkt (1234). Mit führender 0 (0.143) bleibt es eine Dezimalzahl.
      s = s.replace('.', '');
    }
    var n = Number(s);
    if (!isFinite(n)) return { invalid: true };
    return { value: n, percent: percent };
  }

  // Stimmt eine Eingabe mit der Musterantwort überein? Bei unit «%» gilt auch der Bruch (0.234 statt 23.4).
  function answerMatches(q, parsed) {
    var tol = typeof q.tolerance === 'number' && q.tolerance > 0 ? q.tolerance : 0;
    var eps = tol + 1e-9 * Math.max(1, Math.abs(q.answer));
    if (Math.abs(parsed.value - q.answer) <= eps) return true;
    return q.unit === '%' && !parsed.percent && Math.abs(parsed.value * 100 - q.answer) <= eps;
  }

  /*
   * Prüft die Antworten einer Projekt-Übung. answers: Array der Eingaben (Strings) in der Reihenfolge der Fragen.
   * Rückgabe: { ok, correct, total, message, results: [{ ok, value?, empty?, invalid?, message }] }
   */
  function checkProject(ex, answers) {
    var PROJECT_MSG = projectMsgs();
    var qs = (ex && ex.questions) || [];
    var generic = (ex && ex.hints && ex.hints.generic) || '';
    var results = qs.map(function (q, i) {
      var p = parseAnswer(answers ? answers[i] : '');
      if (p.empty) return { ok: false, empty: true, message: PROJECT_MSG.empty };
      if (p.invalid) return { ok: false, invalid: true, message: PROJECT_MSG.invalid };
      if (answerMatches(q, p)) return { ok: true, value: p.value, message: PROJECT_MSG.right };
      return { ok: false, value: p.value, message: PROJECT_MSG.wrong + ' ' + (q.hint || generic) };
    });
    var correct = results.filter(function (r) { return r.ok; }).length;
    var ok = qs.length > 0 && correct === qs.length;
    return { ok: ok, correct: correct, total: qs.length, results: results, message: ok ? PROJECT_MSG.allRight : PROJECT_MSG.some(correct, qs.length) };
  }

  /* ---------- Anzeige ---------- */

  // Zahl im Landesformat. CH: Hochkomma als Tausendertrennzeichen, Punkt als Dezimaltrennzeichen (12'500.5).
  // DE: Punkt als Tausendertrennzeichen, Komma als Dezimaltrennzeichen (12.500,5).
  function formatNumber(n, locale) {
    if (typeof n !== 'number' || !isFinite(n)) return String(n);
    var de = numDe(locale);
    var rounded = Math.round(n * 1e10) / 1e10;
    var neg = rounded < 0, s = String(Math.abs(rounded));
    if (/e/i.test(s)) return de ? String(n).replace('.', ',') : String(n);
    var parts = s.split('.');
    var int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, de ? '.' : "'");
    return (neg ? '-' : '') + int + (parts[1] ? (de ? ',' : '.') + parts[1] : '');
  }

  function formatValue(v, locale) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return formatNumber(v, locale);
    if (typeof v === 'boolean') return BOOL_NAMES[langOf(locale)][v ? 0 : 1];
    return String(v);
  }

  var api = {
    HF_CONFIG: HF_CONFIG,
    HF_CONFIG_DE: HF_CONFIG_DE,
    LOCALES: LOCALES,
    LOCALE_INFO: LOCALE_INFO,
    normalizeLocale: normalizeLocale,
    langOf: langOf,
    numStyle: numStyle,
    registerI18n: registerI18n,
    i18n: i18n,
    hasI18n: hasI18n,
    fill: fill,
    uiString: uiString,
    translateFunctionName: translateFunctionName,
    fnName: fnName,
    enMap: enMap,
    deMap: deMap,
    // Sprachpaket der Variante registriert? (FR/IT-Pakete werden separat geladen, enGB ist immer registriert)
    hasLanguage: function (locale) { var H = HFREF || root.HyperFormula; return !!H && H.getRegisteredLanguagesCodes().indexOf(info(locale).hf) !== -1; },
    setLocale: setLocale,
    getLocale: getLocale,
    configFor: configFor,
    convertFormulaLocale: convertFormulaLocale,
    hasDecimalDot: hasDecimalDot,
    mapText: mapText,
    localize: localize,
    uiText: uiText,
    MSG_DE: MSG_DE,
    MSG_EN: MSG_EN,
    EN_TO_DE: EN_TO_DE,
    MSG: MSG,
    argSep: argSep,
    check: check,
    evaluate: evaluate,
    valuesEqual: valuesEqual,
    datasets: datasets,
    variant: variant,
    parseA1: parseA1,
    indexToCol: indexToCol,
    normalizeData: normalizeData,
    hasCellRef: hasCellRef,
    commaKind: commaKind,
    findEnglish: findEnglish,
    hasUnquotedCriterion: hasUnquotedCriterion,
    applyAliases: applyAliases,
    formatNumber: formatNumber,
    formatValue: formatValue,
    PROJECT_MSG: PROJECT_MSG,
    isProject: isProject,
    parseAnswer: parseAnswer,
    checkProject: checkProject,
    // Einmalig die Sprachen registrieren (idempotent): deDE ist Pflicht, frFR und itIT, falls geladen.
    init: function (HF) {
      if (!HF.languages || !HF.languages.deDE) throw new Error('HyperFormula-Sprachpaket deDE fehlt.');
      HFREF = HF;
      tableCache = {}; enCache = {}; deCache = {};
      ['deDE', 'frFR', 'itIT'].forEach(function (code) {
        if (HF.languages[code] && HF.getRegisteredLanguagesCodes().indexOf(code) === -1) HF.registerLanguage(code, HF.languages[code]);
      });
    }
  };

  root.ExcelDrillsEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
