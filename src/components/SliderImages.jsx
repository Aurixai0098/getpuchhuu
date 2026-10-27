// src/components/SliderImages.jsx
// (default export ka naam wahi hai, to Home.jsx me import change nahi karna)
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star, ShieldCheck, Camera, MessageSquare, ThumbsUp, MoreHorizontal, Search,
  ChevronDown, ChevronLeft, ChevronRight, BadgeCheck, X, ImagePlus, Loader2,
  Plus, AlertTriangle, CheckCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------
   UI-ONLY SETTINGS
------------------------------------------------------------------ */

// Top-right collage ki 3 photos (khali = gradient dikhega)
const REVIEW_HERO_IMAGES = ['', '', ''];

// Browser me user ke add kiye reviews yahan save hote hain (jab onSubmitReview prop nahi diya ho)
const STORAGE_KEY = 'puchhuu_user_reviews_v1';

const PAGE_SIZE = 5;
const MAX_PHOTOS = 4;
const MAX_PHOTO_MB = 5;

const DEFAULT_SERVICES = [
  'AC Service', 'Home Cleaning', 'Sofa Cleaning', 'Plumbing', 'Electrician',
  'Kitchen Cleaning', 'Painting', 'Appliance Repair', 'Other',
];

/* ------------------------------------------------------------------
   DEMO REVIEWS  [name, rating, comment, daysAgo, service]
   (backend se `reviews` prop doge to ye use nahi hote)
------------------------------------------------------------------ */
const RAW_DEMO = [
  ["A Rahman", 5, "Amazing service! The technician was very professional and fixed my AC in no time. Highly recommended!", 2, "AC Service"],
  ["J Smith", 5, "Best home service app ever. The plumber arrived on time and did a fantastic job fixing the leak.", 7, "Plumbing"],
  ["Priya Sharma", 5, "Super impressed with the quality of service. My house looks spotless after the deep cleaning!", 3, "Home Cleaning"],
  ["K Khan", 4, "Great experience overall. The electrician was knowledgeable and fixed all the wiring issues quickly.", 5, "Electrician"],
  ["R Verma", 5, "Absolutely loved the service! The carpenter built beautiful custom shelves for my living room.", 1, "Carpenter"],
  ["S Gupta", 5, "Fast, reliable, and affordable. The pest control team was thorough and professional.", 4, "Pest Control"],
  ["M Ali", 4, "Very satisfied with the painting service. The team was punctual and the finish is excellent.", 6, "Painting"],
  ["D Singh", 5, "The RO repair service was top-notch. Technician explained everything clearly. Will use again!", 14, "Appliance Repair"],
  ["N Patel", 5, "Puchhuu never disappoints! The sofa cleaning service made my 5-year-old sofa look brand new.", 3, "Sofa Cleaning"],
  ["A Kumar", 4, "Good service at reasonable prices. The microwave repair was done within an hour.", 7, "Appliance Repair"],
  ["S Reddy", 5, "The bathroom cleaning team was incredibly thorough. Every corner sparkles now!", 4, "Home Cleaning"],
  ["P Mishra", 5, "Best decision to use Puchhuu for my kitchen chimney repair. Works like new now!", 5, "Kitchen Cleaning"],
  ["V Joshi", 4, "The inverter repair service was quick and efficient. Fair pricing too.", 7, "Electrician"],
  ["T Nair", 5, "Exceptional service! The team installed my new washing machine perfectly and even gave usage tips.", 2, "Appliance Repair"],
  ["R Iyer", 5, "The water tank cleaning service was excellent. They used proper equipment and cleaned up after.", 6, "Home Cleaning"],
  ["K Mehta", 4, "Very happy with the CCTV installation. The technician was professional and the setup is working great.", 3, "Electrician"],
  ["A Banerjee", 5, "The refrigerator repair service saved me from buying a new fridge! Amazing work.", 7, "Appliance Repair"],
  ["S Yadav", 5, "Geyser repair was done same day. The technician was courteous and skilled. Highly recommend!", 4, "Plumbing"],
  ["P Choudhary", 4, "Good experience with the tile cleaning service. My bathroom tiles look brand new.", 5, "Home Cleaning"],
  ["M Thakur", 5, "The curtain cleaning service was fantastic. They picked up, cleaned, and delivered back perfectly.", 2, "Home Cleaning"],
  ["R Pandey", 5, "Best plumbing service I've ever used. Fixed the chronic leakage issue that others couldn't.", 7, "Plumbing"],
  ["A Desai", 4, "The laptop repair service was quick and affordable. My laptop is working smoothly now.", 3, "Appliance Repair"],
  ["S Kaur", 5, "Amazing deep cleaning service! The team was professional and left my apartment spotless.", 6, "Home Cleaning"],
  ["V Malhotra", 5, "The AC installation service was flawless. Proper piping, neat work, and excellent cooling.", 4, "AC Service"],
  ["N Bhatia", 4, "Good service for chimney cleaning. The technician was knowledgeable and used quality products.", 5, "Kitchen Cleaning"],
  ["K Agarwal", 5, "The mattress cleaning service removed all stains and odors. Sleeping much better now!", 2, "Sofa Cleaning"],
  ["P Saxena", 5, "Exceptional carpentry work! The custom wardrobe fits perfectly and looks stunning.", 7, "Carpenter"],
  ["R Chauhan", 4, "The electrical work was done safely and efficiently. All switches and fittings work perfectly.", 3, "Electrician"],
  ["A Khanna", 5, "Best home cleaning service in the city! The team is thorough, polite, and always on time.", 4, "Home Cleaning"],
  ["S Kapoor", 5, "The dishwasher repair was done in one visit. The technician carried all necessary parts. Brilliant!", 5, "Appliance Repair"],
];
const DAY_MS = 86400000;
const DEMO_REVIEWS = RAW_DEMO.map(([name, rating, comment, days, service], i) => ({
  id: `demo-${i + 1}`,
  name,
  rating,
  comment,
  service,
  createdAt: new Date(Date.now() - days * DAY_MS).toISOString(),
  images: [],
  helpful: ((i * 37) % 120) + 8,
}));

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */
const formatDate = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Backend ya demo, kisi bhi shape ke review ko ek jaisa bana deta hai
const normalizeReview = (r, i = 0) => {
  const rawDate = r.createdAt || r.date || null;
  const name =
    r.name ||
    [r.user?.firstName, r.user?.lastName].filter(Boolean).join(' ') ||
    r.user?.name ||
    'Customer';
  const images = Array.isArray(r.images)
    ? r.images.map((x) => (typeof x === 'string' ? x : x?.url)).filter(Boolean)
    : r.image
      ? [r.image]
      : [];
  const service =
    typeof r.service === 'string' ? r.service : r.service?.name || r.serviceName || 'General';
  return {
    id: r.id ?? r._id ?? `r-${i}`,
    name,
    rating: Number(r.rating) || 0,
    comment: r.comment || r.text || '',
    service,
    time: rawDate ? Date.parse(rawDate) || 0 : 0,
    dateLabel: (rawDate && formatDate(rawDate)) || (typeof r.date === 'string' ? r.date : ''),
    avatar: r.avatar || r.user?.avatar?.url || (typeof r.user?.avatar === 'string' ? r.user.avatar : null) || r.image2 || null,
    images,
    helpful: Number(r.helpful) || 0,
  };
};

