import type { SchemaTypeDefinition } from 'sanity'
import { barber } from './barber'
import { businessInfo } from './businessInfo'
import { galleryItem } from './galleryItem'
import { promotion } from './promotion'
import { service } from './service'

export const schemaTypes: SchemaTypeDefinition[] = [
  service,
  barber,
  galleryItem,
  promotion,
  businessInfo,
]
