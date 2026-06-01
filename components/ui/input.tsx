import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: Props) {
  return (
    <input
      {...props}
      className={cn(
        'w-full bg-white border-2 border-stone-200 rounded-2xl px-5 py-3.5',
        'text-base font-semibold text-stone-900',
        'placeholder:text-stone-400 placeholder:font-medium',
        'focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100',
        'transition-colors',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className
      )}
    />
  )
}
