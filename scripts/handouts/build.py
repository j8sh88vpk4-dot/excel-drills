"""Erzeugt die Handouts als HTML (Druckvorlage für scripts/handouts/render.sh):
  handouts/spickzettel-<pfad>.html   (A, je 1 Seite)
  handouts/formelkarte-<slug>.html   (B, je 1 Seite, mit QR-Code auf den Artikel via scripts/handouts/qr.py)
  handouts/trainer-<pfad>.html       (C, max. 2 Seiten)
  handouts/index.html                (Übersicht mit E-Mail-Gate, Header/Footer aus scripts/artikel/lib.py)
Aufruf: python3 scripts/handouts/build.py   danach: sh scripts/handouts/render.sh
Themen und Reihenfolge kommen aus app/exercises.json; Ergebnisse der Musterlösungen rechnet
scripts/handouts/results.mjs mit derselben Formel-Engine wie die App (setzt npm install voraus)."""
import html, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
sys.path.insert(0, os.path.join(HERE, "..", "artikel"))
sys.path.insert(0, HERE)
from lib import head, header, footer, DOMAIN  # noqa: E402
from content import CHEAT, CHEAT_TRACK, CARDS, GOALS, PLAN  # noqa: E402
from qr import svg as qr_svg  # noqa: E402  (eigener Encoder, ohne Netzwerk und Pakete)

OUT = os.path.join(ROOT, "handouts")
URL = DOMAIN.replace("https://", "")
SUB = "Schweizer Schreibweise: Semikolon, Punkt als Dezimalzeichen, Hochkomma als Tausender"
LETTERS = "ABCDEFGHIJ"
NUM_RE = re.compile(r"^-?[\d'.]+( ?%)?$")

DATA = json.load(open(os.path.join(ROOT, "app", "exercises.json"), encoding="utf-8"))
TRACKS = {t["id"]: t for t in DATA["tracks"]}
EX = {e["id"]: e for e in DATA["exercises"]}
RESULTS = json.loads(subprocess.check_output(["node", os.path.join(HERE, "results.mjs")], cwd=ROOT))

e = lambda s: html.escape(s, quote=False)


def fx(s):
    """Formel escapen; Umbrüche nur nach ; und an « / » erlauben (nie mitten in Bezügen wie 31-60)."""
    if len(s) <= 34:
        return f'<span class="nb">{e(s)}</span>'
    parts = re.split(r"(?<=;)|(?= / )", s)
    return "<wbr>".join(f'<span class="nb">{e(p)}</span>' for p in parts if p)


def track_name(tid):
    return TRACKS[tid]["name"]


def topics(tid):
    seen, out = set(), []
    for x in DATA["exercises"]:
        if x["track"] == tid and x["topic"] not in seen:
            seen.add(x["topic"]); out.append(x["topic"])
    return out


def page(title, body, sheets_cls=""):
    return f'''<!doctype html>
<html lang="de-CH">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>{e(title)} | Excel-Drills</title>
  <link rel="stylesheet" href="handout.css">
</head>
<body class="{sheets_cls}">
  <nav class="screen-bar" aria-label="Handout">
    <a href="./">Zur Übersicht: Handouts und Spickzettel</a>
    <span>Drucken: A4 hoch, Ränder «Standard», Kopf- und Fusszeilen aus</span>
  </nav>
  <main>
{body}
  </main>
</body>
</html>
'''


def hd(kicker, h1, sub=SUB):
    return f'''    <header class="hd">
      <span class="brand"><span class="mark" aria-hidden="true">X</span>Excel-Drills</span>
      <div class="hd-text">
        <p class="kicker">{kicker}</p>
        <h1>{h1}</h1>
        <p class="sub">{sub}</p>
      </div>
    </header>'''


def ft(left, right):
    return f'''    <footer class="ft">
      <span>{left}</span>
      <span>{right}</span>
    </footer>'''


