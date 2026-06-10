-- ============================================================
-- Migración 001 — Esquema inicial de Quinielas App
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Extensión para UUIDs automáticos
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (extiende el auth.users de Supabase)
-- ============================================================
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  display_name text not null,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- TEAMS
-- ============================================================
create table public.teams (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  abbreviation text not null,
  conference   text,          -- AFC, NFC, Liga, Grupo, etc.
  division     text,          -- Norte, Sur, Este, Oeste, etc.
  sport        text not null, -- nfl, soccer, f1, etc.
  created_at   timestamptz not null default now()
);

-- ============================================================
-- LEAGUE TEMPLATES (plantillas predefinidas por admin)
-- ============================================================
create table public.league_templates (
  id               uuid primary key default uuid_generate_v4(),
  created_by       uuid references public.users(id) on delete set null,
  name             text not null,
  sport            text not null,
  format_type      text not null check (format_type in ('draft_pool', 'predictions')),
  is_public        boolean not null default false,
  default_settings jsonb not null default '{}',
  created_at       timestamptz not null default now()
);

-- ============================================================
-- LEAGUES (quinielas)
-- ============================================================
create table public.leagues (
  id            uuid primary key default uuid_generate_v4(),
  owner_id      uuid not null references public.users(id) on delete restrict,
  template_id   uuid references public.league_templates(id) on delete set null,
  name          text not null,
  sport         text not null,
  season        text not null,            -- '2025', '2025-2026', etc.
  format_type   text not null check (format_type in ('draft_pool', 'predictions')),
  draft_mode    text check (draft_mode in ('automatic', 'manual')),
  status        text not null default 'pending'
                check (status in ('pending', 'draft', 'active', 'playoffs', 'finished')),
  current_phase int not null default 0,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- LEAGUE RULES (motor de reglas de puntuación)
-- ============================================================
create table public.league_rules (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  rule_type    text not null default 'prediction_score',
  conditions   jsonb not null default '{}',
  points       int not null default 0,
  multiplier   numeric not null default 1.0,
  phase_number int,             -- null = aplica a todas las fases
  eval_order   int not null,    -- menor número = mayor prioridad
  created_at   timestamptz not null default now()
);

-- ============================================================
-- LEAGUE MEMBERS (participantes de una quiniela)
-- ============================================================
create table public.league_members (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('organizer', 'member')),
  is_alive     boolean not null default true,
  total_points int not null default 0,
  joined_at    timestamptz not null default now(),
  unique (league_id, user_id)   -- un usuario no puede estar dos veces en la misma quiniela
);

-- ============================================================
-- DRAFT ASSIGNMENTS (resultado del sorteo)
-- ============================================================
create table public.draft_assignments (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  member_id    uuid not null references public.league_members(id) on delete cascade,
  team_id      uuid not null references public.teams(id) on delete restrict,
  round_number int not null,
  assigned_at  timestamptz not null default now(),
  unique (league_id, team_id)   -- un equipo no puede asignarse dos veces en la misma quiniela
);

-- ============================================================
-- TOURNAMENT PHASES (fases del torneo)
-- ============================================================
create table public.tournament_phases (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  name         text not null,       -- 'Temporada Regular', 'Wild Card', 'Divisional', etc.
  phase_order  int not null,        -- orden cronológico
  phase_type   text not null check (phase_type in ('regular', 'group', 'knockout', 'final')),
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- MATCHES (partidos)
-- ============================================================
create table public.matches (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  phase_id     uuid references public.tournament_phases(id) on delete set null,
  home_team_id uuid not null references public.teams(id) on delete restrict,
  away_team_id uuid not null references public.teams(id) on delete restrict,
  home_score   int,                  -- null hasta que termine el partido
  away_score   int,
  status       text not null default 'scheduled'
               check (status in ('scheduled', 'live', 'finished', 'cancelled')),
  match_date   timestamptz,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- PREDICTIONS (pronósticos de los participantes)
-- ============================================================
create table public.predictions (
  id             uuid primary key default uuid_generate_v4(),
  match_id       uuid not null references public.matches(id) on delete cascade,
  member_id      uuid not null references public.league_members(id) on delete cascade,
  predicted_home int not null,
  predicted_away int not null,
  points_earned  int not null default 0,
  created_at     timestamptz not null default now(),
  unique (match_id, member_id)   -- un miembro solo puede pronosticar una vez por partido
);

-- ============================================================
-- TEAM PHASE RESULTS (estado de un equipo en una fase)
-- ============================================================
create table public.team_phase_results (
  id         uuid primary key default uuid_generate_v4(),
  team_id    uuid not null references public.teams(id) on delete restrict,
  league_id  uuid not null references public.leagues(id) on delete cascade,
  phase_id   uuid not null references public.tournament_phases(id) on delete cascade,
  advanced   boolean not null default false,
  eliminated boolean not null default false,
  wins       int not null default 0,
  losses     int not null default 0,
  ties       int not null default 0,
  updated_at timestamptz not null default now(),
  unique (team_id, league_id, phase_id)
);

-- ============================================================
-- ÍNDICES para queries frecuentes
-- ============================================================
create index on public.league_members (league_id);
create index on public.league_members (user_id);
create index on public.draft_assignments (league_id);
create index on public.draft_assignments (member_id);
create index on public.matches (league_id);
create index on public.matches (status);
create index on public.predictions (match_id);
create index on public.predictions (member_id);
create index on public.team_phase_results (team_id, league_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.league_rules enable row level security;
alter table public.draft_assignments enable row level security;
alter table public.tournament_phases enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
alter table public.team_phase_results enable row level security;

-- Users: cada quien ve su propio perfil
create policy "users can view own profile"
  on public.users for select
  using (id = auth.uid());

create policy "users can update own profile"
  on public.users for update
  using (id = auth.uid());

-- Leagues: solo miembros ven la quiniela
create policy "members can view their leagues"
  on public.leagues for select
  using (
    id in (
      select league_id from public.league_members
      where user_id = auth.uid()
    )
  );

create policy "authenticated users can create leagues"
  on public.leagues for insert
  with check (auth.uid() = owner_id);

create policy "owner can update league"
  on public.leagues for update
  using (owner_id = auth.uid());

-- League members: miembros ven a los demás miembros de su quiniela
create policy "members can view league members"
  on public.league_members for select
  using (
    league_id in (
      select league_id from public.league_members
      where user_id = auth.uid()
    )
  );

-- Draft assignments: miembros ven todas las asignaciones de su quiniela
create policy "members can view draft assignments"
  on public.draft_assignments for select
  using (
    league_id in (
      select league_id from public.league_members
      where user_id = auth.uid()
    )
  );

-- Matches: miembros ven los partidos de su quiniela
create policy "members can view matches"
  on public.matches for select
  using (
    league_id in (
      select league_id from public.league_members
      where user_id = auth.uid()
    )
  );

-- Predictions: cada quien ve sus propias predicciones
-- y las de todos cuando el partido termina
create policy "members see own predictions or finished match predictions"
  on public.predictions for select
  using (
    member_id in (
      select id from public.league_members where user_id = auth.uid()
    )
    or
    match_id in (
      select id from public.matches where status = 'finished'
    )
  );

create policy "members can insert own predictions"
  on public.predictions for insert
  with check (
    member_id in (
      select id from public.league_members where user_id = auth.uid()
    )
  );

-- ============================================================
-- TRIGGER: crear perfil de usuario automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
