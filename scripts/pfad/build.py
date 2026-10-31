"""Erzeugt die Lernpfad-Seiten pfad/index.html und pfad/<id>.html.
Aufruf: python3 scripts/pfad/build.py   (Kopf, Header und Footer kommen aus scripts/artikel/lib.py)
Die Themenlisten sind bewusst statisch, damit die Seiten ohne JavaScript indexierbar sind.
Name, Claim und Zielgruppe stehen hier als Kopie von "tracks" in app/exercises.json: bei Änderungen dort nachführen."""
import html, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "artikel"))
from lib import head, header, footer, DOMAIN  # noqa: E402

ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "pfad")
MAIL = "mailto:hallo@excel-drills.ch"  # Platzhalter wie in impressum.html; vor Livegang ersetzen

TRACKS = [
    {"id": "basis", "name": "Basis", "claim": "Die Funktionen, die jeder Excel-Test abfragt",
     "audience": "Berufseinstieg, Stellenwechsel, Einstellungstest", "soon": False},
    {"id": "accounting", "name": "Accounting & Controlling", "claim": "Abschluss, Abstimmung, Abweichungen",
     "audience": "Sachbearbeitung Finanzen, Treuhand, Controlling", "soon": False},
    {"id": "finance", "name": "Banking & Finance", "claim": "Zins, Cashflow, Prämien, Szenarien",
     "audience": "Einstieg Bank und Versicherung, Analysten", "soon": False},
    {"id": "consulting", "name": "Consulting", "claim": "Saubere Modelle, schnelle Analysen",
     "audience": "Praktikum, Analyst, Case-Interview", "soon": True},
    {"id": "data", "name": "Data & Reporting", "claim": "Daten bereinigen, Reports bauen",
     "audience": "Reporting, Analysten", "soon": False},
]
BY_ID = {t["id"]: t for t in TRACKS}

# Übungen pro Pfad direkt aus app/exercises.json (Anzahl gratis/total und Liste mit Schloss)
with open(os.path.join(ROOT, "app", "exercises.json"), encoding="utf-8") as fh:
    EXERCISES = json.load(fh)["exercises"]
PRICE_NOTE = "ab CHF 4.10/Monat im Jahresabo"


def track_items(tid):
    return [e for e in EXERCISES if e.get("track", "basis") == tid]


def counts(tid):
    items = track_items(tid)
    return sum(1 for e in items if e["free"]), len(items)

# ---------------------------------------------------------------- Inhalte

PAGES = {}

