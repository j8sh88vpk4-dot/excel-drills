#!/bin/bash
# Rendert die PWA-Icons nach assets/icons/ (headless Chrome). Aufruf: sh scripts/pwa/render-icons.sh
set -e
cd "$(dirname "$0")"
ROOT="$(cd ../.. && pwd)"
OUT="$ROOT/assets/icons"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d "${TMPDIR:-/tmp}/ed-icons.XXXXXX")"
mkdir -p "$OUT"
# Immer mit 512 px rendern (headless Chrome hat eine Mindest-Fenstergrösse) und danach mit sips verkleinern.
shot() { # size variant out
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --no-first-run --no-default-browser-check --user-data-dir="$PROFILE" --default-background-color=00000000 \
    --window-size=512,512 --screenshot="$OUT/$3" "file://$PWD/app-icon.html?v=$2" >/dev/null 2>&1
  [ "$1" = 512 ] || sips -z "$1" "$1" "$OUT/$3" >/dev/null
  echo "assets/icons/$3"
}
shot 192 any      icon-192.png
shot 512 any      icon-512.png
shot 192 maskable icon-maskable-192.png
shot 512 maskable icon-maskable-512.png
shot 180 apple    apple-touch-icon.png
rm -rf "$PROFILE"
