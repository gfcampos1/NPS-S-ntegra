import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

/**
 * API Route para executar migrations de banco de dados
 * Apenas Super Admins podem executar esta operação
 * Esta é uma operação sensível que modifica a estrutura do banco
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação e permissão
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'SUPER_ADMIN') {
      console.error('Tentativa de acesso não autorizado à migration', {
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: session.user.role,
      })

      return NextResponse.json(
        { error: 'Apenas Super Admins podem executar migrations' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { migrationName } = body

    if (!migrationName) {
      return NextResponse.json(
        { error: 'Nome da migration é obrigatório' },
        { status: 400 }
      )
    }

    // Registra início da migration
    console.log('Iniciando migration', {
      migrationName,
      executedBy: session.user.email,
    })

    // Executa a migration específica
    let result
    switch (migrationName) {
      case 'add_password_reset_fields':
        result = await addPasswordResetFields()
        break
      
      default:
        return NextResponse.json(
          { error: 'Migration não encontrada' },
          { status: 404 }
        )
    }

    // Registra sucesso
    console.log('Migration executada com sucesso', {
      migrationName,
      executedBy: session.user.email,
      result,
    })

    // Registra no AuditLog
    await prisma.auditLog.create({
      data: {
        action: 'DATABASE_MIGRATION',
        userId: session.user.id,
        entityType: 'Database',
        entityId: migrationName,
        changes: {
          migrationName,
          timestamp: new Date().toISOString(),
          result,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Migration executada com sucesso',
      migrationName,
      result,
    })

  } catch (error: any) {
    console.error('Erro ao executar migration', {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      { 
        error: 'Erro ao executar migration',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

/**
 * Migration: Adiciona campos de reset de senha
 * Adiciona tempPassword e requirePasswordChange à tabela User
 */
async function addPasswordResetFields() {
  try {
    // Verifica se as colunas já existem
    const tableInfo = await prisma.$queryRaw<any[]>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('tempPassword', 'requirePasswordChange')
    `

    const existingColumns = tableInfo.map((row: any) => row.column_name)

    const results = {
      tempPasswordAdded: false,
      requirePasswordChangeAdded: false,
      alreadyExisted: false,
    }

    // Adiciona coluna tempPassword se não existir
    if (!existingColumns.includes('tempPassword')) {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "tempPassword" TEXT
      `
      results.tempPasswordAdded = true
    } else {
      results.alreadyExisted = true
    }

    // Adiciona coluna requirePasswordChange se não existir
    if (!existingColumns.includes('requirePasswordChange')) {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "requirePasswordChange" BOOLEAN NOT NULL DEFAULT false
      `
      results.requirePasswordChangeAdded = true
    } else {
      results.alreadyExisted = true
    }

    // Registra a migration na tabela _prisma_migrations se não existir
    const migrationExists = await prisma.$queryRaw<any[]>`
      SELECT migration_name 
      FROM "_prisma_migrations" 
      WHERE migration_name = '20251031_add_password_reset_fields'
    `

    if (migrationExists.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "_prisma_migrations" (
          id, 
          checksum, 
          finished_at, 
          migration_name, 
          logs, 
          rolled_back_at, 
          started_at, 
          applied_steps_count
        )
        VALUES (
          gen_random_uuid()::text,
          'manual_migration',
          NOW(),
          '20251031_add_password_reset_fields',
          'Adiciona campos tempPassword e requirePasswordChange para sistema de reset de senha',
          NULL,
          NOW(),
          2
        )
      `
    }

    return results

  } catch (error: any) {
    throw new Error(`Erro ao executar migration add_password_reset_fields: ${error.message}`)
  }
}

/**
 * GET: Lista migrations disponíveis e seu status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Lista migrations executadas
    const executedMigrations = await prisma.$queryRaw<any[]>`
      SELECT 
        migration_name,
        finished_at,
        logs
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
    `

    // Lista migrations disponíveis
    const availableMigrations = [
      {
        name: 'add_password_reset_fields',
        description: 'Adiciona campos tempPassword e requirePasswordChange para sistema de reset de senha',
        executed: executedMigrations.some(m => m.migration_name === '20251031_add_password_reset_fields'),
      },
    ]

    return NextResponse.json({
      availableMigrations,
      executedMigrations,
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro ao listar migrations', details: error.message },
      { status: 500 }
    )
  }
}
