import { NextStudioLayout, metadata as studioMetadata, viewport } from 'next-sanity/studio'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  ...studioMetadata,
  title: 'Panel de contenido · Mila Barber',
}

export { viewport }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NextStudioLayout>{children}</NextStudioLayout>
      </body>
    </html>
  )
}
