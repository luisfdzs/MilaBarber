import { z } from 'zod'

/**
 * LA FORMA DEL CONTENIDO, declarada una vez con zod.
 *
 * Los esquemas de `sanity/schemas/` describen el formulario que ve quien edita; éstos
 * describen lo que la web espera recibir. No son lo mismo y por eso están separados: el
 * panel puede tener un campo a medio rellenar, un documento sin publicar o una foto que
 * se borró del CDN, y la web tiene que enterarse **al leer**, no al pintar.
 *
 * Validar aquí es lo que convierte un fallo de contenido en un error legible en el log
 * del build en vez de un `undefined is not an object` en el navegador de un cliente.
 *
 * Los tipos de TypeScript se derivan de los esquemas (`z.infer`), nunca al revés: así no
 * existe la posibilidad de que el tipo diga una cosa y la validación otra.
 */

/**
 * Una imagen ya resuelta a URL y texto alternativo. La consulta GROQ hace el trabajo
 * (`asset->url`) para que los componentes no tengan que saber de Sanity: reciben algo
 * que se puede pasar a `<Image>` tal cual.
 */
export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
  /** Proporción del original. Evita el salto de maquetación mientras la foto carga. */
  aspectRatio: z.number().positive().nullable().default(null),
  /** Miniatura en base64 que Sanity calcula sola: se pinta borrosa mientras llega la buena. */
  lqip: z.string().nullable().default(null),
})

export type SiteImage = z.infer<typeof imageSchema>

export const serviceSchema = z.object({
  _id: z.string(),
  slug: z.string(),
  name: z.string().min(1),
  description: z.string().nullable().default(null),
  price: z.number().nonnegative(),
  durationMinutes: z.number().int().positive(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  order: z.number().int().default(100),
})

export type Service = z.infer<typeof serviceSchema>

export const barberSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  role: z.string().nullable().default(null),
  bio: z.string().nullable().default(null),
  photo: imageSchema.nullable().default(null),
  instagram: z.string().nullable().default(null),
  acceptsBookings: z.boolean().default(true),
  /** `YYYY-MM-DD`, tal cual lo guarda Sanity. Sin hora: son días enteros. */
  vacationFrom: z.string().nullable().default(null),
  vacationTo: z.string().nullable().default(null),
  order: z.number().int().default(100),
})

export type Barber = z.infer<typeof barberSchema>

export const galleryItemSchema = z.object({
  _id: z.string(),
  image: imageSchema,
  category: z.enum(['corte', 'barba', 'color', 'local']),
  barberName: z.string().nullable().default(null),
  featured: z.boolean().default(false),
  publishedAt: z.string(),
})

export type GalleryItem = z.infer<typeof galleryItemSchema>

export const promotionSchema = z.object({
  _id: z.string(),
  title: z.string().min(1),
  body: z.string().nullable().default(null),
  ctaLabel: z.string().nullable().default(null),
  ctaHref: z.string().nullable().default(null),
  from: z.string(),
  until: z.string(),
})

export type Promotion = z.infer<typeof promotionSchema>

/**
 * Un párrafo de texto con formato, en la forma mínima que necesita la web: el bloque
 * de Sanity trae más cosas (marcas, enlaces, anotaciones) pero «La barbería» son dos o
 * tres párrafos llanos y no hay motivo para arrastrar un renderizador entero.
 */
export const businessTextSchema = z.object({
  heroHeadline: z.string().min(1),
  heroLead: z.string().nullable().default(null),
  aboutTitle: z.string().nullable().default(null),
  aboutBody: z.array(z.string()).default([]),
  walkInsWelcome: z.boolean().default(true),
})

export type BusinessText = z.infer<typeof businessTextSchema>