def xl(rows, caption=""):
    ncols = max(len(r) for r in rows)
    out = ['<table class="xl">']
    if caption:
        out.append(f'<caption>{caption}</caption>')
    out.append('<thead><tr><th scope="col"><span class="vh">Zeile</span></th>' + ''.join(f'<th scope="col">{LETTERS[i]}</th>' for i in range(ncols)) + '</tr></thead><tbody>')
    for ri, r in enumerate(rows):
        cells = []
        for i in range(ncols):
            c = r[i] if i < len(r) else ""
            cls = []
            if c.startswith("!"):
                c = c[1:]; cls.append("hl")
            if ri > 0 and NUM_RE.match(c):
                cls.append("num")
            ca = f' class="{" ".join(cls)}"' if cls else ""
            cells.append(f'<td{ca}>{e(c)}</td>')
        hr = ' class="hr"' if ri == 0 else ""
        out.append(f'<tr{hr}><th scope="row">{ri + 1}</th>{"".join(cells)}</tr>')
    out.append('</tbody></table>')
    return "".join(out)


# ---------------------------------------------------------------- A. Spickzettel
def cheat(tid):
    items = []
    for n, topic in enumerate(topics(tid), 1):
        c = CHEAT_TRACK.get((tid, topic)) or CHEAT.get(topic)
        if not c:
            sys.exit(f"Spickzettel {tid}: Thema «{topic}» fehlt in content.CHEAT")
        syn = "\n".join(f'        <p class="syn">{fx(s)}</p>' for s in c["syntax"])
        data, formula, result = c["ex"]
        extra = f'\n        <p class="small">{e(c["extra"])}</p>' if c.get("extra") else ""
        items.append(f'''      <section class="fn">
        <h2><span class="n">{n:02d}</span>{e(topic)}</h2>
{syn}
        <p class="ex"><span class="lbl">Beispiel</span>{e(data)}: <code>{fx(formula)}</code> <span class="res">{e(result)}</span></p>{extra}
        <p class="err"><span class="lbl">Typischer Fehler</span>{e(c["err"])}</p>
      </section>''')
    name = e(track_name(tid))
    body = f'''  <article class="sheet cheat">
{hd("Spickzettel", "Pfad " + name)}
    <p class="cheat-intro"><span>{len(items)} Themen in der Reihenfolge des Lernpfads. Formel beginnt mit =, Argumente mit ; trennen, Text in "Anführungszeichen".</span><span>[ ] = optionales Argument</span></p>
    <div class="cols">
{chr(10).join(items)}
    </div>
{ft("<strong>" + URL + "</strong>", "Übung direkt im Browser: <strong>" + URL + "/app/?pfad=" + tid + "</strong>")}
  </article>'''
    return page(f"Spickzettel {track_name(tid)}", body)


# ---------------------------------------------------------------- B. Formelkarte
def card(c):
    args = "\n".join(f'          <dt>{e(a)}</dt><dd>{e(d)}</dd>' for a, d in c["args"])
    exs = []
    for i, x in enumerate(c["examples"], 1):
        exs.append(f'''      <div class="ex-row">
        <div>{xl(x["rows"])}</div>
        <div>
          <h3><span class="n">{i}</span>{e(x["title"])}</h3>
          <p><span class="lbl">Formel in {e(x["cell"])}</span></p>
          <code class="formula">{fx(x["formula"])}</code>
          <p><span class="lbl">Ergebnis</span><span class="res">{e(x["result"])}</span></p>
          <p class="note">{e(x["note"])}</p>
        </div>
      </div>''')
    en = " ".join(f'<span>{e(en)} = {e(de)}</span>' for de, en in c["en"])
    errs = "\n".join(f'          <tr><th scope="row">{e(code)}</th><td>{e(why)}</td></tr>' for code, why in c["errors"])
    url = f'{URL}/artikel/{c["article"]}'
    qr = qr_svg(f"https://{url}", f"QR-Code zum Artikel {c['name']}: https://{url}")
    body = f'''  <article class="sheet card">
{hd("Formelkarte", e(c["name"]))}
    <p class="lead">{e(c["lead"])}</p>
    <section class="box syntax-box" aria-labelledby="syn-h">
      <h2 class="sec-title" id="syn-h">Syntax</h2>
      <code class="formula">{fx(c["syntax"])}</code>
      <dl>
{args}
      </dl>
    </section>
    <section aria-labelledby="ex-h">
      <h2 class="sec-title" id="ex-h">Drei Beispiele</h2>
{chr(10).join(exs)}
    </section>
    <section aria-labelledby="err-h">
      <h2 class="sec-title" id="err-h">Fehlercodes und Ursachen</h2>
      <table class="err-table">
        <tbody>
{errs}
        </tbody>
      </table>
    </section>
    <div class="card-bottom">
      <section class="box en-de" aria-labelledby="en-h">
        <h2 class="sec-title" id="en-h">Englisch – Deutsch</h2>
        <p>{en}</p>
        <p class="small" style="margin-top:1.2mm">Formeln aus englischen Foren übersetzen: Funktionsnamen ersetzen, Komma durch Semikolon ersetzen; der Dezimalpunkt bleibt.</p>
      </section>
      <div class="qr">
        {qr}
        <p>Artikel und Gratis-Übung:<br>{URL}/<br>artikel/{c["article"]}</p>
      </div>
    </div>
{ft("<strong>" + URL + "</strong>", "Mehr Übungen direkt im Browser: <strong>" + URL + "/app/</strong>")}
  </article>'''
    return page(f'Formelkarte {c["name"]}', body)


