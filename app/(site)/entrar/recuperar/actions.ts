'use server'

import { headers } from 'next/headers'
import { site } from '@/content/site'
import { sendPasswordResetEmail } from '@/lib/email'
import type { ResetRequestState } from '@/lib/form-state'
import { createResetToken, RESET_MINUTES } from '@/lib/password-reset'
import { findUserByEmail } from '@/lib/users'
import { emailSchema } from '@/lib/validation'

export async function requestResetAction(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = emailSchema.safeParse(formData.get('email'))
  if (!parsed.success) return { sent: false, error: 'Escribe un correo válido.' }

  const user = await findUserByEmail(parsed.data)

  if (user) {
    const token = await createResetToken(user._id.toHexString())
    const url = `${await currentOrigin()}/entrar/nueva-contrasena?token=${token}`
    try {
      await sendPasswordResetEmail({ to: user.email, url, minutes: RESET_MINUTES })
    } catch (error) {
      console.error('[recuperar] No se ha podido enviar el correo.', error)
    }
  }

  return { sent: true, error: null }
}

async function currentOrigin(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  if (!host) return site.url
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}
