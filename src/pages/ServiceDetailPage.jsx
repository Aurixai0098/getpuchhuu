import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchServiceBySlug, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';

import {
  ShoppingCart, Check, Star, Clock, ChevronRight,
  ChevronLeft, ChevronDown, Heart, Share2, Users,
  Sparkles, X, ImageIcon, ArrowRight, Home, Tag, MessageCircle, Zap, BookOpen,
  Loader2, ShieldCheck, IndianRupee, CalendarDays, Minus, Plus, Play,
  BadgeCheck, ThumbsUp, Flame, Lock, RotateCcw, Crown
} from 'lucide-react';

/* ------------------------------------------------------------------
   Puchhuu design tokens (Tailwind arbitrary values, no config changes)
   Teal   #0E7C86  (hover #0B656E, tint #E6F4F5)
   Navy   #0B2545
------------------------------------------------------------------- */

/* ------------------------------------------------------------------
   UI-ONLY SETTINGS (backend se koi lena-dena nahi)
------------------------------------------------------------------- */

// Booking card me Units / Date / Time Slot selectors dikhane ke liye.
// NOTE: cart abhi sirf `addToCart(service)` leta hai, isliye ye selections cart me nahi jaate (sirf UI).
// Nahi chahiye to false kar do.
const SHOW_BOOKING_OPTIONS = true;

const TIME_SLOTS = ['9 AM - 12 PM', '12 PM - 3 PM', '3 PM - 6 PM', '6 PM - 9 PM'];

const WHY_CHOOSE = [
  { Icon: ShieldCheck, title: 'Verified & Trained Experts', sub: 'Background verified professionals', tint: 'bg-[#E3F5F1] text-[#0E7C86]' },
  { Icon: IndianRupee, title: 'Transparent Pricing', sub: 'No hidden charges', tint: 'bg-amber-100 text-amber-600' },
  { Icon: Clock, title: 'On-Time Service', sub: 'Your time matters', tint: 'bg-indigo-100 text-indigo-600' },
  { Icon: Crown, title: '100% Satisfaction', sub: 'Quality guaranteed', tint: 'bg-purple-100 text-purple-600' },
];

const TRUST_ICONS = [
  { Icon: ShieldCheck, label: 'Verified\nProfessionals' },
  { Icon: Clock, label: 'On-Time\nService' },
  { Icon: Lock, label: 'Safe\n& Secure' },
  { Icon: BadgeCheck, label: 'Service\nWarranty' },
];

const POLICIES = [
  { Icon: RotateCcw, title: 'Free Cancellation', sub: 'Upto 2 hours before service' },
  { Icon: Lock, title: 'Secure Payments', sub: '100% safe and encrypted' },
  { Icon: ShieldCheck, title: 'Service Warranty', sub: '7 days service warranty' },
];

const CARD = 'bg-white rounded-2xl border border-[#E8EDF1] shadow-sm';

/* ------------------------------------------------------------------
   Helpers (UI only)
------------------------------------------------------------------- */
const compact = (n) => {
  const num = Number(n) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(num);
};

const reviewPhotos = (review) =>
  (review.images || review.photos || [])
    .map((i) => (typeof i === 'string' ? i : i?.url))
    .filter(Boolean);

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const buildDates = () =>
  Array.from({ length: 3 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: toISO(d),
      top: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' }),
      bottom: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    };
  });

// Shimmer Skeleton
const ShimmerSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-slate-200 rounded-lg w-48 max-w-full"></div>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="aspect-video bg-slate-200 rounded-2xl"></div>
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-2/3"></div>
        <div className="h-12 bg-slate-200 rounded-xl w-40 max-w-full"></div>
      </div>
    </div>
  </div>
);

