'use client'

import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/services/api'
import { DashboardResponse } from '@/types/dashboard'
import { MapLocationResponse } from '@/types/map'

export const DASHBOARD_QUERY_KEY = ['dashboard-data'] as const
export const MAP_LOCATIONS_QUERY_KEY = ['map-locations'] as const

export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => apiFetch<DashboardResponse>('/nortus-v1/dashboard'),
  })
}

export function useMapLocations() {
  return useQuery({
    queryKey: MAP_LOCATIONS_QUERY_KEY,
    queryFn: () => apiFetch<MapLocationResponse>('/map/locations'),
  })
}
