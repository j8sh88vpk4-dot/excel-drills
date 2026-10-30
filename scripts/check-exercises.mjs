// Prüft app/exercises.json gegen HyperFormula 3.0.0 mit derselben Engine wie die App, in allen vier Varianten:
// DE-CH (Standard), DE-DE, FR-CH und IT-CH (Übersetzungen aus app/i18n/fr.json und it.json).
// Aufruf: npm run check   (setzt npm install voraus; HyperFormula liegt als devDependency in node_modules)
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import ExcelJS from 'exceljs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// Browser-ähnlicher Kontext: HyperFormula-Bundle + Sprachpakete deDE, frFR, itIT + app/engine.js
const ctx = { console };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(read('node_modules/hyperformula/dist/hyperformula.full.min.js'), ctx);
for (const l of ['deDE', 'frFR', 'itIT']) vm.runInContext(read(`node_modules/hyperformula/dist/languages/${l}.js`), ctx);
vm.runInContext(read('app/i18n/ui-de.js'), ctx);
vm.runInContext(read('app/engine.js'), ctx);
vm.runInContext(read('app/keys.js'), ctx);
vm.runInContext(read('app/gamification.js'), ctx);

const HF = ctx.HyperFormula;
const E = ctx.ExcelDrillsEngine;
E.init(HF);
const I18N = Object.fromEntries(['fr', 'it'].map((l) => [l, JSON.parse(read(`app/i18n/${l}.json`))]));
for (const l of Object.keys(I18N)) E.registerI18n(l, I18N[l]);

const { exercises } = JSON.parse(read('app/exercises.json'));
let failures = 0;
const fail = (msg) => { failures++; console.log('  FEHLER ' + msg); };
const ok = (msg) => console.log('  ok     ' + msg);

console.log(`HyperFormula ${HF.version}, Sprachen: ${HF.getRegisteredLanguagesCodes().join(', ')}`);
console.log(`${exercises.length} Übungen (${exercises.filter((e) => e.free).length} gratis)\n`);

const ids = new Set();
const G = ctx.ExcelDrillsGamification;
const trackIds = new Set((JSON.parse(read('app/exercises.json')).tracks || []).map((t) => t.id));

// Projekt-Übungen (type "project"): Datei, Fragen und Antworten prüfen, ohne HyperFormula
function checkProjectExercise(ex) {
  for (const k of ['topic', 'title', 'intro', 'file', 'track']) if (typeof ex[k] !== 'string' || !ex[k].trim()) fail(`Feld ${k} fehlt`);
  if (typeof ex.free !== 'boolean') fail('free muss true/false sein');
  if (!trackIds.has(ex.track)) fail(`Pfad ${ex.track} fehlt in tracks`);
  if (!ex.hints || !ex.hints.generic) fail('hints.generic fehlt');
  const filePath = join(root, 'app', ex.file || '');
  if (!/^files\/[\w.-]+\.xlsx$/.test(ex.file || '')) fail(`file ${ex.file} muss files/<name>.xlsx sein`);
  else if (!existsSync(filePath)) fail(`Datei ${ex.file} fehlt (node scripts/data/generate-projects.mjs)`);
  else if (readFileSync(filePath).subarray(0, 2).toString() !== 'PK') fail(`Datei ${ex.file} ist keine xlsx-Datei`);
  else ok(`Datei ${ex.file} (${Math.round(statSync(filePath).size / 1024)} KB)`);
  if (!Array.isArray(ex.steps) || ex.steps.length < 4 || ex.steps.length > 7) fail('steps: 4 bis 7 Schritte erwartet');
  if (!Array.isArray(ex.questions) || !ex.questions.length) { fail('questions fehlt'); return; }
  if (G.hasAlt(ex)) fail('Projekte haben keine alt-Datensätze');

  const sample = ex.questions.map((q) => String(q.answer));
  ex.questions.forEach((q, i) => {
    const label = `Frage ${i + 1} (${q.answer}${q.unit ? ' ' + q.unit : ''})`;
    if (!q.q || !q.hint) fail(`${label}: q und hint sind Pflicht`);
    if (typeof q.answer !== 'number' || !isFinite(q.answer)) { fail(`${label}: answer ist keine Zahl`); return; }
    if (q.tolerance !== undefined && !(typeof q.tolerance === 'number' && q.tolerance >= 0)) fail(`${label}: tolerance muss eine Zahl >= 0 sein`);
    if (q.unit !== undefined && !['', 'CHF', '%', 'Zeilen'].includes(q.unit)) fail(`${label}: unbekannte unit ${q.unit}`);
    const tol = q.tolerance || 0;
    const one = (input) => {
      const answers = sample.slice();
      answers[i] = input;
      return E.checkProject(ex, answers).results[i];
    };
    const expectOk = (input, why) => (one(input).ok ? ok(`${label}: ${why} «${input}» akzeptiert`) : fail(`${label}: ${why} «${input}» abgelehnt: ${one(input).message}`));
    const expectNo = (input, why) => (one(input).ok ? fail(`${label}: ${why} «${input}» akzeptiert`) : ok(`${label}: ${why} «${input}» abgelehnt`));
    // Musterantwort in verschiedenen Schreibweisen
    expectOk(String(q.answer), 'Musterantwort');
    const swiss = E.formatNumber(q.answer);
    if (swiss !== String(q.answer)) expectOk(swiss, 'Hochkomma');
    if (!Number.isInteger(q.answer)) expectOk(String(q.answer).replace('.', ','), 'Komma');
    if (q.unit === '%') { expectOk(q.answer + ' %', 'mit %'); expectOk(String(q.answer / 100), 'als Bruch'); }
    if (tol > 0) {
      expectOk(String(Math.round((q.answer + tol * 0.9) * 100) / 100), 'innerhalb Toleranz');
      expectOk(String(Math.round((q.answer - tol * 0.9) * 100) / 100), 'innerhalb Toleranz');
    }
    // Falsche Antworten
    expectNo(String(Math.round((q.answer + Math.max(tol * 2, 1)) * 100) / 100), 'ausserhalb Toleranz');
    expectNo(String(q.answer * 2 + 1), 'falsch');
    expectNo('', 'leer');
    expectNo('abc', 'Text');
  });
  const all = E.checkProject(ex, sample);
  all.ok ? ok(`alle Musterantworten: ${all.message}`) : fail(`Musterantworten bestehen checkProject nicht: ${all.message}`);
  const wrong = E.checkProject(ex, sample.map((a, i) => (i === 0 ? String(Number(a) * 3 + 7) : a)));
  !wrong.ok && wrong.correct === sample.length - 1 ? ok(`eine falsche Antwort: ${wrong.message}`) : fail('eine falsche Antwort wurde nicht erkannt');
  // Meisterschaft ohne alt-Datensätze: Bronze, Silber, Gold über Wiederholung
  const st = G.emptyState();
  const medals = [1, 2, 3].map(() => { G.recordSolve(st, ex, 0, new Date(2026, 9, 30, 12)); return G.medalOf(st, ex); });
  medals.join() === '1,2,3' ? ok('Medaillen über Wiederholung: Bronze, Silber, Gold') : fail(`Medaillen über Wiederholung: ${medals}`);
}

