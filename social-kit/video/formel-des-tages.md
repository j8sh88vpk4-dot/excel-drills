# Reel-Serie «Formel des Tages» (FdT-1 bis FdT-26)

Stand 1.11.2026 · 26 Skripte für Reels von 13 s (9:16, 1080×1920, ohne Ton, Text-Overlay im Video). Termine: `../instagram-termine.md` (täglich 18:30, Mo 2.11. bis Fr 27.11.; am Do 5.11. läuft stattdessen das bereits terminierte Switch-Reel, FdT-26 ist Reserve).
Quelle der Texte: `formel-data.js` (dieselben Daten rendert `formel.html`). Änderungen dort machen, dann neu rendern: `bash social-kit/video/formel-render.sh <nr>` (im Terminal, nicht in der Sandbox).

**Ablauf jedes Reels:** 0 s Hook (ab dem ersten Bild sichtbar) · 1.8 / 3.2 / 4.6 s die drei Textzeilen · 6.2 s die Formel tippt sich in die fx-Zeile · 8.4 s Auflösung mit Häkchen · 11.5 bis 13 s Endcard «Selbst tippen, sofort prüfen. Link in Bio».

**Audio (alle Reels): Trending-Audio in der App wählen.** Das Video hat keinen Ton. In der Instagram-App beim Hochladen «Audio» → einen aktuellen Trend-Titel (Pfeil-Symbol) wählen, für Business-Konten nur freigegebene Titel; Lautstärke tief, der Text trägt das Reel. Danach in der App planen (siehe Terminplan).

**Typ:** FdT = reine Formel. Feature = Formel des Tages, die ein neues Feature zeigt (Kicker «Neu · Formel des Tages»).

| Nr | Datum | Typ | Titel | Datei |
|---|---|---|---|---|
| FdT-1 | Mo 2.11. | FdT | Auf 5 Rappen runden | `reels/fdt-01-9x16.mp4` (gerendert) |
| FdT-2 | Di 3.11. | FdT | SVERWEIS ohne FALSCH | `reels/fdt-02-9x16.mp4` (gerendert) |
| FdT-3 | Mi 4.11. | FdT | Abweichung in % ohne mal 100 | `reels/fdt-03-9x16.mp4` (gerendert) |
| FdT-4 | Fr 6.11. | Feature | SUM heisst SUMME (DE/EN-Schalter) | `reels/fdt-04-9x16.mp4` (gerendert) |
| FdT-5 | Sa 7.11. | FdT | Netto aus Brutto | `reels/fdt-05-9x16.mp4` (gerendert) |
| FdT-6 | So 8.11. | Feature | Excel speichert Formeln englisch (Datei prüfen) | `reels/fdt-06-9x16.mp4` (noch rendern) |
| FdT-7 | Mo 9.11. | FdT | WENNFEHLER | `reels/fdt-07-9x16.mp4` (noch rendern) |
| FdT-8 | Di 10.11. | FdT | WENN mit UND | `reels/fdt-08-9x16.mp4` (noch rendern) |
| FdT-9 | Mi 11.11. | FdT | Text verbinden | `reels/fdt-09-9x16.mp4` (noch rendern) |
| FdT-10 | Do 12.11. | Feature | XVERWEIS (Zertifikat SIZ AU4) | `reels/fdt-10-9x16.mp4` (noch rendern) |
| FdT-11 | Fr 13.11. | FdT | SUMMEWENNS | `reels/fdt-11-9x16.mp4` (noch rendern) |
| FdT-12 | Sa 14.11. | FdT | GLÄTTEN | `reels/fdt-12-9x16.mp4` (noch rendern) |
| FdT-13 | So 15.11. | Feature | F4 und Zell-Klick | `reels/fdt-13-9x16.mp4` (noch rendern) |
| FdT-14 | Mo 16.11. | FdT | MONATSENDE | `reels/fdt-14-9x16.mp4` (noch rendern) |
| FdT-15 | Di 17.11. | FdT | Runden statt nur formatieren | `reels/fdt-15-9x16.mp4` (noch rendern) |
| FdT-16 | Mi 18.11. | Feature | Offene Posten zählen (Kampagne Tag 1) | `reels/fdt-16-9x16.mp4` (noch rendern) |
| FdT-17 | Do 19.11. | FdT | Tage bis Fälligkeit | `reels/fdt-17-9x16.mp4` (noch rendern) |
| FdT-18 | Fr 20.11. | FdT | Duplikate finden | `reels/fdt-18-9x16.mp4` (noch rendern) |
| FdT-19 | Sa 21.11. | FdT | INDEX und VERGLEICH | `reels/fdt-19-9x16.mp4` (noch rendern) |
| FdT-20 | So 22.11. | Feature | Erst rechnen, dann runden (Fehler-DNA) | `reels/fdt-20-9x16.mp4` (noch rendern) |
| FdT-21 | Mo 23.11. | Feature | Break-even (KI-Interview) | `reels/fdt-21-9x16.mp4` (noch rendern) |
| FdT-22 | Di 24.11. | FdT | Wachstum pro Jahr (CAGR) | `reels/fdt-22-9x16.mp4` (noch rendern) |
| FdT-23 | Mi 25.11. | Feature | Combined Ratio (Assessment Versicherung) | `reels/fdt-23-9x16.mp4` (noch rendern) |
| FdT-24 | Do 26.11. | FdT | Leasingrate mit RMZ | `reels/fdt-24-9x16.mp4` (noch rendern) |
| FdT-25 | Fr 27.11. | Feature | SUMMEWENN heisst GROUP BY (SQL-Drills) | `reels/fdt-25-9x16.mp4` (noch rendern) |
| FdT-26 | Reserve | FdT | Anteil am Total | `reels/fdt-26-9x16.mp4` (noch rendern) |

