import type { Metadata } from 'next'
import { PageHeader } from '@/components/sections/PageHeader'
import { Figure } from '@/components/ui/Figure'
import { site } from '@/content/site'
import { getGallery } from '@/lib/content'
import { href } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Cortes, barbas y color hechos en Mila Barber, en el barrio de la Milagrosa.',
  alternates: { canonical: '/galeria' },
}

/**
 * LA GALERÍA COMPLETA.
 *
 * Rejilla en mosaico, ordenada por fecha (lo más reciente arriba): en una barbería el
 * trabajo de hace dos años ya no representa a nadie, ni el estilo ni la mano.
 *
 * **Sin filtros por categoría**, aunque el CMS los guarde. Con doce o veinte fotos, cuatro
 * botones de filtro son más trabajo para quien mira que desplazarse; el campo está en el
 * panel para el día que haya cien, y ese día se añaden aquí. Hasta entonces, un filtro que
 * deja tres fotos es peor que no tenerlo.
 *
 * Cuando aún no hay fotos, se dice y se manda a Instagram, que es donde sí hay: dejar la
 * página en blanco haría pensar que está rota, y poner fotos de banco sería enseñar el
 * trabajo de otro.
 */
export default async function GalleryPage() {
  const gallery = await getGallery()

  return (
    <>
      <PageHeader
        eyebrow="Nuestro trabajo"
        title="Galería"
        lead="Cortes, barbas y color hechos aquí. Lo más reciente primero."
        action={gallery.length > 0 ? { href: href('book'), label: 'Reservar cita' } : undefined}
      />

      <section className="page-gutter mx-auto max-w-6xl pb-(--spacing-section)">
        {gallery.length === 0 ? (
          <div className="mx-auto max-w-lg border border-line bg-coal p-10 text-center">
            <p className="text-body text-bone-soft">
              Todavía no hemos subido fotos aquí. Mientras tanto, el trabajo del día a día está en
              Instagram.
            </p>
            <p className="mt-6">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="btn btn-gold"
              >
                Ver en Instagram
              </a>
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {gallery.map((item, index) => (
              <li key={item._id}>
                <Figure
                  image={item.image}
                  sizes="(min-width: 48rem) 20rem, 45vw"
                  aspect="aspect-[4/5]"
                  // Las seis primeras son las que entran en pantalla sin desplazarse en la
                  // mayoría de tamaños. Marcar más no adelanta nada y compite por el ancho
                  // de banda con las que sí se están viendo.
                  priority={index < 6}
                  quality={82}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
