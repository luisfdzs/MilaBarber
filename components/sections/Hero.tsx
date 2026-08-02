import Link from 'next/link'
import { Wordmark } from '@/components/layout/Wordmark'
import { site } from '@/content/site'
import type { BusinessText } from '@/lib/content-types'
import type { HeroMedia } from '@/lib/hero'
import { href } from '@/lib/routes'
import { HeroMontage } from './HeroMontage'

/**
 * LA PORTADA, primera pantalla.
 *
 * `data-hero` no es decorativo: es lo que le dice a la cabecera que detrás hay fondo
 * oscuro a sangre y puede quedarse transparente hasta el primer scroll.
 *
 * `min-h-svh` y no `100vh`: en un móvil, `vh` cuenta la pantalla **sin** la barra del
 * navegador, así que el botón de reservar queda medio tapado hasta que se hace scroll
 * —justo el botón que no debe esconderse—. `svh` mide la ventana pequeña, la que hay
 * cuando la barra está desplegada, y por eso todo cabe desde el primer momento.
 *
 * Cuando no hay ni póster ni vídeo (ver `lib/hero.ts`), el fondo lo pone un degradado del
 * sistema. No se pinta un hueco tramado como en el resto de la web: aquí no hay nada que
 * reclamar al cliente —el negro es una decisión de diseño válida para una barbería— y un
 * placeholder a pantalla completa sería el mayor cartel de «esto está sin terminar» que
 * se puede poner en una web.
 */
export function Hero({ text, media }: { text: BusinessText; media: HeroMedia }) {
  return (
    <section
      data-hero
      className="relative flex min-h-svh flex-col items-center justify-end overflow-hidden pb-[calc(var(--spacing-nav-mobile)+2rem)] lg:justify-center lg:pb-0"
    >
      {media.hasPoster ? (
        <HeroMontage label="El día a día en Mila Barber" hasVideo={media.hasVideo} />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-radial-[at_50%_25%] from-smoke via-night to-night"
        />
      )}

      <div className="page-gutter relative z-10 flex flex-col items-center text-center">
        {/* La marca a tamaño grande, apilada como en el rótulo del local. Es un `<p>` y no
            un titular: el <h1> de la página es la frase, no el nombre — que ya está en el
            <title>, en la cabecera y en el pie. Repetirlo como encabezado de nivel uno le
            dice a un lector de pantalla que el contenido de la portada es «Mila Barber»,
            que no informa de nada. */}
        <p aria-hidden className="text-[clamp(3rem,14vw,7rem)] text-bone">
          <Wordmark layout="stacked" />
        </p>

        <h1 className="mt-8 max-w-3xl font-display text-title text-bone">
          {text.heroHeadline}
          {text.heroLead && <span className="block text-gold">{text.heroLead}</span>}
        </h1>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href={href('book')} className="btn btn-gold">
            Reservar cita
          </Link>
          <Link href={href('services')} className="btn btn-ghost">
            Ver servicios y precios
          </Link>
        </div>

        {/* Las tres cosas que decide quien está mirando esto desde la calle: si abre hoy,
            dónde está y si puede entrar sin cita. En una línea, pequeñas, bajo el botón. */}
        <p className="mt-8 text-small text-bone-soft">
          {site.hours.label} · {site.address.street}, {site.address.city}
        </p>
        {text.walkInsWelcome && (
          <p className="mt-1 eyebrow text-bone-faint">También atendemos sin cita</p>
        )}
      </div>
    </section>
  )
}
