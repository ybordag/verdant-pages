import { createContext, useContext, useEffect, useRef, useState } from 'react'
import * as authApi from '@/lib/api/auth'
import { router } from '@/routes/router'
import type { SessionResponse } from '@/lib/types/cambium'

const REFRESH_INTERVAL_MS = 12 * 60 * 1000
const STALE_AFTER_MS = 10 * 60 * 1000

interface AuthContextValue {
  user: SessionResponse | null
  isLoading: boolean
  login(email: string, password: string): Promise<void>
  register(email: string, password: string): Promise<void>
  logout(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const lastRefreshAt = useRef<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasMountedRef = useRef(false)

  function startProactiveRefresh() {
    lastRefreshAt.current = Date.now()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(async () => {
      const ok = await authApi.tryRefreshToken()
      if (ok) lastRefreshAt.current = Date.now()
      else setUser(null)
    }, REFRESH_INTERVAL_MS)
  }

  function stopProactiveRefresh() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
  }

  useEffect(() => {
    // StrictMode double-invokes this effect in dev (mount → cleanup → mount
    // again) without resetting refs. /auth/refresh rotates the refresh-token
    // cookie on every call, so firing it twice in quick succession races one
    // rotation against the other's revoke — this guard ensures the real
    // refresh-on-mount logic runs exactly once per actual mount.
    if (hasMountedRef.current) return
    hasMountedRef.current = true

    // No cancellation tracking here: the guard above already makes this body
    // unreachable a second time, so there's no real concurrent invocation to
    // cancel — and AuthProvider never genuinely unmounts during this app's
    // lifetime. (An earlier version used a `cancelled` flag set in a cleanup
    // function, but StrictMode's contrived mount→cleanup→mount cycle ran
    // that cleanup before this async work resolved, permanently skipping
    // setIsLoading(false) and hanging the app in a loading state.)
    async function silentRefresh() {
      const ok = await authApi.tryRefreshToken()
      if (ok) {
        lastRefreshAt.current = Date.now()
        try {
          const session = await authApi.getSession()
          setUser(session)
        } catch {
          setUser(null)
        }
        startProactiveRefresh()
      }
      setIsLoading(false)
    }
    silentRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRefreshAt.current > STALE_AFTER_MS) {
        authApi.tryRefreshToken().then((ok) => {
          if (ok) lastRefreshAt.current = Date.now()
          else setUser(null)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  async function login(email: string, password: string) {
    const session = await authApi.login(email, password)
    setUser(session)
    startProactiveRefresh()
    router.navigate('/app/today')
  }

  async function register(email: string, password: string) {
    const session = await authApi.register(email, password)
    setUser(session)
    startProactiveRefresh()
    router.navigate('/app/today')
  }

  async function logout() {
    await authApi.logout()
    stopProactiveRefresh()
    setUser(null)
    router.navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
