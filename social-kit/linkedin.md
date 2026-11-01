# LinkedIn: 19 Posts

Format: Hook in Zeile 1, kurze Absätze, max. ~1'300 Zeichen, 3–5 Hashtags, ein CTA mit dem fertigen UTM-Link.
Link-Tipp: Den Link in den **ersten Kommentar** setzen und im Post «Link im ersten Kommentar» schreiben, wenn die Reichweite mit Link im Text sichtbar schlechter ist. Die Texte unten enthalten den fertigen Link direkt; je nach Variante in den ersten Kommentar verschieben.
UTM-Links pro Post: eingesetzt, Referenz in `utm.md` (`li-01` … `li-19`).
Bilder: `visuals/png/` (Angabe pro Post).

---

## LI-01 Launch aus Gründersicht
**Termin:** Di 3.11. · **Bild:** `linkedin-1-launch.png` · **Ziel:** Reichweite, Klicks · **Hashtags:** Set B
**Hinweis:** Zeile 1 ist bewusst ohne Zahl. Wenn du eine echte eigene Anekdote hast (z. B. konkreter Pflichtkurs), einsetzen; keine Zahl erfinden.

```
Ich habe im Job viele Excel-Schulungsvideos geschaut. Behalten habe ich erstaunlich wenig.

Im Konzern läuft Excel-Training meistens gleich: eine Lernplattform, viele Videos, ein Quiz mit Multiple Choice. Danach sitzt man vor der eigenen Tabelle und weiss nicht mehr, ob bei SVERWEIS zuerst die Matrix oder das Suchkriterium kommt.

Bei Sprachen läuft es längst anders: kurze Übungen, selbst antworten, sofort Feedback. Wie bei Duolingo.

Das habe ich für Excel gebaut: Excel-Drills.

So funktioniert es:
→ Du siehst eine kleine Tabelle aus dem Büroalltag
→ Du tippst die Formel selbst
→ Eine Formel-Engine rechnet sie und prüft das Ergebnis sofort

Konsequent für die Schweiz: deutsche Funktionsnamen, Semikolon, CHF, Rundung auf Rappen.

Stand heute:
• 42 Übungen in 4 Lernpfaden (Basis, Accounting & Controlling, Banking & Finance, Data & Reporting)
• 18 davon gratis, ohne Anmeldung
• Premium ab CHF 9 pro Monat, 14 Tage Geld-zurück-Garantie

Ich teste das vier Wochen öffentlich. Löse zwei, drei Übungen und sag mir ehrlich, was nervt.

Hier geht's los: https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-01
Launch-Code SVERWEIS20: 20 % auf Jahresabo und Lifetime, gültig bis 15.11.2026.

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

Du kannst SVERWEIS hier gratis üben, mit Sofort-Prüfung: https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-02#sverweis-1

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

Probier es mit einer Gratis-Übung: https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-03#summewenn-1

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

Wenn du gerade in einem Bewerbungsprozess bist: https://excel-drills.ch/pfad/basis.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-04

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

Zum Pfad: https://excel-drills.ch/pfad/accounting.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-05

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

Zum Pfad: https://excel-drills.ch/pfad/finance.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-06

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

Darauf habe ich Excel-Drills aufgebaut. Keine Videos, keine Multiple-Choice-Fragen. Tabelle, Aufgabe, Formel, Prüfung. 18 Übungen sind gratis, und die App lässt sich aufs Handy installieren; die Gratis-Übungen laufen auch offline.

Probier eine und schau, ob du sie ohne Nachschlagen schaffst: https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-07

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

Wenn du mithelfen willst: Löse zwei Übungen und sag mir, wo du hängen geblieben bist. https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-08

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

Wer es selbst tippen will, mit Sofort-Prüfung: https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-09-kommentar#runden-1
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
(Link nur im ersten Kommentar: «Wer üben will: https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-10-kommentar»)

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

Gratis ausprobieren: https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-11

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

Zur Site: https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-12

#BuildInPublic #SideProject #Gründen #Excel
```

---

# B2B-Posts (LI-13 bis LI-16)

Zielgruppen: HR/Recruiting, Berufsbildner, Teamleiter Controlling/Finance, Produkt. Hashtags: pro Post 4, B2B-Posts haben eigene Zusammenstellung (LI-13 und LI-14) bzw. Set C / Set A (LI-15, LI-16).
**Vor dem Posten prüfen:** Die Seiten `/assessment/` und `/upload/` müssen live sein (Assessments geplant ab ca. 8.11., siehe `docs/DIFFERENZIERUNG.md`). Sonst Termin verschieben, nicht auf eine tote Seite verlinken.

---

