/**
 * EL ESTADO DE LOS FORMULARIOS: la forma que tiene y con qué empieza.
 *
 * Cada formulario de la web usa `useActionState`, que necesita dos cosas: el tipo de lo que
 * devuelve la acción y un valor inicial. Las dos viven aquí y no junto a su acción, y el
 * motivo es una regla de React que no admite excepciones: **un fichero `'use server'` sólo
 * puede exportar funciones asíncronas**. Cada `export` de ese fichero se convierte en un
 * extremo invocable desde el navegador, así que exportar una constante no tiene traducción
 * posible y el build falla — que es como se descubrió esto.
 *
 * Los tipos sí podrían quedarse allí (TypeScript los borra al compilar y no llegan a
 * existir en tiempo de ejecución), pero separar el tipo de su valor inicial dejaría la
 * mitad de cada formulario en un fichero y la otra mitad en otro.
 *
 * DOS FORMAS Y NO UNA GENÉRICA. Los formularios de esta web se dividen en dos clases:
 *
 * - Los que **corrigen y reintentan** (registro, reservar, cambiar la contraseña) llevan
 *   `errors` por campo, para poner el mensaje debajo del campo que falla y no arriba del
 *   todo, donde en un móvil ni se ve.
 * - Los que **sólo pueden fallar de una manera** (entrar, pedir el enlace de recuperación)
 *   llevan un único `error`, porque decir cuál de los dos campos falla sería justo lo que
 *   no queremos contar. El razonamiento está en `entrar/actions.ts` y en `lib/users.ts`.
 *
 * `values` aparece sólo en el registro: es el único formulario largo, y es el único en el
 * que perder lo escrito por un error de validación duele de verdad.
 */

/* --- Entrar ------------------------------------------------------------- */

export type SignInState = { error: string | null }
export const emptySignInState: SignInState = { error: null }

/* --- Registro ----------------------------------------------------------- */

export type RegisterState = {
  errors: Record<string, string>
  /**
   * Lo que la persona ya había escrito, para no obligarla a repetirlo tras un error. Se
   * enumeran los campos en vez de usar un `Record` suelto: la contraseña **no está** en
   * esta lista y no puede colarse por descuido.
   */
  values: { name?: string; email?: string; phone?: string }
}
export const emptyRegisterState: RegisterState = { errors: {}, values: {} }

/* --- Recuperar la contraseña -------------------------------------------- */

export type ResetRequestState = { sent: boolean; error: string | null }
export const emptyResetRequestState: ResetRequestState = { sent: false, error: null }

export type NewPasswordState = { errors: Record<string, string> }
export const emptyNewPasswordState: NewPasswordState = { errors: {} }

/* --- Mi cuenta ---------------------------------------------------------- */

export type ProfileState = { errors: Record<string, string>; saved: boolean }
export const emptyProfileState: ProfileState = { errors: {}, saved: false }

export type PasswordState = { errors: Record<string, string>; saved: boolean }
export const emptyPasswordState: PasswordState = { errors: {}, saved: false }

/* --- Reservar ----------------------------------------------------------- */

export type BookingState = { errors: Record<string, string> }
export const emptyBookingState: BookingState = { errors: {} }
