# Instagram: Karussells, Captions, Stories, Bio

Stand: 30.10.2026 · Gilt für den Launch-Zeitraum Mo 2.11. bis Fr 27.11.2026 (siehe `README.md`).
Konzepte und Kurzvideo-Skripte: `instagram-tiktok.md`. Diese Datei liefert die **fertigen Karussell-Slides, Captions, Bio und Story-Plan**.

## Dateien

| Was | Datei | Format |
|---|---|---|
| Karussell-Vorlage | `visuals/carousel.html?c=1..6&s=1..n` | 1080×1350 (4:5) |
| Story-Vorlage | `visuals/story.html?v=1..3` (ohne `v` = Reel-Endcard `png/story.png`) | 1080×1920 |
| Rendern | `bash social-kit/visuals/render-instagram.sh` (alles) · `… 3` (nur Karussell 3) · `… story` | headless Chrome, nacheinander |
| Fertige Bilder | `visuals/png/instagram/c<nr>-s<nr>.png`, `story-1.png` … `story-3.png` | 43 Slides + 3 Stories |

Beim Hochladen: Alle Slides eines Karussells in der Reihenfolge s1 → sN auswählen, Format **4:5** (nicht auf 1:1 zuschneiden lassen). Alt-Text pro Karussell: erste Zeile der Caption.

| Nr | Karussell | Slides | Ziel-Link (Bio, siehe unten) |
|---|---|---|---|
| IG-K1 | 3 Fehler, die jeder in SVERWEIS macht | 7 | Übung `sverweis-1` |
| IG-K2 | Excel auf Deutsch: 8 Übersetzungen | 7 | App-Start |
| IG-K3 | Excel-Einstellungstest: Das wird geprüft | 8 | Lernpfad Basis |
| IG-K4 | Monatsabschluss: 5 Formeln fürs Controlling | 7 | Lernpfad Accounting |
| IG-K5 | Schweizer Excel: 5 Eigenheiten | 7 | Übung `runden-1` |
| IG-K6 | Warum Excel-Videos nicht reichen | 7 | App-Start |

**Hinweis Hashtags:** `README.md` sagt «3–5 Hashtags pro Post». Für Instagram-Karussells sind hier bewusst 8–12 gesetzt (Instagram verteilt über Hashtags stärker als LinkedIn). Hashtags in die Caption, nicht in einen Kommentar. Keine Microsoft-/Marken-Hashtags.

---

## Captions

### IG-K1 «3 Fehler, die jeder in SVERWEIS macht» · Fr 6.11.

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

### IG-K2 «Excel auf Deutsch: Die 8 wichtigsten Übersetzungen» · Fr 13.11.

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

### IG-K3 «Excel-Einstellungstest: Das wird geprüft» · Sa 14.11. (siehe Reihenfolge)

```
Excel-Test im Bewerbungsprozess? Das kommt fast immer dran.

SUMME, MITTELWERT, MAX zum Aufwärmen. Dann WENN, SVERWEIS (mit FALSCH), SUMMEWENN und ZÄHLENWENN und die $-Bezüge.
Mein Tipp: Keine Videos mehr schauen. Jede Funktion dreimal selbst tippen, beim dritten Mal ohne Spick.
Im Lernpfad Basis sind 10 Übungen dazu gratis, ohne Anmeldung.

Viel Erfolg beim Test. Link in Bio.

#excel #einstellungstest #bewerbung #excellernen #exceltipps #berufseinstieg #kv #lehrstelle #jobsuche #karriereschweiz #schweiz
```

### IG-K4 «Monatsabschluss: 5 Formeln fürs Controlling» · Mi 18.11.

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

### IG-K5 «Schweizer Excel: 5 Eigenheiten» · Di 24.11.

```
1'250.50 oder 1.250,50? In der Schweiz rechnet Excel ein bisschen anders.

Hochkomma als Tausendertrenner, Punkt als Dezimalzeichen, aber trotzdem Semikolon in den Formeln.
Auf 5 Rappen runden: =VRUNDEN(B2;0.05)
MwSt-Satz in eine eigene Zelle und absolut ansprechen: =B2/(1+$C$1)
Welche Schweizer Eigenheit nervt dich am meisten? Schreib's in die Kommentare.

Excel-Übungen mit CHF und Rappen: Link in Bio.

#excel #schweiz #exceltipps #excellernen #mwst #rappen #buchhaltung #kmu #bürojob #zürich #bern #weiterbildung
```

### IG-K6 «Warum Excel-Videos nicht reichen» · Do 26.11.

```
10 Excel-Videos geschaut und vor der leeren Zelle trotzdem blockiert? Das ist normal.

Beim Zuschauen trainierst du Wiedererkennen. Im Job brauchst du Abrufen: die Formel selbst aus dem Kopf schreiben.
Die Lernforschung nennt das Testeffekt oder Retrieval Practice.
So übst du: Aufgabe lesen, selbst tippen, sofort prüfen, in ein paar Tagen wiederholen.
Genau so ist Excel-Drills gebaut, mit Tagesziel, Streak und Gold pro Übung, wenn du sie auch mit anderen Zahlen löst.

18 Übungen gratis, ohne Anmeldung. Link in Bio.

#excel #excellernen #exceltipps #lernen #lerntipps #weiterbildung #retrievalpractice #bürojob #lernenmitspass #schweiz
```

Alle Captions: Du-Form, ss statt ß, keine erfundenen Zahlen, keine Erfolgsversprechen (Regeln aus `README.md`). Erster eigener Kommentar nach dem Posten (optional, für Reichweite): eine Frage, z. B. K1 «Welcher der drei ist dir schon passiert?».

