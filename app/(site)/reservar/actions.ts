'use server'

import { redirect } from 'next/navigation'
import { createAppointment, getAvailableSlots } from '@/lib/appointments'
import { getBookableBarbers, getServices } from '@/lib/content'
import type { BookingState } from '@/lib/form-state'
import { getSession } from '@/lib/session'
import { findUserById } from '@/lib/users'
import { bookingSchema, fieldErrors } from '@/lib/validation'

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
