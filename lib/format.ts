/**
 * Formato de las cifras que se ven en la web. Está aquí y no suelto por los componentes
 * para que un precio se escriba igual en la portada, en la carta, en el resumen de la
 * reserva y en el correo de confirmación.
 */

/**
 * Precio en euros, a la española: coma decimal, símbolo detrás y **sin decimales cuando
 * son cero**. «14 €» y no «14,00 €»: en la carta de una barbería todos los precios son
 * enteros menos alguna excepción, y una columna de «,00» repetidos es ruido que hay que
 * saltarse para leer la cifra.
 */
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

/**
 * Duración en la unidad que entiende quien la lee. Por debajo de una hora, minutos: «30
 * min». A partir de ahí, horas, porque «120 min» obliga a dividir mentalmente y «2 h» no.
 * Los casos con resto —90 minutos— se dicen enteros: «1 h 30 min».
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

/** «lunes, 4 de agosto» — para confirmaciones y para el resumen de la cita. */
const longDay = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatDay(day: Date | string): string {
  return longDay.format(typeof day === 'string' ? parseIsoDay(day) : day)
}

/** «lun 4» — para las pestañas de días del calendario, donde no cabe más. */
const shortDay = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' })

export function formatShortDay(day: Date | string): string {
  return shortDay.format(typeof day === 'string' ? parseIsoDay(day) : day)
}

/**
 * `YYYY-MM-DD` → `Date` **en hora local**.
 *
 * `new Date('2026-08-04')` lo interpreta como medianoche UTC, que en España es la una o
 * las dos de la madrugada del mismo día — y en cualquier zona al oeste de Greenwich, el
 * día anterior. Da igual mientras sólo se pinte, pero en cuanto se compara con «hoy» hace
 * que el calendario se salte un día. Se construye por partes para que no haya duda.
 */
export function parseIsoDay(day: string): Date {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year ?? 1970, (month ?? 1) - 1, date ?? 1)
}

/** `Date` → `YYYY-MM-DD` en hora local. El inverso exacto de `parseIsoDay`. */
export function toIsoDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