PAGES["basis"] = dict(
    title="Excel Grundlagen üben: Lernpfad Basis | Excel-Drills",
    desc="Excel Grundlagen üben statt Videos schauen: SUMME, WENN, SVERWEIS, SUMMEWENN und absolute Bezüge im Browser lösen, mit Sofort-Prüfung. Gratis starten.",
    h1="Excel Grundlagen üben",
    summary="Der Lernpfad Basis deckt die Excel-Funktionen ab, die in fast jedem Büro und in fast jedem Excel-Einstellungstest vorkommen. Du löst kurze, realistische Übungen direkt im Browser, Excel-Drills prüft deine Formel sofort und erklärt typische Fehler auf Deutsch.",
    topics=[
        ("SUMME", "Werte eines Bereichs addieren, die Basis jeder Auswertung."),
        ("MITTELWERT", "Durchschnitte berechnen, etwa die durchschnittliche Schadenhöhe."),
        ("MAX / MIN", "Höchst- und Tiefstwerte finden, zum Beispiel den besten Monat."),
        ("WENN", "Entscheidungen abbilden: Budget eingehalten oder überzogen?"),
        ("ZÄHLENWENN", "Einträge zählen, die eine Bedingung erfüllen, etwa offene Rechnungen."),
        ("SUMMEWENN", "Nur passende Werte summieren, pro Region oder ab einer Menge."),
        ("SVERWEIS", "Werte nachschlagen, exakt oder nach Staffel."),
        ("RUNDEN", "Beträge kaufmännisch auf Rappen runden."),
        ("Absolute Bezüge", "Mit $ fixierte Zellen, damit Formeln kopierbar bleiben."),
        ("WENNFEHLER", "Fehler wie #DIV/0! abfangen und sauber darstellen."),
        ("TEXTKETTE", "Texte verbinden, zum Beispiel Vor- und Nachname."),
        ("SUMMENPRODUKT", "Menge mal Preis in einer einzigen Formel summieren."),
        ("Verschachtelte WENN", "Mehrere Stufen abbilden, etwa Risikoklassen."),
    ],
    body="""      <h2>Für wen der Basis-Pfad gedacht ist</h2>
      <p>Der Basis-Pfad ist der Einstieg in Excel-Drills. Er richtet sich an alle, die Excel im Beruf brauchen und die wichtigsten Formeln sicher beherrschen wollen: Lernende und Absolventinnen der KV-Lehre, Leute nach dem Studium oder der Matura, Quereinsteiger und alle, die vor einem Stellenwechsel stehen. Viele Firmen prüfen Excel-Kenntnisse im Bewerbungsverfahren mit einem kurzen Test. Dort kommen fast immer dieselben Funktionen vor, und genau diese übst du hier.</p>
      <p>Du musst kein Vorwissen mitbringen. Wenn du weisst, dass eine Formel mit einem Gleichheitszeichen beginnt, reicht das. Wer Excel schon kennt, nutzt den Pfad als schnellen Check: Die Übungen zeigen in wenigen Minuten, wo du sicher bist und wo du noch nachschlagen musst.</p>

      <h2>Typische Aufgaben im Job</h2>
      <p>Excel-Grundlagen sind kein Selbstzweck. Sie stecken in den kleinen Aufgaben, die im Büroalltag jeden Tag anfallen:</p>
      <ul>
        <li>Den Umsatz aller Filialen oder Monate zusammenzählen und den Durchschnitt ausweisen.</li>
        <li>Prüfen, ob eine Kostenstelle ihr Budget eingehalten hat, und das Ergebnis als «OK» oder «Überzogen» anzeigen.</li>
        <li>Zählen, wie viele Rechnungen noch offen sind, oder den Umsatz einer einzelnen Region summieren.</li>
        <li>Zu einer Artikelnummer den Preis aus einer Preisliste holen, statt ihn abzutippen.</li>
        <li>Die MwSt mit einem fixen Satz berechnen und die Formel für die ganze Liste nach unten kopieren.</li>
        <li>Namen aus zwei Spalten zusammensetzen oder Fehlermeldungen wie #DIV/0! sauber abfangen.</li>
      </ul>
      <p>Wer diese Muster sicher beherrscht, arbeitet schneller, macht weniger Fehler und kann Tabellen von Kolleginnen und Kollegen besser nachvollziehen.</p>

      <h2>Themen im Pfad Basis</h2>
      <p>Die Übungen bauen aufeinander auf. Du startest mit einfachen Aggregaten und arbeitest dich zu Nachschlagefunktionen und verschachtelten Formeln vor.</p>
{topics}

      <h2>So übst du im Basis-Pfad</h2>
      <p>Jede Übung zeigt eine kleine Tabelle mit Spaltenbuchstaben und Zeilennummern wie in Excel. Die Zielzelle ist gelb markiert, darüber steht die Aufgabe. Du tippst die Formel ein und drückst Enter. Im Hintergrund rechnet eine echte Formel-Engine mit deutschen Funktionsnamen und dem Semikolon als Trennzeichen. Excel-Drills vergleicht nicht deinen Text mit einer Musterlösung, sondern das Ergebnis. Wenn du einen anderen, korrekten Weg wählst, zählt das genauso. Bei vielen Übungen wird deine Formel zusätzlich mit anderen Zahlen geprüft, damit sie nicht nur zufällig stimmt.</p>
      <p>Machst du einen Fehler, bekommst du einen konkreten Hinweis: «Auf Deutsch heisst die Funktion SUMMEWENN», «Das Kriterium braucht Anführungszeichen» oder «Ohne $ verschiebt sich der Bezug beim Kopieren». So lernst du auch, warum deine erste Idee nicht funktioniert hat. Eine Übung dauert ein bis drei Minuten, dein Fortschritt bleibt in deinem Browser gespeichert.</p>
      <p>Zu den wichtigsten Funktionen gibt es ausführliche Artikel: <a href="../artikel/sverweis.html">SVERWEIS</a>, <a href="../artikel/summewenn.html">SUMMEWENN</a>, <a href="../artikel/wenn-funktion.html">WENN</a>, <a href="../artikel/zaehlenwenn.html">ZÄHLENWENN</a> und <a href="../artikel/absolute-bezuege.html">absolute Bezüge</a>.</p>

      <h2>Gratis starten, danach weiter in die Berufspfade</h2>
      <p>Die ersten zehn Übungen im Basis-Pfad sind gratis und ohne Anmeldung. Mit Premium schaltest du die fortgeschrittenen Übungen frei und bekommst Zugang zu allen Lernpfaden. Wenn du die Basis sitzt, geht es mit <a href="accounting.html">Accounting &amp; Controlling</a> oder <a href="finance.html">Banking &amp; Finance</a> weiter. Dort wendest du dieselben Funktionen auf Aufgaben aus dem Abschluss, dem Controlling, der Bank oder der Versicherung an.</p>
""",
    practice="Starte mit der ersten Übung. Ohne Anmeldung, direkt im Browser, mit sofortigem Feedback.",
)

