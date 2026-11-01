/*
 * Excel-Drills – Gamification-Logik (rein, ohne DOM)
 * Streak und Tagesziel, XP und Levels, Meisterschaft pro Übung (Bronze/Silber/Gold).
 * Läuft im Browser (window.ExcelDrillsGamification) und in Node (scripts/test-gamification.mjs
 * lädt diese Datei per vm-Kontext), wie app/engine.js.
 *
 * Gespeicherter Stand (localStorage «excelDrillsProgress», Version 3; v2 wird beim Laden ergänzt):
 * {
 *   v: 3,
 *   points: <= xp, bleibt für ältere Stände/Code erhalten,
 *   xp, solved: { <id>: true },
 *   mastery: { <id>: { n: korrekte Lösungen, sets: [Datensatz-Indizes], last: Index, goldDay: 'YYYY-MM-DD' } },
 *   days: { 'YYYY-MM-DD': Anzahl verschiedener Übungen an diesem Tag }  (letzte 90 Tage),
 *   met: { 'YYYY-MM-DD': 1 }  Tage mit erreichtem Tagesziel (letzte 90 Tage),
 *   today: { date, ids: [] }  heute gelöste Übungen (für «verschiedene Übungen pro Tag»),
 *   streak: { count, last: 'YYYY-MM-DD' }, bestStreak,
 *   goal: 1 | 2 | 5, badges: { <id>: Zeitstempel }, flags: { early, night }, levelSeen,
 *   errorProfile: { <Kategorie aus app/errors.js>: { wrong, right, last: 'YYYY-MM-DD' } }   (neu in v3, «Fehler-DNA»),
 *   review: { <id>: { due: 'YYYY-MM-DD', interval: 1 | 3 | 7 | 14 | 30, streak } }       (neu in v3, Wiederholung)
 * }
 * Datensatz-Index 0 = Originaldaten (ex.data), 1..k = ex.alt[i-1].
 */
