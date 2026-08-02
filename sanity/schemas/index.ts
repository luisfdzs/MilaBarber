import type { SchemaTypeDefinition } from 'sanity'
import { barber } from './barber'
import { businessInfo } from './businessInfo'
import { galleryItem } from './galleryItem'
import { promotion } from './promotion'
import { service } from './service'

/**
 * Cinco tipos y ni uno más. Cada uno responde a una pregunta que la barbería se hace de
 * verdad: qué ofrezco y a qué precio (`service`), quién corta (`barber`), cómo queda el
 * trabajo (`galleryItem`), qué tengo que avisar (`promotion`) y qué cuenta la portada
 * (`businessInfo`).
 *
 * Lo que NO está aquí y podría parecer que falta: las citas y los clientes. Eso vive en
 * MongoDB, no en el CMS — ver `lib/db.ts`. Un panel de contenido no es sitio para datos
 * personales ni para nada que se escriba desde la web sin pasar por una persona.
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  service,
  barber,
  galleryItem,
  promotion,
  businessInfo,
]
