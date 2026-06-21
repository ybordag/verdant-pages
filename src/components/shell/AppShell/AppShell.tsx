import { Outlet } from 'react-router-dom'
import { NavProvider } from '@/components/shell/AppNav/NavContext'
import AppNav from '@/components/shell/AppNav/AppNav'
import NotificationDrawer from '@/components/shell/NotificationDrawer/NotificationDrawer'
import OfflineBanner from '@/components/shell/OfflineBanner/OfflineBanner'
import ToastHost from '@/components/shell/Toast/ToastHost'
import s from './AppShell.module.css'

export default function AppShell() {
  return (
    <NavProvider>
      <div className={s.shell}>
        <AppNav />
        <div className={s.content}>
          <OfflineBanner />
          <main className={s.main}>
            <Outlet />
          </main>
        </div>
        <NotificationDrawer />
        <ToastHost />
      </div>
    </NavProvider>
  )
}
