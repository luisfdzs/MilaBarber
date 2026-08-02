/**
 * EL MAPA DEL SITIO, declarado una vez.
 *
 * La cabecera, la barra de móvil, el pie y el sitemap leen todos de aquí, así que
 * una entrada nueva aparece en los cuatro sitios a la vez o en ninguno. Es la
 * forma de que no exista una página a la que sólo se llegue por un enlace suelto.
 *
 * Hay dos clases de destino y conviene no confundirlas:
 *
 * - **Páginas** (`/servicios`, `/galeria`): tienen URL propia y se pueden marcar
 *   como activas comparando con el `pathname`.
 * - **Secciones** (`/#equipo`, `/#donde-estamos`): son anclas de la portada. NO se
 *   marcan nunca como activas: saber cuál se está viendo pediría un observador de
 *   scroll, y marcar dos a la vez estando en el inicio es peor que no marcar
 *   ninguna.
 */

export type RouteKey = keyof typeof routes

export const routes = {
  home: { href: '/', label: 'Inicio' },
  services: { href: '/servicios', label: 'Servicios' },
  gallery: { href: '/galeria', label: 'Galería' },
  team: { href: '/#equipo', label: 'Equipo' },
  where: { href: '/#donde-estamos', label: 'Dónde estamos' },
  book: { href: '/reservar', label: 'Reservar cita' },
  account: { href: '/cuenta', label: 'Mi cuenta' },
  signIn: { href: '/entrar', label: 'Entrar' },
} as const

/** Lo que se ve en el menú, en orden. Cuenta y entrar se resuelven aparte. */
export const navigation: RouteKey[] = ['services', 'gallery', 'team', 'where']

export function href(key: RouteKey): string {
  return routes[key].href
}

export function label(key: RouteKey): string {
  return routes[key].label
}

/** Un ancla de la portada, no una página con URL propia. */
export function isSection(key: RouteKey): boolean {
  return routes[key].href.includes('#')
}
