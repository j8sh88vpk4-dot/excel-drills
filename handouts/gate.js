/*
 * Excel-Drills – E-Mail-Gate für die Spickzettel (handouts/index.html)
 *
 * EHRLICHER HINWEIS: Das ist KEIN echter Schutz. Die PDFs liegen öffentlich unter handouts/pdf/,
 * die Links stehen im HTML, und das Flag in localStorage lässt sich von Hand setzen. Das Gate ist
 * nur eine freundliche Bitte um die E-Mail-Adresse.
 *
 * Ablauf: Formular absenden -> Prüfung (E-Mail-Format, Honeypot «website») -> POST an die
 * Supabase-Tabelle «leads» (URL und Publishable Key aus assets/leads-config.js).
 * Erfolg oder Fehler: Downloads werden immer angezeigt, niemand wird blockiert. Plausible-Ereignis
 * «handout_lead» mit status gesendet | fehler. Nach erfolgreichem Senden merkt sich localStorage
 * das, damit ein Reload oder ein zweiter Klick die Adresse nicht nochmals sendet.
 */
(function () {
  'use strict';
  var KEY = 'excelDrillsHandouts';      // Downloads freigeschaltet
  var SENT = 'excelDrillsLeadSent';     // Adresse erfolgreich übermittelt
  var EMAIL_RE = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i;
  var form = document.getElementById('gate-form');
  var box = document.getElementById('gate-downloads');
  var status = document.getElementById('gate-status');
  var heading = document.getElementById('gate-downloads-heading');
  var button = document.getElementById('gate-submit');
  var email = document.getElementById('gate-email');
  var emailError = document.getElementById('gate-email-error');
  if (!form || !box || !email) return;

  function flag(name) {
    try { return window.localStorage.getItem(name) === '1'; } catch (e) { return false; }
  }
  function setFlag(name) {
    try { window.localStorage.setItem(name, '1'); } catch (e) { /* privater Modus: nur für diese Sitzung */ }
  }
  function unlock(moveFocus, message) {
    box.hidden = false;
    form.hidden = true;
    if (message) box.insertAdjacentHTML('afterbegin', '<p class="fill-note" role="status">' + message + '</p>');
    if (moveFocus && heading) heading.focus();
  }
  function track(state) {
    try {
      if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack('handout_lead', { status: state });
    } catch (e) { /* Messung ist optional */ }
  }
  function showEmailError(show) {
    if (emailError) emailError.hidden = !show;
    if (show) email.setAttribute('aria-invalid', 'true'); else email.removeAttribute('aria-invalid');
  }

  function send(payload) {
    var cfg = window.ExcelDrillsLeads;
    if (!cfg || !cfg.url || !cfg.key || typeof window.fetch !== 'function') return Promise.resolve(false);
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 10000) : null;
    return fetch(cfg.url, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: 'Bearer ' + cfg.key,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (res) { return res.ok; })
      .catch(function () { return false; })
      .then(function (ok) { if (timer) clearTimeout(timer); return ok; });
  }

  if (flag(KEY)) unlock(false);

  email.addEventListener('input', function () {
    if (email.getAttribute('aria-invalid') === 'true' && EMAIL_RE.test(email.value.trim())) showEmailError(false);
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (button.disabled) return;
    var address = email.value.trim();
    if (!EMAIL_RE.test(address) || address.length > 254) {
      showEmailError(true);
      email.focus();
      return;
    }
    showEmailError(false);

    var honeypot = form.elements.website && form.elements.website.value;
    if (honeypot) { setFlag(KEY); unlock(true, 'Danke! Die Downloads sind freigeschaltet.'); return; }

    if (flag(SENT)) { setFlag(KEY); unlock(true, 'Danke! Die Downloads sind freigeschaltet.'); return; }

    button.disabled = true;
    status.textContent = 'Wird gesendet …';
    var name = (form.elements.name && form.elements.name.value || '').trim().slice(0, 200);
    var optin = document.getElementById('gate-optin');
    send({
      email: address,
      name: name || null,
      newsletter: !!(optin && optin.checked),
      source: 'handouts',
      locale: String(navigator.language || document.documentElement.lang || '').slice(0, 35)
    }).then(function (ok) {
      status.textContent = '';
      if (ok) setFlag(SENT);
      else if (window.console) console.warn('Handouts: Anmeldung konnte nicht übermittelt werden, Downloads trotzdem freigeschaltet.');
      track(ok ? 'gesendet' : 'fehler');
      setFlag(KEY);
      unlock(true, ok ? 'Danke! Die Downloads sind freigeschaltet.'
        : 'Danke! Deine Anmeldung kam gerade nicht durch, die Downloads sind trotzdem freigeschaltet.');
    });
  });
})();

/* Trainer-Handouts: nur mit gültigem Premium-Code (gleiche Prüfung wie in der App, app/keys.js).
   Der Code aus der App (localStorage excelDrillsKey) schaltet direkt frei. */
(function () {
  'use strict';
  var form = document.getElementById('trainer-form');
  var box = document.getElementById('trainer-downloads');
  var status = document.getElementById('trainer-status');
  var input = document.getElementById('trainer-code');
  if (!form || !box || !input) return;
  var Keys = window.ExcelDrillsKeys;
  function stored() { try { return window.localStorage.getItem('excelDrillsKey') || ''; } catch (e) { return ''; } }
  function remember(k) { try { window.localStorage.setItem('excelDrillsKey', k); } catch (e) { /* privater Modus */ } }
  function show() {
    form.hidden = true;
    box.hidden = false;
    var h = document.getElementById('trainer-downloads-heading');
    if (h && h.focus) h.focus();
  }
  function fromLink(v) {
    var m = /[?&]key=([^&#]+)/.exec(String(v || ''));
    return m ? decodeURIComponent(m[1]) : v;
  }
  if (Keys && Keys.isValid(stored())) { show(); return; }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var code = Keys ? Keys.normalize(fromLink(input.value)) : '';
    if (Keys && code && Keys.isValid(code)) {
      remember(code);
      status.textContent = '';
      show();
      if (window.plausible) window.plausible('trainer_handout', { props: { status: 'ok' } });
    } else {
      status.textContent = 'Dieser Code ist nicht gültig. Prüfe die Schreibweise oder öffne den Link aus deiner Rechnungs-Mail.';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
    }
  });
})();
