// Tests für die reinen Hilfsfunktionen der Recruiter-Links (app/recruiter.js, app/recruiter-results.js)
// und einen einfachen Syntax-Check der Migration supabase/migrations/003_recruiter.sql.
// Aufruf: node scripts/test-recruiter.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
let passed = 0;
function t(name, fn) {
  try { fn(); passed++; } catch (e) { console.error('FEHLER:', name); throw e; }
}

// Browser-Dateien in einem vm-Kontext ohne document laden: nur die Hilfsfunktionen werden registriert
function load(file) {
  const ctx = vm.createContext({ console, URLSearchParams, Intl, Date, Math, JSON });
  vm.runInContext(readFileSync(path.join(root, file), 'utf8'), ctx, { filename: file });
  return ctx;
}
// Objekte aus dem vm-Kontext haben fremde Prototypen: Rückgaben für deepEqual als JSON klonen
function plain(helpers) {
  const out = {};
  for (const [k, fn] of Object.entries(helpers)) {
    out[k] = (...a) => { const r = fn(...a); return r && typeof r === 'object' ? JSON.parse(JSON.stringify(r)) : r; };
  }
  return out;
}
const R = plain(load('app/recruiter.js').ExcelDrillsRecruiter.helpers);
const RR = plain(load('app/recruiter-results.js').ExcelDrillsRecruiterResults.helpers);

/* Validierung Name / E-Mail */
t('gültige Angaben', () => {
  const r = R.validateCandidate('  Anna   Muster ', ' Anna.Muster@Beispiel.CH ');
  assert.equal(r.ok, true);
  assert.equal(r.name, 'Anna Muster');
  assert.equal(r.email, 'anna.muster@beispiel.ch');
});
t('Name leer', () => assert.equal(R.validateCandidate('   ', 'a@b.ch').errors.name, 'leer'));
t('Name zu lang', () => assert.equal(R.validateCandidate('x'.repeat(201), 'a@b.ch').errors.name, 'lang'));
t('E-Mail leer', () => assert.equal(R.validateCandidate('Anna', '').errors.email, 'leer'));
for (const bad of ['anna', 'anna@', '@b.ch', 'a b@c.ch', 'a@b', 'a@b.c', 'a,b@c.ch', 'a@b;c.ch', '<a@b.ch>']) {
  t('E-Mail ungültig: ' + bad, () => assert.equal(R.validateCandidate('Anna', bad).errors.email, 'format'));
}
t('E-Mail zu lang', () => assert.equal(R.validateCandidate('Anna', 'a'.repeat(250) + '@b.ch').errors.email, 'lang'));
t('null-Werte', () => assert.equal(R.validateCandidate(null, undefined).ok, false));

/* Token */
t('Token hex 24', () => assert.equal(R.validToken('0123456789abcdef01234567'), true));
t('Token zu kurz', () => assert.equal(R.validToken('abc'), false));
t('Token mit Sonderzeichen', () => assert.equal(R.validToken("abcdefghijklmnop'; drop"), false));
t('Token null', () => assert.equal(R.validToken(null), false));

