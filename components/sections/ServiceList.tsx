import Link from 'next/link'
import type { Service } from '@/lib/content-types'
import { formatDuration, formatPrice } from '@/lib/format'
import { href } from '@/lib/routes'

/**
 * LA CARTA DE SERVICIOS.
 *
 * Es una **rejilla de tarjetas y no una tabla**, al revés que el catálogo del proyecto de
 * referencia. Allí la tabla era el argumento: catorce bobinas con cinco cotas cada una que
 * había que poder comparar columna a columna. Aquí son siete servicios con dos cifras, y
 * lo que se compara no es «cuál es más barato» sino «cuál es el mío». Una tabla obligaría
 * a leer las siete filas en orden; las tarjetas se escanean.
 *
 * Precio y duración se leen como un par y por eso van juntos, en la misma línea y con la
 * misma tipografía condensada: la pregunta real de quien reserva no es «cuánto cuesta»
 * sino «cuánto me cuesta y cuánto tardo».
 */
export function ServiceList({
  services,
  bookable = true,
}: {
  services: Service[]
  /** En la portada las tarjetas llevan a reservar; en la página de servicios no, porque
   *  el botón de reservar ya está arriba y repetirlo siete veces lo devalúa. */
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
