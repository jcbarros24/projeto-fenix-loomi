import { z } from 'zod'

import email from './email'
import password from './password'

// Regex para validação de senha mais robusta
// const passwordRegex =
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/

const SignUpFormSchema = z.object({
  email,
  password,
})
export default SignUpFormSchema
export type SignUpFormData = z.infer<typeof SignUpFormSchema>
