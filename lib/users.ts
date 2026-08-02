import 'server-only'
import bcrypt from 'bcryptjs'
import { ObjectId, type Collection } from 'mongodb'
import { getDb } from './db'

/**
 * LOS USUARIOS: crear, buscar y comprobar la contraseña. Nada más.
 *
 * La forma de trabajar con la base es la del proyecto BonsaiArtesania —una colección por
 * concepto, documentos planos, índices creados por `npm run db:setup`—, pero **la forma
 * de entrar es la de la web actual de la barbería: correo y contraseña**.
 *
 * POR QUÉ CONTRASEÑA Y NO ENLACE AL CORREO, que es lo que hace Bonsai. Porque los dos
 * casos no se parecen: en una tienda se compra tres veces al año y abrir el buzón para
 * entrar es un precio razonable; en una barbería se pide cita cada dos o tres semanas,
 * muchas veces de pie en la calle y con prisa. Obligar a saltar al correo en ese momento
 * es la forma más rápida de que la persona cierre la web y llame por teléfono. Además, la
 * clientela ya tiene su contraseña de milabarberr.com y este sitio la sustituye: cambiar
 * la forma de entrar en la misma mudanza sería pedir dos cosas a la vez.
 *
 * LO QUE ESO OBLIGA A HACER BIEN, y que con el enlace al correo no haría falta:
 *
 * - **Hash con bcrypt y coste 12.** Nunca la contraseña, ni cifrada ni «ofuscada». Doce
 *   rondas son ~250 ms en el hardware de Vercel: suficiente para que probar un
 *   diccionario robado sea caro, poco para que se note al entrar.
 * - **El mismo mensaje de error tanto si el correo no existe como si la contraseña falla.**
 *   Distinguirlos convierte el formulario en un comprobador de «quién es cliente de esta
 *   barbería».
 * - **Y el mismo tiempo de respuesta**: si con un correo desconocido se contestara al
 *   instante y con uno conocido tras el bcrypt, el reloj diría lo que el mensaje calla.
 *   Por eso `verifyCredentials` gasta un hash falso cuando no encuentra a nadie.
 */

export type UserRole = 'client' | 'staff' | 'admin'

export type UserDoc = {
  _id: ObjectId
  email: string
  /** Con la forma en que la persona lo escribió; el correo se guarda ya normalizado. */
  name: string
  phone: string | null
  passwordHash: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

/** El usuario tal y como sale de aquí hacia el resto de la web: sin el hash, nunca. */
export type PublicUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
}

const BCRYPT_ROUNDS = 12

/**
 * Un hash cualquiera, válido y de coste 12, contra el que comparar cuando el correo no
 * existe. No protege ningún dato: existe sólo para gastar los mismos milisegundos que
 * gastaría una comprobación real (ver arriba).
 *
 * Tiene que ser un hash **de verdad**, generado con bcrypt: ante una cadena con formato
 * inválido, `bcrypt.compare` devuelve `false` de inmediato sin calcular nada, que es
 * justo lo contrario de lo que se busca aquí. Éste es el hash de una frase aleatoria que
 * no se guardó en ninguna parte, así que no abre nada.
 */
const DUMMY_HASH = '$2b$12$JWwlNBaFOhqWmYv9agvWzOvzfyDsXoKlx997qhTD9La/ZqwohPSqW'

async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>('users')
}

/**
 * Normaliza el correo antes de tocar la base. Sin esto, `Luis@Gmail.com` y
 * `luis@gmail.com` serían dos cuentas distintas y la segunda se quedaría sin las citas de
 * la primera. El índice único de `users.email` es sobre este valor ya normalizado.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function toPublic(doc: UserDoc): PublicUser {
  return {
    id: doc._id.toHexString(),
    email: doc.email,
    name: doc.name,
    phone: doc.phone,
    role: doc.role,
  }
}

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return (await users()).findOne({ email: normalizeEmail(email) })
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  if (!ObjectId.isValid(id)) return null
  const doc = await (await users()).findOne({ _id: new ObjectId(id) })
  return doc ? toPublic(doc) : null
}

/**
 * Da de alta una cuenta. Devuelve `null` si el correo ya está registrado — y es quien
 * llama el que decide qué contar: en el formulario de registro se responde siempre lo
 * mismo, para no revelar quién es cliente.
 *
 * La condición de carrera entre el `findOne` y el `insertOne` la cierra el índice único
 * de la colección, no este código: dos registros simultáneos con el mismo correo hacen
 * que el segundo `insertOne` falle con el código 11000, y eso es exactamente lo que
 * queremos. Ver `scripts/db-setup.mjs`.
 */
export async function createUser(input: {
  email: string
  name: string
  phone?: string | null
  password: string
}): Promise<PublicUser | null> {
  const collection = await users()
  const now = new Date()
  const doc: Omit<UserDoc, '_id'> = {
    email: normalizeEmail(input.email),
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    passwordHash: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    // El primer usuario NO se hace administrador solo. Los papeles se dan a mano desde
    // Atlas o con `npm run db:setup -- --admin correo@ejemplo.com`: que registrarse el
    // primero dé el mando es un agujero clásico en cuanto la web es pública.
    role: 'client',
    createdAt: now,
    updatedAt: now,
  }

  try {
    const result = await collection.insertOne(doc as UserDoc)
    return toPublic({ ...doc, _id: result.insertedId } as UserDoc)
  } catch (error) {
    if (isDuplicateKey(error)) return null
    throw error
  }
}

/**
 * ¿Son correctos este correo y esta contraseña? Devuelve el usuario o `null`, sin decir
 * cuál de las dos cosas ha fallado y sin tardar distinto en cada caso.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const doc = await findUserByEmail(email)
  if (!doc) {
    await bcrypt.compare(password, DUMMY_HASH)
    return null
  }
  const ok = await bcrypt.compare(password, doc.passwordHash)
  return ok ? toPublic(doc) : null
}

export async function updatePassword(userId: string, password: string): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false
  const result = await (
    await users()
  ).updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
        updatedAt: new Date(),
      },
    },
  )
  return result.matchedCount === 1
}

export async function updateProfile(
  userId: string,
  input: { name: string; phone: string | null },
): Promise<boolean> {
  if (!ObjectId.isValid(userId)) return false
  const result = await (
    await users()
  ).updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: { name: input.name.trim(), phone: input.phone?.trim() || null, updatedAt: new Date() },
    },
  )
  return result.matchedCount === 1
}

/** El error de clave duplicada de MongoDB, que aquí significa «ese correo ya existe». */
function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000
}
