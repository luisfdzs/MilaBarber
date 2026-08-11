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

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>
}) {
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

function resolveDay(value: string | undefined): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  return toIsoDay(parseIsoDay(value)) === value ? value : null
}

function shift(day: string, days: number): string {
  const date = parseIsoDay(day)
  date.setDate(date.getDate() + days)
  return toIsoDay(date)
}

function dayHref(day: string): string {
  return `/cuenta/agenda?dia=${day}`
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
