import { createPortal } from 'react-dom'
import s from './Toast.module.css'

export interface ToastItem {
  id: string
  message: string
  onClick?: () => void
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (!toasts.length) return null

  return createPortal(
    <div className={s.container}>
      {toasts.map((t) => (
        <div key={t.id} className={s.toast} onClick={() => { t.onClick?.(); onDismiss(t.id) }}>
          {t.message}
        </div>
      ))}
    </div>,
    document.body,
  )
}
