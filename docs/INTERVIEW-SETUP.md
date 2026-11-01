# KI-Interviewerin: Einrichtung

> Differenzierer 3 aus `docs/DIFFERENZIERUNG.md`. Nach einem Rollen-Assessment stellt «Frau Keller, Partnerin»
> (Consulting) bzw. «Herr Bianchi, Leiter Rechnungswesen» (Accounting) bis zu 6 Rückfragen zum Modell und
> bewertet am Schluss Struktur, Zahlenverständnis, Annahmen und Kommunikation (je 1–5) mit zwei Verbesserungen.
> Nur für Premium (gleicher Code wie in `app/keys.js`), max. 20 Anfragen pro Code und Tag.
> Einmalige Einrichtung, ca. 20 Minuten. Alles hier ist **nur Luca** (Secrets, Deploy).

## Dateien

| Datei | Zweck |
|---|---|
| `supabase/functions/interview/index.ts` | Edge Function (Deno): Code prüfen, Rate-Limit, Claude-API, Antwort |
| `supabase/functions/interview/logic.js` | reine Logik (Rundenzählung, JSON-Extraktion, Rate-Limit, CORS), getestet |
| `supabase/functions/interview/prompts/consulting.json`, `accounting.json` | System-Prompts der beiden Figuren |
| `supabase/migrations/002_interview.sql` | Tabelle `interview_log` + Funktion `interview_bump` |
| `app/interview.js`, `assets/interview.css` | Chat-Komponente für die Assessment-Ergebnisseite |
| `scripts/test-interview.mjs` | Tests: `node scripts/test-interview.mjs` |

## Wer trägt was ein?

| Wert | Wo | Wer |
|---|---|---|
| **Anthropic API Key** (`sk-ant-…`) | Supabase › Edge Functions › Secrets: `ANTHROPIC_API_KEY` | **nur Luca**, nie in Dateien, Chats oder Git |
| `PREMIUM_KEY_HASH` | Supabase › Edge Functions › Secrets | Luca (der Wert ist nicht geheim, siehe unten) |
| Service-Role-Key, `SUPABASE_URL` | nirgends, in der Edge Function automatisch vorhanden | – |

## 1. Anthropic-Konto und API-Key

1. Auf <https://console.anthropic.com> anmelden (oder Konto anlegen), Zahlungsmittel hinterlegen.
2. **Settings › Limits**: ein Monatslimit setzen, z. B. USD 20. Damit ist das Kostenrisiko gedeckelt.
3. **API Keys › Create Key**, Name `excel-drills-interview`. Den Key nur kopieren und direkt in Schritt 2 einfügen.

## 2. Secrets in Supabase setzen

Dashboard › **Edge Functions › Secrets** (oder **Project Settings › Edge Functions**) › **Add new secret**:

| Name | Wert |
|---|---|
| `ANTHROPIC_API_KEY` | der Key aus Schritt 1 |
| `PREMIUM_KEY_HASH` | derselbe SHA-256-Hash wie in `app/keys.js` (`VALID_HASHES`), heute `08e62668bfab204110d2ca46f7dd7361115479c705712426fda52daa3c792c16` |
| `INTERVIEW_DAILY_LIMIT` | optional, Standard 20 |

Mehrere gültige Codes: Hashes durch Komma getrennt eintragen. Kommt ein neuer Code dazu, **beide** Stellen
nachführen (`app/keys.js` und dieses Secret). Hash eines Codes: `printf 'DEIN-CODE' | shasum -a 256`
(Code in Grossbuchstaben, wie `app/keys.js` normalisiert).

Alternativ per CLI: `supabase secrets set ANTHROPIC_API_KEY=… PREMIUM_KEY_HASH=…`

## 3. Datenbank: Migration ausführen

1. Dashboard › **SQL Editor** › **New query**.
2. Inhalt von `supabase/migrations/002_interview.sql` komplett einfügen › **Run**.
3. Kontrolle: **Table Editor** zeigt `interview_log` mit «RLS enabled» und ohne Policies (kein Zugriff für anon).
   Unter **Database › Functions** gibt es `interview_bump`.

Die Datei ist idempotent und braucht `001_init.sql` (Branch `login`) nicht.

## 4. Edge Function `interview` deployen

Wie beim `stripe-webhook`, **Dashboard-Editor**:

1. Edge Functions › **Deploy a new function › Via Editor**, Name `interview`.
2. Vier Dateien anlegen, jeweils mit dem Inhalt aus `supabase/functions/interview/`:
   `index.ts`, `logic.js`, `prompts/consulting.json`, `prompts/accounting.json` (Ordner `prompts` im Dateinamen mitgeben).
3. **Deploy**. Danach in den Function-Einstellungen **«Verify JWT» / «Enforce JWT» ausschalten**: die Seite schickt
   kein Supabase-Token, die Funktion prüft stattdessen den Premium-Code.

Variante CLI: `supabase functions deploy interview --no-verify-jwt`

Die URL ist `https://uijlrixalisqbcgivccn.supabase.co/functions/v1/interview` und steht schon als `ENDPOINT` in
`app/interview.js`.

## 5. Testen mit curl

Platzhalter ersetzen: `<PREMIUM-CODE>` = Ihr Freischalt-Code. Den Code nicht in geteilte Chats oder Dateien kopieren.

