import type { UserRole } from '@/lib/users'
import 'next-auth'
import 'next-auth/jwt'

/**
 * Auth.js no sabe nada de nuestro `id` ni de nuestro `role`: los añadimos en los
 * callbacks de `auth.ts` y aquí se le dice a TypeScript que existen. Sin este fichero,
 * `session.user.role` sería un error de compilación en cada sitio donde se usa.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      email: string
      name: string
    }
  }

  interface User {
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
