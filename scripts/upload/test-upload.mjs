// Testet die Upload-Prüfung (app/upload.js) mit echten xlsx-Dateien:
//   1. Lösungsdateien mit exceljs erzeugen (Aufgabendatei aus app/files/upload/ laden, Formel in die Zielzelle)
//   2. mit SheetJS lesen (dieselbe Version wie im Browser, SRI-geprüft) und mit derselben Engine bewerten
// SheetJS liegt nicht in node_modules: Das Skript lädt xlsx.full.min.js einmal von cdnjs in den Temp-Ordner und
// prüft den Hash gegen SHEETJS_SRI aus app/upload.js. Alternativ: XLSX_PATH=/pfad/xlsx.full.min.js setzen.
//
// Aufruf: node scripts/upload/generate-upload-files.mjs && node scripts/upload/test-upload.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import ExcelJS from 'exceljs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// Browser-ähnlicher Kontext ohne document: HyperFormula + deDE + Engine + Upload-Logik
const ctx = { console };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(read('node_modules/hyperformula/dist/hyperformula.full.min.js'), ctx);
vm.runInContext(read('node_modules/hyperformula/dist/languages/deDE.js'), ctx);
vm.runInContext(read('app/engine.js'), ctx);
vm.runInContext(read('app/upload.js'), ctx);
const HF = ctx.HyperFormula;
const E = ctx.ExcelDrillsEngine;
const U = ctx.ExcelDrillsUpload;
E.init(HF);
E.setLocale('de-CH');

// SheetJS laden (Cache im Temp-Ordner, Hash muss zum integrity-Attribut passen)
async function loadSheetJs() {
  const cache = process.env.XLSX_PATH || join(tmpdir(), 'excel-drills-xlsx-0.18.5.full.min.js');
  let src = existsSync(cache) ? readFileSync(cache) : null;
  if (!src) {
    const res = await fetch(U.SHEETJS_URL);
    if (!res.ok) throw new Error('SheetJS-Download fehlgeschlagen: HTTP ' + res.status);
    src = Buffer.from(await res.arrayBuffer());
  }
  const sri = 'sha384-' + createHash('sha384').update(src).digest('base64');
  if (sri !== U.SHEETJS_SRI) throw new Error(`SRI-Hash passt nicht: ${sri} statt ${U.SHEETJS_SRI}`);
  if (!existsSync(cache)) writeFileSync(cache, src);
  vm.runInContext(src.toString('utf8'), ctx);
  return ctx.XLSX;
}
const XLSX = await loadSheetJs();

const { exercises } = JSON.parse(read('app/exercises.json'));
const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));

let failures = 0, passed = 0;
function expect(label, cond, info) {
  if (cond) { passed++; console.log('  ok     ' + label); }
  else { failures++; console.log('  FEHLER ' + label + (info ? '\n         ' + info : '')); }
}

// Lösungsdatei bauen: Aufgabendatei laden, Zielzelle setzen, optional weitere Änderungen
async function solutionFile(id, value, mutate) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(readFileSync(join(root, 'app', 'files', 'upload', id + '.xlsx')));
  const ws = wb.getWorksheet('Aufgabe');
  if (value !== undefined) ws.getCell(exById[id].target).value = value;
  if (mutate) mutate(wb, ws);
  return new Uint8Array(await wb.xlsx.writeBuffer());
}
function grade(id, bytes) {
  const r = U.readWorkbook(XLSX, bytes);
  if (r.error) return r;
  return U.analyzeWorkbook(HF, E, r.wb, exById[id]);
}
const show = (a) => a.result ? `typ=${a.result.typ} de=${a.result.de} stored=${a.result.stored} msg=${a.result.message}` : JSON.stringify(a);

console.log(`SheetJS ${XLSX.version}, HyperFormula ${HF.version}\n`);

