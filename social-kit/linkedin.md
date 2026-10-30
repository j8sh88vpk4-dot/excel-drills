# LinkedIn: 12 Posts

Format: Hook in Zeile 1, kurze Absätze, max. ~1'300 Zeichen, 3–5 Hashtags, ein CTA mit `{URL}`.
Link-Tipp: Den Link in den **ersten Kommentar** setzen und im Post «Link im ersten Kommentar» schreiben, wenn die Reichweite mit Link im Text sichtbar schlechter ist. Die Texte unten enthalten `{URL}` direkt; je nach Variante verschieben.
UTM-Links pro Post: siehe `utm.md` (`{URL_LI_01}` … `{URL_LI_12}`).
Bilder: `visuals/png/` (Angabe pro Post).

---

## LI-01 Launch aus Gründersicht
**Termin:** Di 3.11. · **Bild:** `linkedin-1-launch.png` · **Ziel:** Reichweite, Klicks · **Hashtags:** Set B
**Hinweis:** Zeile 1 ist bewusst ohne Zahl. Wenn du eine echte eigene Anekdote hast (z. B. konkreter Pflichtkurs), einsetzen; keine Zahl erfinden.

```
Ich habe im Job viele Excel-Schulungsvideos geschaut. Behalten habe ich erstaunlich wenig.

Im Konzern läuft Excel-Training meistens gleich: eine Lernplattform, viele Videos, ein Quiz mit Multiple Choice. Danach sitzt man vor der eigenen Tabelle und weiss nicht mehr, ob bei SVERWEIS zuerst die Matrix oder das Suchkriterium kommt.

Bei Sprachen hat sich längst etwas anderes durchgesetzt: kurze Übungen, selbst antworten, sofort Feedback. So wie bei Duolingo.

Genau das habe ich für Excel gebaut: Excel-Drills.

So funktioniert es:
→ Du siehst eine kleine Tabelle aus dem Büroalltag
→ Du tippst die Formel selbst
→ Eine Formel-Engine rechnet sie und prüft das Ergebnis sofort

Konsequent für die Schweiz: deutsche Funktionsnamen, Semikolon, CHF, Rundung auf Rappen.

Stand heute:
• 42 Übungen in 4 Lernpfaden (Basis, Accounting & Controlling, Banking & Finance)
• 18 davon gratis, ohne Anmeldung
• Premium ab CHF 9 pro Monat

Ich teste das jetzt vier Wochen öffentlich. Was ich brauche: Leute, die zwei, drei Übungen lösen und mir ehrlich sagen, was nervt.

Hier geht's los: {URL}

#Excel #Schweiz #Weiterbildung #KarriereSchweiz
```

---

## LI-02 «3 Fehler, die jeder in SVERWEIS macht» (Karussell-Textversion)
**Termin:** Do 5.11. · **Bild:** `linkedin-2-sverweis.png` (oder als PDF-Karussell aus IG-K1) · **Ziel:** Saves, Klicks auf sverweis-1 · **Hashtags:** Set A

```
SVERWEIS liefert ein Ergebnis. Leider oft das falsche.

Drei Fehler, die ich in fast jeder Tabelle sehe:

1) FALSCH vergessen
=SVERWEIS(D2;A2:B6;2)
Ohne viertes Argument sucht Excel ungefähr. Bei unsortierten Listen kommt dann ein Preis zurück, der zu einem anderen Artikel gehört. Ohne Fehlermeldung.
Richtig: =SVERWEIS(D2;A2:B6;2;FALSCH)

2) Matrix nicht fixiert
Du ziehst die Formel nach unten, aus A2:B6 wird A3:B7, dann A4:B8. Die letzten Zeilen finden nichts mehr.
Richtig: =SVERWEIS(D2;$A$2:$B$6;2;FALSCH)

3) Spaltenindex falsch gezählt
Der Index zählt ab der ersten Spalte der Matrix, nicht ab Spalte A. Beginnt die Matrix bei C, ist C die 1.

Bonus: Die Suchspalte muss ganz links in der Matrix stehen. Wenn nicht: XVERWEIS oder INDEX/VERGLEICH.

Das Tückische: Alle drei Fehler erzeugen keinen #NV. Die Zahl sieht plausibel aus.

Du kannst SVERWEIS hier gratis üben, mit Sofort-Prüfung: {URL}

Welcher der drei ist dir schon passiert?

#Excel #ExcelTipps #Weiterbildung #Lernen
```

