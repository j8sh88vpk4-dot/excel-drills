# Recruiter-Links: Einrichtung und Betrieb (MVP)

Stand: 1. November 2026. Differenzierer 6 aus `docs/DIFFERENZIERUNG.md`, erste Ausbaustufe ohne Login.

Eine Firma bekommt zwei Links:

- **Kandidaten-Link** `https://excel-drills.ch/assessment/?link=<token>`: Kandidatinnen und Kandidaten geben Name und E-Mail ein, lösen das Rollen-Assessment ohne Konto, das Ergebnis geht an die Firma.
- **Recruiter-Link** `https://excel-drills.ch/assessment/ergebnisse.html?admin=<admin_token>`: Tabelle aller Ergebnisse dieses Links mit CSV-Export.

Rolle, Excel-Sprache (de/en) und optional die Minuten sind im Link festgelegt. Der Kandidat kann sie nicht ändern.

## Dateien

| Datei | Zweck |
|---|---|
| `supabase/migrations/003_recruiter.sql` | Tabellen `assessment_links`, `assessment_results`, RLS, drei RPC-Funktionen |
| `app/recruiter.js` | Link-Modus auf `assessment/index.html` (Banner, Formular, Übermittlung) |
| `app/assessment.js` | Hook `window.ExcelDrillsAssessment.configure(...)` und Aufruf `notifyFinish()` am Ende von `finish()` |
| `assessment/ergebnisse.html`, `app/recruiter-results.js` | Recruiter-Seite (noindex, ohne Navigation, ohne Plausible) |
| `scripts/test-recruiter.mjs` | Tests der Hilfsfunktionen und Syntax-Check der Migration |

URL und Publishable Key kommen aus `assets/leads-config.js` (derselbe öffentliche Key wie beim Handout-Formular). Es braucht keinen zusätzlichen Key und kein Secret.

## 1. Migration ausführen

1. Supabase Dashboard öffnen, Projekt `uijlrixalisqbcgivccn`.
2. **SQL Editor** › New query › Inhalt von `supabase/migrations/003_recruiter.sql` einfügen › **Run**.
3. Prüfen: Unter **Table Editor** erscheinen `assessment_links` und `assessment_results`, beide mit «RLS enabled» und ohne Policies. Unter **Database › Functions** stehen `link_info`, `submit_assessment_result`, `results_for_link`.

Die Datei ist idempotent (zweiter Lauf schadet nicht). Sie ist unabhängig von `002_interview.sql`.

Schnelltest im SQL Editor (danach wieder löschen):

```sql
insert into public.assessment_links (firma, rolle) values ('Test AG', 'accounting') returning token, admin_token;
select public.link_info('<token>');
select public.results_for_link('<admin_token>');
```

## 2. Link anlegen

Vorerst von Hand im SQL Editor. Token und Admin-Token erzeugt die Datenbank selbst (24 bzw. 36 Hex-Zeichen, Zufall aus `gen_random_bytes`).

```sql
insert into public.assessment_links (firma, kontakt_email, rolle, sprache, minuten, max_teilnahmen)
values ('Muster Versicherung AG', 'hr@muster.ch', 'accounting', 'de', null, 50)
returning token, admin_token;
```

- `rolle`: ID aus `app/assessments.json` (heute `consulting` oder `accounting`). Eine unbekannte Rolle zeigt dem Kandidaten einen Hinweis statt des Tests.
- `sprache`: `de` (Excel Schweiz, Semikolon) oder `en` (englisches Excel, Komma). Steuert auch die Texte im Link-Banner.
- `minuten`: `null` = Standardzeit der Rolle (15 Minuten), sonst 1 bis 180.
- `max_teilnahmen`: Standard 50. Danach lehnt die Datenbank weitere Ergebnisse ab.

Dann die beiden URLs zusammensetzen und der Firma schicken:

```
Kandidaten:  https://excel-drills.ch/assessment/?link=<token>
Recruiter:   https://excel-drills.ch/assessment/ergebnisse.html?admin=<admin_token>
```

Den Recruiter-Link nur an die Kontaktperson schicken. Wer ihn hat, sieht alle Namen, E-Mails und Ergebnisse.

Weitere Befehle:

```sql
-- Link schliessen (Kandidaten sehen «nicht mehr aktiv», Ergebnisse bleiben lesbar)
update public.assessment_links set aktiv = false where token = '<token>';
-- Mehr Plätze
update public.assessment_links set max_teilnahmen = 100 where token = '<token>';
-- Ein Ergebnis löschen (Auskunfts- oder Löschbegehren)
delete from public.assessment_results where kandidat_email = 'name@beispiel.ch'
  and link_id = (select id from public.assessment_links where token = '<token>');
-- Link samt allen Ergebnissen löschen
delete from public.assessment_links where token = '<token>';
```

## 3. Ablauf für Kandidaten

