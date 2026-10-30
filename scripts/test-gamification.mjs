// Tests für die reine Gamification-Logik (app/gamification.js, app/badges.js).
// Aufruf: npm run test:gamification   (oder: node scripts/test-gamification.mjs)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const ctx = { console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(read('app/gamification.js'), ctx);
vm.runInContext(read('app/badges.js'), ctx);
const G = ctx.ExcelDrillsGamification;
const B = ctx.ExcelDrillsBadges;

let failures = 0, passed = 0;
const eq = (actual, expected, label) => {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { passed++; console.log(`  ok     ${label}`); }
  else { failures++; console.log(`  FEHLER ${label}: ${a}, erwartet ${e}`); }
};
const section = (t) => console.log(`\n${t}`);
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min, 0);

// Testdaten: kleine Pfade mit und ohne alt-Datensätze, Gratis und Premium
const ex = (id, track, free, alts = 0, topic = 'X') => ({ id, track, free, topic, data: [[1]], alt: Array.from({ length: alts }, () => ({ data: [[2]] })) });
const exercises = [
  ex('b1', 'basis', true, 0, 'SUMME'), ex('b2', 'basis', true, 1, 'SVERWEIS'), ex('b3', 'basis', false, 2, 'SVERWEIS'),
  ex('a1', 'accounting', true, 1), ex('a2', 'accounting', true, 0)
];
const tracks = [
  { id: 'basis', name: 'Basis', items: exercises.filter((e) => e.track === 'basis') },
  { id: 'accounting', name: 'Accounting & Controlling', items: exercises.filter((e) => e.track === 'accounting') },
  { id: 'consulting', name: 'Consulting', items: [], comingSoon: true }
];
const byId = Object.fromEntries(exercises.map((e) => [e.id, e]));

section('Datum (lokale Zeit)');
eq(G.dayKey(at(2026, 10, 30, 23, 59)), '2026-10-30', 'dayKey 23:59');
eq(G.dayKey(at(2026, 10, 31, 0, 1)), '2026-10-31', 'dayKey 00:01 am Folgetag');
eq(G.addDays('2026-10-31', 1), '2026-11-01', 'addDays über Monatsende');
eq(G.addDays('2026-03-29', -1), '2026-03-28', 'addDays über Sommerzeit-Umstellung');
eq(G.addDays('2026-10-25', 1), '2026-10-26', 'addDays über Winterzeit-Umstellung');
eq(G.addDays('2026-12-31', 1), '2027-01-01', 'addDays über Jahreswechsel');

section('Levels');
const lv = (xp, unlocked = true) => G.levelFor(xp, unlocked);
eq([0, 49, 50, 149, 150, 299, 300, 499, 500, 799, 800, 5000].map((x) => lv(x).level), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6], 'Schwellen 0/50/150/300/500/800');
eq(lv(0).name, 'Einstieg', 'Name Level 1');
eq(lv(50).name, 'Sachbearbeitung', 'Name Level 2');
eq(lv(800).name, 'Excel-Meisterschaft', 'Name Level 6');
eq(lv(100).progress, 0.5, 'Fortschritt 100 XP = halber Weg zu Level 3');
eq(lv(100).toNext, 50, 'noch 50 XP bis Level 3');
eq(lv(900).next, null, 'Level 6 hat kein nächstes Level');
eq([lv(499, false).level, lv(500, false).level, lv(900, false).level], [4, 4, 4], 'ohne Premium höchstens Level 4');
eq(lv(600, false).capped, true, 'ohne Premium: capped bei 600 XP');
eq(lv(350, false).nextLocked, true, 'ohne Premium: Level 5 gesperrt');
eq(lv(350, true).nextLocked, false, 'mit Premium: Level 5 offen');

