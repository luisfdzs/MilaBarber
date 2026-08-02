import { z } from 'zod'

/**
 * LO QUE SE ACEPTA DE UN FORMULARIO, en un solo sitio.
 *
 * Los mismos esquemas los usan la acción de servidor y —cuando hace falta— el cliente.
 * La validación que cuenta es siempre la del servidor: la del navegador existe para
 * avisar antes, no para proteger nada.
 */

/** Mínimo real, no simbólico. Ocho es lo que pide el consenso actual (NIST) y lo que
 *  aguanta el bcrypt de coste 12 sin que nadie note la espera. */
const MIN_PASSWORD = 8

/**
 * bcrypt sólo mira los **72 primeros bytes**. Aceptar más largo no da error pero engaña:
 * dos contraseñas que coincidan en los primeros 72 bytes serían la misma. Se corta aquí
 * y se dice, en vez de dejar que la gente crea que su frase de 90 caracteres cuenta
 * entera.
 */
const MAX_PASSWORD = 72

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD, `La contraseña necesita al menos ${MIN_PASSWORD} caracteres.`)
  .max(MAX_PASSWORD, `La contraseña no puede pasar de ${MAX_PASSWORD} caracteres.`)

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Ese correo no parece completo.')
  .max(254, 'Ese correo es demasiado largo.')

/**
 * Teléfono español, con o sin prefijo, con o sin espacios. Es opcional en el perfil pero
 * **obligatorio para reservar**: si alguien no aparece, la barbería llama; y si hay que
 * avisar de que el barbero está enfermo, llama. Un correo no sirve para eso.
 */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+34\s?)?[6-9]\d{2}(?:\s?\d{2}){3}$/, 'Escribe un teléfono español válido.')

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe tu nombre.')
  .max(60, 'Ese nombre es demasiado largo.')

/** Lo que `authorize` recibe del formulario de acceso. Aquí NO se exige longitud mínima:
 *  quien tenga una contraseña antigua más corta debe poder entrar igual y cambiarla
 *  después. Las reglas de fuerza son para crear, no para comprobar. */
export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
})

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Las dos contraseñas no coinciden.',
  })

export const profileSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.or(z.literal('')),
})

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, 'Escribe tu contraseña actual.'),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Las dos contraseñas no coinciden.',
  })

export const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Elige un servicio.'),
  barberId: z.string().min(1, 'Elige con quién quieres cortarte.'),
  /** `YYYY-MM-DD`. */
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige un día.'),
  /** `HH:MM` en 24 h. */
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Elige una hora.'),
  notes: z.string().trim().max(300, 'La nota es demasiado larga.').optional(),
})

/**
 * Convierte los errores de zod en algo que un formulario pueda pintar: un mensaje por
 * campo, el primero de cada uno. Enseñar los tres errores de un mismo campo a la vez no
 * ayuda a nadie a corregirlo.
 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!(key in result)) result[key] = issue.message
  }
  return result
}
