from lib import *

# Excel-Übungen für die kaufmännische Grundbildung (KV). Alle Beispielzahlen sind erfunden und nachgerechnet.
# MwSt-Normalsatz 8.1 % (seit 1.1.2024). Kilometerpauschale und Lohnabzug sind ausdrücklich Beispielwerte.

T1 = tbl("Rechnung in A1:D7, MwSt-Satz in F2", [
    ["Artikel", "Menge", "Preis CHF", "Betrag CHF", "", "MwSt-Satz"],
    ["Druckerpapier A4", "10", "6.90", "69.00", "", "8.1 %"],
    ["Toner schwarz", "2", "89.50", "179.00"],
    ["Ordner", "25", "3.20", "80.00"],
    ["Zwischentotal", "", "", "!328.00"],
    ["MwSt 8.1 %", "", "", "!26.57"],
    ["Total", "", "", "!354.55"],
])
T2 = tbl("Umsätze in A1:C7, Auswertung pro Filiale in E1:G5", [
    ["Monat", "Filiale", "Umsatz CHF", "", "Filiale", "Umsatz CHF", "Anteil"],
    ["Januar", "Bern", "12'400.00", "", "Bern", "!24'350.00", "!30.3 %"],
    ["Januar", "Zürich", "18'250.50", "", "Zürich", "!35'850.50", "!44.6 %"],
    ["Januar", "Basel", "9'800.00", "", "Basel", "!20'249.50", "!25.2 %"],
    ["Februar", "Bern", "11'950.00", "", "Total", "!80'450.00"],
    ["Februar", "Zürich", "17'600.00"],
    ["Februar", "Basel", "10'449.50"],
])
T3 = tbl("Offene-Posten-Liste in A1:F7", [
    ["Rechnung", "Kunde", "Betrag CHF", "Status", "Tage überfällig", "Mahnung"],
    ["R-2101", "Meier AG", "1'250.50", "offen", "12", ""],
    ["R-2102", "Brunner GmbH", "3'480.00", "bezahlt", "0", ""],
    ["R-2103", "Keller &amp; Co.", "875.25", "offen", "45", "!mahnen"],
    ["R-2104", "Meier AG", "2'100.00", "offen", "38", "!mahnen"],
    ["R-2105", "Huber Treuhand", "640.00", "bezahlt", "0", ""],
    ["R-2106", "Brunner GmbH", "1'999.95", "offen", "5", ""],
])
T4 = tbl("Spesenabrechnung in A1:C5, Kilometersatz in E2", [
    ["Anlass", "Kilometer", "Betrag CHF", "", "CHF pro km"],
    ["Kundenbesuch Thun", "64", "!44.80", "", "0.70"],
    ["Schulung Luzern", "118", "!82.60"],
    ["Messe Basel", "187", "!130.90"],
    ["Total", "!369", "!258.30"],
])
T5 = tbl("Rabatt und Skonto in A1:B7", [
    ["Position", "Wert"],
    ["Listenpreis CHF", "1'250.50"],
    ["Rabatt", "12 %"],
    ["Nach Rabatt CHF", "!1'100.44"],
    ["Skonto", "2 %"],
    ["Nach Skonto CHF", "!1'078.43"],
    ["Zahlbetrag CHF", "!1'078.45"],
])
T6 = tbl("Stundenlöhne in A1:F4, Ansätze in H1:I4, Abzug in I6", [
    ["Name", "Klasse", "Stunden", "Ansatz CHF", "Brutto CHF", "Netto CHF", "", "Klasse", "Ansatz CHF"],
    ["Frei", "A", "42", "!28.50", "1'197.00", "!1'053.35", "", "A", "28.50"],
    ["Rossi", "C", "35.25", "!36.75", "1'295.44", "!1'140.00", "", "B", "32.00"],
    ["Wyss", "B", "50", "!32.00", "1'600.00", "!1'408.00", "", "C", "36.75"],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "Abzug (Beispiel)", "12 %"],
])
CMP = compare("Die 8 wichtigsten Funktionen für das KV: Englisch und Deutsch", ["Deutsch", "Englisch", "wofür im KV"], [
    ["SUMME", "SUM", "Rechnungstotal, Monatsumsatz"],
    ["MITTELWERT", "AVERAGE", "Durchschnittsumsatz pro Monat"],
    ["WENN", "IF", "Mahnung ja oder nein, Budget eingehalten"],
    ["SVERWEIS", "VLOOKUP", "Preis, Ansatz oder Adresse nachschlagen"],
    ["SUMMEWENN", "SUMIF", "Umsatz pro Filiale, offene Beträge"],
    ["ZÄHLENWENN", "COUNTIF", "Anzahl offener Rechnungen"],
    ["RUNDEN", "ROUND", "auf zwei Nachkommastellen runden"],
    ["VRUNDEN", "MROUND", "auf 5 Rappen runden"],
])

