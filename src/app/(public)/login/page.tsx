'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  LifeBuoy,
  UserRound,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/atoms/Button/button'
import InputField from '@/components/molecules/InputField/inputField'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth.store'
import SignUpFormSchema, { SignUpFormData } from '@/validations/signUp'

export default function LoginPage() {
  const t = useTranslations('login')
  const tLanguage = useTranslations('language')
  const locale = useLocale()
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { handleSubmit, control } = useForm<SignUpFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(SignUpFormSchema),
  })

  const handleSubmitForm = async (data: SignUpFormData) => {
    setError(null)
    setIsSubmitting(true)

    try {
      await login(data.email, data.password, rememberMe)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao realizar login.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLocaleChange = (nextLocale: 'pt' | 'en' | 'es') => {
    document.cookie = `NEXT_LOCALE=${nextLocale}; Path=/; Max-Age=31536000`
    router.refresh()
  }

  const currentLocaleLabel =
    locale === 'pt' ? 'PT-BR' : locale === 'en' ? 'EN' : 'ES'

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 gap-10 bg-[#0b0d1c] p-6 min-[1000px]:grid-cols-2 min-[1000px]:p-8">
      <section className="flex flex-col gap-12 p-2 min-[1000px]:p-6">
        <h1 className="font-inter mb-[12%] text-5xl font-semibold text-blue-600">
          Nortus
        </h1>
        <div className="space-y-3">
          <h2 className="font-space-grotesk text-gray-primary text-3xl">
            {t('title')}
          </h2>
          <p className="font-inter text-gray-primary text-lg">
            {t('subtitle')}
          </p>
        </div>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="flex flex-col gap-8"
        >
          <div className="space-y-6">
            <InputField
              control={control}
              name="email"
              label={t('emailLabel')}
              variant="dark"
              required
              autoComplete="email"
            />

            <InputField
              control={control}
              name="password"
              type={showPassword ? 'text' : 'password'}
              label={t('passwordLabel')}
              variant="dark"
              required
              autoComplete="current-password"
              icon={
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowPassword((prev) => !prev)
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="z-50 flex items-center justify-center text-white/80 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              iconPosition="right"
            />

            {error && (
              <p className="rounded-lg bg-red-500/20 px-3 py-2 text-xs text-red-200">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-3 min-[1000px]:flex-row min-[1000px]:items-center min-[1000px]:justify-between">
              <div className="flex flex-row items-center gap-2">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <p className="text-gray-primary">{t('remember')}</p>
              </div>
              <p className="cursor-pointer text-blue-600">{t('forgot')}</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gray-900 py-6 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
        </form>
      </section>
      <section className="relative flex min-h-[280px] min-[1000px]:min-h-full">
        <div className="relative h-full w-full overflow-hidden rounded-[7%]">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#0b0d1c]/35 via-transparent to-transparent" />
          <svg
            className="absolute inset-0 z-20 h-full w-full"
            viewBox="0 0 900 700"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-20 520C120 430 220 420 360 480C520 550 650 530 920 380"
              stroke="#38BDF8"
              strokeOpacity="0.55"
              strokeWidth="2"
            />
            <path
              d="M-40 620C140 520 260 520 420 590C580 660 720 650 940 520"
              stroke="#60A5FA"
              strokeOpacity="0.45"
              strokeWidth="2"
            />
          </svg>
          <Image
            src="/images/login-background.png"
            alt="Login"
            fill
            className="object-cover"
          />
        </div>
      </section>
      <div className="absolute right-4 top-4 z-30 flex w-fit items-center gap-2 rounded-2xl bg-[#0b0d1c]/80 p-2 backdrop-blur">
        <Button
          variant="ghost"
          className="text-gray-primary flex flex-row items-center gap-2 px-3 py-2"
        >
          <LifeBuoy className="h-5 w-5" />
          <span className="text-sm">{t('help')}</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="text-gray-primary flex flex-row items-center gap-2 px-3 py-2"
            >
              <Globe className="h-5 w-5" />
              <span className="text-sm">{currentLocaleLabel}</span>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="text-gray-primary min-w-[180px] border-white/10 bg-[#0b0d1c]"
          >
            <DropdownMenuItem onClick={() => handleLocaleChange('pt')}>
              {tLanguage('pt')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLocaleChange('en')}>
              {tLanguage('en')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleLocaleChange('es')}>
              {tLanguage('es')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
