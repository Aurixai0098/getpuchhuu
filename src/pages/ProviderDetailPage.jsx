// src/pages/ProviderDetailPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchProviderDetailsById, fetchProviderReviews } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Star, MapPin, Clock, Shield, Phone, MessageCircle, Briefcase, ChevronRight,
  ShoppingCart, Award, Users, Heart, Share2, BadgeCheck, Minus, Plus, ArrowRight,
  Wallet, CalendarCheck, ChevronDown,
} from 'lucide-react';

const FONT_STACK = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86] focus-visible:ring-offset-2';
const CARD = 'bg-white rounded-2xl border border-[#E3E8EC]';

const unitLabel = (u) => (u ? String(u).replace(/_/g, ' ') : 'per service');
const digitsOnly = (v) => String(v || '').replace(/\D/g, '');

const savedGet = () => { try { return JSON.parse(localStorage.getItem('savedProviders') || '[]'); } catch { return []; } };
const savedSet = (list) => { try { localStorage.setItem('savedProviders', JSON.stringify(list)); } catch { /* storage blocked */ } };

// ---------- Service row (Services tab) ----------
const ServiceCard = ({ service, providerId, onAddToCart }) => {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(service, providerId);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`${CARD} p-4 md:p-5 hover:shadow-[0_14px_30px_-18px_rgba(11,37,69,0.4)] transition-shadow`}>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-bold text-[#0B2545]">{service.name}</h3>
          <p className="text-[#5B6B7F] text-sm mt-1 leading-relaxed">
            {service.description || service.shortDescription || 'Professional service delivered with care and expertise.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {service.duration && (
              <span className="inline-flex items-center gap-1 text-xs text-[#5B6B7F] bg-[#F1F3F5] px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" aria-hidden="true" /> {service.duration} min</span>
            )}
            {service.isPopular && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full"><Award className="w-3 h-3" aria-hidden="true" /> Popular</span>
            )}
          </div>
        </div>
        <div className="flex md:flex-col items-center md:items-end justify-between gap-2 md:min-w-[150px]">
          <div className="md:text-right">
            <div className="text-2xl font-extrabold text-[#0B2545]">₹{service.basePrice}</div>
            <div className="text-xs text-[#6B7A8D]">{unitLabel(service.priceUnit)}</div>
          </div>
          <button
            onClick={handleAdd}
            className={`h-11 px-5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 ${FOCUS} ${added ? 'bg-[#E3F5F1] text-[#0B5F67] border border-[#0E7C86]/30' : 'bg-[#0E7C86] text-white hover:bg-[#0B6A73]'}`}
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Review ----------
const ReviewCard = ({ review }) => (
  <div className="border-b border-[#EEF1F4] pb-5 last:border-0 last:pb-0">
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-full bg-[#0E7C86] flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
        {review.customer?.firstName?.[0] || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <p className="font-semibold text-[#0B2545] flex items-center gap-1.5">
              {review.customer?.fullName || 'Anonymous'}
              {review.isVerifiedPurchase && <BadgeCheck className="w-4 h-4 text-[#0E7C86]" aria-label="Verified purchase" />}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#0B2545]">{review.rating?.overall?.toFixed(1)}</span>
              <span className="text-xs text-[#6B7A8D]">• {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <p className="text-[#3C4B5F] text-sm mt-2 leading-relaxed">{review.comment}</p>
      </div>
    </div>
  </div>
);

const StatsCard = ({ className = '', completedJobs, avgRating, yearsExp }) => (
  <dl className={`bg-white rounded-2xl shadow-[0_16px_40px_-18px_rgba(11,37,69,0.45)] p-4 space-y-3.5 ${className}`}>
    {[
      [Shield, 'bg-[#E3F5F1] text-[#0E7C86]', `${completedJobs.toLocaleString()}+`, 'Services completed'],
      [Star, 'bg-amber-50 text-amber-500 fill-amber-400', avgRating.toFixed(1), 'Average rating'],
      [Award, 'bg-[#E3F5F1] text-[#0E7C86]', `${yearsExp}+ Years`, 'Experience'],
    ].map(([Ic, tone, val, label]) => (
      <div key={label} className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-lg grid place-items-center shrink-0 ${tone.split(' ').slice(0, 2).join(' ')}`}><Ic className={`w-5 h-5 ${tone.split(' ').slice(2).join(' ')}`} aria-hidden="true" /></span>
        <div><dd className="text-[17px] font-extrabold text-[#0B2545] leading-none">{val}</dd><dt className="text-xs text-[#5B6B7F] mt-1">{label}</dt></div>
      </div>
    ))}
  </dl>
);

// ---------- Page ----------
const ProviderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartCount } = useCart();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // UI-only state
  const [selectedId, setSelectedId] = useState(null);
  const [qty, setQty] = useState(1);
  const [starFilter, setStarFilter] = useState(0);
  const [sortBy, setSortBy] = useState('latest');
  const [savedList, setSavedList] = useState(savedGet);
  const saved = savedList.includes(id);
  const [shareNote, setShareNote] = useState('');

  useEffect(() => {
    loadProvider();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (document.getElementById('puchhuu-font')) return;
    const l = document.createElement('link');
    l.id = 'puchhuu-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);

  const loadProvider = async () => {
    setLoading(true);
    try {
      const res = await fetchProviderDetailsById(id);
      if (res.success) {
        setProvider(res.data.provider);
        const reviewsRes = await fetchProviderReviews(id);
        if (reviewsRes.success) setReviews(reviewsRes.data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service, providerId) => {
    addToCart(service, 1, null, providerId);
  };

  const services = useMemo(() => provider?.services?.flatMap((s) => s.subServices || []) || [], [provider]);
  const selected = services.find((s) => s._id === selectedId) || services[0] || null;

  const filteredReviews = useMemo(() => {
    const list = starFilter ? reviews.filter((r) => Math.round(r.rating?.overall || 0) === starFilter) : [...reviews];
    if (sortBy === 'highest') list.sort((a, b) => (b.rating?.overall || 0) - (a.rating?.overall || 0));
    else if (sortBy === 'lowest') list.sort((a, b) => (a.rating?.overall || 0) - (b.rating?.overall || 0));
    else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [reviews, starFilter, sortBy]);

  const starCounts = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => { const k = Math.round(r.rating?.overall || 0); if (c[k] !== undefined) c[k] += 1; });
    return c;
  }, [reviews]);

  const toggleSave = () => {
    const list = savedGet();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    savedSet(next);
    setSavedList(next);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: provider?.businessName, url }); return; }
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied');
    } catch { setShareNote('Could not share'); }
    setTimeout(() => setShareNote(''), 2000);
  };

  const handleBookNow = () => {
    if (!selected) return;
    addToCart(selected, qty, null, provider._id);
    navigate('/checkout');
  };

  const handleAddSelected = () => {
    if (!selected) return;
    addToCart(selected, qty, null, provider._id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0E7C86] border-t-transparent motion-reduce:animate-none"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="text-center py-20 px-4" style={{ fontFamily: FONT_STACK }}>
        <div className="w-20 h-20 bg-[#F1F3F5] rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-10 h-10 text-[#8A97A8]" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-[#0B2545] mb-2">Provider Not Found</h2>
        <p className="text-[#5B6B7F] mb-6">The professional you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center h-11 bg-[#0E7C86] text-white px-6 rounded-xl hover:bg-[#0B6A73] transition font-semibold">Go Home</Link>
      </div>
    );
  }

  const avgRating = provider.rating?.average || 0;
  const reviewCount = provider.rating?.count || 0;
  const isOnline = provider.isAvailable && (new Date() - new Date(provider.lastActive) < 60000);
  const completedJobs = provider.stats?.completedBookings || 0;
  const yearsExp = provider.experience?.years || 0;
  const cities = provider.serviceArea?.cities || [];
  const isVerified = provider.verificationStatus === 'verified';
  const topRated = avgRating >= 4.5 && reviewCount >= 10;
  const avatar = provider.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.businessName)}&background=0E7C86&color=ffffff&size=160&length=2`;
  const phoneDigits = digitsOnly(provider.user?.phone);
  const total = selected ? Number(selected.basePrice || 0) * qty : 0;

  const TABS = [
    ['overview', 'Overview'],
    ['services', `Services (${services.length})`],
    ['reviews', `Reviews (${reviewCount})`],
  ];

  return (
    <div className="bg-white min-h-screen pb-28 lg:pb-12 text-[#0B2545]" style={{ fontFamily: FONT_STACK }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="py-4 flex items-center flex-wrap gap-1.5 text-[13px] text-[#5B6B7F]">
          <Link to="/" className="hover:text-[#0E7C86]">Home</Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          {provider.category?.name && (
            <>
              <Link to={`/category/${provider.category?.slug}`} className="hover:text-[#0E7C86]">{provider.category?.name}</Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </>
          )}
          <span className="text-[#0B2545] font-medium">Provider Profile</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:gap-8 items-start">
          {/* ============ LEFT COLUMN ============ */}
          <div className="min-w-0">
            {/* Banner */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B3B45] via-[#0E5560] to-[#0E7C86] h-[190px] sm:h-[250px] lg:h-[260px]">
              <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle at 20% 120%, #fff 0, transparent 45%), radial-gradient(circle at 85% -10%, #fff 0, transparent 40%)' }} aria-hidden="true" />
              {isVerified && (
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 text-xs font-semibold text-[#0B2545] shadow">
                  <BadgeCheck className="w-4 h-4 text-[#0E7C86]" aria-hidden="true" /> Verified Professional
                </span>
              )}
              <StatsCard className="hidden md:block absolute top-4 right-4 w-[250px]" completedJobs={completedJobs} avgRating={avgRating} yearsExp={yearsExp} />
            </div>

            {/* Identity row */}
            <div className="relative px-1 md:px-3 -mt-12 md:-mt-14">
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-5">
                <div className="relative shrink-0 w-24 h-24 md:w-[120px] md:h-[120px]">
                  <img src={avatar} alt={provider.businessName} width="120" height="120" className="w-full h-full rounded-full object-cover border-[5px] border-white shadow-lg bg-white" />
                  {isOnline && <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="Available now" />}
                </div>
                <div className="flex-1 min-w-0 md:pb-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight">{provider.businessName}</h1>
                    {topRated && <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-md"><Star className="w-3 h-3 fill-amber-500 text-amber-500" aria-hidden="true" />Top Rated</span>}
                  </div>
                  {provider.category?.name && <p className="text-sm text-[#5B6B7F] mt-0.5">{provider.category.name} Expert</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm">
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" /><b>{avgRating.toFixed(1)}</b><span className="text-[#5B6B7F]">({reviewCount.toLocaleString()} reviews)</span></span>
                    <span className="font-semibold">{completedJobs.toLocaleString()}+ bookings</span>
                    <span className={`inline-flex items-center gap-1.5 ${isOnline ? 'text-green-700' : 'text-[#6B7A8D]'}`}><span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />{isOnline ? 'Available now' : 'Offline'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:pb-1">
                  <button onClick={toggleSave} aria-pressed={saved} className={`h-11 px-4 rounded-xl border border-[#DDE3E8] bg-white text-sm font-semibold inline-flex items-center gap-2 hover:border-[#0E7C86]/50 ${FOCUS}`}>
                    <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />{saved ? 'Saved' : 'Save'}
                  </button>
                  <button onClick={handleShare} className={`h-11 px-4 rounded-xl border border-[#DDE3E8] bg-white text-sm font-semibold inline-flex items-center gap-2 hover:border-[#0E7C86]/50 ${FOCUS}`}>
                    <Share2 className="w-4 h-4" aria-hidden="true" />{shareNote || 'Share'}
                  </button>
                  <a href="#book" className={`hidden md:inline-flex lg:hidden h-11 px-5 rounded-xl bg-[#12614F] text-white text-sm font-semibold items-center gap-2 ${FOCUS}`}>Book Now <ArrowRight className="w-4 h-4" aria-hidden="true" /></a>
                </div>
              </div>

              {provider.bio && <p className="mt-4 text-[14.5px] text-[#3C4B5F] leading-relaxed max-w-3xl">{provider.bio}</p>}
              <StatsCard className="md:hidden mt-4 border border-[#E3E8EC]" completedJobs={completedJobs} avgRating={avgRating} yearsExp={yearsExp} />
            </div>

            {/* Trust row (from real profile data) */}
            <ul className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                isVerified && [BadgeCheck, 'Verified professional', 'Profile verified'],
                [Award, `${yearsExp}+ years`, 'Experience'],
                [Users, `${completedJobs.toLocaleString()}+ jobs`, 'Completed'],
                [Wallet, 'Pay after service', 'Once the work is done'],
              ].filter(Boolean).map(([Ic, t, s]) => (
                <li key={t} className="flex items-center gap-3 rounded-xl bg-[#F6F8F9] p-3">
                  <span className="w-10 h-10 rounded-full bg-[#E3F5F1] grid place-items-center shrink-0"><Ic className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /></span>
                  <span className="min-w-0"><span className="block text-[13px] font-bold truncate">{t}</span><span className="block text-xs text-[#5B6B7F] truncate">{s}</span></span>
                </li>
              ))}
            </ul>

            {/* Tabs */}
            <div role="tablist" aria-label="Provider sections" className="mt-7 flex gap-6 border-b border-[#E3E8EC] overflow-x-auto no-scrollbar">
              {TABS.map(([key, label]) => (
                <button
                  key={key} role="tab" aria-selected={activeTab === key} onClick={() => setActiveTab(key)}
                  className={`relative shrink-0 h-12 text-sm whitespace-nowrap transition-colors ${FOCUS} rounded-md ${activeTab === key ? 'font-bold text-[#0B2545]' : 'font-medium text-[#5B6B7F] hover:text-[#0E7C86]'}`}
                >
                  {label}
                  <span className={`absolute left-0 right-0 -bottom-px h-[3px] rounded-full bg-[#0E7C86] transition-transform origin-left ${activeTab === key ? 'scale-x-100' : 'scale-x-0'}`} />
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
              <div role="tabpanel" className="pt-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-3">About</h2>
                    <p className="text-[14.5px] text-[#3C4B5F] leading-relaxed">{provider.bio || 'This professional has not added a description yet.'}</p>
                  </div>
                  <dl className="rounded-xl bg-[#F6F8F9] border border-[#EEF1F4] p-4 text-sm space-y-2.5 self-start">
                    <div className="flex justify-between gap-4"><dt className="text-[#5B6B7F]">Experience</dt><dd className="font-semibold">{yearsExp}+ Years</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#5B6B7F]">Total bookings</dt><dd className="font-semibold">{completedJobs.toLocaleString()}+</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-[#5B6B7F]">Service areas</dt><dd className="font-semibold text-right">{cities.length ? <>{cities.slice(0, 3).join(', ')}{cities.length > 3 && <span className="text-[#0E7C86]"> +{cities.length - 3} more</span>}</> : 'Not set'}</dd></div>
                    {provider.serviceArea?.radius && <div className="flex justify-between gap-4"><dt className="text-[#5B6B7F]">Radius</dt><dd className="font-semibold">{provider.serviceArea.radius} km</dd></div>}
                  </dl>
                </div>

                {provider.workingHours?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /> Working hours</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 text-sm">
                      {provider.workingHours.map((wh) => (
                        <div key={wh.day} className="flex justify-between border-b border-[#EEF1F4] py-2.5">
                          <span className="capitalize text-[#5B6B7F]">{wh.day}</span>
                          <span className={wh.isWorking ? 'font-semibold' : 'text-[#8A97A8]'}>{wh.isWorking ? `${wh.slots?.[0]?.startTime} - ${wh.slots?.[0]?.endTime}` : 'Closed'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /> Service area</h3>
                  <p className="text-sm text-[#3C4B5F]"><b>Cities:</b> {cities.join(', ') || 'None'}</p>
                  <p className="text-sm text-[#3C4B5F] mt-1"><b>Pincodes:</b> {provider.serviceArea?.pincodes?.join(', ') || 'None'}</p>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2"><Phone className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /> Contact</h3>
                  <div className="flex flex-wrap items-center gap-3">
                    <a href={`tel:${provider.user?.phone}`} className={`inline-flex items-center gap-2 h-11 px-4 bg-[#F1F3F5] rounded-xl text-sm font-semibold hover:bg-[#E8EDF1] ${FOCUS}`}><Phone className="w-4 h-4" aria-hidden="true" /> Call provider</a>
                    {phoneDigits && <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 h-11 px-4 bg-green-50 text-green-700 rounded-xl text-sm font-semibold hover:bg-green-100 ${FOCUS}`}><MessageCircle className="w-4 h-4" aria-hidden="true" /> WhatsApp</a>}
                  </div>
                  <p className="text-[#5B6B7F] text-sm mt-3">Email: {provider.user?.email || 'Not available'}</p>
                </div>
              </div>
            )}

            {/* Services */}
            {activeTab === 'services' && (
              <div role="tabpanel" className="pt-6 space-y-4">
                {services.length === 0 ? (
                  <div className={`${CARD} p-12 text-center`}><Briefcase className="w-12 h-12 text-[#B0BAC6] mx-auto mb-3" aria-hidden="true" /><p className="text-[#5B6B7F]">No services offered yet.</p></div>
                ) : (
                  services.map((service) => <ServiceCard key={service._id} service={service} providerId={provider._id} onAddToCart={handleAddToCart} />)
                )}
                <div className="flex justify-end pt-2">
                  <button onClick={() => navigate('/checkout')} className={`h-11 px-6 bg-[#0B2545] text-white rounded-xl font-semibold hover:bg-[#12335E] transition-colors ${FOCUS}`}>Proceed to Checkout</button>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === 'reviews' && (
              <div role="tabpanel" className="pt-6">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-extrabold">Customer reviews</h2>
                    <p className="flex items-center gap-1.5 mt-1 text-sm"><Star className="w-5 h-5 text-amber-400 fill-amber-400" aria-hidden="true" /><b className="text-lg">{avgRating.toFixed(1)}</b> out of 5 <span className="text-[#5B6B7F]">({reviewCount.toLocaleString()} reviews)</span></p>
                  </div>
                  <div className="relative">
                    <label htmlFor="review-sort" className="sr-only">Sort reviews</label>
                    <select id="review-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`appearance-none h-10 pl-4 pr-9 rounded-lg border border-[#DDE3E8] bg-white text-sm font-medium ${FOCUS}`}>
                      <option value="latest">Latest first</option>
                      <option value="highest">Highest rated</option>
                      <option value="lowest">Lowest rated</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7A8D]" aria-hidden="true" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter by rating">
                  {[[0, `All (${reviews.length})`], ...[5, 4, 3, 2, 1].map((n) => [n, `${n} ★ (${starCounts[n]})`])].map(([n, label]) => (
                    <button key={n} onClick={() => setStarFilter(n)} aria-pressed={starFilter === n}
                      className={`h-9 px-4 rounded-lg text-[13px] font-semibold border transition-colors ${FOCUS} ${starFilter === n ? 'bg-[#0E7C86] text-white border-[#0E7C86]' : 'bg-white text-[#3C4B5F] border-[#DDE3E8] hover:border-[#0E7C86]/50'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12"><MessageCircle className="w-12 h-12 text-[#B0BAC6] mx-auto mb-3" aria-hidden="true" /><p className="text-[#5B6B7F]">No reviews yet. Be the first to review!</p></div>
                ) : filteredReviews.length === 0 ? (
                  <p className="text-center py-10 text-[#5B6B7F]">No reviews with this rating.</p>
                ) : (
                  <div className="space-y-5">{filteredReviews.map((review) => <ReviewCard key={review._id} review={review} />)}</div>
                )}
              </div>
            )}
          </div>

          {/* ============ RIGHT: BOOKING CARD ============ */}
          <aside id="book" className="lg:sticky lg:top-36 space-y-4 scroll-mt-32">
            <div className={`${CARD} p-5 shadow-[0_16px_40px_-22px_rgba(11,37,69,0.35)]`}>
              <h2 className="text-xl font-extrabold">Book a service</h2>
              {services.length === 0 ? (
                <p className="mt-4 text-sm text-[#5B6B7F]">This professional has not listed any services yet.</p>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-extrabold">₹{selected?.basePrice}<span className="text-sm font-medium text-[#6B7A8D]"> {unitLabel(selected?.priceUnit)}</span></p>

                  <fieldset className="mt-5">
                    <legend className="text-sm font-semibold mb-2">Select service</legend>
                    <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-0.5">
                      {services.map((s) => {
                        const on = selected?._id === s._id;
                        return (
                          <label key={s._id} className={`relative cursor-pointer rounded-xl border p-3 text-sm transition-colors ${on ? 'border-[#0E7C86] bg-[#E8F7F8]' : 'border-[#DDE3E8] hover:border-[#0E7C86]/50'}`}>
                            <input type="radio" name="service" className="sr-only" checked={on} onChange={() => setSelectedId(s._id)} />
                            <span className="block font-semibold leading-snug line-clamp-2">{s.name}</span>
                            <span className="block mt-1 font-bold text-[#0E7C86]">₹{s.basePrice}</span>
                            {on && <BadgeCheck className="absolute top-2 right-2 w-4 h-4 text-[#0E7C86]" aria-hidden="true" />}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2" id="units-label">Select units</p>
                      <div className="inline-flex items-center rounded-xl border border-[#DDE3E8]" role="group" aria-labelledby="units-label">
                        <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease units" className={`w-11 h-11 grid place-items-center disabled:opacity-40 ${FOCUS} rounded-l-xl`}><Minus className="w-4 h-4" /></button>
                        <span className="w-10 text-center font-bold" aria-live="polite">{qty}</span>
                        <button onClick={() => setQty((q) => Math.min(10, q + 1))} disabled={qty >= 10} aria-label="Increase units" className={`w-11 h-11 grid place-items-center disabled:opacity-40 ${FOCUS} rounded-r-xl`}><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold">₹{total.toLocaleString('en-IN')}</p>
                  </div>

                  <button onClick={handleBookNow} className={`mt-5 w-full h-12 rounded-xl bg-[#12614F] hover:bg-[#0E7C86] text-white font-bold inline-flex items-center justify-center gap-2 transition-colors ${FOCUS}`}>
                    Book Now <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button onClick={handleAddSelected} className={`mt-2.5 w-full h-11 rounded-xl border border-[#0E7C86] text-[#0B5F67] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#F0F6F7] ${FOCUS}`}>
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" /> Add to cart
                  </button>
                  <p className="mt-3 text-center text-xs text-[#6B7A8D]">Pay after the work is done. Choose your time at checkout.</p>
                </>
              )}
            </div>

            <ul className={`${CARD} p-5 space-y-4`}>
              <li className="flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-[#E3F5F1] grid place-items-center"><Wallet className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /></span><span><b className="block text-sm">Pay after service</b><span className="text-xs text-[#5B6B7F]">Pay once the work is complete</span></span></li>
              {isVerified && <li className="flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-[#E3F5F1] grid place-items-center"><Shield className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /></span><span><b className="block text-sm">Verified professional</b><span className="text-xs text-[#5B6B7F]">Profile checked by Puchhuu</span></span></li>}
              <li className="flex items-center gap-3"><span className="w-10 h-10 rounded-lg bg-[#E3F5F1] grid place-items-center"><CalendarCheck className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /></span><span><b className="block text-sm">Need help?</b><Link to="/help" className="text-xs text-[#0E7C86] hover:underline">Visit the help center</Link></span></li>
            </ul>
          </aside>
        </div>
      </div>

      {/* Mobile sticky CTA + cart shortcut */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#E3E8EC] px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/cart')} aria-label={`View cart, ${cartCount || 0} items`} className={`relative w-12 h-12 shrink-0 rounded-xl border border-[#DDE3E8] grid place-items-center ${FOCUS}`}>
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#0E7C86] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center ring-2 ring-white">{cartCount > 9 ? '9+' : cartCount}</span>}
          </button>
          <a href="#book" className={`flex-1 h-12 rounded-xl bg-[#12614F] text-white font-bold inline-flex items-center justify-center gap-2 ${FOCUS}`}>
            {selected ? `Book from ₹${selected.basePrice}` : 'Book now'} <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Desktop floating cart */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-40">
        <button onClick={() => navigate('/cart')} className={`bg-white border border-[#E3E8EC] pl-3 pr-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 hover:shadow-2xl transition ${FOCUS}`}>
          <div className="relative">
            <div className="w-11 h-11 bg-[#0E7C86] rounded-xl flex items-center justify-center text-white"><ShoppingCart className="w-5 h-5" aria-hidden="true" /></div>
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{cartCount > 9 ? '9+' : cartCount}</span>}
          </div>
          <div className="text-left"><div className="text-xs font-bold">View cart</div><div className="text-[11px] text-[#6B7A8D] font-medium">{cartCount || 0} {cartCount === 1 ? 'item' : 'items'}</div></div>
        </button>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

export default ProviderDetailPage;