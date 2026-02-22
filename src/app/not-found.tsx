'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getCookie } from '@/lib'

const ACCESS_TOKEN_KEY = 'access_token'
const REDIRECT_DELAY_MS = 5000

export default function NotFoundPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1000)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          const token = getCookie(ACCESS_TOKEN_KEY)
          router.replace(token ? '/dashboard' : '/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0b0d1c] px-6">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-semibold text-white">
          404 - Página não encontrada
        </h1>
        <p className="mb-6 text-sm text-slate-400">
          Não encontramos a página que você tentou acessar.
        </p>
        <p className="text-xs text-slate-500">
          Redirecionando em {countdown}s...
        </p>
      </div>
    </div>
  )
}
