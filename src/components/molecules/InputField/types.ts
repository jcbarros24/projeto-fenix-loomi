import { Control, FieldValues, Path } from 'react-hook-form'

import { InputProps } from '@/components/atoms/Input/types'
import { InputCurrencyProps } from '@/components/atoms/InputCurrency/types'
import { InputMasksProps } from '@/components/atoms/InputMask/types'

type CustomInputProps = Omit<InputProps, 'name' | 'variant'> &
  Omit<InputCurrencyProps, 'name' | 'control' | 'variant'> &
  Omit<InputMasksProps, 'name' | 'control' | 'variant'>

export interface InputFieldProps<T extends FieldValues>
  extends CustomInputProps {
  name: Path<T>
  control: Control<T>
  label?: string
  required?: boolean
  currency?: string
  variant?: 'default' | 'dark' | 'modal' | 'error' | 'success'
}
