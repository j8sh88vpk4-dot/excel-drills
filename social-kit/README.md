# Social-Media-Kit Excel-Drills: 4-Wochen-Launch

Stand: 30.10.2026 · Launch-Zeitraum: Mo 2.11. bis Fr 27.11.2026 (Go/No-Go-Entscheid gemäss `docs/TESTPLAN.md`)

**Ziel des Tests:** 500 Gratisnutzer **oder** 20 zahlende Kunden bis 27.11.2026.
Social Media ist dabei der Startmotor, bis die Funktions-Artikel (SEO) Traffic bringen. Jeder Post hat deshalb genau ein Ziel: Klick auf eine Gratis-Übung, Kommentar (Reichweite) oder Kauf/Teamanfrage.

## Launch-Code

**SVERWEIS20**: 20 % auf Jahresabo und Lifetime, gültig bis 15.11.2026 (Stripe-Promo-Code, Mindestbetrag CHF 49, einmalig). In Launch-Post, erster Story und Netzwerk-Mail nennen; danach nicht mehr erwähnen.

## Inhalt

| Datei | Inhalt | Anzahl |
|---|---|---|
| `linkedin.md` | Posts für Lucas Profil, fertig zum Kopieren | 12 Posts |
| `reddit.md` | Subreddit-Posts mit Regel-Hinweis und Antwortvorlagen | 5 Posts, 10 Antwortvorlagen |
| `x-threads.md` | Threads und Einzel-Tweets (DE) | 3 Threads, 10 Tweets |
| `instagram-tiktok.md` | Kurzvideo-Skripte und Karussell-Konzepte | 6 Skripte, 6 Karussells |
| `instagram.md` | Fertige Instagram-Karussells (Captions, Hashtags), 4-Wochen-Reihenfolge, Bio, Story-Plan | 6 Karussells (43 Slides), 3 Stories |
| `email.md` | Netzwerk, HR/Teamleiter, Hochschulen/Berufsschulen | 3 Mails (+ Nachfass-Varianten) |
| `utm.md` | UTM-Schema pro Kanal und fertige Links | – |
| `visuals/*.html` | Bildvorlagen (OG, LinkedIn, Quadrat, Story), ohne externe Abhängigkeiten | 4 Vorlagen, 5 LinkedIn-Varianten |
| `visuals/render.sh` | Rendert alle Vorlagen nach `visuals/png/` | – |
| `visuals/carousel.html`, `visuals/render-instagram.sh` | Instagram-Karussells 1080×1350 (`?c=1..6&s=1..n`), Story-Varianten `story.html?v=1..3`; Rendern nach `visuals/png/instagram/` | 43 Slides + 3 Stories |
| `visuals/png/` | Gerenderte PNGs: og-image, linkedin-1…5, square-quiz, story | 8 PNGs |

## Nutzung

1. **Platzhalter ersetzen.** Alle Texte verwenden `{URL}` für den Link. Den passenden Link pro Kanal und Post holst du aus `utm.md` (z. B. `{URL_LI_01}`). Solange die Domain nicht fix ist, steht dort `{DOMAIN}`.
2. **Zahlen nur echt einsetzen.** Platzhalter wie `{Nutzer}`, `{Übungen gelöst}`, `{Zahlende}` werden mit den Werten aus der Analytics (Plausible/Umami, siehe TESTPLAN) gefüllt. Gibt es keine Messung, wird der Satz gestrichen, nicht geschätzt.
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
- **Garantie und Gratis-Angebote erst nach Bestätigung.** «Geld-zurück-Garantie» und «Schulen/Teams gratis» sind laut TESTPLAN noch zu bestätigen. Bis dahin in Posts weglassen; in `email.md` sind sie als Angebot formuliert, das Luca bewusst macht.
- **Keine Microsoft-Nähe.** Nicht «offiziell», kein Microsoft-/Excel-Logo. «Excel» nur beschreibend verwenden; Hinweis «unabhängig, nicht mit Microsoft verbunden» im Profil/Footer.
- **«Duolingo für Excel»** nur als Vergleich für die Idee («so wie bei Duolingo»), nie als Markenbezug oder Partnerschaft.

## Faktenbasis (darf verwendet werden)

| Fakt | Wert |
|---|---|
| Übungen total | 37 (Basis 15, Accounting & Controlling 11, Banking & Finance 11) |
| Gratis | 18 Übungen, ohne Anmeldung, im Browser |
| Premium | CHF 9/Monat, CHF 49/Jahr, CHF 149 einmalig |
| Prüfung | Formel-Engine rechnet die Formel, prüft das Ergebnis (nicht den Text); bei vielen Übungen zusätzlich mit anderen Zahlen |
| Konventionen | Deutsche Funktionsnamen, Semikolon, CHF, Rappen-Rundung |
| Hinweise | Englische Namen (SUM, VLOOKUP) werden erkannt und übersetzt |
| In Arbeit | Lernpfade Consulting, Data & Reporting |
| Artikel | SVERWEIS, SUMMEWENN, WENN, ZÄHLENWENN, absolute Bezüge |

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

