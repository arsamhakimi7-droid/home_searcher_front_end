import { imgFacebook, imgHouse1, imgInstagram, imgLine3, imgLinkedin, imgTwitter } from './assets'

export default function Footer() {
  return (
      <div className="bg-[#1e2022] content-stretch flex flex-col gap-[64px] items-start pb-[40px] pt-[80px] px-[80px] relative shrink-0 w-full" data-name="footer">
        <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="footer-upper">
          <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[280px]" data-name="footer-brand">
            <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="logo">
              <div className="bg-[#d92228] content-stretch flex flex-col items-center justify-center relative rounded-[6px] shrink-0 size-[32px]" data-name="logo-icon">
                <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="icon-container">
                  <div className="relative shrink-0 size-[16px]" data-name="house">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgHouse1} />
                  </div>
                </div>
              </div>
              <p className="[word-break:break-word] font-['Outfit:ExtraBold'] font-extrabold leading-[0] relative shrink-0 text-[20px] text-white whitespace-nowrap">
                <span className="leading-[normal]">Home</span>
                <span className="leading-[normal] text-[#d92228]">Find</span>
              </p>
            </div>
            <p className="[word-break:break-word] font-['DM_Sans:Regular'] font-normal leading-[1.5] min-w-full relative shrink-0 text-[#e3e7eb] text-[14px] w-[min-content]" style={{ fontVariationSettings: '"opsz" 14' }}>
              Providing modern home solutions, trusted neighborhood advice, and absolute transaction security.
            </p>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="links-col-Buy">
            <p className="font-['Outfit:Bold'] font-bold relative shrink-0 text-[14px] text-white uppercase">
              Buy
            </p>
            <div className="content-stretch flex flex-col font-['DM_Sans:Regular'] font-normal gap-[10px] items-start relative shrink-0 text-[#e3e7eb] text-[13px]" data-name="col-items">
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Search Homes
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Local Guide
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Mortgage Rates
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Find Agents
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Contact Us
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="links-col-Sell">
            <p className="font-['Outfit:Bold'] font-bold relative shrink-0 text-[14px] text-white uppercase">
              Sell
            </p>
            <div className="content-stretch flex flex-col font-['DM_Sans:Regular'] font-normal gap-[10px] items-start relative shrink-0 text-[#e3e7eb] text-[13px]" data-name="col-items">
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Search Homes
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Local Guide
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Mortgage Rates
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Find Agents
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Contact Us
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="links-col-Rent">
            <p className="font-['Outfit:Bold'] font-bold relative shrink-0 text-[14px] text-white uppercase">
              Rent
            </p>
            <div className="content-stretch flex flex-col font-['DM_Sans:Regular'] font-normal gap-[10px] items-start relative shrink-0 text-[#e3e7eb] text-[13px]" data-name="col-items">
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Search Homes
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Local Guide
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Mortgage Rates
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Find Agents
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Contact Us
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="links-col-Mortgage">
            <p className="font-['Outfit:Bold'] font-bold relative shrink-0 text-[14px] text-white uppercase">
              Mortgage
            </p>
            <div className="content-stretch flex flex-col font-['DM_Sans:Regular'] font-normal gap-[10px] items-start relative shrink-0 text-[#e3e7eb] text-[13px]" data-name="col-items">
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Search Homes
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Local Guide
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Mortgage Rates
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Find Agents
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Contact Us
              </p>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex flex-col gap-[16px] items-start leading-[normal] relative shrink-0 whitespace-nowrap" data-name="links-col-Company">
            <p className="font-['Outfit:Bold'] font-bold relative shrink-0 text-[14px] text-white uppercase">
              Company
            </p>
            <div className="content-stretch flex flex-col font-['DM_Sans:Regular'] font-normal gap-[10px] items-start relative shrink-0 text-[#e3e7eb] text-[13px]" data-name="col-items">
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Search Homes
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Local Guide
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Mortgage Rates
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Find Agents
              </p>
              <p className="relative shrink-0" style={{ fontVariationSettings: '"opsz" 14' }}>
                Contact Us
              </p>
            </div>
          </div>
        </div>
        <div className="h-0 relative shrink-0 w-full" data-name="Line">
          <div className="absolute inset-[-1px_0_0_0]">
            <img alt="" className="block max-w-none size-full" src={imgLine3} />
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="footer-lower">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="socials-and-disclaimer">
            <p className="[word-break:break-word] font-['DM_Sans:Regular'] font-normal leading-[normal] opacity-60 relative shrink-0 text-[#e3e7eb] text-[12px] w-[720px]" style={{ fontVariationSettings: '"opsz" 14' }}>
              HomeFind supports Equal Housing Opportunity. Real estate agent ratings and performance calculations are compiled from public property transfer registry information.
            </p>
            <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="social-icons">
              <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[32px]" data-name="social-box-0">
                <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="icon-container">
                  <div className="relative shrink-0 size-[16px]" data-name="instagram">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInstagram} />
                  </div>
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[32px]" data-name="social-box-1">
                <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="icon-container">
                  <div className="relative shrink-0 size-[16px]" data-name="facebook">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgFacebook} />
                  </div>
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[32px]" data-name="social-box-2">
                <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="icon-container">
                  <div className="relative shrink-0 size-[16px]" data-name="twitter">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTwitter} />
                  </div>
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.1)] content-stretch flex flex-col items-center justify-center relative rounded-[16px] shrink-0 size-[32px]" data-name="social-box-3">
                <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="icon-container">
                  <div className="relative shrink-0 size-[16px]" data-name="linkedin">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLinkedin} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="[word-break:break-word] content-stretch flex font-['DM_Sans:Regular'] font-normal items-center justify-between leading-[normal] relative shrink-0 text-[#e3e7eb] text-[12px] w-full" data-name="copyright-line">
            <p className="opacity-50 relative shrink-0 whitespace-nowrap" style={{ fontVariationSettings: '"opsz" 14' }}>
              © 2026 HomeFind, LLC. All rights reserved.
            </p>
            <p className="opacity-50 relative shrink-0 whitespace-pre" style={{ fontVariationSettings: '"opsz" 14' }}>{`Terms of Use  •  Privacy Policy  •  Sitemap`}</p>
          </div>
        </div>
      </div>
  )
}
