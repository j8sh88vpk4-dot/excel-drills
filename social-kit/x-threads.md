# X (Twitter): 3 Threads, 10 Einzel-Tweets

Regeln: max. 280 Zeichen pro Tweet, Link nur im letzten Tweet eines Threads (Reichweite), 0–2 Hashtags. Links: `{URL_X_…}` aus `utm.md`.

---

## X-T1 Launch-Thread (Mo 2.11.)

**1/7**
```
Ich habe 4 Wochen Zeit, um herauszufinden, ob jemand für Excel-Übungen auf Deutsch zahlt.

Ziel: 500 Gratisnutzer oder 20 zahlende Kunden bis 27.11.

Hier ist, was ich gebaut habe und warum. 🧵
```
**2/7**
```
Das Problem: Excel-Training besteht meist aus Videos. Nach dem Video erkennst du SVERWEIS wieder. Selbst schreiben kannst du ihn trotzdem nicht.

Wiedererkennen ≠ abrufen.
```
**3/7**
```
Die Idee: Excel üben wie Vokabeln.

Kleine Tabelle aus dem Büroalltag, eine Aufgabe, du tippst die Formel, die Seite prüft sofort.

Keine Videos, kein Multiple Choice.
```
**4/7**
```
Geprüft wird das Ergebnis, nicht der Text. Eine Formel-Engine rechnet deine Formel wie Excel.

Bei vielen Übungen zusätzlich mit anderen Zahlen. Wer das Ergebnis fest eintippt, fällt auf.
```
**5/7**
```
Konsequent Deutsch und Schweiz:
• SVERWEIS statt VLOOKUP
• Semikolon statt Komma
• CHF, Rappenrundung, MwSt

Tippst du aus Gewohnheit SUM, sagt dir die Übung, dass es SUMME heisst.
```
**6/7**
```
Stand heute:
• 42 Übungen
• 4 Lernpfade: Basis, Accounting & Controlling, Banking & Finance
• 18 gratis, ohne Anmeldung
• Premium CHF 9/Monat, 49/Jahr, 149 einmalig
```
**7/7**
```
Ich poste hier jede Woche die echten Zahlen, auch wenn sie schlecht sind.

Wenn du zwei Übungen löst und mir sagst, was nervt, hilft mir das enorm:
{URL_X_T1}
```

---

## X-T2 SVERWEIS-Fehler-Thread (Mo 9.11.)

**1/6**
```
SVERWEIS gibt selten einen Fehler aus. Er gibt eine falsche Zahl aus, die plausibel aussieht.

4 Fehler, die ich ständig sehe: 🧵
```
**2/6**
```
1) FALSCH vergessen

=SVERWEIS(D2;A2:B6;2)

Ohne 4. Argument sucht Excel ungefähr. Bei unsortierten Listen bekommst du den Preis eines anderen Artikels.

Immer: =SVERWEIS(D2;A2:B6;2;FALSCH)
```
**3/6**
```
2) Matrix nicht fixiert

Formel nach unten ziehen → aus A2:B6 wird A3:B7, A4:B8 …

Die letzten Zeilen finden nichts mehr.

Fix: $A$2:$B$6 (F4 drücken).
```
**4/6**
```
3) Spaltenindex falsch gezählt

Der Index zählt ab der ersten Spalte der Matrix, nicht ab Spalte A.

Matrix C:F → C ist 1, D ist 2.
```
**5/6**
```
4) Suchspalte nicht links

SVERWEIS sucht nur in der ersten Spalte der Matrix und liefert nach rechts.

Steht der Schlüssel rechts: XVERWEIS oder INDEX/VERGLEICH.
```
**6/6**
```
Lesen hilft wenig, tippen hilft.

SVERWEIS-Übung mit Sofort-Prüfung, gratis, ohne Anmeldung:
{URL_X_T2}
```

---

## X-T3 Finance-Thread: 3 Formeln für Geldfragen (Do 19.11.)

