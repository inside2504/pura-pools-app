export type PlayoffRound = 'wildcard' | 'divisional' | 'conference' | 'superbowl'

export const ROUND_LABELS: Record<PlayoffRound, string> = {
  wildcard: 'Wild Card',
  divisional: 'Divisional',
  conference: 'Conference Championship',
  superbowl: 'Super Bowl',
}

export const ROUND_ORDER: PlayoffRound[] = [
  'wildcard',
  'divisional', 
  'conference',
  'superbowl',
]

export type PlayoffMatch = {
  id: string
  league_id: string
  round: PlayoffRound
  conference: string
  home_team_id: string | null
  away_team_id: string | null
  winner_id: string | null
  home_score: number | null
  away_score: number | null
  seed_home: number | null
  seed_away: number | null
  status: 'scheduled' | 'finished'
}

export type PlayoffSeed = {
  id: string
  league_id: string
  team_id: string
  conference: string
  seed: number
}

export type TeamInfo = {
  id: string
  name: string
  abbreviation: string
  conference: string
  division: string
}

export type MemberInfo = {
  memberId: string
  displayName: string
  avatarUrl: string | null
  isAlive: boolean
  color: string
}

// Colores asignados a cada participante
export const MEMBER_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-500' },
  { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-300', dot: 'bg-violet-500' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300', dot: 'bg-rose-500' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300', dot: 'bg-cyan-500' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', dot: 'bg-orange-500' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300', dot: 'bg-pink-500' },
]