import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { isIndexable } from '@/lib/site-env'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cuenta', '/entrar', '/registro', '/admin', '/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
