/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'

interface NavContextValue {
  collapsed: boolean
  toggle: () => void
  drawerOpen: boolean
  setDrawerOpen: (v: boolean) => void
}

const NavContext = createContext<NavContextValue | null>(null)

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('nav_collapsed') === 'true')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('nav_collapsed', String(collapsed))
  }, [collapsed])

  return (
    <NavContext.Provider value={{ collapsed, toggle: () => setCollapsed((v) => !v), drawerOpen, setDrawerOpen }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav(): NavContextValue {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}
