import type { Metadata } from 'next'
import { getLocale, getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
// eslint-disable-next-line camelcase
import { Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'sonner'

import AuthHydrator from '@/shared/components/auth-hydrator'
import QueryProvider from '@/shared/components/query-provider'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'fenix-loomi',
  description: 'fenix-loomi',
  keywords: ['Next.js', 'React', 'TypeScript', 'Loomi'],
  authors: [{ name: 'José Carlos Barros' }],
  icons: {
    icon: '/images/nortus-logo.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  const lang = locale === 'pt' ? 'pt-BR' : locale
  return (
    <html lang={lang} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthHydrator />
            <main id="root">{children}</main>
            <Toaster richColors theme="dark" position="top-right" />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
