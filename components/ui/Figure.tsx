import Image from 'next/image'
import type { SiteImage } from '@/lib/content-types'
import { cn } from '@/lib/cn'

/**
 * UNA FOTO, con el hueco resuelto cuando todavía no hay foto.
 *
 * Todo el material de este sitio lo sube la barbería desde el móvil, así que el estado
 * «aún no hay imagen» no es un caso raro de desarrollo: es el estado normal durante las
 * primeras semanas y cada vez que se añade un barbero nuevo. La decisión, heredada del
 * proyecto de referencia, es **que el hueco se vea como un hueco** —trama diagonal— en
 * lugar de disimularlo con una silueta gris o con una foto de banco. Un hueco visible
 * pide que lo llenen; una foto de banco se queda ahí para siempre.
 *
 * `sizes` es obligatorio y no tiene valor por defecto a propósito: es lo que decide qué
 * ancho se descarga, y un `100vw` puesto por descuido en una rejilla de tres columnas
 * hace que cada móvil se trague tres fotos de pantalla completa. Quien coloca la imagen
 * es quien sabe cuánto va a medir.
 */
type Props = {
  image: SiteImage | null
  sizes: string
  className?: string
  /** Proporción del hueco, en la forma de la utilidad de Tailwind: `aspect-[4/5]`. */
  aspect?: string
  priority?: boolean
  quality?: number
  /** Pie visible. Cuando se pone, la imagen pasa a `alt=""` para no leerse dos veces. */
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
            // La miniatura borrosa la calcula Sanity al subir la foto: no cuesta una
            // petición y evita el rectángulo negro mientras llega la buena, que en una
            // galería de doce fotos es la diferencia entre «está cargando» y «está roto».
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