PAGES["accounting"] = dict(
    title="Excel für Accounting und Controlling lernen | Excel-Drills",
    desc="Excel für Accounting und Controlling lernen: SUMMEWENNS, Kontenabstimmung, Abgrenzungen, Budget/Ist, MwSt und offene Posten im Browser üben.",
    h1="Excel für Accounting und Controlling lernen",
    summary="Der Lernpfad Accounting &amp; Controlling trainiert die Excel-Aufgaben, die im Monatsabschluss, in der Kontenabstimmung und im Budgetvergleich immer wieder anfallen. Du löst realistische Übungen mit Schweizer Beträgen, MwSt und Rappenrundung direkt im Browser, und Excel-Drills prüft deine Formel sofort.",
    topics=[
        ("SUMMEWENNS", "Aufwand nach Konto, Kostenstelle und Periode summieren, mit mehreren Bedingungen."),
        ("Kontenabstimmung mit SVERWEIS/XVERWEIS", "Salden aus zwei Listen abgleichen und Differenzen sichtbar machen."),
        ("Abgrenzungen mit DATUM, EDATUM, MONATSENDE", "Perioden bestimmen, Laufzeiten berechnen, transitorische Posten sauber abgrenzen."),
        ("Abweichungsanalyse Budget/Ist", "Abweichungen in CHF berechnen und als günstig oder ungünstig kennzeichnen."),
        ("Prozentabweichungen", "Abweichungen relativ zum Budget ausweisen, ohne Division durch null."),
        ("MwSt netto/brutto", "Vom Netto- zum Bruttobetrag und zurück, mit dem Satz in einer eigenen Zelle."),
        ("Rundung auf 5 Rappen", "Beträge auf 0.05 CHF runden, wie auf Schweizer Rechnungen üblich."),
        ("Duplikate finden mit ZÄHLENWENN", "Doppelte Belegnummern markieren, bevor sie doppelt gebucht werden."),
        ("Alterung offener Posten", "Offene Rechnungen nach Tagen überfällig in Altersklassen einteilen."),
        ("Pivot als Projekt", "Eine Buchungsliste nach Konto und Monat verdichten, so wie es eine Pivot-Tabelle tut."),
    ],
    body="""      <h2>Für wen dieser Pfad gedacht ist</h2>
      <p>Der Pfad richtet sich an Leute, die in der Finanzabteilung, in der Buchhaltung, in einem Treuhandbüro oder im Controlling arbeiten oder dort einsteigen wollen. Typisch sind Sachbearbeiterinnen und Sachbearbeiter Finanzen, Mitarbeitende im Rechnungswesen, Junior-Controller und Lernende im KV mit Schwerpunkt Finanzen. Auch wer sich auf eine Weiterbildung im Finanz- und Rechnungswesen vorbereitet, findet hier die passenden Excel-Übungen.</p>
      <p>Du solltest die Grundlagen kennen: SUMME, WENN, SVERWEIS und absolute Bezüge. Falls du da noch unsicher bist, starte mit dem <a href="basis.html">Basis-Pfad</a>. Er ist schnell durchgearbeitet und legt das Fundament für alles, was hier folgt.</p>

      <h2>Typische Aufgaben im Job</h2>
      <p>Im Rechnungswesen ist Excel das Werkzeug zwischen den Systemen. Das ERP liefert Rohdaten, das Management will einen sauberen Report, und dazwischen stehen Tabellen, die stimmen müssen. Typische Aufgaben sind:</p>
      <ul>
        <li>Im Monatsabschluss den Aufwand pro Konto und Kostenstelle summieren und mit dem Vormonat vergleichen.</li>
        <li>Das Hauptbuch mit einem Nebenbuch oder dem Bankauszug abstimmen und die Differenzen erklären.</li>
        <li>Vorausbezahlte Versicherungen, Mieten oder Lizenzen periodengerecht abgrenzen.</li>
        <li>Das Ist mit dem Budget vergleichen und Abweichungen in Franken und Prozent kommentieren.</li>
        <li>Offene Debitoren nach Alter gliedern und daraus Mahnstufen oder Wertberichtigungen ableiten.</li>
        <li>MwSt-Beträge aus Brutto- und Nettowerten herausrechnen und Rechnungsbeträge auf 5 Rappen runden.</li>
        <li>Doppelte Belegnummern finden, bevor eine Rechnung zweimal bezahlt wird.</li>
      </ul>
      <p>Fehler in diesen Tabellen kosten nicht nur Zeit, sondern Vertrauen. Wer seine Formeln sicher aufbaut und versteht, warum sie funktionieren, erkennt falsche Zahlen schneller und muss weniger von Hand nachprüfen.</p>

      <h2>Themen im Pfad Accounting &amp; Controlling</h2>
      <p>Die Übungen decken die typischen Schritte eines Monatsabschlusses ab: summieren, abstimmen, abgrenzen und analysieren.</p>
{topics}

      <h2>So ist der Pfad aufgebaut</h2>
      <p>Jede Übung zeigt eine kleine Tabelle, wie sie im Rechnungswesen vorkommt: eine Buchungsliste, eine Saldenliste, ein Budget mit Ist-Werten, eine Liste offener Posten. Die Aufgabe sagt dir, was in welcher Zelle stehen soll. Du schreibst die Formel selbst, mit deutschen Funktionsnamen und Semikolon als Trennzeichen, so wie in der Schweizer Excel-Version. Excel-Drills rechnet deine Formel mit einer echten Formel-Engine und prüft das Ergebnis, bei vielen Übungen zusätzlich mit anderen Zahlen. Ein fest eingetippter Betrag reicht also nicht.</p>
      <p>Wenn etwas nicht stimmt, bekommst du einen konkreten Hinweis: ein vergessenes $ beim MwSt-Satz, ein Kriterium ohne Anführungszeichen, ein falscher Spaltenindex. Gerade bei Datumsfunktionen und Rundungen sind es oft Kleinigkeiten, die im Abschluss zu Differenzen führen. Hier fallen sie dir sofort auf.</p>
      <p>Den Abschluss bildet ein kleines Projekt rund um die Pivot-Tabelle. Du verdichtest eine Buchungsliste nach Konto und Monat und lernst, wann sich eine Pivot-Tabelle lohnt und wann eine Formel-Auswertung die bessere Wahl ist, etwa wenn der Report jeden Monat gleich aussehen muss.</p>

      <h2>Gratis testen, mit Premium alles</h2>
      <p>{free} von {total} Übungen in diesem Pfad löst du gratis und ohne Anmeldung. Premium schaltet alle Übungen in allen Lernpfaden frei ({price}), auch die neuen, die laufend dazukommen. Wer im Finanzbereich arbeitet, kann danach im Pfad <a href="finance.html">Banking &amp; Finance</a> mit Zinsrechnung, Cashflows und Szenarien weitermachen.</p>
""",
    practice="Starte mit der ersten Übung im Pfad. Dein Fortschritt bleibt in deinem Browser gespeichert.",
)

