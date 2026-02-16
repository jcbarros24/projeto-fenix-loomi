/**
 * 🔐 SERVICE DE AUTENTICAÇÃO FIREBASE
 *
 * Este arquivo centraliza todas as operações de autenticação da aplicação.
 *
 * Funcionalidades:
 * - Cadastro e login de usuários
 * - Recuperação de senha
 * - Verificação de email
 * - Gerenciamento de sessão
 * - Atualização de senha
 * - Exclusão de conta
 *
 * Padrões utilizados:
 * - Tratamento consistente de erros
 * - Interfaces padronizadas para retorno
 * - Funções puras e reutilizáveis
 * - Type safety completo
 */

import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword as updatePasswordFirebase,
  User,
} from 'firebase/auth'

import firebaseApp from '@/config/firebase/firebase'

// ====================================================================
// 🔧 CONFIGURAÇÃO E INSTÂNCIAS
// ====================================================================

/**
 * Instância do Firebase Authentication
 * Conectada à configuração principal do Firebase
 */
const auth = getAuth(firebaseApp)

// ====================================================================
// 📋 INTERFACES DE TIPOS
// ====================================================================

/**
 * Padrão de retorno para operações que retornam usuário
 *
 * Garante consistência nas respostas de autenticação
 */
interface AuthResult {
  user: User | null // Usuário autenticado ou null se falhou
  error: string | null // Mensagem de erro ou null se sucesso
}

/**
 * Padrão de retorno para operações que só indicam sucesso/erro
 *
 * Usado em operações como logout, delete, update, etc.
 */
interface ErrorResult {
  error: string | null // Mensagem de erro ou null se sucesso
}

// ====================================================================
// 👥 GERENCIAMENTO DE ESTADO DO USUÁRIO
// ====================================================================

/**
 * 🔄 Monitora mudanças no estado de autenticação
 *
 * IMPORTANTE: Esta função retorna um unsubscribe function
 * Sempre chame o retorno para limpar o listener
 *
 * @param callback - Função chamada quando estado muda
 * @returns Função para cancelar o listener
 *
 * Uso típico:
 * ```typescript
 * useEffect(() => {
 *   const unsubscribe = waitForUser((user) => {
 *     setCurrentUser(user)
 *   })
 *   return () => unsubscribe() // Cleanup
 * }, [])
 * ```
 */
export const waitForUser = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback)
}

/**
 * 👤 Obtém o usuário atual de forma síncrona
 *
 * @returns Usuário atual ou null se não autenticado
 *
 * NOTA: Pode retornar null mesmo se usuário estiver logado
 * se o estado ainda não foi carregado. Use waitForUser para
 * aguardar o carregamento completo.
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

/**
 * ✅ Verifica se existe usuário logado
 *
 * @returns true se usuário está logado, false caso contrário
 */
export const isUserLoggedIn = (): boolean => {
  return !!auth.currentUser
}

/**
 * 📧 Verifica se o email do usuário foi verificado
 *
 * @returns true se email verificado, false caso contrário
 *
 * IMPORTANTE: Retorna false se não há usuário logado
 */
// Caso não seja necessário verificação de email, esta linha pode ser removida
export const isEmailVerified = (): boolean => {
  return auth.currentUser?.emailVerified ?? false
}

// ====================================================================
// 🚪 OPERAÇÕES DE AUTENTICAÇÃO
// ====================================================================

/**
 * 📝 Cria nova conta de usuário com email e senha
 *
 * Fluxo completo:
 * 1. Cria a conta no Firebase Auth
 * 2. Envia email de verificação automaticamente
 * 3. Retorna o usuário criado
 *
 * @param email - Email do novo usuário
 * @param password - Senha do novo usuário
 * @returns Promise com resultado da operação
 *
 * NOTA: O usuário precisa verificar o email antes de fazer login
 */
