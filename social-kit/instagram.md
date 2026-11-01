# Instagram: Karussells, Captions, Stories, Bio

Stand: 1.11.2026 (IG-K8 bis IG-K14 zu den Differenzierern ergänzt) · Gilt für den Launch-Zeitraum Mo 2.11. bis Fr 27.11.2026 (siehe `README.md`).
Konzepte und Kurzvideo-Skripte: `instagram-tiktok.md`. Tagesplan mit Uhrzeiten, Reels und Stories: **`instagram-termine.md`** (massgeblich). Reel-Serie: `video/formel-des-tages.md`.
Diese Datei liefert die **fertigen Karussell-Slides, Captions, Bio und Story-Plan**.

## Dateien

| Was | Datei | Format |
|---|---|---|
| Karussell-Vorlage | `visuals/carousel.html?c=1..14&s=1..n` | 1080×1350 (4:5) |
| Story-Vorlage | `visuals/story.html?v=1..8` (ohne `v` = Reel-Endcard `png/story.png`) | 1080×1920 |
| Rendern | `bash social-kit/visuals/render-instagram.sh` (alles) · `… 11` (nur Karussell 11) · `… story` | headless Chrome, nacheinander, ausserhalb der Sandbox |
| Fertige Bilder | `visuals/png/instagram/c<nr>-s<nr>.png` (c1 bis c14), `story-1.png` … `story-8.png` | 99 Slides + 8 Stories |

Stories: `story-4` Für Berufsbildner · `story-5` Datei prüfen · `story-6` KI-Interview · `story-7` Zertifikate · `story-8` SQL-Drills.

Beim Hochladen: Alle Slides eines Karussells in der Reihenfolge s1 → sN auswählen, Format **4:5** (nicht auf 1:1 zuschneiden lassen). Alt-Text pro Karussell: erste Zeile der Caption.

| Nr | Karussell | Slides | Ziel-Link (Bio, siehe unten) |
|---|---|---|---|
| IG-K1 | 3 Fehler, die jeder in SVERWEIS macht | 7 | Übung `sverweis-1` |
| IG-K2 | Excel auf Deutsch: 8 Übersetzungen | 7 | App-Start |
| IG-K3 | Excel-Einstellungstest: Das wird geprüft | 8 | Lernpfad Basis |
| IG-K4 | Monatsabschluss: 5 Formeln fürs Controlling | 7 | Lernpfad Accounting |
| IG-K5 | Schweizer Excel: 5 Eigenheiten | 7 | Übung `runden-1` |
| IG-K6 | Warum Excel-Videos nicht reichen | 7 | App-Start |
| IG-K7 | Excel-Test im Bewerbungsprozess: Teste dich selbst | 7 | Assessment-Seite |
| IG-K8 | Excel-Datei hochladen, Fehler sehen | 7 | `/upload/` |
| IG-K9 | KI-Interview: Frau Keller hat Rückfragen (Premium) | 8 | `/assessment/?rolle=consulting` |
| IG-K10 | Fehler-DNA: Welche Fehler machst du immer wieder? | 7 | App-Start (Profil) |
| IG-K11 | Excel-Zertifikat Schweiz: SIZ, MOS und der ICDL-Stopp | 8 | `/zertifikate/` |
| IG-K12 | Klicken statt tippen: Zellbezüge wie in Excel | 6 | App-Start |
| IG-K13 | Dein erster Tag als Controllerin (Mini-Aufgabe) | 7 | `/kampagne/` |
| IG-K14 | SQL-Drills (Beta): SQL für Excel-Leute | 6 | `https://sql-drills.onrender.com` |

**Hinweis Hashtags:** `README.md` sagt «3–5 Hashtags pro Post». Für Instagram-Karussells sind hier bewusst 8–12 gesetzt (Instagram verteilt über Hashtags stärker als LinkedIn). Ab IG-K8 in drei Gruppen: **klein** (Nische, Schweiz/Beruf, dort wird ein neues Konto am ehesten gesehen), **mittel** (Thema), **gross** (Reichweite). Hashtags in die Caption, nicht in einen Kommentar. Keine Microsoft-/Marken-Hashtags.

