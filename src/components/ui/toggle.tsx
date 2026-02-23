'use client'

import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  labelLeft?: string
  labelRight?: string
  'aria-label'?: string
  size?: 'sm' | 'md'
  className?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  labelLeft,
  labelRight,
  'aria-label': ariaLabel,
  size = 'md',
  className,
}: ToggleSwitchProps) {
  const track = {
    sm: 'w-9 h-5',
    md: 'w-12 h-6',
  }[size]

  const thumb = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  }[size]

  const translate = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-6' : 'translate-x-0.5',
  }[size]

  return (
    <label
      className={cn('inline-flex items-center gap-2 cursor-pointer select-none', className)}
      aria-label={ariaLabel || label}
    >
      {labelLeft && (
        <span className={cn('text-sm font-medium', !checked ? 'text-gray-900' : 'text-gray-400')}>
          {labelLeft}
        </span>
      )}
      <button
        role="switch"
        type="button"
        aria-checked={checked}
        aria-label={ariaLabel || label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
          track,
          checked ? 'bg-primary-600' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out my-0.5',
            thumb,
            translate
          )}
        />
      </button>
      {labelRight && (
        <span className={cn('text-sm font-medium', checked ? 'text-gray-900' : 'text-gray-400')}>
          {labelRight}
        </span>
      )}
      {label && !labelLeft && !labelRight && (
        <span className="text-sm font-medium text-gray-700">{label}</span>
      )}
    </label>
  )
}

// Segment control (for NEW / USED)
interface SegmentControlProps {
  value: string
  options: Array<{ value: string; label: string; count?: number }>
  onChange: (value: string) => void
  className?: string
}

export function SegmentControl({ value, options, onChange, className }: SegmentControlProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-xl bg-gray-100 p-1 gap-1',
        className
      )}
      role="tablist"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          type="button"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {opt.label}
          {opt.count !== undefined && (
            <span
              className={cn(
                'ml-1.5 text-xs px-1.5 py-0.5 rounded-full',
                value === opt.value ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-500'
              )}
            >
              {opt.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
