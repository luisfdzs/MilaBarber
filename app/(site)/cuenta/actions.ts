'use server'

import { revalidatePath } from 'next/cache'
import { signOut } from '@/auth'
import { cancelAppointment } from '@/lib/appointments'
import type { PasswordState, ProfileState } from '@/lib/form-state'
import { requireUser } from '@/lib/session'
import { updatePassword, updateProfile, verifyCredentials } from '@/lib/users'
import { changePasswordSchema, fieldErrors, profileSchema } from '@/lib/validation'

/**
 * Cancelar una cita.
 *
 * El id del usuario **no viene del formulario**, viene de la sesión. Es la única forma de
 * que un id de cita ajeno —que se puede probar a mano— no cancele la cita de otra persona:
 * la consulta filtra por las dos cosas a la vez (ver `cancelAppointment`).
 */
export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireUser('/cuenta')
  const appointmentId = String(formData.get('appointmentId') ?? '')

  await cancelAppointment(appointmentId, user.id)
  // Se revalida pase lo que pase: si no se canceló nada es porque la cita no era suya o ya
  // estaba cancelada, y en los dos casos lo correcto es volver a pintar el estado real.
  revalidatePath('/cuenta')
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: '/' })
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser('/cuenta/perfil')

  const parsed = profileSchema.safeParse({
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error), saved: false }

  await updateProfile(user.id, { name: parsed.data.name, phone: parsed.data.phone || null })

  /**
   * El nombre vive también en el token de sesión, que no se puede reescribir desde aquí:
   * es una cookie firmada que sólo cambia al renovarse. En la práctica no se nota —el
   * nombre sólo se usa como saludo— y a lo sumo tarda un día en ponerse al día
   * (`updateAge` en `auth.ts`). Alternativas: forzar un cierre de sesión, que es peor
   * remedio que la enfermedad, o mover las sesiones a base de datos, que el proveedor de
   * credenciales no admite. Se deja escrito para que nadie lo tome por un fallo.
   */
  revalidatePath('/cuenta/perfil')
  revalidatePath('/cuenta')
  return { errors: {}, saved: true }
}

/**
 * Cambiar la contraseña estando dentro.
 *
 * **Se pide la actual**, aunque haya sesión. No es burocracia: protege el caso real de un
 * móvil desbloqueado que se deja un momento encima de la mesa. Sin ese campo, cualquiera
 * que alcance el teléfono se queda con la cuenta en dos toques.
 */
export async function changePasswordAction(
  _prev: PasswordState,
  formData: FormData,
): Promise<PasswordState> {
  const user = await requireUser('/cuenta/perfil')

  const parsed = changePasswordSchema.safeParse({
    current: String(formData.get('current') ?? ''),
    password: String(formData.get('password') ?? ''),
    passwordConfirm: String(formData.get('passwordConfirm') ?? ''),
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error), saved: false }

  const ok = await verifyCredentials(user.email, parsed.data.current)
  if (!ok) return { errors: { current: 'Esa no es tu contraseña actual.' }, saved: false }

  await updatePassword(user.id, parsed.data.password)
  return { errors: {}, saved: true }
}
