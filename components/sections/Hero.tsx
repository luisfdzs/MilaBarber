import Link from 'next/link'
import { Wordmark } from '@/components/layout/Wordmark'
import { site } from '@/content/site'
import type { BusinessText } from '@/lib/content-types'
import type { HeroMedia } from '@/lib/hero'
import { href } from '@/lib/routes'
import { HeroMontage } from './HeroMontage'

export function Hero({ text, media }: { text: BusinessText; media: HeroMedia }) {
  return (
    <section
      data-hero
      className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden pb-[calc(var(--spacing-nav-mobile)+2rem)] lg:justify-center lg:pb-0"
    >
      {media.hasPoster ? (
        <HeroMontage label="El día a día en Mila Barber" hasVideo={media.hasVideo} />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-radial-[at_50%_25%] from-smoke via-night to-night"
        />
      )}

      <div className="page-gutter relative z-10 flex flex-col items-center text-center">
        <p aria-hidden className="text-[clamp(3rem,14vw,7rem)] text-bone">
          <Wordmark layout="stacked" />
        </p>

        <h1 className="mt-8 max-w-3xl font-display text-title text-bone">
          {text.heroHeadline}
          {text.heroLead && <span className="block text-gold">{text.heroLead}</span>}
        </h1>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href={href('book')} className="btn btn-gold">
            Reservar cita
          </Link>
          <Link href={href('services')} className="btn btn-ghost">
            Ver servicios y precios
          </Link>
        </div>

        <p className="mt-8 text-small text-bone-soft">
          {site.hours.label} · {site.address.street}, {site.address.city}
        </p>
        {text.walkInsWelcome && (
          <p className="mt-1 eyebrow text-bone-faint">También atendemos sin cita</p>
        )}
      </div>
    </section>
  )
}
