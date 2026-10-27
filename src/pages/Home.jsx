// src/pages/Home.jsx
import React, { useRef, useState, useEffect } from 'react';
// import TrendingSection from '../components/TrendingSection'; // (hidden for now)
import { Link } from 'react-router-dom';
import {
  ShieldCheck, IndianRupee, Clock, Star, ChevronLeft, ChevronRight,
  MoreHorizontal, Wind, Sparkles, Wrench, Zap, PaintRoller, CarFront, Flower2,
  Bug, Hammer, Sofa, Scissors, Droplets, Grid2x2, ArrowRight, ArrowLeft, Users,
} from 'lucide-react';
import {
  fetchCategories,
  fetchFeaturedServices,
  fetchPopularServices,
  fetchServices
} from '../services/api';
// import InfiniteReviewsMarquee from '../components/SliderImages'; // (hidden for now)
import InfiniteProvidersMarquee from '../components/InfiniteProvidersMarquee';

const desktopBgImage = "https://res.cloudinary.com/djtvxmttf/image/upload/v1792055959/378c9470-484d-4d3e-b4d1-9054b714fd20.png";

// Add your real store links to show the app banner. Left empty, the banner stays hidden.
const APP_LINKS = { play: '', appStore: '' };

/* ---------- Font: Plus Jakarta Sans (clean, professional, Urban-Company-like) ---------- */
const FONT_STACK = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

function useHomeFont() {
  useEffect(() => {
    if (document.getElementById('puchhuu-font')) return;
    const add = (attrs) => { const l = document.createElement('link'); Object.entries(attrs).forEach(([k, v]) => l.setAttribute(k, v)); document.head.appendChild(l); return l; };
    add({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
    add({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' });
    add({ id: 'puchhuu-font', rel: 'stylesheet', href: FONT_HREF });
  }, []);
}

/* ---------- SEO (homepage only). Updates existing tags rather than duplicating them. ---------- */
const SEO = {
  title: 'Puchhuu – Book Home Services Online',
  description: 'Browse home service categories on Puchhuu, book a service online, and pay after the work is done.',
  url: 'https://www.puchhuu.com/',
  image: desktopBgImage,
};

function upsertHead(selector, create, attrs) {
  let el = document.head.querySelector(selector);
  let created = false;
  if (!el) { el = create(); document.head.appendChild(el); created = true; }
  const prev = {};
  Object.keys(attrs).forEach((k) => { prev[k] = el.getAttribute(k); el.setAttribute(k, attrs[k]); });
  return () => {
    if (created) el.remove();
    else Object.keys(prev).forEach((k) => (prev[k] === null ? el.removeAttribute(k) : el.setAttribute(k, prev[k])));
  };
}
const metaByName = (name, content) =>
  upsertHead(`meta[name="${name}"]`, () => { const m = document.createElement('meta'); m.setAttribute('name', name); return m; }, { content });
const metaByProp = (prop, content) =>
  upsertHead(`meta[property="${prop}"]`, () => { const m = document.createElement('meta'); m.setAttribute('property', prop); return m; }, { content });

function useHomeSeo() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = SEO.title;
    const undo = [
      metaByName('description', SEO.description),
      metaByName('robots', 'index, follow'),
      upsertHead('link[rel="canonical"]', () => { const l = document.createElement('link'); l.setAttribute('rel', 'canonical'); return l; }, { href: SEO.url }),
      metaByProp('og:type', 'website'),
      metaByProp('og:site_name', 'Puchhuu'),
      metaByProp('og:title', SEO.title),
      metaByProp('og:description', SEO.description),
      metaByProp('og:url', SEO.url),
      metaByProp('og:image', SEO.image),
      metaByName('twitter:card', 'summary_large_image'),
      metaByName('twitter:title', SEO.title),
      metaByName('twitter:description', SEO.description),
      metaByName('twitter:image', SEO.image),
    ];
    return () => { document.title = prevTitle; undo.forEach((fn) => fn()); };
  }, []);
}

/* ---------- Shared UI ---------- */
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86] focus-visible:ring-offset-2';
const WRAP = 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8';

const ICON_RULES = [
  [/(^|\W)(ac|appliance|refrigerator|washing|ro)\b/i, Wind],
  [/clean|wash|sanit/i, Sparkles],
  [/plumb/i, Droplets],
  [/electric/i, Zap],
  [/paint|renovat/i, PaintRoller],
  [/car|bike|vehicle/i, CarFront],
  [/garden|outdoor|lawn/i, Flower2],
  [/pest/i, Bug],
  [/carpent|furnit/i, Hammer],
  [/sofa|mattress|curtain/i, Sofa],
  [/salon|beauty|spa/i, Scissors],
  [/repair|service|maint/i, Wrench],
];
const iconForCategory = (name = '') => (ICON_RULES.find(([re]) => re.test(name)) || [null, Grid2x2])[1];
const PASTELS = ['bg-[#E8F1FB]', 'bg-[#FFF4D6]', 'bg-[#E6F0FB]', 'bg-[#E6F4FA]', 'bg-[#FDEBDD]', 'bg-[#E3F5F1]', 'bg-[#FCE8E8]', 'bg-[#FFF1CC]'];

const ratingOf = (s) => {
  const r = typeof s.rating === 'number' ? s.rating : s.rating?.average ?? s.averageRating;
  return typeof r === 'number' && r > 0 ? r : null;
};

