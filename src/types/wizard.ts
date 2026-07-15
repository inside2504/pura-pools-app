export type LeagueFormat = 'draft_pool' | 'predictions'
export type DraftMode = 'automatic' | 'manual'

export type WizardData = {
    // Paso 1
    templateId?: string
    formatType?: LeagueFormat
    sport?: string

    // Paso 2
    name?: string
    season?: string
    maxMembers?: number

    // Paso 3
    rulesPreset?: string
    rulesDescription?: string

    // Paso 4
    draftMode?: DraftMode
    draftTimerSeconds?: number

    // Paso 5 — se llena después de crear la quiniela
    invitationCode?: string
    leagueId?: string
}

export type WizardStep = 1 | 2 | 3 | 4 | 5

export const STEP_LABELS: Record<WizardStep, string> = {
    1: 'Tipo de quiniela',
    2: 'Detalles',
    3: 'Reglas',
    4: 'Sorteo',
    5: 'Confirmar',
}