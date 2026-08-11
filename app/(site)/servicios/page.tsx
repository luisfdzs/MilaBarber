import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/sections/PageHeader'
import { ServiceList } from '@/components/sections/ServiceList'
import { getServices } from '@/lib/content'
import { href } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Servicios y precios',
  description:
    'Corte, arreglo de barba, afeitado a navaja, mechas, permanente y cejas. Precios y ' +
    'duración de cada servicio en Mila Barber, Pamplona.',
  alternates: { canonical: '/servicios' },
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <PageHeader
        eyebrow="La carta"
        title="Servicios y precios"
        lead="Cada servicio con su precio y el tiempo que ocupa en la agenda. Sin sorpresas al pagar."
        action={{ href: href('book'), label: 'Reservar cita' }}
      />

      <section className="page-gutter mx-auto max-w-6xl pb-(--spacing-section)">
        <ServiceList services={services} bookable={false} />

        <p className="mt-12 text-center text-small text-bone-soft">
          ¿No sabes cuál pedir? Escríbenos y te lo decimos.{' '}
          <Link href={href('book')} className="link-underline tap text-gold">
            Reservar cita
          </Link>
        </p>
      </section>
    </>
  )
}
