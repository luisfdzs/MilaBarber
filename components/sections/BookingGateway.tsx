import Link from 'next/link'
import { CalendarIcon } from '@/components/layout/NavIcons'
import { site } from '@/content/site'
import type { Service } from '@/lib/content-types'
import { formatDuration, formatPrice } from '@/lib/format'
import { href, sectionId } from '@/lib/routes'

export function BookingGateway({ services }: { services: Service[] }) {
  return (
    <section
      id={sectionId('homeBook')}
      className="scroll-mt-24 border-t border-line bg-coal py-(--spacing-section)"
    >
      <div className="page-gutter mx-auto max-w-4xl text-center">
        <p className="eyebrow">Pide cita</p>
        <h2 className="mt-3 font-display text-title text-bone">Reserva en un minuto</h2>
        <p className="mt-4 text-body text-bone-soft">
          Elige servicio, barbero, día y hora. {site.hours.label}.
        </p>

        {services.length > 0 && (
          <ul className="mx-auto mt-10 grid max-w-2xl gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {services.map((service) => (
              <li
                key={service._id}
                className="flex items-baseline justify-between gap-4 bg-night px-6 py-5 text-left"
              >
                <span>
                  <span className="block font-display text-[1.05rem] tracking-wide text-bone">
                    {service.name}
                  </span>
                  <span className="eyebrow">{formatDuration(service.durationMinutes)}</span>
                </span>
                <span className="price shrink-0">{formatPrice(service.price)}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10">
          <Link href={href('book')} className="btn btn-gold">
            <CalendarIcon className="h-4 w-4" />
            Reservar cita
          </Link>
        </p>

        <p className="mt-5">
          <Link href={href('services')} className="link-underline tap eyebrow">
            Ver todos los servicios y precios
          </Link>
        </p>
      </div>
    </section>
  )
}
