# Excel-Drills – Werbevideo (20 s, ohne Ton)

Animiertes Kurzvideo für Reels, TikTok, Shorts und LinkedIn. Die Untertitel sind Teil der Animation, das Video funktioniert also auch stumm.

| Datei | Inhalt |
|---|---|
| `excel-drills-9x16.mp4` | 1080×1920, 30 fps, H.264, ohne Tonspur – Reels, TikTok, Shorts, Stories |
| `excel-drills-1x1.mp4` | 1080×1080, 30 fps, H.264, ohne Tonspur – LinkedIn, Instagram-Feed, Facebook |
| `excel-drills-*-poster.png` | Posterframe (Zustand bei 14.5 s: «Richtig! +10 XP» mit Medaille) |
| `excel-drills-*-preview.gif` | Vorschau, 540 px breit, 10 fps (für E-Mail, Slack, README) |
| `drill.html` | Die Animation selbst (Quelle für alles) |
| `render-frames.sh` | Rendert die Einzelbilder mit headless Chrome |
| `encode.sh` | Baut aus den Einzelbildern MP4, GIF und Poster |
| `encode-mac.swift` | Ersatz-Encoder ohne ffmpeg (nur macOS-Bordmittel), wird von `encode.sh` automatisch genutzt |
| `frames/<format>/f0000.png …` | Bildsequenz (600 Bilder je Format), kann nach dem Encoding gelöscht werden |

## Storyboard

| Zeit | Szene | Untertitel |
|---|---|---|
| 0–2 s | Wortmarke «Excel-Drills», Claim «Excel lernen durch Üben, nicht durch Zuschauen» | – |
| 2–8 s | Tabelle Filiale / Umsatz CHF erscheint, Aufgabe «Berechne in B6 die Summe», Mauszeiger klickt B6, `=SUM(B2,B5)` wird getippt | Echte Aufgaben – direkt im Browser |
| 8–11 s | B6 zeigt `#NAME?`, rotes Feedback: «Auf Deutsch heisst die Funktion SUMME. Argumente trennst du mit ; statt ,» | Fehler? Du erfährst sofort, warum. |
| 11–15 s | Korrektur zu `=SUMME(B2:B5)`, B6 = 34'600 wird grün, «Richtig! +10 XP», Bronze-Medaille, Streak 0 → 1 | Korrigieren, verstehen, weiter. |
| 15–18 s | Level-Balken füllt sich, «Level 2 · Sachbearbeiter» | XP sammeln, Level aufsteigen. |
| 18–20 s | Abschluss: «42 Übungen · 18 gratis · ohne Anmeldung», «excel-drills.ch» | – |

Safe-Zones im Hochformat: oben 250 px und unten 320 px sind frei von Text (dort liegen bei Reels/TikTok Profilname, Buttons und Beschreibung).

## Vorschau im Browser

`drill.html` direkt im Browser öffnen (Doppelklick). Ohne Parameter läuft die Animation als Endlosschleife.

- `drill.html?w=1080&h=1080` – Quadrat-Layout
- `drill.html?t=13000&w=1080&h=1920` – Standbild genau bei 13.0 s (so rendert auch das Skript)

Tipp: Fenster gross ziehen oder in den Chrome-DevTools die Gerätegrösse auf 1080×1920 stellen.

## Texte ändern

Alle Texte stehen in `drill.html` oben im `<script>` im Objekt `TEXT`:

- `claim`, `task`, `err`, `okBig`, `okSmall`, `lvBefore`, `lvAfter`
- `captions` – Untertitel mit Start- und Endzeit in ms
- `outroFacts` und `url` – `excel-drills.ch` ist die definitive Domain
- Tabelle: `ROWS` und `RESULT` direkt darunter (Summe muss stimmen)

Timing der Formel: Konstanten `T_TYPE1`, `STEP1`, `T_EDIT2`, `T_TYPE2`, `STEP2`. Nach Textänderungen die Vorschau anschauen (lange Texte können umbrechen) und dann neu rendern.

## Neu rendern

```bash
cd ~/Documents/excel-drills/social-kit/video
bash render-frames.sh            # beide Formate, 30 fps (je 600 Bilder, ca. 1 s pro Bild)
bash render-frames.sh 1x1        # nur ein Format
FPS=15 bash render-frames.sh     # halbe Bildrate, doppelt so schnell (encode.sh erkennt das und dupliziert die Bilder auf 30 fps)
bash encode.sh                   # MP4 + GIF + Poster für beide Formate
```

