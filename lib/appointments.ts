import 'server-only'
import { ObjectId, type Collection } from 'mongodb'
import { site } from '@/content/site'
import type { Barber, Service } from './content-types'
import { getClient, getDb } from './db'
import { parseIsoDay, toIsoDay } from './format'

export const SLOT_MINUTES = 15

const LEAD_MINUTES = 30

export const HORIZON_DAYS = 60

export type AppointmentStatus = 'confirmed' | 'cancelled'

export type AppointmentDoc = {
  _id: ObjectId
  userId: ObjectId
  customerName: string
  customerPhone: string | null

  barberId: string
  barberName: string

  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number

  start: Date
  end: Date

  status: AppointmentStatus
  notes: string | null
  createdAt: Date
  cancelledAt: Date | null
}

export type Appointment = Omit<AppointmentDoc, '_id' | 'userId'> & {
  id: string
  userId: string
}

async function appointments(): Promise<Collection<AppointmentDoc>> {
  return (await getDb()).collection<AppointmentDoc>('appointments')
}

function toPublic(doc: AppointmentDoc): Appointment {
  const { _id, userId, ...rest } = doc
  return { ...rest, id: _id.toHexString(), userId: userId.toHexString() }
}

export async function getAvailableSlots(
  barberId: string,
  day: string,
  durationMinutes: number,
): Promise<string[]> {
  const date = parseIsoDay(day)
  if (!site.hours.days.includes(date.getDay() as (typeof site.hours.days)[number])) return []

  const opens = atTime(date, site.hours.opens)
  const closes = atTime(date, site.hours.closes)
  const earliest = new Date(Date.now() + LEAD_MINUTES * 60_000)

  const busy = await getDayAppointments(barberId, day)

  const slots: string[] = []
  for (let cursor = new Date(opens); cursor < closes; cursor = addMinutes(cursor, SLOT_MINUTES)) {
    const end = addMinutes(cursor, durationMinutes)
    if (end > closes) break
    if (cursor < earliest) continue
    if (busy.some((appointment) => overlaps(cursor, end, appointment.start, appointment.end))) {
      continue
    }
    slots.push(formatTime(cursor))
  }
  return slots
}

async function getDayAppointments(barberId: string, day: string): Promise<AppointmentDoc[]> {
  const from = parseIsoDay(day)
  const to = addMinutes(from, 24 * 60)
  return (await appointments())
    .find({ barberId, status: 'confirmed', start: { $gte: from, $lt: to } })
    .sort({ start: 1 })
    .toArray()
}

export async function getDayAvailability(
  barberId: string,
  durationMinutes: number,
  days: string[],
): Promise<Record<string, boolean>> {
  const entries = await Promise.all(
    days.map(
      async (day) =>
        [day, (await getAvailableSlots(barberId, day, durationMinutes)).length > 0] as const,
    ),
  )
  return Object.fromEntries(entries)
}

