import { imgStar, imgStar1 } from './assets'
import { opsz } from './ui'
import type { Agent } from './types'

export default function AgentCard({ agent, onContact }: { agent: Agent; onContact: (a: Agent) => void }) {
  return (
    <div className="bg-white border border-[#e3e7eb] border-solid content-stretch flex flex-[1_0_0] flex-col gap-[16px] items-center min-w-px p-[24px] relative rounded-[12px] self-stretch" data-name="agent-card">
      <div className="content-stretch flex flex-col items-center justify-center relative shrink-0 size-[80px]">
        <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[40px] shrink-0 size-[80px]">
          <div className="flex-[1_0_0] min-h-px relative w-full"><img alt={agent.name} className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={agent.avatar} /></div>
        </div>
        <div className="absolute bg-[#ffc700] bottom-0 content-stretch flex flex-col items-center justify-center right-0 rounded-[12px] size-[24px]">
          <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[12px]">
            <div className="relative shrink-0 size-[12px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStar} /></div>
          </div>
        </div>
      </div>
      <div className="[word-break:break-word] content-stretch flex flex-col gap-[4px] items-center leading-[normal] relative shrink-0 text-center w-full whitespace-nowrap">
        <p className="font-['Outfit:Bold'] font-bold overflow-hidden relative shrink-0 text-[#1e2022] text-[18px] text-ellipsis w-full">{agent.name}</p>
        <p className="font-['DM_Sans:Regular'] font-normal overflow-hidden relative shrink-0 text-[#6a7074] text-[13px] text-ellipsis w-full" style={opsz}>{agent.brokerage}</p>
      </div>
      <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full">
        <div className="content-stretch flex gap-[2px] items-center relative shrink-0" aria-label={`Rated ${agent.rating.toFixed(1)} out of 5`}>
          {Array.from({ length: Math.round(agent.rating) }).map((_, i) => (
            <div key={i} className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[14px]">
              <div className="relative shrink-0 size-[14px]"><img alt="" className="absolute block inset-0 max-w-none size-full" src={imgStar1} /></div>
            </div>
          ))}
          <p className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[#1e2022] text-[13px] whitespace-nowrap" style={opsz}>{agent.rating.toFixed(1)}</p>
        </div>
        <p className="[word-break:break-word] font-['DM_Sans:Regular'] font-normal leading-[normal] relative shrink-0 text-[#6a7074] text-[13px] whitespace-nowrap" style={opsz}>{agent.recent_sales} recent sales</p>
      </div>
      <button onClick={() => onContact(agent)} className="bg-white border border-[#d92228] border-solid content-stretch flex h-[40px] items-center justify-center relative rounded-[8px] shrink-0 w-full cursor-pointer hover:bg-[#fdecea]">
        <span className="[word-break:break-word] font-['DM_Sans:Bold'] font-bold leading-[normal] relative shrink-0 text-[#d92228] text-[13px] whitespace-nowrap" style={opsz}>Contact Agent</span>
      </button>
    </div>
  )
}
