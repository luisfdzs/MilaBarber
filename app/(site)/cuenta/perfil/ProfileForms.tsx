'use client'

import { useActionState } from 'react'
import { Field, FormError, SubmitButton } from '@/components/ui/Form'
import {
  emptyPasswordState,
  emptyProfileState,
  type PasswordState,
  type ProfileState,
} from '@/lib/form-state'
import { changePasswordAction, updateProfileAction } from '../actions'

/**
 * DOS FORMULARIOS SEPARADOS, no uno con cinco campos.
 *
 * Cambiar el teléfono y cambiar la contraseña son cosas distintas y con riesgos distintos:
 * el primero se hace de paso, el segundo pide la contraseña actual. Juntarlos obligaría a
 * escribir la contraseña actual para corregir una errata en el nombre, que es la clase de
 * fricción por la que la gente deja los datos desactualizados — y el teléfono desactualizado
 * es justo el que hace que no se pueda avisar de un cambio de cita.
 */

export function ProfileForm({
  name,
  phone,
  email,
}: {
  name: string
  phone: string | null
  email: string
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    emptyProfileState,
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError>{state.errors.form}</FormError>
      {state.saved && (
        <p role="status" className="border border-gold/40 bg-gold/10 p-3 text-small text-bone">
          Datos guardados.
        </p>
      )}

      <Field
        label="Nombre"
        name="name"
        autoComplete="given-name"
        defaultValue={name}
        error={state.errors.name}
      />

      <Field
        label="Teléfono"
        name="phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        defaultValue={phone ?? ''}
        error={state.errors.phone}
        hint="Es por donde te avisamos si hay que mover una cita."
      />

      {/* El correo se enseña pero no se edita. Es el identificador de la cuenta: cambiarlo
          es, en la práctica, mudarse a otra cuenta, y hacerlo bien exige confirmar el
          correo nuevo antes de soltar el viejo —si no, una errata deja a alguien fuera de
          su cuenta para siempre—. Mientras eso no esté montado, se cambia a mano
          escribiendo a la barbería, que es raro y es mejor así. */}
      <div className="flex flex-col gap-2 text-left">
        <span className="eyebrow text-bone-soft">Correo electrónico</span>
        <p className="min-h-11 border border-line bg-night px-4 py-2.5 text-body text-bone-faint">
          {email}
        </p>
        <p className="text-small text-bone-faint">
          Para cambiarlo, escríbenos: es la dirección con la que entras.
        </p>
      </div>

      <SubmitButton pendingLabel="Guardando…">Guardar cambios</SubmitButton>
    </form>
  )
}

export function PasswordForm() {
  const [state, action] = useActionState<PasswordState, FormData>(
    changePasswordAction,
    emptyPasswordState,
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <FormError>{state.errors.form}</FormError>
      {state.saved && (
        <p role="status" className="border border-gold/40 bg-gold/10 p-3 text-small text-bone">
          Contraseña cambiada.
        </p>
      )}

      <Field
        label="Contraseña actual"
        name="current"
        type="password"
        autoComplete="current-password"
        error={state.errors.current}
      />
      <Field
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.errors.password}
        hint="Ocho caracteres como mínimo."
      />
      <Field
        label="Repite la nueva"
        name="passwordConfirm"
        type="password"
        autoComplete="new-password"
        error={state.errors.passwordConfirm}
      />

      <SubmitButton pendingLabel="Cambiando…" className="btn btn-ghost w-full">
        Cambiar contraseña
      </SubmitButton>
    </form>
  )
}
