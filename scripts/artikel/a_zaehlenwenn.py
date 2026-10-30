from lib import *

T1 = tbl("Pendenzenliste in A1:C8, Auswertung pro Person in E1:F4", [
    ["Pendenz", "Verantwortlich", "Status", "", "Person", "Anzahl"],
    ["P-01", "Gerber", "offen", "", "Gerber", "!3"],
    ["P-02", "Steiner", "erledigt", "", "Steiner", "!2"],
    ["P-03", "Gerber", "in Arbeit", "", "Weber", "!2"],
    ["P-04", "Weber", "offen"],
    ["P-05", "Steiner", "offen"],
    ["P-06", "Gerber", "erledigt"],
    ["P-07", "Weber", "erledigt"],
])
T2 = tbl("Schadenfälle in A1:B8", [
    ["Schaden-Nr.", "Betrag CHF"],
    ["S-401", "3'400"],
    ["S-402", "18'750"],
    ["S-403", "9'990"],
    ["S-404", "42'300"],
    ["S-405", "1'150"],
    ["S-406", "12'000"],
    ["S-407", "10'000"],
])
T3 = tbl("Kundennummern in A1:A9, Prüfung in B und C", [
    ["Kunden-Nr.", "Vorkommen", "Prüfung"],
    ["K-1001", "1", ""],
    ["K-1002", "!2", "!Duplikat"],
    ["K-1003", "!2", "!Duplikat"],
    ["K-1002", "!2", "!Duplikat"],
    ["K-1004", "1", ""],
    ["K-1005", "1", ""],
    ["K-1003", "!2", "!Duplikat"],
    ["K-1006", "1", ""],
])
CRIT = compare("Kriterien in ZÄHLENWENN", ["Kriterium", "zählt Zellen, die …"], [
    ['<code>"offen"</code>', "genau «offen» enthalten (Gross-/Kleinschreibung egal)"],
    ['<code>"&lt;&gt;erledigt"</code>', "nicht «erledigt» enthalten, auch leere Zellen"],
    ['<code>"&gt;=10000"</code>', "eine Zahl grösser oder gleich 10'000 enthalten"],
    ['<code>"&gt;="&amp;E1</code>', "grösser oder gleich dem Wert in E1 sind"],
    ['<code>E2</code>', "gleich dem Inhalt von E2 sind"],
    ['<code>"*AG"</code>', "auf «AG» enden"],
    ['<code>"&lt;&gt;"</code>', "nicht leer sind"],
    ['<code>""</code>', "leer sind"],
])
CMP = compare("ZÄHLENWENN und verwandte Funktionen: Deutsch und Englisch", ["Deutsch", "Englisch", "zählt …"], [
    ["ZÄHLENWENN", "COUNTIF", "Zellen, die ein Kriterium erfüllen"],
    ["ZÄHLENWENNS", "COUNTIFS", "Zellen, die mehrere Kriterien gleichzeitig erfüllen"],
    ["ANZAHL", "COUNT", "Zellen mit Zahlen"],
    ["ANZAHL2", "COUNTA", "nicht leere Zellen"],
    ["ANZAHLLEEREZELLEN", "COUNTBLANK", "leere Zellen"],
    ["SUMMEWENN", "SUMIF", "summiert statt zählt"],
    ["IDENTISCH", "EXACT", "vergleicht Text mit Gross-/Kleinschreibung"],
])