// Image Gallery
const ImageGallery = ({ images, name, videoUrl }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Lock page scroll and allow Escape to close while the lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-14 h-14 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const goPrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  // Thumbnails: max 5 slots. 5+ images => 4 thumbs + "+N Photos" tile
  const MAX_THUMBS = 5;
  const showMoreTile = images.length > MAX_THUMBS;
  const thumbs = showMoreTile ? images.slice(0, MAX_THUMBS - 1) : images;
  const moreCount = images.length - (MAX_THUMBS - 1);

  return (
    <div className="space-y-3 min-w-0">
      <div
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={images[currentIndex].url}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/10 transition-colors" />
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft className="w-5 h-5 text-[#0B2545]" />
            </button>
            <button
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight className="w-5 h-5 text-[#0B2545]" />
            </button>
          </>
        )}

        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-white text-[#0B2545] text-xs sm:text-sm font-semibold px-3 py-2 rounded-lg shadow-md hover:bg-[#E6F4F5] transition-colors"
          >
            <Play className="w-4 h-4 fill-[#0B2545]" /> Watch Video
          </a>
        )}

        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> {currentIndex + 1}/{images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {thumbs.map((img, idx) => (
            <button
              key={idx}
              aria-label={`Show image ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all
                ${currentIndex === idx ? 'border-[#0E7C86] shadow-md' : 'border-transparent hover:border-slate-300'}`}
            >
              <img src={img.url} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
          {showMoreTile && (
            <button
              aria-label={`View ${moreCount} more photos`}
              onClick={() => { setCurrentIndex(MAX_THUMBS - 1); setLightboxOpen(true); }}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <img src={images[MAX_THUMBS - 1].url} alt="" className="w-full h-full object-cover" />
              <span className="absolute inset-0 bg-[#0B2545]/70 text-white text-xs font-semibold leading-tight grid place-items-center text-center">
                +{moreCount}<br />Photos
              </span>
            </button>
          )}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            aria-label="Close"
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images[currentIndex].url}
            alt={name}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <button
              aria-label="Previous image"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-white text-sm font-medium">{currentIndex + 1} / {images.length}</span>
            <button
              aria-label="Next image"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Review Card (row layout: details left, photos + helpful right)
const ReviewCard = ({ review }) => {
  const [helpful, setHelpful] = useState(false);
  const customerName = review.customer?.fullName || review.customer?.firstName || 'Anonymous';
  const customerAvatar = review.customer?.avatar?.url;
  const rating = review.rating?.overall || 0;
  const comment = review.comment;
  const date = review.createdAt;
  const title = review.title;
  const photos = reviewPhotos(review);
  const parsedDate = date ? new Date(date) : null;
  const dateLabel =
    parsedDate && !isNaN(parsedDate)
      ? parsedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '';
  const baseHelpful = Number(review.helpfulCount ?? review.helpful) || 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E8EDF1] hover:shadow-md transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-5">
        <div className="flex gap-3 flex-1 min-w-0">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName} className="w-11 h-11 rounded-full object-cover shadow-sm flex-shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0E7C86] to-[#0B2545] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {customerName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-[#0B2545] text-sm truncate">{customerName}</p>
              <BadgeCheck className="w-4 h-4 text-[#0E7C86] flex-shrink-0" aria-label="Verified customer" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
              {dateLabel && <span className="text-xs text-slate-400">{dateLabel}</span>}
            </div>
            {title && <h4 className="font-medium text-[#0B2545] text-sm mt-1.5 break-words">{title}</h4>}
            <p className="text-sm text-slate-600 leading-relaxed break-words mt-1">{comment}</p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="flex gap-2 md:flex-shrink-0">
            {photos.slice(0, 3).map((src, i) => (
              <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-lg overflow-hidden bg-slate-100 block">
                <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => setHelpful((v) => !v)}
          aria-pressed={helpful}
          className={`inline-flex items-center gap-1.5 text-xs self-start md:flex-shrink-0 ${helpful ? 'text-[#0E7C86] font-semibold' : 'text-slate-500 hover:text-[#0E7C86]'}`}
        >
          <ThumbsUp className={`w-4 h-4 ${helpful ? 'fill-[#0E7C86]/20' : ''}`} />
          Helpful ({baseHelpful + (helpful ? 1 : 0)})
        </button>
      </div>
    </div>
  );
};

// Reviews Modal Component (paginated, one review per row; bottom sheet on phones)
const ReviewsModal = ({ reviews, onClose }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(false);

  // Lock page scroll and allow Escape to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 10, reviews.length));
      setLoading(false);
    }, 300);
  };

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B2545]">All Reviews</h2>
            <p className="text-sm text-slate-500">{reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </div>
          <button aria-label="Close reviews" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Reviews List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {visibleReviews.map((review, idx) => (
            <ReviewCard key={review._id || idx} review={review} />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                {loading ? 'Loading...' : `Load more (${reviews.length - visibleCount} remaining)`}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-400">
          Showing {Math.min(visibleCount, reviews.length)} of {reviews.length} reviews
        </div>
      </div>
    </div>
  );
};

// Related Service Card
const RelatedCard = ({ service }) => {
  const relRating = Number(service.rating?.average) || 0;
  const relBookings = Number(service.bookingsCount) || 0;

  return (
    <Link
      to={`/service/${service.slug}`}
      className="group bg-white rounded-2xl border border-[#E8EDF1] overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 min-w-0"
    >
      <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
        <img
          src={service.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(service.name)}&background=random&size=400`}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-[#0B2545]">
          ₹{service.basePrice}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#0B2545] line-clamp-1 group-hover:text-[#0E7C86] transition-colors">{service.name}</h3>
        {(relRating > 0 || relBookings > 0) && (
          <div className="flex items-center gap-2 mt-2">
            {relRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-medium text-slate-600">{relRating.toFixed(1)}</span>
              </div>
            )}
            {relRating > 0 && relBookings > 0 && <span className="text-slate-300">|</span>}
            {relBookings > 0 && <span className="text-xs text-slate-500">{relBookings}+ bookings</span>}
          </div>
        )}
      </div>
    </Link>
  );
};

// Category chip (horizontal "explore" row)
const CategoryChip = ({ cat, isActive }) => (
  <Link
    to={`/category/${cat.slug}`}
    className={`flex-shrink-0 inline-flex items-center gap-2 pl-2 pr-4 py-2 rounded-full border text-sm whitespace-nowrap transition-colors
      ${isActive
        ? 'bg-[#E6F4F5] border-[#0E7C86] text-[#0E7C86] font-semibold'
        : 'bg-white border-[#E8EDF1] text-slate-600 hover:border-[#0E7C86] hover:text-[#0E7C86]'
      }`}
  >
    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
      {cat.icon?.url ? (
        <img src={cat.icon.url} alt="" className="w-4 h-4 object-contain" />
      ) : (
        <Tag className="w-3.5 h-3.5 text-slate-400" />
      )}
    </span>
    {cat.name}
  </Link>
);

// Booking panel (right column). Units / date / slot are UI-only state.
const BookingPanel = ({ service, unitLabel, added, onAdd, onBook }) => {
  const [units, setUnits] = useState(1);
  const dates = buildDates();
  const [date, setDate] = useState(dates[0].iso);
  const [slot, setSlot] = useState(TIME_SLOTS[0]);

  const price = Number(service.basePrice);
  const original = Number(service.originalPrice ?? service.mrp ?? service.compareAtPrice) || 0;
  const hasDiscount = original > price && price > 0;
  const off = hasDiscount ? Math.round(((original - price) / original) * 100) : 0;
  const total = Number.isFinite(price) ? price * units : service.basePrice;
  const customDate = !dates.some((d) => d.iso === date);

  const label = 'text-sm font-semibold text-[#0B2545] mb-2.5';

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-3xl font-bold text-[#0B2545]">₹{service.basePrice}</span>
        {hasDiscount && (
          <>
            <span className="text-slate-400 line-through text-sm">₹{original}</span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded">{off}% OFF</span>
          </>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-1">
        Starting price{unitLabel ? ` per ${unitLabel}` : ''}
      </p>

      {SHOW_BOOKING_OPTIONS && (
        <div className="mt-5 space-y-5 border-t border-slate-100 pt-5">
          {/* Units */}
          <div>
            <p className={label}>Select Units</p>
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center border border-[#E3E8EC] rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setUnits((u) => Math.max(1, u - 1))}
                  disabled={units <= 1}
                  aria-label="Decrease units"
                  className="w-10 h-10 grid place-items-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold text-[#0B2545]" aria-live="polite">{units}</span>
                <button
                  type="button"
                  onClick={() => setUnits((u) => Math.min(10, u + 1))}
                  disabled={units >= 10}
                  aria-label="Increase units"
                  className="w-10 h-10 grid place-items-center text-slate-500 hover:bg-slate-50 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-lg font-bold text-[#0B2545]">₹{total}</span>
            </div>
          </div>

          {/* Date */}
          <div>
            <p className={label}>Select Date</p>
            <div className="flex items-stretch gap-2">
              {dates.map((d) => {
                const on = date === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => setDate(d.iso)}
                    aria-pressed={on}
                    className={`flex-1 min-w-0 rounded-xl border px-1 py-2 text-center transition-colors ${
                      on ? 'border-[#0E7C86] bg-[#E6F4F5] text-[#0E7C86]' : 'border-[#E3E8EC] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="block text-xs font-semibold leading-tight">{d.top}</span>
                    <span className="block text-[11px] leading-tight mt-0.5">{d.bottom}</span>
                  </button>
                );
              })}
              <label
                className={`relative w-11 shrink-0 rounded-xl border grid place-items-center cursor-pointer transition-colors ${
                  customDate ? 'border-[#0E7C86] bg-[#E6F4F5] text-[#0E7C86]' : 'border-[#E3E8EC] text-slate-500 hover:border-slate-300'
                }`}
                title={customDate ? date : 'Pick another date'}
              >
                <CalendarDays className="w-5 h-5" />
                <input
                  type="date"
                  min={toISO(new Date())}
                  value={date}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  aria-label="Pick a date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Time slot */}
          <div>
            <p className={label}>Select Time Slot</p>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((s) => {
                const on = slot === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlot(s)}
                    aria-pressed={on}
                    className={`h-11 rounded-xl border text-sm transition-colors ${
                      on ? 'border-[#0E7C86] bg-[#E6F4F5] text-[#0E7C86] font-semibold' : 'border-[#E3E8EC] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={onBook}
        className="w-full mt-6 h-12 rounded-xl bg-gradient-to-r from-[#0E7C86] to-[#12948F] hover:from-[#0B656E] hover:to-[#0E7C86] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#0E7C86]/20 transition-all active:scale-95"
      >
        Book Now <ArrowRight className="w-5 h-5" />
      </button>

      <button
        onClick={onAdd}
        className={`w-full mt-3 h-11 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95
          ${added ? 'bg-[#0E7C86] border-[#0E7C86] text-white' : 'bg-white border-[#0E7C86] text-[#0E7C86] hover:bg-[#E6F4F5]'}`}
      >
        {added ? <><Check className="w-4 h-4" /> Added to Cart!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
      </button>

      <p className="text-center text-xs text-slate-400 mt-3">You won&apos;t be charged yet</p>
    </div>
  );
};

// Main ServiceDetailPage Component
const ServiceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSidebar, setLoadingSidebar] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewView, setReviewView] = useState('all'); // UI only: all | photos | latest | high | low

  // Scroll to top on first load and whenever the service slug changes
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const loadService = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchServiceBySlug(slug);
      if (res.success && res.data.service) {
        setService(res.data.service);
        setRelatedServices(res.data.relatedServices || []);
        setReviews(res.data.reviews || []);
      } else {
        setError('Service not found');
      }
    } catch (err) {
      console.error('Error loading service:', err);
      setError(err.message || 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCategories = async () => {
    setLoadingSidebar(true);
    try {
      const res = await fetchCategories();
      if (res.success) setAllCategories(res.data.categories || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setLoadingSidebar(false);
    }
  };

  useEffect(() => {
    loadService();
    loadAllCategories();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(service);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBookNow = () => {
    addToCart(service);
    navigate('/cart');
  };

  // Share: native share sheet where available, otherwise copy the page link
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: service?.name, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // User cancelled the share sheet or clipboard is unavailable: nothing to do
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <ShimmerSkeleton />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-slate-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2545] mb-3">Service Not Found</h1>
          <p className="text-slate-500 mb-8">{error || 'The service you are looking for does not exist or has been removed.'}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-[#0B2545] text-white px-8 py-3 rounded-xl hover:bg-[#0E7C86] transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 font-medium">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const avgRating = Number(service.rating?.average) || 0;
  const reviewCount = service.rating?.count || reviews.length || 0;
  const hasRating = reviewCount > 0 && avgRating > 0;
  const bookings = Number(service.bookingsCount) || 0;
  const unitLabel = service.priceUnit?.replace('_', ' ');
  const displayReviews = reviews.length > 0 ? reviews : [];
  const videoUrl = service.video?.url || service.videoUrl || null;
  const isMostBooked = !!(service.isPopular || service.isFeatured || bookings >= 100);

  // Review summary + filters (UI only, computed from the loaded reviews)
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  displayReviews.forEach((r) => {
    const k = Math.min(5, Math.max(1, Math.round(r.rating?.overall || 0)));
    if (r.rating?.overall) dist[k] += 1;
  });
  const distTotal = Object.values(dist).reduce((a, b) => a + b, 0);
  const allPhotos = displayReviews.flatMap(reviewPhotos);
  const photoReviewCount = displayReviews.filter((r) => reviewPhotos(r).length > 0).length;
  const time = (r) => (r.createdAt ? new Date(r.createdAt).getTime() || 0 : 0);

  let filteredReviews = displayReviews;
  if (reviewView === 'photos') filteredReviews = displayReviews.filter((r) => reviewPhotos(r).length > 0);
  if (reviewView === 'latest') filteredReviews = [...displayReviews].sort((a, b) => time(b) - time(a));
  if (reviewView === 'high') filteredReviews = [...displayReviews].sort((a, b) => (b.rating?.overall || 0) - (a.rating?.overall || 0));
  if (reviewView === 'low') filteredReviews = [...displayReviews].sort((a, b) => (a.rating?.overall || 0) - (b.rating?.overall || 0));

  const chips = [
    ['all', `All Reviews (${displayReviews.length})`],
    ['photos', `With Photos (${photoReviewCount})`],
    ['latest', 'Latest'],
    ['high', 'Highest Rating'],
    ['low', 'Lowest Rating'],
  ];

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0">
          <Link to="/" className="flex items-center gap-1 flex-shrink-0 hover:text-[#0E7C86] transition-colors">
            <Home className="w-3.5 h-3.5" /> <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {service.category?.slug && (
            <>
              <Link to={`/category/${service.category.slug}`} className="flex-shrink-0 hover:text-[#0E7C86] transition-colors">
                {service.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            </>
          )}
          <span className="truncate text-[#0B2545] font-medium">{service.name}</span>
        </nav>
      </div>

      {/* pb-28 on mobile leaves room for the sticky booking bar */}
      <div className="max-w-7xl mx-auto px-4 py-5 md:py-8 pb-28 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_340px] gap-6 lg:gap-8 items-start">

          {/* ============ Column 1: gallery ============ */}
          <div className="min-w-0 lg:col-start-1">
            <ImageGallery key={service._id || slug} images={service.images} name={service.name} videoUrl={videoUrl} />
          </div>

          {/* ============ Column 2: details ============ */}
          <div className="min-w-0 lg:col-start-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {isMostBooked && (
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-md mb-3">
                    <Flame className="w-3.5 h-3.5" /> Most Booked
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 -mt-1">
                <button
                  onClick={handleShare}
                  aria-label="Share service"
                  className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg border text-sm font-medium transition-colors ${copied ? 'bg-[#E6F4F5] border-[#0E7C86] text-[#0E7C86]' : 'border-[#E3E8EC] text-[#0B2545] hover:bg-slate-50'}`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? 'Copied' : 'Share'}
                </button>
                <button
                  onClick={() => setLiked(!liked)}
                  aria-label="Save service"
                  aria-pressed={liked}
                  className={`h-10 w-10 grid place-items-center rounded-lg border transition-all ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'border-[#E3E8EC] text-slate-500 hover:bg-slate-50'}`}
                >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] leading-tight break-words">
              {service.name}
            </h1>

            {service.description && (
              <p className="mt-2 text-slate-600 leading-relaxed whitespace-pre-line break-words">{service.description}</p>
            )}

            {(hasRating || bookings > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {hasRating && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-[#0B2545]">{avgRating.toFixed(1)}</span>
                    <span className="text-slate-500">({compact(reviewCount)} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                  </div>
                )}
                {hasRating && bookings > 0 && <span className="text-slate-300">|</span>}
                {bookings > 0 && (
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Users className="w-4 h-4" />
                    <span>{compact(bookings)}+ bookings</span>
                  </div>
                )}
              </div>
            )}

            {/* Trust icons */}
            <ul className="mt-5 grid grid-cols-4 gap-2 border-b border-slate-100 pb-5">
              {TRUST_ICONS.map(({ Icon, label }) => (
                <li key={label} className="flex flex-col items-center text-center gap-2">
                  <span className="w-11 h-11 rounded-full bg-[#E3F5F1] text-[#0E7C86] grid place-items-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-600 leading-tight whitespace-pre-line">{label}</span>
                </li>
              ))}
            </ul>

            {/* Service Includes */}
            {service.includes && service.includes.length > 0 && (
              <div className="mt-5">
                <h2 className="font-bold text-[#0B2545] mb-3">Service Includes</h2>
                <ul className="space-y-2.5">
                  {service.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 break-words">
                      <Check className="w-4 h-4 text-[#0E7C86] flex-shrink-0 mt-0.5" strokeWidth={3} />
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ============ Column 3: booking + policies ============ */}
          <aside className="min-w-0 lg:col-start-3 lg:row-start-1 lg:row-span-2 space-y-5 lg:sticky lg:top-6">
            <BookingPanel
              service={service}
              unitLabel={unitLabel}
              added={added}
              onAdd={handleAddToCart}
              onBook={handleBookNow}
            />
            <ul className={`${CARD} p-4 space-y-4`}>
              {POLICIES.map(({ Icon, title, sub }) => (
                <li key={title} className="flex items-center gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-[#E3F5F1] text-[#0E7C86] grid place-items-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-[#0B2545] leading-tight">{title}</span>
                    <span className="block text-xs text-slate-500 leading-tight mt-0.5">{sub}</span>
                  </span>
                </li>
              ))}
            </ul>
          </aside>

          {/* ============ Left area below hero: why choose, details, reviews ============ */}
          <div className="min-w-0 lg:col-start-1 lg:col-span-2 space-y-8">

            {/* Why Choose Puchhuu */}
            <section aria-labelledby="why-title">
              <h2 id="why-title" className="text-xl font-bold text-[#0B2545] mb-4">Why Choose Puchhuu?</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {WHY_CHOOSE.map(({ Icon, title, sub, tint }) => (
                  <li key={title} className="flex items-center gap-3 rounded-xl bg-[#F4F8FA] p-3.5">
                    <span className={`w-11 h-11 shrink-0 rounded-xl grid place-items-center ${tint}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#0B2545] leading-tight">{title}</span>
                      <span className="block text-xs text-slate-500 leading-tight mt-0.5">{sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Exclusions / Requirements */}
            {((service.excludes && service.excludes.length > 0) || (service.requirements && service.requirements.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.excludes && service.excludes.length > 0 && (
                  <div className={`${CARD} p-4 sm:p-5 min-w-0`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-red-500" />
                      </div>
                      <h3 className="font-bold text-[#0B2545]">Exclusions</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {service.excludes.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 break-words">
                          <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {service.requirements && service.requirements.length > 0 && (
                  <div className={`${CARD} p-4 sm:p-5 min-w-0`}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="font-bold text-[#0B2545]">Requirements</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {service.requirements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 break-words">
                          <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Customer Reviews */}
            <section aria-labelledby="reviews-title" className="border-t border-slate-100 pt-8">
              {displayReviews.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 id="reviews-title" className="text-xl font-bold text-[#0B2545]">Customer Reviews</h2>
                    <button
                      type="button"
                      onClick={() => setShowAllReviews(true)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#0E7C86] hover:text-[#0B656E] transition-colors"
                    >
                      View All Reviews <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary: rating + distribution + photos */}
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5 md:gap-8 items-center">
                    <div>
                      {hasRating && (
                        <p className="flex items-center gap-2 text-sm text-slate-600">
                          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                          <span className="font-bold text-[#0B2545] text-lg">{avgRating.toFixed(1)}</span> out of 5
                          <span className="text-slate-400">({reviewCount.toLocaleString('en-IN')} reviews)</span>
                        </p>
                      )}
                      <ul className="mt-3 space-y-1.5 w-full md:w-64">
                        {[5, 4, 3, 2, 1].map((n) => {
                          const pct = distTotal ? Math.round((dist[n] / distTotal) * 100) : 0;
                          return (
                            <li key={n} className="flex items-center gap-2 text-xs text-slate-600">
                              <span className="w-8 flex items-center gap-0.5">{n}<Star className="w-3 h-3 text-amber-400 fill-amber-400" /></span>
                              <span className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <span className="block h-full rounded-full bg-[#0E7C86]" style={{ width: `${pct}%` }} />
                              </span>
                              <span className="w-8 text-right">{pct}%</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {allPhotos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto sd-noscroll">
                        {allPhotos.slice(0, 5).map((src, i) => {
                          const last = i === 4 && allPhotos.length > 5;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewView('photos')}
                              className="relative flex-shrink-0 w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-slate-100"
                              aria-label="Show reviews with photos"
                            >
                              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                              {last && <span className="absolute inset-0 bg-black/55 text-white font-semibold grid place-items-center">+{allPhotos.length - 4}</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Filter chips */}
                  <div className="mt-6 flex gap-2 overflow-x-auto sd-noscroll pb-1" role="tablist" aria-label="Filter reviews">
                    {chips.map(([key, text]) => (
                      <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={reviewView === key}
                        onClick={() => setReviewView(key)}
                        className={`flex-shrink-0 h-10 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          reviewView === key ? 'bg-[#0E7C86] text-white' : 'bg-[#F4F8FA] text-[#2B3A50] hover:bg-[#E6F4F5]'
                        }`}
                      >
                        {text}
                      </button>
                    ))}
                  </div>

                  {/* Show first 4 reviews (one per row) */}
                  <div className="mt-4 space-y-3">
                    {filteredReviews.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-8">No reviews match this filter.</p>
                    ) : (
                      filteredReviews.slice(0, 4).map((review, idx) => (
                        <ReviewCard key={review._id || idx} review={review} />
                      ))
                    )}
                  </div>

                  {filteredReviews.length > 4 && (
                    <button
                      onClick={() => setShowAllReviews(true)}
                      className="w-full mt-5 py-3 bg-[#F4F8FA] text-slate-600 rounded-xl text-sm font-medium hover:bg-[#E6F4F5] hover:text-[#0E7C86] transition-colors flex items-center justify-center gap-2"
                    >
                      View all {filteredReviews.length} reviews
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className={`${CARD} p-6 md:p-8 text-center`}>
                  <h2 id="reviews-title" className="sr-only">Customer Reviews</h2>
                  <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-slate-700">No reviews yet</h3>
                  <p className="text-slate-500 text-sm">Be the first to review this service after booking.</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#0B2545]">You might also like</h2>
              {service.category?.slug && (
                <Link to={`/category/${service.category.slug}`} className="text-sm text-[#0E7C86] font-medium hover:text-[#0B656E] flex items-center gap-1 transition-colors flex-shrink-0">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {relatedServices.map(rel => <RelatedCard key={rel._id} service={rel} />)}
            </div>
          </section>
        )}

        {/* Explore other categories */}
        <section className="mt-10" aria-label="Explore categories">
          <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#0E7C86]" /> Explore categories
          </h2>
          {loadingSidebar ? (
            <div className="flex gap-3 animate-pulse overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-11 w-36 bg-slate-200 rounded-full flex-shrink-0"></div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto sd-noscroll pb-1">
              {allCategories.map(cat => <CategoryChip key={cat._id} cat={cat} isActive={cat._id === service.category?._id} />)}
            </div>
          )}
        </section>
      </div>

      {/* Mobile sticky booking bar (hidden at lg+, hidden while the reviews modal is open).
          z-40 keeps it below the image lightbox (z-1000) and reviews modal (z-1100). */}
      {!showAllReviews && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_16px_rgba(11,37,69,0.08)] px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="min-w-0 flex-shrink-0">
              <p className="text-[11px] text-slate-500 leading-none">Price</p>
              <p className="text-lg font-bold text-[#0B2545] leading-tight">₹{service.basePrice}</p>
            </div>
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 h-12 rounded-xl font-semibold text-sm border transition-all active:scale-95
                ${added ? 'bg-[#0E7C86] text-white border-[#0E7C86]' : 'bg-white text-[#0B2545] border-slate-300'}`}
            >
              {added ? <><Check className="w-4 h-4" /> Added</> : <><ShoppingCart className="w-4 h-4" /> Add</>}
            </button>
            <button
              onClick={handleBookNow}
              className="flex-[1.4] min-w-0 flex items-center justify-center gap-1.5 h-12 rounded-xl font-semibold text-sm bg-[#0E7C86] text-white hover:bg-[#0B656E] active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" /> Book Now
            </button>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showAllReviews && (
        <ReviewsModal reviews={filteredReviews} onClose={() => setShowAllReviews(false)} />
      )}

      <style>{`
        @keyframes sdFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: sdFadeIn 0.2s ease-out forwards; }
        .sd-noscroll::-webkit-scrollbar { display: none; }
        .sd-noscroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ServiceDetailPage;