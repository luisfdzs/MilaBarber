import type { Metadata, Viewport } from 'next'
import { Barlow, Oswald } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { site } from '@/content/site'
import { getSession } from '@/lib/session'
import { isIndexable } from '@/lib/site-env'
import '../globals.css'

/**
 * Fuentes autoalojadas por Next: se sirven desde nuestro dominio, con `swap` y sin
 * petición a Google. Es la diferencia entre texto que aparece al instante y texto que
 * salta cuando la fuente llega — y aquí se nota el doble, porque el titular de la
 * portada va a 100 px sobre un vídeo.
 */
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-oswald',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-barlow',
})

export const viewport: Viewport = {
  themeColor: '#0a0908',
}

const description =
  'Barbería en el barrio de la Milagrosa, Pamplona. Corte, barba, afeitado a navaja, ' +
  'mechas y permanente. Pide cita en un minuto o pásate: calle Río Irati 13, de lunes a ' +
  'sábado de 9:00 a 21:00.'

/**
 * La imagen para compartir NO se declara aquí: la pone Next sola a partir de
 * `opengraph-image.tsx`, que está en esta misma carpeta. Declararla además a mano
 * significaría dos sitios donde cambiarla y uno de los dos quedándose viejo.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} · Barbería en Pamplona`, template: `%s · ${site.name}` },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'es_ES',
    title: `${site.name} · Barbería en Pamplona`,
    description,
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: site.name, description },
  // Sólo la rama prod se indexa; test y previews van con noindex. El criterio y el
  // motivo (test es "production" en su propio proyecto) en lib/site-env.ts.
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  /**
   * La sesión se lee UNA vez, aquí, y baja a la cabecera y a la barra de móvil como un
   * booleano. Las dos son componentes de cliente y lo único que necesitan saber es si el
   * enlace de la persona dice «Entrar» o «Mi cuenta»; pasarles la sesión entera sería
   * mandar el correo del cliente al navegador para decidir una palabra.
   */
  const session = await getSession()
  const signedIn = Boolean(session?.user)

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${oswald.variable} ${barlow.variable}`}
    >
      <body className="flex min-h-svh flex-col">
        <Header signedIn={signedIn} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        {/* La barra de iconos de móvil va FUERA del <header> y al final del documento: la
            cabecera usa `backdrop-blur`, y un filtro convierte al elemento en bloque
            contenedor de sus descendientes `fixed` — dentro, el panel del menú calcularía
            su alto contra una barra de 80 px y se abriría vacío. */}
        <MobileNav signedIn={signedIn} />
      </body>
    </html>
  )
}
