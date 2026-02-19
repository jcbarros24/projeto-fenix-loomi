import type { Metadata } from 'next'
import './globals.css'

import AuthHydrator from '@/shared/components/auth-hydrator'

export const metadata: Metadata = {
  title: 'Frontend Boilerplate',
  description: 'Boilerplate para iniciar projetos Next.js rapidamente',
  keywords: ['Next.js', 'React', 'TypeScript', 'Boilerplate'],
  authors: [{ name: 'José Carlos Paiva Santos' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthHydrator />
        <main id="root">{children}</main>
      </body>
    </html>
  )
}