## LI-13 An HR/Recruiting: Excel im Lebenslauf
**Termin:** Mo 16.11. · **Bild:** keins oder neue Karte «Excel: gut» vs. 15-Minuten-Assessment · **Ziel:** Pilot-Anfragen (Mail an hallo@) · **Hashtags:** #Recruiting #HR #Excel #Personalgewinnung

```
«Excel: gute Kenntnisse». Das steht in fast jedem Lebenslauf. Geprüft hat es noch niemand.

Wer im Controlling oder Rechnungswesen einstellt, kennt die Lage: Im Gespräch klingt alles solide. Erst in der ersten Woche zeigt sich, ob jemand einen SVERWEIS sauber aufbaut oder auf 5 Rappen rundet.

Ein Excel-Test im Prozess würde das klären. Die meisten Tests prüfen aber einzelne Funktionen, nicht die Rolle.

Darum habe ich bei Excel-Drills Rollen-Assessments gebaut, bisher für Consulting und Accounting:
→ rund 15 Minuten
→ mehrere Aufgaben, die aufeinander aufbauen (kleines Modell statt Einzelformel)
→ Auswertung nach Fehlerart: Bezug, Rundung, Lookup, Logik
→ Kandidatinnen brauchen kein Konto

Das Assessment zeigt, was jemand an diesem Tag in dieser Aufgabe kann. Es ersetzt kein Gespräch und sagt nichts darüber, wie jemand im Job abschneidet. Es ist eine zusätzliche Information.

Angebot: Ich begleite einen Pilot mit 3 Firmen, gratis bis Ende November. Ihr bekommt die Ergebnisse als Tabelle, ich bekomme ehrliches Feedback.

Interesse? Mail an hallo@excel-drills.ch oder erst ansehen: https://excel-drills.ch/assessment/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-13

Wie prüft ihr Excel heute? Gar nicht, im Gespräch oder mit Test?

#Recruiting #HR #Excel #Personalgewinnung
```

---

## LI-14 An Berufsbildner und Berufsschulen
**Termin:** Mi 18.11. · **Bild:** keins · **Ziel:** Klassenanfragen (Mail an hallo@), Backlinks · **Hashtags:** #Berufsbildung #KV #Excel #Rechnungswesen
**Kalender-Hinweis:** LI-08 liegt am selben Tag, Verschiebung siehe `README.md`.

```
Wie lernen Lernende, eine Rechnung in Excel richtig aufzubauen? Meistens, indem man es ihnen zeigt. Besser ist: Sie tippen es selbst.

Ich habe Excel-Drills für genau diesen Moment gebaut. Die Lernenden sehen eine kleine Tabelle, schreiben die Formel selbst und bekommen sofort Rückmeldung. Im Browser, auf Deutsch, mit Semikolon und CHF.

Typische Aufgaben aus dem Büroalltag:
• Rechnung: Netto, MwSt, Brutto
• MwSt-Satz in eigener Zelle, mit absolutem Bezug
• Rappenrundung auf 5 Rappen
• SUMMEWENN und ZÄHLENWENN für Auswertungen
• Abweichung Budget/Ist

Die Prüfung rechnet das Ergebnis der Formel, bei vielen Übungen zusätzlich mit anderen Zahlen. Auswendig getippte Resultate fallen damit eher auf.

Für Schulen und Berufsschulen gilt:
→ Klassen sind gratis (Premium für alle Lernenden)
→ Trainer-Handouts als PDF sind dabei
→ Ein kurzes Mail genügt: Name der Schule und Anzahl Lernende an hallo@excel-drills.ch

Wenn es dir gefällt, freue ich mich über eine Verlinkung auf der Modulseite. Eine Bedingung ist das nicht.

Details: https://excel-drills.ch/premium.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-14

Welche Excel-Aufgabe scheitert in eurem Unterricht am häufigsten?

#Berufsbildung #KV #Excel #Rechnungswesen
```

---

## LI-15 An Teamleiter Controlling/Finance
**Termin:** Fr 20.11. · **Bild:** keins · **Ziel:** Teamanfragen (Mail an hallo@) · **Hashtags:** Set C

