from lib import *

TYPES = compare("Die vier Bezugsarten", ["Schreibweise", "Art", "Beim Kopieren nach unten", "Beim Kopieren nach rechts"], [
    ["<code>F1</code>", "relativ", "Zeile ändert sich (F2, F3 …)", "Spalte ändert sich (G1, H1 …)"],
    ["<code>$F$1</code>", "absolut", "bleibt F1", "bleibt F1"],
    ["<code>$F1</code>", "gemischt, Spalte fix", "Zeile ändert sich", "bleibt Spalte F"],
    ["<code>F$1</code>", "gemischt, Zeile fix", "bleibt Zeile 1", "Spalte ändert sich"],
])
T1 = tbl("Offerte mit MwSt-Satz in F1", [
    ["Position", "Netto CHF", "MwSt CHF", "", "MwSt-Satz", "8.1 %"],
    ["Workshop", "3'200.00", "!259.20"],
    ["Reisekosten", "640.00", "!51.84"],
    ["Unterlagen", "180.00", "!14.58"],
])
COPY = compare("Kopierte Formeln mit und ohne $ im Vergleich", ["Zelle", "mit $", "Ergebnis", "ohne $", "Ergebnis"], [
    ["C2", "<code>=B2*$F$1</code>", "259.20", "<code>=B2*F1</code>", "259.20"],
    ["C3", "<code>=B3*$F$1</code>", "51.84", "<code>=B3*F2</code>", "0.00"],
    ["C4", "<code>=B4*$F$1</code>", "14.58", "<code>=B4*F3</code>", "0.00"],
])
T2 = tbl("Umsatz pro Region mit Anteil am Total", [
    ["Region", "Umsatz CHF", "Anteil"],
    ["Zürich", "412'000", "!41.2 %"],
    ["Bern", "268'000", "!26.8 %"],
    ["Basel", "195'000", "!19.5 %"],
    ["Luzern", "125'000", "!12.5 %"],
    ["Total", "1'000'000", "100.0 %"],
])
T3 = tbl("Prämientabelle: Grundprämie in Spalte B, Bonusfaktoren in Zeile 1", [
    ["Fahrzeugklasse", "Grundprämie CHF", "100 %", "80 %", "60 %"],
    ["Kleinwagen", "900", "!900", "!720", "!540"],
    ["Mittelklasse", "1'200", "!1'200", "!960", "!720"],
    ["SUV", "1'650", "!1'650", "!1'320", "!990"],
])
CMP = compare("Begriffe rund um Bezüge: Deutsch und Englisch", ["Deutsch", "Englisch", "Bemerkung"], [
    ["Zellbezug", "cell reference", "z.&nbsp;B. B2"],
    ["relativer Bezug", "relative reference", "B2"],
    ["absoluter Bezug", "absolute reference", "$B$2"],
    ["gemischter Bezug", "mixed reference", "$B2 oder B$2"],
    ["Namens-Manager", "Name Manager", "Namen für Zellen und Bereiche"],
    ["Z1S1-Bezugsart", "R1C1 reference style", "Zeile/Spalte statt A1"],
    ["INDIREKT", "INDIRECT", "Bezug aus einem Text erzeugen"],
    ["BEREICH.VERSCHIEBEN", "OFFSET", "verschobenen Bereich erzeugen"],
    ["#BEZUG!", "#REF!", "Bezug zeigt ins Leere"],
    ["#DIV/0!", "#DIV/0!", "Division durch null oder leere Zelle"],
])