---

## Captions

### IG-K1 «3 Fehler, die jeder in SVERWEIS macht» · Di 3.11. 07:30 (terminiert)

```
Dein SVERWEIS liefert eine Zahl. Sie ist nur leider falsch.

Das Tückische an SVERWEIS: Die drei häufigsten Fehler geben keine Fehlermeldung.
1. FALSCH vergessen → Excel sucht nur ungefähr
2. Matrix ohne $ → beim Runterziehen verrutscht der Bereich
3. Spaltenindex ab Spalte A gezählt statt ab der Matrix
Bonus: Steht die Suchspalte rechts, hilft XVERWEIS oder INDEX/VERGLEICH.

Speichern, und dann selbst tippen: SVERWEIS gratis üben mit Sofort-Prüfung, Link in Bio.

#excel #exceltipps #excellernen #sverweis #exceltricks #bürojob #weiterbildung #schweiz #kaufmännisch #lernenmitspass
```

### IG-K2 «Excel auf Deutsch: Die 8 wichtigsten Übersetzungen» · Fr 6.11. 12:00 (terminiert)

```
SUM, IF, VLOOKUP: Das englische Tutorial ist klar. Nur dein Excel versteht es nicht.

In deutschsprachigem Excel heissen die Funktionen anders und die Argumente trennst du mit Semikolon:
SUM → SUMME · AVERAGE → MITTELWERT
IF → WENN · IFERROR → WENNFEHLER
VLOOKUP → SVERWEIS · XLOOKUP → XVERWEIS
SUMIF → SUMMEWENN · COUNTIF → ZÄHLENWENN

Speichern für das nächste Tutorial. Üben auf Deutsch, mit Sofort-Prüfung: Link in Bio.

#excel #exceltipps #excellernen #exceldeutsch #exceltricks #bürojob #officetipps #weiterbildung #schweiz #lernen
```

### IG-K3 «Excel-Einstellungstest: Das wird geprüft» · Di 10.11. 07:30 (terminiert)

```
Excel-Test im Bewerbungsprozess? Das kommt fast immer dran.

SUMME, MITTELWERT, MAX zum Aufwärmen. Dann WENN, SVERWEIS (mit FALSCH), SUMMEWENN und ZÄHLENWENN und die $-Bezüge.
Mein Tipp: Keine Videos mehr schauen. Jede Funktion dreimal selbst tippen, beim dritten Mal ohne Spick.
Im Lernpfad Basis sind 10 Übungen dazu gratis, ohne Anmeldung.

Viel Erfolg beim Test. Link in Bio.

#excel #einstellungstest #bewerbung #excellernen #exceltipps #berufseinstieg #kv #lehrstelle #jobsuche #karriereschweiz #schweiz
```

### IG-K4 «Monatsabschluss: 5 Formeln fürs Controlling» · Fr 13.11. 12:00 (terminiert)

```
5 Excel-Formeln, die im Monatsabschluss jeden Monat wieder auftauchen.

Abweichung in CHF: =C2-B2
Abweichung in %: =(C2-B2)/B2, ohne mal 100
Kosten nach Kostenstelle und Monat: SUMMEWENNS
Doppelte Belegnummern: ZÄHLENWENN mit $-Bereich
Abgrenzung: =MONATSENDE(A2;0)

Lernpfad Accounting & Controlling: 11 Übungen, 3 gratis. Link in Bio.

#excel #controlling #buchhaltung #rechnungswesen #accounting #monatsabschluss #exceltipps #finanzen #kaufmännisch #schweiz
```

### IG-K5 «Schweizer Excel: 5 Eigenheiten» · Di 17.11. 07:30 (terminiert)

```
1'250.50 oder 1.250,50? In der Schweiz rechnet Excel ein bisschen anders.

Hochkomma als Tausendertrenner, Punkt als Dezimalzeichen, aber trotzdem Semikolon in den Formeln.
Auf 5 Rappen runden: =VRUNDEN(B2;0.05)
MwSt-Satz in eine eigene Zelle und absolut ansprechen: =B2/(1+$C$1)
Welche Schweizer Eigenheit nervt dich am meisten? Schreib's in die Kommentare.

Excel-Übungen mit CHF und Rappen: Link in Bio.

#excel #schweiz #exceltipps #excellernen #mwst #rappen #buchhaltung #kmu #bürojob #zürich #bern #weiterbildung
```

