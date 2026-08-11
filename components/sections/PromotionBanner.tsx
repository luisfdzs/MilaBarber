import Link from 'next/link'
import type { Promotion } from '@/lib/content-types'

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
