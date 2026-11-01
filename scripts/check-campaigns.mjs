// Prüft app/campaigns.json mit derselben Engine wie die App (DE-CH): Aufbau jeder Kampagne,
// Musterlösung pro Tag, alt-Datensätze (anderes Ergebnis), accept-Varianten, festgetippte Ergebnisse
// und Schreibweise (kein ß, keine Em-/En-Dashes). Dazu typische Fehlformeln, die nicht bestehen dürfen.
// Aufruf: node scripts/check-campaigns.mjs   (Teil von npm run check)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

// Browser-ähnlicher Kontext: HyperFormula-Bundle + deDE + app/engine.js + app/errors.js (für die Kategorien)
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

const json = JSON.parse(read('app/campaigns.json'));
const exIds = new Set(JSON.parse(read('app/exercises.json')).exercises.map((e) => e.id));
const asIds = new Set(JSON.parse(read('app/assessments.json')).assessments.flatMap((a) => a.tasks.map((t) => t.id)));

if (json.version !== 1) fail('version muss 1 sein');
const list = json.campaigns || [];
if (!list.length) fail('keine Kampagnen');
console.log(`HyperFormula ${HF.version}, ${list.length} Kampagne(n)\n`);

// Erwartete Tage und Gratis-Grenze der ersten Kampagne
const EXPECT_DAYS = { 'controlling-monat-1': [1, 2, 3, 5, 8, 12, 16, 20] };
const FREE_UNTIL = 3;

