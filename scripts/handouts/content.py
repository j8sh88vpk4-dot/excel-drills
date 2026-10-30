"""Inhalte der Handouts (Spickzettel, Formelkarten, Trainer-Handouts).
Handouts sind neutral-sachlich formuliert (keine Du-Form). Schweizer Schreibweise: Semikolon,
Punkt als Dezimalzeichen, Hochkomma als Tausendertrennzeichen. Kein ß.
Formeln stehen hier roh (mit < > " &); build.py escapt sie."""

# ---------------------------------------------------------------- A. Spickzettel
# Schlüssel = "topic" aus app/exercises.json. build.py prüft, dass jedes Thema eines Pfads hier steht.
# syntax: Liste von Syntaxzeilen; ex: (Daten, Formel, Ergebnis); err: typischer Fehler in einem Satz.
CHEAT = {
    # ---- Basis
    "SUMME": dict(
        syntax=["=SUMME(Zahl1;[Zahl2];…)"],
        ex=("A2:A4 = 120 | 80 | 50", "=SUMME(A2:A4)", "250"),
        err="Neue Zeilen unterhalb des Bereichs werden nicht mitgezählt: Bereich nach dem Einfügen prüfen."),
    "MITTELWERT": dict(
        syntax=["=MITTELWERT(Zahl1;[Zahl2];…)"],
        ex=("A2:A5 = 2'400 | 780 | 3'100 | 560", "=MITTELWERT(A2:A5)", "1'710"),
        err="Die Funktion heisst MITTELWERT, nicht DURCHSCHNITT; leere Zellen zählen nicht, Nullen schon."),
    "MAX / MIN": dict(
        syntax=["=MAX(Zahl1;[Zahl2];…)", "=MIN(Zahl1;[Zahl2];…)"],
        ex=("B2:B5 = 41'000 | 58'400 | 38'500 | 47'300", "=MAX(B2:B5)  /  =MIN(B2:B5)", "58'400  /  38'500"),
        err="Als Text gespeicherte Zahlen (linksbündig, grünes Dreieck) werden stillschweigend ignoriert."),
    "WENN": dict(
        syntax=["=WENN(Prüfung;Dann_Wert;Sonst_Wert)"],
        ex=("A2 = 50'000 (Budget), B2 = 47'200 (Ist)", '=WENN(B2<=A2;"OK";"Überzogen")', "OK"),
        err="Text ohne Anführungszeichen (OK statt \"OK\") ergibt #NAME?."),
    "ZÄHLENWENN": dict(
        syntax=["=ZÄHLENWENN(Bereich;Suchkriterien)"],
        ex=("B2:B8 = Status, viermal «offen»", '=ZÄHLENWENN(B2:B8;"offen")', "4"),
        err="Vergleiche gehören in Anführungszeichen: \">1000\", nicht >1000."),
    "SUMMEWENN": dict(
        syntax=["=SUMMEWENN(Bereich;Suchkriterien;[Summe_Bereich])"],
        ex=("A2:A9 = Region, B2:B9 = Umsatz; Ost: 1'200 + 1'500 + 800", '=SUMMEWENN(A2:A9;"Ost";B2:B9)', "3'500"),
        err="Der Summenbereich steht bei SUMMEWENN zuletzt, bei SUMMEWENNS zuerst."),
    "SVERWEIS": dict(
        syntax=["=SVERWEIS(Suchkriterium;Matrix;Spaltenindex;[Bereich_Verweis])"],
        ex=("Preisliste A2:B6, D2 = «A-300»", "=SVERWEIS(D2;A2:B6;2;FALSCH)", "21.00"),
        extra="Staffel: WAHR statt FALSCH, erste Spalte aufsteigend sortiert (Umsatz 72'000 → Satz 0.04).",
        err="Ohne FALSCH sucht Excel ungefähr und liefert bei unsortierten Listen falsche Treffer ohne Fehlermeldung."),
    "RUNDEN": dict(
        syntax=["=RUNDEN(Zahl;Anzahl_Stellen)"],
        ex=("A2 = 1'234.5678", "=RUNDEN(A2;2)", "1'234.57"),
        err="Das Zahlenformat rundet nur die Anzeige; weitergerechnet wird mit dem ungerundeten Wert."),
    "Absoluter Bezug": dict(
        syntax=["$F$1 Spalte und Zeile fix · F$1 Zeile fix", "$F1 Spalte fix · F4 schaltet um (Mac: cmd + T)"],
        ex=("B2 = 2'000, F1 = 0.081 (MwSt-Satz)", "=B2*$F$1", "162.00"),
        err="Ohne $ wird aus F1 beim Kopieren F2, F3 … und die Formel rechnet mit leeren Zellen (Ergebnis 0)."),
    "WENNFEHLER": dict(
        syntax=["=WENNFEHLER(Wert;Wert_falls_Fehler)"],
        ex=("A2 = 1'500, B2 = 0", '=WENNFEHLER(A2/B2;"n/a")', "n/a"),
        err="WENNFEHLER verdeckt jeden Fehler, auch einen falschen Bezug: Formel zuerst ohne WENNFEHLER testen."),
    "TEXTKETTE": dict(
        syntax=["=TEXTKETTE(Text1;[Text2];…)", "oder mit &: =A2&\" \"&B2"],
        ex=("A2 = Anna, B2 = Keller", '=TEXTKETTE(A2;" ";B2)', "Anna Keller"),
        err="Leerzeichen vergessen: =A2&B2 ergibt «AnnaKeller»."),
    "SUMMENPRODUKT": dict(
        syntax=["=SUMMENPRODUKT(Array1;[Array2];…)"],
        ex=("A2:A3 = 10 | 4 (Menge), B2:B3 = 2.50 | 12.00 (Preis)", "=SUMMENPRODUKT(A2:A3;B2:B3)", "73.00"),
        err="Bereiche unterschiedlicher Grösse (A2:A3 und B2:B4) ergeben #WERT!."),
    "WENN verschachtelt": dict(
        syntax=["=WENN(Prüfung1;Wert1;WENN(Prüfung2;Wert2;Sonst_Wert))"],
        ex=("A2 = 0.67 (Schadenquote)", '=WENN(A2>0.8;"hoch";WENN(A2>0.5;"mittel";"tief"))', "mittel"),
        err="Falsche Reihenfolge (zuerst >0.5) liefert nie «hoch»: immer von der strengsten Schwelle her prüfen."),
    # ---- Accounting & Controlling
    "Budget-Ist-Abweichung": dict(
        syntax=["Abweichung CHF: =Ist-Budget", "Abweichung %: =(Ist-Budget)/Budget"],
        ex=("B2 = 12'000 (Budget), C2 = 13'450 (Ist)", "=C2-B2  /  =(C2-B2)/B2", "1'450.00  /  0.1208 = 12.1 %"),
        err="Zusätzlich mal 100 rechnen und Prozentformat setzen ergibt 1'208 %."),
    "Anteil am Total": dict(
        syntax=["=Wert/$Total$  (Total absolut fixiert)"],
        ex=("B2 = 4'250'000, B6 = 10'000'000 (Total)", "=B2/$B$6", "0.425 = 42.5 %"),
        err="Ohne $ rutscht das Total beim Kopieren nach unten mit und die Formel liefert #DIV/0!."),
    "MwSt netto/brutto": dict(
        syntax=["Brutto: =Netto*(1+Satz)", "Netto: =Brutto/(1+Satz) · MwSt: =Brutto-Brutto/(1+Satz)"],
        ex=("B2 = 1'081.00 (brutto), F1 = 0.081", "=B2/(1+$F$1)", "1'000.00"),
        err="Brutto*(1-Satz) ergibt nicht den Nettobetrag (hier 993.44 statt 1'000.00)."),
    "Rundung 5 Rappen": dict(
        syntax=["=RUNDEN(Zahl/0.05;0)*0.05", "oder =VRUNDEN(Zahl;Vielfaches)"],
        ex=("B2 = 47.33", "=RUNDEN(B2/0.05;0)*0.05", "47.35"),
        err="=RUNDEN(B2;2) rundet nur auf Rappen, nicht auf 5 Rappen."),
    "SUMMEWENNS": dict(
        syntax=["=SUMMEWENNS(Summe_Bereich;Kriterien_Bereich1;Kriterien1;", "  [Kriterien_Bereich2;Kriterien2];…)"],
        ex=("A = Kostenstelle, B = Monat, C = Betrag", '=SUMMEWENNS(C2:C9;A2:A9;"Marketing";B2:B9;"Feb")', "4'730.00"),
        err="Der Summenbereich kommt hier zuerst, anders als bei SUMMEWENN."),
    "Duplikate finden": dict(
        syntax=['=WENN(ZÄHLENWENN($Bereich$;Zelle)>1;"Duplikat";"")'],
        ex=("A2:A7 = Belegnummern, B-1041 kommt zweimal vor", '=WENN(ZÄHLENWENN($A$2:$A$7;A2)>1;"Duplikat";"")', "Duplikat"),
        err="Ohne $ verschiebt sich der Prüfbereich beim Kopieren und Duplikate weiter oben fallen heraus."),
    "Plausibilitätscheck": dict(
        syntax=['=WENN(RUNDEN(SUMME(Soll);2)=RUNDEN(SUMME(Haben);2);"OK";"Differenz")'],
        ex=("Soll B2:B6 und Haben C2:C6 je 22'350.75", '=WENN(RUNDEN(SUMME(B2:B6);2)=RUNDEN(SUMME(C2:C6);2);"OK";"Differenz")', "OK"),
        err="Ohne RUNDEN melden Gleitkomma-Reste (0.0000000001) eine Differenz, obwohl die Beträge stimmen."),
    "Kontenabstimmung": dict(
        syntax=['=WENNFEHLER(SVERWEIS(Referenz;$Liste$;2;FALSCH);"fehlt")'],
        ex=("A2 = ZA-7781, Hauptbuch E2:F7 ohne ZA-7781", '=WENNFEHLER(SVERWEIS(A2;$E$2:$F$7;2;FALSCH);"fehlt")', "fehlt"),
        err="Ohne FALSCH findet SVERWEIS den nächstkleineren Eintrag und die fehlende Buchung bleibt unentdeckt."),
    "Alterung offener Posten": dict(
        syntax=['=WENN(Stichtag-Fällig<=30;"0-30";WENN(Stichtag-Fällig<=60;"31-60";">60"))'],
        ex=("H1 = 31.10.2026 (Stichtag), B2 = 12.09.2026 → 49 Tage", '=WENN($H$1-B2<=30;"0-30";WENN($H$1-B2<=60;"31-60";">60"))', "31-60"),
        err="HEUTE() statt fixem Stichtag lässt die Klassen täglich springen; der Abschluss ist nicht reproduzierbar."),
    "MONATSENDE und EDATUM": dict(
        syntax=["=EDATUM(Ausgangsdatum;Monate)", "=MONATSENDE(Ausgangsdatum;Monate)"],
        ex=("B2 = 15.11.2026, C2 = 3 (Monate)", "=MONATSENDE(EDATUM(B2;C2);0)", "28.02.2027"),
        err="Ohne Datumsformat erscheint eine Seriennummer (46446) statt eines Datums."),
    # ---- Banking & Finance
    "Einfacher Zins": dict(
        syntax=["=Kapital*Zinssatz*Tage/360  (Bankusanz 360 Tage)"],
        ex=("A2 = 50'000, B2 = 0.0125, C2 = 90", "=A2*B2*C2/360", "156.25"),
        err="Zinssatz als 1.25 statt 1.25 % (0.0125) eingegeben ergibt das Hundertfache."),
    "Zinseszins": dict(
        syntax=["=Kapital*(1+Zins)^Jahre"],
        ex=("A2 = 25'000, B2 = 0.015, C2 = 8", "=A2*(1+B2)^C2", "28'162.31"),
        err="Ohne Klammer um (1+B2) rechnet Excel zuerst B2^C2."),
    "Cashflow-Tabelle": dict(
        syntax=["=Saldo_Vorzeile+Cashflow  (relativ, nach unten kopieren)"],
        ex=("C2 = 50'000 (Anfangssaldo), B3 = 12'000", "=C2+B3", "62'000.00"),
        err="Ein $ beim Saldo (=$C$2+B3) verhindert die Fortschreibung beim Kopieren."),
    "Schadenquote": dict(
        syntax=["=SUMME(Schäden)/SUMME(Prämien)"],
        ex=("Prämien B2:B5 = 10'000'000, Schäden C2:C5 = 7'108'500", "=SUMME(C2:C5)/SUMME(B2:B5)", "0.711 = 71.1 %"),
        err="Der Mittelwert der Einzelquoten gewichtet kleine Sparten gleich stark wie grosse."),
    "CAGR": dict(
        syntax=["=(Endwert/Startwert)^(1/Anzahl_Jahre)-1"],
        ex=("2020: 84.2, 2025: 103.6 (A = Jahr, B = Wert)", "=(B7/B2)^(1/(A7-A2))-1", "0.0423 = 4.2 %"),
        err="Anzahl Jahre ist die Differenz (5), nicht die Anzahl Werte (6)."),
    "SVERWEIS ungefähr": dict(
        syntax=["=SVERWEIS(Suchkriterium;Matrix;Spaltenindex;WAHR)"],
        ex=("Staffel A2:B6 ab 0 | 100'000 | 250'000 …, E2 = 385'000", "=E2*SVERWEIS(E2;$A$2:$B$6;2;WAHR)", "1'232.00 (Satz 0.0032)"),
        err="Ist die erste Spalte nicht aufsteigend sortiert, liefert WAHR falsche Sätze ohne Fehlermeldung."),
    "Break-even": dict(
        syntax=["=AUFRUNDEN(Fixkosten/(Preis-Variable_Kosten);0)"],
        ex=("A2 = 185'000, B2 = 49.00, C2 = 27.50", "=AUFRUNDEN(A2/(B2-C2);0)", "8'605 Stück"),
        err="Ohne Klammer um (B2-C2) teilt Excel nur durch den Preis."),
    "RMZ": dict(
        syntax=["=RMZ(Zins;Zzr;Bw;[Zw];[F])"],
        ex=("A2 = 30'000, B2 = 0.049 p.a., C2 = 5 Jahre", "=-RMZ(B2/12;C2*12;A2)", "564.76 pro Monat"),
        err="Jahreszins nicht durch 12 bzw. Jahre nicht mal 12 gerechnet: Rate massiv falsch."),
    "BW": dict(
        syntax=["=BW(Zins;Zzr;Rmz;[Zw];[F])"],
        ex=("A2 = 24'000 pro Jahr, B2 = 0.02, C2 = 15", "=BW(B2;C2;-A2)", "308'382.32"),
        err="Zahlung positiv eingeben ergibt einen negativen Barwert (Vorzeichen aus Sicht des Zahlenden)."),
    "ZW": dict(
        syntax=["=ZW(Zins;Zzr;Rmz;[Bw];[F])"],
        ex=("A2 = 7'258 pro Jahr, B2 = 0.015, C2 = 25", "=ZW(B2;C2;-A2)", "218'197.43"),
        err="Einzahlungen zu Jahresbeginn brauchen F = 1; ohne F rechnet Excel nachschüssig."),
}

