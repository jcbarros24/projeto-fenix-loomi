'use client'

import { useAuthStore } from '@/stores/auth.store'

export default function DashboardPage() {
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout,
  }))

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500">
          Bem-vindo{user?.name ? `, ${user.name}` : ''}.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">
          Conteudo protegido. Aqui entra o consumo da API legada.
        </p>
        <button
          onClick={logout}
          className="mt-6 rounded-lg border border-gray-900 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-900 hover:text-white"
        >
          Logout
        </button>
      </section>
    </div>
  )
}
