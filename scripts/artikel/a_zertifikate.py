from lib import *

# Excel-Zertifikate in der Schweiz, Stand 1. November 2026. Quellen: siz.ch (ICT Advanced-User SIZ, Modul AU4 Tabellen,
# Modulidentifikation V2 vom 1.12.2025; ICT Power-User SIZ, Modul PU41, Modulidentifikation V8 vom 12.12.2025),
# learn.microsoft.com (MO-210, MO-211), xcdl.ch (ICDL Schweiz). Gleiche Fakten wie zertifikate/index.html:
# bei Änderungen beide Stellen nachführen und das Datum in PAGE anpassen.

def kp(cid, label):
    return f'<a href="../kampagne/?kampagne={cid}">{label}</a>'

VGL = compare("Excel-Zertifikate in der Schweiz (Stand 1. November 2026)",
    ["Zertifikat", "Anbieter", "Preis", "Dauer", "Prüfungsform", "Vorbereitung bei Excel-Drills"], [
    ["SIZ AU4 Tabellen", "SIZ", "CHF 110 / 132", "28 Lektionen empfohlen", "Modulprüfung", kp("siz-au4", "Kampagne, 10 Tage")],
    ["SIZ PU41 Tabellen &amp; Daten", "SIZ", "CHF 260 / 312", "40 Lektionen empfohlen", "Modulprüfung", kp("siz-pu41", "Kampagne, 12 Tage")],
    ["MOS Excel Associate (MO-210)", "Microsoft, Certiport", "je Testcenter", "50 Minuten", "praktisch in Excel, ab 700/1000", kp("mos-excel-associate", "Kampagne, 8 Tage")],
    ["MOS Excel Expert (MO-211)", "Microsoft, Certiport", "je Testcenter", "50 Minuten", "praktisch in Excel", kp("mos-excel-expert", "Kampagne, 10 Tage")],
    ["ICDL Tabellenkalkulation", "Digital Literacy AG", "zurzeit keine Prüfung", "-", "Prüfungsbetrieb unterbrochen", kp("siz-au4", "AU4-Kampagne")],
])