// Photo ko chhota karke data-URL banata hai (taaki browser me save ho sake)
const resizeToDataUrl = (file, maxSide = 1000, quality = 0.75) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('Image processing not supported')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image could not be loaded')); };
    img.src = url;
  });

const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-500',
  'from-sky-400 to-indigo-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
];
const gradientFor = (name = '') =>
  AVATAR_GRADIENTS[(name.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length];

/* ------------------------------------------------------------------
   Small UI pieces
------------------------------------------------------------------ */
const StarRow = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
    ))}
  </div>
);

const Avatar = ({ name, src, size = 'w-11 h-11' }) =>
  src ? (
    <img src={src} alt="" loading="lazy" decoding="async" className={`${size} rounded-full object-cover`} />
  ) : (
    <div className={`${size} rounded-full bg-gradient-to-br ${gradientFor(name)} grid place-items-center text-white font-bold text-sm shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );

const SelectBox = ({ value, onChange, children, label, className = '' }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={onChange}
      aria-label={label}
      className="appearance-none w-full h-11 pl-3.5 pr-9 rounded-xl border border-gray-200 bg-white text-sm text-[#1E2E45] outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
  </div>
);

const ReviewRow = ({ review, helpfulOn, onToggleHelpful, onOpenPhoto, reported, onReport, menuOpen, onToggleMenu }) => {
  const photos = review.images;
  const shown = photos.slice(0, 3);
  const extra = photos.length - shown.length;
  return (
    <article className="bg-white rounded-2xl border border-[#E8EDF1] shadow-sm p-4 md:p-5">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <Avatar name={review.name} src={review.avatar} size="w-12 h-12" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-[#0B1B33] truncate">{review.name}</h3>
              <BadgeCheck className="w-4 h-4 text-[#0E7C86] shrink-0" aria-label="Verified customer" />
            </div>
            <p className="text-[13px] text-[#5B6B7F]">
              {review.service}{review.dateLabel && <> <span aria-hidden="true">•</span> {review.dateLabel}</>}
            </p>
            <div className="mt-1"><StarRow rating={review.rating} /></div>
            <p className="mt-2 text-sm text-[#2B3A50] leading-relaxed">{review.comment}</p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="flex gap-2 md:shrink-0">
            {shown.map((src, i) => {
              const isLastWithExtra = i === shown.length - 1 && extra > 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onOpenPhoto(photos, i)}
                  className="relative w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-xl overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86]"
                  aria-label={`Open photo ${i + 1}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  {isLastWithExtra && (
                    <span className="absolute inset-0 bg-black/55 text-white font-semibold grid place-items-center">+{extra}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="relative flex md:flex-col items-center md:items-end gap-3 md:shrink-0 md:w-28">
          <button
            type="button"
            onClick={onToggleHelpful}
            aria-pressed={helpfulOn}
            className={`inline-flex items-center gap-1.5 text-[13px] ${helpfulOn ? 'text-[#0E7C86] font-semibold' : 'text-[#5B6B7F] hover:text-[#0E7C86]'}`}
          >
            <ThumbsUp className={`w-4 h-4 ${helpfulOn ? 'fill-[#0E7C86]/20' : ''}`} />
            Helpful ({review.helpful + (helpfulOn ? 1 : 0)})
          </button>
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="More options"
            className="p-1 rounded-lg text-[#5B6B7F] hover:bg-gray-100"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 w-40 rounded-xl bg-white border border-gray-200 shadow-lg py-1">
              <button
                type="button"
                onClick={onReport}
                disabled={reported}
                className="w-full text-left px-3 py-2 text-sm text-[#1E2E45] hover:bg-gray-50 disabled:text-gray-400"
              >
                {reported ? 'Reported' : 'Report review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

/* ------------------------------------------------------------------
   Add Review modal
------------------------------------------------------------------ */
const AddReviewModal = ({ services, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [service, setService] = useState(services[0] || 'Other');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]); // [{ file, preview }]
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  // preview URLs cleanup
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  const handlePick = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!picked.length) return;
    setError('');
    const next = [...files];
    for (const file of picked) {
      if (next.length >= MAX_PHOTOS) { setError(`You can add up to ${MAX_PHOTOS} photos.`); break; }
      if (!file.type.startsWith('image/')) { setError('Please choose image files only.'); continue; }
      if (file.size > MAX_PHOTO_MB * 1024 * 1024) { setError(`Each photo must be under ${MAX_PHOTO_MB}MB.`); continue; }
      next.push({ file, preview: URL.createObjectURL(file) });
    }
    setFiles(next);
  };

  const removePhoto = (idx) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!rating) return setError('Please select a star rating.');
    if (comment.trim().length < 10) return setError('Please write at least 10 characters in your review.');
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        service,
        rating,
        comment: comment.trim(),
        files: files.map((f) => f.file),
      });
    } catch (err) {
      setError(err?.message || 'Could not submit your review. Please try again.');
      setSubmitting(false);
    }
  };

  const active = hover || rating;
  const field =
    'w-full h-11 border border-gray-200 rounded-xl px-3.5 text-sm outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]';

  return (
    <div className="fixed inset-0 z-[1500] bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Add your review">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-6 my-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0B1B33]">Write a Review</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-gray-100"><X size={20} /></button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Your Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" maxLength={60} className={field} style={{ fontSize: '16px' }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Service</label>
            <SelectBox value={service} onChange={(e) => setService(e.target.value)} label="Service">
              {services.map((s) => <option key={s} value={s}>{s}</option>)}
            </SelectBox>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Your Rating *</label>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className="p-0.5"
                >
                  <Star className={`w-8 h-8 transition-colors ${n <= active ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Your Review *</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={600}
              placeholder="Share your experience with the service..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
              style={{ fontSize: '16px' }}
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{comment.length}/600</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Photos (optional, up to {MAX_PHOTOS})</label>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={f.preview} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                  <img src={f.preview} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo" className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0E7C86] text-gray-500 hover:text-[#0E7C86] flex flex-col items-center justify-center gap-1 text-[11px] transition-colors">
                  <ImagePlus size={20} /> Add
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePick} className="hidden" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#0E7C86] to-[#12948F] text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------
   Photo lightbox
------------------------------------------------------------------ */
const Lightbox = ({ images, index, onClose, onChange }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, onChange]);

  return (
    <div className="fixed inset-0 z-[1600] bg-black/85 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Review photo" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"><X size={22} /></button>
      {images.length > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length); }} aria-label="Previous photo" className="absolute left-3 sm:left-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"><ChevronLeft size={26} /></button>
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange((index + 1) % images.length); }} aria-label="Next photo" className="absolute right-3 sm:right-6 text-white p-2 rounded-full bg-white/10 hover:bg-white/20"><ChevronRight size={26} /></button>
        </>
      )}
      <img src={images[index]} alt="" onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
    </div>
  );
};

/* ------------------------------------------------------------------
   Main component
------------------------------------------------------------------ */
const InfiniteReviewsMarquee = ({ reviews, onSubmitReview }) => {
  // User ke add kiye reviews (browser me save; onSubmitReview diya ho to backend ka kaam)
  const [localReviews, setLocalReviews] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (onSubmitReview) return; // backend handle karega
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localReviews.slice(0, 30)));
    } catch {
      // storage full ho to photos hata ke dobara try
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(localReviews.slice(0, 30).map((r) => ({ ...r, images: [] })))
        );
      } catch { /* ignore */ }
    }
  }, [localReviews, onSubmitReview]);

  const all = useMemo(() => {
    const base = reviews?.length > 0 ? reviews : DEMO_REVIEWS;
    return [...localReviews, ...base].map(normalizeReview);
  }, [reviews, localReviews]);

  // Filters
  const [service, setService] = useState('all');
  const [sort, setSort] = useState('latest');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [photosOnly, setPhotosOnly] = useState('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [lightbox, setLightbox] = useState(null); // { images, index }
  const [helpfulOn, setHelpfulOn] = useState({});
  const [reportedIds, setReportedIds] = useState({});
  const [menuId, setMenuId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { setVisible(PAGE_SIZE); }, [service, sort, ratingFilter, photosOnly, query]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow = showModal ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showModal]);

  // Stats (live: naya review aate hi update)
  const stats = useMemo(() => {
    const count = all.length;
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    all.forEach((r) => {
      const k = Math.min(5, Math.max(1, Math.round(r.rating)));
      dist[k] += 1;
      sum += r.rating;
    });
    return { count, dist, avg: count ? sum / count : 0 };
  }, [all]);

  const serviceCounts = useMemo(() => {
    const map = new Map();
    all.forEach((r) => map.set(r.service, (map.get(r.service) || 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [all]);

  const serviceOptions = useMemo(() => {
    const set = new Set([...DEFAULT_SERVICES.filter((s) => s !== 'Other'), ...serviceCounts.map(([s]) => s)]);
    return [...set, 'Other'];
  }, [serviceCounts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = all.filter((r) => {
      if (service !== 'all' && r.service !== service) return false;
      if (ratingFilter !== 'all' && Math.round(r.rating) !== Number(ratingFilter)) return false;
      if (photosOnly === 'photos' && r.images.length === 0) return false;
      if (q && !(`${r.name} ${r.comment} ${r.service}`.toLowerCase().includes(q))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'oldest') return a.time - b.time;
      if (sort === 'high') return b.rating - a.rating || b.time - a.time;
      if (sort === 'low') return a.rating - b.rating || b.time - a.time;
      return b.time - a.time;
    });
    return list;
  }, [all, service, ratingFilter, photosOnly, query, sort]);

  const handleSubmitReview = async ({ name, service: svc, rating, comment, files }) => {
    const images = await Promise.all(files.map((f) => resizeToDataUrl(f)));
    let saved = null;
    if (onSubmitReview) saved = await onSubmitReview({ name, service: svc, rating, comment, files, images });
    const raw = saved || {
      id: `local-${Date.now()}`,
      name,
      service: svc,
      rating,
      comment,
      createdAt: new Date().toISOString(),
      images,
      helpful: 0,
    };
    setLocalReviews((prev) => [raw, ...prev]);
    // naya review turant dikhane ke liye filters reset
    setService('all'); setSort('latest'); setRatingFilter('all'); setPhotosOnly('all'); setQuery('');
    setShowModal(false);
    setToast('Thank you! Your review has been added.');
  };

  const trust = [
    { Icon: ShieldCheck, title: 'Verified Reviews', sub: '100% genuine customers' },
    { Icon: Camera, title: 'Real Photos', sub: 'From actual service' },
    { Icon: MessageSquare, title: 'Detailed Feedback', sub: 'Honest experiences' },
  ];

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="py-10 md:py-14 bg-[#F4F8FA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-7">
          <div className="max-w-xl">
            <h2 id="reviews-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0B1B33]">Customer Reviews</h2>
            <p className="mt-3 text-[15px] md:text-lg text-[#5B6B7F]">
              Real experiences from real customers. See why thousands trust Puchhuu for their home services.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-[#0E7C86] to-[#12948F] hover:from-[#0B6A73] hover:to-[#0E7C86] text-white text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
          </div>

          {/* Collage */}
          <div className="relative hidden md:block w-[380px] h-[190px] shrink-0" aria-hidden="true">
            {REVIEW_HERO_IMAGES.map((src, i) => (
              <div
                key={i}
                className={`absolute top-0 w-[150px] h-[150px] rounded-xl overflow-hidden shadow-lg border-2 border-white bg-gradient-to-br from-[#0E7C86] to-[#0B2545] ${
                  ['left-0 -rotate-3', 'left-[115px] z-10', 'left-[230px] rotate-3'][i]
                }`}
              >
                {src && <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />}
              </div>
            ))}
            <div className="absolute left-[110px] bottom-0 z-20 flex items-center gap-3 rounded-xl bg-white shadow-lg pl-2.5 pr-4 py-2">
              <div className="flex -space-x-2">
                {['from-amber-400 to-orange-500', 'from-pink-400 to-rose-500', 'from-sky-400 to-indigo-500'].map((g, i) => (
                  <span key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br ${g}`} />
                ))}
              </div>
              <div>
                <p className="text-base font-bold text-[#0B1B33] leading-tight">50,000+</p>
                <p className="text-[11px] text-[#5B6B7F] leading-tight">Happy Customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-[#E8EDF1] shadow-sm p-5 md:p-7 grid grid-cols-1 lg:grid-cols-[auto_1.4fr_1fr] gap-6 lg:gap-8 items-center">
          <div className="text-center lg:text-left lg:pr-8 lg:border-r lg:border-[#E8EDF1]">
            <p className="text-5xl md:text-6xl font-extrabold text-[#0B1B33] leading-none">
              {stats.avg.toFixed(1)}<span className="text-xl font-medium text-[#5B6B7F]"> / 5</span>
            </p>
            <div className="mt-3 flex justify-center lg:justify-start">
              <StarRow rating={Math.round(stats.avg)} size="w-6 h-6" />
            </div>
            <p className="mt-2 text-sm text-[#5B6B7F]">Based on {stats.count.toLocaleString('en-IN')} reviews</p>
          </div>

          <ul className="space-y-2 lg:pr-8 lg:border-r lg:border-[#E8EDF1]">
            {[5, 4, 3, 2, 1].map((n) => {
              const c = stats.dist[n];
              const pct = stats.count ? Math.round((c / stats.count) * 100) : 0;
              return (
                <li key={n} className="flex items-center gap-3 text-sm text-[#2B3A50]">
                  <span className="w-8 flex items-center gap-1">{n}<Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /></span>
                  <span className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <span className="block h-full rounded-full bg-[#0E7C86] transition-all" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-24 text-right text-[13px] text-[#5B6B7F]">{c.toLocaleString('en-IN')} ({pct}%)</span>
                </li>
              );
            })}
          </ul>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {trust.map(({ Icon, title, sub }) => (
              <li key={title} className="flex items-center gap-3">
                <span className="w-12 h-12 shrink-0 rounded-full bg-[#E3F5F1] text-[#0E7C86] grid place-items-center">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-[#0B1B33] leading-tight">{title}</span>
                  <span className="block text-xs text-[#5B6B7F] leading-tight mt-0.5">{sub}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Service tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto rv-noscroll pb-1" role="tablist" aria-label="Filter reviews by service">
          {[['all', 'All Reviews', stats.count], ...serviceCounts.map(([s, c]) => [s, s, c])].map(([key, label, c]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={service === key}
              onClick={() => setService(key)}
              className={`shrink-0 h-10 px-4 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                service === key ? 'bg-[#0E7C86] text-white' : 'bg-white border border-[#E8EDF1] text-[#2B3A50] hover:border-[#0E7C86]'
              }`}
            >
              {label} ({c.toLocaleString('en-IN')})
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-[repeat(4,auto)_1fr] gap-3 items-center">
          <SelectBox value={sort} onChange={(e) => setSort(e.target.value)} label="Sort reviews">
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="high">Highest Rating</option>
            <option value="low">Lowest Rating</option>
          </SelectBox>
          <SelectBox value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} label="Filter by rating">
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
          </SelectBox>
          <SelectBox value={service} onChange={(e) => setService(e.target.value)} label="Filter by service">
            <option value="all">All Services</option>
            {serviceCounts.map(([s]) => <option key={s} value={s}>{s}</option>)}
          </SelectBox>
          <SelectBox value={photosOnly} onChange={(e) => setPhotosOnly(e.target.value)} label="Photos filter">
            <option value="all">All Reviews</option>
            <option value="photos">With Photos Only</option>
          </SelectBox>
          <div className="relative col-span-2 md:col-span-1 md:justify-self-end w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reviews..."
              aria-label="Search reviews"
              className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
              style={{ fontSize: '16px' }}
            />
          </div>
        </div>

        {/* Review list */}
        <div className="mt-5 space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8EDF1] p-10 text-center text-[#5B6B7F]">
              No reviews match your filters.
            </div>
          ) : (
            filtered.slice(0, visible).map((r) => (
              <ReviewRow
                key={r.id}
                review={r}
                helpfulOn={!!helpfulOn[r.id]}
                onToggleHelpful={() => setHelpfulOn((p) => ({ ...p, [r.id]: !p[r.id] }))}
                onOpenPhoto={(images, index) => setLightbox({ images, index })}
                reported={!!reportedIds[r.id]}
                onReport={() => { setReportedIds((p) => ({ ...p, [r.id]: true })); setMenuId(null); setToast('Thanks, we will look into this review.'); }}
                menuOpen={menuId === r.id}
                onToggleMenu={() => setMenuId((cur) => (cur === r.id ? null : r.id))}
              />
            ))
          )}
        </div>

        {filtered.length > visible && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="h-11 px-6 rounded-xl border border-[#0E7C86] text-[#0E7C86] text-sm font-semibold hover:bg-[#E8F6F5] transition-colors"
            >
              Load more reviews
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[1700] flex items-center gap-2 rounded-xl bg-[#0B1B33] text-white text-sm px-4 py-3 shadow-xl">
          <CheckCircle className="w-4 h-4 text-[#35D6E0]" /> {toast}
        </div>
      )}

      {showModal && (
        <AddReviewModal services={serviceOptions} onClose={() => setShowModal(false)} onSubmit={handleSubmitReview} />
      )}

      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onChange={(i) => setLightbox((l) => ({ ...l, index: i }))}
        />
      )}

      <style>{`
        .rv-noscroll::-webkit-scrollbar { display: none; }
        .rv-noscroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default InfiniteReviewsMarquee;