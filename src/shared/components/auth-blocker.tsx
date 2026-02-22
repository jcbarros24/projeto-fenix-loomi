'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getCookie } from '@/lib/cookies'

const ACCESS_TOKEN_KEY = 'access_token'

type AuthBlockerProps = {
  children: React.ReactNode
}

export function AuthBlocker({ children }: AuthBlockerProps) {
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = getCookie(ACCESS_TOKEN_KEY)
    if (!token) {
      router.replace('/login')
      return
    }
    setIsReady(true)
  }, [router])

  if (!isReady) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b0d1c]"
        aria-live="polite"
        aria-busy="true"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
      </div>
    )
  }

  return <>{children}</>
}
