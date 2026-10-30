from lib import *

OPS = compare("Vergleichsoperatoren in der Prüfung", ["Operator", "Bedeutung", "Beispiel"], [
    ["<code>=</code>", "gleich", '<code>A2="erledigt"</code>'],
    ["<code>&lt;&gt;</code>", "ungleich", '<code>A2&lt;&gt;"CH"</code>'],
    ["<code>&gt;</code>", "grösser als", "<code>B2&gt;10000</code>"],
    ["<code>&lt;</code>", "kleiner als", "<code>B2&lt;0</code>"],
    ["<code>&gt;=</code>", "grösser oder gleich", "<code>B2&gt;=1</code>"],
    ["<code>&lt;=</code>", "kleiner oder gleich", "<code>C2&lt;=B2</code>"],
])
T1 = tbl("Budgetkontrolle in A1:D5", [
    ["Kostenart", "Budget CHF", "Ist CHF", "Status"],
    ["Personal", "480'000", "471'300", "!OK"],
    ["Marketing", "60'000", "64'250", "!Überzogen"],
    ["IT", "95'000", "95'000", "!OK"],
    ["Reisen", "18'000", "12'480", "!OK"],
])
T2 = tbl("Schadenauszahlung nach Selbstbehalt in A1:D4", [
    ["Schaden-Nr.", "Schaden CHF", "Selbstbehalt CHF", "Auszahlung CHF"],
    ["S-301", "4'800", "500", "!4'300"],
    ["S-302", "350", "500", "!0"],
    ["S-303", "12'600", "1'000", "!11'600"],
])
T3 = tbl("Bonusberechtigung in A1:D4", [
    ["Mitarbeitende", "Zielerreichung", "Kundenzufriedenheit", "Bonus"],
    ["Huber", "108 %", "4.5", "!Bonus"],
    ["Rossi", "97 %", "4.8", "!"],
    ["Frei", "115 %", "3.6", "!"],
])
T4 = tbl("Mahnstufen nach Tagen im Verzug in A1:C5", [
    ["Rechnung", "Tage überfällig", "Mahnstufe"],
    ["R-11", "5", "!keine"],
    ["R-12", "18", "!Mahnstufe 1"],
    ["R-13", "45", "!Mahnstufe 2"],
    ["R-14", "73", "!Mahnstufe 3"],
])
CMP = compare("WENN und verwandte Funktionen: Deutsch und Englisch", ["Deutsch", "Englisch", "Bemerkung"], [
    ["WENN", "IF", "eine Bedingung, zwei Ergebnisse"],
    ["WENNS", "IFS", "mehrere Bedingungen ohne Verschachtelung"],
    ["UND", "AND", "alle Bedingungen müssen wahr sein"],
    ["ODER", "OR", "mindestens eine Bedingung muss wahr sein"],
    ["NICHT", "NOT", "kehrt einen Wahrheitswert um"],
    ["WAHR / FALSCH", "TRUE / FALSE", "Wahrheitswerte"],
    ["WENNFEHLER", "IFERROR", "Ersatzwert bei Fehlern"],
    ["ERSTERWERT", "SWITCH", "Wert mit einer Liste von Fällen vergleichen"],
])

