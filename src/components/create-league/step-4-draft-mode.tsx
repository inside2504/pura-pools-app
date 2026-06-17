import { WizardData, DraftMode } from '@/types/wizard'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

const DRAFT_MODES: Array<{
  id: DraftMode
  name: string
  emoji: string
  description: string
  detail: string
}> = [
    {
      id: 'manual',
      name: 'Manual — Botón revelar',
      emoji: '🎉',
      description: 'Ideal para reuniones presenciales.',
      detail: 'Tú controlas el ritmo. Presionas un botón para revelar cada equipo uno a uno. Perfecto para cuando están juntos asando carne y quieren vivir el momento.',
    },
    {
      id: 'automatic',
      name: 'Automático — Timer',
      emoji: '⏱️',
      description: 'Ideal para videollamadas o a distancia.',
      detail: 'El sistema revela los equipos automáticamente con un intervalo de tiempo configurable. Todos ven el sorteo en tiempo real sin que nadie tenga que presionar nada.',
    },
  ]

export function Step4DraftMode({ data, onChange, onNext, onBack }: Props) {
  const isPredictions = data.formatType === 'predictions'

  // Si es predicciones, skip automático
  if (isPredictions) {
    return (
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-1">
          Modo de sorteo
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-8">
          <span className="text-3xl">🔮</span>
          <p className="text-sm text-gray-600 mt-3">
            Las quinielas de predicciones no tienen sorteo — cada participante predice los resultados directamente.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Este paso no aplica para el formato que elegiste.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            Atrás
          </button>
          <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
            Continuar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-base font-medium text-gray-900 mb-1">
        Modo de sorteo
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        ¿Cómo quieres que se revelen los equipos?
      </p>

      <div className="flex flex-col gap-3 mb-6">
        {DRAFT_MODES.map((mode) => {
          const isSelected = data.draftMode === mode.id
          return (
            <button
              key={mode.id}
              onClick={() => onChange({ draftMode: mode.id })}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{mode.emoji}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                    {mode.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}>
                    {mode.description}
                  </div>
                  {isSelected && (
                    <div className="text-xs text-blue-700 mt-2 leading-relaxed bg-blue-100 rounded-lg p-2.5">
                      {mode.detail}
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

      {/* Timer para modo automático */}
      {data.draftMode === 'automatic' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-3">
            Tiempo entre revelaciones
          </label>
          <div className="flex gap-2">
            {[3, 5, 10, 15].map(seconds => (
              <button
                key={seconds}
                onClick={() => onChange({ draftTimerSeconds: seconds })}
                className={`
                  flex-1 py-2 text-sm rounded-lg border-2 font-medium transition-all
                  ${data.draftTimerSeconds === seconds
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!data.draftMode}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}