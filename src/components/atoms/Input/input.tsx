import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { forwardRef } from 'react'

import { cn } from '@/lib/utils'

import { InputProps } from './types'

export const inputVariants = cva(
  'flex w-full items-center gap-2 rounded-xl border bg-transparent text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 text-gray-900 focus:border-primary-300 focus:ring-2 focus:ring-primary-50 focus:ring-offset-2',
        dark: 'border-white/60 bg-transparent text-white focus:border-white',
        error:
          'border-error-300 text-gray-900 focus:border-error-300 focus:ring-2 focus:ring-error-50 focus:ring-offset-2',
        success:
          'border-success-300 text-gray-900 focus:border-success-300 focus:ring-2 focus:ring-success-50 focus:ring-offset-2',
      },
      size: {
        sm: 'h-9 px-2.5',
        md: 'h-10 px-3',
        lg: 'h-11 px-3.5',
      },
      hasIcon: {
        true: 'pl-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      description,
      iconPosition = 'left',
      asChild = false,
      label,
      required,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'input'
    const hasIcon = !!icon
    const isDark = variant === 'dark'
    const isError = variant === 'error'

    const descriptionClass = cn(
      'text-xs',
      isDark ? 'text-gray-400' : 'text-gray-500',
    )
    const iconClass = cn(
      'absolute -translate-y-1/2',
      isDark ? 'text-white/70' : 'text-gray-400',
    )

    // —— Floating label mode ——
    if (label) {
      const inputPadding = cn(
        'pt-6 pb-2',
        hasIcon && iconPosition === 'left' ? 'pl-10 pr-4' : 'pl-4',
        hasIcon && iconPosition === 'right' ? 'pr-10' : 'pr-4',
      )

      const labelClass = cn(
        'pointer-events-none absolute transition-all duration-150',
        // Floated state (default — when value exists)
        'top-2 text-xs',
        // Left offset (account for left icon)
        hasIcon && iconPosition === 'left' ? 'left-10' : 'left-4',
        // Resting state — when input is empty (placeholder showing)
        'peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm',
        // On focus: always float
        'peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs',
        // Colors per variant
        isDark
          ? 'text-white/60 peer-placeholder-shown:text-gray-400 peer-focus:text-white/60'
          : isError
            ? 'text-error-400 peer-placeholder-shown:text-error-300 peer-focus:text-error-400'
            : 'text-gray-500 peer-placeholder-shown:text-gray-400 peer-focus:text-gray-500',
      )

      return (
        <div className="w-full space-y-1.5">
          <div className="relative w-full">
            {icon && iconPosition === 'left' && (
              <span className={cn(iconClass, 'left-3 top-9')}>{icon}</span>
            )}

            <Comp
              ref={ref}
              placeholder=" "
              required={required}
              data-variant={variant}
              className={cn(
                inputVariants({ variant, className }),
                'peer h-14 placeholder-transparent',
                inputPadding,
              )}
              {...props}
            />

            <label className={labelClass}>
              {label}
              {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>

            {icon && iconPosition === 'right' && (
              <span className={cn(iconClass, 'right-3 top-1/2 z-50')}>
                {icon}
              </span>
            )}
          </div>
          {description && <p className={descriptionClass}>{description}</p>}
        </div>
      )
    }

    // —— Standard mode (no label) ——
    const iconPaddingClass = iconPosition === 'left' ? 'pl-9' : 'pr-9'
    const standardIconClass = cn(
      'absolute top-1/2 -translate-y-1/2',
      isDark ? 'text-white/70' : 'text-gray-400',
    )

    return (
      <div className="w-full space-y-1.5">
        <div className="relative w-full">
          {icon && iconPosition === 'left' && (
            <span className={cn(standardIconClass, 'left-3')}>{icon}</span>
          )}

          <Comp
            ref={ref}
            placeholder={placeholder}
            required={required}
            data-variant={variant}
            className={cn(
              inputVariants({ variant, size, hasIcon, className }),
              hasIcon && iconPaddingClass,
            )}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <span className={cn(standardIconClass, 'right-3')}>{icon}</span>
          )}
        </div>
        {description && <p className={descriptionClass}>{description}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