```
=SVERWEIS(D2;A2:B6;2) liefert eine Zahl. Im Monatsabschluss kann sie falsch sein, und niemand merkt es.

Das fehlende FALSCH am Schluss sucht ungefähr statt genau. Ohne Fehlermeldung. Wer das einmal in einer Abstimmung erlebt hat, weiss, wie viel Zeit das kostet.

Wie bringt man einem Team bei, solche Fehler zu vermeiden? Mit einem Video-Kurs bleibt wenig hängen. Mit einem Halbtagesworkshop fehlt danach die Übung.

Excel-Drills setzt auf Fehler-Feedback statt Video:
→ Mitarbeitende tippen die Formel selbst
→ Die Prüfung sagt sofort, ob das Ergebnis stimmt, auch mit anderen Zahlen
→ Aufgaben aus Controlling und Rechnungswesen: Abweichungen, Kostenstellen, offene Posten, Rundung auf 5 Rappen
→ Läuft im Browser, ohne Installation

Teampreis: ab 5 Personen CHF 39 pro Person und Jahr (statt CHF 49), eine Rechnung für alle, Trainer-Handouts inklusive. 14 Tage Geld-zurück-Garantie.

Ich bin ehrlich: Das Produkt ist neu. Darum suche ich Teams, die es ausprobieren und mir sagen, was fehlt.

Preise und Details: https://excel-drills.ch/premium.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-15
Oder direkt: hallo@excel-drills.ch

Welchen Excel-Fehler habt ihr im Team schon mal teuer gefunden?

#Excel #Controlling #Buchhaltung #Rechnungswesen
```

---

## LI-16 Produkt: Excel-Datei hochladen, Fehler sehen
**Termin:** Do 12.11. · **Bild:** Screenshot der Fehlerkarte (Beispieldatei, ohne echte Daten) · **Ziel:** Klicks auf die Upload-Seite · **Hashtags:** Set A
**Kalender-Hinweis:** LI-04 liegt am selben Tag, Verschiebung siehe `README.md`.
**Vor dem Posten:** Funktion muss live sein; Screenshot nur aus einer Testdatei.

```
Die meisten Online-Übungen für Excel prüfen im eigenen Raster. Mit echtem Excel hat das wenig zu tun.

Bei Excel-Drills geht es jetzt auch anders:

1) Aufgabe als Excel-Datei herunterladen
2) In deinem eigenen Excel lösen, mit deinen Shortcuts und deinen Gewohnheiten
3) Die Datei hochladen
4) Fehlerkarte ansehen: welche Zelle, welche Fehlerart, was fehlt

Geprüft werden Formeln und Werte. Typische Treffer:
• $ vergessen, die Formel verrutscht beim Runterziehen
• FALSCH fehlt im SVERWEIS
• Rundung stimmt nicht
• Bezug auf die falsche Zelle

Zum Datenschutz: Die Datei verlässt deinen Browser nicht. Sie wird lokal gelesen, nichts wird auf einen Server geladen.

Das ist der Weg, den ich weiter ausbauen will, Richtung Pivot und komplexere Modelle. Dein Feedback entscheidet, was zuerst kommt.

Probier es mit einer Aufgabe: https://excel-drills.ch/upload/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-16

Welche Fehlerart würdest du in deiner Datei am ehesten erwarten?

#Excel #ExcelTipps #Weiterbildung #Lernen
```

---

# Differenzierer-Posts (LI-17 bis LI-19)

Stand 1.11.2026. Themen: Zertifikats-Vorbereitung mit ICDL-Hinweis, Datei-Prüfung für Ausbildner, KI-Interview. Termine sind Vorschläge (Kalender in `README.md`).

---

## LI-17 Zertifikate: ICDL ausgesetzt, was jetzt?
**Termin:** Mo 9.11. (LinkedIn-Tag frei) · **Bild:** `visuals/png/instagram/c11-s2.png` (ICDL-Hinweis) oder keins · **Ziel:** Klicks auf `/zertifikate/` · **Hashtags:** #Excel #Weiterbildung #KV #Berufsbildung
**Vor dem Posten:** ICDL-Status und Preise auf `zertifikate/index.html` gegenprüfen (Stand 1.11.2026, Quellen siz.ch, learn.microsoft.com, xcdl.ch).

```
Wer in der Schweiz Excel-Kenntnisse belegen wollte, hat lange das ICDL gemacht. Das geht zurzeit nicht.

Die Schweizer Lizenznehmerin meldet, dass der Prüfungsbetrieb nach einer gerichtlichen Anordnung zur Marke vorübergehend unterbrochen ist. Neue ICDL-Zeugnisse werden nicht ausgestellt (Stand 1.11.2026, Quelle: xcdl.ch).

Was bleibt, wenn man jetzt ein Excel-Zertifikat braucht:
→ SIZ AU4 Tabellen: der Schweizer Büro-Standard, CHF 110 an einer Partnerschule
→ SIZ PU41 Power-User: für Finanz- und Rechnungswesen, laut Kursanbietern Zulassungsvoraussetzung für den Fachausweis
→ MOS Excel Associate (MO-210) und Expert (MO-211): international, 50 Minuten praktisch in Excel

Ich habe für alle vier eine Vorbereitungsseite gebaut. Ehrlich abgegrenzt: Excel-Drills trainiert den Funktionsteil, mit deutschen oder englischen Funktionsnamen. Pivot, Diagramme, Drucklayout oder Power Query übt man in Excel selbst; dafür gibt es pro Zertifikat eine Checkliste.

Pro Zertifikat eine Kampagne, Tag 1 bis 3 gratis: https://excel-drills.ch/zertifikate/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-17

Welches Zertifikat verlangt ihr bei Bewerbungen, oder ist es euch egal?

#Excel #Weiterbildung #KV #Berufsbildung
```