export function getOpenDays(from: Date = new Date(), horizon = HORIZON_DAYS): string[] {
  const days: string[] = []
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < horizon; i += 1) {
    if (site.hours.days.includes(cursor.getDay() as (typeof site.hours.days)[number])) {
      days.push(toIsoDay(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export type BookingResult =
  { ok: true; appointment: Appointment } | { ok: false; reason: 'taken' | 'past' | 'closed' }

export async function createAppointment(input: {
  userId: string
  customerName: string
  customerPhone: string | null
  service: Service
  barber: Barber
  day: string
  time: string
  notes?: string | null
}): Promise<BookingResult> {
  const start = atTime(parseIsoDay(input.day), input.time)
  const end = addMinutes(start, input.service.durationMinutes)

  if (start.getTime() < Date.now() + LEAD_MINUTES * 60_000) return { ok: false, reason: 'past' }

  const date = parseIsoDay(input.day)
  if (!site.hours.days.includes(date.getDay() as (typeof site.hours.days)[number])) {
    return { ok: false, reason: 'closed' }
  }
  if (start < atTime(date, site.hours.opens) || end > atTime(date, site.hours.closes)) {
    return { ok: false, reason: 'closed' }
  }

  const client = await getClient()
  const session = client.startSession()

  try {
    let result: BookingResult = { ok: false, reason: 'taken' }

    await session.withTransaction(async () => {
      const collection = await appointments()

      const clash = await collection.findOne(
        {
          barberId: input.barber._id,
          status: 'confirmed',
          start: { $lt: end },
          end: { $gt: start },
        },
        { session },
      )

      if (clash) {
        result = { ok: false, reason: 'taken' }
        return
      }

      const doc: Omit<AppointmentDoc, '_id'> = {
        userId: new ObjectId(input.userId),
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        barberId: input.barber._id,
        barberName: input.barber.name,
        serviceId: input.service._id,
        serviceName: input.service.name,
        servicePrice: input.service.price,
        serviceDuration: input.service.durationMinutes,
        start,
        end,
        status: 'confirmed',
        notes: input.notes?.trim() || null,
        createdAt: new Date(),
        cancelledAt: null,
      }

      const inserted = await collection.insertOne(doc as AppointmentDoc, { session })
      result = {
        ok: true,
        appointment: toPublic({ ...doc, _id: inserted.insertedId } as AppointmentDoc),
      }
    })

    return result
  } finally {
    await session.endSession()
  }
}

export async function cancelAppointment(appointmentId: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(appointmentId) || !ObjectId.isValid(userId)) return false

  const result = await (
    await appointments()
  ).updateOne(
    {
      _id: new ObjectId(appointmentId),
      userId: new ObjectId(userId),
      status: 'confirmed',
    },
    { $set: { status: 'cancelled', cancelledAt: new Date() } },
  )
  return result.modifiedCount === 1
}

export async function cancelAppointmentByStaff(appointmentId: string): Promise<boolean> {
  if (!ObjectId.isValid(appointmentId)) return false

  const result = await (
    await appointments()
  ).updateOne(
    { _id: new ObjectId(appointmentId), status: 'confirmed' },
    { $set: { status: 'cancelled', cancelledAt: new Date() } },
  )
  return result.modifiedCount === 1
}

export async function getUserAppointments(userId: string): Promise<{
  upcoming: Appointment[]
  past: Appointment[]
}> {
  if (!ObjectId.isValid(userId)) return { upcoming: [], past: [] }

  const docs = await (
    await appointments()
  )
    .find({ userId: new ObjectId(userId) })
    .sort({ start: -1 })
    .limit(100)
    .toArray()

  const now = new Date()
  const upcoming: Appointment[] = []
  const past: Appointment[] = []

  for (const doc of docs) {
    const appointment = toPublic(doc)
    if (doc.status === 'confirmed' && doc.end > now) upcoming.push(appointment)
    else past.push(appointment)
  }

  upcoming.reverse()
  return { upcoming, past }
}

export async function getUserAppointment(
  appointmentId: string,
  userId: string,
): Promise<Appointment | null> {
  if (!ObjectId.isValid(appointmentId) || !ObjectId.isValid(userId)) return null
  const doc = await (
    await appointments()
  ).findOne({ _id: new ObjectId(appointmentId), userId: new ObjectId(userId) })
  return doc ? toPublic(doc) : null
}

export async function getAgenda(day: string): Promise<Appointment[]> {
  const from = parseIsoDay(day)
  const to = addMinutes(from, 24 * 60)
  const docs = await (
    await appointments()
  )
    .find({ status: 'confirmed', start: { $gte: from, $lt: to } })
    .sort({ start: 1 })
    .toArray()
  return docs.map(toPublic)
}

function atTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(day)
  result.setHours(hours ?? 0, minutes ?? 0, 0, 0)
  return result
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000)
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart
}
