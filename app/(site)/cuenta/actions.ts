'use server'

import { revalidatePath } from 'next/cache'
import { signOut } from '@/auth'
import { cancelAppointment } from '@/lib/appointments'
import type { PasswordState, ProfileState } from '@/lib/form-state'
import { requireUser } from '@/lib/session'
import { updatePassword, updateProfile, verifyCredentials } from '@/lib/users'
import { changePasswordSchema, fieldErrors, profileSchema } from '@/lib/validation'

export async function cancelAppointmentAction(formData: FormData): Promise<void> {
  const user = await requireUser('/cuenta')
  const appointmentId = String(formData.get('appointmentId') ?? '')

  await cancelAppointment(appointmentId, user.id)
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

  revalidatePath('/cuenta/perfil')
  revalidatePath('/cuenta')
  return { errors: {}, saved: true }
}

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
