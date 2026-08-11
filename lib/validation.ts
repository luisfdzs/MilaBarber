import { z } from 'zod'

const MIN_PASSWORD = 8

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

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+34\s?)?[6-9]\d{2}(?:\s?\d{2}){3}$/, 'Escribe un teléfono español válido.')

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe tu nombre.')
  .max(60, 'Ese nombre es demasiado largo.')

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
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige un día.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Elige una hora.'),
  notes: z.string().trim().max(300, 'La nota es demasiado larga.').optional(),
})

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!(key in result)) result[key] = issue.message
  }
  return result
}
