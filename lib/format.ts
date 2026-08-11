const withDecimals = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

const whole = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatPrice(euros: number): string {
  return Number.isInteger(euros) ? whole.format(euros) : withDecimals.format(euros)
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

const longDay = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatDay(day: Date | string): string {
  return longDay.format(typeof day === 'string' ? parseIsoDay(day) : day)
}

const shortDay = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' })

export function formatShortDay(day: Date | string): string {
  return shortDay.format(typeof day === 'string' ? parseIsoDay(day) : day)
}

export function parseIsoDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, date ?? 1)
}

export function toIsoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
