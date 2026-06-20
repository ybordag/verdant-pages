import { Link } from 'react-router-dom'
import ThemeToggle from '@/components/primitives/ThemeToggle/ThemeToggle'
import s from './AuthLayout.module.css'

interface AuthLayoutProps {
  tagline: string
  children: React.ReactNode
}

export default function AuthLayout({ tagline, children }: AuthLayoutProps) {
  return (
    <div className={s.page}>
      <div className={s.topRight}>
        <ThemeToggle />
      </div>
      <div className={s.card}>
        <Link to="/" className={s.logo}>Verdant Pages</Link>
        <p className={s.tagline}>{tagline}</p>
        {children}
      </div>
    </div>
  )
}
