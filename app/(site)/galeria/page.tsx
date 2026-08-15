import type { Metadata } from 'next'
import { PageHeader } from '@/components/sections/PageHeader'
import { GalleryMedia } from '@/components/ui/GalleryMedia'
import { site } from '@/content/site'
import { getGallery } from '@/lib/content'
import {
  galleryCategories,
  galleryCategoryLabels,
  type GalleryCategory,
  type GalleryItem,
} from '@/lib/content-types'
import { href } from '@/lib/routes'

export const metadata: Metadata = {
  title: 'Galería',
  description: 'Cortes, peinados, trenzas, color y vídeos hechos en Mila Barber, en la Milagrosa.',
  alternates: { canonical: '/galeria' },
}

export default async function GalleryPage() {
  const gallery = await getGallery()
  const sections = groupByCategory(gallery)

  return (
    <>
      <PageHeader
        eyebrow="Nuestro trabajo"
        title="Galería"
        lead="Cortes, peinados, trenzas, color y vídeos hechos aquí, por secciones."
        action={gallery.length > 0 ? { href: href('book'), label: 'Reservar cita' } : undefined}
      />

      {gallery.length === 0 ? (
        <section className="page-gutter mx-auto max-w-6xl pb-(--spacing-section)">
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
        </section>
      ) : (
        <>
          <nav
            aria-label="Secciones de la galería"
            className="page-gutter mx-auto mb-12 flex max-w-6xl flex-wrap justify-center gap-3"
          >
            {sections.map(([category]) => (
              <a key={category} href={`#${category}`} className="btn btn-ghost">
                {galleryCategoryLabels[category]}
              </a>
            ))}
          </nav>

          {sections.map(([category, items]) => (
            <section
              key={category}
              id={category}
              className="page-gutter mx-auto max-w-6xl scroll-mt-24 pb-(--spacing-section)"
            >
              <h2 className="font-display text-title text-bone">
                {galleryCategoryLabels[category]}
              </h2>

              <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                {items.map((item, index) => (
                  <li key={item._id}>
                    <GalleryMedia
                      item={item}
                      sizes="(min-width: 48rem) 20rem, 45vw"
                      priority={index < 3}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  )
}

function groupByCategory(gallery: GalleryItem[]): [GalleryCategory, GalleryItem[]][] {
  return galleryCategories
    .map((category): [GalleryCategory, GalleryItem[]] => [
      category,
      gallery.filter((item) => item.category === category),
    ])
    .filter(([, items]) => items.length > 0)
}
