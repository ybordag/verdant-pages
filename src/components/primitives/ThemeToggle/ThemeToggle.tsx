import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme/ThemeProvider'
import s from './ThemeToggle.module.css'

interface ThemeToggleProps {
  vertical?: boolean
}

export default function ThemeToggle({ vertical = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={s.toggle}
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'light'}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      <span className={s.track} data-theme={theme} data-vertical={vertical}>
        <Sun size={13} className={theme === 'light' ? s.iconActive : s.iconInactive} />
        <Moon size={13} className={theme === 'dark' ? s.iconActive : s.iconInactive} />
        <span className={s.thumb} />
      </span>
    </button>
  )
}
