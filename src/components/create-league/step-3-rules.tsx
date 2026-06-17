import { WizardData, LeagueFormat } from '@/types/wizard'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

const RULES_BY_FORMAT: Record<LeagueFormat, Array<{
  id: string
  name: string
  emoji: string
  description: string
  detail: string
}>> = {
  draft_pool: [
    {
      id: 'nfl-classic',
      name: 'Eliminación por playoffs',
      emoji: '🏆',
      description: 'El sistema clásico de la NFL.',
      detail: 'Sigues vivo mientras al menos uno de tus equipos avance. Se eliminan por Wild Card, Divisional, Conference Championship y Super Bowl. Gana quien tenga al campeón.',
    },
    {
      id: 'wins-accumulation',
      name: 'Acumulación de victorias',
      emoji: '📊',
      description: 'Gana quien más partidos acumule.',
      detail: 'Se suman todas las victorias de tus equipos durante la temporada regular y playoffs. No hay eliminación — todos llegan al final. Gana quien más wins tenga.',
    },
  ],
  predictions: [
    {
      id: 'simple-winner',
      name: 'Solo ganador (+1/0)',
      emoji: '✅',
      description: 'El sistema más sencillo.',
      detail: '+1 punto si aciertas el ganador del partido. 0 puntos si fallas. En caso de empate, debes pronosticar empate para sumar. Gana quien más puntos acumule.',
    },
    {
      id: 'advanced-score',
      name: 'Marcador avanzado (4/3/2/0)',
      emoji: '🎯',
      description: 'Más puntos por más precisión.',
      detail: '+4 pts si aciertas marcador exacto. +3 pts si aciertas ganador y diferencia de goles. +2 pts si solo aciertas el ganador. 0 pts si fallas. Gana quien más puntos acumule.',
    },
    {
      id: 'custom',
      name: 'Sistema personalizado',
      emoji: '⚙️',
      description: 'Define tus propias reglas.',
      detail: 'Crea un sistema de puntuación completamente a tu medida. Puedes definir cuántos puntos vale cada tipo de acierto y agregar multiplicadores por fase.',
    },
  ],
}

export function Step3Rules({ data, onChange, onNext, onBack }: Props) {
  const format = data.formatType ?? 'draft_pool'
  const rules = RULES_BY_FORMAT[format]

  return (
    <div>
      <h2 className="text-base font-medium text-gray-900 mb-1">
        Sistema de competencia
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Elige cómo se va a competir y cómo se determina el ganador.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {rules.map((rule) => {
          const isSelected = data.rulesPreset === rule.id
          return (
            <button
              key={rule.id}
              onClick={() => onChange({
                rulesPreset: rule.id,
                rulesDescription: rule.detail,
              })}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{rule.emoji}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {rule.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                    {rule.description}
                  </div>
                  {isSelected && (
                    <div className="text-xs text-blue-700 mt-2 leading-relaxed bg-blue-100 rounded-lg p-2.5">
                      {rule.detail}
                    </div>
                  )}
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center
                  ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
                `}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.rulesPreset}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}