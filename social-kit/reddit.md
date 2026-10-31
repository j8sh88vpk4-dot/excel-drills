# Reddit: 5 Posts mit Antwortvorlagen

## Grundregeln für Reddit

- **Regeln jedes Subreddits vor dem Posten lesen** (Sidebar / «About» / Wiki). Die automatische Prüfung am 30.10.2026 ist gescheitert (siehe «Regel-Prüfung» unten), die Hinweise pro Post sind deshalb weiterhin **nicht verifiziert**. Darum gilt für jeden Post: **zuerst Modmail**, erst nach Antwort posten (Vorlage unten).
- **Offen als Selbstpromo kennzeichnen.** Erster Satz: «Disclaimer: Ich habe das gebaut.» Reddit straft verdeckte Werbung härter als offene.
- **Mehrwert im Post selbst.** Der Post muss ohne Klick nützlich sein (Tipp, Erkenntnis, Frage). Link am Ende, einmal.
- **Konto-Hygiene.** Mit einem Konto posten, das schon normal kommentiert hat. Ein frisches Konto, das nur Links postet, wird oft automatisch entfernt. Faustregel vieler Subs: max. 10 % eigene Inhalte.
- **Kein Cross-Posting am selben Tag.** Mindestens 3–4 Tage Abstand zwischen den Subreddits.
- **2 Stunden nach dem Post präsent bleiben** und jede Frage beantworten. Kritik nicht verteidigen, sondern bedanken und konkret fragen.
- **Links mit UTM** aus `utm.md` (`utm_source=reddit`, `utm_content=<subreddit>`). Reddit-Nutzer sehen UTM-Parameter; wenn das stört, kürzen auf `?ref=reddit`.

---

## Regel-Prüfung (Stand 30.10.2026)

**Ergebnis: Keine Regelseite war abrufbar.** Reddit blockiert automatisierte Abrufe; die Regeln müssen vor dem Posten von Hand im Browser gelesen werden (eingeloggt, Desktop-Ansicht, Abschnitt «Rules» in der Sidebar plus Wiki).

| Subreddit | Geprüfte Quelle | Prüfdatum | Ergebnis |
|---|---|---|---|
| r/de_EDV | `reddit.com/r/de_EDV/about/rules` (WebFetch und curl) | 30.10.2026 | **Nicht abrufbar** (WebFetch: Domain gesperrt; curl: Bot-Prüfseite statt Regeln). Websuche fand keine Regeltexte. |
| r/Finanzen | `reddit.com/r/Finanzen/about/rules` | 30.10.2026 | **Nicht abrufbar** (wie oben). Websuche fand keine Regeltexte. |
| r/Schweiz | `reddit.com/r/Schweiz/about/rules` | 30.10.2026 | **Nicht abrufbar** (wie oben). Websuche fand keine Regeltexte. |
| r/excel | `reddit.com/r/excel/about/rules`, Wiki `submission-rules` und `flair` | 30.10.2026 | **Nicht abrufbar** (wie oben). Nur **indirekte Hinweise** aus Suchtreffer-Auszügen von Reddit-Spiegelseiten (nicht geöffnet, Alter unklar): Flair «Show and Tell» sei nur durch Mods vergebbar (per Modmail anfragen); Show-and-Tell-Posts müssen die Methode erklären, nicht nur das Ergebnis zeigen; Selbstpromo richte sich nach den Reddit-Regeln, Spam werde entfernt; «Pro Tip» für geteiltes Wissen. **Vor dem Posten am Original prüfen.** |
| r/Buchhaltung | `reddit.com/r/Buchhaltung/about/rules` | 30.10.2026 | **Nicht abrufbar**, auch nicht, ob das Sub existiert und aktiv ist. Websuche ohne Treffer. Alternativen ebenfalls ungeprüft: r/Controlling, r/Steuern (nur thematisch passend), englisch r/Accounting. |
| Reddit allgemein | `support.reddithelp.com` Artikel zu Spam/Selbstpromo | 30.10.2026 | **Nicht abrufbar** (HTTP 403). Sekundärquellen nennen die bekannte Faustregel «höchstens ca. 10 % eigene Inhalte»; nicht offiziell bestätigt. |

