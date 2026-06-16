'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
          },
        },
      })

      console.log('SUPABASE SIGNUP DATA:', data)
      console.log('SUPABASE SIGNUP ERROR:', error)

      if (error) {
        console.error('Error completo de Supabase:', {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code,
        })

        setError(`Supabase error: ${error.message}`)
        return
      }

      router.push('/leagues')
      router.refresh()
    } catch (err) {
      console.error('Error inesperado en handleRegister:', err)
      setError('Error inesperado en el registro. Revisa la consola.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">🏆</span>
          <span className="text-lg font-medium text-gray-900">Pura Pools</span>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Crea tu cuenta para empezar a jugar.
        </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Tu nombre
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Como quieres que te vean los demás"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tuemail@correo.com"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg py-2.5 transition-colors mt-1"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-5">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
