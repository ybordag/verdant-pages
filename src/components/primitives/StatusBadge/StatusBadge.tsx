import s from './StatusBadge.module.css'

type Color = 'neutral' | 'green' | 'amber' | 'red' | 'blue' | 'purple'

interface StatusBadgeProps {
  children: React.ReactNode
  color?: Color
  className?: string
}

export default function StatusBadge({ children, color = 'neutral', className = '' }: StatusBadgeProps) {
  return (
    <span className={[s.badge, s[color], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  )
}
