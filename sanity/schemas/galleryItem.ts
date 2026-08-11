import { defineField, defineType } from 'sanity'

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
