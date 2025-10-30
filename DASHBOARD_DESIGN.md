# Dashboard NPS Manager - Design Conceitual

## Visão Geral

O Dashboard precisa agregar dados de múltiplas pesquisas, públicos e tipos de perguntas de forma inteligente e segmentada.

## 1. Estrutura de Filtros (Topo)

```
┌─────────────────────────────────────────────────────────────────┐
│  Filtros Globais                                                │
├─────────────────────────────────────────────────────────────────┤
│  📅 Período: [Últimos 30 dias ▼]                               │
│  📋 Formulário: [Todos ▼] ou [Pesquisa Médicos ▼]             │
│  👥 Público: [Todos ▼] [Médicos] [Distribuidores]             │
│  🏷️  Categoria: [Todas ▼] [Cardiologia] [Sul] etc             │
│  🔄 [Limpar Filtros]                                            │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Cards Principais de Métricas

### 2.1 NPS Global (Apenas perguntas tipo NPS)

```
┌──────────────────────┐
│ 📊 NPS Score Geral   │
├──────────────────────┤
│        +42           │  ← Agregado de TODAS respostas NPS
│   Muito Bom          │
│   ↗ +5 vs mês ant.   │  ← Tendência
│   Based on 234 resp. │
└──────────────────────┘
```

### 2.2 Breakdown NPS

```
┌────────────────────────────────────┐
│ Distribuição NPS                   │
├────────────────────────────────────┤
│ 🟢 Promotores (9-10)   45% (105)  │ ████████████████
│ 🟡 Neutros (7-8)       35% (82)   │ ████████████
│ 🔴 Detratores (0-6)    20% (47)   │ ███████
└────────────────────────────────────┘
```

### 2.3 Outras Métricas

```
┌────────────────────┐  ┌─────────────────────┐  ┌──────────────────┐
│ ⭐ Satisfação Média│  │ 📝 Pesquisas        │  │ 👥 Respondentes  │
├────────────────────┤  ├─────────────────────┤  ├──────────────────┤
│      4.2/5.0       │  │       156           │  │      234         │
│   (RATING_1_5)     │  │   completadas       │  │   únicos         │
│   ↗ +0.3           │  │   15 ativas         │  │   85% médicos    │
└────────────────────┘  └─────────────────────┘  └──────────────────┘
```

## 3. Comparação por Público

```
┌────────────────────────────────────────────────────────────┐
│ 📊 NPS por Público                                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Médicos          +48  🟢🟢🟢🟢🟢🟡🟡🔴    (180 resp.)    │
│  Distribuidores   +32  🟢🟢🟢🟡🟡🟡🔴🔴    (54 resp.)     │
│                                                            │
│  Diferença: +16 pontos em favor dos médicos               │
└────────────────────────────────────────────────────────────┘
```

## 4. Tendência Temporal

```
┌────────────────────────────────────────────────────────────┐
│ 📈 Evolução NPS ao Longo do Tempo                          │
├────────────────────────────────────────────────────────────┤
│  60│                                            •          │
│    │                                      •                │
│  40│                            •   •                      │
│    │                      •                                │
│  20│                •                                      │
│    │          •                                            │
│   0│────┬────┬────┬────┬────┬────┬────┬────┬────┬────    │
│     Jan  Fev  Mar  Abr  Mai  Jun  Jul  Ago  Set  Out     │
│                                                            │
│  ─── NPS Geral   ─── Médicos   ─── Distribuidores        │
└────────────────────────────────────────────────────────────┘
```

## 5. Performance por Formulário

```
┌────────────────────────────────────────────────────────────┐
│ 📋 NPS por Formulário                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Pesquisa Médicos Q1 2024        +52  ████████  (120)    │
│  Satisfação Distribuidores       +38  ██████    (45)     │
│  Feedback Produto X              +15  ███        (30)     │
│  Pesquisa Anual Geral           +44  ███████   (95)     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 6. Top/Bottom Performers

```
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ 🏆 Top 5 Categorias         │  │ ⚠️  Bottom 5 Categorias     │
├─────────────────────────────┤  ├─────────────────────────────┤
│ 1. Cardiologia      +65     │  │ 1. Região Norte      +12    │
│ 2. Região Sul       +58     │  │ 2. Ortopedia         +18    │
│ 3. Dermatologia     +54     │  │ 3. Distribuidor X    +22    │
│ 4. Região Sudeste   +51     │  │ 4. Região Nordeste   +25    │
│ 5. Neurologia       +48     │  │ 5. Pediatria         +28    │
└─────────────────────────────┘  └─────────────────────────────┘
```

## 7. Alertas e Insights

```
┌────────────────────────────────────────────────────────────┐
│ 🔔 Alertas Automáticos                                     │
├────────────────────────────────────────────────────────────┤
│ ⚠️  Região Norte: NPS caiu 15 pontos nos últimos 7 dias   │
│ ⚠️  3 detratores recentes em "Satisfação Produto X"       │
│ ✅ Cardiologia mantém NPS acima de 60 por 90 dias          │
│ 📊 Médicos superam distribuidores em +16 pontos            │
└────────────────────────────────────────────────────────────┘
```