body = f'''      <h2>Warum Excel Bezüge beim Kopieren verändert</h2>
      <p>Wenn du in C2 die Formel <code>=B2*F1</code> schreibst und sie nach unten kopierst, steht in C3 plötzlich <code>=B3*F2</code>. Das ist kein Fehler, sondern Absicht: Excel speichert normale Bezüge relativ zur Position der Formel. Gemeint ist also nicht «Zelle B2», sondern «die Zelle eine Spalte links von mir, in derselben Zeile». Beim Kopieren bleibt diese Beziehung erhalten, und genau deshalb kannst du eine Formel einmal schreiben und für hundert Zeilen verwenden.</p>
      <p>Problematisch wird es, wenn sich ein Teil der Formel nicht verschieben darf: ein MwSt-Satz, ein Wechselkurs, ein Total, eine Nachschlagetabelle. Dafür gibt es den absoluten Bezug mit dem Dollarzeichen. Er ist eine der wichtigsten Grundlagen überhaupt, denn fast jede Formel mit <a href="sverweis.html">SVERWEIS</a>, <a href="summewenn.html">SUMMEWENN</a> oder <a href="zaehlenwenn.html">ZÄHLENWENN</a> braucht ihn, sobald du sie kopierst.</p>

      <h2>Die Syntax: Wo das Dollarzeichen steht</h2>
      <div class="syntax">
        <code class="formula">$Spalte$Zeile   zum Beispiel   $F$1</code>
        <dl>
          <dt>$ vor dem Spaltenbuchstaben</dt>
          <dd>Die Spalte bleibt beim Kopieren nach links oder rechts fix. <code>$F1</code> zeigt immer auf Spalte F.</dd>
          <dt>$ vor der Zeilennummer</dt>
          <dd>Die Zeile bleibt beim Kopieren nach oben oder unten fix. <code>F$1</code> zeigt immer auf Zeile 1.</dd>
          <dt>$ vor beidem</dt>
          <dd>Der Bezug ist vollständig absolut. <code>$F$1</code> zeigt immer auf F1, egal wohin du die Formel kopierst.</dd>
          <dt>kein $</dt>
          <dd>Der Bezug ist relativ und verschiebt sich in beide Richtungen.</dd>
        </dl>
      </div>
{TYPES}
      <p><strong>Schnell setzen mit F4:</strong> Setze in der Bearbeitungsleiste den Cursor in einen Bezug und drücke F4. Excel schaltet dann reihum zwischen <code>$F$1</code>, <code>F$1</code>, <code>$F1</code> und <code>F1</code> um. Auf dem Mac ist dafür in der Regel Cmd+T vorgesehen. Das Dollarzeichen hat übrigens nichts mit der Währung zu tun. Es ist nur ein Markierungszeichen und heisst in allen Sprachversionen gleich.</p>

      <h2>Beispiel 1: MwSt mit festem Satz (Büro)</h2>
      <p>Du erstellst eine Offerte. Der MwSt-Satz von 8.1&nbsp;% steht einmal in F1, damit du ihn bei einer Satzänderung nur an einer Stelle anpassen musst.</p>
{T1}
      <p>Die Formel in C2, danach bis C4 nach unten kopiert:</p>
      <code class="formula">=B2*$F$1</code>
      <p>Der Bezug auf den Nettobetrag <code>B2</code> soll mitwandern, der Satz <code>$F$1</code> nicht. So sieht der Unterschied nach dem Kopieren aus:</p>
{COPY}
      <p>Ohne Dollarzeichen zeigt die Formel in C3 auf F2 und in C4 auf F3. Diese Zellen sind leer, und Excel rechnet mit 0. Es erscheint keine Fehlermeldung, nur ein falsches Ergebnis. Genau deshalb ist dieser Fehler so tückisch: Die erste Zeile stimmt, und wer nur sie kontrolliert, merkt nichts. In einer Offerte mit Rappenbeträgen solltest du das Ergebnis zusätzlich runden, etwa mit <code>=RUNDEN(B2*$F$1;2)</code>.</p>

      <h2>Beispiel 2: Anteil am Total (Controlling)</h2>
      <p>Im Monatsreport zeigst du, welchen Anteil jede Region am Gesamtumsatz hat. Das Total steht in B6.</p>
{T2}
      <p>Die Formel in C2, nach unten kopiert und als Prozent formatiert:</p>
      <code class="formula">=B2/$B$6</code>
      <p>Hier zeigt sich der fehlende Dollar sofort: Ohne <code>$</code> würde aus <code>=B2/B6</code> in C3 die Formel <code>=B3/B7</code>. B7 ist leer, und Excel meldet <code>#DIV/0!</code>. Wenn du in einer kopierten Spalte ab der zweiten Zeile <code>#DIV/0!</code> oder lauter Nullen siehst, ist ein fehlender absoluter Bezug die wahrscheinlichste Ursache. Zur Kontrolle summierst du die Anteile, das Ergebnis muss 100&nbsp;% sein.</p>

      <h2>Beispiel 3: Gemischte Bezüge für eine Prämientabelle (Versicherung)</h2>
      <p>Gemischte Bezüge brauchst du, wenn du eine Formel in zwei Richtungen kopierst. In einer Motorfahrzeug-Tarifübersicht stehen die Grundprämien pro Fahrzeugklasse in Spalte B und die Bonusfaktoren in Zeile 1. Jede Zelle der Tabelle soll Grundprämie mal Faktor rechnen.</p>
{T3}
      <p>Die Formel in C2, danach in den ganzen Bereich C2:E4 kopiert:</p>
      <code class="formula">=$B2*C$1</code>
      <p><code>$B2</code> fixiert die Spalte B, damit beim Kopieren nach rechts immer die Grundprämie verwendet wird, aber die Zeile darf wandern, damit jede Fahrzeugklasse ihre eigene Prämie bekommt. <code>C$1</code> fixiert die Zeile 1 mit den Faktoren, die Spalte darf wandern. In E4 steht nach dem Kopieren <code>=$B4*E$1</code>, also 1'650 × 60&nbsp;% = 990. Mit einer einzigen Formel füllst du so eine ganze Matrix. Mit <code>$B$2*$C$1</code> stünde dagegen überall 900, mit <code>B2*C1</code> würden die Bezüge in die Tabelle hineinrutschen.</p>

      <h2>Alternative: Namen statt Dollarzeichen</h2>
      <p>Statt <code>$F$1</code> kannst du der Zelle einen Namen geben, etwa <code>MwSt_Satz</code>. Markiere F1, tippe den Namen links in das Namenfeld und bestätige mit Enter. Die Formel lautet dann <code>=B2*MwSt_Satz</code>. Namen sind immer absolut und machen Formeln lesbarer, besonders in Dateien, die andere weiterbearbeiten. Namen dürfen keine Leerzeichen enthalten. Verwalten kannst du sie unter Formeln &gt; Namens-Manager.</p>
      <p>Auch als Tabelle formatierte Bereiche (Einfügen &gt; Tabelle) arbeiten mit strukturierten Verweisen wie <code>[@Netto]</code>, die sich beim Ausfüllen selbst richtig verhalten. Das Prinzip der absoluten Bezüge musst du trotzdem kennen, denn in vielen bestehenden Dateien und in Einstellungstests wirst du mit normalen Zellbezügen arbeiten.</p>

      <h2>Typische Fehler und wie du sie erkennst</h2>
      <h3>Fehlende <code>$</code>: Nullen, <code>#DIV/0!</code> oder <code>#NV</code></h3>
      <p>Die erste Zeile stimmt, ab der zweiten kommen Nullen, <code>#DIV/0!</code> oder bei SVERWEIS plötzlich <code>#NV</code>. Klicke auf eine der unteren Zellen und drücke F2: Excel färbt die Bezüge ein und zeigt die zugehörigen Rahmen in der Tabelle. Liegt ein Rahmen auf einer leeren Zelle oder ist eine Nachschlagetabelle nach unten verrutscht, fehlt ein <code>$</code>.</p>
      <h3><code>$</code> an der falschen Stelle</h3>
      <p><code>$F1</code> statt <code>F$1</code> sieht ähnlich aus, wirkt aber anders: Beim Kopieren nach unten bleibt die Spalte fix, die Zeile wandert trotzdem. Frage dich bei jedem Bezug: In welche Richtung kopiere ich, und was muss dabei stehen bleiben?</p>
      <h3><code>#BEZUG!</code></h3>
      <p>Dieser Fehler entsteht, wenn ein relativer Bezug beim Kopieren über den Tabellenrand hinausgeht, etwa wenn du eine Formel mit <code>B1</code> eine Zeile nach oben kopierst, oder wenn du Zeilen oder Spalten löschst, auf die eine Formel verweist. Ein absoluter Bezug schützt vor dem ersten Fall, nicht aber vor dem Löschen.</p>
      <h3><code>#NAME?</code> und Trennzeichen</h3>
      <p>Arbeitest du mit Namen, führt ein Tippfehler im Namen zu <code>#NAME?</code>. Und in Funktionen mit absoluten Bereichen gilt wie immer das Semikolon als Trennzeichen: <code>=SUMME($B$2:$B$5)</code>, <code>=SVERWEIS(E2;$A$2:$C$6;3;FALSCH)</code>. Ein Komma statt des Semikolons führt dazu, dass Excel die Formel nicht annimmt.</p>

      <h2>Englisch vs. Deutsch</h2>
      <p>Das Dollarzeichen und die F4-Taste sind in allen Sprachversionen gleich. Unterschiedlich sind die Begriffe und die Funktionsnamen, die mit Bezügen arbeiten. Eine Formel wie <code>=VLOOKUP(E2,$A$2:$C$6,3,FALSE)</code> behält beim Übersetzen ihre Dollarzeichen und wird zu <code>=SVERWEIS(E2;$A$2:$C$6;3;FALSCH)</code>.</p>
{CMP}'''

