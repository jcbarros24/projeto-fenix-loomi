'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/atoms/Button/button'
import InputField from '@/components/molecules/InputField/inputField'
import SignUpFormSchema, { SignUpFormData } from '@/validations/signUp'

export function SignUpForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<SignUpFormData>({
    mode: 'onChange',
    resolver: zodResolver(SignUpFormSchema),
  })

  const handleSubmitForm = async (_data: SignUpFormData) => {
    setErrorMessage(null)
    setIsSubmitting(true)
    setErrorMessage('Cadastro ainda não está disponível.')
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-5">
      <InputField
        name="name"
        control={control}
        label="Nome completo"
        type="text"
        placeholder="Digite seu nome"
        required
        disabled={isSubmitting}
        className="transition-all duration-200"
      />

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

      <InputField
        name="confirmPassword"
        control={control}
        label="Confirmar senha"
        type="password"
        placeholder="Digite sua senha novamente"
        required
        disabled={isSubmitting}
        className="transition-all duration-200"
      />
      {errorMessage && (
        <p className="text-sm text-error-600">{errorMessage}</p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full font-semibold"
        loading={isSubmitting}
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? 'Criando conta...' : 'Criar conta'}
      </Button>
    </form>
  )
}