### IG-K6 «Warum Excel-Videos nicht reichen» · Fr 20.11. 12:00 (terminiert)

```
10 Excel-Videos geschaut und vor der leeren Zelle trotzdem blockiert? Das ist normal.

Beim Zuschauen trainierst du Wiedererkennen. Im Job brauchst du Abrufen: die Formel selbst aus dem Kopf schreiben.
Die Lernforschung nennt das Testeffekt oder Retrieval Practice.
So übst du: Aufgabe lesen, selbst tippen, sofort prüfen, in ein paar Tagen wiederholen.
Genau so ist Excel-Drills gebaut, mit Tagesziel, Streak und Gold pro Übung, wenn du sie auch mit anderen Zahlen löst.

18 Übungen gratis, ohne Anmeldung. Link in Bio.

#excel #excellernen #exceltipps #lernen #lerntipps #weiterbildung #retrievalpractice #bürojob #lernenmitspass #schweiz
```

### IG-K7 «Excel-Test im Bewerbungsprozess: Teste dich selbst» · Mi 25.11. 12:00 (terminiert)

```
Excel-Test im Bewerbungsprozess? Teste dich vorher selbst.

Frag dich ehrlich: Kannst du das ohne Nachschlagen tippen?
1. SVERWEIS mit FALSCH und fixierter Matrix
2. Auf 5 Rappen runden: =VRUNDEN(B2;0.05)
3. Netto aus Brutto mit MwSt-Satz in einer eigenen Zelle
4. SUMMEWENN nach Kostenstelle
5. Abweichung in % ohne mal 100
Wenn eine Zeile wackelt, genau dort lohnt sich Üben mit Sofort-Prüfung.

Rollen-Assessments für Consulting und Accounting und die Gratis-Übungen: Link in Bio.

#excel #einstellungstest #bewerbung #excellernen #exceltipps #berufseinstieg #karriereschweiz #bürojob #lernen #schweiz
```

**Hinweis:** IG-K7 liegt auf Mi 25.11. 12:00, weil am Di 24.11. schon IG-V5, IG-V6 und IG-K5 erscheinen (zwei Karussells am selben Tag konkurrieren um Reichweite). Link in Bio an diesem Tag auf die Assessment-Seite stellen (Hash/Pfad: `https://excel-drills.ch/assessment/?utm_source=instagram&utm_medium=bio&utm_campaign=launch`).

Alle Captions: Du-Form (Ausnahme: Zitate von Frau Keller in Sie-Form), ss statt ß, keine erfundenen Zahlen, keine Erfolgsversprechen (Regeln aus `README.md`). Erster eigener Kommentar nach dem Posten (optional, für Reichweite): eine Frage, z. B. K1 «Welcher der drei ist dir schon passiert?».

### IG-K8 «Excel-Datei hochladen, Fehler sehen» · So 8.11. 12:00

```
Lös die Aufgabe in deinem echten Excel. Dann sieh, wo es hakt.

So geht es:
1. Aufgabe als xlsx herunterladen (SVERWEIS, SUMMEWENN, $-Bezug, WENN, ZÄHLENWENN)
2. In deinem Excel lösen und speichern, Windows, Mac oder Excel im Web
3. Datei hochladen: Die Fehlerkarte zeigt die Zielzelle grün oder rot und sagt, was fehlt
Gut zu wissen: Excel speichert Formeln intern englisch. Wir übersetzen zurück und prüfen mit derselben Engine wie im Browser.
Deine Datei verlässt den Browser nicht.

Probier es mit einer Aufgabe: Link in Bio.

#exceldeutsch #kvlehre #excelschweiz
#exceltipps #excellernen #bürojob
#excel #weiterbildung
```

### IG-K9 «KI-Interview: Frau Keller hat Rückfragen» · Mo 23.11. 12:00 (Premium, erst ab Woche 4)