console.log('Übersetzung EN → DE-CH');
const T = (f) => U.translateXlsxFormula(f, E);
const cases = [
  ['SUM(B2,B5)', '=SUMME(B2;B5)'],
  ['VLOOKUP(D2,A2:B6,2,FALSE)', '=SVERWEIS(D2;A2:B6;2;FALSCH)'],
  ['SUMIF(A2:A9,"Ost, West",B2:B9)', '=SUMMEWENN(A2:A9;"Ost, West";B2:B9)'],
  ['IF(B2<=A2,"OK","Überzogen")', '=WENN(B2<=A2;"OK";"Überzogen")'],
  ['countif(b2:b8, "offen")', '=ZÄHLENWENN(B2:B8;"offen")'],
  ['IF(\n  B2<=A2,\r\n  "OK",  "Überzogen"\n)', '=WENN(B2<=A2;"OK";"Überzogen")'],
  ['IF(B2<=A2,_x000a_"OK","Überzogen")', '=WENN(B2<=A2;"OK";"Überzogen")'],
  ['B2*$F$1', '=B2*$F$1'],
  ['ROUND(B2*0.081,2)', '=RUNDEN(B2*0.081;2)'],
  ['_xlfn.XLOOKUP(D2,A2:A6,B2:B6)', '=XVERWEIS(D2;A2:A6;B2:B6)'],
  ['Aufgabe!B2*Aufgabe!$F$1', '=B2*$F$1'],
  ['IF(TRUE,"a ""b"", c","x")', '=WENN(WAHR;"a ""b"", c";"x")'],
];
for (const [inp, want] of cases) expect(`${JSON.stringify(inp)} → ${want}`, T(inp) === want, 'erhalten: ' + T(inp));

console.log('\nRichtige Lösungen (englisch gespeichert, wie Excel es tut)');
const correct = {
  'sverweis-1': { formula: 'VLOOKUP(D2,A2:B6,2,FALSE)', result: 21 },
  'summewenn-1': { formula: 'SUMIF(A2:A9,"Ost",B2:B9)', result: 3500 },
  'absolut-1': { formula: 'B2*$F$1', result: 162 },
  'wenn-1': { formula: 'IF(B2<=A2,"OK","Überzogen")', result: 'OK' },
  'zaehlenwenn-1': { formula: 'COUNTIF(B2:B8,"offen")', result: 4 },
};
for (const id of U.UPLOAD_IDS) {
  const a = grade(id, await solutionFile(id, correct[id]));
  expect(`${id}: ${correct[id].formula} ist richtig`, a.result && a.result.ok && a.result.typ === 'ok', show(a));
}
{
  const a = grade('sverweis-1', await solutionFile('sverweis-1', { formula: 'VLOOKUP(D2,A2:B6,2,0)' }));
  expect('sverweis-1: ohne gespeicherten Wert (nur Formel) und mit 0 statt FALSE ist richtig', a.result && a.result.ok, show(a));
  const b = grade('summewenn-1', await solutionFile('summewenn-1', { formula: 'SUMIF(A2:A9,D2,B2:B9)', result: 3500 }));
  expect('summewenn-1: Kriterium als Zellbezug D2 ist richtig', b.result && b.result.ok, show(b));
}

console.log('\nFehlertypen');
async function typ(label, id, value, want, mutate) {
  const a = grade(id, await solutionFile(id, value, mutate));
  expect(`${label} → ${want}`, a.result && a.result.typ === want, show(a));
  return a;
}
{
  const a = await typ('summewenn-1: SUM(B2,B4,B7) statt SUMIF', 'summewenn-1', { formula: 'SUM(B2,B4,B7)', result: 3500 }, 'falsche-funktion');
  expect('  SUM-Variante übersetzt als =SUMME(B2;B4;B7)', a.result.de === '=SUMME(B2;B4;B7)', a.result.de);
  expect('  gespeicherte Formel =SUM(B2,B4,B7)', a.result.stored === '=SUM(B2,B4,B7)', a.result.stored);
}
await typ('summewenn-1: _xludf.SUMIF (englisch in deutschem Excel getippt)', 'summewenn-1', { formula: '_xludf.SUMIF(A2:A9,"Ost",B2:B9)', result: { error: '#NAME?' } }, 'englischer-name');
await typ('sverweis-1: _xludf.SVERWEIZ (Tippfehler)', 'sverweis-1', { formula: '_xludf.SVERWEIZ(D2,A2:B6,2,FALSE)', result: { error: '#NAME?' } }, 'unbekannte-funktion');
await typ('absolut-1: B2*F1 ohne $', 'absolut-1', { formula: 'B2*F1', result: 162 }, 'fehlendes-dollar');
await typ('absolut-1: B2*F$1 (nur halb fixiert)', 'absolut-1', { formula: 'B2*F$1', result: 162 }, 'fehlendes-dollar');
await typ('absolut-1: Wert 162 eingetippt, keine Formel', 'absolut-1', 162, 'nur-wert');
await typ('sverweis-1: VLOOKUP ohne FALSE', 'sverweis-1', { formula: 'VLOOKUP(D2,A2:B6,2)', result: 21 }, 'fehlendes-falsch');
await typ('sverweis-1: VLOOKUP mit TRUE', 'sverweis-1', { formula: 'VLOOKUP(D2,A2:B6,2,TRUE)', result: 21 }, 'fehlendes-falsch');
await typ('summewenn-1: Bereich A2:A5 zu kurz', 'summewenn-1', { formula: 'SUMIF(A2:A5,"Ost",B2:B5)', result: 2700 }, 'falscher-bereich');
await typ('summewenn-1: Kriterium ohne Anführungszeichen', 'summewenn-1', { formula: 'SUMIF(A2:A9,Ost,B2:B9)', result: { error: '#NAME?' } }, 'anfuehrungszeichen');
await typ('zaehlenwenn-1: feste Zahl =4', 'zaehlenwenn-1', { formula: '4', result: 4 }, 'keine-bezuege');
await typ('wenn-1: Ergebnis fest eingetippt =IF(B2<=A2,"OK","OK")', 'wenn-1', { formula: 'IF(B2<=A2,"OK","OK")', result: 'OK' }, 'nicht-allgemein');
await typ('wenn-1: Bedingung vertauscht', 'wenn-1', { formula: 'IF(B2>A2,"OK","Überzogen")', result: 'Überzogen' }, 'falscher-wert');
await typ('sverweis-1: falscher Spaltenindex liefert Fehler', 'sverweis-1', { formula: 'VLOOKUP(D2,A2:B6,3,FALSE)', result: { error: '#REF!' } }, 'fehlerwert');
await typ('zaehlenwenn-1: Zielzelle leer', 'zaehlenwenn-1', undefined, 'leer');
await typ('absolut-1: richtige Formel, aber Daten verändert (B2 = 3000)', 'absolut-1', { formula: 'B2*$F$1', result: 243 }, 'wert-abweichend', (wb, ws) => { ws.getCell('B2').value = 3000; });

