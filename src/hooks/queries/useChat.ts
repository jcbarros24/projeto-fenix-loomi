'use client'

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import { ChatApiResponse } from '@/types/chat'

export const CHAT_QUERY_KEY = ['chat-data'] as const

export function useChat() {
  return useQuery({
    queryKey: CHAT_QUERY_KEY,
    queryFn: () => apiFetch<ChatApiResponse>('/nortus-v1/chat'),
  })
}
