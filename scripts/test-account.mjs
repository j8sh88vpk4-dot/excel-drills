// Tests für das freiwillige Konto: Merge-Logik, Lizenz-Entscheid, Magic-Link-Rücksprung (app/account.js),
// Login-Ablauf mit Fake-supabase-Client und die reine Webhook-Logik (supabase/functions/stripe-webhook/logic.js).
// Aufruf: npm run test:account   (oder: node scripts/test-account.mjs)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHmac } from 'node:crypto';
import vm from 'node:vm';
import * as W from '../supabase/functions/stripe-webhook/logic.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const ctx = { console, URLSearchParams, setTimeout, clearTimeout };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(read('app/gamification.js'), ctx);
vm.runInContext(read('app/account.js'), ctx);
const G = ctx.ExcelDrillsGamification;
const A = ctx.ExcelDrillsAccount.logic;

let passed = 0, failed = 0;
const section = (t) => console.log('\n' + t);
const plain = (v) => JSON.parse(JSON.stringify(v === undefined ? null : v));
function eq(actual, expected, name) {
  const a = JSON.stringify(plain(actual)), e = JSON.stringify(plain(expected));
  if (a === e) { passed++; console.log('  ok     ' + name); }
  else { failed++; console.log('  FEHLER ' + name + '\n         erwartet ' + e + '\n         erhalten ' + a); }
}
const truthy = (v, name) => eq(!!v, true, name);

/* ---------- Grundlagen ---------- */

section('Ohne Konfiguration');
eq(ctx.ExcelDrillsAccount.enabled(), false, 'ohne config.js und ohne DOM: Konto-Funktion aus');
eq(ctx.ExcelDrillsAccount.cachedPremium(), false, 'kein zwischengespeichertes Premium');
eq(ctx.ExcelDrillsAccount.boot({}), null, 'boot() ohne DOM gibt null zurück');

/* ---------- Merge ---------- */

section('Merge-Logik (lokal ∪ Server)');
const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min);
const exA = { id: 'a', alt: [{}] }, exB = { id: 'b' }, exC = { id: 'c', alt: [{}] };

const local = G.emptyState();
G.recordSolve(local, exA, 0, at(2026, 10, 29));
G.recordSolve(local, exA, 1, at(2026, 10, 30));
G.recordSolve(local, exB, 0, at(2026, 10, 30));
local.badges['erste-formel'] = 2000;
local.goal = 1;
const server = G.emptyState();
G.recordSolve(server, exC, 0, at(2026, 10, 28));
G.recordSolve(server, exA, 0, at(2026, 10, 28, 13));
server.xp = 500;
server.bestStreak = 9;
server.badges['erste-formel'] = 1000;
server.badges['nachtschicht'] = 1500;
server.flags.night = true;
server.goal = 5;

const m = A.mergeProgress(G.serialize(local), G.serialize(server), G);
eq(m.xp, 500, 'XP: Maximum');
eq(m.points, 500, 'points spiegelt XP');
eq(Object.keys(m.solved).sort(), ['a', 'b', 'c'], 'gelöst: Vereinigung');
eq([m.mastery.a.n, m.mastery.a.sets], [2, [0, 1]], 'Meisterschaft a: höhere Anzahl, Datensätze vereinigt');
eq(G.medal(m.mastery.a, exA), 2, 'Medaille a: Silber (max)');
eq(m.mastery.c.n, 1, 'Meisterschaft c nur auf dem Server: übernommen');
eq(Object.keys(m.days).sort(), ['2026-10-28', '2026-10-29', '2026-10-30'], 'Tageshistorie vereinigt');
eq(m.badges, { 'erste-formel': 1000, nachtschicht: 1500 }, 'Abzeichen vereinigt, früherer Zeitstempel');
eq(m.bestStreak, 9, 'Bestwert: Maximum');
eq(m.streak.last, '2026-10-30', 'Streak: die jüngere');
eq(m.flags, { early: false, night: true }, 'Flags: oder');
eq(m.goal, 5, 'Tagesziel: Server');

