export type Ticket = {
  client: string
  createdAt: string
  email: string
  id: string
  priority: string
  responsible: string
  status: string
  subject: string
  ticketId: string
  updatedAt: string
}

export type TicketsApiResponse = {
  data: Ticket[]
  total: number
}
