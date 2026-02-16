import { Controller, FieldValues } from 'react-hook-form'

import { FormErrorLabel } from '@/components/atoms/FormError/formError'
import Input from '@/components/atoms/Input/input'
import InputCurrency from '@/components/atoms/InputCurrency/inputCurrency'
import InputMask from '@/components/atoms/InputMask/inputMask'
import { Label } from '@/components/atoms/Label/label'

import { InputFieldProps } from './types'

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  currency,
  mask,
  maskType,
  ...props
}: InputFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="flex w-full flex-col gap-1">
          {label && (
            <Label htmlFor={name} variant={error ? 'error' : 'default'}>
              {label}
            </Label>
          )}

          {(() => {
            if (currency) {
              return (
                <InputCurrency
                  {...props}
                  {...field}
                  currency={currency}
                  defaultValue={field.value || ''}
                  onValueChange={(values) => field.onChange(values.floatValue)}
                  variant={error ? 'error' : props.variant}
                />
              )
            }

            if (mask || maskType) {
              return (
                <InputMask
                  {...props}
                  {...field}
                  value={field.value || ''}
                  mask={mask}
                  maskType={maskType}
                  variant={error ? 'error' : props.variant}
                />
              )
            }

            return (
              <Input
                {...props}
                {...field}
                value={field.value || ''}
                variant={error ? 'error' : props.variant}
              />
            )
          })()}

          {error && (
            <FormErrorLabel>{error.message?.toString()}</FormErrorLabel>
          )}
        </div>
      )}
    />
  )
}

export default InputField
