import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { generateUniqueToken } from '@/lib/token'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { respondentIds } = body

    if (!Array.isArray(respondentIds) || respondentIds.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum respondente selecionado' },
        { status: 400 }
      )
    }

    // Verify form exists
    const form = await prisma.form.findUnique({
      where: { id: params.id },
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    const results = {
      success: 0,
      errors: 0,
      tokens: [] as any[],
    }

    for (const respondentId of respondentIds) {
      try {
        // Check if respondent already has a token for this form
        const existingResponse = await prisma.response.findFirst({
          where: {
            formId: params.id,
            respondentId: respondentId,
          },
        })

        let token: string
        let responseId: string

        if (existingResponse) {
          token = existingResponse.uniqueToken
          responseId = existingResponse.id
        } else {
          // Generate unique token
          token = generateUniqueToken()

          // Create response record
          const response = await prisma.response.create({
            data: {
              formId: params.id,
              respondentId: respondentId,
              uniqueToken: token,
              status: 'PENDING',
              answers: {},
            },
            include: {
              respondent: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          })

          responseId = response.id
        }

        results.success++
        results.tokens.push({
          respondentId,
          token,
          responseId,
          url: `${process.env.NEXTAUTH_URL}/r/${token}`,
        })
      } catch (error) {
        results.errors++
        console.error(`Error creating token for respondent ${respondentId}:`, error)
      }
    }

    return NextResponse.json({
      message: `${results.success} tokens gerados com sucesso`,
      results,
    })
  } catch (error) {
    console.error('Error distributing form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
