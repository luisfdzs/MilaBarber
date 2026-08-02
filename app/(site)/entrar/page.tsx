import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@/components/layout/Wordmark'
import { getSession } from '@/lib/session'
import { SignInForm } from './SignInForm'

export const metadata: Metadata = {
  title: 'Entrar',
  // La pantalla de acceso no aporta nada en una búsqueda y compite con la portada por el
  // nombre de la barbería, que es justo lo que no interesa. Fuera del índice.
  robots: { index: false, follow: false },
}

/**
 * ACCESO.
 *
 * La pantalla que sustituye a milabarberr.com/login, y la única del sitio que se parece
 * deliberadamente a la anterior: mismo par de campos, mismo orden, misma marca arriba.
 * Quien lleva un año entrando ahí tiene que reconocerla sin leerla.
 *
 * Lo que cambia: **no es la puerta de la web**. Antes, la raíz del dominio redirigía aquí
 * y no había forma de ver los precios ni el horario sin tener cuenta —para un negocio que
 * vive de que la gente lo encuentre en Google, eso era regalar toda la clientela nueva—.
 * Ahora entrar sólo hace falta para gestionar tus citas.
 *
 * Estando ya dentro, esta página no tiene sentido: se va a la cuenta. Es lo que pasa
 * cuando alguien pulsa «atrás» después de entrar.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; 'ya-registrado'?: string }>
}) {
  const [session, params] = await Promise.all([getSession(), searchParams])
  if (session?.user) redirect('/cuenta')

  /**
   * Llega desde el formulario de registro cuando el correo **ya tenía cuenta**. El aviso
   * es deliberadamente ambiguo —«si ya tienes cuenta»— porque el alta responde igual
   * exista o no el correo (ver `registro/actions.ts`): decir aquí «esa cuenta ya existe»
   * desharía en una línea lo que allí se protege.
   */
  const alreadyRegistered = params['ya-registrado'] === '1'

  return (
    <div className="page-gutter mx-auto flex max-w-md flex-col items-center py-16 md:py-24">
      <Wordmark layout="stacked" className="text-[3.5rem] text-bone" />

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

      {/* El enlace de registro va FUERA de la caja y con el mismo peso visual que el
          formulario. En la web anterior no existía —había que pedir la cuenta por
          WhatsApp—, y es la razón número uno por la que alguien que acaba de descubrir la
          barbería en Google se marcha sin reservar. */}
      <p className="mt-8 text-center text-small text-bone-soft">
        ¿Primera vez?{' '}
        <Link href="/registro" className="link-underline tap text-gold">
          Crea tu cuenta en un minuto
        </Link>
      </p>
    </div>
  )
}
