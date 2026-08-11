import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/sections/PageHeader'
import { verifyResetToken } from '@/lib/password-reset'
import { NewPasswordForm } from './NewPasswordForm'

export const metadata: Metadata = {
  title: 'Nueva contraseña',
  robots: { index: false, follow: false },
}

export default async function NewPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  const valid = token ? await verifyResetToken(token) : null

  if (!token || !valid) {
    return (
      <>
        <PageHeader
          eyebrow="Acceso"
          title="Este enlace ya no vale"
          lead="Los enlaces para cambiar la contraseña caducan a los quince minutos y sólo se pueden usar una vez."
        />
        <p className="page-gutter pb-(--spacing-section) text-center">
          <Link href="/entrar/recuperar" className="btn btn-gold">
            Pedir otro enlace
          </Link>
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader eyebrow="Acceso" title="Elige tu nueva contraseña" />
      <div className="page-gutter mx-auto max-w-md pb-(--spacing-section)">
        <div className="border border-line bg-coal p-8">
          <NewPasswordForm token={token} />
        </div>
      </div>
    </>
  )
}
