// Erzeugt die Projekt-Übungen des Pfads «Data & Reporting» (track «data»):
//  - die Excel-Dateien in app/files/ (Daten als formatierte Tabelle, Beträge als Zahlen, Datum als echtes Datum)
//  - dieselben Dateien für Deutschland in app/files/de/ (gleiche Zahlen, DE-Ortsnamen, EUR-Spaltenköpfe;
//    Texte über die zentrale Textabbildung in app/engine.js, damit App und Dateien zusammenpassen)
//  - dieselben Dateien auf Französisch und Italienisch in app/files/fr/ und app/files/it/ (gleiche Zahlen;
//    Blattnamen, Kopfzeilen und Text-Zellen über «files» in app/i18n/fr.json bzw. it.json)
//  - die Übungen inkl. berechneter Musterantworten in app/exercises.json (type "project")
// Alles ist deterministisch (fester Seed pro Projekt). Die Antworten rechnet dieses Skript selbst nach.
//
// Aufruf:  node scripts/data/generate-projects.mjs           Dateien + exercises.json schreiben
//          node scripts/data/generate-projects.mjs --check   nur prüfen, ob exercises.json zu den Daten passt
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import ExcelJS from 'exceljs';
import JSZip from 'jszip'; // kommt mit exceljs

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const JSON_PATH = join(root, 'app', 'exercises.json');
const FILES_DIR = join(root, 'app', 'files');
const CHECK_ONLY = process.argv.includes('--check');

// Textabbildung CH → DE aus app/engine.js (dieselbe wie in der App)
const engineCtx = {};
engineCtx.window = engineCtx;
vm.createContext(engineCtx);
vm.runInContext(readFileSync(join(root, 'app', 'engine.js'), 'utf8'), engineCtx);
const Engine = engineCtx.ExcelDrillsEngine;
// Übersetzungen FR/IT für Blattnamen, Kopfzeilen und Text-Zellen (nicht übersetzte Texte wie Bestell- und
// Kundennummern oder Firmennamen bleiben unverändert, Leerzeichen am Ende von Kundennummern auch)
const FILE_TEXTS = Object.fromEntries(['fr', 'it'].map((l) => [l, JSON.parse(readFileSync(join(root, 'app', 'i18n', l + '.json'), 'utf8')).files || {}]));
export const LOCALES = ['ch', 'de', 'fr', 'it'];
const SEED = 20250101;
// Seed pro Projekt = SEED + 1000 × Projektnummer + Versatz. Versatz gefunden mit --search (erster Versatz,
// bei dem alle Datenprüfungen bestehen: eindeutige Ränge, wirksame Fallen).
const SEEDS = [1, 1, 2, 1, 1];

/* ---------- Zufall (deterministisch) ---------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(r) { // Box-Muller
  const u = Math.max(r(), 1e-12), v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function pickW(r, list, w = (x) => x.w) {
  const total = list.reduce((s, x) => s + w(x), 0);
  let x = r() * total;
  for (const it of list) { x -= w(it); if (x <= 0) return it; }
  return list[list.length - 1];
}
// Betrag in Rappen, auf 5 Rappen gerundet
const toRappen5 = (chf) => Math.max(5, Math.round(chf * 20) * 5);
const chf = (rappen) => rappen / 100;
const round2 = (x) => Math.round(x * 100) / 100;

/* ---------- Stammdaten ---------- */

const FILIALEN = [
  { name: 'Zürich', region: 'Ost', w: 1.6 },
  { name: 'St. Gallen', region: 'Ost', w: 0.7 },
  { name: 'Bern', region: 'Mitte', w: 1.15 },
  { name: 'Luzern', region: 'Mitte', w: 0.8 },
  { name: 'Basel', region: 'Nordwest', w: 0.95 },
  { name: 'Lugano', region: 'Süd', w: 0.6 },
];
const PRODUKTE = [
  { name: 'Hardware', mean: 1450, w: 0.8, cost: 0.78 },
  { name: 'Software', mean: 620, w: 1.0, cost: 0.42 },
  { name: 'Zubehör', mean: 95, w: 1.6, cost: 0.55 },
  { name: 'Service', mean: 380, w: 1.1, cost: 0.33 },
  { name: 'Schulung', mean: 890, w: 0.5, cost: 0.4 },
];
const MONTH_W = [0.8, 0.75, 0.95, 0.9, 1.0, 0.85, 0.7, 0.65, 1.0, 1.35, 1.05, 0.9];
const DAYS_IN_MONTH = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

