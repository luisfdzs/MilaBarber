import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HomeContent } from '@/components/sections/HomeContent'
import { homeSections, label, routes, sectionId, sectionSlugs } from '@/lib/routes'

type Props = { params: Promise<{ seccion: string }> }

export function generateStaticParams() {
  return sectionSlugs.map((seccion) => ({ seccion }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seccion } = await params
  const key = homeSections.find((section) => sectionId(section) === seccion)
  if (!key) return {}

  return {
    title: label(key),
    alternates: { canonical: routes.home.href },
  }
}

export default async function SectionPage({ params }: Props) {
  const { seccion } = await params
  if (!sectionSlugs.includes(seccion)) notFound()

  return <HomeContent landing={seccion} />
}
