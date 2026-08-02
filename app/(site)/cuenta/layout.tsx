import { requireUser } from '@/lib/session'

/**
 * LA GUARDA DE LA ZONA PRIVADA.
 *
 * Está en el layout y no en cada página porque un layout envuelve a **todas** las rutas
 * que hay debajo, incluidas las que se añadan mañana: es la diferencia entre proteger la
 * zona y acordarse de proteger cada página nueva.
 *
 * No se usa middleware para esto a propósito. El middleware corre en el runtime de Edge,
 * donde no hay ni el controlador de MongoDB ni bcrypt, así que la comprobación tendría que
 * hacerse sólo con la cookie —y aun así habría que repetirla aquí antes de leer datos—.
 * Una guarda en servidor, junto a los datos que protege, es una sola comprobación en el
 * sitio donde importa.
 *
 * `getSession` está memoizada por petición (ver `lib/session.ts`), así que esta llamada y
 * la que haga la página de dentro cuestan una sola.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser('/cuenta')
  return children
}
