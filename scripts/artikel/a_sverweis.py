from lib import *

T1 = tbl("Bürobedarf: Preisliste in A1:C6, Abfrage in E1:F2", [
    ["Art.-Nr.", "Bezeichnung", "Preis CHF", "", "Gesucht", "Preis CHF"],
    ["B-110", "Ordner A4", "4.90", "", "B-130", "!89.00"],
    ["B-120", "Kopierpapier 500 Bl.", "6.50"],
    ["B-130", "Toner schwarz", "89.00"],
    ["B-140", "Haftnotizen", "3.20"],
    ["B-150", "Kugelschreiber", "1.80"],
])
T2a = tbl("Blatt «Policen»: Bestand in A1:D5", [
    ["Police", "Versicherungsnehmer", "Produkt", "Jahresprämie CHF"],
    ["P-4101", "Keller Treuhand GmbH", "Betriebshaftpflicht", "2'340.00"],
    ["P-4102", "Brunner Bau AG", "Sachversicherung", "5'120.00"],
    ["P-4103", "Meier Praxis", "Rechtsschutz", "890.00"],
    ["P-4104", "Lüthi Logistik", "Motorfahrzeug", "7'460.00"],
])
T2b = tbl("Blatt «Schäden»: Prämie wird in Spalte C nachgeschlagen", [
    ["Schaden-Nr.", "Police", "Jahresprämie CHF"],
    ["S-77", "P-4103", "!890.00"],
    ["S-78", "P-4101", "!2'340.00"],
    ["S-79", "P-4199", "!#NV"],
])
T3 = tbl("Rabattstaffel in D1:E5, Bestellwert in A2", [
    ["Bestellwert CHF", "Rabatt", "", "Ab CHF", "Rabatt"],
    ["7'350.00", "!5 %", "", "0", "0 %"],
    ["", "", "", "1'000", "2 %"],
    ["", "", "", "5'000", "5 %"],
    ["", "", "", "10'000", "8 %"],
])
CMP = compare("SVERWEIS und verwandte Begriffe: Deutsch und Englisch", ["Deutsch", "Englisch", "Bemerkung"], [
    ["SVERWEIS", "VLOOKUP", "senkrechte Suche in der ersten Spalte"],
    ["WVERWEIS", "HLOOKUP", "waagrechte Suche in der ersten Zeile"],
    ["XVERWEIS", "XLOOKUP", "flexiblere Nachfolgerin, nicht in allen Versionen verfügbar"],
    ["INDEX / VERGLEICH", "INDEX / MATCH", "klassische Kombination für die Suche nach links"],
    ["WENNFEHLER / WENNNV", "IFERROR / IFNA", "Fehlerwerte abfangen"],
    ["FALSCH / WAHR", "FALSE / TRUE", "exakte bzw. ungefähre Übereinstimmung"],
    ["#NV", "#N/A", "Wert nicht gefunden"],
    ["#BEZUG!", "#REF!", "ungültiger Bezug, z.&nbsp;B. Spaltenindex zu gross"],
    ["#WERT!", "#VALUE!", "falscher Argumenttyp, z.&nbsp;B. Spaltenindex 0"],
])

