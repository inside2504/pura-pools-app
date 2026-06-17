'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WizardData, WizardStep } from '@/types/wizard'
import { StepIndicator } from './step-indicator'
import { Step1Template } from './step-1-template'
import { Step2Details } from './step-2-details'
import { Step3Rules } from './step-3-rules'
import { Step4DraftMode } from './step-4-draft-mode'
import { Step5Members } from './step-5-members'
import { Step6Confirm } from './step-6-confirm'

const TOTAL_STEPS = 6

export function CreateLeagueWizard() {
    const router = useRouter()
    const [step, setStep] = useState<WizardStep>(1)
    const [data, setData] = useState<WizardData>({})
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Cargar borrador guardado al montar
    useEffect(() => {
        async function loadDraft() {
            const supabase = createClient()

            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError || !user) {
                console.error('No hay sesión activa al cargar borrador:', userError)
                router.push('/login')
                return
            }

            const { data: draft, error: draftError } = await supabase
                .from('league_drafts')
                .select('current_step, data')
                .eq('user_id', user.id)
                .maybeSingle()

            if (draftError) {
                console.error('Error cargando borrador:', draftError)
                return
            }

            if (draft) {
                setStep(draft.current_step as WizardStep)
                setData((draft.data ?? {}) as WizardData)
            }
        }

        loadDraft()
    }, [router])

    // Guardar borrador automáticamente cuando cambia data o step
    const saveDraft = useCallback(async (newData: WizardData, newStep: WizardStep) => {
        setIsSaving(true)

        const supabase = createClient()

        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser()

            if (userError || !user) {
                console.error('No hay sesión activa al guardar borrador:', userError)
                router.push('/login')
                return
            }

            const { error: draftError } = await supabase
                .from('league_drafts')
                .upsert(
                    {
                        user_id: user.id,
                        current_step: newStep,
                        data: newData as any,
                    },
                    { onConflict: 'user_id' }
                )

            if (draftError) {
                console.error('Error guardando borrador:', draftError)
            }
        } finally {
            setIsSaving(false)
        }
    }, [router])

    function handleChange(partial: Partial<WizardData>) {
        const newData = { ...data, ...partial }
        setData(newData)
        saveDraft(newData, step)
    }

    function handleNext() {
        const newStep = Math.min(step + 1, TOTAL_STEPS) as WizardStep
        setStep(newStep)
        saveDraft(data, newStep)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleBack() {
        const newStep = Math.max(step - 1, 1) as WizardStep
        setStep(newStep)
        saveDraft(data, newStep)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    async function handleConfirm() {
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No hay sesión activa')

            // Generar código único de invitación
            const invitationCode = crypto.randomUUID().split('-')[0].toUpperCase()

            // Crear la quiniela
            const { data: league, error: leagueError } = await supabase
                .from('leagues')
                .insert({
                    owner_id: user.id,
                    name: data.name!,
                    sport: data.sport!,
                    season: data.season!,
                    format_type: data.formatType!,
                    draft_mode: data.draftMode ?? null,
                    status: 'pending',
                })
                .select()
                .single()

            if (leagueError) throw leagueError

            // Agregar al organizador como miembro
            const { error: memberError } = await supabase
                .from('league_members')
                .insert({
                    league_id: league.id,
                    user_id: user.id,
                    role: 'organizer',
                })

            if (memberError) {
                throw memberError
            }

            const { error: invitationError } = await supabase
                .from('league_invitations')
                .insert({
                    league_id: league.id,
                    code: invitationCode,
                    created_by: user.id,
                })

            if (invitationError) {
                throw invitationError
            }

            // Actualizar data con el código de invitación
            const newData = { ...data, invitationCode }
            setData(newData)

            // Limpiar borrador
            await supabase.from('league_drafts').delete().eq('user_id', user.id)

            // Ir al listado de quinielas
            router.push('/leagues')
            router.refresh()
        } catch (error) {
            console.error('Error creando quiniela:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-lg mx-auto">
            <div className="mb-6">
                <h1 className="text-xl font-medium text-gray-900">Nueva quiniela</h1>
                {isSaving && (
                    <p className="text-xs text-gray-400 mt-1">Guardando borrador...</p>
                )}
            </div>

            <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />

            {step === 1 && (
                <Step1Template data={data} onChange={handleChange} onNext={handleNext} />
            )}
            {step === 2 && (
                <Step2Details data={data} onChange={handleChange} onNext={handleNext} onBack={handleBack} />
            )}
            {step === 3 && (
                <Step3Rules data={data} onChange={handleChange} onNext={handleNext} onBack={handleBack} />
            )}
            {step === 4 && (
                <Step4DraftMode data={data} onChange={handleChange} onNext={handleNext} onBack={handleBack} />
            )}
            {step === 5 && (
                <Step5Members data={data} onNext={handleNext} onBack={handleBack} />
            )}
            {step === 6 && (
                <Step6Confirm data={data} onConfirm={handleConfirm} onBack={handleBack} isLoading={isLoading} />
            )}
        </div>
    )
}