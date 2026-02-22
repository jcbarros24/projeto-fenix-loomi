import { Ticket, TicketsApiResponse } from '@/types/ticket'

const readString = (
  source: Record<string, unknown>,
  keys: string[],
  fallback = '-',
) => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value
  }

  return fallback
}

const extractRawTickets = (response: TicketsApiResponse): unknown[] => {
  if (Array.isArray(response)) return response

  if (!response || typeof response !== 'object') return []

  const res = response as Record<string, unknown>
  const candidates = [
    res.data,
    res.tickets,
    res.items,
    res.results,
    res.content,
  ]

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>
      if (Array.isArray(nested.data)) return nested.data
      if (Array.isArray(nested.items)) return nested.items
      if (Array.isArray(nested.results)) return nested.results
      if (Array.isArray(nested.tickets)) return nested.tickets
    }
  }

  return []
}

export const normalizeTickets = (response: TicketsApiResponse): Ticket[] => {
  const rawTickets = extractRawTickets(response)

  return rawTickets.map((ticket, index) => {
    const source =
      ticket && typeof ticket === 'object'
        ? (ticket as Record<string, unknown>)
        : ({} as Record<string, unknown>)

    const id = readString(source, ['id', 'ticketId'], `ticket-${index}`)
    const ticketId = readString(source, ['ticketId', 'id'], `TK-${index + 1}`)
    const client = readString(source, [
      'client',
      'clientName',
      'customerName',
      'name',
    ])
    const email = readString(source, ['email', 'clientEmail', 'customerEmail'])

    return {
      id,
      ticketId,
      client,
      email,
      priority: readString(source, ['priority', 'prioridade']),
      subject: readString(source, ['subject', 'assunto', 'title']),
      status: readString(source, ['status']),
      createdAt: readString(source, ['createdAt', 'created_at', 'createdDate']),
      updatedAt: readString(source, ['updatedAt', 'updated_at']),
      responsible: readString(source, [
        'responsible',
        'owner',
        'assignee',
        'assignedTo',
      ]),
    }
  })
}
