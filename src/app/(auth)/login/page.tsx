'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { login } from '@/lib/supabase/actions'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🏆</span>
          <span className="text-lg font-medium">Pura Pools</span>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Únete a tu grupo, sigue tus equipos y compite con tus amigos.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            placeholder="tuemail@correo.com"
            required
          />
          <Input
            name="password"
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button type="submit" isLoading={isLoading}>
            Entrar
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}