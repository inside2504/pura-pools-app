import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-opacity',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        className
      )}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  )
}