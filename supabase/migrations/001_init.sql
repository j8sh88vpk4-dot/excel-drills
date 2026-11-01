-- Excel-Drills: Konten (freiwillig), Fortschritt und Premium-Lizenzen
-- Ausführen: Supabase Dashboard › SQL Editor › Inhalt dieser Datei einfügen › Run (siehe docs/LOGIN-SETUP.md).
-- Idempotent geschrieben: ein zweiter Lauf schadet nicht.

-- ---------------------------------------------------------------------------
-- Tabellen
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- Gamification-Stand (excelDrillsProgress, Version 2) als JSON, eine Zeile pro Konto
create table if not exists public.progress (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  state       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Premium-Lizenzen aus Stripe. user_id ist leer, solange es zur E-Mail noch kein Konto gibt.
create table if not exists public.licenses (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users (id) on delete set null,
  email                   text not null,
  plan                    text not null check (plan in ('monat', 'jahr', 'lifetime')),
  status                  text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  stripe_customer_id      text,
  stripe_subscription_id  text,
  stripe_session_id       text,
  cancel_at_period_end    boolean not null default false,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create unique index if not exists licenses_subscription_uq on public.licenses (stripe_subscription_id) where stripe_subscription_id is not null;
create unique index if not exists licenses_session_uq on public.licenses (stripe_session_id) where stripe_session_id is not null;
create index if not exists licenses_email_idx on public.licenses (lower(email));
create index if not exists licenses_user_idx on public.licenses (user_id);

-- Verarbeitete Stripe-Events (Idempotenz des Webhooks)
create table if not exists public.stripe_events (
  id            text primary key,           -- Stripe event.id (evt_…)
  type          text not null,
  received_at   timestamptz not null default now()
);

-- updated_at automatisch nachführen
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

drop trigger if exists licenses_touch on public.licenses;
create trigger licenses_touch before update on public.licenses
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.progress      enable row level security;
alter table public.licenses      enable row level security;
alter table public.stripe_events enable row level security;   -- keine Policy: nur Service-Role (Webhook)

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists progress_select_own on public.progress;
create policy progress_select_own on public.progress
  for select to authenticated using (user_id = auth.uid());

drop policy if exists progress_insert_own on public.progress;
create policy progress_insert_own on public.progress
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists progress_update_own on public.progress;
create policy progress_update_own on public.progress
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists progress_delete_own on public.progress;
create policy progress_delete_own on public.progress
  for delete to authenticated using (user_id = auth.uid());

-- Lizenzen: nur lesen, eigene (über user_id oder dieselbe E-Mail). Schreiben nur der Webhook (Service-Role umgeht RLS).
drop policy if exists licenses_select_own on public.licenses;
create policy licenses_select_own on public.licenses
  for select to authenticated using (
    user_id = auth.uid()
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

-- Zusätzlich zu RLS: Clients dürfen Lizenzen und Events nie schreiben.
revoke insert, update, delete on public.licenses from anon, authenticated;
revoke all on public.stripe_events from anon, authenticated;
revoke insert, update, delete on public.profiles from anon, authenticated;

-- Grösse des Fortschritts begrenzen (Schutz vor Missbrauch des Speichers), 200 KB reichen weit
alter table public.progress drop constraint if exists progress_state_size;
alter table public.progress add constraint progress_state_size check (pg_column_size(state) < 200000);

-- ---------------------------------------------------------------------------
-- Neues Konto: Profil anlegen und Lizenzen mit gleicher E-Mail verknüpfen
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''))
    on conflict (id) do update set email = excluded.email;
  if new.email is not null then
    update public.licenses set user_id = new.id
      where user_id is null and lower(email) = lower(new.email);
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- has_premium(uid): gleiche Regeln wie app/account.js (licenseDecision)
--   lifetime + active          -> ja
--   monat/jahr + active        -> ja, solange current_period_end leer oder < 3 Tage überschritten
--   canceled / past_due        -> ja bis current_period_end
-- Nur für das eigene Konto (uid = auth.uid()); Service-Role darf jede uid prüfen.
-- ---------------------------------------------------------------------------

create or replace function public.has_premium(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when uid is null then false
    when auth.uid() is not null and uid <> auth.uid() then false
    else exists (
      select 1
      from public.licenses l
      left join auth.users u on u.id = uid
      where (l.user_id = uid or (u.email is not null and lower(l.email) = lower(u.email)))
        and (
          (l.plan = 'lifetime' and l.status = 'active')
          or (l.plan in ('monat', 'jahr') and l.status = 'active'
              and (l.current_period_end is null or l.current_period_end + interval '3 days' > now()))
          or (l.plan in ('monat', 'jahr') and l.status in ('canceled', 'past_due')
              and l.current_period_end is not null and l.current_period_end > now())
        )
    )
  end
$$;

revoke all on function public.has_premium(uuid) from public;
grant execute on function public.has_premium(uuid) to authenticated, service_role;