**Was das für die Posts heisst** (konservativ, bis die Regeln von Hand geprüft sind):
1. **Modmail vor jedem Post**, bei r/Finanzen und r/excel zwingend. Ohne Antwort nach 48 h: nicht als eigener Post, nur als hilfreicher Kommentar in einem passenden Thread.
2. **Kein Link im Titel**, Link einmal am Ende des Textes. Ist laut Regeln kein Link erlaubt: Link weglassen, «Link auf Nachfrage per DM» bzw. Name der Seite nennen, oder Link im ersten eigenen Kommentar, falls dort erlaubt.
3. **Flair** nur aus der Liste wählen, die das Sub beim Posten anbietet; die Flair-Angaben unten sind Vorschläge.
4. **Selbstpromo-Quote:** Konto vorher mit normalen Kommentaren aktiv nutzen; pro Subreddit höchstens 1 Post im Testzeitraum.
5. Nach der Handprüfung diese Tabelle nachführen: Spalte «Ergebnis» mit den tatsächlichen Regeln und Datum ersetzen.

**Modmail-Vorlage (DE):**
```
Hallo Mods

Ich habe ein eigenes Nebenprojekt gebaut: Excel-Übungen auf Deutsch, die im Browser geprüft werden (18 von 42 Übungen gratis, Rest kostenpflichtig). Ich würde es gerne hier als Beitrag zur Diskussion stellen, mit Disclaimer und Inhalt, der auch ohne Klick nützlich ist.

Ist das erlaubt? Wenn ja: mit welchem Flair, und darf der Link in den Beitrag oder nur in einen Kommentar?

Danke und Gruss
Luca
```

**Modmail template (EN, r/excel):**
```
Hi mods,

I built a browser-based practice tool for German-locale Excel (formulas are evaluated with HyperFormula, results are compared, not the text). Part of it is paid. I'd like to post it for feedback on the formula checking and explain how the checker works.

Is that allowed here, and if so, could you assign the Show and Tell flair (or tell me which flair to use)? Link in the post or only in a comment?

Thanks,
Luca
```

---

## RD-01 r/de_EDV
**Termin:** Do 5.11. · **Flair:** falls vorhanden «Software» / «Diskussion» · **Ziel:** Feedback + erste Nutzer

**Regel-Hinweis (Prüfung 30.10.2026: Regeln nicht abrufbar):** r/de_EDV ist ein IT-/Support-Sub. Vorher Modmail (Vorlage oben). Prüfen, ob Eigenwerbung erlaubt ist oder nur in einem Sammelthread. Wenn verboten: Stattdessen als Frage posten («Wie lernt ihr Leuten im Büro Excel bei?») und Tool nur auf Nachfrage in den Kommentaren nennen.

**Titel:**
```
Ich habe einen Excel-Übungstrainer auf Deutsch gebaut (Formeln werden im Browser geprüft) – Feedback erwünscht
```

**Text:**
```
Disclaimer: Das ist mein eigenes Projekt.

Hintergrund: Ich arbeite bei einem Versicherer in der Strategie und sehe oft, dass Excel-Schulungen aus Videos bestehen. Danach kann man Funktionen wiedererkennen, aber nicht selbst schreiben. Also habe ich etwas gebaut, das eher wie Vokabeltraining funktioniert.

Wie es technisch läuft:
- Statische Site, die Übungen sind JSON (Tabelle, Aufgabe, Zielzelle, Musterlösung)
- Die eingegebene Formel wird mit HyperFormula (deutsche Locale) berechnet, verglichen wird das Ergebnis, nicht der Text
- Bei vielen Übungen wird die Formel zusätzlich mit anderen Datensätzen gerechnet, damit fest eingetippte Ergebnisse oder zufällig passende Formeln auffallen
- Englische Funktionsnamen (VLOOKUP, SUM) werden erkannt und mit Hinweis auf den deutschen Namen beantwortet
- Kein Login, Fortschritt nur im localStorage

Stand: 42 Übungen, 18 davon gratis. Rest ist kostenpflichtig, weil ich testen will, ob das trägt.

Was mich interessiert:
1. Wo bricht die Formelprüfung? (Schreibweisen, die Excel akzeptiert, hier aber nicht)
2. Ist das für Leute, die ihr bei Excel unterstützt, brauchbar?

Link: https://excel-drills.ch/app/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=de-edv
```

---

