'use client'

import { useEffect } from 'react'

import { useAuthStore } from '@/stores/auth.store'

export default function AuthHydrator() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession)

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  return null
}