/* ---------- Shared helpers for optional service fields (nothing is invented) ---------- */
const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const reviewsOf = (s) => num(s.rating?.count ?? s.reviewCount ?? s.reviewsCount);
const mrpOf = (s) => {
  const mrp = num(s.originalPrice ?? s.mrp ?? s.compareAtPrice);
  const price = num(Number(s.basePrice));
  return mrp && price && mrp > price ? mrp : null;
};
const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}K` : String(n));

/* ---------- Most Booked section (minimal, square cards) ----------
   UI only. Uses the same `popularServices` array Home already loads, no API calls.
   Rating and MRP show only if the API returns them. "Instant" shows only if the API sends
   `instant` / `isInstant` as true. */
const MostBookedCard = ({ service }) => {
  const img = service.images?.[0]?.url;
  const rating = ratingOf(service);
  const mrp = mrpOf(service);
  const price = Number(service.basePrice);
  const hasPrice = service.basePrice !== undefined && service.basePrice !== null && service.basePrice !== '' && Number.isFinite(price);
  const instant = service.instant === true || service.isInstant === true;

  return (
    <li className="snap-start shrink-0 w-[44vw] max-w-[200px] sm:w-[200px] lg:w-[calc((100%-4rem)/5)] lg:max-w-none">
      <Link to={`/service/${service.slug}`} className={`group block rounded-2xl ${FOCUS}`}>
        <div className="relative aspect-square rounded-2xl bg-[#F0F2F4] overflow-hidden">
          {img ? (
            <img src={img} alt="" width="400" height="400" loading="lazy" decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
          ) : <div className="absolute inset-0 bg-gradient-to-br from-[#0E7C86]/15 to-[#0B2545]/10" aria-hidden="true" />}
        </div>

        <div className="pt-3">
          <h3 className="text-[15px] font-medium text-[#111827] leading-snug line-clamp-2 min-h-[2.5em]">{service.name}</h3>
          {(rating || instant) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#374151]">
              {rating && (
                <>
                  <Star className="w-3.5 h-3.5 text-[#4B5563] fill-[#4B5563]" aria-hidden="true" />
                  <span>{Math.round(rating * 100) / 100}</span>
                </>
              )}
              {rating && instant && <span aria-hidden="true" className="text-[#9CA3AF]">•</span>}
              {instant && (
                <span className="inline-flex items-center gap-0.5 text-xs text-[#4B5563]">
                  <Zap className="w-3.5 h-3.5 text-[#0B8A5B] fill-[#0B8A5B]" aria-hidden="true" />Instant
                </span>
              )}
            </p>
          )}
          {hasPrice && (
            <p className="mt-1 flex items-baseline gap-2 flex-wrap text-sm text-[#111827]">
              <span>₹{service.basePrice}</span>
              {mrp && <span className="text-[#6B7280] line-through">₹{mrp}</span>}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
};

const MostBookedSection = ({ services = [], id = 'popular-title' }) => {
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
  const scrollBy = (dir) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const arrow = (dir) => (
    <button
      type="button"
      onClick={() => scrollBy(dir)}
      aria-label={dir < 0 ? 'Previous most booked services' : 'Next most booked services'}
      className={`absolute top-[calc((100%-5.5rem)/2)] -translate-y-1/2 ${dir < 0 ? '-left-5' : '-right-5'} z-20 hidden lg:grid w-11 h-11 place-items-center rounded-full bg-white border border-[#E5E7EB] text-[#111827] shadow-md hover:bg-[#F3F4F6] transition-colors ${FOCUS}`}
    >
      {dir < 0 ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
    </button>
  );

  return (
    <section aria-labelledby={id} className="py-7 md:py-11 bg-white">
      <div className={WRAP}>
        <h2 id={id} className="text-2xl md:text-[32px] font-bold tracking-tight text-[#111827] leading-tight">Most booked services</h2>

        <div className="relative mt-6">
          {canPrev && arrow(-1)}
          <ul
            ref={rowRef}
            onScroll={update}
            aria-label="Most booked services"
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity pb-1 -mx-1 px-1"
          >
            {services.slice(0, 8).map((svc) => <MostBookedCard key={svc._id} service={svc} />)}
          </ul>
          {canNext && arrow(1)}
        </div>
      </div>
    </section>
  );
};

/* ---------- Category row section (minimal, borderless cards) ----------
   Used for every category (AC Repair, Cleaning, etc.).
   UI only. Same `servicesByCategory` data, no API calls.
   Subtitle shows only if the category has a description; rating, reviews and MRP only if the API returns them. */
