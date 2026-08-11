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

export const navigation: RouteKey[] = ['services', 'gallery', 'team', 'where']

export function href(key: RouteKey): string {
  return routes[key].href
}

export function label(key: RouteKey): string {
  return routes[key].label
}

export function isSection(key: RouteKey): boolean {
  return routes[key].href.includes('#')
}