body = f'''      <h2>Was Excel im KV-Alltag bedeutet</h2>
      <p>Tabellenkalkulation ist Teil der kaufmännischen Grundbildung, sowohl im Lehrbetrieb als auch in der Berufsschule. Im Büro sind es selten komplizierte Modelle, sondern immer wieder dieselben Aufgaben, die sauber und schnell sitzen müssen:</p>
      <ul>
        <li><strong>Rechnungen und MwSt:</strong> Positionen multiplizieren, Zwischentotal bilden, 8.1 % MwSt dazurechnen, Total in CHF.</li>
        <li><strong>Umsatzlisten:</strong> Umsätze pro Filiale oder pro Monat zusammenfassen und Anteile berechnen.</li>
        <li><strong>Offene-Posten-Liste:</strong> Zählen und summieren, was noch nicht bezahlt ist, und entscheiden, wer eine Mahnung bekommt.</li>
        <li><strong>Spesenabrechnung:</strong> Kilometer mal Pauschale, Belege zusammenzählen.</li>
        <li><strong>Lohnabrechnung einfach:</strong> Stunden mal Ansatz, Abzüge mit festem Satz.</li>
        <li><strong>Adresslisten:</strong> Kundinnen und Kunden nach PLZ sortieren oder nach Ort filtern.</li>
        <li><strong>Prozentrechnen:</strong> Rabatt, Skonto, Anteil am Total.</li>
        <li><strong>Rundung auf 5 Rappen:</strong> Bargeldbeträge enden in der Schweiz auf 0 oder 5 Rappen.</li>
      </ul>
      <p>Die sechs Übungen unten decken diese Aufgaben ab. Baue jede Tabelle selbst in Excel nach, tippe die Formel ein und vergleiche mit dem markierten Ergebnis. Alle Formeln sind in Schweizer Schreibweise: deutsche Funktionsnamen und Semikolon zwischen den Argumenten.</p>

      <h2>Übung 1: Rechnung mit MwSt</h2>
      <p>Du erstellst eine Rechnung für Büromaterial. Der MwSt-Satz steht einmal in F2, damit du ihn bei einer Satzänderung nur an einer Stelle anpassen musst.</p>
{T1}
      <p>Betrag pro Position in D2, nach unten kopiert bis D4:</p>
      <code class="formula">=B2*C2</code>
      <p>Zwischentotal in D5, MwSt in D6 und Total in D7:</p>
      <code class="formula">=SUMME(D2:D4)</code>
      <code class="formula">=D5*$F$2</code>
      <code class="formula">=VRUNDEN(D5+D6;0.05)</code>
      <p>Die MwSt beträgt 26.568, angezeigt als 26.57. Das Total von 354.568 wird auf 5 Rappen gerundet und ergibt 354.55. Das <code>$</code> in <code>$F$2</code> sorgt dafür, dass der Bezug auf den Satz beim Kopieren fix bleibt. Mehr dazu im Artikel über <a href="absolute-bezuege.html">absolute Bezüge</a>.</p>
      <p>Umgekehrt rechnest du aus einem Bruttobetrag den Nettobetrag heraus: <code>=A2/(1+$F$2)</code>. Aus 1'081.00 CHF inklusive MwSt werden so 1'000.00 CHF netto, die MwSt beträgt 81.00 CHF. Ein häufiger Fehler ist <code>=A2*(1-$F$2)</code>: Das ergibt 993.39 CHF und ist falsch, weil die 8.1 % auf den Nettobetrag gerechnet werden, nicht auf den Bruttobetrag.</p>

      <h2>Übung 2: Umsatz pro Filiale und Anteil in Prozent</h2>
      <p>Die Umsätze dreier Filialen stehen untereinander, pro Monat und Filiale eine Zeile. Du willst das Total pro Filiale und ihren Anteil am Gesamtumsatz.</p>
{T2}
      <p>Umsatz pro Filiale in F2, nach unten kopiert:</p>
      <code class="formula">=SUMMEWENN($B$2:$B$7;E2;$C$2:$C$7)</code>
      <p>Gesamttotal in F5 mit <code>=SUMME(F2:F4)</code>, Anteil in G2:</p>
      <code class="formula">=F2/$F$5</code>
      <p>Die Zelle formatierst du als Prozent. Du rechnest also nicht mal 100: Excel zeigt 0.3027 im Prozentformat als 30.3 % an. Wer zusätzlich mal 100 rechnet, sieht 3026.7 %. Wegen der Rundung auf eine Nachkommastelle ergeben die drei Anteile in der Anzeige 100.1 %, gerechnet sind es genau 100 %.</p>
      <p>Den Durchschnittsumsatz pro Filiale im Januar berechnest du mit <code>=MITTELWERT(C2:C4)</code>: 13'483.50 CHF. Mehr zur Funktion im Artikel über <a href="summewenn.html">SUMMEWENN</a>.</p>

      <h2>Übung 3: Offene-Posten-Liste</h2>
      <p>In der Debitorenbuchhaltung führst du eine Liste der gestellten Rechnungen. Du willst wissen, wie viele noch offen sind, wie viel Geld ausstehend ist und wer gemahnt werden muss.</p>
{T3}
      <p>Anzahl offener Rechnungen:</p>
      <code class="formula">=ZÄHLENWENN(D2:D7;"offen")</code>
      <p>Ergebnis: 4. Offener Betrag:</p>
      <code class="formula">=SUMMEWENN(D2:D7;"offen";C2:C7)</code>
      <p>Ergebnis: 6'225.70 CHF. Für die Mahnung in F2, nach unten kopiert, prüfst du zwei Bedingungen gleichzeitig: Die Rechnung ist offen und mehr als 30 Tage überfällig.</p>
      <code class="formula">=WENN(UND(D2="offen";E2&gt;30);"mahnen";"")</code>
      <p>R-2103 und R-2104 werden markiert. Text wie <code>"offen"</code> steht in Anführungszeichen, Zahlen wie <code>30</code> nicht.</p>

      <h2>Übung 4: Spesenabrechnung</h2>
      <p>Du rechnest die gefahrenen Kilometer für drei Geschäftsfahrten ab. Der Kilometersatz in diesem Beispiel ist 0.70 CHF, im Betrieb gilt der Satz aus dem Spesenreglement.</p>
{T4}
      <p>Betrag in C2, nach unten kopiert:</p>
      <code class="formula">=B2*$E$2</code>
      <p>Totale in B5 und C5 mit <code>=SUMME(B2:B4)</code> und <code>=SUMME(C2:C4)</code>: 369 Kilometer und 258.30 CHF. Ohne <code>$</code> würde die Formel in C3 auf E3 zeigen, eine leere Zelle, und 0 liefern. Diesen Fehler übst du in der Übung <a href="../app/#absolut-1">MwSt mit festem Satz</a>.</p>

      <h2>Übung 5: Rabatt, Skonto und Rundung auf 5 Rappen</h2>
      <p>Ein Kunde erhält 12 % Rabatt auf den Listenpreis und zieht bei Zahlung innert 10 Tagen 2 % Skonto ab. Der Zahlbetrag wird auf 5 Rappen gerundet.</p>
{T5}
      <p>Preis nach Rabatt in B4, nach Skonto in B6, Zahlbetrag in B7:</p>
      <code class="formula">=B2*(1-B3)</code>
      <code class="formula">=B4*(1-B5)</code>
      <code class="formula">=VRUNDEN(B6;0.05)</code>
      <p>Die 12 % stehen als Prozentwert in der Zelle, also rechnest du direkt mit <code>B3</code> und nicht mit <code>B3/100</code>. Skonto wird auf den Betrag nach Rabatt gerechnet, nicht auf den Listenpreis. 1'078.4312 CHF werden mit VRUNDEN zu 1'078.45 CHF. Beachte den Punkt in <code>0.05</code>: Das ist die Schweizer Zahlenschreibweise. Die passende Übung heisst <a href="../app/#runden-1">Auf Rappen runden</a>.</p>

      <h2>Übung 6: Einfache Lohnabrechnung mit SVERWEIS</h2>
      <p>Drei Aushilfen werden im Stundenlohn bezahlt. Der Ansatz hängt von der Lohnklasse ab und steht in einer eigenen Tabelle in H1:I4. Der Abzugssatz von 12 % ist ein vereinfachter Beispielwert, in einer echten Lohnabrechnung werden die Sozialabzüge einzeln ausgewiesen.</p>
{T6}
      <p>Ansatz in D2, nach unten kopiert:</p>
      <code class="formula">=SVERWEIS(B2;$H$2:$I$4;2;FALSCH)</code>
      <p>Brutto in E2 mit <code>=C2*D2</code>, Netto in F2 auf 5 Rappen gerundet:</p>
      <code class="formula">=VRUNDEN(E2*(1-$I$6);0.05)</code>
      <p><code>FALSCH</code> verlangt eine exakte Übereinstimmung. Steht in B2 eine Klasse, die es nicht gibt, liefert SVERWEIS <code>#NV</code> statt eines falschen Ansatzes. Mehr dazu im Artikel über <a href="sverweis.html">SVERWEIS</a>.</p>

      <h2>Adresslisten sortieren und filtern</h2>
      <p>Für Adresslisten brauchst du keine Formel. Klick in die Liste, dann unter <strong>Daten</strong> auf <strong>Sortieren</strong>, und wähle zum Beispiel zuerst PLZ, dann Name. Mit <strong>Filtern</strong> (unter Windows <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd>) erscheinen Pfeile in der Kopfzeile, über die du nur einen Ort oder eine PLZ anzeigst. Wichtig: Markiere vor dem Sortieren nicht nur eine Spalte, sonst passen Namen und Adressen nicht mehr zusammen.</p>

      <h2>Die häufigsten Fehler bei KV-Aufgaben</h2>
      <ul>
        <li><strong>Komma statt Semikolon:</strong> <code>=SUMMEWENN(D2:D7,"offen",C2:C7)</code> nimmt Excel nicht an. In der Schweizer Version trennt das Semikolon die Argumente.</li>
        <li><strong>Fehlendes <code>$</code>:</strong> Der MwSt-Satz oder der Kilometersatz wandert beim Kopieren mit, und die Formel liefert ohne Fehlermeldung 0 oder falsche Beträge.</li>
        <li><strong>Prozent doppelt umgerechnet:</strong> Steht 12 % in der Zelle, rechnet Excel bereits mit 0.12. Ein zusätzliches <code>/100</code> oder <code>*100</code> verfälscht das Ergebnis.</li>
        <li><strong>Gerundete Anzeige statt gerundeter Wert:</strong> Das Zahlenformat mit zwei Nachkommastellen ändert nur die Anzeige. Rechnest du mit dem Wert weiter, zählen alle Stellen. Für Beträge, die wirklich gerundet sein müssen, nimmst du RUNDEN oder VRUNDEN.</li>
        <li><strong>Englische Funktionsnamen:</strong> <code>SUM</code> oder <code>VLOOKUP</code> ergeben in der deutschen Version <code>#NAME?</code>.</li>
      </ul>

      <h2>Vom Lehrmittel zur Praxis</h2>
      <p>Lehrmittel wie Wings erklären die Konzepte: was ein absoluter Bezug ist, wie SVERWEIS sucht, warum WENN drei Argumente hat. Das ist die Grundlage. Können heisst aber, die Formel ohne Vorlage selbst zu tippen, auch unter Zeitdruck im Büro oder an der Prüfung.</p>
      <p>Ein einfacher Tipp: Tippe jede Formel dreimal. Beim ersten Mal mit der Vorlage daneben, beim zweiten Mal mit einem kurzen Blick, beim dritten Mal ohne Vorlage und mit anderen Zahlen. Wenn das dritte Mal klappt, sitzt die Formel. Genau so ist Excel-Drills aufgebaut: Du tippst die Formel, die Plattform prüft das Ergebnis sofort und meldet typische Fehler wie Komma statt Semikolon.</p>
      <p>Der <a href="../pfad/basis.html">Lernpfad Basis</a> deckt SUMME, MITTELWERT, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN, die Rappenrundung und die <code>$</code>-Bezüge ab, zum Beispiel mit der Übung <a href="../app/#summewenn-1">Umsatz einer Region</a>, die genau Übung 2 entspricht. Danach geht der <a href="../pfad/accounting.html">Lernpfad Accounting</a> näher an die Buchhaltung, mit Aufgaben wie Netto aus Brutto, Soll und Haben prüfen oder Offene Posten nach Alter einteilen. Wer sich nach der Lehre bewirbt, findet im Artikel zum <a href="excel-einstellungstest-ueben.html">Excel-Einstellungstest</a> die typischen Testaufgaben. Einen Überblick über andere Angebote gibt der <a href="excel-ueben-online-vergleich.html">Vergleich der Übungsplattformen</a>.</p>

      <h2>Für Lehrpersonen und Berufsbildner</h2>
      <p>Excel-Drills ist für Schulen und Berufsschulen gratis. Schreib eine kurze Mail an <a href="mailto:hallo@excel-drills.ch">hallo@excel-drills.ch</a> mit dem Namen der Schule und der Anzahl Lernenden, dann erhalten deine Klassen den vollen Zugang. Details findest du auf der Seite <a href="../premium.html">Preise</a>. Für den Unterricht und die Begleitung im Lehrbetrieb gibt es Trainer-Handouts mit Ablauf und Lösungen unter <a href="../handouts/">Handouts</a>.</p>
      <p>Die Übungen eignen sich gut als Hausaufgabe zwischen zwei Lektionen: Die Lernenden üben selbständig, und du besprichst im Unterricht nur noch die Fehler, die oft vorkommen.</p>

      <h2>Englisch und Deutsch</h2>
      <p>Viele Anleitungen im Internet sind englisch. In der Schweizer Excel-Version heissen die Funktionen anders, und Argumente trennst du mit Semikolon statt Komma: Aus <code>=SUMIF(B2:B7,E2,C2:C7)</code> wird <code>=SUMMEWENN(B2:B7;E2;C2:C7)</code>.</p>
{CMP}'''

