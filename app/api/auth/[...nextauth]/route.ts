import NextAuth, { type NextAuthOptions } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

const providers: any[] = []

// Google provider (optional if env vars present)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  )
}

// Optional Credentials demo (replace with real user verification or remove entirely)
providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      // Demo only: accept any email/password and create a session.
      if (credentials?.email) {
        return {
          id: "demo-" + Date.now(),
          name: credentials.email.split("@")[0],
          email: credentials.email,
        }
      }
      return null
    },
  }),
)

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