body = f'''      <h2>Braucht es überhaupt ein Excel-Zertifikat?</h2>
      <p>In vielen Stelleninseraten steht «sehr gute Excel-Kenntnisse». Was das heisst, prüft jede Firma anders: mit einem Excel-Test im Bewerbungsverfahren, mit einer Frage im Interview oder gar nicht. Ein Zertifikat macht deine Kenntnisse vergleichbar. Es lohnt sich vor allem in drei Situationen: wenn du ohne Berufserfahrung eine Stelle im Büro suchst, wenn eine Weiterbildung das Zertifikat als Voraussetzung verlangt, oder wenn du in einer internationalen Firma arbeitest, in der Microsoft-Zertifizierungen bekannt sind.</p>
      <p>In der Schweiz sind vier Zertifikate relevant: zwei Module des SIZ und zwei Prüfungen von Microsoft Office Specialist (MOS). Das ICDL, lange der Schweizer Standard, ist zurzeit nicht verfügbar. Unten findest du alle Fakten mit Stand 1. November 2026, eine Vergleichstabelle und einen Plan, wie du dich vorbereitest. Die Kurzfassung mit Checklisten zum Abhaken steht auf unserer Seite <a href="../zertifikate/">Excel-Zertifikate</a>.</p>

      <h2>SIZ AU4 Tabellen: der Schweizer Standard für das Büro</h2>
      <p>Das SIZ ist der Schweizer Anbieter für Informatik-Anwenderzertifikate. Das Modul AU4 Tabellen gehört zum Zertifikat ICT Advanced-User SIZ. Du legst eine Modulprüfung bei einer SIZ-Partnerschule oder bei der SIZ-Geschäftsstelle ab. Die Prüfung kostet CHF 110 bei einer Partnerschule und CHF 132 bei der Geschäftsstelle. Das SIZ empfiehlt 28 Lektionen Vorbereitung.</p>
      <p>Massgebend ist die Modulidentifikation V2 vom 1. Dezember 2025. Sie gliedert die Lernziele in fünf Kapitel:</p>
      <ol>
        <li><strong>Tabellen aufbereiten und drucken:</strong> Formatieren, Tabellen-Formatvorlagen, Seite einrichten, Druckbereich.</li>
        <li><strong>Berechnungen:</strong> Funktionen von <code>SUMME</code> bis <code>XVERWEIS</code>, mit relativen und absoluten Bezügen.</li>
        <li><strong>Datenauswertung:</strong> Sortieren, Filtern und PivotTables.</li>
        <li><strong>Diagramme:</strong> erstellen, anpassen und beschriften.</li>
        <li><strong>Import und Export:</strong> Daten übernehmen und weitergeben.</li>
      </ol>
      <p><strong>Gut für:</strong> KV, Administration, Wiedereinstieg und alle, die bei Schweizer Arbeitgebern ein anerkanntes Anwenderzertifikat vorweisen wollen.</p>

      <h2>SIZ PU41: Tabellen und Daten für Power-User</h2>
      <p>Das Modul PU41 Office Integration (Tabellen &amp; Daten) gehört zum Zertifikat ICT Power-User SIZ und ist deutlich anspruchsvoller. Die Prüfung kostet CHF 260 bei einer Partnerschule und CHF 312 bei der SIZ-Geschäftsstelle, empfohlen sind 40 Lektionen. Grundlage ist die Modulidentifikation V8 vom 12. Dezember 2025.</p>
      <p>Kern der Prüfung sind 70 Prüfungsfunktionen aus den Gruppen Datum und Zeit, Logik (mit <code>WENNS</code>), Verweise (mit <code>XVERWEIS</code>, <code>INDEX</code> und <code>VERGLEICH</code>) und Text. Dazu kommen Power Query, Pivot, Power Pivot, Schutz, Namensmanager, dynamische Tabellen und die Konfiguration von Excel. Laut Kursanbietern ist PU41 Zulassungsvoraussetzung für die Berufsprüfung Fachleute Finanz- und Rechnungswesen mit eidgenössischem Fachausweis. Prüfe das für deinen Lehrgang bei der Schule nach.</p>
      <p><strong>Gut für:</strong> Buchhaltung, Controlling, Treuhand und alle, die den Fachausweis im Finanz- und Rechnungswesen anstreben.</p>

      <h2>MOS Excel Associate (MO-210): international und praktisch</h2>
      <p>Microsoft Office Specialist ist die weltweit verbreitete Zertifizierung für Office-Anwendungen. Die Prüfung MO-210 für Excel (Microsoft 365 Apps) dauert 50 Minuten und findet praktisch in Excel statt: Du löst Aufgaben direkt in Arbeitsmappen. Bestanden hast du ab 700 von 1000 Punkten. Die Prüfung gibt es unter anderem auf Deutsch, Englisch, Französisch und Italienisch.</p>
      <p>Abgenommen wird sie über Certiport, nur in einem Testcenter. In der Schweiz bietet zum Beispiel Digicomp MOS-Prüfungen an, den Preis legt das Testcenter fest. Die Prüfung gliedert sich in fünf Bereiche:</p>
      <ul>
        <li>Arbeitsblätter und Arbeitsmappen verwalten: 25-30 %</li>
        <li>Zellen und Bereiche verwalten: 25-30 %</li>
        <li>Tabellen und Tabellendaten verwalten: 10-15 %</li>
        <li>Operationen mit Formeln und Funktionen: 15-20 %</li>
        <li>Diagramme verwalten: 15-20 %</li>
      </ul>
      <p>Wichtig für die Vorbereitung: Formeln machen nur rund ein Fünftel aus. Der grösste Teil ist sicheres Arbeiten in der Oberfläche, und das unter Zeitdruck.</p>
      <p><strong>Gut für:</strong> internationale Firmen, Konzernsprache Englisch, Bewerbungen ausserhalb der Schweiz.</p>

      <h2>MOS Excel Expert (MO-211): die Stufe danach</h2>
      <p>MO-211 dauert ebenfalls 50 Minuten und baut auf MO-210 auf. Die Bereiche sind unter anderem Arbeitsmappenoptionen und -einstellungen, Daten verwalten und formatieren, erweiterte Formeln und Makros sowie erweiterte Diagramme und Pivots. Wer MO-211 besteht, zeigt, dass er auch Modelle mit verschachtelter Logik, Verweisen und Was-wäre-wenn-Analysen beherrscht.</p>
      <p><strong>Gut für:</strong> Analystinnen, Controller und Power-User, die schon sicher mit Excel arbeiten.</p>

      <h2>Und das ICDL?</h2>
      <p>Das ICDL (früher ECDL) mit dem Modul Tabellenkalkulation war in der Schweiz lange der Standard, in Schulen wie in Firmen. Stand 1. November 2026 meldet die Schweizer Lizenznehmerin Digital Literacy AG in Basel auf xcdl.ch, dass der Prüfungsbetrieb nach einer gerichtlichen Anordnung zur Marke vorübergehend unterbrochen ist und keine neuen ICDL-Zeugnisse ausgestellt werden.</p>
      <p>Unsere Empfehlung: Warte nicht, setze aktuell auf SIZ oder MOS. Die Inhalte des ICDL-Moduls Tabellenkalkulation sind mit AU4 weitgehend deckungsgleich. Was du dafür gelernt hast, ist also nicht verloren.</p>

      <h2>Der Vergleich auf einen Blick</h2>
{VGL}

      <h2>Welches Zertifikat passt zu dir?</h2>
      <ul>
        <li><strong>Du suchst eine Stelle im Büro oder machst das KV:</strong> AU4 Tabellen. Es ist günstig, in der Schweiz bekannt und deckt genau die Alltagsaufgaben ab.</li>
        <li><strong>Du willst in Richtung Fachausweis Finanz- und Rechnungswesen:</strong> PU41, nach Rücksprache mit deiner Schule. Plane genug Zeit für Power Query und Power Pivot ein.</li>
        <li><strong>Du arbeitest international oder mit englischem Excel:</strong> MO-210, später MO-211.</li>
        <li><strong>Du hattest ein ICDL geplant:</strong> Wechsle auf AU4, die Inhalte passen weitgehend.</li>
      </ul>

      <h2>So bereitest du dich vor</h2>
      <p>Jedes dieser Zertifikate prüft zwei Dinge: Formeln, die stimmen müssen, und Bedienung, die sitzen muss. Trenne die beiden in deiner Vorbereitung.</p>
      <h3>1. Formeln und Funktionen täglich tippen</h3>
      <p>Funktionen lernst du nicht durch Lesen. Für jedes Zertifikat gibt es bei Excel-Drills eine Kampagne mit einer Aufgabe pro Tag, geprüft von einer Formel-Engine. Die ersten 3 Tage sind gratis:</p>
      <ul>
        <li>{kp("siz-au4", "SIZ AU4 Tabellen: Funktionen-Sprint")} (10 Tage)</li>
        <li>{kp("siz-pu41", "SIZ PU41 Power-User: die Prüfungsfunktionen")} (12 Tage)</li>
        <li>{kp("mos-excel-associate", "MOS Excel Associate (MO-210): Formeln und Funktionen")} (8 Tage)</li>
        <li>{kp("mos-excel-expert", "MOS Excel Expert (MO-211): Funktionen für Profis")} (10 Tage)</li>
      </ul>
      <p>Die Funktionsnamen schaltest du zwischen Deutsch und Englisch um. Das ist vor allem für MOS wichtig, wenn du die Prüfung auf Englisch ablegst: <code>SVERWEIS</code> heisst dort <code>VLOOKUP</code>, und Argumente trennst du mit Komma statt Semikolon.</p>
      <h3>2. Die Bedienung in Excel selbst üben</h3>
      <p>Formatierung, Tabellen-Formatvorlagen, Diagramme, PivotTables, Power Query, Drucklayout, Blattschutz und Namensmanager kann keine Online-Übung ersetzen. Öffne Excel und arbeite die Punkte der jeweiligen Modulidentifikation oder des Microsoft-Prüfungsleitfadens ab. Auf der Seite <a href="../zertifikate/">Excel-Zertifikate</a> findest du dazu pro Zertifikat eine Checkliste zum Abhaken.</p>
      <h3>3. Mit echten Dateien und unter Zeitdruck</h3>
      <p>Bei <a href="../upload/">Excel-Datei prüfen</a> lädst du eine Aufgabe herunter, löst sie in deinem Excel und lädst sie wieder hoch: Excel-Drills liest deine Formeln aus der Datei und zeigt pro Zelle, was fehlt. Zum Schluss testest du dein Tempo im <a href="../assessment/">Excel-Assessment</a>: 5 Aufgaben mit Timer, Einstufung und Diagnose.</p>
      <p>Transparenz zum Schluss: Excel-Drills ist unsere eigene Plattform und kein Prüfungsanbieter. Wir sind weder mit dem SIZ noch mit Microsoft oder dem ICDL verbunden. Die Angaben stammen von siz.ch, learn.microsoft.com und xcdl.ch, Stand 1. November 2026. Prüfe Preise und Inhalte vor der Anmeldung bei der Prüfungsstelle.</p>'''

