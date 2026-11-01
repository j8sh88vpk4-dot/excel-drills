# 4-Wochen-Test: Excel-Drills (Start 30.10.2026, Entscheid 27.11.2026)

## Bereits erledigt (30.10.)
- Google Trends DE, 12 Monate: «SVERWEIS» ≈ «Prompt Engineering» im Schnitt; Prompting fällt von Peak 100 auf ~10,
  SVERWEIS stabil 25–50. «Excel lernen»/«Excel Übungen» als Phrasen klein (1–2) → SEO-Hebel liegt auf
  Funktions-Seiten (SVERWEIS, SUMMEWENN, WENN …), genau wie beim Referenzfall.
- Google Trends CH, 12 Monate: Datenbasis dünn (kleiner Markt), «Prompt Engineering» ≈ 2× «SVERWEIS», beide volatil;
  CH allein ist kein verlässliches Mass, DACH gesamt zählt.
- SERP-Lücke (WebSearch, DE): für «Excel Übungen online interaktiv» rankt Coddy (gratis, 24 Übungen) und
  excelexercises.com (EN). Kein deutschsprachiger Anbieter mit Simulator + Paywall gefunden.
- Domains frei (RDAP nic.ch, 30.10.): excel-drills.ch, excel-drills.ch, exceldrills.ch, excel-training.ch,
  excelueben.ch, excel-uebungen.de. Vergeben: exceldrills.com, excel-drills.com.
- MVP: 15 Übungen (10 gratis, 5 premium), Formelprüfung mit HyperFormula (deDE), Paywall-Seite.

## Offen für Luca
1. Google Keyword Planner (braucht Google-Ads-Konto): Volumen DE/AT/CH für
   «Excel lernen», «Excel üben», «Excel Übungen», «SVERWEIS», «SVERWEIS Übung», «SUMMEWENN», «Pivot Tabelle Übung».
   Go-Schwelle: > 50'000 kombinierte Suchen/Monat.
2. Erledigt 30.10.: GitHub-Repo j8sh88vpk4-dot/excel-drills (public), Render Static Site live unter
   https://excel-drills.onrender.com, Custom Domains excel-drills.ch + www angelegt. OFFEN: DNS beim Registrar:
   A @ → 216.24.57.1, CNAME www → excel-drills.onrender.com; danach in Render «Verify».
3. Stripe erledigt (30.10.): Produkt, drei Payment-Links (in premium.html eingetragen), Branding (Logo, Grün),
   Kundenportal-Link in der FAQ. Weiterleitung /app/?key=…&plan=… gesetzt. Offen: echten Key hashen (keys.js),
   Testkauf im Testmodus. Hinweis: Stripe-Konto heisst noch «Linkedin» (Einstellungen › Unternehmensdaten).
4. Erledigt 30.10.: Impressum/Datenschutz (Luca Moser, Kapfstrasse 27, 6020 Emmenbrücke, luca@familymoser.ch),
   UX-Review umgesetzt (Status in docs/UX-REVIEW.md), Stripe-Belege aktiviert, Zugangslink im Rechnungsvermerk,
   Zugangscode im Profil + Code-Eingabe in der Paywall. Entschieden 30.10.: Garantie 14 Tage, Spickzettel/Formelkarten gratis gegen E-Mail, Trainer-Handouts nur mit
   Premium-Code. 31.10.: Formular speichert in Supabase (Tabelle leads, statt Formspree). OFFEN:
   Mail-Adresse auf hallo@excel-drills.ch umstellen, sobald Weiterleitung bei Hostpoint steht.

## Erledigt 30.10. (Nachmittag)
- Lernpfade: Basis 15, Accounting & Controlling 11, Banking & Finance 11 Übungen (37 total, 16 gratis);
  Consulting und Data als «Bald verfügbar». Landingpages unter /pfad/, App mit Pfad-Auswahl (?pfad=<id>).
  Generator: python3 scripts/pfad/build.py.
- Startseite neu: Hero mit Live-Mini-Übung, Zielgruppen-Karten, 3 Schritte, Pfad-Karten, Themen-Chips,
  Preis-Teaser, FAQ und SEO-Langtext als zugeklappte Blöcke. Screenshots in docs/screenshots/.
