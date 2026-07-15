'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DraftTicker } from './draft-ticker'
import { DraftTable } from './draft-table'

type League = {
  id: string
  name: string
  sport: string
  season: string
  status: string
  draft_mode: string | null
  owner_id: string
}

type Member = {
  id: string
  user_id: string
  display_name: string
  role: string
  draft_position?: number | null
}

type Assignment = {
  id: string
  member_id: string
  round_number: number
  teams: {
    id: string
    name: string
    abbreviation: string
    conference: string
  } | null
}

type Props = {
  league: League
  members: Member[]
  currentUserId: string
  isOrganizer: boolean
  initialAssignments: Assignment[]
}

type DraftStage = 'waiting' | 'order_reveal' | 'order_done' | 'team_idle' | 'team_revealing' | 'done'

export function DraftScreen({
  league,
  members: initialMembers,
  currentUserId,
  isOrganizer,
  initialAssignments,
}: Props) {
  const router = useRouter()
  const isManual = league.draft_mode === 'manual'
  const totalAssignments = initialMembers.length * 4

  const orderAlreadySet = initialMembers.some(m => m.draft_position != null)
  const assignmentsAlreadyStarted = initialAssignments.length > 0

  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [isLoading, setIsLoading] = useState(false)

  const [stage, setStage] = useState<DraftStage>(() => {
    if (assignmentsAlreadyStarted && initialAssignments.length >= totalAssignments) return 'done'
    if (assignmentsAlreadyStarted) return 'team_idle'
    if (orderAlreadySet) return 'order_done'
    return 'waiting'
  })

  // Cuántas posiciones del orden se han revelado visualmente
  const [orderRevealedCount, setOrderRevealedCount] = useState(
    orderAlreadySet ? members.length : 0
  )

  // Última asignación revelada (para la animación de "seleccionando equipo")
  const [lastPick, setLastPick] = useState<{
    memberName: string
    teamName: string
    conference: string
  } | null>(null)

  const sortedByPosition = [...members].sort(
    (a, b) => (a.draft_position ?? 99) - (b.draft_position ?? 99)
  )

  const tickerItems = assignments
    .filter(a => a.teams !== null)
    .map((a, i, arr) => {
      const member = members.find(m => m.id === a.member_id)
      return {
        teamName: a.teams!.name,
        conference: a.teams!.conference,
        ownerName: member?.display_name ?? '—',
        isNew: i === arr.length - 1,
      }
    })

  // ============================================================
  // Realtime — escuchar cambios
  // ============================================================
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`draft-${league.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draft_assignments',
          filter: `league_id=eq.${league.id}`,
        },
        () => {
          supabase
            .from('draft_assignments')
            .select('id, round_number, member_id, teams ( id, name, abbreviation, conference )')
            .eq('league_id', league.id)
            .order('assigned_at', { ascending: true })
            .then(({ data }) => {
              if (data) setAssignments(data as any)
            })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'league_members',
          filter: `league_id=eq.${league.id}`,
        },
        () => {
          supabase
            .rpc('get_league_members', { p_league_id: league.id })
            .then(({ data }) => {
              if (data) {
                setMembers(data.map((m: any) => ({
                  id: m.id,
                  user_id: m.user_id,
                  display_name: m.display_name,
                  role: m.role,
                  draft_position: m.draft_position,
                })))
              }
            })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [league.id])

  // ============================================================
  // FASE A — Sortear el orden de selección
  // ============================================================
  async function handleStartOrderDraw() {
    setIsLoading(true)
    setStage('order_reveal')

    const supabase = createClient()
    try {
      const { error } = await supabase.rpc('run_draft_order', {
        p_league_id: league.id,
      })
      if (error) throw error

      // Recargar miembros con su posición
      const { data } = await supabase.rpc('get_league_members', { p_league_id: league.id })
      if (data) {
        setMembers(data.map((m: any) => ({
          id: m.id,
          user_id: m.user_id,
          display_name: m.display_name,
          role: m.role,
          draft_position: m.draft_position,
        })))
      }
    } catch (err) {
      console.error('Error sorteando orden:', err)
      setStage('waiting')
    } finally {
      setIsLoading(false)
    }
  }

  // Revelar posiciones del orden una por una (manual) o automático
  function handleRevealNextPosition() {
    if (orderRevealedCount < members.length) {
      const newCount = orderRevealedCount + 1
      setOrderRevealedCount(newCount)
      if (newCount === members.length) {
        setStage('order_done')
      }
    }
  }

  useEffect(() => {
    if (stage !== 'order_reveal' || isManual) return
    if (orderRevealedCount >= members.length) {
      setStage('order_done')
      return
    }
    const timer = setTimeout(() => {
      setOrderRevealedCount(prev => prev + 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [stage, orderRevealedCount, members.length, isManual])

  // ============================================================
  // FASE B — Revelar equipos uno por uno con animación
  // ============================================================
  async function handleRevealNextTeam() {
  setIsLoading(true)
  setStage('team_revealing')

  const supabase = createClient()
  try {
    // Animación de "seleccionando equipo" — 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000))

    const { data, error } = await supabase.rpc('run_next_draft_pick', {
      p_league_id: league.id,
    })
    if (error) throw error

    const result = data?.[0]
    if (result) {
      setLastPick({
        memberName: result.member_display_name,
        teamName: result.team_name,
        conference: result.team_conference,
      })

      // Actualizar assignments localmente de inmediato — no esperar al realtime
      const newAssignment: Assignment = {
        id: crypto.randomUUID(), // temporal, el realtime lo reemplazará con el real
        member_id: result.member_id,
        round_number: result.round_number,
        teams: {
          id: result.team_id,
          name: result.team_name,
          abbreviation: result.team_abbreviation,
          conference: result.team_conference,
        },
      }

      setAssignments(prev => {
        const updated = [...prev, newAssignment]

        // Decidir el siguiente stage usando el array recién calculado,
        // no el estado viejo de React
        if (updated.length >= totalAssignments) {
          setStage('done')
        } else {
          setStage('team_idle')
        }

        return updated
      })
    } else {
      setStage('team_idle')
    }
  } catch (err: any) {
    console.error('Error revelando equipo:', err)
    if (err?.message === 'El sorteo ya fue completado') {
      setStage('done')
    } else {
      setStage('team_idle')
    }
  } finally {
    setIsLoading(false)
  }
}

  // Auto-avanzar en modo automático durante team_idle
  useEffect(() => {
    if (stage !== 'team_idle' || isManual) return
    const timer = setTimeout(() => {
      handleRevealNextTeam()
    }, 1500)
    return () => clearTimeout(timer)
  }, [stage, isManual])

  function handleGoToLeague() {
    router.push(`/leagues/${league.id}`)
    router.refresh()
  }

  const currentRound = Math.floor(assignments.length / members.length) + 1
  const currentPositionInRound = (assignments.length % members.length) + 1
  const currentPickMember = sortedByPosition.find(
    m => m.draft_position === currentPositionInRound
  )

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900">{league.name}</h1>
          <p className="text-sm text-gray-400">{league.season} · Sorteo de equipos</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
          stage === 'done'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {stage === 'done' ? '✓ Sorteo completado' : 'Sorteo en curso'}
        </span>
      </div>

      {/* ============================================================ */}
      {/* FASE A — Orden de selección */}
      {/* ============================================================ */}

      {stage === 'waiting' && (
        <>
          {isOrganizer ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-500 mb-3">
                Primero sorteamos el orden en que cada quien va a elegir equipo.
              </p>
              <button
                onClick={handleStartOrderDraw}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-sm py-3 rounded-lg transition-colors"
              >
                🎲 Sortear orden de selección
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-4">
              <span className="text-2xl">⏳</span>
              <p className="text-sm text-gray-500 mt-2">
                Esperando a que el organizador inicie el sorteo del orden.
              </p>
            </div>
          )}
        </>
      )}

      {(stage === 'order_reveal' || stage === 'order_done') && (
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">
            Orden de selección
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {sortedByPosition.map((member, i) => {
              const isRevealed = i < orderRevealedCount
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-4 py-3 transition-all ${
                    isRevealed ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-medium flex items-center justify-center shrink-0">
                    {isRevealed ? member.draft_position : '?'}
                  </span>
                  <span className="text-sm text-gray-900">
                    {isRevealed ? member.display_name : '???'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Botón revelar siguiente posición — modo manual */}
          {isOrganizer && stage === 'order_reveal' && isManual && orderRevealedCount < members.length && (
            <button
              onClick={handleRevealNextPosition}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3 rounded-lg transition-colors"
            >
              Revelar posición {orderRevealedCount + 1}
            </button>
          )}

          {/* Continuar a la fase de equipos */}
          {isOrganizer && stage === 'order_done' && (
            <button
              onClick={() => setStage('team_idle')}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-3 rounded-lg transition-colors"
            >
              Continuar con el sorteo de equipos →
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* FASE B — Asignación de equipos */}
      {/* ============================================================ */}

      {(stage === 'team_idle' || stage === 'team_revealing' || stage === 'done') && (
        <>
          {/* Cintillo */}
          {tickerItems.length > 0 && (
            <DraftTicker items={tickerItems} />
          )}

          {/* Animación de selección en curso */}
          {stage === 'team_revealing' && (
            <div className="bg-blue-900 rounded-xl p-10 text-center mb-4">
              <div className="text-4xl mb-3 animate-pulse">🎯</div>
              <p className="text-white text-lg font-medium">
                Seleccionando equipo...
              </p>
              <p className="text-blue-300 text-sm mt-1">
                Turno de {currentPickMember?.display_name ?? '—'} · Ronda {currentRound}
              </p>
            </div>
          )}

          {/* Último pick revelado — destacado */}
          {stage === 'team_idle' && lastPick && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-center">
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-1">
                Última asignación
              </p>
              <p className="text-base font-medium text-emerald-900">
                {lastPick.teamName} <span className="text-emerald-600">({lastPick.conference})</span>
              </p>
              <p className="text-sm text-emerald-700">→ {lastPick.memberName}</p>
            </div>
          )}

          {/* Tabla */}
          <div className="mb-4">
            <DraftTable
              members={members}
              assignments={assignments.filter(a => a.teams !== null) as any}
              revealedCount={assignments.length}
            />
          </div>

          {/* Botón revelar siguiente equipo — manual, solo organizador */}
          {isOrganizer && stage === 'team_idle' && isManual && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  {assignments.length} de {totalAssignments} equipos asignados
                </p>
                <span className="text-xs text-gray-400">
                  Turno de {currentPickMember?.display_name ?? '—'}
                </span>
              </div>
              <button
                onClick={handleRevealNextTeam}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-medium text-sm py-3 rounded-lg transition-colors"
              >
                🎯 Revelar equipo de {currentPickMember?.display_name ?? 'siguiente jugador'}
              </button>
            </div>
          )}

          {/* Vista de espera para no organizadores en team_idle */}
          {!isOrganizer && stage === 'team_idle' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600">
                Turno de {currentPickMember?.display_name ?? '—'} — esperando revelación...
              </p>
            </div>
          )}
        </>
      )}

      {/* Sorteo completado */}
      {stage === 'done' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center mt-4">
          <span className="text-2xl">🏆</span>
          <p className="text-sm text-emerald-700 font-medium mt-2">
            ¡Sorteo completado! Los equipos han sido asignados.
          </p>
          <button
            onClick={handleGoToLeague}
            className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Ver mi quiniela →
          </button>
        </div>
      )}
    </div>
  )
}