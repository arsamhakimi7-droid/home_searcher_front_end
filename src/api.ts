import type {
  Affordability, Agent, Category, LeadOut, Message, MortgageCalc, Neighborhood, PreApprovalOut,
  Property, PropertyPage, Rates, SearchFilters, Suggestion, TokenOut, User,
} from './types'

const BASE = (import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8000/api').replace(/\/+$/, '')
const TOKEN_KEY = 'homefind.token'
export const AUTH_EXPIRED_EVENT = 'homefind:auth-expired'

export const tokenStore = {
  get(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token: string | null) {
    try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
  },
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ValidationError {
  loc?: unknown[]
  msg?: string
}

function messageFrom(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return typeof body === 'string' && body ? body : fallback
  const detail = (body as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length) {
    return (detail as ValidationError[]).map(error => {
      const location = Array.isArray(error.loc) ? error.loc.filter(part => part !== 'body').join('.') : ''
      const message = error.msg || 'Invalid value'
      return location ? `${location}: ${message}` : message
    }).join('; ')
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers })
  } catch (error) {
    if (init.signal?.aborted) throw error
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?')
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let body: unknown = null
  if (text) {
    try {
      body = JSON.parse(text) as unknown
    } catch {
      body = text
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      tokenStore.set(null)
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiError(response.status, messageFrom(body, `Request failed (${response.status})`))
  }
  if (text && typeof body === 'string') {
    throw new ApiError(response.status, 'The server returned an invalid JSON response.')
  }
  return body as T
}

const post = <T>(path: string, data: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(data) })

function queryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    const serialized = key === 'home_type' && Array.isArray(value) ? value.join(',') : String(value)
    search.set(key, serialized)
  }
  const query = search.toString()
  return query ? `?${query}` : ''
}

export const api = {
  auth: {
    register: (data: { full_name: string; email: string; password: string }) =>
      post<TokenOut>('/auth/register', data),
    login: (data: { email: string; password: string }) => post<TokenOut>('/auth/login', data),
    me: () => request<User>('/auth/me'),
  },
  properties: {
    search: (filters: Partial<SearchFilters> = {}, page = filters.page ?? 1, page_size = filters.page_size ?? 12) =>
      request<PropertyPage>(`/properties${queryString({ ...filters, page, page_size })}`),
    trending: () => request<Property[]>('/properties/trending'),
    recommended: () => request<Property[]>('/properties/recommended'),
    categories: () => request<Category[]>('/properties/categories'),
    suggestions: (q: string, signal?: AbortSignal) =>
      request<Suggestion[]>(`/properties/suggestions${queryString({ q })}`, { signal }),
    getById: (id: number) => request<Property>(`/properties/${encodeURIComponent(id)}`),
  },
  favorites: {
    list: () => request<Property[]>('/favorites'),
    ids: () => request<number[]>('/favorites/ids'),
    add: (id: number) => request<void>(`/favorites/${encodeURIComponent(id)}`, { method: 'PUT' }),
    remove: (id: number) => request<void>(`/favorites/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  },
  agents: {
    list: (limit = 4) => request<Agent[]>(`/agents${queryString({ limit })}`),
    get: (id: number) => request<Agent>(`/agents/${encodeURIComponent(id)}`),
    contact: (id: number, data: {
      name: string; email: string; phone?: string; message: string; property_id?: number
    }) => post<LeadOut>(`/agents/${encodeURIComponent(id)}/contact`, data),
  },
  neighborhoods: {
    search: (q?: string, limit?: number) =>
      request<Neighborhood[]>(`/neighborhoods${queryString({ q, limit })}`),
    byZip: (zipCode: string) => request<Neighborhood>(`/neighborhoods/${encodeURIComponent(zipCode)}`),
  },
  mortgage: {
    rates: () => request<Rates>('/mortgage/rates'),
    calculate: (data: {
      home_price: number; down_payment_pct?: number; down_payment?: number; annual_rate?: number; years?: number
    }) => post<MortgageCalc>('/mortgage/calculate', data),
    affordability: (data: {
      annual_income: number; monthly_debts?: number; down_payment?: number; credit_band?: string; years?: number
    }) => post<Affordability>('/mortgage/affordability', data),
    preApproval: (data: {
      full_name: string; email: string; annual_income: number; monthly_debts?: number; down_payment?: number
      credit_band?: string; years?: number; phone?: string
    }) => post<PreApprovalOut>('/mortgage/pre-approval', data),
  },

  subscribe: (email: string) => post<Message>('/subscribe', { email, topic: 'app-alerts' }),
  health: () => request<Message>('/health'),
}