# ---------------------------------------------------------------- C. Trainer-Handout
def fmt_num(v, dec):
    from decimal import Decimal, ROUND_HALF_UP
    d = Decimal(repr(abs(v))).quantize(Decimal(1).scaleb(-dec), rounding=ROUND_HALF_UP)
    return ("-" if v < 0 else "") + f"{d:,}".replace(",", "'")


def fmt_result(eid):
    v = RESULTS[eid]
    kind = GOALS[eid][2]
    if isinstance(v, str):
        return v
    if kind == "int":
        return fmt_num(v, 0)
    if kind == "chf":
        return fmt_num(v, 2)
    if kind == "pct":
        return f"{fmt_num(v, 4)} ({fmt_num(round(v * 100, 10), 2)} %)"
    if kind == "date":
        import datetime
        d = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(v))
        return f"{int(v)} = {d.strftime('%d.%m.%Y')}"
    return str(v)


def trainer(tid):
    p = PLAN[tid]
    order = p["block1"] + p["block2"] + p["reserve"]
    track_ids = [x["id"] for x in DATA["exercises"] if x["track"] == tid]
    if sorted(order) != sorted(track_ids):
        sys.exit(f"Trainer {tid}: Blockplan deckt nicht genau die Übungen des Pfads ab")
    nums = {eid: i for i, eid in enumerate(order, 1)}
    n1, n2 = len(p["block1"]), len(p["block2"])
    r1, r2 = f"1–{n1}", f"{n1 + 1}–{n1 + n2}"
    rr = f"{n1 + n2 + 1}–{len(order)}"
    link = f"{URL}/app/?pfad={tid}"
    name = e(track_name(tid))
    agenda = [
        ("0:00–0:05", 5, "Einstieg", f"{e(p['intro'])} Link aus der Fusszeile öffnen lassen. Schreibweise zeigen: = am Anfang, ; zwischen Argumenten, Punkt als Dezimalzeichen."),
        ("0:05–0:20", 15, "Übungsblock 1", f"Übungen {r1} einzeln oder zu zweit. Erst die Hinweise der App lesen lassen, dann helfen. Häufige Fehler notieren."),
        ("0:20–0:25", 5, "Besprechung", "Zwei Lösungen am Beamer vorrechnen, den häufigsten Fehler aus Block 1 zeigen. Diskussionsfrage 1."),
        ("0:25–0:40", 15, "Übungsblock 2", f"Übungen {r2}. Wer fertig ist, macht mit den Reserve-Übungen {rr} weiter."),
        ("0:40–0:45", 5, "Abschluss", "Diskussionsfragen 2 und 3, Spickzettel mitgeben, Reserve-Übungen als Hausaufgabe nennen."),
    ]
    agenda_rows = "\n".join(f'          <tr><td class="t">{t}</td><td class="m">{m}&#8239;Min.</td><td class="ph">{ph}</td><td>{txt}</td></tr>' for t, m, ph, txt in agenda)

    def plan_rows(ids, label):
        rows = [f'          <tr class="block"><td colspan="4">{label}</td></tr>']
        for eid in ids:
            x = EX[eid]
            access = "gratis" if x["free"] else "Premium"
            rows.append(f'          <tr><td>{nums[eid]}</td><td><strong>{e(x["title"])}</strong> <span class="id">#{eid}</span></td><td>{e(GOALS[eid][0])}</td><td class="acc">{access}</td></tr>')
        return rows
    plan = "\n".join(plan_rows(p["block1"], "Übungsblock 1 · 15 Min.") + plan_rows(p["block2"], "Übungsblock 2 · 15 Min.") + plan_rows(p["reserve"], "Reserve für Schnelle oder Hausaufgabe"))

    def sol_rows(ids, label):
        rows = [f'          <tr class="block"><td colspan="4">{label}</td></tr>']
        for eid in ids:
            x = EX[eid]
            rows.append(f'          <tr><td>{nums[eid]}</td><td><strong>{e(x["title"])}</strong><br><span class="small">Zielzelle {x["target"]}</span></td><td><code>{fx(x["solution"])}</code><br><span class="small">{e(GOALS[eid][1])}</span></td><td class="r">{e(fmt_result(eid))}</td></tr>')
        return rows
    sols = "\n".join(sol_rows(p["block1"], "Block 1") + sol_rows(p["block2"], "Block 2") + sol_rows(p["reserve"], "Reserve"))
    premium = sum(1 for eid in order if not EX[eid]["free"])
    questions = "\n".join(f'          <li>{e(q)}</li>' for q in p["questions"])
    body = f'''  <article class="sheet trainer">
{hd("Trainer-Handout · 45 Minuten", "Pfad " + name)}
    <p><strong>Lernziel:</strong> {e(p["goal"])} <strong>Zielgruppe:</strong> {e(TRACKS[tid]["audience"])}.</p>
    <section aria-labelledby="ag-h">
      <h2 class="sec-title" id="ag-h">Ablauf der Session</h2>
      <table class="plan">
        <thead><tr><th scope="col">Zeit</th><th scope="col">Dauer</th><th scope="col">Phase</th><th scope="col">Inhalt</th></tr></thead>
        <tbody>
{agenda_rows}
        </tbody>
      </table>
    </section>
    <section aria-labelledby="ex-h">
      <h2 class="sec-title" id="ex-h">Übungen in dieser Reihenfolge</h2>
      <table class="plan">
        <thead><tr><th scope="col">Nr.</th><th scope="col">Übung</th><th scope="col">Ziel</th><th scope="col">Zugang</th></tr></thead>
        <tbody>
{plan}
        </tbody>
      </table>
    </section>
    <div class="two">
      <section aria-labelledby="q-h">
        <h2 class="sec-title" id="q-h">Diskussionsfragen aus dem Berufsalltag</h2>
        <ol class="qlist">
{questions}
        </ol>
      </section>
      <section aria-labelledby="c-h">
        <h2 class="sec-title" id="c-h">Checkliste Trainer</h2>
        <ul class="check">
          <li><strong>Browser:</strong> aktueller Chrome, Edge, Firefox oder Safari mit Internet (Formel-Engine via jsDelivr); Link vorab auf einem Teilnehmergerät testen.</li>
          <li><strong>Beamer:</strong> Bildschirm duplizieren, Zoom 125–150 %, erste Übung offen (<code class="nb">{URL}/app/#{order[0]}</code>).</li>
          <li><strong>Teamlizenz-Key:</strong> Freischalt-Code bereithalten, pro Browser über <code class="nb">{URL}/app/?key=CODE&amp;pfad={tid}</code>. {premium} von {len(order)} Übungen brauchen den Key.</li>
          <li><strong>Unterlagen:</strong> Spickzettel «{name}» pro Person; Seite 2 nicht verteilen.</li>
          <li><strong>Gemeinsame Geräte:</strong> Fortschritt und Key liegen im Browser; danach Websitedaten löschen.</li>
        </ul>
      </section>
    </div>
{ft("<strong>" + URL + "</strong> · Trainer-Handout " + name + ", Seite 1 von 2", "Teilnehmende starten hier: <strong>" + link + "</strong>")}
  </article>
  <article class="sheet trainer">
{hd("Trainer-Handout · Lösungen", "Pfad " + name)}
    <section class="trainer-only" aria-labelledby="sol-h">
      <p class="badge">Nur für Trainer</p>
      <h2 class="sec-title" id="sol-h">Musterlösungen und Stolpersteine</h2>
      <p class="small" style="margin-bottom:1.5mm">Ergebnisse für den Standard-Datensatz der App. Mit «Nochmal mit anderen Zahlen» ändern sich die Werte, die Formel bleibt gleich. Die App akzeptiert auch gleichwertige Varianten (z. B. TEXTKETTE statt &amp;).</p>
      <table class="sol">
        <thead><tr><th scope="col">Nr.</th><th scope="col">Übung</th><th scope="col">Musterlösung · Worauf achten</th><th scope="col">Ergebnis</th></tr></thead>
        <tbody>
{sols}
        </tbody>
      </table>
    </section>
{ft("<strong>" + URL + "</strong> · Trainer-Handout " + name + ", Seite 2 von 2", "Nur für Trainer, nicht verteilen")}
  </article>'''
    return page(f"Trainer-Handout {track_name(tid)}", body)


