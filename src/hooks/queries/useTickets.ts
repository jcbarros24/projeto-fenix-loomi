'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import { TicketsApiResponse } from '@/types/ticket'

export const TICKETS_QUERY_KEY = ['tickets'] as const

export function useTickets(options?: {
  placeholderData?: typeof keepPreviousData
}) {
  return useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: () => apiFetch<TicketsApiResponse>('/tickets'),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: options?.placeholderData,
  })
}

export function useTicketsForModal(enabled: boolean) {
  return useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: () => apiFetch<TicketsApiResponse>('/tickets'),
    enabled,
  })
}

type CreateTicketPayload = {
  ticketId: string
  priority: string
  client: string
  email: string
  subject: string
  status: string
  responsible: string
}

type UseCreateTicketOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useCreateTicket(options?: UseCreateTicketOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      return apiFetch('/tickets', { method: 'POST', body: payload })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY })
      options?.onSuccess?.()
    },
    onError: (error) => {
      options?.onError?.(error instanceof Error ? error : new Error(String(error)))
    },
  })
}
