/*
 * Excel-Drills – Fehlerkategorien (pur, ohne DOM)
 * Ordnet ein Prüfergebnis der Engine einer von sechs Kategorien zu und liefert einen kurzen Lerntipp.
 * Genutzt von app/assessment.js (Diagnose im Rollen-Assessment), später auch von Upload-Prüfung und Fehler-DNA.
 * Läuft im Browser (window.ExcelDrillsErrors) und in Node (scripts/check-assessments.mjs lädt die Datei per vm-Kontext).
 *
 * classify(engineResult, formula, ex) → { category, label, tip }
 *   engineResult: Rückgabe von ExcelDrillsEngine.check() oder null (Aufgabe übersprungen / Zeit abgelaufen)
 *   formula:      eingetippte Formel (String)
 *   ex:           Aufgabe (Übungsformat, mit category)
 */
(function (root) {
  'use strict';

  var CATEGORIES = ['bezug', 'syntax', 'logik', 'lookup', 'rundung', 'modell'];

  var LABELS = {
    bezug: 'Bezüge und $-Zeichen',
    syntax: 'Formel-Syntax',
    logik: 'Logik und Bedingungen',
    lookup: 'Nachschlagen und bedingte Summen',
    rundung: 'Runden',
    modell: 'Modell und Rechenlogik'
  };

  // Allgemeiner Lerntipp pro Kategorie (Fallback, wenn keine genauere Ursache erkennbar ist)
  var TIPS = {
    bezug: 'Fixiere Annahmen und Sätze mit $ (z. B. $F$1), damit die Formel beim Kopieren auf dieselbe Zelle zeigt. Mit F4 setzt du die $-Zeichen in Excel direkt.',
    syntax: 'Jede Formel beginnt mit =, Argumente trennst du mit Semikolon, Dezimalzahlen mit Punkt. Setze Klammern, wenn ein Teil zuerst gerechnet werden muss.',
    logik: 'Baue WENN in drei Teilen: Bedingung; Wert wenn wahr; Wert wenn falsch. Text wie "Ja" steht in Anführungszeichen.',
    lookup: 'SUMMEWENN und ZÄHLENWENN brauchen zuerst den Prüfbereich, dann das Kriterium. Beziehe dich auf die Kriteriumszelle, statt Text fest einzutippen.',
    rundung: 'VRUNDEN(Betrag;0.05) rundet auf 5 Rappen, RUNDEN(Wert;2) auf 2 Stellen. Erst fertig rechnen, dann runden.',
    modell: 'Zerlege die Rechnung in Schritte und rechne sie im Kopf mit einfachen Zahlen nach. Prozentwerte rechnest du als Dezimalzahl (0.12), nicht mal 100.'
  };

  // Genauere Tipps für erkannte Ursachen
  var CAUSE_TIPS = {
    skipped: 'Diese Aufgabe hast du übersprungen oder die Zeit lief ab. Schau dir die Musterlösung an und übe die Kategorie.',
    noEquals: 'Eine Formel beginnt immer mit =.',
    comma: 'In der Schweizer Excel-Version trennst du Argumente mit Semikolon (;), nicht mit Komma.',
    english: 'Excel auf Deutsch braucht deutsche Funktionsnamen: SUMME, WENN, SUMMEWENN, RUNDEN.',
    quotes: 'Text in Formeln gehört in Anführungszeichen, z. B. "offen". Noch besser ist ein Bezug auf die Zelle mit dem Kriterium.',
    parse: 'Excel konnte die Formel nicht lesen. Zähle die Klammern und prüfe die Trennzeichen.',
    noRef: 'Rechne mit Zellbezügen statt mit festen Zahlen, sonst stimmt das Modell nach einer Änderung nicht mehr.',
    dollar: 'Hier fehlt das $-Zeichen. Ohne $ verrutscht der Bezug, sobald du die Formel kopierst.',
    hardcoded: 'Deine Formel stimmt nur für diese Zahlen. Wahrscheinlich ist ein Wert fest eingetippt oder ein Bezug zeigt auf die falsche Zelle.',
    percent100: 'Nicht mal 100 rechnen: Excel zeigt 0.127 im Prozentformat als 12.7 % an.',
    brackets: 'Punkt vor Strich und Potenz vor allem: Setze Klammern um Differenzen und Brüche, z. B. =B2/(B3-B4).',
    roundMissing: 'Die Aufgabe verlangt eine Rundung. Packe die ganze Rechnung in VRUNDEN bzw. RUNDEN.',
    ifMissing: 'Die Aufgabe verlangt eine Entscheidung. Nutze WENN(Bedingung;"Wert1";"Wert2").',
    lookupMissing: 'Für bedingte Summen nimmst du SUMMEWENN(Prüfbereich;Kriterium;Summenbereich).',
    textCase: 'Achte auf die genaue Schreibweise des Ausgabetextes, z. B. "Ja" oder "OK".'
  };

  // Funktion → Kategorie, wenn sie in mustUse fehlt
  var FN_CATEGORY = {
    VRUNDEN: 'rundung', RUNDEN: 'rundung', AUFRUNDEN: 'rundung', ABRUNDEN: 'rundung',
    WENN: 'logik', UND: 'logik', ODER: 'logik', WENNFEHLER: 'logik',
    SUMMEWENN: 'lookup', SUMMEWENNS: 'lookup', ZÄHLENWENN: 'lookup', ZÄHLENWENNS: 'lookup', SVERWEIS: 'lookup', XVERWEIS: 'lookup'
  };
  var FN_CAUSE = { rundung: 'roundMissing', logik: 'ifMissing', lookup: 'lookupMissing' };

  function out(category, cause) {
    var c = CATEGORIES.indexOf(category) === -1 ? 'modell' : category;
    return { category: c, label: LABELS[c], tip: (cause && CAUSE_TIPS[cause]) || TIPS[c], cause: cause || null };
  }

  // Inhalt von Text in Anführungszeichen ausblenden (Länge bleibt), damit Kommas in Texten nicht zählen
  function mask(f) {
    var s = '', inStr = false;
    for (var i = 0; i < f.length; i++) {
      var c = f[i];
      if (c === '"') { inStr = !inStr; s += c; continue; }
      s += inStr ? ' ' : c;
    }
    return s;
  }

  function fnNames(f) {
    var re = /([A-Za-zÄÖÜäöü][A-Za-zÄÖÜäöü0-9.]*)\s*\(/g, m, names = [];
    var masked = mask(f);
    while ((m = re.exec(masked))) names.push(m[1].toUpperCase());
    return names;
  }

  var EN_NAMES = /(^|[^A-Za-zÄÖÜäöü])(SUM|SUMIF|SUMIFS|COUNTIF|COUNTIFS|IF|ROUND|MROUND|VLOOKUP|XLOOKUP|AVERAGE|POWER|IFERROR)\s*\(/i;

  function classify(engineResult, formula, ex) {
    ex = ex || {};
    var cat = CATEGORIES.indexOf(ex.category) !== -1 ? ex.category : 'modell';
    var f = String(formula || '').trim();
    var r = engineResult || null;

    // Übersprungen oder Zeit abgelaufen
    if (!r || !f) return out(cat, 'skipped');
    if (r.ok) return out(cat, null);

    var msg = String(r.message || '');
    var masked = mask(f);
    var hints = ex.hints || {};

    // 1) Syntax: Gleichheitszeichen, Trennzeichen, englische Namen, Parsefehler
    if (f.charAt(0) !== '=') return out('syntax', 'noEquals');
    if (EN_NAMES.test(masked)) return out('syntax', 'english');
    if (/;/.test(f) === false && /,/.test(masked) && /\(/.test(masked)) return out('syntax', 'comma');
    if (/Semikolon/.test(msg) && /Komma/.test(msg)) return out('syntax', 'comma');
    if (hints.quotes && msg === hints.quotes) return out(cat === 'logik' ? 'logik' : 'lookup', 'quotes');
    if (/Anführungszeichen/.test(msg)) return out(cat === 'logik' ? 'logik' : 'lookup', 'quotes');
    if (r.errorValue === '#ERROR!' || r.errorValue === '#NAME?') return out('syntax', 'parse');
    if (r.errorValue) return out(cat === 'modell' ? 'modell' : 'syntax', 'parse');

    // 2) Bezüge: feste Zahlen statt Zellen, fehlendes $
    if (/Zellbezüge statt fester Zahlen/.test(msg)) return out('bezug', 'noRef');
    var mustContain = ex.mustContain || [];
    var missingDollar = mustContain.some(function (s) { return s.indexOf('$') !== -1 && f.toUpperCase().indexOf(s.toUpperCase()) === -1; });
    if (missingDollar) return out('bezug', 'dollar');

    // 3) Geforderte Funktion fehlt
    var names = fnNames(f);
    var mustUse = ex.mustUse || [];
    for (var i = 0; i < mustUse.length; i++) {
      var fn = String(mustUse[i]).toUpperCase();
      if (names.indexOf(fn) === -1) {
        var c = FN_CATEGORY[fn] || cat;
        return out(c, FN_CAUSE[c] || null);
      }
    }

    // 4) Gold-Prüfung (alt-Datensatz) nicht bestanden: Wert fest eingetippt oder falscher Bezug
    if (/Fast:/.test(msg) || /anderen Werten/.test(msg)) return out(cat, 'hardcoded');

    // 5) Falscher Wert: typische Muster erkennen
    if (/\*\s*100(?![\d.])/.test(masked) && cat === 'modell') return out('modell', 'percent100');
    if (typeof r.value === 'string' && cat === 'logik') return out('logik', 'textCase');
    if (cat === 'modell' || cat === 'syntax') {
      // Division oder Potenz ohne Klammer um den Nenner/Exponenten, z. B. =B2/B3-B4 oder =B3/B2^1/B4
      if (/\/\s*\$?[A-Z]+\$?\d+\s*[-+]/.test(masked) || /\^\s*\$?[0-9A-Z]/.test(masked) && !/\^\s*\(/.test(masked)) return out(cat, 'brackets');
    }
    return out(cat, null);
  }

  root.ExcelDrillsErrors = {
    CATEGORIES: CATEGORIES,
    LABELS: LABELS,
    TIPS: TIPS,
    CAUSE_TIPS: CAUSE_TIPS,
    label: function (c) { return LABELS[c] || c; },
    tip: function (c) { return TIPS[c] || ''; },
    isCategory: function (c) { return CATEGORIES.indexOf(c) !== -1; },
    classify: classify
  };
})(typeof window !== 'undefined' ? window : globalThis);
