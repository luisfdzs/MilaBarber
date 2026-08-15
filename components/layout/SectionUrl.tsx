'use client'

import { useEffect } from 'react'
import { routes, sectionSlugs } from '@/lib/routes'

const MARKER = 0.38

export function SectionUrl({ landing }: { landing?: string }) {
  useEffect(() => {
    if (!landing) return
    const target = document.getElementById(landing)
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [landing])

  useEffect(() => {
    let frame = 0
    let shown = window.location.pathname

    const sync = () => {
      frame = 0

      const marker = window.innerHeight * MARKER
      const bottom = window.scrollY + window.innerHeight >= document.body.scrollHeight - 2

      let current: string = routes.home.href
      for (const slug of sectionSlugs) {
        const element = document.getElementById(slug)
        if (element && element.getBoundingClientRect().top <= marker) current = `/${slug}`
      }
      if (bottom) current = `/${sectionSlugs[sectionSlugs.length - 1]}`

      if (current === shown) return
      shown = current
      window.history.replaceState(null, '', current)
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(sync)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return null
}
