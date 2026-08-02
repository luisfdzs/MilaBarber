import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/sections/PageHeader'
import { requireUser } from '@/lib/session'
import { findUserById } from '@/lib/users'
import { PasswordForm, ProfileForm } from './ProfileForms'

export const metadata: Metadata = {
  title: 'Mis datos',
  robots: { index: false, follow: false },
}

/**
 * MIS DATOS.
 *
 * Se leen de la base y no de la sesión: el token de sesión se firmó al entrar y puede
 * llevar un nombre viejo si se cambió después (ver el comentario en `cuenta/actions.ts`).
 * Para pintar un formulario de edición hay que enseñar lo que hay guardado, no lo que
 * había cuando se abrió la sesión.
 */
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ falta?: string }>
}) {
  const [session, params] = await Promise.all([requireUser('/cuenta/perfil'), searchParams])
  const user = await findUserById(session.id)
  // La sesión es válida pero el usuario ya no está en la base: cuenta borrada a mano
  // mientras había una sesión abierta. Raro, pero un 404 es mejor que reventar.
  if (!user) notFound()

  return (
    <>
      <PageHeader eyebrow="Tu cuenta" title="Mis datos" />

      <div className="page-gutter mx-auto max-w-md pb-(--spacing-section)">
        {/* Llega desde el flujo de reserva cuando la cuenta no tiene teléfono. Se explica
            por qué se pide en lugar de plantar un campo obligatorio sin más. */}
        {params.falta === 'telefono' && (
          <p
            role="status"
            className="mb-8 border border-gold/40 bg-gold/10 p-4 text-small text-bone"
          >
            Nos falta tu teléfono para poder reservar. Es por donde te avisamos si hay que mover la
            cita.
          </p>
        )}

        <section className="border border-line bg-coal p-8">
          <ProfileForm name={user.name} phone={user.phone} email={user.email} />
        </section>

        <section className="mt-10 border border-line bg-coal p-8">
          <h2 className="mb-6 font-display text-[1.15rem] tracking-wide text-bone">
            Cambiar la contraseña
          </h2>
          <PasswordForm />
        </section>

        <p className="mt-10 text-center">
          <Link href="/cuenta" className="link-underline tap eyebrow">
            Volver a mis citas
          </Link>
        </p>
      </div>
    </>
  )
}
