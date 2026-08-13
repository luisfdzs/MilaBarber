import type { Metadata, Viewport } from 'next'
import { Barlow, Oswald } from 'next/font/google'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { site } from '@/content/site'
import { getSession } from '@/lib/session'
import { isIndexable } from '@/lib/site-env'
import '../globals.css'

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
  robots: isIndexable() ? { index: true, follow: true } : { index: false, follow: false },
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
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
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <MobileNav signedIn={signedIn} />
      </body>
    </html>
  )
}
