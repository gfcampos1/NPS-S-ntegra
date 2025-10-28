import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const response = await prisma.response.findUnique({
      where: { uniqueToken: params.token },
      include: {
        form: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        respondent: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 404 }
      )
    }

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pesquisa já respondida', completed: true },
        { status: 400 }
      )
    }

    return NextResponse.json({
      form: response.form,
      respondent: response.respondent,
      progress: response.answers || {},
      responseId: response.id,
    })
  } catch (error) {
    console.error('Error fetching form by token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { answers, completed = false } = body

    const response = await prisma.response.findUnique({
      where: { uniqueToken: params.token },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 404 }
      )
    }

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pesquisa já respondida' },
        { status: 400 }
      )
    }

    const updatedResponse = await prisma.response.update({
      where: { uniqueToken: params.token },
      data: {
        answers: answers as any,
        status: completed ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      response: updatedResponse,
      message: completed ? 'Respostas enviadas com sucesso!' : 'Progresso salvo',
    })
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
