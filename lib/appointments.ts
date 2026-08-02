import 'server-only'
import { ObjectId, type Collection } from 'mongodb'
import { site } from '@/content/site'
import type { Barber, Service } from './content-types'
import { getClient, getDb } from './db'
import { parseIsoDay, toIsoDay } from './format'

/**
 * LAS CITAS.
 *
 * La regla que gobierna todo este fichero: **una cita es una foto del momento en que se
 * reservó, no un puñado de referencias.** El nombre del servicio, su precio y su duración
 * se copian dentro del documento en lugar de guardar sólo el id.
 *
 * Puede parecer redundante y es justo lo contrario. Si mañana el corte sube de 14 a 16 €,
 * la cita de la semana pasada tiene que seguir diciendo 14 € —es lo que se cobró— y la
 * agenda del jueves tiene que seguir ocupando los 30 minutos con los que se reservó,
 * aunque la duración se cambie a 45 en el panel. Guardando sólo el id, cambiar un precio
 * reescribiría el pasado y cambiar una duración descuadraría citas ya confirmadas.
 *
 * Lo mismo con el barbero: el nombre se copia. Los servicios y los barberos viven en
 * Sanity, que es otro sistema; un documento borrado allí no puede dejar una cita sin
 * nombre aquí.
 *
 * ⚠️ TODO ESTE FICHERO CUENTA LAS HORAS EN LA ZONA HORARIA DEL PROCESO. En local eso es
 * la de tu máquina y todo cuadra; **en Vercel, por defecto, es UTC**, y en verano España
 * va dos horas por delante: la barbería abriría a las 11:00 y el último hueco de la tarde
 * desaparecería. Por eso `instrumentation.ts` fija `Europe/Madrid` en el arranque del
 * servidor, antes de la primera petición.
 *
 * **No es una variable de entorno**: `TZ` está reservada en Vercel y no se puede definir
 * (ver el comentario largo de `instrumentation.ts`).
 *
 * Se resuelve con la zona del proceso en vez de con una librería de husos a propósito:
 * este negocio está en una sola ciudad y todas sus horas son horas de Pamplona. Meter
 * conversiones por todas partes para un caso que no existe sólo añade sitios donde
 * equivocarse.
 */

/** La rejilla de la agenda. Todo empieza en un múltiplo de quince minutos. */
export const SLOT_MINUTES = 15

/**
 * Cuánto antes hay que reservar. Media hora: ofrecer la cita de dentro de cinco minutos
 * es ofrecer algo que no se puede cumplir —nadie llega— y deja al barbero con el hueco
 * bloqueado y sin nadie delante.
 */
const LEAD_MINUTES = 30

/** Hasta cuándo se abre el calendario. Más de dos meses no lo usa nadie y multiplica las
 *  cancelaciones. */
export const HORIZON_DAYS = 60

export type AppointmentStatus = 'confirmed' | 'cancelled'