section('Meisterschaft und XP');
let s = G.emptyState();
let r = G.recordSolve(s, byId.b2, 0, at(2026, 10, 30, 9));
eq([r.xp, r.medalAfter, s.xp], [10, 1, 10], 'erstes Lösen: Bronze, +10 XP');
r = G.recordSolve(s, byId.b2, 1, at(2026, 10, 30, 9, 5));
eq([r.xp, r.medalAfter], [5, 2], 'zweite Lösung (anderer Datensatz): Silber, +5 XP');
r = G.recordSolve(s, byId.b2, 0, at(2026, 10, 30, 9, 10));
eq([r.xp, r.medalAfter], [5, 3], 'dritte Lösung, 2 Datensätze: Gold, +5 XP');
r = G.recordSolve(s, byId.b2, 1, at(2026, 10, 30, 9, 15));
eq(r.xp, 0, 'Gold-Wiederholung am selben Tag wie Gold: 0 XP');
r = G.recordSolve(s, byId.b2, 1, at(2026, 10, 31, 9));
eq(r.xp, 2, 'Gold-Wiederholung am Folgetag: +2 XP');
r = G.recordSolve(s, byId.b2, 0, at(2026, 10, 31, 10));
eq(r.xp, 0, 'zweite Gold-Wiederholung am selben Tag: 0 XP');
eq(s.xp, 22, 'XP total 10+5+5+2');

s = G.emptyState();
G.recordSolve(s, byId.b3, 0, at(2026, 10, 30));
G.recordSolve(s, byId.b3, 0, at(2026, 10, 30));
r = G.recordSolve(s, byId.b3, 0, at(2026, 10, 30));
eq(r.medalAfter, 2, '3× Originaldaten bei Übung mit alt: bleibt Silber');
r = G.recordSolve(s, byId.b3, 2, at(2026, 10, 30));
eq([r.medalAfter, r.xp], [3, 5], 'danach anderer Datensatz: Gold');

s = G.emptyState();
['b1', 'b1', 'b1'].forEach((id) => G.recordSolve(s, byId[id], 0, at(2026, 10, 30)));
eq(G.medalOf(s, byId.b1), 3, 'ohne alt-Datensatz: Gold nach 3 Wiederholungen');
eq(s.xp, 20, 'ohne alt: 10+5+5 XP');
eq(G.nextMedalText(s.mastery.b1, byId.b1), 'Gold erreicht (Wiederholung).', 'Text «Wiederholung»');
eq(G.medal(null, byId.b1), 0, 'keine Lösung: keine Medaille');

section('Datensatz-Auswahl');
eq(G.pickDataset(byId.b1, 0, () => 0.5), 0, 'ohne alt: Originaldaten');
eq(G.pickDataset(byId.b2, 0, () => 0.9), 1, '1 alt, zuletzt Original: alt[0]');
eq(G.pickDataset(byId.b2, 1, () => 0.9), 0, '1 alt, zuletzt alt[0]: Originaldaten');
const picks = new Set();
for (let i = 0; i < 50; i++) picks.add(G.pickDataset(byId.b3, 1, Math.random));
eq([...picks].sort(), [2], '2 alt, zuletzt 1: nie derselbe');
eq(G.pickDataset(byId.b3, 0, () => 0.99), 2, '2 alt: zufällig aus alt[0], alt[1]');