const CategoryServiceCard = ({ service }) => {
  const img = service.images?.[0]?.url;
  const rating = ratingOf(service);
  const reviews = reviewsOf(service);
  const mrp = mrpOf(service);
  const price = Number(service.basePrice);
  const hasPrice = service.basePrice !== undefined && service.basePrice !== null && service.basePrice !== '' && Number.isFinite(price);

  return (
    <li className="snap-start shrink-0 w-[70vw] max-w-[300px] sm:w-[260px] lg:w-[calc((100%-4rem)/5)] lg:max-w-none">
      <Link to={`/service/${service.slug}`} className={`group block rounded-2xl ${FOCUS}`}>
        <div className="relative aspect-[4/3] rounded-2xl bg-[#F0F2F4] overflow-hidden">
          {img ? (
            <img src={img} alt="" width="480" height="360" loading="lazy" decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
          ) : <div className="absolute inset-0 bg-gradient-to-br from-[#0E7C86]/15 to-[#0B2545]/10" aria-hidden="true" />}
        </div>

        <div className="pt-3 px-0.5">
          <h3 className="text-[15px] font-medium text-[#0B1B33] leading-snug line-clamp-2 min-h-[2.5em]">{service.name}</h3>
          {rating && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#0B1B33]">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
              <span>{Math.round(rating * 100) / 100}</span>
              {reviews && <span className="text-[#8A94A3]">({compact(reviews)})</span>}
            </p>
          )}
          {hasPrice && (
            <p className="mt-2 flex items-baseline gap-2.5 flex-wrap">
              <span className="text-xl font-bold text-[#0B1B33]">₹{service.basePrice}</span>
              {mrp && <span className="text-sm text-[#8A94A3] line-through">₹{mrp}</span>}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
};

const CategoryRowSection = ({ category, services }) => {
  const rowRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const titleId = `cat-title-${category._id}`;
  const subtitle = typeof category.description === 'string' ? category.description.trim() : '';

  const update = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  const scrollBy = (dir) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const navBtn = (dir, enabled) => (
    <button
      type="button"
      onClick={() => scrollBy(dir)}
      disabled={!enabled}
      aria-label={`${dir < 0 ? 'Previous' : 'Next'} ${category.name} services`}
      className={`hidden sm:grid w-11 h-11 place-items-center rounded-full border text-[#0B1B33] transition-colors disabled:bg-[#F3F4F6] disabled:border-transparent disabled:text-[#9AA3AF] disabled:cursor-not-allowed bg-white border-[#E5E7EB] hover:bg-[#F3F4F6] ${FOCUS}`}
    >
      {dir < 0 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
    </button>
  );

  return (
    <section aria-labelledby={titleId} className="py-7 md:py-11 bg-white">
      <div className={WRAP}>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs md:text-sm font-medium uppercase tracking-wider text-[#6B7280]">Popular services</p>
            <h2 id={titleId} className="mt-1 text-[28px] sm:text-4xl md:text-[44px] font-extrabold tracking-tight text-[#0B1B33] leading-[1.1]">{category.name}</h2>
            {subtitle && <p className="mt-2 text-sm md:text-base text-[#6B7280] line-clamp-2">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to={`/category/${category.slug}`}
              aria-label={`See all ${category.name} services`}
              className={`inline-flex items-center gap-1.5 h-11 px-3 sm:mr-4 rounded-lg text-sm md:text-base font-semibold text-[#0B1B33] hover:bg-[#F3F4F6] transition-colors ${FOCUS}`}
            >
              See all <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            {navBtn(-1, canPrev)}{navBtn(1, canNext)}
          </div>
        </div>

        <ul
          ref={rowRef}
          onScroll={update}
          aria-label={`${category.name} services`}
          className="mt-7 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity pb-1 -mx-1 px-1"
        >
          {services.slice(0, 8).map((svc) => <CategoryServiceCard key={svc._id} service={svc} />)}
        </ul>
      </div>
    </section>
  );
};

/* ---------- Hero data + tile ---------- */

// Right side ke 4 photo tiles. image me apni photo ka URL daalo (khali = gradient dikhega).
// match = category ka naam match karke us category ka link khud ban jaata hai.
const HERO_TILES = [
  { label: 'Salon & Spa at Home',        match: /salon|spa|beauty/i,         Icon: Scissors, image: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793016892/b863e97d-44e8-40c9-9e14-c7cb576954af.png', span: 'col-span-6 lg:col-span-7' },
  { label: 'Massage Therapy & Wellness', match: /massage|wellness|therapy/i, Icon: Flower2,  image: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793017139/b7448fc1-8046-41db-8209-4ba8ae917160.png', span: 'col-span-6 lg:col-span-5' },
  { label: 'Appliance Repair',           match: /appliance/i,                Icon: Wrench,   image: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793017283/2b0f9a52-ddb8-4782-a3b4-e8ce16431571.png', span: 'col-span-6 lg:col-span-5' },
  { label: 'AC Service & Repair',        match: /(^|\W)ac\b/i,               Icon: Wind,     image: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793017394/3d629e45-44e8-4519-991d-b69dff74a2d7.png', span: 'col-span-6 lg:col-span-7' },
];

// Left side ke neeche stats (apne real numbers daalo)
const HERO_STATS = [
  { Icon: Star,        value: '4.8',      label: 'Service Rating' },
  { Icon: Users,       value: '12M+',     label: 'Happy Customers' },
  { Icon: ShieldCheck, value: 'Verified', label: 'Professionals' },
];

const HeroTile = ({ label, image, Icon, to, span }) => {
  const cls = `group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0E7C86] to-[#0B2545] h-[170px] sm:h-[220px] lg:h-[280px] ${span} ${FOCUS}`;
  const body = (
    <>
      {image && (
        <img src={image} alt="" loading="lazy" decoding="async"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
      )}
      <div className="absolute left-2 right-2 bottom-2 sm:left-3 sm:right-3 sm:bottom-3 flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 shadow-md">
        <span className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-[#E3F5F1] grid place-items-center">
          <Icon className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0 text-[12px] sm:text-sm font-semibold text-[#0B2545] leading-tight line-clamp-2">{label}</span>
        <span className="w-7 h-7 shrink-0 rounded-full bg-[#0E7C86] text-white grid place-items-center">
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
    </>
  );
  return to
    ? <Link to={to} className={cls}>{body}</Link>
    : <a href="#categories" className={cls}>{body}</a>;
};

/* ---------- In the spotlight (promo banners) ----------
   UI only. Edit the SPOTLIGHT list below to change the banners.
   - match:        category name regex, the banner links to that category (falls back to #categories)
   - serviceMatch: optional service name regex, the banner links to that service and uses its photo
   - image:        your own photo URL (optional if serviceMatch finds a service with an image)
   - startingAt:   optional number, shows "Starting ₹X" only when you set it
   - tag:          optional small label, e.g. "New launch"
   - theme:        'light' | 'dark' | 'split' */
const SPOTLIGHT = [
  {
    id: 'glow', theme: 'light', bg: '#C7CBAE', tag: 'New launch',
    title: 'Japanese glow rituals', subtitle: '', startingAt: null, cta: 'Book now',
    match: /salon|spa|beauty/i, serviceMatch: null,
    image: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793016892/b863e97d-44e8-40c9-9e14-c7cb576954af.png',
  },
  {
    id: 'bathroom', theme: 'dark', bg: '#2F4B40', tag: '',
    title: 'Deep clean your bathroom', subtitle: 'Intense bathroom cleaning', startingAt: null, cta: 'Book now',
    match: /clean/i, serviceMatch: /bathroom/i,
    image: '',
  },
  {
    id: 'repairs', theme: 'split', bg: '#0A63C9', tag: '',
    title: 'Home repairs at affordable prices', subtitle: 'Electricians, plumbers, carpenters', startingAt: null, cta: 'Book now',
    match: /electric|plumb|carpent|repair/i, serviceMatch: null,
    image: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793017283/2b0f9a52-ddb8-4782-a3b4-e8ce16431571.png',
  },
];

const SpotlightCard = ({ item, to, image }) => {
  const isDark = item.theme === 'dark' || item.theme === 'split';
  const text = isDark ? 'text-white' : 'text-[#111827]';
  const sub = isDark ? 'text-white/85' : 'text-[#374151]';
  const btn = item.theme === 'light'
    ? 'bg-white text-[#111827]'
    : item.theme === 'dark'
      ? 'bg-[#111827] text-white'
      : 'bg-[#0A4C9A] text-white';
  const isSplit = item.theme === 'split';

  const body = (
    <>
      {isSplit ? (
        <>
          {image && <img src={image} alt="" loading="lazy" decoding="async" className="absolute right-0 top-0 h-full w-[40%] object-cover" />}
        </>
      ) : (
        <>
          {image && <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover object-right transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(90deg, ${item.bg} 0%, ${item.bg}E6 38%, ${item.bg}00 78%)` }}
            aria-hidden="true"
          />
        </>
      )}

      {item.tag && (
        <span className="absolute top-0 left-4 rounded-b-md bg-[#6B0F2E] text-white text-[11px] font-medium px-2.5 py-1">{item.tag}</span>
      )}

      <div className={`absolute inset-y-0 left-0 flex flex-col justify-center p-5 sm:p-6 ${isSplit ? 'w-[64%]' : 'w-[62%]'}`}>
        <h3 className={`text-xl sm:text-2xl font-semibold leading-tight ${text}`}>{item.title}</h3>
        {item.subtitle && <p className={`mt-1.5 text-sm ${sub}`}>{item.subtitle}</p>}
        {item.startingAt ? <p className={`mt-1.5 text-sm ${sub}`}>Starting ₹{item.startingAt}</p> : null}
        <span className={`mt-4 inline-flex items-center h-10 px-4 rounded-lg text-sm font-medium w-fit ${btn}`}>{item.cta || 'Book now'}</span>
      </div>
    </>
  );

  const cls = `group relative block h-[200px] sm:h-[220px] rounded-2xl overflow-hidden ${FOCUS}`;
  const style = { backgroundColor: item.bg };
  return to.startsWith('#')
    ? <a href={to} className={cls} style={style}>{body}</a>
    : <Link to={to} className={cls} style={style}>{body}</Link>;
};

const SpotlightSection = ({ categories, services }) => {
  const rowRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const scrollBy = (dir) => {
    const el = rowRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  const resolved = SPOTLIGHT.map((item) => {
    const svc = item.serviceMatch ? services.find((x) => item.serviceMatch.test(x.name)) : null;
    const cat = item.match ? categories.find((x) => item.match.test(x.name)) : null;
    const to = svc ? `/service/${svc.slug}` : cat ? `/category/${cat.slug}` : '#categories';
    const image = item.image || svc?.images?.[0]?.url || '';
    return { item, to, image };
  });

  const arrow = (dir, show) => show && (
    <button
      type="button"
      onClick={() => scrollBy(dir)}
      aria-label={dir < 0 ? 'Previous spotlight' : 'Next spotlight'}
      className={`absolute top-1/2 -translate-y-1/2 ${dir < 0 ? '-left-5' : '-right-5'} z-20 hidden lg:grid w-11 h-11 place-items-center rounded-full bg-white border border-[#E5E7EB] text-[#111827] shadow-md hover:bg-[#F3F4F6] transition-colors ${FOCUS}`}
    >
      {dir < 0 ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
    </button>
  );

  return (
    <section aria-labelledby="spotlight-title" className="py-7 md:py-11 bg-white">
      <div className={WRAP}>
        <h2 id="spotlight-title" className="text-2xl md:text-[32px] font-bold tracking-tight text-[#111827] leading-tight">In the spotlight</h2>
        <div className="relative mt-6">
          {arrow(-1, canPrev)}
          <ul
            ref={rowRef}
            onScroll={update}
            aria-label="In the spotlight"
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-proximity -mx-1 px-1"
          >
            {resolved.map(({ item, to, image }) => (
              <li key={item.id} className="snap-start shrink-0 w-[86vw] max-w-[440px] sm:w-[400px] lg:w-[calc((100%-3rem)/3)] lg:max-w-none">
                <SpotlightCard item={item} to={to} image={image} />
              </li>
            ))}
          </ul>
          {arrow(1, canNext)}
        </div>
      </div>
    </section>
  );
};

/* ---------- Promo banner (Native RO Water Purifier) ----------
   UI only. Edit PROMOS to change the banner text, colours or photo.
   - match:     category name regex. The banner links to that category (falls back to #categories).
   - image:     your product photo URL (PNG with transparent background looks best, fit: 'contain').
   - tag / highlight: optional lines.
   Offer text (e.g. "Up to ₹4,300 off") is only what you write here, so keep it in sync with real offers. */
const PROMOS = [
  {
    id: 'native-ro', always: true, from: '#4A2BC2', to: '#1B0E5E', fit: 'contain', Icon: Droplets,
    tag: 'Native Festive Days • Up to ₹4,300 off',
    title: 'Native RO Water Purifier', highlight: 'Now at its lowest price ever', cta: 'Buy now',
    match: /water|purifier|smart/i, image: '',
  },
];

const PromoSlide = ({ promo, to, image }) => {
  const PromoIcon = promo.Icon;
  const cls = `group relative block h-[240px] sm:h-[300px] lg:h-[340px] rounded-2xl overflow-hidden ${FOCUS}`;
  const style = { background: `linear-gradient(120deg, ${promo.from} 0%, ${promo.to} 100%)` };

  const body = (
    <>
      <PromoIcon className="absolute right-[8%] top-1/2 -translate-y-1/2 w-40 h-40 sm:w-56 sm:h-56 text-white/10" aria-hidden="true" />
      {image && (
        promo.fit === 'contain'
          ? <img src={image} alt="" loading="lazy" decoding="async" className="absolute right-[4%] bottom-0 h-[92%] w-[40%] object-contain object-bottom" />
          : (
            <>
              <img src={image} alt="" loading="lazy" decoding="async" className="absolute right-0 top-0 h-full w-[58%] object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
              <div className="absolute inset-y-0 right-0 w-[58%]" style={{ background: `linear-gradient(90deg, ${promo.from} 0%, ${promo.from}00 45%)` }} aria-hidden="true" />
            </>
          )
      )}

      <div className="absolute inset-y-0 left-0 w-[68%] sm:w-[62%] flex flex-col justify-center p-5 sm:p-8 lg:p-10">
        {promo.tag && (
          <span className="absolute top-0 left-5 sm:left-8 lg:left-10 rounded-b-lg bg-[#111827] text-white text-[11px] sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 max-w-[85%]">{promo.tag}</span>
        )}
        <h3 className="mt-6 text-lg sm:text-3xl font-semibold leading-tight text-white">{promo.title}</h3>
        {promo.highlight && <p className="mt-1 text-xl sm:text-4xl lg:text-[44px] font-bold leading-tight text-[#FDB44B]">{promo.highlight}</p>}
        <span className="mt-5 sm:mt-8 inline-flex items-center h-10 sm:h-12 px-5 sm:px-6 rounded-xl bg-white text-[#111827] text-sm sm:text-lg font-semibold w-fit shadow">{promo.cta || 'Book now'}</span>
      </div>
    </>
  );
  return to.startsWith('#')
    ? <a href={to} className={cls} style={style}>{body}</a>
    : <Link to={to} className={cls} style={style}>{body}</Link>;
};

const PromoCarousel = ({ groups }) => {
  const rowRef = useRef(null);
  const [active, setActive] = useState(0);

  const slides = PROMOS.map((promo) => {
    const group = groups.find((g) => promo.match.test(g.category.name));
    if (!group && !promo.always) return null;
    const to = group ? `/category/${group.category.slug}` : '#categories';
    const image = promo.image || group?.services.find((x) => x.images?.[0]?.url)?.images[0].url || '';
    return { promo, to, image };
  }).filter(Boolean);

  if (!slides.length) return null;

  const onScroll = () => {
    const el = rowRef.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goTo = (i) => {
    const el = rowRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };
  const multi = slides.length > 1;

  return (
    <section aria-label="Offers" className="py-6 md:py-10 bg-white">
      <div className={WRAP}>
        <div className="relative">
          <ul
            ref={rowRef}
            onScroll={onScroll}
            className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory rounded-2xl"
          >
            {slides.map(({ promo, to, image }, i) => (
              <li key={promo.id} className="snap-start shrink-0 w-full" aria-label={`Offer ${i + 1} of ${slides.length}`}>
                <PromoSlide promo={promo} to={to} image={image} />
              </li>
            ))}
          </ul>

          {multi && active > 0 && (
            <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous offer"
              className={`absolute left-3 top-1/2 -translate-y-1/2 hidden sm:grid w-11 h-11 place-items-center rounded-full bg-white/95 text-[#111827] shadow-md hover:bg-white ${FOCUS}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {multi && active < slides.length - 1 && (
            <button type="button" onClick={() => goTo(active + 1)} aria-label="Next offer"
              className={`absolute right-3 top-1/2 -translate-y-1/2 hidden sm:grid w-11 h-11 place-items-center rounded-full bg-white/95 text-[#111827] shadow-md hover:bg-white ${FOCUS}`}>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {multi && (
          <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Choose offer">
            {slides.map(({ promo }, i) => (
              <button
                key={promo.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to offer ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-[#111827]' : 'w-2 bg-[#D1D5DB]'} ${FOCUS}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------- Home page order (below "Most booked services") ----------
   Only these blocks show on Home, in this order. Other categories stay reachable from the
   categories grid and each section's "See all" link. Edit / reorder freely. */
const HOME_LAYOUT = [
  { type: 'category', match: /clean/i },
  { type: 'promo' },
  { type: 'category', match: /(^|\W)ac\b|air.?cond/i },
  { type: 'category', match: /paint|renovat/i },
];

/* ---------- Why Choose data ---------- */
const WHY = [
  { Icon: ShieldCheck, label: 'Verified & Trained Professionals' },
  { Icon: IndianRupee, label: 'Transparent Pricing' },
  { Icon: Clock, label: 'On-Time Service' },
  { Icon: Star, label: '100% Satisfaction' },
];

const CATEGORY_VISIBLE = 11; // + "More" tile = 12 cells (4x3 on phones, 6x2 on larger screens)

// Har item ke neeche chhoti line (WHY array ke SAME order me)
const WHY_SUB = [
  'Background verified',
  'No hidden charges',
  'Your time matters',
  'Quality guaranteed',
];

// Right dark card ki checklist
const TRUST_POINTS = [
  'Background Verified Experts',
  'Trained & Experienced',
  'Safe & Professional Tools',
  'Hassle-Free Service',
];

// Professional ki photo (transparent PNG best lagti hai). Khali chhodoge to sirf shield graphic dikhega.
const TRUST_IMG = ''; // e.g. 'https://res.cloudinary.com/.../professional.png'

export default function Home() {
  useHomeSeo();
  useHomeFont();

  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [servicesByCategory, setServicesByCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAllCats, setShowAllCats] = useState(false); // UI only

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, featuredRes, popularRes, allServicesRes] = await Promise.all([
        fetchCategories(),
        fetchFeaturedServices(),
        fetchPopularServices(),
        fetchServices(1, 100)
      ]);

      if (categoriesRes.success) setCategories(categoriesRes.data.categories);
      else setCategories([]);

      if (featuredRes.success) setFeaturedServices(featuredRes.data.services);
      else setFeaturedServices([]);

      if (popularRes.success) setPopularServices(popularRes.data.services);
      else setPopularServices([]);

      // Group all services by category
      if (allServicesRes.success && allServicesRes.data.services) {
        const services = allServicesRes.data.services;
        const grouped = new Map();
        services.forEach(service => {
          if (!service.category) return;
          const catId = service.category._id;
          if (!grouped.has(catId)) {
            grouped.set(catId, {
              category: service.category,
              services: []
            });
          }
          grouped.get(catId).services.push(service);
        });
        const groupedArray = Array.from(grouped.values()).sort((a, b) =>
          a.category.name.localeCompare(b.category.name)
        );
        setServicesByCategory(groupedArray);
      } else {
        setServicesByCategory([]);
      }
    } catch (err) {
      console.error("Error loading home data:", err);
    } finally {
      setLoading(false);
      setCategoriesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFCFC]" role="status" aria-live="polite" style={{ fontFamily: FONT_STACK }}>
        <div className="flex items-center justify-center min-h-screen flex-col gap-4">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full border-4 border-[#0E7C86] border-t-transparent animate-spin motion-reduce:animate-none"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/djtvxmttf/image/upload/v1792055094/452dcd67-1b04-471b-b09c-ce971e99855d.png"
                alt="Puchhuu logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <p className="text-[#0B2545] font-semibold text-lg mt-2">Welcome to Puchhuu</p>
        </div>
      </div>
    );
  }

  const hasMore = categories.length > CATEGORY_VISIBLE + 1;
  const shownCats = showAllCats || !hasMore ? categories : categories.slice(0, CATEGORY_VISIBLE);
  const hasAppLink = APP_LINKS.play || APP_LINKS.appStore;

  // Hero helpers (UI only, uses already-loaded categories)
  const tileLink = (re) => {
    const c = categories.find((x) => re.test(x.name));
    return c ? `/category/${c.slug}` : null;
  };
  const heroCats = categories.slice(0, 7);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden text-[#0B2545] antialiased" style={{ fontFamily: FONT_STACK }}>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="bg-gradient-to-b from-[#F1F9F9] to-white">
        <div className={`${WRAP} py-6 md:py-10`}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-8 lg:gap-12 items-start">

            {/* LEFT */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E3F5F1] pl-1.5 pr-3 py-1 text-[12px] md:text-[13px] font-medium text-[#0B2545]">
                <span className="w-6 h-6 rounded-full bg-[#0E7C86] text-white grid place-items-center">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                Trusted Home Service Partner in Rajasthan
              </span>

              <h1 id="hero-title" className="mt-4 text-[32px] sm:text-5xl lg:text-[52px] leading-[1.08] font-extrabold tracking-tight text-[#0B1B33]">
                Everything Your Home Needs,{' '}
                <span className="block text-[#0E7C86]">At Your Doorstep</span>
              </h1>

              <p className="mt-3 max-w-md text-sm md:text-base text-[#5B6B7F]">
                Professional, verified experts for a cleaner, safer and more comfortable home.
              </p>

              {/* Category grid (same categories data, no extra API) */}
              {heroCats.length > 0 && (
                <div className="mt-6 rounded-2xl bg-white border border-[#EEF1F4] shadow-sm p-3 md:p-5">
                  <ul className="grid grid-cols-4 gap-x-2 gap-y-4 md:gap-x-4 md:gap-y-5">
                    {heroCats.map((cat, i) => {
                      const CatIcon = iconForCategory(cat.name);
                      return (
                        <li key={cat._id}>
                          <Link to={`/category/${cat.slug}`} className={`group flex flex-col items-center gap-1.5 text-center rounded-xl ${FOCUS}`}>
                            <span className={`w-full h-[52px] md:h-[60px] rounded-xl ${PASTELS[i % PASTELS.length]} grid place-items-center overflow-hidden transition-transform group-hover:scale-[1.03] motion-reduce:transition-none`}>
                              {cat.icon?.url
                                ? <img src={cat.icon.url} alt="" width="40" height="40" loading="lazy" decoding="async" className="h-[70%] w-auto object-contain" />
                                : <CatIcon className="w-6 h-6 md:w-7 md:h-7 text-[#0E7C86]" aria-hidden="true" />}
                            </span>
                            <span className="text-[11px] md:text-[12.5px] font-medium text-[#1E2E45] leading-tight line-clamp-2">{cat.name}</span>
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <a href="#categories" className={`group flex flex-col items-center gap-1.5 text-center rounded-xl ${FOCUS}`}>
                        <span className="w-full h-[52px] md:h-[60px] rounded-xl bg-[#F1F3F5] grid place-items-center">
                          <Grid2x2 className="w-6 h-6 md:w-7 md:h-7 text-[#0B2545]" aria-hidden="true" />
                        </span>
                        <span className="text-[11px] md:text-[12.5px] font-medium text-[#1E2E45] leading-tight">All Services</span>
                      </a>
                    </li>
                  </ul>
                </div>
              )}

              {/* Smart Living Products banner */}
              <a href="#categories" className={`mt-4 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#E3F5F1] to-[#F1FAF7] px-4 py-3 md:py-4 ${FOCUS}`}>
                <span className="w-12 h-12 shrink-0 rounded-xl bg-white grid place-items-center">
                  <Sparkles className="w-6 h-6 text-[#0E7C86]" aria-hidden="true" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] md:text-base font-bold text-[#0B2545]">Smart Living Products</span>
                  <span className="block text-xs md:text-[13px] text-[#5B6B7F]">Native Water Purifiers &amp; Home Care Products</span>
                </span>
                <span className="w-9 h-9 shrink-0 rounded-full bg-[#10B981] text-white grid place-items-center">
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </a>

              {/* Stats */}
              <dl className="mt-5 pt-5 border-t border-[#E3E8EC] flex flex-wrap items-center gap-x-6 gap-y-3">
                {HERO_STATS.map(({ Icon, value, label }, i) => (
                  <div key={label} className={`flex items-center gap-2.5 ${i !== 0 ? 'sm:pl-6 sm:border-l sm:border-[#E3E8EC]' : ''}`}>
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-[#0E7C86]" aria-hidden="true" />
                    <div>
                      <dd className="text-[15px] md:text-base font-bold text-[#0B2545] leading-tight">{value}</dd>
                      <dt className="text-xs md:text-[13px] text-[#5B6B7F] leading-tight">{label}</dt>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {/* RIGHT: photo collage */}
            <div>
              <p
                aria-hidden="true"
                className="hidden lg:block text-right text-[28px] leading-[1.1] text-[#0B1B33] -rotate-6 mb-3 mr-2"
                style={{ fontFamily: "'Caveat', 'Segoe Script', 'Brush Script MT', cursive" }}
              >
                Clean Homes<br />Happier Lives
              </p>
              <div className="grid grid-cols-12 gap-3">
                {HERO_TILES.map((t) => (
                  <HeroTile key={t.label} label={t.label} image={t.image} Icon={t.Icon} span={t.span} to={tileLink(t.match)} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* All Categories (icon grid) */}
      <section id="categories" aria-labelledby="categories-title" className="py-7 md:py-11 bg-white scroll-mt-28">
        <div className={WRAP}>
          <h2 id="categories-title" className="sr-only">All categories</h2>
          {categoriesLoading ? (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-y-5 gap-x-2">
              {Array(12).fill(0).map((_, i) => <div key={i} className="flex flex-col items-center gap-2"><div className="w-[68px] h-[68px] rounded-full bg-[#EEF1F4] animate-pulse" /><div className="h-3 w-14 rounded bg-[#EEF1F4] animate-pulse" /></div>)}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-[#5B6B7F]">Categories are not available right now. Please try again shortly.</p>
          ) : (
            <ul className="grid grid-cols-4 md:grid-cols-6 gap-y-5 md:gap-y-8 gap-x-2 md:gap-x-6">
              {shownCats.map((cat, i) => {
                const CatIcon = iconForCategory(cat.name);
                return (
                  <li key={cat._id}>
                    <Link to={`/category/${cat.slug}`} className={`group flex flex-col items-center gap-2 text-center rounded-xl ${FOCUS}`}>
                      <span className={`w-[68px] h-[68px] md:w-24 md:h-24 rounded-full ${PASTELS[i % PASTELS.length]} grid place-items-center overflow-hidden transition-transform group-hover:scale-105 motion-reduce:transition-none`}>
                        {cat.icon?.url
                          ? <img src={cat.icon.url} alt="" width="64" height="64" loading="lazy" decoding="async" className="w-[70%] h-[70%] object-contain" />
                          : <CatIcon className="w-7 h-7 md:w-9 md:h-9 text-[#0E7C86]" aria-hidden="true" />}
                      </span>
                      <span className="text-[12px] md:text-sm font-medium text-[#1E2E45] leading-tight line-clamp-2 px-0.5">{cat.name}</span>
                    </Link>
                  </li>
                );
              })}
              {hasMore && !showAllCats && (
                <li>
                  <button type="button" onClick={() => setShowAllCats(true)} className={`w-full flex flex-col items-center gap-2 text-center rounded-xl ${FOCUS}`}>
                    <span className="w-[68px] h-[68px] md:w-24 md:h-24 rounded-full bg-[#F1F3F5] grid place-items-center"><MoreHorizontal className="w-7 h-7 text-[#0B2545]" aria-hidden="true" /></span>
                    <span className="text-[12px] md:text-sm font-medium text-[#1E2E45]">More</span>
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      </section>

      {/* In the spotlight */}
      <SpotlightSection categories={categories} services={servicesByCategory.flatMap((g) => g.services)} />

      {/* Trending (featured services) - hidden for now
      <TrendingSection services={featuredServices} id="featured-title" />
      */}

      {/* Most booked (popular services) */}
      <MostBookedSection services={popularServices} id="popular-title" />

      {/* Cleaning, promo banner, AC, Painting (see HOME_LAYOUT) */}
      {HOME_LAYOUT.map((blk, i) => {
        if (blk.type === 'promo') return <PromoCarousel key={`promo-${i}`} groups={servicesByCategory} />;
        const group = servicesByCategory.find((g) => blk.match.test(g.category.name));
        return group ? <CategoryRowSection key={group.category._id} category={group.category} services={group.services} /> : null;
      })}

      {/* App banner: only shown when real store links are set above */}
      {hasAppLink && (
        <section aria-label="Puchhuu app" className="py-4 md:py-8">
          <div className={WRAP}>
            <div className="rounded-3xl bg-gradient-to-br from-[#4C1DB8] to-[#7C3AED] text-white p-6 md:p-10">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Puchhuu App</h2>
              <p className="mt-2 max-w-md text-white/85 text-sm md:text-lg">Book faster, track in real-time and get exclusive offers.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {APP_LINKS.play && <a href={APP_LINKS.play} target="_blank" rel="noopener noreferrer" className={`h-11 px-5 inline-flex items-center rounded-lg bg-black text-white text-sm font-semibold ${FOCUS}`}>Get it on Google Play</a>}
                {APP_LINKS.appStore && <a href={APP_LINKS.appStore} target="_blank" rel="noopener noreferrer" className={`h-11 px-5 inline-flex items-center rounded-lg bg-black text-white text-sm font-semibold ${FOCUS}`}>Download on the App Store</a>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why choose Puchhuu */}
      <section aria-labelledby="why-title" className="py-9 md:py-14 bg-white">
        <div className={WRAP}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">

            {/* LEFT: Why Choose card */}
            <div className="rounded-2xl bg-[#F3F8F9] p-5 md:p-8">
              <h2 id="why-title" className="text-2xl md:text-[28px] font-bold text-[#0F1B2D] mb-6 md:mb-8">
                Why Choose Puchhuu?
              </h2>

              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-y-6">
                {WHY.map(({ Icon, label }, i) => (
                  <li
                    key={label}
                    className={`flex flex-col items-center text-center gap-2 px-2 ${
                      i !== 0 ? 'sm:border-l sm:border-gray-200' : ''
                    }`}
                  >
                    <span className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-sm grid place-items-center">
                      <Icon className="w-7 h-7 md:w-9 md:h-9 text-[#0E7C86]" aria-hidden="true" />
                    </span>
                    <span className="text-[13px] md:text-[15px] font-semibold text-[#1E2E45] leading-tight">
                      {label}
                    </span>
                    {WHY_SUB[i] && (
                      <span className="text-[11.5px] md:text-[13px] text-gray-500 leading-tight">
                        {WHY_SUB[i]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT: Trust & Safety dark card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2833] via-[#0C3C48] to-[#0E6670] text-white p-6 md:p-8 min-h-[280px]">
              {/* Shield graphic (background) */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="absolute -right-6 top-1/2 -translate-y-1/2 w-56 h-56 md:w-72 md:h-72 text-teal-300/20"
                fill="currentColor"
              >
                <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3zm-1.2 14.2L7 12.4l1.4-1.4 2.4 2.4 4.8-4.8L17 10l-6.2 6.2z" />
              </svg>

              {/* Person photo */}
              {TRUST_IMG && (
                <img
                  src={TRUST_IMG}
                  alt="Verified Puchhuu professional"
                  className="absolute right-0 bottom-0 h-[85%] md:h-[100%] w-auto object-contain object-bottom"
                />
              )}

              <div className="relative z-10 max-w-[60%] sm:max-w-[65%]">
                <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 text-[10px] md:text-[11px] tracking-wider font-medium">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3z" />
                  </svg>
                  TRUST &amp; SAFETY
                </span>

                <h3 className="mt-4 text-xl md:text-[28px] font-bold leading-snug">
                  Your Home. Our Responsibility.
                </h3>

                <ul className="mt-5 space-y-3">
                  {TRUST_POINTS.map((t) => (
                    <li key={t} className="flex items-center gap-3 text-[14px] md:text-[15px] text-white/90">
                      <span className="w-6 h-6 rounded-full bg-white text-[#0E7C86] grid place-items-center shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Professionals & Reviews */}
      <InfiniteProvidersMarquee />
      {/* <InfiniteReviewsMarquee /> */}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          .no-scrollbar { scroll-behavior: auto !important; }
        }
      `}</style>
    </div>
  );
}