console.log('\nRobustheit');
await typ('wenn-1: Formel mit Zeilenumbrüchen, Kleinbuchstaben und Leerzeichen', 'wenn-1', { formula: 'if( b2 <= a2 ,\n "OK" ,\n "Überzogen" )', result: 'OK' }, 'ok');
{
  const a = grade('sverweis-1', await solutionFile('sverweis-1', correct['sverweis-1'], (wb, ws) => { ws.name = 'Tabelle1'; }));
  expect('Blatt umbenannt → falsches-blatt', a.error === 'falsches-blatt', JSON.stringify(a));
  const b = grade('sverweis-1', await solutionFile('summewenn-1', correct['summewenn-1']));
  expect('Datei einer anderen Übung → andere-uebung mit fileId summewenn-1', b.error === 'andere-uebung' && b.fileId === 'summewenn-1', JSON.stringify(b));
  const c = grade('sverweis-1', await solutionFile('summewenn-1', correct['summewenn-1'], (wb) => { wb.keywords = ''; }));
  expect('fremde Datei ohne Kennung, andere Kopfzeile → andere-datei', c.error === 'andere-datei', JSON.stringify(c));
  const d = U.readWorkbook(XLSX, new Uint8Array([0x50, 0x4b, 1, 2, 3, 4, 5]));
  expect('kaputte Datei → kaputt', d.error === 'kaputt', JSON.stringify(d));
  const e = grade('absolut-1', await solutionFile('absolut-1', { formula: 'B2*$F$1', result: 162 }, (wb, ws) => {
    ws.getCell('C3').value = { formula: 'B3*$F$1', result: 36.45 }; ws.getCell('C4').value = { formula: 'B4*$F$1', result: 24.3 };
  }));
  expect('absolut-1 nach unten ausgefüllt → ok, keine Abweichungen gemeldet', e.result && e.result.ok && e.diffs.length === 0, show(e));
}
const fc = (n, size, bytes) => (U.checkFile(n, size, bytes) || {}).error || null;
expect('.xls abgelehnt', fc('loesung.xls', 1000) === 'kein-xlsx-xls');
expect('.csv abgelehnt', fc('loesung.csv', 1000) === 'kein-xlsx-csv');
expect('.ods abgelehnt', fc('loesung.ods', 1000) === 'kein-xlsx');
expect('umbenannte .xls (D0 CF) als .xlsx abgelehnt', fc('loesung.xlsx', 1000, new Uint8Array([0xd0, 0xcf, 0x11, 0xe0])) === 'kein-xlsx-xls');
expect('über 5 MB abgelehnt', fc('loesung.xlsx', 6 * 1024 * 1024) === 'zu-gross');
expect('.xlsx mit PK angenommen', fc('Lösung.XLSX', 7000, new Uint8Array([0x50, 0x4b, 3, 4])) === null);

console.log(`\n${passed} bestanden, ${failures} fehlgeschlagen`);
process.exit(failures ? 1 : 0);
