import { cancelAppointmentAction } from '@/app/(site)/cuenta/actions'
import type { Appointment } from '@/lib/appointments'
import { formatDay, formatDuration, formatPrice } from '@/lib/format'

/**
 * UNA CITA, tal y como se ve en la cuenta.
 *
 * El orden de lectura está pensado para el vistazo de tres segundos que se le da a esto:
 * **día y hora primero, grandes**; después con quién y qué; y el precio al lado, que es lo
 * que hay que llevar suelto.
 *
 * `cancellable` sólo se pasa en las citas que están por venir. Una del historial no se
 * puede cancelar —ya ocurrió— y enseñar el botón desactivado sería peor que no enseñarlo.
 */
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
          {/* Sin ventana de confirmación a propósito: un `confirm()` bloquea la pestaña
              —y con las herramientas de automatización, la deja colgada— y en un móvil es
              un diálogo del sistema que la gente acepta sin leer. Cancelar aquí no destruye
              nada irrecuperable: la cita queda marcada, no borrada, y siempre se puede
              volver a reservar el mismo hueco si nadie lo ha cogido. */}
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
