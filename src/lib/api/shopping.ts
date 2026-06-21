import { apiFetch, toQueryString } from './client'
import type { CreateShoppingRequest, ShoppingItemView, UpdateShoppingRequest } from '@/lib/types/rhizome'

export interface ShoppingListParams {
  status?: string
  project_id?: string
  category?: string
  priority?: string
}

export function listShopping(params?: ShoppingListParams): Promise<ShoppingItemView[]> {
  return apiFetch(`/api/v1/shopping${toQueryString(params)}`)
}

export function createShoppingItem(data: CreateShoppingRequest): Promise<ShoppingItemView> {
  return apiFetch('/api/v1/shopping', { method: 'POST', body: JSON.stringify(data) })
}

export function updateShoppingItem(id: string, data: UpdateShoppingRequest): Promise<ShoppingItemView> {
  return apiFetch(`/api/v1/shopping/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteShoppingItem(id: string): Promise<void> {
  return apiFetch(`/api/v1/shopping/${id}`, { method: 'DELETE' })
}

export function purchaseShoppingItem(id: string): Promise<ShoppingItemView> {
  return apiFetch(`/api/v1/shopping/${id}/purchase`, { method: 'POST' })
}