practice = '''        <p><strong>Absoluter Bezug: MwSt mit festem Satz.</strong> Du berechnest die MwSt mit einem Satz, der in einer eigenen Zelle steht, und baust die Formel so, dass sie nach unten kopiert werden kann. Excel-Drills kopiert deine Formel automatisch nach unten und zeigt dir, ob alle Zeilen stimmen.</p>
        <p>Die Übung ist gratis, braucht keine Anmeldung und läuft direkt im Browser.</p>
        <p><a class="btn" href="../app/#absolut-1">Übung zu absoluten Bezügen starten</a></p>'''

faq = [
    ("Was bedeutet das Dollarzeichen in Excel-Formeln?",
     "Das $ fixiert einen Teil des Zellbezugs, damit er sich beim Kopieren der Formel nicht verändert. Vor dem Buchstaben fixiert es die Spalte, vor der Zahl die Zeile. $F$1 zeigt immer auf F1."),
    ("Wie setze ich das Dollarzeichen schnell?",
     "Setze den Cursor in der Formel auf den Bezug und drücke F4. Jeder weitere Druck wechselt zwischen $F$1, F$1, $F1 und F1. Auf dem Mac ist dafür in der Regel Cmd+T vorgesehen."),
    ("Wann brauche ich einen gemischten Bezug wie $B2 oder C$1?",
     "Immer dann, wenn du eine Formel sowohl nach unten als auch nach rechts kopierst und ein Wert aus einer festen Spalte mit einem Wert aus einer festen Zeile kombiniert wird, zum Beispiel Grundprämie mal Faktor in einer Tarifmatrix: =$B2*C$1."),
    ("Hat das $ etwas mit Dollar-Beträgen zu tun?",
     "Nein. Das Dollarzeichen in Bezügen ist nur ein Markierungszeichen für «fix». Die Währung einer Zelle stellst du über das Zahlenformat ein, etwa auf CHF. Eine Zelle mit $F$1 in der Formel kann problemlos Franken enthalten."),
]

PAGE = article_page("absolute-bezuege.html",
    "Absolute Bezüge in Excel: Das $-Zeichen erklärt",
    "Absolute Bezüge in Excel mit $ erklärt: relativ, absolut, gemischt, F4-Taste, Beispiele mit MwSt, Anteil am Total und Prämientabelle, plus Gratis-Übung.",
    "Absolute Bezüge in Excel: das $-Zeichen",
    "Ein absoluter Bezug wie <code>$F$1</code> bleibt beim Kopieren einer Formel unverändert, während ein relativer Bezug wie <code>F1</code> mitwandert. Das Dollarzeichen vor dem Buchstaben fixiert die Spalte, vor der Zahl die Zeile. Mit der Taste F4 schaltest du zwischen den Varianten um.",
    body, faq, practice)
