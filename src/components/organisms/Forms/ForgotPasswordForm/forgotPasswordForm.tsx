'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/atoms/Button/button'
import InputField from '@/components/molecules/InputField/inputField'
import { successToast } from '@/hooks/useAppToast'
import useAuth from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import ForgotPasswordSchema, {
  ForgotPasswordFormData,
} from '@/validations/forgotPassword'

export function ForgotPasswordForm() {
  const { forgotPassword, loading } = useAuth()

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onChange',
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const handleSubmitForm = (data: ForgotPasswordFormData) => {
    forgotPassword(data.email)
    successToast(
      'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    )
  }

  const isFormLoading = loading.forgotPassword

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      <InputField
        name="email"
        control={control}
        label="E-mail de cadastro"
        type="text"
        placeholder="seu@email.com"
        required
        disabled={isFormLoading}
      />

      <Button
        type="submit"
        size="lg"
        className={cn(
          'w-full font-semibold',
          'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500',
        )}
        loading={isFormLoading}
        disabled={isFormLoading || !isValid}
      >
        {isFormLoading ? 'Enviando...' : 'Enviar Link'}
      </Button>
    </form>
  )
}