body = f'''      <h2>Wofür du die WENN-Funktion brauchst</h2>
      <p>Viele Fragen im Arbeitsalltag haben die Form «Wenn das zutrifft, dann dies, sonst das»: Ist das Budget eingehalten? Liegt der Schaden über dem Selbstbehalt? Ist die Rechnung überfällig? Hat jemand Anspruch auf einen Bonus? Die WENN-Funktion bildet genau solche Entscheidungen ab. Sie ist die Grundlage für Ampeln in Reports, für Plausibilitätsprüfungen und für jede Formel, die je nach Situation anders rechnen soll.</p>
      <p>Das Ergebnis kann ein Text sein («OK», «Überzogen»), eine Zahl, eine Berechnung oder sogar eine leere Zelle. Damit ist WENN eine der vielseitigsten Funktionen in Excel und kommt in fast jedem Einstellungstest vor.</p>

      <h2>Die Syntax der WENN-Funktion</h2>
      <div class="syntax">
        <code class="formula">=WENN(Prüfung;Dann_Wert;Sonst_Wert)</code>
        <dl>
          <dt>Prüfung</dt>
          <dd>Ein Vergleich, der WAHR oder FALSCH ergibt, zum Beispiel <code>C2&lt;=B2</code> («Ist kleiner oder gleich Budget»).</dd>
          <dt>Dann_Wert</dt>
          <dd>Das Ergebnis, wenn die Prüfung WAHR ist. Text steht in Anführungszeichen (<code>"OK"</code>), Zahlen und Formeln ohne (<code>B2-C2</code>).</dd>
          <dt>Sonst_Wert</dt>
          <dd>Das Ergebnis, wenn die Prüfung FALSCH ist. Lässt du es weg, zeigt Excel im Nein-Fall den Wahrheitswert FALSCH an. Für eine leere Zelle schreibst du zwei Anführungszeichen: <code>""</code>.</dd>
        </dl>
      </div>
      <p>Für die Prüfung stehen dir diese Vergleichsoperatoren zur Verfügung:</p>
{OPS}
      <p>Textvergleiche unterscheiden nicht zwischen Gross- und Kleinschreibung: <code>A2="ok"</code> ist auch dann WAHR, wenn in A2 «OK» steht.</p>

      <h2>Beispiel 1: Budgetkontrolle (Controlling)</h2>
      <p>Du vergleichst pro Kostenart das Budget mit den Ist-Kosten und willst auf einen Blick sehen, wo es überzogen ist.</p>
{T1}
      <p>Die Formel in D2, nach unten kopiert:</p>
      <code class="formula">=WENN(C2&lt;=B2;"OK";"Überzogen")</code>
      <p>Beachte die IT-Zeile: Budget und Ist sind genau gleich. Mit <code>&lt;=</code> gilt das als «OK», mit <code>&lt;</code> wäre es «Überzogen». Solche Grenzfälle entscheiden oft darüber, ob ein Report stimmt. Überlege dir bei jeder Prüfung, auf welche Seite der genaue Grenzwert gehört.</p>
      <p>Mit bedingter Formatierung kannst du die Zellen mit «Überzogen» zusätzlich rot einfärben. Die Logik bleibt aber in der WENN-Formel, und der Text ist auch beim Ausdrucken in Schwarzweiss eindeutig.</p>

      <h2>Beispiel 2: Auszahlung nach Selbstbehalt (Versicherung)</h2>
      <p>Der Dann- und der Sonst-Wert dürfen auch Berechnungen sein. Bei einem Schadenfall wird der Betrag über dem Selbstbehalt ausbezahlt. Liegt der Schaden darunter, gibt es nichts.</p>
{T2}
      <code class="formula">=WENN(B2&gt;C2;B2-C2;0)</code>
      <p>Für S-302 ist der Schaden mit CHF 350 kleiner als der Selbstbehalt von CHF 500, also lautet das Ergebnis 0 statt minus 150. Ohne WENN würde die einfache Subtraktion einen negativen Betrag liefern und die Summe aller Auszahlungen verfälschen. Für genau diesen Fall gibt es auch die Kurzform <code>=MAX(B2-C2;0)</code>. Die WENN-Variante ist aber für viele Leserinnen und Leser der Datei leichter nachvollziehbar.</p>

      <h2>Beispiel 3: Mehrere Bedingungen mit UND und ODER (Personal)</h2>
      <p>Einen Bonus gibt es nur, wenn das Ziel mindestens erreicht <strong>und</strong> die Kundenzufriedenheit mindestens 4 ist. Dafür setzt du UND in die Prüfung ein:</p>
{T3}
      <code class="formula">=WENN(UND(B2&gt;=1;C2&gt;=4);"Bonus";"")</code>
      <p>Die Zielerreichung ist als Prozentzahl formatiert, gespeichert ist sie als Dezimalzahl: 108&nbsp;% entspricht 1.08, und 100&nbsp;% entspricht 1. Deshalb steht in der Prüfung <code>B2&gt;=1</code>. Huber erfüllt beide Bedingungen, Rossi verfehlt das Ziel knapp, Frei liegt bei der Kundenzufriedenheit unter 4. Bei Rossi und Frei bleibt die Zelle dank <code>""</code> leer.</p>
      <p>Mit ODER statt UND reicht eine erfüllte Bedingung: <code>=WENN(ODER(B2&gt;=1.1;C2&gt;=4.8);"Anerkennung";"")</code>.</p>

      <h2>Verschachtelte WENN: mehr als zwei Fälle</h2>
      <p>Brauchst du drei oder mehr Ergebnisse, setzt du ein weiteres WENN in den Sonst-Wert. Beispiel aus dem Debitorenmanagement: Je nach Anzahl Tage im Verzug gibt es eine andere Mahnstufe.</p>
{T4}
      <code class="formula">=WENN(B2&gt;60;"Mahnstufe 3";WENN(B2&gt;30;"Mahnstufe 2";WENN(B2&gt;10;"Mahnstufe 1";"keine")))</code>
      <p>Excel prüft von links nach rechts und nimmt den ersten Treffer. Deshalb beginnst du mit der höchsten Schwelle. Würdest du zuerst <code>B2&gt;10</code> prüfen, bekäme auch die Rechnung mit 73 Tagen nur «Mahnstufe 1». Zähle am Schluss die Klammern: Jedes WENN braucht eine schliessende Klammer, hier also drei.</p>
      <p>In neueren Excel-Versionen gibt es dafür auch WENNS, die ohne Verschachtelung auskommt: <code>=WENNS(B2&gt;60;"Mahnstufe 3";B2&gt;30;"Mahnstufe 2";B2&gt;10;"Mahnstufe 1";WAHR;"keine")</code>. Das letzte Paar <code>WAHR;"keine"</code> übernimmt die Rolle des Sonst-Werts. Prüfe vor dem Einsatz, ob alle Empfänger deiner Datei eine Version mit WENNS haben.</p>

      <h2>Typische Fehler und wie du sie erkennst</h2>
      <h3><code>#NAME?</code>: fehlende Anführungszeichen</h3>
      <p><code>=WENN(C2&lt;=B2;OK;Überzogen)</code> liefert <code>#NAME?</code>, weil Excel «OK» und «Überzogen» für Namen von Zellbereichen hält. Text braucht immer gerade Anführungszeichen: <code>"OK"</code>. Ebenfalls <code>#NAME?</code> ergibt ein englischer Funktionsname wie <code>IF</code> in der deutschen Excel-Version.</p>
      <h3>Typografische Anführungszeichen</h3>
      <p>Kopierst du eine Formel aus Word, Outlook oder einer Webseite, stehen dort oft typografische Zeichen wie „OK“ oder «OK». Excel erkennt sie nicht als Textbegrenzung. Tippe die Anführungszeichen in Excel neu ein.</p>
      <h3>Zahlen in Anführungszeichen</h3>
      <p><code>=WENN(B2&gt;"10000";…)</code> sieht harmlos aus, vergleicht aber eine Zahl mit dem Text «10000». In Excel gilt Text bei solchen Vergleichen immer als grösser als jede Zahl, die Prüfung ist also immer FALSCH. Zahlen gehören ohne Anführungszeichen in die Formel, und zwar ohne Hochkomma: <code>B2&gt;10000</code>, nicht <code>B2&gt;10'000</code>.</p>
      <h3>Komma statt Semikolon</h3>
      <p><code>=WENN(C2&lt;=B2,"OK","Überzogen")</code> stammt aus einer englischen Anleitung. Die Schweizer Excel-Version nimmt die Formel so nicht an. Ersetze die Kommas durch Semikolons. Dezimalzahlen schreibst du in der Schweizer Einstellung mit Punkt: <code>B2&gt;=1.1</code>.</p>
      <h3>Unerwartetes FALSCH oder 0 in der Zelle</h3>
      <p>Steht in der Zelle FALSCH, hast du den Sonst-Wert weggelassen. Ein Ergebnis 0 statt einer leeren Zelle entsteht, wenn der Dann- oder Sonst-Wert auf eine leere Zelle verweist. Schreibe <code>""</code>, wenn wirklich nichts erscheinen soll.</p>
      <h3>Fehlende <code>$</code> beim Kopieren</h3>
      <p>Steht der Grenzwert in einer eigenen Zelle, etwa der Bonus-Schwellenwert in F1, musst du ihn mit <code>$F$1</code> fixieren. Sonst verschiebt sich der Bezug beim Kopieren nach unten auf F2, F3 und so weiter, und die Prüfung vergleicht mit leeren Zellen. Mehr dazu im Artikel über <a href="absolute-bezuege.html">absolute Bezüge</a>.</p>

      <h2>Englisch vs. Deutsch</h2>
      <p>Aus <code>=IF(C2&lt;=B2,"OK","Over budget")</code> wird auf Deutsch <code>=WENN(C2&lt;=B2;"OK";"Überzogen")</code>. Operatoren und Anführungszeichen bleiben gleich.</p>
{CMP}'''

