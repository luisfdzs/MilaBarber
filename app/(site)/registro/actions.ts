'use server'

import { redirect } from 'next/navigation'
import { signIn } from '@/auth'
import type { RegisterState } from '@/lib/form-state'
import { createUser } from '@/lib/users'
import { fieldErrors, registerSchema } from '@/lib/validation'

/**
 * ALTA DE CUENTA.
 *
 * Cuatro campos: nombre, correo, teléfono y contraseña. Ni uno más — cada campo de un
 * formulario de registro cuesta gente, y de lo demás ya se entera la barbería cuando la
 * persona se sienta en el sillón.
 *
 * **El teléfono es obligatorio y el correo también**, y no es redundante: el correo
 * identifica la cuenta y sirve para recuperar la contraseña; el teléfono es por donde se
 * avisa de verdad si hay que mover una cita esta tarde. Una barbería no manda un correo
 * para eso, llama.
 *
 * SI EL CORREO YA EXISTE, **se responde exactamente lo mismo que si el alta hubiera ido
 * bien**: se manda a la pantalla de acceso. Contestar «ese correo ya está registrado»
 * convertiría este formulario en una lista de quién es cliente de la barbería, que es el
 * mismo motivo por el que el acceso da un solo mensaje. Quien ya tenga cuenta se
 * encuentra el formulario de entrar, que es donde tenía que ir.
 */
export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    password: String(formData.get('password') ?? ''),
    passwordConfirm: String(formData.get('passwordConfirm') ?? ''),
  }

  // Lo que se devuelve al formulario si algo falla. La contraseña NO: se vuelve a escribir.
  const values = { name: raw.name, email: raw.email, phone: raw.phone }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values }

  const user = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    password: parsed.data.password,
  })

  if (user) {
    // Se entra sola: obligar a escribir el mismo correo y la misma contraseña otra vez,
    // treinta segundos después de haberlos elegido, no protege nada y pierde a la mitad.
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    redirect('/cuenta?bienvenida=1')
  }

  // Correo ya registrado. Misma respuesta visible que el éxito, salvo que aquí no hay
  // sesión: la pantalla de acceso pide la contraseña, que es quien de verdad decide.
  redirect('/entrar?ya-registrado=1')
}
