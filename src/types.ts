export type ListingType = 'buy' | 'rent' | 'sold'

export interface Badge { key: string; label: string }
export interface AgentBrief { id: number; name: string; brokerage: string; avatar: string }

export interface Property {
  id: number
  address: string
  city: string
  state: string
  zip_code: string
  full_address: string
  price: number
  original_price: number | null
  beds: number
  baths: number
  sqft: number
  home_type: string
  listing_type: ListingType
  brokerage: string
  image: string
  description: string | null
  listed_at: string
  open_house_at: string | null
  badge: Badge | null
  est_monthly: number | null
  is_favorite: boolean
  agent: AgentBrief | null
}

export interface PropertyPage { items: Property[]; total: number; page: number; page_size: number; pages: number }
export interface Category { key: string; title: string; subtitle: string; image: string; count: number }
export interface Agent { id: number; name: string; brokerage: string; rating: number; recent_sales: number; avatar: string }
export interface User { id: number; email: string; full_name: string }
export interface TokenOut { access_token: string; token_type: string; user: User }

export interface Neighborhood {
  id: number; name: string; city: string; state: string; zip_code: string; description: string
  median_price: number; school_score: number; school_grade: string; walk_score: number
  crime_label: string; crime_is_low: boolean; label: string; schools_display: string; walk_display: string
}

export interface Suggestion { label: string; kind: 'city' | 'zip' | 'address'; value: string }

export interface MortgageCalc {
  home_price: number; down_payment: number; annual_rate: number; years: number; loan_amount: number
  principal_and_interest: number; property_tax: number; insurance: number; hoa: number
  total_monthly: number; total_interest: number; total_paid: number
}
export interface Rates { rates: { product: string; rate: number }[]; note: string }
export interface Affordability {
  max_price: number; loan_amount: number; monthly_housing_budget: number
  debt_to_income: number; rate_used: number; estimated_monthly_payment: number
}

export interface SearchFilters {
  q: string
  listing_type: ListingType
  category?: string
  min_price?: number
  max_price?: number
  beds?: number
  baths?: number
  home_type?: string
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'sqft_desc'
}
