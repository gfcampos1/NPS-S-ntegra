import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { generateUniqueToken } from '@/lib/token'

function normalizeUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function resolveBaseUrl(request: NextRequest) {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.APP_BASE_URL

  if (envUrl) {
    return normalizeUrl(envUrl)
  }

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedPort = request.headers.get('x-forwarded-port')

  if (forwardedHost) {
    const protocol = forwardedProto || 'https'
    const portSegment =
      forwardedPort &&
      !['80', '443'].includes(forwardedPort) &&
      !forwardedHost.includes(':')
        ? `:${forwardedPort}`
        : ''
    return `${protocol}://${forwardedHost}${portSegment}`
  }

  const host = request.headers.get('host')
  if (host) {
    const protocol = forwardedProto || (host.includes('localhost') ? 'http' : 'https')
    return `${protocol}://${host}`
  }

  const origin = request.nextUrl?.origin
  if (origin && origin !== 'null') {
    return normalizeUrl(origin)
  }

  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await prisma.form.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    if (form.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Form precisa estar publicado para gerar link publico' },
        { status: 400 }
      )
    }

    const token = generateUniqueToken(16)

    await prisma.response.create({
      data: {
        formId: form.id,
        uniqueToken: token,
        status: 'IN_PROGRESS',
      },
    })

    const baseUrl = resolveBaseUrl(request)

    return NextResponse.json({
      token,
      url: `${baseUrl}/r/${token}`,
    })
  } catch (error) {
    console.error('Error generating public link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
