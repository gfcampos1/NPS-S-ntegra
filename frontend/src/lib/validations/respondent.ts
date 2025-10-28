import { z } from 'zod'

export const createRespondentSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  type: z.enum(['MEDICO', 'DISTRIBUIDOR']),
  category: z.string().optional(),
  specialty: z.string().optional(),
  crm: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const updateRespondentSchema = createRespondentSchema.partial()

export const importRespondentsSchema = z.object({
  respondents: z.array(createRespondentSchema),
})

export type CreateRespondentInput = z.infer<typeof createRespondentSchema>
export type UpdateRespondentInput = z.infer<typeof updateRespondentSchema>
export type ImportRespondentsInput = z.infer<typeof importRespondentsSchema>
