import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/utils'

function parseStoredAnswer(answer: any) {
  if (!answer) return null

  const type = answer.question?.type

  switch (type) {
    case 'NPS':
    case 'RATING_1_5':
      return answer.numericValue
    case 'TEXT_SHORT':
    case 'TEXT_LONG':
      return answer.textValue ?? ''
    case 'MULTIPLE_CHOICE': {
      if (!answer.textValue) return []
      // Usar safeJsonParse para evitar crashes (CWE-20)
      const parsed = safeJsonParse<string[]>(answer.textValue, [])
      return Array.isArray(parsed) ? parsed : []
    }
    case 'SINGLE_CHOICE':
    case 'COMPARISON':
      return answer.selectedOption ?? ''
    default:
      return answer.numericValue ?? answer.textValue ?? answer.selectedOption
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Rate limiting: 10 tentativas por minuto por IP (CWE-862)
    const limiter = rateLimit(request, { max: 10, windowMs: 60000 })

    if (!limiter.success) {
      const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns instantes.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() },
        }
      )
    }

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
        answers: {
          include: {
            question: {
              select: {
                type: true,
              },
            },
          },
        },
      },
    })

    if (!response) {
      // Aguardar tempo aleatório para evitar timing attacks (CWE-200)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 500)
      )
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 404 }
      )
    }

    // Validação de expiração do formulário (CWE-862)
    if (response.form.expiresAt && response.form.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Este formulário expirou', expired: true },
        { status: 410 } // 410 Gone
      )
    }

    // Validação de status do formulário (CWE-862)
    if (response.form.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Este formulário não está mais disponível' },
        { status: 403 }
      )
    }

    // Validação de limite de respostas (CWE-862)
    if (response.form.maxResponses) {
      const responseCount = await prisma.response.count({
        where: {
          formId: response.form.id,
          status: 'COMPLETED',
        },
      })

      if (responseCount >= response.form.maxResponses) {
        return NextResponse.json(
          { error: 'Limite de respostas atingido para este formulário' },
          { status: 403 }
        )
      }
    }

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pesquisa já respondida', completed: true },
        { status: 400 }
      )
    }

    const progress = response.answers.reduce((acc: any, answer: any) => {
      acc[answer.questionId] = parseStoredAnswer(answer)
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      form: response.form,
      respondent: response.respondent,
      progress,
      responseId: response.id,
    })
  } catch (error) {
    console.error('Error fetching form by token:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

function formatAnswerValue(type: string, rawValue: any) {
  switch (type) {
    case 'NPS':
    case 'RATING_1_5': {
      if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
        return { numericValue: Math.round(rawValue) }
      }
      if (typeof rawValue === 'string' && rawValue.trim() !== '') {
        const parsed = Number(rawValue)
        if (Number.isFinite(parsed)) {
          return { numericValue: Math.round(parsed) }
        }
      }
      return null
    }
    case 'TEXT_SHORT':
    case 'TEXT_LONG': {
      if (typeof rawValue === 'string') {
        return { textValue: rawValue }
      }
      return null
    }
    case 'MULTIPLE_CHOICE': {
      if (Array.isArray(rawValue)) {
        return { textValue: JSON.stringify(rawValue) }
      }
      return null
    }
    case 'SINGLE_CHOICE':
    case 'COMPARISON': {
      if (typeof rawValue === 'string') {
        return { selectedOption: rawValue }
      }
      return null
    }
    default:
      return null
  }
}

function countAnsweredQuestions(
  questions: { id: string }[],
  values: Record<string, any>
) {
  if (!questions.length) return 0

  return questions.reduce((count, question) => {
    const value = values[question.id]

    if (value === undefined || value === null) {
      return count
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? count + 1 : count
    }

    if (typeof value === 'string') {
      return value.trim() === '' ? count : count + 1
    }

    if (Array.isArray(value)) {
      return value.length === 0 ? count : count + 1
    }

    return count
  }, 0)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Rate limiting: 20 submissions por minuto por IP (CWE-862)
    const limiter = rateLimit(request, { max: 20, windowMs: 60000 })

    if (!limiter.success) {
      const retryAfter = Math.ceil((limiter.resetAt - Date.now()) / 1000)
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns instantes.' },
        {
          status: 429,
          headers: { 'Retry-After': retryAfter.toString() },
        }
      )
    }

    const body = await request.json()
    const { answers = {}, completed = false } = body as {
      answers: Record<string, any>
      completed: boolean
    }

    const response = await prisma.response.findUnique({
      where: { uniqueToken: params.token },
      include: {
        form: {
          include: {
            questions: true,
          },
        },
      },
    })

    if (!response) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
    }

    // Validação de expiração (CWE-862)
    if (response.form.expiresAt && response.form.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Este formulário expirou' },
        { status: 410 }
      )
    }

    // Validação de status (CWE-862)
    if (response.form.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Este formulário não está mais disponível' },
        { status: 403 }
      )
    }

    if (response.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pesquisa já respondida' },
        { status: 400 }
      )
    }

    const normalizedAnswers =
      answers && typeof answers === 'object' ? answers : {}

    const answeredCount = countAnsweredQuestions(
      response.form.questions,
      normalizedAnswers
    )
    const totalQuestions = response.form.questions.length
    const progress =
      totalQuestions > 0
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const updatedResponse = await prisma.$transaction(async (tx) => {
      for (const question of response.form.questions) {
        const rawValue = normalizedAnswers[question.id]

        if (
          rawValue === undefined ||
          rawValue === null ||
          (typeof rawValue === 'string' && rawValue.trim() === '') ||
          (Array.isArray(rawValue) && rawValue.length === 0)
        ) {
          await tx.answer
            .delete({
              where: {
                responseId_questionId: {
                  responseId: response.id,
                  questionId: question.id,
                },
              },
            })
            .catch(() => undefined)
          continue
        }

        const formatted = formatAnswerValue(question.type, rawValue)

        if (!formatted) {
          continue
        }

        await tx.answer.upsert({
          where: {
            responseId_questionId: {
              responseId: response.id,
              questionId: question.id,
            },
          },
          create: {
            responseId: response.id,
            questionId: question.id,
            numericValue: formatted.numericValue ?? null,
            textValue: formatted.textValue ?? null,
            selectedOption: formatted.selectedOption ?? null,
          },
          update: {
            numericValue: formatted.numericValue ?? null,
            textValue: formatted.textValue ?? null,
            selectedOption: formatted.selectedOption ?? null,
          },
        })
      }

      return tx.response.update({
        where: { id: response.id },
        data: {
          status: completed ? 'COMPLETED' : 'IN_PROGRESS',
          completedAt: completed ? new Date() : null,
          progress,
          ipAddress,
          userAgent,
        },
        include: {
          answers: {
            include: {
              question: {
                select: {
                  type: true,
                },
              },
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      response: updatedResponse,
      progress,
      message: completed ? 'Respostas enviadas com sucesso!' : 'Progresso salvo',
    })
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
