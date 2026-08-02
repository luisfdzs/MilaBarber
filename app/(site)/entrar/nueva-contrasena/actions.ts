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

/**
 * GUARDAR LA CONTRASEÑA NUEVA.
 *
 * El token se consume aquí y no al abrir la página: si se gastara al abrir, cerrar la
 * pestaña sin llegar a enviar el formulario dejaría a la persona fuera y con el enlace ya
 * quemado. Se comprueba al abrir, se gasta al guardar.
 *
 * **No se inicia sesión automáticamente.** Es la única pantalla del sitio donde eso sería
 * un error: quien acaba de cambiar la contraseña porque sospecha que alguien la conocía
 * necesita comprobar que la nueva funciona, y el intento de entrar es esa comprobación.
 * Además el correo con el enlace pudo abrirlo cualquiera con acceso al buzón; que abrirlo
 * dé sesión directa convierte un buzón olvidado en una cuenta abierta.
 */
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