for (const ex of exercises) {
  if (E.isProject(ex)) {
    console.log(`${ex.id} [${ex.free ? 'gratis' : 'premium'}] Projekt ${ex.file}`);
    if (ids.has(ex.id)) fail('doppelte id');
    ids.add(ex.id);
    checkProjectExercise(ex);
    console.log('');
    continue;
  }
  console.log(`${ex.id} [${ex.free ? 'gratis' : 'premium'}] ${ex.solution}`);
  if (ids.has(ex.id)) fail('doppelte id');
  ids.add(ex.id);

  // 1) Musterlösung liefert auf allen Datensätzen ein Ergebnis ohne Fehler
  E.datasets(ex).forEach((data, i) => {
    const r = E.evaluate(HF, data, ex.target, ex.solution);
    const label = i === 0 ? 'data' : `alt[${i - 1}]`;
    if (r.error) fail(`${label}: solution liefert ${r.error.value} ${r.error.message}`);
    else ok(`${label}: solution = ${JSON.stringify(r.value)}`);
  });
  // Alternative Datensätze sollen ein anderes Ergebnis liefern, sonst schützen sie nicht vor Hardcoding
  (ex.alt || []).forEach((a, i) => {
    const r0 = E.evaluate(HF, ex.data, ex.target, ex.solution);
    const r1 = E.evaluate(HF, a.data, ex.target, ex.solution);
    if (E.valuesEqual(r0.value, r1.value)) fail(`alt[${i}] liefert dasselbe Ergebnis wie data`);
  });

  // 2) Die Musterlösung besteht die eigene Prüfung
  const self = E.check(HF, ex, ex.solution);
  self.ok ? ok('solution besteht check()') : fail(`solution besteht check() nicht: ${self.message}`);

  // 3) accept-Formeln liefern dasselbe Ergebnis und bestehen die Prüfung
  for (const acc of ex.accept || []) {
    for (const [i, data] of E.datasets(ex).entries()) {
      const a = E.evaluate(HF, data, ex.target, acc);
      const b = E.evaluate(HF, data, ex.target, ex.solution);
      if (a.error) fail(`accept ${acc} liefert ${a.error.value} ${a.error.message}`);
      else if (!E.valuesEqual(a.value, b.value)) fail(`accept ${acc} = ${JSON.stringify(a.value)} statt ${JSON.stringify(b.value)} (Datensatz ${i})`);
    }
    const c = E.check(HF, ex, acc);
    c.ok ? ok(`accept ${acc} besteht check()`) : fail(`accept ${acc} besteht check() nicht: ${c.message}`);
  }

  // 2b) «Nochmal mit anderen Zahlen»: Die Musterlösung besteht check() auch mit jedem alt-Datensatz als Basis
  (ex.alt || []).forEach((a, i) => {
    const v = E.variant(ex, i + 1);
    const r = E.check(HF, v, ex.solution);
    r.ok ? ok(`variant alt[${i}]: solution besteht check()`) : fail(`variant alt[${i}]: solution besteht check() nicht: ${r.message}`);
  });

  // 4) Hartkodiertes Ergebnis darf nicht als richtig gelten
  const sol = E.evaluate(HF, ex.data, ex.target, ex.solution).value;
  const hard = typeof sol === 'string' ? `="${sol}"` : typeof sol === 'boolean' ? (sol ? '=WAHR()' : '=FALSCH()') : `=${sol}`;
  const h = E.check(HF, ex, hard);
  h.ok ? fail(`hartkodiert ${hard} wurde akzeptiert`) : ok(`hartkodiert ${hard} abgelehnt: ${h.message}`);
  console.log('');
}

// 5) Feedback-Regeln (Regressionstests)
console.log('Feedback-Regeln');
const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));
const cases = [
  ['summe-1', 'SUMME(B2:B6)', false, 'beginnt immer mit ='],
  ['summe-1', '=SUM(B2:B6)', false, 'Auf Deutsch heisst die Funktion SUMME'],
  ['summe-1', '=SUMME(B2,B6)', false, 'trennst du Argumente mit ; statt ,'],
  ['summe-1', '=summe(b2:b6)', true, ''],
  ['summe-1', '=SUMME(B2;B3;B4;B5;B6)', true, ''],
  ['summe-1', '=B2+B3+B4+B5+B6', false, 'Verwende in dieser Übung die Funktion SUMME'],
  ['summe-1', '=38500', false, 'Verwende Zellbezüge statt fester Zahlen'],
  ['summe-1', '=SUMME(B:B)', false, 'Zirkelbezug'],
  ['mittelwert-1', '=AVERAGE(B2:B7)', false, 'MITTELWERT'],
  ['mittelwert-1', '=DURCHSCHNITT(B2:B7)', false, 'kennt Excel nicht'],
  ['wenn-1', '=IF(B2<=A2;"OK";"Überzogen")', false, 'WENN'],
  ['wenn-1', '=WENN(B2<=A2;OK;Überzogen)', false, 'Anführungszeichen'],
  ['wenn-1', '=WENN(A2>0;"OK";"Überzogen")', false, 'mit anderen Werten'],
  ['wenn-1', '=WENN(B2<=A2;„OK“;„Überzogen“)', true, ''],
  ['zaehlenwenn-1', '=ZÄHLENWENN(B2:B8;offen)', false, 'Anführungszeichen'],
  ['zaehlenwenn-1', '=COUNTIF(B2:B8;"offen")', false, 'ZÄHLENWENN'],
  ['summewenn-1', '=SUMMEWENN(A2:A9;Ost;B2:B9)', false, 'Anführungszeichen'],
  ['summewenn-2', '=SUMMEWENN(A2:A7;>3;C2:C7)', false, '">3"'],
  ['summewenn-2', '=SUMIF(A2:A7,">3",C2:C7)', false, 'trennst du Argumente mit ;'],
  ['sverweis-1', '=SVERWEIS(D2;A2:B6;2;FALSE)', false, 'FALSCH statt FALSE'],
  ['sverweis-1', '=VLOOKUP(D2;A2:B6;2;0)', false, 'SVERWEIS'],
  ['runden-1', '=ROUND(A2;2)', false, 'RUNDEN'],
  ['runden-1', '=A2*1,5', false, 'Punkt'],
  ['absolut-1', '=B2*F1', false, '$F$1'],
  ['absolut-1', '=B2*$F$1', true, ''],
  ['wennfehler-1', '=IFERROR(A2/B2;"n/a")', false, 'WENNFEHLER'],
  ['wennfehler-1', '=A2/B2', false, ''],
  ['textkette-1', '=TEXTKETTE(A2;" ";B2)', true, ''],
  ['textkette-1', '=CONCAT(A2;" ";B2)', false, 'TEXTKETTE'],
  ['textkette-1', '=A2&B2', false, ''],
  ['summenprodukt-1', '=SUMPRODUCT(A2:A6;B2:B6)', false, 'SUMMENPRODUKT'],
  ['wenn-verschachtelt-1', '=WENN(A2>0.8;"hoch";"mittel")', false, ''],
  // Accounting & Controlling
  ['acc-abweichung-1', '=B2-C2', false, 'Ist − Budget'],
  ['acc-anteil-1', '=B2/B6', false, '$B$6'],
  ['acc-mwst-1', '=B2*(1-$F$1)', false, 'Netto aus brutto'],
  ['acc-mwst-1', '=B2/(1+F1)', false, '$F$1'],
  ['acc-rundung-1', '=RUNDEN(B2;1)', false, ''],
  ['acc-rundung-1', '=VRUNDEN(B2;0.05)', true, ''],
  ['acc-summewenns-1', '=SUMMEWENN(A2:A9;"Marketing";C2:C9)', false, 'SUMMEWENNS'],
  ['acc-summewenns-1', '=SUMIFS(C2:C9;A2:A9;E2;B2:B9;F2)', false, 'SUMMEWENNS'],
  ['acc-sollhaben-1', '=WENN(SUMME(B2:B6)=SUMME(C2:C6);"OK";"Differenz")', false, 'RUNDEN'],
  ['acc-abstimmung-1', '=SVERWEIS(A2;$E$2:$F$7;2;FALSCH)', false, ''],
  ['acc-alterung-1', '=WENN($H$1-B2<30;"0-30";WENN($H$1-B2<60;"31-60";">60"))', false, 'mit anderen Werten'],
  // Banking & Finance
  ['fin-rmz-1', '=RMZ(B2/12;C2*12;A2)', false, ''],
  ['fin-rmz-1', '=-RMZ(B2;C2;A2)', false, ''],
  ['fin-bw-1', '=-BW(B2;C2;A2)', true, ''],
  ['fin-praemienstaffel-1', '=E2*SVERWEIS(E2;$A$2:$B$6;2;FALSCH)', false, ''],
  ['fin-schadenquote-1', '=MITTELWERT(C2:C5)/MITTELWERT(B2:B5)', false, 'SUMME'],
  ['fin-breakeven-1', '=AUFRUNDEN(A2/B2-C2;0)', false, ''],
  ['fin-cashflow-1', '=SUMME(B3:B3)+C2', true, ''],
];
for (const [id, formula, expectOk, expectMsg] of cases) {
  const r = E.check(HF, byId[id], formula);
  const good = r.ok === expectOk && (!expectMsg || r.message.includes(expectMsg));
  good ? ok(`${id} ${formula} -> ${r.message}`) : fail(`${id} ${formula} -> ok=${r.ok} "${r.message}" (erwartet ok=${expectOk}, "${expectMsg}")`);
}

