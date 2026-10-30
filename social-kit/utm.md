# UTM-Schema und Links

**Basis:** `https://excel-drills.ch` = finale Domain (Vorschlag TESTPLAN: excel-drills.ch). Bis zur Domainwahl Platzhalter lassen.
**Kampagne:** alle Launch-Posts `utm_campaign=launch-2026-11`.
**Schreibweise:** nur Kleinbuchstaben, Bindestriche, keine Umlaute, keine Leerzeichen.
**Messung:** Plausible ist seit 30.10.2026 eingebaut (`assets/analytics.js`, siehe `docs/ANALYTICS.md`) und erfasst UTM-Parameter automatisch, sobald die Site mit der echten Domain in Plausible angelegt ist. Vorher sind die Links trotzdem harmlos.

## Schema pro Kanal

| Kanal | utm_source | utm_medium | utm_content (Beispiel) |
|---|---|---|---|
| LinkedIn Post | `linkedin` | `social` | `li-01` … `li-12` |
| LinkedIn Kommentar (Link im 1. Kommentar) | `linkedin` | `social` | `li-09-kommentar` |
| Reddit | `reddit` | `social` | `de-edv`, `finanzen`, `schweiz`, `excel`, `buchhaltung` |
| X | `x` | `social` | `x-t1`, `x-05` |
| Instagram (Bio) | `instagram` | `social` | `bio` |
| TikTok (Profil) | `tiktok` | `social` | `bio` |
| E-Mail | `email` | `email` | `em-01`, `em-02`, `em-03` |
| Foren/Gruppen | `<forumname>` | `referral` | `<thread-kurzname>` |

**Zielseiten:**
- Gratis-Einstieg: `https://https://excel-drills.ch/app/` (öffnet erste Übung)
- Bestimmte Übung: `https://https://excel-drills.ch/app/?…#<übungs-id>` (Hash = Übungs-ID, z. B. `#sverweis-1`). Der Hash steht **nach** den UTM-Parametern.
- Lernpfad: `https://https://excel-drills.ch/pfad/basis.html`, `/pfad/accounting.html`, `/pfad/finance.html`
- Artikel: `https://https://excel-drills.ch/artikel/sverweis.html` usw.
- Preise: `https://https://excel-drills.ch/premium.html`

## Fertige Links

### LinkedIn
| Platzhalter | Link |
|---|---|
| `{URL_LI_01}` | `https://https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-01` |
| `{URL_LI_02}` | `https://https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-02#sverweis-1` |
| `{URL_LI_03}` | `https://https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-03#summewenn-1` |
| `{URL_LI_04}` | `https://https://excel-drills.ch/pfad/basis.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-04` |
| `{URL_LI_05}` | `https://https://excel-drills.ch/pfad/accounting.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-05` |
| `{URL_LI_06}` | `https://https://excel-drills.ch/pfad/finance.html?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-06` |
| `{URL_LI_07}` | `https://https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-07` |
| `{URL_LI_08}` | `https://https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-08` |
| `{URL_LI_09}` | `https://https://excel-drills.ch/app/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-09-kommentar#runden-1` |
| `{URL_LI_10}` | `https://https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-10-kommentar` |
| `{URL_LI_11}` | `https://https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-11` |
| `{URL_LI_12}` | `https://https://excel-drills.ch/?utm_source=linkedin&utm_medium=social&utm_campaign=launch-2026-11&utm_content=li-12` |

### Reddit
| Platzhalter | Link |
|---|---|
| `{URL_RD_01}` | `https://https://excel-drills.ch/app/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=de-edv` |
| `{URL_RD_02}` | `https://https://excel-drills.ch/pfad/finance.html?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=finanzen` |
| `{URL_RD_03}` | `https://https://excel-drills.ch/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=schweiz` |
| `{URL_RD_04}` | `https://https://excel-drills.ch/app/?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=excel` |
| `{URL_RD_05}` | `https://https://excel-drills.ch/pfad/accounting.html?utm_source=reddit&utm_medium=social&utm_campaign=launch-2026-11&utm_content=buchhaltung` |

Kurzvariante, falls UTM in Reddit störend wirkt: `https://https://excel-drills.ch/?ref=reddit-<sub>` (dann in Analytics nach `ref` filtern).

### X
| Platzhalter | Link |
|---|---|
| `{URL_X_T1}` | `https://https://excel-drills.ch/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-t1` |
| `{URL_X_T2}` | `https://https://excel-drills.ch/app/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-t2#sverweis-1` |
| `{URL_X_T3}` | `https://https://excel-drills.ch/pfad/finance.html?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-t3` |
| `{URL_X_05}` | `https://https://excel-drills.ch/app/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-05` |
| `{URL_X_10}` | `https://https://excel-drills.ch/?utm_source=x&utm_medium=social&utm_campaign=launch-2026-11&utm_content=x-10` |

### Instagram / TikTok
| Platzhalter | Link |
|---|---|
| `{URL_IG_BIO}` | `https://https://excel-drills.ch/?utm_source=instagram&utm_medium=social&utm_campaign=launch-2026-11&utm_content=bio` |
| `{URL_TT_BIO}` | `https://https://excel-drills.ch/?utm_source=tiktok&utm_medium=social&utm_campaign=launch-2026-11&utm_content=bio` |

### E-Mail
| Platzhalter | Link |
|---|---|
| `{URL_EM_01}` | `https://https://excel-drills.ch/app/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-01` |
| `{URL_EM_02}` | `https://https://excel-drills.ch/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-02` |
| `{URL_EM_03}` | `https://https://excel-drills.ch/?utm_source=email&utm_medium=email&utm_campaign=launch-2026-11&utm_content=em-03` |

## Platzhalter ersetzen (nach Domainwahl)

```bash
cd social-kit
DOMAIN=excel-drills.ch
sed -i '' "s/https://excel-drills.ch/$DOMAIN/g" utm.md
```
Danach in den Posts `{URL}` durch den jeweiligen Link aus den Tabellen ersetzen (manuell beim Posten, damit jeder Post seinen eigenen `utm_content` behält).
