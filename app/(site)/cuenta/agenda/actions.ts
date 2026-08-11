'use server'

import { revalidatePath } from 'next/cache'
import { cancelAppointmentByStaff } from '@/lib/appointments'
import { requireStaff } from '@/lib/session'

export async function cancelFromAgendaAction(formData: FormData): Promise<void> {
  await requireStaff('/cuenta/agenda')

  const appointmentId = String(formData.get('appointmentId') ?? '')
  await cancelAppointmentByStaff(appointmentId)

  revalidatePath('/cuenta/agenda')
  revalidatePath('/cuenta')
}
