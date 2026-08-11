'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/cn'

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

export function FormError({ children }: { children: React.ReactNode }) {
  if (!children) return null
  return (
    <p role="alert" className="border border-alert/50 bg-alert/10 p-3 text-small text-alert">
      {children}
    </p>
  )
}

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
