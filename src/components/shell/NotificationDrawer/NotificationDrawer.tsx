import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNav } from '@/components/shell/VPNav/NavContext'
import s from './NotificationDrawer.module.css'

export default function NotificationDrawer() {
  const { drawerOpen, setDrawerOpen } = useNav()

  useEffect(() => {
    if (!drawerOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [drawerOpen, setDrawerOpen])

  if (!drawerOpen) return null

  return createPortal(
    <div className={s.overlay}>
      <div className={s.backdrop} onMouseDown={() => setDrawerOpen(false)} />
      <div className={s.drawer} role="dialog" aria-label="Notifications" aria-modal="true">
        <div className={s.header}>
          <span className={s.title}>Notifications</span>
          <button className={s.close} onClick={() => setDrawerOpen(false)} aria-label="Close">×</button>
        </div>
        <div className={s.body}>
          <p className={s.empty}>No notifications yet.</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
