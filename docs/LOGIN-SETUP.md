# Konto «Fortschritt sichern» einrichten (Supabase + Stripe-Webhook)

Stand 31.10.2026.

> **Erledigt durch Claude am 31.10.2026:** Supabase-Projekt «excel-drills» (Organisation Excel-Drills, Free, Region Zürich
> eu-central-2, Projekt-Ref `uijlrixalisqbcgivccn`), SQL-Schema ausgeführt, Site URL und 4 Redirect-URLs gesetzt,
> Edge Function `stripe-webhook` über den Dashboard-Editor deployt (Verify JWT aus), Stripe-Webhook
> `excel-drills-supabase` auf `https://uijlrixalisqbcgivccn.supabase.co/functions/v1/stripe-webhook` mit 5 Events,
> `app/config.js` und Price-IDs eingetragen.
> **Noch offen (nur Luca):** Secrets `STRIPE_SECRET_KEY` (Restricted Key, nur Lesen) und `STRIPE_WEBHOOK_SECRET`
> (Stripe › Workbench › Webhooks › excel-drills-supabase › Signatur-Geheimnis anzeigen) unter
> Supabase › Edge Functions › Secrets eintragen; Resend-Konto + SMTP in Supabase; danach Mail-Vorlagen (Schritt 3)
> und Testkauf (Schritt 10). Erst dann Branch `login` auf `main` mergen. Solange `app/config.js` leer ist, ist die Konto-Funktion unsichtbar und die App läuft wie bisher
(nur localStorage, Zugangscode per `?key=`). Alles hier ist eine einmalige Einrichtung, ca. 60–90 Minuten.

## Wer trägt was ein?

| Wert | Wo | Wer |
|---|---|---|
| Projekt-URL (`https://<ref>.supabase.co`) | `app/config.js` | Claude (öffentlich) |
| anon / publishable Key | `app/config.js` | Claude (öffentlich, steht ohnehin im Browser) |
| Stripe-Price-IDs (`price_…`) | `DEFAULT_PRICES` in `supabase/functions/stripe-webhook/index.ts` oder als Secret | Claude (nicht geheim) |
| **Service-Role-Key** | nirgends eintragen, ist in der Edge Function automatisch vorhanden | **nur Luca**, nie in Dateien, Chats oder Git |
| **Stripe Secret Key** (`sk_…` bzw. `rk_…`) | `supabase secrets set` | **nur Luca** |
| **Stripe Webhook Signing Secret** (`whsec_…`) | `supabase secrets set` | **nur Luca** |
| SMTP-Passwort / API-Key (z. B. Resend) | Supabase › Authentication › SMTP | **nur Luca** |

Konto anlegen bei Supabase und Resend, Logins und Secrets: alles Luca. Claude braucht danach nur URL, anon-Key
und die drei Price-IDs (z. B. als Screenshot oder Text im Chat, die sind nicht geheim).

---

## 1. Supabase-Projekt anlegen

1. https://supabase.com › Sign in (z. B. mit GitHub) › **New project**.
2. Name: `excel-drills`. Datenbank-Passwort: generieren lassen und im Passwortmanager ablegen.
3. **Region: Central Europe (Zurich)** (`eu-central-2`). Das steht so in der Datenschutzerklärung.
4. Plan: Free reicht für den Test (pausiert nach 7 Tagen ohne Aktivität; bei Go auf Pro wechseln, USD 25/Monat).
5. Nach dem Anlegen: **Project Settings › API Keys** (bzw. «Data API»):
   - **Project URL** und **anon / publishable key** an Claude geben.
   - **service_role / secret key**: NICHT weitergeben. Wird nur von der Edge Function verwendet und ist dort automatisch gesetzt.

## 2. Datenbank: SQL ausführen

1. Dashboard › **SQL Editor** › **New query**.
2. Inhalt von `supabase/migrations/001_init.sql` komplett einfügen › **Run**.
3. Kontrolle: **Table Editor** zeigt `profiles`, `progress`, `licenses`, `stripe_events`, alle mit «RLS enabled».
   Unter **Database › Functions** gibt es `has_premium` und `handle_new_user`.

Die Datei ist idempotent; ein zweiter Lauf schadet nicht.

## 3. Auth-Einstellungen

