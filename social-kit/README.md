# Social-Media-Kit Excel-Drills: 4-Wochen-Launch

Stand: 1.11.2026 (B2B-Erweiterung, Differenzierer und Instagram-Tagesplan ergänzt) · Launch-Zeitraum: Mo 2.11. bis Fr 27.11.2026 (Go/No-Go-Entscheid gemäss `docs/TESTPLAN.md`)

**Ziel des Tests:** 500 Gratisnutzer **oder** 20 zahlende Kunden bis 27.11.2026.
Social Media ist dabei der Startmotor, bis die Funktions-Artikel (SEO) Traffic bringen. Jeder Post hat deshalb genau ein Ziel: Klick auf eine Gratis-Übung, Kommentar (Reichweite) oder Kauf/Teamanfrage.

## Launch-Code

**SVERWEIS20**: 20 % auf Jahresabo und Lifetime, gültig bis 15.11.2026 (Stripe-Promo-Code, Mindestbetrag CHF 49, einmalig). Eingebaut in LI-01 (letzte Zeile vor den Hashtags), die Launch-Story vom 3.11. (Story-Plan in `instagram.md`) und EM-01; nirgends sonst, danach nicht mehr erwähnen.

## Inhalt

| Datei | Inhalt | Anzahl |
|---|---|---|
| `linkedin.md` | Posts für Lucas Profil, fertig zum Kopieren (LI-13 bis LI-16 B2B, LI-17 bis LI-19 Differenzierer) | 19 Posts |
| `reddit.md` | Subreddit-Posts mit Regel-Hinweis und Antwortvorlagen | 5 Posts, 10 Antwortvorlagen |
| `x-threads.md` | Threads und Einzel-Tweets (DE) | 3 Threads, 11 Tweets |
| `instagram-tiktok.md` | Kurzvideo-Skripte und Karussell-Konzepte | 6 Skripte, 6 Karussells |
| `instagram.md` | Fertige Instagram-Karussells (Captions, Hashtags klein/mittel/gross), Bio, Story-Plan | 14 Captions (IG-K1 bis IG-K14), 8 Bild-Stories + Text-Stories |
| `instagram-termine.md` | **Tagesplan Instagram Mo 2.11. bis Fr 27.11.**: 1 Reel pro Tag, Karussells, 3 Stories pro Tag, Threads, Kommentar-Routine, Collab; markiert, was in der Business Suite terminierbar ist und was Luca in der App macht | 26 Tage |
| `video/formel-des-tages.md`, `video/formel-data.js`, `video/formel.html`, `video/formel-render.sh` | Reel-Serie «Formel des Tages»: 26 Skripte (Hook, 3 Zeilen, Formel, Auflösung, Caption, Threads), Animation und Render-Pipeline | 26 Skripte, 5 gerenderte MP4 (`video/reels/`) |
| `b2b-onepager.md` | Inhalt für den B2B-Einseiter (A4), zum Rendern mit dem Handout-Generator | 1 Seite |
| `email.md` | Netzwerk, HR/Teamleiter, Hochschulen/Berufsschulen, Recruiting-Pilot (EM-04, EM-05) | 5 Mails (+ Nachfass-Varianten) |
| `utm.md` | UTM-Schema pro Kanal und fertige Links | – |
| `visuals/*.html` | Bildvorlagen (OG, LinkedIn, Quadrat, Story), ohne externe Abhängigkeiten | 4 Vorlagen, 5 LinkedIn-Varianten |
| `visuals/render.sh` | Rendert alle Vorlagen nach `visuals/png/` | – |
| `visuals/carousel.html`, `visuals/render-instagram.sh` | Instagram-Karussells 1080×1350 (`?c=1..14&s=1..n`), Story-Varianten `story.html?v=1..8`; Rendern nach `visuals/png/instagram/` | 99 Slides + 8 Stories |
| `visuals/png/` | Gerenderte PNGs: og-image, linkedin-1…5, square-quiz, story | 8 PNGs |

## Nutzung

