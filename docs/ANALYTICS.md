# Analytics (Plausible, cookielos)

Stand: 30.10.2026. Eingebaut ist Plausible Analytics: keine Cookies, keine IP-Speicherung, nur aggregierte Daten.
Die Datenschutzerklärung (datenschutz.html) ist entsprechend angepasst.

## Domain-Konfiguration

- Zentrale Stelle: `assets/analytics.js`, Konstante `DOMAIN` (aktuell `excel-drills.ch`).
- `DOMAIN` muss exakt der in Plausible angelegten Site entsprechen. Bei einem Domainwechsel nur dort ändern.
- Die Domain ist noch nicht registriert. Die Plausible-Site wird erst mit der echten Domain angelegt; bis dahin
  werden keine Daten erfasst (auf localhost misst Plausible ohnehin nicht).
- Das Skript wird auf allen Seiten direkt nach `style.css` eingebunden. Die Generatoren `scripts/artikel/lib.py`
  (Head-Template, gilt auch für die Pfad-Seiten) enthalten den Tag ebenfalls; neue Seiten brauchen ihn auch.
- Geladen wird `script.tagged-events.outbound-links.revenue.js` (Klassen-Ereignisse, ausgehende Links, Umsatz).

## In Plausible anzulegende Ziele (Goals → Custom event)

| Ereignis | Ausgelöst durch | Properties |
|---|---|---|
| `uebung_geloest` | erstes korrektes Lösen einer Übung (app/app.js); auch beim Übernehmen der Startseiten-Lösung als Übung 1 | `uebung` (Übungs-ID), `pfad` (Pfad-ID), bei Übernahme zusätzlich `ort=startseite` |
| `streak_3` | Serie erreicht neu 3 Tage | keine |
| `land` | Länder-Schalter CH/DE manuell umgestellt (app/app.js, assets/mini-drill.js) | `land` (`ch`/`de`), auf der Startseite zusätzlich `ort=startseite` |
| `premium_klick` | Klick auf einen Kauf-Button in premium.html | `plan` (jahr, monat, lifetime) |
| `kauf` | erstes Akzeptieren eines gültigen `?key=` in app/ | `plan`; Umsatz CHF 49 / 9 / 149 |
| `konto_link` | Magic-Link angefordert («Fortschritt sichern», app/account.js; nur mit app/config.js) | keine |
| `konto_login` | Anmeldung über den Magic-Link abgeschlossen | `abgleich` (merge, upload, server) |
| `paywall_gezeigt` | Paywall-Dialog in app/ geöffnet (Klick auf gesperrte Übung oder Direktlink) (app/app.js, `openPaywall`) | `pfad` (Pfad-ID), `uebung` (Übungs-ID, leer wenn unbekannt) |
| `mini_geloest` | Mini-Übung auf der Startseite gelöst, einmal pro Seitenaufruf (assets/mini-drill.js) | `land` (`de-CH`/`de-DE`) |
| `handout_lead` | Handout-Formular abgeschickt (handouts/gate.js) | `status`: `gesendet` (Adresse übermittelt), `platzhalter` (Formspree-ID fehlt noch, nichts gesendet), `fehler` |
| `pwa_install` | Klick auf «Installieren» in der Installations-Karte der App und Antwort im Browser-Dialog (app/app.js, `maybeOfferInstall`; nur Chrome/Edge/Android mit `beforeinstallprompt`) | `ergebnis`: `akzeptiert`, `abgelehnt` |

Beim Ziel `kauf` «Enable revenue tracking» mit Währung CHF aktivieren. In den Goal-Einstellungen die Properties
`plan`, `uebung`, `pfad`, `land`, `ort`, `status`, `ergebnis` unter «Custom Properties» freigeben, damit sie aufgeschlüsselt werden.

## Stripe-Erfolgs-URL

Je Payment Link unter «Nach der Zahlung» setzen (sonst fehlt der Plan bzw. der Umsatz):

- Jahr: `https://<DOMAIN>/app/?key=<CODE>&plan=jahr`
- Monat: `https://<DOMAIN>/app/?key=<CODE>&plan=monat`
- Lifetime: `https://<DOMAIN>/app/?key=<CODE>&plan=lifetime`

Ohne `plan` wird `kauf` mit `plan=unbekannt` und ohne Betrag gesendet. Der Kauf wird nur gemeldet, wenn der Code im
Browser noch nicht gespeichert war; ein erneutes Öffnen des Links zählt nicht doppelt. Hinweis: Wer den Link
auf einem zweiten Gerät öffnet, löst dort erneut ein `kauf` aus (MVP-Mechanismus, ungenau).

## Kampagnen

UTM-Parameter wertet Plausible automatisch aus; Schema in `social-kit/utm.md`.

## Technik

- `window.ExcelDrillsTrack(name, props, revenue)` kapselt alles in try/catch und tut nichts, wenn Plausible
  fehlt (Adblocker, offline). `revenue` ist optional: `{ currency: 'CHF', amount: 49 }`.
