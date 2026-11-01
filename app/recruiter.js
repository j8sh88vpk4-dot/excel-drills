/* Excel-Drills – Recruiter-Links für das Rollen-Assessment (Vanilla JS, ohne Login).
 * Aktiv nur mit ?link=<token> auf assessment/index.html. Ablauf:
 *   1. Rollenwahl sperren (ExcelDrillsAssessment.configure, siehe app/assessment.js), Link-Infos per RPC link_info holen.
 *   2. Oben «Test für <Firma>, Rolle <Rolle>» und ein Formular Name + E-Mail (Pflicht) mit Datenschutz-Hinweis.
 *      «Test starten» funktioniert erst mit gültigem Namen und gültiger E-Mail.
 *   3. Nach finish(): RPC submit_assessment_result, Hinweis im Ergebnisbereich (#as-recruiter-status),
 *      Plausible-Ereignis recruiter_submit bei Erfolg. Das Ergebnis bleibt lokal immer sichtbar.
 * Supabase-URL und Publishable Key: assets/leads-config.js (wird bei Bedarf nachgeladen).
 * Reine Hilfsfunktionen liegen unter window.ExcelDrillsRecruiter.helpers (getestet in scripts/test-recruiter.mjs). */
(function (root) {
  'use strict';

  /* ---------- Reine Hilfsfunktionen (ohne DOM) ---------- */

  var EMAIL_RE = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i;
  var TOKEN_RE = /^[A-Za-z0-9_-]{16,64}$/;
  var ROLE_LABELS = { consulting: 'Consulting', accounting: 'Accounting' };

  function cleanName(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }

  // Prüft Name und E-Mail. Rückgabe: { ok, name, email, errors: { name: 'leer'|'lang', email: 'leer'|'format'|'lang' } }
  function validateCandidate(name, email) {
    var n = cleanName(name), m = String(email == null ? '' : email).trim().toLowerCase();
    var errors = {};
    if (!n) errors.name = 'leer';
    else if (n.length > 200) errors.name = 'lang';
    if (!m) errors.email = 'leer';
    else if (m.length > 254) errors.email = 'lang';
    else if (!EMAIL_RE.test(m)) errors.email = 'format';
    return { ok: !errors.name && !errors.email, name: n, email: m, errors: errors };
  }

  function validToken(t) { return typeof t === 'string' && TOKEN_RE.test(t); }

  function toInt(v, min, max) {
    var n = Math.round(Number(v));
    if (!isFinite(n)) n = 0;
    return Math.min(max, Math.max(min, n));
  }

  // aufgaben-JSON aus dem Assessment-State (summary.tasks aus notifyFinish in app/assessment.js). Keine Formeln.
  function buildAufgaben(tasks) {
    return (Array.isArray(tasks) ? tasks : []).slice(0, 50).map(function (t, i) {
      t = t || {};
      return {
        nr: i + 1,
        id: t.id ? String(t.id).slice(0, 60) : null,
        kategorie: t.kategorie ? String(t.kategorie).slice(0, 40) : null,
        ok: !!t.ok,
        punkte: toInt(t.punkte, 0, 1000),
        versuche: toInt(t.versuche, 0, 10),
        fehlerart: t.ok || !t.fehlerart ? null : String(t.fehlerart).slice(0, 40)
      };
    });
  }

  // Parameter für RPC submit_assessment_result
  function buildPayload(token, candidate, summary, sprache) {
    summary = summary || {};
    return {
      p_token: token,
      p_name: candidate.name,
      p_email: candidate.email,
      p_punkte: toInt(summary.punkte, 0, 10000),
      p_prozent: toInt(summary.prozent, 0, 100),
      p_stufe: summary.stufe ? String(summary.stufe).slice(0, 60) : null,
      p_dauer: summary.dauerSek == null ? null : toInt(summary.dauerSek, 0, 86400),
      p_aufgaben: buildAufgaben(summary.tasks),
      p_sprache: sprache === 'en' ? 'en' : 'de'
    };
  }

  // Fehlercode aus der PostgREST-Antwort ({ message: 'link_voll', ... }) oder 'netz'
  function errorCode(body) {
    var msg = body && typeof body === 'object' ? String(body.message || '') : '';
    var codes = ['link_unbekannt', 'link_inaktiv', 'link_voll', 'eingabe_ungueltig'];
    for (var i = 0; i < codes.length; i++) if (msg.indexOf(codes[i]) !== -1) return codes[i];
    return 'unbekannt';
  }

  function roleLabel(id) {
    id = String(id || '');
    return ROLE_LABELS[id] || (id ? id.charAt(0).toUpperCase() + id.slice(1) : '');
  }

  function restBase(cfg) {
    if (!cfg || !cfg.url) return '';
    return String(cfg.url).replace(/\/rest\/v1\/.*$/, '').replace(/\/+$/, '');
  }

  var helpers = {
    validateCandidate: validateCandidate, validToken: validToken, buildAufgaben: buildAufgaben,
    buildPayload: buildPayload, errorCode: errorCode, roleLabel: roleLabel, restBase: restBase, cleanName: cleanName
  };
  root.ExcelDrillsRecruiter = { helpers: helpers };

  /* ---------- Browser-Teil ---------- */

  if (typeof document === 'undefined' || !root.location) return;
  var token = new URLSearchParams(root.location.search).get('link');
  if (token === null) return; // kein Recruiter-Link: Seite bleibt unverändert

  var TEXT = {
    de: {
      loading: 'Test-Link wird geladen …',
      title: function (f) { return 'Test für ' + f; },
      role: function (r, m) { return 'Rolle ' + r + (m ? ' · ' + m + ' Minuten' : ''); },
      intro: 'Gib deinen Namen und deine E-Mail-Adresse ein. Danach startest du den Test unten. Rolle, Sprache und Zeit sind durch den Link festgelegt.',
      name: 'Name', email: 'E-Mail',
      nameErr: 'Bitte gib deinen Namen ein.',
      emailErr: 'Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.ch.',
      privacy: function (f) {
        return 'Datenschutz: Dein Name, deine E-Mail-Adresse und dein Ergebnis (Punkte, Prozent, Stufe, Dauer, richtig oder falsch pro Aufgabe) gehen an ' + f +
          '. Deine Formeln werden nicht übermittelt. Gespeichert wird bei Supabase in Zürich. Mit dem Start des Tests bist du damit einverstanden.';
      },
      privacyLink: 'Datenschutzerklärung',
      go: 'Weiter zum Test',
      ready: function (n) { return 'Danke, ' + n + '. Du kannst den Test jetzt starten.'; },
      needForm: 'Bitte fülle zuerst Name und E-Mail aus.',
      invalid: 'Dieser Test-Link ist ungültig. Prüfe den Link aus der Einladung oder frage bei der Firma nach.',
      inactive: function (f) { return 'Dieser Test-Link von ' + f + ' ist nicht mehr aktiv. Frag bei der Firma nach einem neuen Link.'; },
      loadErr: 'Der Test-Link konnte gerade nicht geladen werden. Prüfe deine Internetverbindung und lade die Seite neu.',
      serverErr: 'Der Test-Link kann gerade nicht geprüft werden. Versuch es in ein paar Minuten nochmals oder frag bei der Firma nach.',
      roleErr: 'Die Rolle in diesem Link gibt es auf Excel-Drills (noch) nicht. Frag bei der Firma nach.',
      sending: function (f) { return 'Dein Ergebnis wird an ' + f + ' übermittelt …'; },
      sent: function (f) { return 'Ergebnis an ' + f + ' übermittelt. Du kannst das Fenster schliessen oder dir die Diagnose unten anschauen.'; },
      err: {
        link_voll: 'Für diesen Link sind keine Plätze mehr frei. Dein Ergebnis wurde nicht übermittelt.',
        link_inaktiv: 'Dieser Link ist nicht mehr aktiv. Dein Ergebnis wurde nicht übermittelt.',
        link_unbekannt: 'Dieser Link ist ungültig. Dein Ergebnis wurde nicht übermittelt.',
        eingabe_ungueltig: 'Die Angaben waren unvollständig. Dein Ergebnis wurde nicht übermittelt.',
        unbekannt: 'Dein Ergebnis konnte gerade nicht übermittelt werden.'
      },
      errTail: 'Dein Ergebnis siehst du weiterhin hier unten. Mach am besten einen Screenshot und schick ihn der Firma.',
      retry: 'Nochmals senden',
      once: 'Nur der erste Durchgang wird an die Firma übermittelt.'
    },
    en: {
      loading: 'Loading test link …',
      title: function (f) { return 'Test for ' + f; },
      role: function (r, m) { return 'Role ' + r + (m ? ' · ' + m + ' minutes' : ''); },
      intro: 'Enter your name and email address, then start the test below. Role, language and time are set by the link.',
      name: 'Name', email: 'Email',
      nameErr: 'Please enter your name.',
      emailErr: 'Please enter a valid email address, e.g. name@example.com.',
      privacy: function (f) {
        return 'Privacy: your name, email address and result (points, percent, level, duration, right or wrong per task) are sent to ' + f +
          '. Your formulas are not sent. Data is stored with Supabase in Zurich. By starting the test you agree to this.';
      },
      privacyLink: 'Privacy policy',
      go: 'Continue to the test',
      ready: function (n) { return 'Thanks, ' + n + '. You can start the test now.'; },
      needForm: 'Please enter your name and email first.',
      invalid: 'This test link is not valid. Check the link in your invitation or ask the company.',
      inactive: function (f) { return 'This test link from ' + f + ' is no longer active. Ask the company for a new link.'; },
      loadErr: 'The test link could not be loaded. Check your connection and reload the page.',
      serverErr: 'The test link cannot be checked right now. Try again in a few minutes or ask the company.',
      roleErr: 'The role in this link does not exist on Excel-Drills (yet). Please ask the company.',
      sending: function (f) { return 'Sending your result to ' + f + ' …'; },
      sent: function (f) { return 'Result sent to ' + f + '. You can close this window or look at the diagnosis below.'; },
      err: {
        link_voll: 'This link has no places left. Your result was not sent.',
        link_inaktiv: 'This link is no longer active. Your result was not sent.',
        link_unbekannt: 'This link is not valid. Your result was not sent.',
        eingabe_ungueltig: 'Your details were incomplete. Your result was not sent.',
        unbekannt: 'Your result could not be sent right now.'
      },
      errTail: 'Your result is still shown below. Take a screenshot and send it to the company.',
      retry: 'Send again',
      once: 'Only the first attempt is sent to the company.'
    }
  };
  var T = TEXT.de;

  var A = root.ExcelDrillsAssessment;
  var info = null, candidate = null, started = false, submitted = false, sending = false, lastPayload = null;
  var ui = {};

  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function track(name, props) {
    try { if (typeof root.ExcelDrillsTrack === 'function') root.ExcelDrillsTrack(name, props); } catch (e) { /* optional */ }
  }

  // Rollenwahl sofort sperren, bevor die Aufgaben fertig geladen sind
  if (A && typeof A.configure === 'function') A.configure({ lockRole: true, unlock: true });
  Array.prototype.forEach.call(document.querySelectorAll('.role-cards, .as-cards-h'), function (n) { n.hidden = true; });

  /* Banner oben auf der Seite */
  function buildBanner() {
    var main = $('inhalt') || document.body;
    var sec = el('section', 'panel rc-banner');
    sec.id = 'rc-banner';
    sec.setAttribute('aria-labelledby', 'rc-title');
    sec.style.marginBottom = '1.5rem';
    ui.title = el('h2', null, T.loading);
    ui.title.id = 'rc-title';
    ui.title.tabIndex = -1;
    ui.meta = el('p', 'tag');
    ui.meta.hidden = true;
    ui.msg = el('p', 'notice');
    ui.msg.hidden = true;
    ui.msg.setAttribute('role', 'status');
    sec.appendChild(ui.meta);
    sec.appendChild(ui.title);
    sec.appendChild(ui.msg);
    var notice = $('as-notice');
    if (notice && notice.parentNode === main) main.insertBefore(sec, notice.nextSibling);
    else main.insertBefore(sec, main.firstChild);
    ui.banner = sec;
  }

  function showMsg(text, err) {
    ui.msg.textContent = text;
    ui.msg.className = 'notice' + (err ? ' err' : '');
    ui.msg.hidden = !text;
  }

  function field(id, label, type, autocomplete, errText) {
    var wrap = el('div', 'gate-field');
    var lab = el('label', null, label);
    lab.htmlFor = id;
    var inp = el('input');
    inp.id = id; inp.type = type; inp.required = true; inp.autocomplete = autocomplete;
    inp.maxLength = type === 'email' ? 254 : 200;
    var err = el('p', 'gate-error', errText);
    err.id = id + '-error';
    err.hidden = true;
    inp.setAttribute('aria-describedby', err.id);
    wrap.appendChild(lab); wrap.appendChild(inp); wrap.appendChild(err);
    return { wrap: wrap, input: inp, err: err };
  }

  function buildForm() {
    var form = el('form', 'gate-form');
    form.id = 'rc-form';
    form.noValidate = true;
    form.appendChild(el('p', null, T.intro));
    ui.name = field('rc-name', T.name, 'text', 'name', T.nameErr);
    ui.email = field('rc-email', T.email, 'email', 'email', T.emailErr);
    form.appendChild(ui.name.wrap);
    form.appendChild(ui.email.wrap);
    var priv = el('p', 'fill-note', T.privacy(info.firma) + ' ');
    var a = el('a', null, T.privacyLink);
    a.href = '../datenschutz.html';
    a.target = '_blank';
    a.rel = 'noopener';
    priv.appendChild(a);
    form.appendChild(priv);
    var p = el('p');
    var btn = el('button', 'btn', T.go);
    btn.type = 'submit';
    p.appendChild(btn);
    form.appendChild(p);
    ui.formStatus = el('p', 'fill-note');
    ui.formStatus.setAttribute('role', 'status');
    ui.formStatus.setAttribute('aria-live', 'polite');
    form.appendChild(ui.formStatus);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (checkForm(true)) {
        ui.formStatus.textContent = T.ready(candidate.name);
        var start = $('as-start-btn');
        if (start && !start.hidden) { start.scrollIntoView({ behavior: 'smooth', block: 'center' }); start.focus({ preventScroll: true }); }
      }
    });
    [ui.name, ui.email].forEach(function (f) {
      f.input.addEventListener('input', function () {
        if (f.input.getAttribute('aria-invalid') === 'true') checkForm(false, true);
      });
    });
    ui.form = form;
    ui.banner.appendChild(form);
  }

  // Formular prüfen; focus: erstes fehlerhaftes Feld fokussieren; quiet: nur Fehler wegnehmen, keine neuen zeigen
  function checkForm(focus, quiet) {
    var r = validateCandidate(ui.name.input.value, ui.email.input.value);
    [['name', ui.name], ['email', ui.email]].forEach(function (pair) {
      var bad = !!r.errors[pair[0]];
      if (quiet && bad) return;
      pair[1].err.hidden = !bad;
      if (bad) pair[1].input.setAttribute('aria-invalid', 'true'); else pair[1].input.removeAttribute('aria-invalid');
    });
    if (!r.ok) {
      candidate = null;
      if (focus) (r.errors.name ? ui.name.input : ui.email.input).focus();
      return false;
    }
    candidate = { name: r.name, email: r.email };
    return true;
  }

  // «Test starten» abfangen (Capture-Phase, läuft vor dem Handler in assessment.js)
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('#as-start-btn') : null;
    if (!b) return;
    if (!info || !ui.form || !checkForm(true)) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      if (ui.formStatus) ui.formStatus.textContent = T.needForm;
      if (ui.form) ui.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (started) return;
    started = true;
    ui.name.input.readOnly = true;
    ui.email.input.readOnly = true;
  }, true);

  /* ---------- Supabase RPC ---------- */

  function loadConfig() {
    if (root.ExcelDrillsLeads && root.ExcelDrillsLeads.url) return Promise.resolve(root.ExcelDrillsLeads);
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = '../assets/leads-config.js';
      s.onload = function () { resolve(root.ExcelDrillsLeads || null); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
  }

  function rpc(name, params) {
    return loadConfig().then(function (cfg) {
      var base = restBase(cfg);
      if (!base || !cfg.key || typeof root.fetch !== 'function') return { ok: false, status: 0, data: null };
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;
      return fetch(base + '/rest/v1/rpc/' + name, {
        method: 'POST',
        headers: { apikey: cfg.key, Authorization: 'Bearer ' + cfg.key, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(params),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        return res.text().then(function (txt) {
          var data = null;
          try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = null; }
          return { ok: res.ok, status: res.status, data: data };
        });
      }).catch(function () { return { ok: false, status: 0, data: null }; })
        .then(function (r) { if (timer) clearTimeout(timer); return r; });
    });
  }

  /* ---------- Nach dem Test ---------- */

  function statusBox() { return $('as-recruiter-status'); }

  function setStatus(kind, text, withRetry) {
    var box = statusBox();
    if (!box) return;
    while (box.firstChild) box.removeChild(box.firstChild);
    box.className = 'notice' + (kind === 'err' ? ' err' : '');
    box.hidden = !text;
    if (!text) return;
    box.appendChild(el('p', null, text));
    if (withRetry) {
      var p = el('p');
      var b = el('button', 'btn btn-secondary btn-small', T.retry);
      b.type = 'button';
      b.addEventListener('click', function () { send(); });
      p.appendChild(b);
      box.appendChild(p);
    }
  }

  function send() {
    if (!lastPayload || sending || submitted) return;
    sending = true;
    setStatus('', T.sending(info.firma));
    rpc('submit_assessment_result', lastPayload).then(function (r) {
      sending = false;
      if (r.ok) {
        submitted = true;
        setStatus('ok', T.sent(info.firma));
        track('recruiter_submit', { rolle: info.rolle });
        return;
      }
      var code = r.status ? errorCode(r.data) : 'unbekannt';
      var final = code === 'link_voll' || code === 'link_inaktiv' || code === 'link_unbekannt';
      setStatus('err', T.err[code] + ' ' + T.errTail, !final);
    });
  }

  function onFinish(summary) {
    // Kein Teilen-Bild und kein «Test wiederholen» im Link-Modus
    ['as-share-area', 'as-restart-btn'].forEach(function (id) { var n = $(id); if (n) n.hidden = true; });
    if (submitted || lastPayload) { setStatus('', T.once); return; }
    if (!candidate) { setStatus('err', T.err.eingabe_ungueltig + ' ' + T.errTail); return; }
    lastPayload = buildPayload(token, candidate, summary, info.sprache);
    send();
  }

  /* ---------- Start ---------- */

  buildBanner();
  if (!validToken(token)) { ui.title.textContent = T.invalid; return; }
  if (!A || typeof A.configure !== 'function') { ui.title.textContent = T.loadErr; return; }

  rpc('link_info', { p_token: token }).then(function (r) {
    // status 0: keine Verbindung; sonst hat der Server geantwortet, dann hilft der Hinweis aufs Internet nicht
    if (!r.ok) { ui.title.textContent = r.status ? T.serverErr : T.loadErr; return; }
    var d = r.data;
    if (!d || typeof d !== 'object' || !d.firma) { ui.title.textContent = T.invalid; return; }
    info = { firma: String(d.firma), rolle: String(d.rolle || '').toLowerCase(), sprache: d.sprache === 'en' ? 'en' : 'de',
             minuten: d.minuten > 0 ? Math.round(d.minuten) : null, aktiv: d.aktiv !== false };
    T = TEXT[info.sprache];
    if (!info.aktiv) { ui.title.textContent = T.inactive(info.firma); return; }
    ui.title.textContent = T.title(info.firma);
    ui.meta.textContent = T.role(roleLabel(info.rolle), info.minuten);
    ui.meta.hidden = false;
    buildForm();
    var ok = A.configure({ rolle: info.rolle, minuten: info.minuten, sprache: info.sprache, lockRole: true, unlock: true, onFinish: onFinish });
    if (ok === false) { showMsg(T.roleErr, true); ui.form.hidden = true; }
    // Rolle unbekannt, nachdem die Aufgaben geladen sind (configure vorher aufgerufen)
    else if (typeof A.isReady === 'function' && !A.isReady()) {
      var tries = 0, iv = setInterval(function () {
        if (A.isReady()) { clearInterval(iv); if (A.configure({}) === false) { showMsg(T.roleErr, true); ui.form.hidden = true; } }
        else if (++tries > 60) clearInterval(iv);
      }, 500);
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