# SUMMENPRODUKT im Pfad Finance: Portfolio-Beispiel statt Lager-Beispiel
CHEAT_TRACK = {
    ("finance", "SUMMENPRODUKT"): dict(
        syntax=["=SUMMENPRODUKT(Array1;[Array2];…)", "gewichtet: =SUMMENPRODUKT(Beträge;Renditen)/SUMME(Beträge)"],
        ex=("Beträge B2:B5 = 400'000 total, Renditen C2:C5", "=SUMMENPRODUKT(B2:B5;C2:C5)/SUMME(B2:B5)", "0.0312 = 3.12 %"),
        err="Der einfache MITTELWERT der Renditen (3.075 %) ignoriert die Gewichte."),
}

# ---------------------------------------------------------------- B. Formelkarten
# Tabellen: Zeilen als Listen, "!" = hervorgehobene Ergebniszelle, erste Zeile = Kopfzeile.
CARDS = [
    dict(
        slug="sverweis", article="sverweis.html", name="SVERWEIS",
        lead="Sucht einen Wert in der ersten Spalte einer Tabelle und gibt den Wert aus einer anderen Spalte derselben Zeile zurück.",
        syntax="=SVERWEIS(Suchkriterium;Matrix;Spaltenindex;Bereich_Verweis)",
        args=[
            ("Suchkriterium", "Gesuchter Wert, meist ein Zellbezug wie E2 oder ein Text in Anführungszeichen."),
            ("Matrix", "Tabellenbereich, z. B. $A$2:$C$6. Gesucht wird nur in der ersten Spalte."),
            ("Spaltenindex", "Spaltennummer innerhalb der Matrix (erste Spalte = 1), nicht ab Spalte A des Blatts."),
            ("Bereich_Verweis", "FALSCH = exakte Suche. WAHR = ungefähre Suche für Staffeln (erste Spalte aufsteigend). Fehlt das Argument, gilt WAHR."),
        ],
        examples=[
            dict(title="Preis zu einer Artikelnummer", rows=[
                ["Art.-Nr.", "Bezeichnung", "Preis CHF", "", "Gesucht", "Preis CHF"],
                ["B-110", "Ordner A4", "4.90", "", "B-130", "!89.00"],
                ["B-120", "Kopierpapier", "6.50"],
                ["B-130", "Toner schwarz", "89.00"],
                ["B-140", "Haftnotizen", "3.20"]],
                formula="=SVERWEIS(E2;$A$2:$C$5;3;FALSCH)", cell="F2", result="89.00",
                note="Preis steht in der 3. Spalte der Matrix A:C, deshalb Spaltenindex 3."),
            dict(title="Prämie zur Police, fehlende Police abfangen", rows=[
                ["Police", "Prämie CHF", "", "Police", "Prämie CHF"],
                ["P-4101", "2'340.00", "", "P-4103", "!890.00"],
                ["P-4102", "5'120.00", "", "P-4199", "!Police fehlt"],
                ["P-4103", "890.00"],
                ["P-4104", "7'460.00"]],
                formula='=WENNFEHLER(SVERWEIS(D2;$A$2:$B$5;2;FALSCH);"Police fehlt")', cell="E2:E3", result="890.00 / Police fehlt",
                note="Ohne WENNFEHLER liefert P-4199 #NV: ein Hinweis, dass die Police im Bestand fehlt."),
            dict(title="Rabatt aus einer Staffel (ungefähre Suche)", rows=[
                ["Bestellwert CHF", "Rabatt", "", "Ab CHF", "Rabatt"],
                ["7'350.00", "!5 %", "", "0", "0 %"],
                ["", "", "", "1'000", "2 %"],
                ["", "", "", "5'000", "5 %"],
                ["", "", "", "10'000", "8 %"]],
                formula="=SVERWEIS(A2;$D$2:$E$5;2;WAHR)", cell="B2", result="5 %",
                note="WAHR nimmt den grössten Wert ≤ 7'350, also die Stufe ab 5'000."),
        ],
        en=[("SVERWEIS", "VLOOKUP"), ("FALSCH / WAHR", "FALSE / TRUE"), ("WENNFEHLER", "IFERROR"), ("XVERWEIS", "XLOOKUP"), ("Semikolon ;", "Komma ,")],
        errors=[
            ("#NV", "Suchkriterium kommt in der ersten Spalte nicht vor: Tippfehler, Leerzeichen, Zahl als Text oder Matrix ohne $ verrutscht."),
            ("#NAME?", "Englischer Funktionsname (VLOOKUP), Tippfehler (SVERWEISS) oder FALSE statt FALSCH."),
            ("#WERT!", "Spaltenindex kleiner als 1, z. B. 0. Ist er grösser als die Spaltenzahl der Matrix, folgt #BEZUG!."),
        ]),
    dict(
        slug="summewenn", article="summewenn.html", name="SUMMEWENN",
        lead="Summiert nur die Werte, deren Zeile eine Bedingung erfüllt. Für mehrere Bedingungen: SUMMEWENNS.",
        syntax="=SUMMEWENN(Bereich;Suchkriterien;Summe_Bereich)",
        args=[
            ("Bereich", "Zellen, die mit dem Kriterium verglichen werden, z. B. die Spalte Kostenstelle."),
            ("Suchkriterien", "Bedingung: \"Ost\", \">10000\", \"Bahn*\" oder ein Zellbezug wie E2."),
            ("Summe_Bereich", "Zellen, die summiert werden. Fehlt das Argument, summiert Excel den Bereich selbst."),
            ("SUMMEWENNS", "=SUMMEWENNS(Summe_Bereich;Kriterien_Bereich1;Kriterien1;…): Summenbereich zuerst."),
        ],
        examples=[
            dict(title="Kosten pro Kostenstelle", rows=[
                ["Kostenstelle", "Betrag CHF", "", "Kostenstelle", "Total CHF"],
                ["KS-100", "1'250.00", "", "KS-100", "!2'205.50"],
                ["KS-200", "480.00", "", "KS-200", "!1'600.00"],
                ["KS-100", "315.50"],
                ["KS-100", "640.00"],
                ["KS-200", "1'120.00"]],
                formula="=SUMMEWENN($A$2:$A$6;D2;$B$2:$B$6)", cell="E2, nach unten kopiert", result="2'205.50",
                note="Kriterium als Zellbezug D2: eine Formel für alle Kostenstellen."),
            dict(title="Grossschäden über einer Schwelle", rows=[
                ["Schaden-Nr.", "Betrag CHF", "", "Summe ≥ 10'000"],
                ["S-201", "3'400", "", "!73'050"],
                ["S-202", "18'750"],
                ["S-203", "9'990"],
                ["S-204", "42'300"],
                ["S-205", "12'000"]],
                formula='=SUMMEWENN(B2:B6;">=10000")', cell="D2", result="73'050",
                note="Vergleich in Anführungszeichen; Summe_Bereich fehlt, also wird B summiert."),
            dict(title="Spesen mit Platzhalter", rows=[
                ["Buchungstext", "Betrag CHF", "", "Bahn total"],
                ["Bahn Zürich–Bern", "51.00", "", "!102.00"],
                ["Hotel Bern", "189.00"],
                ["Bahn Bern–Zürich", "51.00"],
                ["Taxi Bahnhof", "28.50"]],
                formula='=SUMMEWENN(A2:A5;"Bahn*";B2:B5)', cell="D2", result="102.00",
                note="* steht für beliebig viele Zeichen, ? für genau eines."),
        ],
        en=[("SUMMEWENN", "SUMIF"), ("SUMMEWENNS", "SUMIFS"), ("ZÄHLENWENN", "COUNTIF"), ("MITTELWERTWENN", "AVERAGEIF"), ("Semikolon ;", "Komma ,")],
        errors=[
            ("#NV", "Tritt in SUMMEWENN selbst kaum auf; kommt aus Zellen im Summenbereich, die schon #NV enthalten."),
            ("#NAME?", "Englischer Name (SUMIF), Tippfehler oder Text-Kriterium ohne Anführungszeichen (Ost statt \"Ost\")."),
            ("#WERT!", "Bei SUMMEWENNS sind Summen- und Kriterienbereiche unterschiedlich gross (z. B. C2:C9 und A2:A8)."),
        ]),
    dict(
        slug="wenn", article="wenn-funktion.html", name="WENN",
        lead="Prüft eine Bedingung und gibt je nach Ergebnis den einen oder den anderen Wert zurück.",
        syntax="=WENN(Prüfung;Dann_Wert;Sonst_Wert)",
        args=[
            ("Prüfung", "Vergleich, der WAHR oder FALSCH ergibt, z. B. C2<=B2. Operatoren: = <> > < >= <=."),
            ("Dann_Wert", "Ergebnis, wenn die Prüfung WAHR ist: Text in Anführungszeichen, Zahl oder Formel."),
            ("Sonst_Wert", "Ergebnis, wenn die Prüfung FALSCH ist. \"\" ergibt eine leer wirkende Zelle."),
            ("UND / ODER", "Mehrere Bedingungen: =WENN(UND(B2>=1;C2>=4);\"Bonus\";\"\")."),
        ],
        examples=[
            dict(title="Budgetkontrolle", rows=[
                ["Kostenart", "Budget CHF", "Ist CHF", "Status"],
                ["Personal", "480'000", "471'300", "!OK"],
                ["Marketing", "60'000", "64'250", "!Überzogen"],
                ["IT", "95'000", "95'000", "!OK"]],
                formula='=WENN(C2<=B2;"OK";"Überzogen")', cell="D2, nach unten kopiert", result="OK / Überzogen",
                note="<= sorgt dafür, dass eine Punktlandung (IT) als OK gilt."),
            dict(title="Auszahlung nach Selbstbehalt", rows=[
                ["Schaden-Nr.", "Schaden CHF", "Selbstbehalt CHF", "Auszahlung CHF"],
                ["S-301", "4'800", "500", "!4'300"],
                ["S-302", "350", "500", "!0"],
                ["S-303", "12'600", "1'000", "!11'600"]],
                formula="=WENN(B2>C2;B2-C2;0)", cell="D2", result="4'300",
                note="Dann_Wert darf eine Rechnung sein; negative Auszahlungen werden zu 0."),
            dict(title="Mahnstufen (verschachtelt)", rows=[
                ["Rechnung", "Tage überfällig", "Mahnstufe"],
                ["R-11", "5", "!keine"],
                ["R-12", "18", "!Mahnstufe 1"],
                ["R-13", "45", "!Mahnstufe 2"],
                ["R-14", "73", "!Mahnstufe 3"]],
                formula='=WENN(B2>60;"Mahnstufe 3";WENN(B2>30;"Mahnstufe 2";WENN(B2>10;"Mahnstufe 1";"keine")))', cell="C2", result="keine",
                note="Von der höchsten Schwelle her prüfen; jede WENN-Klammer am Schluss schliessen."),
        ],
        en=[("WENN", "IF"), ("UND / ODER", "AND / OR"), ("WAHR / FALSCH", "TRUE / FALSE"), ("WENNS", "IFS"), ("Semikolon ;", "Komma ,")],
        errors=[
            ("#NV", "Kommt aus einer verschachtelten Suche (z. B. SVERWEIS in der Prüfung), die keinen Treffer findet."),
            ("#NAME?", "Text ohne Anführungszeichen (OK statt \"OK\"), englischer Name IF oder typografische Anführungszeichen «»."),
            ("#WERT!", "Rechnung mit Text in der Prüfung oder im Dann_Wert, z. B. B2-C2, wenn B2 «n/a» enthält."),
        ]),
    dict(
        slug="zaehlenwenn", article="zaehlenwenn.html", name="ZÄHLENWENN",
        lead="Zählt die Zellen eines Bereichs, die eine Bedingung erfüllen. Für mehrere Bedingungen: ZÄHLENWENNS.",
        syntax="=ZÄHLENWENN(Bereich;Suchkriterien)",
        args=[
            ("Bereich", "Zellen, die geprüft und gezählt werden, z. B. C2:C8."),
            ("Suchkriterien", "Bedingung: \"offen\", \">=10000\", \"*AG\", \"<>\" (nicht leer) oder ein Zellbezug wie E2."),
            ("Gross/klein", "ZÄHLENWENN unterscheidet nicht zwischen «Offen» und «offen»."),
            ("ZÄHLENWENNS", "=ZÄHLENWENNS(Kriterien_Bereich1;Kriterien1;Kriterien_Bereich2;Kriterien2;…)."),
        ],
        examples=[
            dict(title="Offene Pendenzen", rows=[
                ["Pendenz", "Verantwortlich", "Status", "", "Anzahl offen"],
                ["P-01", "Gerber", "offen", "", "!3"],
                ["P-02", "Steiner", "erledigt"],
                ["P-03", "Gerber", "in Arbeit"],
                ["P-04", "Weber", "offen"],
                ["P-05", "Steiner", "offen"]],
                formula='=ZÄHLENWENN(C2:C6;"offen")', cell="E2", result="3",
                note="Text-Kriterium in Anführungszeichen; «in Arbeit» zählt nicht."),
            dict(title="Schäden ab einer Schwelle", rows=[
                ["Schaden-Nr.", "Betrag CHF", "", "Anzahl ≥ 10'000"],
                ["S-401", "3'400", "", "!3"],
                ["S-402", "18'750"],
                ["S-403", "9'990"],
                ["S-404", "42'300"],
                ["S-405", "10'000"]],
                formula='=ZÄHLENWENN(B2:B6;">=10000")', cell="D2", result="3",
                note="Mit \">10000\" statt \">=10000\" fehlt der Fall S-405 genau auf der Grenze."),
            dict(title="Doppelte Kundennummern", rows=[
                ["Kunden-Nr.", "Vorkommen", "Prüfung"],
                ["K-1001", "1", ""],
                ["K-1002", "!2", "!Duplikat"],
                ["K-1003", "1", ""],
                ["K-1002", "!2", "!Duplikat"]],
                formula='=WENN(ZÄHLENWENN($A$2:$A$5;A2)>1;"Duplikat";"")', cell="C2, nach unten kopiert", result="Duplikat",
                note="Bereich mit $ fixiert, Kriterium A2 relativ: so prüft jede Zeile ihren eigenen Wert."),
        ],
        en=[("ZÄHLENWENN", "COUNTIF"), ("ZÄHLENWENNS", "COUNTIFS"), ("ANZAHL", "COUNT"), ("ANZAHL2", "COUNTA"), ("Semikolon ;", "Komma ,")],
        errors=[
            ("#NV", "Tritt in ZÄHLENWENN selbst nicht auf; Fehlerwerte im Bereich werden einfach nicht gezählt."),
            ("#NAME?", "Englischer Name (COUNTIF), Tippfehler wie ZAEHLENWENN statt ZÄHLENWENN oder Text-Kriterium ohne Anführungszeichen."),
            ("#WERT!", "Bei ZÄHLENWENNS sind die Kriterienbereiche unterschiedlich gross, oder das Kriterium ist länger als 255 Zeichen."),
        ]),
    dict(
        slug="absolute-bezuege", article="absolute-bezuege.html", name="Absolute Bezüge ($)",
        lead="Das Dollarzeichen fixiert Spalte, Zeile oder beides, damit sich ein Bezug beim Kopieren der Formel nicht verschiebt.",
        syntax="$Spalte$Zeile  ·  zum Beispiel $F$1, F$1, $F1",
        args=[
            ("F1 (relativ)", "Wandert beim Kopieren mit: nach unten F2, F3 …, nach rechts G1, H1 …"),
            ("$F$1 (absolut)", "Bleibt immer F1. Für feste Werte wie MwSt-Satz, Total oder Wechselkurs."),
            ("F$1 / $F1 (gemischt)", "Nur die Zeile bzw. nur die Spalte ist fixiert. Für Tabellen, die nach rechts und unten kopiert werden."),
            ("Taste F4", "Schaltet beim Bearbeiten durch F1 → $F$1 → F$1 → $F1 (Mac: cmd + T)."),
        ],
        examples=[
            dict(title="MwSt mit festem Satz", rows=[
                ["Position", "Netto CHF", "MwSt CHF", "", "MwSt-Satz", "8.1 %"],
                ["Workshop", "3'200.00", "!259.20"],
                ["Reisekosten", "640.00", "!51.84"],
                ["Unterlagen", "180.00", "!14.58"]],
                formula="=B2*$F$1", cell="C2, nach unten kopiert", result="259.20",
                note="Ohne $ würde C3 mit F2 (leer) rechnen und 0.00 liefern."),
            dict(title="Anteil am Total", rows=[
                ["Region", "Umsatz CHF", "Anteil"],
                ["Zürich", "412'000", "!41.2 %"],
                ["Bern", "268'000", "!26.8 %"],
                ["Basel", "195'000", "!19.5 %"],
                ["Luzern", "125'000", "!12.5 %"],
                ["Total", "1'000'000", "100.0 %"]],
                formula="=B2/$B$6", cell="C2, nach unten kopiert", result="41.2 %",
                note="Ohne $ rutscht das Total nach B7 (leer) und die Formel liefert #DIV/0!."),
            dict(title="Prämientabelle mit gemischten Bezügen", rows=[
                ["Fahrzeugklasse", "Grundprämie CHF", "100 %", "80 %", "60 %"],
                ["Kleinwagen", "900", "!900", "!720", "!540"],
                ["Mittelklasse", "1'200", "!1'200", "!960", "!720"],
                ["SUV", "1'650", "!1'650", "!1'320", "!990"]],
                formula="=$B2*C$1", cell="C2, nach rechts und unten kopiert", result="900",
                note="$B2: Spalte B bleibt, Zeile wandert. C$1: Zeile 1 bleibt, Spalte wandert."),
        ],
        en=[("absoluter Bezug", "absolute reference"), ("relativer Bezug", "relative reference"), ("gemischter Bezug", "mixed reference"), ("#BEZUG!", "#REF!"), ("Semikolon ;", "Komma ,")],
        errors=[
            ("#NV", "Entsteht nicht durch $ selbst, aber oft in SVERWEIS-Formeln, deren Matrix ohne $ beim Kopieren verrutscht ist."),
            ("#NAME?", "Statt $F$1 ein Name verwendet (z. B. =B2*MwSt), der im Namens-Manager nicht definiert ist."),
            ("#WERT!", "Der kopierte Bezug zeigt auf eine Textzelle (z. B. die Kopfzeile) statt auf eine Zahl. #DIV/0!: Bezug zeigt auf eine leere Zelle."),
        ]),
]