---

## FdT-1 Auf 5 Rappen runden · Mo 2.11.

- **Hook (Sekunde 0 bis 2):** CHF 47.33 an der Kasse?
- **Textzeilen:** 1) In der Schweiz gibt es keine 1-Rappen-Münze. 2) Also rundest du auf 5 Rappen. 3) Eine Funktion reicht.
- **Formel:** `=VRUNDEN(B2;0.05)`
- **Auflösung:** 47.35. VRUNDEN rundet auf das nächste Vielfache von 0.05.
- **Bio-Link an diesem Tag:** App #runden-1
- **Audio:** Trending-Audio in der App wählen

Caption:
```
CHF 47.33 an der Kasse? So rundest du in Excel auf 5 Rappen: =VRUNDEN(B2;0.05). Speichern für den nächsten Kassenabschluss. Gratis üben: Link in Bio.
#excel #exceltipps #excelschweiz #rappen #bürojob
```

Threads:
```
Formel des Tages: Auf 5 Rappen runden geht in Excel mit =VRUNDEN(B2;0.05). Aus 47.33 wird 47.35. Wer nutzt noch =RUNDEN(B2/0.05;0)*0.05?
```

## FdT-2 SVERWEIS ohne FALSCH · Di 3.11.

- **Hook (Sekunde 0 bis 2):** Dein SVERWEIS lügt. Ohne Fehlermeldung.
- **Textzeilen:** 1) Ohne viertes Argument sucht er nur ungefähr. 2) Bei einer unsortierten Liste kommt ein falscher Preis. 3) Die Lösung ist ein Wort.
- **Formel:** `=SVERWEIS(D2;$A$2:$B$9;2;FALSCH)`
- **Auflösung:** nur exakte Treffer. FALSCH heisst: exakte Suche. Findet er nichts, kommt #NV statt einer falschen Zahl.
- **Bio-Link an diesem Tag:** App #sverweis-1
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Dein SVERWEIS liefert eine Zahl, aber die falsche? Fast immer fehlt FALSCH am Schluss. Speichern und selbst tippen: Link in Bio.
#excel #sverweis #exceltipps #excellernen #bürojob
```

Threads:
```
Formel des Tages: =SVERWEIS(D2;$A$2:$B$9;2;FALSCH). Ohne FALSCH sucht SVERWEIS ungefähr und liefert still einen falschen Wert. Schon passiert?
```

## FdT-3 Abweichung in % ohne mal 100 · Mi 4.11.

- **Hook (Sekunde 0 bis 2):** −1'214 % Abweichung? Da stimmt was nicht.
- **Textzeilen:** 1) Budget 28'000, Ist 24'600. 2) Viele rechnen noch mal 100. 3) Das Prozentformat macht das schon.
- **Formel:** `=(C2-B2)/B2`
- **Auflösung:** −12.1 %. Ohne mal 100 rechnen und die Zelle als Prozent formatieren.
- **Bio-Link an diesem Tag:** App #acc-abweichung-2
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Abweichung in Prozent: =(C2-B2)/B2, ohne mal 100. Das Prozentformat multipliziert schon. Speichern für den nächsten Report. Link in Bio.
#excel #controlling #exceltipps #buchhaltung #finanzen
```

