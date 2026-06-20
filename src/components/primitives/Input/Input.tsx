import type { InputHTMLAttributes } from 'react'
import s from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className = '', ...props }: InputProps) {
  return <input className={[s.input, className].filter(Boolean).join(' ')} {...props} />
}