## RD-02 r/Finanzen
**Termin:** Fr 20.11. (nur wenn Regeln es zulassen) · **Ziel:** Nutzer Finance-Pfad

**Regel-Hinweis (Prüfung 30.10.2026: Regeln nicht abrufbar):** Standard ist hier **kein eigener Post**, sondern nur der Kommentar-Weg, ausser die Mods bestätigen per Modmail ausdrücklich etwas anderes. r/Finanzen ist gross und moderiert streng; Eigenwerbung ist dort typischerweise nicht erlaubt bzw. nur in Sammelthreads (Daily/Weekly). **Empfehlung:** Nicht als eigener Post, sondern als hilfreicher Kommentar im Daily-Thread oder in einem passenden Thread zu Säule 3a / Sparplan / Kredit. Tool nur nennen, wenn es zur Frage passt, mit Disclaimer. Vorher Regeln prüfen.

**Titel (falls eigener Post erlaubt):**
```
Säule 3a, Leasing, Rente: Die 3 Excel-Formeln, mit denen man das selbst durchrechnet (ZW, RMZ, BW)
```

**Kommentar-Variante (Standard, ohne Link):**
```
Rechne das am besten selbst durch, das geht mit einer Formel. Deutsches Excel:
=ZW(3%;25;-7000) → Endwert, wenn du 25 Jahre lang CHF 7'000 pro Jahr einzahlst und 3 % Rendite annimmst (Einzahlung Ende Jahr, Minus, weil es ein Abfluss ist).
Rendite und Jahre kannst du anpassen. Keine Beratung, Steuern und Gebühren fehlen.
```
Den Tool-Link nur nennen, wenn jemand nachfragt, mit Disclaimer «eigenes Projekt».

**Text (nur falls eigener Post erlaubt):**
```
Disclaimer am Ende, erst der Inhalt.

Viele Fragen hier lassen sich mit drei Excel-Funktionen selbst durchrechnen. Deutsche Namen, Semikolon als Trenner:

1) Endwert eines Sparplans (ZW)
CHF 7'000 pro Jahr, 3 % Rendite, 25 Jahre, Einzahlung jeweils Ende Jahr:
=ZW(3%;25;-7000)
Minus vor dem Betrag, weil Excel Einzahlungen als Abfluss zählt.

2) Monatsrate eines Kredits/Leasings (RMZ)
CHF 30'000, 4.9 % p.a., 5 Jahre:
=-RMZ(4.9%/12;5*12;30000) → ca. CHF 564.76
Die üblichen Fehler: Zins nicht durch 12, Laufzeit in Jahren statt Monaten.

3) Barwert einer Rente (BW)
CHF 24'000 pro Jahr, 15 Jahre, 2 % Diskontsatz:
=BW(2%;15;-24000) → ca. CHF 308'382
Nützlich für die Frage «Rente oder Kapital?» als erste grobe Einordnung (keine Beratung, Steuern und Lebenserwartung fehlen hier).

Disclaimer: Ich habe eine Excel-Übungsseite auf Deutsch gebaut, auf der man solche Formeln mit Sofort-Prüfung üben kann. Die Finance-Übungen zu RMZ/BW/ZW sind dort kostenpflichtig, die Grundlagen gratis. Wer's ausprobieren will: https://excel-drills.ch/pfad/finance.html?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=finanzen
Die Formeln oben funktionieren natürlich auch ohne.
```

---

## RD-03 r/Schweiz
**Termin:** Mi 11.11. · **Flair:** z. B. «Diskussion» / «Projekt» · **Ziel:** Nutzer CH

**Regel-Hinweis (Prüfung 30.10.2026: Regeln nicht abrufbar):** Vorher Modmail. Prüfen, ob Eigenwerbung erlaubt ist und ob es einen Flair/Thread für eigene Projekte gibt. Ist ein Link im Post nicht erlaubt: den Link am Ende streichen und das Rätsel als Hauptinhalt stehen lassen. Ton: locker, selbstironisch, Schweizer Bezug klar. Nicht in Mundart schreiben, wenn es nicht natürlich wirkt.

**Titel:**
```
Ich habe Excel-Übungen mit Schweizer Konventionen gebaut (CHF, Rappenrundung, Hochkomma) – ehrliches Feedback?
```