PAGES["finance"] = dict(
    title="Excel für Banking und Finance üben | Excel-Drills",
    desc="Excel für Banking und Finance üben: Zinsrechnung, RMZ, BW, ZW, Cashflows, Prämienstaffeln, Schadenquote, CAGR und Szenarien direkt im Browser.",
    h1="Excel für Banking und Finance üben",
    summary="Der Lernpfad Banking &amp; Finance trainiert die Excel-Formeln, die in Banken, Versicherungen und Finanzabteilungen zum Alltag gehören: Zins und Zinseszins, Annuitäten, Cashflows, Prämien und Szenarien. Du löst jede Übung direkt im Browser, Excel-Drills prüft deine Formel sofort.",
    topics=[
        ("Zinsrechnung einfach und zusammengesetzt", "Zins für eine Periode und Zinseszins über mehrere Jahre berechnen."),
        ("RMZ, BW und ZW", "Annuität, Barwert und Endwert mit den Finanzfunktionen von Excel bestimmen."),
        ("Cashflow-Tabelle mit kumuliertem Saldo", "Zu- und Abflüsse pro Periode erfassen und den laufenden Saldo fortschreiben."),
        ("Prämienstaffel mit SVERWEIS/XVERWEIS", "Prämien oder Konditionen nach Alter, Summe oder Stufe nachschlagen."),
        ("Schadenquote", "Schäden ins Verhältnis zu den Prämien setzen und sauber als Prozent ausweisen."),
        ("Szenario mit WENN und WAHL", "Zwischen Basis-, Best- und Worst-Case umschalten, gesteuert über eine Zelle."),
        ("Wachstumsrate (CAGR)", "Die durchschnittliche jährliche Wachstumsrate über mehrere Jahre berechnen."),
        ("INDEX/VERGLEICH", "Flexibel nachschlagen, auch nach links und in zwei Richtungen."),
        ("Portfoliogewichte mit SUMMENPRODUKT", "Gewichtete Rendite und Anteile eines Portfolios in einer Formel."),
        ("Break-even", "Die Menge oder den Umsatz bestimmen, ab der ein Produkt Gewinn bringt."),
    ],
    body="""      <h2>Für wen dieser Pfad gedacht ist</h2>
      <p>Der Pfad richtet sich an Leute, die in einer Bank, einer Versicherung, einer Vermögensverwaltung oder in der Finanzabteilung eines Unternehmens einsteigen oder bereits dort arbeiten. Typisch sind Trainees und Berufseinsteiger nach dem Studium, Kundenberaterinnen, Mitarbeitende im Underwriting, im Risikomanagement oder im Treasury und angehende Analysten. Auch wer sich auf ein Assessment mit einer Excel-Fallstudie vorbereitet, findet hier die passenden Übungen.</p>
      <p>Du solltest die Grundlagen kennen: SUMME, WENN, SVERWEIS und absolute Bezüge. Wenn du da noch unsicher bist, starte mit dem <a href="basis.html">Basis-Pfad</a>. Die Finanzfunktionen bauen darauf auf.</p>

      <h2>Typische Aufgaben im Job</h2>
      <p>In Banking und Finance geht es selten um eine einzelne Zahl. Gefragt ist ein Modell, das bei neuen Annahmen sofort neu rechnet. Typische Aufgaben sind:</p>
      <ul>
        <li>Für einen Kredit oder eine Hypothek die jährliche Rate berechnen und zeigen, wie sich ein anderer Zinssatz auswirkt.</li>
        <li>Den heutigen Wert künftiger Zahlungen bestimmen, etwa für eine Rente oder eine Investition.</li>
        <li>Eine Cashflow-Planung aufbauen und erkennen, in welchem Monat die Liquidität knapp wird.</li>
        <li>In der Versicherung Prämien nach Alter oder Versicherungssumme aus einer Staffel holen und die Schadenquote eines Portefeuilles berechnen.</li>
        <li>Wachstum über mehrere Jahre vergleichbar machen und Portfolios nach ihren Gewichten auswerten.</li>
        <li>Für ein Produkt oder ein Projekt den Break-even bestimmen und mit Szenarien absichern.</li>
      </ul>
      <p>Wer diese Formeln sicher aufbaut, liefert schneller belastbare Zahlen und kann im Gespräch erklären, wie sie zustande kommen.</p>

      <h2>Themen im Pfad Banking &amp; Finance</h2>
      <p>Die Übungen reichen von der Zinsrechnung über Cashflows und Nachschlagefunktionen bis zu kleinen Modellen mit Szenarien.</p>
{topics}

      <h2>So ist der Pfad aufgebaut</h2>
      <p>Jede Übung zeigt eine kleine Tabelle mit realistischen Zahlen in Schweizer Franken: Zinssätze, Laufzeiten, Prämien, Schäden, Cashflows. Die Aufgabe sagt dir, was in der gelb markierten Zielzelle stehen soll. Du schreibst die Formel selbst, mit deutschen Funktionsnamen wie RMZ, BW, ZW, INDEX und VERGLEICH und dem Semikolon als Trennzeichen. Excel-Drills rechnet deine Formel mit einer echten Formel-Engine und vergleicht das Ergebnis mit der Musterlösung, bei vielen Übungen auch mit anderen Zahlen.</p>
      <p>Gerade bei Finanzfunktionen passieren typische Fehler: ein Jahreszins, der für Monatsraten nicht durch zwölf geteilt wird, ein Vorzeichen, das falsch herum steht, eine Wachstumsrate, die als einfacher Durchschnitt statt als CAGR berechnet wird. Excel-Drills weist dich auf solche Punkte hin, damit du sie im echten Modell nicht übersiehst.</p>
      <p>Die Szenario-Übungen zeigen, wie du ein Modell steuerbar machst: Eine einzige Zelle entscheidet, ob Basis-, Best- oder Worst-Case gerechnet wird. Das ist dasselbe Prinzip, das in Bewertungsmodellen und Business Cases verwendet wird.</p>

      <h2>Gratis testen, mit Premium alles</h2>
      <p>{free} von {total} Übungen in diesem Pfad löst du gratis und ohne Anmeldung. Premium schaltet alle Übungen in allen Lernpfaden frei ({price}), auch die neuen, die laufend dazukommen. Wer zusätzlich mit Abschluss und Budget zu tun hat, findet im Pfad <a href="accounting.html">Accounting &amp; Controlling</a> die passenden Übungen.</p>
""",
    practice="Starte mit der ersten Übung im Pfad. Dein Fortschritt bleibt in deinem Browser gespeichert.",
)

