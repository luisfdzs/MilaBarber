'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { href, type RouteKey } from '@/lib/routes'

const options: { key: RouteKey; label: string; icon: string; angle: number }[] = [
  { key: 'services', label: 'Ver servicios y precios', icon: '/icons/scissors.svg', angle: -62 },
  { key: 'book', label: 'Reservar cita', icon: '/icons/calendar-check.svg', angle: 0 },
  { key: 'gallery', label: 'Ver galería', icon: '/icons/images.svg', angle: 62 },
]

const RADIUS = 4.6
const PIVOT = 1.75

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
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
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

      <div className="relative flex flex-col items-center" style={{ filter: 'url(#hero-goo)' }}>
        <div
          id="hero-actions"
          inert={!open}
          className="pointer-events-none absolute top-0 left-1/2 h-0 w-0"
        >
          {options.map((option, index) => {
            const radians = (option.angle * Math.PI) / 180
            const x = RADIUS * Math.sin(radians)
            const y = RADIUS * Math.cos(radians)
            return (
              <Link
                key={option.key}
                href={href(option.key)}
                aria-label={option.label}
                title={option.label}
                onClick={() => setOpen(false)}
                className={cn(
                  'absolute top-0 left-0 grid size-12 place-items-center rounded-full bg-bone text-night transition-[transform,opacity] duration-400 ease-out-soft hover:bg-gold motion-reduce:transition-none',
                  open ? 'pointer-events-auto opacity-100' : 'opacity-0',
                )}
                style={{
                  transform: open
                    ? `translate(calc(-50% + ${x.toFixed(3)}rem), calc(-50% + ${(PIVOT - y).toFixed(3)}rem)) scale(1)`
                    : `translate(-50%, calc(-50% + ${PIVOT}rem)) scale(0.6)`,
                  transitionDelay: `${(open ? index : options.length - 1 - index) * 60}ms`,
                }}
              >
                <Icon src={option.icon} className="size-6" />
              </Link>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="hero-actions"
          aria-label={open ? 'Cerrar las opciones' : 'Empieza aquí'}
          className="relative grid size-14 place-items-center rounded-full bg-bone text-night transition-colors duration-350 ease-out-soft hover:bg-gold"
        >
          <Icon
            src="/icons/plus.svg"
            className={cn(
              'size-7 transition-transform duration-400 ease-out-soft motion-reduce:transition-none',
              open && 'rotate-45',
            )}
          />
        </button>
      </div>
    </div>
  )
}

function Icon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block shrink-0 bg-current', className)}
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