**Authentication › Sign In / Providers › Email**
- Email: aktiviert. «Confirm email»: an. Passwort-Anmeldung wird von der App nicht benutzt.
- Email OTP Expiration: 3600 s (1 Stunde) ist ok.

**Authentication › URL Configuration**
- **Site URL:** `https://excel-drills.ch`
- **Redirect URLs** (je mit «Add URL»):
  - `https://excel-drills.ch/app/*`
  - `https://www.excel-drills.ch/app/*`
  - `https://excel-drills.onrender.com/app/*`
  - `http://127.0.0.1:8787/app/*` (lokaler Test mit `npm run preview`)

Die App schickt als Rücksprung `…/app/?login=1`. Steht die Adresse nicht in der Liste, leitet Supabase auf die Site URL
um und die Anmeldung klappt nicht.

**Authentication › Emails › Templates** (Sprache Deutsch, Du-Form). Zwei Vorlagen anpassen:

*Magic Link* (für bestehende Konten, auch die nach einem Kauf automatisch angelegten):

- Subject: `Dein Anmeldelink für Excel-Drills`
- Body (HTML):

```html
<h2>Fortschritt sichern bei Excel-Drills</h2>
<p>Hallo</p>
<p>Mit diesem Link meldest du dich bei Excel-Drills an. Ein Passwort brauchst du nicht.</p>
<p><a href="{{ .ConfirmationURL }}">Jetzt anmelden</a></p>
<p>Der Link gilt eine Stunde und funktioniert einmal. Danach kannst du in der App unter «Fortschritt sichern» jederzeit einen neuen anfordern.</p>
<p>Du hast keinen Link angefordert? Dann kannst du diese Mail ignorieren.</p>
<p>Excel-Drills · excel-drills.ch · Fragen: hallo@excel-drills.ch</p>
```

*Confirm signup* (erste Anmeldung über «Fortschritt sichern»):

- Subject: `Willkommen bei Excel-Drills: Anmeldung bestätigen`
- Body (HTML):

```html
<h2>Willkommen bei Excel-Drills</h2>
<p>Hallo</p>
<p>Bestätige mit einem Klick deine E-Mail-Adresse. Danach ist dein Fortschritt (XP, Medaillen, Streak) auf allen Geräten gesichert, und Premium aus einem Kauf mit dieser Adresse gilt überall.</p>
<p><a href="{{ .ConfirmationURL }}">E-Mail bestätigen und anmelden</a></p>
<p>Der Link gilt eine Stunde. Ein Passwort gibt es nicht: Du meldest dich immer über einen Link per E-Mail an.</p>
<p>Du hast dich nicht angemeldet? Dann kannst du diese Mail ignorieren, es wird nichts gespeichert, bis du den Link öffnest.</p>
<p>Excel-Drills · excel-drills.ch · Fragen: hallo@excel-drills.ch</p>
```

## 4. Mailversand (SMTP): Pflicht vor dem Livegang

Der eingebaute Supabase-Mailserver ist nur zum Testen gedacht: **Er schickt nur an E-Mail-Adressen von Mitgliedern
deines Supabase-Teams und nur wenige Mails pro Stunde.** Für echte Kundinnen und Kunden braucht es eigenes SMTP.