PAGES["consulting"] = dict(
    title="Excel für Consulting: Lernpfad bald verfügbar | Excel-Drills",
    desc="Excel für Consulting üben: saubere Modelle, Sensitivitäten, Marktgrössen und schnelle Analysen für Praktikum und Case-Interview. Der Pfad ist in Arbeit.",
    h1="Excel für Consulting",
    summary="Der Lernpfad Consulting ist in Arbeit. Er wird die Excel-Techniken trainieren, die in Strategieberatung, Praktikum und Case-Interview zählen: saubere Modelle, klare Annahmen und schnelle Analysen unter Zeitdruck.",
    topics=[
        ("Modellaufbau", "Annahmen, Berechnung und Ergebnis sauber trennen, damit ein Modell nachvollziehbar bleibt."),
        ("Marktgrössen", "Top-down und Bottom-up schätzen, mit klaren Treibern pro Zeile."),
        ("INDEX/VERGLEICH und XVERWEIS", "Daten aus grossen Tabellen flexibel zusammenführen."),
        ("Sensitivitäten", "Zeigen, wie stark das Ergebnis auf einzelne Annahmen reagiert."),
        ("Szenarien", "Basis-, Best- und Worst-Case über eine Steuerzelle umschalten."),
        ("Break-even und Payback", "Die Schwelle bestimmen, ab der sich eine Massnahme lohnt."),
        ("Wachstum und CAGR", "Entwicklungen über Jahre vergleichbar machen."),
        ("Plausibilisierung", "Mit Kontrollsummen und Prüfformeln Fehler finden, bevor es der Kunde tut."),
    ],
    body="""      <h2>Für wen dieser Pfad gedacht ist</h2>
      <p>Der Consulting-Pfad richtet sich an Studierende und Absolventen, die ein Praktikum oder einen Einstieg in einer Beratung anstreben, an Analysten in Strategie- und Inhouse-Consulting-Teams und an alle, die sich auf ein Case-Interview mit Excel-Teil vorbereiten. Auch wer in einer Projekt- oder Strategiefunktion arbeitet und regelmässig Business Cases rechnet, profitiert von den Übungen.</p>
      <p>Die Grundlagen solltest du kennen. Den <a href="basis.html">Basis-Pfad</a> kannst du schon heute üben, und viele Themen aus <a href="finance.html">Banking &amp; Finance</a> wie Szenarien, CAGR, INDEX/VERGLEICH und Break-even sind direkt für Consulting-Aufgaben relevant.</p>

      <h2>Typische Aufgaben im Job</h2>
      <p>In der Beratung zählt nicht die komplizierteste Formel, sondern ein Modell, das stimmt, schnell angepasst werden kann und für andere lesbar ist. Typische Aufgaben sind:</p>
      <ul>
        <li>Eine Marktgrösse aus wenigen Annahmen schätzen und die Treiber offenlegen.</li>
        <li>Einen Business Case für eine Massnahme aufbauen: Kosten, Nutzen, Break-even, Payback.</li>
        <li>Daten aus mehreren Quellen zusammenführen und auf Kunden-, Produkt- oder Regionsebene auswerten.</li>
        <li>Zeigen, wie stark das Ergebnis von einzelnen Annahmen abhängt, und das in einer übersichtlichen Tabelle darstellen.</li>
        <li>Im Case-Interview unter Zeitdruck eine kleine Analyse sauber und fehlerfrei rechnen.</li>
      </ul>
      <p>Wer diese Muster beherrscht, verbringt weniger Zeit mit Fehlersuche und mehr Zeit mit der eigentlichen Frage: Was bedeutet die Zahl für den Kunden?</p>
      <p>Dazu kommt die Form: Beratungsmodelle werden von mehreren Personen bearbeitet und oft unter Zeitdruck angepasst. Eingaben in einer eigenen Zone, eine Formel pro Zeile, keine fest eingetippten Zahlen in Formeln und Kontrollsummen am Rand sind deshalb keine Pedanterie, sondern der Grund, warum ein Modell auch in der letzten Nacht vor der Präsentation noch stimmt.</p>

      <h2>Geplante Themen</h2>
      <p>Die Themenliste ist ein Entwurf und kann sich bis zum Start noch ändern.</p>
{topics}

      <h2>Wie die Übungen aussehen werden</h2>
      <p>Wie in den anderen Pfaden bekommst du eine kleine Tabelle und eine klare Aufgabe. Du schreibst die Formel selbst, mit deutschen Funktionsnamen und Semikolon als Trennzeichen, und Excel-Drills prüft das Ergebnis sofort, oft auch mit anderen Zahlen. So merkst du, ob dein Modell allgemein funktioniert oder nur für die Beispielwerte. Im Consulting-Pfad kommen zusätzlich Übungen dazu, in denen du mehrere Formeln zu einem kleinen Modell verbindest, so wie es in einem Case-Interview verlangt wird.</p>
      <p>Bis der Pfad bereit ist, kannst du mit den bestehenden Pfaden üben. Premium umfasst alle Lernpfade, auch die, die neu dazukommen.</p>
""",
)

