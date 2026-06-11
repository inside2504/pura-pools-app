import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verifica que hay sesión activa — si no, manda al login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Trae el perfil del usuario desde nuestra tabla users
  const { data: profile } = await supabase
    .from('users')
    .select('display_name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-sm text-center">
        <span className="text-4xl">🏆</span>
        <h1 className="text-lg font-medium text-gray-900 mt-3">
          ¡Bienvenido, {profile?.display_name}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
        <p className="text-xs text-gray-400 mt-4">
          Sesión activa — el dashboard real viene pronto.
        </p>

        {/* Botón de logout temporal */}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="mt-6 text-xs text-red-500 hover:underline"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
