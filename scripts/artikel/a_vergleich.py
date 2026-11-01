from lib import *

# Vergleich von Excel-Übungsplattformen, Stand 1. November 2026. Angaben zu Drittanbietern stammen von deren
# öffentlichen Startseiten am 1.11.2026 (logicexcel.com, coddy.tech, easy4me.info, zebis.ch, wings.ch).
# Bei Änderungen: Tabelle VGL und die Abschnitte unten anpassen, Datum in PAGE nachführen.

VGL = compare("Excel-Übungsplattformen im Überblick (Stand 1. November 2026)",
    ["Plattform", "Art", "Deutsche Funktionsnamen", "Prüfung im Browser", "Schweizer Formate", "Preis"], [
    ["LogicExcel", "Online-Übungen, 95 Aufgaben in 14 Themen", "teilweise: Texte deutsch, Beispiele mit SUM und VLOOKUP", "ja, Sofort-Feedback", "nein", "gratis, ohne Konto"],
    ["Coddy", "Online-Spielwiese, 24 Formelaufgaben", "nein: SUM, IF, COUNTIF, VLOOKUP", "ja", "nein", "gratis"],
    ["Easy4Me", "Unterrichtsmaterial für Schulen (Österreich)", "ja, Übungsdateien auf Deutsch", "nein, Dateien zum Herunterladen", "nein, Euro", "Jahreslizenz für Schulen"],
    ["zebis", "Portal für Lehrpersonen der Volksschule (Schweiz)", "ja", "nein, Materialien zum Herunterladen", "teilweise", "Materialien gratis"],
    ["Wings", "Lehrmittel für kaufmännische Berufsschulen (Schweiz)", "ja", "nein, Übungsdateien zum Lehrmittel", "ja", "Lehrmittel kostenpflichtig"],
    ["Excel-Drills", "Online-Übungen, 42 Aufgaben in 4 Lernpfaden", "ja: SUMME, WENN, SVERWEIS, mit Semikolon", "ja, mit Fehlerhinweisen", "ja: CHF, Hochkomma, Rappenrundung; DE-Schalter", "18 gratis, Rest ab CHF 9 pro Monat"],
])