Threads:
```
Formel des Tages: Abweichung in % ist =(C2-B2)/B2. Wer noch *100 anhängt und dann Prozentformat setzt, rechnet doppelt.
```

## FdT-4 SUM heisst SUMME (DE/EN-Schalter) · Fr 6.11. · Feature

- **Hook (Sekunde 0 bis 2):** =SUM gibt #NAME? Warum?
- **Textzeilen:** 1) Dein Excel ist auf Deutsch. 2) SUM heisst SUMME, das Komma wird zum Semikolon. 3) Englisch üben? Schalter in der App.
- **Formel:** `=SUMME(B2:B5)`
- **Auflösung:** 34'600. Excel-Drills übt Deutsch oder Englisch, je nachdem, was dein Excel spricht.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
=SUM gibt bei dir #NAME? Dann spricht dein Excel Deutsch: SUMME, MITTELWERT, SVERWEIS. In Excel-Drills schaltest du die Funktionsnamen zwischen Deutsch und Englisch um. Link in Bio.
#excel #exceltipps #exceldeutsch #excellernen #bürojob
```

Threads:
```
Formel des Tages: SUM = SUMME, IF = WENN, VLOOKUP = SVERWEIS. Und das Komma wird zum Semikolon. Welche Übersetzung vergisst du immer?
```

## FdT-5 Netto aus Brutto · Sa 7.11.

- **Hook (Sekunde 0 bis 2):** Brutto 108.10. Wie viel ist netto?
- **Textzeilen:** 1) Nicht minus 8.1 %. 2) Sondern durch 1 plus Satz. 3) Den Satz in eine eigene Zelle.
- **Formel:** `=B2/(1+$C$1)`
- **Auflösung:** 100.00. Brutto geteilt durch (1 + MwSt-Satz). Mit $ bleibt der Satz beim Runterziehen fix.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Netto aus Brutto: =B2/(1+$C$1). Nicht einfach 8.1 % abziehen, das ergibt 99.34 statt 100.00. Speichern. Link in Bio.
#excel #mwst #buchhaltung #excelschweiz #kmu
```

Threads:
```
Formel des Tages: Netto aus Brutto ist =B2/(1+$C$1). 108.10 minus 8.1 % wäre 99.34, richtig ist 100.00.
```

## FdT-6 Excel speichert Formeln englisch (Datei prüfen) · So 8.11. · Feature

- **Hook (Sekunde 0 bis 2):** Deine Formel ist in der Datei englisch.
- **Textzeilen:** 1) Excel speichert intern SUMIF mit Komma. 2) Excel-Drills liest deine xlsx und übersetzt zurück. 3) Dann siehst du auf der Fehlerkarte, was fehlt.
- **Formel:** `=SUMMEWENN(A:A;"Zürich";B:B)`
- **Auflösung:** Fehlerkarte. Aufgabe herunterladen, in Excel lösen, hochladen. Die Datei bleibt in deinem Browser.
- **Bio-Link an diesem Tag:** /upload/
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Lös die Aufgabe in deinem echten Excel, lad die Datei hoch und sieh die Fehlerkarte. Die Datei verlässt deinen Browser nicht. Link in Bio.
#excel #exceltipps #excellernen #weiterbildung #bürojob
```

Threads:
```
Wusstest du? Excel speichert Formeln intern immer englisch mit Komma: =SUMIF(A:A,"Zürich",B:B). Bei Excel-Drills kannst du jetzt deine xlsx hochladen und prüfen lassen.
```

## FdT-7 WENNFEHLER · Mo 9.11.

- **Hook (Sekunde 0 bis 2):** #DIV/0! im Report? Muss nicht sein.
- **Textzeilen:** 1) Umsatz pro Stück, aber eine Filiale hat 0 Stück. 2) Excel teilt durch 0. 3) WENNFEHLER fängt das ab.
- **Formel:** `=WENNFEHLER(B2/C2;0)`
- **Auflösung:** 0 statt #DIV/0!. Erst rechnen, im Fehlerfall den zweiten Wert zeigen.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
#DIV/0! im Report? =WENNFEHLER(B2/C2;0) zeigt 0 statt Fehler. Aber Achtung: nur dort einsetzen, wo der Fehler erwartet ist. Link in Bio.
#excel #exceltipps #controlling #excellernen #bürojob
```

