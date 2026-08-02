import type { Metadata } from 'next'
import Link from 'next/link'
import { AgendaEntry } from '@/components/sections/AgendaEntry'
import { PageHeader } from '@/components/sections/PageHeader'
import { site } from '@/content/site'
import { getAgenda } from '@/lib/appointments'
import { formatDay, formatPrice, parseIsoDay, toIsoDay } from '@/lib/format'
import { requireStaff } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Agenda',
  robots: { index: false, follow: false },
}

/**
 * LA AGENDA DE LA BARBERÍA.
 *
 * Un día, todas las citas de todos los barberos, en orden de hora. No una por barbero:
 * son dos sillones en la misma sala, y quien mira esta pantalla quiere saber qué pasa en
 * la barbería a las once, no qué hace cada cual por separado.
 *
 * **El día viaja en la URL** (`?dia=2026-08-04`) y no en el estado de un componente de
 * cliente. Así la agenda del jueves se puede guardar en marcadores, mandar por WhatsApp al
 * compañero y recargar sin perderla; y la página entera se queda en el servidor, sin
 * enviar un solo kilobyte de JavaScript para pintar una lista.
 *
 * Se navega con enlaces por el mismo motivo. Un selector de fecha nativo obligaría a un
 * componente de cliente y a un `onChange` que empuja la ruta, y lo que se hace de verdad
 * es mirar hoy, mirar mañana y volver a hoy.
 */
export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>
}) {
  // La guarda y los parámetros a la vez: la comprobación de papel toca la base y no
  // depende de la URL, así que no hay razón para esperarla antes de leerla.
  const [, params] = await Promise.all([requireStaff('/cuenta/agenda'), searchParams])

  const today = toIsoDay(new Date())
  const day = resolveDay(params.dia) ?? today
  const date = parseIsoDay(day)

  const open = site.hours.days.includes(date.getDay() as (typeof site.hours.days)[number])
  const appointments = await getAgenda(day)
  const takings = appointments.reduce((total, one) => total + one.servicePrice, 0)

  return (
    <>
      <PageHeader
        eyebrow={day === today ? 'Agenda de hoy' : 'Agenda'}
        title={capitalize(formatDay(date))}
        lead={
          appointments.length === 0
            ? undefined
            : `${appointments.length} ${appointments.length === 1 ? 'cita' : 'citas'} · ${formatPrice(takings)}`
        }
      />

      <div className="page-gutter mx-auto max-w-3xl pb-(--spacing-section)">
        <nav
          aria-label="Cambiar de día"
          className="flex items-center justify-between gap-4 border-y border-line py-3"
        >
          <Link href={dayHref(shift(day, -1))} className="link-underline tap eyebrow" rel="prev">
            ← Día anterior
          </Link>

          {/* «Hoy» sólo aparece cuando sirve de algo. Un enlace al sitio en el que ya
              estás es ruido que además se puede pulsar. */}
          {day !== today && (
            <Link href={dayHref(today)} className="link-underline tap eyebrow text-gold">
              Hoy
            </Link>
          )}

          <Link href={dayHref(shift(day, 1))} className="link-underline tap eyebrow" rel="next">
            Día siguiente →
          </Link>
        </nav>

        {appointments.length === 0 ? (
          <p className="mt-10 border border-line bg-coal p-8 text-center text-body text-bone-soft">
            {/* Un día sin citas y un día cerrado se ven igual en la base —cero
                documentos— y no significan lo mismo. Distinguirlos evita el sobresalto de
                abrir el domingo y creer que se ha vaciado la agenda. */}
            {open ? 'Ningún hueco reservado este día.' : site.hours.closedLabel}
          </p>
        ) : (
          <ul className="mt-8 flex flex-col gap-4">
            {appointments.map((appointment) => (
              <li key={appointment.id}>
                <AgendaEntry appointment={appointment} />
              </li>
            ))}
          </ul>
        )}

        <p className="mt-12 text-center">
          <Link href="/cuenta" className="link-underline tap eyebrow">
            Volver a mi cuenta
          </Link>
        </p>
      </div>
    </>
  )
}

/**
 * El día que pide la URL, o `null` si no es una fecha real.
 *
 * No basta con la forma `YYYY-MM-DD`: `2026-02-31` la cumple y `parseIsoDay` lo convierte
 * en el 3 de marzo, así que la agenda enseñaría un día distinto del que pone la dirección.
 * Se comprueba yendo y volviendo — si al reconstruir la cadena no sale la misma, la fecha
 * no existía. Un día inventado no es un error que merezca una pantalla: se cae a hoy, que
 * es lo que se quería ver.
 */
function resolveDay(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  return toIsoDay(parseIsoDay(value)) === value ? value : null
}

/** El día `days` días después (o antes). `setDate` se encarga de los meses y los años. */
function shift(day: string, days: number): string {
  const date = parseIsoDay(day)
  date.setDate(date.getDate() + days)
  return toIsoDay(date)
}

function dayHref(day: string): string {
  return `/cuenta/agenda?dia=${day}`
}

/** `Intl` devuelve los días de la semana en minúscula en español; como título, no. */
function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
