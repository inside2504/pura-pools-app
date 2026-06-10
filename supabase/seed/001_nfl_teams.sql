-- ============================================================
-- Seed 001 — Equipos NFL
-- Ejecutar después de la migración 001
-- ============================================================

insert into public.teams (name, abbreviation, conference, division, sport) values
  -- AFC Este
  ('Buffalo Bills',           'BUF', 'AFC', 'Este',  'nfl'),
  ('Miami Dolphins',          'MIA', 'AFC', 'Este',  'nfl'),
  ('New England Patriots',    'NE',  'AFC', 'Este',  'nfl'),
  ('New York Jets',           'NYJ', 'AFC', 'Este',  'nfl'),
  -- AFC Norte
  ('Baltimore Ravens',        'BAL', 'AFC', 'Norte', 'nfl'),
  ('Cincinnati Bengals',      'CIN', 'AFC', 'Norte', 'nfl'),
  ('Cleveland Browns',        'CLE', 'AFC', 'Norte', 'nfl'),
  ('Pittsburgh Steelers',     'PIT', 'AFC', 'Norte', 'nfl'),
  -- AFC Sur
  ('Houston Texans',          'HOU', 'AFC', 'Sur',   'nfl'),
  ('Indianapolis Colts',      'IND', 'AFC', 'Sur',   'nfl'),
  ('Jacksonville Jaguars',    'JAX', 'AFC', 'Sur',   'nfl'),
  ('Tennessee Titans',        'TEN', 'AFC', 'Sur',   'nfl'),
  -- AFC Oeste
  ('Denver Broncos',          'DEN', 'AFC', 'Oeste', 'nfl'),
  ('Kansas City Chiefs',      'KC',  'AFC', 'Oeste', 'nfl'),
  ('Las Vegas Raiders',       'LV',  'AFC', 'Oeste', 'nfl'),
  ('Los Angeles Chargers',    'LAC', 'AFC', 'Oeste', 'nfl'),
  -- NFC Este
  ('Dallas Cowboys',          'DAL', 'NFC', 'Este',  'nfl'),
  ('New York Giants',         'NYG', 'NFC', 'Este',  'nfl'),
  ('Philadelphia Eagles',     'PHI', 'NFC', 'Este',  'nfl'),
  ('Washington Commanders',   'WSH', 'NFC', 'Este',  'nfl'),
  -- NFC Norte
  ('Chicago Bears',           'CHI', 'NFC', 'Norte', 'nfl'),
  ('Detroit Lions',           'DET', 'NFC', 'Norte', 'nfl'),
  ('Green Bay Packers',       'GB',  'NFC', 'Norte', 'nfl'),
  ('Minnesota Vikings',       'MIN', 'NFC', 'Norte', 'nfl'),
  -- NFC Sur
  ('Atlanta Falcons',         'ATL', 'NFC', 'Sur',   'nfl'),
  ('Carolina Panthers',       'CAR', 'NFC', 'Sur',   'nfl'),
  ('New Orleans Saints',      'NO',  'NFC', 'Sur',   'nfl'),
  ('Tampa Bay Buccaneers',    'TB',  'NFC', 'Sur',   'nfl'),
  -- NFC Oeste
  ('Arizona Cardinals',       'ARI', 'NFC', 'Oeste', 'nfl'),
  ('Los Angeles Rams',        'LAR', 'NFC', 'Oeste', 'nfl'),
  ('San Francisco 49ers',     'SF',  'NFC', 'Oeste', 'nfl'),
  ('Seattle Seahawks',        'SEA', 'NFC', 'Oeste', 'nfl');

-- ============================================================
-- Plantilla predefinida: Quiniela NFL (draft_pool)
-- Nota: reemplaza el UUID del created_by con tu user ID de admin
-- ============================================================
insert into public.league_templates (name, sport, format_type, is_public, default_settings)
values (
  'Quiniela NFL — Clásica',
  'nfl',
  'draft_pool',
  true,
  '{
    "draft_rounds": 4,
    "teams_per_conference": 2,
    "conferences": ["AFC", "NFC"],
    "round_conference_map": {
      "1": "AFC",
      "2": "NFC",
      "3": "AFC",
      "4": "NFC"
    },
    "playoff_phases": [
      "Wild Card",
      "Divisional",
      "Conference Championship",
      "Super Bowl"
    ],
    "max_members": 16,
    "min_members": 4
  }'
);