const same = G.emptyState();
G.recordSolve(same, exA, 0, at(2026, 10, 30, 9));
const same2 = G.emptyState();
G.recordSolve(same2, exB, 0, at(2026, 10, 30, 10));
same2.streak = { count: 4, last: '2026-10-30' };
const ms = A.mergeProgress(G.serialize(same), G.serialize(same2), G);
eq([ms.today.date, ms.today.ids.slice().sort(), ms.days['2026-10-30']], ['2026-10-30', ['a', 'b'], 2], 'heute auf beiden Geräten: Übungen vereinigt, Tageszähler = 2');
eq(ms.streak, { count: 4, last: '2026-10-30' }, 'gleicher Streak-Tag: höhere Zahl');

eq(A.mergeProgress(G.serialize(local), null, G), G.serialize(G.migrate(G.serialize(local))), 'kein Server-Stand: lokaler Stand');
eq(A.mergeProgress(null, G.serialize(server), G).xp, 500, 'leerer lokaler Stand: Server-Stand');
eq(A.mergeProgress({ points: 30, solved: { a: true } }, G.serialize(server), G).mastery.a.n, 1, 'alter lokaler Stand v1 wird migriert und vereinigt');
const m2 = A.mergeProgress(m, m, G);
eq(m2, m, 'idempotent: merge(x, x) = x');
eq(A.mergeProgress(G.serialize(server), G.serialize(local), G).xp, m.xp, 'symmetrisch bei XP');

section('Prüfsumme');
eq(A.stateHash({ a: 1 }) === A.stateHash({ a: 1 }), true, 'gleicher Stand, gleiche Prüfsumme');
eq(A.stateHash({ a: 1 }) === A.stateHash({ a: 2 }), false, 'anderer Stand, andere Prüfsumme');

/* ---------- Lizenz-Entscheid ---------- */

section('Lizenz-Entscheid');
const NOW = Date.UTC(2026, 10, 15);
const iso = (d) => new Date(NOW + d * 86400000).toISOString();
const dec = (lics, code) => A.licenseDecision(lics, { now: NOW, localCode: !!code });
eq(dec([]).premium, false, 'keine Lizenz, kein Code: kein Premium');
eq([dec([], true).premium, dec([], true).source], [true, 'code'], 'nur lokaler Code: Premium (Quelle code)');
eq(dec([{ plan: 'lifetime', status: 'active' }]).source, 'license', 'Lifetime aktiv: Premium');
eq(dec([{ plan: 'lifetime', status: 'canceled' }]).premium, false, 'Lifetime zurückerstattet (canceled): kein Premium');
eq(dec([{ plan: 'jahr', status: 'active', current_period_end: iso(200) }]).premium, true, 'Jahresabo aktiv');
eq(dec([{ plan: 'monat', status: 'active', current_period_end: iso(-2) }]).premium, true, 'aktiv, Periodenende vor 2 Tagen: Kulanz');
eq(dec([{ plan: 'monat', status: 'active', current_period_end: iso(-4) }]).premium, false, 'aktiv, Periodenende vor 4 Tagen: abgelaufen');
eq(dec([{ plan: 'monat', status: 'canceled', current_period_end: iso(5) }]).premium, true, 'gekündigt: Zugang bis Periodenende');
eq(dec([{ plan: 'monat', status: 'canceled', current_period_end: iso(-1) }]).premium, false, 'gekündigt, Periode vorbei: kein Premium');
eq(dec([{ plan: 'monat', status: 'canceled', current_period_end: iso(-1) }], true).source, 'code', 'gekündigt, aber lokaler Code: Premium über Code');
eq(dec([{ plan: 'jahr', status: 'past_due', current_period_end: iso(3) }]).premium, true, 'Zahlung offen: bis Periodenende');
eq(dec([{ plan: 'jahr', status: 'past_due', current_period_end: null }]).premium, false, 'Zahlung offen ohne Periodenende: kein Premium');
eq(dec([{ plan: 'gratis', status: 'active' }]).premium, false, 'unbekannter Plan: kein Premium');
const best = dec([{ plan: 'monat', status: 'active', current_period_end: iso(10) }, { plan: 'lifetime', status: 'active' }]);
eq([best.license.plan, best.until], ['lifetime', null], 'mehrere Lizenzen: Lifetime gewinnt');
eq(dec([{ plan: 'monat', status: 'canceled', current_period_end: iso(-30) }]).license.plan, 'monat', 'abgelaufene Lizenz wird für die Anzeige mitgegeben');
eq(A.premiumCacheUntil(dec([{ plan: 'monat', status: 'active', current_period_end: iso(2) }]), NOW), NOW + 2 * 86400000, 'Cache höchstens bis Periodenende');
eq(A.premiumCacheUntil(dec([{ plan: 'lifetime', status: 'active' }]), NOW), NOW + 7 * 86400000, 'Cache höchstens 7 Tage');
eq(A.premiumCacheUntil(dec([], true), NOW), 0, 'Code wird nicht als Konto-Premium zwischengespeichert');

