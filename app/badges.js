/*
 * Excel-Drills – Abzeichen
 * Definitionen und Bedingungen. Braucht app/gamification.js (window.ExcelDrillsGamification).
 * Läuft im Browser (window.ExcelDrillsBadges) und in Node (scripts/test-gamification.mjs).
 *
 * build(ctx) liefert die Liste aller Abzeichen mit Status. ctx:
 *   { state, exercises, tracks: [{ id, name, items, comingSoon }], unlocked, today: 'YYYY-MM-DD' }
 * Jedes Abzeichen: { id, name, desc, icon, test(ctx) -> bool, gated(ctx) -> bool }
 *   gated = true: ohne Premium nicht erreichbar (Anzeige «Mit Premium erreichbar»).
 */
(function (root) {
  'use strict';

  var G = root.ExcelDrillsGamification;

  // Icons als SVG-Pfade (viewBox 0 0 24 24, Kontur). Dieselben Pfade zeichnet der Canvas fürs Teilen-Bild (Path2D).
  var ICONS = {
    formula: 'M15 4h-2.5C10.6 4 10 5 10 7v13M7 10h6M14.5 13l5 7M19.5 13l-5 7',
    flag: 'M5 21V4M5 4h12l-2.5 4 2.5 4H5',
    star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
    flame: 'M12 2.5c2.2 4 6.5 6 6.5 11a6.5 6.5 0 0 1-13 0c0-3 1.8-5 3.2-6.2.1 2.2 1 3.7 2.6 4C11.6 8.2 10.4 5.6 12 2.5z',
    lookup: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.3 15.3L20.5 20.5M7.5 10.5h6',
    sunrise: 'M3 19h18M6.5 19a5.5 5.5 0 0 1 11 0M12 4v5M4.6 10.6l2 2M19.4 10.6l-2 2',
    moon: 'M19.5 14.5A8 8 0 1 1 9.5 4.5a6.3 6.3 0 0 0 10 10z',
    bolt: 'M13 2.5L4.5 13.5h6.5l-1 8 8.5-11h-6.5z'
  };

  // Kurznamen für die Pfad-Abzeichen («Accounting komplett» statt «Accounting & Controlling komplett»)
  var SHORT = { basis: 'Basis', accounting: 'Accounting', finance: 'Finance', data: 'Data & Reporting' };

  function isSverweis(ex) { return /SVERWEIS/i.test(ex.topic || ''); }
  function availableTracks(ctx) {
    return (ctx.tracks || []).filter(function (t) { return !t.comingSoon && t.items && t.items.length; });
  }
  function streakBest(ctx) {
    return Math.max(ctx.state.bestStreak || 0, G.currentStreak(ctx.state, ctx.today));
  }

  // Übersetzte Texte: ctx.t(key, params) aus der App (Schlüssel «badge.<id>.name» usw.), sonst Deutsch.
  function textFor(ctx) {
    return function (key, params, fallback) {
      var v = typeof ctx.t === 'function' ? ctx.t(key, params) : null;
      return typeof v === 'string' && v !== key ? v : fallback;
    };
  }

  function build(ctx) {
    var s = ctx.state;
    var tx = textFor(ctx);
    var list = [
      {
        id: 'erste-formel', name: 'Erste Formel', icon: 'formula', desc: 'Löse deine erste Übung.',
        test: function () { return Object.keys(s.solved).length >= 1; }
      }
    ];

    availableTracks(ctx).forEach(function (t) {
      var short = tx('track.' + t.id + '.short', null, SHORT[t.id] || t.name);
      list.push({
        id: 'pfad-' + t.id, name: tx('badge.pfad.name', { short: short }, short + ' komplett'), icon: 'flag',
        desc: tx('badge.pfad.desc', { track: t.name }, 'Alle verfügbaren Übungen im Pfad «' + t.name + '» mit mindestens Bronze.'),
        // Zählt die Übungen, die dir offenstehen (ohne Premium: die Gratis-Übungen).
        test: function (c) { return G.allAtLeast(c.state, t.items, 1, c.unlocked, true); }
      });
    });
    availableTracks(ctx).forEach(function (t) {
      var short = tx('track.' + t.id + '.short', null, SHORT[t.id] || t.name);
      list.push({
        id: 'gold-' + t.id, name: tx('badge.gold.name', { short: short }, 'Gold-Pfad ' + short), icon: 'star',
        desc: tx('badge.gold.desc', { track: t.name }, 'Alle Übungen im Pfad «' + t.name + '» mit Gold.'),
        test: function (c) { return G.allAtLeast(c.state, t.items, 3, c.unlocked, false); },
        gated: function (c) { return G.anyLocked(t.items, c.unlocked); }
      });
    });

    var sv = (ctx.exercises || []).filter(isSverweis);
    list.push(
      {
        id: 'streak-7', name: '7 Tage in Folge', icon: 'flame', desc: 'Erreiche dein Tagesziel 7 Tage in Folge.',
        test: function (c) { return streakBest(c) >= 7; }
      },
      {
        id: 'streak-30', name: '30 Tage in Folge', icon: 'flame', desc: 'Erreiche dein Tagesziel 30 Tage in Folge.',
        test: function (c) { return streakBest(c) >= 30; }
      },
      {
        id: 'sverweis-profi', name: 'SVERWEIS-Profi', icon: 'lookup',
        desc: 'Alle verfügbaren SVERWEIS-Übungen mit Gold.',
        test: function (c) { return sv.length > 0 && G.allAtLeast(c.state, sv, 3, c.unlocked, true); }
      },
      {
        id: 'fruehaufsteher', name: 'Frühaufsteher', icon: 'sunrise', desc: 'Löse eine Übung vor 7 Uhr.',
        test: function (c) { return !!c.state.flags.early; }
      },
      {
        id: 'nachtschicht', name: 'Nachtschicht', icon: 'moon', desc: 'Löse eine Übung nach 22 Uhr.',
        test: function (c) { return !!c.state.flags.night; }
      },
      {
        id: 'xp-100', name: '100 XP', icon: 'bolt', desc: 'Sammle 100 XP.',
        test: function (c) { return c.state.xp >= 100; }
      },
      {
        id: 'xp-500', name: '500 XP', icon: 'bolt', desc: 'Sammle 500 XP.',
        test: function (c) { return c.state.xp >= 500; }
      }
    );
    list.forEach(function (b) {
      if (!b.gated) b.gated = function () { return false; };
      if (!/^(pfad|gold)-/.test(b.id)) {
        b.name = tx('badge.' + b.id + '.name', null, b.name);
        b.desc = tx('badge.' + b.id + '.desc', null, b.desc);
      }
    });
    return list;
  }

  // Prüft alle Abzeichen und schaltet neue frei. Rückgabe: Liste der neu freigeschalteten Abzeichen.
  function evaluate(ctx, now) {
    var earned = [];
    var stamp = now ? +now : Date.now();
    build(ctx).forEach(function (b) {
      if (ctx.state.badges[b.id]) return;
      if (b.test(ctx)) { ctx.state.badges[b.id] = stamp; earned.push(b); }
    });
    return earned;
  }

  // Status für die Galerie: earned | gated (nur mit Premium) | locked
  function status(ctx) {
    return build(ctx).map(function (b) {
      var st = ctx.state.badges[b.id] ? 'earned' : (b.gated(ctx) ? 'gated' : 'locked');
      return { id: b.id, name: b.name, desc: b.desc, icon: b.icon, status: st, earnedAt: ctx.state.badges[b.id] || null };
    });
  }

  root.ExcelDrillsBadges = { ICONS: ICONS, build: build, evaluate: evaluate, status: status };
})(typeof window !== 'undefined' ? window : globalThis);
