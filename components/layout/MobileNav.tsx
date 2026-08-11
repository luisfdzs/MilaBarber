'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { site } from '@/content/site'
import { cn } from '@/lib/cn'
import { href, isSection, navigation, routes } from '@/lib/routes'
import {
  CalendarIcon,
  CloseIcon,
  GalleryIcon,
  HomeIcon,
  InstagramIcon,
  MenuIcon,
  ScissorsIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from './NavIcons'

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname()

  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const close = () => setOpenedAt(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpenedAt(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const home = href('home')
  const onRoute = (path: string) => pathname === path || pathname.startsWith(`${path}/`)

  const inPanel = onRoute(href('account'))

  return (
    <>
      <div
        id="mobile-nav"
        hidden={!open}
        className="page-gutter fixed inset-x-0 top-0 bottom-(--spacing-nav-mobile) z-50 overflow-y-auto bg-night lg:hidden"
      >
        <nav
          className="flex min-h-full flex-col items-center justify-center gap-6 py-12 text-center"
          aria-label="Principal"
        >
          {navigation.map((key) => {
            const target = href(key)
            const active = !isSection(key) && onRoute(target)
            return (
              <Link
                key={key}
                href={target}
                aria-current={active ? 'page' : undefined}
                onClick={close}
                className={cn('font-display text-title', active ? 'text-gold' : 'text-bone')}
              >
                {routes[key].label}
              </Link>
            )
          })}

          <Link
            href={signedIn ? href('account') : href('signIn')}
            aria-current={inPanel ? 'page' : undefined}
            onClick={close}
            className={cn('font-display text-title', inPanel ? 'text-gold' : 'text-bone')}
          >
            {signedIn ? routes.account.label : routes.signIn.label}
          </Link>

          <div className="mt-6 flex items-center justify-center gap-6 border-t border-line pt-8">
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="Escribir por WhatsApp"
              className="tap text-bone-soft transition-colors hover:text-gold"
            >
              <WhatsAppIcon className="h-6 w-6" />
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram de Mila Barber"
              className="tap text-bone-soft transition-colors hover:text-gold"
            >
              <InstagramIcon className="h-6 w-6" />
            </a>
            <a
              href={site.social.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube de Mila Barber"
              className="tap text-bone-soft transition-colors hover:text-gold"
            >
              <YouTubeIcon className="h-6 w-6" />
            </a>
          </div>
        </nav>
      </div>

      <nav
        aria-label="Navegación de móvil"
        className="fixed inset-x-0 bottom-0 z-50 flex h-(--spacing-nav-mobile) items-stretch border-t border-line bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <NavSlot
          href={home}
          label="Inicio"
          active={pathname === home}
          onClick={(event) => {
            close()
            if (pathname === home) {
              event.preventDefault()
              window.scrollTo({ top: 0 })
            }
          }}
        >
          <HomeIcon className="h-6 w-6" />
        </NavSlot>

        <NavSlot
          href={href('services')}
          label={routes.services.label}
          active={onRoute(href('services'))}
          onClick={close}
        >
          <ScissorsIcon className="h-6 w-6" />
        </NavSlot>

        <Link
          href={href('book')}
          aria-label={routes.book.label}
          aria-current={onRoute(href('book')) ? 'page' : undefined}
          onClick={close}
          className={cn(slotClass, 'bg-gold text-night')}
        >
          <CalendarIcon className="h-6 w-6" />
        </Link>

        <NavSlot
          href={href('gallery')}
          label={routes.gallery.label}
          active={onRoute(href('gallery'))}
          onClick={close}
        >
          <GalleryIcon className="h-6 w-6" />
        </NavSlot>

        <button
          type="button"
          onClick={() => setOpenedAt(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Cerrar el menú' : 'Abrir el menú'}
          className={cn(slotClass, slotState(open || inPanel))}
        >
          {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </nav>
    </>
  )
}

const slotClass =
  'relative flex flex-1 flex-col items-center justify-center transition-colors duration-500'

const slotState = (active: boolean) => (active ? 'bg-gold/12 text-gold' : 'text-bone opacity-60')

function NavSlot({
  href: target,
  label,
  active,
  onClick,
  children,
}: {
  href: string
  label: string
  active: boolean
  onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={target}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={cn(slotClass, slotState(active))}
    >
      {children}
    </Link>
  )
}
