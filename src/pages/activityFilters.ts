import type { ActivityFilterErrors, ActivityFilters } from '@/components/activity/FilterRail'

function dateStamp(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getFilterErrors(filters: ActivityFilters, today = dateStamp(new Date())): ActivityFilterErrors {
  const errors: ActivityFilterErrors = {}
  if (filters.since && filters.since > today) {
    errors.since = 'Since cannot be in the future.'
  }
  if (filters.since && filters.before && filters.since > filters.before) {
    errors.before = 'Before must be after since.'
  }
  return errors
}
