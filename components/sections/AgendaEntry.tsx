import { cancelFromAgendaAction } from '@/app/(site)/cuenta/agenda/actions'
import type { Appointment } from '@/lib/appointments'
import { formatDuration, formatPrice } from '@/lib/format'

export function AgendaEntry({ appointment }: { appointment: Appointment }) {
  return (
    <article className="flex flex-col gap-4 border border-line bg-coal p-5 sm:flex-row sm:gap-6">
      <p className="shrink-0 font-display leading-tight tracking-wide sm:w-20">
        <span className="text-[1.35rem] text-gold">{time(appointment.start)}</span>
        <span className="ml-2 text-small text-bone-faint sm:mt-1 sm:ml-0 sm:block">
          {time(appointment.end)}
        </span>
      </p>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h3 className="font-display text-[1.15rem] tracking-wide text-bone">
            {appointment.customerName}
          </h3>
          <p className="price">{formatPrice(appointment.servicePrice)}</p>
        </div>

        <p className="mt-1 text-small text-bone-soft">
          {appointment.serviceName} · {formatDuration(appointment.serviceDuration)} · con{' '}
          {appointment.barberName}
        </p>

        {appointment.customerPhone && (
          <p className="mt-2 text-small">
            <a
              href={`tel:${appointment.customerPhone.replace(/\s/g, '')}`}
              className="link-underline tap text-bone"
            >
              {appointment.customerPhone}
            </a>
          </p>
        )}

        {appointment.notes && (
          <p className="mt-3 border-l border-gold/40 pl-3 text-small text-bone-faint">
            {appointment.notes}
          </p>
        )}

        <form action={cancelFromAgendaAction} className="mt-4">
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <button
            type="submit"
            className="link-underline tap eyebrow text-alert transition-opacity hover:opacity-80"
          >
            Cancelar
          </button>
        </form>
      </div>
    </article>
  )
}

function time(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