body = f'''      <h2>Wofür du ZÄHLENWENN brauchst</h2>
      <p>Wie viele Rechnungen sind noch offen? Wie viele Schadenfälle liegen über CHF 10'000? Wie viele Pendenzen hat jede Person auf dem Tisch? Kommt eine Kundennummer doppelt vor? Alle diese Fragen beantwortest du mit ZÄHLENWENN. Die Funktion zählt Zellen, die eine Bedingung erfüllen, und aktualisiert sich automatisch, sobald sich die Daten ändern.</p>
      <p>ZÄHLENWENN ist die Schwester von <a href="summewenn.html">SUMMEWENN</a>: Die Kriterien funktionieren genau gleich, nur dass gezählt statt summiert wird. Wer eine der beiden Funktionen sicher beherrscht, hat die andere praktisch schon gelernt.</p>

      <h2>Die Syntax von ZÄHLENWENN</h2>
      <div class="syntax">
        <code class="formula">=ZÄHLENWENN(Bereich;Suchkriterien)</code>
        <dl>
          <dt>Bereich</dt>
          <dd>Die Zellen, die gezählt werden sollen, wenn sie das Kriterium erfüllen, zum Beispiel die Statusspalte <code>C2:C8</code>. Leere Zellen und Zellen mit anderem Inhalt werden nicht mitgezählt.</dd>
          <dt>Suchkriterien</dt>
          <dd>Die Bedingung. Ein Text wie <code>"offen"</code> und ein Vergleich wie <code>"&gt;=10000"</code> stehen in Anführungszeichen. Eine reine Zahl (<code>5</code>) oder ein Zellbezug (<code>E2</code>) brauchen keine.</dd>
        </dl>
      </div>
      <p>Anders als SUMMEWENN hat ZÄHLENWENN kein drittes Argument: Gezählt wird immer im selben Bereich, der auch geprüft wird.</p>
      <h3>Die wichtigsten Kriterien</h3>
{CRIT}

      <h2>Beispiel 1: Pendenzen nach Status und Person (Büro)</h2>
      <p>Im Team führt ihr eine Pendenzenliste. Du willst wissen, wie viele Pendenzen offen sind und wie viele jede Person insgesamt hat.</p>
{T1}
      <p>Anzahl offener Pendenzen:</p>
      <code class="formula">=ZÄHLENWENN(C2:C8;"offen")</code>
      <p>Ergebnis: 3. «in Arbeit» zählt nicht, weil der Text nicht genau «offen» lautet. Willst du alles, was noch nicht erledigt ist, nimmst du das Ungleich-Kriterium: <code>=ZÄHLENWENN(C2:C8;"&lt;&gt;erledigt")</code> ergibt 4. Achtung: Dieses Kriterium zählt auch leere Zellen, falls der Bereich über die Liste hinausgeht.</p>
      <p>Für die Auswertung pro Person steht der Name in E2 bis E4, und die Formel in F2 wird nach unten kopiert:</p>
      <code class="formula">=ZÄHLENWENN($B$2:$B$8;E2)</code>
      <p>Der Bereich ist mit <code>$</code> fixiert, das Kriterium <code>E2</code> wandert beim Kopieren mit. Gerber hat 3 Pendenzen, Steiner und Weber je 2.</p>
      <p>Willst du die offenen Pendenzen pro Person, kombinierst du zwei Bedingungen mit ZÄHLENWENNS:</p>
      <code class="formula">=ZÄHLENWENNS($B$2:$B$8;E2;$C$2:$C$8;"offen")</code>
      <p>Für Gerber ergibt das 1. ZÄHLENWENNS nimmt beliebig viele Paare aus Bereich und Kriterium und zählt nur die Zeilen, in denen alle Bedingungen gleichzeitig zutreffen.</p>

      <h2>Beispiel 2: Grossschäden zählen und Anteil berechnen (Versicherung)</h2>
      <p>In der Schadenstatistik willst du wissen, wie viele Fälle die Grenze von CHF 10'000 erreichen und welchen Anteil sie an allen Fällen haben.</p>
{T2}
      <code class="formula">=ZÄHLENWENN(B2:B8;"&gt;=10000")</code>
      <p>Ergebnis: 4. Mit <code>"&gt;10000"</code> wären es nur 3, weil S-407 mit genau 10'000 dann nicht mehr dazugehört. Ob die Grenze dazugehört, ist eine fachliche Frage, die du klären solltest, bevor du die Formel baust. In Formeln schreibst du Zahlen übrigens ohne Hochkomma: <code>10000</code>, nicht <code>10'000</code>.</p>
      <p>Den Anteil der Grossschäden an allen Fällen berechnest du, indem du durch die Anzahl aller Beträge teilst:</p>
      <code class="formula">=ZÄHLENWENN(B2:B8;"&gt;=10000")/ANZAHL(B2:B8)</code>
      <p>Ergebnis: 4 von 7, also rund 57.1&nbsp;%, wenn du die Zelle als Prozent formatierst. ANZAHL zählt alle Zellen mit Zahlen und ist hier der richtige Nenner.</p>
      <p>Für Bandbreiten, etwa alle Fälle zwischen CHF 5'000 und CHF 10'000, setzt du zwei Bedingungen auf denselben Bereich: <code>=ZÄHLENWENNS(B2:B8;"&gt;=5000";B2:B8;"&lt;10000")</code>. Das ergibt 1 (S-403).</p>

      <h2>Beispiel 3: Doppelte Kundennummern finden (Finance)</h2>
      <p>Vor einem Import in die Buchhaltung oder einem Serienbrief willst du sicher sein, dass jede Kundennummer nur einmal vorkommt. ZÄHLENWENN zählt für jede Zeile, wie oft die Nummer in der ganzen Liste steht.</p>
{T3}
      <p>Die Formel in B2, nach unten kopiert:</p>
      <code class="formula">=ZÄHLENWENN($A$2:$A$9;A2)</code>
      <p>Jeder Wert grösser als 1 ist ein Duplikat. Mit WENN machst du daraus einen lesbaren Hinweis in Spalte C:</p>
      <code class="formula">=WENN(ZÄHLENWENN($A$2:$A$9;A2)&gt;1;"Duplikat";"")</code>
      <p>Hier sind die <code>$</code>-Zeichen entscheidend. Ohne sie würde der Bereich beim Kopieren mit nach unten wandern, und spätere Zeilen würden ihre Duplikate weiter oben nicht mehr sehen.</p>

      <h2>Typische Fehler und wie du sie erkennst</h2>
      <h3><code>#NAME?</code></h3>
      <p><code>=ZÄHLENWENN(C2:C8;offen)</code> liefert <code>#NAME?</code>, weil Excel «offen» ohne Anführungszeichen für einen Bereichsnamen hält. Richtig ist <code>"offen"</code>. Auch <code>COUNTIF</code> in der deutschen Excel-Version oder ein Tippfehler wie <code>ZAEHLENWENN</code> führen zu <code>#NAME?</code>.</p>
      <h3>Excel nimmt die Formel nicht an</h3>
      <p>Ein Operator ohne Anführungszeichen (<code>=ZÄHLENWENN(B2:B8;&gt;=10000)</code>) oder Kommas statt Semikolons (<code>=ZÄHLENWENN(C2:C8,"offen")</code>) führen dazu, dass Excel beim Bestätigen ein Problem mit der Formel meldet.</p>
      <h3>Ergebnis 0 oder zu tief</h3>
      <ul>
        <li><strong>Zellbezug in Anführungszeichen:</strong> <code>"&gt;=E1"</code> vergleicht mit dem Text «E1». Richtig: <code>"&gt;="&amp;E1</code>.</li>
        <li><strong>Leerzeichen:</strong> «offen » mit Leerzeichen am Ende wird von <code>"offen"</code> nicht erfasst. Bereinige die Daten mit GLÄTTEN oder verwende vorübergehend <code>"offen*"</code>, um das Problem zu bestätigen.</li>
        <li><strong>Zahlen als Text:</strong> Ein Vergleich wie <code>"&gt;=10000"</code> berücksichtigt nur echte Zahlen. Beträge, die als Text gespeichert sind, fallen heraus.</li>
        <li><strong>Platzhalter im Text:</strong> Suchst du nach einem echten Sternchen oder Fragezeichen, setzt du eine Tilde davor: <code>"~*"</code>.</li>
      </ul>
      <h3>Fehlende <code>$</code></h3>
      <p>Wie im Duplikat-Beispiel gezeigt: Ohne absoluten Bezug verschiebt sich der Bereich beim Kopieren. Die Formel liefert dann keine Fehlermeldung, sondern stillschweigend falsche Zahlen. Mehr dazu im Artikel über <a href="absolute-bezuege.html">absolute Bezüge</a>.</p>

      <h2>Englisch vs. Deutsch</h2>
      <p>Aus <code>=COUNTIF(C2:C8,"open")</code> wird in der Schweizer Excel-Version <code>=ZÄHLENWENN(C2:C8;"offen")</code>. Beachte den Umlaut im deutschen Namen: ZÄHLENWENN, nicht ZAHLENWENN.</p>
{CMP}'''

