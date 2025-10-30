# Integração de Respostas de Texto - Guia de Implementação

## 1. Componente Criado

✅ **TextResponsesViewer.tsx** - Componente completo para visualizar respostas de texto

### Funcionalidades Implementadas:

#### Para TEXT_SHORT:
- ✅ Análise de frequência de palavras
- ✅ Agrupamento de respostas idênticas
- ✅ Top 10 palavras mencionadas
- ✅ Top 10 respostas mais comuns

#### Para TEXT_LONG:
- ✅ Cards expandíveis (truncate após 150 caracteres)
- ✅ Botão "Expandir" / "Recolher"

#### Geral:
- ✅ Busca em tempo real (destaca termo)
- ✅ Filtro por sentimento (positivo/neutro/negativo)
- ✅ Paginação (10 por página)
- ✅ Emoji de sentimento automático
- ✅ Copiar para clipboard
- ✅ Export para CSV
- ✅ Formatação de datas em português
- ✅ Contexto do respondente (nome, tipo, categoria)

---

## 2. Como Usar no Dashboard

### Opção A: Integrar no Dashboard Principal

```typescript
// frontend/src/app/admin/dashboard/page.tsx

import { TextResponsesViewer } from '@/components/dashboard/TextResponsesViewer'

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Busca perguntas de texto
  const textQuestions = await getTextQuestionsWithResponses()

  return (
    <div className="p-6 space-y-6">
      {/* Cards de métricas existentes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* ... cards existentes ... */}
      </div>

      {/* Gráficos de NPS, Rating, etc */}
      <QuestionInsights data={data.formInsights} />

      {/* NOVO: Respostas de Texto */}
      {textQuestions.map((question) => (
        <TextResponsesViewer
          key={question.id}
          questionText={question.text}
          questionType={question.type}
          responses={question.responses}
        />
      ))}
    </div>
  )
}
```

### Opção B: Página Separada de Feedbacks

```typescript
// frontend/src/app/admin/feedbacks/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { TextResponsesViewer } from '@/components/dashboard/TextResponsesViewer'

export default function FeedbacksPage() {
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTextQuestions()
  }, [])

  const fetchTextQuestions = async () => {
    const res = await fetch('/api/questions/text-responses')
    const data = await res.json()
    setQuestions(data)
    setIsLoading(false)
  }

  if (isLoading) return <Loading />

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Feedbacks e Comentários</h1>

      {questions.map((question) => (
        <TextResponsesViewer
          key={question.id}
          questionText={question.text}
          questionType={question.type}
          responses={question.responses}
        />
      ))}
    </div>
  )
}
```

---

## 3. API para Buscar Respostas de Texto

Crie uma nova API route:

```typescript
// frontend/src/app/api/questions/text-responses/route.ts

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

    // Busca perguntas de texto com respostas
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
    })

    // Formata para o componente
    const formatted = questions
      .filter((q) => q.answers.length > 0)
      .map((question) => ({
        id: question.id,
        text: question.text,
        type: question.type,
        formTitle: question.form.title,
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
```

---

## 4. Melhorias Futuras (IA)

### Análise de Sentimento com GPT-4

```typescript
// frontend/src/lib/sentiment-analysis.ts

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeSentiment(text: string) {
  const prompt = `Analise o sentimento do seguinte texto em português e retorne JSON:
{
  "sentiment": "positive" | "negative" | "neutral",
  "score": 0.0 to 1.0,
  "keywords": ["palavra1", "palavra2"],
  "summary": "breve resumo"
}

Texto: "${text}"`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content)
}
```

### Extração de Temas

```typescript
export async function extractThemes(comments: string[]) {
  const prompt = `Analise os seguintes comentários e identifique os 5 principais temas mencionados. Retorne JSON:
{
  "themes": [
    {
      "name": "Nome do tema",
      "count": número de vezes mencionado,
      "sentiment": "positive" | "negative" | "neutral",
      "examples": ["exemplo 1", "exemplo 2"]
    }
  ]
}

Comentários:
${comments.map((c, i) => `${i + 1}. ${c}`).join('\n')}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content)
}
```

### Uso no Componente

```typescript
// Adiciona ao componente TextResponsesViewer

const [aiInsights, setAiInsights] = useState(null)
const [isAnalyzing, setIsAnalyzing] = useState(false)

const analyzeWithAI = async () => {
  setIsAnalyzing(true)
  try {
    const res = await fetch('/api/ai/analyze-comments', {
      method: 'POST',
      body: JSON.stringify({
        comments: responses.map((r) => r.value),
      }),
    })
    const insights = await res.json()
    setAiInsights(insights)
  } catch (error) {
    console.error('AI analysis failed:', error)
  } finally {
    setIsAnalyzing(false)
  }
}

