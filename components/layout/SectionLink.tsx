'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

type Props = {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: () => void
  'aria-current'?: 'page'
  'aria-label'?: string
}

export function SectionLink({ href, className, children, onClick, ...rest }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const [path, id] = href.split('#')
  const base = path || '/'

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (
          !id ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return
        }
        event.preventDefault()
        onClick?.()
        if (pathname === base) {
          scrollToSection(id, 'auto')
          return
        }
        router.push(base, { scroll: false })
        waitForSection(id)
      }}
      {...rest}
    >
      {children}
    </Link>
  )
}

function scrollToSection(id: string, behavior: ScrollBehavior): boolean {
  const target = document.getElementById(id)
  if (!target) return false
  target.scrollIntoView({ behavior, block: 'start' })
  return true
}

function waitForSection(id: string) {
  const start = Date.now()
  const tick = () => {
    if (scrollToSection(id, 'instant')) return
    if (Date.now() - start < 2000) setTimeout(tick, 50)
  }
  setTimeout(tick, 0)
}
