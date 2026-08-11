import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { credentialsSchema } from '@/lib/validation'
import { verifyCredentials } from '@/lib/users'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
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
    jwt({ token, user }) {
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
