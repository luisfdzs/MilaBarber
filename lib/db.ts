import { MongoClient, type Db } from 'mongodb'

export const DB_NAME = 'milabarber'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export function getClient(): Promise<MongoClient> {
  if (globalThis._mongoClientPromise) return globalThis._mongoClientPromise

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'Falta MONGODB_URI. Copia .env.example a .env.local y pon la cadena de conexión de Atlas.',
    )
  }

  const promise = new MongoClient(uri).connect()

  globalThis._mongoClientPromise = promise
  return promise
}

export async function getDb(): Promise<Db> {
  return (await getClient()).db(DB_NAME)
}

export const isDatabaseConfigured = Boolean(process.env.MONGODB_URI)
