import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm text-gray-600">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors',
            'border-gray-200 focus:border-blue-500',
            error && 'border-red-400',
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500">{error}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'