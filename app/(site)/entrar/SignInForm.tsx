'use client'

import { useActionState } from 'react'
import { Field, FormError, SubmitButton } from '@/components/ui/Form'
import { emptySignInState, type SignInState } from '@/lib/form-state'
import { signInAction } from './actions'

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<SignInState, FormData>(signInAction, emptySignInState)

  return (
    <form action={action} className="flex flex-col gap-5">
      {next && <input type="hidden" name="next" value={next} />}

      <FormError>{state.error}</FormError>

      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="tucorreo@ejemplo.com"
      />

      <Field label="Contraseña" name="password" type="password" autoComplete="current-password" />

      <SubmitButton pendingLabel="Entrando…">Iniciar sesión</SubmitButton>
    </form>
  )
}
