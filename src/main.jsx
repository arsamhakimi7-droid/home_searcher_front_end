import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, Heart, House, ChevronRight, SlidersHorizontal, BedDouble, Bath, MapPin, Menu, X } from 'lucide-react';
import './styles.css';

const homes = [
  {
    id: 1, tag: 'PRICE REDUCED', tagType: 'green', price: '$849,000',
    beds: 4, baths: 3, sqft: '3,200', address: '102 Oakwood Dr, Lake Forest, CA',
    agent: 'HOMEFIND REALTY', image: 'https://images.unsplash.com/photo-1600597453088-7a3e8a4b7f6d?auto=format&fit=crop&w=900&q=85',
    type: 'Modern', estimate: '$2,450/mo'
  },
  {
    id: 2, tag: 'NEW LISTING', tagType: 'red', price: '$625,000',
    beds: 3, baths: 2, sqft: '2,150', address: '408 Cherry Lane, Maplewood, NJ',
    agent: 'HOMEFIND REALTY', image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=85',
    type: 'Cottage', estimate: '$2,450/mo'
  },
  {
    id: 3, tag: 'OPEN HOUSE', tagType: 'red', price: '$1,120,000',
    beds: 5, baths: 4, sqft: '4,800', address: '29 Royal Crest Lane, Alpharetta, GA',
    agent: 'HOMEFIND REALTY', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85',
    type: 'Modern', estimate: '$2,450/mo'
  },
  {
    id: 4, tag: '', tagType: 'red', price: '$1,450,000',
    beds: 4, baths: 4, sqft: '3,500', address: '802 Ocean Blvd, Sarasota, FL',
    agent: 'HOMEFIND REALTY', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85',
    type: 'Waterfront', estimate: '$2,450/mo'
  }
];

