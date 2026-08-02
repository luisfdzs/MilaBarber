'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { href, isSection, navigation, routes } from '@/lib/routes'
import { UserIcon } from './NavIcons'
import { Wordmark } from './Wordmark'

type Props = {
  /** ¿Hay sesión abierta? Lo resuelve el layout en servidor y baja ya decidido:
   *  así la cabecera no necesita ni `useSession` ni una petición al montar, que es
   *  lo que produce ese parpadeo de «Entrar» → «Mi cuenta» en cada navegación. */
  signedIn: boolean
}

/**
 * La cabecera. Necesita JS por dos cosas y ninguna más: el estado de scroll —para
 * pasar de transparente sobre el hero a fondo sólido— y saber en qué ruta estamos,
 * para marcar la entrada activa.
 *
 * **El menú de móvil no vive aquí.** Está en `MobileNav`, una barra fija abajo con
 * iconos: en un teléfono en la mano, el borde inferior se alcanza con el pulgar y la
 * esquina superior derecha no. Arriba, por debajo de `lg`, queda sólo la marca —que
 * es identidad y no navegación—, y por eso va centrada en vez de pegada a la
 * izquierda con media barra vacía al lado.
 */
export function Header({ signedIn }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const home = href('home')

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-500',
        scrolled ? 'bg-night/95 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-night"
      >
        Saltar al contenido
      </a>

      <div className="page-gutter flex h-20 items-center justify-center gap-6 md:h-24 lg:justify-between">
        {/* `tap`: el wordmark mide 16 px de alto, por debajo del mínimo de 24 px que
            exige WCAG 2.2 para un objetivo pulsable. Nadie lo detecta mirando la
            pantalla, y es el enlace más usado de la cabecera. La utilidad agranda el
            área con un pseudo-elemento invisible, así que la marca sigue midiendo lo
            que mide. */}
        <Link
          href={home}
          aria-label="Mila Barber · inicio"
          className="tap"
          // Estando ya en la portada, Next no navega y el clic no haría nada: quien esté
          // leyendo el pie se quedaría en el pie. La marca debe llevar siempre al
          // principio, así que ahí se sube a mano. Sin `behavior` a propósito: hereda el
          // scroll suave del CSS, y el salto seco cuando el sistema pide menos movimiento.
          onClick={(event) => {
            if (pathname === home) {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <Wordmark className="text-[0.95rem] md:text-[1.1rem]" />
        </Link>

        {/* `lg` y no `md`: son cuatro entradas más el acceso y el botón de reserva, y en
            una tablet de 768 px eso se apelotona contra la marca. */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {navigation.map((key) => {
            // Equipo y dónde estamos son anclas de la portada, no páginas: `aria-current`
            // marcaría las dos a la vez estando en el inicio, que es peor que no marcar
            // ninguna. Ver el comentario de `isSection` en lib/routes.ts.
            const target = href(key)
            const active =
              !isSection(key) && (pathname === target || pathname.startsWith(`${target}/`))
            return (
              <Link
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'link-underline tap font-display text-micro tracking-[0.18em] uppercase transition-opacity',
                  active ? 'text-gold opacity-100' : 'opacity-70 hover:opacity-100',
                )}
              >
                {routes[key].label}
              </Link>
            )
          })}

          <span aria-hidden className="h-3 w-px bg-current opacity-25" />

          {/* Acceso: un icono con su nombre accesible, no la palabra. El rótulo cambia
              según haya sesión o no —«Entrar» y «Mi cuenta» son cosas distintas— y dos
              palabras de ancho variable al lado del botón dorado descuadran la barra. */}
          <Link
            href={signedIn ? href('account') : href('signIn')}
            aria-label={signedIn ? 'Mi cuenta' : 'Entrar'}
            className={cn(
              'tap transition-opacity',
              pathname.startsWith('/cuenta') ? 'text-gold' : 'opacity-70 hover:opacity-100',
            )}
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          {/* El único botón macizo de la barra. Es la acción por la que existe la web. */}
          <Link href={href('book')} className="btn btn-gold">
            Reservar cita
          </Link>
        </nav>
      </div>
    </header>
  )
}
