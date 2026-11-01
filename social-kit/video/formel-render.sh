#!/bin/bash
# Rendert Reels «Formel des Tages» (formel.html + formel-data.js) als MP4 9:16 (1080×1920, 30 fps, 13 s, ohne Ton).
# Aufruf: bash social-kit/video/formel-render.sh 1 2 3 4 5     (Nummern aus formel-data.js; ohne Argument: 1 bis 5)
#         FPS=15 bash formel-render.sh 6                      (flüssiger, dauert länger; Standard 10 fps, auf 30 fps dupliziert)
# Ablauf pro Reel: headless Chrome rendert Bild für Bild (eine Instanz nach der anderen) nach frames-formel/<nr>/,
# dann baut ffmpeg (falls installiert) oder encode-mac.swift die MP4. Poster = Bild bei 9.0 s.
# Ausgabe: reels/fdt-<nr>-9x16.mp4 und reels/fdt-<nr>-poster.png. Die Frames werden danach gelöscht (KEEP=1 behält sie).
# In der Sandbox von Claude Code startet Chrome nicht und die MP4 lässt sich nicht schreiben: im Terminal ausführen.
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
FPS="${FPS:-10}"; OUTFPS=30; DUR=13000; POSTER_MS=9000; MAXLOAD="${MAXLOAD:-12}"
LIST=("$@"); [ ${#LIST[@]} -eq 0 ] && LIST=(1 2 3 4 5)
PROFILE="$(mktemp -d)"; trap 'rm -rf "$PROFILE"' EXIT
mkdir -p reels

ENC=swift; command -v ffmpeg >/dev/null 2>&1 && ENC=ffmpeg
if [ "$ENC" = swift ]; then
  BIN="${TMPDIR:-/tmp}/encode-mac"
  if [ ! -x "$BIN" ] || [ encode-mac.swift -nt "$BIN" ]; then
    mkdir -p "${TMPDIR:-/tmp}/swift-mc"
    CLANG_MODULE_CACHE_PATH="${TMPDIR:-/tmp}/swift-mc" swiftc -O -module-cache-path "${TMPDIR:-/tmp}/swift-mc" encode-mac.swift -o "$BIN"
  fi
fi

for n in "${LIST[@]}"; do
  NN=$(printf %02d "$n"); DIR="frames-formel/$NN"; rm -rf "$DIR"; mkdir -p "$DIR"
  TOTAL=$(( DUR * FPS / 1000 )); t0=$(date +%s)
  echo "== Formel des Tages #$n: $TOTAL Frames @ $FPS fps ($ENC)"
  for (( i=0; i<TOTAL; i++ )); do
    while [ "$(sysctl -n vm.loadavg | awk '{print int($2)}')" -ge "$MAXLOAD" ]; do sleep 5; done
    T=$(( i * 1000 / FPS )); F=$(printf "%s/f%04d.png" "$DIR" "$i")
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
      --no-first-run --no-default-browser-check --user-data-dir="$PROFILE" \
      --window-size=1080,1920 --screenshot="$PWD/$F" "file://$PWD/formel.html?n=$n&t=$T" >/dev/null 2>&1
    [ -s "$F" ] || { echo "Frame $i fehlgeschlagen"; exit 1; }
  done
  MP4="reels/fdt-$NN-9x16.mp4"
  cp "$DIR/$(printf f%04d.png $(( POSTER_MS * FPS / 1000 )))" "reels/fdt-$NN-poster.png"
  if [ "$ENC" = ffmpeg ]; then
    ffmpeg -v error -y -framerate "$FPS" -i "$DIR/f%04d.png" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -r "$OUTFPS" -movflags +faststart -an "$MP4"
  else
    "$BIN" mp4 "$DIR" "$MP4" "$OUTFPS" 8000000 "$FPS"
    "$BIN" probe "$MP4"
  fi
  rm -f "$MP4".sb-*   # Zwischendatei von AVAssetWriter
  [ "${KEEP:-0}" = 1 ] || rm -rf "$DIR"
  echo "== $MP4 fertig in $(( $(date +%s) - t0 )) s"
done
rmdir frames-formel 2>/dev/null || true
