// Excel-Drills – Stripe-Webhook (Supabase Edge Function, Deno)
//
// Stripe-Käufe -> Lizenzen (Tabelle licenses), Kündigung/Zahlungsausfall -> Status und Periodenende.
// Nach einem Kauf: Konto zur E-Mail anlegen (falls nötig) und Magic-Link schicken.
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt   (Stripe sendet kein Supabase-JWT)
//
// Umgebungsvariablen (supabase secrets set …, siehe docs/LOGIN-SETUP.md):
//   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET          (nur Luca setzt diese)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY           (in Supabase automatisch vorhanden)
//   PRICE_MONAT, PRICE_JAHR, PRICE_LIFETIME           (Stripe-Price-IDs; Fallback über Betrag 900/4900/14900)
//   SITE_URL                                          (optional, Standard https://excel-drills.ch)
//   SEND_MAGIC_LINK                                   (optional, "0" schaltet den Mailversand ab)

import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import {
  verifyStripeSignature, licenseFromCheckout, licensePatchFromSubscription, invoiceSubscriptionId,
  checkoutEmail, HANDLED_EVENTS
} from './logic.js';

const env = (k: string) => Deno.env.get(k) ?? '';
const SITE_URL = (env('SITE_URL') || 'https://excel-drills.ch').replace(/\/$/, '');
// Stripe-Price-IDs sind nicht geheim: hier eintragen ODER als Secret setzen (Secret hat Vorrang).
const DEFAULT_PRICES = { monat: 'price_1UWH3p2ObEvn7ZEOU7nycPdc', jahr: 'price_1UWH3p2ObEvn7ZEOus8nKejk', lifetime: 'price_1UWH3p2ObEvn7ZEOPAiNZGkx' };
const PRICES = {
  PRICE_MONAT: env('PRICE_MONAT') || DEFAULT_PRICES.monat,
  PRICE_JAHR: env('PRICE_JAHR') || DEFAULT_PRICES.jahr,
  PRICE_LIFETIME: env('PRICE_LIFETIME') || DEFAULT_PRICES.lifetime
};

const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

// Stripe-REST (nur lesend): Positionen einer Checkout-Session, Abo
async function stripeGet(path: string) {
  const r = await fetch('https://api.stripe.com/v1/' + path, {
    headers: { Authorization: 'Bearer ' + env('STRIPE_SECRET_KEY') }
  });
  if (!r.ok) throw new Error('Stripe ' + path + ': HTTP ' + r.status);
  return await r.json();
}

async function userIdForEmail(email: string): Promise<string | null> {
  const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
  return data ? data.id : null;
}

// Zeile anhand eines eindeutigen Stripe-Feldes aktualisieren oder neu anlegen
async function upsertLicense(row: Record<string, unknown>) {
  const key = row.stripe_subscription_id ? 'stripe_subscription_id' : 'stripe_session_id';
  const { data: existing, error: selErr } = await admin.from('licenses').select('id').eq(key, row[key] as string).maybeSingle();
  if (selErr) throw selErr;
  if (existing) {
    const { error } = await admin.from('licenses').update(row).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await admin.from('licenses').insert(row);
    if (error) throw error;
  }
}

// Konto anlegen (bestätigt) und Magic-Link schicken. Fehler hier blockieren die Lizenz nicht.
async function ensureUserAndMail(email: string) {
  let userId = await userIdForEmail(email);
  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error && !/already|registered|exists/i.test(error.message)) throw error;
    userId = data?.user?.id ?? (await userIdForEmail(email));
  }
  if (env('SEND_MAGIC_LINK') === '0') return;
  // signInWithOtp verschickt die Mail über den in Supabase eingestellten SMTP-Server (Vorlage «Magic Link»).
  const { error } = await admin.auth.signInWithOtp({
    email, options: { shouldCreateUser: false, emailRedirectTo: SITE_URL + '/app/?login=1' }
  });
  if (error) console.warn('Magic-Link nicht versendet:', error.message);
}

