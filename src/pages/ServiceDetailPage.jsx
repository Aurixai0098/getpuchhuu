import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchServiceBySlug, fetchCategories } from '../services/api';
import { useCart } from '../context/CartContext';

import {
  ShoppingCart, Check, Star, Clock, ChevronRight,
  ChevronLeft, ChevronDown, Heart, Share2, Users,
  Sparkles, X, ImageIcon, ArrowRight, Home, Tag, MessageCircle, Zap, BookOpen,
  Loader2
} from 'lucide-react';

/* ------------------------------------------------------------------
   Puchhuu design tokens (Tailwind arbitrary values, no config changes)
   Teal   #0E7C86  (hover #0B656E, tint #E6F4F5)
   Navy   #0B2545  (placeholder: swap for your design-system navy)
------------------------------------------------------------------- */

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
const ImageGallery = ({ images, name }) => {
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
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl sm:rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-14 h-14 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const goPrev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <div className="space-y-3 min-w-0">
      <div
        className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer"
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
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              aria-label={`Show image ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all
                ${currentIndex === idx ? 'border-[#0E7C86] shadow-md' : 'border-transparent hover:border-slate-300'}`}
            >
              <img src={img.url} alt={`${name} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
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

// Review Card (single column - full width)
const ReviewCard = ({ review }) => {
  const customerName = review.customer?.fullName || review.customer?.firstName || 'Anonymous';
  const customerAvatar = review.customer?.avatar?.url;
  const rating = review.rating?.overall || 0;
  const comment = review.comment;
  const date = review.createdAt;
  const title = review.title;
  const parsedDate = date ? new Date(date) : null;
  const dateLabel =
    parsedDate && !isNaN(parsedDate)
      ? parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {customerAvatar ? (
            <img src={customerAvatar} alt={customerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0E7C86] to-[#0B2545] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {customerName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-[#0B2545] text-sm truncate">{customerName}</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
              ))}
            </div>
          </div>
        </div>
        {dateLabel && (
          <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full flex-shrink-0">
            {dateLabel}
          </span>
        )}
      </div>
      {title && <h4 className="font-medium text-[#0B2545] mb-1 break-words">{title}</h4>}
      <p className="text-sm text-slate-600 leading-relaxed break-words">{comment}</p>
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
          Showing {visibleCount} of {reviews.length} reviews
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
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 min-w-0"
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

// Sidebar Category Item
const CategoryItem = ({ cat, isActive }) => (
  <Link
    to={`/category/${cat.slug}`}
    className={`flex items-center gap-3 px-4 py-3.5 transition-all duration-200 group
      ${isActive
        ? 'bg-gradient-to-r from-[#E6F4F5] to-white text-[#0E7C86] font-semibold'
        : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B2545]'
      }`}
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0
      ${isActive
        ? 'bg-[#E6F4F5] text-[#0E7C86] shadow-sm'
        : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:shadow-sm'
      }`}
    >
      {cat.icon?.url ? (
        <img src={cat.icon.url} alt={cat.name} className="w-5 h-5 object-contain" />
      ) : (
        <Tag className="w-4 h-4" />
      )}
    </div>
    <span className="text-sm min-w-0 truncate">{cat.name}</span>
    {isActive && <ChevronRight className="w-4 h-4 text-[#0E7C86] ml-auto flex-shrink-0" />}
  </Link>
);

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
      <div className="bg-slate-50 min-h-screen">
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

  return (
    <div className="bg-slate-50 min-h-screen overflow-x-hidden">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0">
            <Link to="/" className="flex items-center gap-1 flex-shrink-0 hover:text-[#0E7C86] transition-colors">
              <Home className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Home</span>
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
      </div>

      {/* pb-28 on mobile leaves room for the sticky booking bar */}
      <div className="max-w-7xl mx-auto px-4 py-5 md:py-12 pb-28 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6 lg:space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-3 sm:p-6 min-w-0">
                  <ImageGallery key={service._id || slug} images={service.images} name={service.name} />
                </div>
                <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B2545] leading-tight break-words min-w-0">
                      {service.name}
                    </h1>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setLiked(!liked)}
                        aria-label="Save service"
                        aria-pressed={liked}
                        className={`p-2.5 rounded-xl transition-all ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
                      </button>
                      <button
                        onClick={handleShare}
                        aria-label="Share service"
                        className={`p-2.5 rounded-xl transition-colors ${copied ? 'bg-[#E6F4F5] text-[#0E7C86]' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                      >
                        {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {(hasRating || bookings > 0) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                      {hasRating && (
                        <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                          <span className="text-amber-600 text-sm">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
                        </div>
                      )}
                      {bookings > 0 && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                          <Users className="w-4 h-4" />
                          <span>{bookings}+ bookings</span>
                        </div>
                      )}
                    </div>
                  )}

                  {service.description && (
                    <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-line break-words">{service.description}</p>
                  )}

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-3xl md:text-4xl font-bold text-[#0E7C86]">
                        ₹{service.basePrice}
                      </span>
                      {unitLabel && <span className="text-slate-400 text-sm">/{unitLabel}</span>}
                    </div>

                    {/* Desktop actions. Below lg the sticky booking bar is the primary action. */}
                    <div className="hidden lg:flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg flex-1
                          ${added
                            ? 'bg-[#0E7C86] text-white shadow-[#0E7C86]/30 scale-[0.98]'
                            : 'bg-[#0B2545] text-white hover:bg-[#12335c] shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95'
                          }`}
                      >
                        {added ? <><Check className="w-5 h-5 animate-bounce" /> Added to Cart!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                      </button>
                      <button
                        onClick={handleBookNow}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg bg-[#0E7C86] text-white hover:bg-[#0B656E] shadow-[#0E7C86]/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex-1"
                      >
                        <BookOpen className="w-5 h-5" /> Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details: Included / Exclusions / Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {service.includes && service.includes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 min-w-0">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#E6F4F5] flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#0E7C86]" />
                    </div>
                    <h3 className="font-bold text-[#0B2545]">What's Included</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {service.includes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600 break-words">
                        <Check className="w-4 h-4 text-[#0E7C86] flex-shrink-0 mt-0.5" /> <span className="min-w-0">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {service.excludes && service.excludes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 min-w-0">
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
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 min-w-0">
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

            {/* Reviews Section - with "View all" modal trigger */}
            {displayReviews.length > 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-[#0B2545]">Customer Reviews</h2>
                    <p className="text-slate-500 text-sm mt-1">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'} from verified customers</p>
                  </div>
                  {hasRating && (
                    <div className="flex items-center gap-2 bg-amber-50 px-3 sm:px-4 py-2 rounded-xl border border-amber-200 flex-shrink-0">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-amber-700">{avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Show first 4 reviews (one per row) */}
                <div className="space-y-4">
                  {displayReviews.slice(0, 4).map((review, idx) => (
                    <ReviewCard key={review._id || idx} review={review} />
                  ))}
                </div>

                {displayReviews.length > 4 && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-medium hover:bg-[#E6F4F5] hover:text-[#0E7C86] transition-colors flex items-center justify-center gap-2"
                  >
                    View all {displayReviews.length} reviews
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 text-center">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-700">No reviews yet</h3>
                <p className="text-slate-500 text-sm">Be the first to review this service after booking.</p>
              </div>
            )}

            {/* Related Services */}
            {relatedServices.length > 0 && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0B2545]">You might also like</h2>
                  {service.category?.slug && (
                    <Link to={`/category/${service.category.slug}`} className="text-sm text-[#0E7C86] font-medium hover:text-[#0B656E] flex items-center gap-1 transition-colors flex-shrink-0">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {relatedServices.map(rel => <RelatedCard key={rel._id} service={rel} />)}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0 min-w-0">
            <div className="lg:sticky lg:top-6 space-y-6">
              {/* Desktop booking card. On mobile the sticky bar replaces it. */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-500">Price</span>
                  <span className="text-2xl font-bold text-[#0B2545]">₹{service.basePrice}</span>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg
                    ${added ? 'bg-[#0E7C86] text-white shadow-[#0E7C86]/30' : 'bg-[#0B2545] text-white hover:bg-[#12335c] shadow-slate-900/20 hover:shadow-xl active:scale-95'}`}
                >
                  {added ? <><Check className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                </button>
                <button
                  onClick={handleBookNow}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg bg-[#0E7C86] text-white hover:bg-[#0B656E] shadow-[#0E7C86]/20 hover:shadow-xl active:scale-95"
                >
                  <BookOpen className="w-5 h-5" /> Book Now
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-[#0B2545] flex items-center gap-2"><Tag className="w-4 h-4 text-[#0E7C86]" /> Categories</h2>
                </div>
                <div className="max-h-72 lg:max-h-[60vh] overflow-y-auto">
                  {loadingSidebar ? (
                    <div className="p-4 space-y-3 animate-pulse">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-200 rounded-xl flex-shrink-0"></div>
                          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {allCategories.map(cat => <CategoryItem key={cat._id} cat={cat} isActive={cat._id === service.category?._id} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
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
        <ReviewsModal reviews={displayReviews} onClose={() => setShowAllReviews(false)} />
      )}
    </div>
  );
};

export default ServiceDetailPage;