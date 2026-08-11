'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { FormError, SubmitButton } from '@/components/ui/Form'
import type { Barber, Service } from '@/lib/content-types'
import { cn } from '@/lib/cn'
import { formatDuration, formatPrice, formatShortDay } from '@/lib/format'
import { emptyBookingState, type BookingState } from '@/lib/form-state'
import { bookAction, getSlotsAction } from './actions'

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

  const [loaded, setLoaded] = useState<{ key: string; slots: string[] } | null>(null)
  const [loadingSlots, startLoading] = useTransition()

  const slotsKey = `${serviceId}|${barberId}|${day}`
  const slots = loaded?.key === slotsKey ? loaded.slots : null

  const time = slots?.includes(pickedTime) ? pickedTime : ''

  const service = services.find((candidate) => candidate._id === serviceId)

  useEffect(() => {
    if (!serviceId || !barberId || !day) return
    const key = `${serviceId}|${barberId}|${day}`
    let cancelled = false

    startLoading(async () => {
      const result = await getSlotsAction(barberId, serviceId, day)
      if (!cancelled) setLoaded({ key, slots: result })
    })

    return () => {
      cancelled = true
    }
  }, [serviceId, barberId, day])

  return (
    <form action={action} className="flex flex-col gap-12">
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