// 6) Hilfsfunktionen
console.log('\nHilfsfunktionen');
const eq = (a, b, label) => (a === b ? ok(`${label} = ${a}`) : fail(`${label} = ${a}, erwartet ${b}`));
eq(E.formatNumber(12500), "12'500", 'formatNumber(12500)');
eq(E.formatNumber(1234.5678), "1'234.5678", 'formatNumber(1234.5678)');
eq(E.formatNumber(-1000000.5), "-1'000'000.5", 'formatNumber(-1000000.5)');
eq(E.formatNumber(0.081), '0.081', 'formatNumber(0.081)');
const pa = (s) => JSON.stringify(E.parseAnswer(s));
eq(pa("1'234,50"), '{"value":1234.5,"percent":false}', "parseAnswer(1'234,50)");
eq(pa('1 234.50'), '{"value":1234.5,"percent":false}', 'parseAnswer(1 234.50)');
eq(pa('12,5 %'), '{"value":12.5,"percent":true}', 'parseAnswer(12,5 %)');
eq(pa('CHF 1’234.55'), '{"value":1234.55,"percent":false}', 'parseAnswer(CHF 1’234.55)');
eq(pa('1.234,50'), '{"value":1234.5,"percent":false}', 'parseAnswer(1.234,50)');
eq(pa('−3,2'), '{"value":-3.2,"percent":false}', 'parseAnswer(−3,2)');
eq(pa('zwölf'), '{"invalid":true}', 'parseAnswer(zwölf)');
eq(pa('   '), '{"empty":true}', 'parseAnswer(Leerzeichen)');
eq(ctx.ExcelDrillsKeys.hash('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'sha256(abc)');
eq(ctx.ExcelDrillsKeys.hash('XD-TEST'), ctx.ExcelDrillsKeys.hash(' xd-test '.trim().toUpperCase()), 'hash normalisiert');
eq(ctx.ExcelDrillsKeys.isValid('DRILLS-2026-TEST'), false, 'alter Test-Key ungültig');
eq(ctx.ExcelDrillsKeys.isValid('FALSCH'), false, 'isValid(FALSCH)');

// 7) Deutschland (DE): jede Übung zusätzlich mit Dezimalkomma, EUR und ß prüfen
console.log('\nDeutschland (DE)\n');
const chValue = {};
for (const ex of exercises) if (!E.isProject(ex)) chValue[ex.id] = E.evaluate(HF, ex.data, ex.target, ex.solution).value;
E.setLocale('de');
eq(E.getLocale(), 'de-DE', 'setLocale(de) → de-DE');
// Begriffe, die in der DE-Variante nicht mehr vorkommen dürfen (in allen Texten und Text-Zellen)
const FORBIDDEN_DE = /CHF|Franken|Rappen|Zürich|\bBern\b|Basel|Luzern|Lugano|St\. Gallen|Schweiz|Säule 3a|Bankusanz|[Gg]röss|[Hh]eiss|chliess|[äÄ]usser|[Aa]usser|[Ss]trasse|[Gg]ross|Ctrl\+/;
const DECIMAL_DOT = /(^|[^\w.,])\d+\.\d+(?!\d|\.\d)/;
const textsOf = (L) => [L.topic, L.title, L.task, L.intro, ...(L.steps || []), ...Object.values(L.hints || {}),
  ...(L.questions || []).flatMap((q) => [q.q, q.hint, q.unit]),
  ...[L.data, ...(L.alt || []).map((a) => a.data)].flat(2).filter((v) => typeof v === 'string')].filter(Boolean);
const readBook = async (file) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(join(root, 'app', file));
  return wb.worksheets.map((ws) => ({ name: ws.name, rows: ws.getSheetValues().slice(1).map((r) => (r || []).slice(1)) }));
};

for (const ex of exercises) {
  const L = E.localize(ex, 'de');
  console.log(`${ex.id} [DE] ${E.isProject(ex) ? 'Projekt ' + L.file : L.solution}`);
  textsOf(L).forEach((t) => {
    const m = FORBIDDEN_DE.exec(t);
    if (m) fail(`Text enthält «${m[0]}»: ${t}`);
    const d = DECIMAL_DOT.exec(t);
    if (d) fail(`Text enthält eine Dezimalzahl mit Punkt «${d[0].trim()}»: ${t}`);
  });
  if (ex.id !== L.id) fail('id hat sich geändert');

  if (E.isProject(ex)) {
    // Datei: files/de/<name>.xlsx, gleiche Zahlen wie die CH-Datei, Texte über die Textabbildung
    if (L.file !== ex.file.replace(/^files\//, 'files/de/')) fail(`DE-Datei ${L.file} statt files/de/…`);
    const filePath = join(root, 'app', L.file);
    if (!existsSync(filePath)) { fail(`Datei ${L.file} fehlt (npm run data:projects)`); console.log(''); continue; }
    if (readFileSync(filePath).subarray(0, 2).toString() !== 'PK') fail(`Datei ${L.file} ist keine xlsx-Datei`);
    const [ch, de] = [await readBook(ex.file), await readBook(L.file)];
    let cells = 0, diffs = 0;
    ch.forEach((sh, si) => sh.rows.forEach((row, ri) => row.forEach((v, ci) => {
      const w = de[si] && de[si].rows[ri] ? de[si].rows[ri][ci] : undefined;
      const want = typeof v === 'string' ? E.mapText(v, 'de') : v instanceof Date ? v.getTime() : v;
      const have = w instanceof Date ? w.getTime() : w;
      cells++;
      if (want !== have && diffs++ < 3) fail(`${L.file} Blatt ${sh.name} Zeile ${ri + 1} Spalte ${ci + 1}: ${JSON.stringify(have)} statt ${JSON.stringify(want)}`);
    })));
    if (de.length !== ch.length) fail(`${L.file}: ${de.length} statt ${ch.length} Blätter`);
    diffs ? fail(`${L.file}: ${diffs} abweichende Zellen`) : ok(`Datei ${L.file}: ${cells} Zellen, Zahlen gleich wie CH, Texte abgebildet`);
    const deTexts = de.flatMap((sh) => sh.rows.flat()).filter((v) => typeof v === 'string');
    const bad = deTexts.find((t) => FORBIDDEN_DE.test(t));
    bad ? fail(`${L.file} enthält noch «${bad}»`) : ok(`${L.file}: keine CH-Orte, CHF oder ss-Schreibweisen`);
    // Antworten identisch, Einheiten in EUR
    const same = L.questions.every((q, i) => q.answer === ex.questions[i].answer && q.tolerance === ex.questions[i].tolerance);
    same ? ok('Antworten identisch mit CH') : fail('Antworten weichen von CH ab');
    L.questions.forEach((q, i) => {
      if (q.unit !== undefined && !['', 'EUR', '%', 'Zeilen'].includes(q.unit)) fail(`Frage ${i + 1}: unit ${q.unit} in DE`);
      const sample = L.questions.map((x) => String(x.answer));
      const one = (input) => { const a = sample.slice(); a[i] = input; return E.checkProject(L, a).results[i]; };
      const inputs = [E.formatNumber(q.answer, 'de'), E.formatNumber(q.answer, 'ch'), String(q.answer)];
      if (q.unit === 'EUR') inputs.push(E.formatNumber(q.answer, 'de') + ' €');
      inputs.forEach((inp) => (one(inp).ok ? ok(`Frage ${i + 1}: «${inp}» akzeptiert`) : fail(`Frage ${i + 1}: «${inp}» abgelehnt: ${one(inp).message}`)));
      if (one('abc').ok || !/1\.234,50/.test(one('abc').message)) fail(`Frage ${i + 1}: Meldung für Text nicht im DE-Format`);
    });
    const all = E.checkProject(L, L.questions.map((q) => E.formatNumber(q.answer, 'de')));
    all.ok ? ok(`alle Antworten im DE-Format: ${all.message}`) : fail(`DE-Antworten bestehen nicht: ${all.message}`);
    console.log('');
    continue;
  }

  // 1) Musterlösung (konvertiert) liefert auf allen Datensätzen ein Ergebnis
  E.datasets(L).forEach((data, i) => {
    const r = E.evaluate(HF, data, L.target, L.solution);
    const label = i === 0 ? 'data' : `alt[${i - 1}]`;
    if (r.error) fail(`${label}: solution liefert ${r.error.value} ${r.error.message}`);
    else ok(`${label}: solution = ${JSON.stringify(r.value)}`);
  });
  (L.alt || []).forEach((a, i) => {
    if (E.valuesEqual(E.evaluate(HF, L.data, L.target, L.solution).value, E.evaluate(HF, a.data, L.target, L.solution).value)) fail(`alt[${i}] liefert dasselbe Ergebnis wie data`);
  });
  // Ohne eigene DE-Daten muss DE dasselbe Ergebnis liefern wie CH (eine Zahl ist eine Zahl)
  if (!(ex.locale && ex.locale.de && ex.locale.de.data)) {
    const v = E.evaluate(HF, L.data, L.target, L.solution).value;
    E.valuesEqual(v, chValue[ex.id]) ? ok(`gleiches Ergebnis wie CH (${JSON.stringify(v)})`) : fail(`DE ${JSON.stringify(v)} statt CH ${JSON.stringify(chValue[ex.id])}`);
  }
  // 2) Die konvertierte Musterlösung besteht check()
  const self = E.check(HF, L, L.solution);
  self.ok ? ok('solution besteht check()') : fail(`solution besteht check() nicht: ${self.message}`);
  // CH-Schreibweise mit Dezimalpunkt wird in DE mit einem Hinweis auf das Komma abgelehnt
  if (E.hasDecimalDot(ex.solution)) {
    const r = E.check(HF, L, ex.solution);
    !r.ok && /Komma/.test(r.message) ? ok(`CH-Notation ${ex.solution} abgelehnt: ${r.message}`) : fail(`CH-Notation ${ex.solution} in DE: ok=${r.ok} "${r.message}"`);
  }
  // 3) accept-Formeln (konvertiert)
  for (const acc of L.accept || []) {
    for (const [i, data] of E.datasets(L).entries()) {
      const a = E.evaluate(HF, data, L.target, acc);
      const b = E.evaluate(HF, data, L.target, L.solution);
      if (a.error) fail(`accept ${acc} liefert ${a.error.value} ${a.error.message}`);
      else if (!E.valuesEqual(a.value, b.value)) fail(`accept ${acc} = ${JSON.stringify(a.value)} statt ${JSON.stringify(b.value)} (Datensatz ${i})`);
    }
    const c = E.check(HF, L, acc);
    c.ok ? ok(`accept ${acc} besteht check()`) : fail(`accept ${acc} besteht check() nicht: ${c.message}`);
  }
  // 2b) alt-Datensätze als Basis («Nochmal mit anderen Zahlen»)
  (L.alt || []).forEach((a, i) => {
    const r = E.check(HF, E.variant(L, i + 1), L.solution);
    r.ok ? ok(`variant alt[${i}]: solution besteht check()`) : fail(`variant alt[${i}]: solution besteht check() nicht: ${r.message}`);
  });
  // 4) Hartkodiertes Ergebnis (in DE-Schreibweise) wird abgelehnt
  const sol = E.evaluate(HF, L.data, L.target, L.solution).value;
  const hard = typeof sol === 'string' ? `="${sol}"` : typeof sol === 'boolean' ? (sol ? '=WAHR()' : '=FALSCH()') : `=${String(sol).replace('.', ',')}`;
  const h = E.check(HF, L, hard);
  h.ok ? fail(`hartkodiert ${hard} wurde akzeptiert`) : ok(`hartkodiert ${hard} abgelehnt: ${h.message}`);
  console.log('');
}

console.log('Feedback-Regeln (DE)');
const byIdDe = Object.fromEntries(exercises.map((e) => [e.id, E.localize(e, 'de')]));
const casesDe = [
  ['summe-1', '=SUMME(B2,B6)', false, 'trennst du Argumente mit ; und Dezimalzahlen mit Komma'],
  ['summe-1', '=SUM(B2,B6)', false, 'heißt die Funktion SUMME'],
  ['summe-1', '=SUMME(B2:B6)', true, ''],
  ['acc-rundung-1', '=RUNDEN(B2/0.05;0)*0.05', false, 'Dezimalzahlen mit Komma'],
  ['acc-rundung-1', '=RUNDEN(B2/0,05;0)*0,05', true, ''],
  ['acc-rundung-1', '=VRUNDEN(B2;0,05)', true, ''],
  ['acc-rundung-1', '=RUNDEN(B2;1)', false, ''],
  ['runden-1', '=A2*1,5', false, 'Funktion RUNDEN'],
  ['wenn-verschachtelt-1', '=WENN(A2>0,8;"hoch";WENN(A2>0,5;"mittel";"tief"))', true, ''],
  ['wenn-verschachtelt-1', '=WENN(A2>0.8;"hoch";WENN(A2>0.5;"mittel";"tief"))', false, 'Komma'],
  ['summewenn-2', '=SUMIF(A2:A7,">3",C2:C7)', false, 'trennst du Argumente mit ;'],
  ['absolut-1', '=B2*$F$1', true, ''],
  ['acc-mwst-1', '=B2/(1+$F$1)', true, ''],
  ['acc-mwst-1', '=B2*(1-$F$1)', false, 'Netto aus brutto'],
  ['mittelwert-1', '=DURCHSCHNITT(B2:B7)', false, 'kennt Excel nicht'],
];
for (const [id, formula, expectOk, expectMsg] of casesDe) {
  const r = E.check(HF, byIdDe[id], formula);
  const good = r.ok === expectOk && (!expectMsg || r.message.includes(expectMsg));
  good ? ok(`${id} ${formula} -> ${r.message}`) : fail(`${id} ${formula} -> ok=${r.ok} "${r.message}" (erwartet ok=${expectOk}, "${expectMsg}")`);
}
// Fachliche Overrides
eq(byIdDe['acc-mwst-1'].data[0][5], 0.19, 'acc-mwst-1 DE MwSt-Satz');
eq(byIdDe['absolut-1'].data[0][5], 0.19, 'absolut-1 DE MwSt-Satz F1');
eq(E.formatValue(byIdDe['summe-1'].data[1][1]), '12.500', 'summe-1 DE Anzeige B2');
eq(byIdDe['summe-1'].data[1][0], 'München', 'summe-1 DE Ort A2');
eq(byIdDe['fin-zins-1'].task.includes('act/360'), true, 'fin-zins-1 DE Eurozins-Methode');
eq(byIdDe['acc-rundung-1'].solution, '=RUNDEN(B2/0,05;0)*0,05', 'acc-rundung-1 DE solution');

console.log('\nHilfsfunktionen (DE)');
const conv = (f, from, to, want) => eq(E.convertFormulaLocale(f, from, to), want, `convertFormulaLocale(${f}, ${from}, ${to})`);
conv('=RUNDEN(B2/0.05;0)*0.05', 'ch', 'de', '=RUNDEN(B2/0,05;0)*0,05');
conv('=1.5e3+A2', 'ch', 'de', '=1,5e3+A2');
conv('=WENN(A2>0.8;"Version 1.5";"x")', 'ch', 'de', '=WENN(A2>0,8;"Version 1.5";"x")');
conv('=SUMME(A2:B6)/$F$1', 'ch', 'de', '=SUMME(A2:B6)/$F$1');
conv('=B12*1.25+AA10', 'ch', 'de', '=B12*1,25+AA10');
conv('=WENN(A1="a""0.5";0.5;2)', 'ch', 'de', '=WENN(A1="a""0.5";0,5;2)');
conv('=SUMME(B2:B6)*.5', 'ch', 'de', '=SUMME(B2:B6)*,5');
conv('=RUNDEN(B2/0,05;0)*0,05', 'de', 'ch', '=RUNDEN(B2/0.05;0)*0.05');
conv('=WENN(A2>0,8;"1,5";1,5)', 'de', 'ch', '=WENN(A2>0.8;"1,5";1.5)');
conv('=A2*0.5', 'ch', 'ch', '=A2*0.5');
eq(E.commaKind('=SUMME(B2,B6)', 'de'), 'separator', 'commaKind DE =SUMME(B2,B6)');
eq(E.commaKind('=A2*1,5', 'de'), null, 'commaKind DE =A2*1,5');
eq(E.commaKind('=A2*1,5', 'ch'), 'decimal', 'commaKind CH =A2*1,5');
eq(E.commaKind('=SUMME(1,5;B2)', 'ch'), 'separator', 'commaKind CH =SUMME(1,5;B2)');
eq(E.hasDecimalDot('=RUNDEN(B2/0.05;0)'), true, 'hasDecimalDot 0.05');
eq(E.hasDecimalDot('=WENN(A1="1.5";1;2)'), false, 'hasDecimalDot nur im Text');
eq(E.formatNumber(12500), '12.500', 'formatNumber DE 12500');
eq(E.formatNumber(1234.5678), '1.234,5678', 'formatNumber DE 1234.5678');
eq(E.formatNumber(-1000000.5), '-1.000.000,5', 'formatNumber DE -1000000.5');
eq(E.formatNumber(0.081, 'ch'), '0.081', 'formatNumber(0.081, ch) explizit');
eq(pa('1.234'), '{"value":1234,"percent":false}', 'parseAnswer DE 1.234 (Tausenderpunkt)');
eq(pa('0.143'), '{"value":0.143,"percent":false}', 'parseAnswer DE 0.143');
eq(pa('12.5'), '{"value":12.5,"percent":false}', 'parseAnswer DE 12.5');
eq(pa('1.234,50 €'), '{"value":1234.5,"percent":false}', 'parseAnswer DE 1.234,50 €');
eq(pa("1'234.50"), '{"value":1234.5,"percent":false}', "parseAnswer DE 1'234.50");
eq(pa('EUR 89.798,20'), '{"value":89798.2,"percent":false}', 'parseAnswer DE EUR 89.798,20');
const mt = (s, want) => eq(E.mapText(s, 'de'), want, `mapText(${s})`);
mt('Die grösste Filiale heisst Zürich.', 'Die größte Filiale heißt München.');
mt('Schliessen & laden, Join-Art «Linker äusserer», Grosskunde', 'Schließen & laden, Join-Art «Linker äußerer», Großkunde');
mt('dass, musst, Klasse, lassen, Fläche', 'dass, musst, Klasse, lassen, Fläche');
mt('Strasse, Massnahme, Fuss, Grüsse, Mass, ausserdem, Grösse', 'Straße, Maßnahme, Fuß, Grüße, Maß, außerdem, Größe');
mt("Umsatz CHF 12'500.50 am 31.10.2026, 5 Rappen, Franken", 'Umsatz EUR 12.500,50 am 31.10.2026, 5 Cent, Euro');
mt('Bern, Basel, Luzern, Lugano, St. Gallen, Berner Platte', 'Hamburg, Köln, Frankfurt, Berlin, Stuttgart, Berner Platte');
mt('z. B. 12.3.', 'z. B. 12,3.');
eq(E.mapText('Die grösste Filiale', 'ch'), 'Die grösste Filiale', 'mapText CH unverändert');
const summeCh = E.localize(byId['summe-1'], 'ch');
eq(summeCh, byId['summe-1'], 'localize CH gibt die Übung unverändert zurück');
E.setLocale('ch');
eq(E.getLocale(), 'de-CH', 'setLocale(ch) → de-CH');

// 8) Locale-Modell: alte Werte bleiben gültig
console.log('\nLocale-Modell');
for (const [inp, want] of [['ch', 'de-CH'], ['de', 'de-DE'], ['de-CH', 'de-CH'], ['de-DE', 'de-DE'], ['fr', 'fr-CH'], ['fr-CH', 'fr-CH'], ['it', 'it-CH'], ['IT-ch', 'it-CH'], ['', 'de-CH'], [null, 'de-CH'], ['xx', 'de-CH']]) {
  eq(E.normalizeLocale(inp), want, `normalizeLocale(${JSON.stringify(inp)})`);
}
eq(E.hasLanguage('fr-CH') && E.hasLanguage('it-CH') && E.hasLanguage('de-DE'), true, 'Sprachpakete frFR, itIT, deDE registriert');

// 9) Französisch (FR-CH) und Italienisch (IT-CH)
await checkLanguages();

console.log(failures ? `\n${failures} Fehler` : '\nAlle Prüfungen bestanden.');
process.exit(failures ? 1 : 0);

/* ---------- FR-CH / IT-CH ---------- */

async function checkLanguages() {
  const NAMES = {
    fr: { lang: 'Französisch', unitRows: 'lignes', TRUE: 'VRAI', FALSE: 'FAUX' },
    it: { lang: 'Italienisch', unitRows: 'righe', TRUE: 'VERO', FALSE: 'FALSO' },
  };
  // Häufige deutsche Wörter, die in übersetzten Texten nicht vorkommen dürfen (Wortgrenzen, Gross/klein egal)
  const GERMAN_WORDS = /(^|[^\p{L}])(und|oder|nicht|ist|eine|einen|einer|der|die|das|dem|den|mit|für|auf|von|zum|zur|wenn|dann|sonst|Zelle|Zellen|Spalte|Zeile|Zeilen|Betrag|Umsatz|Summe|Formel|Übung|Hinweis|Bereich|Prüfe|Wert|Werte|gib|dein|deine|Kosten|Rechnung|Monat|Jahr|Jahre|Tage|Zins|Bestellung|Bestellungen|Kunden|Daten|Blatt|Ergebnis|Gesamtergebnis|Anzahl|Ziehe|Klicke|Wähle|Einfügen|Schliessen|Laden|Brutto|Satz|Stück|Preis|Konto|Ist|Soll|Haben|offen|bezahlt|Filialen)(?![\p{L}])/iu;
  const UMLAUT = /[äöüÄÖÜß]/;
  const CODE = /^[A-Z]{1,3}(-\d+)+$/;            // Belegnummern usw. (S-1001, R-2026-0412, ZA-7781)
  const DATE = /^\d\d\.\d\d\.\d{4}$/;
  const hasLetters = (t) => /\p{L}/u.test(t);
  const literals = (f) => f.split('"').filter((p, i) => i % 2 === 1);
  const uiDe = ctx.ExcelDrillsUiDe;
  const htmlKeys = [...new Set([...read('app/index.html').matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1])
    .concat([...read('app/index.html').matchAll(/data-i18n-attr="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((p) => p.split(':')[1]))))];
  const engineKeys = Object.keys(E.MSG).map((k) => 'msg.' + k)
    .concat(Object.keys(E.PROJECT_MSG).map((k) => 'pmsg.' + k))
    .concat(['formulaHelp', 'miniHelp', 'projectNote', 'switched', 'name', 'close'].map((k) => 'locale.' + k));
  const placeholders = (t) => [...String(t).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const stats = {};

  for (const lang of ['fr', 'it']) {
    const loc = lang + '-CH', N = NAMES[lang], D = I18N[lang];
    const deNames = Object.keys(E.deMap(lang));
    const deFnRe = new RegExp('(^|[^A-Za-zÀ-ÿ0-9.])(' + deNames.map((n) => n.replace(/[.]/g, '\\.')).join('|') + ')(?![A-Za-zÀ-ÿ0-9.])');
    let count = 0;
    const scan = (where, t) => {
      if (typeof t !== 'string' || !t) return;
      count++;
      const g = GERMAN_WORDS.exec(t);
      if (g) fail(`[${loc}] ${where}: deutsches Wort «${g[2]}»: ${t}`);
      if (UMLAUT.test(t)) fail(`[${loc}] ${where}: Umlaut/ß: ${t}`);
      const fn = deFnRe.exec(t);
      if (fn) fail(`[${loc}] ${where}: deutscher Funktionsname ${fn[2]}: ${t}`);
    };

    console.log(`\n${N.lang} (${loc})\n`);
    // Oberfläche: alle Schlüssel vorhanden, Platzhalter gleich, keine deutschen Reste
    const ui = D.ui || {};
    const needed = [...new Set([...Object.keys(uiDe), ...htmlKeys, ...engineKeys])];
    const missing = needed.filter((k) => typeof ui[k] !== 'string' || !ui[k].trim());
    missing.length ? fail(`[${loc}] ui: ${missing.length} Schlüssel fehlen: ${missing.join(', ')}`) : ok(`ui: alle ${needed.length} Schlüssel vorhanden (ui-de.js, app/index.html, Engine)`);
    Object.keys(uiDe).forEach((k) => { if (ui[k] && placeholders(ui[k]) !== placeholders(uiDe[k])) fail(`[${loc}] ui ${k}: Platzhalter {${placeholders(ui[k])}} statt {${placeholders(uiDe[k])}}`); });
    Object.keys(ui).forEach((k) => scan('ui ' + k, ui[k]));
    const uiCount = Object.keys(ui).length;
    E.setLocale(loc);
    eq(E.getLocale(), loc, `setLocale(${lang})`);
    eq(E.uiText().lang, loc, `uiText().lang`);

    E.setLocale('de-CH');
    const chValue = {};
    for (const ex of exercises) if (!E.isProject(ex)) chValue[ex.id] = E.evaluate(HF, ex.data, ex.target, ex.solution).value;
    E.setLocale(loc);
    let exCount = 0;

    for (const ex of exercises) {
      const tr = (D.exercises || {})[ex.id];
      if (!tr) { fail(`[${loc}] ${ex.id}: Übersetzung fehlt`); continue; }
      const L = E.localize(ex, loc);
      console.log(`${ex.id} [${lang.toUpperCase()}] ${E.isProject(ex) ? 'Projekt ' + L.file : L.solution}`);
      if (L.id !== ex.id) fail('id hat sich geändert');
      // Pflichtfelder
      const req = E.isProject(ex) ? ['topic', 'title', 'intro'] : ['topic', 'title', 'task'];
      req.forEach((k) => { if (typeof tr[k] !== 'string' || !tr[k].trim()) fail(`[${loc}] ${ex.id}: ${k} fehlt`); });
      Object.keys(ex.hints || {}).forEach((h) => { if (!tr.hints || typeof tr.hints[h] !== 'string' || !tr.hints[h].trim()) fail(`[${loc}] ${ex.id}: hints.${h} fehlt`); });
      const texts = [L.topic, L.title, L.task, L.intro, ...(L.steps || []), ...Object.values(L.hints || {}),
        ...(L.questions || []).flatMap((q) => [q.q, q.hint, q.unit])];
      texts.forEach((t) => scan(ex.id, t));
      exCount += [tr.topic, tr.title, tr.task, tr.intro, ...(tr.steps || []), ...Object.values(tr.hints || {}),
        ...(tr.questions || []).flatMap((q) => [q.q, q.hint])].filter(Boolean).length
        + Object.keys(tr.data || {}).length + Object.keys(tr.terms || {}).length;

      if (E.isProject(ex)) {
        if (!Array.isArray(tr.steps) || tr.steps.length !== ex.steps.length) fail(`[${loc}] ${ex.id}: steps ${tr.steps ? tr.steps.length : 0} statt ${ex.steps.length}`);
        if (!Array.isArray(tr.questions) || tr.questions.length !== ex.questions.length) fail(`[${loc}] ${ex.id}: questions ${tr.questions ? tr.questions.length : 0} statt ${ex.questions.length}`);
        (tr.questions || []).forEach((q, i) => {
          if (!q.q || !q.hint) fail(`[${loc}] ${ex.id} Frage ${i + 1}: q und hint sind Pflicht`);
          if (ex.questions[i] && ex.questions[i].unit !== undefined && q.unit === undefined) fail(`[${loc}] ${ex.id} Frage ${i + 1}: unit fehlt`);
        });
        const want = ex.file.replace(/^files\//, `files/${lang}/`);
        if (L.file !== want) fail(`[${loc}] Datei ${L.file} statt ${want}`);
        const filePath = join(root, 'app', L.file);
        if (!existsSync(filePath)) { fail(`[${loc}] Datei ${L.file} fehlt (npm run data:projects)`); console.log(''); continue; }
        if (readFileSync(filePath).subarray(0, 2).toString() !== 'PK') fail(`Datei ${L.file} ist keine xlsx-Datei`);
        const [ch, tb] = [await readBook(ex.file), await readBook(L.file)];
        const map = D.files || {};
        const tx = (v) => (typeof v === 'string' && Object.prototype.hasOwnProperty.call(map, v) ? map[v] : v);
        let cells = 0, diffs = 0;
        if (tb.length !== ch.length) fail(`${L.file}: ${tb.length} statt ${ch.length} Blätter`);
        ch.forEach((sh, si) => {
          if (!tb[si] || tb[si].name !== tx(sh.name)) fail(`${L.file}: Blatt ${tb[si] && tb[si].name} statt ${tx(sh.name)}`);
          if (!Object.prototype.hasOwnProperty.call(map, sh.name)) fail(`[${loc}] files: Blattname «${sh.name}» nicht übersetzt`);
          (sh.rows[0] || []).forEach((h) => { if (!Object.prototype.hasOwnProperty.call(map, h)) fail(`[${loc}] files: Kopfzeile «${h}» nicht übersetzt`); });
          sh.rows.forEach((row, ri) => row.forEach((v, ci) => {
            const w = tb[si] && tb[si].rows[ri] ? tb[si].rows[ri][ci] : undefined;
            const want = v instanceof Date ? v.getTime() : tx(v);
            const have = w instanceof Date ? w.getTime() : w;
            cells++;
            if (want !== have && diffs++ < 3) fail(`${L.file} Blatt ${sh.name} Zeile ${ri + 1} Spalte ${ci + 1}: ${JSON.stringify(have)} statt ${JSON.stringify(want)}`);
          }));
        });
        diffs ? fail(`${L.file}: ${diffs} abweichende Zellen`) : ok(`Datei ${L.file}: ${cells} Zellen, Zahlen gleich wie CH, Kopfzeilen und Blattnamen übersetzt`);
        tb.forEach((sh) => [sh.name, ...(sh.rows[0] || [])].forEach((h) => scan(`${L.file} Kopfzeile`, h)));
        const same = L.questions.every((q, i) => q.answer === ex.questions[i].answer && q.tolerance === ex.questions[i].tolerance);
        same ? ok('Antworten identisch mit CH') : fail('Antworten weichen von CH ab');
        L.questions.forEach((q, i) => {
          if (q.unit !== undefined && !['', 'CHF', '%', N.unitRows].includes(q.unit)) fail(`Frage ${i + 1}: unit ${q.unit} in ${lang}`);
        });
        const sample = L.questions.map((q) => E.formatNumber(q.answer));
        const all = E.checkProject(L, sample);
        all.ok ? ok(`alle Antworten: ${all.message}`) : fail(`Antworten bestehen nicht: ${all.message}`);
        const bad = E.checkProject(L, sample.map((a, i) => (i === 0 ? 'abc' : a)));
        bad.results[0].ok || bad.results[0].message !== E.uiString(lang, 'pmsg.invalid') ? fail(`Meldung für Text nicht übersetzt: ${bad.results[0].message}`) : ok(`Text abgelehnt: ${bad.results[0].message}`);
        console.log('');
        continue;
      }

      // Daten: jede Text-Zelle übersetzt (ausser Belegnummern und Datum), Formeltexte in terms
      const cellMap = { ...(tr.data || {}), ...(tr.terms || {}) };
      const allCells = [ex.data, ...(ex.alt || []).map((a) => a.data)].flat(2).filter((v) => typeof v === 'string' && v && !DATE.test(v) && !CODE.test(v));
      [...new Set(allCells)].forEach((v) => { if (!Object.prototype.hasOwnProperty.call(cellMap, v)) fail(`[${loc}] ${ex.id}: Zelle «${v}» ohne Übersetzung (data/terms)`); });
      Object.keys(tr.data || {}).forEach((k) => { if (!allCells.includes(k)) fail(`[${loc}] ${ex.id}: data «${k}» kommt in den Daten nicht vor`); });
      [L.data, ...(L.alt || []).map((a) => a.data)].flat(2).filter((v) => typeof v === 'string').forEach((v) => scan(ex.id + ' Zelle', v));
      [ex.solution, ...(ex.accept || [])].flatMap(literals).filter(hasLetters).forEach((lit) => {
        if (!Object.prototype.hasOwnProperty.call(tr.terms || {}, lit)) fail(`[${loc}] ${ex.id}: Formeltext "${lit}" fehlt in terms`);
      });
      // terms konsistent: was im deutschen Aufgabentext/Hinweis in Anführungszeichen steht, steht übersetzt auch dort
      Object.entries(tr.terms || {}).forEach(([k, v]) => {
        if (ex.task.includes(`"${k}"`) && !L.task.includes(`"${v}"`)) fail(`[${loc}] ${ex.id}: Aufgabe enthält "${v}" nicht (Original "${k}")`);
        Object.keys(ex.hints || {}).forEach((h) => {
          if (ex.hints[h].includes(`"${k}"`) && !L.hints[h].includes(`"${v}"`)) fail(`[${loc}] ${ex.id}: hints.${h} enthält "${v}" nicht`);
        });
      });
      // Musterlösung, accept, alt, Hardcoding
      E.datasets(L).forEach((data, i) => {
        const r = E.evaluate(HF, data, L.target, L.solution);
        const label = i === 0 ? 'data' : `alt[${i - 1}]`;
        if (r.error) fail(`${label}: solution liefert ${r.error.value} ${r.error.message}`);
        else ok(`${label}: solution = ${JSON.stringify(r.value)}`);
      });
      (L.alt || []).forEach((a, i) => {
        if (E.valuesEqual(E.evaluate(HF, L.data, L.target, L.solution).value, E.evaluate(HF, a.data, L.target, L.solution).value)) fail(`alt[${i}] liefert dasselbe Ergebnis wie data`);
      });
      const v = E.evaluate(HF, L.data, L.target, L.solution).value;
      const wantV = typeof chValue[ex.id] === 'string' && Object.prototype.hasOwnProperty.call(cellMap, chValue[ex.id]) ? cellMap[chValue[ex.id]] : chValue[ex.id];
      E.valuesEqual(v, wantV) ? ok(`gleiches Ergebnis wie CH (${JSON.stringify(v)})`) : fail(`${lang} ${JSON.stringify(v)} statt ${JSON.stringify(wantV)}`);
      const self = E.check(HF, L, L.solution);
      self.ok ? ok(`solution besteht check(): ${self.message}`) : fail(`solution besteht check() nicht: ${self.message}`);
      for (const acc of L.accept || []) {
        for (const [i, data] of E.datasets(L).entries()) {
          const a = E.evaluate(HF, data, L.target, acc);
          const b = E.evaluate(HF, data, L.target, L.solution);
          if (a.error) fail(`accept ${acc} liefert ${a.error.value} ${a.error.message}`);
          else if (!E.valuesEqual(a.value, b.value)) fail(`accept ${acc} = ${JSON.stringify(a.value)} statt ${JSON.stringify(b.value)} (Datensatz ${i})`);
        }
        const c = E.check(HF, L, acc);
        c.ok ? ok(`accept ${acc} besteht check()`) : fail(`accept ${acc} besteht check() nicht: ${c.message}`);
      }
      (L.alt || []).forEach((a, i) => {
        const r = E.check(HF, E.variant(L, i + 1), L.solution);
        r.ok ? ok(`variant alt[${i}]: solution besteht check()`) : fail(`variant alt[${i}]: solution besteht check() nicht: ${r.message}`);
      });
      const sol = E.evaluate(HF, L.data, L.target, L.solution).value;
      const hard = typeof sol === 'string' ? `="${sol}"` : typeof sol === 'boolean' ? (sol ? `=${N.TRUE}()` : `=${N.FALSE}()`) : `=${sol}`;
      const h = E.check(HF, L, hard);
      h.ok ? fail(`hartkodiert ${hard} wurde akzeptiert`) : ok(`hartkodiert ${hard} abgelehnt: ${h.message}`);
      // Die deutsche Musterlösung wird mit einem Hinweis auf den Namen in der Zielsprache abgelehnt
      if (L.solution !== ex.solution && E.findEnglish(ex.solution)) {
        const r = E.check(HF, L, ex.solution);
        !r.ok && r.message.includes(L.solution.match(/[A-ZÀ-Ý][A-ZÀ-Ý.]*(?=\()/)[0]) ? ok(`deutsche Lösung ${ex.solution} abgelehnt: ${r.message}`) : fail(`deutsche Lösung ${ex.solution} in ${lang}: ok=${r.ok} "${r.message}"`);
      }
      console.log('');
    }
    stats[lang] = { ui: uiCount, exercises: exCount, files: Object.keys(D.files || {}).length };
    console.log(`${N.lang}: ${uiCount} UI-Strings, ${exCount} Übungs-Strings, ${Object.keys(D.files || {}).length} Datei-Texte, ${count} Texte auf deutsche Reste geprüft`);
  }

  // Feedback-Regeln FR / IT
  const cases = {
    fr: [
      ['summe-1', 'SOMME(B2:B6)', false, 'commence toujours par ='],
      ['summe-1', '=SUM(B2:B6)', false, "En français, la fonction s'appelle SOMME (et non SUM)"],
      ['summe-1', '=SUMME(B2:B6)', false, "En français, la fonction s'appelle SOMME"],
      ['summe-1', '=SOMME(B2,B6)', false, 'tu sépares les arguments par ; et non par ,'],
      ['summe-1', '=SUM(B2,B6)', false, 'tu sépares les arguments par ;'],
      ['summe-1', '=somme(b2:b6)', true, ''],
      ['summe-1', '=SOMME(B2:B6)', true, ''],
      ['summe-1', '=SOMME(B2;B3;B4;B5;B6)', true, ''],
      ['summe-1', '=B2+B3+B4+B5+B6', false, 'utilise la fonction SOMME'],
      ['summe-1', '=38500', false, 'références de cellules'],
      ['summe-1', '=SOMME(B:B)', false, 'Référence circulaire'],
      ['mittelwert-1', '=AVERAGE(B2:B7)', false, 'MOYENNE'],
      ['mittelwert-1', '=MITTELWERT(B2:B7)', false, "s'appelle MOYENNE"],
      ['mittelwert-1', '=DURCHSCHNITT(B2:B7)', false, 'ne connaît pas la fonction DURCHSCHNITT'],
      ['wenn-1', '=IF(B2<=A2;"OK";"Dépassé")', false, "s'appelle SI"],
      ['wenn-1', '=WENN(B2<=A2;"OK";"Dépassé")', false, "s'appelle SI"],
      ['wenn-1', '=SI(B2<=A2;OK;Dépassé)', false, 'guillemets'],
      ['wenn-1', '=SI(A2>0;"OK";"Dépassé")', false, "d'autres valeurs"],
      ['wenn-1', '=SI(B2<=A2;„OK“;„Dépassé“)', true, ''],
      ['wenn-1', '=SI(B2<=A2;"OK";"Überzogen")', false, ''],
      ['zaehlenwenn-1', '=NB.SI(B2:B8;ouverte)', false, 'guillemets : "ouverte"'],
      ['zaehlenwenn-1', '=NB.SI(B2:B8;"ouverte")', true, ''],
      ['zaehlenwenn-1', '=NB.SI(B2:B8;"offen")', false, ''],
      ['zaehlenwenn-1', '=COUNTIF(B2:B8;"ouverte")', false, 'NB.SI'],
      ['zaehlenwenn-1', '=ZÄHLENWENN(B2:B8;"ouverte")', false, "s'appelle NB.SI"],
      ['summewenn-1', '=SOMME.SI(A2:A9;Est;B2:B9)', false, 'guillemets'],
      ['summewenn-1', '=SOMME.SI(A2:A9;D2;B2:B9)', true, ''],
      ['summewenn-2', '=SOMME.SI(A2:A7;>3;C2:C7)', false, '">3"'],
      ['summewenn-2', '=SUMIF(A2:A7,">3",C2:C7)', false, 'tu sépares les arguments par ;'],
      ['sverweis-1', '=RECHERCHEV(D2;A2:B6;2;FALSE)', false, 'tu écris FAUX au lieu de FALSE'],
      ['sverweis-1', '=RECHERCHEV(D2;A2:B6;2;FALSCH)', false, 'tu écris FAUX (FALSCH'],
      ['sverweis-1', '=RECHERCHEV(D2;A2:B6;2;FAUX)', true, ''],
      ['sverweis-1', '=RECHERCHEV(D2;A2:B6;2;0)', true, ''],
      ['sverweis-1', '=VLOOKUP(D2;A2:B6;2;0)', false, 'RECHERCHEV'],
      ['sverweis-1', '=SVERWEIS(D2;A2:B6;2;0)', false, "s'appelle RECHERCHEV"],
      ['runden-1', '=ROUND(A2;2)', false, 'ARRONDI'],
      ['runden-1', '=A2*1,5', false, 'point'],
      ['absolut-1', '=B2*F1', false, '$F$1'],
      ['absolut-1', '=B2*$F$1', true, ''],
      ['wennfehler-1', '=SIERREUR(A2/B2;"n.d.")', true, ''],
      ['wennfehler-1', '=IFERROR(A2/B2;"n.d.")', false, 'SIERREUR'],
      ['wennfehler-1', '=A2/B2', false, ''],
      ['textkette-1', '=CONCAT(A2;" ";B2)', true, ''],
      ['textkette-1', '=CONCATENER(A2;" ";B2)', true, ''],
      ['textkette-1', '=TEXTKETTE(A2;" ";B2)', false, "s'appelle CONCAT"],
      ['summenprodukt-1', '=SUMPRODUCT(A2:A6;B2:B6)', false, 'SOMMEPROD'],
      ['wenn-verschachtelt-1', '=SI(A2>0.8;"élevé";SI(A2>0.5;"moyen";"faible"))', true, ''],
      ['wenn-verschachtelt-1', '=SI(A2>0.8;"élevé";"moyen")', false, ''],
      ['acc-abweichung-1', '=B2-C2', false, 'réel − budget'],
      ['acc-anteil-1', '=B2/B6', false, '$B$6'],
      ['acc-mwst-1', '=B2*(1-$F$1)', false, 'Net à partir du brut'],
      ['acc-rundung-1', '=ARRONDI.AU.MULTIPLE(B2;0.05)', true, ''],
      ['acc-rundung-1', '=ARRONDI(B2;1)', false, ''],
      ['acc-summewenns-1', '=SOMME.SI(A2:A9;"Marketing";C2:C9)', false, 'SOMME.SI.ENS'],
      ['acc-summewenns-1', '=SOMME.SI.ENS(C2:C9;A2:A9;E2;B2:B9;F2)', true, ''],
      ['acc-sollhaben-1', '=SI(SOMME(B2:B6)=SOMME(C2:C6);"OK";"Écart")', false, 'ARRONDI'],
      ['acc-alterung-1', '=SI(JOURS($H$1;B2)<=30;"0-30";SI(JOURS($H$1;B2)<=60;"31-60";">60"))', true, ''],
      ['acc-abgrenzung-1', '=FIN.MOIS(MOIS.DECALER(B2;C2);0)', true, ''],
      ['acc-abgrenzung-1', '=MONATSENDE(EDATUM(B2;C2);0)', false, 'FIN.MOIS'],
      ['fin-rmz-1', '=-VPM(B2/12;C2*12;A2)', true, ''],
      ['fin-rmz-1', '=-RMZ(B2/12;C2*12;A2)', false, "s'appelle VPM"],
      ['fin-bw-1', '=-VA(B2;C2;A2)', true, ''],
      ['fin-zw-1', '=VC(B2;C2;-A2)', true, ''],
      ['fin-schadenquote-1', '=MOYENNE(C2:C5)/MOYENNE(B2:B5)', false, 'SOMME'],
      ['fin-breakeven-1', '=ARRONDI.SUP(A2/(B2-C2);0)', true, ''],
      ['fin-cashflow-1', '=SOMME(B3:B3)+C2', true, ''],
    ],
    it: [
      ['summe-1', 'SOMMA(B2:B6)', false, 'inizia sempre con ='],
      ['summe-1', '=SUM(B2:B6)', false, 'In italiano la funzione si chiama SOMMA (non SUM)'],
      ['summe-1', '=SUMME(B2:B6)', false, 'In italiano la funzione si chiama SOMMA'],
      ['summe-1', '=SOMMA(B2,B6)', false, 'separi gli argomenti con ; e non con ,'],
      ['summe-1', '=SUM(B2,B6)', false, 'separi gli argomenti con ;'],
      ['summe-1', '=somma(b2:b6)', true, ''],
      ['summe-1', '=SOMMA(B2:B6)', true, ''],
      ['summe-1', '=B2+B3+B4+B5+B6', false, 'usa la funzione SOMMA'],
      ['summe-1', '=38500', false, 'riferimenti di cella'],
      ['summe-1', '=SOMMA(B:B)', false, 'Riferimento circolare'],
      ['mittelwert-1', '=AVERAGE(B2:B7)', false, 'MEDIA'],
      ['mittelwert-1', '=MITTELWERT(B2:B7)', false, 'si chiama MEDIA'],
      ['wenn-1', '=IF(B2<=A2;"OK";"Sforato")', false, 'si chiama SE'],
      ['wenn-1', '=SE(B2<=A2;OK;Sforato)', false, 'virgolette'],
      ['wenn-1', '=SE(A2>0;"OK";"Sforato")', false, 'altri valori'],
      ['wenn-1', '=SE(B2<=A2;„OK“;„Sforato“)', true, ''],
      ['zaehlenwenn-1', '=CONTA.SE(B2:B8;aperta)', false, 'virgolette: "aperta"'],
      ['zaehlenwenn-1', '=CONTA.SE(B2:B8;"aperta")', true, ''],
      ['zaehlenwenn-1', '=COUNTIF(B2:B8;"aperta")', false, 'CONTA.SE'],
      ['zaehlenwenn-1', '=ZÄHLENWENN(B2:B8;"aperta")', false, 'si chiama CONTA.SE'],
      ['summewenn-1', '=SOMMA.SE(A2:A9;Est;B2:B9)', false, 'virgolette'],
      ['summewenn-2', '=SOMMA.SE(A2:A7;>3;C2:C7)', false, '">3"'],
      ['summewenn-2', '=SUMIF(A2:A7,">3",C2:C7)', false, 'separi gli argomenti con ;'],
      ['sverweis-1', '=CERCA.VERT(D2;A2:B6;2;FALSE)', false, 'scrivi FALSO invece di FALSE'],
      ['sverweis-1', '=CERCA.VERT(D2;A2:B6;2;FALSO)', true, ''],
      ['sverweis-1', '=cerca.vert(d2;a2:b6;2;falso)', true, ''],
      ['sverweis-1', '=VLOOKUP(D2;A2:B6;2;0)', false, 'CERCA.VERT'],
      ['sverweis-1', '=SVERWEIS(D2;A2:B6;2;0)', false, 'si chiama CERCA.VERT'],
      ['runden-1', '=ROUND(A2;2)', false, 'ARROTONDA'],
      ['runden-1', '=A2*1,5', false, 'punto'],
      ['absolut-1', '=B2*$F$1', true, ''],
      ['wennfehler-1', '=SE.ERRORE(A2/B2;"n.d.")', true, ''],
      ['textkette-1', '=CONCAT(A2;" ";B2)', true, ''],
      ['textkette-1', '=CONCATENA(A2;" ";B2)', true, ''],
      ['summenprodukt-1', '=MATR.SOMMA.PRODOTTO(A2:A6;B2:B6)', true, ''],
      ['summenprodukt-1', '=SUMMENPRODUKT(A2:A6;B2:B6)', false, 'MATR.SOMMA.PRODOTTO'],
      ['wenn-verschachtelt-1', '=SE(A2>0.8;"alto";SE(A2>0.5;"medio";"basso"))', true, ''],
      ['acc-abweichung-1', '=B2-C2', false, 'consuntivo − budget'],
      ['acc-mwst-1', '=B2*(1-$F$1)', false, 'Netto dal lordo'],
      ['acc-rundung-1', '=ARROTONDA.MULTIPLO(B2;0.05)', true, ''],
      ['acc-summewenns-1', '=SOMMA.SE(A2:A9;"Marketing";C2:C9)', false, 'SOMMA.PIÙ.SE'],
      ['acc-summewenns-1', '=somma.più.se(C2:C9;A2:A9;E2;B2:B9;F2)', true, ''],
      ['acc-sollhaben-1', '=SE(SOMMA(B2:B6)=SOMMA(C2:C6);"OK";"Differenza")', false, 'ARROTONDA'],
      ['acc-alterung-1', '=SE(GIORNI($H$1;B2)<=30;"0-30";SE(GIORNI($H$1;B2)<=60;"31-60";">60"))', true, ''],
      ['acc-abgrenzung-1', '=FINE.MESE(DATA.MESE(B2;C2);0)', true, ''],
      ['fin-rmz-1', '=-RATA(B2/12;C2*12;A2)', true, ''],
      ['fin-rmz-1', '=-RMZ(B2/12;C2*12;A2)', false, 'si chiama RATA'],
      ['fin-bw-1', '=VA(B2;C2;-A2)', true, ''],
      ['fin-zw-1', '=-VAL.FUT(B2;C2;A2)', true, ''],
      ['fin-schadenquote-1', '=MEDIA(C2:C5)/MEDIA(B2:B5)', false, 'SOMMA'],
      ['fin-breakeven-1', '=ARROTONDA.PER.ECC(A2/(B2-C2);0)', true, ''],
    ],
  };
  for (const lang of ['fr', 'it']) {
    const loc = lang + '-CH';
    E.setLocale(loc);
    console.log(`\nFeedback-Regeln (${loc})`);
    const byLoc = Object.fromEntries(exercises.map((e) => [e.id, E.localize(e, loc)]));
    for (const [id, formula, expectOk, expectMsg] of cases[lang]) {
      const r = E.check(HF, byLoc[id], formula);
      const good = r.ok === expectOk && (!expectMsg || r.message.includes(expectMsg));
      good ? ok(`${id} ${formula} -> ${r.message}`) : fail(`[${loc}] ${id} ${formula} -> ok=${r.ok} "${r.message}" (erwartet ok=${expectOk}, "${expectMsg}")`);
    }
    // Daten und Formeln wie im Browser-Test
    const s1 = byLoc['summe-1'];
    eq(`${s1.data[0][0]} / ${s1.data[0][1]}`, lang === 'fr' ? "Succursale / Chiffre d'affaires CHF" : 'Filiale / Fatturato CHF', `summe-1 ${lang} Kopfzeile`);
    eq(E.formatValue(s1.data[1][1]), "12'500", `summe-1 ${lang} Anzeige B2 (Hochkomma)`);
    eq(E.formatValue(true), lang === 'fr' ? 'VRAI' : 'VERO', `formatValue(true) ${lang}`);
    eq(byLoc['acc-abstimmung-1'].solution, lang === 'fr' ? '=SIERREUR(RECHERCHEV(A2;$E$2:$F$7;2;FAUX);"manquant")' : '=SE.ERRORE(CERCA.VERT(A2;$E$2:$F$7;2;FALSO);"mancante")', `acc-abstimmung-1 ${lang} solution`);
    eq(byLoc['acc-sollhaben-1'].mustContain.join(','), lang === 'fr' ? 'ARRONDI,SOMME' : 'ARROTONDA,SOMMA', `acc-sollhaben-1 ${lang} mustContain`);
    eq(E.convertFormulaLocale('=WENN(A1="SUMME(1)";WAHR;FALSCH())', 'de-CH', loc), lang === 'fr' ? '=SI(A1="SUMME(1)";VRAI;FAUX())' : '=SE(A1="SUMME(1)";VERO;FALSO())', `convertFormulaLocale Text bleibt, ${lang}`);
    eq(E.convertFormulaLocale(lang === 'fr' ? '=SOMME.SI.ENS(C2:C9;A2:A9;"x")' : '=SOMMA.PIÙ.SE(C2:C9;A2:A9;"x")', loc, 'de-CH'), '=SUMMEWENNS(C2:C9;A2:A9;"x")', `convertFormulaLocale ${lang} → de-CH`);
    eq(E.enMap(lang).SUM, lang === 'fr' ? 'SOMME' : 'SOMMA', `EN_TO_${lang.toUpperCase()}.SUM aus Sprachpaket`);
    eq(E.hasUnquotedCriterion(lang === 'fr' ? '=NB.SI(B2:B8;ouverte)' : '=CONTA.SE(B2:B8;aperta)'), true, `hasUnquotedCriterion ${lang}`);
    eq(E.parseAnswer("1'234.50").value, 1234.5, `parseAnswer ${lang} 1'234.50`);
    eq(E.formatNumber(1234.5), "1'234.5", `formatNumber ${lang}`);
  }
  E.setLocale('de-CH');
  console.log(`\nÜbersetzte Strings: FR ${stats.fr.ui} UI + ${stats.fr.exercises} Übungen + ${stats.fr.files} Dateien, IT ${stats.it.ui} UI + ${stats.it.exercises} Übungen + ${stats.it.files} Dateien`);
}
