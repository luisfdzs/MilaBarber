import 'server-only'
import nodemailer from 'nodemailer'
import { site } from '@/content/site'

let transport: nodemailer.Transporter | null = null

function getTransport(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null
  if (transport) return transport

  const port = Number(process.env.SMTP_PORT ?? 465)
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
  return transport
}

export async function sendPasswordResetEmail({
  to,
  url,
  minutes,
}: {
  to: string
  url: string
  minutes: number
}): Promise<void> {
  const mailer = getTransport()
  if (!mailer) {
    console.warn('[email] SMTP no configurado: no se ha enviado el enlace de recuperación.')
    return
  }

  const subject = `Cambiar tu contraseña de ${site.name}`
  const text = [
    `Has pedido cambiar la contraseña de tu cuenta de ${site.name}.`,
    '',
    `Abre este enlace y elige una nueva. Caduca en ${minutes} minutos:`,
    url,
    '',
    'Si no has sido tú, no hace falta que hagas nada: tu contraseña sigue siendo la misma.',
    '',
    `${site.name} · ${site.address.street}, ${site.address.city} · ${site.contact.phoneLabel}`,
  ].join('\n')

  await mailer.sendMail({
    from: `"${site.name}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html: `
      <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#141110">
        <p>Has pedido cambiar la contraseña de tu cuenta de <strong>${site.name}</strong>.</p>
        <p>Abre este enlace y elige una nueva. Caduca en ${minutes} minutos:</p>
        <p><a href="${url}">${url}</a></p>
        <p>Si no has sido tú, no hace falta que hagas nada: tu contraseña sigue siendo la misma.</p>
        <hr>
        <p style="font-size:13px;color:#6e6459">
          ${site.name} · ${site.address.street}, ${site.address.city} · ${site.contact.phoneLabel}
        </p>
      </div>
    `,
  })
}
