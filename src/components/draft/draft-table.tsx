type Member = {
  id: string
  display_name: string
}

type Assignment = {
  member_id: string
  round_number: number
  teams: {
    name: string
    abbreviation: string
    conference: string
  }
}

type Props = {
  members: Member[]
  assignments: Assignment[]
  revealedCount: number
}

const ROUND_CONF: Record<number, string> = {
  1: 'AFC',
  2: 'NFC',
  3: 'AFC',
  4: 'NFC',
}

export function DraftTable({ members, assignments, revealedCount }: Props) {
  function getAssignment(memberId: string, round: number) {
    return assignments.find(
      a => a.member_id === memberId && a.round_number === round
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="grid text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-200"
        style={{ gridTemplateColumns: `48px repeat(${members.length}, 1fr)` }}
      >
        <div className="px-3 py-2">#</div>
        {members.map(m => (
          <div key={m.id} className="px-3 py-2 truncate">
            {m.display_name}
          </div>
        ))}
      </div>

      {/* Filas por ronda */}
      {[1, 2, 3, 4].map(round => (
        <div
          key={round}
          className="grid border-b border-gray-100 last:border-0"
          style={{ gridTemplateColumns: `48px repeat(${members.length}, 1fr)` }}
        >
          {/* Número de ronda */}
          <div className="px-3 py-3 flex flex-col items-center justify-center bg-gray-50 border-r border-gray-100">
            <span className="text-xs font-medium text-gray-500">R{round}</span>
            <span className={`text-xs font-medium ${
              ROUND_CONF[round] === 'AFC' ? 'text-blue-500' : 'text-green-600'
            }`}>
              {ROUND_CONF[round]}
            </span>
          </div>

          {/* Celdas por miembro */}
          {members.map(member => {
            const assignment = getAssignment(member.id, round)
            const isAFC = assignment?.teams?.conference === 'AFC'

            return (
              <div
                key={member.id}
                className={`
                  px-3 py-3 text-xs border-r border-gray-100 last:border-0
                  ${assignment
                    ? isAFC
                      ? 'bg-blue-50 text-blue-800 font-medium'
                      : 'bg-green-50 text-green-800 font-medium'
                    : 'text-gray-300 italic'
                  }
                `}
              >
                {assignment ? assignment.teams.name : '— —'}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}