body = f'''      <h2>Worauf es beim Excel-Üben ankommt</h2>
      <p>Excel lernt man nicht durch Zuschauen, sondern durch Tippen. Deshalb ist die wichtigste Frage bei jeder Übungsplattform: Kannst du die Formel selbst eingeben und bekommst du sofort gesagt, ob sie stimmt? Danach kommen vier Punkte, die im deutschsprachigen Raum oft übersehen werden:</p>
      <ul>
        <li><strong>Deutsche Funktionsnamen.</strong> Dein Excel versteht <code>SUMME</code>, <code>WENN</code> und <code>SVERWEIS</code>, nicht <code>SUM</code>, <code>IF</code> und <code>VLOOKUP</code>. Wer mit englischen Übungen lernt, tippt im Job zuerst einmal <code>#NAME?</code>.</li>
        <li><strong>Semikolon statt Komma.</strong> In der deutschen, Schweizer und österreichischen Excel-Version trennst du Argumente mit <code>;</code>. Englische Plattformen prüfen mit Komma.</li>
        <li><strong>Schweizer Zahlenformate.</strong> <code>12'400.50</code> mit Hochkomma und Punkt, Beträge in CHF, Rundung auf 5 Rappen mit <code>VRUNDEN</code>. In Deutschland sind es <code>12.400,50</code> und Euro.</li>
        <li><strong>Praxisbezug.</strong> Aufgaben aus Buchhaltung, Controlling oder Kundenlisten bleiben besser hängen als abstrakte Zahlenreihen.</li>
      </ul>
      <p>Mit diesen Kriterien haben wir sechs Angebote verglichen, die bei einer Suche nach «Excel Übungen Schweiz» auftauchen. Transparenz vorweg: Excel-Drills ist unsere eigene Plattform. Wir haben versucht, die anderen fair zu beschreiben, und nennen bei jeder Plattform auch, wofür sie besser geeignet ist als wir.</p>

      <h2>Die sechs Plattformen</h2>

      <h3>LogicExcel</h3>
      <p>LogicExcel bietet 95 interaktive Übungen in 14 Themen, von Grundlagen über logische Funktionen und Nachschlagefunktionen bis zu Pivot-Tabellen und einem Dashboard-Projekt. Alles läuft im Browser, ohne Konto und ohne Paywall, der Fortschritt bleibt im Browser gespeichert. Das ist das umfangreichste Gratis-Angebot in dieser Liste.</p>
      <p>Die Plattform ist englisch gebaut und in mehrere Sprachen übersetzt. Die deutsche Oberfläche erklärt zwar SUMMEWENN und SVERWEIS, die Navigation und die Beispiele arbeiten aber mit <code>SUM</code>, <code>COUNT</code> und <code>VLOOKUP</code>. Schweizer Formate, CHF oder Lernpfade nach Beruf gibt es nicht.</p>
      <p><strong>Gut für:</strong> Wer mit englischem Excel arbeitet oder möglichst viele Themen gratis durchgehen will, auch Pivot und Dashboards.</p>

      <h3>Coddy</h3>
      <p>Coddy ist eine Lernplattform für Programmieren, die auch eine Excel-Spielwiese mit 24 Formelaufgaben anbietet: SUM, IF, COUNTIF, VLOOKUP, XLOOKUP und ähnliche. Die Aufgaben werden im Browser geprüft, alles ist gratis, eine Anmeldung ist nicht nötig.</p>
      <p>Die Funktionsnamen sind durchgehend englisch, die Argumente werden mit Komma getrennt. Für die deutsche Excel-Version musst du jede Lösung im Kopf übersetzen.</p>
      <p><strong>Gut für:</strong> Einen schnellen Einstieg in die Logik von Formeln, wenn die Sprache keine Rolle spielt.</p>

      <h3>Easy4Me</h3>
      <p>Easy4Me stellt Unterrichtsmaterial für den Informatikunterricht bereit, vor allem für die Digitale Grundbildung und Berufsschulen in Österreich. Zur Tabellenkalkulation gibt es ein eigenes Modul mit Übungsdateien, Lösungen, Vorbereitungsprüfungen und Quiz. Schulen bestellen eine Jahreslizenz.</p>
      <p>Die Übungen sind Dateien zum Herunterladen, die du in Excel oder LibreOffice bearbeitest. Eine automatische Prüfung deiner Formel gibt es nicht, du vergleichst mit der Lösung. Die Beispiele rechnen in Euro.</p>
      <p><strong>Gut für:</strong> Lehrpersonen, die ganze Unterrichtseinheiten mit Arbeitsblättern suchen.</p>

      <h3>zebis</h3>
      <p>zebis ist das Portal für Lehrpersonen der Schweizer Volksschule mit über 7'000 Unterrichtsmaterialien, darunter auch Lernkontrollen und Übungsdateien zu Excel. Die Materialien sind gratis.</p>
      <p>Es ist keine Übungsplattform, sondern eine Materialsammlung: Du lädst Dateien herunter und arbeitest in Excel. Die Qualität und das Niveau hängen vom jeweiligen Beitrag ab, die Zielgruppe sind Schülerinnen und Schüler der Volksschule.</p>
      <p><strong>Gut für:</strong> Lehrpersonen der Volksschule, die Excel-Einstiege für den Unterricht suchen.</p>

      <h3>Wings</h3>
      <p>Wings Lernmedien aus Schindellegi SZ ist ein Schweizer Verlag für PC-Lehrmittel an kaufmännischen Berufsschulen, Gymnasien und Weiterbildungsschulen. Zu Excel gibt es ein Lehrmittel mit Übungsdateien, in der Schweizer Schreibweise und mit Schweizer Beispielen.</p>
      <p>Die Übungen gehören zum gedruckten oder digitalen Lehrmittel und werden in Excel gelöst, ohne automatische Prüfung. Das Lehrmittel ist kostenpflichtig und auf Klassen ausgelegt.</p>
      <p><strong>Gut für:</strong> KV-Lernende, deren Schule mit Wings arbeitet, als Begleitung zum Unterricht.</p>

      <h3>Excel-Drills</h3>
      <p>Excel-Drills ist unsere Plattform. 42 Übungen in vier Lernpfaden (Basis, Accounting & Controlling, Finance, Data & Reporting), 18 davon gratis und ohne Anmeldung. Du tippst die Formel direkt im Browser ein und bekommst sofort eine Prüfung, die auch typische Fehler erklärt: <code>SUM</code> statt <code>SUMME</code>, Komma statt Semikolon, fehlende Anführungszeichen, fehlendes <code>$</code>.</p>
      <p>Alle Aufgaben rechnen in CHF mit Schweizer Formaten, zum Beispiel Rundung auf 5 Rappen oder MwSt-Abrechnungen. Ein Schalter stellt auf Deutschland um (Komma als Dezimalzeichen, Euro), eine französische und eine italienische Version gibt es ebenfalls. Dazu kommen Tagesziel, Serie und Gold pro Übung, wenn du sie auch mit anderen Zahlen löst.</p>
      <p>Die Grenzen: Deutlich weniger Themen als LogicExcel, keine Pivot-Tabellen zum Klicken (die Data-Projekte arbeiten mit Dateien), und ab der 19. Übung kostet es CHF 9 pro Monat oder CHF 49 pro Jahr.</p>
      <p><strong>Gut für:</strong> Wer mit deutschem Excel arbeitet und für Büro, KV, Controlling oder einen Einstellungstest übt.</p>

      <h2>Der Vergleich auf einen Blick</h2>
{VGL}

      <h2>Welche Plattform für wen?</h2>
      <ul>
        <li><strong>Du arbeitest mit englischem Excel</strong> oder willst gratis möglichst viel abdecken: LogicExcel, für die ersten Formeln auch Coddy.</li>
        <li><strong>Du arbeitest mit deutschem Excel</strong>, in der Schweiz oder in Deutschland, und willst Formeln tippen statt Videos schauen: Excel-Drills. Die 18 Gratis-Übungen decken die Basis ab, die Pfade Accounting und Finance gehen in die Praxis.</li>
        <li><strong>Du bereitest dich auf einen Einstellungstest vor:</strong> SUMME, MITTELWERT, WENN, SVERWEIS mit FALSCH, SUMMEWENN, ZÄHLENWENN und die <code>$</code>-Bezüge. Der <a href="../pfad/basis.html">Lernpfad Basis</a> bei Excel-Drills ist genau darauf gebaut; LogicExcel deckt dieselben Funktionen auf Englisch ab.</li>
        <li><strong>Du unterrichtest:</strong> Arbeitsblätter und Unterrichtseinheiten findest du bei Easy4Me, zebis oder Wings. Für das Üben zu Hause können deine Lernenden die Gratis-Übungen von Excel-Drills nutzen, Schulen und Berufsschulen erhalten den vollen Zugang <a href="../premium.html">gratis</a>.</li>
      </ul>
      <p>Am besten kombinierst du: Konzept und Überblick aus einem Lehrmittel oder einem Artikel wie unserem zu <a href="sverweis.html">SVERWEIS</a>, dann sofort selbst tippen, und nach ein paar Tagen die Übung mit anderen Zahlen wiederholen. Das ist der Unterschied zwischen Wiedererkennen und Können.</p>'''

