import Link from 'next/link'
import type { Service } from '@/lib/content-types'
import { formatDuration, formatPrice } from '@/lib/format'
import { href } from '@/lib/routes'

export function ServiceList({
  services,
  bookable = true,
}: {
  services: Service[]
  bookable?: boolean
}) {
  return (
    <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
      {services.map((service) => (
        <li
          key={service._id}
          className="flex flex-col gap-3 bg-night p-6 transition-colors hover:bg-coal sm:p-8"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[1.05rem] tracking-wide text-bone">{service.name}</h3>
            <p className="price shrink-0">{formatPrice(service.price)}</p>
          </div>

          {service.description && (
            <p className="text-small text-bone-soft">{service.description}</p>
          )}

          <p className="eyebrow mt-auto">{formatDuration(service.durationMinutes)}</p>

          {bookable && (
            <Link
              href={`${href('book')}?servicio=${service.slug}`}
              className="link-underline tap eyebrow text-gold"
            >
              Reservar este servicio
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