```
«Ihr Break-even liegt bei 1'800 Stück. Wie sind Sie darauf gekommen?»

So fragt Frau Keller, unsere KI-Interviewerin, nach dem Assessment. Wie im Case-Interview:
Warum diese Zahl? Was passiert bei 10 % tieferem Preis? Wie sagen Sie das dem CEO?
Sie verrät keine Lösungen, sie fragt nach deinem Gedankengang. Am Schluss gibt es ein Fazit zu Struktur, Zahlenverständnis, Annahmen und Kommunikation.
Der Dialog in den Slides ist ein gekürztes Beispiel. Frau Keller und Herr Bianchi (Accounting) sind fiktive Figuren.

Zuerst das Assessment gratis lösen, dann mit Premium das Interview. Link in Bio.

#caseinterview #consultingschweiz #bewerbungstipps
#excel #consulting #bewerbung
#karriere #finance
```
Hinweis: Vor dem Posten den Dialog mit der Live-Version abgleichen (Rollen, Anzahl Runden, Premium-Regel); keine Aussagen über die Vorhersagekraft.

### IG-K10 «Fehler-DNA: Welche Fehler machst du immer wieder?» · So 22.11. 12:00

```
Welche Excel-Fehler machst du immer wieder? Excel-Drills merkt es sich.

Jeder Fehlversuch landet in einer von 6 Kategorien: Bezüge und $, Syntax, Logik, Nachschlagen, Runden, Modell.
Daraus entsteht deine Fehler-DNA: Fehlerquote pro Kategorie, die schwächste mit Tipp und passender Übung.
Und was du falsch hattest, kommt nach ein paar Tagen wieder: «Heute fällig».
Die Lernforschung nennt das Spaced Repetition. Du übst dort, wo deine Fehler liegen.

Fehlerprofil im Profil der App, gespeichert in deinem Browser. Link in Bio.

#excelschweiz #lerntipps #kvlehre
#exceltipps #excellernen #lernen
#excel #weiterbildung
```

### IG-K11 «Excel-Zertifikat Schweiz: SIZ, MOS und der ICDL-Stopp» · Do 12.11. 12:00 (Collab-Post mit Lucas Konto)

```
ICDL zurzeit ausgesetzt. Welches Excel-Zertifikat jetzt?

Die Schweizer ICDL-Lizenznehmerin meldet: Der Prüfungsbetrieb ist nach einer gerichtlichen Anordnung zur Marke vorübergehend unterbrochen, neue Zeugnisse gibt es nicht (Stand 1.11.2026, Quelle: xcdl.ch).
Die Alternativen:
SIZ AU4 Tabellen: der Schweizer Büro-Standard, CHF 110 bzw. 132
SIZ PU41 Power-User: Finanz- und Rechnungswesen, CHF 260 bzw. 312
MOS Excel Associate (MO-210) und Expert (MO-211): international, praktisch in Excel
Excel-Drills bereitet den Funktionsteil vor, je 3 Tage gratis, und sagt ehrlich, was du in Excel selbst üben musst.

Alle vier im Vergleich: Link in Bio.

#siz #icdl #excelzertifikat
#weiterbildungschweiz #kvlehre #fachausweis
#excel #weiterbildung
```
Hinweis: Preise und ICDL-Status vor dem Posten auf `zertifikate/index.html` gegenprüfen (Stand 1.11.2026).

### IG-K12 «Klicken statt tippen: Zellbezüge wie in Excel» · So 15.11. 12:00

```
Klicken statt tippen. In jeder Excel-Drills-Übung, wie in Excel.

3 Tipps, die auch in deinem echten Excel funktionieren:
1. Zelle anklicken, während du die Formel schreibst: Der Bezug landet an der Cursorposition
2. Bereich ziehen oder Shift-Klick: B2:B5. Klick auf den Spaltenkopf: B:B
3. F4 im Bezug: B3 wird $B$3, dann B$3, dann $B3. Excel auf dem Mac: Cmd+T
Im Einstellungstest zählt jede Minute. Wer Bezüge klickt, vertippt sich nicht bei Zeile oder Spalte.

Gleich ausprobieren, 18 Übungen gratis: Link in Bio.

#exceltricks #shortcuts #excelschweiz
#exceltipps #excellernen #einstellungstest
#excel #bürojob
```

