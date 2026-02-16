/**
 * 🔐 PROVIDER DE AUTENTICAÇÃO
 *
 * Gerencia estado global de autenticação da aplicação
 * - Estado do usuário logado
 * - Operações de auth (login, logout, cadastro, etc.)
 * - Loading states para UI
 * - Verificação automática de email
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { errorToast, successToast } from '@/hooks/useAppToast'
import {
  createUserWithEmailAndPasswordLocal,
  deleteOwnAccount,
  logout,
  recoverPassword,
  signInWithEmailAndPasswordLocal,
  waitForUser,
} from '@/services/firebase/auth'
import { createNewUserDoc, deleteUserDoc, getUserDoc } from '@/services/user'
import { UserRole } from '@/types/entities/user'
import SignUpForm from '@/validations/signUp'

import AuthContext from './context'

// ====================================================================
// 📋 TIPOS E INTERFACES
// ====================================================================

interface Props {
  children: React.ReactNode
}

type SignUpFormValidationData = z.infer<typeof SignUpForm>

// ====================================================================
// 🚀 COMPONENTE PROVIDER
// ====================================================================

const AuthProvider = ({ children }: Props) => {
  // ====================================================================
  // 📊 ESTADO INICIAL
  // ====================================================================

  /**
   * Estados de loading para cada operação
   */
  const initialLoadingObject = {
    onAuthUserChanged: true, // Carregamento inicial do auth state
    loginWithInternalService: false, // Login em progresso
    createUserWithInternalService: false, // Cadastro em progresso
    forgotPassword: false, // Recuperação de senha
    updatePassword: false, // Atualização de senha
    deleteUser: false, // Exclusão de conta
    logout: false, // Logout em progresso
  }

  const [userUid, setUserUid] = useState<string>('')
  const [loading, setLoading] = useState(initialLoadingObject)
  const router = useRouter()

  // ====================================================================
  // 🔄 LISTENER DE ESTADO DE AUTH
  // ====================================================================

  /**
   * Monitora mudanças no estado de autenticação
   * - Verifica email verificado automaticamente
   * - Atualiza UID do usuário
   * - Controla loading inicial
   */
  useEffect(() => {
    const unsubscribe = waitForUser((user) => {
      if (user) {
        // 📧 Força logout se email não verificado
        if (!user.emailVerified) {
          logout()
          setUserUid('')
          setLoading((prev) => ({ ...prev, onAuthUserChanged: false }))
          return
        }
        setUserUid(user.uid)
        sessionStorage.setItem('userUid', user.uid)
      } else {
        setUserUid('')
        sessionStorage.removeItem('userUid')
      }
      setLoading((prev) => ({ ...prev, onAuthUserChanged: false }))
    })

    const storedUserUid = sessionStorage.getItem('userUid')
    if (storedUserUid) {
      setUserUid(storedUserUid)
    }

    return () => unsubscribe()
  }, [])

  // ====================================================================
  // 🔑 OPERAÇÕES DE AUTENTICAÇÃO
  // ====================================================================

  /**
   * Login com email e senha
   * - Valida email verificado
   * - Mostra toasts de feedback
   * - Atualiza estado automaticamente
   */
  const loginWithInternalService = async (email: string, password: string) => {
    setLoading((prev) => ({ ...prev, loginWithInternalService: true }))

    const { error, user } = await signInWithEmailAndPasswordLocal(
      email,
      password,
    )

    // 📧 Verifica email verificado
    if (
      user &&
      // Caso não seja necessário verificação de email, esta linha pode ser removida
      !user.emailVerified
    ) {
      // Caso não seja necessário verificação de email, esta linha pode ser removida
      errorToast('Por favor verifique seu email')
      await logout()
      setUserUid('')
      setLoading((prev) => ({ ...prev, loginWithInternalService: false }))
      return
    }

    if (user) {
      successToast('Bem vindo de volta!')
      setUserUid(user.uid)

      // 🔧 NOVO: Verificar role do usuário antes de redirecionar
      try {
        // Buscar dados do usuário no Firestore
        const { user: userData, error: userError } = await getUserDoc(user.uid)

        if (userError) {
          router.push('/cadastro') // Fallback para home
          return
        }

        // Redirecionar baseado na role
        if (userData?.role === UserRole.ADMIN) {
          router.push('/admin/home')
        } else {
          router.push('/home')
        }
      } catch (error) {
        console.error('Erro ao verificar role:', error)
        router.push('/home') // Fallback para home
      }
    } else {
      setUserUid('')
      errorToast(error)
    }

    setLoading((prev) => ({ ...prev, loginWithInternalService: false }))
  }

  /**
   * Cadastro de novo usuário
   * - Cria conta no Auth
   * - Cria documento no Firestore
   * - Envia verificação de email
   * - Redireciona para login
   */
  // Adicione esta versão temporária para debug:
  const createUserWithInternalService = async ({
    email,
    password,
    name,
  }: Omit<SignUpFormValidationData, 'confirmPassword'>) => {
    setLoading((prev) => ({ ...prev, createUserWithInternalService: true }))

    try {
      const authResult = await createUserWithEmailAndPasswordLocal(
        email,
        password,
      )

      if (authResult.error) {
        throw new Error(authResult.error)
      }

      if (authResult.user) {
        const docResult = await createNewUserDoc({
          uid: authResult.user.uid,
          email,
          name,
          role: UserRole.USER,
        })

        if (docResult.error) {
          errorToast('Erro no Firestore: ' + docResult.error)
        } else {
          successToast('Conta criada com sucesso!')
          router.push('/login')
        }
      }
    } catch (error) {
      errorToast('Erro: ' + (error as Error).message)
    } finally {
      setLoading((prev) => ({ ...prev, createUserWithInternalService: false }))
    }
  }

  /**
   * Recuperação de senha
   * - Envia email de reset
   * - Sempre mostra sucesso por segurança
   */
  const forgotPassword = async (email: string) => {
    setLoading((prev) => ({ ...prev, forgotPassword: true }))

    const { error } = await recoverPassword(email)

    if (!error) {
      successToast('Email de recuperação enviado')
    } else {
      errorToast(error)
    }

    setLoading((prev) => ({ ...prev, forgotPassword: false }))
  }

  /**
   * Exclusão de conta (IRREVERSÍVEL)
   * - Deleta documento Firestore
   * - Deleta conta Auth
   * - Limpa estado local
   * - Redireciona para home
   */
  const deleteUser = async () => {
    setLoading((prev) => ({ ...prev, deleteUser: true }))

    try {
      // 🗄️ Deletar documento do Firestore primeiro
      const { error: firestoreError } = await deleteUserDoc(userUid)
      if (firestoreError) {
        console.error('Erro ao deletar documento:', firestoreError)
      }

      // 🔐 Deletar conta de autenticação
      const { error: authError } = await deleteOwnAccount()
      if (authError) {
        errorToast(authError)
      } else {
        successToast('Conta deletada com sucesso')
        setUserUid('')
        router.push('/')
      }
    } catch {
      errorToast('Erro ao deletar conta')
    }

    setLoading((prev) => ({ ...prev, deleteUser: false }))
  }

  /**
   * Logout completo
   * - Faz logout no Firebase
   * - Limpa estado local
   * - Redireciona para login
   */
  const logoutUser = async () => {
    setLoading((prev) => ({ ...prev, logout: true }))

    await logout()
    setUserUid('')
    router.push('/login')

    setLoading((prev) => ({ ...prev, logout: false }))
  }

  /**
   * Sincronização manual do estado
   * - Força verificação do auth state
   * - Útil após operações específicas
   */
  const waitForUserSync = async () => {
    setLoading((prev) => ({ ...prev, onAuthUserChanged: true }))

    await waitForUser((user) => {
      if (user && !user.emailVerified) {
        logout()
        setUserUid('')
      }
    })

    setLoading((prev) => ({ ...prev, onAuthUserChanged: false }))
  }

  // ====================================================================
  // 🎯 PROVIDER RENDER
  // ====================================================================

  return (
    <AuthContext.Provider
      value={{
        userUid,
        loading,
        forgotPassword,
        loginWithInternalService,
        logoutUser,
        setUserUid,
        deleteUser,
        createUserWithInternalService,
        waitForUserSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
