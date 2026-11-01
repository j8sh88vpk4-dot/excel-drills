/*
 * Excel-Drills – Konfiguration des freiwilligen Kontos («Fortschritt sichern»)
 *
 * Leer lassen = Konto-Funktion ausgeblendet, die App läuft wie bisher (nur localStorage).
 * Hier gehören NUR öffentliche Werte hin (Projekt-URL und anon/publishable Key, beide sind im Browser sichtbar).
 * Niemals den Service-Role-Key, Stripe-Secret oder Webhook-Secret eintragen! Siehe docs/LOGIN-SETUP.md.
 *
 * Zurzeit bewusst leer: Supabase hat noch kein eigenes SMTP (Standard-Mailer nur 2 Mails pro Stunde).
 * Aktivieren (siehe docs/LOGIN-SETUP.md, «Aktivieren»), beide Werte öffentlich:
 *   supabaseUrl: 'https://uijlrixalisqbcgivccn.supabase.co', supabaseAnonKey: 'sb_publishable_jtC1RxHTZq84yrxItckk8Q_iz_19kyU'
 */
window.ExcelDrillsConfig = {
  supabaseUrl: '',
  supabaseAnonKey: ''   // Publishable Key, öffentlich
};
