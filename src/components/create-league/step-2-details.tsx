import { WizardData } from '@/types/wizard'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

const CURRENT_YEAR = new Date().getFullYear()
const SEASONS = [
  `${CURRENT_YEAR}`,
  `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`,
  `${CURRENT_YEAR + 1}`,
]

export function Step2Details({ data, onChange, onNext, onBack }: Props) {
  const isValid = data.name && data.name.trim().length >= 3 && data.season && data.maxMembers

  return (
    <div>
      <h2 className="text-base font-medium text-gray-900 mb-1">
        Detalles de la quiniela
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Dale nombre y configura los participantes.
      </p>

      <div className="flex flex-col gap-4 mb-8">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nombre de la quiniela
          </label>
          <input
            type="text"
            value={data.name ?? ''}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="Ej. Quiniela NFL Los Compadres 2025"
            maxLength={60}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
          />
          <span className="text-xs text-gray-400">
            {(data.name ?? '').length}/60 caracteres
          </span>
        </div>

        {/* Temporada */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Temporada
          </label>
          <div className="flex gap-2">
            {SEASONS.map(season => (
              <button
                key={season}
                onClick={() => onChange({ season })}
                className={`
                  flex-1 py-2 text-sm rounded-lg border-2 font-medium transition-all
                  ${data.season === season
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* Número de participantes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Número de participantes
          </label>
          <p className="text-xs text-gray-400 -mt-1">
            Puedes agregar más después, este es el máximo permitido.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[4, 6, 8, 10, 12, 14, 16, 20].map(n => (
              <button
                key={n}
                onClick={() => onChange({ maxMembers: n })}
                className={`
                  py-2 text-sm rounded-lg border-2 font-medium transition-all
                  ${data.maxMembers === n
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
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
          disabled={!isValid}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}