**1/8**
```
3 Excel-Formeln, mit denen du die meisten privaten Geldfragen selbst durchrechnest.

Deutsche Namen, Semikolon, CHF. 🧵
```
**2/8**
```
1) RMZ: Monatsrate

Leasing CHF 30'000, 4.9 % p.a., 5 Jahre:
=-RMZ(4.9%/12;5*12;30000)
→ ca. CHF 564.76
```
**3/8**
```
Die zwei klassischen RMZ-Fehler:
• Jahreszins nicht durch 12 geteilt
• Laufzeit in Jahren statt in Monaten

Und das Minus: Excel gibt Zahlungen negativ aus.
```
**4/8**
```
2) ZW: Endwert eines Sparplans

CHF 7'000 pro Jahr, 3 %, 25 Jahre:
=ZW(3%;25;-7000)

Minus vor der Einzahlung, weil sie für dich ein Abfluss ist.
```
**5/8**
```
3) BW: Was ist eine Rente heute wert?

CHF 24'000/Jahr, 15 Jahre, 2 % Diskontsatz:
=BW(2%;15;-24000)
→ ca. CHF 308'382
```
**6/8**
```
Was die drei gemeinsam haben: Zins, Perioden, Zahlung, immer in derselben Zeiteinheit.

Monatsraten → Monatszins und Anzahl Monate. Hier passieren die meisten Fehler.
```
**7/8**
```
Wichtig: Das ist Rechnen, keine Beratung. Steuern, Gebühren und Inflation fehlen in diesen Formeln.

Aber für eine erste Einordnung reicht eine Zeile Excel.
```
**8/8**
```
Ich habe dazu einen Lernpfad «Banking & Finance» gebaut: 11 Übungen, 3 gratis.

{URL_X_T3}
```

---

## 10 Einzel-Tweets

**X-01** (Mi 4.11.)
```
Excel-Formel des Tages:

=RUNDEN(A2;-3)

Rundet auf Tausender. 1'234'567 → 1'235'000.

Ideal für Management-Reportings, in denen niemand Rappen sehen will.
```

**X-02** (Mi 4.11.)
```
Wenn =SUMME(A1,A5) nicht funktioniert: Dein Excel ist auf Deutsch.

Trennzeichen ist das Semikolon:
=SUMME(A1;A5)
```

**X-03** (Mo 9.11.)
```
Unterschätzte Taste in Excel: F4.

Cursor im Zellbezug, F4 drücken → A1 wird $A$1, dann A$1, dann $A1, dann wieder A1.

Verhindert die meisten kaputten Formeln beim Kopieren.
```

**X-04** (Mi 11.11.)
```
Auf 5 Rappen runden in Excel:

=VRUNDEN(B2;0.05)

47.33 → 47.35
47.32 → 47.30

Wer kein VRUNDEN hat: =RUNDEN(B2/0.05;0)*0.05
```

**X-05** (Mi 11.11.)
```
Wiedererkennen ist nicht Können.

Nach 10 Excel-Videos erkennst du SVERWEIS. Nach 10 selbst getippten SVERWEIS kannst du ihn.

Darum habe ich Excel-Drills gebaut: {URL_X_05}
```

**X-06** (Mo 16.11.)
```
Abweichung in Prozent, Budget vs. Ist:

=(C2-B2)/B2

Nicht *100 rechnen. Das Prozentformat macht Excel. Sonst steht in deinem Report -1'200 %.
```

**X-07** (Mo 16.11.)
```
Doppelte Belegnummern finden ohne Add-in:

=ZÄHLENWENN($A$2:$A$500;A2)>1

WAHR = Duplikat. Als bedingte Formatierung einsetzen, fertig.
```

**X-08** (Mo 23.11.)
```
Build in Public, Woche 3 von Excel-Drills:

{Nutzer} Personen haben geübt
{Übungen gelöst} Übungen gelöst
{Zahlende} zahlende Kunden

Ziel bis 27.11.: 500 / 20. Freitag entscheide ich.
```
*(Nur mit echten Zahlen posten.)*

**X-09** (Mo 23.11.)
```
Netto aus Brutto, Schweizer MwSt (Normalsatz 8.1 %):

=B2/(1+$C$1)

Satz in eine eigene Zelle, absolut bezogen. Bei der nächsten Satzänderung änderst du 1 Zelle statt 400 Formeln.
```

**X-10** (Fr 27.11.)
```
Heute ist Entscheidungstag für Excel-Drills.

Ziel war: 500 Gratisnutzer oder 20 Zahlende in 4 Wochen.
Ergebnis: {Nutzer} / {Zahlende}.

Entscheid und Learnings: {URL_X_10}
```
