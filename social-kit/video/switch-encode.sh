#!/bin/bash
# Baut aus frames-switch/<format>/f%04d.png die fertigen Dateien für Reel 2 «Eine Übung, vier Sprachen»:
#   excel-drills-switch-9x16.mp4 / -1x1.mp4               (H.264, yuv420p, 30 fps, faststart, ohne Ton)
#   excel-drills-switch-9x16-poster.png / -1x1-poster.png (Posterframe bei 7.0 s: FR-Ansicht)
#   excel-drills-switch-9x16-preview.gif / -1x1-preview.gif (540 px breit, 10 fps)
# Gleiche Logik wie encode.sh, nur mit anderem Quellordner, Präfix, Dauer und Posterzeit.
#
# Aufruf: bash social-kit/video/switch-encode.sh [format ...]   (ohne Argument: 9x16 und 1x1)
#   Encoder: ffmpeg falls im PATH, sonst encode-mac.swift. ENCODER=swift erzwingt den Swift-Encoder.
#   Überschreibbar: SRC_ROOT (frames-switch), PREFIX (excel-drills-switch), DURATION_S (15), POSTER_MS (7000)
set -e
cd "$(dirname "$0")"
FPS=30
SRC_ROOT="${SRC_ROOT:-frames-switch}"
PREFIX="${PREFIX:-excel-drills-switch}"
DURATION_S="${DURATION_S:-15}"
POSTER_MS="${POSTER_MS:-7000}"
FORMATS=("$@"); [ ${#FORMATS[@]} -eq 0 ] && FORMATS=(9x16 1x1)

ENC="${ENCODER:-}"
if [ -z "$ENC" ]; then if command -v ffmpeg >/dev/null 2>&1; then ENC=ffmpeg; else ENC=swift; fi; fi
if [ "$ENC" = swift ]; then
  BIN="${TMPDIR:-/tmp}/encode-mac"
  if [ ! -x "$BIN" ] || [ encode-mac.swift -nt "$BIN" ]; then
    echo "Kompiliere encode-mac.swift ..."
    mkdir -p "${TMPDIR:-/tmp}/swift-mc"
    CLANG_MODULE_CACHE_PATH="${TMPDIR:-/tmp}/swift-mc" swiftc -O -module-cache-path "${TMPDIR:-/tmp}/swift-mc" \
      encode-mac.swift -o "$BIN" 2>/dev/null
  fi
fi
echo "Encoder: $ENC"

for fmt in "${FORMATS[@]}"; do
  case "$fmt" in
    9x16) BITRATE=9000000 ;;
    1x1)  BITRATE=6000000 ;;
    *) echo "Unbekanntes Format: $fmt"; exit 1 ;;
  esac
  DIR="$SRC_ROOT/$fmt"
  [ -f "$DIR/f0000.png" ] || { echo "Keine Frames in $DIR – zuerst switch-render.sh ausführen"; exit 1; }
  N=$(ls "$DIR" | grep -c '^f[0-9]*\.png$'); SRC=$(( N / DURATION_S ))   # 450 -> 30, 225 -> 15
  echo "== $fmt: $N Frames = $SRC fps Quelle -> $FPS fps Video"
  MP4="$PREFIX-$fmt.mp4"; GIF="$PREFIX-$fmt-preview.gif"; POSTER="$PREFIX-$fmt-poster.png"
  cp "$DIR/$(printf f%04d.png $(( POSTER_MS * SRC / 1000 )))" "$POSTER"

  if [ "$ENC" = ffmpeg ]; then
    ffmpeg -v error -y -framerate "$SRC" -i "$DIR/f%04d.png" -c:v libx264 -preset slow -crf 18 \
      -pix_fmt yuv420p -r "$FPS" -movflags +faststart -an "$MP4"
    ffmpeg -v error -y -i "$MP4" -vf "fps=10,scale=540:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
      -loop 0 "$GIF"
    ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,pix_fmt,width,height,r_frame_rate:format=duration -of default=nw=1 "$MP4"
  else
    "$BIN" mp4 "$DIR" "$MP4" "$FPS" "$BITRATE" "$SRC"
    "$BIN" gif "$DIR" "$GIF" "$SRC" 10 540
    "$BIN" probe "$MP4"
  fi
  SIZE=$(stat -f%z "$GIF" 2>/dev/null || stat -c%s "$GIF")
  echo "$GIF: $(( SIZE / 1024 )) KB"; [ "$SIZE" -le 8388608 ] || echo "WARNUNG: $GIF ist grösser als 8 MB"
done
ls -lh "$PREFIX"-*
