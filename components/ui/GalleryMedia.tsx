'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import type { GalleryItem } from '@/lib/content-types'
import { cn } from '@/lib/cn'

type Props = {
  item: GalleryItem
  sizes: string
  aspect?: string
  priority?: boolean
  quality?: number
}

export function GalleryMedia({
  item,
  sizes,
  aspect = 'aspect-[4/5]',
  priority = false,
  quality = 82,
}: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  const cover = (
    <Image
      src={item.image.url}
      alt={item.image.alt}
      fill
      sizes={sizes}
      quality={quality}
      priority={priority}
      placeholder={item.image.lqip ? 'blur' : 'empty'}
      blurDataURL={item.image.lqip ?? undefined}
      className={cn(
        'object-cover transition-transform duration-700 ease-out-soft',
        !item.video && 'hover:scale-[1.03]',
        playing && 'opacity-0',
      )}
    />
  )

  if (!item.video) {
    return <div className={cn('relative overflow-hidden bg-coal', aspect)}>{cover}</div>
  }

  return (
    <div className={cn('group relative overflow-hidden bg-coal', aspect)}>
      {cover}

      <video
        ref={video}
        src={item.video}
        poster={item.image.url}
        muted
        loop
        playsInline
        preload="none"
        aria-label={item.image.alt}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className={cn(
          'absolute inset-0 size-full object-cover transition-opacity duration-500',
          playing ? 'opacity-100' : 'opacity-0',
        )}
      />

      <button
        type="button"
        aria-label={playing ? 'Parar el vídeo' : 'Ver el vídeo'}
        onClick={() => {
          const element = video.current
          if (!element) return
          if (element.paused) void element.play().catch(() => {})
          else element.pause()
        }}
        className="absolute inset-0 grid place-items-center"
      >
        <span
          aria-hidden
          className={cn(
            'grid size-14 place-items-center rounded-full bg-night/55 text-bone backdrop-blur-sm transition-opacity duration-300',
            playing && 'opacity-0 group-hover:opacity-100',
          )}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-6 w-6">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  )
}
