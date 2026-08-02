'use server'

import { revalidatePath } from 'next/cache'
import { cancelAppointmentByStaff } from '@/lib/appointments'
import { requireStaff } from '@/lib/session'

/**
 * Cancelar una cita desde la agenda.
 *
 * `requireStaff` va **lo primero**, antes de mirar siquiera qué id ha llegado: una acción
 * de servidor es una URL más, y quien la descubra puede invocarla con el id que quiera
 * desde fuera de la página. Que la agenda no le pinte el botón no protege nada; lo que
 * protege es esta línea.
 */
export async function cancelFromAgendaAction(formData: FormData): Promise<void> {
  await requireStaff('/cuenta/agenda')

  const appointmentId = String(formData.get('appointmentId') ?? '')
  await cancelAppointmentByStaff(appointmentId)

  // La agenda y la cuenta del cliente enseñan la misma cita desde dos lados: si sólo se
  // revalidara ésta, quien la tuviera reservada seguiría viéndola en pie.
  revalidatePath('/cuenta/agenda')
  revalidatePath('/cuenta')
}