PAGES["data"] = dict(
    title="Excel Pivot und Power Query üben | Excel-Drills",
    desc="Pivot-Tabellen und Power Query mit echten Excel-Dateien üben: Datei laden, Report bauen, Kontrollfragen beantworten. 5 Projekte, 2 davon gratis.",
    h1="Excel Pivot und Power Query üben",
    summary="Im Lernpfad Data &amp; Reporting arbeitest du in deinem eigenen Excel. Du lädst eine kleine Datei mit realistischen Verkaufsdaten herunter, baust daraus eine Pivot-Tabelle oder eine Power-Query-Abfrage und beantwortest Kontrollfragen. Excel-Drills prüft deine Zahlen sofort.",
    handout=False,
    cta_note="Ohne Anmeldung, du brauchst Excel 365 oder 2021",
    topics=[
        ("Pivot: Umsatz nach Region und Quartal", "Die erste Pivot-Tabelle: Zeilen, Spalten, Werte und Gesamtergebnis."),
        ("Pivot: Bestellungen nach Monat", "Ein Datum nach Monaten und Quartalen gruppieren, Summe und Mittelwert pro Bestellung."),
        ("Pivot: Anteile und Rangliste", "Mit «Werte anzeigen als» Prozent vom Gesamtergebnis und Ränge berechnen."),
        ("Pivot: Marge mit Datenschnitt", "Berechnetes Feld für die Marge, Filter auf ein Jahr und ein Datenschnitt für die Quartale."),
        ("Power Query: Bestellungen und Kunden", "Zwei Tabellen zusammenführen, Leerzeichen kürzen, Duplikate entfernen und nach Segment summieren."),
    ],
    body="""      <h2>Für wen dieser Pfad gedacht ist</h2>
      <p>Der Pfad Data &amp; Reporting richtet sich an alle, die regelmässig Daten aus einem System holen und daraus einen Report machen: Mitarbeitende im Reporting, Business Analysts, Leute in Verkauf, Marketing, HR oder Operations, die monatliche Kennzahlen liefern, und alle, die mit Exporten aus ERP, CRM oder Webanalyse arbeiten. Auch wer sich auf eine Stelle mit Datenfokus vorbereitet, findet hier die passenden Übungen.</p>
      <p>Formeln wie SUMME und SVERWEIS solltest du kennen, Pivot und Power Query nicht. Die Schritte führen dich durch jedes Projekt. Wenn dir die Grundlagen fehlen, starte mit dem <a href="basis.html">Basis-Pfad</a>.</p>

      <h2>Wie Projekte funktionieren</h2>
      <p>Pivot-Tabellen und Power Query kann man nicht im Browser nachbauen. Deshalb sind die Übungen in diesem Pfad Projekte: Du arbeitest im echten Excel, Excel-Drills prüft das Ergebnis.</p>
      <ol>
        <li><strong>Datei laden.</strong> Jedes Projekt hat eine kleine Excel-Datei mit 150 bis 300 Zeilen: Bestellungen einer Schweizer Firma mit Filialen in Zürich, Bern, Basel, Luzern, Lugano und St. Gallen. Die Daten stehen als formatierte Tabelle bereit, Beträge als Zahlen, Datum als echtes Datum.</li>
        <li><strong>In Excel bauen.</strong> Die Schritte sagen dir genau, wo du klickst, zum Beispiel «Einfügen» › «PivotTable» oder «Daten» › «Aus Tabelle/Bereich». Abgehakte Schritte merkt sich die App in deinem Browser.</li>
        <li><strong>Fragen beantworten.</strong> Mit deiner fertigen Pivot oder Abfrage beantwortest du drei bis vier Kontrollfragen, etwa den Umsatz einer Region im dritten Quartal. Komma oder Punkt, mit oder ohne Hochkomma: Die App versteht beides und sagt dir pro Frage, ob die Zahl stimmt. Stimmt alles, gibt es Bronze und XP wie bei den Formel-Übungen.</li>
      </ol>
      <p>Du brauchst Excel 365 oder Excel 2021 für Windows oder Mac. Die Schritte beschreiben die deutsche Oberfläche. Power Query ist in diesen Versionen eingebaut.</p>

      <h2>Typische Aufgaben im Job</h2>
      <p>Daten kommen selten sauber an. Bevor ein Report entsteht, muss die Liste bereinigt, ergänzt und verdichtet werden. Typische Aufgaben sind:</p>
      <ul>
        <li>Einen Verkaufsexport nach Region, Produktgruppe und Quartal verdichten.</li>
        <li>Monatszahlen aus einer Liste mit Tagesdaten bilden, ohne eine Hilfsspalte zu bauen.</li>
        <li>Anteile und Ranglisten für die Geschäftsleitung zeigen statt nur Franken.</li>
        <li>Die Marge pro Filiale ausweisen und den Report per Klick auf ein Quartal umschalten.</li>
        <li>Zwei Exporte zusammenführen, etwa Bestellungen mit Kundendaten, und dabei Leerzeichen und doppelte Zeilen bereinigen.</li>
      </ul>
      <p>Wer diese Schritte beherrscht, spart jeden Monat Stunden an Handarbeit und liefert Zahlen, denen man vertrauen kann.</p>

      <h2>Die Projekte im Pfad</h2>
      <p>Die ersten zwei Projekte sind gratis. Sie führen dich Schritt für Schritt durch deine ersten Pivot-Tabellen. Die drei weiteren gehören zu Premium.</p>
{topics}

      <h2>Fallen, wie im echten Export</h2>
      <p>Im Power-Query-Projekt sind bewusst Fehler versteckt, wie sie in echten Exporten vorkommen: Kundennummern mit einem Leerzeichen am Ende, vier doppelte Zeilen und ein Kunde ohne Bestellung. Eine schnelle Pivot über die Rohdaten liefert deshalb falsche Zahlen. Erst wenn du die Daten in Power Query kürzt, bereinigst und richtig zusammenführst, stimmen die Antworten. Genau das ist der Grund, warum sich Power Query im Reporting lohnt: Die Bereinigung ist einmal gebaut und läuft beim nächsten Export per Klick auf «Alle aktualisieren» wieder.</p>
      <p>Premium schaltet alle Projekte und alle Übungen in den anderen Lernpfaden frei. Wer auch die Formeln für die Bereinigung üben will, findet im Pfad <a href="accounting.html">Accounting &amp; Controlling</a> Übungen zu SUMMEWENNS und Duplikaten.</p>
""",
    practice="Starte mit dem ersten Projekt: Datei laden, Pivot bauen, vier Fragen beantworten. Gratis und ohne Anmeldung.",
)

