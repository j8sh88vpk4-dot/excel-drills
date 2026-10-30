#!/bin/bash
# Rendert alle Vorlagen nach png/ (headless Chrome). Aufruf: bash social-kit/visuals/render.sh
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
shot() { # size out url
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --no-first-run --no-default-browser-check --user-data-dir="$PROFILE" \
    --window-size="$1" --screenshot="png/$2" "file://$PWD/$3" >/dev/null 2>&1
  echo "png/$2"
}
mkdir -p png
shot 1200,630  og-image.png             og-image.html
shot 1200,627  linkedin-1-launch.png     "linkedin-card.html?v=1"
shot 1200,627  linkedin-2-sverweis.png   "linkedin-card.html?v=2"
shot 1200,627  linkedin-3-semikolon.png  "linkedin-card.html?v=3"
shot 1200,627  linkedin-4-accounting.png "linkedin-card.html?v=4"
shot 1200,627  linkedin-5-finance.png    "linkedin-card.html?v=5"
shot 1080,1080 square-quiz.png           square.html
shot 1080,1920 story.png                 story.html
rm -rf "$PROFILE"