1. Link öffnen: Banner «Test für <Firma>», Rolle und Minuten, Formular Name + E-Mail (Pflicht) mit Datenschutz-Hinweis. Die Rollen-Karten sind ausgeblendet, die Rolle ist fest.
2. «Test starten» geht erst mit gültigem Namen und gültiger E-Mail.
3. Nach der Auswertung: Ergebnis wird übermittelt, Hinweis «Ergebnis an <Firma> übermittelt». Bei einem Fehler erscheint ein Hinweis mit «Nochmals senden», das Ergebnis bleibt lokal sichtbar.
4. Im Link-Modus gibt es kein Teilen-Bild und keinen Knopf «Test wiederholen». Pro Seitenaufruf wird nur der erste Durchgang übermittelt. Diagnose und 7-Tage-Plan bleiben.

Plausible: Ereignis `recruiter_submit` mit `{ rolle }` bei erfolgreicher Übermittlung.

## 4. Recruiter-Seite

- Tabelle: Name, E-Mail, Prozent, Punkte, Stufe, Dauer, Datum (Zürcher Zeit), pro Kategorie «richtig/Anzahl» (z. B. 1/2).
- Sortierung nach Prozent (Klick auf die Spaltenüberschrift wechselt ab- und aufsteigend).
- «Als CSV exportieren»: Semikolon-getrennt, UTF-8 mit BOM, öffnet direkt in Excel Schweiz. Werte, die mit `=`, `+`, `-` oder `@` beginnen, bekommen ein `'` vorangestellt (Schutz vor CSV-Injection durch Kandidaten-Eingaben).
- `noindex, nofollow`, `referrer: no-referrer`, kein Link im Seitenkopf, kein Plausible (die URL enthält den Admin-Token).

## 5. Datenschutz

- **Was gespeichert wird:** Name, E-Mail, Punkte, Prozent, Stufe, Dauer, pro Aufgabe ID, Kategorie, richtig/falsch, Punkte, Versuche und erkannte Fehlerart, Sprache, Zeitpunkt. **Keine Formeln**, keine IP-Adresse, kein Browser-Fingerprint.
- **Wo:** Supabase, Region Zürich (Schweiz), dieselbe Datenbank wie die Handout-Leads.
- **Wer sieht es:** Nur wer den Recruiter-Link hat (die Firma) und wir als Betreiber über das Dashboard. Die Rolle `anon` kann die Tabellen weder lesen noch direkt beschreiben; alles läuft über die drei Funktionen, `link_info` gibt keine Tokens heraus.
- **Rollen:** Die Firma ist Verantwortliche für die Bewerberdaten, Excel-Drills bearbeitet sie in ihrem Auftrag. Vor dem ersten zahlenden Kunden einen kurzen Auftragsbearbeitungsvertrag (AVV nach revDSG) vorbereiten.
- **Information:** Der Hinweis im Formular nennt Empfänger (Firma), Datenarten und Speicherort. `datenschutz.html` braucht noch einen Abschnitt «Test-Links von Firmen» (offen).
- **Aufbewahrung:** Vorschlag 6 Monate nach Schliessen des Links, dann löschen (heute von Hand, siehe SQL oben).
- **Auskunft und Löschung:** Anfragen an hallo@excel-drills.ch, Löschung per SQL oben.

## 6. Grenzen des MVP

- **Links nur per SQL.** Kein Formular, keine Bezahlung, keine Rechnung. Das kommt mit dem Login (Differenzierer 4).
- **Token = Zugang.** Wer den Kandidaten-Link kennt, kann Ergebnisse einreichen (bis `max_teilnahmen`). Wer den Recruiter-Link kennt, sieht alles. Kein Ablaufdatum, kein Passwort. Die Tokens sind lang genug gegen Raten (96 bzw. 144 Bit), aber Links können weitergeleitet werden.
- **Ergebnis kommt aus dem Browser.** Die Punkte rechnet der Browser, die Datenbank prüft nur Bereiche. Ein technisch versierter Kandidat könnte ein geschöntes Ergebnis per Hand an die RPC schicken. Für ein Vorab-Screening vertretbar, für Entscheide nicht. Ausbau: Formeln mitsenden und serverseitig nachprüfen.
- **Mehrfach-Teilnahme:** Die Datenbank verhindert nicht, dass dieselbe E-Mail mehrmals einreicht (z. B. nach Neuladen). Die Recruiter-Tabelle zeigt dann mehrere Zeilen. Ausbau: eindeutig pro Link und E-Mail oder «erster Versuch zählt».
- **Kein Rate-Limit** auf den RPC-Funktionen ausser `max_teilnahmen`.
- **Kein PDF-Export** und kein Benchmark-Vergleich (Teil von Differenzierer 6, später).
- **Kategorien** auf der Recruiter-Seite stammen aus `app/errors.js` (deutsche Namen), auch wenn der Test auf Englisch lief.
- **Plausible** sieht auf der Kandidaten-Seite die URL mit `?link=<token>` (Plausible speichert nur den Pfad, der Token wird aber übertragen).


## Stand 1.11.2026

- Migration 003 liegt im SQL-Editor (Untitled query) bereit; Run muss Luca klicken (Classifier hat den Lauf blockiert). Links werden danach per SQL-INSERT angelegt (Beispiel in der Migration).
