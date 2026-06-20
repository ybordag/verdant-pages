import s from './ProgressBar.module.css'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
}

export default function ProgressBar({ value, max = 100, className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={[s.track, className].filter(Boolean).join(' ')} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={s.fill} style={{ width: `${pct}%` }} />
    </div>
  )
}
