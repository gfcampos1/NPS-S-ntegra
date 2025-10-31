import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Super Admin only' }, { status: 403 })
    }

    // Listar migrações no diretório
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations')
    const entries = await fs.readdir(migrationsDir, { withFileTypes: true })

    const migrations = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'migration_lock.toml')
      .map(entry => {
        const match = entry.name.match(/^(\d{14})_(.+)$/)
        if (match) {
          return {
            id: entry.name,
            timestamp: match[1],
            name: match[2].replace(/_/g, ' '),
            applied: false // Will be determined by Prisma
          }
        }
        return null
      })
      .filter(Boolean)
      .sort((a, b) => b!.timestamp.localeCompare(a!.timestamp))

    return NextResponse.json({
      migrations,
      total: migrations.length
    })
  } catch (error) {
    console.error('Error listing migrations:', error)
    return NextResponse.json(
      { error: 'Failed to list migrations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Super Admin only' }, { status: 403 })
    }

    const { action } = await request.json()

    if (action === 'deploy') {
      // Executar migrações pendentes
      try {
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
          cwd: process.cwd(),
          env: {
            ...process.env,
            PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
          },
          timeout: 60000 // 60 segundos
        })

        return NextResponse.json({
          success: true,
          message: 'Migrações aplicadas com sucesso',
          output: stdout,
          errors: stderr
        })
      } catch (execError: any) {
        console.error('Migration execution error:', execError)
        return NextResponse.json({
          success: false,
          message: 'Erro ao executar migrações',
          error: execError.message,
          output: execError.stdout || '',
          errors: execError.stderr || ''
        }, { status: 500 })
      }
    }

    if (action === 'status') {
      // Verificar status das migrações
      try {
        const { stdout, stderr } = await execAsync('npx prisma migrate status', {
          cwd: process.cwd(),
          env: {
            ...process.env,
            PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
          },
          timeout: 30000
        })

        return NextResponse.json({
          success: true,
          output: stdout,
          errors: stderr
        })
      } catch (execError: any) {
        // Status pode retornar erro se houver migrações pendentes
        return NextResponse.json({
          success: true,
          output: execError.stdout || '',
          errors: execError.stderr || '',
          hasPendingMigrations: true
        })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in migrations API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