async function onCheckoutCompleted(session: any) {
  // Nur bezahlte (oder kostenlose) Sessions; verzögerte Zahlarten kommen mit async_payment_succeeded.
  if (session.payment_status && !['paid', 'no_payment_required'].includes(session.payment_status)) return 'unpaid';
  const email = checkoutEmail(session);
  if (!email) throw new Error('Checkout ohne E-Mail: ' + session.id);

  let priceId: string | null = null;
  let subscription: any = null;
  try {
    const items = await stripeGet('checkout/sessions/' + session.id + '/line_items?limit=5');
    priceId = items?.data?.[0]?.price?.id ?? null;
  } catch (e) { console.warn(String(e)); }   // Fallback: Plan über Betrag
  if (session.mode === 'subscription' && session.subscription) {
    const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
    subscription = await stripeGet('subscriptions/' + subId);
  }
  const row: Record<string, unknown> = licenseFromCheckout(session, { priceId, subscription }, PRICES);
  if (!row.plan) throw new Error('Plan nicht erkannt (Preis ' + priceId + ', Betrag ' + session.amount_total + ')');
  row.user_id = await userIdForEmail(email);
  await upsertLicense(row);
  try { await ensureUserAndMail(email); } catch (e) { console.warn('Konto/Mail:', String(e)); }
  return 'license:' + row.plan;
}

async function onSubscriptionChange(sub: any, deleted: boolean) {
  const patch = licensePatchFromSubscription(sub, deleted);
  const { data, error } = await admin.from('licenses').update(patch).eq('stripe_subscription_id', sub.id).select('id');
  if (error) throw error;
  // Kommt «updated» vor «checkout.session.completed» an, gibt es die Zeile noch nicht: Stripe liefert später erneut,
  // der Checkout-Handler übernimmt dann Status und Periodenende direkt vom Abo.
  return 'updated:' + (data ? data.length : 0);
}

async function onPaymentFailed(invoice: any) {
  const subId = invoiceSubscriptionId(invoice);
  if (!subId) return 'no-subscription';
  const { error } = await admin.from('licenses').update({ status: 'past_due' }).eq('stripe_subscription_id', subId);
  if (error) throw error;
  return 'past_due';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const payload = await req.text();
  const check = await verifyStripeSignature(payload, req.headers.get('stripe-signature'), env('STRIPE_WEBHOOK_SECRET'));
  if (!check.ok) return json(400, { error: 'signature', reason: check.reason });

  let event: any;
  try { event = JSON.parse(payload); } catch { return json(400, { error: 'json' }); }
  const handled = HANDLED_EVENTS.includes(event.type) || event.type === 'checkout.session.async_payment_succeeded';
  if (!handled) return json(200, { ignored: event.type });

  // Idempotenz: jedes Event nur einmal verarbeiten
  const { error: dupErr } = await admin.from('stripe_events').insert({ id: event.id, type: event.type });
  if (dupErr) {
    if (dupErr.code === '23505') return json(200, { duplicate: event.id });
    return json(500, { error: 'db', detail: dupErr.message });
  }

  try {
    const obj = event.data.object;
    let result = '';
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        result = await onCheckoutCompleted(obj); break;
      case 'customer.subscription.updated': result = await onSubscriptionChange(obj, false); break;
      case 'customer.subscription.deleted': result = await onSubscriptionChange(obj, true); break;
      case 'invoice.payment_failed': result = await onPaymentFailed(obj); break;
    }
    return json(200, { ok: true, result });
  } catch (e) {
    // Event wieder freigeben, damit Stripes automatische Wiederholung es erneut verarbeitet
    await admin.from('stripe_events').delete().eq('id', event.id);
    console.error(event.type, event.id, String(e));
    return json(500, { error: 'processing', detail: String(e) });
  }
});

