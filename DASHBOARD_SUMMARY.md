# Dashboard NPS Manager - Resumo Executivo

## Pergunta Original
> "Como seria esse Dashboard com NPS real? Como ele trataria várias pesquisas diferentes com públicos distintos e perguntas de vários tipos diferentes?"

## Resposta em 3 Pontos

### 1️⃣ **Separação Inteligente por Tipo de Pergunta**

```
Formulário Único:
├─ Pergunta 1: NPS (0-10)         → Vai para "NPS Score"
├─ Pergunta 2: Rating (1-5)       → Vai para "Satisfação Média"
├─ Pergunta 3: Yes/No             → Vai para "Perguntas Sim/Não"
├─ Pergunta 4: Texto Longo        → Vai para análise separada
└─ Pergunta 5: Múltipla Escolha   → Gráfico próprio

❌ NÃO mistura tipos diferentes
✅ Cada tipo tem sua métrica específica
```

### 2️⃣ **Agregação Multinível**

```
NÍVEL 1: Global (todos os formulários, todos os públicos)
  └─ NPS Geral: +42 (234 respostas)

NÍVEL 2: Por Público
  ├─ Médicos: +48 (180 respostas)
  └─ Distribuidores: +32 (54 respostas)

NÍVEL 3: Por Formulário
  ├─ Pesquisa Médicos Q1: +52
  ├─ Satisfação Distribuidores: +38
  └─ Feedback Produto X: +15

NÍVEL 4: Por Categoria
  ├─ Cardiologia: +65
  ├─ Dermatologia: +58
  ├─ ...
  └─ Região Norte: +18
```

### 3️⃣ **Filtros Dinâmicos que Transformam Todo o Dashboard**

```
SEM FILTROS:
┌─────────────────────────┐
│ NPS Geral: +42          │ ← Todas as 234 respostas
│ Médicos vs Distrib.     │
│ Top/Bottom Categorias   │
└─────────────────────────┘

COM FILTROS (Médicos + Cardiologia):
┌─────────────────────────┐
│ NPS: +68               │ ← Apenas 12 respostas
│ (Cardiologistas)       │   desse segmento
│ vs Média Médicos: +48  │
└─────────────────────────┘
```

---

## Arquitetura Técnica

### Backend (Agregação)

```typescript
// Pseudo-código da lógica principal

function getDashboardData(filters) {
  // 1. Busca TODAS as respostas que atendem aos filtros
  const allResponses = await db.responses.findMany({
    where: buildWhereClause(filters),
    include: {
      answers: {
        include: { question: true }
      },
      respondent: true
    }
  })

  // 2. Separa respostas por TIPO de pergunta
  const npsAnswers = allResponses
    .flatMap(r => r.answers)
    .filter(a => a.question.type === 'NPS')
    .map(a => a.numericValue)

  const ratingAnswers = allResponses
    .flatMap(r => r.answers)
    .filter(a => a.question.type === 'RATING_1_5')
    .map(a => a.numericValue)

  // 3. Calcula métricas
  const nps = calculateNPS(npsAnswers)  // -100 a +100
  const satisfaction = average(ratingAnswers)  // 1-5

  // 4. Segmenta por dimensões
  const byPublic = groupBy(allResponses, r => r.respondent.type)
  const byCategory = groupBy(allResponses, r => r.respondent.category)
  const byForm = groupBy(allResponses, r => r.formId)

  // 5. Retorna estrutura consolidada
  return {
    global: { nps, satisfaction, ... },
    byPublic: { medicos: {...}, distribuidores: {...} },
    byCategory: [...],
    byForm: [...],
    timeSeries: [...]
  }
}
```

### Frontend (Visualização)

```typescript
// Componente React

function Dashboard() {
  const [filters, setFilters] = useState({
    dateRange: 'last30days'
  })

  // Busca dados com cache de 5 min
  const { data } = useQuery({
    queryKey: ['dashboard', filters],
    queryFn: () => fetchDashboard(filters),
    staleTime: 5 * 60 * 1000
  })

  return (
    <>
      <Filters onChange={setFilters} />

      {/* NPS Score */}
      <NPSCard value={data.global.nps} />

      {/* Comparação */}
      <ComparisonChart data={data.byPublic} />

      {/* Tendência */}
      <TimeSeriesChart data={data.timeSeries} />
    </>
  )
}
```

---

## Decisões de Design Importantes

### ✅ O Que Fazer

1. **Sempre separar métricas por tipo**
   - NPS (0-10) nunca mistura com Rating (1-5)
   - Cada tipo tem seu card/gráfico

2. **Sempre mostrar contexto**
   - "Baseado em X respostas"
   - "vs período anterior"
   - "Mínimo 10 respostas recomendado"

3. **Sempre permitir drill-down**
   - Clicar em "Médicos" filtra tudo para médicos
   - Clicar em "Cardiologia" filtra para cardiologia
   - Breadcrumb mostra filtros ativos

4. **Sempre gerar insights**
   - "NPS caiu 12 pontos"
   - "Top 10% do setor"
   - "Diferença significativa entre públicos"

### ❌ O Que NÃO Fazer

1. **Não calcular "NPS médio"**
   ```typescript
   // ERRADO ❌
   const avgNPS = average([+52, +38, +15])  // = +35

   // CERTO ✅
   const allScores = [...form1Scores, ...form2Scores, ...form3Scores]
   const nps = calculateNPS(allScores)  // Fórmula correta
   ```

2. **Não misturar tipos de perguntas**
   ```typescript
   // ERRADO ❌
   const combined = [...npsScores, ...ratingScores]

   // CERTO ✅
   const nps = calculateNPS(npsScores)  // Só NPS
   const satisfaction = average(ratingScores)  // Só Rating
   ```