### IG-K13 «Dein erster Tag als Controllerin» · Mi 18.11. 12:00

```
Dein erster Tag als Controllerin. Löst du die Aufgabe?

Herr Steiner will wissen, wie viele Lieferantenrechnungen noch offen sind. 8 Rechnungen, der Status steht in D2:D9, das Kriterium «offen» in F2.
A: =ANZAHL(D2:D9)
B: =ZÄHLENWENN(D2:D9;F2)
C: =SUMMEWENN(D2:D9;"offen")
Schreib deinen Buchstaben in die Kommentare, die Auflösung steht auf Slide 5.

Das ist Tag 1 der Kampagne «Dein erster Monat als Controllerin» bei der fiktiven Alpina Logistik AG: 8 Tage, ein durchgehender Datensatz, Tag 1 bis 3 gratis. Link in Bio.

#controlling #rechnungswesen #berufseinstieg
#buchhaltung #exceltipps #monatsabschluss
#excel #finanzen
```
Erster eigener Kommentar: «Auflösung auf Slide 5. Wer hatte B?»

### IG-K14 «SQL-Drills (Beta): SQL für Excel-Leute» · Fr 27.11. 12:00

```
Du kannst SUMMEWENN? Dann kannst du fast schon SQL.

3 Übersetzungen:
ZÄHLENWENN → SELECT COUNT(*) … WHERE
SUMMEWENN → GROUP BY, alle Summen auf einmal
SVERWEIS → JOIN, verbindet zwei Tabellen über eine Spalte
Zum Üben gibt es jetzt SQL-Drills, das Schwesterprojekt von Excel-Drills: 41 Übungen zu SELECT, JOIN und GROUP BY, im Browser. Noch Beta, Feedback erwünscht.

sql-drills.onrender.com, Link auch in der Bio.

#sqllernen #datenanalyse #excelschweiz
#sql #exceltipps #daten
#excel #weiterbildung
```

**Termine ab IG-K8:** Die Tage oben folgen `instagram-termine.md`. Alle Karussells werden in der Business Suite terminiert, ausser IG-K11 (Collab-Post, Einladung an Lucas Konto nur in der App).

---

## Posting-Reihenfolge

Massgeblich ist der Tagesplan in **`instagram-termine.md`** (Stand 1.11.2026: 1 Reel pro Tag, Karussells, 3 Stories pro Tag, Threads, Kommentar-Routine). Die frühere 4-Wochen-Tabelle in dieser Datei ist damit ersetzt.

Nach dem Posten 30 Minuten präsent bleiben und Kommentare beantworten. **Saves** sind bei Karussells das wichtigste Signal, nicht Likes.

**Link in Bio:** Instagram erlaubt mehrere Bio-Links. Ersten Link je nach aktuellem Post wechseln (Spalte «Bio-Link» in `instagram-termine.md`), Basis-Link: `https://excel-drills.ch/?utm_source=instagram&utm_medium=bio&utm_campaign=launch` (fertige Links pro Karussell in `utm.md`).

### Story-Text «Für Berufsbildner: Klassen gratis»
**Einsatz:** Mi 18.11. (parallel zu LI-14), Bild `png/instagram/story-4.png`, grüner Hintergrund #107C41, weisser Text · **Link-Sticker:** `https://excel-drills.ch/premium.html?utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=ig-story-berufsbildner`

```
Für Berufsbildner:
Klassen gratis.

Schulen und Berufsschulen erhalten Excel-Drills Premium für ihre Lernenden kostenlos. Trainer-Handouts sind dabei.

Mail an hallo@excel-drills.ch mit Schule und Anzahl Lernende.
```

---

## Bio-Text

Name-Feld (durchsuchbar): `Excel-Drills · Excel üben auf Deutsch`

Bio (max. 150 Zeichen):
```
Excel üben statt Videos schauen 📊
Deutsch · Semikolon · CHF · Sofort-Prüfung
18 Übungen gratis ↓
Unabhängig, nicht mit Microsoft verbunden
```

