import type { Metadata } from 'next'
import Link from 'next/link'
import { AppointmentCard } from '@/components/sections/AppointmentCard'
import { PageHeader } from '@/components/sections/PageHeader'
import { getUserAppointments } from '@/lib/appointments'
import { getSession, STAFF_ROLES } from '@/lib/session'
import { href } from '@/lib/routes'
import { signOutAction } from './actions'

export const metadata: Metadata = {
  title: 'Mi cuenta',
  robots: { index: false, follow: false },
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string }>
}) {
  const [session, params] = await Promise.all([getSession(), searchParams])
  const user = session!.user
  const { upcoming, past } = await getUserAppointments(user.id)

  return (
    <>
      <PageHeader
        eyebrow="Tu cuenta"
        title={`Hola, ${user.name.split(' ')[0]}`}
        lead={
          params.bienvenida === '1'
            ? 'Cuenta creada. Ya puedes pedir cita cuando quieras.'
            : undefined
        }
      />

      <div className="page-gutter mx-auto max-w-3xl pb-(--spacing-section)">
        {STAFF_ROLES.includes(user.role) && (
          <p className="mb-10 text-center">
            <Link href="/cuenta/agenda" className="btn btn-gold">
              Ver la agenda de hoy
            </Link>
          </p>
        )}

        <section aria-labelledby="proximas">
          <h2 id="proximas" className="eyebrow">
            Tus próximas citas
          </h2>

          {upcoming.length === 0 ? (
            <div className="mt-4 border border-line bg-coal p-8 text-center">
              <p className="text-body text-bone-soft">No tienes ninguna cita reservada.</p>
              <p className="mt-6">
                <Link href={href('book')} className="btn btn-gold">
                  Reservar cita
                </Link>
              </p>
            </div>
          ) : (
            <>
              <ul className="mt-4 flex flex-col gap-4">
                {upcoming.map((appointment) => (
                  <li key={appointment.id}>
                    <AppointmentCard appointment={appointment} cancellable />
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-center">
                <Link href={href('book')} className="btn btn-ghost">
                  Reservar otra cita
                </Link>
              </p>
            </>
          )}
        </section>

        {past.length > 0 && (
          <section aria-labelledby="historial" className="mt-16">
            <h2 id="historial" className="eyebrow">
              Historial
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {past.slice(0, 10).map((appointment) => (
                <li key={appointment.id}>
                  <AppointmentCard appointment={appointment} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-16 flex flex-col items-center gap-6 border-t border-line pt-10">
          <Link href="/cuenta/perfil" className="btn btn-ghost">
            Editar mis datos
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              className="link-underline tap eyebrow text-alert transition-opacity hover:opacity-80"
            >
              Cerrar sesión
            </button>
          </form>
        </section>
      </div>
    </>
  )
}
