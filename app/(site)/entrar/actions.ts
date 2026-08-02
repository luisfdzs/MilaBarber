'use server'

import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import type { SignInState } from '@/lib/form-state'
import { credentialsSchema } from '@/lib/validation'

/**
 * MENSAJE ÚNICO PARA TODOS LOS FALLOS DE ACCESO.
 *
 * Da igual que el correo no exista, que la contraseña esté mal o que el formulario venga
 * a medias: siempre se responde lo mismo. Distinguirlos convertiría esta pantalla en un
 * comprobador de «¿es esta persona cliente de la barbería?», que es un dato que no
 * tenemos por qué dar a nadie que pruebe correos. Es la misma razón por la que
 * `verifyCredentials` gasta el mismo tiempo en los dos casos (ver `lib/users.ts`).
 */
const GENERIC_ERROR = 'El correo o la contraseña no son correctos.'

/**
 * El destino tras entrar, siempre dentro de esta web.
 *
 * `next` viene de la URL, así que lo controla quien manda el enlace. Sin esta
 * comprobación, un enlace a `/entrar?next=https://sitio-falso.example` llevaría a alguien
 * a una copia de la web justo después de haber escrito su contraseña, y con la sensación
 * de que sigue en la barbería. Se aceptan sólo rutas relativas, y `//` se descarta porque
 * el navegador lo lee como «otro dominio con el mismo protocolo».
 */
function safeNext(next: unknown): string {
  if (typeof next !== 'string') return '/cuenta'
  if (!next.startsWith('/') || next.startsWith('//')) return '/cuenta'
  return next
}

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: GENERIC_ERROR }

  const next = safeNext(formData.get('next'))

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    // `AuthError` es «no ha entrado». Cualquier otra cosa es un fallo de verdad —la base
    // de datos caída, por ejemplo— y no debe disfrazarse de contraseña incorrecta: se
    // relanza para que quede en los registros y salga la página de error.
    if (error instanceof AuthError) return { error: GENERIC_ERROR }
    throw error
  }

  // Fuera del try: `redirect` funciona lanzando una excepción especial, y dentro del
  // `catch` de arriba se confundiría con un fallo de acceso. Es el error más repetido al
  // usar acciones de servidor con Auth.js.
  redirect(next)
}
