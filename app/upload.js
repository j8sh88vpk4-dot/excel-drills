/*
 * Excel-Drills – «Excel-Datei prüfen» (upload/index.html)
 * Aufgabe als xlsx herunterladen, in Excel lösen, hochladen: Wir lesen Formel und Wert der Zielzelle mit
 * SheetJS direkt im Browser (die Datei verlässt den Rechner nie), übersetzen die intern englisch gespeicherte
 * Formel nach DE-CH und prüfen sie mit derselben Engine wie die Browser-Übungen (app/engine.js).
 *
 * Aufbau wie engine.js: IIFE mit root. Die Prüflogik (translateXlsxFormula, gradeCell, analyzeWorkbook,
 * checkFile) ist rein und läuft auch in Node (scripts/upload/test-upload.mjs lädt diese Datei per vm-Kontext).
 * Der Oberflächenteil startet nur, wenn ein document mit #upload-app vorhanden ist.
 */
(function (root) {
  'use strict';

  var UPLOAD_IDS = ['sverweis-1', 'summewenn-1', 'absolut-1', 'wenn-1', 'zaehlenwenn-1'];
  var SHEET_NAME = 'Aufgabe';
  var MAX_BYTES = 5 * 1024 * 1024;
  var SHEETJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  var SHEETJS_SRI = 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw';

  // Mini-Tabelle EN → DE für die Funktionen der Upload-Übungen und naheliegende Varianten.
  // Ergänzt (und wird ergänzt durch) Engine.EN_TO_DE; Einträge mit null heissen auf Deutsch gleich (INDEX, MAX, MIN).
  var EN_DE_FALLBACK = {
    SUM: 'SUMME', SUMIF: 'SUMMEWENN', SUMIFS: 'SUMMEWENNS', VLOOKUP: 'SVERWEIS', HLOOKUP: 'WVERWEIS',
    XLOOKUP: 'XVERWEIS', IF: 'WENN', IFS: 'WENNS', IFERROR: 'WENNFEHLER', COUNTIF: 'ZÄHLENWENN',
    COUNTIFS: 'ZÄHLENWENNS', COUNT: 'ANZAHL', COUNTA: 'ANZAHL2', AND: 'UND', OR: 'ODER', NOT: 'NICHT',
    ROUND: 'RUNDEN', AVERAGE: 'MITTELWERT', MATCH: 'VERGLEICH', PRODUCT: 'PRODUKT', ABS: null
  };
  var EN_CONST = { TRUE: 'WAHR', FALSE: 'FALSCH' };

  // Fehlertypen: Kurzname für die Fehlerkarte und Lerntipp. {target} und {fn} werden ersetzt.
  var TYPES = {
    'ok': { label: 'Richtig', tip: 'Stark. Löse als Nächstes die Übung im Browser mit anderen Zahlen oder lade eine weitere Aufgabe herunter.' },
    'leer': { label: 'Zielzelle ist leer', tip: 'Klicke in die gelbe Zelle {target}, tippe die Formel mit = am Anfang ein, drücke Enter und speichere die Datei (Ctrl+S), bevor du sie hochlädst.' },
    'nur-wert': { label: 'Nur Wert eingetippt, keine Formel', tip: 'Eine Formel beginnt immer mit =. Steht in der Bearbeitungsleiste nur eine Zahl, hast du das Ergebnis abgetippt. Eine Formel rechnet mit, wenn sich die Daten ändern, ein Wert nicht.' },
    'englischer-name': { label: 'Englischer Funktionsname', tip: 'Deutsches Excel kennt nur deutsche Funktionsnamen (SUMME, WENN, SVERWEIS). Tipp: Tippe = und die ersten Buchstaben, Excel schlägt dir die richtige Funktion vor, mit Tab übernimmst du sie.' },
    'unbekannte-funktion': { label: 'Funktion unbekannt', tip: 'Excel zeigt #NAME?, wenn es einen Funktionsnamen nicht kennt. Prüfe die Schreibweise oder lass dir den Namen von der AutoVervollständigung vorschlagen.' },
    'fehlendes-dollar': { label: 'Fehlendes $ (absoluter Bezug)', tip: 'F4 setzt die $-Zeichen für dich: Klicke in der Formel auf den Bezug und drücke F4, schon steht $F$1 da (Mac: Cmd+T). Teste danach mit Ausfüllen nach unten.' },
    'fehlendes-falsch': { label: 'Fehlendes FALSCH (exakte Suche)', tip: 'Ohne FALSCH sucht SVERWEIS nur ungefähr und liefert bei unsortierten Listen falsche Treffer, ohne Fehlermeldung. Schreib das vierte Argument immer aus: ;FALSCH) oder ;0).' },
    'falsche-funktion': { label: 'Andere Funktion als verlangt', tip: 'Das Ergebnis zählt, aber auch der Weg: Mit {fn} bleibt die Formel richtig, wenn Zeilen dazukommen oder sich Werte ändern. Einzelne Zellen zusammenzählen bricht bei der nächsten Änderung.' },
    'anfuehrungszeichen': { label: 'Text ohne Anführungszeichen', tip: 'Text in Formeln steht immer in Anführungszeichen, zum Beispiel "Ost". Ohne sucht Excel einen benannten Bereich mit diesem Namen und zeigt #NAME?.' },
    'keine-bezuege': { label: 'Feste Zahlen statt Zellbezüge', tip: 'Verweise auf Zellen (B2, A2:A9), statt Zahlen abzutippen. Dann rechnet die Formel neu, sobald sich die Daten ändern.' },
    'falscher-bereich': { label: 'Falscher Bereich', tip: 'Markiere den Bereich mit der Maus statt ihn abzutippen und prüfe, ob die erste und die letzte Datenzeile drin sind (ohne Kopfzeile). Ctrl+Shift+Pfeil nach unten markiert bis zur letzten gefüllten Zeile.' },
    'fehlerwert': { label: 'Formel liefert einen Fehlerwert', tip: 'Klicke in Excel auf das Warnsymbol neben der Zelle und dann auf «Berechnungsschritte anzeigen». So siehst du, welcher Teil der Formel den Fehler auslöst.' },
    'nicht-allgemein': { label: 'Stimmt nur für diese Zahlen', tip: 'Teste deine Formel, indem du eine Zahl in der Tabelle änderst. Bleibt das Ergebnis richtig? Feste Zahlen oder Ergebnisse in der Formel machen sie zerbrechlich.' },
    'falscher-wert': { label: 'Falsches Ergebnis', tip: 'Werte die Formel Schritt für Schritt aus: Register «Formeln» › «Formelauswertung». So siehst du, ab wo das Ergebnis abweicht.' },
    'wert-abweichend': { label: 'Ergebnis in der Datei weicht ab', tip: 'Hast du Zahlen in der Tabelle verändert, oder steht die Berechnung auf «Manuell»? Register «Formeln» › «Berechnungsoptionen» › «Automatisch», dann neu speichern.' }
  };

  // Meldungen zu Dateien, die wir gar nicht erst prüfen können
  var FILE_ERRORS = {
    'kein-xlsx-xls': 'Das ist eine alte .xls-Datei. Speichere sie in Excel mit «Datei» › «Speichern unter» als «Excel-Arbeitsmappe (*.xlsx)» und lade sie nochmals hoch.',
    'kein-xlsx-csv': 'Eine CSV-Datei speichert nur Werte, keine Formeln. Speichere die Datei als «Excel-Arbeitsmappe (*.xlsx)» und lade sie nochmals hoch.',
    'kein-xlsx': 'Bitte lade eine Excel-Datei im Format .xlsx hoch (die heruntergeladene Aufgabe, in Excel gelöst und gespeichert).',
    'zu-gross': 'Die Datei ist grösser als 5 MB. Die Aufgabendatei ist nur wenige KB gross: Lade bitte genau diese Datei hoch.',
    'kaputt': 'Die Datei lässt sich nicht lesen. Ist sie beschädigt oder mit einem Passwort geschützt? Öffne sie in Excel, speichere sie als .xlsx ohne Kennwort und lade sie nochmals hoch.',
    'falsches-blatt': 'In dieser Datei fehlt das Blatt «Aufgabe». Lade die Aufgabendatei von dieser Seite herunter, löse sie dort, wo die gelbe Zelle ist, und benenne das Blatt nicht um.',
    'andere-datei': 'Diese Datei passt nicht zur gewählten Übung: Die Kopfzeile im Blatt «Aufgabe» ist anders. Wähle oben die richtige Übung oder lade die passende Aufgabendatei herunter.'
  };

  /* ---------- Hilfsfunktionen ---------- */

  function fill(str, params) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return params && params[k] != null ? String(params[k]) : m; });
  }

  // Wendet fn auf alle Teile ausserhalb von String-Literalen an ("" innerhalb eines Strings bleibt korrekt).
  function mapOutsideStrings(f, fn) {
    var parts = String(f).split('"');
    for (var i = 0; i < parts.length; i += 2) parts[i] = fn(parts[i], i);
    return parts.join('"');
  }
  // Nur die Teile ausserhalb von Strings, zusammengehängt (für Analysen)
  function outsideStrings(f) {
    var parts = String(f).split('"'), out = [];
    for (var i = 0; i < parts.length; i += 2) out.push(parts[i]);
    return out.join(' ');
  }

  var NAME_CH = 'A-Za-zÀ-ÖØ-öø-ÿ';
  var FN_RE = new RegExp('(^|[^' + NAME_CH + '0-9._$])([' + NAME_CH + '][' + NAME_CH + '0-9._]*)(?=\\()', 'g');
  var WORD_RE = new RegExp('(^|[^' + NAME_CH + '0-9._$!])([' + NAME_CH + ']+)(?![' + NAME_CH + '0-9._(!])', 'g');

  function enDeMap(E) {
    var map = {}, k;
    for (k in EN_DE_FALLBACK) if (Object.prototype.hasOwnProperty.call(EN_DE_FALLBACK, k)) map[k] = EN_DE_FALLBACK[k];
    var eng = E && E.EN_TO_DE;
    if (eng) for (k in eng) if (Object.prototype.hasOwnProperty.call(eng, k)) map[k] = eng[k];
    return map;
  }

  function engineRef() { return root.ExcelDrillsEngine || null; }

  /*
   * Funktionsnamen, die Excel beim Speichern als unbekannt markiert hat («_xludf.SUM»). Das passiert, wenn
   * jemand in deutschem Excel einen englischen Namen (oder einen Tippfehler) eingibt: Excel zeigt #NAME?.
   */
  function unknownFunctions(f) {
    var out = [], m, re = /_xludf\.([A-Za-z0-9_.]+)/gi, s = outsideStrings(f);
    while ((m = re.exec(s))) out.push(m[1].toUpperCase());
    return out;
  }

  /*
   * Reine Funktion: Formel aus der xlsx-Datei (SheetJS cell.f, intern englisch, Komma als Trenner, ohne «=»)
   * nach DE-CH übersetzen. Beispiel: translateXlsxFormula('SUM(B2,B5)') → '=SUMME(B2;B5)'.
   *  - Zeilenumbrüche (auch als _x000a_ gespeichert), Leerzeichen und geschützte Leerzeichen ausserhalb von Texten fallen weg
   *  - Präfixe _xlfn., _xlws., _xlpm., _xludf. werden entfernt, Bezüge auf das eigene Blatt («Aufgabe!») auch
   *  - Funktionsnamen EN → DE (Engine-Tabelle plus Mini-Tabelle), TRUE/FALSE → WAHR/FALSCH, alles gross
   *  - Komma als Argumenttrenner → Semikolon (nicht in Texten, nicht in Array-Konstanten {…}); Punkt-Dezimal bleibt
   */
  function translateXlsxFormula(f, E) {
    if (f === null || f === undefined) return null;
    var map = enDeMap(E || engineRef());
    var s = String(f).replace(/_x000[aAdD]_/g, '\n').trim();
    if (s.charAt(0) === '=') s = s.slice(1);
    var braces = 0;
    s = mapOutsideStrings(s, function (part) {
      part = part.replace(/[\s ]+/g, '');
      part = part.replace(/_xl(fn|ws|pm|udf)\./gi, '');
      part = part.replace(/'?Aufgabe'?!/gi, '');
      part = part.toUpperCase();
      part = part.replace(FN_RE, function (m, pre, name) {
        var de = Object.prototype.hasOwnProperty.call(map, name) ? map[name] : null;
        return pre + (de || name);
      });
      part = part.replace(WORD_RE, function (m, pre, name) {
        return EN_CONST[name] ? pre + EN_CONST[name] : m;
      });
      var out = '';
      for (var i = 0; i < part.length; i++) {
        var c = part.charAt(i);
        if (c === '{') braces++;
        else if (c === '}') braces = Math.max(0, braces - 1);
        out += c === ',' && braces === 0 ? ';' : c;
      }
      return out;
    });
    return '=' + s;
  }

  // Alle Zellbezüge und Bereiche einer Formel, ohne $ und in Grossbuchstaben, sortiert (für den Bereichsvergleich)
  function refsOf(f) {
    var s = outsideStrings(String(f || '')).toUpperCase().replace(/\$/g, ''), m, out = [];
    var re = /(^|[^A-ZÄÖÜ0-9_.])([A-Z]{1,3}\d+(?::[A-Z]{1,3}\d+)?|[A-Z]{1,3}:[A-Z]{1,3})(?![A-Z0-9(])/g;
    while ((m = re.exec(s))) { out.push(m[2]); re.lastIndex = m.index + m[0].length; }
    return out.sort();
  }
  function sameList(a, b) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
  function usesFn(deFormula, fn) {
    return new RegExp('(^|[^' + NAME_CH + '0-9._])' + fn + '\\(', 'i').test(outsideStrings(deFormula));
  }

  // Argumente des ersten Aufrufs von fn (oberste Ebene der Klammer), z. B. SVERWEIS(D2;A2:B6;2) → ['D2','A2:B6','2']
  function callArgs(deFormula, fn) {
    // Strings maskieren (gleiche Länge), damit ; und Klammern in Texten nicht zählen
    var plain = '', inStr = false;
    for (var i = 0; i < deFormula.length; i++) {
      var c = deFormula.charAt(i);
      if (c === '"') { inStr = !inStr; plain += c; continue; }
      plain += inStr ? ' ' : c;
    }
    var m = new RegExp('(^|[^' + NAME_CH + '0-9._])' + fn + '\\(', 'i').exec(plain);
    if (!m) return null;
    var start = m.index + m[0].length, depth = 0, args = [], cur = '';
    for (var j = start; j < plain.length; j++) {
      var ch = plain.charAt(j);
      if (ch === '(') depth++;
      if (ch === ')') { if (depth === 0) { args.push(deFormula.slice(j - cur.length, j)); return args; } depth--; }
      if (ch === ';' && depth === 0) { args.push(deFormula.slice(j - cur.length, j)); cur = ''; continue; }
      cur += ch;
    }
    args.push(cur);
    return args;
  }

  // SVERWEIS ohne exakte Suche? (nur drei Argumente oder viertes Argument WAHR/1)
  function missingFalse(ex, deFormula) {
    if (!/SVERWEIS\(/i.test(ex.solution || '')) return false;
    var args = callArgs(deFormula, 'SVERWEIS');
    if (!args) return false;
    if (args.length < 4) return true;
    var fourth = String(args[3]).toUpperCase().replace(/\s/g, '');
    return fourth === 'WAHR' || fourth === 'WAHR()' || fourth === '1' || fourth === '';
  }

  function missingDollar(ex, deFormula) {
    var f = String(deFormula).toUpperCase();
    return (ex.mustContain || []).filter(function (s) { return s.indexOf('$') !== -1 && f.indexOf(s.toUpperCase()) === -1; });
  }

  function rangesDiffer(ex, deFormula) {
    var mine = refsOf(deFormula);
    var refs = [ex.solution].concat(ex.accept || []);
    for (var i = 0; i < refs.length; i++) if (sameList(mine, refsOf(refs[i]))) return false;
    return true;
  }

  // Wert einer SheetJS-Zelle (Zahl, Text, Wahrheitswert, Fehler als Text wie «#NV»)
  function cellValue(cell) {
    if (!cell || cell.t === 'z') return null;
    if (cell.t === 'e') return cell.w || '#FEHLER';
    if (cell.v === undefined) return null;
    return cell.v;
  }

  function valuesEqual(a, b) {
    if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) <= 1e-9;
    if (typeof a === 'string' && typeof b === 'string') return a.trim().toLowerCase() === b.trim().toLowerCase();
    return a === b;
  }

  function fmt(E, v) {
    if (v === null || v === undefined || v === '') return '(leer)';
    return E && E.formatValue ? E.formatValue(v, 'de-CH') : String(v);
  }

  /*
   * Reine Funktion: bewertet die Zielzelle einer hochgeladenen Datei.
   *   cell: SheetJS-Zelle ({ t, v, f, w }) oder null
   * Rückgabe: { ok, typ, label, message, detail, tip, stored, de, fileValue, expected, engine }
   *   stored = Formel, wie Excel sie in der Datei speichert (englisch, mit «=»), de = Formel, wie du sie
   *   in Schweizer Excel siehst. typ ist ein Schlüssel aus TYPES.
   */
  function gradeCell(HF, E, ex, cell) {
    E = E || engineRef();
    var expectedRes = E.evaluate(HF, ex.data, ex.target, ex.solution);
    var expected = expectedRes.error ? null : expectedRes.value;
    var fileValue = cellValue(cell);
    var f = cell && typeof cell.f === 'string' && cell.f.trim() ? cell.f : null;
    var res = {
      ok: false, typ: 'falscher-wert', message: '', detail: '', stored: f ? '=' + f.replace(/^=/, '') : null, de: null,
      fileValue: fileValue, expected: expected, engine: null, target: ex.target
    };
    function done(typ, message, extra) {
      res.typ = typ;
      res.ok = typ === 'ok';
      res.label = TYPES[typ].label;
      res.message = message;
      res.tip = fill(TYPES[typ].tip, { target: ex.target, fn: (ex.mustUse || [])[0] || 'der verlangten Funktion' });
      if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) res[k] = extra[k];
      return res;
    }

    if (!f) {
      if (fileValue === null || fileValue === '') {
        return done('leer', 'In ' + ex.target + ' steht nichts. Entweder fehlt die Formel, oder die Datei wurde vor dem Hochladen nicht gespeichert.');
      }
      var same = valuesEqual(fileValue, expected);
      return done('nur-wert', 'In ' + ex.target + ' steht der Wert ' + fmt(E, fileValue) + ', aber keine Formel. ' +
        (same ? 'Das Ergebnis stimmt zwar, doch Excel rechnet nicht mit: Ändern sich die Daten, bleibt ' + fmt(E, fileValue) + ' stehen.'
              : 'Erwartet ist ' + fmt(E, expected) + ', berechnet mit einer Formel.'));
    }

    res.de = translateXlsxFormula(f, E);

    var unknown = unknownFunctions(f);
    if (unknown.length) {
      var map = enDeMap(E), name = unknown[0];
      if (Object.prototype.hasOwnProperty.call(map, name)) {
        return done('englischer-name', 'Du hast ' + name + ' geschrieben. Deutsches Excel kennt diese Funktion nicht und zeigt #NAME?. ' +
          'Auf Deutsch heisst sie ' + (map[name] || name) + '.');
      }
      return done('unbekannte-funktion', 'Excel kennt die Funktion ' + name + ' nicht und zeigt #NAME?. Prüfe die Schreibweise.');
    }

    var r = E.check(HF, ex, res.de);
    res.engine = r;

    if (r.ok) {
      if (missingFalse(ex, res.de)) {
        return done('fehlendes-falsch', 'Das Ergebnis stimmt hier nur zufällig: Ohne FALSCH als viertes Argument sucht SVERWEIS ungefähr. ' +
          'In einer unsortierten Liste liefert die Formel dann still einen falschen Preis.');
      }
      if (fileValue !== null && expected !== null && !valuesEqual(fileValue, expected)) {
        return done('wert-abweichend', 'Deine Formel ist richtig, aber in deiner Datei steht als Ergebnis ' + fmt(E, fileValue) +
          ' statt ' + fmt(E, expected) + '. Wahrscheinlich hast du Daten in der Tabelle verändert, oder Excel hat nicht neu berechnet.');
      }
      var extra = {}, notes = [];
      if (rangesDiffer(ex, res.de)) {
        notes.push('Hinweis: Deine Bereiche (' + refsOf(res.de).join(', ') + ') weichen von der Musterlösung ab. ' +
          'Das Ergebnis stimmt, prüfe trotzdem, ob wirklich die ganze Tabelle drin ist.');
      }
      if (r.tip) notes.push(r.tip);
      if (notes.length) extra.detail = notes.join(' ');
      return done('ok', 'Deine Formel liefert das richtige Ergebnis: ' + fmt(E, expected) + '.', extra);
    }

    // Fehler einordnen (Reihenfolge = vom konkretesten zum allgemeinsten Typ)
    var dollars = missingDollar(ex, res.de);
    if (dollars.length) {
      return done('fehlendes-dollar', 'In deiner Formel fehlt ' + dollars.join(', ') + '. Ohne $ verschiebt sich der Bezug beim Kopieren nach unten, ' +
        'und die Zeilen darunter rechnen mit einer leeren Zelle.');
    }
    if (E.hasUnquotedCriterion && E.hasUnquotedCriterion(res.de)) {
      return done('anfuehrungszeichen', r.message);
    }
    if (r.errorValue) {
      return done('fehlerwert', 'Deine Formel ergibt ' + r.errorValue + '. ' + r.message);
    }
    if (missingFalse(ex, res.de)) {
      return done('fehlendes-falsch', 'Ohne FALSCH als viertes Argument sucht SVERWEIS ungefähr und trifft hier daneben. ' + r.message);
    }
    if (E.hasCellRef && !E.hasCellRef(res.de)) return done('keine-bezuege', r.message);
    var mustUse = ex.mustUse || [];
    for (var i = 0; i < mustUse.length; i++) {
      if (!usesFn(res.de, mustUse[i])) {
        return done('falsche-funktion', 'Diese Übung verlangt ' + mustUse[i] + '. ' +
          (r.value !== undefined && valuesEqual(r.value, expected) ? 'Dein Ergebnis stimmt zwar, aber es bricht, sobald sich die Daten ändern.' : r.message));
      }
    }
    if (E.MSG && r.message === E.MSG.alt) return done('nicht-allgemein', r.message);
    if (rangesDiffer(ex, res.de)) {
      return done('falscher-bereich', 'Deine Formel verwendet ' + refsOf(res.de).join(', ') + '. Das Ergebnis ist ' + fmt(E, r.value) +
        ' statt ' + fmt(E, expected) + '. Prüfe, ob der Bereich die ganze Tabelle abdeckt.');
    }
    return done('falscher-wert', 'Deine Formel ergibt ' + fmt(E, r.value) + ' statt ' + fmt(E, expected) + '. ' + r.message);
  }

  /* ---------- Datei und Arbeitsmappe ---------- */

  /*
   * Reine Funktion: Datei vor dem Lesen prüfen. bytes = die ersten Bytes (Uint8Array) oder null.
   * Rückgabe null (in Ordnung) oder { error, message }.
   */
  function checkFile(name, size, bytes) {
    var n = String(name || '').toLowerCase();
    var err = function (code) { return { error: code, message: FILE_ERRORS[code] }; };
    if (/\.xls$/.test(n)) return err('kein-xlsx-xls');
    if (/\.(csv|txt|tsv)$/.test(n)) return err('kein-xlsx-csv');
    if (!/\.(xlsx|xlsm)$/.test(n)) return err('kein-xlsx');
    if (size > MAX_BYTES) return err('zu-gross');
    if (bytes && bytes.length >= 2 && !(bytes[0] === 0x50 && bytes[1] === 0x4b)) {
      // xlsx ist ein ZIP-Archiv («PK»); eine umbenannte .xls beginnt mit D0 CF 11 E0
      if (bytes[0] === 0xd0 && bytes[1] === 0xcf) return err('kein-xlsx-xls');
      return err('kaputt');
    }
    return null;
  }

  function colLetters(i) { var s = ''; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function parseTarget(a1) {
    var m = /^([A-Z]+)(\d+)$/.exec(a1), col = 0;
    for (var i = 0; i < m[1].length; i++) col = col * 26 + (m[1].charCodeAt(i) - 64);
    return { row: Number(m[2]) - 1, col: col - 1 };
  }

  // Übungs-ID aus den Dokumenteigenschaften (Stichwörter «excel-drills:<id>», gesetzt vom Generator)
  function fileExerciseId(wb) {
    var kw = wb && wb.Props && wb.Props.Keywords ? String(wb.Props.Keywords) : '';
    var m = /excel-drills:([a-z0-9-]+)/i.exec(kw);
    return m ? m[1].toLowerCase() : null;
  }

  function findSheet(wb) {
    var names = (wb && wb.SheetNames) || [];
    for (var i = 0; i < names.length; i++) if (names[i].trim().toLowerCase() === SHEET_NAME.toLowerCase()) return names[i];
    return null;
  }

  function readWorkbook(XLSX, data) {
    try {
      var bytes = Object.prototype.toString.call(data) === '[object ArrayBuffer]' ? new Uint8Array(data) : data;
      return { wb: XLSX.read(bytes, { type: 'array', cellFormula: true, cellHTML: false, cellStyles: false, sheetStubs: true }) };
    } catch (e) {
      return { error: 'kaputt', message: FILE_ERRORS.kaputt };
    }
  }

  /*
   * Arbeitsmappe (SheetJS) gegen eine Übung prüfen. Rückgabe:
   *   { error, message, fileId? }                          Datei passt nicht (falsches Blatt, andere Übung)
   *   { result, grid, diffs, fileId, sheet }               result aus gradeCell, grid = nachgezeichnete Tabelle
   * Gehört die Datei laut Dokumenteigenschaften zu einer anderen Upload-Übung, kommt { error: 'andere-uebung', fileId }
   * zurück; die Oberfläche wechselt dann zur passenden Übung.
   */
  function analyzeWorkbook(HF, E, wb, ex) {
    E = E || engineRef();
    var sheetName = findSheet(wb);
    if (!sheetName) return { error: 'falsches-blatt', message: FILE_ERRORS['falsches-blatt'], sheets: (wb && wb.SheetNames) || [] };
    var fileId = fileExerciseId(wb);
    if (fileId && fileId !== ex.id) return { error: 'andere-uebung', fileId: fileId };
    var ws = wb.Sheets[sheetName];
    var t = parseTarget(ex.target);

    // Kopfzeile vergleichen (falls die Datei keine ID trägt, z. B. selbst gebaut oder Eigenschaften gelöscht)
    var head = ex.data[0] || [];
    var headOk = true;
    for (var h = 0; h < head.length; h++) {
      if (typeof head[h] !== 'string' || !head[h]) continue;
      var hc = ws[colLetters(h) + '1'];
      if (!hc || String(cellValue(hc) || '').trim().toLowerCase() !== head[h].trim().toLowerCase()) { headOk = false; break; }
    }
    if (!headOk) return { error: 'andere-datei', message: FILE_ERRORS['andere-datei'], fileId: fileId };

    // Tabelle nachzeichnen: so gross wie die Übungsdaten (mindestens bis zur Zielzelle)
    var rows = Math.max(ex.data.length, t.row + 1), cols = t.col + 1;
    ex.data.forEach(function (r) { cols = Math.max(cols, r.length); });
    var grid = [], diffs = [];
    for (var r = 0; r < rows; r++) {
      var line = [];
      for (var c = 0; c < cols; c++) {
        var addr = colLetters(c) + (r + 1), cell = ws[addr];
        var isTarget = r === t.row && c === t.col;
        var want = (ex.data[r] || [])[c];
        if (want === undefined || want === '') want = null;
        var have = cellValue(cell);
        if (have === '') have = null;
        // Nur veränderte Vorgaben markieren; selbst ergänzte Zellen (z. B. nach unten ausgefüllt) zählen nicht
        var changed = !isTarget && want !== null && !valuesEqual(have, want);
        if (changed) diffs.push({ addr: addr, have: have, want: want });
        line.push({ addr: addr, value: have, formula: cell && cell.f ? '=' + cell.f : null, target: isTarget, changed: changed });
      }
      grid.push(line);
    }
    var result = gradeCell(HF, E, ex, ws[ex.target] || null);
    if (diffs.length && !result.ok) {
      result.detail = (result.detail ? result.detail + ' ' : '') + 'Hinweis: In deiner Datei weichen ' + diffs.length +
        (diffs.length === 1 ? ' Zelle' : ' Zellen') + ' von der Aufgabe ab (' + diffs.slice(0, 4).map(function (d) { return d.addr; }).join(', ') +
        (diffs.length > 4 ? ', …' : '') + '). Geprüft wird mit den Originaldaten.';
    }
    return { result: result, grid: grid, diffs: diffs, fileId: fileId, sheet: sheetName };
  }

  var api = {
    UPLOAD_IDS: UPLOAD_IDS,
    SHEET_NAME: SHEET_NAME,
    SHEETJS_URL: SHEETJS_URL,
    SHEETJS_SRI: SHEETJS_SRI,
    TYPES: TYPES,
    FILE_ERRORS: FILE_ERRORS,
    translateXlsxFormula: translateXlsxFormula,
    unknownFunctions: unknownFunctions,
    refsOf: refsOf,
    gradeCell: gradeCell,
    checkFile: checkFile,
    readWorkbook: readWorkbook,
    analyzeWorkbook: analyzeWorkbook,
    fileExerciseId: fileExerciseId
  };
  root.ExcelDrillsUpload = api;

  /* ---------- Oberfläche (nur im Browser) ---------- */

  var doc = root.document;
  if (!doc || typeof doc.getElementById !== 'function') return;

  function start() {
    var app = doc.getElementById('upload-app');
    if (!app) return;
    var $ = function (id) { return doc.getElementById(id); };
    var els = {
      list: $('uebung-liste'), download: $('download-link'), downloadName: $('download-name'), browserLink: $('browser-link'),
      drop: $('dropzone'), input: $('datei'), status: $('upload-status'), result: $('ergebnis'),
      verdict: $('ergebnis-urteil'), grid: $('fehlerkarte'), facts: $('ergebnis-fakten'), again: $('nochmals'),
      taskText: $('aufgabe-text')
    };
    var E = root.ExcelDrillsEngine, HF = root.HyperFormula, exercises = {}, current = null, engineOk = false, xlsxPromise = null;

    function track(name, props) {
      try { if (typeof root.ExcelDrillsTrack === 'function') root.ExcelDrillsTrack(name, props); } catch (e) { /* ignorieren */ }
    }
    function status(text, kind) {
      els.status.textContent = text || '';
      els.status.className = 'upload-status' + (kind ? ' ' + kind : '');
      els.status.hidden = !text;
    }
    function el(tag, cls, text) {
      var n = doc.createElement(tag);
      if (cls) n.className = cls;
      if (text !== undefined && text !== null) n.textContent = text;
      return n;
    }

    try {
      if (!E || !HF) throw new Error('Engine fehlt');
      E.init(HF);
      E.setLocale('de-CH');
      engineOk = true;
    } catch (e) {
      status('Die Prüf-Engine konnte nicht geladen werden. Lade die Seite neu oder prüfe, ob ein Werbeblocker Skripte blockiert.', 'err');
    }

    // SheetJS erst bei Bedarf laden (ca. 900 KB), mit SRI-Prüfung
    function loadXlsx() {
      if (root.XLSX) return Promise.resolve(root.XLSX);
      if (xlsxPromise) return xlsxPromise;
      xlsxPromise = new Promise(function (resolve, reject) {
        var s = doc.createElement('script');
        s.src = SHEETJS_URL;
        s.integrity = SHEETJS_SRI;
        s.crossOrigin = 'anonymous';
        s.onload = function () { root.XLSX ? resolve(root.XLSX) : reject(new Error('XLSX fehlt')); };
        s.onerror = function () { xlsxPromise = null; reject(new Error('SheetJS nicht geladen')); };
        doc.head.appendChild(s);
      });
      return xlsxPromise;
    }

    function selectExercise(id, opts) {
      if (!exercises[id]) id = UPLOAD_IDS[0];
      current = exercises[id];
      var radio = els.list.querySelector('input[value="' + id + '"]');
      if (radio) radio.checked = true;
      els.download.href = '../app/files/upload/' + id + '.xlsx';
      els.download.setAttribute('download', 'excel-drills-' + id + '.xlsx');
      if (els.downloadName) els.downloadName.textContent = 'excel-drills-' + id + '.xlsx';
      els.browserLink.href = '../app/#' + id;
      if (els.taskText && current) els.taskText.textContent = current.task + ' Zielzelle: ' + current.target + '.';
      if (!opts || !opts.keepResult) { els.result.hidden = true; status(''); }
      try { root.history.replaceState(null, '', '#' + id); } catch (e) { /* ignorieren */ }
    }

    function renderGrid(analysis) {
      var res = analysis.result;
      var table = el('table', 'sheet upload-sheet');
      var thead = el('thead'), hr = el('tr');
      hr.appendChild(el('th', null, ''));
      analysis.grid[0].forEach(function (c, i) { var th = el('th', null, colLetters(i)); th.scope = 'col'; hr.appendChild(th); });
      thead.appendChild(hr);
      table.appendChild(thead);
      var tbody = el('tbody');
      analysis.grid.forEach(function (row, r) {
        var tr = el('tr', r === 0 ? 'header-row' : null);
        var th = el('th', null, String(r + 1)); th.scope = 'row'; tr.appendChild(th);
        row.forEach(function (c) {
          var td = el('td', null, c.value === null ? '' : E.formatValue(c.value, 'de-CH'));
          if (typeof c.value === 'number') td.classList.add('num');
          if (c.target) {
            td.classList.add('target', res.ok ? 'is-ok' : 'is-err');
            if (c.value === null) td.textContent = res.ok ? '' : '?';
            td.title = c.formula ? c.formula : 'keine Formel';
            var sr = el('span', 'visually-hidden', res.ok ? ' (Zielzelle, richtig)' : ' (Zielzelle, ' + res.label + ')');
            td.appendChild(sr);
          } else if (c.changed) {
            td.classList.add('changed');
            td.title = 'Weicht von der Aufgabe ab';
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      var cap = el('caption', 'visually-hidden', 'Deine Datei, Blatt ' + analysis.sheet + ', Zielzelle ' + res.target);
      table.insertBefore(cap, table.firstChild);
      els.grid.textContent = '';
      els.grid.appendChild(table);
    }

    function fact(label, value, opts) {
      var dt = el('dt', null, label), dd = el('dd');
      if (opts && opts.code) dd.appendChild(el('code', 'formula', value));
      else dd.textContent = value;
      els.facts.appendChild(dt);
      els.facts.appendChild(dd);
      return dd;
    }

    function renderResult(analysis) {
      var res = analysis.result;
      els.result.hidden = false;
      els.result.classList.toggle('is-ok', res.ok);
      els.result.classList.toggle('is-err', !res.ok);
      els.verdict.textContent = res.ok ? 'Richtig: ' + current.title : res.label;
      renderGrid(analysis);
      els.facts.textContent = '';
      fact('Ergebnis', res.ok ? 'Richtig' : 'Noch nicht richtig');
      fact('Fehlertyp', res.ok ? 'Kein Fehler' : res.label);
      fact('Deine Formel (so siehst du sie in Schweizer Excel)', res.de || 'keine Formel', { code: !!res.de });
      fact('So speichert Excel sie in der Datei (intern englisch)', res.stored || 'keine Formel', { code: !!res.stored });
      fact('Wert in deiner Datei', fmt(E, res.fileValue));
      fact('Erwartetes Ergebnis', fmt(E, res.expected));
      fact('Erklärung', res.message + (res.detail ? ' ' + res.detail : ''));
      fact('Lerntipp', res.tip);
      var dd = fact('Weiterüben', '');
      var a = el('a', null, 'Diese Übung im Browser lösen (mit anderen Zahlen)');
      a.href = '../app/#' + current.id;
      dd.appendChild(a);
      els.result.focus();
    }

    function fail(code, message) {
      els.result.hidden = true;
      status(message, 'err');
      track('upload_check', { uebung: current ? current.id : '', ergebnis: 'fehler', typ: code });
    }

    function handleFile(file) {
      if (!file) return;
      if (!engineOk || !current) { status('Die Seite ist noch nicht bereit. Lade sie neu und versuche es nochmals.', 'err'); return; }
      var pre = checkFile(file.name, file.size, null);
      if (pre) { fail(pre.error, pre.message); return; }
      status('Datei wird gelesen …', 'info');
      var reader = new root.FileReader();
      reader.onerror = function () { fail('kaputt', FILE_ERRORS.kaputt); };
      reader.onload = function () {
        var buf = reader.result;
        var bad = checkFile(file.name, file.size, new Uint8Array(buf, 0, Math.min(4, buf.byteLength)));
        if (bad) { fail(bad.error, bad.message); return; }
        loadXlsx().then(function (XLSX) {
          var read = readWorkbook(XLSX, buf);
          if (read.error) { fail(read.error, read.message); return; }
          var analysis = analyzeWorkbook(HF, E, read.wb, current);
          if (analysis.error === 'andere-uebung' && exercises[analysis.fileId]) {
            var from = current.title;
            selectExercise(analysis.fileId, { keepResult: true });
            analysis = analyzeWorkbook(HF, E, read.wb, current);
            if (!analysis.error) status('Diese Datei gehört zur Übung «' + current.title + '» (nicht «' + from + '»). Ich habe sie dort geprüft.', 'info');
          } else status('');
          if (analysis.error) { fail(analysis.error, analysis.message || FILE_ERRORS['andere-datei']); return; }
          renderResult(analysis);
          track('upload_check', { uebung: current.id, ergebnis: analysis.result.ok ? 'ok' : 'fehler', typ: analysis.result.typ });
        }).catch(function () {
          fail('sheetjs', 'Der Datei-Leser (SheetJS) konnte nicht geladen werden. Prüfe deine Internetverbindung oder einen Werbeblocker und versuche es nochmals.');
        });
      };
      reader.readAsArrayBuffer(file);
    }

    els.list.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'uebung') selectExercise(e.target.value);
    });
    els.input.addEventListener('change', function () {
      handleFile(els.input.files && els.input.files[0]);
      els.input.value = '';
    });
    // SheetJS vorwärmen, sobald jemand den Upload-Bereich ansteuert
    ['pointerenter', 'focusin', 'dragenter'].forEach(function (ev) {
      els.drop.addEventListener(ev, function () { loadXlsx().catch(function () { /* später nochmals */ }); }, { once: true });
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      els.drop.addEventListener(ev, function (e) { e.preventDefault(); els.drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      els.drop.addEventListener(ev, function (e) { e.preventDefault(); els.drop.classList.remove('is-over'); });
    });
    els.drop.addEventListener('drop', function (e) {
      var files = e.dataTransfer && e.dataTransfer.files;
      handleFile(files && files[0]);
    });
    if (els.again) els.again.addEventListener('click', function () { els.input.click(); });
    els.download.addEventListener('click', function () { track('upload_download', { uebung: current ? current.id : '' }); });

    root.fetch('../app/exercises.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (json) {
        (json.exercises || []).forEach(function (ex) { if (UPLOAD_IDS.indexOf(ex.id) !== -1) exercises[ex.id] = ex; });
        var hash = String(root.location.hash || '').replace(/^#/, '');
        var q = /[?&]uebung=([a-z0-9-]+)/.exec(root.location.search || '');
        selectExercise(exercises[hash] ? hash : q && exercises[q[1]] ? q[1] : UPLOAD_IDS[0]);
        app.classList.add('is-ready');
      })
      .catch(function () {
        status('Die Übungen konnten nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite neu.', 'err');
      });
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start);
  else start();
})(typeof window !== 'undefined' ? window : globalThis);
