from lib import *

# Rundung auf 5 Rappen. Alle Beispielwerte nachgerechnet (kaufmännisch, Halbwert weg von null), Stand 1. November 2026.
# MwSt-Normalsatz 8.1 % (seit 1.1.2024).

T1 = tbl("Beträge in A2:A5, gerundet mit =VRUNDEN(A2;0.05) in B", [
    ["Betrag CHF", "VRUNDEN auf 0.05", "Warum"],
    ["12.32", "!12.30", "12.30 liegt 2 Rappen weg, 12.35 liegt 3 Rappen weg"],
    ["12.33", "!12.35", "12.35 liegt 2 Rappen weg, 12.30 liegt 3 Rappen weg"],
    ["12.37", "!12.35", "12.35 ist näher als 12.40"],
    ["12.375", "!12.40", "genau in der Mitte, Excel rundet weg von null"],
])
T2 = tbl("Rechnung mit MwSt 8.1 % in A1:B7", [
    ["Position", "Betrag CHF"],
    ["Beratung", "1'250.50"],
    ["Material", "380.00"],
    ["Spesen", "94.35"],
    ["Total netto", "1'724.85"],
    ["MwSt 8.1 %", "!139.71"],
    ["Total brutto, auf 5 Rappen", "!1'864.55"],
])
T3 = tbl("Preisliste: Einstandspreis in A, Verkaufspreis mit Faktor 1.35 in B bis D", [
    ["Einstand CHF", "VRUNDEN", "OBERGRENZE", "UNTERGRENZE"],
    ["7.80", "!10.55", "10.55", "10.50"],
    ["12.40", "!16.75", "16.75", "16.70"],
    ["3.15", "!4.25", "4.30", "4.25"],
    ["22.90", "!30.90", "30.95", "30.90"],
])
T4 = tbl("Kassenabrechnung: Bons in A2:A6, Barbetrag in B, Rundungsdifferenz in C", [
    ["Bon CHF", "Bar CHF", "Differenz"],
    ["23.47", "!23.45", "-0.02"],
    ["8.92", "!8.90", "-0.02"],
    ["115.38", "!115.40", "0.02"],
    ["61.04", "!61.05", "0.01"],
    ["4.98", "!5.00", "0.02"],
    ["213.79", "!213.80", "0.01"],
])
CMP = compare("Rundungsfunktionen: Deutsch und Englisch", ["Deutsch", "Englisch", "macht …"], [
    ["VRUNDEN", "MROUND", "rundet auf das nächste Vielfache, z. B. 0.05"],
    ["RUNDEN", "ROUND", "rundet kaufmännisch auf eine Anzahl Stellen"],
    ["AUFRUNDEN", "ROUNDUP", "rundet immer auf, weg von null"],
    ["ABRUNDEN", "ROUNDDOWN", "rundet immer ab, Richtung null"],
    ["OBERGRENZE", "CEILING", "rundet auf das nächste Vielfache nach oben"],
    ["UNTERGRENZE", "FLOOR", "rundet auf das nächste Vielfache nach unten"],
    ["KÜRZEN", "TRUNC", "schneidet Nachkommastellen ab, ohne zu runden"],
])

