import html, json, re

DOMAIN = "https://excel-drills.ch"
DATE = "2026-10-30"
ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23107C41'/%3E%3Ctext x='16' y='23' font-family='Arial' font-weight='700' font-size='18' fill='white' text-anchor='middle'%3EX%3C/text%3E%3C/svg%3E"

ARTICLES = [
    ("sverweis.html", "SVERWEIS einfach erklärt", "Werte in einer Tabelle nachschlagen: Preise, Prämien, Rabattstaffeln. Mit FALSCH und WAHR richtig umgehen."),
    ("summewenn.html", "SUMMEWENN: Übung und Erklärung", "Nur passende Werte summieren: Kosten pro Kostenstelle, Schäden über einer Schwelle, Teiltexte mit Platzhaltern."),
    ("wenn-funktion.html", "WENN-Funktion in Excel", "Bedingungen prüfen und Entscheidungen abbilden: Budgetkontrolle, Selbstbehalt, UND/ODER und verschachtelte WENN."),
    ("zaehlenwenn.html", "ZÄHLENWENN in Excel", "Zählen, was eine Bedingung erfüllt: offene Pendenzen, Schäden über einer Schwelle, Duplikate finden."),
    ("absolute-bezuege.html", "Absolute Bezüge in Excel ($)", "Wann du das Dollarzeichen brauchst: MwSt mit festem Satz, Anteil am Total, gemischte Bezüge für Tabellen."),
    ("excel-einstellungstest-ueben.html", "Excel-Einstellungstest üben", "Was im Excel-Test bei der Bewerbung typischerweise geprüft wird: 5 Aufgaben mit Lösung, 7-Tage-Lernplan, typische Fehler."),
    ("excel-uebungen-kv.html", "Excel-Übungen für die KV-Lehre", "Rechnung mit MwSt, Umsatzlisten, Offene Posten, Rappenrundung: 6 Übungen aus dem KV-Alltag mit Lösung, gratis für Berufsschulen."),
    ("vrunden-5-rappen.html", "Excel auf 5 Rappen runden: VRUNDEN", "=VRUNDEN(Betrag;0.05) erklärt: Beispiele, Alternativen, MwSt-Rechnung und die typischen Fehler bei der Rappenrundung."),
    ("excel-ueben-online-vergleich.html", "Excel online üben: 6 Plattformen im Vergleich (Schweiz)", "LogicExcel, Coddy, Easy4Me, zebis, Wings und Excel-Drills: Was gratis ist, wo deutsche Funktionsnamen und Semikolon stimmen, was für KV, Controlling und Einstellungstest taugt."),
]

# Formelkarte pro Artikel (PDF aus scripts/handouts/build.py + render.sh)
CARDS = {"sverweis.html": ("sverweis", "SVERWEIS"), "summewenn.html": ("summewenn", "SUMMEWENN"),
         "wenn-funktion.html": ("wenn", "WENN"), "zaehlenwenn.html": ("zaehlenwenn", "ZÄHLENWENN"),
         "absolute-bezuege.html": ("absolute-bezuege", "absolute Bezüge")}

UPLOAD = {"sverweis.html": "sverweis-1", "summewenn.html": "summewenn-1", "wenn-funktion.html": "wenn-1",
          "zaehlenwenn.html": "zaehlenwenn-1", "absolute-bezuege.html": "absolut-1"}

def upload_box(slug):
    if slug not in UPLOAD:
        return ''
    return f'''      <aside class="practice-box" aria-labelledby="upload-heading">
        <h2 id="upload-heading">In echtem Excel üben</h2>
        <p>Lade die Aufgabe als Excel-Datei herunter, löse sie in deinem Excel und lade sie wieder hoch. Excel-Drills liest deine Formel aus der Datei und zeigt dir pro Zelle, was fehlt. Die Datei bleibt in deinem Browser.</p>
        <p><a class="btn btn-secondary" href="../upload/#{UPLOAD[slug]}">Excel-Datei prüfen lassen</a></p>
      </aside>'''

