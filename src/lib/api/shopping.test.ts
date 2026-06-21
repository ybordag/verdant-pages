import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as client from './client'
import * as shopping from './shopping'

vi.mock('./client', async () => {
  const actual = await vi.importActual<typeof client>('./client')
  return { ...actual, apiFetch: vi.fn() }
})

describe('shopping API', () => {
  beforeEach(() => {
    vi.mocked(client.apiFetch).mockResolvedValue({ ok: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('listShopping omits the query string when no params are given', async () => {
    await shopping.listShopping()
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/shopping')
  })

  it('listShopping builds a query string from params', async () => {
    await shopping.listShopping({ status: 'needed', project_id: 'proj-1' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/shopping?status=needed&project_id=proj-1')
  })

  it('createShoppingItem posts the item payload', async () => {
    const data = { name: 'Trellis netting', category: 'supplies' }
    await shopping.createShoppingItem(data)
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/shopping', { method: 'POST', body: JSON.stringify(data) })
  })

  it('updateShoppingItem PATCHes the item payload', async () => {
    await shopping.updateShoppingItem('item-1', { status: 'purchased' })
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/shopping/item-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'purchased' }),
    })
  })

  it('deleteShoppingItem issues a DELETE', async () => {
    await shopping.deleteShoppingItem('item-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/shopping/item-1', { method: 'DELETE' })
  })

  it('purchaseShoppingItem posts to the purchase endpoint', async () => {
    await shopping.purchaseShoppingItem('item-1')
    expect(client.apiFetch).toHaveBeenCalledWith('/api/v1/shopping/item-1/purchase', { method: 'POST' })
  })
})
