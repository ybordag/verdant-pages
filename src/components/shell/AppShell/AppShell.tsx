import { Outlet } from 'react-router-dom'
import { NavProvider } from '@/components/shell/AppNav/NavContext'
import AppNav from '@/components/shell/AppNav/AppNav'
import NotificationDrawer from '@/components/shell/NotificationDrawer/NotificationDrawer'
import s from './AppShell.module.css'

export default function AppShell() {
  return (
    <NavProvider>
      <div className={s.shell}>
        <AppNav />
        <div className={s.content}>
          <main className={s.main}>
            <Outlet />
          </main>
        </div>
        <NotificationDrawer />
      </div>
    </NavProvider>
  )
}
