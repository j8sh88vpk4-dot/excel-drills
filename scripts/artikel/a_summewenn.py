from lib import *

T1 = tbl("Kostenbuchungen in A1:C7, Auswertung pro Kostenstelle in E1:F4", [
    ["Kostenstelle", "Kostenart", "Betrag CHF", "", "Kostenstelle", "Total CHF"],
    ["KS-100", "Material", "1'250.00", "", "KS-100", "!2'205.50"],
    ["KS-200", "Reisen", "480.00", "", "KS-200", "!1'600.00"],
    ["KS-100", "Reisen", "315.50", "", "KS-300", "!2'900.00"],
    ["KS-300", "Material", "2'900.00"],
    ["KS-100", "Material", "640.00"],
    ["KS-200", "Material", "1'120.00"],
])
T2 = tbl("Schadenliste in A1:C7, Schwelle in F1", [
    ["Schaden-Nr.", "Sparte", "Betrag CHF", "", "Schwelle", "10'000"],
    ["S-201", "Motorfahrzeug", "3'400"],
    ["S-202", "Gebäude", "18'750"],
    ["S-203", "Haftpflicht", "9'990"],
    ["S-204", "Gebäude", "42'300"],
    ["S-205", "Motorfahrzeug", "1'150"],
    ["S-206", "Haftpflicht", "12'000"],
])
T3 = tbl("Spesenbelege in A1:B6", [
    ["Buchungstext", "Betrag CHF"],
    ["Bahn Zürich–Bern", "51.00"],
    ["Hotel Bern", "189.00"],
    ["Bahn Bern–Zürich", "51.00"],
    ["Taxi Bahnhof", "28.50"],
    ["Mittagessen Kunde", "74.50"],
])
CRIT = compare("Kriterien in SUMMEWENN und ZÄHLENWENN", ["Kriterium", "Bedeutung"], [
    ['<code>"Ost"</code>', "genau gleich «Ost» (Gross-/Kleinschreibung egal)"],
    ['<code>"&lt;&gt;Ost"</code>', "alles ausser «Ost»"],
    ['<code>"&gt;1000"</code>', "grösser als 1000"],
    ['<code>"&gt;="&amp;F1</code>', "grösser oder gleich dem Wert in F1"],
    ['<code>F1</code>', "gleich dem Inhalt von F1"],
    ['<code>"Bahn*"</code>', "beginnt mit «Bahn» (* = beliebig viele Zeichen)"],
    ['<code>"KS-1??"</code>', "«KS-1» plus genau zwei Zeichen (? = ein Zeichen)"],
    ['<code>""</code>', "leere Zelle im Kriterienbereich"],
])
CMP = compare("SUMMEWENN und verwandte Funktionen: Deutsch und Englisch", ["Deutsch", "Englisch", "Bemerkung"], [
    ["SUMMEWENN", "SUMIF", "eine Bedingung"],
    ["SUMMEWENNS", "SUMIFS", "mehrere Bedingungen, Summenbereich zuerst"],
    ["ZÄHLENWENN", "COUNTIF", "zählt statt summiert"],
    ["MITTELWERTWENN", "AVERAGEIF", "Durchschnitt mit Bedingung"],
    ["SUMME", "SUM", "Summe ohne Bedingung"],
    ["SUMMENPRODUKT", "SUMPRODUCT", "für Spezialfälle mit Berechnungen in der Bedingung"],
    ["GLÄTTEN", "TRIM", "entfernt überzählige Leerzeichen"],
])

