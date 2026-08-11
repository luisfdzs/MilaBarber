import type { Metadata } from 'next'
import { PageHeader } from '@/components/sections/PageHeader'
import { site } from '@/content/site'
import { getOpenDays } from '@/lib/appointments'
import { getBookableBarbers, getServices } from '@/lib/content'
import { BookingFlow } from './BookingFlow'

export const metadata: Metadata = {
  title: 'Reservar cita',
  description:
    'Pide cita en Mila Barber: elige servicio, barbero, día y hora. Calle Río Irati 13, Pamplona.',
  alternates: { canonical: '/reservar' },
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string; barbero?: string; dia?: string; hora?: string }>
}) {
  const [services, barbers, params] = await Promise.all([
    getServices(),
    getBookableBarbers(),
    searchParams,
  ])

  const days = getOpenDays()

  const preselected = params.servicio
    ? services.find(
        (service) => service._id === params.servicio || service.slug === params.servicio,
      )
    : undefined

  return (
    <>
      <PageHeader
        eyebrow="Pide cita"
        title="Reservar"
        lead={`Elige qué, con quién y cuándo. ${site.hours.label}.`}
      />

      <section className="page-gutter mx-auto max-w-3xl pb-(--spacing-section)">
        <BookingFlow
          services={services}
          barbers={barbers}
          days={days}
          initial={{
            serviceId: preselected?._id,
            barberId: params.barbero,
            day: params.dia,
            time: params.hora,
          }}
        />
      </section>
    </>
  )
}
