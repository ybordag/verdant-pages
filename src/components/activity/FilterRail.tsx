import Button from '@/components/primitives/Button/Button'
import Input from '@/components/primitives/Input/Input'
import Select from '@/components/primitives/Select/Select'
import s from './FilterRail.module.css'

export interface ActivityFilters {
  category: string
  eventType: string
  subjectType: string
  since: string
  before: string
}

interface FilterRailProps {
  filters: ActivityFilters
  categoryOptions: string[]
  eventTypeOptions: string[]
  subjectTypeOptions: string[]
  onChange: (filters: ActivityFilters) => void
  onReset: () => void
}

function updateFilter(filters: ActivityFilters, key: keyof ActivityFilters, value: string): ActivityFilters {
  return { ...filters, [key]: value }
}

export default function FilterRail({
  filters,
  categoryOptions,
  eventTypeOptions,
  subjectTypeOptions,
  onChange,
  onReset,
}: FilterRailProps) {
  return (
    <aside className={s.rail} aria-label="Activity filters">
      <div className={s.header}>
        <h2 className={s.title}>Filters</h2>
        <Button variant="ghost" size="sm" type="button" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className={s.groups}>
        <label className={s.group}>
          <span className={s.label}>Category</span>
          <Select value={filters.category} onChange={(event) => onChange(updateFilter(filters, 'category', event.target.value))}>
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        </label>

        <label className={s.group}>
          <span className={s.label}>Event type</span>
          <Select value={filters.eventType} onChange={(event) => onChange(updateFilter(filters, 'eventType', event.target.value))}>
            <option value="">All event types</option>
            {eventTypeOptions.map((eventType) => (
              <option key={eventType} value={eventType}>
                {eventType.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        </label>

        <label className={s.group}>
          <span className={s.label}>Subject</span>
          <Select value={filters.subjectType} onChange={(event) => onChange(updateFilter(filters, 'subjectType', event.target.value))}>
            <option value="">All subjects</option>
            {subjectTypeOptions.map((subjectType) => (
              <option key={subjectType} value={subjectType}>
                {subjectType.replaceAll('_', ' ')}
              </option>
            ))}
          </Select>
        </label>

        <label className={s.group}>
          <span className={s.label}>Since</span>
          <Input type="date" value={filters.since} onChange={(event) => onChange(updateFilter(filters, 'since', event.target.value))} />
        </label>

        <label className={s.group}>
          <span className={s.label}>Before</span>
          <Input type="date" value={filters.before} onChange={(event) => onChange(updateFilter(filters, 'before', event.target.value))} />
        </label>
      </div>
    </aside>
  )
}