// Bestellungen: { nr, date (UTC), year, month (1-12), quarter 'Q1', filiale, region, produkt, umsatz (Rappen), kosten (Rappen) }
function makeOrders(r, n, { years = [2025], startNr = 1, amountByMonth = null } = {}) {
  const rows = [];
  for (let i = 0; i < n; i++) {
    const year = years[Math.floor(r() * years.length)];
    const month = pickW(r, MONTH_W.map((w, k) => ({ w, k }))).k;
    const day = 1 + Math.floor(r() * DAYS_IN_MONTH(year, month));
    const f = pickW(r, FILIALEN);
    const p = pickW(r, PRODUKTE);
    const factor = Math.exp(0.45 * randn(r)) * (amountByMonth ? amountByMonth[month] : 1);
    const umsatz = toRappen5(p.mean * factor);
    const kosten = toRappen5((umsatz / 100) * p.cost * Math.exp(0.08 * randn(r)));
    rows.push({
      date: new Date(Date.UTC(year, month, day)), year, month: month + 1, quarter: 'Q' + (Math.floor(month / 3) + 1),
      filiale: f.name, region: f.region, produkt: p.name, umsatz, kosten
    });
  }
  rows.sort((a, b) => a.date - b.date);
  rows.forEach((row, i) => { row.nr = 'B-' + String(startNr + i).padStart(5, '0'); });
  return rows;
}

const sumBy = (rows, key, val = (x) => x.umsatz) => {
  const out = {};
  rows.forEach((x) => { const k = typeof key === 'function' ? key(x) : x[key]; out[k] = (out[k] || 0) + val(x); });
  return out;
};
function assert(cond, msg) { if (!cond) throw new Error('Datenprüfung fehlgeschlagen: ' + msg); }
// Abstand zwischen den sortierten Werten (relativ), damit Ränge und «bester Monat» eindeutig sind
function assertGaps(obj, minRel, label) {
  const v = Object.values(obj).sort((a, b) => b - a);
  for (let i = 1; i < v.length; i++) assert((v[i - 1] - v[i]) / v[i - 1] >= minRel, `${label}: Werte zu nah beieinander (${v[i - 1]} / ${v[i]})`);
}

/* ---------- Excel schreiben ---------- */

// Zahlformat-Codes in xlsx sind länderneutral: Excel zeigt #,##0.00 in der Schweiz als 1'234.50 und in
// Deutschland als 1.234,50 an (Systemeinstellung). Deshalb gilt derselbe Code für beide Varianten.
const FMT_CHF = '#,##0.00';
const FMT_DATE = 'dd.mm.yyyy';

