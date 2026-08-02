'use server'

import { headers } from 'next/headers'
import { site } from '@/content/site'
import { sendPasswordResetEmail } from '@/lib/email'
import type { ResetRequestState } from '@/lib/form-state'
import { createResetToken, RESET_MINUTES } from '@/lib/password-reset'
import { findUserByEmail } from '@/lib/users'
import { emailSchema } from '@/lib/validation'

/**
 * PEDIR EL ENLACE PARA CAMBIAR LA CONTRASEÑA.
 *
 * **Se responde lo mismo exista o no el correo**: «si esa dirección tiene cuenta, te hemos
 * escrito». Es el mismo motivo que en el acceso y en el registro — contestar «ese correo no
 * está registrado» convierte este formulario en una forma de averiguar quién es cliente de
 * la barbería probando direcciones.
 *
 * El envío se hace **antes** de responder y no en segundo plano a propósito: en una función
 * sin servidor, el trabajo que queda pendiente después de responder se puede quedar sin
 * ejecutar cuando la instancia se apaga. Cuesta un par de segundos de espera y a cambio el
 * correo sale de verdad.
 */
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
      // Un fallo de SMTP no se le cuenta a quien lo pidió —no puede hacer nada con esa
      // información y delataría que el correo existe—, pero sí tiene que quedar en los
      // registros, porque significa que la recuperación está caída.
      console.error('[recuperar] No se ha podido enviar el correo.', error)
    }
  }

  return { sent: true, error: null }
}

/**
 * El origen desde el que se está sirviendo, para construir un enlace absoluto.
 *
 * Se lee de la cabecera y no de una constante porque este código corre en tres sitios con
 * URL distinta: local, el entorno de test y producción. Con una constante, el enlace del
 * correo de test llevaría a producción y cambiaría la contraseña de verdad desde una
 * prueba. `site.url` queda de red de seguridad por si algún día se llama desde donde no
 * hay petición.
 */
async function currentOrigin(): Promise<string> {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host')
  if (!host) return site.url
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}
