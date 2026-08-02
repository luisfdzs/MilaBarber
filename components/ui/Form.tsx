'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/cn'

/**
 * LAS PIEZAS DE UN FORMULARIO, iguales en toda la web.
 *
 * Son cuatro y ninguna hace magia: una etiqueta con su campo, un mensaje de error, un
 * botón que se desactiva mientras se envía y una banda para el error general. Existen
 * porque los formularios de este sitio —entrar, registrarse, perfil, reservar— tienen que
 * comportarse igual, y porque hay tres detalles que se olvidan siempre si cada formulario
 * se escribe a mano:
 *
 * - **La etiqueta va unida al campo** (`htmlFor`/`id`). Sin eso, tocar el rótulo no pone
 *   el cursor en la casilla, que en un móvil es la mitad de los toques.
 * - **El error se anuncia** (`aria-describedby` + `role="alert"`). Si no, quien usa lector
 *   de pantalla envía el formulario y no se entera de que ha fallado nada.
 * - **El botón se desactiva mientras se envía.** Sin eso, en una conexión lenta se pulsa
 *   dos veces y se reservan dos citas.
 */

export function Field({
  label,
  name,
  type = 'text',
  error,
  hint,
  defaultValue,
  required = true,
  autoComplete,
  inputMode,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  error?: string
  hint?: string
  defaultValue?: string
  required?: boolean
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  placeholder?: string
}) {
  const id = `campo-${name}`
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className="flex flex-col gap-2 text-left">
      <label htmlFor={id} className="eyebrow text-bone-soft">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(
          'min-h-11 border bg-coal px-4 text-body text-bone transition-colors placeholder:text-bone-faint',
          error ? 'border-alert' : 'border-line focus:border-gold',
        )}
      />
      {hint && !error && (
        <p id={hintId} className="text-small text-bone-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-small text-alert">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * El aviso de que algo ha ido mal en el conjunto, no en un campo. `role="alert"` hace que
 * se lea en voz alta al aparecer, que es lo que necesita quien acaba de pulsar «entrar» y
 * ha vuelto al mismo sitio sin saber por qué.
 */
export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="border border-alert/50 bg-alert/10 p-3 text-small text-alert">
      {children}
    </p>
  )
}

/**
 * `useFormStatus` sólo funciona en un componente que esté DENTRO del `<form>`, no en el
 * que lo declara: por eso el botón es su propio componente y no una prop del formulario.
 */
export function SubmitButton({
  children,
  pendingLabel = 'Enviando…',
  className = 'btn btn-gold w-full',
}: {
  children: React.ReactNode
  pendingLabel?: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={cn(className, pending && 'opacity-60')}>
      {pending ? pendingLabel : children}
    </button>
  )
}