(function (root) {
  'use strict';

  var LEVELS = [
    { level: 1, name: 'Einstieg', min: 0 },
    { level: 2, name: 'Sachbearbeitung', min: 50 },
    { level: 3, name: 'Controlling', min: 150 },
    { level: 4, name: 'Analyse', min: 300 },
    { level: 5, name: 'Excel-Profi', min: 500 },
    { level: 6, name: 'Excel-Meisterschaft', min: 800 }
  ];
  // Ohne Premium endet der Aufstieg bei Level 4 (Level 5 und 6 brauchen alle Übungen).
  var FREE_LEVEL_CAP = 4;
  var XP = { first: 10, silver: 5, gold: 5, goldRepeat: 2 };
  var GOALS = [1, 2, 5];
  var DEFAULT_GOAL = 2;
  var HISTORY_DAYS = 90;
  var MEDALS = ['', 'Bronze', 'Silber', 'Gold'];
  var VERSION = 3;
  var INTERVALS = [1, 3, 7, 14, 30];  // Wiederholungsabstände in Tagen
  var DUE_LIMIT = 5;                  // höchstens so viele fällige Übungen pro Tag anzeigen
  var MIN_ATTEMPTS = 3;               // Kategorie zählt für «schwächste Kategorie» erst ab 3 Versuchen

  /* ---------- Datum (lokale Zeit) ---------- */

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(date) {
    var d = date instanceof Date ? date : new Date(date);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function parseDay(key) {
    var p = String(key).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0); // Mittag: robust gegen Sommerzeit
  }
  function addDays(key, n) {
    var d = parseDay(key);
    d.setDate(d.getDate() + n);
    return dayKey(d);
  }

  /* ---------- Stand anlegen, migrieren, speichern ---------- */

  function emptyState() {
    return {
      v: VERSION, xp: 0, solved: {}, mastery: {}, days: {}, met: {}, today: { date: '', ids: [] },
      streak: { count: 0, last: '' }, bestStreak: 0, goal: DEFAULT_GOAL, badges: {}, flags: { early: false, night: false }, levelSeen: null,
      errorProfile: {}, review: {}
    };
  }

  function isObj(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
  function num(n, fallback) { n = Number(n); return isFinite(n) && n >= 0 ? n : fallback; }

  var DAY_RE = /^\d{4}-\d\d-\d\d$/;
  function isDay(k) { return typeof k === 'string' && DAY_RE.test(k); }

  // Liest einen beliebigen gespeicherten Stand (alt: { points, solved }, v2 oder v3) verlustfrei ein.
  // v2 → v3: errorProfile und review starten leer, alles andere bleibt.
  function migrate(raw) {
    var s = emptyState();
    if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch (e) { raw = null; } }
    if (!isObj(raw)) return s;

    if (isObj(raw.solved)) {
      Object.keys(raw.solved).forEach(function (id) { if (raw.solved[id]) s.solved[id] = true; });
    }
    if (raw.v === 3) {
      if (isObj(raw.errorProfile)) {
        Object.keys(raw.errorProfile).forEach(function (c) {
          var e = raw.errorProfile[c];
          if (!isObj(e)) return;
          s.errorProfile[c] = { wrong: num(e.wrong, 0), right: num(e.right, 0), last: isDay(e.last) ? e.last : '' };
        });
      }
      if (isObj(raw.review)) {
        Object.keys(raw.review).forEach(function (id) {
          var r = raw.review[id];
          if (!isObj(r) || !isDay(r.due)) return;
          var iv = Number(r.interval);
          s.review[id] = { due: r.due, interval: INTERVALS.indexOf(iv) !== -1 ? iv : INTERVALS[0], streak: num(r.streak, 0) };
        });
      }
    }
    if (raw.v === 2 || raw.v === 3) {
      s.xp = num(raw.xp, num(raw.points, 0));
      if (isObj(raw.mastery)) {
        Object.keys(raw.mastery).forEach(function (id) {
          var m = raw.mastery[id];
          if (!isObj(m)) return;
          s.mastery[id] = {
            n: num(m.n, 0),
            sets: Array.isArray(m.sets) ? m.sets.filter(function (x) { return typeof x === 'number'; }) : [],
            last: typeof m.last === 'number' ? m.last : null,
            goldDay: typeof m.goldDay === 'string' ? m.goldDay : null
          };
        });
      }
      if (isObj(raw.days)) Object.keys(raw.days).forEach(function (k) { s.days[k] = num(raw.days[k], 0); });
      if (isObj(raw.met)) Object.keys(raw.met).forEach(function (k) { if (raw.met[k]) s.met[k] = 1; });
      if (isObj(raw.today) && Array.isArray(raw.today.ids)) s.today = { date: String(raw.today.date || ''), ids: raw.today.ids.slice() };
      if (isObj(raw.streak)) s.streak = { count: num(raw.streak.count, 0), last: String(raw.streak.last || '') };
      s.bestStreak = num(raw.bestStreak, s.streak.count);
      if (GOALS.indexOf(Number(raw.goal)) !== -1) s.goal = Number(raw.goal);
      if (isObj(raw.badges)) Object.keys(raw.badges).forEach(function (k) { s.badges[k] = num(raw.badges[k], 0) || 1; });
      if (isObj(raw.flags)) s.flags = { early: !!raw.flags.early, night: !!raw.flags.night };
      s.levelSeen = typeof raw.levelSeen === 'number' ? raw.levelSeen : null;
    } else {
      // Alter Stand: Punkte werden 1:1 zu XP, jede gelöste Übung erhält Bronze (1 Lösung mit Originaldaten).
      s.xp = num(raw.points, 0);
      Object.keys(s.solved).forEach(function (id) { s.mastery[id] = { n: 1, sets: [0], last: 0, goldDay: null }; });
    }
    // Jede gelöste Übung hat mindestens Bronze, jede Übung mit Meisterschaft gilt als gelöst.
    Object.keys(s.solved).forEach(function (id) {
      if (!s.mastery[id] || s.mastery[id].n < 1) s.mastery[id] = { n: 1, sets: [0], last: 0, goldDay: null };
    });
    Object.keys(s.mastery).forEach(function (id) { if (s.mastery[id].n > 0) s.solved[id] = true; });
    return s;
  }

  // Objekt für localStorage. «points» spiegelt die XP, damit ältere Leser den Stand verstehen.
  function serialize(s) {
    return {
      v: VERSION, points: s.xp, xp: s.xp, solved: s.solved, mastery: s.mastery, days: s.days, met: s.met,
      today: s.today, streak: s.streak, bestStreak: s.bestStreak, goal: s.goal, badges: s.badges,
      flags: s.flags, levelSeen: s.levelSeen, errorProfile: s.errorProfile || {}, review: s.review || {}
    };
  }

  // Entfernt Tageshistorie, die älter als 90 Tage ist (heute zählt mit).
  function prune(s, today) {
    var oldest = addDays(today, -(HISTORY_DAYS - 1));
    ['days', 'met'].forEach(function (field) {
      Object.keys(s[field]).forEach(function (k) { if (k < oldest) delete s[field][k]; });
    });
    return s;
  }

  /* ---------- Levels ---------- */

  // Level zu XP. Ohne Premium (unlocked = false) höchstens Level 4; capped zeigt an, dass mehr XP vorhanden wären.
  function levelFor(xp, unlocked) {
    xp = num(xp, 0);
    var idx = 0;
    for (var i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i;
    var rawLevel = LEVELS[idx].level;
    var capped = false;
    if (!unlocked && idx > FREE_LEVEL_CAP - 1) { idx = FREE_LEVEL_CAP - 1; capped = true; }
    var cur = LEVELS[idx];
    var next = LEVELS[idx + 1] || null;
    var lockedNext = !!next && !unlocked && next.level > FREE_LEVEL_CAP;
    var progress = next ? Math.min(1, (xp - cur.min) / (next.min - cur.min)) : 1;
    return {
      level: cur.level, name: cur.name, min: cur.min, xp: xp, rawLevel: rawLevel, capped: capped,
      next: next, nextLocked: lockedNext, progress: progress, toNext: next ? Math.max(0, next.min - xp) : 0
    };
  }

  /* ---------- Meisterschaft ---------- */

  function datasetCount(ex) { return 1 + ((ex && ex.alt) || []).length; }
  function hasAlt(ex) { return datasetCount(ex) > 1; }

  // 0 = keine, 1 = Bronze, 2 = Silber, 3 = Gold
  function medal(m, ex) {
    if (!m || !(m.n >= 1)) return 0;
    if (m.n >= 3 && (!hasAlt(ex) || uniq(m.sets).length >= 2)) return 3;
    if (m.n >= 2) return 2;
    return 1;
  }
  function medalOf(s, ex) { return medal(s.mastery[ex.id], ex); }
  function medalName(level) { return MEDALS[level] || ''; }
  function uniq(list) {
    var out = [];
    (list || []).forEach(function (x) { if (out.indexOf(x) === -1) out.push(x); });
    return out;
  }

  // Was fehlt zur nächsten Medaille? { key, n } für übersetzte Texte (App: «mastery.<key>»).
  function nextMedalInfo(m, ex) {
    var lvl = medal(m, ex);
    var n = m ? m.n : 0;
    if (lvl === 0) return { key: 'bronze' };
    if (lvl === 1) return { key: 'silver', n: 1 };
    if (lvl === 2) {
      if (!hasAlt(ex)) return { key: 'goldRepeat', n: 3 - n };
      if (uniq(m.sets).length < 2) return { key: 'goldOther' };
      return { key: 'goldMore', n: Math.max(1, 3 - n) };
    }
    return { key: hasAlt(ex) ? 'done' : 'doneRepeat' };
  }
  var NEXT_MEDAL_DE = {
    bronze: 'Löse die Übung für Bronze.', silver: 'Noch 1 korrekte Lösung bis Silber.',
    goldRepeat: 'Noch {n} Wiederholung bis Gold.', goldOther: 'Löse die Übung mit anderen Zahlen für Gold.',
    goldMore: 'Noch {n} korrekte Lösung bis Gold.', done: 'Gold erreicht.', doneRepeat: 'Gold erreicht (Wiederholung).'
  };
  // Deutscher Text für die Anzeige
  function nextMedalText(m, ex) {
    var i = nextMedalInfo(m, ex);
    return NEXT_MEDAL_DE[i.key].replace('{n}', String(i.n));
  }

  // Wählt für «Nochmal mit anderen Zahlen» einen Datensatz: zufällig, aber nicht derselbe wie zuletzt.
  // Bevorzugt alt-Datensätze; Übungen ohne alt-Datensatz verwenden immer die Originaldaten (0).
  function pickDataset(ex, last, rnd) {
    rnd = rnd || Math.random;
    var count = datasetCount(ex);
    if (count === 1) return 0;
    var pool = [];
    for (var i = 1; i < count; i++) if (i !== last) pool.push(i);
    if (!pool.length) return 0; // nur 1 alt-Datensatz und der war zuletzt dran: zurück zu den Originaldaten
    return pool[Math.min(pool.length - 1, Math.floor(rnd() * pool.length))];
  }

  /* ---------- Streak und Tagesziel ---------- */

  // Aktuelle Streak: zählt, solange das Tagesziel heute oder gestern erreicht wurde; sonst 0.
  function currentStreak(s, today) {
    var st = s.streak || { count: 0, last: '' };
    if (!st.last || !st.count) return 0;
    if (st.last === today || st.last === addDays(today, -1)) return st.count;
    return 0;
  }

  function todayCount(s, today) { return s.today && s.today.date === today ? s.today.ids.length : 0; }

  function last7(s, today) {
    var out = [];
    for (var i = 6; i >= 0; i--) {
      var k = addDays(today, -i);
      out.push({ date: k, count: s.days[k] || 0, met: !!s.met[k], today: i === 0 });
    }
    return out;
  }

  function setGoal(s, goal, today) {
    goal = Number(goal);
    if (GOALS.indexOf(goal) === -1) return false;
    s.goal = goal;
    // Wer heute schon genug gelöst hat, erreicht das (neue, tiefere) Ziel sofort.
    var reached = false;
    if (today && todayCount(s, today) >= goal && !s.met[today]) { markMet(s, today); reached = true; }
    return reached;
  }

  function markMet(s, today) {
    s.met[today] = 1;
    var st = s.streak;
    if (st.last === today) return;
    st.count = st.last === addDays(today, -1) ? st.count + 1 : 1;
    st.last = today;
    if (st.count > s.bestStreak) s.bestStreak = st.count;
  }

  /*
   * Verbucht eine korrekte Lösung. ex: Übung, dataset: Index des geprüften Datensatzes, now: Date.
   * Rückgabe: { xp, medalBefore, medalAfter, first, countedToday, goalReached, streak, todayCount }
   */
  function recordSolve(s, ex, dataset, now) {
    now = now || new Date();
    var today = dayKey(now);
    var m = s.mastery[ex.id] || { n: 0, sets: [], last: null, goldDay: null };
    var before = medal(m, ex);
    var gained = 0;

    m.n += 1;
    if (m.sets.indexOf(dataset) === -1) m.sets.push(dataset);
    m.last = dataset;
    s.mastery[ex.id] = m;
    var after = medal(m, ex);

    if (before === 3) {
      if (m.goldDay !== today) { gained += XP.goldRepeat; m.goldDay = today; }
    } else {
      if (after >= 1 && before < 1) gained += XP.first;
      if (after >= 2 && before < 2) gained += XP.silver;
      if (after >= 3 && before < 3) { gained += XP.gold; m.goldDay = today; }
    }
    s.xp += gained;
    s.solved[ex.id] = true;

    // Tagesziel: verschiedene Übungen pro Kalendertag
    if (!s.today || s.today.date !== today) s.today = { date: today, ids: [] };
    var countedToday = false;
    if (s.today.ids.indexOf(ex.id) === -1) { s.today.ids.push(ex.id); countedToday = true; }
    s.days[today] = s.today.ids.length;
    var goalReached = false;
    if (s.today.ids.length >= s.goal && !s.met[today]) { markMet(s, today); goalReached = true; }

    var hour = now.getHours();
    if (hour < 7) s.flags.early = true;
    if (hour >= 22) s.flags.night = true;
    prune(s, today);

    return {
      xp: gained, medalBefore: before, medalAfter: after, first: before === 0, countedToday: countedToday,
      goalReached: goalReached, streak: currentStreak(s, today), todayCount: s.today.ids.length
    };
  }

  /* ---------- Fehler-DNA und Wiederholung (v3) ---------- */

  function nextInterval(iv) {
    var i = INTERVALS.indexOf(iv);
    return INTERVALS[Math.min(INTERVALS.length - 1, i + 1)];
  }

  /*
   * Verbucht einen Prüfversuch. category: Kategorie aus ExcelDrillsErrors.classify (null = nur Wiederholung),
   * ok: Formel korrekt, today: 'YYYY-MM-DD'.
   * Fehler: Intervall zurück auf 1, fällig morgen. Korrekt ohne Eintrag (erstes Lösen): fällig morgen, Intervall 1.
   * Korrekt bei fälliger Wiederholung (z. B. am Tag nach einem Fehler): nächstes Intervall 1 → 3 → 7 → 14 → 30.
   * Korrekt, aber noch nicht fällig: Plan bleibt unverändert.
   * Rückgabe: { category, review: { due, interval, streak }, advanced }
   */
  function recordAttempt(s, exId, category, ok, today) {
    if (!isObj(s.errorProfile)) s.errorProfile = {};
    if (!isObj(s.review)) s.review = {};
    if (category) {
      var e = s.errorProfile[category] || { wrong: 0, right: 0, last: '' };
      if (ok) e.right += 1; else e.wrong += 1;
      e.last = today;
      s.errorProfile[category] = e;
    }
    var r = s.review[exId];
    var advanced = false;
    if (!ok) {
      r = { due: addDays(today, 1), interval: INTERVALS[0], streak: 0 };
    } else if (!r) {
      r = { due: addDays(today, 1), interval: INTERVALS[0], streak: 0 };
    } else if (r.due <= today) {
      r.interval = nextInterval(r.interval);
      r.due = addDays(today, r.interval);
      r.streak = (r.streak || 0) + 1;
      advanced = true;
    }
    s.review[exId] = r;
    return { category: category || null, review: { due: r.due, interval: r.interval, streak: r.streak }, advanced: advanced };
  }

  // Heute (oder früher) fällige Übungen: älteste zuerst, bei gleichem Datum nach ID. opts: { limit, filter(id) }
  function dueToday(s, today, opts) {
    opts = opts || {};
    var limit = typeof opts.limit === 'number' ? opts.limit : DUE_LIMIT;
    var rv = s.review || {};
    return Object.keys(rv)
      .filter(function (id) { return rv[id].due <= today && (!opts.filter || opts.filter(id)); })
      .sort(function (a, b) { return rv[a].due < rv[b].due ? -1 : rv[a].due > rv[b].due ? 1 : (a < b ? -1 : a > b ? 1 : 0); })
      .slice(0, limit);
  }

  function categoryStats(s) {
    var ep = s.errorProfile || {};
    return Object.keys(ep).map(function (c) {
      var e = ep[c];
      var total = e.wrong + e.right;
      return { category: c, wrong: e.wrong, right: e.right, total: total, rate: total ? e.wrong / total : 0, last: e.last };
    }).filter(function (x) { return x.total > 0; });
  }
  function byRate(a, b) {
    return b.rate - a.rate || b.wrong - a.wrong || (a.category < b.category ? -1 : a.category > b.category ? 1 : 0);
  }

  // Kategorien mit mindestens 3 Versuchen, höchste Fehlerquote zuerst. n: Anzahl (ohne Angabe alle).
  function weakestCategories(s, n) {
    var list = categoryStats(s).filter(function (x) { return x.total >= MIN_ATTEMPTS; }).sort(byRate);
    return typeof n === 'number' ? list.slice(0, n) : list;
  }

  /*
   * Für das Profil: { attempts, wrong, right, categories: [{ category, wrong, right, total, rate, enough }],
   *   weakest: schwächste Kategorie mit mindestens 3 Versuchen und mindestens 1 Fehler oder null, reviews: Anzahl geplanter Wiederholungen }
   */
  function profileSummary(s) {
    var cats = categoryStats(s).sort(byRate);
    cats.forEach(function (x) { x.enough = x.total >= MIN_ATTEMPTS; });
    var weak = weakestCategories(s).filter(function (x) { return x.wrong > 0; })[0] || null;
    var wrong = 0, right = 0;
    cats.forEach(function (x) { wrong += x.wrong; right += x.right; });
    return { attempts: wrong + right, wrong: wrong, right: right, categories: cats, weakest: weak, reviews: Object.keys(s.review || {}).length };
  }

  /* ---------- Auswertungen für Abzeichen und Anzeige ---------- */

  function isLocked(ex, unlocked) { return !ex.free && !unlocked; }
  function countMedals(s, list, minLevel) {
    return list.filter(function (ex) { return medalOf(s, ex) >= minLevel; }).length;
  }
  // Alle Übungen der Liste mit mindestens minLevel. onlyAccessible: gesperrte Premium-Übungen ignorieren.
  function allAtLeast(s, list, minLevel, unlocked, onlyAccessible) {
    var pool = onlyAccessible ? list.filter(function (ex) { return !isLocked(ex, unlocked); }) : list;
    return pool.length > 0 && pool.every(function (ex) { return medalOf(s, ex) >= minLevel; });
  }
  function anyLocked(list, unlocked) { return list.some(function (ex) { return isLocked(ex, unlocked); }); }

  var api = {
    LEVELS: LEVELS, FREE_LEVEL_CAP: FREE_LEVEL_CAP, XP: XP, GOALS: GOALS, DEFAULT_GOAL: DEFAULT_GOAL,
    HISTORY_DAYS: HISTORY_DAYS, MEDALS: MEDALS, VERSION: VERSION, INTERVALS: INTERVALS, DUE_LIMIT: DUE_LIMIT, MIN_ATTEMPTS: MIN_ATTEMPTS,
    recordAttempt: recordAttempt, dueToday: dueToday, weakestCategories: weakestCategories, profileSummary: profileSummary,
    dayKey: dayKey, addDays: addDays, emptyState: emptyState, migrate: migrate, serialize: serialize, prune: prune,
    levelFor: levelFor, datasetCount: datasetCount, hasAlt: hasAlt, medal: medal, medalOf: medalOf,
    medalName: medalName, nextMedalText: nextMedalText, nextMedalInfo: nextMedalInfo, pickDataset: pickDataset, currentStreak: currentStreak,
    todayCount: todayCount, last7: last7, setGoal: setGoal, recordSolve: recordSolve, isLocked: isLocked,
    countMedals: countMedals, allAtLeast: allAtLeast, anyLocked: anyLocked
  };

  root.ExcelDrillsGamification = api;
})(typeof window !== 'undefined' ? window : globalThis);