body = f'''      <h2>Warum in der Schweiz auf 5 Rappen gerundet wird</h2>
      <p>Die kleinste Münze in der Schweiz ist das 5-Rappen-Stück. Einen Betrag wie CHF 47.33 kann an der Kasse niemand bar auf den Rappen genau bezahlen. Deshalb werden Barbeträge, Rechnungstotale und viele Preislisten auf 5 Rappen gerundet: 47.33 wird zu 47.35, 47.32 zu 47.30. Gerundet wird kaufmännisch, also zum nächstgelegenen Vielfachen von 0.05.</p>
      <p>Bei Karte, TWINT oder Überweisung ist das technisch nicht nötig, dort wird oft rappengenau abgerechnet. In der Praxis runden viele Betriebe das Rechnungstotal trotzdem auf 5 Rappen, damit derselbe Betrag bar und elektronisch bezahlt werden kann. Für dich in Excel heisst das: Du brauchst beides, die Rundung auf den Rappen mit <code>RUNDEN</code> und die Rundung auf 5 Rappen mit <code>VRUNDEN</code>.</p>

      <h2>VRUNDEN: Syntax und Beispiele</h2>
      <div class="syntax">
        <code class="formula">=VRUNDEN(Zahl;Vielfaches)</code>
        <dl>
          <dt>Zahl</dt>
          <dd>Der Betrag, den du runden willst, meist ein Zellbezug wie <code>A2</code> oder eine Formel wie <code>B5*1.081</code>.</dd>
          <dt>Vielfaches</dt>
          <dd>Auf welches Vielfache gerundet wird. Für 5 Rappen ist das <code>0.05</code>, für 10 Rappen <code>0.1</code>, für ganze Franken <code>1</code>.</dd>
        </dl>
      </div>
      <p>VRUNDEN sucht das nächstgelegene Vielfache von 0.05. Liegt der Betrag genau in der Mitte zwischen zwei Vielfachen, rundet Excel weg von null, also bei positiven Beträgen auf.</p>
{T1}
      <code class="formula">=VRUNDEN(A2;0.05)</code>
      <p>Bei 12.375 liegen 12.35 und 12.40 genau gleich weit entfernt, deshalb wird aufgerundet. Solche exakten Halbwerte sind selten, weil Rechnungsbeträge meist schon auf den Rappen gerundet sind. Kommen sie aus einer Berechnung, kann die interne Gleitkomma-Darstellung von Excel in Einzelfällen eine Rolle spielen. Die Variante mit <code>RUNDEN</code> weiter unten ist hier besonders robust.</p>

      <h2>Alternativen und ihre Unterschiede</h2>
      <h3>RUNDEN(Betrag*20;0)/20</h3>
      <p>Ein Franken hat zwanzig 5-Rappen-Stücke. Multiplizierst du den Betrag mit 20, rundest auf eine ganze Zahl und teilst wieder durch 20, erhältst du dasselbe Ergebnis wie mit VRUNDEN:</p>
      <code class="formula">=RUNDEN(A2*20;0)/20</code>
      <p>Diese Formel hat zwei Vorteile: Sie funktioniert auch mit negativen Beträgen wie Gutschriften, und sie läuft in jeder Excel-Version und in jeder Tabellenkalkulation. Gleichwertig ist <code>=RUNDEN(A2/0.05;0)*0.05</code>.</p>
      <h3>OBERGRENZE und UNTERGRENZE</h3>
      <p>Willst du immer auf die nächsten 5 Rappen aufrunden, etwa bei Verkaufspreisen, nimmst du <code>=OBERGRENZE(A2;0.05)</code>. Aus 4.2525 wird dann 4.30 statt 4.25. Für das Abrunden auf 5 Rappen gibt es <code>=UNTERGRENZE(A2;0.05)</code>. AUFRUNDEN und ABRUNDEN arbeiten dagegen mit einer Anzahl Stellen, nicht mit einem Vielfachen: <code>=AUFRUNDEN(A2;1)</code> rundet auf 10 Rappen auf.</p>
      <h3>RUNDEN(…;2) für rappengenaue Beträge</h3>
      <p>Für Zwischenresultate wie einen MwSt-Betrag rundest du auf den Rappen: <code>=RUNDEN(B5*8.1%;2)</code>. Erst das Endtotal kommt auf 5 Rappen. Wer schon die einzelnen Positionen auf 5 Rappen rundet, sammelt unnötige Differenzen.</p>
      <h3>Formatierung ist keine Rundung</h3>
      <p>Das Zahlenformat mit zwei Dezimalstellen ändert nur die Anzeige, nicht den Wert. Drei Positionen mit je 10.333 erscheinen als 10.33, Excel summiert aber 30.999 und zeigt 31.00. Auf dem Papier ergibt die Summe der sichtbaren Werte 30.99, und die Rechnung geht nicht auf. Ein Format, das auf 5 Rappen rundet, gibt es ohnehin nicht. Runde deshalb immer im Wert, mit RUNDEN oder VRUNDEN, und rechne mit den gerundeten Zellen weiter.</p>

      <h2>Praxisfall 1: Rechnungstotal mit MwSt 8.1 %</h2>
      <p>Eine Rechnung hat drei Positionen. Die MwSt beträgt 8.1&nbsp;% (Normalsatz seit 2024), das Total soll auf 5 Rappen gerundet werden.</p>
{T2}
      <p>Netto in B5 mit <code>=SUMME(B2:B4)</code>, die MwSt in B6 rappengenau:</p>
      <code class="formula">=RUNDEN(B5*8.1%;2)</code>
      <p>Ungerundet wären es 139.71285, gerundet 139.71. Das Total in B7:</p>
      <code class="formula">=VRUNDEN(B5+B6;0.05)</code>
      <p>Aus 1'864.56 wird 1'864.55. Steht der MwSt-Satz in einer eigenen Zelle, etwa E1, schreibst du <code>=RUNDEN(B5*$E$1;2)</code>. Warum das <code>$</code> nötig ist, erklärt der Artikel über <a href="absolute-bezuege.html">absolute Bezüge</a>. Die Rundungsdifferenz von minus 1 Rappen weist du auf Wunsch in einer eigenen Zeile aus: <code>=B7-(B5+B6)</code>.</p>

      <h2>Praxisfall 2: Preisliste in Rappen</h2>
      <p>Für eine Preisliste rechnest du die Verkaufspreise aus dem Einstandspreis mal Faktor 1.35. Krumme Beträge wie 10.53 sollen auf 5 Rappen gerundet werden.</p>
{T3}
      <code class="formula">=VRUNDEN(A2*1.35;0.05)</code>
      <p>Aus 22.90 × 1.35 = 30.915 wird mit VRUNDEN 30.90, mit <code>=OBERGRENZE(A2*1.35;0.05)</code> 30.95. Welche Variante richtig ist, ist eine Preisentscheidung: VRUNDEN rundet fair in beide Richtungen, OBERGRENZE sichert die Marge.</p>

      <h2>Praxisfall 3: Kassenabrechnung</h2>
      <p>Bei Barzahlung wird jeder Bon einzeln auf 5 Rappen gerundet. In der Abrechnung willst du sehen, wie viel Rundungsdifferenz zusammenkommt.</p>
{T4}
      <p>In B2 <code>=VRUNDEN(A2;0.05)</code>, in C2 <code>=B2-A2</code>, beides nach unten kopieren. Die Summen in Zeile 7 bildest du mit SUMME. Die Kasse sollte 213.80 enthalten, die Rundungsdifferenz über alle Bons beträgt 1 Rappen. Wichtig: Gerundet wird pro Bon, nicht erst das Tagestotal. Dass beides hier dasselbe ergibt, ist Zufall.</p>

      <h2>Typische Fehler</h2>
      <h3><code>#ZAHL!</code> bei negativen Beträgen</h3>
      <p>VRUNDEN verlangt, dass Zahl und Vielfaches dasselbe Vorzeichen haben. <code>=VRUNDEN(-12.33;0.05)</code> ergibt <code>#ZAHL!</code>. Richtig ist <code>=VRUNDEN(-12.33;-0.05)</code> mit dem Ergebnis -12.35. Bei Listen mit Rechnungen und Gutschriften ist <code>=RUNDEN(A2*20;0)/20</code> einfacher, weil sie beide Vorzeichen ohne Anpassung verarbeitet.</p>
      <h3>Komma statt Punkt</h3>
      <p>In der Schweizer Excel-Version ist der Punkt das Dezimalzeichen: <code>0.05</code>. Mit <code>0,05</code> nimmt Excel die Formel nicht an oder rechnet falsch. Umgekehrt brauchst du mit deutschen oder österreichischen Regionaleinstellungen <code>0,05</code>. Massgebend sind die Regionaleinstellungen deines Computers, nicht die Sprache von Excel.</p>
      <h3><code>#NAME?</code> mit MROUND</h3>
      <p><code>=MROUND(A2;0.05)</code> ist der englische Name. In der deutschen Excel-Version ergibt er <code>#NAME?</code>, richtig ist <code>VRUNDEN</code>. Dasselbe gilt für ROUND, CEILING und FLOOR.</p>
      <h3>Nur formatiert statt gerundet</h3>
      <p>Wie oben gezeigt: Zwei Dezimalstellen im Format sind keine Rundung. Wenn ein Total um einen Rappen nicht stimmt, prüfe mit einem Klick in die Zelle, welcher Wert in der Bearbeitungsleiste steht.</p>

      <h2>Englisch vs. Deutsch</h2>
      <p>Aus <code>=MROUND(A2,0.05)</code> wird in der Schweizer Excel-Version <code>=VRUNDEN(A2;0.05)</code>, mit Semikolon als Trennzeichen.</p>
{CMP}
      <p>Rundung auf 5 Rappen gehört zu den Grundlagen in der Buchhaltung und an der KV-Prüfung. Weitere typische Aufgaben findest du in unseren <a href="excel-uebungen-kv.html">Excel-Übungen für das KV</a>. Wie sich Excel-Drills von anderen Übungsplattformen unterscheidet, zeigt der <a href="excel-ueben-online-vergleich.html">Vergleich von 6 Plattformen</a>.</p>'''

