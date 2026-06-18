'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string | null

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Correo o contraseña incorrectos' }
  }

  redirect(redirectTo ?? '/leagues')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName }
    }
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este correo ya tiene una cuenta registrada' }
    }
    return { error: 'Ocurrió un error al crear tu cuenta' }
  }

  redirect('/leagues')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}