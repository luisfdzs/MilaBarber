import { Figure } from '@/components/ui/Figure'
import type { Barber } from '@/lib/content-types'
import { formatDay, parseIsoDay } from '@/lib/format'
import { InstagramIcon } from '@/components/layout/NavIcons'

/**
 * EL EQUIPO.
 *
 * En una barbería de barrio la gente no reserva «en Mila Barber», reserva «con Hassan» o
 * «con Mohammed»: es una relación con una persona, y por eso el equipo tiene sección
 * propia en la portada y no una línea en el pie.
 *
 * Aquí aparecen **todos**, también quien esté de vacaciones o de baja: seguir siendo del
 * equipo no depende de si hoy se le puede pedir cita. Lo que sí cambia es que se dice —y
 * se dice con la fecha de vuelta, que es el dato que la persona necesita para decidir si
 * espera o si prueba con el otro—. El calendario, que sí tiene que ofrecer sólo lo
 * reservable, usa otra consulta (`getBookableBarbers`).
 */
export function TeamSection({ barbers }: { barbers: Barber[] }) {
  if (barbers.length === 0) return null

  return (
    <section id="equipo" className="scroll-mt-24 border-t border-line py-(--spacing-section)">
      <div className="page-gutter mx-auto max-w-6xl">
        <div className="text-center">
          <p className="eyebrow">Quién corta</p>
          <h2 className="mt-3 font-display text-title text-bone">El equipo</h2>
        </div>

        <ul className="mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-2">
          {barbers.map((barber) => {
            const away = vacationLabel(barber)
            return (
              <li key={barber._id} className="flex flex-col gap-4 text-center">
                <Figure
                  image={barber.photo}
                  sizes="(min-width: 40rem) 22rem, 100vw"
                  aspect="aspect-[4/5]"
                />

                <div>
                  <h3 className="font-display text-[1.25rem] tracking-wide text-bone">
                    {barber.name}
                  </h3>
                  {barber.role && <p className="eyebrow mt-1">{barber.role}</p>}
                </div>

                {barber.bio && <p className="text-small text-bone-soft">{barber.bio}</p>}

                {away && (
                  <p className="eyebrow text-gold" role="status">
                    {away}
                  </p>
                )}

                {barber.instagram && (
                  <a
                    href={barber.instagram}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Instagram de ${barber.name}`}
                    className="tap mx-auto text-bone-soft transition-colors hover:text-gold"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

/**
 * «De vacaciones hasta el 24 de agosto», o nada.
 *
 * Se pinta sólo si las vacaciones **incluyen hoy**. Un periodo que empieza dentro de tres
 * meses no es información útil en la portada: lo que hace falta saber es si hoy se puede
 * reservar con esta persona. Del futuro ya avisa el calendario, que no ofrece esos días.
 */
function vacationLabel(barber: Barber): string | null {
  const { vacationFrom, vacationTo } = barber
  if (!vacationFrom || !vacationTo) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (today < parseIsoDay(vacationFrom) || today > parseIsoDay(vacationTo)) return null

  return `De vacaciones hasta el ${formatDay(vacationTo)}`
}
