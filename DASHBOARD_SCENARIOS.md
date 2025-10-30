# Cenários Reais do Dashboard NPS

## Cenário 1: Empresa com Múltiplas Pesquisas

### Setup:
- 3 formulários ativos:
  1. "Pesquisa Médicos Q1 2024" (120 respostas)
  2. "Satisfação Distribuidores" (45 respostas)
  3. "Feedback Produto X" (30 respostas)

### Como o Dashboard Trata:

```
┌─────────────────────────────────────────────────────────┐
│ Filtros: Período: [Últimos 30 dias] Formulário: [Todos]│
└─────────────────────────────────────────────────────────┘

GLOBAL NPS = +42 (baseado em 195 respostas NPS agregadas)

📊 Breakdown por Formulário:
├─ Pesquisa Médicos Q1 2024:     NPS +52 (120 resp.)
├─ Satisfação Distribuidores:    NPS +38 (45 resp.)
└─ Feedback Produto X:           NPS +15 (30 resp.)

💡 Insight Automático:
   "Pesquisa Médicos tem NPS 37 pontos superior ao Produto X.
    Investigue o que está causando insatisfação com Produto X."
```

---

## Cenário 2: Públicos Distintos (Médicos vs Distribuidores)

### Setup:
- 180 médicos responderam perguntas NPS
- 54 distribuidores responderam perguntas NPS
- Alguns formulários mistos, outros específicos

### Como o Dashboard Trata:

```
┌──────────────────────────────────────────────────────────┐
│ 👥 NPS por Público                                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Médicos          +48  ████████████░░░  (180 resp.)    │
│  Distribuidores   +32  ████████░░░░░░░  (54 resp.)     │
│                                                          │
│  📊 Diferença: +16 pontos                               │
│  💡 Médicos estão significativamente mais satisfeitos   │
└──────────────────────────────────────────────────────────┘

FILTRO APLICADO: [Médicos] apenas
├─ NPS Global: +48
├─ Formulários visíveis: apenas os que têm respostas de médicos
└─ Categorias: apenas especialidades médicas

FILTRO APLICADO: [Distribuidores] apenas
├─ NPS Global: +32
├─ Formulários visíveis: apenas os que têm respostas de distribuidores
└─ Categorias: regiões, empresas
```

---

## Cenário 3: Perguntas de Vários Tipos

### Setup:
Formulário "Pesquisa Completa 2024" tem:
- 1 pergunta NPS (0-10): "Recomendaria?"
- 3 perguntas RATING_1_5: "Qualidade", "Atendimento", "Preço"
- 2 perguntas YES/NO: "Voltaria a comprar?", "Indicaria?"
- 1 pergunta TEXT_LONG: "Sugestões?"
- 1 pergunta MULTIPLE_CHOICE: "Quais produtos usa?"

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ 📊 Métricas Principais                                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  NPS Score          +42  (apenas da pergunta NPS)     │
│  Satisfação Média   4.2  (média das 3 RATING_1_5)     │
│  Recompra           85%  (sim na pergunta YES/NO)     │
│                                                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 📊 Perguntas RATING (1-5)                              │
├────────────────────────────────────────────────────────┤
│  Qualidade         4.5 ⭐⭐⭐⭐⭐                      │
│  Atendimento       4.2 ⭐⭐⭐⭐☆                      │
│  Preço             3.9 ⭐⭐⭐⭐☆                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ✓ Perguntas YES/NO                                     │
├────────────────────────────────────────────────────────┤
│  Voltaria a comprar?    ✓ 85%  ✗ 15%                 │
│  Indicaria?             ✓ 78%  ✗ 22%                 │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ◉ Escolha Múltipla: "Quais produtos usa?"              │
├────────────────────────────────────────────────────────┤
│  Produto A    ████████████████████  65%              │
│  Produto B    ████████████          45%              │
│  Produto C    ████████              28%              │
│  Produto D    ██████                18%              │
└────────────────────────────────────────────────────────┘

💡 Insight: "Preço tem a menor avaliação (3.9/5).
    15% não voltariam a comprar - investigue correlação."
