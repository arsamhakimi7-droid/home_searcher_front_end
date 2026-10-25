import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, tokenStore } from './api'
import type { User } from './types'

/* ---------- Toasts ---------- */
const ToastCtx = createContext<(msg: string, kind?: 'ok' | 'error') => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; kind: 'ok' | 'error' } | null>(null)
  const timer = useRef<number>(undefined)
  const show = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    setToast({ msg, kind })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast && (
        <div role="status" aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-[10px] px-5 py-3 text-[14px] font-semibold text-white shadow-lg ${toast.kind === 'error' ? 'bg-[#d92228]' : 'bg-[#1e2022]'}`}>
          {toast.msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

/* ---------- Auth + favourites ---------- */
interface AuthState {
  user: User | null
  ready: boolean
  favoriteIds: Set<number>
  signIn: (token: string, user: User) => void
  signOut: () => void
  toggleFavorite: (propertyId: number) => Promise<void>
  /** Runs `then` now if signed in, otherwise opens the sign-in modal first. */
  requireAuth: (then?: () => void) => boolean
  authOpen: boolean
  openAuth: () => void
  closeAuth: () => void
}
const AuthCtx = createContext<AuthState | null>(null)
export const useAuth = () => {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('useAuth outside AuthProvider')
  return c
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [favoriteIds, setFav] = useState<Set<number>>(new Set())
  const [authOpen, setAuthOpen] = useState(false)

  const loadFavs = useCallback(async () => {
    try { setFav(new Set(await api.favoriteIds())) } catch { setFav(new Set()) }
  }, [])

  // Restore session on load.
  useEffect(() => {
    if (!tokenStore.get()) { setReady(true); return }
    api.me().then(u => { setUser(u); return loadFavs() }).catch(() => tokenStore.set(null)).finally(() => setReady(true))
  }, [loadFavs])

  // Action the visitor was attempting (e.g. saving a home) when we asked them to sign in.
  const pending = useRef<(() => void) | undefined>(undefined)

  const signIn = useCallback((token: string, u: User) => {
    tokenStore.set(token)
    setUser(u)
    // Take the pending action now (closing the modal clears it), but run it only once the
    // favourites list has loaded, otherwise the reload would overwrite the action's result.
    const resume = pending.current
    pending.current = undefined
    void loadFavs().finally(() => resume?.())
  }, [loadFavs])

  const signOut = useCallback(() => {
    tokenStore.set(null); setUser(null); setFav(new Set()); toast('Signed out')
  }, [toast])

  const requireAuth = useCallback((then?: () => void) => {
    if (user) { then?.(); return true }
    pending.current = then
    setAuthOpen(true)
    return false
  }, [user])

  const toggleFavorite = useCallback(async (id: number) => {
    const had = favoriteIds.has(id)
    setFav(prev => { const n = new Set(prev); had ? n.delete(id) : n.add(id); return n })   // optimistic
    try {
      await (had ? api.removeFavorite(id) : api.addFavorite(id))
      toast(had ? 'Removed from saved homes' : 'Saved to your favorites')
    } catch (e) {
      setFav(prev => { const n = new Set(prev); had ? n.add(id) : n.delete(id); return n })   // roll back
      toast((e as Error).message, 'error')
    }
  }, [favoriteIds, toast])

  const value = useMemo<AuthState>(() => ({
    user, ready, favoriteIds, signIn, signOut, toggleFavorite, requireAuth,
    authOpen, openAuth: () => setAuthOpen(true), closeAuth: () => { pending.current = undefined; setAuthOpen(false) },
  }), [user, ready, favoriteIds, signIn, signOut, toggleFavorite, requireAuth, authOpen])

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
