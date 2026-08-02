'use client'

import { useActionState } from 'react'
import { Field, FormError, SubmitButton } from '@/components/ui/Form'
import { emptyResetRequestState, type ResetRequestState } from '@/lib/form-state'
import { requestResetAction } from './actions'

export function RequestResetForm() {
  const [state, action] = useActionState<ResetRequestState, FormData>(
    requestResetAction,
    emptyResetRequestState,
  )

  // El mensaje es deliberadamente condicional —«si esa dirección tiene cuenta»— y sustituye
  // al formulario en vez de acompañarlo: volver a enseñar el campo invita a probar otro
  // correo, que es justo lo que no queremos facilitar.
  if (state.sent) {
    return (
      <p role="status" className="text-body text-bone">
        Si esa dirección tiene cuenta, te hemos enviado un enlace para cambiar la contraseña. Revisa
        el correo — y la carpeta de no deseado, por si acaso.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError>{state.error}</FormError>
      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="tucorreo@ejemplo.com"
      />
      <SubmitButton pendingLabel="Enviando…">Enviarme el enlace</SubmitButton>
    </form>
  )
}