```

**Lógica:**
- **NPS** vem APENAS de perguntas tipo `NPS`
- **Satisfação** vem APENAS de perguntas tipo `RATING_1_5`
- Cada tipo de pergunta tem sua seção separada
- Perguntas TEXT são analisadas separadamente (nuvem de palavras, análise de sentimento)

---

## Cenário 4: Segmentação por Categoria

### Setup:
- Médicos divididos por:
  - Especialidade: Cardiologia, Dermatologia, Ortopedia, etc
  - Região: Norte, Sul, Sudeste, etc
- Distribuidores divididos por:
  - Empresa: Distribuidora X, Y, Z
  - Região: Norte, Sul, Sudeste, etc

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ 🏆 Top 5 Especialidades (Médicos)                      │
├────────────────────────────────────────────────────────┤
│  1. Cardiologia          NPS +65  (25 resp.)          │
│  2. Dermatologia         NPS +58  (18 resp.)          │
│  3. Neurologia           NPS +54  (22 resp.)          │
│  4. Pediatria            NPS +48  (30 resp.)          │
│  5. Clínica Geral        NPS +45  (45 resp.)          │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🏆 Top 5 Regiões (Distribuidores)                      │
├────────────────────────────────────────────────────────┤
│  1. Sudeste              NPS +45  (28 resp.)          │
│  2. Sul                  NPS +38  (15 resp.)          │
│  3. Centro-Oeste         NPS +32  (8 resp.)           │
│  4. Nordeste             NPS +28  (12 resp.)          │
│  5. Norte                NPS +18  (5 resp.)           │
└────────────────────────────────────────────────────────┘

⚠️ ALERTA: Região Norte tem NPS crítico (+18) com apenas 5
    respostas. Aumente amostra ou investigue urgentemente.
```

**Filtro Aplicado:**
```
Especialidade: [Cardiologia]
├─ NPS: +65
├─ Mostra apenas respostas de médicos cardiologistas
├─ Breakdown por pergunta apenas dessas respostas
└─ Tendência temporal apenas cardiologia
```

---

## Cenário 5: Análise Temporal

### Setup:
- Sistema em uso há 6 meses
- Respostas em todos os meses
- Houve mudança de produto no mês 4

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ 📈 Evolução NPS (Jan - Jun 2024)                       │
├────────────────────────────────────────────────────────┤
│  60│                                            •       │
│    │                                                    │
│  40│                            •         •            │
│    │                      •                     ↓ -12  │
│  20│              •                       •             │
│    │        •                                           │
│   0│────┬────┬────┬────┬────┬────                     │
│     Jan  Fev  Mar  Abr  Mai  Jun                      │
│                             ↑                          │
│                          Lançamento                    │
│                          Produto X                     │
└────────────────────────────────────────────────────────┘

⚠️ ALERTA: NPS caiu 12 pontos em Maio após lançamento
    do Produto X. Investigue feedback de Produto X.
```

---

## Cenário 6: Dados Insuficientes

### Setup:
- Apenas 3 respostas NPS no total
- 25 respostas de outros tipos

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ ⚠️  NPS Score Geral                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│         +33                                            │
│   Baseado em apenas 3 respostas                       │
│                                                        │
│   ⚠️ Dados insuficientes para análise confiável       │
│   Mínimo recomendado: 10 respostas                    │
│                                                        │
│   Continue coletando respostas para insights          │
│   estatisticamente significativos.                     │
│                                                        │
└────────────────────────────────────────────────────────┘

✅ Satisfação Média: 4.2/5 (25 respostas RATING_1_5)
   Esta métrica tem dados suficientes!
```

---

## Cenário 7: Filtros Combinados

### Setup:
Usuário aplica:
- Período: Últimos 90 dias
- Formulário: "Pesquisa Médicos Q1"
- Público: Médicos
- Categoria: Cardiologia + Sudeste

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ 🔍 Filtros Ativos                                      │
├────────────────────────────────────────────────────────┤
│  📅 Últimos 90 dias (01/Set - 30/Nov)                 │
│  📋 Pesquisa Médicos Q1                               │
│  👥 Médicos                                            │
│  🏷️  Cardiologia, Sudeste                             │
│  [Limpar Filtros]                                      │
└────────────────────────────────────────────────────────┘

RESULTADO:
├─ 12 respostas encontradas
├─ NPS: +68 (excelente para esse segmento!)
├─ Todos os gráficos mostram APENAS esses 12 respondentes
└─ Comparações só com dados do mesmo período/filtros

💡 Cardiologistas do Sudeste têm NPS +20 pontos acima
   da média geral. Use como benchmark de excelência.
