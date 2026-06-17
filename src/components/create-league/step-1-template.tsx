import { WizardData } from '@/types/wizard'

type Props = {
  data: WizardData
  onChange: (data: Partial<WizardData>) => void
  onNext: () => void
}

const TEMPLATES = [
  {
    id: 'nfl-classic',
    name: 'Quiniela NFL — Clásica',
    sport: 'nfl',
    formatType: 'draft_pool' as const,
    emoji: '🏈',
    description: 'Sorteo de equipos por conferencia. Sigues vivo mientras alguno de tus equipos avance en playoffs. Gana quien tenga al campeón.',
    badge: 'Más popular',
    badgeColor: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'world-cup',
    name: 'Mundial de Fútbol',
    sport: 'soccer',
    formatType: 'predictions' as const,
    emoji: '⚽',
    description: 'Predice el resultado de cada partido. Acumula puntos por aciertos. Gana quien más puntos tenga al final.',
    badge: 'Mundial 2026',
    badgeColor: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'custom-draft',
    name: 'Quiniela personalizada — Sorteo',
    sport: 'custom',
    formatType: 'draft_pool' as const,
    emoji: '🎯',
    description: 'Configura tu propio sorteo de equipos con reglas personalizadas para cualquier deporte o torneo.',
    badge: 'Personalizable',
    badgeColor: 'bg-violet-50 text-violet-700',
  },
  {
    id: 'custom-predictions',
    name: 'Quiniela personalizada — Predicciones',
    sport: 'custom',
    formatType: 'predictions' as const,
    emoji: '🔮',
    description: 'Crea tu propio sistema de puntuación para predicciones. Tú defines cuánto vale cada acierto.',
    badge: 'Personalizable',
    badgeColor: 'bg-violet-50 text-violet-700',
  },
]

export function Step1Template({ data, onChange, onNext }: Props) {
  function handleSelect(template: typeof TEMPLATES[0]) {
    onChange({
      templateId: template.id,
      formatType: template.formatType,
      sport: template.sport,
    })
  }

  return (
    <div>
      <h2 className="text-base font-medium text-gray-900 mb-1">
        ¿Qué tipo de quiniela quieres crear?
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Elige una plantilla para empezar rápido o configura la tuya desde cero.
      </p>

      <div className="grid gap-3 mb-8">
        {TEMPLATES.map((template) => {
          const isSelected = data.templateId === template.id
          return (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{template.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                      {template.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${template.badgeColor}`}>
                      {template.badge}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {template.description}
                  </p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center
                  ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!data.templateId}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}