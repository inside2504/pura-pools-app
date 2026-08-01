import { Avatar } from '@/components/ui/avatar'
import { PlayoffMatch, TeamInfo, MemberInfo, ROUND_LABELS, MEMBER_COLORS } from '@/types/playoffs'

type Props = {
  members: MemberInfo[]
  memberTeams: Record<string, string[]> // memberId → teamIds
  teams: Record<string, TeamInfo>
  matches: PlayoffMatch[]
}

export function PlayoffsList({ members, memberTeams, teams, matches }: Props) {
  function getTeamStatus(teamId: string): { round: string; eliminated: boolean } {
    let lastRound = 'wildcard'
    let eliminated = false

    for (const match of matches) {
      if (match.home_team_id === teamId || match.away_team_id === teamId) {
        lastRound = match.round
        if (match.status === 'finished' && match.winner_id !== teamId) {
          eliminated = true
        }
      }
    }

    return { round: lastRound, eliminated }
  }

  return (
    <div className="flex flex-col gap-4">
      {members.map((member, index) => {
        const color = MEMBER_COLORS[index % MEMBER_COLORS.length]
        const teamIds = memberTeams[member.memberId] ?? []
        const aliveTeams = teamIds.filter(id => {
          const status = getTeamStatus(id)
          return !status.eliminated
        })

        return (
          <div
            key={member.memberId}
            className={`
              border rounded-xl p-4
              ${!member.isAlive ? 'opacity-60 border-gray-200' : `border-2 ${color.border}`}
            `}
          >
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                name={member.displayName}
                imageUrl={member.avatarUrl}
                size="sm"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {member.displayName}
                  </span>
                  <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                </div>
                <span className="text-xs text-gray-400">
                  {aliveTeams.length} equipo{aliveTeams.length !== 1 ? 's' : ''} vivo{aliveTeams.length !== 1 ? 's' : ''}
                </span>
              </div>
              {!member.isAlive ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                  Eliminado
                </span>
              ) : (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color.bg} ${color.text}`}>
                  Vivo
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              {teamIds.map(teamId => {
                const team = teams[teamId]
                if (!team) return null
                const status = getTeamStatus(teamId)

                return (
                  <div
                    key={teamId}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                      ${status.eliminated
                        ? 'bg-gray-50 text-gray-400'
                        : `${color.bg} ${color.text}`
                      }
                    `}
                  >
                    <span className={`
                      text-xs px-1.5 py-0.5 rounded font-medium
                      ${team.conference === 'AFC'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-green-200 text-green-800'
                      }
                    `}>
                      {team.conference}
                    </span>
                    <span className={`flex-1 font-medium ${status.eliminated ? 'line-through' : ''}`}>
                      {team.name}
                    </span>
                    {status.eliminated ? (
                      <span className="text-xs text-gray-400">
                        Eliminado en {ROUND_LABELS[status.round as keyof typeof ROUND_LABELS]}
                      </span>
                    ) : (
                      <span className="text-xs">
                        ✓ Vivo
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}