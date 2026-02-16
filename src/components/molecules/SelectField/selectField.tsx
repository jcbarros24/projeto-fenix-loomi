'use client'

import { cva } from 'class-variance-authority'
import { Check, ChevronDown, Circle } from 'lucide-react'
import * as React from 'react'
import { Controller, FieldValues } from 'react-hook-form'

import { Button } from '@/components/atoms/Button/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { SelectFieldProps } from './types'

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-lg border bg-white text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-gray-300 focus:border-primary-300 focus:ring-primary-50',
        error: 'border-error-300 focus:border-error-300 focus:ring-error-50',
        success:
          'border-success-300 focus:border-success-300 focus:ring-success-50',
      },
      size: {
        sm: 'h-8 px-2 py-1 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

const SelectField = <T extends FieldValues>({
  control,
  name,
  options,
  placeholder = 'Selecione...',
  emptyPlaceholder = 'Nenhuma opção encontrada.',
  className,
  variant = 'default',
  size = 'md',
  disabled = false,
  searchable = true,
  multiple = false,
  loading = false,
  icon,
  ...props
}: SelectFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const currentVariant = fieldState.error ? 'error' : variant

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                className={cn(
                  selectVariants({ variant: currentVariant, size, className }),
                  'font-normal',
                  !field.value && 'text-muted-foreground',
                )}
                disabled={disabled || loading}
              >
                <div className="flex items-center gap-2">
                  {icon && <span className="text-gray-400">{icon}</span>}
                  {(() => {
                    if (multiple) {
                      const selectedCount = Array.isArray(field.value)
                        ? field.value.length
                        : 0
                      if (selectedCount === 1) {
                        return '1 item selecionado'
                      }
                      if (selectedCount > 1) {
                        return `${selectedCount} itens selecionados`
                      }
                      return placeholder
                    }

                    const selectedLabel = options.find(
                      (option) => option.value === field.value,
                    )?.label
                    return selectedLabel || placeholder
                  })()}
                </div>
                {loading ? (
                  <Circle className="h-4 w-4 animate-spin opacity-50" />
                ) : (
                  <ChevronDown className="h-4 w-4 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] bg-white p-0">
              <Command>
                {searchable && <CommandInput placeholder={placeholder} />}
                <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (multiple) {
                          const currentValue: string[] = Array.isArray(
                            field.value,
                          )
                            ? field.value
                            : []
                          const newValue = currentValue.includes(option.value)
                            ? currentValue.filter(
                                (v: string) => v !== option.value,
                              )
                            : [...currentValue, option.value]
                          field.onChange(newValue)
                        } else {
                          field.onChange(
                            option.value === field.value ? '' : option.value,
                          )
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          multiple
                            ? Array.isArray(field.value) &&
                              field.value.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0'
                            : field.value === option.value
                              ? 'opacity-100'
                              : 'opacity-0',
                        )}
                      />
                      <div className="flex items-center gap-2">
                        {option.icon && (
                          <span className="text-gray-400">{option.icon}</span>
                        )}
                        {option.label}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        )
      }}
      {...props}
    />
  )
}

SelectField.displayName = 'SelectField'

export { SelectField, selectVariants }
