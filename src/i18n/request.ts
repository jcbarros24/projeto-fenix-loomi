import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'

const LOCALES = ['pt', 'en', 'es'] as const
type Locale = (typeof LOCALES)[number]

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
  const locale: Locale =
    localeCookie && LOCALES.includes(localeCookie as Locale)
      ? (localeCookie as Locale)
      : 'pt'

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
