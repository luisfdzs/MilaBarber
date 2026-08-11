'use client'

import { useEffect, useRef, useState } from 'react'

const VARIANTS = {
  wide: {
    webm: '/hero/montage-wide.webm',
    mp4: '/hero/montage-wide.mp4',
    poster: '/hero/poster-wide.jpg',
  },
  tall: {
    webm: '/hero/montage-tall.webm',
    mp4: '/hero/montage-tall.mp4',
    poster: '/hero/poster-tall.jpg',
  },
}

const TALL_BELOW_RATIO = 0.9

function wantsHeavyMedia() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (connection?.saveData) return false
  if (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) return false

  return true
}

type Props = {
  label: string
  hasVideo: boolean
}

export function HeroMontage({ label, hasVideo }: Props) {
  const [variant, setVariant] = useState<keyof typeof VARIANTS | null>(null)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!hasVideo || !wantsHeavyMedia()) return
    const pick = () =>
      setVariant(window.innerWidth / window.innerHeight < TALL_BELOW_RATIO ? 'tall' : 'wide')
    pick()
    window.addEventListener('resize', pick)
    return () => window.removeEventListener('resize', pick)
  }, [hasVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.01 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [variant])

  const poster = variant ? VARIANTS[variant].poster : VARIANTS.wide.poster

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt=""
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />

      {variant && (
        <video
          ref={videoRef}
          key={variant}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label={label}
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src={VARIANTS[variant].webm} type="video/webm" />
          <source src={VARIANTS[variant].mp4} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-night via-night/55 via-42% to-night/10" />
      <div className="absolute inset-0 bg-night/15" />
    </div>
  )
}
