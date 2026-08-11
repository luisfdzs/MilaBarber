import Link from 'next/link'
import { site } from '@/content/site'
import { href, routes } from '@/lib/routes'
import {
  ClockIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
  YouTubeIcon,
} from './NavIcons'
import { Wordmark } from './Wordmark'

export function Footer() {
  const { contact, address, hours, social } = site
  const mapQuery = encodeURIComponent(
    `${address.street}, ${address.postalCode} ${address.city}, ${address.region}`,
  )

  return (
    <footer className="border-t border-line bg-coal">
      <div className="page-gutter mx-auto max-w-6xl py-(--spacing-section)">
        <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div className="flex flex-col items-center gap-4 lg:items-start">
            <Wordmark className="text-[1.4rem]" />
            <p className="text-small text-bone-soft">{site.tagline}</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-center gap-3 lg:items-start">
              <h2 className="eyebrow">Dónde y cuándo</h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
                className="link-underline tap flex items-center gap-2 text-small text-bone-soft transition-colors hover:text-bone"
              >
                <MapPinIcon className="h-4 w-4 shrink-0 text-gold" />
                {address.street} · {address.postalCode} {address.city}
              </a>
              <p className="flex items-center gap-2 text-small text-bone-soft">
                <ClockIcon className="h-4 w-4 shrink-0 text-gold" />
                {hours.label}
              </p>
              <p className="text-small text-bone-faint">{hours.closedLabel}</p>
            </div>

            <div className="flex flex-col items-center gap-3 lg:items-start">
              <h2 className="eyebrow">Contacto</h2>
              <a
                href={`tel:${contact.phone}`}
                className="link-underline tap flex items-center gap-2 text-small text-bone-soft transition-colors hover:text-bone"
              >
                <PhoneIcon className="h-4 w-4 shrink-0 text-gold" />
                {contact.phoneLabel}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="link-underline tap flex items-center gap-2 text-small text-bone-soft transition-colors hover:text-bone"
              >
                <MailIcon className="h-4 w-4 shrink-0 text-gold" />
                {contact.email}
              </a>
              <div className="mt-2 flex items-center gap-5">
                <a
                  href={contact.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Escribir por WhatsApp"
                  className="tap text-bone-soft transition-colors hover:text-gold"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram de Mila Barber"
                  className="tap text-bone-soft transition-colors hover:text-gold"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube de Mila Barber"
                  className="tap text-bone-soft transition-colors hover:text-gold"
                >
                  <YouTubeIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-center sm:flex-row sm:text-left">
          <p className="text-small text-bone-faint">
            © {new Date().getFullYear()} {site.name}
          </p>
          <nav aria-label="Legal" className="flex items-center gap-6">
            <Link
              href={href('services')}
              className="link-underline tap text-small text-bone-faint transition-colors hover:text-bone"
            >
              {routes.services.label}
            </Link>
            <Link
              href="/legal/privacidad"
              className="link-underline tap text-small text-bone-faint transition-colors hover:text-bone"
            >
              Privacidad
            </Link>
            <Link
              href="/legal/aviso-legal"
              className="link-underline tap text-small text-bone-faint transition-colors hover:text-bone"
            >
              Aviso legal
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
