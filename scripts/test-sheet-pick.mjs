// Tests für die reinen Funktionen von app/sheet-pick.js (Zellbezüge per Klick).
// Aufruf: node scripts/test-sheet-pick.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(readFileSync(join(root, 'app/sheet-pick.js'), 'utf8'), ctx);
const P = ctx.ExcelDrillsSheetPick;

let failures = 0, passed = 0;
const eq = (actual, expected, label) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { passed++; console.log(`  ok     ${label}`); }
  else { failures++; console.log(`  FEHLER ${label}: ${a}, erwartet ${e}`); }
};
const section = (t) => console.log(`\n${t}`);
const ins = (text, pos, ref, locale = 'de-CH', end = pos) => { const r = P.insertRef(text, pos, end, ref, locale); return [r.ok, r.value, r.cursor]; };

section('Bezug einfügen an Position');
eq(ins('', 0, 'B3'), [true, '=B3', 3], 'leeres Feld: «=» davor');
eq(ins('   ', 2, 'B3'), [true, '=B3', 3], 'nur Leerzeichen: wie leer');
eq(ins('=', 1, 'B3'), [true, '=B3', 3], 'nach «=»');
eq(ins('=SUMME(', 7, 'A2:A5'), [true, '=SUMME(A2:A5', 12], 'nach «(»');
eq(ins('=SUMME()', 7, 'A2'), [true, '=SUMME(A2)', 9], 'mitten im Text, Rest bleibt');
eq(ins('=A1+', 4, 'B1'), [true, '=A1+B1', 6], 'nach Operator +');
for (const op of ['-', '*', '/', '^', '&', '<', '>', ':', ' ']) eq(ins('=A1' + op, 4, 'C2')[0], true, `nach «${op}» erlaubt`);
eq(ins('=WENN(A1>0;', 11, 'B1'), [true, '=WENN(A1>0;B1', 13], 'nach Semikolon (de-CH)');
eq(ins('=IF(A1>0,', 9, 'B1', 'en-CH'), [true, '=IF(A1>0,B1', 11], 'nach Komma (en-CH)');
eq(ins('=WENN(A1>0,', 11, 'B1', 'de-CH')[0], false, 'Komma ist in de-CH kein Trenner');
eq(ins('=A1+B1', 4, 'C9', 'de-CH', 6), [true, '=A1+C9', 6], 'Auswahl wird ersetzt');

section('Kein Einfügen hinter Buchstabe, Ziffer, «)»');
eq(ins('=SUMME', 6, 'A1'), [false, '=SUMME', 6], 'hinter Buchstabe');
eq(ins('=A1', 3, 'B1')[0], false, 'hinter Ziffer');
eq(ins('=SUMME(A1)', 10, 'B1')[0], false, 'hinter «)»');
eq(ins('=$A$1', 5, 'B1')[0], false, 'hinter $-Bezug');
eq(ins('=1.', 3, 'B1')[0], false, 'hinter Punkt');
eq(ins('=A1', 0, 'B1')[0], false, 'vor dem «=»');
eq(ins('=WENN(A1="x ', 12, 'B1')[0], false, 'in einem Text-Literal');
eq(P.canInsertAt('=A1&" "&', 8, 'de-CH'), true, 'nach Text-Literal und &');

section('Bereichsbildung');
eq(P.rangeRef('A2', 'C5'), 'A2:C5', 'A2 -> C5');
eq(P.rangeRef('C5', 'A2'), 'A2:C5', 'C5 -> A2 (sortiert)');
eq(P.rangeRef('C2', 'A5'), 'A2:C5', 'C2 -> A5 (Ecken getauscht)');
eq(P.rangeRef('B3', 'B3'), 'B3', 'gleiche Zelle -> Einzelbezug');
eq(P.rangeRef('Z1', 'AB2'), 'Z1:AB2', 'zweistellige Spalte');
eq(P.colRef(0, 0), 'A:A', 'Spaltenkopf A');
eq(P.colRef(3, 1), 'B:D', 'Spalten B bis D');
eq(P.rowRef(1, 1), '2:2', 'Zeilennummer 2');
eq(P.rowRef(4, 1), '2:5', 'Zeilen 2 bis 5');
eq([P.indexToCol(0), P.indexToCol(25), P.indexToCol(26), P.colToIndex('AB'), P.colToIndex('$c')], ['A', 'Z', 'AA', 27, 2], 'Spalten-Umrechnung');