export type AppointmentDoc = {
  _id: ObjectId
  userId: ObjectId
  /** Copia del cliente, para que la agenda del barbero no necesite otra consulta. */
  customerName: string
  customerPhone: string | null

  barberId: string
  barberName: string

  serviceId: string
  serviceName: string
  servicePrice: number
  serviceDuration: number

  /** Instantes absolutos. `end` se guarda calculado para poder consultar solapes. */
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

/* ---------------------------------------------------------------------------
   Huecos libres
   ------------------------------------------------------------------------ */

/**
 * Los huecos a los que se puede reservar con este barbero, este día y este servicio.
 *
 * Cuatro filtros, en este orden y por este motivo:
 *
 * 1. **¿Abre ese día?** Los domingos no hay nada que consultar (`site.hours.days`).
 * 2. **¿Cabe el servicio antes de cerrar?** Una permanente de dos horas no se puede
 *    empezar a las 20:00 aunque las 20:00 esté libre. Es el error clásico de los
 *    calendarios que sólo miran la hora de inicio.
 * 3. **¿Ya pasó?** Con el margen de `LEAD_MINUTES`.
 * 4. **¿Choca con otra cita?** Solape real de intervalos, no coincidencia de hora de
 *    inicio: una cita de 60 minutos a las 10:00 tapa también las 10:15, las 10:30 y las
 *    10:45.
 *
 * Las vacaciones no se comprueban aquí: quien no está disponible ni siquiera aparece en
 * la lista de barberos (ver `getBookableBarbers` en `lib/content.ts`).
 */
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

/** Las citas confirmadas de un barbero en un día, ordenadas. */
async function getDayAppointments(barberId: string, day: string): Promise<AppointmentDoc[]> {
  const from = parseIsoDay(day)
  const to = addMinutes(from, 24 * 60)
  return (await appointments())
    .find({ barberId, status: 'confirmed', start: { $gte: from, $lt: to } })
    .sort({ start: 1 })
    .toArray()
}

/**
 * Los días del calendario con una marca de si les queda algún hueco.
 *
 * Se calcula el día entero para poder **apagar los días completos en la propia rejilla**,
 * en vez de dejar que la persona elija un día, espere a que carguen las horas y descubra
 * que no hay ninguna. Cuesta una consulta por día, pero son sesenta documentos como mucho
 * en una barbería de dos personas: es barato y se nota.
 */
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

/** Los próximos `HORIZON_DAYS` días en los que la barbería abre, en formato `YYYY-MM-DD`. */
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

/* ---------------------------------------------------------------------------
   Reservar y cancelar
   ------------------------------------------------------------------------ */

export type BookingResult =
  { ok: true; appointment: Appointment } | { ok: false; reason: 'taken' | 'past' | 'closed' }

/**
 * Reserva una cita.
 *
 * **Se hace dentro de una transacción** porque entre comprobar que el hueco está libre y
 * escribir la cita cabe otra reserva. Es raro en una barbería de dos sillones, pero el día
 * que pasa deja a dos personas en la puerta a la misma hora, y ésa es exactamente la clase
 * de fallo por la que se deja de usar una web de reservas. MongoDB Atlas es un conjunto de
 * réplicas y admite transacciones; un `mongod` suelto de desarrollo, no —si algún día se
 * usa uno, esto falla ruidosamente en vez de reservar dos veces, que es el lado correcto
 * en el que fallar.
 *
 * El servicio y el barbero llegan ya resueltos desde Sanity: esta función no consulta el
 * CMS. Así el precio y la duración que se guardan son exactamente los que se le enseñaron
 * a la persona en la pantalla anterior, y no los que hubiera en el panel medio segundo
 * después.
 */
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

      // Solape real: cualquier cita confirmada de este barbero que empiece antes de que
      // ésta acabe y acabe después de que ésta empiece.
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

/**
 * Cancela una cita. Devuelve `false` si no existe, si no es de esta persona o si ya estaba
 * cancelada — sin distinguir entre los tres casos: quien no es dueño de la cita tampoco
 * tiene por qué enterarse de que existe.
 *
 * **No se borra, se marca.** La barbería necesita saber que ese hueco estuvo reservado y
 * se soltó; y quien cancela dos veces por descuido no debe ver un error.
 */
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

/**
 * Cancela una cita **desde la barbería**, sea de quien sea.
 *
 * Es la misma operación que la de arriba sin el filtro de dueño, y va en una función
 * aparte justo por eso: quien lea `cancelAppointment` no tiene que preguntarse si algún
 * parámetro opcional se salta la comprobación de propiedad. Aquí se salta siempre, se ve
 * en el nombre, y quien llama está obligado a haber pasado por `requireStaff`.
 *
 * El caso real que la justifica: el barbero se pone enfermo y hay que soltar la mañana
 * entera. Sin esto, habría que entrar en Atlas a mano.
 */
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

/* ---------------------------------------------------------------------------
   Consultas
   ------------------------------------------------------------------------ */

/** Las citas de una persona: primero las que están por venir, luego el historial. */
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
    // Una cita cancelada nunca es «próxima» aunque su hora esté por llegar: no hay nada
    // que esperar. Va al historial, donde se ve que existió y que se soltó.
    if (doc.status === 'confirmed' && doc.end > now) upcoming.push(appointment)
    else past.push(appointment)
  }

  // Las próximas, de la más cercana a la más lejana: es el orden en que se van a vivir.
  upcoming.reverse()
  return { upcoming, past }
}

/**
 * Una cita concreta, **sólo si es de esta persona**. Los dos filtros van en la misma
 * consulta: buscar por id y comprobar el dueño después deja una ventana en la que el
 * documento ya está en memoria, y es justo el patrón por el que se filtran datos ajenos.
 * Devuelve `null` tanto si no existe como si es de otra persona; quien prueba ids no tiene
 * por qué distinguir los dos casos.
 */
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

/** La agenda de un día, para la barbería. Todos los barberos, en orden de hora. */
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

/* ---------------------------------------------------------------------------
   Utilidades de tiempo
   ------------------------------------------------------------------------ */

/** Un `Date` con la fecha de `day` y la hora `HH:MM`, en hora local. */
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

/** Dos intervalos [aStart, aEnd) y [bStart, bEnd) se pisan. */
function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart
}
