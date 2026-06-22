import Button from '@/components/primitives/Button/Button'
import { FilterDatePicker, FilterSelect, type FilterOption } from './FilterControls'
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

function toOptions(values: string[]): FilterOption[] {
  return values.map((value) => ({ value, label: value.replaceAll('_', ' ') }))
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
        <div className={s.group}>
          <span className={s.label}>Category</span>
          <FilterSelect
            label="Category"
            value={filters.category}
            placeholder="All categories"
            options={toOptions(categoryOptions)}
            onChange={(value) => onChange(updateFilter(filters, 'category', value))}
          />
        </div>

        <div className={s.group}>
          <span className={s.label}>Event type</span>
          <FilterSelect
            label="Event type"
            value={filters.eventType}
            placeholder="All event types"
            options={toOptions(eventTypeOptions)}
            onChange={(value) => onChange(updateFilter(filters, 'eventType', value))}
          />
        </div>

        <div className={s.group}>
          <span className={s.label}>Subject</span>
          <FilterSelect
            label="Subject"
            value={filters.subjectType}
            placeholder="All subjects"
            options={toOptions(subjectTypeOptions)}
            onChange={(value) => onChange(updateFilter(filters, 'subjectType', value))}
          />
        </div>

        <div className={s.group}>
          <span className={s.label}>Since</span>
          <FilterDatePicker
            label="Since"
            value={filters.since}
            onChange={(value) => onChange(updateFilter(filters, 'since', value))}
          />
        </div>

        <div className={s.group}>
          <span className={s.label}>Before</span>
          <FilterDatePicker
            label="Before"
            value={filters.before}
            onChange={(value) => onChange(updateFilter(filters, 'before', value))}
          />
        </div>
      </div>
    </aside>
  )
}
