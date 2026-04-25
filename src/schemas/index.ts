import { z } from 'zod'

export const candidateSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  contact: z.string().min(8, 'Contato obrigatório'),
  job_position: z.string().min(1, 'Selecione uma função'),
  work_location_id: z.string().uuid('Selecione um local de atuação'),
  test_location_id: z.string().optional().nullable(),
  test_date: z.string().optional().nullable(),
  current_status: z.enum(['Sim', 'Não']),
  test_result: z.enum(['Aprovado', 'Reprovado', 'Aguardando']),
  should_hire: z.boolean(),
  notes: z.string().optional().nullable(),
})

export type CandidateFormValues = z.infer<typeof candidateSchema>

export const locationSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const testLocationSchema = locationSchema.extend({
  capacity: z.number().min(1, 'Capacidade mínima é 1').optional().nullable(),
  responsible: z.string().optional().nullable(),
})
export const vacancySchema = z.object({
  title: z.string().min(3, 'Cargo obrigatório'),
  period: z.enum(['Plantão Noturno', 'Plantão Diurno', 'Diarista']),
  status: z.enum(['Confirmado', 'Outros']),
  quantity: z.number().min(1, 'Mínimo de 1 vaga'),
  status_reason: z.string().optional().nullable(),
})

export type VacancyFormValues = z.infer<typeof vacancySchema>
