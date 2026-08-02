/**
 * LA ZONA HORARIA DEL SERVIDOR, FIJADA ANTES DE ATENDER A NADIE.
 *
 * `register()` lo llama Next una sola vez cuando arranca la instancia del servidor, antes
 * de la primera petición. Es el único sitio donde cabe esto.
 *
 * ⚠️ POR QUÉ NO ES UNA VARIABLE DE ENTORNO. El plan original era poner `TZ=Europe/Madrid`
 * en Vercel, y **no se puede**: `TZ` está en la lista de variables reservadas de Vercel
 * —las hereda del runtime de Lambda— y el panel rechaza crearla con «The name of your
 * Environment Variable is reserved». Se descubrió al configurar el proyecto, no antes.
 *
 * Sin esto, en Vercel el proceso corre en **UTC**. En verano España va dos horas por
 * delante, así que `site.hours.opens` («09:00») se interpretaría como las 9 UTC, que son
 * las 11 de la mañana en Pamplona: la web abriría la agenda dos horas tarde y se comería
 * los dos últimos huecos de la tarde. No es un desajuste cosmético, son citas que no se
 * pueden reservar.
 *
 * Node relee la zona al asignar `process.env.TZ`, así que basta con hacerlo aquí: todo lo
 * que venga después —`new Date()`, `setHours`, los `Intl.DateTimeFormat` de `lib/format.ts`
 * y la rejilla entera de `lib/appointments.ts`— trabaja ya en hora de Pamplona.
 *
 * Se sigue haciendo con la zona del proceso y no con una librería de husos por la razón de
 * siempre, que no ha cambiado: este negocio está en una sola ciudad y todas sus horas son
 * horas de Pamplona. Lo que cambia es dónde se dice.
 */

export const TIMEZONE = 'Europe/Madrid'

export function register() {
  // En el runtime de Edge no hay zona horaria que cambiar —ni `Date` la respeta— así que
  // no se toca. Hoy no hay nada de esta web en Edge; la comprobación evita que el día que
  // lo haya esto falle en silencio.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  process.env.TZ = TIMEZONE
}
