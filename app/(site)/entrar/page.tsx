import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/layout/Wordmark'
import { getSession } from '@/lib/session'
import { SignInForm } from './SignInForm'

export const metadata: Metadata = {
  title: 'Entrar',
  robots: { index: false, follow: false },
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; 'ya-registrado'?: string }>
}) {
  const [session, params] = await Promise.all([getSession(), searchParams])
  if (session?.user) redirect('/cuenta')

  const alreadyRegistered = params['ya-registrado'] === '1'

  return (
    <div className="page-gutter mx-auto flex max-w-md flex-col items-center py-16 md:py-24">
      <Wordmark className="text-[3.5rem] text-bone" />

      {alreadyRegistered && (
        <p
          role="status"
          className="mt-10 w-full border border-gold/40 bg-gold/10 p-4 text-center text-small text-bone"
        >
          Si ya tienes cuenta con ese correo, entra con tu contraseña. ¿No la recuerdas? Puedes
          cambiarla desde el enlace de abajo.
        </p>
      )}

      <div className="mt-12 w-full border border-line bg-coal p-8">
        <h1 className="sr-only">Entrar en tu cuenta de Mila Barber</h1>
        <SignInForm next={params.next} />

        <p className="mt-6 text-center text-small text-bone-soft">
          <Link href="/entrar/recuperar" className="link-underline tap">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>

      <p className="mt-8 text-center text-small text-bone-soft">
        ¿Primera vez?{' '}
        <Link href="/registro" className="link-underline tap text-gold">
          Crea tu cuenta en un minuto
        </Link>
      </p>
    </div>
  )
}