---

## LI-03 Semikolon vs. Komma
**Termin:** Di 10.11. · **Bild:** `linkedin-3-semikolon.png` · **Ziel:** Kommentare · **Hashtags:** Set A

```
=SUMME(A1,A5) funktioniert bei dir nicht? Dann ist dein Excel nicht kaputt.

Die meisten Excel-Tutorials sind auf Englisch. Dort steht:
=SUMIF(A2:A10,"Zürich",B2:B10)

In einem deutschsprachigen Excel heisst das:
=SUMMEWENN(A2:A10;"Zürich";B2:B10)

Zwei Unterschiede:
→ Die Funktion hat einen deutschen Namen
→ Argumente werden mit Semikolon getrennt, nicht mit Komma

Warum? Im Englischen ist der Punkt das Dezimalzeichen, das Komma trennt Argumente. In Deutschland ist das Komma das Dezimalzeichen, also braucht es ein anderes Trennzeichen. Excel übernimmt das aus den Regionseinstellungen.

Kleine Schweizer Pointe: Bei uns ist der Punkt das Dezimalzeichen (1'250.50), das Semikolon bleibt trotzdem. Wer zwischen deutschen und Schweizer Dateien wechselt, kennt das Chaos.

Ich habe Excel-Drills deshalb konsequent auf Deutsch gebaut: deutsche Funktionsnamen, Semikolon, CHF. Tippst du aus Gewohnheit VLOOKUP, sagt dir die Übung, wie die Funktion auf Deutsch heisst.

Probier es mit einer Gratis-Übung: {URL}

Arbeitest du mit Excel auf Deutsch oder Englisch?

#Excel #ExcelTipps #Schweiz #Lernen
```

---

## LI-04 Einstellungstest-Angst
**Termin:** Do 12.11. · **Bild:** keins oder `square-quiz.png` · **Ziel:** Klicks Basis-Pfad · **Hashtags:** Set E

```
«Im zweiten Gespräch gibt es noch einen kurzen Excel-Test.»

Diesen Satz hören viele erst kurz vor dem Termin. Und dann beginnt das Videoschauen am Vorabend.

Was in typischen Excel-Einstellungstests vorkommt, ist überschaubar:
• SUMME, MITTELWERT, MAX/MIN
• WENN, auch verschachtelt
• SVERWEIS (oder XVERWEIS)
• SUMMEWENN und ZÄHLENWENN
• Absolute Bezüge mit $
• Manchmal RUNDEN und Prozentrechnung

Das Problem ist selten, dass man die Funktion nie gesehen hat. Das Problem ist, sie unter Zeitdruck selbst zu schreiben. Wiedererkennen ist leicht, selbst abrufen ist schwer.

Was hilft: dieselben Funktionen mehrmals selbst tippen, mit leicht anderen Aufgaben. Nicht zuschauen, schreiben.

Dafür habe ich den Lernpfad «Basis» gebaut: 15 Übungen zu genau diesen Funktionen, 10 davon gratis, ohne Anmeldung, im Browser. Du tippst die Formel, die Prüfung zeigt sofort, ob sie stimmt.

Wenn du gerade in einem Bewerbungsprozess bist: {URL}

Und wenn du jemanden kennst, der nächste Woche einen Excel-Test hat: Teil ihm den Link.

#Excel #Bewerbung #Einstellungstest #Berufseinstieg
```

---

## LI-05 Accounting-Pfad
**Termin:** Di 17.11. · **Bild:** `linkedin-4-accounting.png` · **Ziel:** Klicks Accounting, Premium · **Hashtags:** Set C

