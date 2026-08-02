import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { CONTENT_TAG } from '@/lib/content'

/**
 * EL AVISO DE SANITY: «se ha publicado algo, tira lo que tengas guardado».
 *
 * Sin esto, un cambio de precio tardaría hasta media hora en verse (`REVALIDATE_SECONDS`
 * en `lib/content.ts`). Con esto se ve en cuanto se pulsa «publicar», que es lo que espera
 * quien acaba de corregir un precio mal puesto y recarga la web para comprobarlo.
 *
 * SE INVALIDA UNA SOLA ETIQUETA, no ruta por ruta. Las rutas cambian —hoy `/servicios`,
 * mañana también una página por barbero— y una lista aquí se queda vieja en silencio: el
 * webhook seguiría respondiendo 200 y el contenido no se actualizaría, que es el peor modo
 * de fallo posible porque no se nota. Con la etiqueta, cualquier página que lea contenido
 * queda cubierta el día que se escriba.
 *
 * AUTENTICACIÓN POR SECRETO COMPARTIDO y no por la firma de Sanity. La firma exige el
 * paquete `@sanity/webhook` y la configuración de un secreto igual; el secreto compartido
 * exige lo segundo y nada más. Lo que protege este extremo es que no se pueda invocar a
 * discreción —invalidar la caché en bucle convierte cada visita en una regeneración—, y
 * para eso un secreto en la cabecera basta. No hay ningún dato que leer aquí ni nada que
 * escribir: el peor abuso posible con el secreto en la mano es hacer trabajar al servidor.
 */

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.SANITY_REVALIDATE_SECRET

  // Sin secreto configurado el extremo se apaga entero. La alternativa —dejarlo abierto
  // «hasta que se configure»— es la clase de cosa que se queda así en producción.
  if (!expected) {
    console.error('[revalidate] Falta SANITY_REVALIDATE_SECRET; el webhook está desactivado.')
    return NextResponse.json({ revalidated: false }, { status: 501 })
  }

  const given =
    request.headers.get('x-revalidate-secret') ??
    new URL(request.url).searchParams.get('secret') ??
    ''

  if (!matches(given, expected)) {
    return NextResponse.json({ revalidated: false }, { status: 401 })
  }

  // El segundo argumento es de Next 16: dice **cuánto puede seguir sirviéndose lo viejo**
  // mientras se regenera. `expire: 0` = nada; la siguiente visita espera al contenido
  // nuevo. Es lo correcto aquí porque el caso de uso es «he corregido un precio mal puesto
  // y recargo para comprobarlo»: servir un segundo más el precio equivocado convierte la
  // comprobación en una duda.
  revalidateTag(CONTENT_TAG, { expire: 0 })
  return NextResponse.json({ revalidated: true, tag: CONTENT_TAG })
}

/**
 * Comparación de tiempo constante. Aquí sí tiene sentido, al revés que con los tokens de
 * recuperación (ver `lib/password-reset.ts`): este secreto es fijo y vive años, así que
 * medir respuestas para irlo adivinando byte a byte es un ataque con tiempo de sobra.
 *
 * Se comparan los bytes ya normalizados a la misma longitud porque `timingSafeEqual` lanza
 * si difieren, y una excepción distinta según la longitud filtraría justo el tamaño.
 */
function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
