/*
 * Excel-Drills – Warteliste für die Schwester-Produkte (SQL-Drills, Python-Drills, Drills-Bundle)
 *
 * Formulare: <form class="waitlist-form" data-produkt="sql|python|bundle"> mit Feld «email»,
 * Honeypot «website», Statusbereich .waitlist-status. Ziel: dieselbe Supabase-Tabelle «leads» wie
 * handouts/gate.js (URL und Publishable Key aus assets/leads-config.js, anonymes INSERT).
 * Spalten wie bei gate.js: email, name, newsletter, source, locale. Die Herkunft steht in «source»:
 * warteliste-sql | warteliste-python | warteliste-bundle. newsletter bleibt false (nur Benachrichtigung zum Start).
 * Plausible-Ereignis: window.ExcelDrillsTrack('warteliste', { produkt, status }).
 */
(function () {
  'use strict';
  var EMAIL_RE = /^[^\s@<>()",;]+@[^\s@<>()",;]+\.[a-z]{2,}$/i;
  var PRODUKTE = { sql: 1, python: 1, bundle: 1 };

  function track(produkt, state) {
    try {
      if (typeof window.ExcelDrillsTrack === 'function') window.ExcelDrillsTrack('warteliste', { produkt: produkt, status: state });
    } catch (e) { /* Messung ist optional */ }
  }
  function sentKey(produkt) { return 'excelDrillsWaitlist-' + produkt; }
  function getFlag(k) { try { return window.localStorage.getItem(k) === '1'; } catch (e) { return false; } }
  function setFlag(k) { try { window.localStorage.setItem(k, '1'); } catch (e) { /* privater Modus */ } }

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

  function init(form) {
    var produkt = form.getAttribute('data-produkt');
    if (!PRODUKTE[produkt]) return;
    var email = form.elements.email;
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('.waitlist-status');
    if (!email || !button || !status) return;

    function say(text, kind) {
      status.textContent = text;
      status.className = 'waitlist-status' + (kind ? ' ' + kind : '');
    }
    if (getFlag(sentKey(produkt))) {
      form.querySelector('.waitlist-row').hidden = true;
      say('Du stehst bereits auf der Warteliste. Wir melden uns zum Start.', 'ok');
      return;
    }
    email.addEventListener('input', function () {
      if (email.getAttribute('aria-invalid') === 'true' && EMAIL_RE.test(email.value.trim())) {
        email.removeAttribute('aria-invalid');
        say('');
      }
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (button.disabled) return;
      var address = email.value.trim();
      if (!EMAIL_RE.test(address) || address.length > 254) {
        email.setAttribute('aria-invalid', 'true');
        say('Bitte gib eine gültige E-Mail-Adresse ein.', 'err');
        email.focus();
        return;
      }
      email.removeAttribute('aria-invalid');
      // Honeypot: Bots bekommen eine Erfolgsmeldung, es wird nichts gesendet.
      if (form.elements.website && form.elements.website.value) {
        form.querySelector('.waitlist-row').hidden = true;
        say('Danke, du stehst auf der Warteliste.', 'ok');
        return;
      }
      button.disabled = true;
      say('Wird gesendet …');
      send({
        email: address,
        name: null,
        newsletter: false,
        source: 'warteliste-' + produkt,
        locale: String(navigator.language || document.documentElement.lang || '').slice(0, 35)
      }).then(function (ok) {
        track(produkt, ok ? 'gesendet' : 'fehler');
        if (ok) {
          setFlag(sentKey(produkt));
          form.querySelector('.waitlist-row').hidden = true;
          say('Danke, du stehst auf der Warteliste. Wir schreiben dir nur zum Start.', 'ok');
        } else {
          button.disabled = false;
          say('Das hat gerade nicht geklappt. Versuche es später nochmals oder schreib an hallo@excel-drills.ch.', 'err');
        }
      });
    });
  }

  function boot() {
    var forms = document.querySelectorAll('form.waitlist-form[data-produkt]');
    for (var i = 0; i < forms.length; i++) init(forms[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
