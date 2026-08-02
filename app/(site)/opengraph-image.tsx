import { ImageResponse } from 'next/og'
import { site } from '@/content/site'

/**
 * LA IMAGEN QUE SE VE AL COMPARTIR UN ENLACE por WhatsApp, Instagram o Google.
 *
 * Importa más de lo que parece: media clientela va a llegar por un enlace que alguien
 * manda por WhatsApp, y un enlace sin imagen se pinta como una línea de texto gris que
 * nadie pulsa. La alternativa —un JPG en `public/`— obliga a abrir un editor cada vez que
 * cambie el rótulo o el teléfono; generándola aquí, sale del mismo `content/site.ts` que
 * el pie de la web y no se puede desincronizar.
 *
 * ⚠️ ES PROVISIONAL, y a propósito. Lo que de verdad vende una barbería en una
 * previsualización es **una foto de un corte suyo**. En cuanto la barbería entregue
 * material, esto se sustituye por la foto (un `opengraph-image.jpg` en esta misma carpeta
 * gana a este fichero sin tocar nada más). Mientras tanto, la marca sobre negro es una
 * previsualización digna y no un hueco.
 *
 * Se dibuja con la tipografía del sistema y no con Oswald: cargar la fuente aquí obligaría
 * a traerse el fichero al repositorio o a pedirlo por red en el build. Para una imagen de
 * 1200×630 que se ve al tamaño de una uña en una lista de conversaciones, no compensa; la
 * composición —negro cálido, filete dorado, marca centrada— es lo que se reconoce.
 */

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
        // Los mismos valores que `--color-night` y `--color-bone` en globals.css.
        background: '#0a0908',
        color: '#f4efe7',
        // Viñeta cálida: sin ella, 1200×630 de negro plano parecen una imagen que no ha
        // cargado.
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

      {/* La navaja del logotipo, en dorado. Es el único elemento gráfico de la marca que
            sobrevive a este tamaño; ver components/layout/Wordmark.tsx. */}
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