# ---------------------------------------------------------------- C. Trainer-Handouts
# id -> (Ziel, Worauf achten, Ergebnisformat). Ergebnis wird aus der Musterlösung berechnet.
GOALS = {
    "summe-1": ("Bereich addieren statt Einzelzellen", "Bereich B2:B6 statt =B2+B3+…; die Totalzeile nicht mitsummieren.", "int"),
    "mittelwert-1": ("Durchschnitt mit deutschem Funktionsnamen", "MITTELWERT, nicht DURCHSCHNITT oder AVERAGE.", "chf"),
    "max-1": ("Höchstwert eines Bereichs finden", "Kopfzeile nicht in den Bereich nehmen; MIN funktioniert analog.", "int"),
    "wenn-1": ("Bedingung mit Textausgabe", "Texte in Anführungszeichen; <= statt <, eine Punktlandung gilt als OK.", "text"),
    "zaehlenwenn-1": ("Einträge mit Textkriterium zählen", "Kriterium \"offen\" in Anführungszeichen.", "int"),
    "summewenn-1": ("Werte einer Region summieren", "Reihenfolge: Bereich; Kriterium; Summe_Bereich.", "int"),
    "summewenn-2": ("Vergleichskriterium als Text", "\">3\" in Anführungszeichen; \">=3\" wäre eine andere Aufgabe.", "int"),
    "sverweis-1": ("Exakt nachschlagen", "FALSCH als 4. Argument; Spaltenindex zählt ab der ersten Spalte der Matrix.", "chf"),
    "runden-1": ("Kaufmännisch runden", "Zahlenformat ändert nur die Anzeige, RUNDEN den Wert.", "chf"),
    "absolut-1": ("Fixer Bezug für kopierbare Formel", "$F$1 (mindestens F$1); F4 schaltet um.", "chf"),
    "wennfehler-1": ("Fehlerwert abfangen", "Ersatztext in Anführungszeichen; WENNFEHLER verdeckt jeden Fehler.", "text"),
    "sverweis-2": ("Staffel mit ungefährer Suche", "WAHR und aufsteigend sortierte erste Spalte.", "pct"),
    "textkette-1": ("Texte verbinden", "Leerzeichen als \" \" dazwischen; & oder TEXTKETTE.", "text"),
    "summenprodukt-1": ("Menge × Preis in einer Formel", "Bereiche gleich gross; keine Hilfsspalte nötig.", "chf"),
    "wenn-verschachtelt-1": ("Mehrstufige Entscheidung", "Von der höchsten Schwelle her prüfen; Klammern zählen.", "text"),
    "acc-abweichung-1": ("Abweichung Ist minus Budget", "Vorzeichen-Konvention vorab klären: positiv = Budget überschritten.", "chf"),
    "acc-abweichung-2": ("Relative Abweichung", "Nicht mal 100 rechnen; Prozentformat erst danach.", "pct"),
    "acc-anteil-1": ("Anteil mit fixiertem Total", "$B$6 (mindestens B$6), sonst #DIV/0! beim Kopieren.", "pct"),
    "acc-mwst-1": ("Netto aus Brutto herausrechnen", "Durch (1+Satz) teilen; Brutto×(1−Satz) ist falsch.", "chf"),
    "acc-rundung-1": ("Auf 5 Rappen runden", "Durch 0.05, auf 0 Stellen runden, mal 0.05; VRUNDEN als Alternative.", "chf"),
    "acc-summewenns-1": ("Summe mit zwei Bedingungen", "Summenbereich zuerst, anders als bei SUMMEWENN.", "chf"),
    "acc-duplikate-1": ("Doppelte Belege markieren", "Bereich mit $ fixieren, Kriterium A2 relativ lassen.", "text"),
    "acc-sollhaben-1": ("Abschlusskontrolle Soll = Haben", "Ohne RUNDEN können Gleitkomma-Reste eine Differenz melden.", "text"),
    "acc-abstimmung-1": ("Fehlende Buchung finden", "FALSCH zwingend; WENNFEHLER erst nach dem Test ergänzen.", "text"),
    "acc-alterung-1": ("Offene Posten in Altersklassen", "Fixer Stichtag statt HEUTE(); Grenzen mit <=.", "text"),
    "acc-abgrenzung-1": ("Ablauf auf Monatsende bestimmen", "Zelle als Datum formatieren; zweites Argument von MONATSENDE ist 0.", "date"),
    "fin-zins-1": ("Marchzins nach Bankusanz (360 Tage)", "Zinssatz als 0.0125 bzw. 1.25 %, nicht 1.25.", "chf"),
    "fin-zinseszins-1": ("Endkapital mit Zinseszins", "Klammer um (1+B2) vor dem ^.", "chf"),
    "fin-cashflow-1": ("Laufender Saldo", "Relative Bezüge, damit die Formel nach unten kopiert werden kann.", "chf"),
    "fin-schadenquote-1": ("Gesamtquote richtig gewichten", "Total durch Total, nicht Mittelwert der Einzelquoten.", "pct"),
    "fin-cagr-1": ("Durchschnittswachstum pro Jahr", "Anzahl Jahre = A7−A2 = 5; Exponent in Klammern.", "pct"),
    "fin-praemienstaffel-1": ("Satz aus Staffel mal Summe", "WAHR und aufsteigend sortierte Staffel.", "chf"),
    "fin-portfolio-1": ("Gewichtete Rendite", "Der einfache Mittelwert ignoriert die Gewichte.", "pct"),
    "fin-breakeven-1": ("Break-even-Menge auf ganze Stück", "Klammer um (B2−C2); AUFRUNDEN statt RUNDEN.", "int"),
    "fin-rmz-1": ("Leasingrate pro Monat", "Zins/12 und Jahre×12; Minus vor RMZ für eine positive Rate.", "chf"),
    "fin-bw-1": ("Barwert einer Rente", "Zahlung negativ eingeben, sonst negativer Barwert.", "chf"),
    "fin-zw-1": ("Endwert Säule 3a", "Zahlung negativ; Einzahlung Ende Jahr = nachschüssig (F leer).", "chf"),
}