practice = '''        <p><strong>Lernpfad Basis: die Grundlagen fürs KV.</strong> SUMME, MITTELWERT, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN, absolute Bezüge und Rundung auf 5 Rappen, mit Beispielen in CHF. Excel-Drills prüft jede Formel sofort und zeigt dir, wo der Fehler liegt.</p>
        <p>18 Übungen sind gratis, ohne Anmeldung, direkt im Browser.</p>
        <p><a class="btn" href="../pfad/basis.html">Lernpfad Basis starten</a></p>'''

faq = [
    ("Welche Excel-Funktionen muss ich im KV können?",
     "Für den Büroalltag und die Berufsschule sind die wichtigsten: SUMME, MITTELWERT, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN und VRUNDEN für die Rundung auf 5 Rappen. Dazu kommen absolute Bezüge mit $, Prozentrechnen und das Sortieren und Filtern von Listen."),
    ("Reicht Excel auf dem Handy zum Üben?",
     "Zum Nachschauen ja, zum Üben nur bedingt. Formeln tippst du am Computer schneller, und auch an der Prüfung und im Büro arbeitest du mit Tastatur. Die Übungen von Excel-Drills laufen im Browser, am besten am Laptop oder PC."),
    ("Warum muss ich in Excel ein Semikolon statt eines Kommas schreiben?",
     "In der deutschen und Schweizer Excel-Version trennst du Argumente mit Semikolon, zum Beispiel =WENN(E2&gt;30;\"mahnen\";\"\"). Ein Komma führt dazu, dass Excel die Formel nicht annimmt. Englische Anleitungen verwenden Komma und englische Funktionsnamen wie IF."),
    ("Wie rechne ich die MwSt in Excel?",
     "Schreib den Satz von 8.1 % in eine eigene Zelle, zum Beispiel F2, und rechne =D5*$F$2 für die MwSt oder =D5*(1+$F$2) für den Bruttobetrag. Aus einem Bruttobetrag erhältst du den Nettobetrag mit =A2/(1+$F$2)."),
    ("Gibt es die Übungen auch auf Französisch oder Italienisch?",
     "Ja. Excel-Drills gibt es auch auf Französisch unter <a href=\"../fr/\">excel-drills.ch/fr</a> und auf Italienisch unter <a href=\"../it/\">excel-drills.ch/it</a>, mit den Funktionsnamen der jeweiligen Excel-Version."),
]

PAGE = article_page("excel-uebungen-kv.html",
    "Excel Übungen KV: 6 Aufgaben mit Lösung für die Lehre",
    "Excel Übungen fürs KV: Rechnung mit MwSt, Umsatzliste, Offene Posten, Spesen, Rabatt und Lohn. 6 Aufgaben mit Lösung in Schweizer Schreibweise, gratis üben.",
    "Excel Übungen KV: 6 Aufgaben aus dem Büroalltag",
    "Im KV brauchst du Excel für Rechnungen mit MwSt, Umsatzlisten, Offene Posten, Spesen und einfache Lohnabrechnungen. Hier findest du sechs Übungen mit Tabelle und Lösungsformel in Schweizer Schreibweise, von <code>=SUMME(D2:D4)</code> bis <code>=VRUNDEN(B6;0.05)</code>, dazu Tipps für Lernende, Lehrpersonen und Berufsbildner.",
    body, faq, practice, date_iso="2026-11-01", date_text="1. November 2026")
