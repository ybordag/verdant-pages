import s from './Chip.module.css'

interface ChipProps {
  children: React.ReactNode
  onRemove?: () => void
  className?: string
  style?: React.CSSProperties
}

export default function Chip({ children, onRemove, className = '', style }: ChipProps) {
  return (
    <span className={[s.chip, className].filter(Boolean).join(' ')} style={style}>
      {children}
      {onRemove && (
        <button className={s.remove} onClick={onRemove} aria-label="Remove" type="button">
          ×
        </button>
      )}
    </span>
  )
}
