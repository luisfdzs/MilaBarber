import { cancelAppointmentAction } from '@/app/(site)/cuenta/actions'
import type { Appointment } from '@/lib/appointments'
import { formatDay, formatDuration, formatPrice } from '@/lib/format'

export function AppointmentCard({
  appointment,
  cancellable = false,
}: {
  appointment: Appointment
  cancellable?: boolean
}) {
  const cancelled = appointment.status === 'cancelled'
  const time = `${pad(appointment.start.getHours())}:${pad(appointment.start.getMinutes())}`

  return (
    <article
      className={`border p-6 ${cancelled ? 'border-line bg-night opacity-60' : 'border-line bg-coal'}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="font-display text-[1.35rem] tracking-wide text-bone">
          <span className="text-gold">{time}</span>{' '}
          <span className="text-[0.8em]">{formatDay(appointment.start)}</span>
        </p>
        <p className="price">{formatPrice(appointment.servicePrice)}</p>
      </div>

      <p className="mt-2 text-small text-bone-soft">
        {appointment.serviceName} · {formatDuration(appointment.serviceDuration)} · con{' '}
        {appointment.barberName}
      </p>

      {appointment.notes && (
        <p className="mt-3 border-l border-line pl-3 text-small text-bone-faint">
          {appointment.notes}
        </p>
      )}

      {cancelled && <p className="mt-3 eyebrow text-alert">Cancelada</p>}

      {cancellable && !cancelled && (
        <form action={cancelAppointmentAction} className="mt-5">
          <input type="hidden" name="appointmentId" value={appointment.id} />
          <button
            type="submit"
            className="link-underline tap eyebrow text-alert transition-opacity hover:opacity-80"
          >
            Cancelar esta cita
          </button>
        </form>
      )}
    </article>
  )
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