# ---------------------------------------------------------------- Bausteine

def topics_html(topics):
    items = "\n".join(f'        <li><strong>{n}</strong> {d}</li>' for n, d in topics)
    return f'      <ul class="topic-list">\n{items}\n      </ul>'


def card(t, href):
    soon = t["soon"]
    cls = "track-card soon" if soon else "track-card"
    more = '<span class="soon-badge">Bald verfügbar</span>' if soon else "Pfad ansehen &rarr;"
    name = t["name"].replace("&", "&amp;")
    return f'''          <li class="{cls}">
            <h3><a href="{href}">{name}</a></h3>
            <p class="claim">{t["claim"]}</p>
            <p class="audience">Für: {t["audience"]}</p>
            <p class="more">{more}</p>
          </li>'''


def others_html(current):
    lines = []
    for t in TRACKS:
        if t["id"] == current:
            continue
        name = t["name"].replace("&", "&amp;")
        suffix = " (bald verfügbar)" if t["soon"] else ""
        lines.append(f'          <li><a href="{t["id"]}.html">{name}</a>: {t["claim"]}{suffix}</li>')
    return "\n".join(lines)


def exercises_html(tid):
    free, total = counts(tid)
    rows = []
    for e in track_items(tid):
        title, topic = html.escape(e["title"]), html.escape(e["topic"])
        if e["free"]:
            rows.append(f'          <li><a href="../app/?pfad={tid}#{e["id"]}">{title}</a> <span class="fill-note">({topic})</span> <span class="ex-free">gratis</span></li>')
        else:
            rows.append(f'          <li>{title} <span class="fill-note">({topic})</span> <span class="ex-lock"><span aria-hidden="true">🔒</span> Premium</span></li>')
    items = "\n".join(rows)
    return f'''      <section class="track-exercises" aria-labelledby="exercises-heading">
        <h2 id="exercises-heading">Alle Übungen im Pfad</h2>
        <p><strong>{free} von {total} Übungen gratis</strong>, alle {total} mit Premium {PRICE_NOTE} (<a href="../premium.html">Preise ansehen</a>).</p>
        <ol class="track-exercise-list">
{items}
        </ol>
      </section>
'''