## 8. Análise de Perguntas Não-NPS

```
┌────────────────────────────────────────────────────────────┐
│ 📊 Outras Perguntas (Agrupadas por Tipo)                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [⭐ RATING_1_5]  [💬 TEXT]  [✓ YES/NO]  [◉ CHOICE]      │
│                                                            │
│  Perguntas RATING (1-5):                                   │
│  ├─ "Qualidade do atendimento"        4.5 ⭐⭐⭐⭐⭐     │
│  ├─ "Tempo de resposta"               3.8 ⭐⭐⭐⭐       │
│  └─ "Facilidade de contato"           4.2 ⭐⭐⭐⭐⭐     │
│                                                            │
│  Perguntas YES/NO:                                         │
│  └─ "Recomendaria nossos produtos?"   85% Sim  15% Não   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 9. Lógica de Agregação

### Regras de Cálculo:

1. **NPS Global**:
   - Pega TODAS as respostas de perguntas tipo `NPS` (0-10)
   - Aplica fórmula: ((Promotores - Detratores) / Total) × 100
   - Ignora perguntas de outros tipos

2. **Satisfação Média**:
   - Pega TODAS as respostas de perguntas tipo `RATING_1_5`
   - Calcula média aritmética
   - Converte para escala de 1-5

3. **Por Formulário**:
   - Filtra respostas por `formId`
   - Calcula NPS independente para cada formulário
   - Mostra apenas se formulário tem ≥10 respostas

4. **Por Público**:
   - Filtra respostas por `respondent.type` (MEDICO/DISTRIBUIDOR)
   - Calcula NPS separado para cada tipo
   - Mostra comparação lado a lado

5. **Por Categoria**:
   - Agrupa por `respondent.category`, `respondent.specialty`, `respondent.region`
   - Calcula NPS para cada grupo
   - Ranqueia do melhor ao pior

6. **Tendência Temporal**:
   - Agrupa respostas por semana/mês
   - Calcula NPS para cada período
   - Mostra evolução no gráfico de linha

### SQL Conceitual:

```sql
-- NPS Global
SELECT
  COUNT(CASE WHEN numericValue >= 9 THEN 1 END) as promoters,
  COUNT(CASE WHEN numericValue BETWEEN 7 AND 8 THEN 1 END) as neutrals,
  COUNT(CASE WHEN numericValue <= 6 THEN 1 END) as detractors,
  COUNT(*) as total,
  ((promoters - detractors) / total * 100) as nps
FROM answers a
JOIN questions q ON a.questionId = q.id
WHERE q.type = 'NPS'
  AND a.createdAt >= {dateFilter}

-- NPS por Público
SELECT
  r.type as public_type,
  -- mesmo cálculo acima
FROM answers a
JOIN questions q ON a.questionId = q.id
JOIN responses res ON a.responseId = res.id
JOIN respondents r ON res.respondentId = r.id
WHERE q.type = 'NPS'
GROUP BY r.type

-- NPS por Categoria
SELECT
  r.category,
  -- mesmo cálculo
GROUP BY r.category
ORDER BY nps DESC
```

## 10. Estados de Dashboard

### 10.1 Sem Dados
```
┌────────────────────────────────────┐
│ 📊 Dashboard                       │
├────────────────────────────────────┤
│                                    │
│    📭 Nenhuma resposta ainda       │
│                                    │
│    Crie um formulário e           │
│    compartilhe com respondentes    │
│                                    │
│    [+ Criar Formulário]            │
└────────────────────────────────────┘
```

### 10.2 Dados Insuficientes
```
┌────────────────────────────────────┐
│ ⚠️  Dados Insuficientes            │
├────────────────────────────────────┤
│  Apenas 3 respostas NPS            │
│  Mínimo recomendado: 10            │
│                                    │
│  Continue coletando respostas      │
│  para insights mais precisos       │
└────────────────────────────────────┘
```

### 10.3 Filtro Vazio
```
┌────────────────────────────────────┐
│ 🔍 Nenhum resultado                │
├────────────────────────────────────┤
│  Nenhuma resposta encontrada       │
│  para os filtros selecionados      │
│                                    │
│  Tente ajustar os filtros          │
└────────────────────────────────────┘
```

---

## Tecnologias para Implementação

- **Gráficos**: Recharts (já instalado)
- **Filtros**: React Hook Form + Zustand
- **Cálculos**: Server-side (Prisma aggregations)
- **Cache**: React Query (5min staleTime)
- **Export**: jsPDF + html2canvas

---

## Métricas de Performance

- Carregamento inicial: < 2s
- Atualização de filtro: < 500ms
- Export PDF: < 5s

---

## Acessibilidade

- Cores com contraste WCAG AA
- Tooltips explicativos
- Keyboard navigation
- Screen reader friendly
