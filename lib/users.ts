import 'server-only'
import bcrypt from 'bcryptjs'
import { ObjectId, type Collection } from 'mongodb'
import { getDb } from './db'

export type UserRole = 'client' | 'staff' | 'admin'

export type UserDoc = {
  _id: ObjectId
  email: string
  name: string
  phone: string | null
  passwordHash: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type PublicUser = {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
}

const BCRYPT_ROUNDS = 12

const DUMMY_HASH = '$2b$12$JWwlNBaFOhqWmYv9agvWzOvzfyDsXoKlx997qhTD9La/ZqwohPSqW'

async function users(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>('users')
}

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

function isDuplicateKey(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000
}
