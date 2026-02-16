'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import LoadingComponent from '@/components/atoms/Loading/loading'
import useAuth from '@/hooks/useAuth'
import useUser from '@/hooks/useUser'
import { UserRole } from '@/types/entities/user'

interface RouteGuardProps {
  children: React.ReactNode
  accessType: 'public' | 'authenticated' | 'admin'
}

export default function RouteGuard({ children, accessType }: RouteGuardProps) {
  const router = useRouter()
  const { userUid, loading } = useAuth()
  const { currentUser, loading: userLoading } = useUser()
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    // Aguardar até que o estado de autenticação e os dados do usuário sejam carregados
    if (loading.onAuthUserChanged || userLoading.fetchCurrentUser) return

    let allowed = false

    switch (accessType) {
      case 'public':
        allowed = !userUid // Acesso público apenas se não estiver logado
        break
      case 'authenticated':
        allowed = !!userUid && currentUser?.role === UserRole.USER // Acesso apenas se estiver logado
        break
      case 'admin':
        allowed = !!userUid && currentUser?.role === UserRole.ADMIN // Acesso apenas para admin
        break
    }

    setIsAllowed(allowed)

    // Redirecionar se não tiver permissão
    if (!allowed) {
      if (accessType === 'public' && userUid) {
        router.replace('/home') // Logado tentando acessar rota pública
      } else if (accessType === 'authenticated' && !userUid) {
        router.replace('/login') // Não logado tentando acessar rota privada
      } else if (
        accessType === 'admin' &&
        (!userUid || currentUser?.role !== UserRole.ADMIN)
      ) {
        router.replace('/home') // Não admin tentando acessar rota de admin
      } else if (
        accessType === 'authenticated' &&
        userUid &&
        currentUser?.role === UserRole.ADMIN
      ) {
        router.replace('/admin/home')
      }
    }
  }, [userUid, currentUser, loading, userLoading, accessType, router])

  if (loading.onAuthUserChanged || userLoading.fetchCurrentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingComponent />
      </div>
    )
  }

  return isAllowed ? <>{children}</> : null
}
