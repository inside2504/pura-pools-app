'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlayoffMatch, TeamInfo, MemberInfo, MEMBER_COLORS } from '@/types/playoffs'

type Props = {
  match: PlayoffMatch
  teams: Record<string, TeamInfo>
  memberByTeam: Record<string, MemberInfo>
  isOrganizer: boolean
  onUpdated: () => void
}

export function MatchCard({
  match,
  teams,
  memberByTeam,
  isOrganizer,
  onUpdated,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [winnerId, setWinnerId] = useState<string | null>(match.winner_id)
  const [homeScore, setHomeScore] = useState<string>(match.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState<string>(match.away_score?.toString() ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const homeTeam = match.home_team_id ? teams[match.home_team_id] : null
  const awayTeam = match.away_team_id ? teams[match.away_team_id] : null
  const homeMember = match.home_team_id ? memberByTeam[match.home_team_id] : null
  const awayMember = match.away_team_id ? memberByTeam[match.away_team_id] : null

  function getMemberColor(member: MemberInfo | null) {
    if (!member) return null
    const index = parseInt(member.memberId.slice(-1), 16) % MEMBER_COLORS.length
    return MEMBER_COLORS[index]
  }

  const homeColor = getMemberColor(homeMember)
  const awayColor = getMemberColor(awayMember)

  async function handleSave() {
    if (!winnerId) return
    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.rpc('set_playoff_winner', {
        p_match_id: match.id,
        p_winner_id: winnerId,
        p_home_score: homeScore ? parseInt(homeScore) : null,
        p_away_score: awayScore ? parseInt(awayScore) : null,
      })
      if (error) throw error
      setIsEditing(false)
      onUpdated()
    } catch (err) {
      console.error('Error guardando resultado:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Partido TBD — equipos no definidos aún
  if (!homeTeam || !awayTeam) {
    return (
      <div className="border border-dashed border-gray-200 rounded-xl p-3 text-center">
        <p className="text-xs text-gray-300">Por definir</p>
      </div>
    )
  }

  return (
    <div className={`
      border rounded-xl overflow-hidden
      ${match.status === 'finished' ? 'border-gray-200' : 'border-blue-200'}
    `}>
      {/* Home team */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all
          ${isEditing && winnerId === match.home_team_id ? 'ring-2 ring-inset ring-blue-500' : ''}
          ${match.winner_id === match.home_team_id ? 'bg-emerald-50' : ''}
          ${match.winner_id && match.winner_id !== match.home_team_id ? 'opacity-40' : ''}
          ${homeColor ? `${homeColor.bg}` : 'bg-white'}
        `}
        onClick={() => {
          if (!isOrganizer || match.status === 'finished') return
          setIsEditing(true)
          setWinnerId(match.home_team_id)
        }}
      >
        <span className="text-xs font-medium text-gray-500 w-4">{match.seed_home}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium truncate block ${
            homeColor ? homeColor.text : 'text-gray-900'
          }`}>
            {homeTeam.name}
          </span>
          {homeMember && (
            <span className="text-xs text-gray-400">{homeMember.displayName}</span>
          )}
        </div>
        {match.home_score !== null && (
          <span className="text-sm font-medium text-gray-900">{match.home_score}</span>
        )}
        {match.winner_id === match.home_team_id && (
          <span className="text-emerald-600 text-sm">✓</span>
        )}
      </div>

      <div className="h-px bg-gray-100" />

      {/* Away team */}
      <div
        className={`
          flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-all
          ${isEditing && winnerId === match.away_team_id ? 'ring-2 ring-inset ring-blue-500' : ''}
          ${match.winner_id === match.away_team_id ? 'bg-emerald-50' : ''}
          ${match.winner_id && match.winner_id !== match.away_team_id ? 'opacity-40' : ''}
          ${awayColor ? `${awayColor.bg}` : 'bg-white'}
        `}
        onClick={() => {
          if (!isOrganizer || match.status === 'finished') return
          setIsEditing(true)
          setWinnerId(match.away_team_id)
        }}
      >
        <span className="text-xs font-medium text-gray-500 w-4">{match.seed_away}</span>
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium truncate block ${
            awayColor ? awayColor.text : 'text-gray-900'
          }`}>
            {awayTeam.name}
          </span>
          {awayMember && (
            <span className="text-xs text-gray-400">{awayMember.displayName}</span>
          )}
        </div>
        {match.away_score !== null && (
          <span className="text-sm font-medium text-gray-900">{match.away_score}</span>
        )}
        {match.winner_id === match.away_team_id && (
          <span className="text-emerald-600 text-sm">✓</span>
        )}
      </div>

      {/* Panel de edición */}
      {isEditing && isOrganizer && (
        <div className="border-t border-gray-100 bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-2">
            Marcador opcional
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1 truncate">{homeTeam.abbreviation}</p>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={e => setHomeScore(e.target.value)}
                placeholder="—"
                className="w-full text-center text-sm border border-gray-200 rounded-lg py-1.5 outline-none focus:border-blue-500"
              />
            </div>
            <span className="text-gray-300 text-sm">vs</span>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-1 truncate">{awayTeam.abbreviation}</p>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={e => setAwayScore(e.target.value)}
                placeholder="—"
                className="w-full text-center text-sm border border-gray-200 rounded-lg py-1.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setIsEditing(false); setWinnerId(match.winner_id) }}
              className="flex-1 text-sm text-gray-500 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!winnerId || isSaving}
              className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium rounded-lg py-1.5 transition-colors"
            >
              {isSaving ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}