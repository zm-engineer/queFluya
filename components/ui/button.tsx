import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-400 disabled:bg-emerald-300 disabled:border-emerald-400',
  secondary:
    'bg-white text-stone-700 border-stone-200 hover:bg-stone-50',
  danger: '',
  ghost:
    'bg-transparent text-stone-600 border-transparent hover:text-emerald-600',
}

const VARIANT_STYLE: Partial<Record<Variant, { backgroundColor: string; color: string; borderColor: string }>> = {
  danger: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderColor: '#b91c1c',
  },
}

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-3.5 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  style,
  ...props
}: Props) {
  const inlineStyle = VARIANT_STYLE[variant]
  return (
    <button
      {...props}
      style={{ ...inlineStyle, ...style }}
      className={cn(
        'rounded-2xl border-b-4 font-black uppercase tracking-wide transition-transform duration-150',
        'active:translate-y-1 active:border-b-0',
        'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4',
        VARIANT[variant],
        SIZE[size],
        className
      )}
    >
      {children}
    </button>
  )
}
