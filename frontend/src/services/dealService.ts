import api from './api'

export interface Deal {
  id: string
  title: string
  amount: number
  status: 'pending' | 'active' | 'completed' | 'disputed'
  buyerId: string
  sellerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateDealPayload {
  title: string
  amount: number
  sellerId: string
  description?: string
}

// ── Fetch all deals for the current user ────────────────────────────
export async function getDeals(): Promise<Deal[]> {
  const res = await api.get<Deal[]>('/deals')
  return res.data
}

// ── Fetch a single deal by ID ────────────────────────────────────────
export async function getDeal(id: string): Promise<Deal> {
  const res = await api.get<Deal>(`/deals/${id}`)
  return res.data
}

// ── Create a new deal ────────────────────────────────────────────────
export async function createDeal(payload: CreateDealPayload): Promise<Deal> {
  const res = await api.post<Deal>('/deals', payload)
  return res.data
}

// ── Approve / release funds ──────────────────────────────────────────
export async function approveDeal(id: string): Promise<Deal> {
  const res = await api.patch<Deal>(`/deals/${id}/approve`)
  return res.data
}

// ── Raise a dispute ──────────────────────────────────────────────────
export async function disputeDeal(id: string, reason: string): Promise<Deal> {
  const res = await api.patch<Deal>(`/deals/${id}/dispute`, { reason })
  return res.data
}
