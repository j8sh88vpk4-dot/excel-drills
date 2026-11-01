# SEA-Plan: Google Ads und Meta für Excel-Drills

Stand: 1. November 2026. Launch-Phase bis Go/No-Go am 27.11.2026. Startpreis Monat CHF 9, Jahr CHF 49, Lifetime CHF 149.
Konversionsziel: `kauf` in Plausible (Revenue), Vorstufen `premium_klick`, `paywall_gezeigt`, `uebung_geloest`.

## Phasen

| Phase | Zeitraum | Kanal | Budget | Bedingung |
|---|---|---|---|---|
| 0 Organisch messen | 1.–8.11. | keine Werbung | 0 | Baseline: Mini-Übung-Quote, Paywall-Quote, Premium-Klicks |
| 1 Meta-Boost-Test | ab 9.11., 7 Tage | Instagram-Boost des besten Posts | CHF 5–10/Tag, max. CHF 70 | ≥ 30 % der Besucher lösen die Mini-Übung, ≥ 1 Premium-Klick in Woche 1 |
| 2 Google Search | nach dem Go (ab 28.11.) | Google Ads, Suchnetzwerk, nur CH | CHF 10/Tag, max. CHF 300/Monat | Paywall-Conversion > 2 % organisch bestätigt |
| 3 Skalieren | ab Januar 2027 | Google Search + Meta Retargeting | nach ROAS | CPA unter CHF 25 pro Kauf über 4 Wochen |

Abbruchregeln (gelten in jeder Phase): CPC über CHF 1.50 im Durchschnitt nach CHF 50, oder kein `premium_klick` nach CHF 50, oder kein `kauf` nach CHF 150 → pausieren, Landingpage und Keywords prüfen, dann neu starten.

## Google Ads: Kampagnenstruktur (Phase 2)

Eine Kampagne «Excel üben CH», Suchnetzwerk, Standort Schweiz, Sprache Deutsch, Gebotsstrategie zuerst «Klicks maximieren» mit CPC-Limit CHF 1.20, nach 30 Conversions auf «Conversions maximieren». Keine Display-Erweiterung, kein Suchpartner-Netzwerk.

### Anzeigengruppen und Keywords (Phrase Match, ausser markiert)

| Anzeigengruppe | Keywords | Landingpage |
|---|---|---|
| Excel üben | "excel üben", "excel übungen", "excel übungen online", "excel übungen mit lösungen", "excel lernen online", [excel übungen schweiz] | `/` |
| Einstellungstest | "excel einstellungstest", "excel test bewerbung", "excel test vorstellungsgespräch", "excel prüfung üben" | `/artikel/excel-einstellungstest-ueben.html` |
| KV und Lehre | "excel kv", "excel übungen kv", "excel lehre", "excel berufsschule", "excel kaufmännisch" | `/artikel/excel-uebungen-kv.html` |
| Funktionen | "sverweis üben", "sverweis übung", "summewenn übung", "wenn funktion übung", "excel formeln üben" | passender Artikel, z. B. `/artikel/sverweis.html` |
| Schweiz-spezifisch | "excel 5 rappen runden", "vrunden excel", "excel rappen runden", "excel mwst berechnen schweiz" | `/artikel/vrunden-5-rappen.html` |
| Controlling | "excel controlling übungen", "excel buchhaltung übungen", "excel monatsabschluss" | `/pfad/accounting.html` |

Ausschluss-Keywords (Kampagnenebene): kurs, schulung, seminar, zertifikat, ecdl, download, vorlage, template, vba, makro, kostenlos herunterladen, job, stellen, englisch, english, mac, google sheets, numbers, libreoffice, kinder, schule primar.

Hinweis: «kostenlos» und «gratis» NICHT ausschliessen, 18 Übungen sind gratis und die Suchenden sind die richtigen.

### Responsive Suchanzeigen (Texte, je ≤ 30 Zeichen Titel, ≤ 90 Zeichen Beschreibung)

Anzeigengruppe «Excel üben»
- Titel: Excel üben auf Deutsch · 18 Übungen gratis · Formel tippen, sofort prüfen · SUMME, WENN, SVERWEIS · Ohne Anmeldung starten · Für Büro, KV und Controlling · Mit Semikolon und CHF · Excel-Drills Schweiz
- Beschreibungen: Excel lernt man durch Tippen, nicht durch Zuschauen. 42 Übungen im Browser, 18 gratis. · Deutsche Funktionsnamen, Semikolon, CHF: üben wie im echten Excel. Sofort-Feedback bei Fehlern. · Lernpfade für Basis, Accounting, Finance und Data. Streak und Level halten dich dran. · 14 Tage Geld-zurück-Garantie. Monatsabo CHF 9, Jahr CHF 49.

