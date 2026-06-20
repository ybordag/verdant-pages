import type { LabelHTMLAttributes } from 'react'
import s from './FieldLabel.module.css'

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export default function FieldLabel({ className = '', children, ...props }: FieldLabelProps) {
  return (
    <label className={[s.label, className].filter(Boolean).join(' ')} {...props}>
      {children}
    </label>
  )
}
