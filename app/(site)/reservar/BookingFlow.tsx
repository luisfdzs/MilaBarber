'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { FormError, SubmitButton } from '@/components/ui/Form'
import type { Barber, Service } from '@/lib/content-types'
import { cn } from '@/lib/cn'
import { formatDuration, formatPrice, formatShortDay } from '@/lib/format'
import { emptyBookingState, type BookingState } from '@/lib/form-state'
import { bookAction, getSlotsAction } from './actions'

/**
 * EL FLUJO DE RESERVA: qué, con quién, qué día y a qué hora.
 *
 * **Los cuatro pasos están en la misma pantalla**, uno debajo de otro, y no en cuatro
 * pantallas con botón de «siguiente». En un móvil, cuatro pantallas encadenadas significa
 * que cambiar el servicio después de ver las horas obliga a retroceder tres veces y volver
 * a elegirlo todo; en una sola, se toca arriba y lo de abajo se recalcula. Es la queja
 * clásica de los calendarios de reserva y no cuesta nada evitarla.
 *
 * El orden importa y no es intercambiable: el servicio decide **cuánto dura**, y la
 * duración decide qué huecos caben. Por eso va primero y por eso al cambiarlo se olvida la
 * hora elegida —una hora que valía para un corte de 30 minutos puede no valer para una
 * permanente de dos horas—.
 *
 * Los huecos se piden al servidor y no se calculan aquí: son las citas de otras personas,
 * que este navegador no tiene por qué conocer más allá de «ocupado» o «libre».
 */
