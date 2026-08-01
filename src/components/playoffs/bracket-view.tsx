import { PlayoffMatch, TeamInfo, MemberInfo, ROUND_LABELS, ROUND_ORDER } from '@/types/playoffs'
import { MatchCard } from './match-card'

type Props = {
  matches: PlayoffMatch[]
  teams: Record<string, TeamInfo>
  memberByTeam: Record<string, MemberInfo>
  isOrganizer: boolean
  onUpdated: () => void
}

export function BracketView({ matches, teams, memberByTeam, isOrganizer, onUpdated }: Props) {
  const matchesByRound = ROUND_ORDER.reduce((acc, round) => {
    acc[round] = matches.filter(m => m.round === round)
    return acc
  }, {} as Record<string, PlayoffMatch[]>)

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-4">
        {ROUND_ORDER.map(round => {
          const roundMatches = matchesByRound[round] ?? []
          if (roundMatches.length === 0) return null

          // Separar AFC y NFC para wild card y divisional
          const afcMatches = roundMatches.filter(m => m.conference === 'AFC')
          const nfcMatches = roundMatches.filter(m => m.conference === 'NFC')
          const sbMatch = roundMatches.find(m => m.conference === 'SB')

          return (
            <div key={round} className="flex flex-col" style={{ width: 220 }}>
              {/* Header de la ronda */}
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center mb-3 pb-2 border-b border-gray-200">
                {ROUND_LABELS[round]}
              </div>

              {round === 'superbowl' ? (
                <div className="flex-1 flex items-center">
                  {sbMatch && (
                    <div className="w-full">
                      <MatchCard
                        match={sbMatch}
                        teams={teams}
                        memberByTeam={memberByTeam}
                        isOrganizer={isOrganizer}
                        onUpdated={onUpdated}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* AFC */}
                  {afcMatches.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-blue-600 mb-2">AFC</div>
                      <div className="flex flex-col gap-2">
                        {afcMatches.map(match => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            teams={teams}
                            memberByTeam={memberByTeam}
                            isOrganizer={isOrganizer}
                            onUpdated={onUpdated}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NFC */}
                  {nfcMatches.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-green-600 mb-2">NFC</div>
                      <div className="flex flex-col gap-2">
                        {nfcMatches.map(match => (
                          <MatchCard
                            key={match.id}
                            match={match}
                            teams={teams}
                            memberByTeam={memberByTeam}
                            isOrganizer={isOrganizer}
                            onUpdated={onUpdated}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}