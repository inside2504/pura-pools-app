'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

type NavbarProps = {
  displayName: string
  email: string
  avatarUrl?: string | null
}

export function Navbar({ displayName, email, avatarUrl }: NavbarProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
      
      {/* Logo */}
      <Link
        href="/leagues"
        className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity"
      >
        <span className="text-xl">🏆</span>
        <span className="font-medium text-sm">Pura Pools</span>
      </Link>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-gray-900 leading-tight">
            {displayName}
          </span>
          <span className="text-xs text-gray-400 leading-tight">
            {email}
          </span>
        </div>

        <Avatar name={displayName} imageUrl={avatarUrl} size="sm" />

        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
        >
          Salir
        </button>
      </div>
    </header>
  )
}