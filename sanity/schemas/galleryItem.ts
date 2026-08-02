import { defineField, defineType } from 'sanity'

/**
 * UNA FOTO DE LA GALERÍA — un corte terminado, el local, un detalle del trabajo.
 *
 * Es el contenido que más va a crecer y el que más pesa en la decisión de quien mira:
 * en una barbería nadie lee la descripción de «desvanecido con degradado», mira la foto.
 * Por eso la galería es un tipo de documento propio y no un array dentro de otra cosa:
 * subir una foto tiene que ser abrir el panel en el móvil, elegir la imagen y publicar.
 *
 * El `alt` es obligatorio y no es burocracia: estas fotos son el contenido principal de
 * la página, y sin él la galería entera es un agujero para quien navega con lector de
 * pantalla y para Google.
 */
export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Foto de galería',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description: 'Lo que se ve. «Degradado con la raya marcada», no «corte de pelo».',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Corte', value: 'corte' },
          { title: 'Barba', value: 'barba' },
          { title: 'Color', value: 'color' },
          { title: 'El local', value: 'local' },
        ],
        layout: 'radio',
      },
      initialValue: 'corte',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'barber',
      title: 'Quién lo hizo',
      type: 'reference',
      to: [{ type: 'barber' }],
      description: 'Opcional. Si se rellena, la foto aparece también en su ficha.',
    }),
    defineField({
      name: 'featured',
      title: 'Enseñar en la portada',
      type: 'boolean',
      description:
        'La portada muestra una tira con los destacados; la galería completa está en su ' +
        'propia página.',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Fecha',
      type: 'datetime',
      description: 'Ordena la galería: lo más reciente primero.',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    { title: 'Más reciente', name: 'byDate', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'image.alt', subtitle: 'category', media: 'image' },
  },
})