export function BookingFlow({
  services,
  barbers,
  days,
  initial,
}: {
  services: Service[]
  barbers: Barber[]
  days: string[]
  initial: { serviceId?: string; barberId?: string; day?: string; time?: string }
}) {
  const [state, action] = useActionState<BookingState, FormData>(bookAction, emptyBookingState)

  const [serviceId, setServiceId] = useState(initial.serviceId ?? services[0]?._id ?? '')
  const [barberId, setBarberId] = useState(initial.barberId ?? barbers[0]?._id ?? '')
  const [day, setDay] = useState(initial.day ?? days[0] ?? '')
  const [pickedTime, setPickedTime] = useState(initial.time ?? '')

  /**
   * Los huecos se guardan **junto a la selección que los produjo**, no sueltos. Es lo que
   * permite que «¿tengo los huecos de lo que hay elegido ahora mismo?» sea una comparación
   * y no un estado más que mantener sincronizado: al tocar el servicio, el barbero o el
   * día, la clave deja de coincidir y la lista pasa a `null` —«buscando huecos»— en el
   * mismo render, sin un efecto que lo borre después.
   */
  const [loaded, setLoaded] = useState<{ key: string; slots: string[] } | null>(null)
  const [loadingSlots, startLoading] = useTransition()

  const slotsKey = `${serviceId}|${barberId}|${day}`
  const slots = loaded?.key === slotsKey ? loaded.slots : null

  /**
   * La hora elegida vale mientras siga estando entre los huecos que se ofrecen. Se deriva
   * en vez de borrarse a mano al cambiar de día porque el motivo por el que deja de valer
   * es siempre el mismo —ya no está en la lista— y así no hay ninguna combinación de pasos
   * que deje marcada una hora que el servidor va a rechazar. De paso conserva la hora que
   * venía en la URL al volver de la pantalla de acceso, si ese hueco sigue libre.
   */
  const time = slots?.includes(pickedTime) ? pickedTime : ''

  const service = services.find((candidate) => candidate._id === serviceId)

  /** Cada vez que cambia alguna de las tres cosas que determinan los huecos, se repiden. */
  useEffect(() => {
    if (!serviceId || !barberId || !day) return
    const key = `${serviceId}|${barberId}|${day}`
    let cancelled = false

    startLoading(async () => {
      const result = await getSlotsAction(barberId, serviceId, day)
      // La respuesta de una selección anterior puede llegar después de la de la actual: si
      // eso pasa, pintaría los huecos del día equivocado. Se descarta.
      if (!cancelled) setLoaded({ key, slots: result })
    })

    return () => {
      cancelled = true
    }
  }, [serviceId, barberId, day])

  return (
    <form action={action} className="flex flex-col gap-12">
      {/* Lo que de verdad se envía. Los botones de arriba son la interfaz; esto es el
          dato. Así el formulario funciona igual aunque el navegador no aplique el CSS. */}
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="barberId" value={barberId} />
      <input type="hidden" name="day" value={day} />
      <input type="hidden" name="time" value={time} />

      <FormError>{state.errors.form}</FormError>

      <Step number={1} title="¿Qué te hacemos?" error={state.errors.serviceId}>
        <ul className="grid gap-3 sm:grid-cols-2">
          {services.map((candidate) => (
            <li key={candidate._id}>
              <Choice
                selected={candidate._id === serviceId}
                onClick={() => setServiceId(candidate._id)}
                label={candidate.name}
                detail={`${formatPrice(candidate.price)} · ${formatDuration(candidate.durationMinutes)}`}
              />
            </li>
          ))}
        </ul>
      </Step>

      <Step number={2} title="¿Con quién?" error={state.errors.barberId}>
        {barbers.length === 0 ? (
          <p className="text-body text-bone-soft">
            Ahora mismo no hay nadie disponible para reservar por la web. Llámanos y te damos hueco.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {barbers.map((candidate) => (
              <li key={candidate._id}>
                <Choice
                  selected={candidate._id === barberId}
                  onClick={() => setBarberId(candidate._id)}
                  label={candidate.name}
                  detail={candidate.role ?? undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </Step>

      <Step number={3} title="¿Qué día?" error={state.errors.day}>
        {/* Tira horizontal y no un calendario de mes. En una barbería se reserva para esta
            semana o la que viene: una rejilla de treinta casillas obliga a buscar el día
            entre números, y en un móvil apenas caben. Los domingos no aparecen porque la
            barbería cierra — no se pintan en gris, sencillamente no están. */}
        <ul className="flex snap-x gap-2 overflow-x-auto pb-2">
          {days.map((candidate) => (
            <li key={candidate} className="shrink-0 snap-start">
              <Choice
                selected={candidate === day}
                onClick={() => setDay(candidate)}
                label={formatShortDay(candidate)}
                compact
              />
            </li>
          ))}
        </ul>
      </Step>

      <Step number={4} title="¿A qué hora?" error={state.errors.time}>
        {loadingSlots || slots === null ? (
          <p className="eyebrow" role="status">
            Buscando huecos…
          </p>
        ) : slots.length === 0 ? (
          <p className="text-body text-bone-soft">
            No queda ningún hueco ese día
            {service ? ` para ${service.name.toLowerCase()}` : ''}. Prueba con otro día o con el
            otro barbero.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.map((candidate) => (
              <li key={candidate}>
                <Choice
                  selected={candidate === time}
                  onClick={() => setPickedTime(candidate)}
                  label={candidate}
                  compact
                />
              </li>
            ))}
          </ul>
        )}
      </Step>

      <div className="flex flex-col gap-3">
        <label htmlFor="notes" className="eyebrow text-bone-soft">
          ¿Algo que debamos saber? (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={300}
          placeholder="Cómo lo quieres, alergias, si vienes con un niño…"
          className="border border-line bg-coal px-4 py-3 text-body text-bone transition-colors placeholder:text-bone-faint focus:border-gold"
        />
      </div>

      {/* El resumen antes del botón. Es lo que evita la cita del día equivocado: repite en
          una frase legible lo que las cuatro rejillas dicen en forma de casillas marcadas. */}
      {service && time && (
        <p className="border border-gold/30 bg-gold/5 p-4 text-center text-body text-bone">
          {service.name}, el {formatShortDay(day)} a las {time}, con{' '}
          {barbers.find((candidate) => candidate._id === barberId)?.name}.{' '}
          <span className="text-gold">{formatPrice(service.price)}</span>
        </p>
      )}

      <SubmitButton pendingLabel="Reservando…">
        {time ? 'Confirmar la cita' : 'Elige una hora'}
      </SubmitButton>
    </form>
  )
}

function Step({
  number,
  title,
  error,
  children,
}: {
  number: number
  title: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <fieldset>
      <legend className="mb-4 flex items-baseline gap-3">
        <span className="eyebrow text-gold">{number}</span>
        <span className="font-display text-[1.15rem] tracking-wide text-bone uppercase">
          {title}
        </span>
      </legend>
      {children}
      {error && (
        <p role="alert" className="mt-3 text-small text-alert">
          {error}
        </p>
      )}
    </fieldset>
  )
}

/**
 * Una opción pulsable. Es un `<button type="button">` y no un `<input type="radio">`
 * disfrazado: el radio traería su propio comportamiento de teclado por grupo y aquí las
 * opciones se recorren en dos dimensiones. Lo que un radio sí aporta —decir a un lector de
 * pantalla que está marcado— se resuelve con `aria-pressed`.
 */
function Choice({
  selected,
  onClick,
  label,
  detail,
  compact = false,
}: {
  selected: boolean
  onClick: () => void
  label: string
  detail?: string
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'flex w-full flex-col items-center justify-center border text-center transition-colors',
        compact ? 'min-h-11 px-4' : 'min-h-16 gap-1 px-4 py-3',
        selected
          ? 'border-gold bg-gold/12 text-gold'
          : 'border-line bg-coal text-bone hover:border-bone-faint',
      )}
    >
      <span className="font-display text-[0.95rem] tracking-wide">{label}</span>
      {detail && <span className="text-small text-bone-soft">{detail}</span>}
    </button>
  )
}