/* ---------- Magic-Link-Rücksprung ---------- */

section('Magic-Link-Rücksprung');
let r = A.parseAuthRedirect('?login=1', '#access_token=AT&refresh_token=RT&expires_in=3600&type=magiclink', '/app/');
eq([r.tokens, r.login, r.cleanUrl], [{ access_token: 'AT', refresh_token: 'RT' }, true, '/app/'], 'Tokens gelesen, URL ohne Hash und ohne login=1');
r = A.parseAuthRedirect('?pfad=basis&login=1', '#access_token=AT&refresh_token=RT', '/app/');
eq(r.cleanUrl, '/app/?pfad=basis', 'andere Parameter bleiben');
r = A.parseAuthRedirect('?pfad=basis', '#sverweis-1', '/app/');
eq([r.tokens, r.cleanUrl], [null, null], 'Übungs-Hash bleibt unangetastet');
r = A.parseAuthRedirect('?login=1', '#sverweis-1', '/app/');
eq(r.cleanUrl, '/app/#sverweis-1', 'login=1 entfernt, Übungs-Hash bleibt');
r = A.parseAuthRedirect('?login=1', '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid', '/app/');
eq([r.error.code, r.tokens, r.cleanUrl], ['otp_expired', null, '/app/'], 'abgelaufener Link: Fehler erkannt, Hash bereinigt');
r = A.parseAuthRedirect('?key=ABC&plan=jahr', '', '/app/');
eq([r.hadKey, r.cleanUrl], [true, null], '?key= bemerkt, URL nicht angefasst (app.js räumt ?key= auf)');

section('Hilfsfunktionen');
eq(A.shortEmail('luca.moser@example.ch'), 'luca.moser', 'E-Mail-Kürzel');
eq(A.shortEmail('sehr.lange.adresse.mit.punkten@example.ch'), 'sehr.lange.ad…', 'lange E-Mail gekürzt');
eq([A.validEmail('a@b.ch'), A.validEmail('a@b'), A.validEmail(' ')], [true, false, false], 'E-Mail-Prüfung');

/* ---------- Login-Ablauf mit Fake-Client ---------- */

function memStorage() {
  const m = new Map();
  return { get: (k) => (m.has(k) ? m.get(k) : null), set: (k, v) => m.set(k, String(v)), remove: (k) => m.delete(k), map: m };
}

