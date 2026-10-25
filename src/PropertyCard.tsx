import { imgArrowRight1, imgHeart, imgLine, imgLine1 } from './assets'
import { money, opsz } from './ui'
import type { Property } from './types'

const GREEN = new Set(['price-reduced', 'recommended'])

export function Spec({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="[word-break:break-word] content-stretch flex gap-[4px] items-center leading-[normal] relative shrink-0 text-[14px] whitespace-nowrap">
      <p className="font-['DM_Sans:Bold'] font-bold relative shrink-0 text-[#1e2022]" style={opsz}>{value}</p>
      <p className="font-['DM_Sans:Regular'] font-normal relative shrink-0 text-[#6a7074]" style={opsz}>{unit}</p>
    </div>
  )
}

export function Divider() {
  return (
    <div className="flex h-[12px] items-center justify-center relative shrink-0 w-0">
      <div className="flex-none rotate-90">
        <div className="h-0 relative w-[12px]"><div className="absolute inset-[-1px_0_0_0]"><img alt="" className="block max-w-none size-full" src={imgLine} /></div></div>
      </div>
    </div>
  )
}

interface Props {
  property: Property
  /** Replaces the computed badge, e.g. "Recommended for you". */
  badgeOverride?: { key: string; label: string }
  isFavorite: boolean
  onToggleFavorite: (p: Property) => void
  onOpen: (p: Property) => void
}

export default function PropertyCard({ property: p, badgeOverride, isFavorite, onToggleFavorite, onOpen }: Props) {
  const badge = badgeOverride ?? p.badge
  const green = badge ? GREEN.has(badge.key) : false
  const baths = Number.isInteger(p.baths) ? String(p.baths) : p.baths.toFixed(1)
  return (
    <div className="bg-white border border-[#e3e7eb] border-solid content-stretch flex flex-[1_0_0] flex-col items-start min-w-px overflow-clip relative rounded-[12px] self-stretch shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)]" data-name="property-card">
      <div className="content-stretch flex flex-col h-[220px] items-start overflow-clip relative shrink-0 w-full cursor-pointer" onClick={() => onOpen(p)}>
        <div className="flex-[1_0_0] min-h-px relative w-full">
          <img alt={`${p.full_address}`} loading="lazy" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={p.image} />
        </div>
        {badge && (
          <div className={`absolute content-stretch flex items-start left-[12px] px-[10px] py-[5px] rounded-[6px] top-[12px] ${green ? 'bg-[#e3fcef] border border-[#00875a] border-solid' : 'bg-[#d92228]'}`}>
            <p className={`[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[11px] uppercase whitespace-nowrap ${green ? 'text-[#00875a]' : 'text-white'}`} style={opsz}>{badge.label}</p>
          </div>
        )}
        <button
          aria-label={isFavorite ? 'Remove from saved homes' : 'Save home'} aria-pressed={isFavorite}
          onClick={e => { e.stopPropagation(); onToggleFavorite(p) }}
          className="absolute bg-white content-stretch drop-shadow-[0px_2px_3px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center right-[12px] rounded-[18px] size-[36px] top-[12px] cursor-pointer">
          <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[18px]">
            <div className="relative shrink-0 size-[18px]" style={isFavorite ? { filter: 'invert(18%) sepia(95%) saturate(4500%) hue-rotate(350deg)' } : undefined}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHeart} />
            </div>
          </div>
        </button>
      </div>
      <div className="content-stretch flex flex-col gap-[12px] items-start p-[20px] relative shrink-0 w-full">
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <p className="[word-break:break-word] font-['Outfit:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1e2022] text-[24px] whitespace-nowrap">
            {money(p.price)}{p.listing_type === 'rent' && <span className="text-[14px] font-normal text-[#6a7074]">/mo</span>}
          </p>
          {p.est_monthly != null && (
            <div className="content-stretch flex items-center relative shrink-0">
              <p className="[word-break:break-word] font-['DM_Sans:Regular'] font-normal leading-[normal] relative shrink-0 text-[#6a7074] text-[12px] whitespace-nowrap" style={opsz}>Est. {money(p.est_monthly)}/mo</p>
            </div>
          )}
        </div>
        <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full">
          <Spec value={String(p.beds)} unit="bed" /><Divider />
          <Spec value={baths} unit="bath" /><Divider />
          <Spec value={p.sqft.toLocaleString('en-US')} unit="sqft" />
        </div>
        <p className="[word-break:break-word] font-['DM_Sans:Regular'] font-normal leading-[normal] overflow-hidden relative shrink-0 text-[#6a7074] text-[14px] text-ellipsis w-full whitespace-nowrap" style={opsz}>{p.full_address}</p>
        <div className="h-0 relative shrink-0 w-full"><div className="absolute inset-[-1px_0_0_0]"><img alt="" className="block max-w-none size-full" src={imgLine1} /></div></div>
        <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
          <p className="[word-break:break-word] font-['DM_Sans:SemiBold'] font-semibold leading-[normal] relative shrink-0 text-[#6a7074] text-[11px] uppercase whitespace-nowrap" style={opsz}>{p.brokerage}</p>
          <button onClick={() => onOpen(p)} className="content-stretch flex gap-[4px] items-center relative shrink-0 cursor-pointer">
            <span className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[#d92228] text-[12px] whitespace-nowrap" style={opsz}>View Details</span>
            <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[12px]">
              <div className="relative shrink-0 size-[12px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowRight1} /></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