```
Im Monatsabschluss braucht niemand Pivot-Animationen. Man braucht 8 Formeln, die sitzen.

Ich habe mir angeschaut, was in Accounting und Controlling tatsächlich wiederkehrt. Daraus ist ein eigener Lernpfad entstanden, 11 Übungen:

• Abweichung Budget/Ist in CHF und in %
• Anteil einer Sparte am Total
• Netto aus Brutto (MwSt)
• Rundung auf 5 Rappen
• SUMMEWENNS nach Kostenstelle und Monat
• Doppelte Belegnummern markieren
• Soll = Haben prüfen
• Fehlende Buchung finden
• Offene Posten nach Alter einteilen
• Ablauf auf Monatsende (Abgrenzung)

Ein Beispiel, an dem viele hängen bleiben: Spesen auf 5 Rappen runden.
47.33 soll 47.35 werden, 47.32 soll 47.30 werden.
=RUNDEN(B2/0.05;0)*0.05
oder kürzer: =VRUNDEN(B2;0.05)

Die Prüfung rechnet deine Formel zusätzlich mit anderen Beträgen durch. Eine Formel, die nur zufällig für 47.33 stimmt, fällt auf.

Die ersten 3 Übungen sind gratis, der Rest ist Premium (CHF 9 pro Monat oder CHF 49 pro Jahr).

Zum Pfad: {URL}

Welche Formel fehlt dir in der Liste?

#Excel #Controlling #Buchhaltung #Rechnungswesen
```

---

## LI-06 Finance-Pfad (RMZ, Barwert)
**Termin:** Do 19.11. · **Bild:** `linkedin-5-finance.png` · **Ziel:** Klicks Finance, Premium · **Hashtags:** Set D

```
Wie hoch ist die Monatsrate für ein Leasing über CHF 30'000, 4.9 % Zins, 5 Jahre?

In Excel ist das eine Zeile:
=-RMZ(B2/12;C2*12;A2)
Ergebnis: rund CHF 564.76

Drei Stolpersteine bei RMZ:
→ Jahreszins nicht auf Monate umgerechnet (B2/12)
→ Laufzeit in Jahren statt in Raten (C2*12)
→ Vorzeichen: RMZ liefert Zahlungen negativ, deshalb das Minus

Ähnlich beim Barwert: Was ist eine Rente von CHF 24'000 pro Jahr über 15 Jahre heute wert, bei 2 % Diskontsatz?
=BW(B2;C2;-A2)
Ergebnis: rund CHF 308'382

Für diese Fälle habe ich den Lernpfad «Banking & Finance» gebaut, 11 Übungen:
Zins und Zinseszins, kumulierter Cashflow, Schadenquote, CAGR, Prämienstaffel, gewichtete Portfoliorendite, Break-even, RMZ, BW und ZW (z. B. Endwert Säule 3a).

Die ersten 3 sind gratis. Alle Beträge in CHF, alle Formeln auf Deutsch.

Zum Pfad: {URL}

#Excel #Finance #Banking #Versicherung
```

---

## LI-07 «Excel kann man nicht durch Zuschauen lernen»
**Termin:** Mi 25.11. · **Bild:** `story`-Motiv quer nicht nötig; ohne Bild · **Ziel:** Klicks · **Hashtags:** Set A

```
Excel kann man nicht durch Zuschauen lernen. Genauso wenig wie Velofahren.

Beim Tutorial passiert Folgendes: Die Person im Video tippt =SVERWEIS(…), alles klappt, und du denkst «klar, so geht das». Eine Woche später bist du unsicher, ob das dritte Argument die Spalte oder die Zeile ist.

Das ist kein persönliches Versagen. Die Lernforschung kennt das als Testeffekt (Retrieval Practice): Was du aktiv aus dem Gedächtnis holst, behältst du besser als das, was du nur noch einmal anschaust.

Für Excel heisst das:
1. Aufgabe lesen
2. Formel selbst tippen, ohne Vorlage
3. Sofort sehen, ob sie stimmt
4. Ein paar Tage später dieselbe Funktion in einem anderen Kontext

Videos sind gut, um eine Funktion kennenzulernen. Können entsteht beim Tippen.

Darauf habe ich Excel-Drills aufgebaut. Keine Videos, keine Multiple-Choice-Fragen. Tabelle, Aufgabe, Formel, Prüfung. 18 Übungen sind gratis.

Probier eine und schau, ob du sie ohne Nachschlagen schaffst: {URL}

#Excel #Lernen #Weiterbildung #ExcelTipps
```

---

