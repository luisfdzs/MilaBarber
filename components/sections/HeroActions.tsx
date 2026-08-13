'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { href, type RouteKey } from '@/lib/routes'

const options: { key: RouteKey; label: string; icon: string }[] = [
  { key: 'book', label: 'Reservar cita', icon: '/icons/calendar-check.svg' },
  { key: 'services', label: 'Ver servicios y precios', icon: '/icons/scissors.svg' },
  { key: 'gallery', label: 'Ver galería', icon: '/icons/images.svg' },
]

const GAP = 0.6
const STEP = 3.4

export function HeroActions() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <div ref={root} className="relative flex flex-col items-center">
      <svg aria-hidden focusable="false" className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter
            id="hero-goo"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        className="relative flex flex-col items-center"
        style={{ filter: 'url(#hero-goo)' }}
      >
        <div
          id="hero-actions"
          inert={!open}
          className="pointer-events-none absolute top-0 left-1/2 h-0 w-max"
        >
          {options.map((option, index) => (
            <Link
              key={option.key}
              href={href(option.key)}
              onClick={() => setOpen(false)}
              className={cn(
                'btn btn-gold absolute bottom-0 left-0 whitespace-nowrap transition-[transform,opacity] duration-400 ease-out-soft motion-reduce:transition-none',
                open ? 'pointer-events-auto opacity-100' : 'opacity-0',
              )}
              style={{
                transform: open
                  ? `translate(-50%, -${GAP + index * STEP}rem) scale(1)`
                  : 'translate(-50%, 0) scale(0.6)',
                transitionDelay: `${(open ? index : options.length - 1 - index) * 60}ms`,
              }}
            >
              <Icon src={option.icon} />
              {option.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="hero-actions"
          className="btn btn-gold relative"
        >
          <Icon
            src="/icons/plus.svg"
            className={cn(
              'transition-transform duration-400 ease-out-soft motion-reduce:transition-none',
              open && 'rotate-45',
            )}
          />
          Empieza aquí
        </button>
      </div>
    </div>
  )
}

function Icon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block h-[1.15em] w-[1.15em] shrink-0 bg-current', className)}
      style={{
        maskImage: `url(${src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