section('F4-Zyklus');
eq(P.cycleRef('B3'), '$B$3', 'B3 -> $B$3');
eq(P.cycleRef('$B$3'), 'B$3', '$B$3 -> B$3');
eq(P.cycleRef('B$3'), '$B3', 'B$3 -> $B3');
eq(P.cycleRef('$B3'), 'B3', '$B3 -> B3');
eq(P.cycleRef('A2:B7'), '$A$2:$B$7', 'Bereich: beide Teile');
eq(P.cycleRef('$A$2:$B$7'), 'A$2:B$7', 'Bereich: zweiter Schritt');
eq(P.cycleRef('A:A'), '$A:$A', 'Spalte: A:A -> $A:$A');
eq(P.cycleRef('$A:$A'), 'A:A', 'Spalte: zurück');
eq(P.cycleRef('2:2'), '$2:$2', 'Zeile: 2:2 -> $2:$2');
const t = P.toggleAbsAt('=SUMME(B2:B7)*C1', 9);
eq(t && [t.value, t.cursor], ['=SUMME($B$2:$B$7)*C1', 16], 'F4 im Text: Bereich unter dem Cursor');
const t2 = P.toggleAbsAt('=A1+C1', 6);
eq(t2 && [t2.value, t2.cursor], ['=A1+$C$1', 8], 'F4 am Ende des Bezugs');
eq(P.toggleAbsAt('=SUMME(1;2)', 3), null, 'F4 ohne Bezug: nichts');

section('Bezüge im Text erkennen');
const kinds = (s) => P.findRefs(s).map((r) => [r.text, r.kind, r.color]);
eq(kinds('=A1+B2'), [['A1', 'cell', 1], ['B2', 'cell', 2]], 'zwei Zellen, zwei Farben');
eq(kinds('=SUMME($B$2:B$7)/$C3'), [['$B$2:B$7', 'range', 1], ['$C3', 'cell', 2]], '$-Bezüge und Bereich');
eq(kinds('=A1*a1+$A$1'), [['A1', 'cell', 1], ['a1', 'cell', 1], ['$A$1', 'cell', 1]], 'gleicher Bezug, gleiche Farbe');
eq(kinds('=SUMME(A:A)+ZÄHLENWENN(2:2;">0")'), [['A:A', 'col', 1], ['2:2', 'row', 2]], 'Spalte und Zeile');
eq(kinds('=LOG10(A2)'), [['A2', 'cell', 1]], 'Funktionsname LOG10( kein Bezug');
eq(kinds('=WENN(A1="B2";C3;0)'), [['A1', 'cell', 1], ['C3', 'cell', 2]], 'Text-Literal ignoriert');
eq(kinds('=A1+B1+C1+D1+E1+F1+G1'), [['A1', 'cell', 1], ['B1', 'cell', 2], ['C1', 'cell', 3], ['D1', 'cell', 4], ['E1', 'cell', 5], ['F1', 'cell', 6], ['G1', 'cell', 1]], 'nach 6 Farben wieder von vorn');
const r = P.findRefs('=SUMME(C5:A2)')[0];
eq([r.c1, r.r1, r.c2, r.r2], [0, 1, 2, 4], 'Bereich normalisiert (Spalte/Zeile 0-basiert)');
eq(kinds('=Tabelle1!A1'), [], 'Blattname wird nicht als Bezug gewertet');

console.log(`\n${passed} ok, ${failures} Fehler`);
if (failures) process.exit(1);
