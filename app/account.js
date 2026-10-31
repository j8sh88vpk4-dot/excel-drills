/*
 * Excel-Drills – freiwilliges Konto «Fortschritt sichern» (Supabase, Magic-Link, kein Passwort)
 *
 * Ohne Eintrag in app/config.js (supabaseUrl, supabaseAnonKey) bleibt alles ausgeblendet und die App läuft wie bisher.
 *
 * Aufbau:
 *   1. Reine Logik (ohne DOM, ohne Netzwerk): mergeProgress, licenseDecision, parseAuthRedirect, stateHash …
 *      Läuft in Node (scripts/test-account.mjs lädt die Datei per vm-Kontext), wie app/gamification.js.
 *   2. createController(deps): Login-Ablauf, Abgleich und Lizenz-Check gegen einen supabase-js-Client.
 *      deps sind austauschbar, der Node-Test verwendet einen Fake-Client.
 *   3. Browser-Teil: liest den Magic-Link-Rücksprung (Hash) sofort, lädt supabase-js bei Bedarf vom CDN (SRI),
 *      zeichnet Header-Knopf, Login-Dialog und Profil-Abschnitt «Konto». app/app.js ruft boot(hooks) auf.
 *
 * Speicher (localStorage):
 *   excelDrillsAuth          Sitzung von supabase-js (Access- und Refresh-Token)
 *   excelDrillsSync          { uid, hash }  Konto und Prüfsumme des zuletzt abgeglichenen Stands
 *   excelDrillsAccountPremium { uid, until } zwischengespeicherte Lizenz (verhindert Paywall-Flackern beim Laden)
 */