practice = '''        <p><strong>ZÄHLENWENN: Offene Rechnungen zählen.</strong> Du zählst in einer Rechnungsliste, wie viele Rechnungen den Status «offen» haben. Excel-Drills prüft dein Ergebnis sofort und meldet sich, wenn zum Beispiel die Anführungszeichen fehlen.</p>
        <p>Die Übung ist gratis, braucht keine Anmeldung und läuft direkt im Browser.</p>
        <p><a class="btn" href="../app/#zaehlenwenn-1">ZÄHLENWENN-Übung starten</a></p>'''

faq = [
    ("Was ist der Unterschied zwischen ZÄHLENWENN und ANZAHL?",
     "ANZAHL zählt alle Zellen, die eine Zahl enthalten, ohne Bedingung. ZÄHLENWENN zählt nur die Zellen, die ein Kriterium erfüllen, und funktioniert auch mit Text. Für alle nicht leeren Zellen, egal ob Text oder Zahl, gibt es ANZAHL2."),
    ("Wie zähle ich mit ZÄHLENWENN alle nicht leeren Zellen?",
     "Mit dem Kriterium \"&lt;&gt;\", also =ZÄHLENWENN(C2:C8;\"&lt;&gt;\"). Für leere Zellen nimmst du \"\" oder die Funktion ANZAHLLEEREZELLEN."),
    ("Unterscheidet ZÄHLENWENN zwischen Gross- und Kleinschreibung?",
     "Nein, \"offen\" und \"Offen\" zählen gleich. Brauchst du eine exakte Unterscheidung, kombinierst du SUMMENPRODUKT mit IDENTISCH: =SUMMENPRODUKT(--IDENTISCH(C2:C8;\"Offen\"))."),
    ("Wie zähle ich Werte zwischen zwei Grenzen?",
     "Mit ZÄHLENWENNS und zwei Bedingungen auf denselben Bereich, zum Beispiel =ZÄHLENWENNS(B2:B8;\"&gt;=5000\";B2:B8;\"&lt;10000\") für alle Beträge ab 5'000 und unter 10'000."),
]

PAGE = article_page("zaehlenwenn.html",
    "ZÄHLENWENN Excel: Syntax, Beispiele und Übung",
    "ZÄHLENWENN in Excel erklärt: Kriterien richtig schreiben, offene Pendenzen und Grossschäden zählen, Duplikate finden, typische Fehler und Gratis-Übung.",
    "ZÄHLENWENN in Excel",
    "ZÄHLENWENN zählt, wie viele Zellen in einem Bereich ein Kriterium erfüllen, zum Beispiel alle offenen Rechnungen. Die Formel lautet <code>=ZÄHLENWENN(Bereich;Suchkriterien)</code>, etwa <code>=ZÄHLENWENN(C2:C8;\"offen\")</code>. Für mehrere Bedingungen gleichzeitig nimmst du ZÄHLENWENNS.",
    body, faq, practice)
