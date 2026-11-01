# Differenzierung und skalierbare Architektur

Stand: 1. November 2026. Ausgangslage: LogicExcel (95 Gratis-Übungen, generischer 12-Aufgaben-Test, Indeed/MO-200-Vorbereitung),
Coddy (24 Aufgaben), Lehrmittel (Wings, Easy4Me, zebis). Alle prüfen Einzelformeln gegen einen Sollwert.
Unsere Lücke bleibt Deutsch/Semikolon/CHF. Das reicht gegen eine Gratis-Plattform nicht auf Dauer.
Ziel: Dinge bauen, die eine Formel-Quiz-Seite strukturell nicht nachbauen kann.

## Die sieben Differenzierer (Reihenfolge = Priorität)

| # | Differenzierer | Was es ist | Warum die Konkurrenz es nicht hat | Aufwand |
|---|---|---|---|---|
| 1 | **Rollen-Assessments** | Zeitgesteuerte Tests pro Rolle (Consulting, IB/Corporate Finance, Accounting/Treuhand, Versicherung, Controlling, KV-Lehrstelle): 4–6 Aufgaben, die aufeinander aufbauen (Mini-Modell), Punkte, Rang, Diagnose nach Fehlerkategorie, 7-Tage-Plan, Teilen-Bild. DE/EN-Schalter pro Test. | Generische Tests prüfen Funktionen, keine Rollen. Branchenwissen (Combined Ratio, Prämienstaffel, OP-Alterung) hat niemand. | 2 Tage MVP, 1 Woche voll |
| 2 | **Echtes Excel: Download, lösen, hochladen** | Aufgabe als xlsx herunterladen, in Excel lösen, hochladen. Wir lesen Formeln UND Werte (SheetJS im Browser, nichts verlässt den Rechner) und zeigen eine Fehlerkarte: welche Zelle, welcher Fehlertyp, was fehlt ($, FALSCH, Rundung, Bezug). Pivot, Formatierung, benannte Bereiche prüfbar. | Alle Online-Simulatoren prüfen im eigenen Raster. Formeln aus echten Dateien prüfen kann keiner. Das ist auch der Weg zu Pivot/Power Query ohne Nachbau in JS. | 2 Tage MVP |
| 3 | **KI-Interviewerin im Case-Modus** | Nach dem Assessment (oder als eigener Modus): eine Interviewer-Figur («Frau Keller, Partnerin») stellt Rückfragen zum Modell: «Warum Break-even bei 1'800? Was passiert bei 10 % tieferem Preis?» Antworten frei formuliert, Bewertung nach Struktur, Zahlenverständnis, Kommunikation. Claude-API über Supabase Edge Function, nur Premium, Kosten pro Gespräch ca. 5 Rappen. | Niemand verbindet Excel-Prüfung mit Interview-Simulation. PrepLounge hat Cases ohne Excel, LogicExcel hat Excel ohne Case. | 1 Tag MVP (Key von Luca nötig) |
| 4 | **Fehler-DNA und Wiederholung** | Jeder Fehler wird kategorisiert (Bezug, Syntax, Logik, Lookup, Rundung, Tempo). Daraus: persönliches Fehlerprofil, Wiederholung nach Spaced Repetition («heute fällig: 3 Übungen»), Benachrichtigung per Mail (Login nötig). | Gamification haben andere; ein lernwissenschaftliches Profil, das die nächste Übung wählt, hat keiner. | 2 Tage, braucht Login (Branch `login`) |
| 5 | **Kampagnen: «Dein erster Monat als …»** | Story-basierte Serien mit einem durchgehenden Datensatz: «Erster Monat als Controllerin bei der Helvetia-ähnlichen AG»: Tag 1 OP-Liste, Tag 5 Monatsabschluss, Tag 20 Forecast. Jede Übung baut auf der vorherigen auf. | Macht aus Einzelübungen ein Erlebnis mit Fortschritt und Identifikation. Content-Hebel, kein Technik-Hebel. | 1 Tag pro Kampagne |
| 6 | **B2B: Recruiter- und Klassen-Links** | Firma oder Berufsschule erstellt einen Test-Link (Rolle, Zeitlimit, Sprache), Kandidaten lösen ohne Konto, Ergebnisse als Tabelle und PDF, Vergleich gegen Benchmark. Preis pro Test-Platz oder Teamlizenz. | Gratis-Plattformen haben keinen Grund, Recruiter zu bedienen. Lucas Netzwerk bei Versicherern ist der erste Kanal. | 2 Tage, braucht Supabase-Tabellen |
| 7 | **Zertifikats-Vorbereitung** | Seite `zertifikate/` mit den vier in der Schweiz relevanten Excel-Zertifikaten (SIZ AU4 Tabellen, SIZ PU41 Tabellen & Daten, MOS MO-210, MOS MO-211) und Hinweis zum ICDL-Unterbruch: Fakten mit Quelle (Stand 1.11.2026), pro Zertifikat eine Kampagne für den Funktionsteil (Tag 1 bis 3 gratis, DE/EN umschaltbar) und eine Checkliste für das, was nur in Excel selbst geübt werden kann. Dazu SEO-Artikel `artikel/excel-zertifikat-schweiz.html`. | Plattformen wie LogicExcel bereiten generisch auf MO-200/MO-210 vor, aber nicht auf die Schweizer SIZ-Module, nicht mit deutschen Funktionsnamen und Semikolon und ohne ehrliche Abgrenzung, was online nicht prüfbar ist. Suchanfragen «Excel Zertifikat Schweiz», «SIZ AU4», «PU41» haben klare Kaufabsicht. | 1 Tag Seite und Artikel, Kampagnen-Inhalte separat |

