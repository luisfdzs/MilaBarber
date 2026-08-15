'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { isHomePath } from '@/lib/routes'

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

  const id = href.slice(1)

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        if (
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
        if (isHomePath(pathname)) {
          window.history.replaceState(null, '', href)
          scrollToSection(id, 'smooth')
          return
        }
        router.push(href)
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