// Minimaler Nachbau der benutzten supabase-js-Aufrufe. db: { progress: Map(uid -> state), licenses: [] }
function fakeClient(db, opts = {}) {
  const calls = [];
  let current = opts.session || null;
  let listener = null;
  const ok = (data) => Promise.resolve({ data, error: null });
  const client = {
    calls,
    auth: {
      getSession: () => ok({ session: current }),
      setSession: (t) => {
        calls.push(['setSession', t.access_token]);
        if (t.access_token === 'BAD') return Promise.resolve({ data: { session: null }, error: { message: 'invalid' } });
        current = { access_token: t.access_token, refresh_token: t.refresh_token, user: opts.user };
        return ok({ session: current });
      },
      signInWithOtp: (args) => {
        calls.push(['otp', args.email, args.options.emailRedirectTo, args.options.shouldCreateUser]);
        if (opts.rateLimit) return Promise.resolve({ data: null, error: { status: 429, message: 'For security purposes, you can only request this after 60 seconds' } });
        return ok({});
      },
      signOut: () => { calls.push(['signOut']); current = null; if (listener) listener('SIGNED_OUT', null); return ok({}); },
      onAuthStateChange: (cb) => { listener = cb; return { data: { subscription: { unsubscribe() {} } } }; }
    },
    from(table) {
      const q = { filters: [] };
      const run = () => {
        const uid = current && current.user.id;
        if (table === 'progress') {
          const row = db.progress.has(q.filters[0][1]) && q.filters[0][1] === uid ? { state: db.progress.get(uid), updated_at: 'x' } : null;
          return ok(row);
        }
        if (table === 'licenses') {
          const email = current && current.user.email;
          return ok(db.licenses.filter((l) => l.user_id === uid || l.email === email));
        }
        return ok(null);
      };
      const api = {
        select() { return api; },
        eq(c, v) { q.filters.push([c, v]); return api; },
        maybeSingle() { return run(); },
        then(res, rej) { return run().then(res, rej); },
        upsert(row, o) {
          calls.push(['upsert', table, o && o.onConflict]);
          if (opts.failUpsert) return Promise.resolve({ data: null, error: { message: 'offline' } });
          if (!current || row.user_id !== current.user.id) return Promise.resolve({ data: null, error: { message: 'RLS' } });
          db.progress.set(row.user_id, JSON.parse(JSON.stringify(row.state)));
          return ok(null);
        }
      };
      return api;
    },
    rpc(name) { calls.push(['rpc', name]); return ok(opts.rpcPremium !== undefined ? opts.rpcPremium : null); }
  };
  return client;
}

function fakeTimers() {
  let t = 0; const q = [];
  return {
    setTimeout: (fn, ms) => { const id = q.length + 1; q.push({ id, at: t + ms, fn }); return id; },
    clearTimeout: (id) => { const i = q.findIndex((x) => x.id === id); if (i >= 0) q.splice(i, 1); },
    advance(ms) { t += ms; q.sort((a, b) => a.at - b.at); while (q.length && q[0].at <= t) q.shift().fn(); },
    pending: () => q.length
  };
}

function fakeApp(initial) {
  const app = {
    state: G.serialize(G.migrate(initial)), premium: undefined, premiumCalls: 0, changes: [],
    getState: () => G.serialize(G.migrate(app.state)),
    setState: (s) => { app.state = G.serialize(G.migrate(s)); },
    setPremium: (d) => { app.premium = d; app.premiumCalls++; },
    localCodeValid: () => !!app.code,
    onChange: (what) => app.changes.push(what)
  };
  return app;
}

const tick = () => new Promise((r) => setTimeout(r, 0));
const USER = { id: 'u1', email: 'kunde@example.ch' };

