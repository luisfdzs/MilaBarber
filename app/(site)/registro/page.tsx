import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/layout/Wordmark'
import { getSession } from '@/lib/session'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  robots: { index: false, follow: false },
}

export default async function RegisterPage() {
  const session = await getSession()
  if (session?.user) redirect('/cuenta')

  return (
    <div className="page-gutter mx-auto flex max-w-md flex-col items-center py-16 md:py-24">
      <Wordmark layout="stacked" className="text-[3rem] text-bone" />

      <div className="mt-12 w-full border border-line bg-coal p-8">
        <h1 className="font-display text-[1.5rem] tracking-wide text-bone">Crear cuenta</h1>
        <p className="mt-2 mb-8 text-small text-bone-soft">
          Para pedir cita y ver tus reservas. Un minuto.
        </p>

        <RegisterForm />
      </div>

      <p className="mt-8 text-center text-small text-bone-soft">
        ¿Ya tienes cuenta?{' '}
        <Link href="/entrar" className="link-underline tap text-gold">
          Entrar
        </Link>
      </p>

      <p className="mt-6 max-w-sm text-center text-small text-bone-faint">
        Al crear la cuenta aceptas el{' '}
        <Link href="/legal/aviso-legal" className="link-underline">
          aviso legal
        </Link>{' '}
        y la{' '}
        <Link href="/legal/privacidad" className="link-underline">
          política de privacidad
        </Link>
        .
      </p>
    </div>
  )
}
