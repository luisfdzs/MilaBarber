import type { Barber, BusinessText, Service } from '@/lib/content-types'

/**
 * CONTENIDO DE PARTIDA.
 *
 * Está **transcrito literalmente de milabarberr.com** (la carta de servicios con sus
 * precios y duraciones, y los dos barberos que aparecen en los avisos de vacaciones de
 * la aplicación anterior). No hay nada inventado: es un negocio real y la web habla en
 * su nombre.
 *
 * Existe por dos motivos, y los dos son prácticos:
 *
 * 1. **La web funciona sin CMS.** Se puede desarrollar, revisar y hasta desplegar antes
 *    de crear el proyecto de Sanity. `lib/content.ts` pregunta al panel y, si no hay
 *    panel o está vacío, sirve esto.
 * 2. **Es el punto de partida del panel.** Cuando Sanity exista, estos mismos datos se
 *    cargan como documentos iniciales y la barbería edita desde ahí. En cuanto haya un
 *    documento publicado, esta copia deja de usarse.
 *
 * Ojo con la consecuencia de (1): mientras el CMS esté vacío, **cambiar un precio aquí
 * cambia el precio de la web**. En cuanto haya contenido publicado, este fichero se
 * queda de museo y editar aquí no hace nada.
 */

export const seedServices: Service[] = [
  {
    _id: 'seed-corte',
    slug: 'corte-de-pelo',
    name: 'Corte de pelo',
    description: 'Corte de cabello personalizado a tu estilo.',
    price: 14,
    durationMinutes: 30,
    featured: true,
    active: true,
    order: 10,
  },
  {
    _id: 'seed-barba-maquina',
    slug: 'arreglo-de-barba-maquina',
    name: 'Arreglo de barba (máquina)',
    description: 'Perfilado y arreglo profesional de barba.',
    price: 8,
    durationMinutes: 30,
    featured: false,
    active: true,
    order: 20,
  },
  {
    _id: 'seed-corte-barba',
    slug: 'corte-y-barba',
    name: 'Corte + Barba',
    description: 'Servicio completo de corte de pelo y arreglo de barba.',
    price: 20,
    durationMinutes: 60,
    featured: true,
    active: true,
    order: 30,
  },
  {
    _id: 'seed-barba-navaja',
    slug: 'arreglo-de-barba-navaja',
    name: 'Arreglo de barba (cuchilla y afeitado a navaja)',
    description:
      'Disfruta de la tradición del afeitado a navaja, un servicio que combina técnica, cuidado y atención al detalle.',
    price: 10,
    durationMinutes: 30,
    featured: true,
    active: true,
    order: 40,
  },
  {
    _id: 'seed-permanente',
    slug: 'permanente',
    name: 'Permanente',
    description:
      'Creamos rizos y ondas personalizados, diseñados a medida según la textura de tu cabello y la imagen que deseas proyectar. Trabajamos con fórmulas de alta gama que respetan la fibra capilar, aportando suavidad, brillo y un acabado sofisticado.',
    price: 60,
    durationMinutes: 120,
    featured: false,
    active: true,
    order: 50,
  },
  {
    _id: 'seed-mechas',
    slug: 'mechas',
    name: 'Mechas',
    description:
      'Consigue un acabado luminoso y cuidado con nuestro servicio de decoloración. Adaptamos el proceso a tu tipo de cabello para lograr un resultado limpio, uniforme y favorecedor.',
    price: 60,
    durationMinutes: 120,
    featured: false,
    active: true,
    order: 60,
  },
  {
    _id: 'seed-cejas',
    slug: 'arreglo-de-cejas',
    name: 'Arreglo de cejas',
    description: null,
    price: 2,
    durationMinutes: 5,
    featured: false,
    active: true,
    order: 70,
  },
]

/**
 * Los dos barberos. Los nombres salen de los avisos de la aplicación anterior; que sean
 * hermanos y que abrieran el local a finales de 2024 es información publicada por la
 * prensa local de Pamplona. **La presentación de cada uno la escriben ellos**: aquí no
 * se pone nada que no hayan dicho, así que `bio` va vacío hasta que llegue.
 */
export const seedBarbers: Barber[] = [
  {
    _id: 'seed-hassan',
    name: 'Hassan',
    role: 'Barbero',
    bio: null,
    photo: null,
    instagram: null,
    acceptsBookings: true,
    vacationFrom: null,
    vacationTo: null,
    order: 10,
  },
  {
    _id: 'seed-mohammed',
    name: 'Mohammed',
    role: 'Barbero',
    bio: null,
    photo: null,
    instagram: null,
    acceptsBookings: true,
    vacationFrom: null,
    vacationTo: null,
    order: 20,
  },
]

/**
 * Los textos de la portada. El titular y la frase salen del rótulo que la barbería ya
 * usa —«Tu estilo, nuestra pasión»— partido en dos: la marca manda en grande y la frase
 * queda debajo. El bloque «La barbería» se deja vacío a propósito: cuenta la historia
 * del local y esa la tienen que contar ellos, no nosotros.
 */
export const seedBusinessText: BusinessText = {
  heroHeadline: 'Tu estilo',
  heroLead: 'Nuestra pasión',
  aboutTitle: 'La barbería',
  aboutBody: [],
  walkInsWelcome: true,
}
