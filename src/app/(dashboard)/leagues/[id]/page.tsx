import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PendingView } from '@/components/league-detail/pending-view'
import { ActiveView } from '@/components/league-detail/active-view'
import { FinishedView } from '@/components/league-detail/finished-view'

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

    if (league.status === 'active' || league.status === 'playoffs') {
        return (
            <ActiveView
                league={league as any}
                members={formattedMembers}
                currentMember={currentMember}
                isOrganizer={isOrganizer}
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