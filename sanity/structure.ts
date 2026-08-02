import type { StructureResolver } from 'sanity/structure'

/**
 * MENÚ DEL PANEL
 *
 * Se define a mano en vez de dejar el listado automático por dos razones:
 *
 * 1. **Orden pensado para quien lo usa.** Arriba lo que se toca cada semana —fotos y
 *    avisos—; abajo lo que se toca una vez al año. El listado automático los pone por
 *    orden alfabético, que no significa nada para nadie.
 * 2. **Los textos de la web son un documento único.** Se abre directamente en su
 *    formulario, sin un listado con un solo elemento dentro ni la opción de crear un
 *    segundo.
 */
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
