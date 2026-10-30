// Berechnet die Ergebnisse der Musterlösungen aus app/exercises.json mit derselben Engine wie die App
// (HyperFormula deDE + app/engine.js). Ausgabe: JSON {id: wert} auf stdout. Wird von build.py aufgerufen.
// Optional: weitere Formeln prüfen mit  node results.mjs --eval '<json [[data], "B2", "=FORMEL"]>'
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const ctx = { console };
ctx.window = ctx; ctx.self = ctx;
vm.createContext(ctx);
vm.runInContext(read('node_modules/hyperformula/dist/hyperformula.full.min.js'), ctx);
vm.runInContext(read('node_modules/hyperformula/dist/languages/deDE.js'), ctx);
vm.runInContext(read('app/engine.js'), ctx);
const HF = ctx.HyperFormula;
const E = ctx.ExcelDrillsEngine;
E.init(HF);

const out = {};
const i = process.argv.indexOf('--eval');
if (i !== -1) {
  for (const [data, target, formula] of JSON.parse(process.argv[i + 1])) {
    const r = E.evaluate(HF, data, target, formula);
    out[formula] = r.error ? String(r.error.value) : r.value;
  }
} else {
  for (const ex of JSON.parse(read('app/exercises.json')).exercises) {
    if (ex.type === 'project') continue; // Projekt-Übungen haben keine Formel
    const r = E.evaluate(HF, ex.data, ex.target, ex.solution);
    out[ex.id] = r.error ? String(r.error.value) : r.value;
  }
}
process.stdout.write(JSON.stringify(out));