practice = '''        <p><strong>Teste den Unterschied selbst.</strong> Die erste Übung ist eine SUMME über Filialumsätze in CHF. Tipp sie einmal mit <code>SUM</code> und Komma ein und schau, was Excel-Drills dazu sagt.</p>
        <p>18 Übungen sind gratis, ohne Anmeldung, direkt im Browser.</p>
        <p><a class="btn" href="../app/#summe-1">Gratis-Übung starten</a></p>'''

faq = [
    ("Welche Excel-Übungen sind gratis und auf Deutsch?",
     "Online mit Sofort-Prüfung und deutschen Funktionsnamen: Excel-Drills (18 Gratis-Übungen). LogicExcel ist komplett gratis, prüft aber mit englischen Namen wie SUM und VLOOKUP. Deutsche Übungsdateien zum Herunterladen gibt es bei zebis gratis und bei Easy4Me oder Wings als Lehrmittel."),
    ("Warum funktioniert SUM in meinem Excel nicht?",
     "Weil die deutsche Excel-Version die Funktion SUMME nennt. Englische Namen wie SUM, IF oder VLOOKUP ergeben #NAME?. Zusätzlich trennst du Argumente mit Semikolon statt Komma: =SUMME(B2;B5) statt =SUM(B2,B5)."),
    ("Was ist der Unterschied zwischen Schweizer und deutschem Excel?",
     "Die Funktionsnamen und das Semikolon sind gleich. Unterschiedlich sind die Zahlenformate: In der Schweiz 12'400.50 mit Hochkomma und Punkt, in Deutschland 12.400,50. Dazu CHF statt Euro und die Rundung auf 5 Rappen mit VRUNDEN(Betrag;0.05)."),
    ("Reichen Gratis-Übungen für einen Excel-Einstellungstest?",
     "Für die typischen Testfunktionen (SUMME, MITTELWERT, MAX, WENN, SVERWEIS, SUMMEWENN, ZÄHLENWENN, absolute Bezüge) ja. Wichtig ist, jede Funktion mehrmals selbst zu tippen, beim letzten Mal ohne Vorlage."),
    ("Ist Excel-Drills unabhängig bewertet?",
     "Nein, Excel-Drills ist unsere eigene Plattform. Die Angaben zu den anderen Anbietern stammen von deren Websites, Stand 1. November 2026. Fehlt etwas oder hat sich etwas geändert, schreib uns an hallo@excel-drills.ch."),
]

PAGE = article_page("excel-ueben-online-vergleich.html",
    "Excel online üben: 6 Plattformen im Vergleich (Schweiz)",
    "LogicExcel, Coddy, Easy4Me, zebis, Wings und Excel-Drills im Vergleich: Was gratis ist, wo deutsche Funktionsnamen und Semikolon stimmen, was für KV passt.",
    "Excel online üben: 6 Plattformen im Vergleich (Schweiz)",
    "Wer Excel üben will, findet online viele Angebote, aber nur wenige prüfen deine Formel im Browser, und noch weniger mit deutschen Funktionsnamen, Semikolon und Schweizer Formaten. Wir vergleichen LogicExcel, Coddy, Easy4Me, zebis, Wings und unsere eigene Plattform Excel-Drills nach Umfang, Sprache, Prüfung und Preis.",
    body, faq, practice, date_iso="2026-11-01", date_text="1. November 2026")
