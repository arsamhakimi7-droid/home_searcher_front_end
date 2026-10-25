import { useEffect, useState, type FormEvent } from 'react'
import { api } from './api'
import { useAuth, useToast } from './state'
import { ErrorText, Field, Modal, PrimaryButton, money, opsz } from './ui'
import { Divider, Spec } from './PropertyCard'
import type { Affordability, Agent, MortgageCalc, Property, Rates } from './types'

const msg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong')

/* ---------------- Sign in / Join ---------------- */
export function AuthModal() {
  const { closeAuth, signIn } = useAuth()
  const toast = useToast()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [f, setF] = useState({ full_name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const res = mode === 'login'
        ? await api.login({ email: f.email, password: f.password })
        : await api.register(f)
      signIn(res.access_token, res.user)
      closeAuth()
      toast(mode === 'login' ? `Welcome back, ${res.user.full_name.split(' ')[0]}!` : 'Account created. Welcome to HomeFind!')
    } catch (e) { setErr(msg(e)) } finally { setBusy(false) }
  }

  return (
    <Modal title={mode === 'login' ? 'Sign in' : 'Create your account'} onClose={closeAuth} width={420}>
      <form onSubmit={submit} noValidate>
        <ErrorText>{err}</ErrorText>
        {mode === 'register' && <Field label="Full name" autoComplete="name" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} required />}
        <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <Field label="Password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required minLength={mode === 'register' ? 8 : undefined} />
        {mode === 'register' && <p className="-mt-2 mb-4 text-[12px] text-[#6a7074]">At least 8 characters.</p>}
        <PrimaryButton type="submit" busy={busy}>{mode === 'login' ? 'Sign in' : 'Join HomeFind'}</PrimaryButton>
      </form>
      <p className="mt-5 text-center text-[14px] text-[#6a7074]">
        {mode === 'login' ? 'New to HomeFind?' : 'Already have an account?'}{' '}
        <button className="cursor-pointer font-bold text-[#d92228]" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr('') }}>
          {mode === 'login' ? 'Create an account' : 'Sign in'}
        </button>
      </p>
    </Modal>
  )
}