Threads:
```
Formel des Tages: =WENNFEHLER(B2/C2;0). Praktisch gegen #DIV/0!, gefährlich, wenn es echte Fehler versteckt. Wie haltet ihr es?
```

## FdT-8 WENN mit UND · Di 10.11.

- **Hook (Sekunde 0 bis 2):** Bonus nur, wenn zwei Dinge stimmen.
- **Textzeilen:** 1) Umsatz ab 100'000 UND Zielerreichung ab 90 %. 2) Ein WENN allein reicht nicht. 3) UND kommt in die Bedingung.
- **Formel:** `=WENN(UND(B2>=100000;C2>=0.9);"Bonus";"kein Bonus")`
- **Auflösung:** Bonus. UND ist nur WAHR, wenn alle Bedingungen erfüllt sind.
- **Bio-Link an diesem Tag:** Lernpfad Basis
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Zwei Bedingungen in einem WENN: =WENN(UND(B2>=100000;C2>=0.9);"Bonus";"kein Bonus"). Kommt in Einstellungstests oft vor. Link in Bio.
#excel #einstellungstest #exceltipps #kvlehre #bewerbung
```

Threads:
```
Formel des Tages: WENN mit UND. =WENN(UND(B2>=100000;C2>=0.9);"Bonus";"kein Bonus"). Mit ODER reicht eine erfüllte Bedingung.
```

## FdT-9 Text verbinden · Mi 11.11.

- **Hook (Sekunde 0 bis 2):** Vorname und Name in eine Zelle?
- **Textzeilen:** 1) Kein Copy-Paste, keine Zusatzspalte zum Abtippen. 2) Das &-Zeichen verbindet Text. 3) Das Leerzeichen steht in Anführungszeichen.
- **Formel:** `=A2&" "&B2`
- **Auflösung:** Anna Muster. Mit & hängst du Zellen und Text aneinander.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Vorname und Name verbinden: =A2&" "&B2. Das Leerzeichen dazwischen nicht vergessen. Speichern. Link in Bio.
#excel #exceltipps #bürojob #kvlehre #excellernen
```

Threads:
```
Formel des Tages: =A2&" "&B2 macht aus «Anna» und «Muster» «Anna Muster». Wer nutzt noch VERKETTEN?
```

## FdT-10 XVERWEIS (Zertifikat SIZ AU4) · Do 12.11. · Feature

- **Hook (Sekunde 0 bis 2):** Kommt im SIZ AU4: XVERWEIS.
- **Textzeilen:** 1) Die Suchspalte steht rechts? 2) SVERWEIS kann das nicht, XVERWEIS schon. 3) Exakte Suche ist Standard.
- **Formel:** `=XVERWEIS(E2;B2:B9;A2:A9)`
- **Auflösung:** A-300. Suchkriterium, Suchbereich, Rückgabebereich. In jede Richtung.
- **Bio-Link an diesem Tag:** /zertifikate/
- **Audio:** Trending-Audio in der App wählen

Caption:
```
SIZ AU4, PU41, MOS MO-210 oder MO-211? Für alle vier gibt es jetzt eine Vorbereitung, je 3 Tage gratis. Und ein Hinweis zum ICDL. Link in Bio.
#excel #siz #zertifikat #weiterbildungschweiz #exceltipps
```

Threads:
```
Formel des Tages: =XVERWEIS(E2;B2:B9;A2:A9) sucht auch nach links. Gehört zum Stoff von SIZ AU4 (Kapitel Berechnungen).
```

## FdT-11 SUMMEWENNS · Fr 13.11.

