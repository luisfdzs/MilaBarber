import Link from 'next/link'
import { Figure } from '@/components/ui/Figure'
import { site } from '@/content/site'
import type { GalleryItem } from '@/lib/content-types'
import { href, sectionId } from '@/lib/routes'

export function GalleryStrip({ items }: { items: GalleryItem[] }) {
  return (
    <section id={sectionId('work')} className="scroll-mt-24 py-(--spacing-section)">
      <div className="page-gutter mx-auto max-w-6xl text-center">
        <p className="eyebrow">Nuestro trabajo</p>
        <h2 className="mt-3 font-display text-title text-bone">Cómo queda</h2>
      </div>

      {items.length === 0 ? (
        <p className="page-gutter mt-8 text-center text-body text-bone-soft">
          El trabajo del día a día está en{' '}
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="link-underline tap text-gold"
          >
            nuestro Instagram
          </a>
          .
        </p>
      ) : (
        <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--spacing-gutter) pb-4 lg:mx-auto lg:max-w-6xl lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
          {items.map((item, index) => (
            <li key={item._id} className="w-[72vw] shrink-0 snap-center sm:w-[45vw] lg:w-auto">
              <Figure
                image={item.image}
                sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 45vw, 72vw"
                aspect="aspect-[4/5]"
                priority={index < 2}
                quality={82}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="page-gutter mt-8 text-center">
        <Link href={href('gallery')} className="btn btn-ghost">
          Ver toda la galería
        </Link>
      </div>
    </section>
  )
}
