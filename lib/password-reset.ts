import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import { ObjectId, type Collection } from 'mongodb'
import { getDb } from './db'

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

export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const collection = await tokens()

  await collection.deleteMany({ userId: new ObjectId(userId) })

  await collection.insertOne({
    userId: new ObjectId(userId),
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + RESET_MINUTES * 60_000),
    createdAt: new Date(),
  } as ResetDoc)

  return token
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const doc = await (
    await tokens()
  ).findOne({ tokenHash: hash(token), expiresAt: { $gt: new Date() } })
  return doc ? doc.userId.toHexString() : null
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const userId = await verifyResetToken(token)
  if (!userId) return null
  await (await tokens()).deleteMany({ userId: new ObjectId(userId) })
  return userId
}
