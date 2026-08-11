'use server'

import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import type { RegisterState } from '@/lib/form-state'
import { createUser } from '@/lib/users'
import { fieldErrors, registerSchema } from '@/lib/validation'

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
    passwordConfirm: String(formData.get('passwordConfirm') ?? ''),
  }

  const values = { name: raw.name, email: raw.email, phone: raw.phone }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values }

  const user = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    password: parsed.data.password,
  })

  if (user) {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    redirect('/cuenta?bienvenida=1')
  }

  redirect('/entrar?ya-registrado=1')
}
