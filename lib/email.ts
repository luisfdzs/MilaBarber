import 'server-only'
import nodemailer from 'nodemailer'
import { site } from '@/content/site'

/**
 * CORREO SALIENTE.
 *
 * Un solo uso hoy: el enlace para poner una contraseña nueva. Se hace por SMTP y no con un
 * servicio de envío porque la barbería ya tiene una cuenta de correo —la que aparece en la
 * web— y montar una integración con clave de API para tres correos al mes es trabajo y
 * factura para nada.
 *
 * El transporte se crea perezosamente, igual que el cliente de MongoDB: si se creara al
 * importar, `next build` fallaría en cualquier máquina sin las variables de SMTP.
 *
 * **Si no hay SMTP configurado, no se rompe nada**: se registra el aviso y se sigue. Es
 * deliberado — la web tiene que poder desplegarse y usarse antes de que el correo esté
 * montado, y lo único que se pierde entretanto es la recuperación de contraseña, que
 * mientras tanto se resuelve escribiendo a la barbería.
 */

let transport: nodemailer.Transporter | null = null

function getTransport(): nodemailer.Transporter | null {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null
  if (transport) return transport

  const port = Number(process.env.SMTP_PORT ?? 465)
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 es SMTPS (TLS desde el primer byte); 587 empieza en claro y sube con STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  })
  return transport
}

/**
 * El correo con el enlace para poner una contraseña nueva.
 *
 * Va en texto plano además de en HTML: los clientes de correo que bloquean HTML por
 * defecto —y los filtros de spam— tratan mucho mejor un mensaje que dice lo mismo de las
 * dos formas. Y el enlace se escribe entero, visible: un botón cuyo destino no se ve es
 * exactamente lo que enseña a la gente a pinchar en correos de phishing.
 */
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
