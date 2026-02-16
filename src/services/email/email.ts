/**
 * Função para enviar um convite por email utilizando a API interna.
 *
 * Esta função faz uma requisição POST para o endpoint `/api/email` com os dados necessários
 * para enviar um email de convite. Caso ocorra um erro, ele será capturado e retornado.
 *
 * @param email - O endereço de email do destinatário.
 * @param subject - O assunto do email.
 * @param data - Dados adicionais para o email, incluindo:
 *   - email: O email do destinatário.
 *   - password: A senha gerada ou associada ao destinatário.
 *
 * @returns Um objeto contendo:
 *   - `error`: `null` se o envio foi bem-sucedido, ou uma mensagem de erro se falhou.
 *
 * @example
 * ```typescript
 * const response = await sendInvite({
 *   email: 'jose@souv.tech',
 *   subject: 'Bem-vindo ao Diabetopedia!',
 *   data: {
 *     email: 'jose@souv.tech',
 *     password: 'senha123',
 *   },
 * });
 *
 * if (response.error) {
 *   console.error('Erro ao enviar email:', response.error);
 * } else {
 *   console.log('Email enviado com sucesso!');
 * }
 * ```
 */
export const sendInvite = async ({
  email,
  subject,
  data,
}: {
  email: string
  subject: string
  data: {
    email: string
    password: string
  }
}) => {
  return await fetch('/api/email', {
    method: 'post',
    body: JSON.stringify({
      email,
      subject,
      data: { ...data },
    }),
  })
    .then(() => ({ error: null }))
    .catch((err: string) => {
      console.error(err)
      return {
        error: err,
      }
    })
}
