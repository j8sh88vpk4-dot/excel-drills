import sys, importlib
from lib import *
OUT = "/Users/lucamoser/Documents/excel-drills/artikel/"  # Aufruf: python3 scripts/artikel/build.py
import os; os.makedirs(OUT, exist_ok=True)
for mod, fn in [("a_sverweis", "sverweis.html"), ("a_summewenn", "summewenn.html"), ("a_wenn", "wenn-funktion.html"),
                ("a_zaehlenwenn", "zaehlenwenn.html"), ("a_absolut", "absolute-bezuege.html"),
                ("a_vergleich", "excel-ueben-online-vergleich.html")]:
    m = importlib.import_module(mod)
    open(OUT + fn, "w", encoding="utf-8").write(m.PAGE)

title = "Excel-Funktionen erklärt: Artikel | Excel-Drills"
desc = "Excel-Funktionen verständlich erklärt: SVERWEIS, SUMMEWENN, WENN, ZÄHLENWENN und absolute Bezüge, mit Schweizer Beispielen und Gratis-Übungen. Plus: Excel-Übungsplattformen im Vergleich."
ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Excel-Funktionen erklärt", "description": desc, "inLanguage": "de-CH",
      "hasPart": [{"@type": "Article", "headline": t} for _, t, _ in ARTICLES]}
exercise = {"sverweis.html": "sverweis-1", "summewenn.html": "summewenn-1", "wenn-funktion.html": "wenn-1",
            "zaehlenwenn.html": "zaehlenwenn-1", "absolute-bezuege.html": "absolut-1", "excel-ueben-online-vergleich.html": "summe-1"}
items = '\n'.join(f'''          <li>
            <h2><a href="{f}">{t}</a></h2>
            <p>{d}</p>
            <p><a href="../app/#{exercise[f]}">Direkt zur Gratis-Übung</a></p>
          </li>''' for f, t, d in ARTICLES)
page = f'''{head(title, desc, "artikel/", "website", [ld])}
<body>
{header("../", "artikel")}

  <main id="inhalt" class="wrap">
    <div class="prose article">
      <nav class="breadcrumb" aria-label="Brotkrümelnavigation">
        <ol>
          <li><a href="../">Startseite</a></li>
          <li aria-current="page">Artikel</li>
        </ol>
      </nav>
      <h1>Excel-Funktionen erklärt</h1>
      <div class="summary">
        <p>Hier findest du die wichtigsten Excel-Funktionen für Büro, Finance, Controlling und Versicherung, verständlich erklärt und mit Beispielen in Schweizer Schreibweise: deutsche Funktionsnamen, Semikolon als Trennzeichen, Beträge in CHF. Zu jedem Artikel gibt es eine Gratis-Übung, die du direkt im Browser löst.</p>
      </div>
      <ul class="article-list">
{items}
      </ul>
      <aside class="practice-box" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Lieber gleich üben?</h2>
        <p>18 Übungen sind gratis, ohne Anmeldung und laufen direkt im Browser. Excel-Drills prüft deine Formel sofort und erklärt typische Fehler.</p>
        <p><a class="btn" href="../app/">Gratis starten</a></p>
      </aside>
    </div>
  </main>

{footer("../")}
</body>
</html>
'''
open(OUT + "index.html", "w", encoding="utf-8").write(page)
print("built")