`render-frames.sh` startet Chrome pro Bild einmal, nacheinander (keine parallelen Instanzen). Auf einem ausgelasteten Mac dauert ein Format etwa 10 Minuten.

`encode.sh` nimmt ffmpeg, falls installiert (`brew install ffmpeg`), sonst den eingebauten Swift-Encoder (AVFoundation). Beide liefern H.264 4:2:0 mit «faststart». Mit ffmpeg wird das GIF meist kleiner und sauberer (eigene Farbpalette).

Prüfen mit ffmpeg: `ffprobe -v error -show_entries stream=width,height,r_frame_rate,pix_fmt:format=duration excel-drills-9x16.mp4`

## Posten – Empfehlungen

**Das Video hat keinen Ton.** Reels und TikTok spielen Videos ohne Ton schlechter aus. Musik direkt in der App hinzufügen (lizenzfrei über die App-Bibliothek, keine eigene Musik einbetten):

- **Instagram Reels:** Video hochladen → «Audio» (Notensymbol) → Titel wählen → Ausschnitt auf 20 s ziehen → Lautstärke anpassen. Für Business-Konten nur die «Royalty-free»/kommerziell freigegebene Musik verwenden.
- **TikTok:** Video hochladen → «Sounds hinzufügen» → bei Business-Konten «Commercial Music Library» → Ausschnitt wählen.
- **YouTube Shorts:** beim Hochladen in der App «Sound hinzufügen».
- **LinkedIn:** ohne Musik posten – LinkedIn spielt Videos standardmässig stumm ab, die eingebrannten Untertitel reichen.

| Plattform | Datei | Hinweise |
|---|---|---|
| Instagram Reels | `9x16` | 20 s ist ideal (Loop wird oft zweimal geschaut). Titelbild: Poster hochladen oder Frame bei 14 s wählen. Für die Profilraster-Vorschau ist der mittlere 1:1-Bereich sichtbar – passt. |
| TikTok | `9x16` | Text der Bildunterschrift kurz halten, 3–5 Hashtags. Musik in der App ergänzen. |
| YouTube Shorts | `9x16` | Titel mit Keyword: «Excel SUMME: der häufigste Fehler». |
| Instagram/Facebook Feed | `1x1` | Alternativ 9:16 als Reel posten (mehr Reichweite). |
| LinkedIn | `1x1` | Native hochladen (kein YouTube-Link). Posterbild als Thumbnail setzen. |
| Stories | `9x16` | Link-Sticker auf die Website im unteren Drittel – nicht über den Untertitel legen. |

### Posting-Texte (Vorschläge)

**Reels / TikTok**

> Schreibst du in Excel auch =SUM(…;…)? Auf Deutsch heisst sie SUMME – und Argumente trennst du mit Semikolon. 42 Übungen, 18 davon gratis, ohne Anmeldung. Link im Profil.
> #excel #exceltipps #excelschweiz #weiterbildung #kvlehre

**LinkedIn**

> Excel lernt man nicht durch Zuschauen.
>
> Darum haben wir Excel-Drills gebaut: echte Aufgaben direkt im Browser, sofortiges Feedback – auch zu den typisch deutschsprachigen Stolpersteinen wie SUMME statt SUM oder ; statt ,.
>
> 42 Übungen, 18 gratis, ohne Anmeldung: excel-drills.ch
>
> Welche Excel-Funktion hat dich am meisten Nerven gekostet?

(Domain vor dem Posten ersetzen, siehe oben. UTM-Parameter: `../utm.md`.)

---

## Reel 2: Sprach-Switch

«Eine Übung, vier Sprachen» – 15 s, ohne Ton, Untertitel in der Animation. Zeigt, dass Excel-Drills in der ganzen Schweiz funktioniert: dieselbe Übung schaltet zwischen Deutsch (CH), Français (CH), Italiano (CH) und Deutsch (DE) um. Dabei wechseln Funktionsname, Kopfzeilen, Zahlenformat, Währung und die Übungsdatei.