section('Streak und Tagesziel');
s = G.emptyState();
eq(s.goal, 2, 'Standard-Tagesziel 2');
r = G.recordSolve(s, byId.b1, 0, at(2026, 10, 30, 23, 50));
eq([r.todayCount, r.goalReached, r.streak], [1, false, 0], 'Tag 1, 1. Übung: 1/2, keine Streak');
r = G.recordSolve(s, byId.b1, 0, at(2026, 10, 30, 23, 55));
eq([r.todayCount, r.goalReached], [1, false], 'dieselbe Übung nochmal zählt nicht doppelt');
r = G.recordSolve(s, byId.b2, 0, at(2026, 10, 30, 23, 58));
eq([r.todayCount, r.goalReached, r.streak], [2, true, 1], 'Tag 1, 2. Übung: Tagesziel erreicht, Streak 1');
r = G.recordSolve(s, byId.a1, 0, at(2026, 10, 30, 23, 59));
eq(r.goalReached, false, 'Tagesziel meldet sich nur einmal pro Tag');
eq(G.currentStreak(s, '2026-10-31'), 1, 'Folgetag vor dem Üben: Streak bleibt 1');
r = G.recordSolve(s, byId.b1, 0, at(2026, 10, 31, 0, 2));
eq([r.todayCount, r.goalReached], [1, false], 'nach Mitternacht: neuer Tag, 1/2');
r = G.recordSolve(s, byId.a2, 0, at(2026, 10, 31, 0, 5));
eq([r.goalReached, r.streak], [true, 2], 'Tag 2 erreicht: Streak 2');
eq(G.currentStreak(s, '2026-11-01'), 2, 'Tag 3 noch offen: Streak 2');
eq(G.currentStreak(s, '2026-11-02'), 0, 'Tag 3 verpasst: Streak 0');
G.recordSolve(s, byId.b1, 0, at(2026, 11, 2, 8));
r = G.recordSolve(s, byId.b2, 0, at(2026, 11, 2, 9));
eq([r.goalReached, r.streak, s.bestStreak], [true, 1, 2], 'nach Lücke: Streak beginnt bei 1, Bestwert 2');
eq(s.days, { '2026-10-30': 3, '2026-10-31': 2, '2026-11-02': 2 }, 'Tageshistorie Datum → Anzahl');
eq(G.last7(s, '2026-11-02').map((d) => (d.met ? 'x' : d.count)).join(''), '0000xx0x'.slice(1), '7-Tage-Leiste');

s = G.emptyState();
G.setGoal(s, 5, '2026-10-30');
G.recordSolve(s, byId.b1, 0, at(2026, 10, 30));
G.recordSolve(s, byId.b2, 0, at(2026, 10, 30));
eq(G.currentStreak(s, '2026-10-30'), 0, 'Ziel 5: nach 2 Übungen noch nicht erreicht');
eq(G.setGoal(s, 1, '2026-10-30'), true, 'Ziel auf 1 senken: sofort erreicht');
eq(G.currentStreak(s, '2026-10-30'), 1, 'Streak 1 nach Zielwechsel');
eq(G.setGoal(s, 3), false, 'ungültiges Ziel 3 wird abgelehnt');
eq(s.goal, 1, 'Ziel bleibt 1');

// Streak über 30 Tage inkl. Monatswechsel, Historie auf 90 Tage gekürzt
s = G.emptyState();
G.setGoal(s, 1);
for (let i = 0; i < 120; i++) G.recordSolve(s, byId.b1, 0, new Date(2026, 6, 1 + i, 10));
eq(G.currentStreak(s, G.dayKey(new Date(2026, 6, 120, 10))), 120, '120 Tage in Folge über Monatswechsel');
eq(Object.keys(s.days).length, 90, 'Historie: nur letzte 90 Tage');
eq(Object.keys(s.met).length, 90, 'erreichte Tage: nur letzte 90 Tage');

section('Migration');
const old = { points: 30, solved: { b1: true, b2: true, a1: true } };
s = G.migrate(JSON.stringify(old));
eq([s.v, s.xp, Object.keys(s.solved).length], [2, 30, 3], 'alter Stand: Punkte → XP, gelöste bleiben');
eq([G.medalOf(s, byId.b1), G.medalOf(s, byId.b2), G.medalOf(s, byId.b3)], [1, 1, 0], 'gelöste Übungen erhalten Bronze');
eq(s.goal, 2, 'Tagesziel Standard 2');
const ser = JSON.parse(JSON.stringify(G.serialize(s)));
eq([ser.points, ser.xp, ser.solved], [30, 30, old.solved], 'serialisiert: points = xp, solved unverändert');
const again = G.migrate(ser);
eq(JSON.stringify(G.serialize(again)), JSON.stringify(G.serialize(s)), 'v2 → v2 verlustfrei');
eq(G.migrate('kaputt{').xp, 0, 'ungültiges JSON: leerer Stand');
eq(G.migrate(null).goal, 2, 'kein Stand: leerer Stand');
eq(G.migrate({ points: 'x', solved: [] }).xp, 0, 'unsinnige Werte: 0 XP');
r = G.recordSolve(s, byId.b1, 0, at(2026, 10, 30));
eq([r.xp, r.medalAfter], [5, 2], 'migrierte Bronze + nochmal lösen: Silber');

