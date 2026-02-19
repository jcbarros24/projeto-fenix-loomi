import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-semibold text-gray-900">
          404 - Página não encontrada
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Não encontramos a página que você tentou acessar.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}
