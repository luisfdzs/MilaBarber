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

/**
 * LA PORTADA.
 *
 * El orden de las secciones no es estético, es el orden en que se decide pedir cita:
 *
 *   1. **Aviso**, si lo hay. Antes que nada: si están cerrados dos semanas, todo lo demás
 *      sobra.
 *   2. **Hero.** Quiénes son y el botón de reservar, sin scroll.
 *   3. **Servicios destacados.** Cuánto cuesta y cuánto tarda, que es la primera pregunta.
 *   4. **Galería.** Cómo queda, que es lo que de verdad convence en una barbería.
 *   5. **Equipo.** Con quién, porque aquí se reserva con una persona.
 *   6. **Dónde estamos.** Ya decidido, cómo llegar.
 *
 * Las seis consultas van en un solo `Promise.all`: son independientes entre sí y
 * encadenarlas con seis `await` seguidos sumaría seis viajes a Sanity en vez de uno.
 */

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

      {/* LA FICHA PARA GOOGLE. Es lo que hace que, al buscar «barbería Milagrosa
          Pamplona», el resultado salga con el horario, la dirección y el teléfono en vez
          de con dos líneas de texto suelto. Para un negocio de calle, esto vale más que
          cualquier otra optimización de la web.

          `Barbershop` es un tipo propio de schema.org, más preciso que `LocalBusiness`.
          El horario se construye desde `site.hours`, el mismo dato que pinta el pie: si un
          día cambia, cambia en los dos sitios a la vez. */}
      <script
        type="application/ld+json"
        // Es la forma que documenta Next para JSON-LD. El contenido es nuestro y no lleva
        // nada que venga de fuera.
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
