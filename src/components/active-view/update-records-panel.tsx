'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Team = {
  teamId: string
  teamName: string
  teamAbbreviation: string
  conference: string
  wins: number
  losses: number
  ties: number
  isEliminated: boolean
  clinchedPlayoff: boolean
}

type Props = {
  leagueId: string
  teams: Team[]
  onUpdated: () => void
}

export function UpdateRecordsPanel({ leagueId, teams, onUpdated }: Props) {
  const [records, setRecords] = useState<Record<string, {
    wins: number
    losses: number
    ties: number
    eliminated: boolean
    clinched: boolean
  }>>(
    Object.fromEntries(teams.map(t => [t.teamId, {
      wins: t.wins,
      losses: t.losses,
      ties: t.ties,
      eliminated: t.isEliminated,
      clinched: t.clinchedPlayoff,
    }]))
  )
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  function handleChange(
    teamId: string,
    field: 'wins' | 'losses' | 'ties',
    value: string
  ) {
    const num = Math.max(0, parseInt(value) || 0)
    setRecords(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], [field]: num }
    }))
  }

  function handleToggle(teamId: string, field: 'eliminated' | 'clinched') {
    setRecords(prev => ({
      ...prev,
      [teamId]: { ...prev[teamId], [field]: !prev[teamId][field] }
    }))
  }

  async function handleSave() {
    setIsSaving(true)
    const supabase = createClient()

    try {
      for (const [teamId, record] of Object.entries(records)) {
        const { error } = await supabase.rpc('update_team_record', {
          p_league_id: leagueId,
          p_team_id: teamId,
          p_wins: record.wins,
          p_losses: record.losses,
          p_ties: record.ties,
          p_eliminated: record.eliminated,
          p_clinched: record.clinched,
        })
        if (error) throw error
      }
      setSavedAt(new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      }))
      onUpdated()
    } catch (err) {
      console.error('Error guardando records:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Agrupar por conferencia
  const afc = teams.filter(t => t.conference === 'AFC')
  const nfc = teams.filter(t => t.conference === 'NFC')

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900">
          Actualizar resultados
        </h2>
        {savedAt && (
          <span className="text-xs text-emerald-600">
            ✓ Guardado a las {savedAt}
          </span>
        )}
      </div>

      <div className="p-4">
        {[
          { label: 'AFC', list: afc },
          { label: 'NFC', list: nfc },
        ].map(({ label, list }) => (
          <div key={label} className="mb-6 last:mb-0">
            <div className={`
              text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-3
              ${label === 'AFC' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
            `}>
              {label}
            </div>

            <div className="flex flex-col gap-2">
              {list.map(team => {
                const rec = records[team.teamId]
                return (
                  <div
                    key={team.teamId}
                    className="grid grid-cols-[1fr_auto] gap-3 items-center"
                  >
                    {/* Nombre del equipo */}
                    <span className={`text-sm truncate ${
                      rec?.eliminated ? 'text-red-400 line-through' : 'text-gray-900'
                    }`}>
                      {team.teamName}
                    </span>

                    {/* Controles */}
                    <div className="flex items-center gap-2">
                      {/* W */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-gray-400">W</span>
                        <input
                          type="number"
                          min="0"
                          max="17"
                          value={rec?.wins ?? 0}
                          onChange={e => handleChange(team.teamId, 'wins', e.target.value)}
                          className="w-10 text-center text-sm border border-gray-200 rounded-lg py-1 outline-none focus:border-blue-500"
                        />
                      </div>
                      {/* L */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-gray-400">L</span>
                        <input
                          type="number"
                          min="0"
                          max="17"
                          value={rec?.losses ?? 0}
                          onChange={e => handleChange(team.teamId, 'losses', e.target.value)}
                          className="w-10 text-center text-sm border border-gray-200 rounded-lg py-1 outline-none focus:border-blue-500"
                        />
                      </div>
                      {/* T */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-gray-400">T</span>
                        <input
                          type="number"
                          min="0"
                          max="17"
                          value={rec?.ties ?? 0}
                          onChange={e => handleChange(team.teamId, 'ties', e.target.value)}
                          className="w-10 text-center text-sm border border-gray-200 rounded-lg py-1 outline-none focus:border-blue-500"
                        />
                      </div>
                      {/* Eliminado toggle */}
                      <button
                        onClick={() => handleToggle(team.teamId, 'eliminated')}
                        className={`
                          text-xs px-2 py-1 rounded-lg border font-medium transition-all
                          ${rec?.eliminated
                            ? 'bg-red-50 border-red-200 text-red-600'
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-red-200'
                          }
                        `}
                      >
                        {rec?.eliminated ? 'Elim.' : 'Elim.'}
                      </button>
                      {/* Playoffs toggle */}
                      <button
                        onClick={() => handleToggle(team.teamId, 'clinched')}
                        className={`
                          text-xs px-2 py-1 rounded-lg border font-medium transition-all
                          ${rec?.clinched
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-emerald-200'
                          }
                        `}
                      >
                        PO
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar resultados'}
        </button>
      </div>
    </div>
  )
}