- Die Premium-Klicks laufen über Plausible-Klassen (`plausible-event-name=premium_klick plausible-event-plan=...`), ohne eigenen Code.

## Stand 30.10.2026: Plausible-Konto

- Site `excel-uebungen.ch` in Plausible angelegt (Konto luca@familymoser.ch, Testphase 30 Tage). Ziele vorhanden: `uebung_geloest`, `streak_3`, `premium_klick`, `kauf` (Revenue Goal, CHF).
- Bei anderer Domainwahl: Site in Plausible unter Settings → General umbenennen und `DOMAIN` in `assets/analytics.js` anpassen.

## Stand 30.10.2026 (UX-Review): neue Ereignisse

- Neu im Code: `paywall_gezeigt`, `mini_geloest`, `handout_lead` (Tabelle oben). In Plausible noch als Goals
  (Custom event) anlegen, sonst erscheinen sie nicht in der Auswertung.
- Trichter: Besuch → `mini_geloest` / `uebung_geloest` → `paywall_gezeigt` → `premium_klick` → `kauf`.
- `handout_lead` zählt bis zum Eintragen der Formspree-ID nur mit `status=platzhalter` (Adressen gehen dann noch verloren).

## Stand 31.10.2026 (PWA): Installation

- Neu: `pwa_install` mit Property `ergebnis` (`akzeptiert`/`abgelehnt`). In Plausible als Goal (Custom event)
  anlegen und `ergebnis` unter «Custom Properties» freigeben.
- Die Karte erscheint nach der zweiten gelösten Übung, höchstens einmal pro 7 Tage (localStorage
  `excelDrillsInstallHint`). Safari auf iOS hat keinen Installationsdialog: dort nur der Text
  «Teilen › Zum Home-Bildschirm», ohne Ereignis (die Installation ist dort nicht messbar).
- Start aus der installierten App: `start_url` ist `/app/?quelle=pwa`. Plausible wertet `quelle` nicht automatisch
  als Quelle aus (nur `utm_*`, `ref`, `source`); die Aufrufe sind unter Seiten mit dem Parameter nicht getrennt sichtbar.
  Bei Bedarf `start_url` auf `/app/?utm_source=pwa` ändern (CACHE_VERSION in sw.js nicht nötig, nur Manifest).
- Offline gelöste Übungen senden kein `uebung_geloest` (Plausible nicht erreichbar, die Warteschlange geht mit
  dem Schliessen der Seite verloren).

## Stand 31.10.2026 (Launch): Plausible-Site angelegt

- Site in Plausible von `excel-uebungen.ch` auf `excel-drills.ch` umbenannt (Settings → General → Change domain); passt zu `DOMAIN` in `assets/analytics.js`. Erste Pageviews laufen ein.
- Goals (Custom event) jetzt vollständig: `uebung_geloest`, `streak_3`, `premium_klick`, `kauf` (Revenue, CHF), `paywall_gezeigt`, `mini_geloest`, `handout_lead`, `pwa_install`, `land`.
- Custom Properties freigegeben: `plan`, `uebung`, `pfad`, `land`, `ort`, `status`, `ergebnis`.
- Offen: Funnel «Besuch → mini_geloest/uebung_geloest → paywall_gezeigt → premium_klick → kauf» (Settings → Funnels) und Wochenreport per E-Mail (Settings → Email reports). Hinweis von Plausible: Legacy-Snippet mit `data-domain`; funktioniert weiter, Umstieg auf das neue Script optional.

## Stand 1.11.2026 (Differenzierung): neue Ereignisse

| Ereignis | Ausgelöst durch | Properties |
|---|---|---|
| `assessment_start` / `assessment_done` | Rollen-Assessment gestartet / ausgewertet (app/assessment.js) | `rolle`, `sprache` (de/en), bei done `punkte` |
| `share_click` | Teilen-Bild heruntergeladen oder geteilt | `rolle`, `art` |
| `upload_check` / `upload_download` | Excel-Datei geprüft / Aufgabendatei geladen (app/upload.js) | `uebung`, `ergebnis`, `typ` |
| `interview_start` / `interview_done` | KI-Interview (app/interview.js) | `rolle`, bei done `punkte` |
| `campaign_day_done` | Kampagnen-Tag zum ersten Mal gelöst (app/campaign.js) | `kampagne`, `tag` |
| `review_open` | fällige Wiederholung aus «Heute fällig» geöffnet (app/app.js) | `uebung` |
| `recruiter_submit` | Ergebnis an Firma übermittelt (app/recruiter.js) | `rolle` |
| `warteliste` | Warteliste SQL/Python/Bundle (assets/waitlist.js) | `produkt`, `status` |
| `zellklick` | erster Zellbezug per Klick eingefügt (app/sheet-pick.js) | `ort` |

Alle als Goals (Custom event) in Plausible angelegt (1.11.2026); Properties `rolle`, `sprache`, `art`, `typ`, `kampagne`, `tag`, `produkt`, `ort` noch unter Custom Properties freigeben.