- **Hook (Sekunde 0 bis 2):** Kosten der KST 410, nur im März?
- **Textzeilen:** 1) Zwei Bedingungen gleichzeitig. 2) Zuerst kommt der Summenbereich. 3) Dann Paare aus Bereich und Kriterium.
- **Formel:** `=SUMMEWENNS(D:D;A:A;"KST 410";B:B;"Mär")`
- **Auflösung:** Summe März. Bei SUMMEWENNS steht der Summenbereich vorne, bei SUMMEWENN hinten.
- **Bio-Link an diesem Tag:** Lernpfad Accounting
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Kosten nach Kostenstelle und Monat: =SUMMEWENNS(D:D;A:A;"KST 410";B:B;"Mär"). Achtung: Summenbereich vorne. Link in Bio.
#excel #controlling #monatsabschluss #buchhaltung #exceltipps
```

Threads:
```
Formel des Tages: Bei SUMMEWENNS kommt der Summenbereich zuerst, bei SUMMEWENN zuletzt. Wer hat sich schon vertan?
```

## FdT-12 GLÄTTEN · Sa 14.11.

- **Hook (Sekunde 0 bis 2):** SVERWEIS findet «Bern» nicht?
- **Textzeilen:** 1) In der Zelle steht «Bern » mit Leerzeichen. 2) Unsichtbar, aber für Excel ein anderer Text. 3) GLÄTTEN räumt auf.
- **Formel:** `=GLÄTTEN(A2)`
- **Auflösung:** Bern. GLÄTTEN entfernt Leerzeichen am Anfang, am Ende und doppelte dazwischen.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
#NV, obwohl der Wert dasteht? Oft ist es ein Leerzeichen. =GLÄTTEN(A2) räumt auf. Link in Bio.
#excel #exceltipps #datenbereinigung #bürojob #excellernen
```

Threads:
```
Formel des Tages: =GLÄTTEN(A2). Wenn SVERWEIS #NV liefert, obwohl der Wert dasteht, ist es oft ein unsichtbares Leerzeichen.
```

## FdT-13 F4 und Zell-Klick · So 15.11. · Feature

- **Hook (Sekunde 0 bis 2):** Eine Taste statt vier Dollarzeichen.
- **Textzeilen:** 1) Cursor in den Bezug, F4 drücken. 2) B3 wird $B$3, dann B$3, dann $B3. 3) In Excel-Drills: Zelle anklicken, ziehen, F4.
- **Formel:** `=B2*$C$1`
- **Auflösung:** $C$1 fix. Mac: Cmd+T. In der App fügt ein Klick auf die Zelle den Bezug ein, wie in Excel.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
F4 setzt die $-Zeichen, Klick auf eine Zelle fügt den Bezug ein. Funktioniert jetzt auch in jeder Excel-Drills-Übung. Link in Bio.
#excel #exceltipps #shortcuts #exceltricks #bürojob
```

Threads:
```
Formel des Tages: F4 im Bezug: B3, $B$3, B$3, $B3. Auf dem Mac Cmd+T. Welchen Shortcut nutzt du am meisten?
```

## FdT-14 MONATSENDE · Mo 16.11.

- **Hook (Sekunde 0 bis 2):** Letzter Tag des Monats, ohne Kalender.
- **Textzeilen:** 1) Beleg vom 14.03.2026. 2) Abgrenzung auf das Monatsende. 3) 0 heisst: gleicher Monat.
- **Formel:** `=MONATSENDE(A2;0)`
- **Auflösung:** 31.03.2026. 1 ist der nächste Monat, −1 der Vormonat. Auch im Februar richtig.
- **Bio-Link an diesem Tag:** Lernpfad Accounting
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Monatsende ohne Kalender: =MONATSENDE(A2;0). Mit 1 bekommst du das Ende des Folgemonats. Link in Bio.
#excel #buchhaltung #monatsabschluss #controlling #exceltipps
```

Threads:
```
Formel des Tages: =MONATSENDE(A2;0) gibt den letzten Tag des Monats, auch im Schaltjahr-Februar.
```

## FdT-15 Runden statt nur formatieren · Di 17.11.