export const createUserWithEmailAndPasswordLocal = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    // 🔥 Cria conta no Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, email, password)

    // Caso não seja necessário verificação de email, esta linha pode ser removida
    // 📧 Envia email de verificação automaticamente
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL
    if (loginUrl) {
      await sendEmailVerification(userCred.user, {
        url: loginUrl, // URL para onde redirecionar após verificação
      })
    }

    return {
      user: userCred.user,
      error: null,
    }
  } catch (error: unknown) {
    // 🚨 Tratamento consistente de erros
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Erro ao criar conta',
    }
  }
}

/**
 * 🔑 Faz login com email e senha
 *
 * @param email - Email do usuário
 * @param password - Senha do usuário
 * @returns Promise com resultado da operação
 *
 * NOTA: Verificar emailVerified após login se necessário
 */
export const signInWithEmailAndPasswordLocal = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password)
    return {
      user: userCred.user,
      error: null,
    }
  } catch (error: unknown) {
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Erro ao fazer login',
    }
  }
}

/**
 * 🚪 Faz logout do usuário atual
 *
 * IMPORTANTE: Esta operação sempre sucede
 * Não há necessidade de tratamento de erro
 */
export const logout = async (): Promise<void> => {
  await signOut(auth)
}

// ====================================================================
// 🔧 OPERAÇÕES DE RECUPERAÇÃO E VERIFICAÇÃO
// ====================================================================

/**
 * 🔄 Envia email de recuperação de senha
 *
 * @param email - Email para enviar recuperação
 * @returns Promise com resultado da operação
 *
 * SEGURANÇA: Firebase não revela se email existe ou não
 * Sempre retorna sucesso para emails válidos
 */
export const recoverPassword = async (email: string): Promise<ErrorResult> => {
  try {
    // 🏠 URL para redirecionamento após reset
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || window.location.origin

    await sendPasswordResetEmail(auth, email, {
      url: loginUrl,
    })
    return { error: null }
  } catch (error: unknown) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Erro ao enviar email de recuperação',
    }
  }
}

/**
 * 📧 Reenvia email de verificação para usuário atual
 *
 * @returns Promise com resultado da operação
 *
 * REQUISITO: Usuário deve estar logado
 */
// Caso não seja necessário verificação de email, esta linha pode ser removida
export const resendEmailVerification = async (): Promise<ErrorResult> => {
  if (!auth.currentUser) {
    return { error: 'Nenhum usuário logado' }
  }

  try {
    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || window.location.origin

    await sendEmailVerification(auth.currentUser, {
      url: loginUrl,
    })
    return { error: null }
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : 'Erro ao reenviar email',
    }
  }
}

// ====================================================================
// ⚙️ OPERAÇÕES DE CONTA
// ====================================================================

/**
 * 🔑 Atualiza senha do usuário atual
 *
 * @param password - Nova senha
 * @returns Promise com resultado da operação
 *
 * REQUISITOS:
 * - Usuário deve estar logado
 * - Login deve ser recente (pode exigir re-autenticação)
 */
export const updatePassword = async (
  password: string,
): Promise<ErrorResult> => {
  if (!auth.currentUser) {
    return { error: 'Nenhum usuário logado' }
  }

  try {
    await updatePasswordFirebase(auth.currentUser, password)
    return { error: null }
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : 'Erro ao atualizar senha',
    }
  }
}

/**
 * 🗑️ Deleta conta do usuário atual
 *
 * @returns Promise com resultado da operação
 *
 * ⚠️ ATENÇÃO: Esta operação é irreversível!
 *
 * REQUISITOS:
 * - Usuário deve estar logado
 * - Login deve ser recente (pode exigir re-autenticação)
 *
 * IMPORTANTE: Apenas deleta a conta de Auth
 * Dados no Firestore devem ser deletados separadamente
 */
export const deleteOwnAccount = async (): Promise<ErrorResult> => {
  if (!auth.currentUser) {
    return { error: 'Nenhum usuário logado' }
  }

  try {
    await deleteUser(auth.currentUser)
    return { error: null }
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : 'Erro ao deletar conta',
    }
  }
}
