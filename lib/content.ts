import 'server-only'
import { seedBarbers, seedBusinessText, seedServices } from '@/content/seed'
import { client } from '@/sanity/client'
import {
  activePromotionsQuery,
  barbersQuery,
  businessTextQuery,
  galleryQuery,
  servicesQuery,
} from '@/sanity/queries'
import {
  barberSchema,
  businessTextSchema,
  galleryItemSchema,
  promotionSchema,
  serviceSchema,
  type Barber,
  type BusinessText,
  type GalleryItem,
  type Promotion,
  type Service,
} from './content-types'
import { toIsoDay } from './format'

/**
 * LA ÚNICA PUERTA AL CONTENIDO. Ninguna página habla con Sanity directamente.
 *
 * Cada función de aquí hace lo mismo en tres pasos: pregunta al CMS, valida lo que llega
 * y —si no llega nada aprovechable— devuelve la copia de partida de `content/seed.ts`.
 * Ese tercer paso es lo que permite que la web funcione antes de que exista el proyecto
 * de Sanity, con contenido real y no con «lorem ipsum».
 *
 * QUÉ PASA SI EL CONTENIDO ESTÁ MAL. Se registra en el log y se sirve la copia de
 * partida; **no se cae la web**. Es una decisión distinta a la del proyecto de
 * referencia, que aborta el build. Allí el CMS lo maneja un equipo técnico y un error
 * conviene que pare la línea; aquí lo maneja quien está cortando el pelo entre cliente y
 * cliente, y que una barbería se quede sin web un sábado por un campo mal puesto es peor
 * que enseñar el precio de la semana pasada. El fallo queda igual de visible en los
 * registros de Vercel.
 */

/**
 * La etiqueta con la que se cachean TODAS las consultas. Una sola para todo el
 * contenido: son pocas páginas y regenerarlas es barato, así que no merece la pena
 * afinar por tipo de documento. La invalida el webhook de publicación, en
 * `app/api/revalidate`.
 */
export const CONTENT_TAG = 'content'

/**
 * Media hora. No es la vía principal de actualización —de eso se encarga el webhook— sino
 * la red de seguridad para el día que el webhook esté mal configurado o Sanity no llame:
 * el contenido acabaría llegando igual, sólo que más tarde.
 */
const REVALIDATE_SECONDS = 1800

async function ask<T>(query: string, params: Record<string, unknown> = {}): Promise<T | null> {
  if (!client) return null
  try {
    return await client.fetch<T>(query, params, {
      next: { tags: [CONTENT_TAG], revalidate: REVALIDATE_SECONDS },
    })
  } catch (error) {
    console.error('[content] Sanity no ha respondido; se usa el contenido de partida.', error)
    return null
  }
}

/** Valida una lista descartando sólo lo que venga roto, no la lista entera. */
function parseList<T>(
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
  raw: unknown,
  what: string,
): T[] {
  if (!Array.isArray(raw)) return []
  const parsed: T[] = []
  for (const item of raw) {
    const result = schema.safeParse(item)
    if (result.success && result.data !== undefined) parsed.push(result.data)
    else console.error(`[content] Se descarta un documento de tipo "${what}" mal formado.`, item)
  }
  return parsed
}

export async function getServices(): Promise<Service[]> {
  const raw = await ask<unknown[]>(servicesQuery)
  const parsed = parseList(serviceSchema, raw, 'servicio')
  // Un CMS recién creado está vacío, y una barbería sin carta de precios no es una web
  // que se pueda enseñar. Mientras no haya ni un servicio publicado, manda la copia.
  return parsed.length > 0 ? parsed : seedServices
}

export async function getFeaturedServices(): Promise<Service[]> {
  const services = await getServices()
  const featured = services.filter((service) => service.featured)
  // Si nadie ha marcado ninguno, la portada enseña los cuatro primeros de la carta en
  // vez de quedarse con la sección vacía.
  return featured.length > 0 ? featured : services.slice(0, 4)
}

export async function getBarbers(): Promise<Barber[]> {
  const raw = await ask<unknown[]>(barbersQuery)
  const parsed = parseList(barberSchema, raw, 'barbero')
  return parsed.length > 0 ? parsed : seedBarbers
}

/**
 * Los barberos a los que se les puede pedir cita **hoy**: descarta a quien no acepta
 * reservas y a quien está de vacaciones. Lo usa el calendario; la sección «Equipo» de la
 * portada usa `getBarbers()`, porque quien está de vacaciones sigue siendo del equipo.
 */
export async function getBookableBarbers(on: Date = new Date()): Promise<Barber[]> {
  const day = toIsoDay(on)
  return (await getBarbers()).filter((barber) => {
    if (!barber.acceptsBookings) return false
    const { vacationFrom: from, vacationTo: to } = barber
    if (from && to) return day < from || day > to
    return true
  })
}

export async function getGallery(): Promise<GalleryItem[]> {
  // Sin copia de partida a propósito: no tenemos fotos de la barbería y no se van a
  // poner fotos de banco haciendo pasar por suyo el trabajo de otro. Hasta que suban
  // las suyas, la galería no se pinta.
  return parseList(galleryItemSchema, await ask<unknown[]>(galleryQuery), 'foto')
}

export async function getFeaturedGallery(limit = 6): Promise<GalleryItem[]> {
  const gallery = await getGallery()
  const featured = gallery.filter((item) => item.featured)
  return (featured.length > 0 ? featured : gallery).slice(0, limit)
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const raw = await ask<unknown[]>(activePromotionsQuery, { today: toIsoDay(new Date()) })
  return parseList(promotionSchema, raw, 'aviso')
}

export async function getBusinessText(): Promise<BusinessText> {
  const raw = await ask<unknown>(businessTextQuery)
  const result = businessTextSchema.safeParse(raw)
  if (result.success) return result.data
  // Aquí no se registra nada cuando `raw` es `null`: es el caso normal antes de que
  // alguien haya abierto el panel por primera vez, no un error.
  if (raw) console.error('[content] «Textos de la web» viene mal formado.', raw)
  return seedBusinessText
}