practice = f'''        <p><strong>Starte mit dem Funktionsteil deines Zertifikats.</strong> Tag 1 bis 3 jeder Kampagne sind gratis, ohne Anmeldung, direkt im Browser.</p>
        <p><a class="btn" href="../kampagne/?kampagne=siz-au4">SIZ AU4 starten</a> <a class="btn btn-secondary" href="../kampagne/?kampagne=mos-excel-associate">MOS MO-210 starten</a></p>
        <p class="fill-note">Alle Zertifikate, Fakten und Checklisten: <a href="../zertifikate/">Excel-Zertifikate in der Schweiz</a>.</p>'''

faq = [
    ("Welches Excel-Zertifikat lohnt sich in der Schweiz?",
     "Für Büro und KV das SIZ-Modul AU4 Tabellen, für Finanz- und Rechnungswesen PU41 (laut Kursanbietern Zulassungsvoraussetzung für die Berufsprüfung Fachleute Finanz- und Rechnungswesen), für internationale Firmen MOS Excel Associate (MO-210) und danach MO-211."),
    ("Was kostet ein Excel-Zertifikat in der Schweiz?",
     "AU4 kostet CHF 110 bei einer SIZ-Partnerschule und CHF 132 bei der SIZ-Geschäftsstelle, PU41 CHF 260 bzw. CHF 312. Bei MOS legt das Testcenter den Preis fest, zum Beispiel Digicomp. Stand 1. November 2026."),
    ("Reicht Excel-Drills allein für die Prüfung?",
     "Nein. Excel-Drills trainiert Formeln und Funktionen. Formatierung, Diagramme, Pivot, Power Query, Drucklayout und Schutz übst du in Excel selbst, die Checklisten auf der Seite Excel-Zertifikate helfen dabei."),
    ("Wie lange dauert die Vorbereitung?",
     "Das SIZ empfiehlt 28 Lektionen für AU4 und 40 Lektionen für PU41. Die MOS-Prüfungen dauern je 50 Minuten. Die Kampagnen bei Excel-Drills dauern 8 bis 12 Tage mit einer Aufgabe pro Tag."),
    ("Kann ich das ICDL noch machen?",
     "Stand 1. November 2026 nicht: Die Schweizer Lizenznehmerin meldet auf xcdl.ch einen vorübergehenden Unterbruch des Prüfungsbetriebs nach einer gerichtlichen Anordnung zur Marke. Setze auf SIZ AU4, die Inhalte sind weitgehend deckungsgleich."),
]

PAGE = article_page("excel-zertifikat-schweiz.html",
    "Excel-Zertifikat Schweiz: SIZ, MOS oder ICDL? Vergleich und Vorbereitung",
    "SIZ AU4 und PU41, MOS MO-210 und MO-211, ICDL: Preise, Prüfungsform und Inhalte der Excel-Zertifikate in der Schweiz, mit Plan zur Vorbereitung.",
    "Excel-Zertifikat Schweiz: SIZ, MOS oder ICDL? Vergleich und Vorbereitung",
    "In der Schweiz zählen vier Excel-Zertifikate: die SIZ-Module AU4 Tabellen und PU41 sowie Microsoft Office Specialist Excel Associate (MO-210) und Expert (MO-211). Das ICDL ist zurzeit nicht verfügbar. Hier findest du Preise, Prüfungsform, Inhalte und einen Plan für die Vorbereitung.",
    body, faq, practice, date_iso="2026-11-01", date_text="1. November 2026")
