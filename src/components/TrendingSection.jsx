// src/components/TrendingSection.jsx
// UI-only section. Receives the SAME `featuredServices` array Home already loads; makes no API calls.
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B3FD1] focus-visible:ring-offset-2';
const RANK_COLORS = ['bg-[#F43F5E]', 'bg-[#7C5CFA]', 'bg-[#10A37F]', 'bg-[#F59E0B]'];

/* Optional fields: shown only when the API actually returns them (nothing is invented). */
const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const ratingOf = (s) => num(typeof s.rating === 'number' ? s.rating : s.rating?.average ?? s.averageRating);
const reviewsOf = (s) => num(s.rating?.count ?? s.reviewCount ?? s.reviewsCount);
const bookingsOf = (s) => num(s.bookingsCount ?? s.bookingCount ?? s.totalBookings ?? s.stats?.bookings ?? s.stats?.completedBookings);
const mrpOf = (s) => {
  const mrp = num(s.originalPrice ?? s.mrp ?? s.compareAtPrice);
  const price = num(Number(s.basePrice));
  return mrp && price && mrp > price ? mrp : null;
};
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n));

const TrendCard = ({ service, rank }) => {
  const img = service.images?.[0]?.url;
  const rating = ratingOf(service);
  const reviews = reviewsOf(service);
  const bookings = bookingsOf(service);
  const mrp = mrpOf(service);
  const price = Number(service.basePrice);
  const hasPrice = service.basePrice !== undefined && service.basePrice !== null && service.basePrice !== '' && Number.isFinite(price);
  const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : null;

  return (
    <li className="snap-start shrink-0 w-[72vw] max-w-[290px] sm:w-[260px] lg:w-[calc((100%-3rem)/4)] lg:max-w-none">
      <Link
        to={`/service/${service.slug}`}
        className={`group block h-full rounded-2xl bg-white p-2.5 border border-[#EEEAFB] shadow-[0_8px_24px_-16px_rgba(79,70,229,0.35)] hover:shadow-[0_16px_32px_-16px_rgba(79,70,229,0.45)] transition-shadow ${FOCUS}`}
      >
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F0F6F7]">
          {img ? (
            <img src={img} alt="" width="480" height="360" loading="lazy" decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
          ) : <div className="absolute inset-0 bg-gradient-to-br from-[#0E7C86]/25 to-[#0B2545]/10" aria-hidden="true" />}
          <span className={`absolute top-2 left-2 min-w-[40px] h-10 px-2 rounded-xl ${RANK_COLORS[rank % RANK_COLORS.length] || 'bg-[#0E7C86]'} text-white text-lg font-extrabold grid place-items-center shadow-md`}>
            <span className="sr-only">Rank </span>#{rank + 1}
          </span>
        </div>

        <div className="px-1.5 pt-3 pb-1">
          <h3 className="text-[15px] md:text-base font-extrabold text-[#0B1B33] leading-snug line-clamp-2 min-h-[2.6em]">{service.name}</h3>

          {rating && (
            <p className="mt-1.5 flex items-center gap-1 text-[13px] text-[#5B6B7F]">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
              <b className="text-[#0B1B33]">{rating.toFixed(1)}</b>
              {reviews && <span>({compact(reviews)})</span>}
            </p>
          )}
          {bookings && <p className="mt-1 text-[13px] text-[#5B6B7F]">{compact(bookings)}+ bookings</p>}

          {hasPrice && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="flex items-baseline gap-2 min-w-0">
                <span className="text-xl md:text-[22px] font-extrabold text-[#0B1B33]">₹{service.basePrice}</span>
                {mrp && <span className="text-[13px] text-[#8A97A8] line-through">₹{mrp}</span>}
              </p>
              {off ? <span className="shrink-0 rounded-lg bg-[#10A37F] text-white text-xs font-bold px-2.5 py-1.5">{off}% OFF</span> : null}
            </div>
          )}
        </div>
      </Link>
    </li>
  );
};

const TrendingSection = ({ services = [], id = 'featured-title' }) => {
  const rowRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  if (!services.length) return null;

  const update = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const scroll = (dir) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const navBtn = (dir, enabled) => (
    <button
      type="button"
      onClick={() => scroll(dir)}
      disabled={!enabled}
      aria-label={dir < 0 ? 'Previous services' : 'Next services'}
      className={`hidden sm:grid w-11 h-11 place-items-center rounded-xl bg-white border border-[#E7E2FB] text-[#0B1B33] hover:bg-[#F3F0FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${FOCUS}`}
    >
      {dir < 0 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  );

  return (
    <section aria-labelledby={id} className="py-6 md:py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] bg-gradient-to-br from-[#EFEBFF] via-[#F6F4FF] to-white border border-[#E7E2FB] p-4 sm:p-6 lg:p-7">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FB7185] to-[#E11D48] grid place-items-center shadow">
                  <Flame className="w-5 h-5 text-white" aria-hidden="true" />
                </span>
                <span className="text-xl md:text-2xl font-extrabold text-[#0B1B33]">Trending Now</span>
                <span className="rounded-full bg-[#E4DEFF] text-[#5B3FD1] text-[11px] md:text-xs font-semibold px-3 py-1">Popular right now</span>
              </div>
              <h2 id={id} className="mt-3 text-2xl sm:text-3xl md:text-[34px] leading-tight font-extrabold tracking-tight text-[#0B1B33]">
                Trending <span className="text-[#4F46E5]">Services</span> Right Now
              </h2>
              <p className="mt-1.5 text-sm md:text-[15px] text-[#5B6B7F]">Services that people are booking the most right now.</p>
            </div>

            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-4 lg:flex-row lg:items-center">
              <a href="#categories" className={`inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-[#E7E2FB] text-sm font-semibold text-[#0B5F67] hover:bg-[#F3F0FF] transition-colors ${FOCUS}`}>
                View All Services <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <div className="flex gap-2">{navBtn(-1, canPrev)}{navBtn(1, canNext)}</div>
            </div>
          </div>

          {/* Cards */}
          <ul
            ref={rowRef}
            onScroll={update}
            aria-label="Trending services"
            className="mt-5 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity pb-2 -mx-1 px-1"
          >
            {services.slice(0, 8).map((s, i) => <TrendCard key={s._id} service={s} rank={i} />)}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;