3. **Não ignorar dados insuficientes**
   ```typescript
   // ERRADO ❌
   if (responses.length === 2) {
     return calculateNPS(...)  // Não confiável!
   }

   // CERTO ✅
   if (responses.length < 10) {
     return <InsufficientDataWarning />
   }
   ```

4. **Não fazer queries pesadas no cliente**
   ```typescript
   // ERRADO ❌
   const allData = await fetchAllResponses()  // 10k+ registros
   const filtered = allData.filter(...)

   // CERTO ✅
   const data = await fetchDashboard(filters)  // Backend filtra
   ```

---

## Fluxo de Dados Completo

```
[1] Usuário seleciona filtros
      ↓
[2] React Query faz POST /api/dashboard com filtros
      ↓
[3] Backend valida autenticação
      ↓
[4] Prisma busca dados com WHERE clause otimizado
      ↓
[5] Backend agrupa dados por tipo de pergunta
      ↓
[6] Backend calcula métricas (NPS, satisfação, etc)
      ↓
[7] Backend segmenta por público/categoria/formulário
      ↓
[8] Backend gera insights automáticos
      ↓
[9] Backend retorna JSON consolidado (~50KB)
      ↓
[10] React Query cacheia por 5 minutos
      ↓
[11] Frontend renderiza cards e gráficos
      ↓
[12] Usuário altera filtro → volta para [2]
```

---

## Exemplo Real de Payload

### Request (Frontend → Backend)

```json
POST /api/dashboard

{
  "dateRange": "last30days",
  "formIds": null,
  "respondentType": "MEDICO",
  "categories": ["Cardiologia", "Sudeste"]
}
```

### Response (Backend → Frontend)

```json
{
  "global": {
    "nps": 68,
    "totalResponses": 12,
    "promoters": 10,
    "neutrals": 2,
    "detractors": 0,
    "trend": +8,
    "breakdown": {
      "promotersPercentage": 83.3,
      "neutralsPercentage": 16.7,
      "detractorsPercentage": 0
    }
  },
  "publicComparison": {
    "medicos": { "nps": 68, ... },
    "distribuidores": null  // Filtrado fora
  },
  "formPerformance": [
    {
      "formId": "abc123",
      "formTitle": "Pesquisa Médicos Q1",
      "nps": 68,
      "totalResponses": 12,
      "interpretation": {
        "label": "Excelente",
        "color": "#10b981",
        "description": "Zona de excelência"
      }
    }
  ],
  "topCategories": [
    { "category": "Cardiologia", "nps": 68, "totalResponses": 12 }
  ],
  "bottomCategories": [],
  "timeSeries": [
    { "period": "2024-08", "nps": 62, "totalResponses": 8 },
    { "period": "2024-09", "nps": 65, "totalResponses": 10 },
    { "period": "2024-10", "nps": 68, "totalResponses": 12 }
  ],
  "satisfactionAverage": 4.5,
  "alerts": [
    {
      "type": "success",
      "message": "Cardiologistas do Sudeste têm NPS +20 acima da média!",
      "severity": "low"
    },
    {
      "type": "info",
      "message": "NPS cresceu +8 pontos vs período anterior",
      "severity": "low"
    }
  ]
}
```

---

## Próximos Passos para Implementar

### Fase 1: MVP (3-4 dias)
- [ ] Criar `/api/dashboard` route
- [ ] Implementar `getGlobalNPSMetrics()`
- [ ] Implementar `getPublicComparison()`
- [ ] Criar componente `DashboardNPS` básico
- [ ] Cards principais: NPS Global, Breakdown, Satisfação

### Fase 2: Segmentação (2-3 dias)
- [ ] Implementar `getFormPerformance()`
- [ ] Implementar `getCategoryPerformance()`
- [ ] Top/Bottom 5 categorias
- [ ] Filtros funcionais

### Fase 3: Temporal (2-3 dias)
- [ ] Implementar `getTimeSeries()`
- [ ] Gráfico de linha (Recharts)
- [ ] Comparação período anterior
- [ ] Tendências

### Fase 4: Insights (1-2 dias)
- [ ] Sistema de alertas
- [ ] Geração automática de insights
- [ ] Badges de status

### Fase 5: Export (2-3 dias)
- [ ] Export PDF
- [ ] Export CSV
- [ ] Agendamento de relatórios

**TOTAL: ~10-15 dias de trabalho focado**

---

## Conclusão

O Dashboard com NPS real seria:

✅ **Inteligente**: Separa e agrega dados corretamente
✅ **Flexível**: Funciona com qualquer combinação de formulários
✅ **Segmentável**: Drill-down em múltiplas dimensões
✅ **Acionável**: Gera insights e alertas automáticos
✅ **Performante**: Queries otimizadas e cache
✅ **Compreensível**: UI clara mostrando exatamente o que mede

**A chave é:** Nunca misturar tipos de perguntas diferentes, sempre agregar corretamente usando a fórmula matemática do NPS, e dar contexto claro ao usuário sobre o que cada métrica representa.

---

Documentos Relacionados:
- [DASHBOARD_DESIGN.md](./DASHBOARD_DESIGN.md) - Design visual completo
- [DASHBOARD_IMPLEMENTATION_EXAMPLE.tsx](./DASHBOARD_IMPLEMENTATION_EXAMPLE.tsx) - Código conceitual
- [DASHBOARD_SCENARIOS.md](./DASHBOARD_SCENARIOS.md) - 10 cenários reais

**Pronto para implementar?** 🚀
