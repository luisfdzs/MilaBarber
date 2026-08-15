export type RouteKey = keyof typeof routes

export const routes = {
  home: { href: '/', label: 'Inicio', section: false },
  services: { href: '/servicios', label: 'Servicios', section: false },
  gallery: { href: '/galeria', label: 'Galería', section: false },
  book: { href: '/reservar', label: 'Reservar cita', section: false },
  account: { href: '/cuenta', label: 'Mi cuenta', section: false },
  signIn: { href: '/entrar', label: 'Entrar', section: false },

  homeBook: { href: '/pedir-cita', label: 'Pedir cita', section: true },
  team: { href: '/equipo', label: 'Equipo', section: true },
  work: { href: '/nuestro-trabajo', label: 'Nuestro trabajo', section: true },
  where: { href: '/contacto', label: 'Dónde estamos', section: true },
} as const

export const navigation: RouteKey[] = ['services', 'gallery', 'team', 'where']

export const homeSections: RouteKey[] = ['homeBook', 'team', 'work', 'where']

export function href(key: RouteKey): string {
  return routes[key].href
}

export function label(key: RouteKey): string {
  return routes[key].label
}

export function isSection(key: RouteKey): boolean {
  return routes[key].section
}

export function sectionId(key: RouteKey): string {
  return routes[key].href.slice(1)
}

export const sectionSlugs: string[] = homeSections.map((key) => sectionId(key))

export function isHomePath(pathname: string): boolean {
  return pathname === '/' || sectionSlugs.includes(pathname.slice(1))
}