// Adiciona botão na UI
<Button onClick={analyzeWithAI} disabled={isAnalyzing}>
  {isAnalyzing ? 'Analisando...' : '🤖 Análise com IA'}
</Button>

// Exibe insights
{aiInsights && (
  <div className="border rounded-lg p-4 bg-blue-50">
    <h4 className="font-semibold mb-2">🤖 Insights da IA</h4>
    {aiInsights.themes.map((theme) => (
      <div key={theme.name}>
        <strong>{theme.name}</strong> (mencionado {theme.count}×)
        <p className="text-sm text-gray-600">{theme.examples[0]}</p>
      </div>
    ))}
  </div>
)}
```

---

## 5. Nuvem de Palavras (Word Cloud)

### Instalar biblioteca:

```bash
npm install react-wordcloud
```

### Componente:

```typescript
import ReactWordcloud from 'react-wordcloud'

const words = wordFrequency.map(([text, value]) => ({ text, value }))

<ReactWordcloud
  words={words}
  options={{
    rotations: 2,
    rotationAngles: [-90, 0],
    fontSizes: [12, 60],
    colors: ['#4169B1', '#5B7FC7', '#7595DD'],
  }}
/>
```

---

## 6. Adicionar ao Menu Lateral

```typescript
// frontend/src/components/layout/Sidebar.tsx

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Formulários", href: "/admin/forms", icon: FileText },
  { name: "Respondentes", href: "/admin/respondents", icon: Users },
  { name: "Feedbacks", href: "/admin/feedbacks", icon: MessageSquare }, // NOVO
  { name: "Relatórios", href: "/admin/reports", icon: BarChart3, adminOnly: true },
]
```

---

## 7. Exemplo de Tela Final

```
┌────────────────────────────────────────────────────────────┐
│  💬 O que mais gostou no nosso atendimento?                │
│  45 respostas • Tipo: Texto Curto                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [🔍 Buscar_______] [Sentimento: Todos ▼] [📥 Exportar]  │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────────┐  │
│  │ 🔤 Palavras Mais     │  │ 📝 Respostas Mais        │  │
│  │    Mencionadas       │  │    Comuns                │  │
│  ├──────────────────────┤  ├──────────────────────────┤  │
│  │ rapidez       18×    │  │ 12× "Rapidez"            │  │
│  │ qualidade     15×    │  │ 10× "Qualidade"          │  │
│  │ atendimento   12×    │  │  8× "Profissionais"      │  │
│  │ bom           10×    │  │  6× "Preços bons"        │  │
│  └──────────────────────┘  └──────────────────────────┘  │
│                                                            │
│  💬 Todas as Respostas (45)                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 😊 Dr. João Silva • Cardiologia • SP • há 2h        │  │
│  │ "Rapidez no atendimento e qualidade dos produtos"   │  │
│  │ [📋 Copiar]                                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 😊 Dra. Maria Santos • Pediatria • RJ • há 4h       │  │
│  │ "Excelente atendimento e produtos de qualidade"     │  │
│  │ [📋 Copiar]                                          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  [← Anterior]  1 2 3 4 5  [Próxima →]                     │
│  Mostrando 1-10 de 45                                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Checklist de Implementação

### Imediato (já feito):
- [x] Componente TextResponsesViewer.tsx criado
- [x] Busca em tempo real
- [x] Filtro por sentimento
- [x] Paginação
- [x] Export CSV
- [x] Análise de frequência

### Próximo (1-2 dias):
- [ ] Criar API /api/questions/text-responses
- [ ] Integrar no dashboard OU criar página /admin/feedbacks
- [ ] Adicionar ao menu lateral
- [ ] Testar com dados reais

### Futuro (quando tiver budget):
- [ ] Análise de sentimento com IA (GPT-4)
- [ ] Extração automática de temas
- [ ] Nuvem de palavras (react-wordcloud)
- [ ] Categorização automática
- [ ] Alertas de comentários negativos

---

## 9. Custos Estimados (IA)

### OpenAI GPT-4:
- Input: $0.03 / 1K tokens
- Output: $0.06 / 1K tokens
- **100 comentários** (~500 tokens input + 200 output) = $0.03
- **1000 comentários/mês** = ~$3.00
- **10000 comentários/mês** = ~$30.00

### Alternativa Gratuita:
- Hugging Face Transformers (local, sem custo)
- Menor precisão mas grátis
- Requer mais processamento

---

## Conclusão

O componente está **pronto para uso** e cobre 90% dos casos.

Para adicionar IA depois, basta:
1. Adicionar OPENAI_API_KEY no .env
2. Criar função analyzeSentiment()
3. Adicionar botão "Análise IA" no componente

**Recomendo:** Comece sem IA, valide o produto, depois adicione IA se necessário. 🚀
