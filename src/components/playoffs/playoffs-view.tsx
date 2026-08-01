'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlayoffMatch, TeamInfo, MemberInfo, MEMBER_COLORS } from '@/types/playoffs'
import { BracketView } from './bracket-view'
import { PlayoffsList } from './playoffs-list'
import { SeedSetup } from './seed-setup'

type StandingRow = {
    member_id: string
    display_name: string
    avatar_url: string | null
    is_alive: boolean
    team_id: string
    team_name: string
    team_abbreviation: string
    team_conference: string
    team_division: string
    clinched_playoff: boolean
}

type Props = {
    league: {
        id: string
        name: string
        sport: string
        season: string
        status: string
    }
    initialMatches: PlayoffMatch[]
    initialStandings: StandingRow[]
    isOrganizer: boolean
    hasSeedsConfigured: boolean
    allNflTeams: Array<{ id: string; name: string; abbreviation: string; conference: string; division: string }>
    existingRecords: ExistingRecord[]
}

export function PlayoffsView({
    league,
    initialMatches,
    initialStandings,
    isOrganizer,
    hasSeedsConfigured,
    allNflTeams,       // ← desestructurar
}: Props) {
    const [matches, setMatches] = useState<PlayoffMatch[]>(initialMatches)
    const [standings, setStandings] = useState<StandingRow[]>(initialStandings)
    const [seedsConfigured, setSeedsConfigured] = useState(hasSeedsConfigured)
    const [activeTab, setActiveTab] = useState<'bracket' | 'list'>('bracket')

    const refreshData = useCallback(async () => {
        const supabase = createClient()
        const [matchesRes, standingsRes] = await Promise.all([
            supabase
                .from('playoff_matches')
                .select('*')
                .eq('league_id', league.id)
                .order('created_at'),
            supabase.rpc('get_league_standings', { p_league_id: league.id }),
        ])
        if (matchesRes.data) setMatches(matchesRes.data as any)
        if (standingsRes.data) setStandings(standingsRes.data)
    }, [league.id])

    // Construir mapa de equipos
    const teams: Record<string, TeamInfo> = {}
    for (const row of standings) {
        teams[row.team_id] = {
            id: row.team_id,
            name: row.team_name,
            abbreviation: row.team_abbreviation,
            conference: row.team_conference,
            division: row.team_division,
        }
    }

    // Construir mapa de miembros con colores
    const memberMap = new Map<string, MemberInfo>()
    standings.forEach((row, _, arr) => {
        if (!memberMap.has(row.member_id)) {
            const index = Array.from(memberMap.keys()).length
            memberMap.set(row.member_id, {
                memberId: row.member_id,
                displayName: row.display_name,
                avatarUrl: row.avatar_url,
                isAlive: row.is_alive,
                color: MEMBER_COLORS[index % MEMBER_COLORS.length].dot,
            })
        }
    })
    const memberList = Array.from(memberMap.values())

    // Mapa equipo → miembro
    const memberByTeam: Record<string, MemberInfo> = {}
    for (const row of standings) {
        const member = memberMap.get(row.member_id)
        if (member) memberByTeam[row.team_id] = member
    }

    // Mapa miembro → equipos
    const memberTeams: Record<string, string[]> = {}
    for (const row of standings) {
        if (!memberTeams[row.member_id]) memberTeams[row.member_id] = []
        if (!memberTeams[row.member_id].includes(row.team_id)) {
            memberTeams[row.member_id].push(row.team_id)
        }
    }

    // Equipos clasificados
    const qualifiedTeams = standings
        .filter(s => s.clinched_playoff)
        .map(s => ({
            id: s.team_id,
            name: s.team_name,
            abbreviation: s.team_abbreviation,
            conference: s.team_conference,
        }))
        .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)

    const tabs = [
        { id: 'bracket', label: 'Bracket' },
        { id: 'list', label: 'Participantes' },
        ...(isOrganizer ? [{ id: 'manage', label: 'Gestionar' }] : []),
    ] as const

    {
        activeTab === 'manage' && isOrganizer && (
            <UpdateRecordsPanel
                leagueId={league.id}
                allNflTeams={allNflTeams}
                existingRecords={existingRecords}  // ← directo, no derivado de standings
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
        )
    }

    return (
        <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <span className="text-3xl">🏈</span>
                <div className="flex-1">
                    <h1 className="text-xl font-medium text-gray-900">{league.name}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{league.season}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-orange-50 text-orange-700 shrink-0">
                    Playoffs
                </span>
            </div>

            {/* Leyenda de colores */}
            <div className="flex flex-wrap gap-2 mb-4">
                {memberList.map((member, index) => {
                    const color = MEMBER_COLORS[index % MEMBER_COLORS.length]
                    return (
                        <div key={member.memberId} className={`
              flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium
              ${color.bg} ${color.text}
            `}>
                            <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                            {member.displayName}
                        </div>
                    )
                })}
            </div>

            {/* Setup de seeds — si no están configurados */}
            {!seedsConfigured && isOrganizer && (
                <div className="mb-4">
                    <SeedSetup
                        leagueId={league.id}
                        allNflTeams={allNflTeams}
                        existingRecords={standings
                            .map(s => ({
                                teamId: s.team_id,
                                wins: s.wins,
                                losses: s.losses,
                                ties: s.ties,
                                isEliminated: s.is_eliminated,
                                clinchedPlayoff: s.clinched_playoff,
                            }))
                            .filter((r, i, arr) => arr.findIndex(x => x.teamId === r.teamId) === i)
                        }
                        onBracketGenerated={() => {
                            setSeedsConfigured(true)
                            refreshData()
                        }}
                        onReturnToRegularSeason={async () => {
                            const supabase = createClient()
                            await supabase
                                .from('leagues')
                                .update({ status: 'active' })
                                .eq('id', league.id)
                            window.location.reload()
                        }}
                    />
                </div>
            )}

            {!seedsConfigured && !isOrganizer && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center mb-4">
                    <p className="text-sm text-yellow-700">
                        El organizador está configurando los seeds de playoffs...
                    </p>
                </div>
            )}

            {/* Tabs — solo cuando los seeds están configurados */}
            {seedsConfigured && (
                <>
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

                    {activeTab === 'bracket' && (
                        <BracketView
                            matches={matches}
                            teams={teams}
                            memberByTeam={memberByTeam}
                            isOrganizer={isOrganizer}
                            onUpdated={refreshData}
                        />
                    )}

                    {activeTab === 'list' && (
                        <PlayoffsList
                            members={memberList}
                            memberTeams={memberTeams}
                            teams={teams}
                            matches={matches}
                        />
                    )}
                </>
            )}
        </div>
    )
}