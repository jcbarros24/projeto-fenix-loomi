'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import InputField from '@/components/molecules/InputField/inputField'
import { useAuthStore } from '@/stores/auth.store'
import SignInFormSchema, { SignInFormData } from '@/validations/signIn'
import { Button } from '@/components/atoms/Button/button'

export function LoginForm() {
  const login = useAuthStore((state) => state.login)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<SignInFormData>({
    mode: 'onChange',
    resolver: zodResolver(SignInFormSchema),
  })

  const handleSubmitForm = async (data: SignInFormData) => {
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao fazer login',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={handleSubmit(handleSubmitForm)}
    >
      <InputField
        name="email"
        control={control}
        label="E-mail"
        type="text"
        placeholder="seu@email.com"
        required
        disabled={isSubmitting}
        className="transition-all duration-200"
      />

      <InputField
        name="password"
        control={control}
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        required
        disabled={isSubmitting}
        className="transition-all duration-200"
      />
      {errorMessage && (
        <p className="text-sm text-error-600">{errorMessage}</p>
      )}
      <Button
        type="submit"
        className="mt-4"
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
      >
        Entrar
      </Button>
    </form>
  )
}
