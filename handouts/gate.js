/*
 * Excel-Drills – E-Mail-Gate für Spickzettel und Trainer-Handouts (handouts/index.html)
 *
 * EHRLICHER HINWEIS: Das ist KEIN echter Schutz. Die PDFs liegen öffentlich unter handouts/pdf/,
 * die Links stehen im HTML, und das Flag in localStorage lässt sich von Hand setzen. Das Gate ist
 * nur eine freundliche Bitte um die E-Mail-Adresse. Für echten Schutz müssten die Dateien
 * serverseitig (z. B. per signiertem Link nach Double-Opt-in) ausgeliefert werden.
 *
 * Ablauf: Formular absenden -> fetch an form.action (Formspree, Accept: application/json).
 * Egal ob das klappt: Downloads anzeigen und Freigabe in localStorage merken, damit niemand
 * blockiert wird (auch nicht, solange action noch den PLATZHALTER enthält).
 */
(function () {
  'use strict';
  var KEY = 'excelDrillsHandouts';
  var form = document.getElementById('gate-form');
  var box = document.getElementById('gate-downloads');
  var status = document.getElementById('gate-status');
  var heading = document.getElementById('gate-downloads-heading');
  var button = document.getElementById('gate-submit');
  if (!form || !box) return;

  function remembered() {
    try { return window.localStorage.getItem(KEY) === '1'; } catch (e) { return false; }
  }
  function remember() {
    try { window.localStorage.setItem(KEY, '1'); } catch (e) { /* privater Modus: nur für diese Sitzung */ }
  }
  function unlock(moveFocus) {
    box.hidden = false;
    form.hidden = true;
    if (moveFocus && heading) heading.focus();
  }

  if (remembered()) unlock(false);

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    button.disabled = true;
    status.textContent = 'Wird gesendet …';

    var placeholder = /PLATZHALTER/.test(form.getAttribute('action') || '');
    var sent = placeholder
      ? Promise.resolve(false)
      : fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (res) { return res.ok; })
          .catch(function () { return false; });

    sent.then(function (ok) {
      if (!ok && !placeholder && window.console) console.warn('Handouts: Formular konnte nicht übermittelt werden, Downloads trotzdem freigeschaltet.');
      if (placeholder && window.console) console.info('Handouts: Formspree-PLATZHALTER aktiv, es wurde nichts gesendet.');
      remember();
      unlock(true);
      box.insertAdjacentHTML('afterbegin', '<p class="fill-note" role="status">' +
        (ok || placeholder ? 'Danke! Die Downloads sind freigeschaltet.' : 'Danke! Deine Anmeldung kam gerade nicht durch, die Downloads sind trotzdem freigeschaltet.') + '</p>');
    });
  });
})();
