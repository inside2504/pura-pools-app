import { Avatar } from '@/components/ui/avatar'

type Props = {
  league: {
    id: string
    name: string
    sport: string
    season: string
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
}

export function FinishedView({ league, members }: Props) {
  const sorted = [...members].sort((a, b) => b.total_points - a.total_points)
  const winner = sorted[0]

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
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
          Finalizada
        </span>
      </div>

      {/* Ganador */}
      {winner && (
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 text-center mb-4">
          <span className="text-4xl">🏆</span>
          <p className="text-xs text-yellow-700 font-medium uppercase tracking-wide mt-3 mb-2">
            Campeón de la quiniela
          </p>
          <Avatar
            name={winner.users.display_name}
            imageUrl={winner.users.avatar_url}
            size="lg"
          />
          <p className="text-lg font-medium text-gray-900 mt-2">
            {winner.users.display_name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {winner.total_points} puntos acumulados
          </p>
        </div>
      )}

      {/* Tabla final */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Resultados finales</h2>
        </div>
        {sorted.map((member, index) => (
          <div
            key={member.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
          >
            <span className="text-sm font-medium text-gray-400 w-5 text-center">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
            </span>
            <Avatar
              name={member.users.display_name}
              imageUrl={member.users.avatar_url}
              size="sm"
            />
            <span className="flex-1 text-sm text-gray-900">
              {member.users.display_name}
            </span>
            <span className="text-sm font-medium text-gray-900">
              {member.total_points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}