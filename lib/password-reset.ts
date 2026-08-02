import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { ObjectId, type Collection } from 'mongodb'
import { getDb } from './db'

/**
 * RECUPERAR LA CONTRASEÑA.
 *
 * Dos decisiones que no son opcionales si se guardan tokens de recuperación:
 *
 * 1. **En la base se guarda el HASH del token, no el token.** Quien pueda leer esta
 *    colección —una copia de seguridad mal guardada, un fallo de acceso a Atlas— tendría,
 *    si no, la llave para entrar en cualquier cuenta que hubiera pedido recuperación. Con
 *    el hash no tiene nada: el token va sólo en el correo. Es el mismo principio que con
 *    las contraseñas.
 *
 *    SHA-256 y no bcrypt, y aquí sí es correcto: un token de 32 bytes aleatorios no se
 *    adivina por fuerza bruta —que es de lo que protege el coste de bcrypt—, así que lo
 *    único que hace falta es que el valor guardado no sirva para nada.
 *
 *    Y por eso la búsqueda se hace **por el hash, con índice**, en vez de traer todos los
 *    tokens vivos y compararlos en tiempo constante uno a uno. La comparación de tiempo
 *    constante protege de deducir el secreto midiendo cuántos bytes iniciales acertaste,
 *    y eso sólo sirve cuando el secreto se puede ir construyendo a base de intentos: con
 *    32 bytes aleatorios de un solo uso y quince minutos de vida, no hay tal camino. Lo
 *    que sí habría con el barrido es una consulta que crece con el número de tokens y se
 *    ejecuta en cada intento, que es un regalo para quien quiera saturar la web.
 *
 * 2. **Un solo uso y quince minutos.** El correo se queda en el buzón para siempre; el
 *    enlace, no. Se borra al usarlo, y también todos los demás tokens de esa persona: si
 *    pidió tres, el primero deja de valer en cuanto usa el tercero.
 */

/** Quince minutos. Lo justo para ir al correo y volver. */
export const RESET_MINUTES = 15

type ResetDoc = {
  _id: ObjectId
  userId: ObjectId
  tokenHash: string
  expiresAt: Date
  createdAt: Date
}

async function tokens(): Promise<Collection<ResetDoc>> {
  return (await getDb()).collection<ResetDoc>('passwordResets')
}

function hash(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Crea un token y devuelve el valor **en claro**, que es lo único que sale de aquí y sólo
 * para meterlo en el correo. No se registra en ningún log.
 */
export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const collection = await tokens()

  // Pedir uno nuevo invalida los anteriores: si alguien pide tres seguidos porque el
  // correo tarda, sólo el último debe funcionar.
  await collection.deleteMany({ userId: new ObjectId(userId) })

  await collection.insertOne({
    userId: new ObjectId(userId),
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000),
    createdAt: new Date(),
  } as ResetDoc)

  return token
}

/**
 * Comprueba un token y devuelve el id de la persona, o `null`. **No lo consume**: se
 * consume al guardar la contraseña nueva, con `consumeResetToken`. Separarlo permite que
 * la página del formulario compruebe que el enlace vale sin gastarlo — si no, abrir el
 * enlace y no llegar a enviar el formulario dejaría a la persona fuera.
 */
export async function verifyResetToken(token: string): Promise<string | null> {
  const doc = await (
    await tokens()
  ).findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } })
  return doc ? doc.userId.toHexString() : null
}

/** Igual que el anterior, pero borra el token: se llama al cambiar la contraseña. */
export async function consumeResetToken(token: string): Promise<string | null> {
  const userId = await verifyResetToken(token)
  if (!userId) return null
  await (await tokens()).deleteMany({ userId: new ObjectId(userId) })
  return userId
}
