import type { ButtonHTMLAttributes } from 'react'
import s from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'ghost-clay' | 'danger'
  size?: 'sm' | 'md'
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={[s.btn, s[variant], s[size], className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