body = f'''      <h2>Wofür du SVERWEIS brauchst</h2>
      <p>Im Büroalltag liegen Informationen selten in einer einzigen Tabelle. Die Preise stehen in der Preisliste, die Prämien im Policenbestand, die Kundennamen im Debitorenstamm. SVERWEIS verbindet solche Listen: Du gibst einen Schlüssel vor, etwa eine Artikelnummer oder eine Policennummer, und Excel holt dir den dazugehörigen Wert aus einer anderen Tabelle. Das «S» steht für senkrecht, denn Excel sucht von oben nach unten in der ersten Spalte der Tabelle.</p>
      <p>Das spart nicht nur Tipparbeit. Wenn du Werte von Hand abschreibst, entstehen Fehler, und bei jeder Preisänderung musst du alles neu kontrollieren. Mit SVERWEIS änderst du den Preis einmal in der Preisliste, und alle Formeln, die darauf zugreifen, rechnen automatisch mit dem neuen Wert.</p>

      <h2>Die Syntax von SVERWEIS</h2>
      <div class="syntax">
        <code class="formula">=SVERWEIS(Suchkriterium;Matrix;Spaltenindex;Bereich_Verweis)</code>
        <dl>
          <dt>Suchkriterium</dt>
          <dd>Der Wert, den du suchst, meist ein Zellbezug wie <code>E2</code>. Es kann auch ein fester Text in Anführungszeichen sein, zum Beispiel <code>"B-130"</code>.</dd>
          <dt>Matrix</dt>
          <dd>Der Tabellenbereich, in dem gesucht wird, zum Beispiel <code>$A$2:$C$6</code>. Excel sucht das Suchkriterium ausschliesslich in der <strong>ersten Spalte</strong> dieses Bereichs.</dd>
          <dt>Spaltenindex</dt>
          <dd>Die Nummer der Spalte innerhalb der Matrix, aus der das Ergebnis kommt. Die erste Spalte der Matrix ist 1, die zweite 2 und so weiter. Gezählt wird ab dem Beginn der Matrix, nicht ab Spalte A des Tabellenblatts.</dd>
          <dt>Bereich_Verweis</dt>
          <dd><code>FALSCH</code> (oder <code>0</code>) verlangt eine exakte Übereinstimmung. <code>WAHR</code> (oder <code>1</code>) sucht ungefähr und liefert den grössten Wert, der kleiner oder gleich dem Suchkriterium ist. Lässt du das Argument weg, verwendet Excel <code>WAHR</code>. Genau das ist eine häufige Fehlerquelle.</dd>
        </dl>
      </div>
      <p>Faustregel: Für Artikelnummern, Kundennummern, Policen und Namen schreibst du immer <code>FALSCH</code>. <code>WAHR</code> brauchst du nur für Staffeln und Bandbreiten, und dann muss die erste Spalte aufsteigend sortiert sein.</p>

      <h2>Beispiel 1: Preis zu einer Artikelnummer (Büro)</h2>
      <p>Du bestellst Büromaterial und willst zu jeder Artikelnummer automatisch den Preis anzeigen. Die Preisliste steht in A1:C6, die gesuchte Nummer tippst du in E2.</p>
{T1}
      <p>Die Formel in F2:</p>
      <code class="formula">=SVERWEIS(E2;$A$2:$C$6;3;FALSCH)</code>
      <p>Excel sucht «B-130» in der ersten Spalte der Matrix, findet es in der dritten Datenzeile und gibt den Wert aus der dritten Spalte der Matrix zurück: 89.00. Der Spaltenindex ist 3, weil der Preis in der dritten Spalte des Bereichs A:C steht. Die Dollarzeichen in <code>$A$2:$C$6</code> sorgen dafür, dass die Matrix beim Kopieren der Formel nach unten nicht mitwandert. Mehr dazu im Artikel über <a href="absolute-bezuege.html">absolute Bezüge</a>.</p>

      <h2>Beispiel 2: Jahresprämie zur Police (Versicherung)</h2>
      <p>In der Schadenbearbeitung willst du neben jedem Schadenfall die Jahresprämie der betroffenen Police sehen, etwa um die Schadenquote einzuschätzen. Der Bestand liegt auf einem eigenen Tabellenblatt namens «Policen».</p>
{T2a}
{T2b}
      <p>Die Formel in C2 auf dem Blatt «Schäden», nach unten kopiert:</p>
      <code class="formula">=SVERWEIS(B2;Policen!$A$2:$D$5;4;FALSCH)</code>
      <p>Der Blattname mit Ausrufezeichen (<code>Policen!</code>) zeigt Excel, dass die Matrix auf einem anderen Blatt liegt. Du musst ihn nicht tippen: Wechsle beim Schreiben der Formel einfach auf das andere Blatt und markiere den Bereich. Für den Schaden S-79 liefert die Formel <code>#NV</code>, weil die Police P-4199 im Bestand nicht existiert. Das ist hier kein Formelfehler, sondern ein wertvoller Hinweis: Entweder fehlt die Police im Bestand oder die Nummer im Schadenfall ist falsch erfasst.</p>
      <p>Willst du statt <code>#NV</code> einen lesbaren Text, packst du die Formel in WENNFEHLER:</p>
      <code class="formula">=WENNFEHLER(SVERWEIS(B2;Policen!$A$2:$D$5;4;FALSCH);"Police fehlt")</code>
      <p>Verwende das bewusst. WENNFEHLER verdeckt jeden Fehler, also auch einen falschen Spaltenindex. Prüfe deine Formel deshalb zuerst ohne WENNFEHLER.</p>

      <h2>Beispiel 3: Rabattstaffel mit ungefährer Suche (Finance)</h2>
      <p>Viele Konditionen sind als Staffel definiert: ab CHF 1'000 Bestellwert 2&nbsp;% Rabatt, ab CHF 5'000 5&nbsp;%, ab CHF 10'000 8&nbsp;%. Hier gibt es für einen Bestellwert von CHF 7'350 keinen exakten Treffer in der Tabelle, und das ist auch nicht nötig.</p>
{T3}
      <p>Die Formel in B2:</p>
      <code class="formula">=SVERWEIS(A2;$D$2:$E$5;2;WAHR)</code>
      <p>Mit <code>WAHR</code> sucht Excel den grössten Wert in D2:D5, der kleiner oder gleich 7'350 ist. Das ist 5'000, also lautet das Ergebnis 5&nbsp;%. Damit das funktioniert, muss die erste Spalte der Staffel aufsteigend sortiert sein und mit der tiefsten Stufe beginnen, hier mit 0. Fehlt die Zeile mit 0, liefert ein Bestellwert unter 1'000 den Fehler <code>#NV</code>, weil es keinen kleineren Wert gibt.</p>
      <p>Das gleiche Muster brauchst du für Provisionsstufen, Steuertarife, Prämienklassen oder Notenskalen. Eine passende Übung mit einer Provisionsstaffel findest du im Premium-Bereich (siehe Kasten unten).</p>

      <h2>Typische Fehler und wie du sie erkennst</h2>
      <h3><code>#NV</code>: Wert nicht gefunden</h3>
      <p>Das ist der häufigste SVERWEIS-Fehler. Die Ursachen:</p>
      <ul>
        <li><strong>Der Wert existiert wirklich nicht.</strong> Prüfe mit der Suche (Ctrl+F, auf dem Mac Cmd+F), ob die Nummer in der ersten Spalte der Matrix vorkommt.</li>
        <li><strong>Unsichtbare Leerzeichen.</strong> «B-130 » mit Leerzeichen am Ende ist für Excel nicht dasselbe wie «B-130». Das passiert oft bei Daten aus ERP-Exporten. Abhilfe: <code>GLÄTTEN()</code> in einer Hilfsspalte.</li>
        <li><strong>Zahl gegen Text.</strong> Steht die Artikelnummer 1001 einmal als Zahl und einmal als Text in der Tabelle (erkennbar an der linksbündigen Ausrichtung oder dem grünen Dreieck), findet SVERWEIS keinen Treffer.</li>
        <li><strong>Der Wert steht nicht in der ersten Spalte der Matrix.</strong> Beginnt deine Matrix bei B statt bei A, sucht Excel in Spalte B.</li>
        <li><strong>Verrutschte Matrix.</strong> Ohne <code>$</code> verschiebt sich <code>A2:C6</code> beim Kopieren nach unten zu <code>A3:C7</code>, <code>A4:C8</code> usw. Die oberen Einträge fallen heraus, und die Formel findet sie nicht mehr.</li>
      </ul>
      <h3><code>#BEZUG!</code> und <code>#WERT!</code>: falscher Spaltenindex</h3>
      <p>Ist der Spaltenindex grösser als die Anzahl Spalten der Matrix, etwa 4 bei einer Matrix A:C, erscheint <code>#BEZUG!</code>. Ein Spaltenindex von 0 oder kleiner führt zu <code>#WERT!</code>.</p>
      <h3><code>#NAME?</code>: Excel kennt einen Namen nicht</h3>
      <p>Du hast den Funktionsnamen falsch geschrieben (zum Beispiel <code>SVERWEISS</code>) oder in der deutschen Excel-Version <code>VLOOKUP</code> getippt. Ebenfalls <code>#NAME?</code> ergibt ein Text-Suchkriterium ohne Anführungszeichen, etwa <code>=SVERWEIS(Toner;…)</code> statt <code>=SVERWEIS("Toner";…)</code>.</p>
      <h3>Komma statt Semikolon</h3>
      <p>Kopierst du eine Formel aus einer englischen Anleitung, etwa <code>=VLOOKUP(E2,A2:C6,3,FALSE)</code>, nimmt die deutschsprachige Excel-Version sie nicht an und meldet ein Problem mit der Formel. Ersetze die Kommas durch Semikolons und die englischen Namen durch die deutschen.</p>
      <h3>Falscher Wert ohne Fehlermeldung</h3>
      <p>Der gefährlichste Fall: Du vergisst das vierte Argument. Excel verwendet dann <code>WAHR</code>, sucht ungefähr und liefert bei einer unsortierten Liste einfach irgendeinen benachbarten Wert. Es erscheint kein Fehler, das Ergebnis sieht plausibel aus und ist trotzdem falsch. Schreibe deshalb bei Nummern und Namen immer ausdrücklich <code>FALSCH</code>.</p>

      <h2>Englisch vs. Deutsch</h2>
      <p>Viele Foren und Tutorials arbeiten mit der englischen Excel-Version. Die Logik ist identisch, nur die Namen und das Trennzeichen unterscheiden sich. Aus <code>=VLOOKUP(E2,$A$2:$C$6,3,FALSE)</code> wird in der Schweizer Excel-Version <code>=SVERWEIS(E2;$A$2:$C$6;3;FALSCH)</code>.</p>
{CMP}
      <p>Excel übersetzt Funktionsnamen automatisch, wenn du eine Datei in einer anderen Sprachversion öffnest. Nur beim Abtippen oder Kopieren von Formeltext musst du selbst übersetzen.</p>'''

