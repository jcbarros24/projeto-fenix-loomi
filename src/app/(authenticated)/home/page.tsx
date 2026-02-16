'use client'

import useAuth from '@/hooks/useAuth' // ← Importar useAuth para logout
import useUser from '@/hooks/useUser'

export default function HomePage() {
  const { currentUser } = useUser()
  const { logoutUser, loading } = useAuth() // ← Adicionar logout

  const handleLogout = async () => {
    await logoutUser()
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* 👋 Header de boas-vindas */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Bem-vindo, {currentUser?.name || 'Usuário'}! 👋
            </h1>
            <p className="text-gray-600">
              Este é seu dashboard principal. Aqui você pode gerenciar sua conta
              e acessar todas as funcionalidades.
            </p>
          </div>

          {/* 🚪 Botão de Logout */}
          <button
            onClick={handleLogout}
            disabled={loading.logout}
            className="flex items-center space-x-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            <span>🚪</span>
            <span>{loading.logout ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </div>

      {/* 📊 Cards de estatísticas/ações rápidas */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Perfil</p>
              <p className="text-2xl font-bold text-gray-900">Completo</p>
            </div>
            <div className="text-3xl">👤</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conta</p>
              <p className="text-2xl font-bold text-green-600">Ativa</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Role</p>
              <p className="text-2xl font-bold capitalize text-blue-600">
                {currentUser?.role?.toLowerCase()}
              </p>
            </div>
            <div className="text-3xl">🔑</div>
          </div>
        </div>
      </div>

      {/* 🚀 Ações rápidas */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Ações Rápidas</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
            <span className="text-2xl">👤</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Editar Perfil</p>
              <p className="text-sm text-gray-600">
                Atualizar suas informações
              </p>
            </div>
          </button>

          <button className="flex items-center space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50">
            <span className="text-2xl">🔒</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Segurança</p>
              <p className="text-sm text-gray-600">
                Alterar senha e configurações
              </p>
            </div>
          </button>

          {/* 🚪 Ação rápida de logout adicional */}
          <button
            onClick={handleLogout}
            disabled={loading.logout}
            className="flex items-center space-x-3 rounded-lg border border-red-200 p-4 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <span className="text-2xl">🚪</span>
            <div className="text-left">
              <p className="font-medium text-red-900">Sair da Conta</p>
              <p className="text-sm text-red-600">
                {loading.logout ? 'Saindo...' : 'Fazer logout do sistema'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