section('Login-Ablauf (Fake-Client)');
{
  const db = { progress: new Map(), licenses: [{ user_id: null, email: 'kunde@example.ch', plan: 'jahr', status: 'active', current_period_end: iso(100) }] };
  db.progress.set('u1', G.serialize(server));
  const storage = memStorage();
  const timers = fakeTimers();
  const app = fakeApp(G.serialize(local));
  const client = fakeClient(db, { user: USER, rpcPremium: true });
  const ctrl = A.createController({ client, G, storage, app, redirectUrl: 'https://excel-drills.ch/app/?login=1', now: () => NOW, setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout });

  const sent = await ctrl.sendLink('kunde@example.ch');
  eq([sent.ok, client.calls[0]], [true, ['otp', 'kunde@example.ch', 'https://excel-drills.ch/app/?login=1', true]], 'Magic-Link angefordert, Rücksprung /app/?login=1');
  eq((await ctrl.sendLink('kein-mail')).error, 'email', 'ungültige E-Mail: kein Versand');

  const res = await ctrl.start(A.parseAuthRedirect('?login=1', '#access_token=AT&refresh_token=RT', '/app/'));
  eq([res.user.email, res.fresh, res.mode], ['kunde@example.ch', true, 'merge'], 'Rücksprung: Sitzung gesetzt, erster Login vereinigt');
  eq(app.state.xp, 500, 'lokaler Stand enthält Server-XP');
  eq(Object.keys(app.state.solved).sort(), ['a', 'b', 'c'], 'lokaler Stand enthält Server-Übungen');
  eq(Object.keys(db.progress.get('u1').solved).sort(), ['a', 'b', 'c'], 'vereinigter Stand auf den Server geschrieben');
  eq([app.premium.premium, app.premium.source, app.premium.license.plan], [true, 'license', 'jahr'], 'Lizenz über gleiche E-Mail erkannt: Premium');
  truthy(storage.get(A.PREMIUM_CACHE_KEY), 'Lizenz zwischengespeichert');
  eq(ctrl.isDirty(), false, 'nach dem Abgleich: nichts ausstehend');

  // Änderung -> Debounce 2 s
  const s2 = G.migrate(app.state); G.recordSolve(s2, exB, 0, at(2026, 11, 1)); app.state = G.serialize(s2);
  ctrl.notifyChange(); ctrl.notifyChange();
  eq(timers.pending(), 1, 'zwei Änderungen kurz hintereinander: ein Timer');
  timers.advance(1999); await tick();
  eq(db.progress.get('u1').mastery.b.n, 1, 'vor 2 s: noch nicht gesendet');
  timers.advance(1); await tick();
  eq(db.progress.get('u1').mastery.b.n, 2, 'nach 2 s: gesendet');
  eq(ctrl.isDirty(), false, 'danach nichts mehr ausstehend');
  ctrl.notifyChange();
  eq(timers.pending(), 0, 'ohne Änderung: kein Timer');

  await ctrl.signOut();
  eq([ctrl.state().user, app.premium, storage.get(A.PREMIUM_CACHE_KEY)], [null, null, null], 'Abmelden: Konto und Lizenz-Cache weg');
  eq(app.state.mastery.b.n, 2, 'Abmelden: Fortschritt bleibt lokal');
}

