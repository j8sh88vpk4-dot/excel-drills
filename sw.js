/*
 * Excel-Drills – Service Worker (Scope /). Registriert von assets/pwa.js (app/index.html, index.html).
 *
 * Ziel: Die App und die Gratis-Übungen laufen offline. Alles andere (Startseite, Artikel, Pfade, PDFs) bleibt
 * Network-Only, bei Navigation ohne Netz kommt /offline.html.
 *
 *   /app/* (ausser JSON und files/), /assets/*, Manifest, HyperFormula (CDN)  → Stale-While-Revalidate
 *   /app/exercises.json, /app/i18n/*.json                                    → Network-First, Cache als Fallback
 *   /app/files/** (Projekt-xlsx)                                              → nie cachen
 *   Supabase, Stripe, Plausible                                               → nie anfassen
 *   übrige Navigation                                                         → Netz, offline: /offline.html
 *
 * Neue Version ausliefern: CACHE_VERSION erhöhen. Der neue Worker wartet, bis die Seite «Neu laden» anbietet
 * (assets/pwa.js schickt SKIP_WAITING); im activate werden alte Caches gelöscht.
 */
'use strict';

const CACHE_VERSION = '2026-11-01.3';
const CACHE_PREFIX = 'excel-drills-';
const CACHE = CACHE_PREFIX + CACHE_VERSION;
const NETWORK_TIMEOUT_MS = 4000; // Network-First: danach Cache, falls vorhanden (langsames Netz im Zug)

// HyperFormula 3.0.0 wie in app/index.html und app/app.js (SRI bleibt dort im HTML/JS).
const HF_BASE = 'https://cdn.jsdelivr.net/npm/hyperformula@3.0.0/dist/';

const PRECACHE = [
  '/app/',
  '/app/app.js',
  '/app/sheet-pick.js',
  '/app/engine.js',
  '/app/gamification.js',
  '/app/badges.js',
  '/app/errors.js',
  '/app/access.js',
  '/app/config.js',
  '/app/account.js',
  '/app/keys.js',
  '/app/i18n/ui-de.js',
  '/app/i18n/fr.json',
  '/app/i18n/it.json',
  '/app/exercises.json',
  '/assets/style.css',
  '/assets/sheet-pick.css',
  '/assets/leads-config.js',
  '/assets/analytics.js',
  '/assets/pwa.js',
  '/offline.html',
  '/manifest.json',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/icon-maskable-192.png',
  '/assets/icons/icon-maskable-512.png',
  '/assets/icons/apple-touch-icon.png'
];

const PRECACHE_CDN = [
  HF_BASE + 'hyperformula.full.min.js',
  HF_BASE + 'languages/deDE.js',
  HF_BASE + 'languages/frFR.js',
  HF_BASE + 'languages/itIT.js'
];

// Nie cachen und nie abfangen (Zahlung, Leads, Messung)
const NEVER_HOSTS = /(^|\.)(supabase\.co|supabase\.in|stripe\.com|stripe\.network|plausible\.io)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Eigene Dateien: alle oder keine (sonst bleibt der alte Worker aktiv). cache: 'reload' umgeht den HTTP-Cache.
    await cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' })));
    // CDN (cross-origin, CORS): best effort. Fehlt eine Datei, füllt sie der Laufzeit-Cache beim nächsten Laden.
    await Promise.all(PRECACHE_CDN.map(async (u) => {
      try {
        const res = await fetch(new Request(u, { mode: 'cors', credentials: 'omit', cache: 'reload' }));
        if (res.ok) await cache.put(u, res);
      } catch (e) { /* offline oder blockiert: später */ }
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// «Neu laden» im Update-Hinweis (assets/pwa.js)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (NEVER_HOSTS.test(url.hostname)) return;

  if (url.origin !== self.location.origin) {
    if (url.href.startsWith(HF_BASE)) event.respondWith(staleWhileRevalidate(event, req, url.href));
    return; // übrige fremde Hosts: Browser wie ohne Service Worker
  }

  const path = url.pathname;
  if (path === '/sw.js' || path.startsWith('/app/files/')) return;

  if (path === '/app/exercises.json' || (path.startsWith('/app/i18n/') && path.endsWith('.json'))) {
    event.respondWith(networkFirst(event, req, url.origin + path));
    return;
  }

  if (path === '/app' || path.startsWith('/app/') || path.startsWith('/assets/') ||
      path === '/manifest.json' || path === '/offline.html') {
    event.respondWith(staleWhileRevalidate(event, req, cacheKey(req, url)));
    return;
  }

  // Alles andere: Network-Only, bei Navigation ohne Netz die Offline-Seite
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => offlinePage()));
  }
});

// App-Seite: /app, /app/, /app/index.html mit beliebigen Parametern (?quelle=pwa, ?key=, ?pfad=) → ein Eintrag
function cacheKey(req, url) {
  const p = url.pathname;
  if (req.mode === 'navigate' && (p === '/app' || p === '/app/' || p === '/app/index.html')) return url.origin + '/app/';
  return url.origin + p + url.search;
}

function cacheable(res) {
  return res && res.ok && (res.type === 'basic' || res.type === 'cors' || res.type === 'default');
}

// Navigationsantworten dürfen nicht «redirected» sein (z. B. /app → /app/), sonst verwirft der Browser sie.
async function clean(res) {
  if (!res || !res.redirected) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}

async function offlinePage() {
  const page = await caches.match('/offline.html');
  return page || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

async function staleWhileRevalidate(event, req, key) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(key, { ignoreVary: true });
  const network = fetch(req).then(async (res) => {
    if (cacheable(res)) {
      const copy = await clean(res.clone());
      await cache.put(key, copy);
    }
    return res;
  });
  event.waitUntil(network.then(() => undefined, () => undefined)); // Aktualisierung im Hintergrund fertig laufen lassen
  if (cached) return clean(cached);
  try {
    return await clean(await network);
  } catch (e) {
    if (req.mode === 'navigate') return offlinePage();
    throw e;
  }
}

async function networkFirst(event, req, key) {
  const cache = await caches.open(CACHE);
  const network = fetch(req).then(async (res) => {
    if (cacheable(res)) await cache.put(key, res.clone());
    return res;
  });
  event.waitUntil(network.then(() => undefined, () => undefined));
  let res = null;
  try {
    res = await Promise.race([network, new Promise((resolve) => setTimeout(resolve, NETWORK_TIMEOUT_MS, null))]);
  } catch (e) { res = null; }
  if (res && res.ok) return res;
  const cached = await cache.match(key, { ignoreSearch: true, ignoreVary: true });
  if (cached) return cached;
  return res || network; // kein Cache: auf das Netz warten (bzw. dessen Fehler weitergeben)
}
