import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function JoinPage({
    params,
}: {
    params: Promise<{ code: string }>
}) {
    const { code } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Buscar la invitación por código — sin join a leagues
    const { data: invitation, error: invError } = await supabase
        .from('league_invitations')
        .select('id, code, uses, max_uses, expires_at, league_id')
        .eq('code', code)
        .single()

    if (invError || !invitation) {
        redirect('/leagues?error=invalid-invite')
    }

    // Verificar que la invitación no expiró
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        redirect('/leagues?error=expired-invite')
    }

    // Verificar que no excedió el máximo de usos
    if (invitation.max_uses && invitation.uses >= invitation.max_uses) {
        redirect('/leagues?error=invite-full')
    }

    // Verificar si ya es miembro
    const { data: existing } = await supabase
        .from('league_members')
        .select('id')
        .eq('league_id', invitation.league_id)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        redirect(`/leagues/${invitation.league_id}`)
    }

    // Leer la quiniela por separado — necesitamos agregar política pública
    // Por ahora verificamos status después de unirse
    // Unirse a la quiniela
    const { error: joinError } = await supabase
        .from('league_members')
        .insert({
            league_id: invitation.league_id,
            user_id: user.id,
            role: 'member',
        })

    if (joinError) {
        console.error('Error uniéndose — código:', joinError.code)
        console.error('Error uniéndose — mensaje:', joinError.message)
        console.error('Error uniéndose — detalles:', joinError.details)
        console.error('Error uniéndose — hint:', joinError.hint)
        redirect(`/leagues?error=join-failed&msg=${encodeURIComponent(joinError.message)}`)
    }

    // Incrementar contador de usos
    await supabase
        .from('league_invitations')
        .update({ uses: invitation.uses + 1 })
        .eq('id', invitation.id)

    redirect(`/leagues/${invitation.league_id}`)
}