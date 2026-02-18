/**
 * 🏠 PÁGINA INICIAL - LANDING PAGE
 *
 * Página pública principal da aplicação
 * - Apenas usuários não logados podem acessar
 * - Links para páginas principais do sistema
 * - Template público com redirecionamento automático
 * - Design simples e funcional para demonstração
 */

import LoginPage from './(public)/login/page'

// ====================================================================
// 🚀 COMPONENTE PRINCIPAL
// ====================================================================

/**
 * Página inicial da aplicação
 *
 * Funcionalidades:
 * - Protegida pelo template PublicOnlyFeature
 * - Redireciona usuários logados para /home
 * - Links de navegação para principais seções
 * - Design responsivo e acessível
 *
 * Fluxo de usuário:
 * - Usuário não logado: vê landing page
 * - Usuário logado: redirecionado automaticamente
 *
 * Navegação disponível:
 * - Login: /login
 * - Cadastro: /cadastro
 * - Admin: /admin/users (apenas para demonstração)
 */
export default function Home() {
  return (
    <main className="flex-1">
      <LoginPage />
    </main>
  )
}
