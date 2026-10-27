// src/components/Footer.jsx
import React, { useState, useEffect } from 'react';
import { fetchCategories, fetchServices } from '../services/api';

/* ---------- Partners (edit here) ----------
   logo: paste your logo image URL (PNG/SVG/WebP). Leave '' to show the small icon instead.
   href: link for the card. Leave '' for a card that is not clickable. */
const PARTNERS = [
  {
    name: 'AurixAI Software',
    role: 'Technology & Growth Partner',
    logo: 'https://res.cloudinary.com/djtvxmttf/image/upload/v1793099465/a8bc850f-0fec-44f2-a422-37d10d4d0ff4.png',
    href: 'https://aurixaisoftware.com',
    icon: 'code',
  },
  {
    name: 'Aurix Branding & Marketing',
    role: 'Press, Media & Marketing Partner',
    logo: '', // e.g. 'https://res.cloudinary.com/.../aurix-branding-logo.png'
    href: '',
    icon: 'megaphone',
  },
];

const PartnerIcon = ({ type }) => {
  if (type === 'megaphone') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 11 18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0E8F6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 7l-5 5 5 5" />
      <path d="M16 7l5 5-5 5" />
      <path d="M14 5l-4 14" />
    </svg>
  );
};

const PartnerCard = ({ partner }) => {
  const inner = (
    <>
      <span className={`shrink-0 grid place-items-center ${partner.logo ? 'w-24 h-16 sm:w-28 sm:h-20 md:w-36 md:h-24' : 'w-11 h-11'}`}>
        {partner.logo
          ? <img src={partner.logo} alt="" loading="lazy" decoding="async" className="max-w-full max-h-full object-contain" />
          : <PartnerIcon type={partner.icon} />}
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] md:text-lg font-medium text-gray-900 leading-snug">{partner.name}</span>
        <span className="block mt-0.5 text-sm text-slate-500">{partner.role}</span>
      </span>
    </>
  );
  const cls = 'flex items-center gap-4 rounded-xl bg-[#F7F8FC] px-4 py-4 md:px-5';
  return partner.href ? (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${partner.name}, ${partner.role}`}
      className={`${cls} hover:bg-[#EFF1F9] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2`}
    >
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
};

const Footer = () => {
  // ---- BACKEND / DATA LOGIC (unchanged) ----
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch categories and top services (limit to 20 for performance)
        const [catRes, svcRes] = await Promise.all([
          fetchCategories(),
          fetchServices(1, 30)
        ]);
        if (catRes.success) setCategories(catRes.data.categories);
        if (svcRes.success) setServices(svcRes.data.services);
      } catch (err) {
        console.error('Footer data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  // ---- END BACKEND / DATA LOGIC ----

  // UI-only state for the "Stay Updated" input (no API call)
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: connect to your newsletter API when ready
  };

  const linkCls = 'text-[15px] text-gray-500 hover:text-teal-700 transition-colors';
  const headCls = 'text-[15px] font-semibold text-gray-900 mb-4';

  return (
    <footer className="bg-white border-t border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr] gap-10 lg:gap-0">

          {/* BRAND */}
          <div className="lg:pr-8">
            <img
              src="https://res.cloudinary.com/djtvxmttf/image/upload/v1792058517/c84c65f3-b34d-403b-b309-ad21b1a71d70.png"
              alt="Puchhuu logo"
              className="h-14 md:h-16 mb-5"
            />
            <p className="text-[14px] leading-relaxed text-gray-500 max-w-[260px] mb-6">
              Your trusted partner for home, office, car and more. Professional services at your doorstep.
            </p>

            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="igGrad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0" stopColor="#feda75" />
                      <stop offset="0.35" stopColor="#fa7e1e" />
                      <stop offset="0.6" stopColor="#d62976" />
                      <stop offset="1" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#igGrad)" />
                  <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="16.4" cy="7.6" r="1" fill="#fff" />
                </svg>
              </a>
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="hover:opacity-80 transition-opacity">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#1877F2" />
                  <path d="M13.3 19v-6.2h2.1l.4-2.5h-2.5V8.7c0-.7.3-1.3 1.4-1.3h1.2V5.2c-.2 0-1-.1-1.8-.1-1.9 0-3.2 1.2-3.2 3.3v1.9H8.8v2.5h2.1V19h2.4z" fill="#fff" />
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="hover:opacity-80 transition-opacity">
                <svg width="30" height="26" viewBox="0 0 28 20">
                  <rect width="28" height="20" rx="5.5" fill="#FF0000" />
                  <path d="M11.2 6.2v7.6L18 10z" fill="#fff" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" aria-label="LinkedIn" className="hover:opacity-80 transition-opacity">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <rect width="24" height="24" rx="5" fill="#0A66C2" />
                  <rect x="5" y="9.5" width="2.6" height="8.5" fill="#fff" />
                  <circle cx="6.3" cy="6.5" r="1.5" fill="#fff" />
                  <path d="M10 9.5h2.5v1.2c.5-.9 1.5-1.4 2.7-1.4 2.3 0 3 1.5 3 3.6V18h-2.6v-4.4c0-1-.2-1.9-1.4-1.9s-1.6.9-1.6 1.9V18H10V9.5z" fill="#fff" />
                </svg>
              </a>
            </div>
          </div>

          {/* COMPANY */}
          <div className="lg:px-8 lg:border-l lg:border-gray-100">
            <h4 className={headCls}>Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className={linkCls}>About Us</a></li>
              <li><a href="/services" className={linkCls}>Our Services</a></li>
              <li><a href="#" className={linkCls}>Blog</a></li>
              <li><a href="mailto:careers@puchhuu.com" className={linkCls}>Careers</a></li>
              <li><a href="/register-provider" className={linkCls}>Become a Partner</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div className="lg:px-8 lg:border-l lg:border-gray-100">
            <h4 className={headCls}>Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className={linkCls}>Help Center</a></li>
              <li><a href="mailto:help@puchhuu.com" className={linkCls}>Contact Us</a></li>
              <li><a href="#" className={linkCls}>Terms &amp; Conditions</a></li>
              <li><a href="#" className={linkCls}>Privacy Policy</a></li>
              <li><a href="#" className={linkCls}>Refund Policy</a></li>
            </ul>
          </div>

          {/* DOWNLOAD APP */}
          <div className="lg:px-8 lg:border-l lg:border-gray-100">
            <h4 className={headCls}>Download App</h4>
            <div className="flex flex-col gap-3">
              {/* Google Play */}
              <a
                href="#"
                aria-label="Get it on Google Play"
                className="flex items-center gap-3 bg-black text-white rounded-lg px-4 py-2 w-[150px] hover:bg-gray-900 transition-colors"
              >
                <svg width="22" height="24" viewBox="0 0 22 24">
                  <path d="M1 1.2c-.3.3-.5.8-.5 1.4v18.8c0 .6.2 1.1.5 1.4l.1.1L11.6 12.4v-.2L1.1 1.1 1 1.2z" fill="#00d2ff" />
                  <path d="M15.1 15.9l-3.5-3.5v-.2l3.5-3.5.1.1 4.2 2.4c1.2.7 1.2 1.800 0 2.500l-4.200 2.400-.1-.2z" fill="#ffd500" />
                  <path d="M15.200 15.800L11.600 12.300 1 22.900c.4.4 1 .4 1.700.1l12.500-7.200" fill="#ff3a44" />
                  <path d="M15.200 8.800L2.700 1.600C2 1.200 1.400 1.300 1 1.700l10.600 10.600 3.600-3.500z" fill="#00f076" />
                </svg>
                <span className="leading-tight">
                  <span className="block text-[8px] uppercase tracking-wide">Get it on</span>
                  <span className="block text-[15px] font-semibold">Google Play</span>
                </span>
              </a>
              {/* App Store */}
              <a
                href="#"
                aria-label="Download on the App Store"
                className="flex items-center gap-3 bg-black text-white rounded-lg px-4 py-2 w-[150px] hover:bg-gray-900 transition-colors"
              >
                <svg width="22" height="24" viewBox="0 0 24 24" fill="#fff">
                  <path d="M16.400 12.700c0-2.400 2-3.500 2.100-3.600-1.100-1.700-2.900-1.900-3.500-1.900-1.500-.2-2.900.9-3.700.9-.8 0-1.900-.9-3.200-.8-1.600 0-3.100 1-4 2.400-1.700 3-.4 7.300 1.200 9.700.8 1.200 1.800 2.500 3 2.400 1.200 0 1.700-.8 3.100-.8 1.500 0 1.900.8 3.200.8 1.300 0 2.200-1.200 3-2.300.9-1.300 1.300-2.600 1.300-2.700-.1 0-2.500-1-2.500-3.900zM14 5.600c.7-.8 1.100-1.900 1-3-1 0-2.100.6-2.800 1.400-.6.700-1.200 1.800-1 2.900 1.100.1 2.100-.5 2.800-1.300z" />
                </svg>
                <span className="leading-tight">
                  <span className="block text-[8px]">Download on the</span>
                  <span className="block text-[15px] font-semibold">App Store</span>
                </span>
              </a>
            </div>
          </div>

          {/* STAY UPDATED */}
          <div className="lg:pl-8 lg:border-l lg:border-gray-100 sm:col-span-2 lg:col-span-1">
            <h4 className={headCls}>Stay Updated</h4>
            <p className="text-[15px] text-gray-500 mb-4">Get latest offers and updates.</p>
            <form onSubmit={handleSubscribe} className="flex items-stretch border border-gray-200 rounded-lg overflow-hidden max-w-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="flex-1 min-w-0 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-gray-50"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 flex items-center justify-center transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* TECHNOLOGY & GROWTH PARTNERS */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h5 className="mb-3 text-xs md:text-[13px] font-medium uppercase tracking-wide text-slate-500">
            Our Technology &amp; Growth Partners
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {PARTNERS.map((p) => <PartnerCard key={p.name} partner={p} />)}
          </div>
        </div>

        {/* COPYRIGHT */}
        <p className="mt-8 text-sm text-gray-500 text-center sm:text-left">
          Puchhuu © {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;