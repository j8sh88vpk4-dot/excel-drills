from lib import *

# Ratgeber Excel-Einstellungstest, Stand 1. November 2026. Keine Aussagen über bestimmte Firmen,
# nur typische Inhalte und Formate. Beispielzahlen sind nachgerechnet.

T1 = tbl("Rechnungsliste in A1:C6, Auswertung in E1:F4", [
    ["Rechnung", "Kunde", "Betrag CHF", "", "Kennzahl", "Wert CHF"],
    ["R-2401", "Müller AG", "1'250.00", "", "Total", "!12'400.00"],
    ["R-2402", "Keller GmbH", "3'480.50", "", "Durchschnitt", "!2'480.00"],
    ["R-2403", "Brunner", "890.00", "", "Grösste Rechnung", "!5'120.00"],
    ["R-2404", "Müller AG", "5'120.00"],
    ["R-2405", "Huber AG", "1'659.50"],
])
T2 = tbl("Umsätze in A1:B7, Total pro Filiale in D1:E4", [
    ["Filiale", "Umsatz CHF", "", "Filiale", "Total CHF"],
    ["Bern", "18'400.00", "", "Bern", "!34'600.00"],
    ["Zürich", "24'750.50", "", "Zürich", "!46'050.50"],
    ["Bern", "16'200.00", "", "Basel", "!27'000.00"],
    ["Basel", "12'980.00"],
    ["Zürich", "21'300.00"],
    ["Basel", "14'020.00"],
])
T3 = tbl("Preisliste in A1:C5, Bestellung in E1:H2", [
    ["Art.-Nr.", "Bezeichnung", "Preis CHF", "", "Art.-Nr.", "Menge", "Preis CHF", "Betrag CHF"],
    ["A-100", "Ordner", "4.90", "", "A-120", "5", "!24.00", "!120.00"],
    ["A-110", "Locher", "18.50"],
    ["A-120", "Heftgerät", "24.00"],
    ["A-130", "Etiketten", "12.40"],
])
T4 = tbl("Pendenzenliste in A1:D7", [
    ["Pendenz", "Verantwortlich", "Status", "Hinweis"],
    ["P-11", "Gerber", "offen", "!nachfassen"],
    ["P-12", "Steiner", "erledigt", "!ok"],
    ["P-13", "Weber", "offen", "!nachfassen"],
    ["P-14", "Gerber", "in Arbeit", "!ok"],
    ["P-15", "Steiner", "offen", "!nachfassen"],
    ["P-16", "Weber", "erledigt", "!ok"],
])
T5 = tbl("Rechnungspositionen in A1:C4, MwSt-Satz in E2", [
    ["Position", "Netto CHF", "MwSt CHF", "", "MwSt-Satz"],
    ["Beratung", "1'200.00", "!97.20", "", "8.1%"],
    ["Material", "450.00", "!36.45"],
    ["Schulung", "2'380.00", "!192.78"],
])
PLAN = compare("7-Tage-Lernplan, 20 bis 30 Minuten pro Tag", ["Tag", "Thema", "Was du machst"], [
    ["Tag 1", "Grundrechenarten und SUMME", "Formeln mit <code>=</code>, <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code> und Klammern; <code>=SUMME(B2:B6)</code> auf eine Rechnungsliste anwenden"],
    ["Tag 2", "MITTELWERT, MIN, MAX, ANZAHL", "Kennzahlen zu einer Liste berechnen und prüfen, ob die Resultate plausibel sind"],
    ["Tag 3", "Absolute Bezüge", "Eine Formel mit festem Satz nach unten kopieren, <code>$</code> mit F4 setzen (<a href=\"../app/#absolut-1\">Übung absolute Bezüge</a>)"],
    ["Tag 4", "WENN", "Statuswerte und Schwellen prüfen, Text in Anführungszeichen (<a href=\"../app/#wenn-1\">Übung WENN</a>)"],
    ["Tag 5", "SVERWEIS", "Preise aus einer Preisliste holen, immer mit <code>FALSCH</code> (<a href=\"../app/#sverweis-1\">Übung SVERWEIS</a>)"],
    ["Tag 6", "SUMMEWENN, ZÄHLENWENN, Sortieren und Filtern", "Totale pro Filiale, offene Pendenzen zählen, eine Liste sortieren und filtern, ein Säulendiagramm einfügen"],
    ["Tag 7", "Probetest ohne Vorlage", "Die fünf Beispielaufgaben unten mit neuen Zahlen lösen, ohne nachzuschauen, mit Zeitlimit von 30 Minuten"],
])
CMP = compare("Testfunktionen auf Deutsch und Englisch", ["Deutsch", "Englisch", "macht …"], [
    ["SUMME", "SUM", "addiert Werte"],
    ["MITTELWERT", "AVERAGE", "berechnet den Durchschnitt"],
    ["MIN / MAX", "MIN / MAX", "kleinster und grösster Wert"],
    ["ANZAHL", "COUNT", "zählt Zellen mit Zahlen"],
    ["WENN", "IF", "prüft eine Bedingung"],
    ["SVERWEIS", "VLOOKUP", "sucht einen Wert in der ersten Spalte einer Tabelle"],
    ["SUMMEWENN", "SUMIF", "summiert Werte, die ein Kriterium erfüllen"],
    ["ZÄHLENWENN", "COUNTIF", "zählt Zellen, die ein Kriterium erfüllen"],
    ["RUNDEN", "ROUND", "rundet auf eine Anzahl Stellen"],
    ["FALSCH / WAHR", "FALSE / TRUE", "Wahrheitswerte, etwa im SVERWEIS"],
])

