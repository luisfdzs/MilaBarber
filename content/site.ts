/**
 * LOS DATOS DEL NEGOCIO, en un solo sitio.
 *
 * Todo lo que aparece aquí está **verificado**: sale de la web actual
 * (milabarberr.com), del perfil de Instagram o de la nota de prensa local que
 * cubrió la apertura. Nada se inventa —es un negocio real y la web habla en su
 * nombre—; lo que no conste se deja vacío y la web no pinta el campo.
 *
 * Lo que cambia a menudo (servicios, precios, fotos, avisos) NO vive aquí: vive
 * en Sanity, para que la barbería lo edite sin tocar el código. Aquí sólo lo que
 * es estructural y no cambia en años: cómo se llama, dónde está y cómo se le
 * escribe. Ver `sanity/schemas/` para lo demás.
 */

export const site = {
  name: 'Mila Barber',
  /** Rótulo que acompaña a la marca en la web anterior y en el local. */
  tagline: 'Tu estilo, nuestra pasión',

  /**
   * Dominio de producción. El `prod` de Vercel se apuntará aquí; hasta entonces
   * sirve igual para construir las URLs canónicas y el sitemap.
   */
  url: 'https://milabarberr.com',

  contact: {
    phone: '+34631846411',
    /** El mismo número, escrito como se lee. Sólo para pintar, nunca para `tel:`. */
    phoneLabel: '+34 631 846 411',
    email: 'milabarber2025@gmail.com',
    whatsapp: 'https://wa.me/34631846411',
  },

  address: {
    street: 'Calle Río Irati, 13',
    postalCode: '31005',
    city: 'Pamplona',
    region: 'Navarra',
    country: 'ES',
    /** El barrio da nombre a la barbería: la Milagrosa, «la Mila». */
    neighbourhood: 'La Milagrosa',
  },

  /**
   * Horario de apertura. En formato de datos y no como frase suelta porque lo
   * usan tres sitios a la vez: el pie, la ficha de Google (JSON-LD) y el
   * calendario de reservas, que no debe ofrecer una hora en la que está cerrado.
   * `days` sigue la numeración de `Date.getDay()`: 0 es domingo.
   */
  hours: {
    days: [1, 2, 3, 4, 5, 6],
    opens: '09:00',
    closes: '21:00',
    label: 'Lunes a sábado, de 9:00 a 21:00',
    closedLabel: 'Domingos, cerrado',
  },

  social: {
    instagram: 'https://www.instagram.com/milabarber10',
    youtube: 'https://www.youtube.com/@milabarberr',
  },
} as const

export type Site = typeof site
