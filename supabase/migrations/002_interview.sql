-- Excel-Drills: Rate-Limit der KI-Interviewerin (Edge Function «interview»)
-- Ausführen: Supabase Dashboard › SQL Editor › Inhalt dieser Datei einfügen › Run (siehe docs/INTERVIEW-SETUP.md).
-- Idempotent geschrieben: ein zweiter Lauf schadet nicht. Unabhängig von 001_init.sql (Branch login).

-- Eine Zeile pro Premium-Code und Tag. key_hash = SHA-256 des normalisierten Codes, nie der Code selbst.
create table if not exists public.interview_log (
  key_hash    text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  day         date not null,
  count       integer not null default 0 check (count >= 0),
  updated_at  timestamptz not null default now(),
  primary key (key_hash, day)
);

-- RLS an, keine Policies: anon und authenticated sehen und ändern nichts.
-- Die Edge Function arbeitet mit dem Service-Role-Key, der RLS umgeht.
alter table public.interview_log enable row level security;
revoke all on table public.interview_log from anon, authenticated;
grant select, insert, update, delete on table public.interview_log to service_role;

-- Zähler atomar hochzählen (Upsert) und den neuen Stand zurückgeben.
create or replace function public.interview_bump(p_key_hash text, p_day date)
returns integer
language sql
security invoker
set search_path = public
as $$
  insert into public.interview_log as l (key_hash, day, count, updated_at)
  values (p_key_hash, p_day, 1, now())
  on conflict (key_hash, day) do update
    set count = l.count + 1, updated_at = now()
  returning l.count;
$$;

revoke all on function public.interview_bump(text, date) from public, anon, authenticated;
grant execute on function public.interview_bump(text, date) to service_role;

-- Aufräumen (optional, z. B. monatlich von Hand): alte Tage löschen
-- delete from public.interview_log where day < current_date - 90;
