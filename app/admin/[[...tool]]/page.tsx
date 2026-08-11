import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'
import { isSanityConfigured, projectId } from '@/sanity/env'

export const dynamic = 'force-static'

export default function AdminPage() {
  if (!isSanityConfigured) return <NotConfigured />
  return <NextStudio config={config} />
}

function NotConfigured() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100dvh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0a0908',
        color: '#f2ede4',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: '34rem', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          El panel de contenido todavía no está conectado
        </h1>
        <p style={{ marginBottom: '1rem' }}>
          Falta la variable <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code>
          {projectId ? '' : ' (ahora mismo está vacía)'}. Mientras tanto la web funciona con el
          contenido de partida: los servicios, el equipo y los textos que ya se ven son reales, pero
          se editan en el código y no desde aquí.
        </p>
        <p style={{ color: '#b8b0a4' }}>
          Para activarlo: crear el proyecto en sanity.io/manage, copiar el identificador a{' '}
          <code>.env.local</code> (y a las variables de Vercel) y volver a desplegar.
        </p>
      </div>
    </main>
  )
}
