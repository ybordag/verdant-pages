import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import s from './FilterControls.module.css'

export interface FilterOption {
  value: string
  label: string
}

interface FilterSelectProps {
  label: string
  value: string
  placeholder: string
  options: FilterOption[]
  onChange: (value: string) => void
}

interface FilterDatePickerProps {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const monthFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const displayDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
})

function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose()
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, open])

  return ref
}

function humanDate(value: string): string {
  if (!value) return 'Any date'
  return displayDateFormatter.format(parseDate(value))
}

function isoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function buildMonthDays(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return date
  })
}

export function FilterSelect({ label, value, placeholder, options, onChange }: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)
  const allOptions = [{ value: '', label: placeholder }, ...options]
  const ref = useDismiss(open, () => setOpen(false))

  return (
    <div className={s.control} ref={ref}>
      <button
        type="button"
        className={s.trigger}
        data-open={open}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={[s.triggerText, value ? '' : s.placeholder].filter(Boolean).join(' ')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={s.icon} size={17} aria-hidden="true" />
      </button>
      {open && (
        <div className={s.menu} role="listbox" aria-label={label}>
          {allOptions.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              className={s.option}
              role="option"
              aria-selected={option.value === value}
              data-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
            >
              <Check className={s.check} size={17} aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function FilterDatePicker({ label, value, error, onChange }: FilterDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(() => (value ? parseDate(value) : new Date()))
  const ref = useDismiss(open, () => setOpen(false))
  const selected = value ? parseDate(value) : null
  const days = useMemo(() => buildMonthDays(viewMonth), [viewMonth])
  const errorId = error ? `${label.toLowerCase()}-date-error` : undefined

  return (
    <div className={s.control} ref={ref}>
      <button
        type="button"
        className={s.trigger}
        data-open={open}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        data-invalid={error ? true : undefined}
        onClick={() => {
          if (!open && value) setViewMonth(parseDate(value))
          setOpen((current) => !current)
        }}
      >
        <span className={[s.triggerText, value ? '' : s.placeholder].filter(Boolean).join(' ')}>
          {humanDate(value)}
        </span>
        <CalendarDays className={s.icon} size={17} aria-hidden="true" />
      </button>
      {open && (
        <div className={s.calendar} role="dialog" aria-label={`${label} calendar`}>
          <div className={s.calendarHeader}>
            <span className={s.month}>{monthFormatter.format(viewMonth)}</span>
            <div className={s.nav}>
              <button
                type="button"
                className={s.iconButton}
                aria-label={`Previous month for ${label}`}
                onClick={() => setViewMonth((month) => addMonths(month, -1))}
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={s.iconButton}
                aria-label={`Next month for ${label}`}
                onClick={() => setViewMonth((month) => addMonths(month, 1))}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className={s.weekdays} aria-hidden="true">
            {weekdays.map((day) => (
              <span className={s.weekday} key={day}>
                {day}
              </span>
            ))}
          </div>
          <div className={s.days}>
            {days.map((day) => {
              const dayValue = isoDate(day)
              return (
                <button
                  key={dayValue}
                  type="button"
                  className={s.day}
                  data-outside={day.getMonth() !== viewMonth.getMonth()}
                  data-selected={selected ? dayValue === isoDate(selected) : false}
                  aria-label={`${label} ${displayDateFormatter.format(day)}`}
                  onClick={() => {
                    onChange(dayValue)
                    setOpen(false)
                  }}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
          <div className={s.calendarFooter}>
            <button
              type="button"
              className={s.footerButton}
              onClick={() => {
                onChange(isoDate(new Date()))
                setOpen(false)
              }}
            >
              Today
            </button>
            <button
              type="button"
              className={s.footerButton}
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className={s.error} id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
