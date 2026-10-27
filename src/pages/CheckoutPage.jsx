// src/pages/CheckoutPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fetchAddresses, addAddress, createBooking } from '../services/api';
import {
  ArrowLeft, MapPin, Plus, Shield, Building2, Home, ShoppingCart, X, Check,
  CalendarDays, Banknote, ImagePlus, ChevronUp, Lock, Loader2,
} from 'lucide-react';

const FONT_STACK = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86] focus-visible:ring-offset-2';
const CARD = 'bg-white rounded-2xl border border-[#E3E8EC] p-5 md:p-6';
const FIELD = 'w-full h-12 px-4 bg-white border border-[#DDE3E8] rounded-xl text-base sm:text-sm text-[#0B2545] placeholder:text-[#8A97A8] outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15';

// Slot "start" is what gets sent to the API as scheduledTime.start (same field as before).
const SLOTS = [
  { start: '09:00', label: '9:00 AM - 11:00 AM' },
  { start: '11:00', label: '11:00 AM - 1:00 PM' },
  { start: '13:00', label: '1:00 PM - 3:00 PM' },
  { start: '15:00', label: '3:00 PM - 6:00 PM' },
  { start: '18:00', label: '6:00 PM - 9:00 PM' },
];
const COMMON_REQUESTS = ['Urgent service', 'Bring extra parts', 'Call before arrival', 'Parking available'];
const ADDRESS_TYPES = [['home', 'Home', Home], ['work', 'Office', Building2], ['other', 'Other', MapPin]];

const pad = (n) => String(n).padStart(2, '0');
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const slotPast = (ymd, start) => ymd === toYMD(new Date()) && Number(start.slice(0, 2)) <= new Date().getHours();
const firstFreeSlot = (ymd) => SLOTS.find((s) => !slotPast(ymd, s.start))?.start || '';
const initialDate = () => { const t = new Date(); if (firstFreeSlot(toYMD(t))) return toYMD(t); t.setDate(t.getDate() + 1); return toYMD(t); };
const nextDays = (n) => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

const Section = ({ id, number, title, children, aside }) => (
  <section id={id} aria-labelledby={`${id}-h`} className={`${CARD} scroll-mt-28`}>
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 id={`${id}-h`} className="text-lg md:text-xl font-extrabold text-[#0B2545]">{number}. {title}</h2>
      {aside}
    </div>
    {children}
  </section>
);

