'use server'

import { redirect } from 'next/navigation'
import { createAppointment, getAvailableSlots } from '@/lib/appointments'
import { getBookableBarbers, getServices } from '@/lib/content'
import type { BookingState } from '@/lib/form-state'
import { getSession } from '@/lib/session'
import { findUserById } from '@/lib/users'
import { bookingSchema, fieldErrors } from '@/lib/validation'

/**
 * LOS HUECOS LIBRES, pedidos desde el navegador según se va eligiendo.
 *
 * Es una acción de servidor y no una ruta de API porque hace exactamente lo que hace una
 * acción: recibe unos datos, consulta y devuelve. Una ruta de API para esto obligaría a
 * escribir el `fetch`, el JSON de ida, el JSON de vuelta y el tipo a mano en los dos
 * lados, para acabar en el mismo sitio.
 *
 * **La duración no viene del cliente**: se busca el servicio y se usa la suya. Si viniera
 * del formulario, cualquiera podría pedir los huecos de un corte de cinco minutos y
 * reservar una permanente de dos horas encima de la cita siguiente.
 */
export async function getSlotsAction(
  barberId: string,
  serviceId: string,
  day: string,
): Promise<string[]> {
  const services = await getServices()
  const service = services.find((candidate) => candidate._id === serviceId)
  if (!service) return []
  return getAvailableSlots(barberId, day, service.durationMinutes)
}

/**
 * CONFIRMAR LA CITA.
 *
 * Todo lo que decide algo se vuelve a resolver **en el servidor**: el servicio y el
 * barbero se buscan por id en Sanity, y el precio, la duración y el nombre que se guardan
 * salen de ahí, no del formulario. Lo que llega del navegador son cuatro identificadores y
 * una nota; lo demás se reconstruye. Es la diferencia entre una reserva y un formulario en
 * el que se puede escribir «0 €».
 *
 * SI NO HAY SESIÓN, no se pierde lo elegido. Se manda a la pantalla de acceso con el
 * `next` apuntando a esta misma página **con la selección puesta en la URL**, así que al
 * volver está todo como estaba y sólo queda confirmar. La alternativa —exigir cuenta antes
 * de dejar ver los huecos— es la que tenía la web anterior, y es la razón por la que quien
 * llegaba de Google se marchaba.
 */
export async function bookAction(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const parsed = bookingSchema.safeParse({
    serviceId: String(formData.get('serviceId') ?? ''),
    barberId: String(formData.get('barberId') ?? ''),
    day: String(formData.get('day') ?? ''),
    time: String(formData.get('time') ?? ''),
    notes: String(formData.get('notes') ?? '') || undefined,
  })
  if (!parsed.success) return { errors: fieldErrors(parsed.error) }

  const { serviceId, barberId, day, time, notes } = parsed.data

  const session = await getSession()
  if (!session?.user) {
    const target = `/reservar?servicio=${serviceId}&barbero=${barberId}&dia=${day}&hora=${time}`
    redirect(`/entrar?next=${encodeURIComponent(target)}`)
  }

  const [services, barbers, user] = await Promise.all([
    getServices(),
    getBookableBarbers(),
    findUserById(session.user.id),
  ])

  const service = services.find((candidate) => candidate._id === serviceId)
  const barber = barbers.find((candidate) => candidate._id === barberId)

  if (!service) return { errors: { serviceId: 'Ese servicio ya no está disponible.' } }
  if (!barber) return { errors: { barberId: 'Ese barbero ya no acepta reservas esos días.' } }
  if (!user) return { errors: { form: 'No hemos podido leer tu cuenta. Vuelve a entrar.' } }

  // El teléfono es obligatorio para reservar: es por donde se avisa si hay que mover la
  // cita. Puede faltar en cuentas antiguas, así que se pide antes de dejar reservar en
  // lugar de guardar una cita a la que no se puede llamar.
  if (!user.phone) redirect('/cuenta/perfil?falta=telefono')

  const result = await createAppointment({
    userId: user.id,
    customerName: user.name,
    customerPhone: user.phone,
    service,
    barber,
    day,
    time,
    notes,
  })

  if (!result.ok) {
    const messages = {
      taken: 'Alguien ha cogido ese hueco hace un momento. Elige otra hora.',
      past: 'Esa hora ya ha pasado. Elige otra.',
      closed: 'A esa hora está cerrado. Elige otra.',
    } as const
    return { errors: { form: messages[result.reason] } }
  }

  redirect(`/reservar/confirmada?cita=${result.appointment.id}`)
}
