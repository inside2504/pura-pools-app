import { Avatar } from '@/components/ui/avatar'

type StandingRow = {
    memberId: string
    displayName: string
    avatarUrl: string | null
    isAlive: boolean
    totalWins: number
    teamCount: number
    aliveTeams: number
}

type Props = {
    standings: StandingRow[]
}

export function StandingsTable({ standings }: Props) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-medium text-gray-900">
                    Tabla de posiciones
                </h2>
                <span className="text-xs text-gray-400">
                    {standings.filter(s => s.isAlive).length} de {standings.length} siguen vivos
                </span>
            </div>

            {standings.map((row, index) => (
                <div
                    key={row.memberId}
                    className={`
            flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0
            ${!row.isAlive ? 'opacity-50' : ''}
          `}
                >
                    {/* Posición */}
                    <span className="text-sm font-medium text-gray-400 w-5 text-center shrink-0">
                        {index + 1}
                    </span>

                    {/* Avatar y nombre */}
                    <Avatar
                        name={row.displayName}
                        imageUrl={row.avatarUrl}
                        size="sm"
                    />
                    <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-900 truncate block">
                            {row.displayName}
                        </span>
                        <span className="text-xs text-gray-400">
                            {row.aliveTeams} de {row.teamCount} equipos vivos
                        </span>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-2 shrink-0">
                        {!row.isAlive ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                                Eliminado
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                                Vivo
                            </span>
                        )}
                        <div className="text-right shrink-0">
                            <span className="text-sm font-medium text-gray-900">
                                {row.aliveTeams}/{row.teamCount}
                            </span>
                            <span className="text-xs text-gray-400 block">equipos vivos</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}