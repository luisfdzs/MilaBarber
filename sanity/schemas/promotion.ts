import { defineField, defineType } from 'sanity'

export const promotion = defineType({
  name: 'promotion',
  title: 'Aviso',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'Corto y en lenguaje llano: «Cerramos del 9 al 24 de agosto».',
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: 'body',
      title: 'Detalle',
      type: 'text',
      rows: 3,
      description: 'Opcional. Una frase más, si hace falta.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Texto del enlace',
      type: 'string',
      description: 'Opcional. «Reserva antes del 8», «Ver horario».',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Destino del enlace',
      type: 'string',
      description: 'Una ruta de esta web («/reservar») o una dirección completa.',
    }),
    defineField({
      name: 'from',
      title: 'Mostrar desde',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'until',
      title: 'Mostrar hasta',
      type: 'date',
      description: 'Inclusive. Pasada esta fecha el aviso desaparece solo.',
      validation: (rule) =>
        rule.required().custom((until, context) => {
          const from = (context.document as { from?: string } | undefined)?.from
          if (!until || !from) return true
          return until >= from || 'El fin no puede ser anterior al comienzo.'
        }),
    }),
  ],
  orderings: [
    { title: 'Más reciente', name: 'byFrom', by: [{ field: 'from', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', from: 'from', until: 'until' },
    prepare({ title, from, until }) {
      return { title, subtitle: `${from ?? '—'} → ${until ?? '—'}` }
    },
  },
})
