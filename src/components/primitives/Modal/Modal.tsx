import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import s from './Modal.module.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null

    const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusable))
      if (!nodes.length) { e.preventDefault(); return }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      trapFocus(e)
    }

    document.addEventListener('keydown', onKey)
    panelRef.current?.querySelector<HTMLElement>(focusable)?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className={s.backdrop} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={s.panel} ref={panelRef} role="dialog" aria-modal="true" aria-label={title}>
        {title && (
          <div className={s.header}>
            <span className={s.title}>{title}</span>
            <button className={s.close} onClick={onClose} aria-label="Close">×</button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