Bewusst nicht: Video-Kurse, eigene Zertifikate à la MO-200 (wir bereiten auf bestehende Zertifikate vor, siehe 7, stellen aber keine aus), Office-Add-in (erst wenn 2 Umsatz trägt), englische Zielgruppe.

## Reihenfolge

1. Jetzt bis 8.11.: 1 (MVP mit 2 Rollen: Consulting, Accounting) und 2 (MVP mit 3 Übungen) bauen, als Gratis-Köder vor der Paywall. 3 vorbereiten, Key von Luca.
2. 9.–20.11.: Weitere Rollen (IB, Versicherung, KV), KI-Interviewerin live für Premium, Social-Posts dazu.
3. Nach dem Go am 27.11.: 6 (B2B), 4 (Login), 5 (Kampagnen).

## Architektur: ein Kern, viele Inhalte

Grundsatz: Inhalte sind Daten (JSON), nie Code. Jeder neue Test, jede Kampagne, jede Rolle ist eine Datei.

```
app/
  engine.js            Formel-Prüfung (unverändert, pur, läuft in Node und Browser)
  exercises.json       Einzelübungen (bestehend)
  assessments.json     Rollen-Tests: { id, role, title, lang: ["de","en"], minutes, tasks: [exerciseRef | inline], scoring, report }
  assessment.js        Test-Ablauf: Timer, Reihenfolge, Scoring, Diagnose, Share-Bild (Canvas), DE/EN
  upload.js            xlsx-Prüfung: SheetJS laden (CDN, SRI), Zellen/Formeln lesen, gegen Soll vergleichen, Fehlerkarte
  campaigns.json       Story-Serien (später)
  errors.js            Fehlerkategorisierung (pur): formel → { category, hint } (von engine-Feedback abgeleitet)
assessment/index.html  Landingpage + Test-Oberfläche (eigene Seite, indexierbar, pro Rolle ?rolle=consulting)
upload/index.html      Download-lösen-hochladen (eigene Seite)
supabase/functions/
  interview/           KI-Interviewerin (Claude API), nur mit Premium-Code; Prompt-Vorlagen pro Rolle als JSON
  stripe-webhook/      bestehend
scripts/
  check-assessments.mjs  prüft alle Tests mit der Engine (wie check-exercises)
  build-share-cards.mjs  optional: statische Share-Bilder
```

Regeln:
- Jede Aufgabe in einem Assessment ist entweder eine Referenz auf eine bestehende Übung (`"ref": "sverweis-1"`) oder inline im selben Format wie exercises.json. So wächst der Übungspool mit, und die Engine bleibt die einzige Prüflogik.
- Fehlerkategorien sind eine zentrale Tabelle (errors.js), die Assessments, Upload-Prüfung und später Fehler-DNA gemeinsam nutzen.
- Sprache und Land laufen über die bestehende Locale-Schicht; EN kommt als fünfte Locale `en-CH` (HyperFormula-Standardsprache, Komma als Trenner, Punkt dezimal, CHF).
- Alles Gratis läuft ohne Server. Alles Personalisierte (Interview, B2B, Fehler-DNA) läuft über Supabase, damit die statische Site statisch bleibt.
- Jede neue Seite bekommt Title, Description, JSON-LD und einen Eintrag in sitemap.xml über den jeweiligen Generator.

## Messung

Neue Plausible-Events: `assessment_start` (rolle), `assessment_done` (rolle, punkte), `upload_check` (uebung, fehler), `interview_start`, `share_click`.
Go/No-Go-Kriterien bleiben; zusätzlich: Anteil der Assessment-Starter, die danach eine Übung lösen.

## Hebel 7: Zertifikats-Vorbereitung (Stand 1.11.2026)

- Seite `zertifikate/index.html` (+ `assets/zertifikate.css`, `assets/zertifikate.js`), verlinkt in Navigation, Footer, Startseite (Bereich «Neu»), sitemap.xml. Liest `app/campaigns.json` nicht, Kampagnen-Links sind statisch.
- Kampagnen-IDs: `siz-au4` (10 Tage), `siz-pu41` (12 Tage), `mos-excel-associate` (8 Tage), `mos-excel-expert` (10 Tage), jeweils Tag 1 bis 3 gratis; Aufruf `kampagne/?kampagne=<id>`. Die Inhalte kommen separat in `app/campaigns.json`; bis dahin zeigt `kampagne/` für diese IDs einen Hinweis und die Übersicht.
- `kampagne/` übernimmt Titel, H1, Einleitung, Firma und Meta-Description aus der Kampagne (optional `summary`, `description`, `seoTitle`, `daysTitle`, `teaser`, `finish`), zeigt ohne Parameter alle Kampagnen als Karten und mit Parameter «Andere Kampagnen». Excel-Sprache DE/EN pro Kampagne umschaltbar (`?lang=en`).
- Checklisten «Was du zusätzlich in Excel selbst üben musst» mit Häkchen im localStorage `excelDrillsCertChecklist`.
- Messung: `cert_open` (Property `zertifikat`) beim Klick auf einen Kampagnen-Link der Zertifikatsseite, `campaign_open` (`kampagne`, `ort`) beim Wechsel zwischen Kampagnen.
- Pflege: Fakten (Preise, Versionen der Modulidentifikationen, ICDL-Status) stehen in `zertifikate/index.html` und `scripts/artikel/a_zertifikate.py`; bei Änderungen beide nachführen.
