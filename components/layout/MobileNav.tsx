'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'
import { href, isSection, navigation, routes } from '@/lib/routes'
import {
  CalendarIcon,
  CloseIcon,
  GalleryIcon,
  HomeIcon,
  InstagramIcon,
  MenuIcon,
  ScissorsIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from './NavIcons'

/**
 * LA NAVEGACIÓN DE MÓVIL: una barra fija abajo, siempre a la vista, en cualquier
 * página y a cualquier altura del scroll.
 *
 * El motivo de que esté abajo y no en la esquina de la cabecera es el pulgar: en un
 * teléfono en la mano, el borde inferior se alcanza sin recolocar el aparato y la
 * esquina superior derecha no. Arriba se queda sólo la marca, centrada.
 *
 * Cinco huecos: inicio, servicios, **reservar**, galería y el menú completo. Reservar
 * va en el centro y en dorado macizo, que es el único sitio de la barra donde se
 * rompe la simetría: es la acción por la que existe esta web, y el centro de la
 * barra inferior es el punto más cómodo de toda la pantalla. Equipo, dónde estamos y
 * la cuenta viven detrás del quinto botón.
 *
 * Sólo iconos, sin rótulo: cinco palabras a lo ancho de un móvil de 390 px o se
 * cortan o se aprietan hasta ser ilegibles. El nombre accesible va en el
 * `aria-label` de cada hueco.
 */
export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()

  /**
   * El menú guarda la ruta en la que se abrió, no un booleano. Así, en cuanto se
   * navega a otra ruta deja de estar abierto por derivación —sin un efecto que llame
   * a setState, que es un antipatrón y que el lint de React ya avisa— y también se
   * cierra al usar atrás/adelante del navegador.
   */
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const close = () => setOpenedAt(null)

  // Con el menú a pantalla completa, la página de detrás no debe moverse.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenedAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const home = href('home')
  /** ¿Estamos en esta página (o en una ficha dentro de ella)? Sólo para rutas reales. */
  const onRoute = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  /**
   * Estando en la cuenta, ninguno de los cuatro destinos de la barra diría dónde se
   * está: esa zona vive detrás del menú. Así que el botón que la guarda se marca como
   * activo y la barra nunca queda sin señalar la página en la que se está.
   */
  const inPanel = onRoute(href('account'))

  return (
    <>
      {/* El panel va antes que la barra en el DOM y ambos comparten `z-index`: así la
          barra queda por encima y su botón sigue pulsable para cerrar. Cubre la cabecera
          a propósito —es un menú a pantalla completa— y por eso lleva fondo OPACO: con un
          fondo translúcido se leería el vídeo del hero por debajo del texto.

          `hidden` y no un `return` condicional: así el botón conserva `aria-controls`
          apuntando a un nodo que siempre existe. Y sin utilidad de `display` propia: un
          `flex` aquí discutiría con el atributo, que es quien apaga el panel cerrado. El
          centrado lo pone el <nav> de dentro. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="page-gutter fixed inset-x-0 top-0 bottom-(--spacing-nav-mobile) z-50 overflow-y-auto bg-night lg:hidden"
      >
        <nav
          // `min-h-full` y no `h-full`: con el menú centrado basta para llenar el panel, y
          // si algún día las entradas no caben en una pantalla baja, crece y el
          // `overflow-y-auto` de arriba las deja alcanzables.
          className="flex min-h-full flex-col items-center justify-center gap-6 py-12 text-center"
          aria-label="Principal"
        >
          {navigation.map((key) => {
            const target = href(key)
            const active = !isSection(key) && onRoute(target)
            return (
              <Link
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                onClick={close}
                className={cn('font-display text-title', active ? 'text-gold' : 'text-bone')}
              >
                {routes[key].label}
              </Link>
            )
          })}

          <Link
            href={signedIn ? href('account') : href('signIn')}
            aria-current={inPanel ? 'page' : undefined}
            onClick={close}
            className={cn('font-display text-title', inPanel ? 'text-gold' : 'text-bone')}
          >
            {signedIn ? routes.account.label : routes.signIn.label}
          </Link>

          <div className="mt-6 flex items-center justify-center gap-6 border-t border-line pt-8">
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="Escribir por WhatsApp"
              className="tap text-bone-soft transition-colors hover:text-gold"
            >
              <WhatsAppIcon className="h-6 w-6" />
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Mila Barber"
              className="tap text-bone-soft transition-colors hover:text-gold"
            >
              <InstagramIcon className="h-6 w-6" />
            </a>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube de Mila Barber"
              className="tap text-bone-soft transition-colors hover:text-gold"
            >
              <YouTubeIcon className="h-6 w-6" />
            </a>
          </div>
        </nav>
      </div>

      <nav
        aria-label="Navegación de móvil"
        className="fixed inset-x-0 bottom-0 z-50 flex h-(--spacing-nav-mobile) items-stretch border-t border-line bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <NavSlot
          href={home}
          label="Inicio"
          active={pathname === home}
          // Estando ya en la portada, Next no navega y el toque no haría nada. Igual que
          // la marca de la cabecera: la casa lleva siempre al principio.
          onClick={(event) => {
            close()
            if (pathname === home) {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <HomeIcon className="h-6 w-6" />
        </NavSlot>

        <NavSlot
          href={href('services')}
          label={routes.services.label}
          active={onRoute(href('services'))}
          onClick={close}
        >
          <ScissorsIcon className="h-6 w-6" />
        </NavSlot>

        {/* El hueco central, en dorado macizo. No usa `NavSlot` porque no comparte ni el
            color ni el estado: está siempre encendido, aquí y en la propia página de
            reserva, porque no es un destino más de la barra sino el botón de la casa. */}
        <Link
          href={href('book')}
          aria-label={routes.book.label}
          aria-current={onRoute(href('book')) ? 'page' : undefined}
          onClick={close}
          className={cn(slotClass, 'bg-gold text-night')}
        >
          <CalendarIcon className="h-6 w-6" />
        </Link>

        <NavSlot
          href={href('gallery')}
          label={routes.gallery.label}
          active={onRoute(href('gallery'))}
          onClick={close}
        >
          <GalleryIcon className="h-6 w-6" />
        </NavSlot>

        <button
          type="button"
          onClick={() => setOpenedAt(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Cerrar el menú' : 'Abrir el menú'}
          className={cn(slotClass, slotState(open || inPanel))}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>
    </>
  )
}

/**
 * El hueco de cada icono. Reparte el ancho a partes iguales y estira a todo el alto de
 * la barra —gracias al `items-stretch` del `<nav>`—, así que el propio hueco ya mide la
 * celda entera: no hace falta una pastilla aparte de tamaño fijo, y de paso el área
 * pulsable pasa de sobra los 24 px de WCAG 2.2.
 *
 * El activo va en dorado, y no sólo en el color: a 24 px y con trazo de 1,6 px, un
 * dorado contra un hueso apagado hay que buscarlo. Así que el estado se dice también en
 * el fondo, con un cuadrado del mismo dorado muy rebajado que ocupa la celda entera
 * —cuadrado y no redondo a propósito, para que se lea como un hueco de la barra y no
 * como un botón suelto—.
 */
const slotClass =
  'relative flex flex-1 flex-col items-center justify-center transition-colors duration-500'

const slotState = (active: boolean) => (active ? 'bg-gold/12 text-gold' : 'text-bone opacity-60')

function NavSlot({
  href: target,
  label,
  active,
  onClick,
  children,
}: {
  href: string
  label: string
  active: boolean
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={target}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(slotClass, slotState(active))}
    >
      {children}
    </Link>
  )
}