- **Hook (Sekunde 0 bis 2):** Excel zeigt 33.33, rechnet aber mit 33.3333.
- **Textzeilen:** 1) 100 durch 3, dreimal. 2) Angezeigt: 33.33 + 33.33 + 33.33. 3) Summe: 100.00 statt 99.99.
- **Formel:** `=RUNDEN(B2/3;2)`
- **Auflösung:** 33.33. Das Zahlenformat ändert nur die Anzeige. RUNDEN ändert den Wert.
- **Bio-Link an diesem Tag:** App #runden-1
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Die Summe stimmt nicht mit den angezeigten Zahlen? Das Format rundet nur die Anzeige. =RUNDEN(B2/3;2) rundet den Wert. Link in Bio.
#excel #rechnungswesen #exceltipps #excelschweiz #buchhaltung
```

Threads:
```
Formel des Tages: Zahlenformat ist nicht RUNDEN. Wer Beträge weiterverrechnet, rundet mit =RUNDEN(Wert;2).
```

## FdT-16 Offene Posten zählen (Kampagne Tag 1) · Mi 18.11. · Feature

- **Hook (Sekunde 0 bis 2):** Dein erster Tag als Controllerin.
- **Textzeilen:** 1) Herr Steiner will wissen: Wie viele Rechnungen sind offen? 2) 8 Rechnungen, Status in D2:D9. 3) Das Kriterium «offen» steht in F2.
- **Formel:** `=ZÄHLENWENN($D$2:$D$9;F2)`
- **Auflösung:** 5. ZÄHLENWENN zählt Zeilen mit dem Kriterium. Der Bezug auf F2 macht die Formel wiederverwendbar.
- **Bio-Link an diesem Tag:** /kampagne/
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Tag 1 der Kampagne «Dein erster Monat als Controllerin»: offene Posten zählen mit ZÄHLENWENN. 8 Tage, 3 gratis. Link in Bio.
#excel #controlling #buchhaltung #berufseinstieg #exceltipps
```

Threads:
```
Formel des Tages: =ZÄHLENWENN($D$2:$D$9;F2). Kriterium als Bezug statt "offen" fest eingetippt, dann zählst du mit einem Klick auch «bezahlt».
```

## FdT-17 Tage bis Fälligkeit · Do 19.11.

- **Hook (Sekunde 0 bis 2):** Wie viele Tage bis zur Fälligkeit?
- **Textzeilen:** 1) Datum minus Datum ergibt Tage. 2) HEUTE() ist immer das aktuelle Datum. 3) Negativ heisst: überfällig.
- **Formel:** `=B2-HEUTE()`
- **Auflösung:** 12 Tage. Zelle als Zahl formatieren, sonst zeigt Excel ein Datum an.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Tage bis zur Fälligkeit: =B2-HEUTE(). Negativ heisst überfällig. Zelle als Zahl formatieren. Link in Bio.
#excel #exceltipps #buchhaltung #debitoren #bürojob
```

Threads:
```
Formel des Tages: =B2-HEUTE() ergibt die Tage bis zur Fälligkeit. Zeigt Excel ein Datum an? Format auf Zahl stellen.
```

## FdT-18 Duplikate finden · Fr 20.11.

- **Hook (Sekunde 0 bis 2):** Belegnummer doppelt verbucht?
- **Textzeilen:** 1) 500 Zeilen, irgendwo ein Duplikat. 2) Hilfsspalte mit ZÄHLENWENN. 3) Der Bereich braucht $.
- **Formel:** `=ZÄHLENWENN($A$2:$A$500;A2)>1`
- **Auflösung:** WAHR. WAHR heisst: kommt mehrfach vor. Danach nach WAHR filtern.
- **Bio-Link an diesem Tag:** Lernpfad Accounting
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Doppelte Belegnummern finden: =ZÄHLENWENN($A$2:$A$500;A2)>1 in eine Hilfsspalte, dann nach WAHR filtern. Link in Bio.
#excel #buchhaltung #controlling #exceltipps #monatsabschluss
```

Threads:
```
Formel des Tages: =ZÄHLENWENN($A$2:$A$500;A2)>1 markiert jede Belegnummer, die mehrfach vorkommt.
```

## FdT-19 INDEX und VERGLEICH · Sa 21.11.