- Social-Media-Kit in social-kit/: 12 LinkedIn-Posts, 5 Reddit, 3 X-Threads + 10 Tweets, 6 Video-Skripte,
  6 Karussells, 5 Mails, UTM-Schema, 4-Wochen-Kalender (2.–27.11.), 8 gerenderte Bilder in social-kit/visuals/png/.
- Engine: verschachtelte Funktionen werden erkannt; englische Finanz-/Datumsnamen (PMT, PV, FV, EDATE, EOMONTH,
  MROUND, POWER …) lösen den Deutsch-Hinweis aus.

- Gamification (30.10. Abend): Streak mit Tagesziel (1/2/5), XP und 6 Levels (Level 5–6 nur mit Premium),
  Meisterschaft Bronze/Silber/Gold über Alternativ-Datensätze, 12 Abzeichen mit Teilen-PNG (1080×1080),
  Profil-Panel mit 7-Tage-Leiste und Zurücksetzen. Alles in localStorage; Konten, Liga und Erinnerungs-Mails
  bewusst nach dem Go. Logik in app/gamification.js, 82 Node-Tests via `npm run check`.
- App: Hash-Direktlinks innerhalb der Seite funktionieren jetzt (hashchange).

- Analytics (30.10. Abend): Plausible Analytics eingebunden (assets/analytics.js auf allen Seiten und in den Generatoren),
  Ereignisse uebung_geloest, streak_3, premium_klick, kauf (mit Umsatz). Details in docs/ANALYTICS.md.

- Data & Reporting (30.10. Abend): neuer Übungstyp «Projekt» (xlsx-Download, Schritte, automatisch geprüfte
  Kontrollfragen), 5 Projekte (4 Pivot, 1 Power Query), 2 gratis. Generator: `npm run data:projects`.
  Stand: 42 Übungen, 18 gratis, 4 aktive Pfade. OFFEN: die 5 xlsx-Dateien in echtem Excel 365 öffnen und die
  Schritt-Beschriftungen prüfen (Mrz, Qrtl2, Kürzen, Linker Anti, Rangfolge nach Grösstem).
- Video (social-kit/video): 20 s, 9:16 und 1:1, H.264 ohne Ton, mit excel-drills.ch; Swift-Encoder, weil ffmpeg fehlt.
  Empfehlung: `brew install ffmpeg` für bessere GIF-Qualität. frames/ (349 MB) kann gelöscht werden.
- Handouts: 11 PDFs mit excel-drills.ch neu gerendert; 31.10.: Formular via Supabase, echte QR-Codes (scripts/handouts/qr.py).

- PWA (31.10. Abend): manifest.json, sw.js (Precache ~1.2 MB inkl. HyperFormula, Gratis-Übungen offline),
  Installationskarte nach 2. Übung, Offline-Leiste, Update-Hinweis, Icons in assets/icons/. Bei App-Änderungen
  CACHE_VERSION in sw.js erhöhen. Echtgeräte-Test Android/iPhone offen.
- Live-fertig (31.10.): keine Platzhalter mehr; Handout-Formular speichert in Supabase-Tabelle leads (anon insert only);
  echte QR-Codes auf Formelkarten; OG-Tags überall; Stripe: Zahlungsbeschreibung EXCEL-DRILLS.CH, Produkttext angepasst.

## Technische Restpunkte vor Livegang
- Erledigt 30.10.: Key als SHA-256-Hash in app/keys.js hinterlegt (Klartext nur in den Stripe-Weiterleitungen). Mechanismus ist clientseitig,
  für den Test ausreichend; bei Go später Stripe-Webhook + serverseitige Prüfung.
- ERLEDIGT 30.10.2026: Analytics eingebaut (Plausible, cookielos; assets/analytics.js, Ereignisse in app/app.js und premium.html,
  Datenschutzerklärung angepasst). Offen: Site in Plausible mit echter Domain anlegen und Ziele einrichten, siehe docs/ANALYTICS.md.
