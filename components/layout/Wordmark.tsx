import { cn } from '@/lib/cn'

/**
 * MARCA MILA BARBER.
 *
 * ⚠️ **Reconstrucción tipográfica, no el logotipo original.** La barbería tiene un
 * logotipo dibujado —«MILA» sobre «BARBER» en una gruesa de cartel, con una navaja
 * abierta cruzando la palabra de abajo— pero sólo está publicado como PNG blanco
 * sobre transparente (`/assets/img/optimized/logo-white.png` en la web anterior).
 * Un PNG no sirve aquí: hay que pintarlo en cuatro tamaños y en dos colores.
 *
 * Así que se reconstruye con la condensada del sistema más la navaja en SVG. El día
 * que llegue el vectorial original se sustituye el `<svg>` y el texto por un solo
 * `<svg>` y este componente sigue encajando en la cabecera, en el pie, en el hero y
 * en la pantalla de acceso sin tocar nada más. Ver README, «Pendiente de confirmar».
 *
 * Dos disposiciones, porque la marca tiene dos sitios muy distintos:
 * - `inline` (por defecto): una línea. Es lo que cabe en una barra de 80 px de alto.
 * - `stacked`: las dos palabras apiladas con la navaja debajo, que es el bloqueo real
 *   del logotipo. Se usa donde hay espacio y la marca es el protagonista —el hero y
 *   la pantalla de acceso—.
 *
 * Todo va en `currentColor`: la cabecera es transparente sobre el hero (marca en
 * hueso) y pasa a fondo sólido al bajar. Heredar el color es lo que permite las dos
 * cosas con un solo elemento.
 */

type Props = {
  className?: string
  layout?: 'inline' | 'stacked'
}

export function Wordmark({ className, layout = 'inline' }: Props) {
  if (layout === 'stacked') {
    return (
      <span
        className={cn(
          'flex flex-col items-center leading-[0.85] font-display font-semibold uppercase',
          className,
        )}
      >
        <span className="text-[0.62em] tracking-[0.22em]">Mila</span>
        <span className="text-[1em] tracking-[0.06em]">Barber</span>
        <Razor className="mt-[0.12em] h-[0.16em] w-[0.9em] text-current opacity-80" />
      </span>
    )
  }

  return (
    <span className={cn('flex items-center gap-2.5 text-current', className)}>
      <Razor className="h-[0.5em] w-auto shrink-0" />
      <span className="font-display text-[1em] leading-none font-semibold tracking-[0.16em] uppercase">
        Mila Barber
      </span>
    </span>
  )
}

/**
 * La navaja abierta del logotipo, reducida a lo que se lee a 12 px: la hoja —un
 * trapecio muy tumbado— y el mango en ángulo. El dibujo detallado del original
 * (remaches, filo, canto) desaparece a ese tamaño y sólo ensucia.
 */
function Razor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 10" className={className} fill="currentColor" aria-hidden="true">
      {/* Hoja */}
      <path d="M2 3.4h38.5l4.5 3.2H6.2A4.2 4.2 0 0 1 2 3.4Z" />
      {/* Mango, saliendo en diagonal desde el talón de la hoja */}
      <path d="M45.8 5.9 62 2.2l.6 2.1-16.2 3.7-.6-2.1Z" />
    </svg>
  )
}
