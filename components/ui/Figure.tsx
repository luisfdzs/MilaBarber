import Image from 'next/image'
import type { SiteImage } from '@/lib/content-types'
import { cn } from '@/lib/cn'

type Props = {
  image: SiteImage | null
  sizes: string
  className?: string
  aspect?: string
  priority?: boolean
  quality?: number
  caption?: string
}

export function Figure({
  image,
  sizes,
  className,
  aspect = 'aspect-[4/5]',
  priority = false,
  quality = 75,
  caption,
}: Props) {
  return (
    <figure className={cn('flex flex-col gap-3', className)}>
      <div className={cn('relative overflow-hidden bg-coal', aspect)}>
        {image ? (
          <Image
            src={image.url}
            alt={caption ? '' : image.alt}
            fill
            sizes={sizes}
            quality={quality}
            priority={priority}
            placeholder={image.lqip ? 'blur' : 'empty'}
            blurDataURL={image.lqip ?? undefined}
            className="object-cover transition-transform duration-700 ease-out-soft hover:scale-[1.03]"
          />
        ) : (
          <div aria-hidden className="placeholder-grid size-full" />
        )}
      </div>
      {caption && <figcaption className="text-small text-bone-soft">{caption}</figcaption>}
    </figure>
  )
}