practice = '''        <p><strong>WENN: Budget eingehalten?</strong> Du schreibst eine WENN-Formel, die «OK» oder «Überzogen» ausgibt. Excel-Drills testet deine Formel zusätzlich mit anderen Zahlen, damit du merkst, ob sie in beiden Fällen stimmt.</p>
        <p>Die Übung ist gratis, braucht keine Anmeldung und läuft direkt im Browser.</p>
        <p><a class="btn" href="../app/#wenn-1">WENN-Übung starten</a></p>
        <p>Als Fortsetzung wartet «Risikoklasse zuordnen» mit verschachtelten WENN-Formeln: <a href="../app/#wenn-verschachtelt-1">Verschachtelte WENN üben</a> (Teil von <a href="../premium.html">Premium</a>).</p>'''

faq = [
    ("Wie schreibe ich in der WENN-Funktion «grösser gleich»?",
     "Mit den Zeichen &gt;= ohne Leerzeichen dazwischen, zum Beispiel =WENN(B2&gt;=1000;\"Rabatt\";\"\"). Für «kleiner gleich» schreibst du &lt;=, für «ungleich» &lt;&gt;."),
    ("Wie viele WENN-Funktionen kann ich verschachteln?",
     "Aktuelle Excel-Versionen erlauben bis zu 64 verschachtelte Ebenen. Lesbar sind aber meist nur drei bis vier. Bei mehr Stufen ist eine Nachschlagetabelle mit SVERWEIS und WAHR oder die Funktion WENNS übersichtlicher."),
    ("Wie lasse ich eine Zelle leer, wenn die Bedingung nicht erfüllt ist?",
     "Schreibe als Sonst-Wert zwei Anführungszeichen ohne Inhalt: =WENN(UND(B2&gt;=1;C2&gt;=4);\"Bonus\";\"\"). Die Zelle wirkt dann leer, enthält aber eine Formel."),
    ("Warum zeigt meine WENN-Formel immer den Sonst-Wert?",
     "Häufige Ursachen sind Zahlen in Anführungszeichen, Zahlen, die in der Zelle als Text gespeichert sind, oder unsichtbare Leerzeichen bei Textvergleichen. Prüfe den Vergleich einzeln, indem du nur =B2&gt;10000 in eine freie Zelle schreibst und schaust, ob WAHR oder FALSCH erscheint."),
]

PAGE = article_page("wenn-funktion.html",
    "WENN-Funktion Excel: Syntax, Beispiele, Fehler",
    "Die WENN-Funktion in Excel erklärt: Syntax mit Semikolon, Beispiele aus Controlling und Versicherung, UND/ODER, verschachtelte WENN und Gratis-Übung.",
    "WENN-Funktion in Excel",
    "Die WENN-Funktion prüft eine Bedingung und gibt je nach Ergebnis einen von zwei Werten zurück. Die Formel lautet <code>=WENN(Prüfung;Dann_Wert;Sonst_Wert)</code>, zum Beispiel <code>=WENN(C2&lt;=B2;\"OK\";\"Überzogen\")</code>. Text steht in Anführungszeichen, Argumente trennst du mit Semikolon.",
    body, faq, practice)