def track_page(tid):
    t, p = BY_ID[tid], PAGES[tid]
    name = t["name"].replace("&", "&amp;")
    topics = topics_html(p["topics"])
    plain = lambda s: s.replace("&amp;", "&")
    exercises = "" if t["soon"] else exercises_html(tid)
    if t["soon"]:
        ld = {"@context": "https://schema.org", "@type": "WebPage", "name": p["h1"], "description": p["desc"],
              "inLanguage": "de-CH", "isPartOf": {"@type": "WebSite", "name": "Excel-Drills"}}
        cta = f'''      <div class="soon-box" role="note" aria-labelledby="soon-heading">
        <h2 id="soon-heading">Bald verfügbar</h2>
        <p>Schreib uns, wenn du den Pfad zuerst willst. Wir melden uns, sobald die ersten Übungen bereit sind.</p>
        <p class="cta-row"><a class="btn" href="{MAIL}?subject=Lernpfad%20{t["id"]}">E-Mail schreiben</a> <a class="btn btn-secondary" href="./">Andere Pfade ansehen</a></p>
      </div>'''
        practice = f'''      <aside class="practice-box" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Schon jetzt üben</h2>
        <p>Schreib uns, wenn du den Pfad «{name}» zuerst willst: <a href="{MAIL}?subject=Lernpfad%20{t["id"]}">E-Mail an Excel-Drills</a>. Bis dahin kannst du mit den Grundlagen starten.</p>
        <p><a class="btn" href="../app/?pfad=basis">Basis-Pfad starten</a></p>
      </aside>'''
    else:
        ld = {"@context": "https://schema.org", "@type": "Course", "name": p["h1"], "description": p["desc"],
              "inLanguage": "de-CH", "provider": {"@type": "Organization", "name": "Excel-Drills"},
              "audience": {"@type": "Audience", "audienceType": t["audience"]},
              "teaches": [n for n, _ in p["topics"]]}
        cta = f'''      <p class="cta-row"><a class="btn btn-large" href="../app/?pfad={tid}">Pfad starten</a> <span class="fill-note">{p.get("cta_note", "Ohne Anmeldung, direkt im Browser")}</span></p>'''
        practice = f'''      <aside class="practice-box" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Bereit? Pfad starten</h2>
        <p>{p["practice"]}</p>
        <p><a class="btn" href="../app/?pfad={tid}">Pfad starten</a></p>
      </aside>'''
        # Spickzettel gibt es nur für Pfade mit Formel-Übungen (nicht für die Projekte in «data»)
        if p.get("handout", True):
            practice += f'''
      <aside class="practice-box handout-box" aria-labelledby="cheat-heading">
        <h2 id="cheat-heading">Spickzettel zum Pfad</h2>
        <p>Alle Funktionen aus «{name}» auf einer A4-Seite: Syntax, Mini-Beispiel und der typische Fehler. Dazu gibt es ein Trainer-Handout für eine 45-Minuten-Session.</p>
        <p><a class="btn btn-secondary" href="../handouts/index.html#spickzettel">Spickzettel als PDF holen</a></p>
      </aside>'''
    return f'''{head(p["title"], plain(p["desc"]), "pfad/" + tid + ".html", "website", [ld])}
<body>
{header("../", "pfade")}

  <main id="inhalt" class="wrap">
    <article class="prose article">
      <nav class="breadcrumb" aria-label="Brotkrümelnavigation">
        <ol>
          <li><a href="../">Startseite</a></li>
          <li><a href="./">Lernpfade</a></li>
          <li aria-current="page">{name}</li>
        </ol>
      </nav>
      <h1>{p["h1"]}</h1>
      <p class="article-meta">Lernpfad «{name}» &middot; Für: {t["audience"]}</p>
      <div class="summary">
        <p>{p["summary"]}</p>
      </div>
{cta}

{p["body"].format(topics=topics, free=counts(tid)[0], total=counts(tid)[1], price=PRICE_NOTE)}
{exercises}{practice}

      <nav class="read-more" aria-labelledby="read-more-heading">
        <h2 id="read-more-heading">Weitere Lernpfade</h2>
        <ul>
{others_html(tid)}
        </ul>
        <p><a href="./">Alle Lernpfade im Überblick</a></p>
      </nav>
    </article>
  </main>

{footer("../")}
</body>
</html>
'''


def index_page():
    title = "Lernpfade: Excel nach Beruf üben | Excel-Drills"
    desc = "Excel-Lernpfade für Basis, Accounting & Controlling, Banking & Finance, Consulting und Reporting: Übungen passend zu deinem Job, direkt im Browser."
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Excel-Lernpfade", "description": desc,
          "inLanguage": "de-CH", "hasPart": [{"@type": "WebPage" if t["soon"] else "Course", "name": t["name"]} for t in TRACKS]}
    cards = "\n".join(card(t, t["id"] + ".html") for t in TRACKS)
    return f'''{head(title, desc, "pfad/", "website", [ld])}
<body>
{header("../", "pfade")}

  <main id="inhalt" class="wrap">
    <div class="prose article">
      <nav class="breadcrumb" aria-label="Brotkrümelnavigation">
        <ol>
          <li><a href="../">Startseite</a></li>
          <li aria-current="page">Lernpfade</li>
        </ol>
      </nav>
      <h1>Lernpfade: Excel üben für deinen Job</h1>
      <div class="summary">
        <p>Jeder Lernpfad bündelt die Excel-Übungen, die in einem Berufsfeld wirklich vorkommen. Starte mit der Basis oder spring direkt in den Pfad, der zu deinem Job passt. Premium umfasst alle Pfade.</p>
      </div>
    </div>
    <section class="tracks-section" aria-labelledby="tracks-heading">
      <h2 id="tracks-heading" class="visually-hidden">Alle Lernpfade</h2>
        <ul class="track-cards">
{cards}
        </ul>
    </section>
    <div class="prose article">
      <h2>Welcher Pfad passt zu mir?</h2>
      <p>Wenn du Excel im Beruf neu brauchst oder dich auf einen Excel-Test im Bewerbungsverfahren vorbereitest, beginnst du mit <a href="basis.html">Basis</a>. Arbeitest du in Buchhaltung, Treuhand oder Controlling, ist <a href="accounting.html">Accounting &amp; Controlling</a> der richtige Pfad. Für Bank, Versicherung und Finanzanalyse gibt es <a href="finance.html">Banking &amp; Finance</a>. Wer Reports baut, übt im Pfad <a href="data.html">Data &amp; Reporting</a> Pivot-Tabellen und Power Query mit echten Excel-Dateien. Der Pfad <a href="consulting.html">Consulting</a> ist in Arbeit.</p>
      <aside class="practice-box" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Gleich loslegen</h2>
        <p>Die ersten Übungen sind gratis, ohne Anmeldung und laufen direkt im Browser.</p>
        <p><a class="btn" href="../app/?pfad=basis">Basis-Pfad starten</a></p>
      </aside>
    </div>
  </main>

{footer("../")}
</body>
</html>
'''


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for t in TRACKS:
        with open(os.path.join(OUT, t["id"] + ".html"), "w", encoding="utf-8") as f:
            f.write(track_page(t["id"]))
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_page())
    print("built", len(TRACKS) + 1, "pages in", OUT)