## LI-08 Build in Public (Zwischenstand mit echten Zahlen)
**Termin:** Mi 18.11. · **Bild:** Screenshot Analytics (ohne Personendaten) · **Ziel:** Vertrauen, Kommentare · **Hashtags:** Set F
**Vor dem Posten:** Alle `{…}` mit echten Werten ersetzen. Wenn ein Wert nicht gemessen ist, Zeile streichen.

```
Zwei Wochen Excel-Drills. Hier sind die Zahlen, auch die unangenehmen.

Am 2. November habe ich eine Excel-Übungsplattform auf Deutsch online gestellt. Ziel für den 4-Wochen-Test: 500 Gratisnutzer oder 20 zahlende Kunden. Sonst stoppe ich oder baue um.

Stand {Datum}:
• {Nutzer} Personen haben mindestens eine Übung gestartet
• {Übungen gelöst} Übungen wurden korrekt gelöst
• {Abschlussquote} % kommen von Übung 1 bis Übung 10
• {Zahlende} zahlende Kunden
• Beste Quelle bisher: {Kanal}

Was ich gelernt habe:
→ {Learning 1, z. B. welche Übung am häufigsten abgebrochen wird}
→ {Learning 2, z. B. welches Feedback ich umgesetzt habe}
→ {Learning 3, z. B. was nicht funktioniert hat}

Was ich nächste Woche ändere: {konkrete Änderung}

Warum ich das öffentlich mache: Als Strategie-Mensch rate ich anderen täglich, Annahmen früh zu testen. Hier teste ich meine eigenen.

Wenn du mithelfen willst: Löse zwei Übungen und sag mir, wo du hängen geblieben bist. {URL}

#BuildInPublic #SideProject #Gründen #Schweiz
```

---

## LI-09 Mini-Quiz (Formelrätsel, Auflösung in den Kommentaren)
**Termin:** Fr 13.11. · **Bild:** `square-quiz.png` · **Ziel:** Kommentare (Reichweite) · **Hashtags:** Set A
**Ablauf:** Post ohne Link. Nach 3–4 Stunden Auflösung als Kommentar, dort den Link. Kommentar fixieren.

```
Freitagsrätsel für Excel-Leute. Ohne Excel öffnen.

In A2 steht: 1234.5678

Was liefert diese Formel?
=RUNDEN(A2;-2)

A) 1234.57
B) 1234.56
C) 1200
D) 1235

Antwort in die Kommentare. Die Auflösung kommt heute Nachmittag, mit einer Erklärung, warum das im Reporting nützlich ist.

#Excel #ExcelTipps #Lernen
```

**Auflösungs-Kommentar:**
```
Auflösung: C) 1200

Ein negatives zweites Argument rundet links vom Komma. -1 auf Zehner, -2 auf Hunderter, -3 auf Tausender.
=RUNDEN(1234.5678;2) → 1234.57
=RUNDEN(1234.5678;0) → 1235
=RUNDEN(1234.5678;-2) → 1200

Nützlich, wenn du im Management-Reporting auf Tausender runden willst: =RUNDEN(A2;-3)

Wer es selbst tippen will, mit Sofort-Prüfung: {URL}
```

---

## LI-10 Poll
**Termin:** Mo 23.11. · **Bild:** keins (LinkedIn-Umfrage) · **Ziel:** Kommentare, Lernpräferenzen · **Hashtags:** Set A
**Umfrage-Einstellung:** Dauer 1 Woche. Frage max. 140 Zeichen, Optionen max. 30 Zeichen.

**Umfragefrage:** `Wie hast du Excel hauptsächlich gelernt?`
**Optionen:**
1. `Videos / YouTube`
2. `Kurs oder Schule`
3. `Learning by Doing im Job`
4. `Ehrlich gesagt: gar nicht`