section('Abzeichen');
const bctx = (state, unlocked = false, today = '2026-10-30') => ({ state, exercises, tracks, unlocked, today });
const ids = (list) => list.map((b) => b.id);
s = G.emptyState();
eq(ids(B.build(bctx(s))), ['erste-formel', 'pfad-basis', 'pfad-accounting', 'gold-basis', 'gold-accounting', 'streak-7', 'streak-30', 'sverweis-profi', 'fruehaufsteher', 'nachtschicht', 'xp-100', 'xp-500'], 'Liste (ohne «Bald verfügbar»-Pfade)');
eq(ids(B.evaluate(bctx(s))), [], 'leerer Stand: keine Abzeichen');
G.recordSolve(s, byId.b1, 0, at(2026, 10, 30, 12));
eq(ids(B.evaluate(bctx(s))), ['erste-formel'], 'erste Übung: «Erste Formel»');
eq(ids(B.evaluate(bctx(s))), [], 'kein zweites Mal');
G.recordSolve(s, byId.b2, 0, at(2026, 10, 30, 6, 59));
eq(ids(B.evaluate(bctx(s))), ['pfad-basis', 'fruehaufsteher'], 'Basis gratis komplett + vor 7 Uhr');
G.recordSolve(s, byId.a1, 0, at(2026, 10, 30, 22, 0));
eq(ids(B.evaluate(bctx(s))), ['nachtschicht'], 'ab 22 Uhr: Nachtschicht');
const st = (state, unlocked) => Object.fromEntries(B.status(bctx(state, unlocked)).map((b) => [b.id, b.status]));
eq(st(s, false)['gold-basis'], 'gated', 'Gold-Pfad mit Premium-Übung: gesperrt für Gratis');
eq(st(s, true)['gold-basis'], 'locked', 'Gold-Pfad mit Premium: erreichbar');
eq(st(s, false)['gold-accounting'], 'locked', 'Gold-Pfad nur Gratis-Übungen: erreichbar');
eq(st(s, false)['xp-100'], 'locked', '100 XP noch nicht');
// Gold für b1, b2 (SVERWEIS gratis) → SVERWEIS-Profi für Gratis; Gold-Pfad Basis bleibt gesperrt
['b1', 'b1'].forEach((id) => G.recordSolve(s, byId[id], 0, at(2026, 10, 30, 12)));
G.recordSolve(s, byId.b2, 1, at(2026, 10, 30, 12));
G.recordSolve(s, byId.b2, 0, at(2026, 10, 30, 12));
eq(ids(B.evaluate(bctx(s))), ['sverweis-profi'], 'alle verfügbaren SVERWEIS-Übungen Gold');
eq(ids(B.evaluate(bctx(s, true))), [], 'mit Premium: Gold-Pfad Basis braucht auch b3');
['a1', 'a2', 'a2', 'a2'].forEach((id) => G.recordSolve(s, byId[id], 0, at(2026, 10, 30, 12)));
G.recordSolve(s, byId.a1, 1, at(2026, 10, 30, 12));
G.recordSolve(s, byId.a1, 0, at(2026, 10, 30, 12));
eq(ids(B.evaluate(bctx(s))), ['pfad-accounting', 'gold-accounting'], 'Accounting komplett + Gold-Pfad Accounting');
eq(s.xp, 80, 'XP: 4 Übungen × (10+5+5)');
s.xp = 500;
eq(ids(B.evaluate(bctx(s))), ['xp-100', 'xp-500'], '100 XP und 500 XP');
s = G.emptyState();
G.setGoal(s, 1);
for (let i = 0; i < 7; i++) G.recordSolve(s, byId.b1, 0, at(2026, 10, 1 + i));
eq(ids(B.evaluate(bctx(s, false, '2026-10-07'))).includes('streak-7'), true, '7 Tage in Folge');
s = G.emptyState(); s.bestStreak = 30;
eq(ids(B.evaluate(bctx(s))).sort(), ['streak-30', 'streak-7'], 'Bestwert 30 zählt auch nach Unterbruch');

console.log(failures ? `\n${failures} Fehler, ${passed} ok` : `\nAlle ${passed} Tests bestanden.`);
process.exit(failures ? 1 : 0);
