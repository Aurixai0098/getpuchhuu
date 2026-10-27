import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { fetchPopularServices } from '../services/api';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft, PackageOpen, ChevronRight,
  ShieldCheck, Clock, BadgeIndianRupee, Wallet, Star, Lock, Sparkles,
} from 'lucide-react';

const FONT_STACK = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86] focus-visible:ring-offset-2';
const CARD = 'bg-white rounded-2xl border border-[#E3E8EC]';

const useFont = () => {
  useEffect(() => {
    if (document.getElementById('puchhuu-font')) return;
    const l = document.createElement('link');
    l.id = 'puchhuu-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);
};

// ─── Empty Cart State ───────────────────────────────────────────────
const EmptyCart = () => {
  useFont();
  return (
    <div className="min-h-screen bg-[#F6F8F9] flex items-center justify-center px-4" style={{ fontFamily: FONT_STACK }}>
      <div className="text-center max-w-md">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="relative w-32 h-32 bg-[#E3F5F1] rounded-full flex items-center justify-center">
            <ShoppingCart className="w-14 h-14 text-[#0E7C86]" aria-hidden="true" />
          </div>
          <div className="absolute -top-1 -right-1 w-10 h-10 bg-white border border-[#E3E8EC] rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-[#0B2545] mb-3">Your cart is empty</h2>
        <p className="text-[#5B6B7F] mb-8 leading-relaxed">
          Looks like you haven&apos;t added any services yet. Browse our categories and find the perfect service for your home.
        </p>
        <Link to="/" className={`inline-flex items-center gap-2 h-12 bg-[#0E7C86] text-white px-8 rounded-xl font-semibold hover:bg-[#0B6A73] transition-colors ${FOCUS}`}>
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

// ─── Cart Item Card ─────────────────────────────────────────────────
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const handleRemove = () => {
    setIsRemoving(true);
    timer.current = setTimeout(() => onRemove(item.serviceId, item.variant), 300);
  };

  return (
    <article className={`${CARD} p-4 md:p-5 transition-all duration-300 hover:shadow-[0_14px_30px_-18px_rgba(11,37,69,0.35)] motion-reduce:transition-none
      ${isRemoving ? 'opacity-0 scale-95 translate-x-full' : 'opacity-100 scale-100 translate-x-0'}`}
    >
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-24 h-24 md:w-36 md:h-32 bg-[#F0F6F7] rounded-xl overflow-hidden shrink-0">
          {item.image ? (
            <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageOpen className="w-10 h-10 text-[#B0BAC6]" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#0B2545] text-base md:text-lg leading-snug">{item.name}</h3>
              {/* Provider name instead of category */}
              <p className="text-sm text-[#5B6B7F] mt-0.5">{item.providerName || 'Service Provider'}</p>
            </div>
            <button
              onClick={handleRemove}
              aria-label={`Remove ${item.name}`}
              className={`w-10 h-10 -mr-2 -mt-1 grid place-items-center text-[#6B7A8D] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0 ${FOCUS}`}
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>

          <p className="mt-2 text-xl md:text-2xl font-extrabold text-[#0B2545]">
            ₹{item.price}<span className="text-sm font-medium text-[#6B7A8D]"> / {item.priceUnit || 'service'}</span>
          </p>

          <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-3">
            {/* Quantity stepper (increase stays disabled beyond 1, as before) */}
            <div className="inline-flex items-center rounded-xl border border-[#DDE3E8]" role="group" aria-label={`Quantity of ${item.name}`}>
              <button
                onClick={() => onUpdateQuantity(item.serviceId, Math.max(1, item.quantity - 1), item.variant)}
                disabled={item.quantity <= 1}
                aria-label="Decrease quantity"
                className={`w-10 h-10 grid place-items-center text-[#3C4B5F] hover:bg-[#F0F6F7] rounded-l-xl disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold" aria-live="polite">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.serviceId, item.quantity + 1, item.variant)}
                disabled={item.quantity >= 1}
                aria-label="Increase quantity"
                className={`w-10 h-10 grid place-items-center text-[#3C4B5F] hover:bg-[#F0F6F7] rounded-r-xl disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="text-xs text-[#6B7A8D]">Item total</p>
              <p className="text-lg font-extrabold text-[#0B2545]">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

// ─── Order Summary ──────────────────────────────────────────────
const getTotals = (cartTotal) => {
  const subtotal = cartTotal;
  const platformFee = 29;
  const gst = subtotal * 0.18;
  return { subtotal, platformFee, gst, total: subtotal + platformFee + gst };
};

const OrderSummary = ({ cartTotal, itemCount }) => {
  const { subtotal, platformFee, gst, total } = getTotals(cartTotal);
  return (
    <section className={`${CARD} p-5 md:p-6`} aria-labelledby="summary-h">
      <h2 id="summary-h" className="text-xl font-extrabold text-[#0B2545] mb-4">Order Summary</h2>
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-[#5B6B7F]">Total Services ({itemCount})</dt><dd className="font-medium">₹{subtotal.toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt className="text-[#5B6B7F]">Platform Fee</dt><dd className="font-medium">₹{platformFee.toFixed(2)}</dd></div>
        <div className="flex justify-between"><dt className="text-[#5B6B7F]">GST (18%)</dt><dd className="font-medium">₹{gst.toFixed(2)}</dd></div>
        <div className="flex justify-between items-baseline border-t border-[#EEF1F4] pt-4 mt-1">
          <dt className="font-extrabold text-base">Total Amount</dt>
          <dd className="text-2xl font-extrabold text-[#0B2545]">₹{total.toFixed(2)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-[#6B7A8D]">Payment is collected after the service is completed.</p>

      <Link
        to="/checkout"
        className={`hidden lg:flex mt-5 w-full h-14 items-center justify-center gap-2 bg-[#12614F] text-white rounded-xl font-bold text-base hover:bg-[#0E7C86] transition-colors active:scale-[0.99] ${FOCUS}`}
      >
        Proceed to Checkout
        <ArrowRight className="w-5 h-5" aria-hidden="true" />
      </Link>
      <p className="hidden lg:flex mt-3 items-center justify-center gap-1.5 text-xs text-[#5B6B7F]"><Lock className="w-3.5 h-3.5" aria-hidden="true" /> No online payment required</p>
    </section>
  );
};

const WHY = [
  [ShieldCheck, 'Verified Professionals', 'Profiles checked by Puchhuu'],
  [BadgeIndianRupee, 'Transparent Pricing', 'See the price before you book'],
  [Clock, 'On-Time Service', 'Your time is valuable'],
  [Wallet, 'Pay After Service', 'Pay once the work is done'],
];

const WhyBook = () => (
  <section className={`${CARD} p-5 md:p-6`} aria-labelledby="why-h">
    <h2 id="why-h" className="text-lg font-extrabold text-[#0B2545] mb-4">Why Book with Puchhuu?</h2>
    <ul className="space-y-4">
      {WHY.map(([Ic, title, sub]) => (
        <li key={title} className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-full bg-[#E3F5F1] grid place-items-center shrink-0"><Ic className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /></span>
          <span><b className="block text-sm text-[#0B2545]">{title}</b><span className="text-xs text-[#5B6B7F]">{sub}</span></span>
        </li>
      ))}
    </ul>
  </section>
);

const ratingOf = (s) => {
  const r = typeof s.rating === 'number' ? s.rating : s.rating?.average ?? s.averageRating;
  return typeof r === 'number' && r > 0 ? r : null;
};

// ─── You may also like (read-only, uses the existing popular-services API) ───
const AlsoLike = () => {
  const [services, setServices] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetchPopularServices();
        if (alive && res?.success) setServices(res.data?.services || []);
      } catch (err) { console.error('Popular services load error:', err); }
    })();
    return () => { alive = false; };
  }, []);

  if (services.length === 0) return null;
  return (
    <section aria-labelledby="also-h" className="mt-10">
      <h2 id="also-h" className="text-xl md:text-2xl font-extrabold text-[#0B2545] mb-4">You May Also Like</h2>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {services.slice(0, 4).map((s) => {
          const rating = ratingOf(s);
          return (
            <li key={s._id}>
              <Link to={`/service/${s.slug}`} className={`group block ${CARD} overflow-hidden hover:shadow-[0_14px_30px_-18px_rgba(11,37,69,0.4)] transition-shadow ${FOCUS}`}>
                <div className="aspect-[4/3] bg-[#F0F6F7] overflow-hidden">
                  {s.images?.[0]?.url && <img src={s.images[0].url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none" />}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-[#0B2545] line-clamp-2 min-h-[2.5em]">{s.name}</h3>
                  {s.basePrice != null && <p className="mt-1 text-sm text-[#5B6B7F]">Starting at <b className="text-[#0B2545]">₹{s.basePrice}</b></p>}
                  <div className="mt-2 flex items-center justify-between">
                    {rating ? <span className="flex items-center gap-1 text-xs"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" /><b>{rating.toFixed(1)}</b></span> : <span />}
                    <span className="text-xs font-semibold text-[#0E7C86] inline-flex items-center">View <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" /></span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────
const CartPage = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  useFont();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!showClearConfirm) return undefined;
    const onKey = (e) => e.key === 'Escape' && setShowClearConfirm(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showClearConfirm]);

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  const { total } = getTotals(cartTotal);
  const count = cartItems.length;

  return (
    <div className="min-h-screen bg-[#F6F8F9] pb-32 lg:pb-12 text-[#0B2545]" style={{ fontFamily: FONT_STACK }}>
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} aria-label="Go back" className={`w-10 h-10 -ml-2 grid place-items-center rounded-full ${FOCUS}`}><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-xl font-extrabold">My Cart ({count})</h1>
          </div>
          <button onClick={() => setShowClearConfirm(true)} aria-label="Clear cart" className={`w-10 h-10 grid place-items-center rounded-full ${FOCUS}`}><Trash2 className="w-5 h-5" /></button>
        </div>

        {/* Desktop header */}
        <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 pt-5 text-[13px] text-[#5B6B7F]">
          <Link to="/" className="hover:text-[#0E7C86]">Home</Link><ChevronRight className="w-3 h-3" aria-hidden="true" /><span className="text-[#0B2545] font-medium">Cart</span>
        </nav>
        <div className="hidden lg:flex items-end justify-between pt-4 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">My Cart <span className="text-xl font-semibold text-[#5B6B7F]">({count} {count === 1 ? 'Service' : 'Services'})</span></h1>
            <p className="text-[#5B6B7F] mt-1.5">Review your selected services and proceed to book.</p>
          </div>
          <button onClick={() => setShowClearConfirm(true)} className={`text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 px-3 h-10 rounded-lg hover:bg-red-50 transition-colors ${FOCUS}`}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Clear Cart
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT: items */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {cartItems.map(item => (
              <CartItem
                key={`${item.serviceId}-${item.variant}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}

            <Link to="/" className={`inline-flex items-center gap-2 text-[#0E7C86] font-semibold hover:text-[#0B6A73] transition-colors py-2 ${FOCUS} rounded`}>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Continue Shopping
            </Link>

            <div className="hidden lg:block"><AlsoLike /></div>
          </div>

          {/* RIGHT: summary */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-5 lg:sticky lg:top-28">
            <OrderSummary cartTotal={cartTotal} itemCount={count} />
            <WhyBook />
          </aside>

          <div className="lg:hidden w-full"><AlsoLike /></div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#E3E8EC] px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="flex items-center gap-4">
          <div className="shrink-0"><p className="text-xs text-[#5B6B7F]">Total</p><p className="text-2xl font-extrabold leading-none">₹{total.toFixed(0)}</p></div>
          <Link to="/checkout" className={`flex-1 h-12 rounded-xl bg-[#12614F] hover:bg-[#0E7C86] text-white font-bold inline-flex items-center justify-center gap-2 ${FOCUS}`}>
            Proceed to Checkout <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0B2545]/50 backdrop-blur-sm p-4 animate-[cartFade_.2s_ease-out]" onClick={() => setShowClearConfirm(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="clear-h" className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-7 text-center animate-[cartScale_.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" aria-hidden="true" />
            </div>
            <h3 id="clear-h" className="text-xl font-extrabold mb-2">Clear your cart?</h3>
            <p className="text-[#5B6B7F] mb-6">
              Are you sure you want to remove all {cartItems.length} items from your cart? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                autoFocus
                className={`flex-1 h-12 bg-[#F1F3F5] text-[#0B2545] font-semibold rounded-xl hover:bg-[#E8EDF1] transition-colors ${FOCUS}`}
              >
                Keep Items
              </button>
              <button
                onClick={() => { clearCart(); setShowClearConfirm(false); }}
                className={`flex-1 h-12 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors ${FOCUS}`}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cartFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cartScale { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
        @media (prefers-reduced-motion: reduce) { [class*="animate-[cart"] { animation: none !important; } }
      `}</style>
    </div>
  );
};

export default CartPage;