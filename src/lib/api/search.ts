import { apiFetch, toQueryString } from './client'
import type { SearchResultsView } from '@/lib/types/rhizome'

export function search(params: { q: string; types?: string; limit?: number }): Promise<SearchResultsView> {
  return apiFetch(`/api/v1/search${toQueryString(params)}`)
}
