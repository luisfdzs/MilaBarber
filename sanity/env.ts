/**
 * Datos de conexión con Sanity.
 *
 * `projectId` y `dataset` **no son secretos** (van en el HTML de cualquier web con
 * Sanity), así que viven en variables públicas. El token de escritura sí lo es: se lee
 * de `.env.local` y nunca llega al navegador.
 *
 * A DIFERENCIA DEL PROYECTO DE REFERENCIA, LA FALTA DE VARIABLES NO REVIENTA NADA.
 * Allí el CMS es la única fuente y sin él no hay web que enseñar, así que se lanza un
 * error nada más importar el módulo. Aquí la web tiene que arrancar igual sin Sanity:
 * los servicios, el equipo y los textos tienen una copia de partida en `content/seed.ts`
 * —transcrita de la web actual, que es contenido real y verificado— y `lib/content.ts`
 * la sirve mientras el panel no exista o esté vacío. Es lo que permite montar y
 * desplegar el sitio ANTES de crear el proyecto de Sanity, en vez de después.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/** Fecha de la API: se fija para que Sanity no cambie de comportamiento por su cuenta. */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-08-01'

/**
 * ¿Hay un proyecto de Sanity detrás? Lo consulta `lib/content.ts` antes de preguntar,
 * y el aviso de `/admin` para explicar qué falta en vez de enseñar un panel roto.
 */
export const isSanityConfigured = projectId.length > 0
