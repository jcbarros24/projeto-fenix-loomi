import { z } from 'zod'

const priorityEnum = z.enum(['Urgente', 'Média', 'Baixa', 'Alta'], {
  errorMap: () => ({ message: 'Selecione uma prioridade válida' }),
})

export const CreateTicketSchema = z.object({
  priority: priorityEnum,
  client: z.string().min(1, 'Nome do cliente é obrigatório'),
  email: z.string().email('E-mail inválido'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  responsible: z.string().min(1, 'Responsável é obrigatório'),
})

export type CreateTicketFormInput = z.input<typeof CreateTicketSchema>
export type CreateTicketFormData = z.output<typeof CreateTicketSchema>
export type CreateTicketPayload = CreateTicketFormData & {
  ticketId: string
  status: 'Aberto'
}
