/**
 * PREPARAR LA BASE DE DATOS. Se ejecuta con `npm run db:setup`.
 *
 * Hace dos cosas y ninguna es opcional:
 *
 * 1. **Crea los índices.** No por velocidad —una barbería de dos sillones cabe en memoria—
 *    sino porque dos de ellos son restricciones de las que depende que el código de arriba
 *    sea correcto:
 *
 *    - `users.email` único es lo que cierra la carrera entre el `findOne` y el `insertOne`
 *      de `createUser`. Sin él, dos registros simultáneos con el mismo correo crean dos
 *      cuentas y la segunda se queda sin las citas de la primera (ver `lib/users.ts`).
 *    - `passwordResets.expiresAt` con TTL es lo que borra los tokens caducados. Sin él, la
 *      colección crece para siempre con llaves que ya no abren nada: no es un fallo de
 *      seguridad inmediato, pero es material sensible acumulándose sin motivo.
 *
 * 2. **Da papeles.** `-- --admin correo@ejemplo.com` convierte una cuenta ya registrada en
 *    administradora. A propósito no lo hace el registro solo: que registrarse el primero dé
 *    el mando es un agujero clásico en cuanto la web es pública.
 *
 * Es idempotente: `createIndex` sobre un índice que ya existe con la misma definición no
 * hace nada. Se puede ejecutar en cada despliegue sin pensarlo.
 *
 *   npm run db:setup
 *   npm run db:setup -- --admin hassan@ejemplo.com
 *   npm run db:setup -- --staff mohammed@ejemplo.com
 */

import { MongoClient } from 'mongodb'

const DB_NAME = 'milabarber'

loadEnv()

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error(
    'Falta MONGODB_URI. Copia .env.example a .env.local y pon la cadena de conexión de Atlas.',
  )
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db(DB_NAME)

  await createIndexes(db)
  await applyRoles(db)

  console.log('\nListo.')
} catch (error) {
  console.error('\nHa fallado la preparación de la base de datos:', error.message)
  process.exitCode = 1
} finally {
  await client.close()
}

async function createIndexes(db) {
  console.log(`Índices en la base "${DB_NAME}":`)

  await index(db, 'users', { email: 1 }, { unique: true, name: 'email_unique' })

  // La consulta de solapes de `createAppointment` y la agenda del día: barbero + momento.
  await index(db, 'appointments', { barberId: 1, start: 1 }, { name: 'barber_start' })
  // «Mis citas»: las de una persona, de la más reciente hacia atrás.
  await index(db, 'appointments', { userId: 1, start: -1 }, { name: 'user_start' })
  // La agenda de la barbería, que cruza a todos los barberos de un día.
  await index(db, 'appointments', { status: 1, start: 1 }, { name: 'status_start' })

  // Único porque `verifyResetToken` busca exactamente por este campo, y porque dos tokens
  // con el mismo hash sólo pueden ser un error.
  await index(db, 'passwordResets', { tokenHash: 1 }, { unique: true, name: 'token_unique' })
  // `expireAfterSeconds: 0` = «bórralo cuando la fecha de este campo haya pasado». MongoDB
  // pasa a barrer cada minuto, así que un token puede sobrevivir hasta 60 s a su caducidad;
  // da igual, porque `verifyResetToken` comprueba la fecha además de existir.
  await index(
    db,
    'passwordResets',
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: 'expires_ttl' },
  )
}

async function index(db, collection, keys, options) {
  try {
    await db.collection(collection).createIndex(keys, options)
    console.log(`  ✓ ${collection}.${options.name}`)
  } catch (error) {
    // El caso típico: ya existe un índice con ese nombre y otra definición. Se avisa con lo
    // que hay que hacer en vez de abortar el resto de la preparación.
    console.error(`  ✗ ${collection}.${options.name}: ${error.message}`)
    console.error(`    (si cambió la definición, bórralo en Atlas y vuelve a ejecutarlo)`)
    process.exitCode = 1
  }
}

async function applyRoles(db) {
  const changes = [
    ...collectFlag('--admin').map((email) => ({ email, role: 'admin' })),
    ...collectFlag('--staff').map((email) => ({ email, role: 'staff' })),
    ...collectFlag('--client').map((email) => ({ email, role: 'client' })),
  ]
  if (changes.length === 0) return

  console.log('\nPapeles:')
  for (const { email, role } of changes) {
    // El mismo `normalizeEmail` de `lib/users.ts`: el correo se guarda ya en minúsculas y
    // buscarlo tal cual se escribió en la línea de órdenes no encontraría nada.
    const normalized = email.trim().toLowerCase()
    const result = await db
      .collection('users')
      .updateOne({ email: normalized }, { $set: { role, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      console.error(`  ✗ ${normalized}: no hay ninguna cuenta con ese correo.`)
      console.error(`    Regístrala primero en la web y vuelve a ejecutar esto.`)
      process.exitCode = 1
    } else {
      console.log(`  ✓ ${normalized} → ${role}`)
    }
  }
}

/** Todos los valores de una bandera repetible: `--admin a@b.com --admin c@d.com`. */
function collectFlag(flag) {
  const values = []
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === flag && args[i + 1]) values.push(args[i + 1])
  }
  return values
}

/**
 * Lee `.env.local`. Este script se ejecuta con `node` a secas, fuera de Next, así que nadie
 * ha cargado las variables por él. `process.loadEnvFile` es de Node 20.12+; si la máquina
 * es más vieja, el error explica qué hacer en vez de dar «falta MONGODB_URI» con la
 * variable puesta.
 */
function loadEnv() {
  if (process.env.MONGODB_URI) return
  try {
    process.loadEnvFile('.env.local')
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`No se ha podido leer .env.local: ${error.message}`)
    }
  }
}
