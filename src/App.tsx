import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  imgApple, imgCircleX, imgDatabaseSearch, imgGraduationCap, imgHeroSection, imgHouse, imgIllustrationSide,
  imgLine2, imgMapMockup, imgPhoneSide, imgPlay, imgShieldCheck, imgTicketPercent, imgArrowRight,
} from './assets'
import { api } from './api'
import { AuthProvider, ToastProvider, useAuth, useToast } from './state'
import { AppAlertsModal, AuthModal, ContactModal, MortgageModal, PropertyModal } from './modals'
import PropertyCard from './PropertyCard'
import AgentCard from './AgentCard'
import Footer from './Footer'
import { money, opsz } from './ui'
import type { Agent, Category, ListingType, Neighborhood, Property, PropertyPage, SearchFilters } from './types'

/* ------------------------------------------------------------------ helpers */

function useLoad<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, set] = useState<{ data: T | null; error: string; loading: boolean }>({ data: null, error: '', loading: true })
  const [nonce, setNonce] = useState(0)
  useEffect(() => {
    let live = true
    set(s => ({ ...s, loading: true, error: '' }))
    fn().then(data => live && set({ data, error: '', loading: false }))
      .catch(e => live && set({ data: null, error: (e as Error).message, loading: false }))
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])
  return { ...state, retry: () => setNonce(n => n + 1) }
}

const SECTION = 'content-stretch flex flex-col gap-[32px] items-start px-[80px] py-[64px] relative shrink-0 w-full'

