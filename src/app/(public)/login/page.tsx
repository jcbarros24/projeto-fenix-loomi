'use client'

import { LoginForm } from '@/components/organisms/Forms/LoginForm/loginForm'
import AuthTemplate from '@/components/templates/AuthTemplate/authTemplate'
import { Button } from '@atoms/Button/button'
import useAuth from '@hooks/useAuth'

export default function LoginPage() {
  const { loading } = useAuth()

  return (
    <AuthTemplate // <-- E aqui
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para continuar"
      form={<LoginForm />}
      footerLink={{
        text: 'Não tem uma conta?',
        linkText: 'Cadastre-se',
        href: '/cadastro',
      }}
      secondaryAction={
        <Button
          className="w-full"
          // onClick={loginWithGoogleUser}
          loading={loading.loginWithGoogle}
        >
          Entrar com o Google
        </Button>
      }
    />
  )
}
