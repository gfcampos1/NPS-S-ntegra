import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FormPreview } from '@/components/forms/FormPreview'
import { ShareLinkGenerator } from '@/components/forms/ShareLinkGenerator'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getForm(id: string) {
  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!form) {
    notFound()
  }

  return form
}

export default async function FormPreviewPage({ params }: { params: { id: string } }) {
  const form = await getForm(params.id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/forms/${form.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-sintegra-gray-dark">
            Preview do formulario
          </h1>
          <p className="text-sintegra-gray-medium">
            Visualize como os respondentes enxergarao o formulario e gere um link de envio publico.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <FormPreview form={form as any} />

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informacoes gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div>
                <p className="font-medium text-slate-900">Titulo</p>
                <p>{form.title}</p>
              </div>
              {form.description && (
                <div>
                  <p className="font-medium text-slate-900">Descricao</p>
                  <p>{form.description}</p>
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">Perguntas</p>
                <p>{form.questions.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <ShareLinkGenerator formId={form.id} formTitle={form.title} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