Anzeigengruppe «Einstellungstest»
- Titel: Excel-Einstellungstest üben · Die typischen Testaufgaben · SVERWEIS, WENN, SUMMEWENN · 7-Tage-Lernplan gratis · Formel tippen, sofort prüfen · Ohne Anmeldung starten
- Beschreibungen: Was im Excel-Test drankommt und wie du es in 7 Tagen übst. 10 Übungen im Lernpfad Basis gratis. · Übe die Formeln selbst statt Videos zu schauen. Fehler wie SUM statt SUMME werden sofort erklärt.

Anzeigengruppe «KV und Lehre»
- Titel: Excel-Übungen für die KV-Lehre · Rechnung, MwSt, Rappenrundung · Gratis für Berufsschulen · Üben mit CHF und Semikolon · 18 Übungen ohne Anmeldung
- Beschreibungen: Excel-Aufgaben aus dem KV-Alltag: Rechnungen, Umsatzlisten, Offene Posten. Sofort geprüft. · Für Lehrpersonen: Premium für Klassen gratis, Trainer-Handouts inklusive.

Anzeigengruppe «Schweiz-spezifisch»
- Titel: Excel auf 5 Rappen runden · VRUNDEN richtig anwenden · MwSt 8.1 % korrekt rechnen · Schweizer Excel-Übungen
- Beschreibungen: =VRUNDEN(Betrag;0.05) erklärt, mit Beispielen und Gratis-Übung. · Excel-Übungen mit CHF, Hochkomma und Semikolon. 18 gratis.

Sitelinks (Kampagne): Gratis-Übungen (/app/), Lernpfade (/pfad/), Preise (/premium.html), Handouts (/handouts/). Callouts: Ohne Anmeldung · 14 Tage Garantie · Deutsch, Französisch, Italienisch · Läuft im Browser.

### UTM und Conversion-Messung

Alle Final-URLs mit `?utm_source=google&utm_medium=cpc&utm_campaign=excel-ueben-ch&utm_content=<anzeigengruppe>`. Plausible wertet Kampagnen automatisch aus; Conversion = Goal `kauf` gefiltert nach `utm_source=google`. Google-Ads-Conversion-Tag bewusst nicht einbauen (kein Cookie-Banner nötig); Entscheidung nach Plausible-Zahlen, nicht nach Google-Schätzung.

### Landingpage-Regeln

- Jede Anzeigengruppe führt auf die Seite, die das Keyword im H1 trägt (Artikel oder Pfad), nie pauschal auf die Startseite, ausser «Excel üben».
- Über dem Falz: Gratis-CTA sichtbar; Artikel haben die Übungs-Box erst unten. Vor Phase 2 prüfen, ob die Artikel oben einen kurzen CTA brauchen.
- Keine Preise in der Anzeige ausser bei «Excel üben» (Qualifizierung).

## Meta (Phase 1): Boost-Setup

- Beitrag: der organisch beste Post der ersten Woche (Saves und Link-Klicks in Plausible), vermutlich Launch-Reel oder K1 SVERWEIS.
- Ziel: Website-Besuche. Link: `https://excel-drills.ch/?utm_source=instagram&utm_medium=paid&utm_campaign=launch`.
- Zielgruppe: Schweiz, Deutsch, 20–45, Interessen Microsoft Excel, Buchhaltung, Controlling, kaufmännische Ausbildung; Platzierungen nur Instagram Feed und Reels.
- Budget CHF 10/Tag, 7 Tage. Nach 3 Tagen prüfen: CPC, Mini-Übung-Quote der bezahlten Besucher (Plausible, Filter utm_medium=paid) im Vergleich zu organisch.

## Mess-Tabelle (wöchentlich ins TESTPLAN.md übertragen)

| Woche | Kanal | Ausgaben CHF | Klicks | CPC | Besucher Plausible | mini_geloest % | premium_klick | kauf | CPA |
|---|---|---|---|---|---|---|---|---|---|
| 1 | organisch | 0 | | | | | | | |