def card_box(slug):
    if slug not in CARDS:
        return '''      <aside class="practice-box handout-box" aria-labelledby="card-heading">
        <h2 id="card-heading">Spickzettel als PDF</h2>
        <p>Die wichtigsten Excel-Funktionen Englisch–Deutsch, Semikolon statt Komma und die häufigsten Fehlercodes auf einer A4-Seite. Gratis, zum Ausdrucken neben die Tastatur.</p>
        <p><a class="btn btn-secondary" href="../handouts/">Zu den Handouts</a></p>
      </aside>'''
    key, name = CARDS[slug]
    return f'''      <aside class="practice-box handout-box" aria-labelledby="card-heading">
        <h2 id="card-heading">Formelkarte als PDF</h2>
        <p>Alles Wichtige zu {name} auf einer A4-Seite: Syntax, drei Beispiele mit Tabelle, Englisch–Deutsch und die häufigsten Fehlercodes. Gratis, zum Ausdrucken neben die Tastatur.</p>
        <p><a class="btn btn-secondary" href="../handouts/pdf/formelkarte-{key}.pdf" download>Formelkarte {name} herunterladen (PDF)</a></p>
        <p class="fill-note">Weitere Formelkarten und Spickzettel findest du unter <a href="../handouts/">Handouts</a>.</p>
      </aside>'''

LETTERS = "ABCDEFGHIJ"
NUM_RE = re.compile(r"^-?[\d'.]+( ?%)?$")

def tbl(caption, rows, start_row=1):
    """rows: list of lists of cell strings. '!' prefix = highlighted cell. First row bold (header-row)."""
    ncols = max(len(r) for r in rows)
    out = ['<div class="table-scroll" role="region" tabindex="0" aria-label="%s (horizontal scrollbar)">' % html.escape(caption, quote=True),
           '<table class="article-table">', '<caption>%s</caption>' % caption,
           '<thead><tr><th scope="col"><span class="visually-hidden">Zeile</span></th>' + ''.join('<th scope="col">%s</th>' % LETTERS[i] for i in range(ncols)) + '</tr></thead><tbody>']
    for ri, r in enumerate(rows):
        cls = ' class="header-row"' if ri == 0 else ''
        cells = []
        for i in range(ncols):
            c = r[i] if i < len(r) else ''
            classes = []
            if c.startswith('!'):
                c = c[1:]; classes.append('hl')
            if NUM_RE.match(c) and ri > 0:
                classes.append('num')
            ca = ' class="%s"' % ' '.join(classes) if classes else ''
            cells.append('<td%s>%s</td>' % (ca, c))
        out.append('<tr%s><th scope="row">%d</th>%s</tr>' % (cls, start_row + ri, ''.join(cells)))
    out.append('</tbody></table></div>')
    return '\n'.join(out)

def compare(caption, head, rows):
    out = ['<div class="table-scroll" role="region" tabindex="0" aria-label="%s (horizontal scrollbar)">' % html.escape(caption, quote=True),
           '<table class="article-table compare">', '<caption>%s</caption>' % caption,
           '<thead><tr>' + ''.join('<th scope="col">%s</th>' % h for h in head) + '</tr></thead><tbody>']
    for r in rows:
        out.append('<tr><th scope="row">%s</th>%s</tr>' % (r[0], ''.join('<td>%s</td>' % c for c in r[1:])))
    out.append('</tbody></table></div>')
    return '\n'.join(out)

def header(prefix, current=None):
    art = ' aria-current="page"' if current == 'artikel' else ''
    pfa = ' aria-current="page"' if current == 'pfade' else ''
    hnd = ' aria-current="page"' if current == 'handouts' else ''
    return f'''  <a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
  <header class="site-header">
    <div class="wrap">
      <a class="wordmark" href="{prefix or "./"}" aria-label="Excel-Drills Startseite"><span class="mark" aria-hidden="true">X</span>Excel-Drills</a>
      <nav class="site-nav" aria-label="Hauptnavigation">
        <a href="{prefix}app/">Übungen</a>
        <a href="{prefix}pfad/"{pfa}>Pfade</a>
        <a href="{prefix}assessment/">Assessment</a>
        <a href="{prefix}upload/">Datei prüfen</a>
        <a href="{prefix}kampagne/">Kampagne</a>
        <a href="{prefix}artikel/"{art}>Artikel</a>
        <a href="{prefix}handouts/"{hnd}>Handouts</a>
        <a href="{prefix}premium.html">Preise</a>
      </nav>
    </div>
  </header>'''