Empfehlung **Resend** (gratis bis 3'000 Mails/Monat, max. 100 pro Tag):
1. https://resend.com › Konto (Luca) › **Domains › Add domain** `excel-drills.ch`, Region EU.
2. Die angezeigten DNS-Einträge (SPF `TXT`, DKIM `TXT`, ggf. `MX` für send.excel-drills.ch) beim Registrar eintragen,
   in Resend «Verify». Ohne diese Einträge landen Mails im Spam.
3. **API Keys › Create** (Permission: Sending access, Domain excel-drills.ch). Key nur in Supabase eintragen.
4. Supabase › **Authentication › Emails › SMTP Settings** › Enable custom SMTP:
   Host `smtp.resend.com`, Port `465`, Username `resend`, Password = Resend-API-Key,
   Sender email `login@excel-drills.ch`, Sender name `Excel-Drills`.
5. **Authentication › Rate Limits:** «Rate limit for sending emails» z. B. auf 60 pro Stunde setzen
   (Standard nach SMTP-Umstellung: 30/h). Pro Adresse gilt zusätzlich: höchstens ein Link pro 60 Sekunden.

Alternativen: Postmark, Brevo, Mailjet (alle mit EU-Option). Den gewählten Anbieter in `datenschutz.html`
(Abschnitt «Freiwilliges Konto», Platzhalter `[Mail-Anbieter …]`) eintragen.

## 5. Edge Function `stripe-webhook` deployen

Variante A, **Supabase CLI** (empfohlen):

```sh
brew install supabase/tap/supabase
cd ~/Documents/excel-drills
supabase login                                   # öffnet den Browser (Luca)
supabase link --project-ref <ref>                # <ref> = Teil vor .supabase.co
supabase functions deploy stripe-webhook --no-verify-jwt
```

`--no-verify-jwt` ist nötig, weil Stripe kein Supabase-Token mitschickt; die Funktion prüft stattdessen die
Stripe-Signatur.

Variante B, **Dashboard**: Edge Functions › **Deploy a new function › Via Editor**, Name `stripe-webhook`.
Zwei Dateien anlegen: `index.ts` und `logic.js`, jeweils den Inhalt aus `supabase/functions/stripe-webhook/`
einfügen › Deploy. Danach in den Function-Einstellungen **«Verify JWT with legacy secret» / «Enforce JWT» ausschalten**.

Die Funktions-URL lautet: `https://<ref>.supabase.co/functions/v1/stripe-webhook`

## 6. Secrets setzen (nur Luca)

Stripe › Developers › API keys: am besten einen **Restricted key** anlegen (Name «excel-drills-webhook»),
Berechtigungen nur **Read** für «Checkout Sessions» und «Subscriptions». Ein normaler Secret Key (`sk_…`) geht auch.

```sh
supabase secrets set STRIPE_SECRET_KEY=rk_live_...      # bzw. rk_test_... im Testmodus
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...    # aus Schritt 7
supabase secrets set PRICE_MONAT=price_... PRICE_JAHR=price_... PRICE_LIFETIME=price_...   # optional, siehe Schritt 8
```

Im Dashboard geht das unter Edge Functions › **Secrets**. `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` sind
automatisch vorhanden, nicht setzen. Optional: `SITE_URL` (Standard `https://excel-drills.ch`),
`SEND_MAGIC_LINK=0` schaltet die Mail nach dem Kauf ab.

## 7. Stripe-Webhook anlegen

Stripe › **Developers › Webhooks › Add destination** (bzw. «Add endpoint»):
- Events from: **Your account**. API-Version: die vorgeschlagene (die Funktion versteht alte und neue Formate).
- Endpoint URL: `https://<ref>.supabase.co/functions/v1/stripe-webhook`
- Events auswählen:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Speichern › **Signing secret** «Reveal» › kopieren › als `STRIPE_WEBHOOK_SECRET` setzen (Schritt 6).

Test- und Live-Modus haben je eigene Webhooks und eigene Signing Secrets.

## 8. Price-IDs aus Stripe holen

Stripe › **Product catalog** › Produkt Excel-Drills Premium › bei jedem Preis (Monat CHF 9, Jahr CHF 49, Lifetime CHF 149)
auf «…» › **Copy price ID** (`price_…`). Die drei IDs an Claude geben (Claude trägt sie in
`DEFAULT_PRICES` in `index.ts` ein, danach neu deployen) oder selbst als Secret setzen.
Ohne IDs erkennt die Funktion den Plan über den Betrag (900 / 4'900 / 14'900 Rappen); mit Rabattcodes stimmt der
Betrag nicht mehr, darum sind die IDs besser.

Die Payment Links behalten ihre Erfolgs-URL `https://excel-drills.ch/app/?key=…&plan=…`; der Code bleibt als Übergang gültig.

## 9. `app/config.js` füllen (Claude)

```js
window.ExcelDrillsConfig = {
  supabaseUrl: 'https://<ref>.supabase.co',
  supabaseAnonKey: '<anon/publishable key>'
};
```

Danach erscheint oben in der App «Fortschritt sichern». Gleichzeitig live schalten: die Sätze zum Konto in
`index.html`, `premium.html` und `datenschutz.html` (sind schon drin und beschreiben die Funktion).

## Aktivieren

Stand 1.11.2026: Branch `login` ist auf `main` gemergt, `app/config.js` ist aber bewusst **leer** eingecheckt.
Grund: Supabase hat noch kein eigenes SMTP, der Standard-Mailer schickt nur 2 Mails pro Stunde. Die Konto-Funktion
bleibt ausgeblendet, bis Resend (Schritt 4) eingerichtet ist. Danach:

1. In `app/config.js` die beiden Werte eintragen (stehen dort als Kommentarzeile, beide öffentlich):
   `supabaseUrl: 'https://uijlrixalisqbcgivccn.supabase.co'`, `supabaseAnonKey: 'sb_publishable_jtC1RxHTZq84yrxItckk8Q_iz_19kyU'`.
2. In `sw.js` `CACHE_VERSION` erhöhen (sonst bekommen installierte Apps die neue `config.js` erst verspätet).
3. Committen und pushen; Render deployt automatisch. Kontrolle: in `/app/` erscheint oben «Fortschritt sichern».

## 10. Testablauf (Stripe-Testmodus)

1. Stripe oben rechts auf **Test mode**. Webhook aus Schritt 7 im Testmodus anlegen, Test-Secrets setzen
   (`rk_test_…`, Test-`whsec_…`), Test-Price-IDs verwenden.
2. Lokal: `npm run preview` › http://127.0.0.1:8787/app/ › «Fortschritt sichern» › eigene Adresse › Link aus der Mail öffnen.
   Erwartet: Toast «Fortschritt gesichert», oben das E-Mail-Kürzel, im Profil Abschnitt «Konto».
   In Supabase › Table Editor › `progress` steht eine Zeile mit dem Stand.
3. Zweites Gerät/Browser: gleiche Adresse anmelden › XP, Medaillen und Streak erscheinen.
4. Kauf: Test-Payment-Link öffnen, Karte `4242 4242 4242 4242`, beliebiges Datum in der Zukunft, CVC 123.
   Erwartet: Stripe › Webhooks › Endpoint zeigt `200`; `licenses` hat eine Zeile (plan, status active,
   current_period_end); Mail mit Anmeldelink kommt; im Profil steht «Jahresabo, aktiv, verlängert sich am …».
5. Kündigung: Test-Kundenportal › Abo kündigen › Webhook `customer.subscription.updated` › Profil zeigt
   «gekündigt, Zugang bis …». Ende der Periode simulieren: Abo in Stripe sofort kündigen («Cancel immediately»)
   › `deleted` › Premium weg (ausser ein gültiger Code liegt im Browser).
6. Zahlungsausfall: Abo mit Karte `4000 0000 0000 0341` (wird bei der Verlängerung abgelehnt), mit
   **Test clock** vorspulen › `invoice.payment_failed` › Status `past_due`, Zugang bis Periodenende.
7. Erneut senden: Stripe › Webhook › Event › «Resend» › Antwort `{"duplicate": …}` (Idempotenz).
8. Wenn alles passt: Live-Webhook anlegen, Live-Secrets setzen, `npm run check`, deployen.

Fehlersuche: Supabase › Edge Functions › stripe-webhook › **Logs**; Stripe › Webhooks › Event › Antwort der Funktion.

## Betrieb

- **Konto löschen** (Anfrage per Mail): Supabase › Authentication › Users › Nutzer › Delete user. `profiles` und
  `progress` werden mitgelöscht; `licenses` bleiben für die Buchhaltung, `user_id` wird leer.
- **Kauf mit anderer E-Mail** als das Konto: in `licenses` die Zeile auf die Konto-Adresse ändern (Table Editor) oder
  der Person sagen, sie soll sich mit der Kaufadresse anmelden.
- **Lizenz ohne Konto:** Kauf legt die Lizenz an und erstellt das Konto zur Kaufadresse automatisch. Wer den Link nie
  öffnet, nutzt Premium weiterhin über den Code; sobald er sich anmeldet, ist die Lizenz verknüpft.
- **Free-Plan:** Projekt pausiert nach 7 Tagen ohne Anfragen; dann kommen Webhooks nicht an (Stripe wiederholt bis
  3 Tage). Für den Livebetrieb Pro-Plan oder regelmässige Nutzung sicherstellen.