/* aufgaben-JSON aus dem Assessment-State */
const summary = {
  rolle: 'accounting', punkte: 70, prozent: 70, stufe: 'Bereit', dauerSek: 612.4, zeitAbgelaufen: false,
  tasks: [
    { id: 'ac-1', kategorie: 'lookup', ok: true, punkte: 20, versuche: 1, fehlerart: null, formel: '=SUMMEWENN(A:A;"x";B:B)' },
    { id: 'ac-2', kategorie: 'bezug', ok: true, punkte: 10, versuche: 2, fehlerart: null },
    { id: 'ac-3', kategorie: 'rundung', ok: false, punkte: 0, versuche: 2, fehlerart: 'syntax' },
    { id: 'ac-4', kategorie: 'modell', ok: true, punkte: 20, versuche: 1 },
    { id: 'ac-5', kategorie: 'logik', ok: false, punkte: 0, versuche: 0, fehlerart: 'logik' }
  ]
};
t('aufgaben: Struktur', () => {
  const a = R.buildAufgaben(summary.tasks);
  assert.equal(a.length, 5);
  assert.deepEqual(a[0], { nr: 1, id: 'ac-1', kategorie: 'lookup', ok: true, punkte: 20, versuche: 1, fehlerart: null });
  assert.deepEqual(a[2], { nr: 3, id: 'ac-3', kategorie: 'rundung', ok: false, punkte: 0, versuche: 2, fehlerart: 'syntax' });
});
t('aufgaben: keine Formeln', () => assert.equal(JSON.stringify(R.buildAufgaben(summary.tasks)).indexOf('SUMMEWENN'), -1));
t('aufgaben: fehlerart nur bei falsch', () => {
  assert.equal(R.buildAufgaben([{ ok: true, fehlerart: 'syntax' }])[0].fehlerart, null);
});
t('aufgaben: Werte begrenzt', () => {
  const a = R.buildAufgaben([{ punkte: -5, versuche: 99 }, { punkte: 'x' }])[0];
  assert.equal(a.punkte, 0);
  assert.equal(a.versuche, 10);
  assert.equal(R.buildAufgaben([{ punkte: 'x' }])[0].punkte, 0);
});
t('aufgaben: kein Array', () => assert.deepEqual(R.buildAufgaben(null), []));
t('aufgaben: höchstens 50', () => assert.equal(R.buildAufgaben(new Array(80).fill({ ok: true })).length, 50));
t('payload', () => {
  const p = R.buildPayload('0123456789abcdef01234567', { name: 'Anna', email: 'a@b.ch' }, summary, 'de');
  assert.equal(p.p_token, '0123456789abcdef01234567');
  assert.equal(p.p_prozent, 70);
  assert.equal(p.p_punkte, 70);
  assert.equal(p.p_stufe, 'Bereit');
  assert.equal(p.p_dauer, 612);
  assert.equal(p.p_sprache, 'de');
  assert.equal(p.p_aufgaben.length, 5);
  assert.deepEqual(Object.keys(p).sort(), ['p_aufgaben', 'p_dauer', 'p_email', 'p_name', 'p_prozent', 'p_punkte', 'p_sprache', 'p_stufe', 'p_token']);
});
t('payload: Sprache nur de/en', () => assert.equal(R.buildPayload('t', { name: 'a', email: 'b' }, {}, 'fr').p_sprache, 'de'));
t('payload: Prozent begrenzt', () => assert.equal(R.buildPayload('t', { name: 'a', email: 'b' }, { prozent: 140 }).p_prozent, 100));
t('Fehlercode', () => {
  assert.equal(R.errorCode({ message: 'link_voll' }), 'link_voll');
  assert.equal(R.errorCode({ code: 'P0001', message: 'link_inaktiv' }), 'link_inaktiv');
  assert.equal(R.errorCode(null), 'unbekannt');
});
t('REST-Basis aus leads-config', () => {
  assert.equal(R.restBase({ url: 'https://x.supabase.co/rest/v1/leads' }), 'https://x.supabase.co');
  assert.equal(R.restBase(null), '');
});
t('Rollen-Label', () => {
  assert.equal(R.roleLabel('accounting'), 'Accounting');
  assert.equal(R.roleLabel('versicherung'), 'Versicherung');
});

