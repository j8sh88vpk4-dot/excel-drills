// Tests für supabase/functions/interview/logic.js (Rundenzählung, JSON-Extraktion, Rate-Limit, Premium-Code).
// Aufruf: node scripts/test-interview.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as L from '../supabase/functions/interview/logic.js';

const here = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
async function t(name, fn) {
  try { await fn(); passed++; } catch (e) { console.error('FEHLER:', name); throw e; }
}

const I = (text) => ({ role: 'interviewer', text });
const C = (text) => ({ role: 'candidate', text });
function conv(n, last = 'Antwort') { // n beantwortete Runden
  const out = [];
  for (let i = 1; i <= n; i++) { out.push(I('Frage ' + i)); out.push(C(i === n ? last : 'Antwort ' + i)); }
  return out;
}

/* Rundenzählung */
await t('leerer Verlauf = start', () => assert.deepEqual(L.nextPhase([]), { ok: true, phase: 'start', round: 1 }));
await t('nach 1 Antwort Runde 2', () => assert.deepEqual(L.nextPhase(conv(1)), { ok: true, phase: 'question', round: 2 }));
await t('nach 5 Antworten Runde 6', () => assert.equal(L.nextPhase(conv(5)).round, 6));
await t('nach 6 Antworten final', () => assert.deepEqual(L.nextPhase(conv(6)), { ok: true, phase: 'final', round: 6 }));
await t('7 Antworten abgelehnt', () => assert.equal(L.nextPhase(conv(7)).ok, false));
await t('fertig beendet früh', () => assert.equal(L.nextPhase(conv(2, 'fertig')).phase, 'final'));
await t('«Ich bin fertig.» beendet', () => assert.equal(L.nextPhase(conv(2, 'Ich bin fertig.')).phase, 'final'));
await t('«Fertig!» beendet', () => assert.equal(L.nextPhase(conv(1, 'Fertig!')).phase, 'final'));
await t('fertig in langer Antwort beendet nicht', () => assert.equal(
  L.nextPhase(conv(2, 'Die fertigen Produkte habe ich mit dem Deckungsbeitrag pro Stück gerechnet, fertig ist das Modell aber nicht.')).phase, 'question'));
await t('«fertige» beendet nicht', () => assert.equal(L.wantsToFinish('fertige Ware'), false));
await t('letzte Nachricht Interviewerin abgelehnt', () => assert.equal(L.nextPhase([I('Frage 1')]).error, 'awaiting-candidate'));
await t('falsche Reihenfolge abgelehnt', () => assert.equal(L.nextPhase([C('x')]).error, 'order'));

/* Eingabe */
await t('Rolle geprüft', () => assert.equal(L.validateBody({ role: 'ib', transcript: [] }).error, 'role'));
await t('Body ok, Texte gekürzt', () => {
  const r = L.validateBody({ role: 'Consulting', assessment: { title: 'Consulting-Assessment' }, score: '72', answersSummary: [{ aufgabe: 1, ok: true }], transcript: [I('x'.repeat(5000)), C('y')] });
  assert.equal(r.ok, true);
  assert.equal(r.value.role, 'consulting');
  assert.equal(r.value.assessment, 'Consulting-Assessment');
  assert.equal(r.value.score, 72);
  assert.ok(r.value.transcript[0].text.length <= L.MAX_TEXT + 2);
  assert.match(r.value.answersSummary, /aufgabe/);
});
await t('leerer Beitrag abgelehnt', () => assert.equal(L.validateBody({ role: 'accounting', transcript: [I('  ')] }).ok, false));
await t('Messages: Kontext zuerst, System zuletzt', () => {
  const v = L.validateBody({ role: 'consulting', transcript: conv(6) }).value;
  const m = L.buildMessages(v, L.nextPhase(v.transcript));
  assert.equal(m[0].role, 'user');
  assert.equal(m[1].role, 'assistant');
  assert.equal(m[m.length - 2].role, 'user');
  assert.equal(m[m.length - 1].role, 'system');
  assert.match(m[m.length - 1].content, /Abschlussbewertung/);
});

