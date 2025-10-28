# 📖 Documentação da API - Sistema NPS Síntegra

API RESTful para o sistema de coleta e análise de NPS.

## 🔐 Autenticação

Todas as rotas protegidas requerem autenticação via NextAuth.

```typescript
// Headers necessários
Authorization: Bearer <token>
Content-Type: application/json
```

## 📋 Endpoints

### 🔓 Autenticação

#### POST /api/auth/signin
Login de usuários administradores.

**Request:**
```json
{
  "email": "admin@sintegra.com.br",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx123",
    "email": "admin@sintegra.com.br",
    "name": "Administrador",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 👥 Usuários (Admin)

#### GET /api/users
Lista todos os usuários.

**Query Params:**
- `role` (opcional): SUPER_ADMIN | ADMIN | VIEWER

**Response:**
```json
{
  "users": [
    {
      "id": "clx123",
      "email": "admin@sintegra.com.br",
      "name": "João Silva",
      "role": "ADMIN",
      "createdAt": "2024-01-15T10:00:00Z",
      "lastLogin": "2024-02-20T14:30:00Z"
    }
  ],
  "total": 5
}
```

#### POST /api/users
Criar novo usuário.

**Request:**
```json
{
  "email": "novo@sintegra.com.br",
  "name": "Maria Santos",
  "password": "senha-segura",
  "role": "ADMIN"
}
```

---

### 📝 Formulários

#### GET /api/forms
Lista todos os formulários.

**Query Params:**
- `status`: DRAFT | PUBLISHED | PAUSED | CLOSED
- `type`: MEDICOS | DISTRIBUIDORES | CUSTOM
- `page`: número da página (default: 1)
- `limit`: itens por página (default: 10)

**Response:**
```json
{
  "forms": [
    {
      "id": "clx456",
      "title": "Pesquisa de Satisfação - Médicos",
      "description": "Avaliação trimestral",
      "type": "MEDICOS",
      "status": "PUBLISHED",
      "createdAt": "2024-01-10T00:00:00Z",
      "publishedAt": "2024-01-15T00:00:00Z",
      "_count": {
        "questions": 12,
        "responses": 45
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

#### POST /api/forms
Criar novo formulário.

**Request:**
```json
{
  "title": "Pesquisa Q1 2024",
  "description": "Avaliação primeiro trimestre",
  "type": "MEDICOS",
  "welcomeTitle": "Obrigado por participar!",
  "welcomeText": "Sua opinião é muito importante...",
  "thankYouTitle": "Pesquisa concluída!",
  "thankYouText": "Agradecemos sua participação.",
  "expiresAt": "2024-03-31T23:59:59Z"
}
```

#### GET /api/forms/:id
Obter detalhes de um formulário específico.

**Response:**
```json
{
  "id": "clx456",
  "title": "Pesquisa de Satisfação - Médicos",
  "type": "MEDICOS",
  "status": "PUBLISHED",
  "questions": [
    {
      "id": "clx789",
      "text": "Como você avalia a qualidade dos produtos?",
      "type": "RATING_1_5",
      "order": 1,
      "required": true,
      "scaleMin": 1,
      "scaleMax": 5,
      "scaleLabels": {
        "1": "Péssima",
        "2": "Ruim",
        "3": "Regular",
        "4": "Boa",
        "5": "Excelente"
      }
    }
  ],
  "stats": {
    "totalResponses": 45,
    "completedResponses": 42,
    "inProgressResponses": 3,
    "averageCompletionTime": "4.5 min",
    "responseRate": 85
  }
}
```

#### PATCH /api/forms/:id
Atualizar formulário.

**Request:**
```json
{
  "status": "PUBLISHED",
  "expiresAt": "2024-06-30T23:59:59Z"
}
```

#### DELETE /api/forms/:id
Deletar formulário (soft delete).

---

### ❓ Perguntas

#### POST /api/forms/:formId/questions
Adicionar pergunta ao formulário.

**Request:**
```json
{
  "text": "Como você avalia a qualidade dos produtos?",
  "description": "Considere a eficácia e durabilidade",
  "type": "RATING_1_5",
  "order": 1,
  "required": true,
  "scaleMin": 1,
  "scaleMax": 5,
  "scaleLabels": {
    "1": "Péssima",
    "2": "Ruim",
    "3": "Regular",
    "4": "Boa",
    "5": "Excelente"
  },
  "conditionalLogic": {
    "makeRequired": {
      "dependsOn": "clx789",
      "condition": "<=",
      "value": 3
    }
  }
}
```

#### PATCH /api/questions/:id
Atualizar pergunta.

#### DELETE /api/questions/:id
Deletar pergunta.

---

### 👨‍⚕️ Respondentes

#### GET /api/respondents
Lista respondentes.

**Query Params:**
- `type`: MEDICO | DISTRIBUIDOR
- `category`: string
- `search`: busca por nome/email

**Response:**
```json
{
  "respondents": [
    {
      "id": "clx999",
      "name": "Dr. Carlos Mendes",
      "email": "carlos@hospital.com.br",
      "phone": "+5511999999999",
      "type": "MEDICO",
      "category": "Cardiologia",
      "specialty": "Hemodinâmica",
      "region": "São Paulo",
      "createdAt": "2024-01-05T00:00:00Z"
    }
  ],
  "total": 150
}
```

#### POST /api/respondents
Cadastrar respondente.

**Request:**
```json
{
  "name": "Dr. Ana Paula",
  "email": "ana@clinica.com.br",
  "phone": "+5511888888888",
  "type": "MEDICO",
  "category": "Cardiologia",
  "specialty": "Eletrofisiologia",
  "region": "Rio de Janeiro"
}
```

#### POST /api/respondents/import
Importação em massa via CSV.

**Request:**
```
Content-Type: multipart/form-data

file: respondentes.csv
```

**Formato CSV:**
```csv
nome,email,telefone,tipo,categoria,especialidade,regiao
Dr. João,joao@hospital.com,11999999999,MEDICO,Cardiologia,Hemodinâmica,SP
```

---

### 📊 Respostas

#### GET /api/responses
Lista respostas.

**Query Params:**
- `formId`: ID do formulário
- `status`: IN_PROGRESS | COMPLETED | ABANDONED
- `startDate`: data início (ISO)
- `endDate`: data fim (ISO)

**Response:**
```json
{
  "responses": [
    {
      "id": "clx111",
      "formId": "clx456",
      "respondent": {
        "name": "Dr. Carlos Mendes",
        "email": "carlos@hospital.com.br"
      },
      "status": "COMPLETED",
      "progress": 100,
      "startedAt": "2024-02-10T10:00:00Z",
      "completedAt": "2024-02-10T10:05:30Z",
      "deviceType": "mobile"
    }
  ],
  "total": 42
}
```

#### GET /api/responses/:id
Detalhes de uma resposta específica.

**Response:**
```json
{
  "id": "clx111",
  "form": {
    "title": "Pesquisa Q1 2024"
  },
  "respondent": {
    "name": "Dr. Carlos Mendes"
  },
  "answers": [
    {
      "question": {
        "text": "Como você avalia a qualidade?",
        "type": "RATING_1_5"
      },
      "numericValue": 5
    },
    {
      "question": {
        "text": "Comentários",
        "type": "TEXT_LONG"
      },
      "textValue": "Excelente qualidade, produtos confiáveis."
    }
  ],
  "completedAt": "2024-02-10T10:05:30Z"
}
```

---

### 🔗 Links de Resposta

#### POST /api/forms/:formId/distribute
Gerar e enviar links únicos.

**Request:**
```json
{
  "respondentIds": ["clx999", "clx888"],
  "sendEmail": true,
  "sendWhatsApp": false,
  "emailTemplate": "default",
  "scheduledFor": null
}
```

**Response:**
```json
{
  "links": [
    {
      "respondentId": "clx999",
      "uniqueToken": "abc123xyz",
      "link": "https://nps.sintegra.com.br/r/abc123xyz",
      "emailSent": true,
      "expiresAt": "2024-03-15T23:59:59Z"
    }
  ],
  "sent": 2,
  "failed": 0
}
```

---

### 📈 Analytics e NPS

#### GET /api/analytics/nps
Calcular NPS de um formulário.

**Query Params:**
- `formId`: ID do formulário (obrigatório)
- `startDate`: data início
- `endDate`: data fim
- `category`: filtro por categoria

**Response:**
```json
{
  "nps": 52,
  "breakdown": {
    "promoters": 28,
    "passives": 12,
    "detractors": 5,
    "total": 45
  },
  "percentages": {
    "promoters": 62.2,
    "passives": 26.7,
    "detractors": 11.1
  },
  "trend": {
    "previousPeriod": 48,
    "change": +4,
    "changePercent": 8.3
  }
}
```

#### GET /api/analytics/ratings
Análise de ratings por pergunta.

**Response:**
```json
{
  "questions": [
    {
      "id": "clx789",
      "text": "Qualidade dos produtos",
      "average": 4.2,
      "distribution": {
        "1": 2,
        "2": 3,
        "3": 8,
        "4": 15,
        "5": 17
      },
      "total": 45
    }
  ]
}
```

#### GET /api/analytics/comments
Comentários com filtros.

**Query Params:**
- `formId`: ID do formulário
- `minRating`: filtrar por rating mínimo
- `maxRating`: filtrar por rating máximo
- `search`: busca textual

**Response:**
```json
{
  "comments": [
    {
      "id": "clx222",
      "question": "Comentários sobre qualidade",
      "answer": "Produtos excelentes, ótima durabilidade",
      "rating": 5,
      "respondent": "Dr. Carlos Mendes",
      "date": "2024-02-10T10:05:00Z"
    }
  ],
  "total": 38
}
```

---

### 📄 Relatórios

#### POST /api/reports
Gerar relatório.

**Request:**
```json
{
  "title": "Relatório Q1 2024",
  "formId": "clx456",
  "filters": {
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-03-31"
    },
    "respondentType": "MEDICO",
    "category": "Cardiologia"
  },
  "format": "PDF"
}
```

**Response:**
```json
{
  "id": "clx333",
  "title": "Relatório Q1 2024",
  "status": "GENERATING",
  "pdfUrl": null,
  "estimatedTime": "2 minutos"
}
```

#### GET /api/reports/:id
Status e download do relatório.

**Response:**
```json
{
  "id": "clx333",
  "title": "Relatório Q1 2024",
  "status": "READY",
  "pdfUrl": "https://storage.com/reports/clx333.pdf",
  "csvUrl": "https://storage.com/reports/clx333.csv",
  "generatedAt": "2024-02-15T11:30:00Z",
  "summary": {
    "nps": 52,
    "totalResponses": 45,
    "averageRating": 4.2
  }
}
```

---

## 🔔 Webhooks

### Configurar Webhook

```json
POST /api/webhooks

{
  "url": "https://seu-sistema.com/webhook",
  "events": ["response.completed", "form.published"],
  "secret": "sua-chave-secreta"
}
```

### Eventos Disponíveis

- `response.completed`: Resposta finalizada
- `response.abandoned`: Resposta abandonada
- `form.published`: Formulário publicado
- `nps.threshold`: NPS abaixo da meta

### Payload do Webhook

```json
{
  "event": "response.completed",
  "timestamp": "2024-02-15T10:00:00Z",
  "data": {
    "responseId": "clx111",
    "formId": "clx456",
    "nps": 9
  },
  "signature": "sha256=..."
}
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 422 | Unprocessable Entity - Validação falhou |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

**Exemplo de Erro:**
```json
{
  "error": "Validation Error",
  "message": "Email já cadastrado",
  "statusCode": 422,
  "fields": {
    "email": "Este email já está em uso"
  }
}
```

---

## 🚦 Rate Limiting

- **Limite**: 100 requisições por minuto
- **Headers de resposta**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1708000000
  ```

---

**Documentação completa da API REST do Sistema NPS Síntegra**
