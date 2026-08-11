import { site } from '@/content/site'
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/layout/NavIcons'

export function WhereSection() {
  const { address, contact, hours } = site
  const mapQuery = encodeURIComponent(
    `${address.street}, ${address.postalCode} ${address.city}, ${address.region}`,
  )

  return (
    <section
      id="donde-estamos"
      className="scroll-mt-24 border-t border-line bg-coal py-(--spacing-section)"
    >
      <div className="page-gutter mx-auto max-w-4xl text-center">
        <p className="eyebrow">Dónde estamos</p>
        <h2 className="mt-3 font-display text-title text-bone">
          {address.neighbourhood}, {address.city}
        </h2>
        <p className="mt-4 text-body text-bone-soft">
          En pleno barrio de {address.neighbourhood} — el que le da nombre a la barbería.
        </p>

        <ul className="mx-auto mt-12 grid max-w-2xl gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          <Item
            icon={<MapPinIcon className="h-5 w-5" />}
            label="Dirección"
            value={`${address.street} · ${address.postalCode} ${address.city}`}
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            external
          />
          <Item
            icon={<ClockIcon className="h-5 w-5" />}
            label="Horario"
            value={hours.label}
            hint={hours.closedLabel}
          />
          <Item
            icon={<PhoneIcon className="h-5 w-5" />}
            label="Teléfono"
            value={contact.phoneLabel}
            href={`tel:${contact.phone}`}
          />
          <Item
            icon={<WhatsAppIcon className="h-5 w-5" />}
            label="WhatsApp"
            value="Escríbenos"
            href={contact.whatsapp}
            external
          />
        </ul>

        <p className="mt-8">
          <a
            href={`mailto:${contact.email}`}
            className="link-underline tap inline-flex items-center gap-2 text-small text-bone-soft transition-colors hover:text-bone"
          >
            <MailIcon className="h-4 w-4 text-gold" />
            {contact.email}
          </a>
        </p>
      </div>
    </section>
  )
}

function Item({
  icon,
  label,
  value,
  hint,
  href,
  external = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  href?: string
  external?: boolean
}) {
  const body = (
    <>
      <span className="text-gold">{icon}</span>
      <span className="eyebrow">{label}</span>
      <span className="text-small text-bone">{value}</span>
      {hint && <span className="text-small text-bone-faint">{hint}</span>}
    </>
  )

  const className =
    'flex h-full flex-col items-center gap-2 bg-night p-6 text-center transition-colors'

  return (
    <li>
      {href ? (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
          className={`${className} hover:bg-smoke`}
        >
          {body}
        </a>
      ) : (
        <div className={className}>{body}</div>
      )}
    </li>
  )
}
