import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { routes, type RouteKey } from '@/lib/routes'

const PUBLIC: { key: RouteKey; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
  { key: 'home', priority: 1, changeFrequency: 'weekly' },
  { key: 'services', priority: 0.9, changeFrequency: 'monthly' },
  { key: 'book', priority: 0.8, changeFrequency: 'monthly' },
  { key: 'gallery', priority: 0.7, changeFrequency: 'weekly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return PUBLIC.map(({ key, priority, changeFrequency }) => ({
    url: new URL(routes[key].href, site.url).toString(),
    lastModified,
    changeFrequency,
    priority,
  }))
}
