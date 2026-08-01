'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StandingsTable } from './standings-table'
import { TeamCard } from './team-card'
import { UpdateRecordsPanel } from './update-records-panel'
import { Avatar } from '@/components/ui/avatar'

type StandingRow = {
  member_id: string
  display_name: string
  avatar_url: string | null
  is_alive: boolean
  total_wins: number
  team_id: string
  team_name: string
  team_abbreviation: string
  team_conference: string
  team_division: string
  round_number: number
  wins: number
  losses: number
  ties: number
  is_eliminated: boolean
  clinched_playoff: boolean
}

type League = {
  id: string
  name: string
  sport: string
  season: string
  status: string
}

type ExistingRecord = {
  teamId: string
  wins: number
  losses: number
  ties: number
  isEliminated: boolean
  clinchedPlayoff: boolean
}

type Props = {
  league: League
  initialStandings: StandingRow[]
  isOrganizer: boolean
  currentUserId: string
  allNflTeams: Array<{  // ← nuevo
    id: string
    name: string
    abbreviation: string
    conference: string
    division: string
  }>
  existingRecords: ExistingRecord[]
}

export function ActiveView({
  league,
  initialStandings,
  isOrganizer,
  currentUserId,
  allNflTeams,
  existingRecords,
}: Props) {
  const [standings, setStandings] = useState<StandingRow[]>(initialStandings)
  const [activeTab, setActiveTab] = useState<'standings' | 'teams' | 'update'>('standings')

  const refreshStandings = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.rpc('get_league_standings', {
      p_league_id: league.id,
    })
    if (data) setStandings(data)
  }, [league.id])

  // Agrupar por miembro para la vista de equipos
  const memberMap = new Map<string, {
    memberId: string
    displayName: string
    avatarUrl: string | null
    isAlive: boolean
    totalWins: number
    teams: StandingRow[]
  }>()

  for (const row of standings) {
    if (!memberMap.has(row.member_id)) {
      memberMap.set(row.member_id, {
        memberId: row.member_id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        isAlive: row.is_alive,
        totalWins: row.total_wins,
        teams: [],
      })
    }
    memberMap.get(row.member_id)!.teams.push(row)
  }

  const memberList = Array.from(memberMap.values()).sort(
    (a, b) => b.totalWins - a.totalWins
  )

  // Para el panel de actualización — equipos únicos
  const uniqueTeams = Array.from(
    new Map(standings.map(s => [s.team_id, {
      teamId: s.team_id,
      teamName: s.team_name,
      teamAbbreviation: s.team_abbreviation,
      conference: s.team_conference,
      wins: s.wins,
      losses: s.losses,
      ties: s.ties,
      isEliminated: s.is_eliminated,
      clinchedPlayoff: s.clinched_playoff,
    }])).values()
  ).sort((a, b) => {
    if (a.conference !== b.conference) return a.conference.localeCompare(b.conference)
    return a.teamName.localeCompare(b.teamName)
  })

  // Standings para la tabla
  const standingRows = memberList.map(m => ({
    memberId: m.memberId,
    displayName: m.displayName,
    avatarUrl: m.avatarUrl,
    isAlive: m.isAlive,
    totalWins: m.totalWins,
    teamCount: m.teams.length,
    aliveTeams: m.teams.filter(t => !t.is_eliminated).length,
  }))

  const tabs = [
    { id: 'standings', label: 'Posiciones' },
    { id: 'teams', label: 'Equipos' },
    ...(isOrganizer ? [{ id: 'update', label: 'Actualizar' }] : []),
  ] as const

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="text-3xl">
          {league.sport === 'nfl' ? '🏈' : '⚽'}
        </span>
        <div className="flex-1">
          <h1 className="text-xl font-medium text-gray-900">{league.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{league.season}</p>
        </div>
        <span className={`
          text-xs px-2.5 py-1 rounded-full font-medium shrink-0
          ${league.status === 'active'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-orange-50 text-orange-700'
          }
        `}>
          {league.status === 'active' ? 'En curso' : 'Playoffs'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 text-sm font-medium py-1.5 rounded-md transition-all
              ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Posiciones */}
      {activeTab === 'standings' && (
        <StandingsTable standings={standingRows} />
      )}

      {/* Tab: Equipos */}
      {activeTab === 'teams' && (
        <div className="flex flex-col gap-4">
          {memberList.map(member => (
            <div key={member.memberId} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar
                  name={member.displayName}
                  imageUrl={member.avatarUrl}
                  size="sm"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {member.displayName}
                  </span>
                  <span className="text-xs text-gray-400 block">
                    {member.totalWins} wins acumulados
                  </span>
                </div>
                {!member.isAlive && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                    Eliminado
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {member.teams
                  .sort((a, b) => a.round_number - b.round_number)
                  .map(team => (
                    <TeamCard
                      key={team.team_id}
                      name={team.team_name}
                      abbreviation={team.team_abbreviation}
                      conference={team.team_conference}
                      division={team.team_division}
                      wins={team.wins}
                      losses={team.losses}
                      ties={team.ties}
                      isEliminated={team.is_eliminated}
                      clinchedPlayoff={team.clinched_playoff}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Actualizar — solo organizador */}
      {activeTab === 'update' && isOrganizer && (
        <>
          {console.log('existingRecords:', existingRecords)}
          <UpdateRecordsPanel
            leagueId={league.id}
            allNflTeams={allNflTeams}
            existingRecords={existingRecords}
            onUpdated={refreshStandings}
            onPlayoffsStarted={async () => {
              const supabase = createClient()
              await supabase
                .from('leagues')
                .update({ status: 'playoffs' })
                .eq('id', league.id)
              window.location.reload()
            }}
          />
        </>
      )}
    </div>
  )
}