```sh
# Start: leerer Verlauf -> Begrüssung und erste Rückfrage
curl -s https://uijlrixalisqbcgivccn.supabase.co/functions/v1/interview \
  -H 'content-type: application/json' \
  -d '{
    "accessKey": "<PREMIUM-CODE>",
    "role": "consulting",
    "assessment": "Consulting-Assessment",
    "score": 72,
    "answersSummary": "Aufgabe 1 Deckungsbeitrag: richtig (CHF 18.-). Aufgabe 2 Break-even: 1800 Stück, richtig. Aufgabe 3 Szenario Preis -10 %: falsch, Fixkosten doppelt gezählt.",
    "transcript": []
  }'

# Zweite Runde: bisherigen Verlauf mitschicken, letzte Nachricht vom Kandidaten
curl -s https://uijlrixalisqbcgivccn.supabase.co/functions/v1/interview \
  -H 'content-type: application/json' \
  -d '{
    "accessKey": "<PREMIUM-CODE>",
    "role": "consulting",
    "assessment": "Consulting-Assessment",
    "score": 72,
    "answersSummary": "…",
    "transcript": [
      {"role": "interviewer", "text": "<Antwort aus dem ersten Aufruf>"},
      {"role": "candidate", "text": "Fixkosten 32400 durch Deckungsbeitrag 18 ergibt 1800 Stück."}
    ]
  }'
```

Erwartet: `{"reply":"…","done":false,"assessmentNote":null,"round":2,"remaining":18}`.
Mit `"text": "fertig"` als letzter Kandidaten-Nachricht kommt sofort die Abschlussbewertung:
`"done":true,"assessmentNote":{"scores":{"struktur":4,…},"feedback":["…","…"],"total":13,"max":20}`.

Fehlerfälle prüfen:

| Test | Erwartet |
|---|---|
| `accessKey` weglassen oder falsch | `401` `{"error":"key"}` |
| 21. Anfrage am selben Tag (Zürcher Zeit) | `429` `{"error":"limit"}` |
| `role` z. B. `"ib"` | `400` `{"error":"role"}` |
| letzte Nachricht von der Interviewerin | `400` `{"error":"awaiting-candidate"}` |
| `ANTHROPIC_API_KEY` falsch | `502` `{"error":"upstream"}` mit neutraler Meldung; Details nur in den Function-Logs |
| Aufruf von fremder Website (Origin) | `403`; erlaubt sind `https://excel-drills.ch`, `https://www.excel-drills.ch`, `http://localhost:8787` |

Logs: Dashboard › Edge Functions › interview › **Logs**.

## Kosten pro Gespräch (Schätzung)

Modell `claude-sonnet-5-5`, Preis laut Anthropic (Stand Oktober 2026): **USD 2 pro Million Input-Tokens,
USD 10 pro Million Output-Tokens**. Jede Runde ist ein API-Aufruf mit dem ganzen bisherigen Verlauf.

| Posten | Tokens (grob) |
|---|---|
| System-Prompt | ca. 900 pro Aufruf |
| Assessment-Kontext | 300–800 pro Aufruf |
| Verlauf | wächst von 0 auf ca. 1'500 |
| Aufrufe pro Gespräch | 7 (Start, 5 Rückfragen, Abschluss) |
| **Input total** | ca. 14'000 → USD 0.028 |
| **Output total** (6 × ca. 120 + Abschluss ca. 300, max. 400 pro Aufruf) | ca. 1'000 → USD 0.010 |
| **Total pro Gespräch** | **ca. USD 0.04, also 3–4 Rappen** |

Obergrenze pro Code und Tag (20 Anfragen, knapp 3 Gespräche): ca. 12 Rappen. Prompt-Caching bringt bei dieser
Prompt-Grösse wenig und ist bewusst nicht eingebaut. Die tatsächlichen Werte zeigt die Anthropic Console unter
**Usage**; nach den ersten echten Gesprächen dort nachprüfen.

## Technische Notizen

- Extended Thinking ist aus (`thinking: {type: "between_tools"}`, Effort `low`), damit die 400 Tokens ganz für die
  Antwort bleiben und die Antwort schnell kommt.
- Die Rundensteuerung («Runde 3 von 6», «Jetzt Abschlussbewertung») geht als System-Nachricht am Ende des
  Verlaufs mit, getrennt von den Kandidaten-Texten. So kann ein Kandidat die Bewertung nicht per Text erzwingen.
- Der Server zählt die Runden selbst aus dem Verlauf; nach 6 Antworten wird immer bewertet, mehr wird abgelehnt.
- Lehnt das Modell eine Anfrage ab (`stop_reason: refusal`) oder ist die API nicht erreichbar, gibt es `502` mit
  neutraler Meldung. Die Anfrage zählt trotzdem für das Tageslimit.
- Gespeichert wird nur `key_hash`, Tag und Zähler, keine Gesprächsinhalte. Hinweis für die Datenschutzerklärung:
  Antworten werden zur Auswertung an Anthropic (USA) übermittelt.


## Stand 1.11.2026 (von Claude ausgeführt)

- Migration 002 ausgeführt, Function `interview` per Dashboard-Editor deployt (gebündelte Datei: Prompts und logic.js inline).
- «Verify JWT» bleibt AN: `app/interview.js` sendet den Publishable Key als `apikey` und `Authorization: Bearer`, das genügt dem Gateway; die Function prüft zusätzlich den Premium-Code.
- Noch offen (nur Luca, Secret-Store): Secrets `ANTHROPIC_API_KEY` und `PREMIUM_KEY_HASH` unter Edge Functions › Secrets setzen. Bis dahin antwortet die Function mit 500 «noch nicht eingerichtet», die Seite zeigt den Hinweis.
