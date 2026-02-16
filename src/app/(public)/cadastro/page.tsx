'use client'

import { SignUpForm } from '@/components/organisms/Forms/SignUpForm/signUpForm'
import AuthTemplate from '@/components/templates/AuthTemplate/authTemplate'

export default function SignUpPage() {
  return (
    <AuthTemplate // <-- E aqui
      title="Criar conta"
      subtitle="Preencha os dados para começar"
      form={<SignUpForm />}
      footerLink={{
        text: 'Já tem uma conta?',
        linkText: 'Faça login',
        href: '/login',
      }}
    />
  )
}
