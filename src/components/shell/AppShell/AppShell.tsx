import { Outlet } from 'react-router-dom'
import { NavProvider } from '@/components/shell/VPNav/NavContext'
import VPNav from '@/components/shell/VPNav/VPNav'
import NotificationDrawer from '@/components/shell/NotificationDrawer/NotificationDrawer'
import s from './AppShell.module.css'

export default function AppShell() {
  return (
    <NavProvider>
      <div className={s.shell}>
        <VPNav />
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
