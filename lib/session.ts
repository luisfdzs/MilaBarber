import { cache } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { findUserById, type UserRole } from './users'

export const getSession = cache(() => auth())

export async function requireUser(returnTo?: string) {
  const session = await getSession()
  if (!session?.user) {
    const target = returnTo ? `/entrar?next=${encodeURIComponent(returnTo)}` : '/entrar'
    redirect(target)
  }
  return session.user
}

export async function requireRole(roles: UserRole[], returnTo?: string) {
  const user = await requireUser(returnTo)
  if (!roles.includes(user.role)) redirect('/cuenta')
  return user
}

export const STAFF_ROLES: UserRole[] = ['staff', 'admin']

export async function requireStaff(returnTo?: string) {
  const user = await requireRole(STAFF_ROLES, returnTo)
  const fresh = await findUserById(user.id)
  if (!fresh || !STAFF_ROLES.includes(fresh.role)) redirect('/cuenta')
  return fresh
}
