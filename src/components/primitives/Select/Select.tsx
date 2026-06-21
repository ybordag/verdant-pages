import type { SelectHTMLAttributes } from 'react'
import s from './Select.module.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export default function Select({ className = '', children, ...props }: SelectProps) {
  return (
    <select className={[s.select, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </select>
  )
}