- **Hook (Sekunde 0 bis 2):** Kein XVERWEIS in deinem Excel?
- **Textzeilen:** 1) Ältere Versionen kennen XVERWEIS nicht. 2) VERGLEICH findet die Zeile. 3) INDEX holt den Wert.
- **Formel:** `=INDEX(A2:A9;VERGLEICH(E2;B2:B9;0))`
- **Auflösung:** A-300. Die 0 in VERGLEICH heisst: exakte Suche. Funktioniert in allen Versionen.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Kein XVERWEIS? =INDEX(A2:A9;VERGLEICH(E2;B2:B9;0)) sucht auch nach links und läuft in jeder Excel-Version. Link in Bio.
#excel #exceltipps #exceltricks #excellernen #bürojob
```

Threads:
```
Formel des Tages: INDEX/VERGLEICH, der Klassiker für alle ohne XVERWEIS: =INDEX(A2:A9;VERGLEICH(E2;B2:B9;0)).
```

## FdT-20 Erst rechnen, dann runden (Fehler-DNA) · So 22.11. · Feature

- **Hook (Sekunde 0 bis 2):** Machst du immer denselben Excel-Fehler?
- **Textzeilen:** 1) Die Fehler-DNA ordnet deine Fehler in 6 Kategorien. 2) Typisch Runden: zu früh gerundet. 3) Richtig: erst fertig rechnen, dann runden.
- **Formel:** `=VRUNDEN(B2*(1+$C$1);0.05)`
- **Auflösung:** Runden zuletzt. Im Profil siehst du deine Fehlerquote pro Kategorie und welche Übungen heute fällig sind.
- **Bio-Link an diesem Tag:** App-Start (Profil)
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Welche Excel-Fehler machst du immer wieder? Die Fehler-DNA zeigt es nach 6 Kategorien, und die App holt fällige Übungen zurück. Link in Bio.
#excel #excellernen #lerntipps #exceltipps #weiterbildung
```

Threads:
```
Formel des Tages: =VRUNDEN(B2*(1+$C$1);0.05). Erst fertig rechnen, dann runden. Zu frühes Runden ist einer der häufigsten Fehler.
```

## FdT-21 Break-even (KI-Interview) · Mo 23.11. · Feature

- **Hook (Sekunde 0 bis 2):** «Warum liegt Ihr Break-even bei 1'800 Stück?»
- **Textzeilen:** 1) Fixkosten 90'000, Preis 120, variable Kosten 70. 2) Fixkosten durch Deckungsbeitrag. 3) Ganze Stück: aufrunden.
- **Formel:** `=AUFRUNDEN(B2/(B3-B4);0)`
- **Auflösung:** 1'800 Stück. Frau Keller fragt danach: Und bei 10 % tieferem Preis? Das KI-Interview gibt es mit Premium.
- **Bio-Link an diesem Tag:** /assessment/?rolle=consulting
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Break-even: =AUFRUNDEN(B2/(B3-B4);0). Und dann fragt Frau Keller: «Was passiert bei 10 % tieferem Preis?» Das KI-Interview nach dem Assessment, mit Premium. Link in Bio.
#excel #consulting #caseinterview #bewerbung #finance
```

Threads:
```
Formel des Tages: Break-even = Fixkosten / (Preis − variable Kosten): =AUFRUNDEN(B2/(B3-B4);0). Bei 10 % tieferem Preis steigt er von 1'800 auf 2'369 Stück.
```

## FdT-22 Wachstum pro Jahr (CAGR) · Di 24.11.

- **Hook (Sekunde 0 bis 2):** Von 2.0 auf 2.8 Mio. in 5 Jahren. Wie viel pro Jahr?
- **Textzeilen:** 1) Nicht 40 % durch 5. 2) Wachstum zinst sich auf. 3) Die 5. Wurzel aus dem Faktor.
- **Formel:** `=(C2/B2)^(1/5)-1`
- **Auflösung:** 7.0 % pro Jahr. CAGR: Endwert durch Anfangswert, hoch 1 durch Jahre, minus 1.
- **Bio-Link an diesem Tag:** Lernpfad Finance
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Durchschnittliches Wachstum pro Jahr: =(C2/B2)^(1/5)-1. Nicht 40 % durch 5 = 8 %, sondern 7.0 %. Link in Bio.
#excel #finance #consulting #exceltipps #banking
```

Threads:
```
Formel des Tages: CAGR =(C2/B2)^(1/5)-1. Von 2.0 auf 2.8 Mio. in 5 Jahren sind 7.0 % pro Jahr, nicht 8 %.
```

## FdT-23 Combined Ratio (Assessment Versicherung) · Mi 25.11. · Feature

