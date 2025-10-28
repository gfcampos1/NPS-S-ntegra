import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { createRespondentSchema } from '@/lib/validations/respondent'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { respondents } = body

    if (!Array.isArray(respondents) || respondents.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum respondente para importar' },
        { status: 400 }
      )
    }

    const results = {
      success: 0,
      errors: 0,
      duplicates: 0,
      details: [] as any[],
    }

    for (const respondentData of respondents) {
      try {
        // Validate data
        const validatedData = createRespondentSchema.parse(respondentData)

        // Check if already exists
        const existing = await prisma.respondent.findUnique({
          where: { email: validatedData.email },
        })

        if (existing) {
          results.duplicates++
          results.details.push({
            email: validatedData.email,
            status: 'duplicate',
            message: 'Email já cadastrado',
          })
          continue
        }

        // Create respondent
        await prisma.respondent.create({
          data: validatedData as any,
        })

        results.success++
        results.details.push({
          email: validatedData.email,
          status: 'success',
        })
      } catch (error) {
        results.errors++
        results.details.push({
          email: respondentData.email || 'unknown',
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
        })
      }
    }

    return NextResponse.json({
      message: `Importação concluída: ${results.success} criados, ${results.duplicates} duplicados, ${results.errors} erros`,
      results,
    })
  } catch (error) {
    console.error('Error importing respondents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
