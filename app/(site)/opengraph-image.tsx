import { ImageResponse } from 'next/og'
import { site } from '@/content/site'

export const alt = `${site.name} · Barbería en Pamplona`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0908',
        color: '#f4efe7',
        backgroundImage: 'radial-gradient(circle at 50% 35%, #1e1a17 0%, #0a0908 68%)',
      }}
    >
      <div style={{ display: 'flex', fontSize: 34, letterSpacing: 22, color: '#a79d90' }}>MILA</div>

      <div
        style={{
          display: 'flex',
          fontSize: 132,
          fontWeight: 700,
          letterSpacing: 12,
          lineHeight: 1,
          marginTop: 8,
        }}
      >
        BARBER
      </div>

      <svg width="360" height="56" viewBox="0 0 64 10" fill="#e0a938" style={{ marginTop: 24 }}>
        <path d="M2 3.4h38.5l4.5 3.2H6.2A4.2 4.2 0 0 1 2 3.4Z" />
        <path d="M45.8 5.9 62 2.2l.6 2.1-16.2 3.7-.6-2.1Z" />
      </svg>

      <div
        style={{
          display: 'flex',
          fontSize: 30,
          letterSpacing: 4,
          color: '#a79d90',
          marginTop: 34,
        }}
      >
        {site.address.street.toUpperCase()} · {site.address.city.toUpperCase()}
      </div>

      <div style={{ display: 'flex', fontSize: 26, color: '#6e6459', marginTop: 14 }}>
        {site.hours.label}
      </div>
    </div>,
    size,
  )
}