```

---

## Cenário 8: Sem Perguntas NPS

### Setup:
- Formulário tem apenas perguntas RATING, TEXT, YES/NO
- Nenhuma pergunta tipo NPS (0-10)

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ ℹ️  NPS Score                                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Nenhuma pergunta NPS encontrada                      │
│                                                        │
│  Para calcular o NPS, adicione uma pergunta tipo      │
│  NPS (0-10) aos seus formulários.                     │
│                                                        │
│  [+ Criar Pergunta NPS]                               │
│                                                        │
└────────────────────────────────────────────────────────┘

✅ MÉTRICAS DISPONÍVEIS:

┌────────────────────────────────────────────────────────┐
│ ⭐ Satisfação Média                                    │
├────────────────────────────────────────────────────────┤
│  4.3/5.0  (baseado em perguntas RATING_1_5)           │
│  ⭐⭐⭐⭐☆                                            │
└────────────────────────────────────────────────────────┘

Dashboard mostra apenas métricas disponíveis!
```

---

## Cenário 9: Comparação Período Anterior

### Setup:
- Usuário filtra: Últimos 30 dias
- Sistema automaticamente compara com 30 dias anteriores

### Como o Dashboard Trata:

```
┌────────────────────────────────────────────────────────┐
│ 📊 NPS Score Geral                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│         +42                                            │
│   Muito Bom                                            │
│                                                        │
│   ↗️ +5 vs período anterior (+37)                      │
│   📊 Melhoria de 13.5%                                 │
│                                                        │
│   Últimos 30 dias:     234 respostas                  │
│   30 dias anteriores:  198 respostas                  │
│                                                        │
└────────────────────────────────────────────────────────┘

💡 INSIGHT: "Crescimento consistente! NPS subiu em 5
    pontos e volume de respostas aumentou 18%."
```

---

## Cenário 10: Export de Dados

### Como Funciona:

```
┌────────────────────────────────────────────────────────┐
│ Dashboard Actions                                      │
├────────────────────────────────────────────────────────┤
│  📊 [Exportar Dashboard (PDF)]                        │
│  📄 [Exportar Dados Brutos (CSV)]                     │
│  📧 [Agendar Relatório Mensal]                        │
└────────────────────────────────────────────────────────┘

PDF GERADO:
├─ Logo Síntegra
├─ Período: 01/Jan/2024 - 31/Jan/2024
├─ Filtros aplicados
├─ Todos os cards de métricas
├─ Todos os gráficos (renderizados como imagens)
├─ Tabelas de dados
└─ Rodapé: "Gerado em 30/10/2024 às 14:35"

CSV GERADO:
┌─────────────────────────────────────────────────────┐
│ response_id | form | respondent | question | value │
├─────────────────────────────────────────────────────┤
│ abc123      | Q1   | Dr. João   | NPS      | 9     │
│ abc123      | Q1   | Dr. João   | Rating   | 4     │
│ def456      | Q1   | Dr. Maria  | NPS      | 10    │
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

---

## Resumo da Lógica

### 1. Agregação Inteligente
- **NPS**: Só de perguntas tipo `NPS`
- **Satisfação**: Só de perguntas tipo `RATING_1_5`
- **Outros**: Cada tipo tem sua visualização

### 2. Filtros Hierárquicos
```
Período (obrigatório)
  └─ Formulário (opcional)
      └─ Público (opcional)
          └─ Categoria (opcional)
```

### 3. Mínimos para Exibição
- NPS: mínimo 10 respostas (senão mostra aviso)
- Por formulário: mínimo 10 respostas
- Por categoria: mínimo 5 respostas
- Tendência temporal: mínimo 2 períodos

### 4. Performance
- Cache de 5 minutos (React Query)
- Queries otimizadas (Prisma)
- Lazy loading de gráficos
- Skeleton durante load

### 5. Responsividade
- Mobile: cards em coluna única
- Tablet: 2 colunas
- Desktop: 4 colunas
- Gráficos responsivos (Recharts)

---

## Vantagens dessa Abordagem

✅ **Flexível**: Funciona com qualquer combinação de formulários e perguntas
✅ **Inteligente**: Separa métricas por tipo de pergunta
✅ **Segmentável**: Drill-down em qualquer dimensão
✅ **Comparável**: Sempre mostra tendências
✅ **Acionável**: Gera alertas e insights automáticos
✅ **Escalável**: Performance otimizada mesmo com milhares de respostas
✅ **Compreensível**: UI clara mostrando exatamente o que está sendo medido

---

Essa é a proposta! Um dashboard que PENSA pelos dados e apresenta insights acionáveis. 🚀
