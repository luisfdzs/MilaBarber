import { defineField, defineType } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Servicio',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Dirección web',
      type: 'slug',
      options: { source: 'name', maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
      rows: 3,
      description: 'Opcional. Una o dos frases; lo que no se entiende sólo con el nombre.',
    }),
    defineField({
      name: 'price',
      title: 'Precio (€)',
      type: 'number',
      validation: (rule) => rule.required().min(0).precision(2),
    }),
    defineField({
      name: 'durationMinutes',
      title: 'Duración (minutos)',
      type: 'number',
      description:
        'Lo que ocupa en la agenda. El calendario reserva exactamente este tiempo, así que ' +
        'conviene que sea el real y no el optimista.',
      validation: (rule) => rule.required().min(5).max(300).integer(),
      initialValue: 30,
    }),
    defineField({
      name: 'featured',
      title: 'Destacar en la portada',
      type: 'boolean',
      description:
        'La portada enseña sólo los destacados. Marcar tres o cuatro, no los siete: una ' +
        'lista completa en la portada obliga a leerla entera antes de decidir nada.',
      initialValue: false,
    }),
    defineField({
      name: 'active',
      title: 'A la venta',
      type: 'boolean',
      description:
        'Al desmarcarlo deja de ofrecerse y desaparece del calendario, pero las citas ya ' +
        'reservadas siguen enteras. Es lo que hay que usar para retirar un servicio: ' +
        'borrarlo dejaría esas citas sin nombre.',
      initialValue: true,
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description:
        'De menor a mayor. El corte de pelo va primero porque es lo que pide la mayoría.',
      validation: (rule) => rule.required().integer(),
      initialValue: 100,
    }),
  ],
  orderings: [
    {
      title: 'Orden de la carta',
      name: 'byOrder',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', price: 'price', duration: 'durationMinutes', active: 'active' },
    prepare({ title, price, duration, active }) {
      return {
        title: active ? title : `${title} (retirado)`,
        subtitle: `${price} € · ${duration} min`,
      }
    },
  },
})
