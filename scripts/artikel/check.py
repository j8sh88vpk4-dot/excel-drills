import re, json, os, html, sys
from html.parser import HTMLParser
ROOT = "/Users/lucamoser/Documents/excel-drills/"
ids = {e["id"]: e["free"] for e in json.load(open(ROOT + "app/exercises.json"))["exercises"]}
pages = ["index.html", "premium.html", "impressum.html", "datenschutz.html", "app/index.html"] + ["artikel/" + f for f in sorted(os.listdir(ROOT + "artikel"))]
if os.path.isdir(ROOT + "pfad"): pages += ["pfad/" + f for f in sorted(os.listdir(ROOT + "pfad")) if f.endswith(".html")]
if os.path.isfile(ROOT + "zertifikate/index.html"): pages += ["zertifikate/index.html"]
if os.path.isdir(ROOT + "handouts"): pages += ["handouts/" + f for f in sorted(os.listdir(ROOT + "handouts")) if f.endswith(".html")]
tracks = {t["id"] for t in json.load(open(ROOT + "app/exercises.json")).get("tracks", [])}
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.links = []; s.in_main = 0; s.skip = 0; s.text = []; s.title = ""; s.in_title = False; s.desc = None; s.ld = []; s.in_ld = False; s.ids=set()
    def handle_starttag(s, t, a):
        a = dict(a)
        if 'id' in a: s.ids.add(a['id'])
        if t in ("a", "link") and a.get("href"): s.links.append(a["href"])
        if t == "script" and a.get("src"): s.links.append(a["src"])
        if t == "main": s.in_main += 1
        if t == "nav" and s.in_main: s.skip += 1
        if t == "title": s.in_title = True
        if t == "meta" and a.get("name") == "description": s.desc = a["content"]
        if t == "script" and a.get("type") == "application/ld+json": s.in_ld = True; s.ld.append("")
    def handle_endtag(s, t):
        if t == "main": s.in_main -= 1
        if t == "nav" and s.in_main and s.skip: s.skip -= 1
        if t == "title": s.in_title = False
        if t == "script": s.in_ld = False
    def handle_data(s, d):
        if s.in_title: s.title += d
        if s.in_ld: s.ld[-1] += d
        if s.in_main and not s.skip: s.text.append(d)
errors = []
for pg in pages:
    src = open(ROOT + pg, encoding="utf-8").read()
    p = P(); p.feed(src)
    for h in p.links:
        if re.match(r"^(https?:|mailto:|data:|#)", h):  # bare "#" = Stripe-Platzhalter in premium.html
            if h.startswith("#") and h != "#" and h[1:] not in p.ids: errors.append(f"{pg}: anchor {h} missing")
            continue
        path, _, frag = h.partition("#")
        path, _, query = path.partition("?")
        m = re.search(r"(?:^|&)pfad=([^&]+)", query)
        if m and m.group(1) not in tracks: errors.append(f"{pg}: pfad {m.group(1)} not in exercises.json tracks")
        target = os.path.normpath(os.path.join(ROOT, os.path.dirname(pg), path))
        if os.path.isdir(target): target = os.path.join(target, "index.html")
        if not os.path.isfile(target): errors.append(f"{pg}: broken link {h}")
        if frag and target.endswith("app/index.html"):
            if frag not in ids: errors.append(f"{pg}: exercise id {frag} not in exercises.json")
    for j in p.ld:
        try: json.loads(j)
        except Exception as e: errors.append(f"{pg}: JSON-LD invalid {e}")
    if "ß" in src and pg.startswith(("artikel", "handouts")): errors.append(f"{pg}: contains ß")
    if pg.startswith("handouts/") and pg != "handouts/index.html":
        pdf = ROOT + "handouts/pdf/" + os.path.basename(pg)[:-5] + ".pdf"
        if not os.path.isfile(pdf): errors.append(f"{pg}: PDF fehlt (sh scripts/handouts/render.sh)")
        elif os.path.getmtime(pdf) < os.path.getmtime(ROOT + pg): errors.append(f"{pg}: PDF älter als HTML, neu rendern")
    if pg.startswith(("artikel", "pfad")):
        if len(p.title.strip()) > 60 and pg.startswith("pfad"): errors.append(f"{pg}: title > 60")
        if len(p.desc) > 155 and pg.startswith("pfad"): errors.append(f"{pg}: description > 155")
        if "ß" in src: errors.append(f"{pg}: contains ß")
        words = len(re.findall(r"\S+", " ".join(p.text)))
        ex = sorted(set(re.findall(r'app/#([\w-]+)', src)))
        print(f"{pg:32} words(main, ohne Breadcrumb/Weiterlesen)={words:5}  title={len(p.title.strip()):3}  desc={len(p.desc):3}  ex={ex}")
print("links checked:", len(pages), "pages")
print("ERRORS:" if errors else "OK: keine Fehler", *errors, sep="\n")
