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

export const CONTENT_TAG = 'content'

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
  return parsed.length > 0 ? parsed : seedServices
}

export async function getFeaturedServices(): Promise<Service[]> {
  const services = await getServices()
  const featured = services.filter((service) => service.featured)
  return featured.length > 0 ? featured : services.slice(0, 4)
}

export async function getBarbers(): Promise<Barber[]> {
  const raw = await ask<unknown[]>(barbersQuery)
  const parsed = parseList(barberSchema, raw, 'barbero')
  return parsed.length > 0 ? parsed : seedBarbers
}

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
  if (raw) console.error('[content] «Textos de la web» viene mal formado.', raw)
  return seedBusinessText
}
