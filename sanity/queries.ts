import { groq } from 'next-sanity'

/**
 * LAS CONSULTAS, todas juntas y todas con la misma disciplina: **nunca `...`**.
 *
 * Cada consulta enumera exactamente los campos que la web usa y los devuelve ya con la
 * forma que esperan los esquemas de `lib/content-types.ts` —imágenes resueltas a URL,
 * referencias resueltas a nombre—. Traer el documento entero sería más cómodo de
 * escribir y peor en todo lo demás: se transporta lo que no se usa, y el día que alguien
 * añade un campo al panel aparece en la web sin que nadie lo haya decidido.
 */

/** Bloque común de imagen. Lo que necesita `<Image>` y ni un campo más. */
const imageFields = groq`
  "url": asset->url,
  "alt": coalesce(alt, ""),
  "aspectRatio": asset->metadata.dimensions.aspectRatio,
  "lqip": asset->metadata.lqip
`

export const servicesQuery = groq`
  *[_type == "service" && active == true] | order(order asc) {
    _id,
    "slug": slug.current,
    name,
    "description": description,
    price,
    durationMinutes,
    featured,
    active,
    order
  }
`

export const barbersQuery = groq`
  *[_type == "barber"] | order(order asc) {
    _id,
    name,
    role,
    bio,
    "photo": select(defined(photo.asset) => photo{${imageFields}}, null),
    instagram,
    acceptsBookings,
    vacationFrom,
    vacationTo,
    order
  }
`

export const galleryQuery = groq`
  *[_type == "galleryItem" && defined(image.asset)] | order(publishedAt desc) {
    _id,
    image{${imageFields}},
    category,
    "barberName": barber->name,
    featured,
    publishedAt
  }
`

/**
 * Los avisos vigentes **hoy**. El filtro va en la consulta y no en JavaScript para que
 * un aviso caducado ni siquiera salga de Sanity: así no hay forma de que se cuele por
 * olvidar el filtro en algún sitio. `$today` lo pasa `lib/content.ts` en formato
 * `YYYY-MM-DD`, que es como Sanity guarda los campos de fecha, y por eso la comparación
 * de cadenas funciona igual que la de fechas.
 */
export const activePromotionsQuery = groq`
  *[_type == "promotion" && from <= $today && until >= $today] | order(from desc) {
    _id,
    title,
    body,
    ctaLabel,
    ctaHref,
    from,
    until
  }
`

/**
 * Los textos de la portada. `aboutBody` se aplana a un array de cadenas aquí mismo: son
 * párrafos llanos, y devolverlos como bloques obligaría a traer un renderizador de
 * Portable Text a la web para no hacer nada con él.
 */
export const businessTextQuery = groq`
  *[_type == "businessInfo"][0] {
    heroHeadline,
    heroLead,
    aboutTitle,
    "aboutBody": aboutBody[_type == "block"]{
      "text": array::join(children[].text, "")
    }.text,
    walkInsWelcome
  }
`
