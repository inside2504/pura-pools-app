import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LeaguesPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  const { data: leagues } = await supabase
    .from('league_members')
    .select(`
      role,
      is_alive,
      leagues (
        id,
        name,
        sport,
        season,
        status,
        format_type
      )
    `)
    .eq('user_id', user.id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">Mis quinielas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {leagues?.length
              ? `${leagues.length} quiniela${leagues.length > 1 ? 's' : ''} activa${leagues.length > 1 ? 's' : ''}`
              : 'Todavía no tienes quinielas'}
          </p>
        </div>
        <Link
          href="/leagues/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva quiniela
        </Link>
      </div>

      {/* Estado vacío */}
      {(!leagues || leagues.length === 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <span className="text-4xl">🏈</span>
          <h2 className="text-base font-medium text-gray-900 mt-3">
            No tienes quinielas aún
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
            Crea una nueva quiniela e invita a tus amigos para empezar a competir.
          </p>
          <Link
            href="/leagues/new"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Crear mi primera quiniela
          </Link>
        </div>
      )}

      {/* Lista de quinielas */}
      {leagues && leagues.length > 0 && (
        <div className="grid gap-3">
          {leagues.map((member) => {
            const league = member.leagues as any
            return (
              <Link
                key={league.id}
                href={`/leagues/${league.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {league.sport === 'nfl' ? '🏈' : '⚽'}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {league.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {league.season} · {member.role === 'organizer' ? 'Organizador' : 'Participante'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`
                    text-xs px-2.5 py-1 rounded-full font-medium
                    ${league.status === 'active' ? 'bg-emerald-50 text-emerald-700' : ''}
                    ${league.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : ''}
                    ${league.status === 'finished' ? 'bg-gray-100 text-gray-500' : ''}
                    ${league.status === 'draft' ? 'bg-blue-50 text-blue-700' : ''}
                  `}>
                    {league.status === 'active' && 'En curso'}
                    {league.status === 'pending' && 'Por iniciar'}
                    {league.status === 'finished' && 'Finalizada'}
                    {league.status === 'draft' && 'Sorteo'}
                  </span>
                  <span className="text-gray-300">→</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}