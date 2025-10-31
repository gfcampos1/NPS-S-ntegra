import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    name: string
    role: string
    requirePasswordChange?: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      requirePasswordChange?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    requirePasswordChange?: boolean
  }
}
