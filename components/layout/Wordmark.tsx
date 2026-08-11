import { cn } from '@/lib/cn'

type Props = {
  className?: string
  layout?: 'inline' | 'stacked'
}

export function Wordmark({ className, layout = 'inline' }: Props) {
  if (layout === 'stacked') {
    return (
      <span
        className={cn(
          'flex flex-col items-center leading-[0.85] font-display font-semibold uppercase',
          className,
        )}
      >
        <span className="text-[0.62em] tracking-[0.22em]">Mila</span>
        <span className="text-[1em] tracking-[0.06em]">Barber</span>
        <Razor className="mt-[0.12em] h-[0.16em] w-[0.9em] text-current opacity-80" />
      </span>
    )
  }

  return (
    <span className={cn('flex items-center gap-2.5 text-current', className)}>
      <Razor className="h-[0.5em] w-auto shrink-0" />
      <span className="font-display text-[1em] leading-none font-semibold tracking-[0.16em] uppercase">
        Mila Barber
      </span>
    </span>
  )
}

function Razor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 10" className={className} fill="currentColor" aria-hidden="true">
      <path d="M2 3.4h38.5l4.5 3.2H6.2A4.2 4.2 0 0 1 2 3.4Z" />
      <path d="M45.8 5.9 62 2.2l.6 2.1-16.2 3.7-.6-2.1Z" />
    </svg>
  )
}
