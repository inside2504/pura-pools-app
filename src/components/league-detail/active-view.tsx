import { Avatar } from '@/components/ui/avatar'

type Props = {
  league: {
    id: string
    name: string
    sport: string
    season: string
    status: string
  }
  members: Array<{
    id: string
    role: string
    is_alive: boolean
    total_points: number
    users: {
      id: string
      display_name: string
      avatar_url: string | null
    }
  }>
  currentMember: { role: string }
  isOrganizer: boolean
}

export function ActiveView({ league, members }: Props) {
  const sorted = [...members].sort((a, b) => b.total_points - a.total_points)

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <span className="text-3xl">
          {league.sport === 'nfl' ? '🏈' : '⚽'}
        </span>
        <div>
          <h1 className="text-xl font-medium text-gray-900">{league.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{league.season}</p>
        </div>
        <span className={`
          ml-auto text-xs px-2.5 py-1 rounded-full font-medium
          ${league.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}
        `}>
          {league.status === 'active' ? 'En curso' : 'Playoffs'}
        </span>
      </div>

      {/* Standings */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Tabla de posiciones</h2>
        </div>
        {sorted.map((member, index) => (
          <div
            key={member.id}
            className={`
              flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0
              ${!member.is_alive ? 'opacity-50' : ''}
            `}
          >
            <span className="text-sm text-gray-400 w-5 text-center font-medium">
              {index + 1}
            </span>
            <Avatar
              name={member.users.display_name}
              imageUrl={member.users.avatar_url}
              size="sm"
            />
            <span className="flex-1 text-sm text-gray-900">
              {member.users.display_name}
            </span>
            {!member.is_alive && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                Eliminado
              </span>
            )}
            <span className="text-sm font-medium text-gray-900">
              {member.total_points} pts
            </span>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
        <p className="text-sm text-blue-600">
          Actualización de resultados y detalle de equipos — próximamente
        </p>
      </div>
    </div>
  )
}