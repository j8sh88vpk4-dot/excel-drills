/*
 * Excel-Drills – PWA im Browser: Service Worker registrieren (/sw.js), Update-Hinweis, Offline-Leiste,
 * Installations-Aufforderung (beforeinstallprompt) und kleine Hinweiskarten unten im Bild.
 * Eingebunden in index.html und app/index.html (im <head>, defer). Fehler hier dürfen nie die Seite stören.
 *
 * Texte: In der App übergibt app/app.js mit setTranslator(T) die Übersetzung (Schlüssel pwa.* in
 * app/i18n/ui-de.js, fr.json, it.json). Ohne Übersetzer (Startseite) gelten die deutschen Texte unten.
 * Die Installations-Karte selbst (wann, welcher Text) steuert app/app.js (maybeOfferInstall).
 */
(function () {
  'use strict';

  // Deutsch, gleich wie app/i18n/ui-de.js (für Seiten ohne App-Übersetzung)
  var DEFAULTS = {
    'pwa.updateTitle': 'Neue Version verfügbar',
    'pwa.updateText': 'Lade neu, um sie zu verwenden.',
    'pwa.reload': 'Neu laden',
    'pwa.later': 'Später',
    'pwa.offline': 'Offline: Die Gratis-Übungen funktionieren, Premium-Kauf und Datei-Downloads nicht.'
  };

  var translator = null;
  var deferredPrompt = null;     // beforeinstallprompt (Chrome, Edge, Android)
  var listeners = [];
  var cards = {};                // id → { el, opts }
  var layer = null, bar = null;
  var reloading = false;

  function text(key) {
    var v = null;
    try { v = translator ? translator(key) : null; } catch (e) { v = null; }
    return typeof v === 'string' && v && v !== key ? v : (DEFAULTS[key] || key);
  }
  function val(v) { return typeof v === 'function' ? v() : v; }
  function notify() { listeners.forEach(function (fn) { try { fn(); } catch (e) { /* ignorieren */ } }); }

  function isSecure() {
    var h = location.hostname;
    return location.protocol === 'https:' || h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  }
  function isStandalone() {
    return !!((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true);
  }
  function isIos() {
    var ua = navigator.userAgent || '';
    return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  // Safari auf iOS/iPadOS (nicht Chrome/Firefox/Edge für iOS): dort gibt es kein beforeinstallprompt
  function isIosSafari() {
    var ua = navigator.userAgent || '';
    return isIos() && /safari/i.test(ua) && !/crios|fxios|edgios|opios|gsa\//i.test(ua);
  }

  /* ---------- Hinweiskarten (Update, Installation) ---------- */

  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'pwa-layer';
    layer.setAttribute('aria-live', 'polite'); // besteht ab start(), damit neue Karten angesagt werden
    document.body.appendChild(layer);
    return layer;
  }
  function syncLayerHeight() {
    var h = layer && layer.children.length ? layer.offsetHeight + 8 : 0; // + Abstand
    document.documentElement.style.setProperty('--pwa-layer-h', h + 'px');
  }

  // opts: { title, text, actions: [{ label, primary, onClick }], onDismiss } – Texte als String oder Funktion
  function renderCard(id) {
    var c = cards[id];
    if (!c) return;
    var el = c.el;
    var tid = 'pwa-card-' + id + '-t';
    el.innerHTML = '';
    el.setAttribute('aria-labelledby', tid);
    var body = document.createElement('div');
    body.className = 'pwa-card-body';
    var t = document.createElement('strong');
    t.id = tid;
    t.textContent = val(c.opts.title);
    body.appendChild(t);
    var tx = val(c.opts.text);
    if (tx) {
      var p = document.createElement('span');
      p.textContent = ' ' + tx;
      body.appendChild(p);
    }
    el.appendChild(body);
    var acts = document.createElement('div');
    acts.className = 'pwa-card-actions';
    (c.opts.actions || []).forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-small' + (a.primary ? '' : ' btn-secondary');
      b.textContent = val(a.label);
      b.addEventListener('click', function () {
        hideCard(id);
        if (a.onClick) a.onClick();
      });
      acts.appendChild(b);
    });
    el.appendChild(acts);
  }

  function showCard(id, opts) {
    if (!document.body) return null;
    ensureLayer();
    var c = cards[id];
    if (!c) {
      var el = document.createElement('section');
      el.className = 'pwa-card';
      el.dataset.card = id;
      // Escape schliesst die Karte (wie «Später»), Fokus geht zurück in die Seite
      el.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var cur = cards[id];
        hideCard(id);
        if (cur && cur.opts.onDismiss) cur.opts.onDismiss();
      });
      c = cards[id] = { el: el, opts: opts };
      layer.appendChild(el);
    } else {
      c.opts = opts;
    }
    renderCard(id);
    syncLayerHeight();
    return c.el;
  }

  function hideCard(id) {
    var c = cards[id];
    if (!c) return;
    var hadFocus = c.el.contains(document.activeElement);
    c.el.remove();
    delete cards[id];
    syncLayerHeight();
    if (hadFocus) {
      var main = document.querySelector('main');
      if (main) { if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1'); main.focus(); }
    }
  }

  /* ---------- Offline-Leiste ---------- */

  function renderBar() {
    if (!document.body) return;
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'offline-bar';
      bar.setAttribute('role', 'status');
      bar.hidden = true;
      var header = document.querySelector('.site-header');
      if (header && header.parentNode) header.parentNode.insertBefore(bar, header.nextSibling);
      else document.body.insertBefore(bar, document.body.firstChild);
    }
    bar.textContent = text('pwa.offline');
    bar.hidden = navigator.onLine !== false;
  }

  /* ---------- Service Worker ---------- */

  function showUpdate(worker) {
    showCard('update', {
      title: function () { return text('pwa.updateTitle'); },
      text: function () { return text('pwa.updateText'); },
      actions: [
        { label: function () { return text('pwa.reload'); }, primary: true, onClick: function () {
          reloading = true;
          try { worker.postMessage({ type: 'SKIP_WAITING' }); } catch (e) { location.reload(); }
          // Falls controllerchange ausbleibt (z. B. Worker schon aktiv): trotzdem neu laden
          setTimeout(function () { location.reload(); }, 3000);
        } },
        { label: function () { return text('pwa.later'); } }
      ]
    });
  }

  function watchRegistration(reg) {
    if (reg.waiting && navigator.serviceWorker.controller) showUpdate(reg.waiting);
    reg.addEventListener('updatefound', function () {
      var w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', function () {
        // Nur bei einem Update melden; bei der Erstinstallation gibt es noch keinen controller
        if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdate(w);
      });
    });
    // Beim Zurückkehren in einen offenen Tab höchstens stündlich nach Updates schauen
    var lastCheck = Date.now();
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible' || Date.now() - lastCheck < 3600e3) return;
      lastCheck = Date.now();
      reg.update().catch(function () { /* offline */ });
    });
  }

  function register() {
    if (!('serviceWorker' in navigator) || !isSecure()) return;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!reloading) return;
      reloading = false;
      location.reload();
    });
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(watchRegistration).catch(function (e) {
      if (window.console) console.warn('Service Worker nicht registriert:', e);
    });
  }

  /* ---------- Installation ---------- */

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();          // eigener Hinweis in der App statt Mini-Infoleiste des Browsers
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    hideCard('install');
    notify();
  });

  // Ergebnis: 'accepted', 'dismissed' oder 'unavailable'
  function promptInstall() {
    var p = deferredPrompt;
    if (!p) return Promise.resolve('unavailable');
    deferredPrompt = null;
    try {
      p.prompt();
      return p.userChoice.then(function (c) { notify(); return c && c.outcome === 'accepted' ? 'accepted' : 'dismissed'; },
        function () { return 'dismissed'; });
    } catch (e) {
      return Promise.resolve('unavailable');
    }
  }

  window.ExcelDrillsPwa = {
    setTranslator: function (fn) { translator = typeof fn === 'function' ? fn : null; refresh(); },
    refresh: refresh,
    showCard: showCard,
    hideCard: hideCard,
    canPrompt: function () { return !!deferredPrompt; },
    promptInstall: promptInstall,
    isStandalone: isStandalone,
    isIosSafari: isIosSafari,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };

  // Sprache gewechselt: Leiste und offene Karten neu beschriften
  function refresh() {
    try {
      Object.keys(cards).forEach(renderCard);
      syncLayerHeight();
      if (bar) renderBar();
    } catch (e) { /* ignorieren */ }
  }

  function start() {
    try {
      ensureLayer();
      renderBar();
      window.addEventListener('online', renderBar);
      window.addEventListener('offline', renderBar);
    } catch (e) { /* ignorieren */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
  // Registrierung erst nach load, damit der Precache (ca. 1.2 MB) nicht mit dem ersten Seitenaufbau konkurriert
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register);
})();
