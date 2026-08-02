import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { credentialsSchema } from '@/lib/validation'
import { verifyCredentials } from '@/lib/users'

/**
 * AUTENTICACIÓN CON CORREO Y CONTRASEÑA.
 *
 * Es la forma de entrar que ya tiene la clientela en milabarberr.com y esta web la
 * sustituye: cambiar de método en la misma mudanza sería pedirle dos cosas a la vez a
 * gente que sólo quiere pedir cita. El razonamiento completo, y lo que obliga a hacer
 * bien (bcrypt, mensajes iguales, tiempos iguales), está en `lib/users.ts`.
 *
 * SESIONES EN JWT Y NO EN BASE DE DATOS, al revés que en BonsaiArtesania. No es una
 * preferencia: **Auth.js no admite sesiones en base con el proveedor de credenciales.**
 * El adaptador crea la sesión en el flujo de OAuth y de enlace por correo, y en
 * credenciales ese flujo no existe, así que `strategy: 'database'` deja la sesión vacía.
 * Bonsai entra con enlace al correo y por eso allí sí se puede.
 *
 * Lo que se pierde con JWT es poder invalidar una sesión desde el servidor: un token
 * firmado vale hasta que caduca aunque la persona pulse «salir» en otro dispositivo. Se
 * compensa acortando la vida a siete días —en vez de los treinta de serie— y renovándola
 * en cada visita, de modo que quien usa la web no nota nada y una sesión olvidada en un
 * móvil prestado se apaga sola en una semana. Para lo que hay detrás —tus citas y tu
 * teléfono, no una tarjeta— es un intercambio razonable.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    // Renueva el token como mucho una vez al día. Sin esto, Auth.js reescribe la cookie
    // en cada petición y se pagan una firma y una cabecera `Set-Cookie` por navegación.
    updateAge: 24 * 60 * 60,
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      /**
       * Devolver `null` es lo que Auth.js entiende por «no entra». **Nunca se lanza un
       * error con el motivo**: el mensaje acabaría en la URL de vuelta al formulario y
       * convertiría la pantalla de acceso en un comprobador de qué correos están
       * registrados en la barbería.
       */
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await verifyCredentials(parsed.data.email, parsed.data.password)
        if (!user) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],

  pages: {
    signIn: '/entrar',
    error: '/entrar',
  },

  callbacks: {
    /**
     * El papel (cliente, barbero, administrador) viaja en el token para no consultar la
     * base en cada petición sólo para decidir si se pinta el enlace de la agenda.
     *
     * El precio, y hay que tenerlo presente: **un cambio de papel no tiene efecto hasta
     * que la persona vuelve a entrar**. Es aceptable porque los papeles aquí se dan una
     * vez, a mano, al montar el equipo. Cualquier acción que de verdad dependa del papel
     * —ver la agenda de todos, cancelar la cita de otro— lo vuelve a comprobar contra la
     * base antes de escribir nada; el token sólo decide qué se enseña.
     */
    jwt({ token, user }) {
      // `user` sólo llega en la petición en que se entra; en las siguientes el token ya
      // viene firmado con estos dos campos. El `user.id` es opcional en el tipo de Auth.js
      // porque hay proveedores que no lo traen: el nuestro es `authorize`, que siempre lo
      // devuelve, pero sin comprobarlo aquí no hay forma de garantizárselo a TypeScript.
      if (user?.id) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
})
