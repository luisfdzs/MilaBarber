import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.documentTypeListItem('galleryItem').title('Galería'),
      S.documentTypeListItem('promotion').title('Avisos'),
      S.divider(),
      S.documentTypeListItem('service').title('Servicios'),
      S.documentTypeListItem('barber').title('Equipo'),
      S.divider(),
      S.listItem()
        .title('Textos de la web')
        .id('businessInfo')
        .child(S.document().schemaType('businessInfo').documentId('businessInfo')),
    ])
