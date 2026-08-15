'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { href, isHomePath, isSection, navigation, routes } from '@/lib/routes'
import { UserIcon } from './NavIcons'
import { SectionLink } from './SectionLink'
import { Wordmark } from './Wordmark'

type Props = {
  signedIn: boolean
}

export function Header({ signedIn }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const home = href('home')

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-colors duration-500',
        scrolled ? 'bg-night/95 backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <a
        href="#main"
        onClick={(event) => {
          const main = document.getElementById('main')
          if (!main) return
          event.preventDefault()
          main.focus()
          main.scrollIntoView({ behavior: 'auto', block: 'start' })
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-night"
      >
        Saltar al contenido
      </a>

      <div className="page-gutter flex h-20 items-center justify-center gap-6 md:h-24 lg:justify-between">
        <Link
          href={home}
          aria-label="Mila Barber · inicio"
          className="tap"
          onClick={(event) => {
            if (isHomePath(pathname)) {
              event.preventDefault()
              window.history.replaceState(null, '', home)
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <Wordmark className="text-[1.6rem] md:text-[1.9rem]" />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {navigation.map((key) => {
            const target = href(key)
            const section = isSection(key)
            const active = pathname === target || (!section && pathname.startsWith(`${target}/`))
            const className = cn(
              'link-underline tap font-display text-micro tracking-[0.18em] uppercase transition-opacity',
              active ? 'text-gold opacity-100' : 'opacity-70 hover:opacity-100',
            )
            return section ? (
              <SectionLink
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                className={className}
              >
                {routes[key].label}
              </SectionLink>
            ) : (
              <Link
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                className={className}
              >
                {routes[key].label}
              </Link>
            )
          })}

          <span aria-hidden className="h-3 w-px bg-current opacity-25" />

          <Link
            href={signedIn ? href('account') : href('signIn')}
            aria-label={signedIn ? 'Mi cuenta' : 'Entrar'}
            className={cn(
              'tap transition-opacity',
              pathname.startsWith('/cuenta') ? 'text-gold' : 'opacity-70 hover:opacity-100',
            )}
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          <Link href={href('book')} className="btn btn-gold">
            Reservar cita
          </Link>
        </nav>
      </div>
    </header>
  )
}