**Text:**
```
Disclaimer: eigenes Nebenprojekt.

Mich hat genervt, dass Excel-Übungen online entweder auf Englisch sind (Komma statt Semikolon, VLOOKUP statt SVERWEIS) oder für Deutschland gemacht (1.250,50 statt 1'250.50).

Darum habe ich Excel-Drills gebaut: kleine Tabellen aus dem Büroalltag, du tippst die Formel, die Seite prüft sofort, ob das Ergebnis stimmt. Mit Schweizer Beispielen: Rundung auf 5 Rappen, MwSt, Prämien, Säule 3a.

- 42 Übungen, 18 gratis, ohne Konto
- Läuft im Browser, kein Excel nötig
- Premium kostet CHF 9/Monat; ich teste vier Wochen, ob überhaupt jemand das will

Kleines Rätsel für die, die nicht klicken wollen: Wie rundest du in Excel CHF 47.33 auf 5 Rappen? (Lösung in den Kommentaren)

https://excel-drills.ch/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=schweiz
```

**Erster eigener Kommentar (Lösung):**
```
Lösung: =RUNDEN(A1/0.05;0)*0.05 → 47.35
Kürzer: =VRUNDEN(A1;0.05)
```

---

## RD-04 r/excel (Englisch)
**Termin:** Di 24.11. · **Flair:** «Show and Tell» nur nach Modmail (laut indirekten Hinweisen vergeben das die Mods), sonst «Discussion» · **Ziel:** Technisches Feedback zur Engine, Backlinks

**Rule note (check 30.10.2026: rules page not reachable, only indirect hints from search snippets):** r/excel is primarily a help forum. Show and Tell posts reportedly must explain the method, not just show the result, and the flair is assigned by mods. **Send the modmail first** (template above). Do **not** post this as a question flair. The post below was extended with a short «How the checker works» section so it meets the method requirement.

**Title:**
```
I built a German-locale Excel practice tool (semicolons, SVERWEIS, CHF) – looking for feedback on the formula checking
```

**Text:**
```
Disclosure: this is my own project, and part of it is paid.

Context: I'm in strategy at a Swiss insurer. Most Excel practice sites are in English, which is a real hurdle for people working in a German-language Excel: different function names (SVERWEIS vs VLOOKUP, SUMMEWENN vs SUMIF) and semicolons instead of commas as argument separators.

So I built a small browser-based trainer:
- Each exercise is a tiny sheet + task + target cell
- Your formula is evaluated with HyperFormula (deDE locale); the result is compared, not the formula text, so any valid approach passes
- Many exercises re-evaluate your formula against alternate datasets to catch hardcoded values
- If you type English names (SUM, VLOOKUP), it tells you the German equivalent

How the checker works, in short:
1. The exercise sheet is loaded into HyperFormula with the deDE locale (function names and `;` as separator).
2. Your formula is written into the target cell and evaluated; the value is compared with the model solution's value (only a floating-point tolerance of 1e-9).
3. For many exercises the same formula is evaluated again on 1–3 alternate datasets, so a typed-in number or a formula that only fits by accident fails.
4. Unknown English function names are mapped to the German ones for the hint.

42 exercises, 18 free without signup. The site itself is in German.

What I'd value from this sub:
1. Edge cases where Excel would accept a formula but my checker doesn't (or vice versa)
2. Functions you think are missing for finance/accounting work

https://excel-drills.ch/app/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=excel

Happy to answer questions about the engine.
```

---

## RD-05 r/Buchhaltung (oder vergleichbar)
**Termin:** Mi 18.11. · **Ziel:** Nutzer Accounting-Pfad

**Regel-Hinweis (Prüfung 30.10.2026: Regeln nicht abrufbar, Existenz/Aktivität ungeprüft):** Vorher im Browser prüfen, ob r/Buchhaltung existiert, und Modmail. r/Buchhaltung ist (falls vorhanden) klein; prüfen, ob aktiv (letzte Posts < 1 Woche) und ob Eigenwerbung erlaubt ist. Alternativen: r/Controlling, r/Steuern (nur bei passendem Thema), r/WerWieWas nicht. Ausserhalb Reddit: Controlling-Gruppen auf LinkedIn, Rechnungswesen-Foren (TESTPLAN «2–3 Controlling-Foren/Gruppen»).

**Titel:**
```
Welche Excel-Formeln braucht ihr im Abschluss wirklich? Ich habe 11 Übungen gebaut und suche die Lücken
```

