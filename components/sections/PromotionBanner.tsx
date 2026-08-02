import Link from 'next/link'
import type { Promotion } from '@/lib/content-types'

/**
 * LOS AVISOS, en una banda bajo la cabecera.
 *
 * Sustituye a las ventanas emergentes de la aplicación anterior, que salían al entrar,
 * tapaban la pantalla y había que cerrarlas una por una —dos seguidas, una por barbero,
 * antes de poder hacer nada—. Aquí el aviso está en la página: se lee sin bloquear, no
 * hay nada que cerrar y sigue ahí cuando la persona vuelve, en vez de haberse gastado en
 * el primer vistazo.
 *
 * Va **encima del hero y no dentro**: una banda sobre el vídeo se leería mal contra los
 * reflejos, y sobre todo un aviso de «cerramos en agosto» tiene que verse antes que el
 * botón de reservar, no después.
 *
 * Sin límite de cuántos se pintan, pero en la práctica son uno o dos: la consulta ya
 * filtra por fecha (ver `sanity/queries.ts`), así que sólo aparece lo vigente hoy.
 */
export function PromotionBanner({ promotions }: { promotions: Promotion[] }) {
  if (promotions.length === 0) return null

  return (
    <aside aria-label="Avisos" className="border-b border-gold/25 bg-gold/10">
      <div className="page-gutter mx-auto flex max-w-6xl flex-col gap-2 py-4 text-center">
        {promotions.map((promotion) => (
          <div key={promotion._id} className="flex flex-col items-center gap-1">
            <p className="font-display text-[0.95rem] tracking-wide text-gold uppercase">
              {promotion.title}
            </p>
            {promotion.body && <p className="text-small text-bone-soft">{promotion.body}</p>}
            {promotion.ctaLabel && promotion.ctaHref && (
              <PromotionLink href={promotion.ctaHref} label={promotion.ctaLabel} />
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

/**
 * El destino lo escribe quien edita en el panel, así que puede ser una ruta de la casa
 * («/reservar») o una dirección completa. `next/link` no sabe navegar a otro dominio como
 * navegación de cliente, y un `<a>` normal para una ruta interna tira el estado y recarga
 * la página entera. Se decide aquí, mirando la primera letra, en vez de pedirle a la
 * barbería que entienda la diferencia.
 */
function PromotionLink({ href, label }: { href: string; label: string }) {
  const internal = href.startsWith('/')
  const className = 'link-underline tap mt-1 eyebrow text-bone'

  if (internal) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label}
    </a>
  )
}