body = f'''      <h2>Warum Excel im Bewerbungsprozess geprüft wird</h2>
      <p>«Gute Excel-Kenntnisse» steht in vielen Stelleninseraten, vom KV über die Buchhaltung bis zum Controlling. Weil sich diese Angabe im Lebenslauf schlecht überprüfen lässt, setzen manche Arbeitgeber und Personalvermittler einen kurzen Excel-Test ein, sei es als Teil des Assessments, im Vorstellungsgespräch oder als Aufgabe für zu Hause. Wie ein solcher Test aussieht, ist von Firma zu Firma verschieden. Die Inhalte überschneiden sich aber stark, und genau darauf kannst du dich gezielt vorbereiten.</p>
      <p>Dieser Artikel zeigt, was typischerweise geprüft wird, in welchen Formaten Tests vorkommen, fünf Beispielaufgaben mit Lösung und einen Lernplan für sieben Tage.</p>

      <h2>Was in Excel-Einstellungstests typischerweise geprüft wird</h2>
      <h3>Formeln und Funktionen</h3>
      <ul>
        <li><strong>Grundrechenarten und SUMME:</strong> Totale bilden, Differenzen und Prozentanteile berechnen.</li>
        <li><strong>MITTELWERT, MIN und MAX:</strong> Kennzahlen zu einer Liste, zum Beispiel die durchschnittliche Rechnung oder der höchste Umsatz.</li>
        <li><strong>WENN:</strong> Eine Bedingung prüfen und je nach Ergebnis einen Text oder eine Zahl ausgeben. Mehr dazu im Artikel zur <a href="wenn-funktion.html">WENN-Funktion</a>.</li>
        <li><strong>SVERWEIS mit FALSCH:</strong> Einen Preis oder Namen aus einer zweiten Tabelle holen. Die Grundlagen stehen im Artikel zum <a href="sverweis.html">SVERWEIS</a>.</li>
        <li><strong>SUMMEWENN und ZÄHLENWENN:</strong> Summieren oder zählen, was eine Bedingung erfüllt, etwa der Umsatz einer Filiale.</li>
        <li><strong>Absolute Bezüge mit <code>$</code>:</strong> Eine Formel korrekt nach unten kopieren, wenn ein Bezug fix bleiben muss. Siehe <a href="absolute-bezuege.html">absolute Bezüge</a>.</li>
      </ul>
      <h3>Bedienung und Darstellung</h3>
      <ul>
        <li><strong>Formatierung:</strong> Zahlenformat mit zwei Dezimalstellen und Tausendertrennzeichen, Prozentformat, Spaltenbreite, eventuell bedingte Formatierung.</li>
        <li><strong>Sortieren und Filtern:</strong> Eine Liste nach Betrag absteigend sortieren oder nur eine Filiale anzeigen.</li>
        <li><strong>Einfache Diagramme:</strong> Ein Säulen- oder Liniendiagramm aus einer kleinen Tabelle einfügen und beschriften.</li>
        <li><strong>Pivot-Tabellen:</strong> Eher für Stellen mit Fokus auf Auswertungen, etwa im Controlling. Wenn das Inserat Datenanalyse erwähnt, lohnt es sich, eine Pivot-Tabelle über <em>Einfügen &gt; PivotTable</em> einmal selbst gebaut zu haben.</li>
      </ul>

      <h2>Testformate: am PC, Multiple-Choice oder als Datei</h2>
      <h3>Praktische Aufgabe am PC</h3>
      <p>Du sitzt vor einer vorbereiteten Arbeitsmappe und löst mehrere Aufgaben, oft mit Zeitlimit. Hier zählt, dass du die Formeln ohne Nachschlagen tippen kannst. Achte darauf, welche Sprache das Excel auf dem Testrechner hat: In einem deutschen Excel funktioniert nur <code>SUMME</code>, nicht <code>SUM</code>.</p>
      <h3>Multiple-Choice</h3>
      <p>Online-Tests zeigen eine Formel oder einen Bildschirmausschnitt und fragen nach dem Ergebnis oder nach der richtigen Formel. Du brauchst hier kein Excel, musst aber Formeln im Kopf lesen können, zum Beispiel was <code>=MAX(B2:B6)-MIN(B2:B6)</code> ergibt.</p>
      <h3>Hausaufgabe als Datei</h3>
      <p>Du bekommst eine Datei mit Rohdaten und schickst eine Auswertung zurück. Neben korrekten Formeln wird dabei oft auch angeschaut, wie übersichtlich die Datei ist: klare Überschriften, einheitliche Zahlenformate, keine fix eingetippten Resultate, wo eine Formel hingehört.</p>

      <h2>5 Beispielaufgaben mit Lösung</h2>
      <p>Die Aufgaben sind so aufgebaut, wie sie in einem praktischen Test vorkommen können. Versuch zuerst, die Formel selbst zu schreiben, bevor du die Lösung liest.</p>

      <h3>Aufgabe 1: Rechnungsliste auswerten</h3>
      <p>Berechne das Total, den Durchschnitt und die grösste Rechnung.</p>
{T1}
      <code class="formula">=SUMME(C2:C6)</code>
      <code class="formula">=MITTELWERT(C2:C6)</code>
      <code class="formula">=MAX(C2:C6)</code>
      <p>Ergebnisse: CHF 12'400.00, CHF 2'480.00 und CHF 5'120.00. Die kleinste Rechnung findest du mit <code>=MIN(C2:C6)</code>, das ergibt CHF 890.00. Prüf solche Werte kurz von Auge: Ein Durchschnitt, der über dem Maximum liegt, deutet auf einen falschen Bereich hin.</p>

      <h3>Aufgabe 2: Umsatz pro Filiale</h3>
      <p>Berechne in E2 bis E4 den Gesamtumsatz jeder Filiale. Die Formel soll sich nach unten kopieren lassen.</p>
{T2}
      <code class="formula">=SUMMEWENN($A$2:$A$7;D2;$B$2:$B$7)</code>
      <p>Bern ergibt CHF 34'600.00, Zürich CHF 46'050.50 und Basel CHF 27'000.00. Die beiden Bereiche sind mit <code>$</code> fixiert, das Kriterium <code>D2</code> wandert beim Kopieren mit. Zur Kontrolle muss die Summe der drei Totale dem Gesamtumsatz <code>=SUMME(B2:B7)</code> entsprechen, also CHF 107'650.50.</p>

      <h3>Aufgabe 3: Preis aus der Preisliste holen</h3>
      <p>Hol in G2 den Preis für die Artikelnummer in E2 und berechne in H2 den Betrag.</p>
{T3}
      <code class="formula">=SVERWEIS(E2;$A$2:$C$5;3;FALSCH)</code>
      <code class="formula">=F2*G2</code>
      <p>Der SVERWEIS sucht A-120 in der ersten Spalte der Preisliste und gibt den Wert aus der dritten Spalte zurück: CHF 24.00. Der Betrag ist CHF 120.00. <code>FALSCH</code> sorgt dafür, dass nur eine exakte Übereinstimmung zählt. Gibt es die Nummer nicht, erscheint <code>#NV</code>.</p>

      <h3>Aufgabe 4: Offene Pendenzen zählen und markieren</h3>
      <p>Zähle, wie viele Pendenzen offen sind, und schreib in Spalte D «nachfassen», wenn der Status «offen» ist, sonst «ok».</p>
{T4}
      <code class="formula">=ZÄHLENWENN(C2:C7;"offen")</code>
      <code class="formula">=WENN(C2="offen";"nachfassen";"ok")</code>
      <p>Es sind 3 Pendenzen offen. «in Arbeit» zählt nicht, weil der Text nicht genau «offen» lautet. Text steht in Formeln immer in Anführungszeichen, Zahlen nicht.</p>

      <h3>Aufgabe 5: MwSt mit festem Satz</h3>
      <p>Berechne in C2 die MwSt und kopiere die Formel nach unten. Der Satz steht in E2.</p>
{T5}
      <code class="formula">=B2*$E$2</code>
      <p>Ergebnisse: CHF 97.20, CHF 36.45 und CHF 192.78. Ohne <code>$</code> würde Excel beim Kopieren auf E3 und E4 zeigen, die leer sind, und überall 0 liefern. Den Satz schreibst du nicht direkt in die Formel, damit eine Änderung an einer einzigen Stelle reicht.</p>

      <h2>Lernplan für 7 Tage</h2>
      <p>Sieben Tage mit je 20 bis 30 Minuten reichen, um die typischen Testfunktionen einmal sauber durchzuarbeiten. Wichtig ist, dass du jede Formel selbst tippst, statt nur Lösungen zu lesen. Die passenden Übungen findest du im <a href="../pfad/basis.html">Lernpfad Basis</a> mit 15 Übungen, davon 10 gratis.</p>
{PLAN}
      <p>Am Tag 7 simulierst du den Ernstfall: neue Zahlen, keine Spickzettel, Zeitlimit. Notier dir, wo du gestockt hast, und wiederhol genau diese Funktion am nächsten Tag.</p>

      <h2>Typische Fehler im Test</h2>
      <ul>
        <li><strong>SUM statt SUMME:</strong> Englische Funktionsnamen ergeben im deutschen Excel <code>#NAME?</code>. Dasselbe gilt für <code>IF</code> oder <code>VLOOKUP</code>.</li>
        <li><strong>Komma statt Semikolon:</strong> <code>=WENN(C2="offen","nachfassen","ok")</code> nimmt das deutsche Excel nicht an. Argumente trennst du mit <code>;</code>.</li>
        <li><strong>Fehlendes FALSCH im SVERWEIS:</strong> Ohne viertes Argument sucht Excel ungefähr. Bei einer unsortierten Liste kommt dann ein falscher Preis zurück, ohne Fehlermeldung.</li>
        <li><strong>Fehlendes <code>$</code>:</strong> Die erste Zeile stimmt, die kopierten Zeilen nicht. Kontrollier nach dem Kopieren immer eine Formel weiter unten.</li>
        <li><strong>Text statt Zahl:</strong> Beträge, die als Text gespeichert sind, stehen oft linksbündig und werden von SUMME ignoriert. Das Total ist dann zu tief. Auch Zahlen in Formeln schreibst du ohne Hochkomma: <code>10000</code>, nicht <code>10'000</code>.</li>
      </ul>

      <h2>Englisch und Deutsch: wenn der Test in der anderen Sprache läuft</h2>
      <p>Hast du Excel mit englischen Tutorials gelernt, musst du für ein deutsches Excel die Namen übersetzen und das Komma durch ein Semikolon ersetzen. Umgekehrt gilt dasselbe. Frag vor dem Test nach, welche Sprache eingestellt ist, und präg dir die wichtigsten Paare ein:</p>
{CMP}
      <p>Welche Plattformen deutsche Funktionsnamen und Semikolon korrekt prüfen, zeigt unser <a href="excel-ueben-online-vergleich.html">Vergleich von Excel-Übungsplattformen</a>.</p>'''

