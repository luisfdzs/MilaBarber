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

  await index(db, 'appointments', { barberId: 1, start: 1 }, { name: 'barber_start' })
  await index(db, 'appointments', { userId: 1, start: -1 }, { name: 'user_start' })
  await index(db, 'appointments', { status: 1, start: 1 }, { name: 'status_start' })

  await index(db, 'passwordResets', { tokenHash: 1 }, { unique: true, name: 'token_unique' })
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

function collectFlag(flag) {
  const values = []
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === flag && args[i + 1]) values.push(args[i + 1])
  }
  return values
}

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
