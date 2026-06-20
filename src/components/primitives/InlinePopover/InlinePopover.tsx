import { useEffect, useRef } from 'react'
import s from './InlinePopover.module.css'

interface InlinePopoverProps {
  open: boolean
  onClose: () => void
  trigger: React.ReactNode
  children: React.ReactNode
  className?: string
}

export default function InlinePopover({ open, onClose, trigger, children, className = '' }: InlinePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div className={s.anchor} ref={ref}>
      {trigger}
      {open && (
        <div className={[s.popover, className].filter(Boolean).join(' ')}>
          {children}
        </div>
      )}
    </div>
  )
}
