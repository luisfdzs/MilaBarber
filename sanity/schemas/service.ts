import { defineField, defineType } from 'sanity'

/**
 * UN SERVICIO de la carta: corte, barba, mechas, cejas…
 *
 * Los tres campos que importan son nombre, **precio** y **duración**, y los tres son
 * obligatorios por el mismo motivo: el precio es lo primero que mira quien entra en la
 * web de una barbería, y la duración no es decorativa —es lo que usa el calendario para
 * saber cuántos huecos ocupa la cita—. Un servicio sin duración partiría la agenda.
 *
 * La descripción sí es opcional: «Arreglo de cejas, 2 €, 5 min» se explica solo, y
 * obligar a escribir una frase acaba produciendo relleno.
 */
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
      // Múltiplos de 5: es la rejilla con la que trabaja el calendario de reservas.
      // Aceptar 37 minutos obligaría a huecos que no encajan con ningún otro servicio.
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