practice = '''        <p><strong>RUNDEN: Auf Rappen runden.</strong> Du rundest einen Betrag kaufmännisch auf zwei Nachkommastellen. Excel-Drills prüft deine Formel sofort und meldet sich, wenn zum Beispiel <code>ROUND</code> statt <code>RUNDEN</code> oder ein Komma statt Semikolon drinsteht.</p>
        <p>18 Übungen sind gratis, ohne Anmeldung, direkt im Browser. Die Übung «Auf 5 Rappen runden» mit VRUNDEN findest du im <a href="../pfad/accounting.html">Lernpfad Accounting &amp; Controlling</a>.</p>
        <p><a class="btn" href="../app/#runden-1">Rundungs-Übung starten</a></p>'''

faq = [
    ("VRUNDEN oder RUNDEN: Was ist besser für 5 Rappen?",
     "Beide liefern bei positiven Beträgen dasselbe Ergebnis: =VRUNDEN(A2;0.05) und =RUNDEN(A2*20;0)/20. VRUNDEN ist besser lesbar. RUNDEN(…*20;0)/20 funktioniert zusätzlich mit negativen Beträgen ohne Anpassung und ist bei exakten Halbwerten robuster."),
    ("Warum zeigt Excel 12.35, rechnet aber mit 12.346?",
     "Weil die Zelle nur auf zwei Dezimalstellen formatiert ist. Das Format ändert die Anzeige, nicht den Wert. Runde im Wert mit RUNDEN oder VRUNDEN und rechne mit der gerundeten Zelle weiter. Prüfe auch, ob die Folgeformel auf die gerundete Zelle verweist und nicht auf den Ursprungsbetrag."),
    ("Wie runde ich immer auf 5 Rappen auf?",
     "Mit =OBERGRENZE(A2;0.05). Aus 4.2525 wird 4.30, aus 10.51 wird 10.55. Zum Abrunden nimmst du =UNTERGRENZE(A2;0.05)."),
    ("Gilt die 5-Rappen-Rundung auch für Deutschland?",
     "Nein. In Deutschland und Österreich sind 1- und 2-Cent-Münzen im Umlauf, Beträge werden centgenau abgerechnet. Dort rundest du mit =RUNDEN(A2;2) auf zwei Stellen, mit deutschen Regionaleinstellungen und Komma als Dezimalzeichen."),
    ("Funktioniert VRUNDEN in Google Sheets?",
     "Ja. MROUND funktioniert in Google Sheets immer, mit deutscher Spracheinstellung wird auch VRUNDEN erkannt. Die Variante =RUNDEN(A2*20;0)/20 bzw. =ROUND(A2*20,0)/20 läuft ebenfalls."),
]

PAGE = article_page("vrunden-5-rappen.html",
    "Excel auf 5 Rappen runden: VRUNDEN mit Beispielen",
    "Excel auf 5 Rappen runden mit VRUNDEN: Syntax, Rechnung mit MwSt 8.1 %, Preisliste und Kasse, Alternativen mit RUNDEN und OBERGRENZE, typische Fehler.",
    "Excel auf 5 Rappen runden mit VRUNDEN",
    "Auf 5 Rappen rundest du in Excel mit <code>=VRUNDEN(Betrag;0.05)</code>: Aus 12.32 wird 12.30, aus 12.33 wird 12.35. Gleichwertig ist <code>=RUNDEN(Betrag*20;0)/20</code>, die auch mit negativen Beträgen funktioniert. Immer aufrunden kannst du mit <code>=OBERGRENZE(Betrag;0.05)</code>.",
    body, faq, practice, date_iso="2026-11-01", date_text="1. November 2026")
