import type {
  Affordability, Agent, Category, MortgageCalc, Neighborhood, Property, PropertyPage,
  Rates, SearchFilters, Suggestion, TokenOut, User,
} from './types'

// In dev, Vite proxies /api to the FastAPI server. Set VITE_API_URL to call a remote API instead.
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const TOKEN_KEY = 'homefind.token'

export const tokenStore = {
  get(): string | null {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(t: string | null) {
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch { /* private mode */ }
  },
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

function messageFrom(body: any, fallback: string): string {
  const d = body?.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d.length) {
    // FastAPI validation errors: [{loc, msg}, ...]
    return d.map((e: any) => `${String(e.loc?.slice(-1)[0] ?? '')}: ${String(e.msg).replace(/^Value error, /, '')}`).join('; ')
  }
  return fallback
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body) headers.set('Content-Type', 'application/json')
  const token = tokenStore.get()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let res: Response
  try {
    res = await fetch(`${BASE}/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Is the backend running?')
  }
  if (res.status === 204) return undefined as T
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) tokenStore.set(null)   // expired / invalid token
    throw new ApiError(res.status, messageFrom(body, `Request failed (${res.status})`))
  }
  return body as T
}

const post = <T>(path: string, data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) })

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') sp.set(k, String(v))
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const api = {
  // auth
  register: (d: { full_name: string; email: string; password: string }) => post<TokenOut>('/auth/register', d),
  login: (d: { email: string; password: string }) => post<TokenOut>('/auth/login', d),
  me: () => request<User>('/auth/me'),

  // properties
  search: (f: Partial<SearchFilters>, page = 1, page_size = 8) =>
    request<PropertyPage>(`/properties${qs({ ...f, page, page_size })}`),
  trending: () => request<Property[]>('/properties/trending'),
  recommended: () => request<Property[]>('/properties/recommended'),
  categories: () => request<Category[]>('/properties/categories'),
  property: (id: number) => request<Property>(`/properties/${id}`),
  suggestions: (q: string) => request<Suggestion[]>(`/properties/suggestions${qs({ q })}`),

  // favorites
  favorites: () => request<Property[]>('/favorites'),
  favoriteIds: () => request<number[]>('/favorites/ids'),
  addFavorite: (id: number) => request<void>(`/favorites/${id}`, { method: 'PUT' }),
  removeFavorite: (id: number) => request<void>(`/favorites/${id}`, { method: 'DELETE' }),

  // agents
  agents: () => request<Agent[]>('/agents?limit=4'),
  contactAgent: (id: number, d: { name: string; email: string; phone?: string; message: string; property_id?: number }) =>
    post<{ id: number; detail: string }>(`/agents/${id}/contact`, d),

  // neighborhoods
  neighborhoods: (q?: string) => request<Neighborhood[]>(`/neighborhoods${qs({ q })}`),

  // mortgage
  rates: () => request<Rates>('/mortgage/rates'),
  calculate: (d: { home_price: number; down_payment_pct: number; annual_rate: number; years: number }) =>
    post<MortgageCalc>('/mortgage/calculate', d),
  preApproval: (d: {
    full_name: string; email: string; phone?: string; annual_income: number; monthly_debts: number
    down_payment: number; credit_band: string
  }) => post<{ id: number; detail: string; estimate: Affordability }>('/mortgage/pre-approval', d),

  // misc
  subscribe: (email: string) => post<{ detail: string }>('/subscribe', { email, topic: 'app-alerts' }),
}