**Begleittext:**
```
Kurze Umfrage, weil mich die Antwort für mein Projekt wirklich interessiert.

Meine Vermutung: Die meisten haben Excel im Job gelernt, unter Zeitdruck, mit Google und einer Kollegin, die «kurz zeigt, wie das geht».

Das funktioniert. Aber es hinterlässt Lücken, die man erst bemerkt, wenn man die Stelle wechselt oder im Bewerbungsprozess einen Excel-Test bekommt.

Ich baue gerade Excel-Drills, kurze Excel-Übungen auf Deutsch mit Sofort-Prüfung. Die Antworten hier helfen mir zu entscheiden, wo ich als Nächstes Übungen baue.

Bonusfrage für die Kommentare: Welche Funktion hast du am längsten nicht verstanden?

#Excel #Weiterbildung #Lernen
```
(Link nur im ersten Kommentar: «Wer üben will: {URL}»)

---

## LI-11 Schweizer Eigenheiten (Hochkomma, CHF)
**Termin:** Do 26.11. · **Bild:** `linkedin-3-semikolon.png` wiederverwenden oder `square-quiz.png` neu texten · **Ziel:** Reichweite CH · **Hashtags:** Set B

```
1'250.50 oder 1.250,50? Wer in der Schweiz Excel lernt, lernt nebenbei ein Dialekt-Problem.

Fünf Schweizer Eigenheiten, die in deutschen Tutorials fehlen:

1) Das Hochkomma
Tausendertrennzeichen ist der Apostroph: 1'250'000. In Deutschland der Punkt.

2) Der Punkt als Dezimalzeichen
CHF 47.35, nicht 47,35. Wer eine deutsche Vorlage öffnet, sieht plötzlich Text statt Zahlen.

3) Das Semikolon bleibt trotzdem
=SUMMEWENN(A2:A10;"Bern";B2:B10). Deutsche Funktionsnamen, Semikolon als Trenner, auch in der Schweiz.

4) Rappenrundung
Bargeld rundet auf 5 Rappen. =VRUNDEN(B2;0.05) oder =RUNDEN(B2/0.05;0)*0.05

5) MwSt mit eigenen Sätzen
Netto aus Brutto: =B2/(1+C2), mit dem Satz in einer eigenen Zelle und absolutem Bezug, damit die nächste Satzänderung eine Zelle betrifft statt hundert Formeln.

Die meisten Excel-Übungen online sind auf Englisch oder für Deutschland gemacht. Ich habe Excel-Drills deshalb mit Schweizer Konventionen gebaut: CHF, Rappen, Punkt als Dezimalzeichen.

Gratis ausprobieren: {URL}

Welche Eigenheit fehlt in der Liste?

#Excel #Schweiz #Buchhaltung #ExcelTipps
```

---

## LI-12 Woche-4-Fazit
**Termin:** Fr 27.11. · **Bild:** Tabelle Ziel vs. Ist (Screenshot) · **Ziel:** Vertrauen, Folgekunden · **Hashtags:** Set F
**Vor dem Posten:** Alle `{…}` mit echten Werten ersetzen. Eine der drei Entscheid-Varianten wählen, die anderen löschen.

```
Vor vier Wochen habe ich mir eine klare Messlatte gesetzt. Heute ist Entscheidungstag.

Ziel für Excel-Drills bis 27.11.:
500 Gratisnutzer oder 20 zahlende Kunden.

Ergebnis:
• Gratisnutzer: {Nutzer}
• Zahlende Kunden: {Zahlende}
• Übungen korrekt gelöst: {Übungen gelöst}
• Von Übung 1 bis Übung 10: {Abschlussquote} %
• Bester Kanal: {Kanal}
• Schwächster Kanal: {Kanal schwach}

Was funktioniert hat: {1–2 Sätze}
Was nicht: {1–2 Sätze}

[Variante Go]
Entscheid: Ich mache weiter. Nächste Schritte: {z. B. Consulting-Pfad, 10 neue Übungen, Teamlizenzen}.

[Variante Grauzone]
Entscheid: Vier weitere Wochen, mit 10 zusätzlichen Übungen und neuen Artikeln. Dann entscheide ich erneut, nach denselben Kriterien.

[Variante No-Go]
Entscheid: Ich stoppe den Ausbau. Die Site bleibt online, die Gratis-Übungen bleiben gratis. Was ich mitnehme: {Learning}.

Danke an alle, die geübt, kommentiert und Fehler gemeldet haben. Besonders an {Anzahl} Personen, die mir ausführliches Feedback geschickt haben.

Zur Site: {URL}

#BuildInPublic #SideProject #Gründen #Excel
```