function App() {
  const [tab, setTab] = useState('Buy');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [beds, setBeds] = useState('Any');
  const [maxPrice, setMaxPrice] = useState('Any');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const visibleHomes = useMemo(() => homes.filter((home) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || `${home.address} ${home.type} ${home.price}`.toLowerCase().includes(q);
    const matchesBeds = beds === 'Any' || home.beds >= Number(beds);
    const numericPrice = Number(home.price.replace(/[$,]/g, ''));
    const matchesPrice = maxPrice === 'Any' || numericPrice <= Number(maxPrice);
    return matchesQuery && matchesBeds && matchesPrice;
  }), [query, beds, maxPrice]);

  const toggleSaved = (id) => setSaved((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const runSearch = (event) => {
    event.preventDefault();
    setNotice(visibleHomes.length ? `${visibleHomes.length} home${visibleHomes.length === 1 ? '' : 's'} found` : 'No homes match those filters. Try a wider search.');
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="HomeFind home" onClick={() => { setQuery(''); setNotice(''); }}>
          <span className="brand-mark"><House size={19} strokeWidth={2.6} /></span>
          <span>Home<span className="brand-red">Find</span></span>
        </a>
        <button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</button>
        <nav className={mobileNav ? 'nav-links nav-open' : 'nav-links'}>
          {['Buy', 'Sell', 'Rent', 'Mortgage', 'Find Realtors'].map((item) => (
            <button key={item} className="nav-link" onClick={() => { setTab(item === 'Rent' ? 'Rent' : item === 'Sell' ? 'Sold' : 'Buy'); setMobileNav(false); }}>{item}</button>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="signin" onClick={() => setNotice('Sign-in is a demo feature in this frontend.')}>Sign In / Join</button>
          <button className="advertise" onClick={() => setNotice('Advertising options are coming soon.')}>Advertise</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">YOUR TRUSTED PORTAL</p>
          <h1>The Home You'll Love Is Here</h1>
          <form className="search-panel" onSubmit={runSearch}>
            <div className="search-tabs" role="tablist" aria-label="Listing type">
              {['Buy', 'Rent', 'Sold'].map((item) => <button type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'search-tab selected' : 'search-tab'} key={item} onClick={() => setTab(item)}>{item}</button>)}
            </div>
            <div className="search-row">
              <MapPin className="location-icon" size={17} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Address, City, Zip, or Neighborhood..." aria-label="Search by location" />
              <button className="search-button" type="submit"><Search size={15} /> <span>Search</span></button>
            </div>
          </form>
          <div className="quick-filters">
            <button onClick={() => { setActiveFilter(activeFilter === 'price' ? '' : 'price'); setFiltersOpen(true); }}>Any Price</button>
            <button onClick={() => { setActiveFilter(activeFilter === 'beds' ? '' : 'beds'); setFiltersOpen(true); }}>Beds / Baths</button>
            <button onClick={() => { setActiveFilter(activeFilter === 'type' ? '' : 'type'); setFiltersOpen(true); }}>Home Type</button>
            <button onClick={() => { setActiveFilter('more'); setFiltersOpen(!filtersOpen); }}><SlidersHorizontal size={12} /> More Filters</button>
          </div>
          {filtersOpen && <div className="filter-popover">
            <div className="filter-heading"><strong>Refine your search</strong><button aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={16}/></button></div>
            <label>Minimum bedrooms<select value={beds} onChange={(e) => setBeds(e.target.value)}><option>Any</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option><option value="5">5+</option></select></label>
            <label>Maximum price<select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}><option>Any</option><option value="700000">$700,000</option><option value="900000">$900,000</option><option value="1200000">$1,200,000</option><option value="1500000">$1,500,000</option></select></label>
            <button className="apply-filters" onClick={() => { setFiltersOpen(false); setNotice('Filters applied.'); }}>Apply filters</button>
          </div>}
        </div>
      </section>

      <section className="properties-section" id="properties">
        <div className="section-topline"><span className="section-kicker">HOT DEALS</span></div>
        <div className="section-heading-row">
          <div><h2>Trending Homes in Your Area</h2><p className="section-subtitle">Find a place to call home.</p></div>
          <button className="view-all" onClick={() => { setQuery(''); setBeds('Any'); setMaxPrice('Any'); setNotice('Showing all featured properties.'); }}>View All Properties <ChevronRight size={14} /></button>
        </div>
        {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14}/></button></div>}
        {saved.length > 0 && <p className="saved-count">{saved.length} saved {saved.length === 1 ? 'home' : 'homes'} <button onClick={() => setNotice(`Saved home IDs: ${saved.join(', ')}`)}>View saved</button></p>}
        <div className="homes-grid">
          {visibleHomes.map((home) => <article className="home-card" key={home.id}>
            <div className="home-image-wrap">
              <img className="home-image" src={home.image} alt={`House for sale at ${home.address}`} loading="lazy" />
              {home.tag && <span className={`home-tag ${home.tagType}`}>{home.tag}</span>}
              <button className={saved.includes(home.id) ? 'favorite favorited' : 'favorite'} aria-label={saved.includes(home.id) ? 'Remove from saved homes' : 'Save home'} aria-pressed={saved.includes(home.id)} onClick={() => toggleSaved(home.id)}><Heart size={17} fill={saved.includes(home.id) ? 'currentColor' : 'none'} /></button>
            </div>
            <div className="home-info">
              <div className="price-row"><h3>{home.price}</h3><span>Est. {home.estimate}</span></div>
              <div className="features"><span><BedDouble size={13}/>{home.beds} bed</span><i /> <span><Bath size={13}/>{home.baths} bath</span><i /> <span>{home.sqft} sqft</span></div>
              <p className="address">{home.address}</p>
              <div className="card-footer"><span>{home.agent}</span><button onClick={() => setNotice(`${home.price} · ${home.address} · ${home.beds} beds · ${home.baths} baths`)}>View Details <ChevronRight size={12}/></button></div>
            </div>
          </article>)}
        </div>
        {visibleHomes.length === 0 && <div className="empty-state"><House size={30}/><h3>No homes found</h3><p>Try another location or loosen your filters.</p><button onClick={() => { setQuery(''); setBeds('Any'); setMaxPrice('Any'); }}>Clear filters</button></div>}
      </section>
      <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><House size={16}/></span><span>Home<span className="brand-red">Find</span></span></a><span>Find your place. Find your people.</span><span>© 2026 HomeFind</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
