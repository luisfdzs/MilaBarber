export type SignInState = { error: string | null }
export const emptySignInState: SignInState = { error: null }

export type RegisterState = {
  errors: Record<string, string>
  values: { name?: string; email?: string; phone?: string }
}
export const emptyRegisterState: RegisterState = { errors: {}, values: {} }

export type ResetRequestState = { sent: boolean; error: string | null }
export const emptyResetRequestState: ResetRequestState = { sent: false, error: null }

export type NewPasswordState = { errors: Record<string, string> }
export const emptyNewPasswordState: NewPasswordState = { errors: {} }

export type ProfileState = { errors: Record<string, string>; saved: boolean }
export const emptyProfileState: ProfileState = { errors: {}, saved: false }

export type PasswordState = { errors: Record<string, string>; saved: boolean }
export const emptyPasswordState: PasswordState = { errors: {}, saved: false }

export type BookingState = { errors: Record<string, string> }
export const emptyBookingState: BookingState = { errors: {} }
