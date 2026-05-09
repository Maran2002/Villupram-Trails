import React from 'react'
import { cva } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-400 text-white hover:bg-primary-500 hover:shadow-premium-md',
        secondary: 'bg-secondary-400 text-white hover:bg-secondary-500',
        outline: 'border-2 border-primary-400 text-primary-400 hover:bg-primary-400/10',
        ghost: 'text-primary-400 hover:bg-primary-400/10',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

export const Button = React.forwardRef(
  ({ className, variant, size, isLoading, children, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(buttonVariants({ variant, size }), className)}
      disabled={props.disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