section('Zweiter Start: Server ist Wahrheit');
{
  const db = { progress: new Map(), licenses: [] };
  const storage = memStorage();
  const app = fakeApp(G.serialize(local));
  const sess = { access_token: 'AT', user: USER };
  let ctrl = A.createController({ client: fakeClient(db, { user: USER, session: sess }), G, storage, app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  let res = await ctrl.start({});
  eq([res.mode, res.fresh], ['upload', false], 'bestehende Sitzung, kein Server-Stand: lokaler Stand hochgeladen');
  eq(app.premium.premium, false, 'ohne Lizenz und Code: kein Premium');

  // anderes Gerät hat inzwischen mehr gemacht, aber auch etwas zurückgesetzt (Ziel geändert)
  const other = G.migrate(db.progress.get('u1')); other.goal = 1; other.xp = 999;
  db.progress.set('u1', G.serialize(other));
  ctrl = A.createController({ client: fakeClient(db, { user: USER, session: sess }), G, storage, app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  res = await ctrl.start({});
  eq([res.mode, app.state.xp, app.state.goal], ['server', 999, 1], 'lokal unverändert: Server-Stand übernommen');

  // lokal ungesicherte Änderung (z. B. offline) -> vereinigen statt überschreiben
  const loc = G.migrate(app.state); G.recordSolve(loc, { id: 'offline-ex' }, 0, at(2026, 11, 2)); app.state = G.serialize(loc);
  ctrl = A.createController({ client: fakeClient(db, { user: USER, session: sess }), G, storage, app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  res = await ctrl.start({});
  eq([res.mode, !!app.state.solved['offline-ex'], !!db.progress.get('u1').solved['offline-ex']], ['merge', true, true], 'ungesicherte lokale Änderung: vereinigt und hochgeladen');

  // anderes Konto auf demselben Gerät -> vereinigen (erster Login dieses Kontos)
  const other2 = { id: 'u2', email: 'zwei@example.ch' };
  ctrl = A.createController({ client: fakeClient(db, { user: other2, session: { access_token: 'X', user: other2 } }), G, storage, app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  res = await ctrl.start({});
  eq(res.mode, 'upload', 'anderes Konto ohne Server-Stand: lokaler Stand hochgeladen');
}

section('Lizenz und Kauf');
{
  const db = { progress: new Map(), licenses: [{ user_id: 'u1', email: 'kunde@example.ch', plan: 'monat', status: 'active', current_period_end: iso(20) }] };
  const app = fakeApp(null);
  const client = fakeClient(db, { user: USER, session: { access_token: 'AT', user: USER }, rpcPremium: false });
  const ctrl = A.createController({ client, G, storage: memStorage(), app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  await ctrl.start({});
  eq(app.premium.premium, false, 'has_premium() sagt nein: Server gewinnt');
  app.code = true;
  await ctrl.refreshLicenses();
  eq([app.premium.premium, app.premium.source], [true, 'code'], 'has_premium() nein, aber lokaler Code: Premium über Code');
}
{
  // Kauf: ?key= kommt, Webhook schreibt die Lizenz erst beim zweiten Versuch
  const db = { progress: new Map(), licenses: [] };
  const timers = fakeTimers();
  const app = fakeApp(null);
  const client = fakeClient(db, { user: USER, session: { access_token: 'AT', user: USER } });
  const ctrl = A.createController({ client, G, storage: memStorage(), app, now: () => NOW, setTimeout: timers.setTimeout, clearTimeout: timers.clearTimeout });
  const p = ctrl.start(A.parseAuthRedirect('?key=ABC&plan=jahr', '', '/app/'));
  for (let i = 0; i < 5; i++) await tick();
  eq(app.premium.premium, false, 'Kauf: erster Lizenz-Check noch ohne Lizenz');
  db.licenses.push({ user_id: 'u1', email: USER.email, plan: 'jahr', status: 'active', current_period_end: iso(365) });
  timers.advance(4000);
  await p;
  eq([app.premium.premium, app.premium.license.plan], [true, 'jahr'], 'Kauf: Lizenz beim nächsten Versuch erkannt');
}
{
  const app = fakeApp(null);
  const ctrl = A.createController({ client: fakeClient({ progress: new Map(), licenses: [] }, { user: USER }), G, storage: memStorage(), app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  const res = await ctrl.start({});
  eq([res.user, app.premium], [null, null], 'ohne Sitzung: nicht angemeldet, kein Konto-Premium');
  const bad = await A.createController({ client: fakeClient({ progress: new Map(), licenses: [] }, { user: USER }), G, storage: memStorage(), app, now: () => NOW }).start({ tokens: { access_token: 'BAD', refresh_token: '' } });
  eq([bad.user, bad.error], [null, 'link'], 'ungültiger Token: Fehler «link»');
  const rl = await A.createController({ client: fakeClient({ progress: new Map(), licenses: [] }, { rateLimit: true }), G, storage: memStorage(), app }).sendLink('a@b.ch');
  eq(rl.error, 'rate', 'Rate-Limit von Supabase erkannt');
}
{
  // Upload scheitert: Stand bleibt als ausstehend markiert
  const db = { progress: new Map(), licenses: [] };
  const app = fakeApp(G.serialize(local));
  const ctrl = A.createController({ client: fakeClient(db, { user: USER, session: { access_token: 'AT', user: USER }, failUpsert: true }), G, storage: memStorage(), app, now: () => NOW, setTimeout() {}, clearTimeout() {} });
  await ctrl.start({});
  eq([ctrl.state().error, ctrl.isDirty()], ['sync', true], 'Upload scheitert: Fehler angezeigt, Änderung bleibt ausstehend');
}
{
  // Verlassen der Seite: fetch(keepalive) an die REST-API
  const db = { progress: new Map(), licenses: [] };
  const app = fakeApp(null);
  const sent = [];
  const ctrl = A.createController({
    client: fakeClient(db, { user: USER, session: { access_token: 'AT', user: USER } }), G, storage: memStorage(), app,
    config: { supabaseUrl: 'https://proj.supabase.co/', supabaseAnonKey: 'anon' },
    fetch: (url, init) => { sent.push([url, init.keepalive, init.headers.Authorization, init.headers.Prefer]); return Promise.resolve({ ok: true }); },
    now: () => NOW, setTimeout: () => 1, clearTimeout() {}
  });
  await ctrl.start({});
  eq(ctrl.flush(), false, 'nichts ausstehend: kein Versand beim Verlassen');
  const s3 = G.migrate(app.state); G.recordSolve(s3, exA, 0, at(2026, 11, 3)); app.state = G.serialize(s3);
  eq(ctrl.flush(), true, 'ausstehend: Versand beim Verlassen');
  eq(sent[0], ['https://proj.supabase.co/rest/v1/progress?on_conflict=user_id', true, 'Bearer AT', 'resolution=merge-duplicates,return=minimal'], 'keepalive-POST mit Token und Upsert-Header');
}

/* ---------- Webhook-Logik ---------- */

section('Stripe-Webhook: Signatur');
const SECRET = 'whsec_test_123';
const body = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' });
const t = 1793000000;
const sig = createHmac('sha256', SECRET).update(t + '.' + body).digest('hex');
eq(await W.verifyStripeSignature(body, `t=${t},v1=${sig}`, SECRET, { nowSec: t + 10 }), { ok: true }, 'gültige Signatur');
eq((await W.verifyStripeSignature(body, `t=${t},v0=abc,v1=deadbeef,v1=${sig}`, SECRET, { nowSec: t })).ok, true, 'mehrere v1 (Secret-Rotation)');
eq((await W.verifyStripeSignature(body + ' ', `t=${t},v1=${sig}`, SECRET, { nowSec: t })).reason, 'mismatch', 'veränderter Body: abgelehnt');
eq((await W.verifyStripeSignature(body, `t=${t},v1=${sig}`, 'whsec_falsch', { nowSec: t })).reason, 'mismatch', 'falsches Secret: abgelehnt');
eq((await W.verifyStripeSignature(body, `t=${t},v1=${sig}`, SECRET, { nowSec: t + 301 })).reason, 'too-old', 'älter als 5 Minuten: abgelehnt');
eq((await W.verifyStripeSignature(body, '', SECRET)).reason, 'bad-header', 'ohne Header: abgelehnt');
eq((await W.verifyStripeSignature(body, `t=${t},v1=${sig}`, '')).reason, 'no-secret', 'ohne Secret: abgelehnt');

section('Stripe-Webhook: Plan und Lizenz');
const ENV = { PRICE_MONAT: 'price_m', PRICE_JAHR: 'price_j', PRICE_LIFETIME: 'price_l' };
eq([W.planFromPrice('price_m', 0, ENV), W.planFromPrice('price_j', 0, ENV), W.planFromPrice('price_l', 0, ENV)], ['monat', 'jahr', 'lifetime'], 'Plan über Price-ID');
eq([W.planFromPrice('price_x', 900, ENV), W.planFromPrice(null, 4900, {}), W.planFromPrice(null, 14900, {})], ['monat', 'jahr', 'lifetime'], 'Fallback über Betrag 900/4900/14900');
eq(W.planFromPrice(null, 1234, {}), null, 'unbekannter Betrag: kein Plan');
const subObj = { id: 'sub_1', status: 'active', cancel_at_period_end: false, items: { data: [{ price: { id: 'price_j' }, current_period_end: 1820000000 }] } };
let lic = W.licenseFromCheckout({ id: 'cs_1', mode: 'subscription', amount_total: 4900, customer: 'cus_1', subscription: 'sub_1', customer_details: { email: 'Kunde@Example.CH ' } }, { priceId: 'price_j', subscription: subObj }, ENV);
eq([lic.email, lic.plan, lic.status, lic.stripe_customer_id, lic.stripe_subscription_id, lic.current_period_end], ['kunde@example.ch', 'jahr', 'active', 'cus_1', 'sub_1', new Date(1820000000 * 1000).toISOString()], 'Abo-Checkout: Lizenz mit Periodenende (neue API: an den Positionen)');
lic = W.licenseFromCheckout({ id: 'cs_2', mode: 'payment', amount_total: 14900, customer: null, customer_email: 'x@y.ch' }, {}, {});
eq([lic.plan, lic.stripe_subscription_id, lic.stripe_session_id, lic.current_period_end], ['lifetime', null, 'cs_2', null], 'Einmalzahlung: Lifetime ohne Periodenende');
lic = W.licenseFromCheckout({ id: 'cs_3', mode: 'payment', amount_total: 0, customer_email: 'x@y.ch' }, {}, {});
eq(lic.plan, 'lifetime', 'Einmalzahlung mit Gutschein 100 %: trotzdem Lifetime');
eq(W.licensePatchFromSubscription({ status: 'active', cancel_at_period_end: true, current_period_end: 1800000000 }, false),
  { status: 'active', current_period_end: new Date(1800000000 * 1000).toISOString(), cancel_at_period_end: true }, 'Kündigung zum Periodenende: bleibt aktiv bis dahin');
eq(W.licensePatchFromSubscription({ status: 'canceled', current_period_end: 1800000000, ended_at: 1790000000 }, true).current_period_end,
  new Date(1790000000 * 1000).toISOString(), 'sofort beendet (deleted): Zugang endet bei ended_at');
eq([W.mapSubscriptionStatus('trialing'), W.mapSubscriptionStatus('unpaid'), W.mapSubscriptionStatus('incomplete_expired')], ['active', 'past_due', 'canceled'], 'Stripe-Status abgebildet');
eq([W.invoiceSubscriptionId({ subscription: 'sub_a' }), W.invoiceSubscriptionId({ parent: { subscription_details: { subscription: 'sub_b' } } }), W.invoiceSubscriptionId({})], ['sub_a', 'sub_b', null], 'Abo-ID der Rechnung (alte und neue API)');

// Ein Webhook-Lebenszyklus gegen has_premium-Regeln (licenseDecision): Kauf -> Kündigung -> Ende
const row = W.licenseFromCheckout({ id: 'cs_9', mode: 'subscription', amount_total: 900, subscription: 'sub_9', customer_email: 'k@x.ch' },
  { subscription: { id: 'sub_9', status: 'active', current_period_end: Math.floor(NOW / 1000) + 20 * 86400 } }, {});
eq(dec([row]).premium, true, 'Zyklus: nach Kauf Premium');
Object.assign(row, W.licensePatchFromSubscription({ status: 'active', cancel_at_period_end: true, current_period_end: Math.floor(NOW / 1000) + 20 * 86400 }, false));
eq(dec([row]).premium, true, 'Zyklus: gekündigt, Periode läuft noch: Premium');
Object.assign(row, W.licensePatchFromSubscription({ status: 'canceled', current_period_end: Math.floor(NOW / 1000) - 60, ended_at: Math.floor(NOW / 1000) - 60 }, true));
eq(dec([row]).premium, false, 'Zyklus: Periodenende erreicht (deleted): kein Premium');

console.log(failed ? `\n${failed} Fehler, ${passed} Tests bestanden.` : `\nAlle ${passed} Tests bestanden.`);
if (failed) process.exit(1);
