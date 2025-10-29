import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { generateUniqueToken } from '@/lib/token'

function resolveBaseUrl() {
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

    const baseUrl = resolveBaseUrl()

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