body = f'''      <h2>Wofür du SUMMEWENN brauchst</h2>
      <p>SUMME addiert alles in einem Bereich. In der Praxis willst du aber fast immer nur einen Teil: die Kosten einer Kostenstelle, den Umsatz einer Region, die Schäden einer Sparte, die Spesen eines Projekts. Ohne SUMMEWENN würdest du filtern, die sichtbaren Zellen markieren und das Ergebnis abschreiben. Das ist langsam, fehleranfällig und muss bei jeder neuen Buchung wiederholt werden. SUMMEWENN erledigt das in einer Formel, die sich automatisch aktualisiert.</p>
      <p>Damit ist SUMMEWENN eine der wichtigsten Funktionen im Controlling und in der Buchhaltung. Wer sie beherrscht, baut Auswertungen, die mit den Daten mitwachsen, statt sie jeden Monat neu zusammenzuklicken.</p>

      <h2>Die Syntax von SUMMEWENN</h2>
      <div class="syntax">
        <code class="formula">=SUMMEWENN(Bereich;Suchkriterien;Summe_Bereich)</code>
        <dl>
          <dt>Bereich</dt>
          <dd>Die Zellen, die Excel mit dem Kriterium vergleicht, zum Beispiel die Spalte mit den Kostenstellen <code>$A$2:$A$7</code>.</dd>
          <dt>Suchkriterien</dt>
          <dd>Die Bedingung. Das kann ein Text in Anführungszeichen sein (<code>"KS-100"</code>), ein Vergleich in Anführungszeichen (<code>"&gt;10000"</code>) oder ein Zellbezug (<code>E2</code>).</dd>
          <dt>Summe_Bereich (optional)</dt>
          <dd>Die Zellen, die addiert werden, zum Beispiel die Beträge <code>$C$2:$C$7</code>. Lässt du das Argument weg, summiert Excel direkt die Zellen in <em>Bereich</em>. Das ist praktisch, wenn Bedingung und Beträge in derselben Spalte stehen.</dd>
        </dl>
      </div>
      <p>Wichtig: <em>Bereich</em> und <em>Summe_Bereich</em> sollten gleich gross sein und in derselben Zeile beginnen. Excel ordnet die Zellen paarweise zu: Erfüllt die dritte Zelle im Kriterienbereich die Bedingung, wird die dritte Zelle im Summenbereich addiert.</p>
      <h3>So schreibst du Kriterien</h3>
{CRIT}
      <p>Merke: Sobald ein Vergleichsoperator wie <code>&gt;</code>, <code>&lt;</code> oder <code>&lt;&gt;</code> im Spiel ist, gehört er in Anführungszeichen. Willst du ihn mit einem Zellwert kombinieren, verbindest du beides mit dem Und-Zeichen: <code>"&gt;"&amp;F1</code>.</p>

      <h2>Beispiel 1: Kosten pro Kostenstelle (Controlling)</h2>
      <p>Aus der Finanzbuchhaltung bekommst du eine Liste aller Kostenbuchungen. Du willst für jede Kostenstelle das Total sehen.</p>
{T1}
      <p>Die Formel in F2, danach bis F4 nach unten kopiert:</p>
      <code class="formula">=SUMMEWENN($A$2:$A$7;E2;$C$2:$C$7)</code>
      <p>Für KS-100 addiert Excel die Zeilen 2, 4 und 6: 1'250.00 + 315.50 + 640.00 = 2'205.50. Weil das Kriterium als Zellbezug <code>E2</code> geschrieben ist, passt es sich beim Kopieren an (E3, E4), während die beiden Bereiche dank <code>$</code> fix bleiben. So baust du mit einer einzigen Formel eine komplette Kostenstellen-Übersicht.</p>
      <p>Willst du zusätzlich nach Kostenart filtern, also nur das Material der KS-100, brauchst du zwei Bedingungen. Das kann SUMMEWENN nicht, dafür gibt es SUMMEWENNS:</p>
      <code class="formula">=SUMMEWENNS($C$2:$C$7;$A$2:$A$7;"KS-100";$B$2:$B$7;"Material")</code>
      <p>Ergebnis: 1'890.00. Achtung, bei SUMMEWENNS steht der Summenbereich <strong>zuerst</strong>, danach folgen beliebig viele Paare aus Kriterienbereich und Kriterium. Diese vertauschte Reihenfolge ist eine klassische Stolperfalle.</p>

      <h2>Beispiel 2: Grossschäden über einer Schwelle (Versicherung)</h2>
      <p>In der Schadenstatistik interessieren dich die Grossschäden: Wie hoch ist die Summe aller Fälle über CHF 10'000?</p>
{T2}
      <p>Weil Bedingung und Betrag in derselben Spalte stehen, reicht eine Formel mit zwei Argumenten:</p>
      <code class="formula">=SUMMEWENN(C2:C7;"&gt;10000")</code>
      <p>Ergebnis: 18'750 + 42'300 + 12'000 = 73'050. Der Fall S-203 mit 9'990 bleibt draussen. Flexibler wird die Auswertung, wenn die Schwelle in einer eigenen Zelle steht, hier F1. Dann kannst du sie ändern, ohne die Formel anzufassen:</p>
      <code class="formula">=SUMMEWENN(C2:C7;"&gt;"&amp;F1)</code>
      <p>Und für die Summe aller Gebäudeschäden nutzt du wieder drei Argumente: <code>=SUMMEWENN(B2:B7;"Gebäude";C2:C7)</code> ergibt 61'050.</p>

      <h2>Beispiel 3: Spesen mit Platzhaltern auswerten (Büro)</h2>
      <p>Buchungstexte sind selten einheitlich. Mit dem Platzhalter <code>*</code> fasst du alle Bahnspesen zusammen, egal welche Strecke dahintersteht.</p>
{T3}
      <code class="formula">=SUMMEWENN(A2:A6;"Bahn*";B2:B6)</code>
      <p>Ergebnis: 102.00, nämlich die beiden Bahnbillette. «Taxi Bahnhof» zählt nicht, weil der Text nicht mit «Bahn» beginnt. Schreibst du dagegen <code>"*Bahn*"</code>, findet Excel «Bahn» an jeder Stelle im Text, und das Taxi wird mit 28.50 mitgezählt: 130.50. Überlege dir also genau, ob du «beginnt mit» oder «enthält» meinst.</p>

      <h2>Typische Fehler und wie du sie erkennst</h2>
      <h3><code>#NAME?</code></h3>
      <p>Zwei Ursachen sind typisch. Erstens ein englischer oder falsch geschriebener Funktionsname, etwa <code>SUMIF</code> in der deutschen Excel-Version. Zweitens ein Text-Kriterium ohne Anführungszeichen: <code>=SUMMEWENN(A2:A7;KS100;C2:C7)</code> interpretiert Excel als Namen eines Bereichs, den es nicht gibt. Richtig ist <code>"KS100"</code>.</p>
      <h3>Excel nimmt die Formel gar nicht an</h3>
      <p>Steht ein Vergleichsoperator ohne Anführungszeichen im Kriterium, also <code>=SUMMEWENN(C2:C7;&gt;10000)</code>, oder trennst du die Argumente mit Kommas statt Semikolons, meldet Excel beim Bestätigen ein Problem mit der Formel. Prüfe zuerst die Anführungszeichen, dann die Trennzeichen.</p>
      <h3>Ergebnis 0, obwohl es Treffer geben müsste</h3>
      <ul>
        <li><strong>Leerzeichen oder Tippfehler</strong> im Kriterium oder in den Daten: «KS-100 » ist nicht «KS-100».</li>
        <li><strong>Zahlen als Text</strong> im Summenbereich: SUMMEWENN ignoriert Textwerte. Beträge aus Exporten sind oft linksbündig und mit grünem Dreieck markiert. Wandle sie in Zahlen um.</li>
        <li><strong>Falsch geschriebener Operator:</strong> <code>"=&gt;1000"</code> statt <code>"&gt;=1000"</code>. Excel sucht dann nach dem Text «&gt;1000» und findet nichts.</li>
        <li><strong>Zellbezug in Anführungszeichen:</strong> <code>"&gt;F1"</code> vergleicht mit dem Text «F1», nicht mit dem Wert in F1. Richtig: <code>"&gt;"&amp;F1</code>.</li>
      </ul>
      <h3>Falsches Ergebnis ohne Fehlermeldung</h3>
      <p>Wenn <em>Bereich</em> und <em>Summe_Bereich</em> unterschiedlich gross sind oder versetzt beginnen, rechnet Excel trotzdem, aber mit falsch zugeordneten Zeilen. Kontrolliere deshalb, dass beide Bereiche in derselben Zeile starten und enden. Ebenfalls heimtückisch: fehlende <code>$</code>-Zeichen. Kopierst du <code>=SUMMEWENN(A2:A7;E2;C2:C7)</code> nach unten, rutschen die Bereiche zu A3:A8 und C3:C8, und die erste Buchungszeile fällt aus der Auswertung.</p>

      <h2>Englisch vs. Deutsch</h2>
      <p>Aus <code>=SUMIF(A2:A7,"KS-100",C2:C7)</code> in einer englischen Anleitung wird in der Schweizer Excel-Version <code>=SUMMEWENN(A2:A7;"KS-100";C2:C7)</code>. Die Kriterien selbst, also Text, Operatoren und Platzhalter, bleiben gleich.</p>
{CMP}'''

