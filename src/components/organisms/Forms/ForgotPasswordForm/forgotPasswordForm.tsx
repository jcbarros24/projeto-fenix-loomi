'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/atoms/Button/button'
import InputField from '@/components/molecules/InputField/inputField'
import { cn } from '@/lib/utils'
import ForgotPasswordSchema, {
  ForgotPasswordFormData,
} from '@/validations/forgotPassword'

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<ForgotPasswordFormData>({
    mode: 'onChange',
    resolver: zodResolver(ForgotPasswordSchema),
  })

  const handleSubmitForm = async (_data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setFeedback(
      'Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.',
    )
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
      <InputField
        name="email"
        control={control}
        label="E-mail de cadastro"
        type="text"
        placeholder="seu@email.com"
        required
        disabled={isSubmitting}
      />
      {feedback && <p className="text-sm text-gray-600">{feedback}</p>}

      <Button
        type="submit"
        size="lg"
        className={cn(
          'w-full font-semibold',
          'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500',
        )}
        loading={isSubmitting}
        disabled={isSubmitting || !isValid}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Link'}
      </Button>
    </form>
  )
}
