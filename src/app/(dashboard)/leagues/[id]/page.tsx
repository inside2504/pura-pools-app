import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PendingView } from '@/components/league-detail/pending-view'
import { FinishedView } from '@/components/league-detail/finished-view'
import { ActiveView } from '@/components/active-view/active-view'
import { PlayoffsView } from '@/components/playoffs/playoffs-view'

export const dynamic = 'force-dynamic'

export default async function LeagueDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params  // ← await aquí

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Reemplaza el select de league_members en el query principal
    const { data: league, error } = await supabase
        .from('leagues')
        .select(`
    id, name, sport, season, status, format_type, draft_mode,
    owner_id,
    league_invitations (
      id, code, uses, max_uses, expires_at
    )
  `)
        .eq('id', id)
        .single()

    if (error || !league) notFound()

    // Cargar miembros via RPC
    const { data: members } = await supabase
        .rpc('get_league_members', { p_league_id: id })

    if (!members) notFound()

    // Verificar que el usuario pertenece a esta quiniela
    const currentMember = members.find((m: any) => m.user_id === user.id)
    if (!currentMember) notFound()

    const isOrganizer = currentMember.role === 'organizer'
    const invitation = (league.league_invitations as any[])?.[0] ?? null

    // Formatear members para que tengan la misma estructura que antes
    const formattedMembers = members.map((m: any) => ({
        id: m.id,
        role: m.role,
        is_alive: m.is_alive,
        total_points: m.total_points,
        users: {
            id: m.user_id,
            display_name: m.display_name,
            email: m.email,
            avatar_url: m.avatar_url,
        }
    }))

    // Renderizar según el estado
    if (league.status === 'pending') {
        return (
            <PendingView
                league={league as any}
                members={formattedMembers}
                currentMember={currentMember}
                isOrganizer={isOrganizer}
                invitation={invitation}
            />
        )
    }

    // En el bloque de renderizado, reemplaza el caso de playoffs:
    if (league.status === 'playoffs') {
        const { data: standings } = await supabase
            .rpc('get_league_standings', { p_league_id: id })

        const { data: matches } = await supabase
            .from('playoff_matches')
            .select('*')
            .eq('league_id', id)
            .order('created_at')

        const { data: seeds } = await supabase
            .from('playoff_seeds')
            .select('id')
            .eq('league_id', id)
            .limit(1)

        // Equipos clasificados (marcados como PO en team_phase_results)
        const { data: qualifiedTeams } = await supabase
            .from('team_phase_results')
            .select('team_id, teams ( id, name, abbreviation, conference, division )')
            .eq('league_id', id)
            .eq('advanced', true)

        // Si no hay clasificados marcados, usar todos los de la NFL como fallback
        const { data: allNflTeams } = await supabase
            .from('teams')
            .select('id, name, abbreviation, conference, division')
            .eq('sport', 'nfl')
            .order('conference')
            .order('name')

        const seedTeams = qualifiedTeams && qualifiedTeams.length > 0
            ? qualifiedTeams.map((q: any) => q.teams).filter(Boolean)
            : allNflTeams ?? []

        const usingFallback = !qualifiedTeams || qualifiedTeams.length === 0

        // En el bloque de active Y playoffs, agrega esta query:
        const { data: allRecords } = await supabase
            .from('team_phase_results')
            .select('team_id, wins, losses, ties, advanced, eliminated')
            .eq('league_id', id)

        // Construir existingRecords desde allRecords en vez de standings
        const existingRecords = (allRecords ?? []).map((r: any) => ({
            teamId: r.team_id,
            wins: r.wins,
            losses: r.losses,
            ties: r.ties,
            isEliminated: r.eliminated,
            clinchedPlayoff: r.advanced,
        }))

        return (
            <PlayoffsView
                league={league as any}
                initialMatches={(matches ?? []) as any}
                initialStandings={standings ?? []}
                isOrganizer={isOrganizer}
                hasSeedsConfigured={(seeds?.length ?? 0) > 0}
                allNflTeams={allNflTeams ?? []}
                usingFallback={usingFallback}
                existingRecords={existingRecords}
            />
        )
    }

    // Y el caso active queda solo para active (sin playoffs):
    // Agrega este query para AMBOS estados (active y playoffs)
    const { data: allNflTeams } = await supabase
        .from('teams')
        .select('id, name, abbreviation, conference, division')
        .eq('sport', 'nfl')
        .order('conference')
        .order('division')
        .order('name')

    if (league.status === 'active') {
        const { data: standings } = await supabase
            .rpc('get_league_standings', { p_league_id: id })

        // En el bloque de active Y playoffs, agrega esta query:
        const { data: allRecords } = await supabase
            .from('team_phase_results')
            .select('team_id, wins, losses, ties, advanced, eliminated')
            .eq('league_id', id)

        // Construir existingRecords desde allRecords en vez de standings
        const existingRecords = (allRecords ?? []).map((r: any) => ({
            teamId: r.team_id,
            wins: r.wins,
            losses: r.losses,
            ties: r.ties,
            isEliminated: r.eliminated,
            clinchedPlayoff: r.advanced,
        }))

        return (
            <ActiveView
                league={league as any}
                initialStandings={standings ?? []}
                isOrganizer={isOrganizer}
                currentUserId={user.id}
                allNflTeams={allNflTeams ?? []}
                existingRecords={existingRecords}
            />
        )
    }

    if (league.status === 'finished') {
        return (
            <FinishedView
                league={league as any}
                members={formattedMembers}
                currentMember={currentMember}
            />
        )
    }

    // draft — próximamente
    if (league.status === 'draft') {
        redirect(`/leagues/${id}/draft`)
    }
}