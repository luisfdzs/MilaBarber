import { cn } from '@/lib/cn'

type Props = {
  className?: string
}

export function Wordmark({ className }: Props) {
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
