import { defineField, defineType } from 'sanity'

/**
 * UN AVISO: vacaciones, horario especial de Navidad, una oferta de vuelta al cole.
 *
 * Sustituye a las ventanas emergentes de la aplicación anterior, que aparecían al entrar
 * y había que cerrar una por una. Aquí el aviso vive **en la página**, en una banda bajo
 * la cabecera: se lee sin bloquear nada, no hay nada que cerrar y —lo importante— sigue
 * ahí cuando la persona vuelve, en vez de haberse gastado en el primer vistazo.
 *
 * Las fechas hacen que caduque solo. Es la diferencia entre un aviso y un problema: sin
 * `until`, el cartel de las vacaciones de agosto sigue puesto en octubre porque nadie se
 * acordó de quitarlo.
 */
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
