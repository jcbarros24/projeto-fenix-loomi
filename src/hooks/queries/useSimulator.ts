'use client'

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import { SimulatorApiResponse } from '@/types/simulator'

export const SIMULATOR_QUERY_KEY = ['simulator-planos'] as const

export function useSimulatorPlanos() {
  return useQuery({
    queryKey: SIMULATOR_QUERY_KEY,
    queryFn: () =>
      apiFetch<SimulatorApiResponse>('/nortus-v1/simulador-planos'),
  })
}
