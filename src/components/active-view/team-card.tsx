type TeamCardProps = {
    name: string
    abbreviation: string
    conference: string
    division: string
    wins: number
    losses: number
    ties: number
    isEliminated: boolean
    clinchedPlayoff: boolean
}

export function TeamCard({
    name,
    abbreviation,
    conference,
    division,
    wins,
    losses,
    ties,
    isEliminated,
    clinchedPlayoff,
}: TeamCardProps) {
    const hasRecord = wins > 0 || losses > 0 || ties > 0

    const statusColor = isEliminated
        ? 'bg-red-50 border-red-100'
        : clinchedPlayoff
            ? 'bg-emerald-50 border-emerald-100'
            : 'bg-white border-gray-200'

    const confColor = conference === 'AFC'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-green-100 text-green-700'

    return (
        <div className={`
      border rounded-xl p-3 flex items-center gap-3 transition-all
      ${statusColor}
    `}>
            {/* Conf badge */}
            <span className={`
        text-xs font-medium px-2 py-0.5 rounded-full shrink-0
        ${confColor}
      `}>
                {conference}
            </span>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-medium truncate ${isEliminated ? 'text-red-400 line-through' : 'text-gray-900'
                        }`}>
                        {name}
                    </span>
                    {clinchedPlayoff && !isEliminated && (
                        <span className="text-xs">✓</span>
                    )}
                </div>
                <span className="text-xs text-gray-400">{division}</span>
            </div>

            {/* Record */}
            <div className="text-right shrink-0">
                {hasRecord ? (
                    <>
                        <span className={`text-sm font-medium ${isEliminated ? 'text-red-400' : 'text-gray-900'
                            }`}>
                            {wins}W - {losses}L{ties > 0 ? ` - ${ties}T` : ''}
                        </span>
                        <div className="text-xs mt-0.5">
                            {isEliminated
                                ? <span className="text-red-400">Eliminado</span>
                                : clinchedPlayoff
                                    ? <span className="text-emerald-600">Playoffs ✓</span>
                                    : <span className="text-gray-400">En contención</span>
                            }
                        </div>
                    </>
                ) : (
                    <span className="text-xs text-gray-300">Sin datos</span>
                )}
            </div>
        </div>
    )
}