#!/bin/sh
# Rendert alle Handouts (handouts/*.html ausser index.html) nacheinander mit Chrome headless
# nach handouts/pdf/<name>.pdf und gibt pro PDF die Seitenzahl aus.
# Aufruf: sh scripts/handouts/render.sh [datei.html ...]   (ohne Argumente: alle)
# Bewusst sequenziell, damit der Mac nicht mehrere Chrome-Instanzen gleichzeitig startet.
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="$ROOT/handouts/pdf"
PROFILE="${TMPDIR:-/tmp}/excel-drills-chrome-profile"
mkdir -p "$OUT" "$PROFILE"

if [ "$#" -gt 0 ]; then FILES="$*"; else FILES="$(ls "$ROOT"/handouts/*.html | grep -v '/index.html$')"; fi

for f in $FILES; do
  case "$f" in /*) ;; *) f="$ROOT/handouts/$(basename "$f")" ;; esac
  name="$(basename "$f" .html)"
  "$CHROME" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
    --user-data-dir="$PROFILE" --print-to-pdf="$OUT/$name.pdf" --no-pdf-header-footer \
    "file://$f" >/dev/null 2>&1
  pages="$(python3 -c 'import re,sys; d=open(sys.argv[1],"rb").read(); print(len(re.findall(rb"/Type\s*/Page(?![s\w])", d)))' "$OUT/$name.pdf")"
  echo "$name.pdf: $pages Seite(n)"
done