(function (root) {
  'use strict';

  var SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js';
  var SDK_SRI = 'sha384-BWcjm9OdFth9TbhCxZPdm+gAOUMAzQy9nmTs12ioXdCcbVnJaPMn+fMUoQCLt60R';
  var PORTAL_URL = 'https://billing.stripe.com/p/login/28EdR2aQe4P35rActkbAs00';
  var AUTH_STORAGE_KEY = 'excelDrillsAuth';
  var SYNC_KEY = 'excelDrillsSync';
  var PREMIUM_CACHE_KEY = 'excelDrillsAccountPremium';
  var SYNC_DELAY = 2000;                 // Debounce nach einer Änderung
  var GRACE_DAYS = 3;                    // aktives Abo: Kulanz, falls «deleted»/«updated» verspätet eintrifft
  var PREMIUM_CACHE_DAYS = 7;            // so lange gilt die zwischengespeicherte Lizenz ohne Server-Check
  var LICENSE_RETRY = [0, 4000, 10000, 20000]; // nach Kauf (?key=): Webhook braucht evtl. einige Sekunden
  var DAY = 86400000;

  /* =====================================================================
   * 1. Reine Logik
   * ===================================================================== */

  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function num(n) { n = Number(n); return isFinite(n) && n >= 0 ? n : 0; }
  function keys(o) { return isObj(o) ? Object.keys(o) : []; }
  function union(a, b) {
    var out = [];
    (a || []).concat(b || []).forEach(function (x) { if (out.indexOf(x) === -1) out.push(x); });
    return out;
  }
  function maxStr(a, b) { a = a || ''; b = b || ''; return a > b ? a : b; }

  /*
   * Vereinigt zwei Gamification-Stände (lokal und Server), beide in beliebiger Version (G.migrate liest alles).
   * XP: Maximum. Gelöst: Vereinigung. Meisterschaft: pro Übung höhere Anzahl, Datensätze vereinigt (= Medaille max).
   * Tageshistorie (days: Maximum pro Tag, met: Vereinigung), heutige Übungen vereinigt, Streak: die jüngere bzw.
   * längere, Bestwert: Maximum. Abzeichen: Vereinigung (früherer Zeitstempel). Tagesziel: Server, sonst lokal.
   * G: ExcelDrillsGamification. Rückgabe: serialisierter Stand (v2).
   */
  function mergeProgress(localRaw, serverRaw, G) {
    var hasServer = isObj(serverRaw) && Object.keys(serverRaw).length > 0;
    var a = G.migrate(localRaw);
    if (!hasServer) return G.serialize(a);
    var b = G.migrate(serverRaw);
    var s = G.emptyState();

    s.xp = Math.max(num(a.xp), num(b.xp));
    keys(a.solved).concat(keys(b.solved)).forEach(function (id) { s.solved[id] = true; });

    keys(a.mastery).concat(keys(b.mastery)).forEach(function (id) {
      if (s.mastery[id]) return;
      var x = a.mastery[id], y = b.mastery[id];
      if (!x || !y) { s.mastery[id] = JSON.parse(JSON.stringify(x || y)); return; }
      var hi = x.n >= y.n ? x : y;
      s.mastery[id] = {
        n: Math.max(x.n, y.n),
        sets: union(x.sets, y.sets).sort(function (p, q) { return p - q; }),
        last: hi.last,
        goldDay: maxStr(x.goldDay, y.goldDay) || null
      };
    });

    keys(a.days).concat(keys(b.days)).forEach(function (k) { s.days[k] = Math.max(num(a.days[k]), num(b.days[k])); });
    keys(a.met).concat(keys(b.met)).forEach(function (k) { s.met[k] = 1; });

    if (a.today.date === b.today.date) s.today = { date: a.today.date, ids: union(a.today.ids, b.today.ids) };
    else s.today = a.today.date > b.today.date ? { date: a.today.date, ids: a.today.ids.slice() } : { date: b.today.date, ids: b.today.ids.slice() };
    if (s.today.date) s.days[s.today.date] = Math.max(num(s.days[s.today.date]), s.today.ids.length);

    var sa = a.streak, sb = b.streak;
    if (sa.last === sb.last) s.streak = { count: Math.max(sa.count, sb.count), last: sa.last };
    else s.streak = sa.last > sb.last ? { count: sa.count, last: sa.last } : { count: sb.count, last: sb.last };
    s.bestStreak = Math.max(num(a.bestStreak), num(b.bestStreak), s.streak.count);

    s.goal = b.goal || a.goal;
    keys(a.badges).concat(keys(b.badges)).forEach(function (k) {
      var ta = num(a.badges[k]), tb = num(b.badges[k]);
      s.badges[k] = ta && tb ? Math.min(ta, tb) : (ta || tb || 1);
    });
    s.flags = { early: !!(a.flags.early || b.flags.early), night: !!(a.flags.night || b.flags.night) };
    s.levelSeen = a.levelSeen === null && b.levelSeen === null ? null : Math.max(a.levelSeen || 0, b.levelSeen || 0);
    return G.serialize(G.migrate(G.serialize(s)));
  }

  // Prüfsumme (djb2) über den serialisierten Stand: «hat sich lokal seit dem letzten Abgleich etwas geändert?»
  function stateHash(state) {
    var str = typeof state === 'string' ? state : JSON.stringify(state);
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + ':' + str.length;
  }

  function timeOf(v) {
    if (v === null || v === undefined || v === '') return null;
    var t = typeof v === 'number' ? v : Date.parse(v);
    return isFinite(t) ? t : null;
  }

  // Gilt eine einzelne Lizenz zum Zeitpunkt now (ms)? Gleiche Regeln wie has_premium() in der SQL-Migration.
  function licenseActive(l, now) {
    if (!l) return false;
    var end = timeOf(l.current_period_end);
    if (l.plan === 'lifetime') return l.status === 'active';
    if (l.plan !== 'monat' && l.plan !== 'jahr') return false;
    if (l.status === 'active') return end === null || end + GRACE_DAYS * DAY > now;
    if (l.status === 'canceled' || l.status === 'past_due') return end !== null && end > now;
    return false;
  }

  /*
   * Premium-Entscheid. licenses: Zeilen aus der Tabelle licenses (nur eigene, per RLS).
   * opts: { now: ms, localCode: true, wenn ein gültiger Code in diesem Browser liegt }
   * Rückgabe: { premium, source: 'license'|'code'|null, license: beste gültige (sonst jüngste) Lizenz, until: ms|null }
   */
  function licenseDecision(licenses, opts) {
    opts = opts || {};
    var now = opts.now || Date.now();
    var list = Array.isArray(licenses) ? licenses : [];
    var rank = function (l) {
      if (l.plan === 'lifetime') return Infinity;
      return timeOf(l.current_period_end) || now + 1;
    };
    var active = list.filter(function (l) { return licenseActive(l, now); })
      .sort(function (x, y) { return rank(y) - rank(x); });
    if (active.length) {
      var best = active[0];
      return { premium: true, source: 'license', license: best, until: best.plan === 'lifetime' ? null : timeOf(best.current_period_end) };
    }
    var latest = list.slice().sort(function (x, y) { return (timeOf(y.current_period_end) || 0) - (timeOf(x.current_period_end) || 0); })[0] || null;
    if (opts.localCode) return { premium: true, source: 'code', license: latest, until: null };
    return { premium: false, source: null, license: latest, until: null };
  }

  // Bis wann darf die Lizenz lokal zwischengespeichert gelten?
  function premiumCacheUntil(decision, now) {
    if (!decision || decision.source !== 'license') return 0;
    var cap = now + PREMIUM_CACHE_DAYS * DAY;
    return decision.until ? Math.min(decision.until, cap) : cap;
  }

  /*
   * Magic-Link-Rücksprung lesen: /app/?login=1#access_token=…&refresh_token=…&type=magiclink
   * oder bei Fehlern #error=…&error_code=otp_expired&error_description=…
   * Hash-Werte, die keine Auth-Parameter sind (Übungs-IDs wie #sverweis-1), bleiben unangetastet.
   * Rückgabe: { tokens, error, login, hadKey, cleanUrl (oder null, wenn nichts zu bereinigen ist) }
   */
  function parseAuthRedirect(search, hash, pathname) {
    var params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
    var h = String(hash || '').replace(/^#/, '');
    var out = { tokens: null, error: null, login: params.get('login') === '1', hadKey: params.get('key') !== null, cleanUrl: null };
    var isAuthHash = /(^|&)(access_token|error|error_code|error_description)=/.test(h);
    var hp = isAuthHash ? new URLSearchParams(h) : null;
    if (hp && hp.get('access_token')) {
      out.tokens = { access_token: hp.get('access_token'), refresh_token: hp.get('refresh_token') || '' };
    } else if (hp && (hp.get('error') || hp.get('error_code'))) {
      out.error = { code: hp.get('error_code') || hp.get('error'), description: hp.get('error_description') || '' };
    } else if (params.get('error_code') || params.get('error')) {
      out.error = { code: params.get('error_code') || params.get('error'), description: params.get('error_description') || '' };
    }
    var dirty = isAuthHash || params.has('login') || params.has('error') || params.has('error_code') || params.has('error_description');
    if (dirty) {
      ['login', 'error', 'error_code', 'error_description'].forEach(function (k) { params.delete(k); });
      var q = params.toString();
      out.cleanUrl = (pathname || '') + (q ? '?' + q : '') + (isAuthHash ? '' : (h ? '#' + h : ''));
    }
    return out;
  }

  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim()); }

  // «luca.moser@example.ch» -> «luca.moser»; lange Namen gekürzt
  function shortEmail(email) {
    var local = String(email || '').split('@')[0] || '';
    return local.length > 14 ? local.slice(0, 13) + '…' : local;
  }
  function initial(email) { return (String(email || '?').trim()[0] || '?').toUpperCase(); }

  /* =====================================================================
   * 2. Controller (Login, Abgleich, Lizenz) – ohne DOM
   * deps: {
   *   client: supabase-js-Client (oder Fake), G: Gamification, storage: { get, set, remove },
   *   app: { getState(), setState(state), setPremium(decision|null), localCodeValid(), onChange(info) },
   *   config: { supabaseUrl, supabaseAnonKey }, redirectUrl, fetch, now(), setTimeout, clearTimeout
   * }
   * ===================================================================== */

  function createController(deps) {
    var client = deps.client, G = deps.G, store = deps.storage, app = deps.app;
    var now = deps.now || function () { return Date.now(); };
    var setT = deps.setTimeout || function (fn, ms) { return setTimeout(fn, ms); };
    var clearT = deps.clearTimeout || function (id) { clearTimeout(id); };
    var session = null;
    var timer = null;
    var uploading = null;
    var state = { user: null, syncing: false, lastSync: null, error: null, decision: null, licenses: [] };

    function readJson(k) { try { return JSON.parse(store.get(k) || 'null'); } catch (e) { return null; } }
    function writeJson(k, v) { store.set(k, JSON.stringify(v)); }
    function emit(what) { if (app.onChange) app.onChange(what, state); }
    function localJson() { return JSON.stringify(app.getState()); }

    function markSynced(json) {
      writeJson(SYNC_KEY, { uid: state.user.id, hash: stateHash(json) });
      state.lastSync = now();
    }

    // Lädt den eigenen Stand; erster Login (bzw. ungesicherte lokale Änderungen): vereinigen, sonst gilt der Server.
    function pullAndMerge() {
      var uid = state.user.id;
      return client.from('progress').select('state, updated_at').eq('user_id', uid).maybeSingle().then(function (res) {
        if (res.error) throw res.error;
        var server = res.data ? res.data.state : null;
        var local = app.getState();
        var sync = readJson(SYNC_KEY);
        var localClean = !!sync && sync.uid === uid && sync.hash === stateHash(JSON.stringify(local));
        var result, mode;
        if (server && localClean) { result = G.serialize(G.migrate(server)); mode = 'server'; }
        else { result = mergeProgress(local, server, G); mode = server ? 'merge' : 'upload'; }
        if (JSON.stringify(result) !== JSON.stringify(local)) app.setState(result);
        var json = localJson();
        var serverJson = server ? JSON.stringify(G.serialize(G.migrate(server))) : null;
        if (json !== serverJson) return upload(json).then(function (ok) { if (!ok) throw new Error('sync'); return mode; });
        markSynced(json);
        return mode;
      });
    }

    function upload(json) {
      if (!state.user) return Promise.resolve(false);
      json = json || localJson();
      var uid = state.user.id;
      state.syncing = true; emit('sync');
      uploading = client.from('progress').upsert({ user_id: uid, state: JSON.parse(json) }, { onConflict: 'user_id' })
        .then(function (res) {
          state.syncing = false; uploading = null;
          if (res.error) { state.error = 'sync'; emit('sync'); return false; }
          if (state.user && state.user.id === uid) markSynced(json);
          state.error = null; emit('sync');
          return true;
        }, function () { state.syncing = false; uploading = null; state.error = 'sync'; emit('sync'); return false; });
      return uploading;
    }

    function isDirty() {
      var sync = readJson(SYNC_KEY);
      return !sync || !state.user || sync.uid !== state.user.id || sync.hash !== stateHash(localJson());
    }

    // Von app.js nach jedem Speichern aufgerufen
    function notifyChange() {
      if (!state.user || !isDirty()) return;
      if (timer) clearT(timer);
      timer = setT(function () { timer = null; if (isDirty()) upload(); }, SYNC_DELAY);
    }

    // Beim Verlassen der Seite: ausstehende Änderung sofort per fetch(keepalive) senden
    function flush() {
      if (timer) { clearT(timer); timer = null; }
      if (!state.user || !session || !isDirty() || !deps.fetch || !deps.config) return false;
      var json = localJson();
      try {
        deps.fetch(deps.config.supabaseUrl.replace(/\/$/, '') + '/rest/v1/progress?on_conflict=user_id', {
          method: 'POST', keepalive: true,
          headers: {
            apikey: deps.config.supabaseAnonKey, Authorization: 'Bearer ' + session.access_token,
            'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal'
          },
          body: JSON.stringify({ user_id: state.user.id, state: JSON.parse(json) })
        });
        markSynced(json);   // Best effort; scheitert der Versand, vereinigt der nächste Start (Hash passt dann nicht)
      } catch (e) { return false; }
      return true;
    }

    function applyDecision(decision) {
      state.decision = decision;
      var until = premiumCacheUntil(decision, now());
      if (until && state.user) writeJson(PREMIUM_CACHE_KEY, { uid: state.user.id, until: until });
      else store.remove(PREMIUM_CACHE_KEY);
      app.setPremium(decision);
      emit('license');
      return decision;
    }

    // Lizenzen lesen (RLS: nur eigene) und mit has_premium() gegenprüfen
    function refreshLicenses() {
      if (!state.user) return Promise.resolve(null);
      var localCode = !!(app.localCodeValid && app.localCodeValid());
      return client.from('licenses').select('plan, status, current_period_end, cancel_at_period_end, created_at').then(function (res) {
        if (res.error) throw res.error;
        state.licenses = res.data || [];
        var decision = licenseDecision(state.licenses, { now: now(), localCode: localCode });
        if (!client.rpc) return decision;
        return Promise.resolve(client.rpc('has_premium')).then(function (r) {
          // Server sagt nein, Client ja (z. B. Uhr falsch gestellt): Server gewinnt, ausser lokaler Code
          if (r && !r.error && r.data === false && decision.source === 'license') {
            decision = { premium: localCode, source: localCode ? 'code' : null, license: decision.license, until: null };
          }
          return decision;
        }, function () { return decision; });
      }).then(applyDecision, function () { state.error = 'license'; emit('license'); return null; });
    }

    // Nach Kauf (?key=…): der Webhook schreibt die Lizenz evtl. erst nach einigen Sekunden
    function refreshLicensesAfterPurchase() {
      var i = 0;
      var attempt = function () {
        return refreshLicenses().then(function (d) {
          i += 1;
          if ((d && d.source === 'license') || i >= LICENSE_RETRY.length) return d;
          return new Promise(function (resolve) { setT(function () { resolve(attempt()); }, LICENSE_RETRY[i]); });
        });
      };
      return attempt();
    }

    function signedIn(sess, opts) {
      opts = opts || {};
      session = sess;
      state.user = { id: sess.user.id, email: sess.user.email || '' };
      emit('user');
      return pullAndMerge().then(function (mode) {
        state.error = null;
        emit('sync');
        return (opts.afterPurchase ? refreshLicensesAfterPurchase() : refreshLicenses()).then(function () { return mode; });
      }, function () {
        state.error = 'sync'; emit('sync');
        return refreshLicenses().then(function () { return 'error'; });
      });
    }

    /*
     * Start: Rücksprung-Tokens übernehmen, bestehende Sitzung laden.
     * redirect: Ergebnis von parseAuthRedirect. Rückgabe: Promise<{ user, fresh, mode }>
     */
    function start(redirect) {
      redirect = redirect || {};
      var first = redirect.tokens ? client.auth.setSession(redirect.tokens) : client.auth.getSession();
      if (client.auth.onAuthStateChange) {
        client.auth.onAuthStateChange(function (event, sess) {
          if (event === 'SIGNED_OUT') { if (state.user) clearUser(); }
          else if (sess && state.user && sess.user && sess.user.id === state.user.id) session = sess; // TOKEN_REFRESHED
        });
      }
      return Promise.resolve(first).then(function (res) {
        var sess = res && res.data && res.data.session;
        if (!sess) {
          clearCacheIfNoSession();
          return { user: null, fresh: false, error: res && res.error ? 'link' : null };
        }
        return signedIn(sess, { afterPurchase: redirect.hadKey }).then(function (mode) {
          return { user: state.user, fresh: !!redirect.tokens, mode: mode };
        });
      }, function () { return { user: null, fresh: false, error: 'link' }; });
    }

    function clearCacheIfNoSession() { store.remove(PREMIUM_CACHE_KEY); app.setPremium(null); }

    function clearUser() {
      state.user = null; session = null; state.decision = null; state.licenses = [];
      store.remove(PREMIUM_CACHE_KEY);
      app.setPremium(null);
      emit('user');
    }

    // Magic-Link anfordern (legt das Konto beim ersten Mal an)
    function sendLink(email) {
      email = String(email || '').trim();
      if (!validEmail(email)) return Promise.resolve({ ok: false, error: 'email' });
      return Promise.resolve(client.auth.signInWithOtp({
        email: email, options: { emailRedirectTo: deps.redirectUrl, shouldCreateUser: true }
      })).then(function (res) {
        if (res && res.error) {
          var rate = res.error.status === 429 || /rate|seconds|too many/i.test(res.error.message || '');
          return { ok: false, error: rate ? 'rate' : 'send' };
        }
        return { ok: true };
      }, function () { return { ok: false, error: 'send' }; });
    }

    // Abmelden: ausstehenden Stand zuerst sichern. Der Fortschritt bleibt in diesem Browser.
    function signOut() {
      if (timer) { clearT(timer); timer = null; }
      var pending = state.user && isDirty() ? upload() : Promise.resolve(true);
      return pending.then(function () {
        return Promise.resolve(client.auth.signOut()).catch(function () { /* lokal trotzdem abmelden */ });
      }).then(function () { clearUser(); return true; });
    }

    return {
      start: start, sendLink: sendLink, signOut: signOut, notifyChange: notifyChange, flush: flush,
      refreshLicenses: refreshLicenses, upload: upload, isDirty: isDirty,
      state: function () { return state; }
    };
  }

  // Zwischengespeicherte Lizenz (synchron beim Laden), nur wenn noch eine Sitzung im Browser liegt
  function cachedPremium(storage, nowMs) {
    try {
      var c = JSON.parse(storage.get(PREMIUM_CACHE_KEY) || 'null');
      if (!c || !c.uid || !(c.until > nowMs)) return false;
      return !!storage.get(AUTH_STORAGE_KEY);
    } catch (e) { return false; }
  }

  var logic = {
    mergeProgress: mergeProgress, licenseDecision: licenseDecision, licenseActive: licenseActive, stateHash: stateHash,
    parseAuthRedirect: parseAuthRedirect, premiumCacheUntil: premiumCacheUntil, cachedPremium: cachedPremium,
    shortEmail: shortEmail, validEmail: validEmail, createController: createController,
    SYNC_DELAY: SYNC_DELAY, GRACE_DAYS: GRACE_DAYS, PORTAL_URL: PORTAL_URL, SDK_URL: SDK_URL, SDK_SRI: SDK_SRI,
    SYNC_KEY: SYNC_KEY, PREMIUM_CACHE_KEY: PREMIUM_CACHE_KEY, AUTH_STORAGE_KEY: AUTH_STORAGE_KEY
  };

  /* =====================================================================
   * 3. Browser
   * ===================================================================== */

  var hasDom = typeof document !== 'undefined' && typeof root.location !== 'undefined';
  var cfg = root.ExcelDrillsConfig || {};
  var enabled = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);

  var storage = {
    get: function (k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { root.localStorage.setItem(k, v); } catch (e) { /* privat */ } },
    remove: function (k) { try { root.localStorage.removeItem(k); } catch (e) { /* ignorieren */ } }
  };

  // Rücksprung sofort lesen und URL bereinigen, bevor app.js den Hash (Übungs-IDs) auswertet
  var redirect = { tokens: null, error: null, login: false, hadKey: false, cleanUrl: null };
  if (hasDom && enabled) {
    redirect = parseAuthRedirect(root.location.search, root.location.hash, root.location.pathname);
    if (redirect.cleanUrl !== null) {
      try { root.history.replaceState(null, '', redirect.cleanUrl); } catch (e) { /* ignorieren */ }
    }
  }

  var sdkPromise = null;
  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      if (root.supabase && root.supabase.createClient) { resolve(root.supabase); return; }
      var tag = document.createElement('script');
      tag.src = SDK_URL;
      tag.integrity = SDK_SRI;
      tag.crossOrigin = 'anonymous';
      tag.onload = function () { root.supabase && root.supabase.createClient ? resolve(root.supabase) : reject(new Error('supabase-js fehlt')); };
      tag.onerror = function () { sdkPromise = null; tag.remove(); reject(new Error('supabase-js nicht geladen')); };
      document.head.appendChild(tag);
    });
    return sdkPromise;
  }

  function boot(hooks) {
    if (!hasDom || !enabled) return null;
    var T = hooks.T;
    var $ = function (id) { return document.getElementById(id); };
    var el = {
      wrap: $('account'), login: $('account-login'), btn: $('account-btn'), menu: $('account-menu'),
      avatar: $('account-avatar'), name: $('account-name'), menuEmail: $('account-menu-email'),
      menuProfile: $('account-menu-profile'), menuLogout: $('account-menu-logout'),
      dialog: $('login-dialog'), close: $('login-close'), form: $('login-form'), email: $('login-email'),
      submit: $('login-submit'), msg: $('login-msg'), sent: $('login-sent'), sentText: $('login-sent-text'),
      again: $('login-again'), pf: $('pf-account'), pfBody: $('pf-account-body'), storageNote: $('pf-storage'), resetQ: $('reset-q')
    };
    if (!el.wrap || !el.dialog || !el.pf) return null;

    var ctrl = null;
    var ctrlPromise = null;
    var view = { user: null, syncing: false, error: null, decision: null };

    function ensureController() {
      if (ctrlPromise) return ctrlPromise;
      ctrlPromise = loadSdk().then(function (sb) {
        var client = sb.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
          auth: { flowType: 'implicit', detectSessionInUrl: false, persistSession: true, autoRefreshToken: true, storageKey: AUTH_STORAGE_KEY }
        });
        ctrl = createController({
          client: client, G: root.ExcelDrillsGamification, storage: storage, config: cfg,
          redirectUrl: root.location.origin + '/app/?login=1',
          fetch: root.fetch ? root.fetch.bind(root) : null,
          app: {
            getState: hooks.getState, setState: hooks.setState, setPremium: hooks.setPremium,
            localCodeValid: hooks.localCodeValid,
            onChange: function (what, st) {
              view.user = st.user; view.syncing = st.syncing; view.error = st.error; view.decision = st.decision; view.licenses = st.licenses;
              render();
            }
          }
        });
        return ctrl;
      });
      ctrlPromise.catch(function () { ctrlPromise = null; });
      return ctrlPromise;
    }

    /* ---------- Darstellung ---------- */

    function fmtDate(ms) {
      var d = new Date(ms);
      return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
    }
    function esc(t) { return hooks.escapeHtml ? hooks.escapeHtml(t) : String(t); }

    function licenseLine() {
      var d = view.decision;
      var l = d && d.license;
      if (!l) return esc(T('account.noLicense'));
      var plan = T('account.plan.' + l.plan);
      var end = l.current_period_end ? Date.parse(l.current_period_end) : null;
      if (d.source === 'license') {
        if (l.plan === 'lifetime') return esc(T('account.licLifetime', { plan: plan }));
        if (l.status === 'active' && !l.cancel_at_period_end) return esc(end ? T('account.licRenews', { plan: plan, date: fmtDate(end) }) : T('account.licActive', { plan: plan }));
        if (l.status === 'past_due') return esc(T('account.licPastDue', { plan: plan, date: end ? fmtDate(end) : '' }));
        return esc(T('account.licEnds', { plan: plan, date: end ? fmtDate(end) : '' }));
      }
      return esc(T('account.licExpired', { plan: plan, date: end ? fmtDate(end) : '' }));
    }

    function render() {
      var u = view.user;
      el.wrap.hidden = false;
      el.login.hidden = !!u;
      el.btn.parentNode.hidden = !u;
      if (u) {
        el.avatar.textContent = initial(u.email);
        el.name.textContent = shortEmail(u.email);
        el.btn.title = u.email;
        el.btn.setAttribute('aria-label', T('account.menuLabel', { email: u.email }));
        el.menuEmail.textContent = u.email;
      } else {
        closeMenu();
      }
      el.btn.classList.toggle('syncing', !!view.syncing);
      el.pf.hidden = false;
      var html;
      if (!u) {
        html = '<p>' + esc(T('account.pfIntro')) + '</p>' +
          '<p><button class="btn btn-small" type="button" data-account-login>' + esc(T('account.loginBtn')) + '</button></p>';
      } else {
        var status = view.error === 'sync' ? T('account.syncError') : view.syncing ? T('account.syncing') : T('account.synced');
        var l = view.decision && view.decision.license;
        html = '<p>' + esc(T('account.signedInAs')) + ' <strong>' + esc(u.email) + '</strong></p>' +
          '<p class="fine account-status' + (view.error === 'sync' ? ' code-err' : '') + '">' + esc(status) + '</p>' +
          '<p><strong>' + esc(T('account.premium')) + ':</strong> ' + licenseLine() + '</p>' +
          '<p class="account-actions">' +
          (l && (l.plan === 'monat' || l.plan === 'jahr') ? '<a class="btn btn-secondary btn-small" href="' + PORTAL_URL + '" rel="noopener" target="_blank">' + esc(T('account.manage')) + '</a> ' : '') +
          '<button class="btn btn-secondary btn-small" type="button" data-account-logout>' + esc(T('account.logout')) + '</button></p>' +
          '<p class="fine">' + esc(T('account.deleteHint')) + '</p>';
      }
      el.pfBody.innerHTML = html;
      if (el.storageNote) el.storageNote.textContent = u ? T('account.storageSynced') : T('account.storageLocal');
      if (el.resetQ) el.resetQ.textContent = u ? T('account.resetQ') : T('html.resetQ');
    }

    /* ---------- Menü ---------- */

    function closeMenu() {
      if (el.menu.hidden) return;
      el.menu.hidden = true;
      el.btn.setAttribute('aria-expanded', 'false');
    }
    function toggleMenu() {
      var open = el.menu.hidden;
      el.menu.hidden = !open;
      el.btn.setAttribute('aria-expanded', String(open));
      if (open) el.menuProfile.focus();
    }

    /* ---------- Login-Dialog ---------- */

    function openLogin(trigger) {
      el.form.hidden = false;
      el.sent.hidden = true;
      el.msg.textContent = '';
      el.msg.className = 'fine';
      el.email.removeAttribute('aria-invalid');
      el.submit.disabled = false;
      hooks.openDialog(el.dialog, el.email, trigger);
      ensureController().catch(function () { showLoginError(T('account.sdkFailed')); });
    }
    function showLoginError(text) {
      el.msg.className = 'fine code-err';
      el.msg.textContent = text;
      el.email.setAttribute('aria-invalid', 'true');
      el.email.focus();
    }
    function onSubmit(evt) {
      evt.preventDefault();
      var email = el.email.value.trim();
      if (!validEmail(email)) { showLoginError(T('account.emailInvalid')); return; }
      el.submit.disabled = true;
      el.msg.className = 'fine';
      el.msg.textContent = T('account.sending');
      ensureController().then(function (c) { return c.sendLink(email); }).then(function (r) {
        el.submit.disabled = false;
        if (!r.ok) { showLoginError(T(r.error === 'rate' ? 'account.rateLimited' : r.error === 'email' ? 'account.emailInvalid' : 'account.sendFailed')); return; }
        el.msg.textContent = '';
        el.form.hidden = true;
        el.sent.hidden = false;
        el.sentText.textContent = T('account.sentText', { email: email });
        el.again.focus();
        if (hooks.track) hooks.track('konto_link');
      }, function () { el.submit.disabled = false; showLoginError(T('account.sdkFailed')); });
    }

    function logout() {
      closeMenu();
      if (!ctrl) return;
      ctrl.signOut().then(function () { hooks.toast(T('account.loggedOut'), T('account.loggedOutText')); });
    }

    /* ---------- Verdrahtung ---------- */

    hooks.wireDialog(el.dialog);
    el.login.addEventListener('click', function () { openLogin(el.login); });
    el.close.addEventListener('click', function () { el.dialog.close(); });
    el.form.addEventListener('submit', onSubmit);
    el.email.addEventListener('input', function () { el.email.removeAttribute('aria-invalid'); });
    el.again.addEventListener('click', function () { el.sent.hidden = true; el.form.hidden = false; el.email.focus(); el.email.select(); });
    el.btn.addEventListener('click', toggleMenu);
    el.menuProfile.addEventListener('click', function () { closeMenu(); hooks.openProfile(el.pf); });
    el.menuLogout.addEventListener('click', logout);
    document.addEventListener('click', function (e) {
      if (!el.menu.hidden && !el.menu.contains(e.target) && !el.btn.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.menu.hidden) { e.preventDefault(); closeMenu(); el.btn.focus(); }
    });
    el.pfBody.addEventListener('click', function (e) {
      if (e.target.closest('[data-account-login]')) openLogin(e.target.closest('button'));
      else if (e.target.closest('[data-account-logout]')) logout();
    });
    var leave = function () { if (ctrl) ctrl.flush(); };
    root.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') leave(); });

    render();

    if (redirect.error) hooks.notice(T(redirect.error.code === 'otp_expired' ? 'account.linkExpired' : 'account.linkFailed'), true);

    // supabase-js nur laden, wenn eine Sitzung vorhanden ist oder gerade ein Magic-Link zurückkommt
    if (redirect.tokens || storage.get(AUTH_STORAGE_KEY)) {
      ensureController().then(function (c) { return c.start(redirect); }).then(function (r) {
        if (r.error === 'link') hooks.notice(T('account.linkFailed'), true);
        if (r.user && r.fresh) {
          hooks.toast(T('account.saved'), T('account.savedText', { email: r.user.email }));
          if (hooks.track) hooks.track('konto_login', { abgleich: r.mode || '' });
        }
      }, function () {
        if (redirect.tokens) hooks.notice(T('account.sdkFailed'), true);
        hooks.setPremium(null);
      });
    }

    return {
      notifyChange: function () { if (ctrl) ctrl.notifyChange(); },
      render: render,
      openLogin: openLogin,
      signedIn: function () { return !!view.user; }
    };
  }

  root.ExcelDrillsAccount = {
    logic: logic,
    enabled: function () { return enabled && hasDom; },
    cachedPremium: function () { return enabled && hasDom ? cachedPremium(storage, Date.now()) : false; },
    boot: boot
  };
})(typeof window !== 'undefined' ? window : globalThis);