/* CSV */
t('CSV: einfache Werte', () => assert.equal(RR.csvCell('Anna'), 'Anna'));
t('CSV: Zahl', () => assert.equal(RR.csvCell(70), '70'));
t('CSV: null', () => assert.equal(RR.csvCell(null), ''));
t('CSV: Semikolon', () => assert.equal(RR.csvCell('Muster; AG'), '"Muster; AG"'));
t('CSV: Anführungszeichen', () => assert.equal(RR.csvCell('Anna "Ann" M.'), '"Anna ""Ann"" M."'));
t('CSV: Zeilenumbruch', () => assert.equal(RR.csvCell('a\nb'), '"a\nb"'));
t('CSV: Injection =', () => assert.equal(RR.csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"'));
t('CSV: Injection + - @', () => {
  assert.equal(RR.csvCell('+41 79'), "'+41 79");
  assert.equal(RR.csvCell('-1'), "'-1");
  assert.equal(RR.csvCell('@SUMME'), "'@SUMME");
});
t('CSV: negative Zahl bleibt Zahl', () => assert.equal(RR.csvCell(-1), '-1'));
t('CSV: Komma als Trenner', () => assert.equal(RR.csvCell('a,b', ','), '"a,b"'));
t('CSV: Datei', () => {
  assert.equal(RR.toCsv(['Name', 'Prozent'], [['Anna', 70], ['Ben; C', 40]]), 'Name;Prozent\r\nAnna;70\r\n"Ben; C";40\r\n');
});

/* Kategorien, Sortierung, Zeilen */
const results = [
  { kandidat_name: 'Ben', kandidat_email: 'ben@b.ch', prozent: 40, punkte: 40, stufe: 'Fast bereit', dauer_sek: 900, erstellt: '2026-11-02T08:00:00Z',
    aufgaben: [{ kategorie: 'lookup', ok: false }, { kategorie: 'lookup', ok: true }, { kategorie: 'zusatz', ok: true }] },
  { kandidat_name: 'Anna', kandidat_email: 'anna@b.ch', prozent: 90, punkte: 90, stufe: 'Sehr sicher', dauer_sek: 61, erstellt: '2026-11-02T09:30:00Z',
    aufgaben: [{ kategorie: 'bezug', ok: true }, { kategorie: 'lookup', ok: true }] },
  { kandidat_name: 'Cleo', kandidat_email: 'c@b.ch', prozent: 90, punkte: 90, stufe: 'Sehr sicher', dauer_sek: null, erstellt: '2026-11-01T09:30:00Z', aufgaben: [] }
];
t('Kategorie-Statistik', () => assert.deepEqual(RR.categoryStats(results[0].aufgaben), { lookup: { ok: 1, n: 2 }, zusatz: { ok: 1, n: 1 } }));
t('Kategorien geordnet', () => assert.deepEqual(RR.categoriesOf(results), ['bezug', 'lookup', 'zusatz']));
t('Sortierung absteigend, Gleichstand nach Datum', () => assert.deepEqual(RR.sortResults(results, 'desc').map((r) => r.kandidat_name), ['Cleo', 'Anna', 'Ben']));
t('Sortierung aufsteigend', () => assert.deepEqual(RR.sortResults(results, 'asc').map((r) => r.kandidat_name), ['Ben', 'Cleo', 'Anna']));
t('Sortierung ändert Original nicht', () => assert.equal(results[0].kandidat_name, 'Ben'));
t('Dauer', () => {
  assert.equal(RR.fmtDuration(61), '1:01');
  assert.equal(RR.fmtDuration(900), '15:00');
  assert.equal(RR.fmtDuration(null), '');
});
t('Datum in Zürcher Zeit', () => {
  assert.equal(RR.fmtDate('2026-11-02T09:30:00Z'), '02.11.2026 10:30');
  assert.equal(RR.fmtDate('2026-07-01T09:30:00Z'), '01.07.2026 11:30');
  assert.equal(RR.fmtDate('kein Datum'), '');
});
t('Zeilen', () => {
  const b = RR.buildRows(results, (c) => c.toUpperCase(), 'desc');
  assert.deepEqual(b.header, ['Name', 'E-Mail', 'Prozent', 'Punkte', 'Stufe', 'Dauer (Min:Sek)', 'Datum', 'BEZUG', 'LOOKUP', 'ZUSATZ']);
  assert.deepEqual(b.rows[1], ['Anna', 'anna@b.ch', 90, 90, 'Sehr sicher', '1:01', '02.11.2026 10:30', '1/1', '1/1', '']);
  assert.deepEqual(b.rows[2].slice(7), ['', '1/2', '1/1']);
});
t('Dateiname', () => assert.equal(RR.csvFileName('Zürich Versicherung AG', 'accounting', new Date(2026, 10, 3)), 'excel-assessment-zurich-versicherung-ag-accounting-2026-11-03.csv'));

/* SQL-Migration: einfacher Syntax-Check (kein Supabase-Zugriff) */
const sql = readFileSync(path.join(root, 'supabase/migrations/003_recruiter.sql'), 'utf8');
// Zuerst Block-Kommentare, dann Zeilen-Kommentare entfernen (Abschnittstitel enthalten «--» innerhalb von /* */)
const code = sql.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
t('SQL: $$-Blöcke ausgeglichen', () => assert.equal((code.match(/\$\$/g) || []).length % 2, 0));
t('SQL: Klammern ausgeglichen', () => {
  const outside = code.replace(/'(?:[^']|'')*'/g, "''");
  assert.equal((outside.match(/\(/g) || []).length, (outside.match(/\)/g) || []).length);
});
t('SQL: einfache Anführungszeichen ausgeglichen', () => assert.equal((code.match(/'/g) || []).length % 2, 0));
t('SQL: drei Funktionen, alle SECURITY DEFINER mit search_path', () => {
  const fns = code.match(/create or replace function public\.(\w+)/g) || [];
  assert.deepEqual(fns.map((f) => f.split('.')[1]), ['link_info', 'submit_assessment_result', 'results_for_link']);
  assert.equal((code.match(/security definer/g) || []).length, 3);
  assert.equal((code.match(/set search_path = public, pg_temp/g) || []).length, 3);
});
t('SQL: RLS auf beiden Tabellen, keine Policies, keine Tabellenrechte für anon', () => {
  assert.match(code, /alter table public\.assessment_links enable row level security/);
  assert.match(code, /alter table public\.assessment_results enable row level security/);
  assert.doesNotMatch(code, /create policy/i);
  assert.doesNotMatch(code, /grant [^;]* on table [^;]* to [^;]*anon/i);
});
t('SQL: Execute für anon auf genau die drei Funktionen', () => {
  const grants = code.match(/grant execute on function public\.(\w+)\([^)]*\) to anon/g) || [];
  assert.equal(grants.length, 3);
});
t('SQL: link_info gibt keine Tokens zurück', () => {
  const body = code.slice(code.indexOf('function public.link_info'), code.indexOf('function public.submit_assessment_result'));
  assert.doesNotMatch(body, /'token'|'admin_token'|l\.token,|admin_token/);
});
t('SQL: results_for_link gibt keine Tokens zurück', () => {
  const start = code.indexOf('function public.results_for_link');
  const body = code.slice(start, code.indexOf('$$;', code.indexOf('$$', start) + 2));
  assert.doesNotMatch(body, /'token'|'admin_token'/);
});
t('SQL: Fehlercodes passen zum Client', () => {
  for (const c of ['link_unbekannt', 'link_inaktiv', 'link_voll', 'eingabe_ungueltig']) assert.match(code, new RegExp("'" + c + "'"));
});
t('SQL: jede Anweisung endet mit ;', () => {
  const tail = code.replace(/\$\$[\s\S]*?\$\$/g, '$$$$').trim();
  assert.ok(tail.endsWith(';'));
});

console.log('test-recruiter: ' + passed + ' Tests bestanden.');
