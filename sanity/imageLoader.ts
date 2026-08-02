/**
 * CARGADOR DE IMÁGENES DE SANITY (para `next/image`)
 *
 * Cada `<Image>` pide a la CDN de Sanity exactamente el ancho que necesita, y Sanity
 * devuelve la variante ya redimensionada y en el mejor formato que acepte el navegador
 * (`auto=format` → AVIF o WebP). Es lo que hace que una foto de 12 MB salida del móvil
 * del barbero llegue al visitante ligera, sin que nadie la prepare antes. Importa más de
 * lo que parece: el contenido que más va a crecer aquí es la galería de cortes, y la
 * sube quien está cortando el pelo, no un diseñador.
 *
 * Se declara en `next.config.ts` (`images.loaderFile`) y sustituye al optimizador de
 * Vercel para todas las imágenes: así el trabajo lo hace la CDN de Sanity —que ya tiene
 * el original— y no se consume cuota de optimización de Vercel.
 */
export default function sanityImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  // Las imágenes locales (favicon, apertura social, póster del hero) no pasan por Sanity.
  if (!src.startsWith('https://cdn.sanity.io/')) return src

  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? 75))
  url.searchParams.set('auto', 'format')
  // `max` nunca amplía por encima del original ni deforma.
  url.searchParams.set('fit', 'max')
  return url.toString()
}