- **Hook (Sekunde 0 bis 2):** Verdient die Versicherung an der Sparte?
- **Textzeilen:** 1) Schäden 6.2 Mio., Kosten 3.5 Mio. 2) Prämien 10 Mio. 3) Unter 100 % heisst: technisch Gewinn.
- **Formel:** `=(B2+C2)/D2`
- **Auflösung:** 97 %. Combined Ratio: Schäden plus Kosten durch Prämien. Teil des Assessments Versicherung.
- **Bio-Link an diesem Tag:** /assessment/?rolle=versicherung
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Combined Ratio: =(B2+C2)/D2. Unter 100 % verdient die Sparte technisch Geld. Das und mehr im Assessment Versicherung, gratis. Link in Bio.
#excel #versicherung #finance #bewerbung #einstellungstest
```

Threads:
```
Formel des Tages: Combined Ratio =(Schäden+Kosten)/Prämien. 6.2 + 3.5 auf 10 Mio. Prämie ergibt 97 %.
```

## FdT-24 Leasingrate mit RMZ · Do 26.11.

- **Hook (Sekunde 0 bis 2):** Auto für 30'000, 48 Monate, 3 %. Rate?
- **Textzeilen:** 1) Zins pro Monat: 3 % durch 12. 2) 48 Zahlungen. 3) Barwert negativ, dann ist die Rate positiv.
- **Formel:** `=RMZ(0.03/12;48;-30000)`
- **Auflösung:** CHF 664.03. RMZ(Zins pro Periode; Anzahl Perioden; Barwert). Zins und Perioden in derselben Einheit.
- **Bio-Link an diesem Tag:** Lernpfad Finance
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Leasingrate ausrechnen: =RMZ(0.03/12;48;-30000) ergibt CHF 664.03 pro Monat. Zins und Laufzeit immer in Monaten. Link in Bio.
#excel #finance #leasing #exceltipps #finanzen
```

Threads:
```
Formel des Tages: =RMZ(0.03/12;48;-30000) = 664.03. Häufigster Fehler: Jahreszins mit Monaten mischen.
```

## FdT-25 SUMMEWENN heisst GROUP BY (SQL-Drills) · Fr 27.11. · Feature

- **Hook (Sekunde 0 bis 2):** Du kannst SUMMEWENN? Dann kannst du fast SQL.
- **Textzeilen:** 1) SUMMEWENN rechnet eine Summe pro Formel. 2) GROUP BY rechnet alle Summen auf einmal. 3) Üben: SQL-Drills, noch Beta.
- **Formel:** `=SUMMEWENN(A:A;"Zürich";B:B)`
- **Auflösung:** GROUP BY ort. SELECT ort, SUM(umsatz) FROM verkauf GROUP BY ort. 41 Übungen bei SQL-Drills (Beta).
- **Bio-Link an diesem Tag:** sql-drills.onrender.com
- **Audio:** Trending-Audio in der App wählen

Caption:
```
SUMMEWENN in Excel ist GROUP BY in SQL. Wer weiter will: SQL-Drills, 41 Übungen im Browser, noch Beta. Link in Bio.
#excel #sql #daten #datenanalyse #weiterbildung
```

Threads:
```
Formel des Tages: =SUMMEWENN(A:A;"Zürich";B:B) ist in SQL SELECT ort, SUM(umsatz) FROM verkauf GROUP BY ort. SQL-Drills ist in der Beta.
```

## FdT-26 Anteil am Total · Reserve

- **Hook (Sekunde 0 bis 2):** Welche Filiale macht wie viel vom Umsatz?
- **Textzeilen:** 1) Umsatz durch Total. 2) Das Total ist immer dieselbe Zelle. 3) Also $ davor.
- **Formel:** `=B2/$B$6`
- **Auflösung:** 36.1 %. Mit $B$6 bleibt das Total beim Runterziehen fix. Prozentformat statt mal 100.
- **Bio-Link an diesem Tag:** App-Start
- **Audio:** Trending-Audio in der App wählen

Caption:
```
Anteil am Total: =B2/$B$6, als Prozent formatiert. Ohne $ verrutscht das Total beim Runterziehen. Link in Bio.
#excel #exceltipps #controlling #excellernen #bürojob
```

Threads:
```
Formel des Tages: =B2/$B$6. Ohne $ teilst du in der nächsten Zeile durch eine leere Zelle und bekommst #DIV/0!.
```
