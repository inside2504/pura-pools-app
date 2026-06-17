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

    const { data: league, error } = await supabase
        .from('leagues')
        .select(`
      id, name, sport, season, status, format_type, draft_mode,
      owner_id,
      league_members (
        id, role, is_alive, total_points,
        users ( id, display_name, email, avatar_url )
      ),
      league_invitations (
        id, code, uses, max_uses, expires_at
      )
    `)
        .eq('id', id)  // ← usa id en lugar de params.id
        .single()

    if (error || !league) notFound()

    // Verificar que el usuario pertenece a esta quiniela
    const members = league.league_members as any[]
    const currentMember = members.find(m => m.users?.id === user.id)
    if (!currentMember) notFound()

    const isOrganizer = currentMember.role === 'organizer'
    const invitation = (league.league_invitations as any[])?.[0] ?? null

    // Renderizar según el estado
    if (league.status === 'pending') {
        return (
            <PendingView
                league={league as any}
                members={members}
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
                members={members}
                currentMember={currentMember}
                isOrganizer={isOrganizer}
            />
        )
    }

    if (league.status === 'finished') {
        return (
            <FinishedView
                league={league as any}
                members={members}
                currentMember={currentMember}
            />
        )
    }

    // draft — próximamente
    return (
        <div className="text-center py-12 text-gray-400">
            <p>Pantalla de sorteo — próximamente</p>
        </div>
    )
}