/* ---------------- Contact agent ---------------- */
export function ContactModal({ agent, property, onClose }: { agent: Agent | { id: number; name: string }; property?: Property; onClose: () => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({
    name: user?.full_name ?? '', email: user?.email ?? '', phone: '',
    message: property ? `Hi ${agent.name.split(' ')[0]}, I'm interested in ${property.full_address}. Could we schedule a tour?` : '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const res = await api.contactAgent(agent.id, { ...f, phone: f.phone || undefined, property_id: property?.id })
      toast(res.detail); onClose()
    } catch (e) { setErr(msg(e)) } finally { setBusy(false) }
  }

  return (
    <Modal title={`Contact ${agent.name}`} onClose={onClose} width={460}>
      <form onSubmit={submit} noValidate>
        <ErrorText>{err}</ErrorText>
        <Field label="Your name" autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
        <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <Field label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
        <label className="mb-5 block">
          <span className="mb-1 block font-['DM_Sans:SemiBold'] text-[13px] font-semibold" style={opsz}>Message</span>
          <textarea rows={4} value={f.message} onChange={e => setF({ ...f, message: e.target.value })} required minLength={5}
            className="w-full rounded-[8px] border border-[#e3e7eb] p-3 text-[15px] outline-none focus:border-[#d92228]" />
        </label>
        <PrimaryButton type="submit" busy={busy}>Send message</PrimaryButton>
      </form>
    </Modal>
  )
}

/* ---------------- Property details ---------------- */
export function PropertyModal({ id, onClose, onContact }: { id: number; onClose: () => void; onContact: (a: Property['agent'] & {}, p: Property) => void }) {
  const { favoriteIds, toggleFavorite, requireAuth } = useAuth()
  const [p, setP] = useState<Property | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api.property(id).then(setP).catch(e => setErr(msg(e))) }, [id])
  const fav = p ? favoriteIds.has(p.id) : false

  return (
    <Modal title={p ? p.full_address : 'Loading…'} onClose={onClose} width={680}>
      <ErrorText>{err}</ErrorText>
      {p && (
        <>
          <img alt={p.full_address} src={p.image} className="mb-5 h-[300px] w-full rounded-[12px] object-cover" />
          <div className="mb-3 flex items-center justify-between">
            <p className="font-['Outfit:Bold'] text-[30px] font-bold">{money(p.price)}{p.listing_type === 'rent' && <span className="text-[16px] font-normal text-[#6a7074]">/mo</span>}</p>
            {p.badge && <span className="rounded-[6px] bg-[#1e2022] px-[10px] py-[5px] text-[11px] font-bold uppercase text-white">{p.badge.label}</span>}
          </div>
          <div className="mb-4 flex items-center gap-[12px]">
            <Spec value={String(p.beds)} unit="bed" /><Divider />
            <Spec value={String(p.baths)} unit="bath" /><Divider />
            <Spec value={p.sqft.toLocaleString('en-US')} unit="sqft" /><Divider />
            <Spec value={p.home_type} unit="" />
          </div>
          {p.est_monthly != null && <p className="mb-3 text-[14px] text-[#6a7074]">Estimated payment: <b className="text-[#1e2022]">{money(p.est_monthly)}/mo</b> (20% down, 30-yr fixed, principal &amp; interest)</p>}
          {p.original_price && p.original_price > p.price && <p className="mb-3 text-[14px] text-[#00875a]">Reduced {money(p.original_price - p.price)} from {money(p.original_price)}</p>}
          {p.description && <p className="mb-5 text-[15px] leading-[1.5] text-[#1e2022]">{p.description}</p>}
          <p className="mb-5 text-[12px] font-semibold uppercase text-[#6a7074]">Listed by {p.brokerage}</p>
          <div className="flex gap-3">
            {p.agent && <PrimaryButton className="flex-1" onClick={() => onContact(p.agent!, p)}>Contact {p.agent.name.split(' ')[0]}</PrimaryButton>}
            <button onClick={() => requireAuth(() => void toggleFavorite(p.id))}
              className="h-[46px] flex-1 cursor-pointer rounded-[8px] border border-[#1e2022] font-['DM_Sans:Bold'] text-[14px] font-bold" style={opsz}>
              {fav ? '♥ Saved' : '♡ Save home'}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

/* ---------------- Mortgage: calculator + pre-approval ---------------- */
const num = (s: string) => (s.trim() === '' || isNaN(Number(s)) ? NaN : Number(s))

export function MortgageModal({ initialTab, initialPrice, onClose }: { initialTab: 'calc' | 'pre'; initialPrice?: number; onClose: () => void }) {
  const [tab, setTab] = useState(initialTab)
  return (
    <Modal title="Mortgage tools" onClose={onClose} width={560}>
      <div className="mb-5 flex gap-2" role="tablist">
        {([['calc', 'Payment calculator'], ['pre', 'Get pre-approved']] as const).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`cursor-pointer rounded-[6px] px-4 py-[6px] text-[13px] font-bold ${tab === k ? 'bg-[#d92228] text-white' : 'text-[#1e2022] hover:bg-[#f4f6f8]'}`}>{label}</button>
        ))}
      </div>
      {tab === 'calc' ? <Calculator initialPrice={initialPrice} /> : <PreApproval onClose={onClose} />}
    </Modal>
  )
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between py-[6px] text-[14px] ${bold ? 'font-bold' : ''}`}><span className="text-[#6a7074]">{k}</span><span>{v}</span></div>
}

function Calculator({ initialPrice }: { initialPrice?: number }) {
  const [rates, setRates] = useState<Rates | null>(null)
  const [f, setF] = useState({ price: String(initialPrice ?? 600000), down: '20', rate: '', years: '30' })
  const [res, setRes] = useState<MortgageCalc | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { api.rates().then(r => { setRates(r); setF(p => p.rate ? p : { ...p, rate: String(r.rates[0].rate) }) }).catch(e => setErr(msg(e))) }, [])

  async function run(e?: FormEvent) {
    e?.preventDefault(); setErr('')
    const [price, down, rate, years] = [num(f.price), num(f.down), num(f.rate), num(f.years)]
    if ([price, down, rate, years].some(isNaN)) return setErr('Please enter valid numbers in every field.')
    setBusy(true)
    try { setRes(await api.calculate({ home_price: price, down_payment_pct: down, annual_rate: rate, years })) }
    catch (e) { setErr(msg(e)) } finally { setBusy(false) }
  }
  useEffect(() => { if (f.rate) void run() }, [rates]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={run} noValidate>
      <ErrorText>{err}</ErrorText>
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Home price ($)" inputMode="decimal" value={f.price} onChange={e => setF({ ...f, price: e.target.value })} />
        <Field label="Down payment (%)" inputMode="decimal" value={f.down} onChange={e => setF({ ...f, down: e.target.value })} />
        <Field label="Interest rate (%)" inputMode="decimal" value={f.rate} onChange={e => setF({ ...f, rate: e.target.value })} />
        <Field label="Term (years)" inputMode="numeric" value={f.years} onChange={e => setF({ ...f, years: e.target.value })} />
      </div>
      <PrimaryButton type="submit" busy={busy}>Calculate</PrimaryButton>
      {res && (
        <div className="mt-5 rounded-[12px] bg-[#f4f6f8] p-5">
          <p className="mb-1 text-[12px] font-bold uppercase text-[#d92228]">Estimated monthly payment</p>
          <p className="mb-3 font-['Outfit:ExtraBold'] text-[34px] font-extrabold">{money(res.total_monthly)}</p>
          <Row k="Principal & interest" v={money(res.principal_and_interest)} />
          <Row k="Property tax (est.)" v={money(res.property_tax)} />
          <Row k="Home insurance (est.)" v={money(res.insurance)} />
          <hr className="my-2 border-[#e3e7eb]" />
          <Row k="Loan amount" v={money(res.loan_amount)} />
          <Row k="Total interest over term" v={money(res.total_interest)} />
        </div>
      )}
      {rates && (
        <div className="mt-5">
          <p className="mb-1 text-[12px] font-bold uppercase text-[#6a7074]">Today's sample rates</p>
          {rates.rates.map(r => <Row key={r.product} k={r.product} v={`${r.rate.toFixed(2)}%`} />)}
          <p className="mt-2 text-[12px] text-[#6a7074]">{rates.note}</p>
        </div>
      )}
    </form>
  )
}

function PreApproval({ onClose }: { onClose: () => void }) {
  const { user } = useAuth()
  const toast = useToast()
  const [f, setF] = useState({ full_name: user?.full_name ?? '', email: user?.email ?? '', phone: '', income: '', debts: '0', down: '', credit: 'good' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [est, setEst] = useState<Affordability | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('')
    const [income, debts, down] = [num(f.income), num(f.debts), num(f.down)]
    if ([income, debts, down].some(isNaN)) return setErr('Please enter your income, monthly debts and down payment as numbers.')
    setBusy(true)
    try {
      const res = await api.preApproval({
        full_name: f.full_name, email: f.email, phone: f.phone || undefined,
        annual_income: income, monthly_debts: debts, down_payment: down, credit_band: f.credit,
      })
      setEst(res.estimate); toast(res.detail)
    } catch (e) { setErr(msg(e)) } finally { setBusy(false) }
  }

  if (est) return (
    <div>
      <div className="rounded-[12px] bg-[#f4f6f8] p-5">
        <p className="mb-1 text-[12px] font-bold uppercase text-[#d92228]">You could afford up to</p>
        <p className="mb-3 font-['Outfit:ExtraBold'] text-[34px] font-extrabold">{money(est.max_price)}</p>
        <Row k="Loan amount" v={money(est.loan_amount)} />
        <Row k="Estimated rate" v={`${est.rate_used.toFixed(2)}%`} />
        <Row k="Monthly housing budget" v={money(est.monthly_housing_budget)} />
        <Row k="Debt-to-income" v={`${(est.debt_to_income * 100).toFixed(0)}%`} />
      </div>
      <p className="mt-3 text-[12px] text-[#6a7074]">This is an estimate, not a lender's pre-approval. A loan partner will follow up to complete the official process.</p>
      <PrimaryButton className="mt-4" onClick={onClose}>Done</PrimaryButton>
    </div>
  )

  return (
    <form onSubmit={submit} noValidate>
      <ErrorText>{err}</ErrorText>
      <Field label="Full name" autoComplete="name" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} required />
      <div className="grid grid-cols-2 gap-x-4">
        <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <Field label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
        <Field label="Annual income ($)" inputMode="decimal" value={f.income} onChange={e => setF({ ...f, income: e.target.value })} required />
        <Field label="Monthly debts ($)" inputMode="decimal" value={f.debts} onChange={e => setF({ ...f, debts: e.target.value })} />
        <Field label="Down payment ($)" inputMode="decimal" value={f.down} onChange={e => setF({ ...f, down: e.target.value })} required />
        <label className="mb-4 block">
          <span className="mb-1 block font-['DM_Sans:SemiBold'] text-[13px] font-semibold" style={opsz}>Credit score</span>
          <select value={f.credit} onChange={e => setF({ ...f, credit: e.target.value })} className="h-[44px] w-full rounded-[8px] border border-[#e3e7eb] bg-white px-3 text-[15px]">
            <option value="excellent">Excellent (740+)</option><option value="good">Good (700–739)</option>
            <option value="fair">Fair (640–699)</option><option value="poor">Below 640</option>
          </select>
        </label>
      </div>
      <PrimaryButton type="submit" busy={busy}>See what I can afford</PrimaryButton>
    </form>
  )
}

/* ---------------- Mobile app alerts ---------------- */
export function AppAlertsModal({ store, onClose }: { store: string; onClose: () => void }) {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true)
    try { toast((await api.subscribe(email)).detail); onClose() } catch (e) { setErr(msg(e)) } finally { setBusy(false) }
  }
  return (
    <Modal title="Get the HomeFind app" onClose={onClose} width={420}>
      <p className="mb-4 text-[14px] text-[#6a7074]">Our {store} app is on the way. Leave your email and we'll notify you at launch, and send new-listing alerts in the meantime.</p>
      <form onSubmit={submit} noValidate>
        <ErrorText>{err}</ErrorText>
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <PrimaryButton type="submit" busy={busy}>Notify me</PrimaryButton>
      </form>
    </Modal>
  )
}
