'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UpdateRecordsPanel } from '@/components/active-view/update-records-panel'

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
  onBracketGenerated: () => void
  onReturnToRegularSeason: () => void
}

export function SeedSetup({
  leagueId,
  allNflTeams,
  existingRecords,
  onBracketGenerated,
  onReturnToRegularSeason,
}: Props) {
  const [step, setStep] = useState<'records' | 'seeds'>('records')
  const [qualifiedTeams, setQualifiedTeams] = useState<NflTeam[]>([])
  const [seeds, setSeeds] = useState<Record<string, Record<number, string>>>({
    AFC: {},
    NFC: {},
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRecordsUpdated() {
    // Recargar los equipos clasificados desde Supabase
    const supabase = createClient()
    const { data } = await supabase
      .from('team_phase_results')
      .select('team_id, teams ( id, name, abbreviation, conference, division )')
      .eq('league_id', leagueId)
      .eq('advanced', true)

    if (data && data.length > 0) {
      const teams = data
        .map((r: any) => r.teams)
        .filter(Boolean)
        .filter((t: NflTeam, i: number, arr: NflTeam[]) =>
          arr.findIndex(x => x.id === t.id) === i
        )
      setQualifiedTeams(teams)
    }
  }

  function handleSeedChange(conference: string, seed: number, teamId: string) {
    setSeeds(prev => {
      const updated = { ...prev }
      for (const s of Object.keys(updated[conference])) {
        if (updated[conference][Number(s)] === teamId) {
          delete updated[conference][Number(s)]
        }
      }
      if (teamId) {
        updated[conference] = { ...updated[conference], [seed]: teamId }
      } else {
        delete updated[conference][seed]
      }
      return updated
    })
  }

  function isComplete() {
    return (
      Object.keys(seeds.AFC).length === 7 &&
      Object.keys(seeds.NFC).length === 7
    )
  }

  async function handleGenerateBracket() {
    if (!isComplete()) return
    setIsSaving(true)
    setError(null)
    const supabase = createClient()

    try {
      for (const conf of ['AFC', 'NFC']) {
        for (const [seed, teamId] of Object.entries(seeds[conf])) {
          const { error } = await supabase
            .from('playoff_seeds')
            .insert({
              league_id: leagueId,
              team_id: teamId,
              conference: conf,
              seed: Number(seed),
            })
          if (error) throw error
        }
      }

      const { error: bracketError } = await supabase
        .rpc('generate_playoff_bracket', { p_league_id: leagueId })
      if (bracketError) throw bracketError

      onBracketGenerated()
    } catch (err: any) {
      console.error('Error generando bracket:', err)
      setError(err.message ?? 'Ocurrió un error')
    } finally {
      setIsSaving(false)
    }
  }

  const afcQualified = qualifiedTeams.filter(t => t.conference === 'AFC')
  const nfcQualified = qualifiedTeams.filter(t => t.conference === 'NFC')
  const classifiedCount = qualifiedTeams.length

  return (
    <div className="flex flex-col gap-4">

      {/* Paso 1 — Gestionar clasificados */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-900">
              Paso 1 — Confirmar clasificados
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Marca los 14 equipos clasificados con PO antes de asignar seeds.
            </p>
          </div>
          {classifiedCount > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
              {classifiedCount} marcados
            </span>
          )}
        </div>

        <div className="p-4">
          <UpdateRecordsPanel
            leagueId={leagueId}
            allNflTeams={allNflTeams}
            existingRecords={existingRecords}
            onUpdated={handleRecordsUpdated}
            onReturnToRegularSeason={onReturnToRegularSeason}
          />
        </div>
      </div>

      {/* Paso 2 — Asignar seeds */}
      <div className={`bg-white border rounded-xl overflow-hidden transition-all ${
        classifiedCount < 14
          ? 'border-gray-100 opacity-50 pointer-events-none'
          : 'border-gray-200'
      }`}>
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">
            Paso 2 — Asignar seeds
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {classifiedCount < 14
              ? `Marca ${14 - classifiedCount} equipos más como PO para continuar`
              : 'Asigna la posición 1-7 a cada equipo clasificado'
            }
          </p>
        </div>

        <div className="p-4">
          {['AFC', 'NFC'].map(conf => {
            const teams = conf === 'AFC' ? afcQualified : nfcQualified
            return (
              <div key={conf} className="mb-6 last:mb-0">
                <div className={`
                  text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-3
                  ${conf === 'AFC' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}
                `}>
                  {conf}
                </div>

                <div className="flex flex-col gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(seed => (
                    <div key={seed} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6 text-center">
                        {seed}
                      </span>
                      <select
                        value={seeds[conf][seed] ?? ''}
                        onChange={e => handleSeedChange(conf, seed, e.target.value)}
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                      >
                        <option value="">— Seleccionar equipo —</option>
                        {teams.map(t => (
                          <option
                            key={t.id}
                            value={t.id}
                            disabled={
                              Object.values(seeds[conf]).includes(t.id) &&
                              seeds[conf][seed] !== t.id
                            }
                          >
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">
              {error}
            </p>
          )}

          <button
            onClick={handleGenerateBracket}
            disabled={!isComplete() || isSaving}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
          >
            {isSaving ? 'Generando bracket...' : '🏈 Generar bracket de playoffs'}
          </button>
        </div>
      </div>
    </div>
  )
}