'use server'

import { redirect } from 'next/navigation'
import type { NewPasswordState } from '@/lib/form-state'
import { consumeResetToken } from '@/lib/password-reset'
import { updatePassword } from '@/lib/users'
import { fieldErrors, passwordSchema } from '@/lib/validation'
import { z } from 'zod'

const schema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Las dos contraseñas no coinciden.',
  })

export async function setNewPasswordAction(
  _prev: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const parsed = schema.safeParse({
    token: String(formData.get('token') ?? ''),
    password: String(formData.get('password') ?? ''),
    passwordConfirm: String(formData.get('passwordConfirm') ?? ''),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }

  const userId = await consumeResetToken(parsed.data.token)
  if (!userId) {
    return {
      errors: {
        form: 'Este enlace ya no vale: o ha caducado o ya se ha usado. Pide otro.',
      },
    }
  }

  await updatePassword(userId, parsed.data.password)
  redirect('/entrar?cambiada=1')
}
