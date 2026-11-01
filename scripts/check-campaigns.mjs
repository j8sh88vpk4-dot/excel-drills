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

// CAMPAIGNS_FILE=pfad: eine andere Datei prüfen (z. B. Entwurf einer neuen Kampagne)
const json = JSON.parse(process.env.CAMPAIGNS_FILE ? readFileSync(process.env.CAMPAIGNS_FILE, 'utf8') : read('app/campaigns.json'));
const exIds = new Set(JSON.parse(read('app/exercises.json')).exercises.map((e) => e.id));
const asIds = new Set(JSON.parse(read('app/assessments.json')).assessments.flatMap((a) => a.tasks.map((t) => t.id)));

if (json.version !== 1) fail('version muss 1 sein');
const list = json.campaigns || [];
if (!list.length) fail('keine Kampagnen');
console.log(`HyperFormula ${HF.version}, ${list.length} Kampagne(n)\n`);

// Erwartete Tage und Gratis-Grenze der ersten Kampagne
const EXPECT_DAYS = {
  'controlling-monat-1': [1, 2, 3, 5, 8, 12, 16, 20],
  'siz-au4': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  'siz-pu41': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'mos-excel-associate': [1, 2, 3, 4, 5, 6, 7, 8],
  'mos-excel-expert': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};
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
    // Erzählfiguren pro Kampagne (Zertifikatskurse: je eine Kursleitung)
    const FROM = { 'controlling-monat-1': ['Herr Steiner', 'Nadine'], 'siz-au4': ['Frau Brunner'], 'siz-pu41': ['Herr Weber'], 'mos-excel-associate': ['Frau Keller'], 'mos-excel-expert': ['Herr Marti'] }[cp.id] || [];
    if (!FROM.includes(d.from)) fail(`${label}: from muss ${FROM.join(' oder ')} sein`);
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
  ['kmp-ctl-20', '=B2*1+B3^B4'],
  // Zertifikatskurse (SIZ AU4/PU41, MOS MO-210/MO-211)
  ['siz-au4-1', '=B2+C2-D2*E2'], ['siz-au4-1', '=(B2+C2+D2)*E2'],
  ['siz-au4-2', '=B2*(1-C2)*(1+$G$1)'], ['siz-au4-2', '=RUNDEN(B2*(1-C2)*(1+$G$1);2)'], ['siz-au4-2', '=VRUNDEN(B2*C2*(1+$G$1);0.05)'],
  ['siz-au4-3', '=$B$3*(1-C$2)'], ['siz-au4-3', '=B3*(1-C2)'], ['siz-au4-3', '=$B3*(1-$C$2)'], ['siz-au4-3', '=$B3-$B3*C$2'],
  ['siz-au4-4', '=WURZEL(B2/PI())'], ['siz-au4-4', '=2*WURZEL(B2)/PI()'], ['siz-au4-4', '=2*WURZEL(B2/3.14)'],
  ['siz-au4-5', '=C2-B2-D2'], ['siz-au4-5', '=(C2-B2)*24-D2'],
  ['siz-au4-6', '=A2&B2&C2&D2&E2'], ['siz-au4-6', '=A2&" "&B2&" "&C2'],
  ['siz-au4-7', '=ABRUNDEN(SUMME(C2:C11)/10;0)'], ['siz-au4-7', '=RUNDEN(MITTELWERT(C2:C11);0)'], ['siz-au4-7', '=ABRUNDEN(SUMME(C2:C11)/ANZAHL2(A2:A11);0)'],
  ['siz-au4-8', '=SUMMEWENN(B2:B11;F2;D2:D11)'], ['siz-au4-8', '=SUMMEWENNS(D2:D11;B2:B11;"Bäckerei Gerber";C2:C11;"offen")'],
  ['siz-au4-9', '=WENN(DATEDIF(B2;HEUTE();"Y")>=5;"Silber";WENN(DATEDIF(B2;HEUTE();"Y")>=10;"Gold";"keine"))'], ['siz-au4-9', '=WENN(JAHR(HEUTE())-JAHR(B2)>=10;"Gold";WENN(JAHR(HEUTE())-JAHR(B2)>=5;"Silber";"keine"))'],
  ['siz-au4-10', '=WENN(G2>SVERWEIS(F2;A2:D9;4;FALSCH);"Zahlung";"Ablehnung")'], ['siz-au4-10', '=WENN(SVERWEIS(F2;A2:D9;3;FALSCH)="aktiv";"Zahlung";"Ablehnung")'], ['siz-au4-10', '=WENN(ODER(SVERWEIS(F2;A2:D9;3;FALSCH)="aktiv";G2>SVERWEIS(F2;A2:D9;4;FALSCH));"Zahlung";"Ablehnung")'],
  ['siz-pu41-1', '=WENNS(C2>0;"1. Mahnung";C2>30;"2. Mahnung";C2>60;"3. Mahnung";WAHR;"keine")'], ['siz-pu41-1', '=WENN(C2>60;"3. Mahnung";WENN(C2>30;"2. Mahnung";WENN(C2>0;"1. Mahnung";"keine")))'],
  ['siz-pu41-2', '=MITTELWERTWENN(B2:B11;F2;D2:D11)'], ['siz-pu41-2', '=SUMMEWENNS(D2:D11;B2:B11;F2;C2:C11;G2)/ZÄHLENWENNS(B2:B11;F2)'],
  ['siz-pu41-3', '=(KGRÖSSTE(C2:C11;1)+KGRÖSSTE(C2:C11;2)+KGRÖSSTE(C2:C11;3))/SUMME(C2:C11)'], ['siz-pu41-3', '=KGRÖSSTE(C2:C11;1)+KGRÖSSTE(C2:C11;2)+KGRÖSSTE(C2:C11;3)/TEILERGEBNIS(9;C2:C11)'],
  ['siz-pu41-4', '=WENN(ODER(B2<=$H$1;D2="Ja");"Zahlen";"Prüfen")'], ['siz-pu41-4', '=WENN(UND(NICHT(C2="gesperrt");B2<=$H$1;D2="Ja");"Zahlen";"Prüfen")'],
  ['siz-pu41-5', '=XVERWEIS(E2;A2:A11;B2:B11;"nicht gefunden")'], ['siz-pu41-5', '=XVERWEIS(GLÄTTEN(E2);A2:A11;C2:C11;"nicht gefunden")'],
  ['siz-pu41-6', '=INDEX(B2:G9;VERGLEICH(I2;A2:A9;0);VERGLEICH(J2;B1:G1;0))'], ['siz-pu41-6', '=WENNFEHLER(INDEX(B2:G9;VERGLEICH(J2;B1:G1;0);VERGLEICH(I2;A2:A9;0));"fehlt")'],
  ['siz-pu41-7', '=B2*SVERWEIS(C2;$G$1:$I$2;2;FALSCH)'], ['siz-pu41-7', '=B2*WVERWEIS(C2;$G$1:$I$2;1;FALSCH)'],
  ['siz-pu41-8', '=B2/C2*DATEDIF(D2;$I$1;"M")'], ['siz-pu41-8', '=B2/C2*DATEDIF(D2;E2;"M")'],
  ['siz-pu41-9', '=NETTOARBEITSTAGE(B2;MONATSENDE(B2;0))'], ['siz-pu41-9', '=MONATSENDE(B2;0)-B2'],
  ['siz-pu41-10', '="KW "&KALENDERWOCHE(ARBEITSTAG(B2;C2);21)'], ['siz-pu41-10', '=TEXTKETTE("KW ";KALENDERWOCHE(B2+C2;21))'],
  ['siz-pu41-11', '=RUNDEN(B2*C2*BRTEILJAHRE(D2;E2;1)*20;0)/20'], ['siz-pu41-11', '=B2*C2*BRTEILJAHRE(D2;E2;4)'],
  ['siz-pu41-12', '=WENN(LÄNGE(WECHSELN(B2;" ";""))=21;"OK";"prüfen")'], ['siz-pu41-12', '=WENN(UND(LINKS(B2;2)="CH";LÄNGE(B2)=21);"OK";"prüfen")'],
  ['mos-a-1', '=B5*E$1+$B$5*0+C1'],
  ['mos-a-1', '=$B5+E$1'],
  ['mos-a-2', '=MAX(B2:B11)-MIN(B2:B11)'],
  ['mos-a-2', '=MAX(B2:B10)-MITTELWERT(B2:B10)'],
  ['mos-a-3', '=ANZAHLLEEREZELLEN(C2:C11)'],
  ['mos-a-3', '=1-ANZAHL(C2:C11)/ANZAHL2(A2:A11)'],
  ['mos-a-4', '=WENN(ODER(B2>=$G$1;C2>=$G$2);"zugelassen";"nicht zugelassen")'],
  ['mos-a-4', '=WENN(C2>=$G$2;"zugelassen";"nicht zugelassen")'],
  ['mos-a-5', '=GROSS(LINKS(A2;3))&RECHTS(C2;4)'],
  ['mos-a-5', '=GROSS(LINKS(B2;3))&"-"&RECHTS(C2;4)'],
  ['mos-a-6', '=B2-C2'],
  ['mos-a-6', '=TAGE(B2;C2)'],
  ['mos-a-7', '=B2*C2*(1-D2/100)'],
  ['mos-a-7', '=B2*C2*D2'],
  ['mos-a-8', '=SVERWEIS(A2;$F$2:$G$8;2;FALSCH)'],
  ['mos-a-8', '=WENNFEHLER(SVERWEIS(A2;$F$2:$G$8;2;WAHR);"unbekannt")'],
  ['mos-e-1', '=WENNS(B2>=$G$2;"Silber";B2>=$G$1;"Gold";WAHR;"Bronze")'],
  ['mos-e-1', '=WENNS(B2>=$G$1;"Gold";B2>=$G$2;"Silber")'],
  ['mos-e-2', '=SUMMEWENNS(D2:D11;B2:B11;G1)/ZÄHLENWENNS(B2:B11;G1)'],
  ['mos-e-2', '=SUMMEWENNS(D2:D11;B2:B11;G1;C2:C11;G2)/ZÄHLENWENNS(B2:B11;G1)'],
  ['mos-e-3', '=MAXWENNS(C2:C11;B2:B11;G1)'],
  ['mos-e-3', '=MAXWENNS(C2:C11;D2:D11;G2)'],
  ['mos-e-4', '=XVERWEIS(F2;A2:A11;C2:C11)'],
  ['mos-e-4', '=XVERWEIS(F2;A2:A11;B2:B11;"nicht im Sortiment")'],
  ['mos-e-5', '=INDEX(B2:E9;VERGLEICH(H2;B1:E1;0);VERGLEICH(H1;A2:A9;0))'],
  ['mos-e-5', '=INDEX(B2:E9;VERGLEICH(H1;A2:A9;0);3)'],
  ['mos-e-6', '=SVERWEIS(C2;$F$2:$G$7;2;FALSCH)'],
  ['mos-e-6', '=SVERWEIS(C2;$F$2:$G$7;1;WAHR)'],
  ['mos-e-7', '=WENN(ODER(D2="Kader";UND(DATEDIF(B2;$H$1;"Y")>=5;NICHT(C2="unbefristet")));"Ja";"Nein")'],
  ['mos-e-7', '=WENN(UND(D2="Kader";ODER(DATEDIF(B2;$H$1;"Y")>=5;NICHT(C2="befristet")));"Ja";"Nein")'],
  ['mos-e-8', '=NETTOARBEITSTAGE(B2;MONATSENDE(B2;0))'],
  ['mos-e-8', '=NETTOARBEITSTAGE(B2;MONATSENDE(B2;1);$F$2:$F$11)'],
  ['mos-e-9', '=WENNFEHLER(WECHSELN(C2;"\'";"");0)'],
  ['mos-e-9', '=--WECHSELN(C2;"\'";"")+0*WENNFEHLER(1;0)'],
  ['mos-e-10', '=RMZ(C2;D2;-B2)'],
  ['mos-e-10', '=RMZ(C2/12;D2;B2)']
];
console.log('Fehlformeln');
for (const [id, f] of wrong) {
  const ex = all[id];
  if (!ex) continue; // Aufgabe gehört zu einer Kampagne, die nicht in dieser Datei steht (CAMPAIGNS_FILE)
  const r = E.check(HF, ex, f);
  r.ok ? fail(`${id}: Fehlformel ${f} besteht check()`) : ok(`${id}: ${f} abgelehnt («${r.message}»)`);
}

console.log(failures ? `\n${failures} Fehler` : '\nAlle Kampagnen in Ordnung.');
process.exit(failures ? 1 : 0);
