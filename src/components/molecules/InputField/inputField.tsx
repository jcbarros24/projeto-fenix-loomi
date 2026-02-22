import { Controller, FieldValues } from 'react-hook-form'

import { FormErrorLabel } from '@/components/atoms/FormError/formError'
import Input from '@/components/atoms/Input/input'
import InputCurrency from '@/components/atoms/InputCurrency/inputCurrency'
import InputMask from '@/components/atoms/InputMask/inputMask'
import { Label } from '@/components/atoms/Label/label'
import { cn } from '@/lib/utils'

import { InputFieldProps } from './types'

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  required,
  currency,
  mask,
  maskType,
  ...props
}: InputFieldProps<T>) => {
  const isComplex = !!(currency || mask || maskType)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const isDark = props.variant === 'dark'
        const isModal = props.variant === 'modal'
        const activeVariant = error
          ? isDark || isModal
            ? props.variant
            : 'error'
          : props.variant
        const darkErrorClass =
          error && (isDark || isModal)
            ? 'border-error-300 focus-within:border-error-300 focus-within:ring-error-50/30'
            : undefined

        return (
          <div className="flex w-full flex-col gap-1">
            {label && isComplex && (
              <Label
                className="font-inter text-lg text-gray-100"
                htmlFor={name}
                variant={error ? 'error' : isDark ? 'muted' : 'default'}
                required={required}
              >
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
                    onValueChange={(values) =>
                      field.onChange(values.floatValue)
                    }
                    variant={
                      error
                        ? 'error'
                        : props.variant === 'dark' || props.variant === 'modal'
                          ? undefined
                          : props.variant
                    }
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
                    variant={
                      error
                        ? 'error'
                        : props.variant === 'modal'
                          ? undefined
                          : props.variant
                    }
                  />
                )
              }

              return (
                <Input
                  {...props}
                  {...field}
                  value={field.value || ''}
                  label={label}
                  required={required}
                  variant={activeVariant}
                  className={cn(props.className, darkErrorClass)}
                />
              )
            })()}

            {error && (
              <FormErrorLabel>{error.message?.toString()}</FormErrorLabel>
            )}
          </div>
        )
      }}
    />
  )
}

export default InputField
