import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger rotas API que modificam dados (POST, PATCH, PUT, DELETE)
  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    pathname.startsWith('/api/') &&
    !pathname.startsWith('/api/auth/')
  ) {
    // Verificar autenticação
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token && !pathname.startsWith('/api/r/')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Proteção CSRF: Verificar origem da requisição
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Permitir requisições do mesmo host
    if (origin && host) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        return NextResponse.json(
          { error: 'Origem da requisição não autorizada' },
          { status: 403 }
        )
      }
    }

    // Para API routes públicas (/api/r/[token]), verificar referer
    if (pathname.startsWith('/api/r/') && origin && host) {
      const originHost = new URL(origin).host
      // Permitir mesma origem ou desenvolvimento local
      if (
        originHost !== host &&
        originHost !== 'localhost:3000' &&
        !originHost.endsWith('.railway.app')
      ) {
        return NextResponse.json(
          { error: 'Origem da requisição não autorizada' },
          { status: 403 }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