1. **Links sind eingesetzt.** Alle `{URL}`-Platzhalter sind durch den fertigen UTM-Link pro Post ersetzt (Referenz: `utm.md`, Domain `https://excel-drills.ch`). Neue Posts: Zeile in `utm.md` ergänzen.

   **Beim Posten noch füllen:** `{Nutzer}`, `{Zahlende}`, `{Vorname}`, `{Nachname}`, `{Telefon}`, `{Modulname}`, `{Kanal}` sind gewollt offen und werden erst beim Posten bzw. Versand gefüllt (Zahlen nur aus der Analytics, `{Vorname}` bis `{Modulname}` pro Empfänger). Gleiches gilt für die übrigen `{…}` in LI-08, LI-12 und X-08/X-10 (Messwerte, Datum, Learnings). Gibt es keine Messung, wird der Satz gestrichen, nicht geschätzt.
2. **Zahlen nur echt einsetzen.** Platzhalter wie `{Nutzer}`, `{Übungen gelöst}`, `{Zahlende}` werden mit den Werten aus der Analytics (Plausible, siehe `docs/ANALYTICS.md`) gefüllt.
3. **Bilder.** PNGs liegen in `visuals/png/`. Alle neu rendern: `bash social-kit/visuals/render.sh` (headless Chrome; in einer Sandbox ggf. ausserhalb ausführen). Einzelnes Bild:
   ```bash
   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
     --window-size=1200,627 --screenshot=visuals/png/linkedin-1-launch.png \
     "file://$PWD/visuals/linkedin-card.html?v=1"
   ```
   Grössen: og-image 1200×630, linkedin-card 1200×627, square 1080×1080, story 1080×1920.
4. **Posten, dann 60 Minuten bleiben.** Auf LinkedIn entscheidet die erste Stunde. Jeden Kommentar beantworten, mit einer Frage zurück.
5. **Tracking.** Nach jedem Post Zeile im Kalender unten ergänzen: Impressionen, Klicks (UTM), Kommentare. Am Freitag jeder Woche 15 Minuten Auswertung: Was hat Klicks gebracht, nicht nur Likes?

## Tonalität

