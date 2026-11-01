-- Excel-Drills: Recruiter-Links für die Rollen-Assessments (MVP, ohne Login)
-- Ausführen: Supabase Dashboard › SQL Editor › Inhalt dieser Datei einfügen › Run (siehe docs/RECRUITER-SETUP.md).
-- Idempotent geschrieben: ein zweiter Lauf schadet nicht. Unabhängig von 001_init.sql und 002_interview.sql.
--
-- Prinzip: Die Tabellen sind für anon und authenticated komplett gesperrt (RLS an, keine Policies, keine Grants).
-- Der Browser spricht nur drei SECURITY DEFINER-Funktionen an (PostgREST: POST /rest/v1/rpc/<name>):
--   link_info(p_token)                 Kandidat: Firma, Rolle, Sprache, Minuten, aktiv (ohne Tokens)
--   submit_assessment_result(...)      Kandidat: Ergebnis speichern, prüft aktiv und max_teilnahmen
--   results_for_link(p_admin_token)    Recruiter: Firma, Rolle und alle Ergebnisse als JSON
-- token (Kandidaten-Link) und admin_token (Recruiter-Link) sind getrennte Zufallswerte. Der admin_token
-- wird von keiner Kandidaten-Funktion zurückgegeben.

-- gen_random_bytes() kommt aus pgcrypto (bei Supabase im Schema «extensions»)
create extension if not exists pgcrypto with schema extensions;

/* ---------- Tabellen ---------- */

create table if not exists public.assessment_links (
  id              uuid primary key default gen_random_uuid(),
  token           text not null unique default encode(extensions.gen_random_bytes(12), 'hex')
                  check (token ~ '^[A-Za-z0-9_-]{16,64}$'),
  admin_token     text not null unique default encode(extensions.gen_random_bytes(18), 'hex')
                  check (admin_token ~ '^[A-Za-z0-9_-]{24,64}$'),
  firma           text not null check (char_length(firma) between 1 and 200),
  kontakt_email   text check (kontakt_email is null or char_length(kontakt_email) <= 254),
  rolle           text not null check (rolle ~ '^[a-z0-9-]{1,40}$'),
  sprache         text not null default 'de' check (sprache in ('de', 'en')),
  minuten         integer null check (minuten is null or minuten between 1 and 180),
  erstellt        timestamptz not null default now(),
  aktiv           boolean not null default true,
  max_teilnahmen  integer not null default 50 check (max_teilnahmen between 1 and 10000),
  check (token <> admin_token)
);

create table if not exists public.assessment_results (
  id              uuid primary key default gen_random_uuid(),
  link_id         uuid not null references public.assessment_links (id) on delete cascade,
  kandidat_name   text not null check (char_length(kandidat_name) between 1 and 200),
  kandidat_email  text not null check (char_length(kandidat_email) between 3 and 254),
  punkte          integer not null check (punkte between 0 and 10000),
  prozent         integer not null check (prozent between 0 and 100),
  stufe           text check (stufe is null or char_length(stufe) <= 60),
  dauer_sek       integer check (dauer_sek is null or dauer_sek between 0 and 86400),
  aufgaben        jsonb not null default '[]'::jsonb check (jsonb_typeof(aufgaben) = 'array'),
  sprache         text not null default 'de' check (sprache in ('de', 'en')),
  erstellt        timestamptz not null default now()
);

create index if not exists assessment_results_link_idx on public.assessment_results (link_id, erstellt);

-- RLS an, keine Policies: anon und authenticated sehen und ändern nichts.
-- Supabase vergibt per Default-Privileges Rechte an anon/authenticated, darum ausdrücklich entziehen.
alter table public.assessment_links enable row level security;
alter table public.assessment_results enable row level security;
revoke all on table public.assessment_links from anon, authenticated;
revoke all on table public.assessment_results from anon, authenticated;
grant select, insert, update, delete on table public.assessment_links to service_role;
grant select, insert, update, delete on table public.assessment_results to service_role;

/* ---------- Kandidat: Link-Infos ---------- */

-- Gibt nur {firma, rolle, sprache, minuten, aktiv} zurück, nie token oder admin_token. Unbekannter Token: null.
create or replace function public.link_info(p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
           'firma',   l.firma,
           'rolle',   l.rolle,
           'sprache', l.sprache,
           'minuten', l.minuten,
           'aktiv',   l.aktiv
         )
  from public.assessment_links l
  where l.token = p_token
  limit 1;
$$;

/* ---------- Kandidat: Ergebnis übermitteln ---------- */

-- Prüft: Link existiert und ist aktiv, Teilnahmen < max_teilnahmen, Eingaben plausibel.
-- Fehler werden als Exception mit kurzem Code geworfen (link_unbekannt, link_inaktiv, link_voll, eingabe_ungueltig),
-- PostgREST liefert sie als HTTP 400 mit {"message": "<code>"}; app/recruiter.js übersetzt sie.
-- Rückgabe: ID des neuen Ergebnisses.
create or replace function public.submit_assessment_result(
  p_token    text,
  p_name     text,
  p_email    text,
  p_punkte   integer,
  p_prozent  integer,
  p_stufe    text,
  p_dauer    integer,
  p_aufgaben jsonb,
  p_sprache  text
)
returns uuid
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_link    public.assessment_links%rowtype;
  v_anzahl  integer;
  v_id      uuid;
  v_name    text := btrim(coalesce(p_name, ''));
  v_email   text := lower(btrim(coalesce(p_email, '')));
  v_sprache text;
