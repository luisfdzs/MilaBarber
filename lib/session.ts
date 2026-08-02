import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { findUserById, type UserRole } from './users'

/**
 * La sesión de **esta** petición, leída una sola vez.
 *
 * En la zona de cuenta se llama dos veces por navegación: una en el layout, que hace de
 * guarda, y otra en la página, que necesita el id. Con `cache` de React la segunda
 * llamada devuelve lo que trajo la primera. La caché vive y muere con la petición: no hay
 * riesgo de servir la sesión de otra persona.
 *
 * Se llama a `auth()` desde dentro de una función propia en vez de envolverlo
 * directamente porque `auth` tiene varias firmas —también sirve de envoltorio de route
 * handlers— y `cache` se quedaría con una sola.
 */
export const getSession = cache(() => auth())

/**
 * La guarda de la zona privada: o hay sesión, o se va al formulario de acceso.
 *
 * `next` lleva de vuelta a donde se quería ir. Es la diferencia entre «entra y ya
 * buscarás otra vez tu cita» y «entra y sigue donde estabas», y en un móvil con prisa esa
 * diferencia es la mitad de los abandonos.
 */
export async function requireUser(returnTo?: string) {
  const session = await getSession()
  if (!session?.user) {
    const target = returnTo ? `/entrar?next=${encodeURIComponent(returnTo)}` : '/entrar'
    redirect(target)
  }
  return session.user
}

/**
 * Igual, pero además exige papel. Un cliente que teclee la URL de la agenda no ve un 403
 * sino su propia cuenta: enseñar «no tienes permiso» confirmaría que la página existe.
 */
export async function requireRole(roles: UserRole[], returnTo?: string) {
  const user = await requireUser(returnTo)
  if (!roles.includes(user.role)) redirect('/cuenta')
  return user
}

/** Quién es la barbería, a efectos de permisos: los barberos y quien administra. */
export const STAFF_ROLES: UserRole[] = ['staff', 'admin']

/**
 * La guarda de la agenda y de todo lo que se haga sobre citas ajenas.
 *
 * Comprueba el papel **dos veces y a propósito**. La primera contra el token, que es
 * gratis y descarta al 99 % de las visitas. La segunda contra la base, porque el token se
 * firmó al entrar y sigue valiendo hasta un día después (ver `auth.ts`): a quien se le
 * retira el papel —se va del equipo— dejaría de ver el enlace pero su sesión abierta
 * seguiría abriendo la agenda, con el teléfono de todos los clientes dentro. Cuesta una
 * consulta por navegación, y es exactamente el sitio donde vale la pena pagarla.
 *
 * Devuelve el usuario **de la base**, no el del token, para que quien lo use trabaje
 * siempre con el papel bueno.
 */
export async function requireStaff(returnTo?: string) {
  const user = await requireRole(STAFF_ROLES, returnTo)
  const fresh = await findUserById(user.id)
  if (!fresh || !STAFF_ROLES.includes(fresh.role)) redirect('/cuenta')
  return fresh
}