| Datei | Inhalt |
|---|---|
| `excel-drills-switch-9x16.mp4` | 1080×1920, 30 fps, H.264, ohne Tonspur – Reels, TikTok, Shorts, Stories |
| `excel-drills-switch-1x1.mp4` | 1080×1080, 30 fps, H.264, ohne Tonspur – LinkedIn, Feed |
| `excel-drills-switch-*-poster.png` | Posterframe bei 7.0 s (französische Ansicht, `=SOMME(B2:B5)` mit Häkchen) |
| `excel-drills-switch-*-preview.gif` | Vorschau, 540 px breit, 10 fps |
| `switch.html` | Die Animation (Texte im Objekt `TEXT`, pro Sprache in `LANGS`, Zahlen in `VALUES`) |
| `switch-render.sh` | Rendert `frames-switch/<format>/f0000.png …` (450 Bilder je Format bei 30 fps); wartet automatisch, wenn die 1-Minuten-Last über 10 liegt (`MAXLOAD`) |
| `switch-encode.sh` | Wie `encode.sh`, aber Quelle `frames-switch/`, Präfix `excel-drills-switch`, 15 s, Poster bei 7 s |

### Storyboard

| Zeit | Szene | Untertitel |
|---|---|---|
| 0–2 s | Wortmarke, Claim «Eine Übung. Vier Sprachen.», Sprach-Pillen DE · FR · IT · DE-DE | – |
| 2–5 s | Tabelle Filiale / Umsatz CHF (Zürich 12'500, Bern 8'300, Basel 9'100, Luzern 4'700), «Berechne in B6 die Summe», `=SUMME(B2:B5)` tippt sich, Häkchen, 34'600. Schalter oben rechts auf DE | Deutsch (Schweiz) |
| 5–8 s | Schalter wischt auf FR (Puls), «Succursale / Chiffre d'affaires CHF», «Calcule la somme en B6», `SUMME` morpht zu `SOMME`, Häkchen; Zahlen bleiben 34'600 | Français (Suisse) |
| 8–11 s | IT: «Filiale / Fatturato CHF», «Calcola la somma in B6», `=SOMMA(B2:B5)`, Häkchen | Italiano (Svizzera) |
| 11–13 s | DE-DE: München, Hamburg, Köln, Frankfurt, «Umsatz EUR», 12.500 … 34.600, `=SUMME(B2:B5)`; Download-Chip `pivot-1-umsatz.xlsx` → `pivot-1-umsatz-de.xlsx`, «Auch die Übungsdateien wechseln mit.» | Deutsch (Deutschland) |
| 13–15 s | Abschluss «42 Übungen · 18 gratis · DE · FR · IT», «excel-drills.ch» | – |

Vorschau: `switch.html` im Browser öffnen (Endlosschleife), Standbild z.B. `switch.html?t=12500&w=1080&h=1920`.

### Neu rendern

```bash
cd ~/Documents/excel-drills/social-kit/video
bash switch-render.sh          # beide Formate (je 450 Bilder)
bash switch-encode.sh          # MP4 + GIF + Poster für beide Formate
```

Hinweis: In der Sandbox von Claude Code startet headless Chrome nicht (ProcessSingleton-Fehler), und der Swift-Encoder kann keine MP4 schreiben («Cannot create file»). Beide Schritte direkt im Terminal ausführen. `frames-switch/` (900 PNG) kann nach dem Encoding gelöscht werden.

### Posting-Texte (Vorschläge)

**Reels / TikTok / LinkedIn (DE)**

> Eine Übung, vier Sprachen: Excel-Drills spricht Deutsch, Französisch und Italienisch – und auf Wunsch Deutsch für Deutschland. Funktionsnamen (SUMME, SOMME, SOMMA), Zahlenformat, Währung und sogar die Übungsdateien wechseln mit. 42 Übungen, 18 davon gratis. Link im Profil.
> #excel #exceltipps #excelschweiz #weiterbildung #mehrsprachig

**FR**

> Le même exercice en allemand, français et italien : avec Excel-Drills, tu t'entraînes avec SOMME dans ta langue – 18 exercices gratuits.

**IT**

> Lo stesso esercizio in tedesco, francese e italiano: con Excel-Drills ti alleni con SOMMA nella tua lingua – 18 esercizi gratuiti.

(Domain `excel-drills.ch` ist wie bei Reel 1 final.)