const Stepper = ({ steps }) => (
  <ol className="flex items-start justify-between w-full max-w-[640px] mx-auto" aria-label="Checkout progress">
    {steps.map((s, i) => (
      <li key={s.label} className="relative flex-1 flex flex-col items-center text-center" aria-current={s.state === 'current' ? 'step' : undefined}>
        {i > 0 && <span className={`absolute top-4 right-1/2 w-full h-[2px] -z-0 ${steps[i - 1].state === 'done' ? 'bg-[#0E7C86]' : 'bg-[#DDE3E8]'}`} aria-hidden="true" />}
        <span className={`relative z-10 w-8 h-8 rounded-full grid place-items-center text-sm font-bold ${s.state === 'upcoming' ? 'bg-[#EEF1F4] text-[#5B6B7F]' : 'bg-[#0E7C86] text-white'}`}>
          {s.state === 'done' ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
        </span>
        <span className={`mt-2 text-xs ${s.state === 'upcoming' ? 'text-[#6B7A8D]' : 'font-semibold text-[#0B2545]'}`}>{s.label}</span>
      </li>
    ))}
  </ol>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: 'home', street: '', landmark: '', city: '', state: '', pincode: '', isDefault: false });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderNote, setOrderNote] = useState('');

  const [problemDescription, setProblemDescription] = useState('');
  const [problemImages, setProblemImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // UI state: schedule + inline messages
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlot, setSelectedSlot] = useState(() => firstFreeSlot(initialDate()));
  const [formError, setFormError] = useState('');
  const [addrError, setAddrError] = useState('');
  const previewsRef = useRef([]);
  useEffect(() => { previewsRef.current = imagePreviews; }, [imagePreviews]);

  useEffect(() => {
    if (document.getElementById('puchhuu-font')) return;
    const l = document.createElement('link');
    l.id = 'puchhuu-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, []);

  // Release object URLs when leaving the page
  useEffect(() => () => previewsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  useEffect(() => {
    const directBooking = location.state?.directBooking;
    if (directBooking) {
      const item = {
        serviceId: directBooking.serviceId,
        providerId: directBooking.providerId,
        providerName: directBooking.providerName,
        name: directBooking.serviceName,
        price: directBooking.price,
        priceUnit: directBooking.priceUnit,
        quantity: 1,
        categoryId: directBooking.categoryId,
        image: directBooking.image,
      };
      setCheckoutItems([item]);
    } else {
      setCheckoutItems(cartItems);
    }
  }, [location.state, cartItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const addrRes = await fetchAddresses();
        if (addrRes.success) {
          setAddresses(addrRes.data.addresses || []);
          const defaultAddr = addrRes.data.addresses?.find(a => a.isDefault);
          if (defaultAddr) setSelectedAddress(defaultAddr);
          else if (addrRes.data.addresses?.length) setSelectedAddress(addrRes.data.addresses[0]);
        }
      } catch (error) { console.error(error); }
    };
    if (user) loadData();
  }, [user]);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const platformFee = 29;
  const gst = subtotal * 0.18;
  const total = subtotal + platformFee + gst;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAddrError('');
    try {
      const response = await addAddress(newAddress);
      if (response.success) {
        const updated = await fetchAddresses();
        setAddresses(updated.data.addresses);
        setSelectedAddress(updated.data.addresses.find(a => a.isDefault) || updated.data.addresses[0]);
        setShowAddressForm(false);
        setNewAddress({ type: 'home', street: '', landmark: '', city: '', state: '', pincode: '', isDefault: false });
      } else setAddrError('Failed to add address');
    } catch (err) { setAddrError('Failed to add address'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + problemImages.length > 3) {
      setFormError('You can upload at most 3 images');
      e.target.value = '';
      return;
    }
    setFormError('');
    setProblemImages([...problemImages, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newImages = [...problemImages];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setProblemImages(newImages);
    setImagePreviews(newPreviews);
  };

  const pickDate = (ymd) => {
    setSelectedDate(ymd);
    if (!selectedSlot || slotPast(ymd, selectedSlot)) setSelectedSlot(firstFreeSlot(ymd));
  };

  const addRequest = (text) => setOrderNote((prev) => (prev.includes(text) ? prev : prev ? `${prev}. ${text}` : text));

  const handlePlaceOrder = async () => {
    setFormError('');
    if (!selectedAddress) { setFormError('Please select or add a delivery address'); return; }
    if (checkoutItems.length === 0) { setFormError('Your cart is empty'); return; }
    if (!selectedDate || !selectedSlot) { setFormError('Please choose a date and time slot'); return; }

    setProcessing(true);
    try {
      const firstItem = checkoutItems[0];
      const categoryId = firstItem.categoryId;
      const services = [{ service: firstItem.serviceId, quantity: firstItem.quantity, notes: orderNote || undefined }];
      const serviceAddress = {
        street: selectedAddress.street,
        landmark: selectedAddress.landmark || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        type: selectedAddress.type || 'home'
      };
      const payment = { method: 'cod', status: 'pending' };
      const scheduledTime = { start: selectedSlot };
      const scheduledDate = selectedDate;

      const formData = new FormData();
      formData.append('services', JSON.stringify(services));
      formData.append('scheduledDate', scheduledDate);
      formData.append('scheduledTime', JSON.stringify(scheduledTime));
      formData.append('serviceAddress', JSON.stringify(serviceAddress));
      formData.append('payment', JSON.stringify(payment));
      formData.append('notes', orderNote);
      formData.append('category', categoryId);
      formData.append('providerId', firstItem.providerId);
      formData.append('problemDescription', problemDescription);
      problemImages.forEach(img => formData.append('images', img));

      const bookingRes = await createBooking(formData);
      if (!bookingRes.success) {
        const errorMsg = bookingRes.errors ? bookingRes.errors.map(e => `${e.field}: ${e.message}`).join(', ') : bookingRes.message || 'Failed to create booking';
        throw new Error(errorMsg);
      }
      const bookingId = bookingRes.data.booking._id;
      if (!location.state?.directBooking) clearCart();
      navigate('/order-success', { state: { bookingId } });
    } catch (error) {
      console.error('Booking error:', error);
      setFormError(error.message || 'Failed to create booking. Please try again.');
    } finally { setProcessing(false); }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F8F9] flex items-center justify-center px-4" style={{ fontFamily: FONT_STACK }}>
        <div className="text-center">
          <div className="w-24 h-24 bg-[#EEF1F4] rounded-full flex items-center justify-center mx-auto mb-4"><ShoppingCart className="w-12 h-12 text-[#8A97A8]" aria-hidden="true" /></div>
          <h2 className="text-2xl font-extrabold text-[#0B2545] mb-2">No items to checkout</h2>
          <p className="text-[#5B6B7F] mb-6">Add services to your cart or use &quot;Book Now&quot;</p>
          <Link to="/" className="inline-flex items-center h-12 bg-[#0E7C86] text-white px-6 rounded-xl hover:bg-[#0B6A73] font-semibold">Browse Services</Link>
        </div>
      </div>
    );
  }

  const addressDone = !!selectedAddress;
  const scheduleDone = !!selectedDate && !!selectedSlot;
  const currentStep = !addressDone ? 0 : !scheduleDone ? 1 : 2;
  const steps = ['Address', 'Schedule', 'Payment', 'Confirmation'].map((label, i) => ({
    label, state: i < currentStep ? 'done' : i === currentStep ? 'current' : 'upcoming',
  }));
  const canConfirm = !processing && addressDone && scheduleDone;
  const dateLabel = (d) => ({
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    dm: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  });

  return (
    <div className="bg-[#F6F8F9] min-h-screen pb-32 lg:pb-12 text-[#0B2545]" style={{ fontFamily: FONT_STACK }}>
      <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6">
        {/* Header */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} aria-label="Go back" className={`w-10 h-10 -ml-2 grid place-items-center rounded-full ${FOCUS}`}><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-2xl font-extrabold">Checkout</h1>
          </div>
          <span className="text-sm text-[#5B6B7F]">Step {currentStep + 1} of 4</span>
        </div>
        <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-2 text-[13px] text-[#5B6B7F] mb-4">
          <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-1.5 hover:text-[#0E7C86] ${FOCUS} rounded`}><ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back</button>
          <span aria-hidden="true">/</span><Link to="/" className="hover:text-[#0E7C86]">Home</Link><span aria-hidden="true">/</span><span className="text-[#0B2545] font-medium">Checkout</span>
        </nav>
        <div className="mb-6"><Stepper steps={steps} /></div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 w-full space-y-5">
            {/* 1. Service details */}
            <Section id="service" number="1" title="Service Details" aside={<button type="button" onClick={() => navigate(-1)} className={`text-sm font-semibold text-[#0E7C86] hover:underline ${FOCUS} rounded`}>Change Service</button>}>
              <div className="space-y-4">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-[#EEF1F4] last:border-0 last:pb-0">
                    <div className="w-24 h-24 md:w-36 md:h-28 bg-[#F0F6F7] rounded-xl overflow-hidden shrink-0 grid place-items-center">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Shield className="w-8 h-8 text-[#B0BAC6]" aria-hidden="true" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base md:text-lg leading-snug">{item.name}</h3>
                      {item.providerName && <p className="text-sm text-[#5B6B7F] mt-0.5">by {item.providerName}</p>}
                      <p className="mt-2 text-xl md:text-2xl font-extrabold">₹{item.price}<span className="text-sm font-medium text-[#6B7A8D]"> / {item.priceUnit}</span></p>
                      <p className="text-sm text-[#5B6B7F] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* 2. Address */}
            <Section id="address" number="2" title="Service Address">
              {addresses.length === 0 && !showAddressForm && (
                <button onClick={() => setShowAddressForm(true)} className={`w-full h-14 border-2 border-dashed border-[#C9D3DC] rounded-xl text-[#0E7C86] font-semibold flex items-center justify-center gap-2 hover:bg-[#F0F6F7] ${FOCUS}`}><Plus className="w-4 h-4" aria-hidden="true" /> Add New Address</button>
              )}
              {!showAddressForm && addresses.length > 0 && (
                <div className="space-y-3" role="radiogroup" aria-label="Saved addresses">
                  {addresses.map(addr => {
                    const on = selectedAddress?._id === addr._id;
                    const Ic = addr.type === 'work' ? Building2 : addr.type === 'other' ? MapPin : Home;
                    return (
                      <label key={addr._id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${on ? 'border-[#0E7C86] bg-[#F0F9FA]' : 'border-[#DDE3E8] hover:border-[#0E7C86]/50'}`}>
                        <input type="radio" name="address" checked={on} onChange={() => setSelectedAddress(addr)} className="mt-1.5 accent-[#0E7C86] w-4 h-4" />
                        <span className="w-9 h-9 rounded-full bg-[#E3F5F1] grid place-items-center shrink-0"><Ic className="w-4 h-4 text-[#0E7C86]" aria-hidden="true" /></span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold capitalize">{addr.type === 'work' ? 'Office' : addr.type}</span>
                            {addr.isDefault && <span className="text-[11px] bg-[#EEF1F4] px-2 py-0.5 rounded-full font-medium">Default</span>}
                          </div>
                          <p className="text-[#5B6B7F] text-sm mt-1 leading-relaxed">{addr.street}, {addr.landmark ? addr.landmark + ', ' : ''}{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      </label>
                    );
                  })}
                  <button onClick={() => setShowAddressForm(true)} className={`w-full h-12 border border-[#DDE3E8] rounded-xl text-[#0E7C86] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F0F6F7] ${FOCUS}`}><Plus className="w-4 h-4" aria-hidden="true" /> Add New Address</button>
                </div>
              )}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="space-y-3">
                  <div className="flex gap-2" role="radiogroup" aria-label="Address type">
                    {ADDRESS_TYPES.map(([val, label, Ic]) => (
                      <button key={val} type="button" role="radio" aria-checked={newAddress.type === val} onClick={() => setNewAddress({ ...newAddress, type: val })}
                        className={`h-11 px-4 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 ${FOCUS} ${newAddress.type === val ? 'border-[#0E7C86] bg-[#E8F7F8] text-[#0B5F67]' : 'border-[#DDE3E8] text-[#3C4B5F]'}`}>
                        <Ic className="w-4 h-4" aria-hidden="true" />{label}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Street address" aria-label="Street address" required value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} className={FIELD} />
                  <input type="text" placeholder="Landmark (optional)" aria-label="Landmark" value={newAddress.landmark} onChange={e => setNewAddress({ ...newAddress, landmark: e.target.value })} className={FIELD} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="City" aria-label="City" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} className={FIELD} />
                    <input type="text" placeholder="State" aria-label="State" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} className={FIELD} />
                    <input type="text" inputMode="numeric" placeholder="Pincode" aria-label="Pincode" required pattern="[0-9]{6}" title="6-digit pincode" value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} className={FIELD} />
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#0E7C86] w-4 h-4" checked={newAddress.isDefault} onChange={e => setNewAddress({ ...newAddress, isDefault: e.target.checked })} /> Set as default address</label>
                  {addrError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{addrError}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowAddressForm(false)} className={`flex-1 h-12 border border-[#DDE3E8] rounded-xl font-semibold ${FOCUS}`}>Cancel</button>
                    <button type="submit" disabled={loading} className={`flex-1 h-12 bg-[#0E7C86] hover:bg-[#0B6A73] text-white rounded-xl font-semibold disabled:opacity-60 ${FOCUS}`}>{loading ? 'Saving...' : 'Save Address'}</button>
                  </div>
                </form>
              )}
            </Section>

            {/* 3. Date & time */}
            <Section id="schedule" number="3" title="Choose Date & Time">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="radiogroup" aria-label="Service date">
                {nextDays(7).map((d, i) => {
                  const ymd = toYMD(d); const on = ymd === selectedDate; const { day, dm } = dateLabel(d);
                  const full = !firstFreeSlot(ymd);
                  return (
                    <button key={ymd} type="button" role="radio" aria-checked={on} disabled={full} onClick={() => pickDate(ymd)}
                      className={`shrink-0 w-[84px] h-[74px] rounded-xl border text-center transition-colors disabled:opacity-40 ${FOCUS} ${on ? 'border-[#0E7C86] bg-[#E8F7F8]' : 'border-[#DDE3E8] bg-white hover:border-[#0E7C86]/50'}`}>
                      <span className="block text-xs text-[#5B6B7F]">{day}</span>
                      <span className="block text-sm font-bold">{dm}</span>
                      {i === 0 && <span className="block text-[10px] text-[#0E7C86] font-semibold">Today</span>}
                    </button>
                  );
                })}
                <label className={`relative shrink-0 w-[60px] h-[74px] rounded-xl border border-[#DDE3E8] bg-white grid place-items-center cursor-pointer hover:border-[#0E7C86]/50 focus-within:ring-2 focus-within:ring-[#0E7C86]`}>
                  <CalendarDays className="w-5 h-5" aria-hidden="true" />
                  <span className="sr-only">Pick another date</span>
                  <input type="date" min={toYMD(new Date())} max={toYMD(nextDays(61)[60])} value={selectedDate} onChange={(e) => e.target.value && pickDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Time slot">
                {SLOTS.map((s) => {
                  const past = slotPast(selectedDate, s.start); const on = selectedSlot === s.start && !past;
                  return (
                    <button key={s.start} type="button" role="radio" aria-checked={on} disabled={past} onClick={() => setSelectedSlot(s.start)}
                      className={`h-11 px-4 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-40 disabled:line-through ${FOCUS} ${on ? 'border-[#0E7C86] bg-[#E8F7F8] text-[#0B5F67]' : 'border-[#DDE3E8] bg-white hover:border-[#0E7C86]/50'}`}>
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* 4. Special instructions */}
            <Section id="notes" number="4" title="Special Instructions (Optional)">
              <textarea aria-label="Special instructions" placeholder="Add any special instructions for the professional..." value={orderNote} onChange={e => setOrderNote(e.target.value)} maxLength={500} rows={3} className="w-full p-4 bg-white border border-[#DDE3E8] rounded-xl text-base sm:text-sm placeholder:text-[#8A97A8] outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15" />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#5B6B7F]">Common requests:</span>
                {COMMON_REQUESTS.map((c) => (
                  <button key={c} type="button" onClick={() => addRequest(c)} className={`h-9 px-3.5 rounded-lg bg-[#F1F3F5] hover:bg-[#E8EDF1] text-[13px] font-medium ${FOCUS}`}>{c}</button>
                ))}
              </div>
            </Section>

            {/* 5. Problem description & photos */}
            <Section id="issue" number="5" title="Describe the Issue (Optional)">
              <textarea rows={3} aria-label="Describe the issue" value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} maxLength={1000}
                placeholder="E.g., Switch board not working, wire burnt, fan not rotating, etc."
                className="w-full p-4 bg-white border border-[#DDE3E8] rounded-xl text-base sm:text-sm placeholder:text-[#8A97A8] outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15" />
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Upload photos (max 3)</p>
                <div className="flex gap-3 flex-wrap">
                  {imagePreviews.map((src, idx) => (
                    <div key={src} className="relative w-20 h-20 rounded-xl border border-[#DDE3E8] overflow-hidden">
                      <img src={src} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(idx)} aria-label={`Remove photo ${idx + 1}`} className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-6 h-6 grid place-items-center"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  {imagePreviews.length < 3 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-[#C9D3DC] grid place-items-center text-[#5B6B7F] cursor-pointer hover:bg-[#F0F6F7] focus-within:ring-2 focus-within:ring-[#0E7C86]">
                      <span className="flex flex-col items-center gap-1 text-[11px] font-medium"><ImagePlus className="w-5 h-5" aria-hidden="true" />Add</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="sr-only" />
                    </label>
                  )}
                </div>
                <p className="text-xs text-[#6B7A8D] mt-2">Upload clear photos to help the provider quote accurately.</p>
              </div>
            </Section>
          </div>

          {/* RIGHT COLUMN */}
          <aside id="summary" className="w-full lg:w-[380px] shrink-0 space-y-5 lg:sticky lg:top-28 scroll-mt-24">
            <section className={CARD} aria-labelledby="sum-h">
              <h2 id="sum-h" className="text-lg font-extrabold mb-4">Order Summary</h2>
              <ul className="space-y-3 pb-4 border-b border-[#EEF1F4]">
                {checkoutItems.map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-[#F0F6F7] overflow-hidden shrink-0">{item.image && <img src={item.image} alt="" className="w-full h-full object-cover" loading="lazy" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-bold leading-snug line-clamp-2">{item.name}</p><p className="text-xs text-[#5B6B7F]">{item.quantity} × ₹{item.price}</p></div>
                    <p className="text-sm font-bold">₹{(item.price * item.quantity).toFixed(0)}</p>
                  </li>
                ))}
              </ul>
              <dl className="space-y-2.5 text-sm pt-4">
                <div className="flex justify-between"><dt className="text-[#5B6B7F]">Subtotal</dt><dd className="font-medium">₹{subtotal.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#5B6B7F]">Platform Fee</dt><dd className="font-medium">₹{platformFee.toFixed(2)}</dd></div>
                <div className="flex justify-between"><dt className="text-[#5B6B7F]">GST (18%)</dt><dd className="font-medium">₹{gst.toFixed(2)}</dd></div>
                <div className="flex justify-between pt-3 mt-1 border-t border-[#EEF1F4] text-lg font-extrabold"><dt>Total Amount</dt><dd>₹{total.toFixed(2)}</dd></div>
              </dl>
              <p className="mt-4 text-xs text-[#5B6B7F] bg-[#FFF8E6] border border-[#F6E3B0] p-3 rounded-lg">Payment is collected after the service is completed. The final price will be confirmed by the provider.</p>
            </section>

            <section className={CARD} aria-labelledby="pay-h">
              <h2 id="pay-h" className="text-lg font-extrabold mb-3">Payment Method</h2>
              <div className="flex items-center gap-3 rounded-xl border border-[#0E7C86] bg-[#F0F9FA] p-3.5">
                <span className="w-10 h-10 rounded-full bg-[#E3F5F1] grid place-items-center shrink-0"><Banknote className="w-5 h-5 text-[#0E7C86]" aria-hidden="true" /></span>
                <div className="flex-1"><p className="text-sm font-bold">Cash on Service</p><p className="text-xs text-[#5B6B7F]">Pay after the work is done</p></div>
                <Check className="w-5 h-5 text-[#0E7C86]" aria-label="Selected" />
              </div>
            </section>

            {formError && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{formError}</p>}

            <div className="hidden lg:block">
              <button onClick={handlePlaceOrder} disabled={!canConfirm} className={`w-full h-14 rounded-xl bg-[#12614F] hover:bg-[#0E7C86] text-white font-bold inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${FOCUS}`}>
                {processing ? <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Creating Booking...</> : 'Confirm Booking'}
              </button>
              <p className="mt-3 text-center text-xs text-[#5B6B7F] inline-flex w-full items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5" aria-hidden="true" /> No online payment required</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white border-t border-[#E3E8EC] px-4 pt-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}>
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <p className="text-2xl font-extrabold leading-none">₹{total.toFixed(0)}</p>
            <a href="#summary" className="text-xs font-semibold text-[#0E7C86] inline-flex items-center gap-0.5 mt-1">View Details <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /></a>
          </div>
          <button onClick={handlePlaceOrder} disabled={!canConfirm} className={`flex-1 h-12 rounded-xl bg-[#12614F] hover:bg-[#0E7C86] text-white font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 ${FOCUS}`}>
            {processing ? <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> Creating...</> : 'Confirm Booking'}
          </button>
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

export default CheckoutPage;