begin
  -- Zeile sperren, damit parallele Abgaben max_teilnahmen nicht überschreiten
  select * into v_link
  from public.assessment_links
  where token = p_token
  for update;

  if not found then
    raise exception 'link_unbekannt' using errcode = 'P0001';
  end if;
  if not v_link.aktiv then
    raise exception 'link_inaktiv' using errcode = 'P0001';
  end if;

  select count(*) into v_anzahl from public.assessment_results where link_id = v_link.id;
  if v_anzahl >= v_link.max_teilnahmen then
    raise exception 'link_voll' using errcode = 'P0001';
  end if;

  -- Eingaben prüfen (der Browser prüft vorher schon, das hier ist die verbindliche Prüfung)
  if char_length(v_name) < 1 or char_length(v_name) > 200
     or char_length(v_email) > 254
     or v_email !~ '^[^[:space:]@<>(),;"]+@[^[:space:]@<>(),;"]+\.[a-z]{2,}$'
     or p_punkte is null or p_punkte < 0 or p_punkte > 10000
     or p_prozent is null or p_prozent < 0 or p_prozent > 100
     or (p_dauer is not null and (p_dauer < 0 or p_dauer > 86400))
     or (p_stufe is not null and char_length(p_stufe) > 60)
     or p_aufgaben is null or jsonb_typeof(p_aufgaben) <> 'array'
     or jsonb_array_length(p_aufgaben) > 50
     or octet_length(p_aufgaben::text) > 20000 then
    raise exception 'eingabe_ungueltig' using errcode = 'P0001';
  end if;

  v_sprache := case when p_sprache in ('de', 'en') then p_sprache else v_link.sprache end;

  insert into public.assessment_results
    (link_id, kandidat_name, kandidat_email, punkte, prozent, stufe, dauer_sek, aufgaben, sprache)
  values
    (v_link.id, v_name, v_email, p_punkte, p_prozent, nullif(btrim(p_stufe), ''), p_dauer, p_aufgaben, v_sprache)
  returning id into v_id;

  return v_id;
end;
$$;

/* ---------- Recruiter: Ergebnisse lesen ---------- */

-- Gibt Firma, Rolle, Einstellungen und alle Ergebnisse des Links zurück. Unbekannter admin_token: null.
-- Bewusst ohne token und admin_token in der Antwort.
create or replace function public.results_for_link(p_admin_token text)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select jsonb_build_object(
           'firma',          l.firma,
           'rolle',          l.rolle,
           'sprache',        l.sprache,
           'minuten',        l.minuten,
           'aktiv',          l.aktiv,
           'max_teilnahmen', l.max_teilnahmen,
           'erstellt',       l.erstellt,
           'anzahl',         (select count(*) from public.assessment_results r where r.link_id = l.id),
           'ergebnisse',     coalesce((
              select jsonb_agg(jsonb_build_object(
                       'id',             r.id,
                       'kandidat_name',  r.kandidat_name,
                       'kandidat_email', r.kandidat_email,
                       'punkte',         r.punkte,
                       'prozent',        r.prozent,
                       'stufe',          r.stufe,
                       'dauer_sek',      r.dauer_sek,
                       'aufgaben',       r.aufgaben,
                       'sprache',        r.sprache,
                       'erstellt',       r.erstellt
                     ) order by r.prozent desc, r.erstellt)
              from public.assessment_results r
              where r.link_id = l.id
           ), '[]'::jsonb)
         )
  from public.assessment_links l
  where l.admin_token = p_admin_token
    and char_length(coalesce(p_admin_token, '')) >= 24
  limit 1;
$$;

/* ---------- Rechte: nur Execute auf die drei Funktionen ---------- */

revoke all on function public.link_info(text) from public, anon, authenticated;
revoke all on function public.submit_assessment_result(text, text, text, integer, integer, text, integer, jsonb, text) from public, anon, authenticated;
revoke all on function public.results_for_link(text) from public, anon, authenticated;

-- authenticated zusätzlich, damit angemeldete Nutzerinnen (Branch login) die Seiten genauso nutzen können
grant execute on function public.link_info(text) to anon, authenticated;
grant execute on function public.submit_assessment_result(text, text, text, integer, integer, text, integer, jsonb, text) to anon, authenticated;
grant execute on function public.results_for_link(text) to anon, authenticated;

/* ---------- Link anlegen (von Hand im SQL Editor) ---------- */

-- token und admin_token erzeugt die Datenbank selbst (Defaults oben). Beispiel:
--
-- insert into public.assessment_links (firma, kontakt_email, rolle, sprache, minuten, max_teilnahmen)
-- values ('Muster Versicherung AG', 'hr@muster.ch', 'accounting', 'de', null, 50)
-- returning token, admin_token;
--
-- Gleichwertig mit expliziten Werten:
--
-- insert into public.assessment_links (id, token, admin_token, firma, rolle)
-- values (gen_random_uuid(),
--         encode(extensions.gen_random_bytes(12), 'hex'),
--         encode(extensions.gen_random_bytes(18), 'hex'),
--         'Muster Treuhand GmbH', 'accounting')
-- returning token, admin_token;
--
-- Kandidaten-URL:  https://excel-drills.ch/assessment/?link=<token>
-- Recruiter-URL:   https://excel-drills.ch/assessment/ergebnisse.html?admin=<admin_token>
--
-- Link schliessen:       update public.assessment_links set aktiv = false where token = '<token>';
-- Ergebnisse löschen:    delete from public.assessment_results where link_id = (select id from public.assessment_links where token = '<token>');
