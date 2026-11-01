/*
 * Excel-Drills – reine Logik des Stripe-Webhooks (ohne Netzwerk, ohne Abhängigkeiten).
 * Läuft in Deno (index.ts importiert diese Datei) und in Node (scripts/test-account.mjs).
 * Benötigt nur globalThis.crypto.subtle (Deno, Node >= 19).
 */

export const PLAN_AMOUNTS = { 900: 'monat', 4900: 'jahr', 14900: 'lifetime' }; // CHF-Rappen
export const SIGNATURE_TOLERANCE_SEC = 300;

/* ---------- Signatur (Stripe-Signature: t=…,v1=…) ---------- */

export function parseSignatureHeader(header) {
  const out = { t: null, v1: [] };
  String(header || '').split(',').forEach((part) => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    if (k === 't') out.t = Number(v);
    else if (k === 'v1') out.v1.push(v);
  });
  return out;
}

function toHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

// Prüft den Header gegen den rohen Body. Rückgabe { ok, reason }.
export async function verifyStripeSignature(payload, header, secret, opts = {}) {
  if (!secret) return { ok: false, reason: 'no-secret' };
  const { t, v1 } = parseSignatureHeader(header);
  if (!t || !v1.length) return { ok: false, reason: 'bad-header' };
  const now = opts.nowSec != null ? opts.nowSec : Math.floor(Date.now() / 1000);
  const tol = opts.toleranceSec != null ? opts.toleranceSec : SIGNATURE_TOLERANCE_SEC;
  if (Math.abs(now - t) > tol) return { ok: false, reason: 'too-old' };
  const expected = await hmacSha256Hex(secret, t + '.' + payload);
  return v1.some((sig) => safeEqual(sig, expected)) ? { ok: true } : { ok: false, reason: 'mismatch' };
}

/* ---------- Plan bestimmen ---------- */

// priceId: Stripe-Price-ID (price_…), amount: Betrag in Rappen, env: { PRICE_MONAT, PRICE_JAHR, PRICE_LIFETIME }
export function planFromPrice(priceId, amount, env = {}) {
  if (priceId) {
    if (env.PRICE_MONAT && priceId === env.PRICE_MONAT) return 'monat';
    if (env.PRICE_JAHR && priceId === env.PRICE_JAHR) return 'jahr';
    if (env.PRICE_LIFETIME && priceId === env.PRICE_LIFETIME) return 'lifetime';
  }
  const n = Number(amount);
  if (PLAN_AMOUNTS[n]) return PLAN_AMOUNTS[n];
  return null;
}

/* ---------- Stripe-Objekte -> Lizenz ---------- */

export function normEmail(e) { return String(e || '').trim().toLowerCase(); }

function isoFromUnix(sec) {
  const n = Number(sec);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString() : null;
}

// Ab Stripe-API 2025-03-31 steht current_period_end an den Abo-Positionen, vorher am Abo selbst.
export function periodEndOf(sub) {
  if (!sub) return null;
  if (sub.current_period_end) return Number(sub.current_period_end);
  const items = (sub.items && sub.items.data) || [];
  const ends = items.map((it) => Number(it.current_period_end)).filter((n) => Number.isFinite(n) && n > 0);
  return ends.length ? Math.max(...ends) : null;
}

export function subscriptionPriceId(sub) {
  const it = sub && sub.items && sub.items.data && sub.items.data[0];
  return (it && it.price && it.price.id) || null;
}

// Stripe-Abo-Status -> active | canceled | past_due
export function mapSubscriptionStatus(status) {
  switch (status) {
    case 'active': case 'trialing': return 'active';
    case 'past_due': case 'unpaid': case 'incomplete': case 'paused': return 'past_due';
    default: return 'canceled'; // canceled, incomplete_expired
  }
}

// Felder zum Aktualisieren aus einem Subscription-Objekt (updated/deleted)
export function licensePatchFromSubscription(sub, deleted) {
  let end = periodEndOf(sub);
  if (deleted && sub && sub.ended_at) end = end ? Math.min(end, Number(sub.ended_at)) : Number(sub.ended_at);
  return {
    status: deleted ? 'canceled' : mapSubscriptionStatus(sub && sub.status),
    current_period_end: isoFromUnix(end),
    cancel_at_period_end: !!(sub && sub.cancel_at_period_end)
  };
}

// E-Mail aus der Checkout-Session
export function checkoutEmail(session) {
  return normEmail((session.customer_details && session.customer_details.email) || session.customer_email || '');
}

/*
 * Lizenz-Zeile aus checkout.session.completed.
 * extra: { priceId, subscription } – vom Webhook über die Stripe-API nachgeladen (Positionen, Abo).
 */
export function licenseFromCheckout(session, extra = {}, env = {}) {
  const sub = extra.subscription || null;
  const priceId = extra.priceId || subscriptionPriceId(sub);
  let plan = planFromPrice(priceId, session.amount_total, env);
  if (!plan) plan = session.mode === 'payment' ? 'lifetime' : null;
  const row = {
    email: checkoutEmail(session),
    plan,
    status: 'active',
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : (session.customer && session.customer.id) || null,
    stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : (session.subscription && session.subscription.id) || null,
    stripe_session_id: session.id || null,
    cancel_at_period_end: false,
    current_period_end: null
  };
  if (plan === 'lifetime') row.stripe_subscription_id = null;
  if (sub) Object.assign(row, licensePatchFromSubscription(sub, false));
  return row;
}

// Abo-ID einer Rechnung (alte und neue Stripe-API)
export function invoiceSubscriptionId(invoice) {
  if (!invoice) return null;
  if (typeof invoice.subscription === 'string') return invoice.subscription;
  if (invoice.subscription && invoice.subscription.id) return invoice.subscription.id;
  const p = invoice.parent && invoice.parent.subscription_details;
  if (p && p.subscription) return typeof p.subscription === 'string' ? p.subscription : p.subscription.id;
  return null;
}

export const HANDLED_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed'
];
