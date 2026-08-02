import { defineField, defineType } from 'sanity'

/**
 * LOS TEXTOS DE LA PORTADA Y LA FICHA DEL NEGOCIO. Documento único.
 *
 * Aquí va lo que la barbería puede querer cambiar sin llamar a nadie —el titular del
 * hero, la presentación, el aviso de si se atiende sin cita— y **no** lo que es
 * estructural. El teléfono, la dirección y el horario viven en `content/site.ts`, en el
 * código: son datos que cambian una vez cada varios años, los usa también el pie de
 * página y el calendario de reservas, y tenerlos en dos sitios editables es la forma
 * segura de que un día no coincidan.
 *
 * Regla general del proyecto: **al CMS va lo que cambia; al código, lo que define.**
 */
export const businessInfo = defineType({
  name: 'businessInfo',
  title: 'Textos de la web',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Titular de la portada',
      type: 'string',
      description:
        'Va sobre el vídeo, a tamaño enorme y en mayúsculas. Tres o cuatro palabras: más ' +
        'largo y en un móvil ocupa media pantalla.',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'heroLead',
      title: 'Frase bajo el titular',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'aboutTitle',
      title: 'Título de «La barbería»',
      type: 'string',
    }),
    defineField({
      name: 'aboutBody',
      title: 'Texto de «La barbería»',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Párrafo', value: 'normal' }], lists: [] }],
      description:
        'Sin títulos ni listas a propósito: es un bloque de dos o tres párrafos, y dejar ' +
        'estilos sueltos acaba produciendo páginas que no se parecen al resto de la web.',
    }),
    defineField({
      name: 'walkInsWelcome',
      title: 'Se atiende sin cita',
      type: 'boolean',
      description:
        'Cuando está marcado, la portada lo dice junto al botón de reservar. Es la pregunta ' +
        'que más llega por WhatsApp.',
      initialValue: true,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Textos de la web' }),
  },
})
