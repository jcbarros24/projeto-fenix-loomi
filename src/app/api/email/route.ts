/**
 * Endpoint para envio de emails utilizando o Nodemailer e React Email.
 *
 * Este endpoint recebe uma requisição POST com os dados necessários para enviar um email.
 * Ele utiliza o Nodemailer para enviar o email e o React Email para renderizar o HTML do template.
 *
 * @param request - A requisição HTTP contendo os dados do email.
 * @returns Uma resposta JSON indicando sucesso ou erro.
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/email', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     email: 'jose@souv.tech',
 *     subject: 'Bem-vindo ao Diabetopedia!',
 *     data: {
 *       email: 'jose@souv.tech',
 *       password: 'senha123',
 *     },
 *   }),
 * });
 *
 * const result = await response.json();
 * if (result.error) {
 *   console.error('Erro ao enviar email:', result.error);
 * } else {
 *   console.log('Email enviado com sucesso!');
 * }
 * ```
 */
import { render } from '@react-email/components'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

import TemplateEmail from './template/email'

export async function POST(request: Request) {
  const data: {
    email: string
    data: {
      email: string
      password: string
    }
    subject: string
  } = await request.json()

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_NODEMAILER_USER,
      pass: process.env.NEXT_PUBLIC_NODEMAILER_PASS,
    },
  })

  const inviteHTML = await render(
    TemplateEmail({
      email: data.data.email,
      password: data.data.password,
    }),
  )

  const params = {
    from: `Boilerplate <${process.env.NEXT_PUBLIC_NODEMAILER_USER}>`,
    to: data.email,
    replyTo: process.env.NEXT_PUBLIC_NODEMAILER_USER,
    subject: data.subject,
    html: inviteHTML,
  }

  try {
    await transporter.sendMail(params)

    return NextResponse.json({ error: null })
  } catch (error) {
    console.error(error)
    return NextResponse.json({
      error: 'Não foi possível enviar o email',
      stack: error,
    })
  }
}
