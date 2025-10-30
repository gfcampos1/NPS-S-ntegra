import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

// DELETE /api/reports/[id] - Deletar relatório
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params

    // Verifica se o relatório existe
    const report = await prisma.report.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    // Deleta o relatório
    await prisma.report.delete({
      where: { id },
    })

    // TODO: Deletar arquivos CSV/PDF do storage se existirem
    // if (report.csvUrl) await deleteFile(report.csvUrl)
    // if (report.pdfUrl) await deleteFile(report.pdfUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting report:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar relatório' },
      { status: 500 }
    )
  }
}
