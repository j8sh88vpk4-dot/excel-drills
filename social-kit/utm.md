# UTM-Schema und Links

**Basis:** `https://excel-drills.ch` (Domain final).
**Kampagne:** alle Launch-Posts `utm_campaign=launch-2026-11`.
**Schreibweise:** nur Kleinbuchstaben, Bindestriche, keine Umlaute, keine Leerzeichen.
**Messung:** Plausible ist seit 30.10.2026 eingebaut (`assets/analytics.js`, siehe `docs/ANALYTICS.md`) und erfasst UTM-Parameter automatisch, sobald die Site mit der echten Domain in Plausible angelegt ist. Vorher sind die Links trotzdem harmlos.

## Schema pro Kanal

| Kanal | utm_source | utm_medium | utm_content (Beispiel) |
|---|---|---|---|
| LinkedIn Post | `linkedin` | `social` | `li-01` … `li-19` |
| LinkedIn Kommentar (Link im 1. Kommentar) | `linkedin` | `social` | `li-09-kommentar` |
| Reddit | `reddit` | `social` | `de-edv`, `finanzen`, `schweiz`, `excel`, `buchhaltung` |
| X | `x` | `social` | `x-t1`, `x-05` |
| Instagram (Bio) | `instagram` | `bio` | – (Kampagne `launch`) |
| Instagram (Story-Link-Sticker) | `instagram` | `social` | `ig-story-berufsbildner`, `ig-story-upload`, `ig-story-zertifikate`, `ig-story-interview`, `ig-story-sql` (Bio-Link bei Karussells: `utm_medium=bio`, `utm_content=ig-k7` … `ig-k14`, bei Reels `fdt-<nr>`) |
| Threads | `threads` | `social` | `fdt-<nr>` (nur falls ein Link gesetzt wird) |
| TikTok (Profil) | `tiktok` | `social` | `bio` |
| E-Mail | `email` | `email` | `em-01` … `em-05` |
| Foren/Gruppen | `<forumname>` | `referral` | `<thread-kurzname>` |

**Zielseiten:**
- Gratis-Einstieg: `https://excel-drills.ch/app/` (öffnet erste Übung)
- Bestimmte Übung: `https://excel-drills.ch/app/?…#<übungs-id>` (Hash = Übungs-ID, z. B. `#sverweis-1`). Der Hash steht **nach** den UTM-Parametern.
- Lernpfad: `https://excel-drills.ch/pfad/basis.html`, `/pfad/accounting.html`, `/pfad/finance.html`
- Artikel: `https://excel-drills.ch/artikel/sverweis.html` usw.
- Preise: `https://excel-drills.ch/premium.html`
- Assessments (B2B-Pilot): `https://excel-drills.ch/assessment/` (Rolle optional `?rolle=consulting`, dann die UTM-Parameter mit `&` anhängen)
- Datei hochladen und prüfen: `https://excel-drills.ch/upload/`
- Hinweis: `/assessment/` und `/upload/` müssen live sein, bevor die B2B-Links verwendet werden
- Zertifikate: `https://excel-drills.ch/zertifikate/`
- Kampagnen: `https://excel-drills.ch/kampagne/` (Übersicht und «Dein erster Monat als Controllerin»), einzelne Kampagne `?kampagne=<id>` mit den IDs `controlling-monat-1`, `siz-au4`, `siz-pu41`, `mos-excel-associate`, `mos-excel-expert`; englische Funktionsnamen mit `&lang=en`. UTM-Parameter mit `&` anhängen.
- KI-Interview: kein eigener Pfad; es startet nach dem Assessment (Ergebnisseite), darum Links auf `/assessment/` bzw. `/assessment/?rolle=consulting`
- SQL-Drills (Beta, eigene Site): `https://sql-drills.onrender.com/` (eigene Analytics; `utm_source` trotzdem setzen, damit es dort sichtbar ist)

## Fertige Links

### LinkedIn
| Platzhalter | Link |
|---|---|
| `{URL_LI_01}` | `https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-01` |
| `{URL_LI_02}` | `https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-02#sverweis-1` |
| `{URL_LI_03}` | `https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-03#summewenn-1` |
| `{URL_LI_04}` | `https://excel-drills.ch/pfad/basis.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-04` |
| `{URL_LI_05}` | `https://excel-drills.ch/pfad/accounting.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-05` |
| `{URL_LI_06}` | `https://excel-drills.ch/pfad/finance.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-06` |
| `{URL_LI_07}` | `https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-07` |
| `{URL_LI_08}` | `https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-08` |
| `{URL_LI_09}` | `https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-09-kommentar#runden-1` |
| `{URL_LI_10}` | `https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-10-kommentar` |
| `{URL_LI_11}` | `https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-11` |
| `{URL_LI_12}` | `https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-12` |
| `{URL_LI_13}` | `https://excel-drills.ch/assessment/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-13` |
| `{URL_LI_14}` | `https://excel-drills.ch/premium.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-14` |
| `{URL_LI_15}` | `https://excel-drills.ch/premium.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-15` |
| `{URL_LI_16}` | `https://excel-drills.ch/upload/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-16` |
| `{URL_LI_17}` | `https://excel-drills.ch/zertifikate/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-17` |
| `{URL_LI_18}` | `https://excel-drills.ch/upload/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-18` |
| `{URL_LI_19}` | `https://excel-drills.ch/assessment/?rolle=consulting&utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-19` |

### Reddit
| Platzhalter | Link |
|---|---|
| `{URL_RD_01}` | `https://excel-drills.ch/app/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=de-edv` |
| `{URL_RD_02}` | `https://excel-drills.ch/pfad/finance.html?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=finanzen` |
| `{URL_RD_03}` | `https://excel-drills.ch/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=schweiz` |
| `{URL_RD_04}` | `https://excel-drills.ch/app/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=excel` |
| `{URL_RD_05}` | `https://excel-drills.ch/pfad/accounting.html?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=buchhaltung` |