# ---------------------------------------------------------------- Übersicht handouts/index.html
CHEAT_TRACKS = ["basis", "accounting", "finance"]


def index_page():
    title = "Excel Spickzettel und Formelkarten als PDF | Excel-Drills"
    desc = "Excel-Formelkarten zu SVERWEIS, SUMMEWENN, WENN, ZÄHLENWENN und Bezügen gratis als PDF, dazu Spickzettel und Trainer-Handouts pro Lernpfad."
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Handouts und Spickzettel", "description": desc, "inLanguage": "de-CH"}
    cards = "\n".join(f'''          <li>
            <h3>{e(c["name"])}</h3>
            <p>{e(c["lead"])}</p>
            <p><a href="pdf/formelkarte-{c["slug"]}.pdf" download>Formelkarte {e(c["name"])} als PDF</a> (1 Seite A4) &middot; <a href="../artikel/{c["article"]}">Artikel lesen</a></p>
          </li>''' for c in CARDS)
    cheats = "\n".join(f'            <li><a href="pdf/spickzettel-{t}.pdf" download>Spickzettel {e(track_name(t))}</a> (PDF, 1 Seite): alle Funktionen des Pfads mit Beispiel und typischem Fehler</li>' for t in CHEAT_TRACKS)
    trainers = "\n".join(f'            <li><a href="pdf/trainer-{t}.pdf" download>Trainer-Handout {e(track_name(t))}</a> (PDF, 2 Seiten): 45-Minuten-Ablauf, Übungsplan, Diskussionsfragen, Musterlösungen</li>' for t in CHEAT_TRACKS)
    return f'''{head(title, desc, "handouts/", "website", [ld])}
<body>
{header("../", "handouts")}

  <main id="inhalt" class="wrap">
    <div class="prose article">
      <nav class="breadcrumb" aria-label="Brotkrümelnavigation">
        <ol>
          <li><a href="../">Startseite</a></li>
          <li aria-current="page">Handouts</li>
        </ol>
      </nav>
      <h1>Handouts und Spickzettel</h1>
      <div class="summary">
        <p>Zum Ausdrucken neben die Tastatur: Formelkarten zu den wichtigsten Funktionen, Spickzettel pro Lernpfad und Handouts für Trainerinnen und Trainer. Alles auf A4, in Schweizer Schreibweise und druckerfreundlich ohne Farbflächen.</p>
      </div>

      <h2 id="formelkarten">Formelkarten (gratis)</h2>
      <p>Eine Funktion pro Seite: Syntax, drei Beispiele mit Tabelle, Englisch–Deutsch und die häufigsten Fehlercodes.</p>
      <ul class="article-list handout-list">
{cards}
      </ul>

      <h2 id="spickzettel">Spickzettel pro Lernpfad</h2>
      <p>Die Spickzettel fassen alle Funktionen eines Lernpfads auf einer Seite zusammen. Gib deine E-Mail-Adresse ein, dann erscheinen die Downloads sofort.</p>

      <!-- E-Mail-Gate: handouts/gate.js sendet die Angaben per fetch an die Supabase-Tabelle «leads»
           (REST, nur INSERT für die Rolle anon erlaubt, kein Lesen). URL und Publishable Key stehen nur in
           assets/leads-config.js. Kein action/method: ohne JavaScript wird nichts gesendet (siehe noscript).
           Das Feld «website» ist ein Honeypot gegen Bots: für Menschen unsichtbar, wenn ausgefüllt, sendet gate.js nichts. -->
      <form id="gate-form" class="gate-form" aria-describedby="gate-hint" novalidate>
        <div class="gate-field">
          <label for="gate-name">Name <span class="fill-note">(optional)</span></label>
          <input id="gate-name" name="name" type="text" autocomplete="name">
        </div>
        <div class="gate-field">
          <label for="gate-email">E-Mail</label>
          <input id="gate-email" name="email" type="email" autocomplete="email" required aria-describedby="gate-email-error">
          <p id="gate-email-error" class="gate-error" hidden>Bitte gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.ch.</p>
        </div>
        <div class="gate-check">
          <input id="gate-optin" name="newsletter" type="checkbox" value="ja">
          <label for="gate-optin">Ich möchte Tipps und neue Übungen per Mail</label>
        </div>
        <div class="gate-hp" aria-hidden="true">
          <label for="gate-website">Website (bitte leer lassen)</label>
          <input id="gate-website" name="website" type="text" tabindex="-1" autocomplete="off">
        </div>
        <p id="gate-hint" class="fill-note">Ohne Häkchen schicken wir dir keine Mails. Abmelden geht jederzeit. Details in der <a href="../datenschutz.html">Datenschutzerklärung</a>.</p>
        <p><button class="btn" type="submit" id="gate-submit">Downloads freischalten</button></p>
        <p id="gate-status" class="fill-note" role="status" aria-live="polite"></p>
      </form>
      <noscript><p class="notice">Für die Freischaltung braucht es JavaScript. Ohne JavaScript schreib uns eine Mail an <a href="mailto:hallo@excel-drills.ch">hallo@excel-drills.ch</a>, dann senden wir dir die PDFs.</p></noscript>

      <div id="gate-downloads" class="gate-downloads" hidden>
        <h3 id="gate-downloads-heading" tabindex="-1">Deine Downloads</h3>
        <p>Spickzettel pro Lernpfad:</p>
        <ul>
{cheats}
        </ul>
        <p class="fill-note">Die Freigabe bleibt in diesem Browser gespeichert.</p>
      </div>

      <h2 id="trainer">Trainer-Handouts (Premium)</h2>
      <p>Für Teamleiterinnen, Ausbildner und Trainer: ein fertiger Ablauf für eine 45-Minuten-Session pro Lernpfad, mit Übungsplan, Diskussionsfragen und Musterlösungen. Enthalten in Premium und in jeder Teamlizenz. Schulen und Ausbildungsbetriebe erhalten den Code gratis, siehe <a href="../premium.html">Preise</a>.</p>
      <form id="trainer-form" class="gate-form" aria-describedby="trainer-hint">
        <div class="gate-field">
          <label for="trainer-code">Premium-Code</label>
          <input id="trainer-code" name="code" type="text" autocomplete="off" spellcheck="false" placeholder="XX-XXXX-XXXX-XXXX">
        </div>
        <p id="trainer-hint" class="fill-note">Den Code findest du nach dem Kauf im Profil der App unter «Dein Zugangscode» und in der Rechnungs-Mail.</p>
        <p><button class="btn" type="submit" id="trainer-submit">Trainer-Handouts freischalten</button></p>
        <p id="trainer-status" class="fill-note" role="status" aria-live="polite"></p>
      </form>
      <div id="trainer-downloads" class="gate-downloads" hidden>
        <h3 id="trainer-downloads-heading" tabindex="-1">Trainer-Handouts</h3>
        <ul>
{trainers}
        </ul>
      </div>

      <aside class="practice-box" aria-labelledby="practice-heading">
        <h2 id="practice-heading">Lieber gleich üben?</h2>
        <p>Die Handouts sind zum Nachschlagen. Sitzen tun die Formeln erst, wenn du sie selbst tippst: Die Gratis-Übungen laufen ohne Anmeldung direkt im Browser.</p>
        <p><a class="btn" href="../app/">Gratis starten</a></p>
      </aside>
    </div>
  </main>

{footer("../")}
  <script src="../app/keys.js" defer></script>
  <script src="../assets/leads-config.js" defer></script>
  <script src="gate.js" defer></script>
</body>
</html>
'''


if __name__ == "__main__":
    os.makedirs(os.path.join(OUT, "pdf"), exist_ok=True)
    files = {}
    for t in CHEAT_TRACKS:
        files[f"spickzettel-{t}.html"] = cheat(t)
        files[f"trainer-{t}.html"] = trainer(t)
    for c in CARDS:
        files[f"formelkarte-{c['slug']}.html"] = card(c)
    files["index.html"] = index_page()
    for name, src in files.items():
        if "ß" in src:
            sys.exit(f"{name}: enthält ß")
        path = os.path.join(OUT, name)
        if os.path.exists(path) and open(path, encoding="utf-8").read() == src:
            continue  # unverändert: mtime bleibt, damit check.py die PDFs nicht als veraltet meldet
        open(path, "w", encoding="utf-8").write(src)
    print("built", len(files), "files")
