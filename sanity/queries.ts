import { groq } from 'next-sanity'

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