Highlights (Story-Archiv), Titel und Inhalt:
- **Start**: `story-1`, kurzer Screen-Record «so funktioniert eine Übung»
- **Rätsel**: `story-2` plus Auflösungen
- **Streak**: `story-3`
- **Tipps**: geteilte Karussells (je Slide 1)

---

## Story-Plan

Tagesgenaue Zuteilung (3 Stories pro Tag, Uhrzeiten, Sticker): `instagram-termine.md`. Diese Tabelle beschreibt die Vorlagen.
**Zuerst Beweis, dann Verkauf:** Der Launch-Code SVERWEIS20 und Premium kommen auf Instagram in den ersten zwei Wochen (2. bis 15.11.) nicht vor; der Hinweis in der Zeile «Launch» gilt nur noch für LinkedIn/E-Mail.

| Story | Datei | Einsatz | Sticker / Interaktion |
|---|---|---|---|
| Launch | `png/instagram/story-1.png` | Di 3.11., Fr 27.11. | Link-Sticker auf App-Start, über den Button «Gratis starten» legen. **Nur am Di 3.11.:** Textzeile unter dem Bild «Launch-Code SVERWEIS20: 20 % auf Jahresabo und Lifetime, bis 15.11.» (Textsticker, Bild bleibt unverändert) |
| Formelrätsel | `png/instagram/story-2.png` | Mi 11.11. | Quiz-Sticker (A/B/C, richtig: **B**) in den freien Bereich unter dem Hinweis; Auflösung am Folgetag |
| Streak | `png/instagram/story-3.png` | Mo 16.11., Mo 23.11. | Link-Sticker auf App-Start; optional Umfrage «Welches Tagesziel: 1, 2 oder 5?» |
| Auf dem Handy installieren | Text-Story auf grünem Hintergrund #107C41 (noch zu erstellen; optional Screen-Record «Zum Home-Bildschirm») | Mo 9.11. | Text: «Excel-Drills als App aufs Handy: im Browser «Zum Home-Bildschirm» bzw. «App installieren». Die Gratis-Übungen laufen auch offline.» Link-Sticker auf App-Start |
| Für Berufsbildner | `png/instagram/story-4.png` | Mi 18.11. (parallel zu LI-14) | Link-Sticker auf `premium.html` (UTM `ig-story-berufsbildner`, siehe Story-Text unten), unterhalb des Mail-Hinweises in den freien Bereich |
| Karussell-Teaser | Slide 1 des Karussells teilen | an jedem Karussell-Tag | «Neuer Beitrag»-Sticker |
| Frage/Umfrage | Text-Story, grüner Hintergrund #107C41 | Do 5.11., Fr 20.11. | Frage- bzw. Umfrage-Sticker |
| Datei prüfen | `png/instagram/story-5.png` | So 8.11. (Tag von IG-K8) | Link-Sticker auf `/upload/` (UTM `ig-story-upload`), über den Button legen |
| KI-Interview | `png/instagram/story-6.png` | Mo 23.11. (Tag von IG-K9) | Link-Sticker auf `/assessment/` (UTM `ig-story-interview`); Premium, darum erst ab Woche 4 |
| Zertifikate | `png/instagram/story-7.png` | Do 12.11. (Tag von IG-K11), erneut Do 19.11. | Umfrage-Sticker «Welches Zertifikat planst du? SIZ / MOS»; Link-Sticker auf `/zertifikate/` (UTM `ig-story-zertifikate`) |
| SQL-Drills | `png/instagram/story-8.png` | Fr 27.11. (Tag von IG-K14) | Link-Sticker auf `https://sql-drills.onrender.com` (UTM `ig-story-sql`) |

Story-Regeln: oben ca. 250 px und unten ca. 300 px bleiben frei (Profilzeile, Antwortfeld); die Vorlagen halten das ein. Die Streak-Story zeigt eine **Beispielansicht** (5 Tage, Level 3, 186 XP), keine echten Nutzerdaten; der Vermerk «Beispielansicht» bleibt sichtbar.

Neues Rätsel: In `visuals/story.html` unter `V[2]` Frage und Optionen ersetzen, dann `bash social-kit/visuals/render-instagram.sh story`.