def footer(prefix):
    return f'''  <footer class="site-footer">
    <div class="wrap">
      <span>&copy; 2026 Excel-Drills</span>
      <span><a href="{prefix}artikel/">Artikel</a> &middot; <a href="{prefix}handouts/">Handouts</a> &middot; <a href="https://sql-drills.onrender.com?utm_source=excel-drills&amp;utm_medium=footer" rel="noopener">SQL-Drills (Beta)</a> &middot; <a href="{prefix}impressum.html">Impressum</a> &middot; <a href="{prefix}datenschutz.html">Datenschutz</a></span>
    </div>
  </footer>'''

def head(title, desc, path, og_type, jsonld):
    ld = '\n'.join('  <script type="application/ld+json">\n%s\n  </script>' % json.dumps(j, ensure_ascii=False, indent=2) for j in jsonld)
    return f'''<!doctype html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc, quote=True)}">
  <link rel="canonical" href="{DOMAIN}/{path}">
  <meta property="og:url" content="{DOMAIN}/{path}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:locale" content="de_CH">
  <meta property="og:site_name" content="Excel-Drills">
  <meta property="og:title" content="{html.escape(title, quote=True)}">
  <meta property="og:description" content="{html.escape(desc, quote=True)}">
  <meta property="og:image" content="{DOMAIN}/assets/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="{ICON}">
  <link rel="manifest" href="../manifest.json">
  <meta name="theme-color" content="#107C41">
  <link rel="apple-touch-icon" href="../assets/icons/apple-touch-icon.png">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="Excel-Drills">
  <link rel="stylesheet" href="../assets/style.css">
  <script defer src="../assets/analytics.js"></script>
{ld}
</head>'''

def article_page(slug, title, desc, h1, summary, body, faq, practice, date_iso=None, date_text="30. Oktober 2026"):
    date_iso = date_iso or DATE
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r'<[^>]+>', '', a).replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&').replace('&nbsp;', ' ')}} for q, a in faq]}
    art_ld = {"@context": "https://schema.org", "@type": "Article", "headline": h1, "description": desc,
              "inLanguage": "de-CH", "datePublished": date_iso, "dateModified": date_iso,
              "image": DOMAIN + "/assets/og-image.png", "mainEntityOfPage": DOMAIN + "/artikel/" + slug,
              "author": {"@type": "Organization", "name": "Excel-Drills", "url": DOMAIN + "/"},
              "publisher": {"@type": "Organization", "name": "Excel-Drills", "url": DOMAIN + "/",
                            "logo": {"@type": "ImageObject", "url": DOMAIN + "/assets/icons/apple-touch-icon.png"}}}
    bc_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Startseite", "item": DOMAIN + "/"},
        {"@type": "ListItem", "position": 2, "name": "Artikel", "item": DOMAIN + "/artikel/"},
        {"@type": "ListItem", "position": 3, "name": h1, "item": DOMAIN + "/artikel/" + slug}]}
    faq_html = '\n'.join(f'''          <details>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>''' for q, a in faq)
    others = '\n'.join(f'            <li><a href="{f}">{t}</a>: {d}</li>' for f, t, d in ARTICLES if f != slug)
    return f'''{head(title, desc, "artikel/" + slug, "article", [art_ld, faq_ld, bc_ld])}
<body>
{header("../", "artikel")}

  <main id="inhalt" class="wrap">
    <article class="prose article">
      <nav class="breadcrumb" aria-label="Brotkrümelnavigation">
        <ol>
          <li><a href="../">Startseite</a></li>
          <li><a href="./">Artikel</a></li>
          <li aria-current="page">{h1}</li>
        </ol>
      </nav>
      <h1>{h1}</h1>
      <p class="article-meta">Stand: {date_text} &middot; Schweizer Schreibweise mit Semikolon</p>
      <div class="summary">
        <p>{summary}</p>
      </div>

{body}

      <aside class="practice-box" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Jetzt üben</h2>
{practice}
      </aside>

      <section class="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Häufige Fragen</h2>
{faq_html}
      </section>

{upload_box(slug)}
{card_box(slug)}

      <nav class="read-more" aria-labelledby="read-more-heading">
        <h2 id="read-more-heading">Weiterlesen</h2>
        <ul>
{others}
        </ul>
        <p><a href="./">Alle Artikel im Überblick</a></p>
      </nav>
    </article>
  </main>

{footer("../")}
</body>
</html>
'''