Kurzvariante, falls UTM in Reddit störend wirkt: `https://excel-drills.ch/?ref=reddit-<sub>` (dann in Analytics nach `ref` filtern).

### X
| Platzhalter | Link |
|---|---|
| `{URL_X_T1}` | `https://excel-drills.ch/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-t1` |
| `{URL_X_T2}` | `https://excel-drills.ch/app/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-t2#sverweis-1` |
| `{URL_X_T3}` | `https://excel-drills.ch/pfad/finance.html?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-t3` |
| `{URL_X_05}` | `https://excel-drills.ch/app/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-05` |
| `{URL_X_11}` | `https://excel-drills.ch/app/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-11` |
| `{URL_X_10}` | `https://excel-drills.ch/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-10` |

### Instagram / TikTok
| Platzhalter | Link |
|---|---|
| `{URL_IG_BIO}` | `https://excel-drills.ch/?utm_source=instagram&utm_medium=bio&utm_campaign=launch` |
| `{URL_TT_BIO}` | `https://excel-drills.ch/?utm_source=tiktok&utm_medium=social&utm_campaign=launch-2026-11&utm_content=bio` |
| `{URL_IG_K7}` | `https://excel-drills.ch/assessment/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k7` (Link in Bio an diesem Tag) |
| `{URL_IG_STORY_BB}` | `https://excel-drills.ch/premium.html?utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=ig-story-berufsbildner` |
| `{URL_IG_K8}` | `https://excel-drills.ch/upload/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k8` (Bio-Link So 8.11.) |
| `{URL_IG_K9}` | `https://excel-drills.ch/assessment/?rolle=consulting&utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k9` (Bio-Link Mo 23.11.) |
| `{URL_IG_K10}` | `https://excel-drills.ch/app/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k10` (Bio-Link So 22.11.) |
| `{URL_IG_K11}` | `https://excel-drills.ch/zertifikate/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k11` (Bio-Link Do 12.11. und Do 19.11.) |
| `{URL_IG_K12}` | `https://excel-drills.ch/app/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k12` (Bio-Link So 15.11.) |
| `{URL_IG_K13}` | `https://excel-drills.ch/kampagne/?kampagne=controlling-monat-1&utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k13` (Bio-Link Mi 18.11.) |
| `{URL_IG_K14}` | `https://sql-drills.onrender.com/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=ig-k14` (Bio-Link Fr 27.11.) |
| `{URL_IG_FDT}` | `https://excel-drills.ch/app/?utm_source=instagram&utm_medium=bio&utm_campaign=launch&utm_content=fdt-<nr>` (Reel-Tage ohne Karussell; Hash der Übung anhängen, z. B. `#runden-1`) |
| `{URL_IG_STORY_UPLOAD}` | `https://excel-drills.ch/upload/?utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=ig-story-upload` |
| `{URL_IG_STORY_ZERTIFIKATE}` | `https://excel-drills.ch/zertifikate/?utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=ig-story-zertifikate` |
| `{URL_IG_STORY_INTERVIEW}` | `https://excel-drills.ch/assessment/?rolle=consulting&utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=ig-story-interview` |
| `{URL_IG_STORY_SQL}` | `https://sql-drills.onrender.com/?utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=ig-story-sql` |

### E-Mail
| Platzhalter | Link |
|---|---|
| `{URL_EM_01}` | `https://excel-drills.ch/app/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-01` |
| `{URL_EM_02}` | `https://excel-drills.ch/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-02` |
| `{URL_EM_03}` | `https://excel-drills.ch/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-03` |
| `{URL_EM_04}` | `https://excel-drills.ch/assessment/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-04` |
| `{URL_EM_05}` | `https://excel-drills.ch/assessment/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-05` |

### Zertifikats-Kampagnen (für Posts, Stories, Mails)
| Platzhalter | Link |
|---|---|
| `{URL_KMP_SIZ_AU4}` | `https://excel-drills.ch/kampagne/?kampagne=siz-au4&utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=kmp-siz-au4` |
| `{URL_KMP_SIZ_PU41}` | `https://excel-drills.ch/kampagne/?kampagne=siz-pu41&utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=kmp-siz-pu41` |
| `{URL_KMP_MO210}` | `https://excel-drills.ch/kampagne/?kampagne=mos-excel-associate&utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=kmp-mo-210` |
| `{URL_KMP_MO211}` | `https://excel-drills.ch/kampagne/?kampagne=mos-excel-expert&utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=kmp-mo-211` |
| `{URL_KMP_CONTROLLING}` | `https://excel-drills.ch/kampagne/?kampagne=controlling-monat-1&utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=kmp-controlling` |

Für andere Kanäle `utm_source`/`utm_medium` nach dem Schema oben tauschen (z. B. LinkedIn: `utm_source=linkedin&utm_medium=social`). Englische Funktionsnamen: `&lang=en` direkt nach der Kampagnen-ID.

## Hinweis zum Einsetzen

Die Links sind in allen Post-Dateien bereits eingesetzt (Stand 1.11.2026, inkl. IG-K8 bis K14, LI-17 bis LI-19); die Tabellen oben bleiben die Referenz pro Post-ID. Neue Posts: gleiche Schreibweise (Kleinbuchstaben, Bindestriche), `utm_content` = Post-ID, Zeile hier ergänzen. Der Instagram-Bio-Link nutzt bewusst `utm_medium=bio` und `utm_campaign=launch` (Abweichung vom Launch-Schema `launch-2026-11`); in Plausible beim Auswerten beide Kampagnennamen berücksichtigen.
