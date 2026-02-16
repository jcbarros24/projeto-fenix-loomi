/**
 * 👥 SERVICE DE USUÁRIOS - FIRESTORE
 *
 * Este arquivo centraliza todas as operações relacionadas a usuários no Firestore.
 *
 * Funcionalidades principais:
 * - CRUD completo de usuários
 * - Integração com Firebase Auth
 * - Validações e transformações específicas
 * - Type safety com UserEntity
 * - Timestamps automáticos
 *
 * Diferenças do service genérico:
 * - Específico para entidade User
 * - Validações de negócio
 * - Transformações de dados (Timestamp -> Date)
 * - Defaults inteligentes
 * - Ordenação específica
 *
 * Usado por:
 * - AuthProvider para criar perfis
 * - UserProvider para gerenciar dados
 * - Componentes de administração
 * - APIs de usuários
 */

import { FirebaseError } from 'firebase/app'
import { getAuth, User } from 'firebase/auth'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  Timestamp,
  orderBy,
  getFirestore,
} from 'firebase/firestore'

import firebaseApp from '@/config/firebase/firebase'
import { UserEntity, UserRole } from '@/types/entities/user'

// ====================================================================
// 🔧 CONFIGURAÇÃO E INSTÂNCIAS
// ====================================================================

/**
 * Instâncias do Firebase conectadas ao app principal
 */
const auth = getAuth(firebaseApp)
const db = getFirestore(firebaseApp)

/**
 * Nome da coleção no Firestore
 * Centralizado para facilitar mudanças futuras
 */
const COLLECTION_NAME = 'users'

// ====================================================================
// 📋 INTERFACES DE TIPOS
// ====================================================================

/**
 * Resultado de operações que retornam um usuário único
 */
interface UserResult {
  user: UserEntity | null // Usuário encontrado ou null
  error: string | null // Erro ou null se sucesso
}

/**
 * Resultado de operações que retornam múltiplos usuários
 */
interface UsersResult {
  users: UserEntity[] // Array de usuários (vazio se erro)
  error: string | null // Erro ou null se sucesso
}

/**
 * Resultado de operações que só indicam sucesso/erro
 * Usado para create, update, delete
 */
interface OperationResult {
  error: string | null // Erro ou null se sucesso
}

// ====================================================================
// ➕ OPERAÇÕES DE CRIAÇÃO
// ====================================================================

/**
 * 👤 Cria documento de usuário no Firestore
 *
 * QUANDO USAR:
 * - Após criar conta no Firebase Auth
 * - Armazenar dados extras do usuário
 * - Complementar informações de autenticação
 *
 * RECURSOS:
 * - UID como ID do documento (match com Auth)
 * - Timestamps automáticos
 * - Role padrão como USER
 * - Validação de dados obrigatórios
 *
 * @param uid - UID do usuário do Firebase Auth
 * @param email - Email do usuário
 * @param name - Nome completo do usuário
 * @param role - Role do usuário (padrão: USER)
 * @returns Promise com resultado da operação
 *
 * FLUXO TÍPICO:
 * ```typescript
 * // 1. Criar conta no Auth
 * const { user } = await createUserWithEmailAndPassword(auth, email, password)
 *
 * // 2. Criar documento no Firestore
 * if (user) {
 *   await createNewUserDoc({
 *     uid: user.uid,
 *     email,
 *     name,
 *     role: UserRole.USER
 *   })
 * }
 * ```
 */
export const createNewUserDoc = async ({
  uid,
  email,
  name,
  role = UserRole.USER,
}: {
  uid: string
  email: string
  name: string
  role?: UserRole
}): Promise<OperationResult> => {
  console.log('📄 createNewUserDoc chamado:', { uid, email, name, role })

  try {
    const now = Timestamp.now()

    const userData = {
      uid,
      name,
      email,
      role,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = doc(db, COLLECTION_NAME, uid)

    await setDoc(docRef, userData)

    return { error: null }
  } catch (error: unknown) {
    console.error('❌ Erro capturado em createNewUserDoc:', error)

    // Logs detalhados do erro
    if (error instanceof Error) {
      console.error('  - Message:', error.message)
      console.error('  - Name:', error.name)
      console.error('  - Stack:', error.stack)
    }

    // Verificar código específico do Firebase

    const firebaseError = error as FirebaseError
    if (firebaseError.code) {
      console.error('  - Firebase Code:', firebaseError.code)
    }

    return {
      error: error instanceof Error ? error.message : 'Erro ao criar usuário',
    }
  }
}

// ====================================================================
// 📖 OPERAÇÕES DE LEITURA
// ====================================================================

/**
 * 👤 Busca usuário específico por UID
 *
 * TRANSFORMAÇÕES APLICADAS:
 * - Timestamp -> Date para facilitar uso
 * - Defaults para campos obrigatórios
 * - Type safety com UserEntity
 *
 * @param uid - UID do usuário
 * @returns Promise com usuário ou null se não encontrado
 *
 * CASOS DE USO:
 * - Carregar perfil do usuário logado
 * - Exibir dados em componentes
 * - Validar existência de usuário
 *
 * EXEMPLO:
 * ```typescript
 * const { user, error } = await getUserDoc(currentUser.uid)
 * if (user) {
 *   setProfile(user)
 * }
 * ```
 */
export const getUserDoc = async (uid: string): Promise<UserResult> => {
  // 🔍 Validação básica de entrada
  if (!uid) {
    return { user: null, error: 'UID não fornecido' }
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, uid)
    const docSnap = await getDoc(docRef)

    // 📭 Documento não existe = sucesso com user null
    if (!docSnap.exists()) {
      return { user: null, error: null }
    }

    const data = docSnap.data()

    // 🔄 Transformação: Firestore data -> UserEntity
    const user: UserEntity = {
      uid: docSnap.id || data.uid, // 🆔 UID do documento
      name: data.name || '', // 🛡️ Default para string vazia
      email: data.email || '', // 🛡️ Default para string vazia
      role: data.role || UserRole.USER, // 🛡️ Default para USER
      createdAt: data.createdAt?.toDate(), // 🕒 Timestamp -> Date
      updatedAt: data.updatedAt?.toDate(), // 🕒 Timestamp -> Date
    }

    return { user, error: null }
  } catch (error: unknown) {
    console.error('Erro ao buscar usuário:', error)
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Erro ao buscar usuário',
    }
  }
}

