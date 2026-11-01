// Excel-Drills – KI-Interviewerin im Case-Modus (Supabase Edge Function, Deno)
//
// POST { assessment, role, score, answersSummary, transcript: [{ role: 'interviewer'|'candidate', text }], accessKey }
//  -> 200 { reply, done, assessmentNote }   assessmentNote = { scores, feedback, total, max } oder null
//  -> 400 Eingabe ungültig, 401 kein/ungültiger Premium-Code, 429 Tageslimit, 502 Claude-API nicht erreichbar
//
// Ablauf: leerer Verlauf = Interview starten (Begrüssung + Rückfrage 1). Danach je Kandidaten-Antwort eine Rückfrage,
// nach 6 Antworten (oder «fertig») die Abschlussbewertung mit JSON-Block, den logic.js herauslöst.
//
// Deploy: Dashboard › Edge Functions › interview, «Verify JWT» AUS (die Seite schickt kein Supabase-JWT),
//         oder: supabase functions deploy interview --no-verify-jwt
//
// Umgebungsvariablen (siehe docs/INTERVIEW-SETUP.md):
//   ANTHROPIC_API_KEY                         (nur Luca setzt diesen)
//   PREMIUM_KEY_HASH                          (SHA-256 wie in app/keys.js, mehrere durch Komma getrennt)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (in Supabase automatisch vorhanden)
//   INTERVIEW_DAILY_LIMIT                     (optional, Standard 20)

import Anthropic from 'npm:@anthropic-ai/sdk@0.136.0';
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import consulting from './prompts/consulting.json' with { type: 'json' };
import accounting from './prompts/accounting.json' with { type: 'json' };
import {
  validateBody, checkAccessKey, nextPhase, buildMessages, extractAssessment, rateLimitDecision,
  zurichDay, corsHeaders, originAllowed, DAILY_LIMIT
} from './logic.js';

const MODEL = 'claude-sonnet-5-5';
const MAX_TOKENS = 400;
const PROMPTS: Record<string, { name: string; title: string; system: string[] }> = { consulting, accounting };

const env = (k: string) => Deno.env.get(k) ?? '';
const LIMIT = Number(env('INTERVIEW_DAILY_LIMIT')) || DAILY_LIMIT;

const admin = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

// SDK wiederholt 429/5xx/Verbindungsfehler selbst; ein Versuch extra reicht für ein Chat-Fenster.
const anthropic = new Anthropic({ apiKey: env('ANTHROPIC_API_KEY'), maxRetries: 1, timeout: 25_000 });

const MSG = {
  body: 'Die Anfrage ist unvollständig.',
  key: 'Für das Interview braucht es einen gültigen Premium-Code.',
  limit: 'Sie haben heute schon viele Interview-Nachrichten gesendet. Morgen geht es weiter.',
  upstream: 'Die Interviewerin ist gerade nicht erreichbar. Bitte versuchen Sie es in einer Minute nochmals.',
  config: 'Das Interview ist noch nicht eingerichtet.',
  origin: 'Herkunft nicht erlaubt.'
};

function json(status: number, body: unknown, cors: Record<string, string>, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, ...extra, 'content-type': 'application/json; charset=utf-8' }
  });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response(null, { status: originAllowed(origin) ? 204 : 403, headers: cors });
  if (!originAllowed(origin)) return json(403, { error: 'origin', message: MSG.origin }, cors);
  if (req.method !== 'POST') return json(405, { error: 'method', message: MSG.body }, cors);

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: 'json', message: MSG.body }, cors); }

  // 1. Premium-Code (vor allem anderen, damit ohne Code nichts verraten wird)
  const access = await checkAccessKey(body && body.accessKey, env('PREMIUM_KEY_HASH'));
  if (!access.ok) {
    if (access.reason === 'not-configured') { console.error('PREMIUM_KEY_HASH fehlt'); return json(500, { error: 'config', message: MSG.config }, cors); }
    return json(401, { error: 'key', message: MSG.key }, cors);
  }

  // 2. Eingabe und Rundenzählung
  const v = validateBody(body);
  if (!v.ok) return json(400, { error: v.error, message: MSG.body }, cors);
  const phase = nextPhase(v.value.transcript);
  if (!phase.ok) return json(400, { error: phase.error, message: MSG.body }, cors);

  if (!env('ANTHROPIC_API_KEY')) { console.error('ANTHROPIC_API_KEY fehlt'); return json(500, { error: 'config', message: MSG.config }, cors); }

  // 3. Rate-Limit: Zähler pro Code und Tag atomar hochzählen
  const { data: count, error: dbErr } = await admin.rpc('interview_bump', { p_key_hash: access.hash, p_day: zurichDay() });
  if (dbErr) { console.error('interview_bump:', dbErr.message); return json(500, { error: 'db', message: MSG.upstream }, cors); }
  const rl = rateLimitDecision(count, LIMIT);
  if (!rl.allowed) return json(429, { error: 'limit', message: MSG.limit }, cors, { 'Retry-After': '3600' });

  // 4. Claude-API
  const prompt = PROMPTS[v.value.role];
  let replyText = '';
  try {
    // Hinweise zu den Parametern (claude-sonnet-5-5):
    //  - thinking between_tools = kein Extended Thinking, damit die 400 Tokens ganz für die Antwort bleiben
    //  - role 'system' mitten im Verlauf steuert die Runde (Rundennummer bzw. Abschluss), ohne die Kandidaten-Texte zu vermischen
    //  - Objekt bewusst ohne Typ: die SDK-Typen kennen between_tools evtl. noch nicht
    const params: any = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      thinking: { type: 'between_tools' },
      output_config: { effort: 'low' },
      system: prompt.system.join('\n'),
      messages: buildMessages(v.value, phase)
    };
    const res: any = await anthropic.messages.create(params);
    if (res.stop_reason === 'refusal') {
      console.warn('refusal', res.stop_details && res.stop_details.category);
      return json(502, { error: 'upstream', message: MSG.upstream }, cors);
    }
    replyText = (res.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
    if (!replyText) return json(502, { error: 'upstream', message: MSG.upstream }, cors);
  } catch (e) {
    if (e instanceof Anthropic.APIError) console.error('Claude-API', e.status, e.message);
    else console.error('Claude-API', String(e));
    return json(502, { error: 'upstream', message: MSG.upstream }, cors);
  }

  // 5. Abschlussbewertung herauslösen
  const { text, note } = extractAssessment(replyText);
  const done = phase.phase === 'final' || !!note;
  return json(200, {
    reply: text,
    done,
    assessmentNote: note,
    round: phase.phase === 'final' ? null : phase.round,
    remaining: rl.remaining
  }, cors);
});