---

## Posting-Reihenfolge (4 Wochen)

Rhythmus Instagram: 3 Beiträge pro Woche (Karussell oder Reel) plus Stories an den meisten Tagen. Karussell-Zeit: 07:30 oder 12:00, Reels 18:00. Die Termine folgen dem Kalender in `README.md`; einzige Abweichung: IG-K3 auf Sa 14.11. statt am selben Tag wie IG-K2 (zwei Karussells am selben Tag konkurrieren um dieselbe Reichweite).

| Woche | Tag | Feed | Story | Link in Bio zeigt auf |
|---|---|---|---|---|
| W1 | Di 3.11. | Reel IG-V1 «Dein Excel ist nicht kaputt» | `story-1` Launch | App-Start |
| W1 | Do 5.11. | – | Reel teilen + Frage-Sticker «Welche Excel-Funktion willst du üben?» | App-Start |
| W1 | Fr 6.11. | **IG-K1** SVERWEIS (7 Slides) | Karussell teilen (Slide 1) | `sverweis-1` |
| W2 | Mo 9.11. | – | Text-Story «Auf dem Handy installieren» (siehe Story-Plan) | App-Start |
| W2 | Di 10.11. | Reels IG-V2 + IG-V3 | – | `sverweis-1` |
| W2 | Mi 11.11. | – | `story-2` Formelrätsel mit Quiz-Sticker | `runden-1` |
| W2 | Do 12.11. | – | Auflösung: `c5-s5.png` oder Text-Story «B: =VRUNDEN(B2;0.05)» | `runden-1` |
| W2 | Fr 13.11. | **IG-K2** Übersetzungen (7) | Karussell teilen | App-Start |
| W2 | Sa 14.11. | **IG-K3** Einstellungstest (8) | Karussell teilen | Lernpfad Basis |
| W3 | Mo 16.11. | – | `story-3` Streak | App-Start |
| W3 | Mi 18.11. | Reel IG-V4 + **IG-K4** Monatsabschluss (7) | Karussell teilen | Lernpfad Accounting |
| W3 | Fr 20.11. | – | Umfrage-Sticker «Was soll als Nächstes kommen: Consulting-Pfad oder mehr Data & Reporting?» | App-Start |
| W4 | Mo 23.11. | – | `story-3` erneut (Streak-Erinnerung) | App-Start |
| W4 | Di 24.11. | Reels IG-V5 + IG-V6 + **IG-K5** Schweizer Eigenheiten (7) | Karussell teilen | `runden-1` |
| W4 | Do 26.11. | **IG-K6** Warum Videos nicht reichen (7) | Karussell teilen | App-Start |
| W4 | Fr 27.11. | – | `story-1` als Abschluss, optional mit echten Zahlen (nur gemessen) | App-Start |

Nach dem Posten 30 Minuten präsent bleiben und Kommentare beantworten. Freitag: Saves, Shares und Link-Klicks (UTM `utm_source=instagram`) in die Messtabelle im `README.md` übertragen. **Saves** sind bei Karussells das wichtigste Signal, nicht Likes.

**Link in Bio:** Instagram erlaubt mehrere Bio-Links. Ersten Link je nach aktuellem Post wechseln (Spalte oben), Basis-Link: `https://excel-drills.ch/?utm_source=instagram&utm_medium=bio&utm_campaign=launch` (aus `utm.md`; Hash für Übung anhängen, z. B. `#sverweis-1`).

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

| Story | Datei | Einsatz | Sticker / Interaktion |
|---|---|---|---|
| Launch | `png/instagram/story-1.png` | Di 3.11., Fr 27.11. | Link-Sticker auf App-Start, über den Button «Gratis starten» legen. **Nur am Di 3.11.:** Textzeile unter dem Bild «Launch-Code SVERWEIS20: 20 % auf Jahresabo und Lifetime, bis 15.11.» (Textsticker, Bild bleibt unverändert) |
| Formelrätsel | `png/instagram/story-2.png` | Mi 11.11. | Quiz-Sticker (A/B/C, richtig: **B**) in den freien Bereich unter dem Hinweis; Auflösung am Folgetag |
| Streak | `png/instagram/story-3.png` | Mo 16.11., Mo 23.11. | Link-Sticker auf App-Start; optional Umfrage «Welches Tagesziel: 1, 2 oder 5?» |
| Auf dem Handy installieren | Text-Story auf grünem Hintergrund #107C41 (noch zu erstellen; optional Screen-Record «Zum Home-Bildschirm») | Mo 9.11. | Text: «Excel-Drills als App aufs Handy: im Browser «Zum Home-Bildschirm» bzw. «App installieren». Die Gratis-Übungen laufen auch offline.» Link-Sticker auf App-Start |
| Karussell-Teaser | Slide 1 des Karussells teilen | an jedem Karussell-Tag | «Neuer Beitrag»-Sticker |
| Frage/Umfrage | Text-Story, grüner Hintergrund #107C41 | Do 5.11., Fr 20.11. | Frage- bzw. Umfrage-Sticker |

Story-Regeln: oben ca. 250 px und unten ca. 300 px bleiben frei (Profilzeile, Antwortfeld); die Vorlagen halten das ein. Die Streak-Story zeigt eine **Beispielansicht** (5 Tage, Level 3, 186 XP), keine echten Nutzerdaten; der Vermerk «Beispielansicht» bleibt sichtbar.

Neues Rätsel: In `visuals/story.html` unter `V[2]` Frage und Optionen ersetzen, dann `bash social-kit/visuals/render-instagram.sh story`.
