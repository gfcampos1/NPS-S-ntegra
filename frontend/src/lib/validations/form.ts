import { z } from 'zod'

export const createFormSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  type: z.enum(['MEDICOS', 'DISTRIBUIDORES', 'CUSTOM']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED']).default('DRAFT'),
})

export const updateFormSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').optional(),
  description: z.string().optional(),
  type: z.enum(['MEDICOS', 'DISTRIBUIDORES', 'CUSTOM']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PAUSED', 'CLOSED', 'ARCHIVED']).optional(),
})

export const createQuestionSchema = z.object({
  type: z.enum(['NPS', 'RATING_1_5', 'RATING_0_10', 'COMPARISON', 'TEXT_SHORT', 'TEXT_LONG', 'MULTIPLE_CHOICE', 'SINGLE_CHOICE']),
  text: z.string().min(3, 'Pergunta deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number().int().positive(),
  options: z.array(z.string()).optional(),
  conditionalLogic: z.object({
    dependsOn: z.string().optional(),
    showWhen: z.record(z.any()).optional(),
    makeRequired: z.record(z.any()).optional(),
  }).optional(),
})

export type CreateFormInput = z.infer<typeof createFormSchema>
export type UpdateFormInput = z.infer<typeof updateFormSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