**Text:**
```
Disclaimer: Ich habe eine Excel-Übungsseite gebaut und will sie für Buchhaltung/Controlling besser machen.

Im Lernpfad «Accounting & Controlling» sind aktuell:
- Abweichung Budget/Ist in CHF und %
- Anteil einer Sparte am Total
- Netto aus Brutto (MwSt)
- Rundung auf 5 Rappen
- SUMMEWENNS nach Kostenstelle und Monat
- Doppelte Belegnummern markieren (ZÄHLENWENN)
- Soll = Haben prüfen
- Fehlende Buchung finden (Abstimmung)
- Offene Posten nach Alter einteilen
- Ablauf auf Monatsende (Abgrenzung mit MONATSENDE)

Die ersten 3 sind gratis, der Rest kostenpflichtig.

Meine Frage an euch: Was fehlt? Was macht ihr jeden Monat in Excel, das ihr Neuen immer wieder erklären müsst? Ich baue die meistgenannten als Nächstes.

Zum Anschauen: https://excel-drills.ch/pfad/accounting.html?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=buchhaltung
```

---

## Antwortvorlagen auf typische Kommentare

**«Warum nicht einfach YouTube?»**
```
Gute Frage, und YouTube ist super, um eine Funktion kennenzulernen. Mein Problem war: Nach dem Video konnte ich SVERWEIS wiedererkennen, aber nicht selbst schreiben. Hier tippst du die Formel selbst und siehst sofort, ob sie stimmt. Ergänzung, kein Ersatz.
```

**«Gibt's gratis bei Coddy» (oder anderen Gratis-Angeboten)**
```
Stimmt, Coddy hat gute Gratis-Übungen, schau sie dir an. Unterschied hier: deutsche Funktionsnamen mit Semikolon, Schweizer Beispiele (CHF, Rappen) und Pfade für Accounting und Finance. Die Grundlagen (18 Übungen) sind auch hier gratis.
```

**«Warum kostet das was?»**
```
Fair. 18 Übungen sind gratis und bleiben es. Für den Rest verlange ich CHF 9/Monat, weil ich in vier Wochen testen will, ob jemand bereit ist, dafür zu zahlen. Wenn nicht, ist das auch eine Antwort.
```

**«Das ist doch nur Werbung.»**
```
Ja, es ist mein Projekt, darum steht der Disclaimer oben. Ich habe versucht, den Post auch ohne Klick nützlich zu machen. Wenn das hier nicht passt, nehme ich ihn gerne runter.
```

**«Meine Formel ist richtig, wird aber als falsch markiert.»**
```
Danke, genau das suche ich! Welche Übung und welche Formel genau? Ich prüfe es und melde mich hier, sobald es gefixt ist.
```

**«Kann ich das mit englischem Excel nutzen?»**
```
Die Logik ist gleich, aber die Übungen erwarten deutsche Namen und Semikolon. Wenn du SUM oder VLOOKUP tippst, sagt dir die Übung den deutschen Namen. Für reines Englisch-Excel gibt es bessere englische Angebote.
```

**«Warum nicht XVERWEIS statt SVERWEIS?»**
```
XVERWEIS ist besser, keine Frage. Aber viele Firmen-Dateien und Einstellungstests verwenden noch SVERWEIS, und nicht alle haben eine Excel-Version mit XVERWEIS. Die SVERWEIS-Übungen verlangen deshalb bewusst SVERWEIS; XVERWEIS-Übungen sind auf der Liste.
```

**«Pivot/Power Query fehlt.»**
```
Richtig, Pivot und Power Query lassen sich im Browser nicht sinnvoll Formel für Formel prüfen. Der Pfad «Data & Reporting» deckt das Formelseitige ab und wächst weiter; welche Aufgabe würdest du dort als Nächstes üben wollen?
```

**«Wer steckt dahinter? Datenschutz?»**
```
Ich, Luca, als Nebenprojekt. Kein Login für die Gratis-Übungen, der Fortschritt bleibt in deinem Browser. Details im Impressum und in der Datenschutzerklärung auf der Seite.
```

**r/excel (EN): "Why not just use excel-practice-online / ExcelExercises?"**
```
Those are great if you work in English Excel. This one is specifically for German-locale Excel (function names, semicolons, CHF), which none of the English sites cover. Different audience.
```
