import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { routes, type RouteKey } from '@/lib/routes'

/**
 * EL SITEMAP.
 *
 * Se construye desde `lib/routes.ts`, que es el mismo sitio del que leen la cabecera, la
 * barra de móvil y el pie. Así una página nueva aparece en el menú y en el sitemap a la
 * vez: la alternativa —una lista aquí— es la que se queda vieja, porque nadie se acuerda
 * de tocar el sitemap el día que añade una sección.
 *
 * SÓLO LAS PÁGINAS PÚBLICAS, y se enumeran a mano en vez de filtrar por «lo que no sea
 * privado». Es deliberado: una lista de lo que SÍ entra no puede filtrar de más el día que
 * se añada una ruta con sesión, mientras que una regla en negativo mete cualquier ruta
 * nueva en Google salvo que alguien se acuerde de excluirla. Con cuatro páginas, la lista
 * explícita es también la más corta.
 *
 * Las anclas de la portada (`/#equipo`, `/#donde-estamos`) no son URLs distintas y no van:
 * un sitemap con fragmentos es contenido duplicado declarado por uno mismo.
 */

const PUBLIC: { key: RouteKey; priority: number; changeFrequency: 'weekly' | 'monthly' }[] = [
  { key: 'home', priority: 1, changeFrequency: 'weekly' },
  // Los precios son lo que más se busca de una barbería, por detrás del propio nombre.
  { key: 'services', priority: 0.9, changeFrequency: 'monthly' },
  { key: 'book', priority: 0.8, changeFrequency: 'monthly' },
  // La galería cambia cada vez que suben una foto, que es lo más frecuente de todo.
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
