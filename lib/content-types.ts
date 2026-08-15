import { z } from 'zod'

export const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().min(1),
  aspectRatio: z.number().positive().nullable().default(null),
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
  vacationFrom: z.string().nullable().default(null),
  vacationTo: z.string().nullable().default(null),
  order: z.number().int().default(100),
})

export type Barber = z.infer<typeof barberSchema>

export const galleryCategories = [
  'corte',
  'peinado',
  'trenzas',
  'barba',
  'color',
  'video',
  'local',
] as const

export type GalleryCategory = (typeof galleryCategories)[number]

export const galleryCategoryLabels: Record<GalleryCategory, string> = {
  corte: 'Cortes',
  peinado: 'Peinados',
  trenzas: 'Trenzas',
  barba: 'Barba',
  color: 'Color y mechas',
  video: 'Vídeos',
  local: 'El local',
}

export const galleryItemSchema = z.object({
  _id: z.string(),
  image: imageSchema,
  video: z.string().url().nullable().default(null),
  category: z.enum(galleryCategories),
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

export const businessTextSchema = z.object({
  heroHeadline: z.string().min(1),
  heroLead: z.string().nullable().default(null),
  aboutTitle: z.string().nullable().default(null),
  aboutBody: z.array(z.string()).default([]),
  walkInsWelcome: z.boolean().default(true),
})

export type BusinessText = z.infer<typeof businessTextSchema>
