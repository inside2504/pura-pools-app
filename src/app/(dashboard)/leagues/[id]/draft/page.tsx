import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { DraftScreen } from '@/components/draft/draft-screen'

export const dynamic = 'force-dynamic'

export default async function DraftPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: league, error } = await supabase
    .from('leagues')
    .select('id, name, sport, season, status, format_type, draft_mode, owner_id')
    .eq('id', id)
    .single()

  if (error || !league) notFound()
  if (league.status !== 'draft' && league.status !== 'active') {
    redirect(`/leagues/${id}`)
  }

  // Cargar miembros via RPC
  const { data: members } = await supabase
    .rpc('get_league_members', { p_league_id: id })

  if (!members) notFound()

  const currentMember = members.find((m: any) => m.user_id === user.id)
  if (!currentMember) notFound()

  const isOrganizer = currentMember.role === 'organizer'

  // Cargar asignaciones existentes (si el sorteo ya corrió)
  const { data: assignments } = await supabase
    .from('draft_assignments')
    .select(`
      id, round_number, member_id,
      teams ( id, name, abbreviation, conference )
    `)
    .eq('league_id', id)
    .order('assigned_at', { ascending: true })

  return (
    <DraftScreen
      league={league as any}
      members={members as any}
      currentUserId={user.id}
      isOrganizer={isOrganizer}
      initialAssignments={assignments ?? []}
    />
  )
}