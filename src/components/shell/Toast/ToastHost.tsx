import { useEffect, useState } from 'react'
import { dismissToast, subscribeToasts } from '@/lib/toast/toastStore'
import ToastContainer, { type ToastItem } from './Toast'

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => subscribeToasts(setToasts), [])

  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />
}
