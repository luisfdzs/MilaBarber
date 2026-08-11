'use server'

import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import type { SignInState } from '@/lib/form-state'
import { credentialsSchema } from '@/lib/validation'

const GENERIC_ERROR = 'El correo o la contraseña no son correctos.'

function safeNext(next: unknown): string {
  if (typeof next !== 'string') return '/cuenta'
  if (!next.startsWith('/') || next.startsWith('//')) return '/cuenta'
  return next
}

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: GENERIC_ERROR }

  const next = safeNext(formData.get('next'))

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) return { error: GENERIC_ERROR }
    throw error
  }

  redirect(next)
}