practice = '''        <p><strong>Starte mit der ersten Testfunktion.</strong> Die erste Übung ist eine SUMME über Umsätze in CHF. Excel-Drills prüft deine Formel sofort und erklärt Fehler wie <code>SUM</code> oder ein Komma statt Semikolon.</p>
        <p>18 Übungen sind gratis, ohne Anmeldung, direkt im Browser.</p>
        <p><a class="btn" href="../app/#summe-1">Gratis-Übung starten</a> <a class="btn btn-secondary" href="../pfad/basis.html">Lernpfad Basis ansehen</a></p>'''

faq = [
    ("Wie lange sollte ich mich auf einen Excel-Einstellungstest vorbereiten?",
     "Das hängt von deinem Stand ab. Wenn du die Grundlagen kennst, reichen oft einige Tage mit 20 bis 30 Minuten pro Tag, um SUMME, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN und absolute Bezüge sicher zu tippen. Wer bei null startet, plant besser zwei Wochen ein."),
    ("Welche Excel-Version wird im Test verwendet?",
     "Das legt der Arbeitgeber fest, frag am besten vorher nach. Die typischen Testfunktionen gibt es in allen aktuellen Versionen. Neuere Funktionen wie XVERWEIS gibt es erst ab Excel 2021 und in Microsoft 365, deshalb ist SVERWEIS als Grundlage sicherer."),
    ("Darf man im Excel-Test googeln?",
     "Das bestimmen die Regeln des jeweiligen Tests. Bei einer Hausaufgabe ist Nachschlagen meist kein Problem, bei einem Test vor Ort oft nicht erlaubt oder aus Zeitgründen kaum möglich. Bereite dich so vor, dass du die Kernfunktionen ohne Hilfe schreiben kannst."),
    ("Was mache ich, wenn ich Excel auf Englisch gelernt habe?",
     "Lern die deutschen Namen der wichtigsten Funktionen (SUMME, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN) und gewöhn dir das Semikolon als Trennzeichen an. Die Logik der Formeln bleibt gleich. Frag vor dem Test, in welcher Sprache Excel eingestellt ist."),
    ("Reichen Gratis-Übungen für die Vorbereitung?",
     "Für die typischen Grundfunktionen können Gratis-Übungen reichen, etwa die 18 Gratis-Übungen auf Excel-Drills. Entscheidend ist, dass du jede Funktion mehrmals selbst tippst und zum Schluss einen Probetest ohne Vorlage machst. Ob das für deinen Test genügt, hängt davon ab, was die Stelle verlangt."),
]

PAGE = article_page("excel-einstellungstest-ueben.html",
    "Excel Einstellungstest üben: 5 Aufgaben, 7-Tage-Plan",
    "Excel Einstellungstest üben: Was im Excel-Test bei der Bewerbung typischerweise geprüft wird, 5 Aufgaben mit Lösung, 7-Tage-Lernplan und typische Fehler.",
    "Excel Einstellungstest üben: Aufgaben, Lösungen und Lernplan",
    "In einem Excel-Einstellungstest werden typischerweise SUMME, MITTELWERT, MIN/MAX, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN und absolute Bezüge geprüft, dazu Formatieren, Sortieren und einfache Diagramme. Mit fünf Beispielaufgaben und einem Lernplan für sieben Tage à 20 bis 30 Minuten bereitest du dich gezielt auf den Excel-Test im Vorstellungsgespräch vor.",
    body, faq, practice, date_iso="2026-11-01", date_text="1. November 2026")