- **Sachlich und konkret.** Kein «revolutionär», «game changer», «das Excel-Tool, auf das alle gewartet haben».
- **Zahlen statt Adjektive.** «42 Übungen, 18 gratis, CHF 9 pro Monat» statt «viele Übungen zum fairen Preis».
- **Gründerperspektive.** «Ich habe gebaut», «ich habe gemerkt», «ich teste vier Wochen». Luca spricht als Strategie-Mensch aus der Versicherung, der ein Problem aus dem eigenen Alltag kennt, nicht als Marketing-Abteilung.
- **Ehrlich über den Stand.** Die Site ist neu. Lücken offen benennen («Consulting-Pfad ist noch in Arbeit»). Das schafft mehr Vertrauen als Glanz.
- **Du-Form**, Schweizer Rechtschreibung (ss statt ß), Schweizer Zahlenformat (1'250.50, CHF).
- **Mehrwert zuerst.** Mindestens zwei Drittel der Posts sind auch ohne Klick nützlich (Tipp, Fehler, Formel). Der Link ist das Angebot, nicht der Inhalt.
- **Ein CTA pro Post.** Entweder «Übung lösen» oder «Kommentiere» oder «Schreib mir», nie alles zugleich.

## Was NICHT behauptet werden darf

- **Keine erfundenen Nutzerzahlen.** Nicht «Hunderte nutzen schon …», nicht «beliebt bei …». Zahlen nur aus der eigenen Messung, mit Datum.
- **Keine Testimonials, die es nicht gibt.** Keine erfundenen Zitate, keine «Feedback von Nutzern» ohne echte Quelle. Echte Rückmeldungen nur mit Einverständnis der Person zitieren.
- **Keine Arbeitgeber-Bezüge.** Lucas Arbeitgeber nicht nennen und nicht andeuten, dass das Produkt dort eingesetzt wird. Formulierung: «bei einem Schweizer Versicherer», nur wo nötig.
- **Keine Lernerfolgs-Versprechen.** Nicht «Test garantiert bestanden», nicht «in 7 Tagen Excel-Profi». Erlaubt: «Du übst genau die Funktionen, die typische Einstellungstests abfragen.»
- **Keine Wissenschafts-Übertreibung.** Retrieval Practice/Testeffekt darf erwähnt werden, aber nicht mit erfundenen Prozentzahlen («90 % mehr behalten»).
- **Keine Konkurrenz-Abwertung.** YouTube, Coddy, Kurse nicht schlechtreden; Unterschied sachlich beschreiben (selbst tippen, Sofort-Prüfung, Deutsch/CH).
- **Garantie entschieden, Schulen/Teams noch offen.** Die 14-Tage-Geld-zurück-Garantie gilt und darf als Nebensatz im Launch-Post (LI-01) und in der Netzwerk-Mail (EM-01) stehen; sonst nicht prominent bewerben. «Schulen/Teams gratis» ist laut TESTPLAN noch zu bestätigen; in `email.md` ist es als Angebot formuliert, das Luca bewusst macht.
- **Spickzettel und Formelkarten** sind gratis gegen E-Mail, **Trainer-Handouts** gibt es nur mit Premium. Nie umgekehrt formulieren.
- **Keine Microsoft-Nähe.** Nicht «offiziell», kein Microsoft-/Excel-Logo. «Excel» nur beschreibend verwenden; Hinweis «unabhängig, nicht mit Microsoft verbunden» im Profil/Footer.
- **Keine Aussagen über die Vorhersagekraft des Assessments.** Nicht «sagt Berufserfolg voraus», nicht «findet die besten Kandidaten», nicht «verlässlicher als das Gespräch». Erlaubt: «zeigt, was jemand an diesem Tag in diesen Aufgaben kann» und «zusätzliche Information neben dem Gespräch».
- **Kein «wissenschaftlich validiert».** Auch nicht «bewährt», «normiert» oder «geprüfte Methode». Das Assessment ist ein praktischer Test, keine validierte Eignungsdiagnostik. Keine Benchmark-Vergleiche behaupten, solange keine echten Daten vorliegen.
- **B2B-Zahlen und Referenzen:** Keine Pilotfirmen, Kundennamen oder Ergebnisse nennen, die es nicht gibt; keine Nutzerzahlen aus Schulen oder Teams ohne Messung.
- **Datenschutz nur so formulieren, wie es umgesetzt ist.** «Die Datei verlässt den Browser nicht» gilt für das Hochladen und Prüfen. Für Test-Links mit Ergebnistabelle gilt: nur Resultate werden gespeichert; vor Versand mit dem tatsächlichen Stand abgleichen.
- **«Duolingo für Excel»** nur als Vergleich für die Idee («so wie bei Duolingo»), nie als Markenbezug oder Partnerschaft.

## B2B-Zielgruppen und Botschaften

Grundsatz: Gleiche Tonalität wie beim Rest (sachlich, ehrlich über den Stand: Produkt neu, Pilot). Social Posts in Du-Form, Mails an Firmen und Schulen in Sie-Form. Ein CTA pro Post, keine Erfolgsversprechen, keine erfundenen Zahlen. Schulen und Berufsschulen gratis, Firmen-Teams ab 5 Personen CHF 39 pro Person und Jahr (Quelle `premium.html`).

| Zielgruppe | Schmerzpunkt | Botschaft | Angebot | CTA | Posts |
|---|---|---|---|---|---|
| **HR / Recruiting** | «Gute Excel-Kenntnisse» im Lebenslauf wird nicht geprüft. Generische Tests prüfen Funktionen, nicht die Rolle. | Ein 15-Minuten-Rollen-Assessment (Consulting, Accounting) zeigt, was jemand an diesem Tag in dieser Aufgabe kann. Zusätzliche Information, kein Ersatz fürs Gespräch. | Pilot mit 3 Firmen, gratis bis Ende November; Ergebnisse als Tabelle; Kandidaten ohne Konto | Mail an hallo@excel-drills.ch | LI-13, EM-04, EM-05 |
| **Berufsbildner / Berufsschulen** | Lernende sehen Formeln im Unterricht, tippen sie aber selten selbst. Rechnung, MwSt, Rappenrundung bleiben unsicher. | Lernende üben selbst und bekommen sofort Rückmeldung, auf Deutsch mit CHF und Semikolon. | Klassen gratis (Premium), Trainer-Handouts inklusive; Bitte (keine Bedingung) um Verlinkung | Mail mit Schule und Anzahl Lernende an hallo@excel-drills.ch | LI-14, IG-Story «Klassen gratis», EM-03 |
| **Teamleiter Controlling / Finance** | Stille Formelfehler (z. B. SVERWEIS ohne FALSCH) im Monatsabschluss; Videokurse und Workshops lassen keine Übung zurück. | Fehler-Feedback statt Video: selbst tippen, sofort prüfen, auch mit anderen Zahlen. Ehrlich: Produkt ist neu, Feedback erwünscht. | Teampreis ab 5 Personen CHF 39 pro Person und Jahr, eine Rechnung, Trainer-Handouts, 14 Tage Geld-zurück | `premium.html` oder Mail an hallo@excel-drills.ch | LI-15, EM-02 |

Zusatz: LI-16 und IG-K7 sprechen Einzelpersonen an (Datei hochladen und prüfen lassen; Selbsttest vor dem Bewerbungstest) und führen indirekt zu den B2B-Angeboten. Der Einseiter `b2b-onepager.md` dient als Anhang für alle drei Zielgruppen.

## Faktenbasis (darf verwendet werden)

| Fakt | Wert |
|---|---|
| Übungen total | 42 in 4 Pfaden (Basis, Accounting & Controlling, Banking & Finance, Data & Reporting); Pfadgrössen: Basis 15, Accounting & Controlling 11, Banking & Finance 11, Data & Reporting 5 (Projekte) |
| Gratis | 18 Übungen, ohne Anmeldung, im Browser |
| Premium | CHF 9/Monat, CHF 49/Jahr, CHF 149 einmalig |
| Prüfung | Formel-Engine rechnet die Formel, prüft das Ergebnis (nicht den Text); bei vielen Übungen zusätzlich mit anderen Zahlen |
| Konventionen | Deutsche Funktionsnamen, Semikolon, CHF, Rappen-Rundung |
| Hinweise | Englische Namen (SUM, VLOOKUP) werden erkannt und übersetzt |
| App | Als PWA auf dem Handy installierbar; die Gratis-Übungen laufen offline |
| Sprachen | DE, FR, IT und DE-DE (Deutsch für Deutschland) |
| Garantie | 14 Tage Geld-zurück |
| Material | Spickzettel und Formelkarten gratis gegen E-Mail; Trainer-Handouts nur mit Premium |
| Launch-Code | SVERWEIS20, 20 % auf Jahresabo und Lifetime, ab CHF 49, bis 15.11.2026 |
| In Arbeit | Lernpfad Consulting |
| Artikel | SVERWEIS, SUMMEWENN, WENN, ZÄHLENWENN, absolute Bezüge |
| Rollen-Assessments | 5 Rollen: Consulting, Accounting, Investment Banking & Corporate Finance, Versicherung, KV-Lehrstelle; je 5 Aufgaben, 12 bis 15 Minuten, gratis; Diagnose und 7-Tage-Plan; Recruiter-Links für Firmen (`/assessment/`) |
| Datei prüfen | xlsx herunterladen, in Excel lösen, hochladen, Fehlerkarte; 5 Aufgaben (SVERWEIS, SUMMEWENN, $-Bezug, WENN, ZÄHLENWENN); Datei verlässt den Browser nicht; nur .xlsx bis 5 MB (`/upload/`) |
| KI-Interview | Frau Keller (Partnerin, Consulting) bzw. Herr Bianchi (Leiter Rechnungswesen, Accounting) stellen nach dem Assessment Rückfragen zum Modell; max. 6 Runden; Fazit zu Struktur, Zahlenverständnis, Annahmen, Kommunikation; nur Premium; Figuren fiktiv |
| Kampagne | «Dein erster Monat als Controllerin» bei der fiktiven Alpina Logistik AG: 8 Aufgaben (Tag 1, 2, 3, 5, 8, 12, 16, 20), Tag 1 bis 3 gratis (`/kampagne/`) |
| Fehler-DNA | Fehlversuche in 6 Kategorien (Bezüge und $, Syntax, Logik, Nachschlagen, Runden, Modell), Fehlerquote pro Kategorie, «Heute fällig» (Wiederholung); im Profil der App, gespeichert im Browser |
| Zellbezüge | In jeder Übung: Zelle anklicken fügt Bezug ein, Ziehen/Shift-Klick für Bereiche, Spalten-/Zeilenkopf, F4 für $ |
| Zertifikate | `/zertifikate/`: SIZ AU4 Tabellen (CHF 110/132, 28 Lektionen), SIZ PU41 (CHF 260/312, 40 Lektionen), MOS MO-210, MOS MO-211; je eine Kampagne, Tag 1 bis 3 gratis (`siz-au4` 10 Tage, `siz-pu41` 12, `mos-excel-associate` 8, `mos-excel-expert` 10); ICDL in der Schweiz zurzeit ausgesetzt (Stand 1.11.2026, Quelle xcdl.ch) |
| DE/EN | Funktionsnamen Deutsch/Englisch umschaltbar (Assessment, Kampagnen, `?lang=en`) |
| SQL-Drills | Schwesterprojekt, Beta: 41 Übungen zu SELECT, JOIN, GROUP BY im Browser, https://sql-drills.onrender.com |

Beispiel-Übungen, die sich für Posts eignen: `sverweis-1` (Preis nachschlagen, gratis), `runden-1` (auf Rappen runden, gratis), `acc-abweichung-2` (Abweichung in %, gratis), `fin-zinseszins-1` (gratis), `acc-rundung-1` (5 Rappen, premium), `fin-rmz-1` (Leasingrate, premium), `fin-bw-1` (Barwert einer Rente, premium), `fin-zw-1` (Endwert Säule 3a, premium).

## Hashtag-Sets

Pro Post 3–5 Hashtags, nie mehr. Ein Set wählen, nicht mischen.

| Set | Hashtags | Wofür |
|---|---|---|
| **A Allgemein DE** | #Excel #ExcelTipps #Weiterbildung #Lernen | Tipps, Fehler-Posts |
| **B Schweiz** | #Excel #Schweiz #Weiterbildung #KarriereSchweiz | Launch, CH-Eigenheiten |
| **C Accounting** | #Excel #Controlling #Buchhaltung #Rechnungswesen #Accounting | Accounting-Pfad |
| **D Finance** | #Excel #Finance #Banking #Versicherung #Finanzen | Finance-Pfad |
| **E Karriere** | #Excel #Bewerbung #Einstellungstest #Berufseinstieg | Einstellungstest |
| **F Gründer** | #BuildInPublic #SideProject #Gründen #Schweiz | Build-in-Public, Fazit |
| **G Instagram/TikTok** | #exceltipps #excellernen #exceltricks #bürojob #lernenmitspass #schweiz | Kurzvideos (5–6) |

## Posting-Kalender (4 Wochen)

Rhythmus: LinkedIn 3× pro Woche (Di/Mi/Do 07:30–08:30 oder 12:00), X täglich wochentags, Reddit max. 1–2 pro Woche, Instagram/TikTok 3× pro Woche, Mails gestaffelt.

**Instagram:** Die Instagram-Zeilen in den Wochentabellen unten sind der Stand vom 30.10. Massgeblich für Instagram ist seit 1.11. der Tagesplan `instagram-termine.md` (täglich Reel 18:30, Karussells IG-K1 bis IG-K14, 3 Stories pro Tag, Threads).

**Neue LinkedIn-Posts (Vorschläge):** LI-18 Datei prüfen für Ausbildner am Mi 4.11., LI-17 Zertifikate/ICDL am Mo 9.11., LI-19 KI-Interview am Mo 23.11. (LI-10 Poll dafür auf Mo 30.11. verschieben oder streichen).

### Woche 1 (2.–6.11.): Launch, Netzwerk aktivieren

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 2.11. | E-Mail | EM-01 | 50–100 persönliche Kontakte, erste Nutzer, Feedback |
| Mo 2.11. | X | X-T1 (Launch-Thread) | Sichtbarkeit, Klicks |
| Di 3.11. | LinkedIn | LI-01 Launch | Reichweite, Klicks auf Gratis-Übungen |
| Di 3.11. | Instagram/TikTok | IG-V1 | Testen, ob Format trägt |
| Mi 4.11. | X | X-01, X-02 | Klicks |
| Mi 4.11. | LinkedIn | **LI-18 Datei prüfen für Ausbildner** (neu, Vorschlag) | Klicks Upload-Seite, Klassenanfragen |
| Do 5.11. | LinkedIn | LI-02 SVERWEIS-Fehler (+ Bild linkedin-2) | Mehrwert, Saves, Klicks auf sverweis-1 |
| Do 5.11. | Reddit | RD-01 r/de_EDV | Feedback + Nutzer |
| Fr 6.11. | Instagram | IG-K1 Karussell SVERWEIS | Saves |
| Fr 6.11. | X | X-11 (App installieren, offline) | Klicks |
| Fr 6.11. | – | Auswertung W1 | Klicks pro Kanal, Abschlussquote Übung 1 |

### Woche 2 (9.–13.11.): Mehrwert, Zielgruppen Basis/Bewerbung

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 9.11. | X | X-T2 (SVERWEIS-Thread), X-03 | Klicks |
| Mo 9.11. | LinkedIn | **LI-17 Zertifikate, ICDL ausgesetzt** (neu, Vorschlag) | Klicks Zertifikatsseite |
| Mo 9.11. | Instagram | Text-Story «Auf dem Handy installieren» | Installationen |
| Di 10.11. | LinkedIn | LI-03 Semikolon vs. Komma (+ linkedin-3) | Kommentare |
| Di 10.11. | Instagram/TikTok | IG-V2, IG-V3 | Reichweite |
| Mi 11.11. | Reddit | RD-03 r/Schweiz | Nutzer CH |
| Mi 11.11. | X | X-04, X-05 | – |
| Mi 11.11. | E-Mail | EM-04 Pilot Recruiting (10–15 Kontakte) | 3 Pilotfirmen |
| Mi 11.11. | LinkedIn | **LI-04 Einstellungstest-Angst** (verschoben von Do 12.11., Vorschlag) | Klicks Basis-Pfad |
| Do 12.11. | LinkedIn | **LI-16 Excel-Datei hochladen** (neu, B2B/Produkt) | Klicks Upload-Seite |
| Fr 13.11. | LinkedIn | LI-09 Quiz (Bild square) | Kommentare (Reichweite) |
| Fr 13.11. | Instagram | IG-K2, IG-K3 | Saves |
| Fr 13.11. | – | Auswertung W2 + Zwischenstand-Zahlen sammeln | – |

### Woche 3 (16.–20.11.): Berufspfade, B2B

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 16.11. | E-Mail | EM-02 HR/Teamleiter (10–20 Kontakte) | 1–3 Teamgespräche |
| Mo 16.11. | E-Mail | EM-03 Hochschulen/Berufsschulen (10–15) | Backlinks, Klassen |
| Mo 16.11. | LinkedIn | **LI-13 An HR/Recruiting** (neu) | Pilot-Anfragen |
| Mo 16.11. | X | X-06, X-07 | – |
| Di 17.11. | LinkedIn | LI-05 Accounting-Pfad (+ linkedin-4) | Klicks Accounting, Premium |
| Mi 18.11. | LinkedIn | **LI-14 An Berufsbildner** (neu) | Klassenanfragen |
| Mi 18.11. | E-Mail | EM-05 Nachfass zu EM-04 | Pilot-Zusagen |
| Mi 18.11. | Reddit | RD-05 r/Buchhaltung | Nutzer Accounting |
| Mi 18.11. | Instagram/TikTok | IG-V4, IG-K4 | – |
| Mi 18.11. | Instagram | Story-Text «Für Berufsbildner: Klassen gratis» | Klassenanfragen |
| Do 19.11. | LinkedIn | LI-06 Finance-Pfad (+ linkedin-5) | Klicks Finance, Premium |
| Do 19.11. | X | X-T3 (Finance-Thread) | – |
| Fr 20.11. | LinkedIn | **LI-15 An Teamleiter Controlling/Finance** (neu) | Teamanfragen |
| Fr 20.11. | Reddit | RD-02 r/Finanzen (nur wenn Regeln es zulassen) | Nutzer Finance |
| Fr 20.11. | – | Auswertung W3, Nachfassen EM-02/03 | – |

### Woche 4 (23.–27.11.): Conversion, Fazit

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 23.11. | LinkedIn | **LI-19 KI-Interview** (neu, Vorschlag; LI-10 Poll auf Mo 30.11. oder streichen) | Assessment-Starts, Premium |
| Mo 23.11. | X | X-08, X-09 | – |
| Di 24.11. | LinkedIn | LI-08 Build-in-Public (echte Zahlen), verschoben von Mi 18.11., Vorschlag, Text «Zwei Wochen» auf «Drei Wochen» anpassen | Vertrauen, Kommentare |
| Di 24.11. | Reddit | RD-04 r/excel (EN) | Feedback zur Engine |
| Di 24.11. | Instagram/TikTok | IG-V5, IG-V6, IG-K5 | – |
| Di 24.11. | Instagram | **IG-K7 Excel-Test im Bewerbungsprozess** (12:00; Link in Bio auf Assessment-Seite) | Saves, Assessment-Klicks |
| Mi 25.11. | LinkedIn | LI-07 «Nicht durch Zuschauen» | Klicks |
| Do 26.11. | LinkedIn | LI-11 Schweizer Eigenheiten | Reichweite CH |
| Do 26.11. | Instagram | IG-K6 | – |
| Fr 27.11. | LinkedIn | LI-12 Woche-4-Fazit (echte Zahlen, Go/No-Go) | Vertrauen, Folgekunden |
| Fr 27.11. | X | X-10 + Fazit-Kurzfassung | – |
| Fr 27.11. | – | Go/No-Go gemäss TESTPLAN | – |

**Kalender-Konflikte durch die B2B-Posts (Vorschläge, bestehende Posts unverändert):**
- LI-16 (Do 12.11.) kollidiert mit LI-04: LI-04 auf Mi 11.11. vorziehen (an dem Tag liegt LinkedIn sonst leer).
- LI-14 (Mi 18.11.) kollidiert mit LI-08: LI-08 auf Di 24.11. verschieben; dort liegt kein LinkedIn-Post. Der Text «Zwei Wochen» wird dann «Drei Wochen», Zahlen neu messen.
- LI-13 (Mo 16.11.) und LI-15 (Fr 20.11.) liegen auf freien LinkedIn-Tagen. Woche 3 hat damit 5 LinkedIn-Posts (statt 3); wenn das zu viel ist, LI-06 auf Mo 23.11. schieben, nicht streichen.
- IG-K7 (Di 24.11.) liegt am Tag von IG-K5; alternativ Mi 25.11.

### Messung (pro Woche ausfüllen)

| Woche | Besucher | Gratis-Starts | Übung 10 erreicht | Zahlende | Bester Post (Klicks) |
|---|---|---|---|---|---|
| W1 | | | | | |
| W2 | | | | | |
| W3 | | | | | |
| W4 | | | | | |

## Voraussetzungen vor dem ersten Post

- [ ] Domain `excel-drills.ch` live (Links in allen Posts sind eingesetzt)
- [ ] Analytics aktiv (sonst sind UTM-Links wertlos)
- [ ] Stripe-Links in premium.html eingetragen, Testkauf durchgeführt
- [ ] og:image in index.html gesetzt (`assets/og-image.png` liegt bereit, 1200×630)
- [x] Schulen/Teams-Angebot entschieden (31.10.): Schulen und Berufsschulen gratis, Firmen-Teams ab 5 Personen CHF 39/Person/Jahr
- [x] 14-Tage-Garantie auf premium.html sichtbar (31.10.)
- [x] Stripe-Promo-Code SVERWEIS20 angelegt (31.10.) (20 %, Jahresabo + Lifetime, Mindestbetrag CHF 49, einmalig, bis 15.11.2026)
- [ ] LinkedIn-Profil: Zeile «Baut Excel-Drills (Excel-Übungen auf Deutsch)» im Untertitel, Link im Featured-Bereich
