'use client'

import { useState } from 'react'
import { WizardData } from '@/types/wizard'

type Props = {
  data: WizardData
  onNext: () => void
  onBack: () => void
}

export function Step5Members({ data, onNext, onBack }: Props) {
  const [copied, setCopied] = useState(false)

  const inviteLink = data.invitationCode
    ? `${window.location.origin}/join/${data.invitationCode}`
    : null

  const whatsappMessage = inviteLink
    ? `¡Te invito a la quiniela *${data.name}*! Únete aquí: ${inviteLink}`
    : null

  async function handleCopy() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsApp() {
    if (!whatsappMessage) return
    window.open(
      `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
      '_blank'
    )
  }

  return (
    <div>
      <h2 className="text-base font-medium text-gray-900 mb-1">
        Invita a tus amigos
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Comparte el link para que se unan a la quiniela.
      </p>

      {inviteLink ? (
        <div className="flex flex-col gap-4 mb-8">
          {/* Link */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
              Link de invitación
            </p>
            <p className="text-sm text-gray-700 font-mono break-all mb-3">
              {inviteLink}
            </p>
            <button
              onClick={handleCopy}
              className={`
                w-full py-2 text-sm font-medium rounded-lg border-2 transition-all
                ${copied
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }
              `}
            >
              {copied ? '✓ Link copiado' : 'Copiar link'}
            </button>
          </div>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">📱</span>
            Compartir por WhatsApp
          </button>

          <p className="text-xs text-center text-gray-400">
            Puedes compartir este link las veces que quieras. Puedes desactivarlo desde la configuración de la quiniela.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center mb-8">
          <span className="text-3xl">⏳</span>
          <p className="text-sm text-gray-500 mt-2">
            El link se genera al confirmar la quiniela en el siguiente paso.
          </p>
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
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          {inviteLink ? 'Ir a mi quiniela' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}