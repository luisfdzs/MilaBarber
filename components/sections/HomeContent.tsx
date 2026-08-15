import { SectionUrl } from '@/components/layout/SectionUrl'
import { BookingGateway } from '@/components/sections/BookingGateway'
import { GalleryStrip } from '@/components/sections/GalleryStrip'
import { Hero } from '@/components/sections/Hero'
import { PromotionBanner } from '@/components/sections/PromotionBanner'
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

export async function HomeContent({ landing }: { landing?: string }) {
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
      <SectionUrl landing={landing} />

      <PromotionBanner promotions={promotions} />

      <Hero text={text} media={media} />

      <BookingGateway services={services} />

      <TeamSection barbers={barbers} />

      <GalleryStrip items={gallery} />

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
