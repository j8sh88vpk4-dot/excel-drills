#!/bin/bash
# Rendert drill.html Frame für Frame mit headless Chrome (eine Instanz nach der anderen, keine parallelen Renders).
# Aufruf:  bash social-kit/video/render-frames.sh [format ...]
#   Formate: 9x16 (1080x1920), 1x1 (1080x1080). Ohne Argument: beide.
#   FPS=15 bash render-frames.sh 9x16   -> weniger Frames (Standard 30 fps)
#   START=300 bash render-frames.sh 9x16 -> ab Frame 300 weiterrendern (z.B. nach Abbruch)
#   FRAMES=1 bash render-frames.sh -> nur zum Testen: 1 Frame je Format
# Ausgabe: frames/<format>/f0000.png ... (bei 30 fps 600 Frames = 20 s)
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
FPS="${FPS:-30}"
DURATION_MS=20000
TOTAL=$(( DURATION_MS * FPS / 1000 ))
TOTAL="${FRAMES:-$TOTAL}"
START="${START:-0}"
FORMATS=("$@"); [ ${#FORMATS[@]} -eq 0 ] && FORMATS=(9x16 1x1)
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT

for fmt in "${FORMATS[@]}"; do
  case "$fmt" in
    9x16) W=1080; H=1920 ;;
    1x1)  W=1080; H=1080 ;;
    *) echo "Unbekanntes Format: $fmt (9x16 oder 1x1)"; exit 1 ;;
  esac
  OUT="frames/$fmt"; mkdir -p "$OUT"
  echo "== $fmt ${W}x${H}, $TOTAL Frames @ ${FPS} fps"
  t0=$(date +%s)
  for (( i=START; i<TOTAL; i++ )); do
    T=$(( i * 1000 / FPS ))   # ms, deterministisch pro Frame
    F=$(printf "%s/f%04d.png" "$OUT" "$i")
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --no-first-run --no-default-browser-check --user-data-dir="$PROFILE" \
      --window-size="$W,$H" --screenshot="$PWD/$F" \
      "file://$PWD/drill.html?t=$T&w=$W&h=$H" >/dev/null 2>&1
    [ -s "$F" ] || { echo "Frame $i fehlgeschlagen"; exit 1; }
    if (( i % 50 == 0 )); then echo "  $fmt Frame $i/$TOTAL ($(( $(date +%s) - t0 )) s)"; fi
  done
  echo "== $fmt fertig in $(( $(date +%s) - t0 )) s"
done
