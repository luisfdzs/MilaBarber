'use client'

import { useActionState } from 'react'
import { Field, FormError, SubmitButton } from '@/components/ui/Form'
import { emptyNewPasswordState, type NewPasswordState } from '@/lib/form-state'
import { setNewPasswordAction } from './actions'

export function NewPasswordForm({ token }: { token: string }) {
  const [state, action] = useActionState<NewPasswordState, FormData>(
    setNewPasswordAction,
    emptyNewPasswordState,
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      <FormError>{state.errors.form}</FormError>

      <Field
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.errors.password}
        hint="Ocho caracteres como mínimo."
      />
      <Field
        label="Repítela"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        error={state.errors.passwordConfirm}
      />

      <SubmitButton pendingLabel="Guardando…">Guardar contraseña</SubmitButton>
    </form>
  )
}
