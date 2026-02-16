/**
 * 👥 PROVIDER DE USUÁRIOS
 *
 * Gerencia dados específicos dos usuários da aplicação
 * - Dados do usuário atual
 * - Lista de todos os usuários (admin)
 * - Operações CRUD de usuários
 * - Sincronização com AuthProvider
 */

'use client'

import { useState, useEffect } from 'react'

import { errorToast, successToast } from '@/hooks/useAppToast'
import useAuth from '@/hooks/useAuth'
import { getUserDoc, getAllUsers, updateUserDoc } from '@/services/user'
import { UserEntity, UserRole } from '@/types/entities/user'

import UserContext from './context'

// ====================================================================
// 📋 TIPOS
// ====================================================================

interface Props {
  children: React.ReactNode
}

// ====================================================================
// 🚀 COMPONENTE PROVIDER
// ====================================================================

const UserProvider = ({ children }: Props) => {
  const { userUid } = useAuth()

  // ====================================================================
  // 📊 ESTADO INICIAL
  // ====================================================================

  /**
   * Estados de loading para cada operação
   */
  const initialLoadingObject = {
    fetchCurrentUser: false, // Carregando dados do usuário atual
    updateUser: false, // Atualizando perfil
    getAllUsers: false, // Carregando lista de usuários
    updateUserRole: false, // Atualizando role de usuário
  }

  const [currentUser, setCurrentUser] = useState<UserEntity | null>(null)
  const [allUsers, setAllUsers] = useState<UserEntity[] | null>(null)
  const [loading, setLoading] = useState(initialLoadingObject)

  // ====================================================================
  // 🔄 SINCRONIZAÇÃO COM AUTH
  // ====================================================================

  /**
   * Carrega dados do usuário quando UID muda
   * - Login: carrega dados
   * - Logout: limpa dados
   */
  useEffect(() => {
    if (userUid && !currentUser) {
      fetchCurrentUser()
    } else {
      setCurrentUser(null)
    }
  }, [userUid])

  // ====================================================================
  // 📖 OPERAÇÕES DE LEITURA
  // ====================================================================

  /**
   * Carrega dados do usuário atual do Firestore
   */
  const fetchCurrentUser = async () => {
    if (!userUid) return

    setLoading((prev) => ({ ...prev, fetchCurrentUser: true }))

    try {
      const { user, error } = await getUserDoc(userUid)

      if (error || !user || Object.keys(user).length === 0) {
        setCurrentUser(null)

        errorToast(error)
      } else {
        setCurrentUser(user)
      }
    } catch (e) {
      errorToast('Erro ao buscar dados do usuário')
      console.error('[UserProvider] Erro ao buscar usuário:', e)
    }

    setLoading((prev) => ({ ...prev, fetchCurrentUser: false }))
  }

  /**
   * Carrega todos os usuários (para admin)
   */
  const fetchAllUsers = async () => {
    setLoading((prev) => ({ ...prev, getAllUsers: true }))

    try {
      const { users, error } = await getAllUsers()

      if (error) {
        errorToast(error)
      } else if (users && users.length === 0) {
        errorToast('Nenhum usuário encontrado')
      } else {
        setAllUsers(users || [])
      }
    } catch {
      errorToast('Erro ao buscar usuários')
    }

    setLoading((prev) => ({ ...prev, getAllUsers: false }))
  }

  // ====================================================================
  // ✏️ OPERAÇÕES DE ATUALIZAÇÃO
  // ====================================================================

  /**
   * Atualiza dados do usuário atual
   * - Salva no Firestore
   * - Atualiza estado local
   */
  const updateUser = async (updates: {
    email?: string
    name?: string
    role?: UserRole
  }) => {
    if (!userUid) {
      errorToast('Usuário não encontrado')
      return
    }

    setLoading((prev) => ({ ...prev, updateUser: true }))

    try {
      const { error } = await updateUserDoc(userUid, updates)

      if (error) {
        errorToast(error)
      } else {
        successToast('Perfil atualizado com sucesso')

        // 🔄 Atualizar estado local otimisticamente
        if (currentUser) {
          setCurrentUser({
            ...currentUser,
            ...updates,
            updatedAt: new Date(),
          })
        }
      }
    } catch {
      errorToast('Erro ao atualizar perfil')
    }

    setLoading((prev) => ({ ...prev, updateUser: false }))
  }

  /**
   * Atualiza role de usuário específico (admin only)
   * - Atualiza no Firestore
   * - Atualiza nas listas locais
   */
  const updateUserRole = async (uid: string, role: UserRole) => {
    setLoading((prev) => ({ ...prev, updateUserRole: true }))

    try {
      const { error } = await updateUserDoc(uid, { role })

      if (error) {
        errorToast(error)
      } else {
        successToast(`Role atualizado para ${role}`)

        // 🔄 Atualizar na lista de usuários
        if (allUsers) {
          setAllUsers(
            allUsers.map((user) =>
              user.uid === uid
                ? { ...user, role, updatedAt: new Date() }
                : user,
            ),
          )
        }

        // 🔄 Atualizar usuário atual se for o mesmo
        if (currentUser?.uid === uid) {
          setCurrentUser({
            ...currentUser,
            role,
            updatedAt: new Date(),
          })
        }
      }
    } catch {
      errorToast('Erro ao atualizar role')
    }

    setLoading((prev) => ({ ...prev, updateUserRole: false }))
  }

  // ====================================================================
  // 🔧 UTILITÁRIOS
  // ====================================================================

  /**
   * Força reload dos dados do usuário atual
   */
  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  // ====================================================================
  // 🎯 PROVIDER RENDER
  // ====================================================================

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        loading,
        updateUser,
        fetchCurrentUser,
        fetchAllUsers,
        updateUserRole,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export default UserProvider
