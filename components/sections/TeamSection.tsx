import { Figure } from '@/components/ui/Figure'
import type { Barber } from '@/lib/content-types'
import { formatDay, parseIsoDay } from '@/lib/format'
import { sectionId } from '@/lib/routes'
import { InstagramIcon } from '@/components/layout/NavIcons'

export function TeamSection({ barbers }: { barbers: Barber[] }) {
  if (barbers.length === 0) return null

  return (
    <section
      id={sectionId('team')}
      className="scroll-mt-24 border-t border-line py-(--spacing-section)"
    >
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

function vacationLabel(barber: Barber): string | null {
  const { vacationFrom, vacationTo } = barber
  if (!vacationFrom || !vacationTo) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (today < parseIsoDay(vacationFrom) || today > parseIsoDay(vacationTo)) return null

  return `De vacaciones hasta el ${formatDay(vacationTo)}`
}
