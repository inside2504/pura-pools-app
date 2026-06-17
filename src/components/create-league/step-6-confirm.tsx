import { WizardData } from '@/types/wizard'

type Props = {
    data: WizardData
    onConfirm: () => void
    onBack: () => void
    isLoading: boolean
}

const FORMAT_LABELS: Record<string, string> = {
    draft_pool: 'Sorteo de equipos',
    predictions: 'Predicciones con puntos',
}

const DRAFT_MODE_LABELS: Record<string, string> = {
    manual: 'Manual — Botón revelar',
    automatic: 'Automático — Timer',
}

const SPORT_LABELS: Record<string, string> = {
    nfl: '🏈 NFL',
    soccer: '⚽ Fútbol',
    custom: '🎯 Personalizado',
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
        </div>
    )
}

export function Step6Confirm({ data, onConfirm, onBack, isLoading }: Props) {
    return (
        <div>
            <h2 className="text-base font-medium text-gray-900 mb-1">
                Confirma tu quiniela
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Revisa los detalles antes de crear.
            </p>

            <div className="bg-white border border-gray-200 rounded-xl px-4 mb-6">
                <Row label="Nombre" value={data.name ?? '—'} />
                <Row label="Deporte" value={SPORT_LABELS[data.sport ?? ''] ?? data.sport ?? '—'} />
                <Row label="Temporada" value={data.season ?? '—'} />
                <Row label="Participantes máx." value={`${data.maxMembers ?? '—'} personas`} />
                <Row label="Formato" value={FORMAT_LABELS[data.formatType ?? ''] ?? '—'} />
                <Row label="Reglas" value={data.rulesPreset ?? '—'} />
                {data.formatType === 'draft_pool' && (
                    <Row
                        label="Modo de sorteo"
                        value={DRAFT_MODE_LABELS[data.draftMode ?? ''] ?? '—'}
                    />
                )}
                {data.draftMode === 'automatic' && data.draftTimerSeconds && (
                    <Row
                        label="Timer del sorteo"
                        value={`${data.draftTimerSeconds} segundos`}
                    />
                )}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    disabled={isLoading}
                    className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                    Atrás
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
                >
                    {isLoading ? 'Creando...' : '🎉 Crear quiniela'}
                </button>
            </div>
        </div>
    )
}