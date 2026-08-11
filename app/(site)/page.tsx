import Link from 'next/link'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { Hero } from '@/components/sections/Hero'
import { PromotionBanner } from '@/components/sections/PromotionBanner'
import { ServiceList } from '@/components/sections/ServiceList'
import { TeamSection } from '@/components/sections/TeamSection'
import { WhereSection } from '@/components/sections/WhereSection'
import { site } from '@/content/site'
import {
  getActivePromotions,
  getBarbers,
  getBusinessText,
  getFeaturedGallery,
  getFeaturedServices,
} from '@/lib/content'
import { getHeroMedia } from '@/lib/hero'
import { href } from '@/lib/routes'

export default async function HomePage() {
  const [text, promotions, services, gallery, barbers] = await Promise.all([
    getBusinessText(),
    getActivePromotions(),
    getFeaturedServices(),
    getFeaturedGallery(6),
    getBarbers(),
  ])

  const media = getHeroMedia()

  return (
    <>
      <PromotionBanner promotions={promotions} />

      <Hero text={text} media={media} />

      <section className="border-t border-line py-(--spacing-section)">
        <div className="page-gutter mx-auto max-w-6xl">
          <div className="text-center">
            <p className="eyebrow">La carta</p>
            <h2 className="mt-3 font-display text-title text-bone">Servicios</h2>
          </div>

          <div className="mt-12">
            <ServiceList services={services} />
          </div>

          <p className="mt-10 text-center">
            <Link href={href('services')} className="btn btn-ghost">
              Ver todos los precios
            </Link>
          </p>
        </div>
      </section>

      <GalleryStrip items={gallery} />

      <TeamSection barbers={barbers} />

      <WhereSection />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd()) }}
      />
    </>
  )
}

function businessJsonLd() {
  const { address, contact, hours, social } = site
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const

  return {
    '@context': 'https://schema.org',
    '@type': 'Barbershop',
    name: site.name,
    description: site.tagline,
    url: site.url,
    telephone: contact.phone,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.street,
      postalCode: address.postalCode,
      addressLocality: address.city,
      addressRegion: address.region,
      addressCountry: address.country,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: hours.days.map((day) => dayNames[day]),
        opens: hours.opens,
        closes: hours.closes,
      },
    ],
    sameAs: [social.instagram, social.youtube],
  }
}
