'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import InputField from '@/components/molecules/InputField/inputField'
import SignInFormSchema, { SignInFormData } from '@/validations/signIn'
import { Button } from '@atoms/Button/button'
import useAuth from '@hooks/useAuth'

export function LoginForm() {
  const { loginWithInternalService, loading } = useAuth()

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<SignInFormData>({
    mode: 'onChange',
    resolver: zodResolver(SignInFormSchema),
  })

  const handleSubmitForm = (data: SignInFormData) => {
    loginWithInternalService(data.email, data.password)
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
        disabled={loading.loginWithInternalService}
        className="transition-all duration-200"
      />

      <InputField
        name="password"
        control={control}
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        required
        disabled={loading.loginWithInternalService}
        className="transition-all duration-200"
      />
      <Button
        type="submit"
        className="mt-4"
        loading={loading.loginWithInternalService}
        disabled={!isValid || loading.loginWithInternalService}
      >
        Entrar
      </Button>
    </form>
  )
}
