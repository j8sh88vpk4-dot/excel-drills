#!/bin/bash
# Rendert Instagram-Karussells (carousel.html, 1080×1350) und Story-Varianten (story.html?v=1..3, 1080×1920)
# nach png/instagram/. Läuft nacheinander (ein Chrome nach dem anderen), um den Mac nicht zu überlasten.
# Aufruf: bash social-kit/visuals/render-instagram.sh            alles
#         bash social-kit/visuals/render-instagram.sh 3          nur Karussell 3
#         bash social-kit/visuals/render-instagram.sh story      nur Stories
# In einer Sandbox ggf. ausserhalb ausführen (Chrome braucht Zugriff auf sein Profil-Verzeichnis).
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
OUT=png/instagram
mkdir -p "$OUT"
shot() { # size out url
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --no-first-run --no-default-browser-check --user-data-dir="$PROFILE" \
    --window-size="$1" --screenshot="$OUT/$2" "file://$PWD/$3" >/dev/null 2>&1
  echo "$OUT/$2"
}
# Slides pro Karussell (muss zu carousel.html passen)
SLIDES=(0 7 7 8 7 7 7)
ONLY="$1"
for c in 1 2 3 4 5 6; do
  [ -n "$ONLY" ] && [ "$ONLY" != "$c" ] && continue
  for ((s = 1; s <= ${SLIDES[$c]}; s++)); do
    shot 1080,1350 "c$c-s$s.png" "carousel.html?c=$c&s=$s"
  done
done
if [ -z "$ONLY" ] || [ "$ONLY" = "story" ]; then
  for v in 1 2 3; do
    shot 1080,1920 "story-$v.png" "story.html?v=$v"
  done
fi
