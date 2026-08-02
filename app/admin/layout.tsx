import { NextStudioLayout, metadata as studioMetadata, viewport } from 'next-sanity/studio'
import type { Metadata } from 'next'

/**
 * EL PANEL TIENE SU PROPIO `<html>`, y por eso la web pública vive en el grupo `(site)`.
 *
 * Un panel de edición no puede heredar el diseño del sitio: Sanity Studio trae su propia
 * hoja de estilos, su propio tema y ocupa la pantalla entera. Si colgara del layout de la
 * web se pintaría con la cabecera de la barbería encima, el pie debajo, las fuentes de la
 * portada y el fondo oscuro peleándose con los suyos.
 *
 * Next resuelve esto con **dos layouts raíz**: `app/(site)/layout.tsx` para la web y éste
 * para `/admin`. El grupo `(site)` no existe por gusto de ordenar carpetas — existe para
 * poder sacar `/admin` de él sin que la web pierda su raíz.
 *
 * `robots: noindex` viene de `studioMetadata`: un panel de administración no tiene por qué
 * salir en Google. Es lo único que se hereda de Sanity aquí; el título se pone en español
 * porque quien lo abre es la barbería.
 */
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
