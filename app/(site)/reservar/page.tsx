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

/**
 * RESERVAR.
 *
 * **La página es pública.** Se puede llegar desde Google, elegir servicio, ver los huecos
 * libres y sólo al confirmar hace falta tener cuenta —y aun entonces no se pierde nada,
 * porque la selección viaja en la URL hasta la pantalla de acceso y vuelve puesta (ver
 * `actions.ts`)—.
 *
 * Es el cambio de fondo respecto a la web anterior, donde el dominio entero estaba detrás
 * del formulario de acceso: quien descubría la barbería no podía ni ver los precios sin
 * pedir una cuenta por WhatsApp. Enseñar los huecos antes de pedir nada es lo que
 * convierte una visita en una cita.
 *
 * Los cuatro parámetros de la URL (`servicio`, `barbero`, `dia`, `hora`) los usan dos
 * caminos: la vuelta desde el acceso y el enlace «reservar este servicio» de la carta.
 */
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

  /**
   * `servicio` puede llegar como id (vuelta desde el acceso) o como slug (enlace de la
   * carta, que es legible y se puede compartir). Se aceptan los dos: pedirle a la carta
   * que enlace con un id de Sanity daría URLs ilegibles, y obligar al retorno del acceso a
   * traducir slugs sería una consulta más para nada.
   */
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