practice = '''        <p><strong>SVERWEIS: Preis nachschlagen.</strong> Du bekommst eine kleine Preisliste und holst mit SVERWEIS den Preis zu einer Artikelnummer. Excel-Drills prüft dein Ergebnis sofort und erklärt dir, was schiefgelaufen ist.</p>
        <p>Die Übung ist gratis, braucht keine Anmeldung und läuft direkt im Browser.</p>
        <p><a class="btn" href="../app/#sverweis-1">SVERWEIS-Übung starten</a></p>
        <p>Danach geht es weiter mit der Staffel-Übung «Provisionssatz nach Stufe» mit <code>WAHR</code>: <a href="../app/#sverweis-2">SVERWEIS mit Staffel</a> (Teil von <a href="../premium.html">Premium</a>).</p>'''

faq = [
    ("Was ist der Unterschied zwischen FALSCH und WAHR im SVERWEIS?",
     "Mit FALSCH sucht SVERWEIS nur exakte Treffer und liefert #NV, wenn der Wert fehlt. Mit WAHR sucht Excel den grössten Wert, der kleiner oder gleich dem Suchkriterium ist. Das ist für Staffeln gedacht und setzt eine aufsteigend sortierte erste Spalte voraus. Lässt du das Argument weg, gilt WAHR."),
    ("Warum liefert mein SVERWEIS #NV, obwohl der Wert in der Tabelle steht?",
     "Meist liegt es an unsichtbaren Leerzeichen, an einer Zahl, die als Text gespeichert ist, oder an einer Matrix, die beim Kopieren ohne $-Zeichen verrutscht ist. Prüfe auch, ob der gesuchte Wert in der ersten Spalte der Matrix steht."),
    ("Kann SVERWEIS nach links suchen?",
     "Nein. SVERWEIS sucht immer in der ersten Spalte der Matrix und gibt Werte aus Spalten rechts davon zurück. Für die Suche nach links verwendest du INDEX mit VERGLEICH oder, falls deine Excel-Version sie anbietet, XVERWEIS."),
    ("Sollte ich statt SVERWEIS besser XVERWEIS verwenden?",
     "XVERWEIS ist flexibler: Sie sucht standardmässig exakt, kann nach links suchen und hat einen eingebauten Wert für «nicht gefunden». Sie ist aber nicht in allen Excel-Versionen vorhanden. Wenn du Dateien mit anderen teilst oder in Einstellungstests arbeitest, ist SVERWEIS weiterhin der gemeinsame Nenner, und das Prinzip ist bei beiden gleich."),
]

PAGE = article_page("sverweis.html",
    "SVERWEIS einfach erklärt: Syntax, Beispiele, Übung",
    "SVERWEIS einfach erklärt: Syntax mit Semikolon, Praxisbeispiele aus Büro und Versicherung, typische Fehler wie #NV und eine Gratis-Übung im Browser.",
    "SVERWEIS einfach erklärt",
    "SVERWEIS sucht einen Wert in der ersten Spalte einer Tabelle und gibt den Wert aus einer anderen Spalte derselben Zeile zurück. Die Formel lautet <code>=SVERWEIS(Suchkriterium;Matrix;Spaltenindex;FALSCH)</code>. Mit FALSCH findet Excel nur exakte Treffer, mit WAHR den nächstkleineren Wert, etwa für Rabatt- oder Provisionsstaffeln.",
    body, faq, practice)
