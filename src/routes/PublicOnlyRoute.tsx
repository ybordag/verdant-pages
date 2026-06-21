import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth/context'

export default function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (user) return <Navigate to="/app/today" replace />

  return <Outlet />
}
