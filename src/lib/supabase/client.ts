import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Cliente para usar en Client Components (navegador)
// Se crea una sola instancia por sesión
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