function SectionHeader({ kicker, title, action }: { kicker: string; title: string; action?: ReactNode }) {
  return (
    <div className="content-stretch flex items-end justify-between relative shrink-0 w-full">
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-start leading-[normal] relative shrink-0 whitespace-nowrap">
        <p className="font-['DM_Sans:Bold'] font-bold relative shrink-0 text-[#d92228] text-[12px] uppercase" style={opsz}>{kicker}</p>
        <h2 className="font-['Outfit:ExtraBold'] font-extrabold relative shrink-0 text-[#1e2022] text-[32px]">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Status({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex w-full items-center justify-between rounded-[12px] border border-[#f3b4b6] bg-[#fdecea] px-5 py-4 text-[14px] text-[#b3141a]">
      <span>{error}</span>
      <button onClick={onRetry} className="cursor-pointer font-bold underline">Retry</button>
    </div>
  )
}

function SkeletonRow({ n = 4, h = 440 }: { n?: number; h?: number }) {
  return (
    <div className="content-stretch flex gap-[24px] w-full" aria-busy="true">
      {Array.from({ length: n }).map((_, i) => <div key={i} className="flex-1 animate-pulse rounded-[12px] bg-[#e3e7eb]" style={{ height: h }} />)}
    </div>
  )
}

/* ------------------------------------------------------------------ filters */

const PRICE_OPTIONS: Record<ListingType, { label: string; min?: number; max?: number }[]> = {
  buy: [{ label: 'Any Price' }, { label: 'Under $500k', max: 500_000 }, { label: '$500k – $750k', min: 500_000, max: 750_000 }, { label: '$750k – $1M', min: 750_000, max: 1_000_000 }, { label: '$1M+', min: 1_000_000 }],
  sold: [{ label: 'Any Price' }, { label: 'Under $500k', max: 500_000 }, { label: '$500k – $750k', min: 500_000, max: 750_000 }, { label: '$750k – $1M', min: 750_000, max: 1_000_000 }, { label: '$1M+', min: 1_000_000 }],
  rent: [{ label: 'Any Price' }, { label: 'Under $2,500', max: 2_500 }, { label: '$2,500 – $3,500', min: 2_500, max: 3_500 }, { label: '$3,500+', min: 3_500 }],
}
const HOME_TYPES = [['house', 'House'], ['condo', 'Condo'], ['townhouse', 'Townhouse'], ['multi-family', 'Multi-family']] as const
const SORTS = [['newest', 'Newest'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['sqft_desc', 'Largest']] as const

const PILL = 'bg-[rgba(255,255,255,0.2)] border border-solid border-white content-stretch flex items-start px-[16px] py-[8px] relative rounded-[20px] shrink-0 cursor-pointer hover:bg-[rgba(255,255,255,0.3)]'

function Pill({ label, active, children }: { label: string; active: boolean; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const off = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button aria-haspopup="true" aria-expanded={open} onClick={() => setOpen(o => !o)} className={`${PILL} ${active ? '!bg-white' : ''}`}>
        <span className={`[word-break:break-word] font-['DM_Sans:SemiBold'] font-semibold leading-[normal] text-[12px] whitespace-nowrap ${active ? 'text-[#d92228]' : 'text-white'}`} style={opsz}>{label}</span>
      </button>
      {open && <div className="absolute left-0 top-[calc(100%+8px)] z-30 min-w-[220px] rounded-[12px] bg-white p-3 text-left text-[#1e2022] shadow-xl">{children(() => setOpen(false))}</div>}
    </div>
  )
}

function Option({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button onClick={onClick} className={`block w-full cursor-pointer rounded-[6px] px-3 py-[7px] text-left text-[13px] ${on ? 'bg-[#d92228] font-bold text-white' : 'hover:bg-[#f4f6f8]'}`}>{children}</button>
}

/* ------------------------------------------------------------------ page */

function Page() {
  const { user, ready, favoriteIds, toggleFavorite, requireAuth, authOpen, openAuth, signOut } = useAuth()
  const toast = useToast()

  // search state
  const [tab, setTab] = useState<ListingType>('buy')
  const [q, setQ] = useState('')
  const [price, setPrice] = useState(0)
  const [beds, setBeds] = useState<number | undefined>()
  const [baths, setBaths] = useState<number | undefined>()
  const [types, setTypes] = useState<string[]>([])
  const [sort, setSort] = useState<SearchFilters['sort']>('newest')
  const [results, setResults] = useState<{ title: string; page: PropertyPage | null; saved?: boolean; error?: string; loading: boolean } | null>(null)
  const searchSeq = useRef(0)
  const lastFilters = useRef<Partial<SearchFilters>>({})

  // suggestions
  const [sugg, setSugg] = useState<{ label: string; value: string }[]>([])
  const [showSugg, setShowSugg] = useState(false)

  // overlays
  const [openProperty, setOpenProperty] = useState<number | null>(null)
  const [contact, setContact] = useState<{ agent: { id: number; name: string }; property?: Property } | null>(null)
  const [mortgage, setMortgage] = useState<null | 'calc' | 'pre'>(null)
  const [appStore, setAppStore] = useState<string | null>(null)

  // data
  const trending = useLoad(() => api.trending(), [user?.id])
  const recommended = useLoad(() => api.recommended(), [user?.id])
  const categories = useLoad(() => api.categories(), [])
  const agents = useLoad(() => api.agents(), [])
  const [hoodQuery, setHoodQuery] = useState<string | undefined>()
  const hoods = useLoad(() => api.neighborhoods(hoodQuery), [hoodQuery])
  const [lastHood, setLastHood] = useState<Neighborhood | null>(null)
  useEffect(() => { if (hoods.data?.[0]) setLastHood(hoods.data[0]) }, [hoods.data])

  /* -- search -- */
  const buildFilters = useCallback((over: Partial<SearchFilters> = {}): Partial<SearchFilters> => {
    const p = PRICE_OPTIONS[tab][price] ?? PRICE_OPTIONS[tab][0]
    return {
      q: q.trim() || undefined, listing_type: tab, min_price: p.min, max_price: p.max, beds, baths,
      home_type: types.length ? types.join(',') : undefined, sort, ...over,
    }
  }, [tab, q, price, beds, baths, types, sort])

  const runSearch = useCallback(async (filters: Partial<SearchFilters>, title: string, append = false, pageNo = 1) => {
    const seq = ++searchSeq.current
    lastFilters.current = filters
    setResults(r => ({ title, page: append ? r?.page ?? null : null, loading: true }))
    if (!append) requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    try {
      const page = await api.search(filters, pageNo, 8)
      if (seq !== searchSeq.current) return
      setResults(r => ({ title, loading: false, page: append && r?.page ? { ...page, items: [...r.page.items, ...page.items] } : page }))
    } catch (e) {
      if (seq !== searchSeq.current) return
      setResults({ title, page: null, loading: false, error: (e as Error).message })
    }
  }, [])

  const submitSearch = useCallback((over: Partial<SearchFilters> = {}, qText = q) => {
    setShowSugg(false)
    const f = buildFilters({ q: qText.trim() || undefined, ...over })
    const label = { buy: 'Homes for sale', rent: 'Rentals', sold: 'Recently sold homes' }[f.listing_type as ListingType]
    void runSearch(f, f.q ? `${label} matching “${f.q}”` : label)
    if (f.q) setHoodQuery(f.q.split(',')[0]) // keep the neighborhood guide in step with the search
  }, [buildFilters, q, runSearch])

  const showCategory = (c: Category) => {
    const f: Partial<SearchFilters> = { category: c.key, sort: 'newest' }
    void runSearch(f, c.title)
  }
  const showAll = () => void runSearch({ listing_type: 'buy', sort: 'newest' }, 'All homes for sale')
  const showSaved = () => requireAuth(async () => {
    const seq = ++searchSeq.current
    setResults({ title: 'Your saved homes', page: null, saved: true, loading: true })
    requestAnimationFrame(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }))
    try {
      const items = await api.favorites()
      if (seq === searchSeq.current) setResults({ title: 'Your saved homes', saved: true, loading: false, page: { items, total: items.length, page: 1, page_size: items.length || 1, pages: 1 } })
    } catch (e) { setResults({ title: 'Your saved homes', saved: true, loading: false, page: null, error: (e as Error).message }) }
  })

  // Keep the saved list in sync when un-saving from inside it.
  useEffect(() => {
    setResults(r => r?.saved && r.page ? { ...r, page: { ...r.page, items: r.page.items.filter(p => favoriteIds.has(p.id)), total: r.page.items.filter(p => favoriteIds.has(p.id)).length } } : r)
  }, [favoriteIds])

  // Suggestions (debounced, stale-safe).
  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) { setSugg([]); return }
    let live = true
    const t = setTimeout(() => api.suggestions(term).then(s => live && setSugg(s)).catch(() => live && setSugg([])), 200)
    return () => { live = false; clearTimeout(t) }
  }, [q])

  const changeTab = (t: ListingType) => { setTab(t); setPrice(0) }
  const resetFilters = () => { setPrice(0); setBeds(undefined); setBaths(undefined); setTypes([]); setSort('newest') }
  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  const card = (p: Property, badgeOverride?: { key: string; label: string }) => (
    <PropertyCard key={p.id} property={p} badgeOverride={badgeOverride} isFavorite={favoriteIds.has(p.id)}
      onToggleFavorite={x => requireAuth(() => void toggleFavorite(x.id))} onOpen={x => setOpenProperty(x.id)} />
  )

  const hood = hoods.data?.[0] ?? lastHood
  const priceLabel = PRICE_OPTIONS[tab][price]?.label ?? 'Any Price'
  const bbLabel = beds || baths ? [beds && `${beds}+ bd`, baths && `${baths}+ ba`].filter(Boolean).join(' / ') : 'Beds / Baths'

  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="homefind-landing-page">
      {/* ---------------- Navbar ---------------- */}
      <header className="bg-white border-[#e3e7eb] border-b border-solid content-stretch flex h-[80px] items-center justify-between px-[80px] relative shrink-0 w-full">
        <div className="content-stretch flex gap-[40px] items-center relative shrink-0">
          <a href="/" className="content-stretch flex gap-[8px] items-center relative shrink-0" aria-label="HomeFind home">
            <div className="bg-[#d92228] content-stretch flex flex-col items-center justify-center relative rounded-[8px] shrink-0 size-[36px]">
              <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[20px]">
                <div className="relative shrink-0 size-[20px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHouse} /></div>
              </div>
            </div>
            <p className="[word-break:break-word] font-['Outfit:ExtraBold'] font-extrabold leading-[0] relative shrink-0 text-[#1e2022] text-[22px] whitespace-nowrap">
              <span className="leading-[normal]">Home</span><span className="leading-[normal] text-[#d92228]">Find</span>
            </p>
          </a>
          <nav className="[word-break:break-word] content-stretch flex font-['DM_Sans:SemiBold'] font-semibold gap-[24px] items-center leading-[normal] relative shrink-0 text-[#1e2022] text-[14px] whitespace-nowrap">
            {([
              ['Buy', () => { changeTab('buy'); goTo('hero') }], ['Sell', () => goTo('agents')],
              ['Rent', () => { changeTab('rent'); goTo('hero') }], ['Mortgage', () => setMortgage('calc')],
              ['Find Realtors', () => goTo('agents')],
            ] as const).map(([label, fn]) => (
              <button key={label} onClick={fn} className="relative shrink-0 cursor-pointer hover:text-[#d92228]" style={opsz}>{label}</button>
            ))}
          </nav>
        </div>
        <div className="content-stretch flex gap-[20px] items-center relative shrink-0">
          {user && <button onClick={showSaved} className="cursor-pointer font-['DM_Sans:SemiBold'] text-[14px] font-semibold hover:text-[#d92228]" style={opsz}>Saved ({favoriteIds.size})</button>}
          {ready && (user ? (
            <button onClick={signOut} className="cursor-pointer font-['DM_Sans:SemiBold'] text-[14px] font-semibold text-[#1e2022]" style={opsz} title="Sign out">
              {user.full_name.split(' ')[0]} · Sign out
            </button>
          ) : (
            <button onClick={openAuth} className="[word-break:break-word] cursor-pointer font-['DM_Sans:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#1e2022] text-[14px] whitespace-nowrap hover:text-[#d92228]" style={opsz}>Sign In / Join</button>
          ))}
          <button onClick={() => toast('Advertising inquiries are coming soon.')} className="bg-[#1e2022] content-stretch flex items-start px-[18px] py-[10px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-black">
            <span className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[13px] text-white whitespace-nowrap" style={opsz}>Advertise</span>
          </button>
        </div>
      </header>

      {/* ---------------- Hero + search ---------------- */}
      <section id="hero" className="content-stretch flex flex-col h-[540px] items-center justify-center px-[80px] relative shrink-0 w-full">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <img alt="" className="absolute max-w-none object-cover size-full" src={imgHeroSection} />
          <div className="absolute bg-[rgba(0,0,0,0.36)] inset-0" />
        </div>
        <div className="content-stretch flex flex-col gap-[28px] items-center relative shrink-0 w-[720px]">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
            <p className="font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[#e3e7eb] text-[14px] uppercase whitespace-nowrap" style={opsz}>Your Trusted Portal</p>
            <h1 className="font-['Outfit:ExtraBold'] font-extrabold leading-[1.15] min-w-full relative shrink-0 text-[48px] text-center text-white w-[min-content]">{`The Home You'll Love Is Here`}</h1>
          </div>
          <form onSubmit={e => { e.preventDefault(); submitSearch() }} role="search"
            className="bg-white content-stretch drop-shadow-[0px_8px_12px_rgba(0,0,0,0.15)] flex flex-col items-start p-[6px] relative rounded-[12px] shrink-0 w-full">
            <div className="content-stretch flex gap-[4px] items-start pl-[12px] py-[8px] relative shrink-0" role="tablist">
              {([['buy', 'Buy'], ['rent', 'Rent'], ['sold', 'Sold']] as const).map(([k, label]) => (
                <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => changeTab(k)}
                  className={`content-stretch flex items-start px-[16px] py-[6px] relative rounded-[6px] shrink-0 cursor-pointer ${tab === k ? 'bg-[#d92228]' : 'hover:bg-[#f4f6f8]'}`}>
                  <span className={`[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[13px] whitespace-nowrap ${tab === k ? 'text-white' : 'text-[#1e2022]'}`} style={opsz}>{label}</span>
                </button>
              ))}
            </div>
            <div className="content-stretch flex gap-[12px] h-[56px] items-center pl-[16px] pr-[6px] relative shrink-0 w-full">
              <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[20px]">
                <div className="relative shrink-0 size-[20px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgDatabaseSearch} /></div>
              </div>
              <input value={q} onChange={e => { setQ(e.target.value); setShowSugg(true) }} onFocus={() => setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)} aria-label="Search by address, city, ZIP or neighborhood"
                autoComplete="off" placeholder="Address, City, Zip, or Neighborhood..."
                className="flex-[1_0_0] bg-transparent font-['DM_Sans:Regular'] font-normal leading-[normal] min-w-px outline-none text-[#1e2022] placeholder:text-[#6a7074] text-[16px]" style={opsz} />
              <button type="submit" className="bg-[#d92228] content-stretch flex h-[44px] items-center justify-center px-[24px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#bf1d23]">
                <span className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[14px] text-white whitespace-nowrap" style={opsz}>Search</span>
              </button>
            </div>
            {showSugg && sugg.length > 0 && (
              <ul role="listbox" className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[12px] bg-white py-2 text-left shadow-xl">
                {sugg.map(s => (
                  <li key={s.label} role="option" aria-selected={false}>
                    <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { setQ(s.value); submitSearch({}, s.value) }}
                      className="block w-full cursor-pointer px-4 py-2 text-left text-[14px] text-[#1e2022] hover:bg-[#f4f6f8]">{s.label}</button>
                  </li>
                ))}
              </ul>
            )}
          </form>
          <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
            <Pill label={priceLabel} active={price !== 0}>{close => PRICE_OPTIONS[tab].map((o, i) => <Option key={o.label} on={price === i} onClick={() => { setPrice(i); close() }}>{o.label}</Option>)}</Pill>
            <Pill label={bbLabel} active={!!(beds || baths)}>{() => (
              <div className="w-[260px]">
                <p className="px-3 pb-1 text-[11px] font-bold uppercase text-[#6a7074]">Bedrooms</p>
                <div className="mb-2 flex gap-1">{[undefined, 1, 2, 3, 4, 5].map(n => <Option key={n ?? 'any'} on={beds === n} onClick={() => setBeds(n)}>{n ? `${n}+` : 'Any'}</Option>)}</div>
                <p className="px-3 pb-1 text-[11px] font-bold uppercase text-[#6a7074]">Bathrooms</p>
                <div className="flex gap-1">{[undefined, 1, 2, 3, 4].map(n => <Option key={n ?? 'any'} on={baths === n} onClick={() => setBaths(n)}>{n ? `${n}+` : 'Any'}</Option>)}</div>
              </div>
            )}</Pill>
            <Pill label={types.length ? `${types.length} type${types.length > 1 ? 's' : ''}` : 'Home Type'} active={types.length > 0}>{() =>
              HOME_TYPES.map(([k, label]) => <Option key={k} on={types.includes(k)} onClick={() => setTypes(t => t.includes(k) ? t.filter(x => x !== k) : [...t, k])}>{types.includes(k) ? '✓ ' : ''}{label}</Option>)}</Pill>
            <Pill label="More Filters" active={sort !== 'newest'}>{close => (
              <div>
                <p className="px-3 pb-1 text-[11px] font-bold uppercase text-[#6a7074]">Sort by</p>
                {SORTS.map(([k, label]) => <Option key={k} on={sort === k} onClick={() => setSort(k)}>{label}</Option>)}
                <button onClick={() => { resetFilters(); close() }} className="mt-2 w-full cursor-pointer px-3 py-2 text-left text-[13px] font-bold text-[#d92228]">Reset all filters</button>
              </div>
            )}</Pill>
          </div>
        </div>
      </section>

      {/* ---------------- Search results ---------------- */}
      {results && (
        <section id="results" className={`${SECTION} bg-[#f4f6f8] scroll-mt-4`} aria-live="polite">
          <SectionHeader kicker="Results" title={results.title}
            action={<button onClick={() => { searchSeq.current++; setResults(null) }} className="cursor-pointer font-['DM_Sans:Bold'] text-[14px] font-bold text-[#d92228]" style={opsz}>Clear ✕</button>} />
          {results.error ? <Status error={results.error} onRetry={() => void runSearch(lastFilters.current, results.title)} /> :
            results.loading && !results.page ? <SkeletonRow /> :
            results.page && results.page.items.length === 0 ? (
              <p className="py-10 text-[16px] text-[#6a7074]">{results.saved ? 'You haven’t saved any homes yet. Tap the heart on a listing to save it.' : 'No homes match your search. Try widening your filters or searching a different area.'}</p>
            ) : results.page && (
              <>
                <p className="text-[14px] text-[#6a7074]">{results.page.total} {results.page.total === 1 ? 'home' : 'homes'} found</p>
                <div className="grid w-full grid-cols-4 gap-[24px]">{results.page.items.map(p => card(p))}</div>
                {results.page.page < results.page.pages && (
                  <button disabled={results.loading} onClick={() => void runSearch(lastFilters.current, results.title, true, results.page!.page + 1)}
                    className="mx-auto cursor-pointer rounded-[8px] border border-[#1e2022] px-8 py-3 font-['DM_Sans:Bold'] text-[14px] font-bold disabled:opacity-50" style={opsz}>
                    {results.loading ? 'Loading…' : 'Load more'}
                  </button>
                )}
              </>
            )}
        </section>
      )}

      {/* ---------------- Trending ---------------- */}
      <section className={`bg-white ${SECTION}`}>
        <SectionHeader kicker="Hot Deals" title="Trending Homes in Your Area" action={
          <button onClick={showAll} className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer">
            <span className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] text-[#d92228] text-[14px] whitespace-nowrap" style={opsz}>View All Properties</span>
            <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[14px]"><div className="relative shrink-0 size-[14px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight} /></div></div>
          </button>} />
        {trending.error ? <Status error={trending.error} onRetry={trending.retry} /> : trending.loading ? <SkeletonRow /> :
          <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">{trending.data?.map(p => card(p))}</div>}
      </section>

      {/* ---------------- Categories ---------------- */}
      <section className={`bg-[#f4f6f8] ${SECTION}`}>
        <SectionHeader kicker="Discovery" title="Explore Homes" />
        {categories.error ? <Status error={categories.error} onRetry={categories.retry} /> : categories.loading ? <SkeletonRow n={3} h={160} /> : (
          <div className="grid w-full grid-cols-3 gap-[24px]">
            {categories.data?.map(c => (
              <button key={c.key} onClick={() => showCategory(c)} aria-label={`${c.title}: ${c.count} homes`}
                className="content-stretch flex flex-col h-[160px] items-start overflow-clip relative rounded-[12px] cursor-pointer text-left transition-transform hover:-translate-y-[2px]">
                <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[12px]">
                  <img alt="" loading="lazy" className="absolute max-w-none object-cover rounded-[12px] size-full" src={c.image} />
                  <div className="absolute bg-[rgba(0,0,0,0.36)] inset-0 rounded-[12px]" />
                </div>
                <div className="absolute content-stretch flex flex-col gap-[4px] inset-0 items-start justify-end p-[20px]">
                  <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[normal] text-[20px] text-white">{c.title}</p>
                  <p className="[word-break:break-word] font-['DM_Sans:Regular'] font-normal leading-[normal] text-[#e3e7eb] text-[13px]" style={opsz}>{c.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- Agents ---------------- */}
      <section id="agents" className={`bg-[#f4f6f8] ${SECTION} !pt-0 scroll-mt-4`}>
        <SectionHeader kicker="Expert Help" title="Find a Local Realtor" />
        {agents.error ? <Status error={agents.error} onRetry={agents.retry} /> : agents.loading ? <SkeletonRow h={320} /> :
          <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
            {agents.data?.map((a: Agent) => <AgentCard key={a.id} agent={a} onContact={x => setContact({ agent: x })} />)}
          </div>}
      </section>

      {/* ---------------- Neighborhood ---------------- */}
      <section className={`bg-white ${SECTION}`}>
        <SectionHeader kicker="Local Guides" title="Get to Know Your Neighborhood" />
        {hoods.error && !hood ? <Status error={hoods.error} onRetry={hoods.retry} /> : hood ? (
          <div className="content-stretch flex gap-[48px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-[1_0_0] flex-col h-[420px] items-start min-w-px overflow-clip relative rounded-[16px]">
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[16px] size-full" src={imgMapMockup} />
              <div className="-translate-x-1/2 -translate-y-1/2 absolute bg-[#d92228] content-stretch drop-shadow-[0px_4px_4px_rgba(0,0,0,0.15)] flex items-start left-1/2 px-[12px] py-[6px] rounded-[20px] top-[calc(50%-40px)]">
                <p className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] text-[12px] text-white whitespace-nowrap" style={opsz}>{hood.label}</p>
              </div>
            </div>
            <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[480px]">
              <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
                <p className="font-['Outfit:Bold'] font-bold leading-[normal] text-[#1e2022] text-[24px]">{hood.name}</p>
                <p className="font-['DM_Sans:Regular'] font-normal leading-[1.5] text-[#6a7074] text-[15px]" style={opsz}>{hood.description}</p>
              </div>
              <div className="h-0 relative shrink-0 w-full"><div className="absolute inset-[-1px_0_0_0]"><img alt="" className="block max-w-none size-full" src={imgLine2} /></div></div>
              <dl className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full">
                {([
                  [imgTicketPercent, 'Median Home Price', money(hood.median_price), '#1e2022'],
                  [imgGraduationCap, 'Schools Rating', hood.schools_display, hood.school_score >= 7 ? '#00875a' : '#1e2022'],
                  [imgCircleX, 'Walkability Score', hood.walk_display, '#1e2022'],
                  [imgShieldCheck, 'Crime Index', hood.crime_label, hood.crime_is_low ? '#00875a' : '#b26a00'],
                ] as const).map(([icon, label, value, color]) => (
                  <div key={label} className="content-stretch flex items-center justify-between relative shrink-0 w-full">
                    <dt className="content-stretch flex gap-[12px] items-center relative shrink-0">
                      <span className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[20px]"><img alt="" className="block size-[20px]" src={icon} /></span>
                      <span className="[word-break:break-word] font-['DM_Sans:SemiBold'] font-semibold leading-[normal] text-[#1e2022] text-[14px] whitespace-nowrap" style={opsz}>{label}</span>
                    </dt>
                    <dd className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[normal] text-[18px] whitespace-nowrap" style={{ color }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ) : hoods.loading ? <SkeletonRow n={1} h={420} /> : <p className="text-[#6a7074]">No neighborhood guide for “{hoodQuery}” yet.</p>}
      </section>

      {/* ---------------- Mortgage ---------------- */}
      <section className="bg-white content-stretch flex flex-col items-start p-[80px] relative shrink-0 w-full">
        <div className="bg-[#1e2022] content-stretch flex gap-[48px] items-center p-[56px] relative rounded-[20px] shrink-0 w-full">
          <div className="flex-[1_0_0] h-[280px] min-w-px relative rounded-[12px]">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[12px] size-full" src={imgIllustrationSide} />
          </div>
          <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-[560px]">
            <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
              <p className="font-['DM_Sans:Bold'] font-bold leading-[normal] text-[#d92228] text-[12px] uppercase whitespace-nowrap" style={opsz}>Financial Tools</p>
              <h2 className="font-['Outfit:ExtraBold'] font-extrabold leading-[normal] min-w-full text-[36px] text-white w-[min-content]">See What You Can Afford</h2>
              <p className="font-['DM_Sans:Regular'] font-normal leading-[1.5] min-w-full text-[#e3e7eb] text-[16px] w-[min-content]" style={opsz}>Analyze your monthly payments, interest rates, and loan terms with our smart mortgage tools. Lock in pre-approval to boost your purchasing power.</p>
            </div>
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
              <button onClick={() => setMortgage('pre')} className="bg-[#d92228] content-stretch flex items-start px-[24px] py-[14px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-[#bf1d23]">
                <span className="font-['DM_Sans:Bold'] font-bold leading-[normal] text-[14px] text-white whitespace-nowrap" style={opsz}>Get Pre-Approved</span>
              </button>
              <button onClick={() => setMortgage('calc')} className="border border-solid border-white content-stretch flex items-start px-[24px] py-[14px] relative rounded-[8px] shrink-0 cursor-pointer hover:bg-white/10">
                <span className="font-['DM_Sans:Bold'] font-bold leading-[normal] text-[14px] text-white whitespace-nowrap" style={opsz}>Calculate Rates</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Recommended ---------------- */}
      <section className={`bg-[#f4f6f8] ${SECTION}`}>
        <SectionHeader kicker="Tailored For You" title="Homes You Might Like" />
        {recommended.error ? <Status error={recommended.error} onRetry={recommended.retry} /> : recommended.loading ? <SkeletonRow /> :
          <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
            {recommended.data?.map(p => card(p, { key: 'recommended', label: 'Recommended for you' }))}
          </div>}
      </section>

      {/* ---------------- Mobile app ---------------- */}
      <section className="bg-white content-stretch flex gap-[64px] items-center p-[80px] relative shrink-0 w-full">
        <div className="flex-[1_0_0] h-[420px] min-w-px relative rounded-[24px]">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[24px] size-full" src={imgPhoneSide} />
        </div>
        <div className="content-stretch flex flex-col gap-[28px] items-start relative shrink-0 w-[560px]">
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
            <p className="font-['DM_Sans:Bold'] font-bold leading-[normal] text-[#d92228] text-[12px] uppercase whitespace-nowrap" style={opsz}>Mobile App</p>
            <h2 className="font-['Outfit:ExtraBold'] font-extrabold leading-[normal] min-w-full text-[#1e2022] text-[36px] w-[min-content]">Search on the Go</h2>
            <p className="font-['DM_Sans:Regular'] font-normal leading-[1.5] min-w-full text-[#6a7074] text-[16px] w-[min-content]" style={opsz}>Stay ahead of the real estate market. Get instant push alerts when new homes match your searches, and save your favorites directly from your phone.</p>
          </div>
          <div className="content-stretch flex gap-[16px] items-center relative shrink-0">
            {([['Download on', 'App Store', imgApple], ['Get it on', 'Google Play', imgPlay]] as const).map(([small, big, icon]) => (
              <button key={big} onClick={() => setAppStore(big)} className="bg-[#1e2022] content-stretch flex gap-[12px] h-[48px] items-center px-[16px] relative rounded-[8px] shrink-0 w-[160px] cursor-pointer hover:bg-black">
                <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[20px]"><div className="relative shrink-0 size-[20px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={icon} /></div></div>
                <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start leading-[normal] relative shrink-0 whitespace-nowrap text-left">
                  <span className="font-['DM_Sans:Regular'] font-normal text-[#e3e7eb] text-[10px] uppercase" style={opsz}>{small}</span>
                  <span className="font-['DM_Sans:Bold'] font-bold text-[14px] text-white" style={opsz}>{big}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* ---------------- Overlays ---------------- */}
      {authOpen && <AuthModal />}
      {openProperty != null && <PropertyModal id={openProperty} onClose={() => setOpenProperty(null)} onContact={(a, p) => { setOpenProperty(null); setContact({ agent: a, property: p }) }} />}
      {contact && <ContactModal agent={contact.agent} property={contact.property} onClose={() => setContact(null)} />}
      {mortgage && <MortgageModal initialTab={mortgage} onClose={() => setMortgage(null)} />}
      {appStore && <AppAlertsModal store={appStore} onClose={() => setAppStore(null)} />}
    </div>
  )
}

export default function HomefindLandingPage() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Page />
      </AuthProvider>
    </ToastProvider>
  )
}