- canonical, og:url, og:image nach Domainwahl setzen (Kommentar in index.html).
- Zusätzliche alt-Datensätze für summe-1, mittelwert-1, max-1, summewenn-* (verhindert festgetippte Ergebnisse).
- Texte bestätigen: «100 % Geld zurück» (index.html FAQ, premium.html), «Schulen/Teams»: entschieden 31.10. – Schulen und Berufsschulen gratis,
  Firmen-Teams ab 5 Personen CHF 39/Person/Jahr (eine Rechnung), Trainer-Handouts inklusive.
- Startseite lädt HyperFormula (~1 MB) für die Mini-Übung; falls zu langsam, erst beim Klick ins Formelfeld laden.
- Lokal starten: `npm run preview` → http://127.0.0.1:8787/ ; Prüfskript: `npm run check`.

## Launch (Woche 1–2)
- Launch-Code SVERWEIS20 (20 %, bis 15.11., ab CHF 49) ist in Stripe angelegt und auf premium.html genannt.
- Preis-Entscheid 31.10.: Monatsabo bleibt bei CHF 9 (Luca); nach dem Test anhand Monat-vs-Jahr-Verteilung neu bewerten.
- LinkedIn-Post (eigenes Profil), r/de_EDV, r/Finanzen, r/Schweiz, 2–3 Controlling-Foren/Gruppen.
- Erledigt 30.10.: 5 Funktions-Artikel unter /artikel/ (SVERWEIS 1'623, SUMMEWENN 1'302, WENN 1'366, ZÄHLENWENN 1'225,
  absolute Bezüge 1'547 Wörter), je mit Gratis-Übung verlinkt; sitemap.xml und robots.txt liegen bei.
  Generator: scripts/artikel/build.py (Texte in a_*.py), Prüfung: python3 scripts/artikel/check.py.
- Nächste Artikel-Kandidaten: WENNFEHLER, SUMMENPRODUKT, Pivot-Tabellen, Excel-Einstellungstest, XVERWEIS vs. SVERWEIS.

## Go/No-Go (27.11.2026)
| Signal | Go | No-Go |
|---|---|---|
| Zahlende Kunden | ≥ 20 | < 5 |
| Registrierte/aktive Gratisnutzer | ≥ 500 | < 100 |
| Keyword-Volumen DACH | > 50k/Monat | < 20k/Monat |
| Abschlussquote Gratis-Übung 1 → Übung 10 | > 30 % | < 10 % |
| Wiederkehr: Nutzer mit Streak ≥ 3 Tagen (Analytics-Event) | > 15 % | < 5 % |
| Paywall-Konversion (kauf / paywall_gezeigt) | > 2 % | < 0.5 % → Gratis-Anteil prüfen (Basis 10 → 6–7, Fachpfade stärkste Übungen gratis) |

Grauzone dazwischen: 4 weitere Wochen mit 10 zusätzlichen Übungen und Funktions-Artikeln, dann erneut entscheiden.

## 1.11.2026: Wettbewerb und SEO-Massnahme

- Google-KI-Übersicht zu «excel übungen schweiz» listet LogicExcel (95 Gratis-Übungen im Browser, englisch gebaut, SUM/VLOOKUP), Coddy, Easy4Me, zebis, Wings. Excel-Drills fehlt (neu). Einziger direkter Konkurrent: LogicExcel; Differenzierung bleibt Deutsch/Semikolon/CHF/Berufspfade.
- Massnahme: Vergleichsartikel `artikel/excel-ueben-online-vergleich.html` (Generator `scripts/artikel/a_vergleich.py`), transparent mit eigener Plattform; Ziel ist die Zitierung in der KI-Übersicht. Startseiten-Title/Description auf «Excel üben auf Deutsch … (Schweiz)» geschärft.
- Werbung: Woche 1 keine; ab 9.11. Meta-Boost max. CHF 70 nur bei ≥30 % Mini-Übung-Quote und vorhandenen Premium-Klicks; Google Ads erst nach dem Go am 27.11.

## 1.11.2026: SEO-Ausbau und SEA-Plan

- Drei neue Artikel auf Nischen-Keywords: `excel-einstellungstest-ueben.html`, `excel-uebungen-kv.html`, `vrunden-5-rappen.html` (Generatoren `scripts/artikel/a_*.py`). Alle Artikel haben jetzt BreadcrumbList, Publisher mit Logo, image und mainEntityOfPage.
- Startseite: H1 «Excel üben statt zuschauen: Übungen auf Deutsch, sofort geprüft», Title 62 / Description 157 Zeichen, Footer-Links auf /fr/ und /it/, H2 «Excel-Übungen für die Schweiz: Semikolon, CHF und Rappen», WebSite-JSON-LD mit Organization (Logo, Instagram).
- Search Console: Property https://excel-drills.ch/ verifiziert (Meta-Tag + googlef20840efa829eb89.html, beide behalten), Sitemap eingereicht, Indexierung beantragt.
- SEA: Plan in docs/SEA-PLAN.md (Phasen, Keywords, Anzeigentexte, Abbruchregeln). Keine Werbung vor dem 9.11.
- Offen (Hosting): HSTS, Referrer-Policy, Cache-Control für /assets im Render-Dashboard setzen; render.yaml wird ignoriert.

## 1.11.2026: Differenzierung (Konzept in docs/DIFFERENZIERUNG.md)

- Live: /assessment/ (Rollen-Tests Consulting und Accounting, 5 Aufgaben als Mini-Modell, 15 Minuten, Diagnose, 7-Tage-Plan, Teilen-Bild) und /upload/ (xlsx herunterladen, in Excel lösen, hochladen, Fehlerkarte; SheetJS 0.18.5 nur im Browser). Neue Checks in `npm run check`: check-assessments, test-upload, test-interview.
- Vorbereitet, nicht live: KI-Interviewerin (supabase/functions/interview, app/interview.js, docs/INTERVIEW-SETUP.md). Braucht ANTHROPIC_API_KEY und PREMIUM_KEY_HASH als Supabase-Secrets, Migration 002, Deploy. Ohne Deploy zeigt die Ergebnisseite nur den Hinweis.
- Social-Kit B2B: LI-13 bis LI-16, EM-04/05, IG-K7, b2b-onepager.md, Zielgruppen-Tabelle im README.
- Offen: Plausible-Goals assessment_start/assessment_done/upload_check/upload_download/interview_start/interview_done/share_click; Search Console für /assessment/ und /upload/; echte Excel-Datei (Windows/Mac) gegen /upload/ testen; DE/EN-Schalter im Assessment (Engine-Erweiterung en-CH).

## 1.11.2026 Nachmittag: Ausbau abgeschlossen

- Assessment: 5 Rollen (Consulting, Accounting, IB/Corporate Finance, Versicherung, KV), DE/EN-Schalter (Engine-Locale en-CH), Recruiter-Links (?link=, assessment/ergebnisse.html, Migration 003; Run durch Luca).
- Zellbezüge per Klick/Ziehen/F4 in App, Assessment und Kampagne (app/sheet-pick.js).
- Fehler-DNA und Wiederholung (Spaced Repetition) lokal in der App (Speicherstand v3).
- Kampagne «Dein erster Monat als Controllerin» unter /kampagne/ (3 Tage gratis).
- Cross-Selling: Drills-Familie auf der Startseite, Warteliste SQL/Python/Bundle (leads-Tabelle, source warteliste-*), Footer-Link SQL-Drills Beta (sql-drills.onrender.com, Veröffentlichung durch Luca).
- KI-Interview: Function deployt, Migration 002 ausgeführt; Secrets setzt Luca.
- Instagram: IG-K7 (Mi 25.11. 12:00) und Story Berufsbildner (Mi 18.11. 12:00) terminiert; Business Suite hat damit 9 Feed-Posts und 2 Stories.

## 1.11.2026 Mittag: UX-Review 2 (docs/UX-REVIEW-2026-11-01.md)

30 Befunde mit Screenshots (Desktop 1280, Mobil 390 per DevTools-Emulation, Dark Mode), 25 behoben. Offen: Recruiter-Migration 003 ausführen (Luca), Punktabzug bei Formel ohne «=» im Assessment (Entscheid), Prozentfarbe nach Stufe, Leerraum in der Drills-Familie, rohe Kategorie-Schlüssel bei altem Speicherstand.