### Woche 1 (2.–6.11.): Launch, Netzwerk aktivieren

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 2.11. | E-Mail | EM-01 | 50–100 persönliche Kontakte, erste Nutzer, Feedback |
| Mo 2.11. | X | X-T1 (Launch-Thread) | Sichtbarkeit, Klicks |
| Di 3.11. | LinkedIn | LI-01 Launch | Reichweite, Klicks auf Gratis-Übungen |
| Di 3.11. | Instagram/TikTok | IG-V1 | Testen, ob Format trägt |
| Mi 4.11. | X | X-01, X-02 | Klicks |
| Do 5.11. | LinkedIn | LI-02 SVERWEIS-Fehler (+ Bild linkedin-2) | Mehrwert, Saves, Klicks auf sverweis-1 |
| Do 5.11. | Reddit | RD-01 r/de_EDV | Feedback + Nutzer |
| Fr 6.11. | Instagram | IG-K1 Karussell SVERWEIS | Saves |
| Fr 6.11. | – | Auswertung W1 | Klicks pro Kanal, Abschlussquote Übung 1 |

### Woche 2 (9.–13.11.): Mehrwert, Zielgruppen Basis/Bewerbung

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 9.11. | X | X-T2 (SVERWEIS-Thread), X-03 | Klicks |
| Di 10.11. | LinkedIn | LI-03 Semikolon vs. Komma (+ linkedin-3) | Kommentare |
| Di 10.11. | Instagram/TikTok | IG-V2, IG-V3 | Reichweite |
| Mi 11.11. | Reddit | RD-03 r/Schweiz | Nutzer CH |
| Mi 11.11. | X | X-04, X-05 | – |
| Do 12.11. | LinkedIn | LI-04 Einstellungstest-Angst | Klicks Basis-Pfad |
| Fr 13.11. | LinkedIn | LI-09 Quiz (Bild square) | Kommentare (Reichweite) |
| Fr 13.11. | Instagram | IG-K2, IG-K3 | Saves |
| Fr 13.11. | – | Auswertung W2 + Zwischenstand-Zahlen sammeln | – |

### Woche 3 (16.–20.11.): Berufspfade, B2B

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 16.11. | E-Mail | EM-02 HR/Teamleiter (10–20 Kontakte) | 1–3 Teamgespräche |
| Mo 16.11. | E-Mail | EM-03 Hochschulen/Berufsschulen (10–15) | Backlinks, Klassen |
| Mo 16.11. | X | X-06, X-07 | – |
| Di 17.11. | LinkedIn | LI-05 Accounting-Pfad (+ linkedin-4) | Klicks Accounting, Premium |
| Mi 18.11. | LinkedIn | LI-08 Build-in-Public (echte Zahlen) | Vertrauen, Kommentare |
| Mi 18.11. | Reddit | RD-05 r/Buchhaltung | Nutzer Accounting |
| Mi 18.11. | Instagram/TikTok | IG-V4, IG-K4 | – |
| Do 19.11. | LinkedIn | LI-06 Finance-Pfad (+ linkedin-5) | Klicks Finance, Premium |
| Do 19.11. | X | X-T3 (Finance-Thread) | – |
| Fr 20.11. | Reddit | RD-02 r/Finanzen (nur wenn Regeln es zulassen) | Nutzer Finance |
| Fr 20.11. | – | Auswertung W3, Nachfassen EM-02/03 | – |

### Woche 4 (23.–27.11.): Conversion, Fazit

| Tag | Kanal | Post-ID | Ziel |
|---|---|---|---|
| Mo 23.11. | LinkedIn | LI-10 Poll | Kommentare, Lernpräferenzen |
| Mo 23.11. | X | X-08, X-09 | – |
| Di 24.11. | Reddit | RD-04 r/excel (EN) | Feedback zur Engine |
| Di 24.11. | Instagram/TikTok | IG-V5, IG-V6, IG-K5 | – |
| Mi 25.11. | LinkedIn | LI-07 «Nicht durch Zuschauen» | Klicks |
| Do 26.11. | LinkedIn | LI-11 Schweizer Eigenheiten | Reichweite CH |
| Do 26.11. | Instagram | IG-K6 | – |
| Fr 27.11. | LinkedIn | LI-12 Woche-4-Fazit (echte Zahlen, Go/No-Go) | Vertrauen, Folgekunden |
| Fr 27.11. | X | X-10 + Fazit-Kurzfassung | – |
| Fr 27.11. | – | Go/No-Go gemäss TESTPLAN | – |

### Messung (pro Woche ausfüllen)

| Woche | Besucher | Gratis-Starts | Übung 10 erreicht | Zahlende | Bester Post (Klicks) |
|---|---|---|---|---|---|
| W1 | | | | | |
| W2 | | | | | |
| W3 | | | | | |
| W4 | | | | | |

## Voraussetzungen vor dem ersten Post

- [ ] Domain live, `{DOMAIN}` in `utm.md` ersetzt
- [ ] Analytics aktiv (sonst sind UTM-Links wertlos)
- [ ] Stripe-Links in premium.html eingetragen, Testkauf durchgeführt
- [ ] og:image in index.html gesetzt (`assets/og-image.png` liegt bereit, 1200×630)
- [ ] Garantie- und Schulen/Teams-Angebot bestätigt oder aus Texten gestrichen
- [ ] LinkedIn-Profil: Zeile «Baut Excel-Drills (Excel-Übungen auf Deutsch)» im Untertitel, Link im Featured-Bereich
