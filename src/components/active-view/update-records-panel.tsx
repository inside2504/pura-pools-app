'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NflTeam = {
  id: string
  name: string
  abbreviation: string
  conference: string
  division: string
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
  leagueId: string
  allNflTeams: NflTeam[]
  existingRecords: ExistingRecord[]
  onUpdated: () => void
  onPlayoffsStarted?: () => void
  onReturnToRegularSeason?: () => void
}

export function UpdateRecordsPanel({
  leagueId,
  allNflTeams,
  existingRecords,
  onUpdated,
  onPlayoffsStarted,
  onReturnToRegularSeason,
}: Props) {
  const [records, setRecords] = useState<Record<string, {
    wins: number
    losses: number
    ties: number
    eliminated: boolean
    clinched: boolean
  }>>(
    Object.fromEntries(
      allNflTeams.map(t => {
        const existing = existingRecords.find(r => r.teamId === t.id)
        return [t.id, {
          wins: existing?.wins ?? 0,
          losses: existing?.losses ?? 0,
          ties: existing?.ties ?? 0,
          eliminated: existing?.isEliminated ?? false,
          clinched: existing?.clinchedPlayoff ?? false,
        }]
      })
    )
  )
  const [isSaving, setIsSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  function handleChange(teamId: string, field: 'wins' | 'losses' | 'ties', value: string) {
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

  // Agrupar por conferencia y división
  const grouped: Record<string, Record<string, NflTeam[]>> = {}
  for (const team of allNflTeams) {
    if (!grouped[team.conference]) grouped[team.conference] = {}
    if (!grouped[team.conference][team.division]) grouped[team.conference][team.division] = []
    grouped[team.conference][team.division].push(team)
  }

  const classifiedCount = Object.values(records).filter(r => r.clinched).length

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-gray-900">
            Actualizar resultados
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {classifiedCount} equipos clasificados a playoffs
          </p>
        </div>
        {savedAt && (
          <span className="text-xs text-emerald-600">
            ✓ Guardado a las {savedAt}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-6">
        {['AFC', 'NFC'].map(conf => (
          <div key={conf}>
            {/* Header de conferencia */}
            <div className={`
              text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-4
              ${conf === 'AFC' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
            `}>
              {conf}
            </div>

            <div className="flex flex-col gap-4">
              {Object.entries(grouped[conf] ?? {})
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([division, teams]) => (
                  <div key={division}>
                    {/* Header de división */}
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2 pb-1 border-b border-gray-100">
                      División {division}
                    </div>

                    <div className="flex flex-col gap-2">
                      {teams.map(team => {
                        const rec = records[team.id]
                        return (
                          <div
                            key={team.id}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg transition-colors
                              ${rec?.eliminated ? 'bg-red-50' : rec?.clinched ? 'bg-emerald-50' : 'bg-gray-50'}
                            `}
                          >
                            {/* Nombre */}
                            <span className={`
                              text-sm flex-1 truncate
                              ${rec?.eliminated
                                ? 'text-red-400 line-through'
                                : rec?.clinched
                                ? 'text-emerald-700 font-medium'
                                : 'text-gray-900'
                              }
                            `}>
                              {team.name}
                            </span>

                            {/* Controles W-L-T */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {(['wins', 'losses', 'ties'] as const).map(field => (
                                <div key={field} className="flex flex-col items-center gap-0.5">
                                  <span className="text-xs text-gray-400 uppercase">
                                    {field === 'wins' ? 'W' : field === 'losses' ? 'L' : 'T'}
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="17"
                                    value={rec?.[field] ?? 0}
                                    onChange={e => handleChange(team.id, field, e.target.value)}
                                    className="w-9 text-center text-sm border border-gray-200 rounded-md py-1 outline-none focus:border-blue-500 bg-white"
                                  />
                                </div>
                              ))}

                              {/* Elim toggle */}
                              <button
                                onClick={() => handleToggle(team.id, 'eliminated')}
                                title="Marcar como eliminado"
                                className={`
                                  text-xs px-2 py-1 rounded-lg border font-medium transition-all mt-3
                                  ${rec?.eliminated
                                    ? 'bg-red-100 border-red-300 text-red-600'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-red-300'
                                  }
                                `}
                              >
                                ✕
                              </button>

                              {/* PO toggle */}
                              <button
                                onClick={() => handleToggle(team.id, 'clinched')}
                                title="Clasificado a playoffs"
                                className={`
                                  text-xs px-2 py-1 rounded-lg border font-medium transition-all mt-3
                                  ${rec?.clinched
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300'
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
            </div>
          </div>
        ))}

        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar resultados'}
        </button>

        {/* Iniciar playoffs */}
        {onPlayoffsStarted && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 mb-2">
              Asegúrate de haber marcado los {classifiedCount > 0
                ? `${classifiedCount} equipos`
                : '14 equipos'} clasificados con PO antes de continuar.
            </p>
            <button
              onClick={onPlayoffsStarted}
              disabled={classifiedCount < 14}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              {classifiedCount < 14
                ? `🏈 Iniciar playoffs (faltan ${14 - classifiedCount} por clasificar)`
                : '🏈 Iniciar playoffs'
              }
            </button>
          </div>
        )}

        {/* Regresar a temporada regular */}
        {onReturnToRegularSeason && (
          <div className="pt-2">
            <button
              onClick={onReturnToRegularSeason}
              className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium text-sm py-2.5 rounded-lg transition-colors"
            >
              ← Regresar a temporada regular
            </button>
          </div>
        )}
      </div>
    </div>
  )
}