import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'

export const opsz = { fontVariationSettings: '"opsz" 14' } as const
export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

export function Modal({ title, onClose, children, width = 480 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.querySelector<HTMLElement>('input,select,textarea,button')?.focus()
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus() }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="max-h-[92vh] w-full overflow-y-auto rounded-[16px] bg-white p-8 shadow-2xl" style={{ maxWidth: width }}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-['Outfit:ExtraBold'] text-[24px] font-extrabold text-[#1e2022]">{title}</h2>
          <button aria-label="Close" onClick={onClose} className="-mr-2 -mt-1 cursor-pointer rounded-full px-3 py-1 text-[22px] leading-none text-[#6a7074] hover:bg-[#f4f6f8]">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, error, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId()
  return (
    <label htmlFor={id} className="mb-4 block">
      <span className="mb-1 block font-['DM_Sans:SemiBold'] text-[13px] font-semibold text-[#1e2022]" style={opsz}>{label}</span>
      <input id={id} {...rest}
        className="h-[44px] w-full rounded-[8px] border border-[#e3e7eb] px-3 font-['DM_Sans:Regular'] text-[15px] text-[#1e2022] outline-none focus:border-[#d92228]" style={opsz} />
      {error && <span className="mt-1 block text-[12px] text-[#d92228]">{error}</span>}
    </label>
  )
}

export function PrimaryButton({ busy, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button {...rest} disabled={busy || rest.disabled}
      className={`h-[46px] w-full cursor-pointer rounded-[8px] bg-[#d92228] font-['DM_Sans:Bold'] text-[14px] font-bold text-white hover:bg-[#bf1d23] disabled:cursor-not-allowed disabled:opacity-60 ${className}`} style={opsz}>
      {busy ? 'Please wait…' : children}
    </button>
  )
}

export function ErrorText({ children }: { children?: ReactNode }) {
  return children ? <p role="alert" className="mb-3 rounded-[8px] bg-[#fdecea] px-3 py-2 text-[13px] text-[#b3141a]">{children}</p> : null
}
