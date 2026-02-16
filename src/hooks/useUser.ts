/**
 * 🪝 HOOK PERSONALIZADO PARA ACESSO AOS DADOS DO USUÁRIO
 *
 * Hook que facilita o acesso ao contexto de usuário em toda a aplicação
 * - Abstração do useContext para o UserContext
 * - Type safety com TypeScript
 * - Interface simples e reutilizável
 * - Centralizador de dados do usuário autenticado
 */

import { useContext } from 'react'

import { UserContextType } from '@/providers/User/types'
import UserContext from '@providers/User/context'

// ====================================================================
// 🪝 HOOK PRINCIPAL
// ====================================================================

/**
 * Hook para acessar dados e funções do contexto de usuário
 *
 * Funcionalidades disponíveis através do UserContext:
 * - currentUser: dados completos do usuário logado
 * - updateUser: função para atualizar dados do usuário
 * - fetchAllUsers: buscar todos os usuários (se admin)
 * - deleteUser: deletar usuário (se admin)
 * - loading states para operações assíncronas
 *
 * @returns {UserContextType} Objeto com dados e funções do usuário
 *
 * Uso típico:
 * ```typescript
 * const { currentUser, updateUser, loading } = useUser()
 *
 * // Acessar dados do usuário
 * const userName = currentUser?.name
 * const userEmail = currentUser?.email
 * const userRole = currentUser?.role
 *
 * // Atualizar dados do usuário
 * const handleUpdateProfile = async (newData) => {
 *   await updateUser(userUid, newData)
 * }
 *
 * // Verificar estados de loading
 * if (loading.currentUser) {
 *   return <LoadingSpinner />
 * }
 * ```
 *
 * Vantagens:
 * - ✅ Type safety completo
 * - ✅ Acesso direto ao contexto
 * - ✅ Não precisa importar useContext + UserContext
 * - ✅ Interface limpa e consistente
 * - ✅ Facilita refatoração futura
 *
 * Dependências:
 * - Componente deve estar dentro do UserProvider
 * - UserContext deve estar configurado corretamente
 * - Types definidos em @/providers/User/types
 */
export default function useUser(): UserContextType {
  return useContext(UserContext)
}
