import Link from 'next/link'
import { Figure } from '@/components/ui/Figure'
import type { GalleryItem } from '@/lib/content-types'
import { href } from '@/lib/routes'

/**
 * LA TIRA DE TRABAJOS de la portada.
 *
 * En una barbería, esto es el argumento de venta: nadie elige por la descripción del
 * servicio, elige por cómo queda el pelo. Va **antes que el equipo y que la dirección**
 * por ese motivo.
 *
 * Si la barbería no ha subido ninguna foto todavía, la sección **no se pinta**. No se
 * rellena con imágenes de banco: una foto de otro corte de otro barbero puesta como si
 * fuera el trabajo de la casa es exactamente lo que uno no quiere descubrir después de
 * haber reservado. El hueco tramado de `<Figure>` vale para una ficha suelta; una sección
 * entera vacía se quita.
 *
 * Desliza en horizontal en móvil y pasa a rejilla en escritorio. En el teléfono, arrastrar
 * es el gesto natural para mirar fotos —es lo que se hace en Instagram, de donde viene
 * media clientela— y además deja ver que hay más a la derecha sin gastar altura.
 */
export function GalleryStrip({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="py-(--spacing-section)">
      <div className="page-gutter mx-auto max-w-6xl text-center">
        <p className="eyebrow">Nuestro trabajo</p>
        <h2 className="mt-3 font-display text-title text-bone">Cómo queda</h2>
      </div>

      {/* El scroll horizontal sale del contenedor de página a propósito: la primera foto
          arranca en el margen y la última se puede desplazar hasta el borde, que es lo que
          hace que se lea como una tira y no como una caja con recorte. `snap` deja cada
          foto encuadrada al soltar. */}
      <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--spacing-gutter) pb-4 lg:mx-auto lg:max-w-6xl lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {items.map((item, index) => (
          <li key={item._id} className="w-[72vw] shrink-0 snap-center sm:w-[45vw] lg:w-auto">
            <Figure
              image={item.image}
              // Tres anchos porque hay tres maquetaciones: tira ancha en móvil, media
              // pantalla en tableta y un tercio del contenedor en escritorio.
              sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 72vw"
              aspect="aspect-[4/5]"
              // Las dos primeras entran en pantalla sin scroll en escritorio: se piden con
              // prioridad para que la sección no aparezca vacía y se rellene después.
              priority={index < 2}
              quality={82}
            />
          </li>
        ))}
      </ul>

      <div className="page-gutter mt-8 text-center">
        <Link href={href('gallery')} className="btn btn-ghost">
          Ver toda la galería
        </Link>
      </div>
    </section>
  )
}
