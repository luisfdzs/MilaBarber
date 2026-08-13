import { site } from '@/content/site'
import type { BusinessText } from '@/lib/content-types'
import type { HeroMedia } from '@/lib/hero'
import { HeroActions } from './HeroActions'
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
        <h1 className="max-w-3xl font-display text-title text-bone">
          {text.heroHeadline}
          {text.heroLead && <span className="block text-gold">{text.heroLead}</span>}
        </h1>

        <div className="mt-10">
          <HeroActions />
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
