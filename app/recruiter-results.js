/* Excel-Drills – Recruiter-Seite assessment/ergebnisse.html?admin=<admin_token> (Vanilla JS).
 * Holt per RPC results_for_link Firma, Rolle und alle Ergebnisse, zeigt sie als Tabelle (sortiert nach Prozent)
 * und exportiert sie als CSV (Semikolon, UTF-8 mit BOM, damit Excel Schweiz die Datei direkt richtig öffnet).
 * Supabase-URL und Publishable Key: assets/leads-config.js. Kategorie-Namen: app/errors.js (falls geladen).
 * Reine Hilfsfunktionen unter window.ExcelDrillsRecruiterResults.helpers (getestet in scripts/test-recruiter.mjs). */
(function (root) {
  'use strict';

  /* ---------- Reine Hilfsfunktionen (ohne DOM) ---------- */

  var CAT_ORDER = ['bezug', 'syntax', 'logik', 'lookup', 'rundung', 'modell'];

  // Eine CSV-Zelle: Anführungszeichen verdoppeln, bei Trennzeichen/Zeilenumbruch/Anführungszeichen einschliessen.
  // Schutz vor CSV-Injection: Text, der mit = + - @ Tab oder CR beginnt, bekommt ein ' vorangestellt (Zahlen nicht).
  function csvCell(v, sep) {
    sep = sep || ';';
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return isFinite(v) ? String(v) : '';
    var s = String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    if (s.indexOf(sep) !== -1 || /["\r\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  function toCsv(header, rows, sep) {
    sep = sep || ';';
    return [header].concat(rows).map(function (r) {
      return r.map(function (c) { return csvCell(c, sep); }).join(sep);
    }).join('\r\n') + '\r\n';
  }

  // Pro Kategorie: { kategorie: { ok, n } }
  function categoryStats(aufgaben) {
    var out = {};
    (Array.isArray(aufgaben) ? aufgaben : []).forEach(function (a) {
      if (!a || !a.kategorie) return;
      var s = out[a.kategorie] || (out[a.kategorie] = { ok: 0, n: 0 });
      s.n++;
      if (a.ok) s.ok++;
    });
    return out;
  }

  // Alle Kategorien über alle Ergebnisse, in fester Reihenfolge (unbekannte hinten, alphabetisch)
  function categoriesOf(results) {
    var seen = {};
    (results || []).forEach(function (r) { Object.keys(categoryStats(r && r.aufgaben)).forEach(function (c) { seen[c] = true; }); });
    var known = CAT_ORDER.filter(function (c) { return seen[c]; });
    var rest = Object.keys(seen).filter(function (c) { return CAT_ORDER.indexOf(c) === -1; }).sort();
    return known.concat(rest);
  }

  function fmtDuration(sec) {
    if (sec === null || sec === undefined || !isFinite(sec)) return '';
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  // Datum in Zürcher Zeit als TT.MM.JJJJ HH:MM
  function fmtDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      var parts = {};
      new Intl.DateTimeFormat('de-CH', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(d).forEach(function (p) { parts[p.type] = p.value; });
      return parts.day + '.' + parts.month + '.' + parts.year + ' ' + parts.hour + ':' + parts.minute;
    } catch (e) {
      return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }
  }

  // Sortierung nach Prozent (dir: 'desc' | 'asc'), bei Gleichstand nach Datum (früher zuerst)
  function sortResults(results, dir) {
    var f = dir === 'asc' ? 1 : -1;
    return (results || []).slice().sort(function (a, b) {
      var d = ((a.prozent || 0) - (b.prozent || 0)) * f;
      if (d) return d;
      return String(a.erstellt || '').localeCompare(String(b.erstellt || ''));
    });
  }

  // Tabelle als Kopfzeile + Zeilen (für Anzeige und CSV). label: Kategorie-Name, z. B. ExcelDrillsErrors.label
  function buildRows(results, label, dir) {
    label = label || function (c) { return c; };
    var cats = categoriesOf(results);
    var header = ['Name', 'E-Mail', 'Prozent', 'Punkte', 'Stufe', 'Dauer (Min:Sek)', 'Datum'].concat(cats.map(function (c) { return label(c); }));
    var rows = sortResults(results, dir).map(function (r) {
      var st = categoryStats(r.aufgaben);
      return [r.kandidat_name || '', r.kandidat_email || '', typeof r.prozent === 'number' ? r.prozent : null,
        typeof r.punkte === 'number' ? r.punkte : null, r.stufe || '', fmtDuration(r.dauer_sek), fmtDate(r.erstellt)]
        .concat(cats.map(function (c) { return st[c] ? st[c].ok + '/' + st[c].n : ''; }));
    });
    return { header: header, rows: rows, categories: cats };
  }

  function csvFileName(firma, rolle, now) {
    var slug = function (s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    };
    var d = now || new Date();
    var date = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    return ['excel-assessment', slug(firma), slug(rolle), date].filter(Boolean).join('-') + '.csv';
  }

  var helpers = {
    csvCell: csvCell, toCsv: toCsv, categoryStats: categoryStats, categoriesOf: categoriesOf, fmtDuration: fmtDuration,
    fmtDate: fmtDate, sortResults: sortResults, buildRows: buildRows, csvFileName: csvFileName
  };
  root.ExcelDrillsRecruiterResults = { helpers: helpers };

  /* ---------- Browser-Teil ---------- */

  if (typeof document === 'undefined' || !root.location) return;

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  var adminToken = new URLSearchParams(root.location.search).get('admin') || '';
  var data = null, dir = 'desc';

  function label(c) {
    var ERR = root.ExcelDrillsErrors;
    try { return ERR && typeof ERR.label === 'function' ? ERR.label(c) : c; } catch (e) { return c; }
  }
  function roleLabel(id) { id = String(id || ''); return id ? id.charAt(0).toUpperCase() + id.slice(1) : ''; }

  function notice(msg, err) {
    var n = $('rr-notice');
    n.textContent = msg;
    n.className = 'notice' + (err ? ' err' : '');
    n.hidden = !msg;
  }

  function load() {
    var cfg = root.ExcelDrillsLeads;
    $('rr-loading').hidden = false;
    notice('');
    if (!/^[A-Za-z0-9_-]{24,64}$/.test(adminToken)) {
      $('rr-loading').hidden = true;
      notice('Dieser Link ist unvollständig. Bitte öffnen Sie den Ergebnis-Link genau so, wie Sie ihn erhalten haben. Fragen: hallo@excel-drills.ch', true);
      return;
    }
    if (!cfg || !cfg.url || !cfg.key || typeof root.fetch !== 'function') {
      $('rr-loading').hidden = true;
      notice('Die Seite konnte nicht vollständig geladen werden. Bitte laden Sie sie neu.', true);
      return;
    }
    var base = String(cfg.url).replace(/\/rest\/v1\/.*$/, '').replace(/\/+$/, '');
    fetch(base + '/rest/v1/rpc/results_for_link', {
      method: 'POST',
      headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ p_admin_token: adminToken }),
      cache: 'no-store'
    }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (d) {
      $('rr-loading').hidden = true;
      if (!d || typeof d !== 'object' || !d.firma) {
        notice('Zu diesem Link wurden keine Daten gefunden. Bitte prüfen Sie den Link oder schreiben Sie an hallo@excel-drills.ch.', true);
        return;
      }
      data = d;
      render();
    }).catch(function () {
      $('rr-loading').hidden = true;
      notice('Die Ergebnisse konnten gerade nicht geladen werden. Bitte prüfen Sie die Internetverbindung und versuchen Sie es nochmals.', true);
    });
  }

  function render() {
    var results = Array.isArray(data.ergebnisse) ? data.ergebnisse : [];
    $('rr-title').textContent = 'Ergebnisse für ' + data.firma;
    var meta = 'Rolle ' + roleLabel(data.rolle) + ' · ' + (data.minuten ? data.minuten + ' Minuten · ' : '') +
      (data.sprache === 'en' ? 'Englisch' : 'Deutsch') + ' · ' + (data.anzahl || results.length) + ' von ' + data.max_teilnahmen +
      ' Teilnahmen · Link ' + (data.aktiv ? 'aktiv' : 'geschlossen');
    $('rr-meta').textContent = meta;
    $('rr-content').hidden = false;
    $('rr-csv').disabled = !results.length;
    if (!results.length) notice('Noch keine Ergebnisse. Sobald Kandidatinnen und Kandidaten den Test abgeschlossen haben, erscheinen sie hier.');

    var t = buildRows(results, label, dir);
    var table = $('rr-table');
    while (table.firstChild) table.removeChild(table.firstChild);
    table.appendChild(el('caption', 'visually-hidden', 'Ergebnisse, sortiert nach Prozent ' + (dir === 'desc' ? 'absteigend' : 'aufsteigend')));
    var thead = el('thead'), hr = el('tr');
    var numCols = { 2: true, 3: true, 5: true };
    t.header.forEach(function (h, i) {
      var th = el('th', numCols[i] || i >= 7 ? 'num' : null);
      th.scope = 'col';
      if (i === 2) {
        th.setAttribute('aria-sort', dir === 'desc' ? 'descending' : 'ascending');
        var b = el('button', 'rr-sort', h + (dir === 'desc' ? ' ▼' : ' ▲'));
        b.type = 'button';
        b.setAttribute('aria-label', 'Nach Prozent sortieren, aktuell ' + (dir === 'desc' ? 'absteigend' : 'aufsteigend'));
        b.addEventListener('click', function () { dir = dir === 'desc' ? 'asc' : 'desc'; render(); var nb = document.querySelector('.rr-sort'); if (nb) nb.focus(); });
        th.appendChild(b);
      } else th.textContent = h;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    var tbody = el('tbody');
    t.rows.forEach(function (r) {
      var tr = el('tr');
      r.forEach(function (v, i) {
        var td = el('td', numCols[i] || i >= 7 ? 'num' : null);
        if (i === 2 && v !== null) td.textContent = v + ' %';
        else if (i >= 7 && v) {
          var p = v.split('/');
          td.appendChild(el('span', p[0] === p[1] ? 'rr-ok' : 'rr-err', v));
          td.title = p[0] + ' von ' + p[1] + ' richtig';
        } else td.textContent = v === null ? '' : v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
  }

  function exportCsv() {
    if (!data) return;
    var t = buildRows(data.ergebnisse || [], label, dir);
    var blob = new Blob(['﻿' + toCsv(t.header, t.rows)], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = csvFileName(data.firma, data.rolle);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }

  $('rr-csv').addEventListener('click', exportCsv);
  $('rr-reload').addEventListener('click', load);
  load();
})(typeof window !== 'undefined' ? window : globalThis);