practice = '''        <p><strong>Zwei Gratis-Übungen zu SUMMEWENN:</strong> In «Umsatz einer Region» summierst du alle Umsätze der Region Ost, in «Bestellungen über 3 Stück» arbeitest du mit einem Vergleichskriterium. Excel-Drills prüft deine Formel sofort und sagt dir, wenn zum Beispiel Anführungszeichen fehlen.</p>
        <p>Beide Übungen sind gratis, brauchen keine Anmeldung und laufen direkt im Browser.</p>
        <p><a class="btn" href="../app/#summewenn-1">Übung 1: Umsatz einer Region</a> <a class="btn btn-secondary" href="../app/#summewenn-2">Übung 2: Bestellungen über 3 Stück</a></p>'''

faq = [
    ("Was ist der Unterschied zwischen SUMMEWENN und SUMMEWENNS?",
     "SUMMEWENN prüft genau eine Bedingung, SUMMEWENNS beliebig viele, die alle gleichzeitig erfüllt sein müssen. Ausserdem ist die Reihenfolge anders: Bei SUMMEWENN steht der Summenbereich am Schluss, bei SUMMEWENNS am Anfang."),
    ("Warum gibt SUMMEWENN 0 zurück?",
     "Meist findet Excel keine Treffer, weil Leerzeichen oder Tippfehler im Kriterium stecken, oder die Beträge im Summenbereich sind als Text gespeichert. Prüfe auch, ob ein Zellbezug versehentlich in Anführungszeichen steht, etwa \">F1\" statt \">\"&F1."),
    ("Wie kombiniere ich ein Grösser-als-Kriterium mit einer Zelle?",
     "Setze den Operator in Anführungszeichen und verbinde ihn mit dem Und-Zeichen mit der Zelle: =SUMMEWENN(C2:C7;\">\"&F1). So kannst du die Schwelle in F1 ändern, ohne die Formel anzupassen."),
    ("Kann SUMMEWENN nach Teiltexten suchen?",
     "Ja, mit Platzhaltern. Das Sternchen steht für beliebig viele Zeichen, das Fragezeichen für genau ein Zeichen. \"Bahn*\" findet alle Texte, die mit Bahn beginnen, \"*Bahn*\" alle, die Bahn irgendwo enthalten."),
]

PAGE = article_page("summewenn.html",
    "SUMMEWENN: Übung und Erklärung mit Beispielen",
    "SUMMEWENN Übung und Erklärung: Syntax, Kriterien mit Anführungszeichen, Beispiele aus Controlling und Versicherung, typische Fehler und Gratis-Übungen.",
    "SUMMEWENN: Übung und Erklärung",
    "SUMMEWENN addiert nur die Werte, deren Zeile eine Bedingung erfüllt, zum Beispiel alle Kosten einer Kostenstelle. Die Formel lautet <code>=SUMMEWENN(Bereich;Suchkriterien;Summe_Bereich)</code>. Text und Vergleiche wie <code>\"&gt;3\"</code> stehen im Kriterium immer in Anführungszeichen.",
    body, faq, practice)
