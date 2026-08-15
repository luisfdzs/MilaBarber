export const site = {
  name: 'Mila Barber',
  tagline: 'Tu estilo, nuestra pasión',

  url: 'https://milabarberr.com',

  contact: {
    phone: '+34631846411',
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
    neighbourhood: 'La Milagrosa',
  },

  hours: {
    days: [1, 2, 3, 4, 5, 6],
    opens: '09:00',
    closes: '21:00',
    label: 'Lunes a sábado, de 9:00 a 21:00',
    closedLabel: 'Domingos, cerrado',
  },

  social: {
    instagram: 'https://www.instagram.com/milabarberr',
    youtube: 'https://www.youtube.com/@milabarberr',
  },
} as const

export type Site = typeof site