// DE-Variante der Blätter: Spaltenköpfe und Text-Zellen abbilden, Zahlen und Datum bleiben unverändert.
function sheetsFor(sheets, locale) {
  if (locale === 'ch') return sheets;
  const map = FILE_TEXTS[locale];
  const t = map
    ? (v) => (typeof v === 'string' && Object.prototype.hasOwnProperty.call(map, v) ? map[v] : v)
    : (v) => (typeof v === 'string' ? Engine.mapText(v, locale) : v);
  return sheets.map((sh) => ({
    ...sh,
    name: t(sh.name),
    columns: sh.columns.map((c) => ({ ...c, name: t(c.name) })),
    rows: sh.rows.map((row) => row.map(t)),
  }));
}
const fileFor = (file, locale) => (locale === 'ch' ? file : file.replace(/^files\//, `files/${locale}/`));

async function writeBook(file, sheets) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Excel-Drills';
  wb.created = new Date(Date.UTC(2026, 0, 1));
  wb.modified = wb.created;
  for (const sh of sheets) {
    const ws = wb.addWorksheet(sh.name, { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.addTable({
      name: sh.table, ref: 'A1', headerRow: true, totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: sh.columns.map((c) => ({ name: c.name, filterButton: true })),
      rows: sh.rows,
    });
    sh.columns.forEach((c, i) => {
      ws.getColumn(i + 1).width = c.width || 14;
      if (c.fmt) for (let rr = 2; rr <= sh.rows.length + 1; rr++) ws.getCell(rr, i + 1).numFmt = c.fmt;
    });
  }
  // exceljs schreibt bei Tabellen ohne Ergebniszeile trotzdem totalsRowShown="1" und eine Beschriftung «Total».
  // Das bereinigen wir, damit Excel die Datei ohne Reparatur-Hinweis öffnet.
  const zip = await JSZip.loadAsync(await wb.xlsx.writeBuffer());
  for (const name of Object.keys(zip.files).filter((n) => /^xl\/tables\/table\d+\.xml$/.test(n))) {
    const xml = (await zip.file(name).async('string'))
      .replace(' totalsRowShown="1"', ' totalsRowShown="0"')
      .replace(/ totalsRowLabel="[^"]*"/g, '')
      .replace(/ totalsRowFunction="none"/g, '');
    zip.file(name, xml);
  }
  writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

/* ---------- Projekte ---------- */

const PROJECTS = [];

// pivot-1: Umsatz nach Region und Quartal
PROJECTS.push((seed) => {
  const r = mulberry32(SEED + seed);
  const rows = makeOrders(r, 240, { startNr: 25001 });
  const byRegion = sumBy(rows, 'region');
  const ostQ3 = rows.filter((x) => x.region === 'Ost' && x.quarter === 'Q3').reduce((s, x) => s + x.umsatz, 0);
  const total = rows.reduce((s, x) => s + x.umsatz, 0);
  assertGaps(byRegion, 0.03, 'pivot-1 Regionen');
  const maxRegion = Math.max(...Object.values(byRegion));
  const file = 'files/pivot-1-umsatz.xlsx';
  return {
    file,
    sheets: [{
      name: 'Daten', table: 'tblUmsatz',
      columns: [{ name: 'Bestell-Nr.', width: 13 }, { name: 'Quartal', width: 10 }, { name: 'Filiale', width: 13 }, { name: 'Region', width: 12 },
        { name: 'Produktgruppe', width: 16 }, { name: 'Umsatz CHF', width: 14, fmt: FMT_CHF }],
      rows: rows.map((x) => [x.nr, x.quarter, x.filiale, x.region, x.produkt, chf(x.umsatz)]),
    }],
    exercise: {
      id: 'pivot-1', type: 'project', free: true, topic: 'Pivot', title: 'Umsatz nach Region und Quartal',
      intro: 'Die Alpenbüro AG hat dir den Verkaufsexport 2025 ihrer sechs Filialen geschickt, eine Zeile pro Bestellung. Baue daraus eine Pivot-Tabelle mit dem Umsatz nach Region und Quartal. Mit der fertigen Pivot beantwortest du die Kontrollfragen in wenigen Sekunden.',
      file,
      steps: [
        'Öffne die Datei in Excel und klicke im Blatt «Daten» in eine beliebige Zelle der Tabelle.',
        'Wähle im Register «Einfügen» › «PivotTable» › «Aus Tabelle/Bereich». Lass «Neues Arbeitsblatt» ausgewählt und klicke auf «OK».',
        'Ziehe in der Feldliste «Region» in den Bereich «Zeilen» und «Quartal» in den Bereich «Spalten».',
        'Ziehe «Umsatz CHF» in den Bereich «Werte». Excel zeigt «Summe von Umsatz CHF».',
        'Für die Anzahl Bestellungen: Ziehe «Bestell-Nr.» zusätzlich in «Werte». Weil das Feld Text enthält, zählt Excel automatisch («Anzahl von Bestell-Nr.»).',
        'Lies die Werte in der Pivot ab und trage sie unten ein. Rappen darfst du weglassen.',
      ],
      questions: [
        { q: 'Wie hoch ist der Umsatz der Region Ost im Quartal Q3 (CHF)?', answer: round2(chf(ostQ3)), tolerance: 1, unit: 'CHF', hint: 'Suche die Zeile «Ost» und die Spalte «Q3». Prüfe, ob im Wertebereich wirklich «Summe von Umsatz CHF» steht und nicht «Anzahl».' },
        { q: 'Wie hoch ist der Jahresumsatz der umsatzstärksten Region (CHF)?', answer: round2(chf(maxRegion)), tolerance: 1, unit: 'CHF', hint: 'Schau in die Spalte «Gesamtergebnis» ganz rechts und nimm den grössten Wert unter den Regionen.' },
        { q: 'Wie hoch ist der Gesamtumsatz 2025 über alle Regionen (CHF)?', answer: round2(chf(total)), tolerance: 1, unit: 'CHF', hint: 'Das ist die Zelle unten rechts in der Pivot: Zeile «Gesamtergebnis», Spalte «Gesamtergebnis».' },
        { q: 'Wie viele Bestellungen (Datenzeilen) enthält die Tabelle?', answer: rows.length, unit: 'Zeilen', hint: 'Ziehe «Bestell-Nr.» in den Bereich «Werte» (Anzahl) und lies das Gesamtergebnis ab. Die Überschriftenzeile zählt nicht.' },
      ],
      hints: { generic: 'Zeilen: Region, Spalten: Quartal, Werte: Summe von Umsatz CHF. Das Gesamtergebnis steht unten und rechts in der Pivot.' },
      track: 'data',
    },
  };
});

// pivot-2: Datum nach Monat gruppieren, Durchschnitt pro Bestellung
PROJECTS.push((seed) => {
  const r = mulberry32(SEED + seed);
  const rows = makeOrders(r, 264, { startNr: 31001 });
  const byMonth = sumBy(rows, 'month');
  assertGaps({ a: Math.max(...Object.values(byMonth)), b: Object.values(byMonth).sort((a, b) => b - a)[1] }, 0.03, 'pivot-2 bester Monat');
  const best = Number(Object.keys(byMonth).find((k) => byMonth[k] === Math.max(...Object.values(byMonth))));
  const march = rows.filter((x) => x.month === 3);
  const avgMarch = march.reduce((s, x) => s + x.umsatz, 0) / march.length;
  const q2 = rows.filter((x) => x.quarter === 'Q2').length;
  const file = 'files/pivot-2-monate.xlsx';
  return {
    file,
    sheets: [{
      name: 'Daten', table: 'tblBestellungen',
      columns: [{ name: 'Bestell-Nr.', width: 13 }, { name: 'Datum', width: 12, fmt: FMT_DATE }, { name: 'Filiale', width: 13 },
        { name: 'Produktgruppe', width: 16 }, { name: 'Umsatz CHF', width: 14, fmt: FMT_CHF }],
      rows: rows.map((x) => [x.nr, x.date, x.filiale, x.produkt, chf(x.umsatz)]),
    }],
    exercise: {
      id: 'pivot-2', type: 'project', free: true, topic: 'Pivot · Datum', title: 'Bestellungen nach Monat',
      intro: 'Diesmal enthält der Export ein echtes Bestelldatum statt eines Quartals. Gruppiere die Daten in der Pivot nach Monaten und Quartalen und lass dir neben der Summe auch den Durchschnitt pro Bestellung anzeigen. So findest du den besten Monat und typische Bestellgrössen.',
      file,
      steps: [
        'Klicke im Blatt «Daten» in die Tabelle und wähle «Einfügen» › «PivotTable» › «Aus Tabelle/Bereich» › «OK».',
        'Ziehe «Datum» in den Bereich «Zeilen». Excel 365 gruppiert meist automatisch nach Quartalen und Monaten. Falls nicht: Rechtsklick auf ein Datum in der Pivot › «Gruppieren» › «Monate» und «Quartale» markieren › «OK».',
        'Ziehe «Umsatz CHF» in den Bereich «Werte» («Summe von Umsatz CHF»).',
        'Ziehe «Umsatz CHF» ein zweites Mal in «Werte». Klicke darauf › «Wertfeldeinstellungen» › «Mittelwert» › «OK».',
        'Ziehe «Bestell-Nr.» in «Werte», um die Anzahl Bestellungen pro Monat und Quartal zu sehen.',
        'Mit dem Plus- und Minuszeichen vor den Quartalen klappst du die Monate auf und zu.',
      ],
      questions: [
        { q: 'In welchem Monat war der Umsatz (Summe) am höchsten? Gib die Monatszahl ein (1 = Januar, 12 = Dezember).', answer: best, unit: '', hint: 'Sortiere oder vergleiche die Summe pro Monat, nicht den Mittelwert. Gib den Monat als Zahl ein, zum Beispiel 4 für April.' },
        { q: 'Wie hoch ist der durchschnittliche Umsatz pro Bestellung im März (CHF)?', answer: round2(chf(avgMarch)), tolerance: 1, unit: 'CHF', hint: 'Du brauchst «Mittelwert von Umsatz CHF» (Wertfeldeinstellungen), nicht die Summe. Lies den Wert in der Zeile «Mrz» ab.' },
        { q: 'Wie viele Bestellungen gab es im zweiten Quartal (Q2)?', answer: q2, unit: 'Zeilen', hint: 'Zähle mit «Anzahl von Bestell-Nr.» und lies die Zeile «Qrtl2» ab (April bis Juni zusammen).' },
      ],
      hints: { generic: 'Datum in die Zeilen, nach Monaten und Quartalen gruppieren. Umsatz zweimal in die Werte: einmal Summe, einmal Mittelwert.' },
      track: 'data',
    },
  };
});

// pivot-3: Prozent vom Gesamtergebnis und Rang
PROJECTS.push((seed) => {
  const r = mulberry32(SEED + seed);
  const rows = makeOrders(r, 228, { startNr: 41001 });
  const total = rows.reduce((s, x) => s + x.umsatz, 0);
  const byProd = sumBy(rows, 'produkt');
  const byFil = sumBy(rows, 'filiale');
  assertGaps(byFil, 0.02, 'pivot-3 Filialen');
  const rankOf = (obj, key) => Object.values(obj).sort((a, b) => b - a).indexOf(obj[key]) + 1;
  const rankBasel = rankOf(byFil, 'Basel');
  assert(rankBasel > 1 && rankBasel < 6, 'pivot-3: Rang Basel sollte nicht 1 oder 6 sein');
  const file = 'files/pivot-3-anteile.xlsx';
  return {
    file,
    sheets: [{
      name: 'Daten', table: 'tblVerkauf',
      columns: [{ name: 'Bestell-Nr.', width: 13 }, { name: 'Quartal', width: 10 }, { name: 'Filiale', width: 13 },
        { name: 'Produktgruppe', width: 16 }, { name: 'Umsatz CHF', width: 14, fmt: FMT_CHF }],
      rows: rows.map((x) => [x.nr, x.quarter, x.filiale, x.produkt, chf(x.umsatz)]),
    }],
    exercise: {
      id: 'pivot-3', type: 'project', free: false, topic: 'Pivot · Anteile', title: 'Anteile und Rangliste',
      intro: 'Die Geschäftsleitung will nicht nur Franken sehen, sondern Anteile: Welcher Teil des Umsatzes kommt aus welcher Produktgruppe und welche Filiale liegt auf welchem Rang? Mit «Werte anzeigen als» rechnet die Pivot das für dich, ganz ohne Formeln.',
      file,
      steps: [
        'Erstelle aus der Tabelle im Blatt «Daten» eine PivotTable: «Einfügen» › «PivotTable» › «Aus Tabelle/Bereich» › «OK».',
        'Ziehe «Produktgruppe» in «Zeilen» und «Umsatz CHF» in «Werte».',
        'Rechtsklick auf einen Wert › «Werte anzeigen als» › «% des Gesamtergebnisses». Jetzt siehst du die Anteile in Prozent.',
        'Ersetze in «Zeilen» die «Produktgruppe» durch «Filiale» und lies die Anteile der Filialen ab.',
        'Ziehe «Umsatz CHF» ein zweites Mal in «Werte». Rechtsklick › «Werte anzeigen als» › «Rangfolge nach Grösstem» › Basisfeld «Filiale» › «OK».',
        'Tipp: Mit Rechtsklick › «Sortieren» › «Nach Grösse sortieren (absteigend)» steht die stärkste Filiale oben.',
      ],
      questions: [
        { q: 'Welchen Anteil am Gesamtumsatz hat die Produktgruppe «Service» (in %)?', answer: round2((byProd.Service / total) * 100), tolerance: 0.1, unit: '%', hint: '«Werte anzeigen als» › «% des Gesamtergebnisses», Zeilen nach Produktgruppe. Gib den Prozentwert ein, z. B. 12.3.' },
        { q: 'Welchen Anteil am Gesamtumsatz hat die Filiale Lugano (in %)?', answer: round2((byFil.Lugano / total) * 100), tolerance: 0.1, unit: '%', hint: 'Dieselbe Prozentansicht, aber mit «Filiale» in den Zeilen statt «Produktgruppe».' },
        { q: 'Auf welchem Rang liegt die Filiale Basel nach Umsatz (1 = höchster Umsatz)?', answer: rankBasel, unit: '', hint: '«Werte anzeigen als» › «Rangfolge nach Grösstem» mit Basisfeld «Filiale». Oder sortiere die Filialen absteigend nach Umsatz und zähle.' },
      ],
      hints: { generic: 'Rechtsklick auf einen Wert in der Pivot › «Werte anzeigen als». Dort findest du «% des Gesamtergebnisses» und «Rangfolge nach Grösstem».' },
      track: 'data',
    },
  };
});

// pivot-4: Berechnetes Feld Marge, Filter, Datenschnitt
PROJECTS.push((seed) => {
  const r = mulberry32(SEED + seed);
  const rows = makeOrders(r, 296, { years: [2024, 2025], startNr: 51001 });
  const y25 = rows.filter((x) => x.year === 2025);
  const marge = (list) => list.reduce((s, x) => s + x.umsatz - x.kosten, 0);
  const margeLuzern = marge(y25.filter((x) => x.filiale === 'Luzern'));
  const umsatz25 = y25.reduce((s, x) => s + x.umsatz, 0);
  const quote = (marge(y25) / umsatz25) * 100;
  const margeZhQ4 = marge(y25.filter((x) => x.filiale === 'Zürich' && x.quarter === 'Q4'));
  // Die Falle «Filter vergessen» muss ein anderes Ergebnis liefern
  assert(Math.abs(marge(rows.filter((x) => x.filiale === 'Luzern')) - margeLuzern) > 10000, 'pivot-4: Filter 2025 macht keinen Unterschied');
  const file = 'files/pivot-4-marge.xlsx';
  return {
    file,
    sheets: [{
      name: 'Daten', table: 'tblMarge',
      columns: [{ name: 'Bestell-Nr.', width: 13 }, { name: 'Datum', width: 12, fmt: FMT_DATE }, { name: 'Jahr', width: 8 }, { name: 'Quartal', width: 10 },
        { name: 'Filiale', width: 13 }, { name: 'Produktgruppe', width: 16 }, { name: 'Umsatz', width: 13, fmt: FMT_CHF }, { name: 'Kosten', width: 13, fmt: FMT_CHF }],
      rows: rows.map((x) => [x.nr, x.date, x.year, x.quarter, x.filiale, x.produkt, chf(x.umsatz), chf(x.kosten)]),
    }],
    exercise: {
      id: 'pivot-4', type: 'project', free: false, topic: 'Pivot · Berechnetes Feld', title: 'Marge pro Filiale mit Datenschnitt',
      intro: 'Der Export enthält Umsatz und Kosten für 2024 und 2025 (Beträge in CHF). Berechne die Marge direkt in der Pivot mit einem berechneten Feld, filtere auf das Jahr 2025 und steuere die Quartale mit einem Datenschnitt. So entsteht ein kleiner Report, den du jeden Monat wiederverwenden kannst.',
      file,
      steps: [
        'Erstelle aus der Tabelle im Blatt «Daten» eine PivotTable («Einfügen» › «PivotTable» › «Aus Tabelle/Bereich»).',
        'Ziehe «Filiale» in «Zeilen» und «Jahr» in «Filter». Wähle im Filter oberhalb der Pivot das Jahr 2025.',
        'Klicke in die Pivot › Register «PivotTable-Analyse» › «Felder, Elemente und Gruppen» › «Berechnetes Feld». Name: Marge, Formel: =Umsatz-Kosten › «Hinzufügen» › «OK».',
        'Lege ein zweites berechnetes Feld an: Name: Margenquote, Formel: =(Umsatz-Kosten)/Umsatz. Formatiere es über «Wertfeldeinstellungen» › «Zahlenformat» als Prozent.',
        '«PivotTable-Analyse» › «Datenschnitt einfügen» › «Quartal» › «OK». Ein Klick auf eine Schaltfläche im Datenschnitt filtert die Pivot auf dieses Quartal.',
        'Für Fragen über das ganze Jahr setzt du den Datenschnitt zurück (Filtersymbol mit dem roten Kreuz oben rechts im Datenschnitt).',
      ],
      questions: [
        { q: 'Wie hoch ist die Marge (Umsatz − Kosten) der Filiale Luzern im Jahr 2025 (CHF)?', answer: round2(chf(margeLuzern)), tolerance: 1, unit: 'CHF', hint: 'Prüfe, ob im Filter «Jahr» wirklich 2025 gewählt ist und der Datenschnitt alle Quartale zeigt.' },
        { q: 'Wie hoch ist die Margenquote 2025 über alle Filialen (Marge / Umsatz, in %)?', answer: round2(quote), tolerance: 0.1, unit: '%', hint: 'Das berechnete Feld =(Umsatz-Kosten)/Umsatz rechnet mit den Summen. Lies die Zeile «Gesamtergebnis» ab, nicht den Durchschnitt der Filialen.' },
        { q: 'Wie hoch ist die Marge der Filiale Zürich im vierten Quartal 2025 (CHF)?', answer: round2(chf(margeZhQ4)), tolerance: 1, unit: 'CHF', hint: 'Jahr 2025 im Filter, im Datenschnitt «Q4» anklicken, dann die Zeile «Zürich» ablesen.' },
      ],
      hints: { generic: 'Berechnetes Feld: «PivotTable-Analyse» › «Felder, Elemente und Gruppen» › «Berechnetes Feld», Formel =Umsatz-Kosten. Vergiss den Filter auf 2025 nicht.' },
      track: 'data',
    },
  };
});

// pq-1: Power Query – zwei Tabellen zusammenführen, Leerzeichen kürzen, Duplikate entfernen
PROJECTS.push((seed) => {
  const r = mulberry32(SEED + seed);
  const segPlan = [
    ...['Muster Anna', 'Keller Thomas', 'Bianchi Laura', 'Brunner Marco', 'Frei Sandra', 'Graf Peter', 'Huber Nina', 'Meier Lukas', 'Rossi Elena', 'Weber Daniel', 'Zürcher Monika', 'Schmid Reto'].map((n) => [n, 'Privat']),
    ...['Bäckerei Huber GmbH', 'Treuhand Meier AG', 'Garage Brunner AG', 'Velo Keller GmbH', 'Malerei Frei AG', 'Praxis Dr. Graf', 'Architekturbüro Rossi', 'Schreinerei Weber AG', 'Café Central GmbH', 'Elektro Schmid AG', 'Coiffure Bianchi', 'Druckerei Zürcher AG', 'Gärtnerei Moser', 'Physio Lindenhof GmbH', 'Weinhandel Ticino SA', 'IT-Service Gerber GmbH', 'Optik Steiner AG', 'Hotel Bellevue AG'].map((n) => [n, 'KMU']),
    ...['Kantonsspital Nord', 'Helvetia Logistik AG', 'Stadtverwaltung Ost', 'Bergbahnen Alpina AG', 'Versicherung Rhein AG', 'Swiss Retail Group AG', 'Universität Mitte', 'Energie Mittelland AG', 'Bank am See AG', 'Pharma Basel AG'].map((n) => [n, 'Grosskunde']),
  ];
  const orte = ['Zürich', 'Bern', 'Basel', 'Luzern', 'Lugano', 'St. Gallen', 'Winterthur', 'Aarau', 'Thun', 'Chur'];
  // Reihenfolge der Kunden mischen (deterministisch), Kundennummern K-1001 ...
  const shuffled = segPlan.map((x) => ({ x, k: r() })).sort((a, b) => a.k - b.k).map((o) => o.x);
  const kunden = shuffled.map(([name, segment], i) => ({ nr: 'K-' + (1001 + i), name, ort: orte[Math.floor(r() * orte.length)], segment }));
  assert(kunden.length === 40, 'pq-1: 40 Kunden erwartet');
  const NO_ORDER = 'K-1033';             // Falle 3: Kunde ohne Bestellung
  const kmu = kunden.filter((k) => k.segment === 'KMU' && k.nr !== NO_ORDER);
  const SPACE_ONLY = kmu[2].nr;          // Falle 1b: alle Bestellungen dieses KMU-Kunden mit Leerzeichen
  const segW = { Privat: 0.6, KMU: 1.2, Grosskunde: 1.6 };
  const segMean = { Privat: 180, KMU: 950, Grosskunde: 3800 };
  const candidates = kunden.filter((k) => k.nr !== NO_ORDER).map((k) => ({ ...k, w: segW[k.segment] }));

  const N = 182;
  const orders = [];
  for (let i = 0; i < N; i++) {
    const k = i < 3 ? candidates.find((c) => c.nr === SPACE_ONLY) : pickW(r, candidates);
    const month = Math.floor(r() * 12);
    const date = new Date(Date.UTC(2025, month, 1 + Math.floor(r() * DAYS_IN_MONTH(2025, month))));
    orders.push({ date, kunde: k.nr, segment: k.segment, betrag: toRappen5(segMean[k.segment] * Math.exp(0.5 * randn(r))) });
  }
  orders.sort((a, b) => a.date - b.date);
  orders.forEach((o, i) => { o.nr = 'A-' + String(70001 + i); });
  // Falle 1: Leerzeichen hinter der Kundennummer (alle Bestellungen von SPACE_ONLY + 9 weitere)
  const spaceIdx = new Set(orders.map((o, i) => (o.kunde === SPACE_ONLY ? i : -1)).filter((i) => i >= 0));
  while (spaceIdx.size < orders.filter((o) => o.kunde === SPACE_ONLY).length + 9) spaceIdx.add(Math.floor(r() * N));
  orders.forEach((o, i) => { o.kundeRaw = spaceIdx.has(i) ? o.kunde + (r() < 0.3 ? '  ' : ' ') : o.kunde; });
  // Falle 2: 4 doppelte Zeilen (exakte Kopien, z. B. vom doppelten Export), mindestens 2 davon KMU
  const kmuIdx = orders.map((o, i) => (o.segment === 'KMU' && !spaceIdx.has(i) ? i : -1)).filter((i) => i >= 0);
  const dupIdx = [kmuIdx[5], kmuIdx[Math.floor(kmuIdx.length / 2)], Math.floor(N * 0.3), Math.floor(N * 0.8)];
  assert(new Set(dupIdx).size === 4, 'pq-1: Duplikat-Indizes nicht eindeutig');
  const raw = orders.map((o) => ({ ...o }));
  dupIdx.sort((a, b) => b - a).forEach((i, j) => { raw.splice(Math.min(raw.length, i + 3 + j * 7), 0, { ...orders[i] }); });
  assert(raw.length === N + 4, 'pq-1: 4 Duplikate erwartet');

  const kmuSum = orders.filter((o) => o.segment === 'KMU').reduce((s, o) => s + o.betrag, 0);
  const withOrders = new Set(orders.map((o) => o.kunde));
  const noOrder = kunden.filter((k) => !withOrders.has(k.nr)).length;
  // Fallen wirksam? Ohne Kürzen/Duplikat-Entfernung kämen andere Antworten heraus.
  const naiveWith = new Set(raw.map((o) => o.kundeRaw));
  assert(kunden.filter((k) => !naiveWith.has(k.nr)).length !== noOrder, 'pq-1: Leerzeichen-Falle wirkungslos');
  const naiveKmu = raw.filter((o) => o.segment === 'KMU' && o.kundeRaw === o.kunde).reduce((s, o) => s + o.betrag, 0);
  const dupKmu = raw.filter((o) => o.segment === 'KMU').reduce((s, o) => s + o.betrag, 0);
  assert(naiveKmu !== kmuSum && dupKmu !== kmuSum, 'pq-1: KMU-Fallen wirkungslos');
  assert(noOrder === 1, 'pq-1: genau ein Kunde ohne Bestellung erwartet');

  const file = 'files/pq-1-kunden.xlsx';
  return {
    file,
    sheets: [
      {
        name: 'Bestellungen', table: 'tblBestellungen',
        columns: [{ name: 'Bestell-Nr.', width: 13 }, { name: 'Datum', width: 12, fmt: FMT_DATE }, { name: 'Kundennr.', width: 12 }, { name: 'Betrag CHF', width: 14, fmt: FMT_CHF }],
        rows: raw.map((o) => [o.nr, o.date, o.kundeRaw, chf(o.betrag)]),
      },
      {
        name: 'Kunden', table: 'tblKunden',
        columns: [{ name: 'Kundennr.', width: 12 }, { name: 'Firma', width: 28 }, { name: 'Ort', width: 13 }, { name: 'Segment', width: 13 }],
        rows: kunden.map((k) => [k.nr, k.name, k.ort, k.segment]),
      },
    ],
    exercise: {
      id: 'pq-1', type: 'project', free: false, topic: 'Power Query', title: 'Bestellungen mit Kundensegment zusammenführen',
      intro: 'Zwei Exporte, die nicht ganz sauber sind: Im Blatt «Bestellungen» steht pro Bestellung nur die Kundennummer, das Segment (Privat, KMU, Grosskunde) steht im Blatt «Kunden». Führe beides mit Power Query zusammen und räume dabei auf. Achtung: Im Export verstecken sich Fehler, die eine einfache Pivot verfälschen würden.',
      file,
      steps: [
        'Klicke in die Tabelle im Blatt «Bestellungen» und wähle «Daten» › «Aus Tabelle/Bereich». Der Power-Query-Editor öffnet sich.',
        'Markiere die Spalte «Kundennr.» › Register «Transformieren» › «Format» › «Kürzen». Damit verschwinden Leerzeichen am Anfang und Ende.',
        'Markiere alle Spalten (Klick in die Tabelle, dann Ctrl+A) › «Start» › «Zeilen entfernen» › «Duplikate entfernen». Unten links siehst du die Anzahl Zeilen.',
        '«Start» › «Schliessen & laden» › «Schliessen & laden in…» › «Nur Verbindung erstellen». Mach dasselbe für die Tabelle im Blatt «Kunden» («Daten» › «Aus Tabelle/Bereich», dann «Nur Verbindung erstellen»).',
        '«Daten» › «Daten abrufen» › «Abfragen kombinieren» › «Zusammenführen»: oben «Bestellungen», unten «Kunden», in beiden die Spalte «Kundennr.» anklicken, Join-Art «Linker äusserer» › «OK». Die neue Spalte erweitern (Pfeilsymbol) und nur «Segment» auswählen.',
        '«Start» › «Gruppieren nach»: Gruppieren nach «Segment», neue Spalte «Umsatz» mit Vorgang «Summe» der Spalte «Betrag CHF» › «OK».',
        'Kunden ohne Bestellung: nochmals «Zusammenführen», diesmal oben «Kunden» und unten «Bestellungen», Join-Art «Linker Anti (nur Zeilen in der ersten Tabelle)». Die Anzahl Zeilen ist die Antwort.',
      ],
      questions: [
        { q: 'Wie viele Bestellungen (Zeilen) bleiben nach dem Entfernen der Duplikate übrig?', answer: N, unit: 'Zeilen', hint: 'Markiere vor «Duplikate entfernen» alle Spalten. Sonst entfernt Power Query nur Duplikate in einer Spalte, zum Beispiel jede zweite Bestellung desselben Kunden.' },
        { q: 'Wie hoch ist der Umsatz des Segments «KMU» (CHF)?', answer: round2(chf(kmuSum)), tolerance: 1, unit: 'CHF', hint: 'Zu wenig? Dann fehlen Bestellungen, deren Kundennummer ein Leerzeichen am Ende hat («Format» › «Kürzen» vor dem Zusammenführen). Zu viel? Dann sind die doppelten Zeilen noch drin.' },
        { q: 'Wie viele Kunden haben keine einzige Bestellung?', answer: noOrder, unit: '', hint: 'Join-Art «Linker Anti» mit «Kunden» oben. Kommt mehr heraus, wurden Kundennummern mit Leerzeichen nicht gekürzt und finden keinen Partner.' },
      ],
      hints: { generic: 'Reihenfolge in Power Query: zuerst «Kundennr.» kürzen, dann Duplikate über alle Spalten entfernen, dann mit «Kunden» zusammenführen und nach Segment gruppieren.' },
      track: 'data',
    },
  };
});

/* ---------- Ausführen ---------- */

if (process.argv.includes('--search')) {
  PROJECTS.forEach((fn, i) => {
    for (let k = 1; k < 1000; k++) {
      try { fn(1000 * (i + 1) + k); console.log(`Projekt ${i + 1}: Seed-Versatz ${k}`); return; } catch (e) { /* nächster Versatz */ }
    }
    console.log(`Projekt ${i + 1}: kein passender Seed`);
  });
  process.exit(0);
}
const built = PROJECTS.map((fn, i) => fn(1000 * (i + 1) + SEEDS[i]));
const json = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
const ids = built.map((b) => b.exercise.id);

if (CHECK_ONLY) {
  let bad = 0;
  for (const b of built) {
    const ex = json.exercises.find((e) => e.id === b.exercise.id);
    if (!ex) { console.log(`FEHLER ${b.exercise.id} fehlt in exercises.json`); bad++; continue; }
    b.exercise.questions.forEach((q, i) => {
      const have = ex.questions && ex.questions[i] ? ex.questions[i].answer : undefined;
      if (have !== q.answer) { console.log(`FEHLER ${ex.id} Frage ${i + 1}: exercises.json ${have}, Daten ${q.answer}`); bad++; }
    });
  }
  console.log(bad ? `${bad} Abweichungen` : 'OK: Antworten in exercises.json passen zu den Daten.');
  process.exit(bad ? 1 : 0);
}

mkdirSync(FILES_DIR, { recursive: true });
for (const l of ['de', 'fr', 'it']) mkdirSync(join(FILES_DIR, l), { recursive: true });
for (const b of built) {
  for (const locale of LOCALES) await writeBook(join(root, 'app', fileFor(b.file, locale)), sheetsFor(b.sheets, locale));
  const rows = b.sheets.map((s) => `${s.name} ${s.rows.length}`).join(', ');
  console.log(`${b.exercise.id}: ${b.file} + de/ fr/ it/ (${rows})`);
  b.exercise.questions.forEach((q) => console.log(`   ${q.answer}${q.unit ? ' ' + q.unit : ''}  ${q.q}`));
}
json.exercises = json.exercises.filter((e) => !ids.includes(e.id)).concat(built.map((b) => b.exercise));
const data = (json.tracks || []).find((t) => t.id === 'data');
if (data) data.comingSoon = false;
writeFileSync(JSON_PATH, JSON.stringify(json, null, 2));
console.log(`exercises.json: ${built.length} Projekte geschrieben, Pfad «data» aktiv.`);
