'use client'

import { useActionState } from 'react'
import { Field, FormError, SubmitButton } from '@/components/ui/Form'
import { emptySignInState, type SignInState } from '@/lib/form-state'
import { signInAction } from './actions'

/**
 * El formulario de acceso. Correo, contraseña y nada más — igual que el de la web
 * anterior, para que la clientela no tenga que aprender nada nuevo.
 *
 * `autoComplete` en los dos campos no es un detalle: es lo que hace que el gestor de
 * contraseñas del móvil ofrezca la que ya tiene guardada de milabarberr.com. Sin él, la
 * persona tiene que buscarla a mano y ahí se pierde la mitad de los accesos.
 */
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
