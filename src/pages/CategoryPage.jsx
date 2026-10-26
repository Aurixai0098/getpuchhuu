// src/pages/CategoryPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchCategoryBySlug, searchProviders } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Star, MapPin, Filter, ChevronRight, CheckCircle2,
  ShoppingCart, X, CalendarCheck, Search, Home as HomeIcon
} from 'lucide-react';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86] focus-visible:ring-offset-2';
const SELECT = 'w-full bg-white border border-[#DDE3E8] rounded-lg px-3 h-10 text-sm text-[#111E30] disabled:bg-[#F6F8F9] disabled:text-[#8A97A8]';

const defaultImages = {
  "A1 Plumbing Services": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80",
  "Quick Flow Plumbers": "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=300&q=80",
  "Delhi Plumbing Experts": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80",
  "Water Tank Solutions": "https://images.unsplash.com/photo-1542013936693-8848e57423e3?auto=format&fit=crop&w=300&q=80"
};

const ProviderCard = ({ provider, onAddToCart, onBookNow, distance, isInCart }) => {
  const navigate = useNavigate();
  const avgRating = provider.rating?.average || 0;
  const reviewCount = provider.rating?.count || 0;
  const experience = provider.experience || 0;
  const minPrice = provider.minPrice || 0;

  // Only real data is shown: no invented services list, location or distance
  let servicesList = provider.servicesList || [];
  if (!Array.isArray(servicesList)) {
    servicesList = typeof servicesList === 'string'
      ? servicesList.split(',').map(s => s.trim())
      : [];
  }
  servicesList = servicesList.filter(Boolean);
  const extra = servicesList.length - 3;
  const displayServices = servicesList.slice(0, 3).join(', ') + (extra > 0 ? ` +${extra} more` : '');

  const providerImage = provider.image || defaultImages[provider.businessName] || null;
  const initial = (provider.businessName || 'P').trim().charAt(0).toUpperCase();

  const handleCardClick = () => {
    if (provider.id) navigate(`/provider/${provider.id}`);
  };

  return (
    <article
      className="group bg-white rounded-xl border border-[#E3E8EC] p-3 sm:p-4 flex flex-col sm:flex-row gap-4 cursor-pointer hover:border-[#0E7C86]/40 hover:shadow-[0_14px_30px_-18px_rgba(17,30,48,0.4)] transition-[box-shadow,border-color] duration-200"
      onClick={handleCardClick}
    >
      <div className="relative w-full sm:w-48 shrink-0 aspect-[16/9] sm:aspect-auto sm:h-36 rounded-lg overflow-hidden bg-[#EAF3F4]">
        {providerImage ? (
          <img
            src={providerImage}
            alt={provider.businessName || 'Service provider'}
            width="300"
            height="200"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#0E7C86]" aria-hidden="true">{initial}</div>
        )}
        {provider.isTopRated === true && (
          <span className="absolute top-2 left-2 bg-[#111E30] text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">Top Rated</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col md:flex-row justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-lg text-[#111E30] leading-snug min-w-0">
              {provider.id ? (
                <Link
                  to={`/provider/${provider.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className={`hover:text-[#0E7C86] rounded ${FOCUS}`}
                >
                  {provider.businessName}
                </Link>
              ) : provider.businessName}
            </h3>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E7C86]" aria-label="Verified" />
          </div>
          {displayServices && <p className="text-sm text-[#5B6B7F] line-clamp-2">{displayServices}</p>}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5B6B7F] pt-0.5">
            {reviewCount > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                <span className="font-semibold text-[#111E30]">{avgRating.toFixed(1)}</span>
                <span>({reviewCount})</span>
              </span>
            ) : (
              <span className="text-[#8A97A8]">No reviews yet</span>
            )}
            {experience > 0 && <span>{experience} {experience === 1 ? 'year' : 'years'} experience</span>}
          </div>
          {provider.location && (
            <div className="flex items-center gap-1 text-sm text-[#5B6B7F]">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#8A97A8]" aria-hidden="true" />
              <span className="truncate">{provider.location}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 md:items-end md:justify-between md:min-w-[190px] shrink-0">
          {minPrice > 0 && (
            <div className="md:text-right">
              <div className="text-xs text-[#8A97A8]">Starting at</div>
              <div className="text-2xl font-bold text-[#111E30] leading-tight">₹{minPrice}</div>
            </div>
          )}
          <div className="grid grid-cols-2 md:flex items-center gap-2 w-full md:w-auto">
            {isInCart ? (
              <button disabled aria-label={`${provider.businessName} is in your cart`} className="h-11 sm:h-10 px-3 rounded-lg bg-[#E4F3F4] text-[#0B5F67] text-sm font-semibold flex items-center justify-center gap-1.5 cursor-default">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Added
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart(provider); }}
                aria-label={`Add ${provider.businessName} to cart`}
                className={`h-11 sm:h-10 px-3 rounded-lg bg-[#0E7C86] hover:bg-[#0B6A73] active:scale-[0.98] text-white text-sm font-semibold transition flex items-center justify-center gap-1.5 ${FOCUS}`}
              >
                <ShoppingCart className="w-4 h-4" aria-hidden="true" /> Add to Cart
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onBookNow(provider); }}
              aria-label={`Book ${provider.businessName} now`}
              className={`h-11 sm:h-10 px-3 rounded-lg border border-[#111E30] text-[#111E30] hover:bg-[#111E30] hover:text-white active:scale-[0.98] text-sm font-semibold transition flex items-center justify-center gap-1.5 ${FOCUS}`}
            >
              <CalendarCheck className="w-4 h-4" aria-hidden="true" /> Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

// Shared by the desktop sidebar (live state) and the mobile drawer (temp state)
const FilterFields = ({ idp, categoryName, priceMax, price, onPriceMax, ratings, onToggleRating, availability, onAvailability }) => (
  <div className="space-y-6">
    {/* Existing controls that do not filter anything yet: kept, shown as disabled */}
    <fieldset disabled className="space-y-3 min-w-0 opacity-70">
      <legend className="text-sm font-semibold text-[#111E30] mb-2">Service and location</legend>
      <select aria-label="Service category" className={SELECT}><option>All {categoryName} Services</option></select>
      <select aria-label="Location" className={SELECT}><option>Delhi</option></select>
      <select aria-label="State" className={SELECT}><option>Delhi</option></select>
      <select aria-label="District" className={SELECT}><option>New Delhi</option></select>
      <select aria-label="Locality" className={SELECT}><option>Select Locality</option></select>
      <p className="text-xs text-[#5B6B7F]">These filters aren’t available yet.</p>
    </fieldset>

    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={`${idp}-price`} className="text-sm font-semibold text-[#111E30]">Maximum price</label>
        <output htmlFor={`${idp}-price`} className="text-sm font-semibold text-[#0E7C86]">₹{price[1]}</output>
      </div>
      <input
        id={`${idp}-price`}
        type="range"
        min="0"
        max={priceMax}
        step="100"
        value={price[1]}
        onChange={(e) => onPriceMax(parseInt(e.target.value))}
        className="w-full h-6 accent-[#0E7C86]"
      />
      <div className="flex justify-between text-xs text-[#5B6B7F]"><span>₹{price[0]}</span><span>₹{priceMax}</span></div>
    </div>

    <div>
      <p className="text-sm font-semibold text-[#111E30] mb-2">Rating</p>
      <div className="grid grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-1.5">
        {[5, 4, 3, 2, 1].map(r => {
          const on = ratings.includes(r);
          return (
            <button
              key={r}
              type="button"
              aria-pressed={on}
              onClick={() => onToggleRating(r)}
              className={`h-10 rounded-lg border text-sm flex items-center justify-center gap-0.5 transition ${FOCUS} ${on ? 'border-[#0E7C86] bg-[#E4F3F4] text-[#0B5F67] font-semibold' : 'border-[#DDE3E8] bg-white text-[#5B6B7F] hover:border-[#0E7C86]/50'}`}
            >
              <Star className={`w-3.5 h-3.5 ${on ? 'fill-amber-400 text-amber-400' : 'text-[#8A97A8]'}`} aria-hidden="true" />{r}+
            </button>
          );
        })}
      </div>
    </div>

    <fieldset>
      <legend className="text-sm font-semibold text-[#111E30] mb-2">Availability</legend>
      <div className="space-y-1">
        {[['all', 'Any'], ['now', 'Available Now'], ['later', 'Book for Later']].map(([val, label]) => (
          <label key={val} className="flex items-center gap-3 min-h-[40px] px-2 rounded-lg text-sm text-[#2B3A4F] cursor-pointer hover:bg-[#F6F8F9]">
            <input
              type="radio"
              name={`${idp}-availability`}
              checked={availability === val}
              onChange={() => onAvailability(val)}
              className="w-4 h-4 accent-[#0E7C86]"
            />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  </div>
);

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems, cartCount, cartTotal } = useCart();

  const [category, setCategory] = useState(null);
  const [categoryRatingStats, setCategoryRatingStats] = useState(null);
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [priceMax, setPriceMax] = useState(100000);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [availability, setAvailability] = useState('all');

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [tempPriceRange, setTempPriceRange] = useState([0, 100000]);
  const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
  const [tempAvailability, setTempAvailability] = useState('all');
  const ratingOptions = [5,4,3,2,1];

  const isProviderInCart = (providerId, serviceId) => {
    return cartItems.some(
      item => item.providerId === providerId && item.serviceId === serviceId
    );
  };

  useEffect(() => { loadCategoryAndProviders(); }, [slug]);

  const loadCategoryAndProviders = async () => {
    setLoading(true);
    try {
      const catRes = await fetchCategoryBySlug(slug);
      if (catRes.success) {
        setCategory(catRes.data.category);
        setCategoryRatingStats(catRes.data.ratingStats || null);
      } else setCategory({ name: slug, description: '' });

      const providersRes = await searchProviders(null, null, 100, catRes.data.category?._id);
      if (providersRes.success && providersRes.data.providers) {
        let providerList = providersRes.data.providers.map(p => ({
          ...p,
          id: p.id || p._id,
          servicesList: p.servicesList || [],
          distance: (Math.random() * 10 + 0.5).toFixed(1)
        }));
        setProviders(providerList);
        setFilteredProviders(providerList);

        const maxPrice = Math.max(...providerList.map(p => p.minPrice || 0), 100000);
        setPriceMax(maxPrice);
        setPriceRange([0, maxPrice]);
        setTempPriceRange([0, maxPrice]);
      } else { setProviders([]); setFilteredProviders([]); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!providers.length) return;
    let filtered = [...providers];
    if (searchTerm) {
      filtered = filtered.filter(p => p.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered = filtered.filter(p => (p.minPrice || 0) >= priceRange[0] && (p.minPrice || 0) <= priceRange[1]);
    if (selectedRatings.length) {
      filtered = filtered.filter(p => selectedRatings.some(rating => (p.rating?.average || 0) >= rating));
    }
    if (availability === 'now') filtered = filtered.filter(p => p.isOnline === true);
    else if (availability === 'later') filtered = filtered.filter(p => p.isOnline === false);
    setFilteredProviders(filtered);
  }, [providers, searchTerm, priceRange, selectedRatings, availability]);

  // Drawer: close on Escape and lock background scroll while open
  useEffect(() => {
    if (!mobileFilterOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileFilterOpen(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileFilterOpen]);

  const toggleRating = (rating) => {
    if (selectedRatings.includes(rating)) setSelectedRatings(selectedRatings.filter(r => r !== rating));
    else setSelectedRatings([...selectedRatings, rating]);
  };
  const clearFilters = () => { setSearchTerm(''); setPriceRange([0, priceMax]); setSelectedRatings([]); setAvailability('all'); };
  const openMobileFilters = () => { setTempPriceRange([...priceRange]); setTempSelectedRatings([...selectedRatings]); setTempAvailability(availability); setMobileFilterOpen(true); };
  const applyMobileFilters = () => { setPriceRange(tempPriceRange); setSelectedRatings(tempSelectedRatings); setAvailability(tempAvailability); setMobileFilterOpen(false); };

  const getRealServiceFromProvider = (provider) => {
    if (provider.serviceId) {
      return {
        _id: provider.serviceId,
        name: (provider.servicesList && provider.servicesList.length > 0) ? provider.servicesList[0] : provider.businessName,
        basePrice: provider.minPrice || 199,
        priceUnit: 'service',
        category: { _id: category?._id },
        providerName: provider.businessName
      };
    }
    console.warn('Provider has no serviceId – cannot add to cart directly', provider);
    return null;
  };

  const handleAddToCart = (provider) => {
    const realService = getRealServiceFromProvider(provider);
    if (realService) {
      addToCart(realService, 1, null, provider.id, realService.providerName);
    } else {
      alert('This provider does not have a valid service. Please view their profile and select a service.');
    }
  };

  // ✅ Direct checkout without cart
  const handleBookNow = (provider) => {
    const realService = getRealServiceFromProvider(provider);
    if (realService) {
      const directBookingData = {
        serviceId: realService._id,
        providerId: provider.id,
        providerName: provider.businessName,
        serviceName: realService.name,
        price: realService.basePrice,
        priceUnit: realService.priceUnit,
        categoryId: category?._id,
        image: provider.image || null,
      };
      navigate('/checkout', { state: { directBooking: directBookingData } });
    } else {
      navigate(`/provider/${provider.id}`);
    }
  };

  if (loading) return <div className="flex justify-center py-20" role="status" aria-label="Loading providers"><div className="animate-spin motion-reduce:animate-none rounded-full h-10 w-10 border-4 border-[#0E7C86] border-t-transparent"></div></div>;

  const totalProviders = filteredProviders.length;
  const avgCategoryRating = categoryRatingStats?.average || 0;
  const totalReviews = categoryRatingStats?.count || 0;
  const ratingBreakdown = categoryRatingStats || { five:0, four:0, three:0, two:0, one:0 };
  const totalR = totalReviews || 1;
  const ratingPercentages = { 5: (ratingBreakdown.five/totalR)*100, 4: (ratingBreakdown.four/totalR)*100, 3: (ratingBreakdown.three/totalR)*100, 2: (ratingBreakdown.two/totalR)*100, 1: (ratingBreakdown.one/totalR)*100 };

  const activeFilterCount =
    (priceRange[0] > 0 || priceRange[1] < priceMax ? 1 : 0) +
    (selectedRatings.length > 0 ? 1 : 0) +
    (availability !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0);

  return (
    <div className="bg-[#F6F8F9] min-h-screen text-[#2B3A4F] font-sans antialiased pb-28">
      {/* CATEGORY HERO */}
      <section aria-labelledby="category-title" className="bg-[#111E30] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 shrink-0 bg-[#0E7C86] rounded-xl flex items-center justify-center overflow-hidden">
              {category?.icon?.url ? (
                <img src={category.icon.url} alt="" width="56" height="56" className="w-full h-full object-contain p-2" />
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 10-2.828-2.828m2.828 2.828l-3.414-3.414m3.414 3.414a2 2 0 11-2.828 2.828m-1.414-1.414l3.414 3.414m-12-11.414h1.5a2 2 0 012 2v1.5M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              )}
            </div>
            <div className="min-w-0">
              <h1 id="category-title" className="text-2xl sm:text-3xl font-bold tracking-tight font-merienda leading-tight break-words">{category?.name}</h1>
              {category?.description && <p className="text-[#B7C3D1] text-sm sm:text-base mt-1.5 max-w-xl">{category.description}</p>}
            </div>
          </div>

          <div className="bg-[#18293F] rounded-xl p-4 border border-white/10 w-full md:w-72 shrink-0">
            {totalReviews > 0 ? (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white leading-none">{avgCategoryRating.toFixed(1)}</div>
                  <div className="flex gap-0.5 my-1.5 justify-center" role="img" aria-label={`Average rating ${avgCategoryRating.toFixed(1)} out of 5`}>{[...Array(5)].map((_,s) => <Star key={s} className={`w-3 h-3 ${s+1 <= Math.round(avgCategoryRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-500'}`} />)}</div>
                  <div className="text-[11px] text-[#B7C3D1]">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</div>
                </div>
                <div className="flex-1 space-y-1">{[5,4,3,2,1].map(s => (<div key={s} className="flex items-center gap-1.5 text-[11px] text-[#B7C3D1]"><span className="w-5 text-right">{s}★</span><div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${ratingPercentages[s]}%` }}></div></div><span className="w-8 text-right">{Math.round(ratingPercentages[s])}%</span></div>))}</div>
              </div>
            ) : (
              <p className="text-sm text-[#B7C3D1]">No reviews for this category yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-sm text-[#5B6B7F]">
          <li><Link to="/" className={`inline-flex items-center gap-1 min-h-[32px] hover:text-[#0E7C86] rounded ${FOCUS}`}><HomeIcon className="w-3.5 h-3.5" aria-hidden="true" /> Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="w-3.5 h-3.5" /></li>
          <li aria-current="page" className="text-[#0B5F67] font-medium truncate">{category?.name || 'Category'}</li>
        </ol>
      </nav>

      {/* MAIN GRID */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* DESKTOP FILTERS */}
          <aside aria-label="Filters" className="hidden lg:block bg-white border border-[#E3E8EC] rounded-xl p-5 sticky top-36">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#EEF1F4]">
              <h2 className="font-bold text-[#111E30] text-base flex items-center gap-2"><Filter className="w-4 h-4 text-[#5B6B7F]" aria-hidden="true" /> Filters</h2>
              <button onClick={clearFilters} className={`text-sm text-[#0E7C86] font-semibold hover:underline rounded ${FOCUS}`}>Reset</button>
            </div>
            <FilterFields
              idp="d"
              categoryName={category?.name}
              priceMax={priceMax}
              price={priceRange}
              onPriceMax={(v) => setPriceRange([priceRange[0], v])}
              ratings={selectedRatings}
              onToggleRating={toggleRating}
              availability={availability}
              onAvailability={setAvailability}
            />
          </aside>

          {/* RIGHT CONTENT */}
          <main className="lg:col-span-3 space-y-4 min-w-0">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <button onClick={openMobileFilters} className={`lg:hidden relative flex items-center gap-2 bg-white border border-[#DDE3E8] rounded-lg px-3.5 h-11 text-sm font-semibold text-[#111E30] ${FOCUS}`}>
                  <Filter className="w-4 h-4" aria-hidden="true" /> Filters
                  {activeFilterCount > 0 && <span className="min-w-[20px] h-5 px-1 rounded-full bg-[#0E7C86] text-white text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
                </button>
                <h2 className="font-bold text-[#111E30] text-base" aria-live="polite">{totalProviders} {totalProviders === 1 ? 'Provider' : 'Providers'} Found</h2>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-[#8A97A8]">Sort By</label>
                <select id="sort-by" disabled title="Sorting isn’t available yet" className="border border-[#DDE3E8] rounded-lg px-2 h-10 text-sm bg-[#F6F8F9] text-[#8A97A8]"><option>Recommended</option><option>Price: Low to High</option><option>Rating: High to Low</option></select>
              </div>
            </div>

            <div className="relative">
              <label htmlFor="provider-search" className="sr-only">Search providers</label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D] pointer-events-none" aria-hidden="true" />
              <input
                id="provider-search"
                type="text"
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-11 bg-white border border-[#DDE3E8] rounded-xl text-base sm:text-sm text-[#111E30] placeholder:text-[#8A97A8] hover:border-[#B9C4CF] focus:outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15 transition"
              />
            </div>

            <div className="space-y-4">
              {filteredProviders.map(provider => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onAddToCart={handleAddToCart}
                  onBookNow={handleBookNow}
                  distance={provider.distance}
                  isInCart={isProviderInCart(provider.id, provider.serviceId)}
                />
              ))}
              {filteredProviders.length === 0 && (
                <div className="bg-white border border-[#E3E8EC] rounded-xl p-8 text-center text-[#5B6B7F]">
                  {providers.length === 0 ? (
                    <p>No providers are listed in this category yet.</p>
                  ) : (
                    <>
                      <p>No providers found matching your filters.</p>
                      <button onClick={clearFilters} className={`mt-3 inline-flex items-center h-10 px-4 rounded-lg border border-[#0E7C86] text-[#0B5F67] text-sm font-semibold hover:bg-[#E4F3F4] ${FOCUS}`}>Reset filters</button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Existing static pagination: not wired to any data, kept but disabled */}
            <fieldset disabled className="bg-white rounded-lg border border-[#E3E8EC] p-3 flex flex-col items-center gap-2 mt-6 opacity-60">
              <legend className="sr-only">Pagination (not active)</legend>
              <div className="flex items-center gap-1.5 text-xs">
                <button className="w-8 h-8 flex items-center justify-center border border-[#DDE3E8] rounded-md text-[#8A97A8]">‹</button>
                <button className="w-8 h-8 flex items-center justify-center bg-[#0E7C86] text-white font-bold rounded-md">1</button>
                <button className="w-8 h-8 flex items-center justify-center border border-[#DDE3E8] rounded-md text-[#5B6B7F]">2</button>
                <button className="w-8 h-8 flex items-center justify-center border border-[#DDE3E8] rounded-md text-[#5B6B7F]">3</button>
                <span className="px-1 text-[#8A97A8]">...</span>
                <button className="w-8 h-8 flex items-center justify-center border border-[#DDE3E8] rounded-md text-[#5B6B7F]">8</button>
                <button className="w-8 h-8 flex items-center justify-center border border-[#DDE3E8] rounded-md text-[#8A97A8]">›</button>
              </div>
              <p className="text-xs text-[#5B6B7F]">All matching providers are shown on this page.</p>
            </fieldset>
          </main>
        </div>
      </div>

      {/* FLOATING CART SHORTCUT */}
      <div
        className="fixed z-50 inset-x-4 sm:inset-x-auto sm:right-6 flex justify-end pointer-events-none"
        style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={() => navigate('/cart')}
          aria-label={`View cart, ${cartCount || 0} items`}
          className={`pointer-events-auto bg-[#111E30] hover:bg-[#18293F] text-white pl-3 pr-5 py-2.5 rounded-xl shadow-[0_14px_34px_-10px_rgba(17,30,48,0.6)] flex items-center gap-3 transition ${FOCUS}`}
        >
          <span className="relative">
            <span className="w-10 h-10 bg-[#0E7C86] rounded-lg flex items-center justify-center"><ShoppingCart className="w-5 h-5" aria-hidden="true" /></span>
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#111E30] text-[10px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-[#111E30]">{cartCount || 0}</span>
          </span>
          <span className="text-left">
            <span className="block text-sm font-semibold leading-tight">View Cart</span>
            <span className="block text-xs text-[#B7C3D1]">{cartCount || 0} Items | <span className="text-white font-semibold">₹{cartTotal ? cartTotal.toFixed(0) : '0'}</span></span>
          </span>
        </button>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[1150] bg-[#111E30]/55 backdrop-blur-sm flex items-end lg:hidden" onClick={() => setMobileFilterOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Filters" className="bg-white w-full max-h-[88vh] rounded-t-2xl flex flex-col animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="shrink-0 border-b border-[#EEF1F4] px-5 py-3 flex justify-between items-center">
              <h2 className="font-bold text-lg text-[#111E30]">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)} aria-label="Close filters" className={`w-10 h-10 -mr-2 flex items-center justify-center rounded-lg text-[#5B6B7F] hover:bg-[#F6F8F9] ${FOCUS}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-5">
              <FilterFields
                idp="m"
                categoryName={category?.name}
                priceMax={priceMax}
                price={tempPriceRange}
                onPriceMax={(v) => setTempPriceRange([tempPriceRange[0], v])}
                ratings={tempSelectedRatings}
                onToggleRating={(r) => { if (tempSelectedRatings.includes(r)) setTempSelectedRatings(tempSelectedRatings.filter(rt => rt !== r)); else setTempSelectedRatings([...tempSelectedRatings, r]); }}
                availability={tempAvailability}
                onAvailability={setTempAvailability}
              />
            </div>
            <div className="shrink-0 border-t border-[#EEF1F4] px-5 pt-3 flex gap-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
              <button onClick={() => { setMobileFilterOpen(false); clearFilters(); }} className={`flex-1 h-12 border border-[#B9C4CF] rounded-xl text-sm font-semibold text-[#111E30] hover:bg-[#F6F8F9] ${FOCUS}`}>Reset</button>
              <button onClick={applyMobileFilters} className={`flex-1 h-12 bg-[#0E7C86] hover:bg-[#0B6A73] text-white rounded-xl text-sm font-semibold ${FOCUS}`}>Apply Filters</button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slideUp{animation:slideUp 0.3s ease-out;}@media (prefers-reduced-motion: reduce){.animate-slideUp{animation:none}}`}</style>
    </div>
  );
};
export default CategoryPage;