# Blockeinteilung: Block 1 (15 Min.), Block 2 (15 Min.), Reserve für Schnelle
PLAN = {
    "basis": dict(
        block1=["summe-1", "mittelwert-1", "max-1", "wenn-1", "zaehlenwenn-1"],
        block2=["summewenn-1", "summewenn-2", "sverweis-1", "runden-1", "absolut-1"],
        reserve=["wennfehler-1", "sverweis-2", "textkette-1", "summenprodukt-1", "wenn-verschachtelt-1"],
        goal="Die Grundfunktionen aus Büroalltag und Excel-Tests sicher und in Schweizer Schreibweise anwenden.",
        intro="Einstiegsfrage: Wer hat schon einmal einen Preis aus einer Liste abgetippt?",
        questions=[
            "Wo werden Werte noch von Hand abgeschrieben, die SVERWEIS nachschlagen könnte? Was passiert bei der nächsten Preisänderung?",
            "Zahlenformat oder RUNDEN: Wann reicht die Anzeige, wann muss der Wert selbst gerundet sein (Rechnung, Offerte, Statistik)?",
            "Woran ist in einer fremden Tabelle erkennbar, ob eine Zahl berechnet oder eingetippt ist, und welche Regeln helfen bei der Kontrolle?",
        ]),
    "accounting": dict(
        block1=["acc-abweichung-1", "acc-abweichung-2", "acc-anteil-1", "acc-mwst-1", "acc-rundung-1"],
        block2=["acc-summewenns-1", "acc-duplikate-1", "acc-sollhaben-1", "acc-abstimmung-1"],
        reserve=["acc-alterung-1", "acc-abgrenzung-1"],
        goal="Typische Abschluss- und Controlling-Formeln sicher aufbauen und plausibilisieren.",
        intro="Einstiegsfrage: Welche Excel-Arbeit im Monatsabschluss kostet am meisten Zeit?",
        questions=[
            "Wie ist im Team das Vorzeichen von Abweichungen definiert (Ist minus Budget oder umgekehrt), und wo ist das festgehalten?",
            "Welche Abstimmungen im Monatsabschluss laufen noch von Hand und liessen sich mit SVERWEIS und WENNFEHLER automatisieren?",
            "Stichtag fix oder HEUTE(): Was bedeutet die Wahl für die Nachvollziehbarkeit gegenüber Revision und Geschäftsleitung?",
        ]),
    "finance": dict(
        block1=["fin-zins-1", "fin-zinseszins-1", "fin-cashflow-1", "fin-schadenquote-1", "fin-cagr-1"],
        block2=["fin-praemienstaffel-1", "fin-portfolio-1", "fin-breakeven-1", "fin-rmz-1"],
        reserve=["fin-bw-1", "fin-zw-1"],
        goal="Zins-, Rendite- und Finanzfunktionen korrekt aufsetzen, inklusive Vorzeichen und Perioden.",
        intro="Einstiegsfrage: Wie hoch ist die Monatsrate für ein Leasing über CHF 30'000? Schätzung notieren lassen.",
        questions=[
            "Welche Konvention gilt im eigenen Haus für Zinstage (360 oder 365) und Vorzeichen, und wo ist sie dokumentiert?",
            "Warum sind Schadenquote oder Portfoliorendite als einfacher Mittelwert irreführend? Beispiele aus dem Reporting sammeln.",
            "Eine Leasingrate oder eine 3a-Projektion wird einem Kunden gezeigt: Welche Annahmen müssen sichtbar sein, und wie wird das Modell gegen Tippfehler abgesichert?",
        ]),
}
