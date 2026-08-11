import { cn } from '@/lib/cn'

type Props = {
  className?: string
  layout?: 'inline' | 'stacked'
}

export function Wordmark({ className, layout = 'inline' }: Props) {
  // El logotipo de verdad de la barbería, tal cual: «MILA / BARBER» con la navaja debajo.
  // Va de máscara y no de <img> para que siga tomando el color de donde se ponga —hueso
  // sobre el vídeo de la portada, dorado si algún día hace falta— igual que hacía el dibujo
  // a mano que había antes. El único máster que publica milabarberr.com son 256 px, así que
  // no conviene pasarse de tamaño: a 2× ya se estaría inventando pixeles.
  if (layout === 'stacked') {
    return (
      <span
        className={cn(
          'block aspect-square w-[2.1em] max-w-[13rem] bg-current [mask-image:url(/logo-mila-barber.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]',
          className,
        )}
        role="img"
        aria-label="Mila Barber"
      />
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
