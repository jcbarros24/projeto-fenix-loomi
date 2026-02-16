'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/atoms/Button/button'
import InputField from '@/components/molecules/InputField/inputField'
import useAuth from '@/hooks/useAuth'
import SignUpFormSchema, { SignUpFormData } from '@/validations/signUp'

export function SignUpForm() {
  const { createUserWithInternalService, loading } = useAuth()

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<SignUpFormData>({
    mode: 'onChange',
    resolver: zodResolver(SignUpFormSchema),
  })

  const handleSubmitForm = (data: SignUpFormData) => {
    createUserWithInternalService(data)
  }

  const isFormLoading = loading.createUserWithInternalService

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
      <InputField
        name="name"
        control={control}
        label="Nome completo"
        type="text"
        placeholder="Digite seu nome"
        required
        disabled={isFormLoading}
        className="transition-all duration-200"
      />

      <InputField
        name="email"
        control={control}
        label="E-mail"
        type="text"
        placeholder="seu@email.com"
        required
        disabled={isFormLoading}
        className="transition-all duration-200"
      />

      <InputField
        name="password"
        control={control}
        label="Senha"
        type="password"
        placeholder="Digite sua senha"
        required
        disabled={isFormLoading}
        className="transition-all duration-200"
      />

      <InputField
        name="confirmPassword"
        control={control}
        label="Confirmar senha"
        type="password"
        placeholder="Digite sua senha novamente"
        required
        disabled={isFormLoading}
        className="transition-all duration-200"
      />
      <Button
        type="submit"
        size="lg"
        className="w-full font-semibold"
        loading={isFormLoading}
        disabled={isFormLoading || !isValid}
      >
        {isFormLoading ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  )
}
