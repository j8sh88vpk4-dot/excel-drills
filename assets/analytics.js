/* Excel-Drills: Reichweitenmessung mit Plausible Analytics (cookielos, ohne IP-Speicherung).
   Wird auf jeder Seite direkt nach style.css eingebunden. Fehler hier dürfen nie die Seite oder App stören. */
(function () {
  'use strict';

  // Muss exakt der in Plausible angelegten Site entsprechen.
  // Bei einem Domainwechsel nur hier ändern (und die Site in Plausible entsprechend anlegen).
  var DOMAIN = 'excel-drills.ch';

  try {
    // Warteschlange: Ereignisse vor dem Laden des Plausible-Skripts gehen nicht verloren.
    window.plausible = window.plausible || function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };

    var s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', DOMAIN);
    s.src = 'https://plausible.io/js/script.tagged-events.outbound-links.revenue.js';
    document.head.appendChild(s);
  } catch (e) { /* Messung ist optional */ }

  // Eigenes Ereignis senden. revenue optional: { currency: 'CHF', amount: Number }.
  window.ExcelDrillsTrack = function (name, props, revenue) {
    try {
      if (typeof window.plausible !== 'function' || !name) return;
      var opts = {};
      if (props && typeof props === 'object') opts.props = props;
      if (revenue && revenue.currency && isFinite(revenue.amount)) opts.revenue = revenue;
      window.plausible(name, opts);
    } catch (e) { /* nie die App stören */ }
  };
})();
