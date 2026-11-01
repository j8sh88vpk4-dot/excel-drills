// Prüft app/assessments.json mit derselben Engine wie die App (DE-CH): Musterlösung, alt-Datensätze,
// accept-Varianten, Kategorien, Punkte und die verlinkten Gratis-Übungen für den 7-Tage-Plan.
// Zusätzlich ein paar typische Fehlformeln gegen app/errors.js (Fehlerkategorie).
// Aufruf: node scripts/check-assessments.mjs   (Teil von npm run check)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// Browser-ähnlicher Kontext: HyperFormula-Bundle + deDE + app/engine.js + app/errors.js
const ctx = { console };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(read('node_modules/hyperformula/dist/hyperformula.full.min.js'), ctx);
vm.runInContext(read('node_modules/hyperformula/dist/languages/deDE.js'), ctx);
vm.runInContext(read('app/engine.js'), ctx);
vm.runInContext(read('app/errors.js'), ctx);

const HF = ctx.HyperFormula;
const E = ctx.ExcelDrillsEngine;
const ERR = ctx.ExcelDrillsErrors;
E.init(HF);
E.setLocale('de-CH');

let failures = 0;
const fail = (msg) => { failures++; console.log('  FEHLER ' + msg); };
const ok = (msg) => console.log('  ok     ' + msg);

const json = JSON.parse(read('app/assessments.json'));
const exercises = JSON.parse(read('app/exercises.json')).exercises;
const exById = Object.fromEntries(exercises.map((e) => [e.id, e]));

if (json.version !== 1) fail('version muss 1 sein');
const list = json.assessments || [];
if (!list.length) fail('keine Assessments');
console.log(`HyperFormula ${HF.version}, ${list.length} Assessments\n`);

