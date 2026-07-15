'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

type Props = {
    league: {
        id: string
        name: string
        sport: string
        season: string
        format_type: string
        draft_mode: string | null
        owner_id: string
    }
    members: Array<{
        id: string
        role: string
        is_alive: boolean
        users: {
            id: string
            display_name: string
            email: string
            avatar_url: string | null
        }
    }>
    currentMember: { role: string }
    isOrganizer: boolean
    invitation: {
        id: string
        code: string
        uses: number
        max_uses: number | null
    } | null
}

const SPORT_EMOJI: Record<string, string> = {
    nfl: '🏈',
    soccer: '⚽',
    custom: '🎯',
}

export function PendingView({ league, members, isOrganizer, invitation }: Props) {
    const router = useRouter()
    const [copied, setCopied] = useState(false)
    const [isStarting, setIsStarting] = useState(false)
    const [fullInviteLink, setFullInviteLink] = useState<string | null>(null)

    // Construir el link completo solo en el cliente
    useEffect(() => {
        if (invitation) {
            setFullInviteLink(`${window.location.origin}/join/${invitation.code}`)
        }
    }, [invitation])

    const whatsappText = fullInviteLink
        ? `¡Te invito a la quiniela *${league.name}*! Únete aquí: ${fullInviteLink}`
        : null

    async function handleCopy() {
        if (!fullInviteLink) return
        await navigator.clipboard.writeText(fullInviteLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    function handleWhatsApp() {
        if (!whatsappText) return
        window.open(
            `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
            '_blank'
        )
    }

    async function handleStartDraft() {
        setIsStarting(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('leagues')
            .update({ status: 'draft' })
            .eq('id', league.id)

        if (error) {
            console.error('Error iniciando sorteo:', error)
            setIsStarting(false)
            return
        }

        router.push(`/leagues/${league.id}/draft`)
    }

    return (
        <div className="max-w-2xl mx-auto">

            {/* Header */}
            <div className="flex items-start gap-3 mb-6">
                <span className="text-3xl">{SPORT_EMOJI[league.sport] ?? '🏆'}</span>
                <div>
                    <h1 className="text-xl font-medium text-gray-900">{league.name}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {league.season} · {league.format_type === 'draft_pool' ? 'Sorteo de equipos' : 'Predicciones'}
                    </p>
                </div>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-50 text-yellow-700">
                    Por iniciar
                </span>
            </div>

            {/* Participantes */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-900">
                        Participantes
                    </h2>
                    <span className="text-xs text-gray-400">
                        {members.length} {members.length === 1 ? 'persona' : 'personas'}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center gap-3 py-1"
                        >
                            <Avatar
                                name={member.users.display_name}
                                imageUrl={member.users.avatar_url}
                                size="sm"
                            />
                            <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-900 truncate block">
                                    {member.users.display_name}
                                </span>
                                <span className="text-xs text-gray-400 truncate block">
                                    {member.users.email}
                                </span>
                            </div>
                            {member.role === 'organizer' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium shrink-0">
                                    Organizador
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Link de invitación */}
            {invitation && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                    <h2 className="text-sm font-medium text-gray-900 mb-1">
                        Invita a tus amigos
                    </h2>
                    <p className="text-xs text-gray-400 mb-3">
                        Comparte este link para que se unan a la quiniela.
                        {invitation.uses > 0 && ` · ${invitation.uses} persona${invitation.uses > 1 ? 's' : ''} se han unido con este link.`}
                    </p>

                    {/* Link */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 font-mono text-xs text-gray-600 break-all">
                        {fullInviteLink ?? `Cargando link...`}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleCopy}
                            className={`
                flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all
                ${copied
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }
              `}
                        >
                            {copied ? '✓ Copiado' : 'Copiar link'}
                        </button>
                        <button
                            onClick={handleWhatsApp}
                            className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                            <span>📱</span> WhatsApp
                        </button>
                    </div>
                </div>
            )}

            {/* Botón iniciar sorteo — solo organizador */}
            {isOrganizer && league.format_type === 'draft_pool' && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-medium text-gray-900 mb-1">
                        Iniciar sorteo
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">
                        Cuando todos estén listos, inicia el sorteo para asignar los equipos.
                        {members.length < 2 && ' Necesitas al menos 2 participantes para iniciar.'}
                    </p>
                    <button
                        onClick={handleStartDraft}
                        disabled={isStarting || members.length < 2}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
                    >
                        {isStarting ? 'Iniciando...' : '🎲 Iniciar sorteo'}
                    </button>
                </div>
            )}

            {/* Para quinielas de predicciones */}
            {isOrganizer && league.format_type === 'predictions' && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-medium text-gray-900 mb-1">
                        Activar quiniela
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">
                        Cuando todos estén listos, activa la quiniela para empezar a registrar predicciones.
                    </p>
                    <button
                        disabled
                        className="w-full bg-blue-600 opacity-40 cursor-not-allowed text-white font-medium text-sm py-2.5 rounded-lg"
                    >
                        🔮 Activar quiniela — próximamente
                    </button>
                </div>
            )}

            {/* Vista para participantes no organizadores */}
            {!isOrganizer && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <span className="text-2xl">⏳</span>
                    <p className="text-sm text-gray-500 mt-2">
                        Esperando a que el organizador inicie el sorteo.
                    </p>
                </div>
            )}
        </div>
    )
}