/* JSON-Extraktion */
const final = 'Gute Struktur, bei den Annahmen noch zu vage.\n{"done":true,"scores":{"struktur":4,"zahlenverstaendnis":3,"annahmen":2,"kommunikation":4},"feedback":["Nennen Sie Annahmen explizit.","Beginnen Sie mit der Kernaussage."]}';
await t('rohes JSON am Ende', () => {
  const r = L.extractAssessment(final);
  assert.equal(r.text, 'Gute Struktur, bei den Annahmen noch zu vage.');
  assert.deepEqual(r.note.scores, { struktur: 4, zahlenverstaendnis: 3, annahmen: 2, kommunikation: 4 });
  assert.equal(r.note.total, 13);
  assert.equal(r.note.max, 20);
  assert.equal(r.note.feedback.length, 2);
});
await t('JSON im Code-Block, Umlaut-Schlüssel, Werte begrenzt', () => {
  const r = L.extractAssessment('Fazit.\n```json\n{"done": true, "scores": {"Struktur": 7, "Zahlenverständnis": "3", "Annahmen": 0, "Kommunikation": 2.6}, "feedback": ["a", "b", "c"]}\n```');
  assert.equal(r.text, 'Fazit.');
  assert.deepEqual(r.note.scores, { struktur: 5, zahlenverstaendnis: 3, annahmen: 1, kommunikation: 3 });
  assert.deepEqual(r.note.feedback, ['a', 'b']);
});
await t('geschweifte Klammer im Text stört nicht', () => {
  const r = L.extractAssessment('Ihre Formel {=SUMME(A1:A3)} war gut.\n' + final.split('\n')[1]);
  assert.ok(r.note);
  assert.equal(r.text, 'Ihre Formel {=SUMME(A1:A3)} war gut.');
});
await t('ohne JSON: note null, Text bleibt', () => assert.deepEqual(L.extractAssessment('Warum 1\'800?'), { text: 'Warum 1\'800?', note: null }));
await t('done:false ignoriert', () => assert.equal(L.extractAssessment('{"done":false,"scores":{}}').note, null));
await t('fehlendes Kriterium ignoriert', () => assert.equal(L.extractAssessment('{"done":true,"scores":{"struktur":3}}').note, null));
await t('abgeschnittenes JSON ignoriert', () => assert.equal(L.extractAssessment('Fazit {"done":true,"scores":{"struktur":3,').note, null));

/* Rate-Limit */
await t('1. Anfrage erlaubt', () => assert.deepEqual(L.rateLimitDecision(1), { allowed: true, remaining: 19 }));
await t('20. Anfrage erlaubt', () => assert.deepEqual(L.rateLimitDecision(20), { allowed: true, remaining: 0 }));
await t('21. Anfrage gesperrt', () => assert.equal(L.rateLimitDecision(21).allowed, false));
await t('ungültiger Zähler gesperrt', () => assert.equal(L.rateLimitDecision(null).allowed, false));
await t('eigenes Limit', () => assert.equal(L.rateLimitDecision(6, 5).allowed, false));
await t('Zürcher Tag (UTC 23:30 = nächster Tag)', () => assert.equal(L.zurichDay(new Date('2026-11-01T23:30:00Z')), '2026-11-02'));

/* Premium-Code: gleicher Hash wie app/keys.js */
const keysSrc = readFileSync(path.join(here, '..', 'app', 'keys.js'), 'utf8');
const sandbox = {};
new Function('globalThis', 'window', keysSrc)(sandbox, undefined);
const Keys = sandbox.ExcelDrillsKeys;
await t('sha256 identisch mit keys.js', async () => {
  for (const s of ['ABC', 'TEST-CODE-123', 'ÄÖÜ']) assert.equal(await L.sha256Hex(s), Keys.hash(s));
});
await t('Code geprüft, normalisiert', async () => {
  const hash = await L.sha256Hex('TEST-CODE');
  const env = 'deadbeef, ' + hash;
  assert.deepEqual(await L.checkAccessKey('  test-code ', env), { ok: true, hash });
  assert.equal((await L.checkAccessKey('falsch', env)).reason, 'invalid');
  assert.equal((await L.checkAccessKey('', env)).reason, 'missing');
  assert.equal((await L.checkAccessKey('TEST-CODE', '')).reason, 'not-configured');
});

/* CORS */
await t('CORS erlaubte Origin', () => assert.equal(L.corsHeaders('https://excel-drills.ch')['Access-Control-Allow-Origin'], 'https://excel-drills.ch'));
await t('CORS localhost', () => assert.equal(L.corsHeaders('http://localhost:8787')['Access-Control-Allow-Origin'], 'http://localhost:8787'));
await t('CORS fremde Origin', () => { assert.equal(L.corsHeaders('https://evil.example')['Access-Control-Allow-Origin'], undefined); assert.equal(L.originAllowed('https://evil.example'), false); });
await t('ohne Origin (curl) erlaubt', () => assert.equal(L.originAllowed(null), true));

/* Prompts */
for (const role of L.ROLES) {
  await t('Prompt ' + role, () => {
    const p = JSON.parse(readFileSync(path.join(here, '..', 'supabase', 'functions', 'interview', 'prompts', role + '.json'), 'utf8'));
    const s = p.system.join('\n');
    assert.equal(p.role, role);
    for (const c of L.CRITERIA) assert.ok(s.includes('"' + c + '"') || s.includes(c), c);
    assert.ok(!s.includes('ß'), 'kein ß');
    assert.ok(!s.includes('—'), 'kein Em-Dash');
    assert.ok(L.extractAssessment('x\n' + s.match(/\{"done".*\}/)[0]).note, 'Beispiel-JSON parsebar');
  });
}

console.log('test-interview: ' + passed + ' Tests bestanden');
