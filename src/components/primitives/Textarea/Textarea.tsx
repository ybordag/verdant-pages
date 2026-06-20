import type { TextareaHTMLAttributes } from 'react'
import s from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export default function Textarea({ className = '', ...props }: TextareaProps) {
  return <textarea className={[s.textarea, className].filter(Boolean).join(' ')} {...props} />
}