---

## LI-18 Für Ausbildner: Lernende lösen in echtem Excel, die Fehlerkarte zeigt den Rest
**Termin:** Mi 4.11. (LinkedIn-Tag frei; Woche 1 hat damit LI-01, LI-18, LI-02) · **Bild:** `visuals/png/instagram/c8-s3.png` (Fehlerkarte, Beispieldaten) · **Ziel:** Klicks auf `/upload/`, Klassenanfragen · **Hashtags:** #Berufsbildung #KV #Excel #Ausbildung
**Abgrenzung zu LI-16:** LI-16 spricht Einzelpersonen an, LI-18 Berufsbildner und Lehrpersonen. Ein CTA: die Upload-Seite.

```
Wer Lernende in Excel ausbildet, kennt das: Die Formel stimmt im Übungsblatt. In der echten Datei des Betriebs nicht mehr.

Darum gibt es bei Excel-Drills jetzt eine Prüfung für echte Excel-Dateien:
1) Lernende laden eine Aufgabe als xlsx herunter
2) Sie lösen sie in Excel, mit den Tasten und Gewohnheiten, die sie im Betrieb brauchen
3) Sie laden die Datei hoch und sehen eine Fehlerkarte: welche Zelle, welcher Fehler, was fehlt

Erkannt werden die Klassiker aus dem Lehralltag: Wert eingetippt statt Formel, englischer Funktionsname, $ fehlt beim festen Bezug, Bereich zu kurz, FALSCH fehlt im SVERWEIS, Text ohne Anführungszeichen. Zu jedem Fehler kommt ein Lerntipp und die passende Übung.

Für den Datenschutz wichtig: Die Datei verlässt den Browser nicht. Sie wird auf dem Gerät gelesen, nichts wird hochgeladen oder gespeichert.

Aktuell 5 Aufgaben: SVERWEIS, SUMMEWENN, MwSt mit $-Bezug, WENN, ZÄHLENWENN. Ich baue weiter aus und frage darum: Welche Aufgabe fehlt in eurem Unterricht?

Ausprobieren: https://excel-drills.ch/upload/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-18

#Berufsbildung #KV #Excel #Ausbildung
```

---

## LI-19 KI-Interview: Frau Keller fragt nach dem Modell
**Termin:** Mo 23.11. (Vorschlag; LI-10 Poll dafür auf Mo 30.11. verschieben oder streichen) · **Bild:** `visuals/png/instagram/c9-s4.png` (Dialog) · **Ziel:** Assessment-Starts, Premium · **Hashtags:** #Consulting #Bewerbung #Excel #CaseInterview
**Vor dem Posten:** Interview-Box live prüfen (Premium-Regel, Rollen, Anzahl Runden). Keine Aussagen über Vorhersagekraft, kein «validiert».

```
«Ihr Break-even liegt bei 1'800 Stück. Was passiert, wenn der Preis um 10 % sinkt?»

So fragt Frau Keller. Sie ist eine KI-Interviewerin und Teil von Excel-Drills.

Die Idee kommt aus Case-Interviews: Die Formel richtig zu tippen ist das eine. Im Gespräch zählt, ob man das eigene Modell erklären kann. Warum diese Zahl? Was ändert sich bei einer anderen Annahme? Wie sagt man das einer Geschäftsleitung in zwei Sätzen?

So läuft es:
→ Zuerst das Excel-Assessment lösen (Consulting, Accounting und drei weitere Rollen, gratis)
→ Danach stellt Frau Keller (Consulting) oder Herr Bianchi (Accounting) Rückfragen zu den eigenen Zahlen
→ Höchstens 6 Fragen, dann ein Fazit zu Struktur, Zahlenverständnis, Annahmen und Kommunikation

Die Interviewerin verrät keine Lösungen, sie fragt nach dem Gedankengang. Das Interview ist Teil von Premium, das Assessment davor bleibt gratis.

Ehrlich gesagt: Das ist ein Übungsgespräch, keine Eignungsdiagnostik. Es zeigt, wo man beim Erklären noch hängt.

Assessment starten: https://excel-drills.ch/assessment/?rolle=consulting&utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-19

Welche Rückfrage hat dich in einem Interview schon mal kalt erwischt?

#Consulting #Bewerbung #Excel #CaseInterview
```
