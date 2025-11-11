import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Busca perguntas de texto (TEXT_SHORT e TEXT_LONG) com suas respostas
    const questions = await prisma.question.findMany({
      where: {
        type: {
          in: ['TEXT_SHORT', 'TEXT_LONG'],
        },
        form: {
          status: 'PUBLISHED',
        },
      },
      select: {
        id: true,
        text: true,
        type: true,
        form: {
          select: {
            id: true,
            title: true,
            type: true,
            surveyMomentId: true,
            surveyMoment: {
              select: {
                id: true,
                name: true,
                color: true,
                icon: true,
              },
            },
          },
        },
        answers: {
          where: {
            textValue: {
              not: null,
            },
            response: {
              status: 'COMPLETED',
            },
          },
          select: {
            id: true,
            textValue: true,
            response: {
              select: {
                id: true,
                completedAt: true,
                respondent: {
                  select: {
                    name: true,
                    type: true,
                    category: true,
                    specialty: true,
                    region: true,
                    company: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        form: {
          createdAt: 'desc',
        },
      },
    })

    // Filtra apenas perguntas que têm respostas
    const questionsWithResponses = questions.filter((q) => q.answers.length > 0)

    // Formata os dados para o componente TextResponsesViewer
    const formatted = questionsWithResponses.map((question) => ({
      id: question.id,
      text: question.text,
      type: question.type as 'TEXT_SHORT' | 'TEXT_LONG',
      formId: question.form.id,
      formTitle: question.form.title,
      formType: question.form.type,
      surveyMomentId: question.form.surveyMomentId,
      surveyMoment: question.form.surveyMoment,
      totalResponses: question.answers.length,
      responses: question.answers.map((answer) => ({
        id: answer.id,
        value: answer.textValue || '',
        respondent: answer.response.respondent,
        completedAt: answer.response.completedAt,
      })),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching text responses:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar respostas de texto' },
      { status: 500 }
    )
  }
}
