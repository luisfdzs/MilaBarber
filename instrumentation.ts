export const TIMEZONE = 'Europe/Madrid'

export function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  process.env.TZ = TIMEZONE
}
