import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppointmentCard } from '@/components/sections/AppointmentCard'
import { PageHeader } from '@/components/sections/PageHeader'
import { site } from '@/content/site'
import { getUserAppointment } from '@/lib/appointments'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = {
  title: 'Cita confirmada',
  robots: { index: false, follow: false },
}

/**
 * CITA CONFIRMADA.
 *
 * Existe como página con URL propia —y no como un cartel dentro del formulario— por una
 * razón práctica: **es lo que la gente enseña o guarda**. Con URL propia se puede añadir a
 * favoritos, mandar por WhatsApp a quien te acompaña o volver a abrir desde el historial
 * del navegador. Un mensaje dentro del formulario desaparece al recargar.
 *
 * Y por una razón técnica: tras confirmar se redirige aquí, así que recargar no vuelve a
 * enviar el formulario. Sin ese salto, un F5 en el móvil intenta reservar otra vez.
 *
 * La comprobación de propiedad la hace la consulta (ver `getUserAppointment`): con un id
 * de cita ajeno se responde 404, no la cita de otro.
 */
export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ cita?: string }>
}) {
  const [user, params] = await Promise.all([requireUser('/cuenta'), searchParams])
  if (!params.cita) notFound()

  const appointment = await getUserAppointment(params.cita, user.id)
  if (!appointment) notFound()

  return (
    <>
      <PageHeader
        eyebrow="Todo listo"
        title="Cita confirmada"
        lead="Te esperamos. Si no puedes venir, cancélala desde tu cuenta para que otra persona pueda coger el hueco."
      />

      <section className="page-gutter mx-auto max-w-2xl pb-(--spacing-section)">
        <AppointmentCard appointment={appointment} cancellable />

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link href="/cuenta" className="btn btn-gold">
            Ver mis citas
          </Link>
          <p className="text-small text-bone-soft">
            {site.address.street}, {site.address.city} ·{' '}
            <a href={`tel:${site.contact.phone}`} className="link-underline tap">
              {site.contact.phoneLabel}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