/**
 * 👥 Busca todos os usuários com ordenação
 *
 * CARACTERÍSTICAS:
 * - Ordenado por data de criação (mais recentes primeiro)
 * - Transformações consistentes com getUserDoc
 * - Retorna array vazio em caso de erro
 * - Ideal para dashboards administrativos
 *
 * @returns Promise com array de usuários
 *
 * CASOS DE USO:
 * - Dashboard administrativo
 * - Listagem de usuários
 * - Relatórios
 * - Moderação
 *
 * ⚠️ ATENÇÃO: Esta função carrega TODOS os usuários
 * Para grandes volumes, considere implementar paginação
 */
export const getAllUsers = async (): Promise<UsersResult> => {
  try {
    const usersRef = collection(db, COLLECTION_NAME)

    // 📊 Query com ordenação por data de criação (desc)
    const q = query(usersRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const users: UserEntity[] = []

    // 🔄 Transformar cada documento
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      users.push({
        uid: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || UserRole.USER,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      })
    })

    return { users, error: null }
  } catch (error: unknown) {
    console.error('Erro ao buscar usuários:', error)
    return {
      users: [], // 📦 Array vazio em caso de erro
      error: error instanceof Error ? error.message : 'Erro ao buscar usuários',
    }
  }
}

// ====================================================================
// ✏️ OPERAÇÕES DE ATUALIZAÇÃO
// ====================================================================

/**
 * 📝 Atualiza dados do usuário
 *
 * RECURSOS:
 * - Update parcial (apenas campos fornecidos)
 * - Timestamp automático de atualização
 * - Validação de UID obrigatório
 * - Type safety para campos permitidos
 *
 * @param uid - UID do usuário
 * @param updates - Campos a serem atualizados
 * @returns Promise com resultado da operação
 *
 * CAMPOS ATUALIZÁVEIS:
 * - email: Novo email
 * - name: Novo nome
 * - role: Nova role (cuidado com permissões!)
 *
 * EXEMPLO:
 * ```typescript
 * // Atualizar apenas o nome
 * await updateUserDoc(uid, { name: 'João Silva' })
 *
 * // Atualizar email e role
 * await updateUserDoc(uid, {
 *   email: 'novo@email.com',
 *   role: UserRole.ADMIN
 * })
 * ```
 */
export const updateUserDoc = async (
  uid: string,
  updates: {
    email?: string
    name?: string
    role?: UserRole
  },
): Promise<OperationResult> => {
  // 🔍 Validação de UID obrigatório
  if (!uid) {
    return { error: 'UID não fornecido' }
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, uid)

    // 🔄 Update com timestamp automático
    await updateDoc(docRef, {
      ...updates, // 📝 Campos fornecidos
      updatedAt: Timestamp.now(), // 🕒 Timestamp automático
    })

    return { error: null }
  } catch (error: unknown) {
    console.error('Erro ao atualizar usuário:', error)
    return {
      error:
        error instanceof Error ? error.message : 'Erro ao atualizar usuário',
    }
  }
}

// ====================================================================
// 🗑️ OPERAÇÕES DE EXCLUSÃO
// ====================================================================

/**
 * 🗑️ Deleta documento do usuário no Firestore
 *
 * ⚠️ IMPORTANTE:
 * - Remove apenas o documento do Firestore
 * - NÃO deleta a conta do Firebase Auth
 * - Operação irreversível
 * - Para deleção completa, usar também deleteUser do Auth
 *
 * @param uid - UID do usuário a ser deletado
 * @returns Promise com resultado da operação
 *
 * FLUXO COMPLETO DE DELEÇÃO:
 * ```typescript
 * // 1. Deletar documento do Firestore
 * const { error: firestoreError } = await deleteUserDoc(uid)
 *
 * // 2. Deletar conta do Auth (se necessário)
 * if (!firestoreError) {
 *   const { error: authError } = await deleteOwnAccount()
 * }
 * ```
 */
export const deleteUserDoc = async (uid: string): Promise<OperationResult> => {
  // 🔍 Validação de UID obrigatório
  if (!uid) {
    return { error: 'UID não fornecido' }
  }

  try {
    // 🗑️ Deletar documento
    await deleteDoc(doc(db, COLLECTION_NAME, uid))
    return { error: null }
  } catch (error: unknown) {
    console.error('Erro ao deletar usuário:', error)
    return {
      error: error instanceof Error ? error.message : 'Erro ao deletar usuário',
    }
  }
}

// ====================================================================
// 🔄 INTEGRAÇÃO COM FIREBASE AUTH
// ====================================================================

/**
 * 👤 Monitora mudanças no estado de autenticação
 *
 * NOTA: Esta função está duplicada do auth service
 * Mantida aqui por compatibilidade, mas considere usar apenas uma
 *
 * @param callback - Função chamada quando estado muda
 * @returns Função para cancelar o listener
 *
 * @deprecated Considere usar apenas a versão do auth service
 */
export const waitForUser = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback)
}
