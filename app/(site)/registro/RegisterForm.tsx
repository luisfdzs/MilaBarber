'use client'

import { useActionState } from 'react'
import { Field, FormError, SubmitButton } from '@/components/ui/Form'
import { emptyRegisterState, type RegisterState } from '@/lib/form-state'
import { registerAction } from './actions'

export function RegisterForm() {
  const [state, action] = useActionState<RegisterState, FormData>(
    registerAction,
    emptyRegisterState,
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError>{state.errors.form}</FormError>

      <Field
        label="Nombre"
        name="name"
        autoComplete="given-name"
        defaultValue={state.values.name}
        error={state.errors.name}
        placeholder="Como quieres que te llamemos"
      />

      <Field
        label="Correo electrónico"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        defaultValue={state.values.email}
        error={state.errors.email}
        placeholder="tucorreo@ejemplo.com"
      />

      <Field
        label="Teléfono"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        defaultValue={state.values.phone}
        error={state.errors.phone}
        hint="Para avisarte si hay que mover tu cita. No lo usamos para nada más."
        placeholder="600 000 000"
      />

      <Field
        label="Contraseña"
        name="password"
        type="password"
        // `new-password` es lo que hace que el gestor del móvil ofrezca generar una y
        // guardarla. Con `current-password` intentaría rellenar una que no existe.
        autoComplete="new-password"
        error={state.errors.password}
        hint="Ocho caracteres como mínimo."
      />

      <Field
        label="Repite la contraseña"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        error={state.errors.passwordConfirm}
      />

      <SubmitButton pendingLabel="Creando tu cuenta…">Crear cuenta</SubmitButton>
    </form>
  )
}
