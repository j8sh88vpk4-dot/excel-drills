/*
 * Excel-Drills – Zugangscode (reine Logik, ohne DOM; getestet in scripts/check-exercises.mjs).
 * Wird von app/app.js genutzt: Code-Eingabe im Paywall-Dialog und Abschnitt «Dein Zugangscode» im Profil.
 * Die eigentliche Prüfung bleibt in app/keys.js (Keys.isValid), derselbe Weg wie bei ?key= aus der Stripe-Weiterleitung.
 */
(function (root) {
  'use strict';

  var SITE_APP_URL = 'https://excel-drills.ch/app/';

  // Eingabe aufräumen: ganzer Freischalt-Link («…/app/?key=ABC&plan=jahr») oder nur der Code, mit Leerzeichen.
  function extractCode(raw) {
    var s = String(raw || '').trim();
    var m = s.match(/[?&]key=([^&#\s]+)/i);
    if (m) {
      try { s = decodeURIComponent(m[1]); } catch (e) { s = m[1]; }
    }
    return s.replace(/\s+/g, '');
  }

  // Prüft die Eingabe mit keys (ExcelDrillsKeys). Rückgabe: normalisierter Code oder null.
  function redeem(raw, keys) {
    var code = extractCode(raw);
    if (!code || !keys || !keys.isValid(code)) return null;
    return keys.normalize ? keys.normalize(code) : code;
  }

  // Link für ein weiteres Gerät
  function accessLink(code, base) {
    return (base || SITE_APP_URL) + '?key=' + encodeURIComponent(String(code || ''));
  }

  root.ExcelDrillsAccess = { extractCode: extractCode, redeem: redeem, accessLink: accessLink, SITE_APP_URL: SITE_APP_URL };
})(typeof window !== 'undefined' ? window : globalThis);
