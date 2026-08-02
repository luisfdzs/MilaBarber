import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { isIndexable } from '@/lib/site-env'

/**
 * `robots.txt`.
 *
 * DOS FICHEROS DISTINTOS SEGÚN LA RAMA. En `prod` se abre la web y se cierran las zonas
 * que no pintan nada en un buscador; en cualquier otro despliegue —test, previews— se
 * cierra entera. El motivo está en `lib/site-env.ts` y no es teórico: el proyecto de test
 * despliega su rama *como producción*, así que sin esta distinción tendría el mismo
 * contenido indexado que milabarberr.com compitiendo por «barbería la Milagrosa».
 *
 * `noindex` en las cabeceras (el `metadata.robots` del layout) y `Disallow` aquí NO son lo
 * mismo y por eso están los dos: `Disallow` dice «no lo rastrees» y `noindex` dice «no lo
 * publiques en tus resultados». Una página enlazada desde fuera puede acabar en el índice
 * sin rastrearse, y entonces sólo la cabecera la saca.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // El área privada: son páginas por persona, detrás de una sesión. Rastrearlas sólo
        // gasta presupuesto de rastreo en redirecciones al formulario de acceso.
        '/cuenta',
        '/entrar',
        '/registro',
        // El panel de contenido y las rutas de servicio no son páginas.
        '/admin',
        '/api/',
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
