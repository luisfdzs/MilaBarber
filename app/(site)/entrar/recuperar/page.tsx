import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/sections/PageHeader'
import { site } from '@/content/site'
import { RequestResetForm } from './RequestResetForm'

export const metadata: Metadata = {
  title: 'Recuperar la contraseña',
  robots: { index: false, follow: false },
}

export default function ResetRequestPage() {
  return (
    <>
      <PageHeader
        eyebrow="Acceso"
        title="¿No recuerdas tu contraseña?"
        lead="Escribe tu correo y te mandamos un enlace para poner una nueva."
      />

      <div className="page-gutter mx-auto max-w-md pb-(--spacing-section)">
        <div className="border border-line bg-coal p-8">
          <RequestResetForm />
        </div>

        {/* La salida de emergencia. Mientras el correo saliente no esté configurado —o si
            un día falla— esto es lo único que separa a alguien de recuperar su cuenta, y
            en una barbería de barrio llamar por teléfono funciona perfectamente. */}
        <p className="mt-8 text-center text-small text-bone-soft">
          ¿No te llega? Llámanos al{' '}
          <a href={`tel:${site.contact.phone}`} className="link-underline tap text-gold">
            {site.contact.phoneLabel}
          </a>{' '}
          y lo arreglamos.
        </p>

        <p className="mt-6 text-center">
          <Link href="/entrar" className="link-underline tap eyebrow">
            Volver a entrar
          </Link>
        </p>
      </div>
    </>
  )
}
