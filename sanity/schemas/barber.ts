import { defineField, defineType } from 'sanity'

/**
 * UN BARBERO.
 *
 * Es a la vez contenido y dato de operación, y por eso vive en el CMS y no en una tabla
 * de la base: la misma ficha que se enseña en la sección «Equipo» de la portada es la
 * que alimenta el desplegable de «con quién quieres cortarte» al reservar. Dos sitios,
 * un dato — si se corrigiera el nombre en uno y no en el otro, la confirmación de la
 * cita llamaría al barbero de otra manera que la web.
 *
 * `vacationFrom`/`vacationTo` no son un adorno: la aplicación anterior avisaba de las
 * vacaciones con una ventana emergente en cada entrada, y es información que la gente
 * necesita ANTES de intentar reservar. Aquí, además de avisar, el calendario deja de
 * ofrecer esos días.
 */
export const barber = defineType({
  name: 'barber',
  title: 'Barbero',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Puesto',
      type: 'string',
      description: 'Opcional. «Fundador», «Barbero», «Especialista en color»…',
    }),
    defineField({
      name: 'bio',
      title: 'Presentación',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'photo',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Texto alternativo',
          type: 'string',
          description:
            'Lo que se ve, para quien no puede verla. «Hassan, de pie junto al sillón», no ' +
            '«barbero profesional».',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      description: 'Opcional. Perfil propio, si lo tiene.',
    }),
    defineField({
      name: 'acceptsBookings',
      title: 'Acepta reservas',
      type: 'boolean',
      description:
        'Al desmarcarlo sigue apareciendo en la portada pero desaparece del calendario. ' +
        'Sirve para una baja larga sin borrar la ficha.',
      initialValue: true,
    }),
    defineField({
      name: 'vacationFrom',
      title: 'Vacaciones · desde',
      type: 'date',
      description: 'Se avisa en la web y el calendario no ofrece estos días. Vaciar al volver.',
    }),
    defineField({
      name: 'vacationTo',
      title: 'Vacaciones · hasta',
      type: 'date',
      description: 'Inclusive: el último día que está fuera.',
      validation: (rule) =>
        rule.custom((to, context) => {
          const from = (context.document as { vacationFrom?: string } | undefined)?.vacationFrom
          if (!to || !from) return true
          return to >= from || 'La vuelta no puede ser anterior a la salida.'
        }),
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      validation: (rule) => rule.required().integer(),
      initialValue: 100,
    }),
  ],
  orderings: [{ title: 'Orden', name: 'byOrder', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})
