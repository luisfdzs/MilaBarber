import { handlers } from '@/auth'

/**
 * Los puntos de entrada que Auth.js necesita servir: la comprobación de sesión, el
 * cierre de sesión y el token CSRF. El formulario de acceso NO pasa por aquí —usa una
 * acción de servidor, ver `app/(site)/entrar/actions.ts`—, pero la biblioteca sigue
 * necesitando estas rutas para lo demás.
 */
export const { GET, POST } = handlers