const campaignIds = new Set();
const taskIds = new Set();
for (const cp of list) {
  console.log(`${cp.id}: ${cp.title} (${cp.firma})`);
  if (campaignIds.has(cp.id)) fail(`Kampagnen-ID ${cp.id} doppelt`);
  campaignIds.add(cp.id);
  for (const k of ['id', 'title', 'firma', 'intro']) if (typeof cp[k] !== 'string' || !cp[k].trim()) fail(`Feld ${k} fehlt`);
  const text = JSON.stringify(cp);
  if (/[—–]/.test(text)) fail('Em-/En-Dash im Text (bitte Komma, Punkt oder Doppelpunkt)');
  if (/ß/.test(text)) fail('ß im Text (Schweizer Schreibweise: ss)');

  const days = cp.days || [];
  const nums = days.map((d) => d.day);
  if (EXPECT_DAYS[cp.id] && JSON.stringify(nums) !== JSON.stringify(EXPECT_DAYS[cp.id])) fail(`Tage ${nums.join(',')} statt ${EXPECT_DAYS[cp.id].join(',')}`);
  for (let i = 1; i < nums.length; i++) if (!(nums[i] > nums[i - 1])) fail('Tage müssen aufsteigend sein');

  for (const d of days) {
    const ex = d.exercise || {};
    const label = `Tag ${d.day} ${ex.id} (${ex.category})`;
    // Rahmen pro Tag
    if (typeof d.free !== 'boolean') fail(`${label}: free muss true/false sein`);
    else if (d.free !== (d.day <= FREE_UNTIL)) fail(`${label}: free muss ${d.day <= FREE_UNTIL} sein (Tage 1 bis ${FREE_UNTIL} gratis)`);
    if (!['Herr Steiner', 'Nadine'].includes(d.from)) fail(`${label}: from muss «Herr Steiner» oder «Nadine» sein`);
    for (const k of ['story', 'learned']) if (typeof d[k] !== 'string' || !d[k].trim()) fail(`${label}: Feld ${k} fehlt`);
    const sentences = (d.story || '').split(/[.!?](\s|$)/).filter((s) => s && s.trim()).length;
    if (sentences < 2 || sentences > 3) fail(`${label}: Story hat ${sentences} Sätze (2 bis 3 erwartet)`);

    // Aufgabe im exercises.json-Format
    if (taskIds.has(ex.id)) fail(`${label}: ID doppelt`);
    taskIds.add(ex.id);
    if (exIds.has(ex.id)) fail(`${label}: ID kollidiert mit exercises.json`);
    if (asIds.has(ex.id)) fail(`${label}: ID kollidiert mit assessments.json`);
    if (!ERR.isCategory(ex.category)) fail(`${label}: category ungültig`);
    for (const k of ['title', 'task', 'target', 'solution']) if (typeof ex[k] !== 'string' || !ex[k].trim()) fail(`${label}: Feld ${k} fehlt`);
    if (!ex.hints || !ex.hints.generic) fail(`${label}: hints.generic fehlt`);
    if (!Array.isArray(ex.alt) || !ex.alt.length) fail(`${label}: alt-Datensatz fehlt`);
    if (/,/.test(String(ex.solution).replace(/"[^"]*"/g, ''))) fail(`${label}: Komma in der Musterlösung (Semikolon verwenden)`);
    if (!Array.isArray(ex.data) || !ex.data.length) { fail(`${label}: data fehlt`); continue; }

    // 1) Musterlösung besteht check() auf data und auf jedem alt-Datensatz (als Hauptdatensatz)
    const datasets = E.datasets(ex);
    datasets.forEach((data, i) => {
      const v = E.variant(ex, i);
      const r = E.evaluate(HF, v.data, ex.target, ex.solution);
      if (r.error) { fail(`${label}: Musterlösung liefert ${r.error.value} (Datensatz ${i})`); return; }
      const c = E.check(HF, v, ex.solution);
      c.ok ? ok(`${label}: Musterlösung = ${E.formatValue(r.value)} (Datensatz ${i})`) : fail(`${label}: Musterlösung besteht check() nicht (Datensatz ${i}): ${c.message}`);
    });

    // 2) alt muss ein anderes Ergebnis liefern (sonst prüft er nichts)
    const main = E.evaluate(HF, ex.data, ex.target, ex.solution);
    for (let i = 0; i < ex.alt.length; i++) {
      const a = E.evaluate(HF, ex.alt[i].data, ex.target, ex.solution);
      if (!a.error && E.valuesEqual(a.value, main.value)) fail(`${label}: alt ${i + 1} liefert dasselbe Ergebnis wie data`);
      else if (!a.error) ok(`${label}: alt ${i + 1} = ${E.formatValue(a.value)} (anders als data)`);
    }

    // 3) Festgetipptes Ergebnis darf nicht bestehen
    if (typeof main.value === 'number') {
      const hard = E.check(HF, ex, '=' + String(main.value));
      hard.ok ? fail(`${label}: festgetipptes Ergebnis besteht`) : ok(`${label}: festgetipptes Ergebnis abgelehnt`);
    } else if (typeof main.value === 'string') {
      const hard = E.check(HF, ex, '=WENN(A1=A1;"' + main.value + '";"' + main.value + '")');
      hard.ok ? fail(`${label}: fester Text besteht`) : ok(`${label}: fester Text abgelehnt`);
    }

    // 4) accept-Varianten: gleiches Ergebnis auf allen Datensätzen und check() besteht
    for (const acc of ex.accept || []) {
      datasets.forEach((data, i) => {
        const a = E.evaluate(HF, data, ex.target, acc);
        const b = E.evaluate(HF, data, ex.target, ex.solution);
        if (a.error) fail(`${label}: accept ${acc} liefert ${a.error.value} (Datensatz ${i})`);
        else if (!E.valuesEqual(a.value, b.value)) fail(`${label}: accept ${acc} = ${JSON.stringify(a.value)} statt ${JSON.stringify(b.value)} (Datensatz ${i})`);
      });
      const c = E.check(HF, ex, acc);
      c.ok ? ok(`${label}: accept ${acc}`) : fail(`${label}: accept ${acc} besteht check() nicht: ${c.message}`);
    }
  }
  console.log('');
}

// Typische Fehlformeln: dürfen check() nicht bestehen
const all = Object.fromEntries(list.flatMap((c) => c.days).map((d) => [d.exercise.id, d.exercise]));
const wrong = [
  ['kmp-ctl-1', '=ZÄHLENWENN(D2:D9;offen)'],
  ['kmp-ctl-1', '=ANZAHL2(D2:D9)'],
  ['kmp-ctl-2', '=SUMMEWENN(B2:B9;"Transport";D2:D9)'],
  ['kmp-ctl-2', '=SUMIF(B2:B9;F2;D2:D9)'],
  ['kmp-ctl-3', '=(B2-G1)/G1'],
  ['kmp-ctl-3', '=B2-$G$1/$G$1'],
  ['kmp-ctl-5', '=B2*(1-$F$1)'],
  ['kmp-ctl-5', '=B2/1.081+$F$1*0'],
  ['kmp-ctl-8', '=B2*B3*(1+B4)'],
  ['kmp-ctl-8', '=VRUNDEN(B2*B3;0.05)*(1+B4)'],
  ['kmp-ctl-12', '=WENN(ZÄHLENWENN(A2:A9;A2)>1;"Doppelt";"OK")'],
  ['kmp-ctl-12', '=WENN(ZÄHLENWENN($A$2:$A$9;A2)>0;"Doppelt";"OK")'],
  ['kmp-ctl-16', '=WENN(C2>B2;"Ja";"Nein")'],
  ['kmp-ctl-16', '=WENN(MONATSENDE(C2;0)>B2;"Ja";"Nein")'],
  ['kmp-ctl-20', '=B2*(1+B3*B4)'],
  ['kmp-ctl-20', '=B2*1+B3^B4']
];
console.log('Fehlformeln');
for (const [id, f] of wrong) {
  const ex = all[id];
  if (!ex) { fail(`Testfall: Aufgabe ${id} fehlt`); continue; }
  const r = E.check(HF, ex, f);
  r.ok ? fail(`${id}: Fehlformel ${f} besteht check()`) : ok(`${id}: ${f} abgelehnt («${r.message}»)`);
}

console.log(failures ? `\n${failures} Fehler` : '\nAlle Kampagnen in Ordnung.');
process.exit(failures ? 1 : 0);
