import Link from 'next/link'

export function PageHeader({
  eyebrow,
  title,
  lead,
  action,
}: {
  eyebrow: string
  title: string
  lead?: string
  action?: { href: string; label: string }
}) {
  return (
    <header className="page-gutter mx-auto max-w-3xl pt-16 pb-12 text-center md:pt-24 md:pb-16">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 font-display text-title text-bone">{title}</h1>
      {lead && <p className="mt-5 text-lead text-bone-soft">{lead}</p>}
      {action && (
        <p className="mt-8">
          <Link href={action.href} className="btn btn-gold">
            {action.label}
          </Link>
        </p>
      )}
    </header>
  )
}