const ids = new Set();
for (const as of list) {
  console.log(`${as.id}: ${as.title}`);
  for (const k of ['id', 'role', 'title', 'intro']) if (typeof as[k] !== 'string' || !as[k].trim()) fail(`Feld ${k} fehlt`);
  if (!(as.minutes > 0)) fail('minutes muss > 0 sein');
  if (typeof as.free !== 'boolean') fail('free muss true/false sein');
  if (!Array.isArray(as.tasks) || as.tasks.length !== 5) fail('genau 5 Aufgaben erwartet');
  if (/[—–]/.test(JSON.stringify(as))) fail('Em-/En-Dash im Text (bitte Komma, Punkt oder Doppelpunkt)');
  if (/ß/.test(JSON.stringify(as))) fail('ß im Text (Schweizer Schreibweise: ss)');

  // Kategorien und verlinkte Übungen
  const cats = as.categories || {};
  for (const c of ERR.CATEGORIES) {
    const exs = (cats[c] && cats[c].exercises) || [];
    if (!exs.length) fail(`categories.${c}: keine Übungen für den 7-Tage-Plan`);
    for (const id of exs) {
      if (!exById[id]) fail(`categories.${c}: Übung ${id} gibt es nicht`);
      else if (!exById[id].free) fail(`categories.${c}: Übung ${id} ist nicht gratis`);
    }
  }
  for (const c of Object.keys(cats)) if (!ERR.isCategory(c)) fail(`categories: unbekannte Kategorie ${c}`);

  for (const ex of as.tasks || []) {
    const label = `${ex.id} (${ex.category})`;
    if (ids.has(ex.id)) fail(`${label}: ID doppelt`);
    ids.add(ex.id);
    if (exById[ex.id]) fail(`${label}: ID kollidiert mit exercises.json`);
    if (!ERR.isCategory(ex.category)) fail(`${label}: category ungültig`);
    if (ex.points !== 20) fail(`${label}: points muss 20 sein`);
    for (const k of ['title', 'task', 'target', 'solution']) if (typeof ex[k] !== 'string' || !ex[k].trim()) fail(`${label}: Feld ${k} fehlt`);
    if (!ex.hints || !ex.hints.generic) fail(`${label}: hints.generic fehlt`);
    if (!Array.isArray(ex.alt) || !ex.alt.length) fail(`${label}: alt-Datensatz fehlt`);
    if (/,/.test(ex.solution.replace(/"[^"]*"/g, ''))) fail(`${label}: Komma in der Musterlösung (Semikolon verwenden)`);

    // 1) Musterlösung besteht check() auf data und auf jedem alt-Datensatz (als Hauptdatensatz)
    const datasets = E.datasets(ex);
    datasets.forEach((d, i) => {
      const v = E.variant(ex, i);
      const r = E.evaluate(HF, v.data, ex.target, ex.solution);
      if (r.error) { fail(`${label}: Musterlösung liefert ${r.error.value} (Datensatz ${i})`); return; }
      const c = E.check(HF, v, ex.solution);
      c.ok ? ok(`${label}: Musterlösung = ${E.formatValue(r.value)} (Datensatz ${i})`) : fail(`${label}: Musterlösung besteht check() nicht (Datensatz ${i}): ${c.message}`);
    });
    // alt muss sich vom Hauptdatensatz unterscheiden (sonst prüft er nichts)
    const main = E.evaluate(HF, ex.data, ex.target, ex.solution);
    for (let i = 0; i < ex.alt.length; i++) {
      const a = E.evaluate(HF, ex.alt[i].data, ex.target, ex.solution);
      if (!a.error && E.valuesEqual(a.value, main.value)) fail(`${label}: alt ${i + 1} liefert dasselbe Ergebnis wie data`);
    }

    // 2) Festgetipptes Ergebnis darf nicht bestehen
    if (typeof main.value === 'number') {
      const hard = E.check(HF, ex, '=' + String(main.value));
      hard.ok ? fail(`${label}: festgetipptes Ergebnis besteht`) : ok(`${label}: festgetipptes Ergebnis abgelehnt`);
    } else if (typeof main.value === 'string') {
      const hard = E.check(HF, ex, '=WENN(A1=A1;"' + main.value + '";"' + main.value + '")');
      hard.ok ? fail(`${label}: fester Text besteht`) : ok(`${label}: fester Text abgelehnt`);
    }

    // 3) accept-Varianten
    for (const acc of ex.accept || []) {
      datasets.forEach((d, i) => {
        const a = E.evaluate(HF, d, ex.target, acc);
        const b = E.evaluate(HF, d, ex.target, ex.solution);
        if (a.error) fail(`${label}: accept ${acc} liefert ${a.error.value} (Datensatz ${i})`);
        else if (!E.valuesEqual(a.value, b.value)) fail(`${label}: accept ${acc} = ${JSON.stringify(a.value)} statt ${JSON.stringify(b.value)} (Datensatz ${i})`);
      });
      const c = E.check(HF, ex, acc);
      c.ok ? ok(`${label}: accept ${acc}`) : fail(`${label}: accept ${acc} besteht check() nicht: ${c.message}`);
    }

    // 4) errors.js: richtige Lösung ergibt die Aufgaben-Kategorie, Überspringen ebenso
    const good = ERR.classify(E.check(HF, ex, ex.solution), ex.solution, ex);
    if (good.category !== ex.category) fail(`${label}: classify(ok) liefert ${good.category}`);
    const skip = ERR.classify(null, '', ex);
    if (skip.category !== ex.category || !skip.tip) fail(`${label}: classify(übersprungen) liefert ${skip.category}`);
  }
  console.log('');
}

// Typische Fehlformeln: erwartete Kategorie aus errors.js
const all = Object.fromEntries(list.flatMap((a) => a.tasks).map((t) => [t.id, t]));
const cases = [
  ['as-con-1', '=B2*B3*B4', 'bezug'],
  ['as-con-1', '=8900000*0.12*85', 'bezug'],
  ['as-con-2', '=SUMMEWENN(A2:A7,E2,C2:C7)', 'syntax'],
  ['as-con-2', '=SUMIF(A2:A7;E2;C2:C7)', 'syntax'],
  ['as-con-2', '=SUMMEWENN(A2:A7;"Pendler";C2:C7)', 'lookup'],
  ['as-con-3', '=B2/B3-B4', 'modell'],
  ['as-con-4', '=WENN(B5<B7;"Ja";"Nein")', 'logik'],
  ['as-con-5', '=B3/B2^(1/B4)-1', 'syntax'],
  ['as-acc-1', '=SUMMEWENN(D2:D7;offen;C2:C7)', 'lookup'],
  ['as-acc-2', '=B2/(1+F1)', 'bezug'],
  ['as-acc-3', '=B2*(1+B3)', 'rundung'],
  ['as-acc-4', '=(C2-B2)/B2*100', 'modell'],
  ['as-acc-5', '=WENN(SUMME(B2:B4)=SUMME(C2:C4);"OK";"Differenz")', 'rundung']
];
console.log('Fehlerkategorien (errors.js)');
for (const [id, f, want] of cases) {
  const ex = all[id];
  if (!ex) { fail(`Testfall: Aufgabe ${id} fehlt`); continue; }
  const r = E.check(HF, ex, f);
  if (r.ok) { fail(`${id}: Fehlformel ${f} besteht check()`); continue; }
  const c = ERR.classify(r, f, ex);
  c.category === want ? ok(`${id}: ${f} → ${c.category}`) : fail(`${id}: ${f} → ${c.category} statt ${want} (${r.message})`);
}

console.log(failures ? `\n${failures} Fehler` : '\nAlle Assessments in Ordnung.');
process.exit(failures ? 1 : 0);
