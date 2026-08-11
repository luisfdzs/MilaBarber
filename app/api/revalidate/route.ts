import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { CONTENT_TAG } from '@/lib/content'

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.SANITY_REVALIDATE_SECRET

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

  revalidateTag(CONTENT_TAG, { expire: 0 })
  return NextResponse.json({ revalidated: true, tag: CONTENT_TAG })
}

function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
