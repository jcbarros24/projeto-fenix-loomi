'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type SliderProps = Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type'
> & {
  min: number
  max: number
  step?: number
  value: number
  onValueChange: (value: number) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min, max, step = 1, value, onValueChange, ...props }, ref) => {
    const percent = ((value - min) / (max - min)) * 100

    return (
      <div className={cn('relative w-full', className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="slider-thumb h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent"
          style={{
            background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(37 99 235) ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`,
          }}
          {...props}
        />
      </div>
    )
  },
)
Slider.displayName = 'Slider'

export { Slider }
