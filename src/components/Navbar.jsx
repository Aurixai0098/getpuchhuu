// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Droplets, Home as HomeIcon, Wind, Sparkles, Wrench, Zap, PaintRoller, CarFront, Flower2, Bug, Hammer, Sofa, Scissors, Grid2x2, MoreHorizontal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchCategories, fetchServices, searchServices } from '../services/api';
import NotificationBell from './NotificationBell';
import ProviderLocationModal from '../pages/provider/ProviderLocationModal';
import Login from './auth/Login';

/* ---------- Presentation-only helpers (no behaviour) ---------- */
const P = {
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  pin: ['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z'],
  chevDown: 'M19 9l-7 7-7-7',
  chevRight: 'M9 5l7 7-7 7',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  cart: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M18 13l1.5 6M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z',
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  dashboard: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  gear: ['M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'],
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  close: 'M6 18L18 6M6 6l12 12',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  check: 'M5 13l4 4L19 7',
};

const Icon = ({ d, className = 'w-5 h-5', sw = 1.8 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    {(Array.isArray(d) ? d : [d]).map((p, i) => (
      <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={sw} d={p} />
    ))}
  </svg>
);

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86]/50 focus-visible:ring-offset-1';
const ICON_BTN = `relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#DDE3E8] bg-white text-[#0B2545] hover:border-[#0E7C86]/50 hover:text-[#0E7C86] hover:bg-[#F6F8F9] transition-colors ${FOCUS}`;
const MENU_ITEM = `flex items-center gap-3 px-4 py-2.5 text-sm text-[#2B3A4F] hover:bg-[#F0F6F7] hover:text-[#0B2545] transition-colors ${FOCUS}`;
const DRAWER_ITEM = `w-full flex items-center gap-3 px-3 py-3 text-[#2B3A4F] hover:bg-[#F0F6F7] hover:text-[#0B2545] rounded-lg transition-colors font-medium text-left min-h-[44px] ${FOCUS}`;


/* ---------- UI-only: category icon fallback, offers icon ---------- */
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

const OffersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5l8-3z" fill="#E11D2E" />
    <circle cx="12" cy="11" r="3" fill="#fff" />
  </svg>
);

const TOP_LINK = `inline-flex items-center gap-1.5 h-10 px-1.5 text-[13px] font-semibold text-[#0B2545] hover:text-[#0E7C86] rounded-md transition-colors ${FOCUS}`;

const Navbar = () => {
  const { user, logout, setShowAuth, showAuth } = useAuth();
  const { cartCount } = useCart();
  const [authPanel, setAuthPanel] = useState('signin');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [allServices, setAllServices] = useState([]); // for rotating placeholder

  // Rotating placeholder state
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [rotatingPlaceholder, setRotatingPlaceholder] = useState('Search for services...');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ categories: [], services: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Location & map states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [isAddressSearching, setIsAddressSearching] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [mapLat, setMapLat] = useState(28.6139);
  const [mapLng, setMapLng] = useState(77.2090);
  const [showMap, setShowMap] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [isLogoRotating, setIsLogoRotating] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // UI-only: "More" categories panel + active link highlight
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onDown = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMoreOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [moreOpen]);

  const openAuthModal = (panel) => {
    setAuthPanel(panel);
    setShowAuth(true);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  // Load categories + services (for rotating placeholder)
  useEffect(() => {
    const loadData = async () => {
      setCategoriesLoading(true);
      try {
        const [catRes, servicesRes] = await Promise.all([
          fetchCategories(),
          fetchServices(1, 100)
        ]);
        if (catRes.success && catRes.data.categories) {
          setCategories(catRes.data.categories.filter(cat => cat.isActive));
        }
        if (servicesRes.success && servicesRes.data.services) {
          setAllServices(servicesRes.data.services);
        }
      } catch (err) {
        console.error('Failed to load data for navbar:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadData();
  }, []);

  // Rotating placeholder: keep one interval per data update, not one per tick.
  useEffect(() => {
    const names = [
      ...categories.map((category) => category?.name),
      ...allServices.map((service) => service?.name),
    ].filter((name) => typeof name === 'string' && name.trim());

    if (names.length === 0) return undefined;

    const interval = window.setInterval(() => {
      setPlaceholderIndex((previousIndex) => {
        const nextIndex = names.length > 1
          ? (previousIndex + 1 + Math.floor(Math.random() * (names.length - 1))) % names.length
          : 0;
        setRotatingPlaceholder(`Search for ${names[nextIndex]}...`);
        return nextIndex;
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [categories, allServices]);

  // Search effect (categories + services)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const query = searchQuery.trim().toLowerCase();
      if (query.length === 0) {
        setSearchResults({ categories: [], services: [] });
        setShowSearchDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const matchedCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(query)
      );

      let matchedServices = [];
      try {
        const res = await searchServices(searchQuery);
        if (res.success && res.services) matchedServices = res.services;
      } catch (err) { console.error('Search error:', err); }

      setSearchResults({ categories: matchedCategories, services: matchedServices });
      setShowSearchDropdown(true);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, categories]);

  // Close search when the pointer is outside whichever search UI is currently mounted.
  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;
      const insideDesktopSearch = searchRef.current?.contains(target) ?? false;
      const insideMobileSearch = mobileSearchRef.current?.contains(target) ?? false;
      if (!insideDesktopSearch && !insideMobileSearch) {
        setShowSearchDropdown(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Leaflet map initialization
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;
    if (!window.L) {
      const timer = setTimeout(() => {
        if (window.L && mapContainerRef.current && showMap) initOrUpdateMap();
      }, 200);
      return () => clearTimeout(timer);
    }
    initOrUpdateMap();
  }, [showMap, mapLat, mapLng]);

  const initOrUpdateMap = () => {
    if (!mapContainerRef.current || !window.L) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapLat, mapLng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([mapLat, mapLng]);
      } else {
        markerRef.current = window.L.marker([mapLat, mapLng], { draggable: true }).addTo(mapInstanceRef.current);
        markerRef.current.on('dragend', async () => {
          const newLatLng = markerRef.current.getLatLng();
          setMapLat(newLatLng.lat);
          setMapLng(newLatLng.lng);
          setCurrentCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
          const address = await reverseGeocodeWithBigDataCloud(newLatLng.lat, newLatLng.lng);
          if (address) setLocation(address);
        });
      }
      mapInstanceRef.current.invalidateSize();
      return;
    }
    const map = window.L.map(mapContainerRef.current).setView([mapLat, mapLng], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const marker = window.L.marker([mapLat, mapLng], { draggable: true }).addTo(map);
    marker.on('dragend', async () => {
      const newLatLng = marker.getLatLng();
      setMapLat(newLatLng.lat);
      setMapLng(newLatLng.lng);
      setCurrentCoords({ lat: newLatLng.lat, lng: newLatLng.lng });
      const address = await reverseGeocodeWithBigDataCloud(newLatLng.lat, newLatLng.lng);
      if (address) setLocation(address);
    });
    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  const reverseGeocodeWithBigDataCloud = async (lat, lng) => {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.locality) {
        let address = data.locality || data.city || data.principalSubdivision || '';
        if (data.principalSubdivision && !address.includes(data.principalSubdivision)) address += `, ${data.principalSubdivision}`;
        return address;
      }
      return null;
    } catch (err) { return null; }
  };

  const forwardGeocode = async (address) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'GharSevaApp/1.0' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
      }
      return null;
    } catch (err) { return null; }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setMapLat(latitude);
        setMapLng(longitude);
        setCurrentCoords({ lat: latitude, lng: longitude });
        setShowMap(true);
        const address = await reverseGeocodeWithBigDataCloud(latitude, longitude);
        if (address) {
          setLocation(address);
          localStorage.setItem('userLocation', address);
          showSuccessMessage(`📍 Location set to ${address}`);
        } else {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          showSuccessMessage(`📍 Location set successfully`);
        }
        localStorage.setItem('userCoords', JSON.stringify({ lat: latitude, lng: longitude }));
        setIsLocating(false);
        setTimeout(() => setShowLocationPopup(false), 1500);
      },
      (error) => {
        console.error(error);
        alert('Location access denied or failed');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const searchAddressAndShowMap = async () => {
    if (!searchAddress.trim()) return;
    setIsAddressSearching(true);
    const result = await forwardGeocode(searchAddress);
    if (result) {
      setMapLat(result.lat);
      setMapLng(result.lng);
      setCurrentCoords({ lat: result.lat, lng: result.lng });
      setShowMap(true);
      const shortName = result.display.split(',')[0];
      setLocation(shortName);
    } else {
      alert('Address not found. Try adding city/state name.');
    }
    setIsAddressSearching(false);
  };

  const confirmMapLocation = () => {
    if (currentCoords || location) {
      if (location) {
        localStorage.setItem('userLocation', location);
        showSuccessMessage(`📍 Location set to ${location}`);
      }
      if (currentCoords) {
        localStorage.setItem('userCoords', JSON.stringify(currentCoords));
      }
      setTimeout(() => setShowLocationPopup(false), 1500);
    } else {
      alert('Please select a location first');
    }
  };

  const saveCustomLocation = () => {
    if (customLocation.trim()) {
      setLocation(customLocation);
      localStorage.setItem('userLocation', customLocation);
      setCurrentCoords(null);
      localStorage.removeItem('userCoords');
      setShowMap(false);
      setCustomLocation('');
      showSuccessMessage(`📍 Location set to ${customLocation}`);
      setTimeout(() => setShowLocationPopup(false), 1500);
    }
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) setLocation(savedLocation);
    const savedCoords = localStorage.getItem('userCoords');
    if (savedCoords) {
      try {
        const parsedCoords = JSON.parse(savedCoords);
        if (
          parsedCoords &&
          Number.isFinite(parsedCoords.lat) &&
          Number.isFinite(parsedCoords.lng) &&
          parsedCoords.lat >= -90 && parsedCoords.lat <= 90 &&
          parsedCoords.lng >= -180 && parsedCoords.lng <= 180
        ) {
          setCurrentCoords({ lat: parsedCoords.lat, lng: parsedCoords.lng });
        } else {
          localStorage.removeItem('userCoords');
        }
      } catch {
        localStorage.removeItem('userCoords');
      }
    }
  }, []);

  const handleLogoRotate = () => {
    setIsLogoRotating(true);
    setTimeout(() => setIsLogoRotating(false), 600);
  };

  /* ---------- Shared search-results panel (desktop + mobile), same links/handlers as before ---------- */
  const hasResults = searchResults.categories.length > 0 || searchResults.services.length > 0;

  const renderSearchResults = (compact, closeMobile) => (
    <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(11,37,69,0.25)] border border-[#DDE3E8] overflow-y-auto z-50 ${compact ? 'max-h-80' : 'max-h-96'}`}>
      {searchResults.categories.length > 0 && (
        <>
          <div className="px-4 py-2 bg-[#F6F8F9] text-xs font-semibold text-[#5B6B7F] sticky top-0 border-b border-[#EEF1F4]">Categories</div>
          {searchResults.categories.map(cat => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); if (closeMobile) setMobileSearchOpen(false); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F0F6F7] transition-colors border-b border-[#EEF1F4] last:border-0"
            >
              <div className={`${compact ? 'w-9 h-9' : 'w-10 h-10'} rounded-lg overflow-hidden bg-[#F0F6F7] flex items-center justify-center shrink-0`}>
                {cat.icon?.url ? <img src={cat.icon.url} alt={cat.name} className="w-full h-full object-contain p-2" /> : <Icon d={P.bolt} className="w-5 h-5 text-[#8A97A8]" />}
              </div>
              <div className="flex-1 min-w-0"><p className="font-medium text-[#0B2545] text-sm truncate">{cat.name}</p><p className="text-xs text-[#6B7A8D]">Category</p></div>
            </Link>
          ))}
        </>
      )}
      {searchResults.services.length > 0 && (
        <>
          <div className="px-4 py-2 bg-[#F6F8F9] text-xs font-semibold text-[#5B6B7F] sticky top-0 border-b border-[#EEF1F4]">Services</div>
          {searchResults.services.map(service => (
            <Link
              key={service._id}
              to={`/service/${service.slug}`}
              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); if (closeMobile) setMobileSearchOpen(false); }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F0F6F7] transition-colors border-b border-[#EEF1F4] last:border-0"
            >
              <div className={`${compact ? 'w-10 h-10' : 'w-10 h-10'} rounded-lg overflow-hidden bg-[#F0F6F7] flex-shrink-0`}>
                {service.images?.[0]?.url ? <img src={service.images[0].url} alt={service.name} className="w-full h-full object-cover" /> : service.icon?.url ? <img src={service.icon.url} alt={service.name} className="w-full h-full object-contain p-2" /> : <span className="w-full h-full flex items-center justify-center"><Icon d={P.bolt} className="w-5 h-5 text-[#8A97A8]" /></span>}
              </div>
              <div className="flex-1 min-w-0"><p className="font-medium text-[#0B2545] text-sm truncate">{service.name}</p><p className="text-xs text-[#6B7A8D]">{service.category?.name || 'Service'}</p></div>
              <div className="text-right shrink-0"><p className="text-sm font-semibold text-[#0E7C86]">₹{service.basePrice}</p></div>
            </Link>
          ))}
        </>
      )}
    </div>
  );

  const Avatar = ({ size }) => (
    <div className={`${size} rounded-full overflow-hidden bg-[#0E7C86] flex items-center justify-center shrink-0`}>
      {user?.avatar?.url ? (
        <img src={user.avatar.url} alt={user.name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-white">{getInitials(user?.name || user?.email)}</span>
      )}
    </div>
  );

  return (
    <>
      <nav
        className="bg-white/95 backdrop-blur-md text-[#0B2545] border-b border-[#E3E8EC] font-sans sticky top-0 z-[1000] shadow-[0_8px_24px_-18px_rgba(11,37,69,0.3)]"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-6 py-2 lg:py-0">
          {/* ========== DESKTOP VIEW ========== */}
          {!isMobileView && (
            <div className="flex items-center gap-5 xl:gap-7 h-[76px]">
              {/* Logo */}
              <Link
                to="/"
                className={`flex items-center shrink-0 no-underline rounded-lg ${FOCUS}`}
                onMouseEnter={handleLogoRotate}
                onClick={handleLogoRotate}
              >
                <img
                  src="https://res.cloudinary.com/djtvxmttf/image/upload/v1792058119/ccb32c09-3568-477a-b5c3-11edba5176a0.png"
                  alt="puchhuu logo "
                  className={`h-12 xl:h-14 w-auto object-contain transition-transform duration-500 ${isLogoRotating ? 'scale-105' : 'scale-100'}`}
                />
              </Link>

              {/* Location Selector */}
              <button
                onClick={() => setShowLocationPopup(true)}
                aria-label="Select location"
                className={`flex items-center gap-2 h-11 bg-white border border-[#E3E8EC] hover:border-[#0E7C86]/50 rounded-xl px-3.5 transition-colors max-w-[210px] xl:max-w-[240px] shrink-0 ${FOCUS}`}
              >
                <Icon d={P.pin} className="w-[18px] h-[18px] text-[#0B2545] shrink-0" />
                <span className="text-sm font-semibold text-[#0B2545] truncate">{location || 'Select Location'}</span>
                <Icon d={P.chevDown} className="w-4 h-4 text-[#0B2545] shrink-0" sw={2.4} />
              </button>

              {/* Search Bar with rotating placeholder */}
              <div className="flex-1 max-w-[560px] relative" ref={searchRef}>
                <div className="relative">
                  <Icon d={P.search} className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#3C4B5F] pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => (searchResults.categories.length > 0 || searchResults.services.length > 0) && setShowSearchDropdown(true)}
                    placeholder={rotatingPlaceholder}
                    aria-label="Search services and categories"
                    className="w-full pl-11 pr-11 h-11 bg-[#F1F3F5] hover:bg-[#ECEFF2] focus:bg-white border border-transparent rounded-full text-sm text-[#0B2545] placeholder:text-[#8A97A8] outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15 transition-colors"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-[#0E7C86] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {showSearchDropdown && hasResults && renderSearchResults(false, false)}
              </div>

              {/* Right side: Offers, Become a Partner, Help, Cart, Auth */}
              <div className="ml-auto flex items-center gap-1 xl:gap-2.5 shrink-0">
                <Link to="/offers" className={TOP_LINK}><OffersIcon />Offers</Link>
                {user?.role !== 'provider' && user?.role !== 'admin' && (
                  <Link to="/register-provider" className={TOP_LINK}>Become a Partner</Link>
                )}
                <Link to="/help" className={TOP_LINK}>Help</Link>
                <Link to="/cart" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} className={`relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#0B2545] hover:text-[#0E7C86] hover:bg-[#F0F6F7] transition-colors ${FOCUS}`}>
                  <Icon d={P.cart} />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#0E7C86] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ring-2 ring-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
                {user && <NotificationBell />}
                <div className="ml-1">
                {user ? (
                  <div className="relative group">
                    <button className={`flex items-center gap-2 h-10 bg-white hover:bg-[#F6F8F9] border border-[#DDE3E8] hover:border-[#0E7C86]/50 pl-1.5 pr-2.5 rounded-xl transition-colors ${FOCUS}`} aria-haspopup="menu">
                      <Avatar size="w-7 h-7" />
                      <span className="text-sm font-medium text-[#0B2545] max-w-[80px] truncate">{user.name || user.email?.split('@')[0]}</span>
                      <Icon d={P.chevDown} className="w-4 h-4 text-[#8A97A8]" sw={2} />
                    </button>
                    <div className="absolute right-0 pt-2 w-64 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150">
                      <div className="bg-white border border-[#DDE3E8] rounded-xl shadow-[0_20px_44px_-14px_rgba(11,37,69,0.3)] overflow-hidden">
                        <div className="flex justify-center flex-col items-center p-4 border-b border-[#EEF1F4] bg-[#F6F8F9]">
                          <div className="text-xs text-[#5B6B7F] flex flex-col items-center gap-1.5">
                            <span className="w-16 h-16 rounded-full overflow-hidden bg-[#0E7C86] flex items-center justify-center">
                              {user.avatar?.url ? (
                                <img src={user.avatar?.url} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-lg font-bold text-white">{getInitials(user.name || user.email)}</span>
                              )}
                            </span>
                            <span className="text-sm font-semibold text-[#0B2545]">{user?.fullName}</span>
                            <span className="max-w-full truncate">{user.email}</span>
                          </div>
                          {user.role === 'provider' && (
                            <span className="inline-block mt-2 text-[10px] bg-[#0E7C86]/10 text-[#0B5F67] px-2 py-0.5 rounded-md font-semibold">Service Professional</span>
                          )}
                          {user.role === 'admin' && (
                            <span className="inline-block mt-2 text-[10px] bg-[#0B2545] text-white px-2 py-0.5 rounded-md font-semibold">Administrator</span>
                          )}
                        </div>
                        <div className="py-1.5">
                          <Link to="/profile" className={MENU_ITEM}><Icon d={P.user} className="w-4 h-4 text-[#5B6B7F]" />My Profile</Link>
                          <Link to="/my-bookings" className={MENU_ITEM}><Icon d={P.calendar} className="w-4 h-4 text-[#5B6B7F]" />My Bookings</Link>
                          {user.role === 'provider' && (
                            <>
                              <Link to="/provider" className={MENU_ITEM}><Icon d={P.dashboard} className="w-4 h-4 text-[#5B6B7F]" />Dashboard</Link>
                              <Link to="/provider/bookings" className={MENU_ITEM}><Icon d={P.calendar} className="w-4 h-4 text-[#5B6B7F]" />Manage Bookings</Link>
                              <Link to="/provider/services" className={MENU_ITEM}><Icon d={P.bolt} className="w-4 h-4 text-[#5B6B7F]" />My Services</Link>
                              <button onClick={() => setShowLocationModal(true)} className={`${MENU_ITEM} w-full text-left`}><Icon d={P.pin[0]} className="w-4 h-4 text-[#5B6B7F]" />Service Area</button>
                            </>
                          )}
                          {user.role === 'admin' && (
                            <Link to="/admin" className={`${MENU_ITEM} font-medium`}><Icon d={P.gear} className="w-4 h-4 text-[#0E7C86]" />Admin Panel</Link>
                          )}
                        </div>
                        <div className="border-t border-[#EEF1F4] p-1.5">
                          <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium ${FOCUS}`}>
                            <Icon d={P.logout} className="w-4 h-4" />Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => openAuthModal('signin')} className={`h-11 px-6 rounded-xl bg-[#12414B] hover:bg-[#0B2F37] text-white text-sm font-semibold transition-colors shadow-sm ${FOCUS}`}>Login / Sign Up</button>
                )}
                </div>
              </div>
            </div>
          )}

          {/* ========== MOBILE VIEW ========== */}
          {isMobileView && (
            <div className="flex flex-col gap-2">
              {/* Top Bar: Logo | Search, Location, Notification, Avatar/Hamburger */}
              <div className="flex items-center justify-between gap-2">
                <Link to="/" className={`flex shrink-0 items-center no-underline rounded-lg min-w-0 ${FOCUS}`} onClick={handleLogoRotate}>
                  <img
                    src="https://res.cloudinary.com/djtvxmttf/image/upload/v1792058517/c84c65f3-b34d-403b-b309-ad21b1a71d70.png"
                    alt="puchhuu logo"
                    className="h-10 sm:h-12 w-auto max-w-[40vw] object-contain"
                  />
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Search Icon */}
                  <button onClick={() => setMobileSearchOpen(!mobileSearchOpen)} aria-label="Search" aria-expanded={mobileSearchOpen} className={ICON_BTN}>
                    <Icon d={P.search} />
                  </button>

                  {/* Location Icon */}
                  <button onClick={() => setShowLocationPopup(true)} aria-label="Select location" className={ICON_BTN}>
                    <Icon d={P.pin} className="w-5 h-5 text-[#0E7C86]" />
                  </button>

                  {/* Notification Bell (only when logged in) */}
                  {user && <NotificationBell />}
                  {!user && <div className="w-9 h-9" /> /* placeholder to keep layout stable */}

                  {/* Menu button – Avatar when logged in, Hamburger when logged out */}
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="Open menu"
                    className={`flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-[#0B2545] shadow-sm active:scale-95 transition-all ${FOCUS}`}
                  >
                    {user ? (
                      user.avatar?.url ? (
                        <img src={user.avatar.url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {getInitials(user.name || user.email)}
                        </span>
                      )
                    ) : (
                      <Icon d={P.menu} className="w-5 h-5 text-white" sw={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Search Input (collapsible) */}
              {mobileSearchOpen && (
                <div className="relative w-full animate-fadeIn" ref={mobileSearchRef}>
                  <div className="relative">
                    <Icon d={P.search} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A8D]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => (searchResults.categories.length > 0 || searchResults.services.length > 0) && setShowSearchDropdown(true)}
                      placeholder={rotatingPlaceholder}
                      aria-label="Search services and categories"
                      className="w-full pl-10 pr-12 h-11 bg-white border border-[#DDE3E8] rounded-xl text-base sm:text-sm text-[#0B2545] placeholder:text-[#8A97A8] outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15 transition-all"
                      autoFocus
                    />
                    {isSearching && (
                      <div className="absolute right-12 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-[#0E7C86] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <button
                      onClick={() => setMobileSearchOpen(false)}
                      aria-label="Close search"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#6B7A8D] hover:text-[#0B2545] rounded-md"
                    >
                      <Icon d={P.close} className="w-4 h-4" sw={2} />
                    </button>
                  </div>
                  {showSearchDropdown && hasResults && renderSearchResults(true, true)}
                </div>
              )}
            </div>
          )}

          {/* Categories Row (desktop) */}
          {!isMobileView && (
            <div className="border-t border-[#EEF1F4] flex items-center gap-6 xl:gap-8">
              <Link to="/" aria-current={pathname === '/' ? 'page' : undefined} className={`relative shrink-0 flex items-center gap-2 h-12 text-[13.5px] whitespace-nowrap rounded-md transition-colors ${pathname === '/' ? 'text-[#0B2545] font-semibold' : 'text-[#3C4B5F] hover:text-[#0E7C86] font-medium'} ${FOCUS}`}>
                <HomeIcon className="w-[18px] h-[18px]" aria-hidden="true" />Home
                <span className={`absolute left-0 right-0 bottom-0 h-[3px] rounded-full bg-[#0E7C86] transition-transform duration-200 origin-left ${pathname === '/' ? 'scale-x-100' : 'scale-x-0'}`} />
              </Link>
              {categoriesLoading ? (
                [...Array(6)].map((_, i) => <div key={i} className="h-4 w-24 bg-[#E8EDF1] rounded animate-pulse"></div>)
              ) : (
                categories.slice(0, 8).map((cat, i) => {
                  const CatIcon = iconForCategory(cat.name);
                  const active = pathname === `/category/${cat.slug}`;
                  return (
                    <Link key={cat._id} to={`/category/${cat.slug}`} aria-current={active ? 'page' : undefined} className={`${i >= 5 ? 'hidden xl:flex' : 'flex'} relative shrink-0 items-center gap-2 h-12 text-[13.5px] whitespace-nowrap rounded-md transition-colors ${active ? 'text-[#0B2545] font-semibold' : 'text-[#3C4B5F] hover:text-[#0E7C86] font-medium'} ${FOCUS}`}>
                      {cat.icon?.url ? <img src={cat.icon.url} alt="" className="w-[18px] h-[18px] object-contain" /> : <CatIcon className="w-[18px] h-[18px]" aria-hidden="true" />}
                      {cat.name}
                      <span className={`absolute left-0 right-0 bottom-0 h-[3px] rounded-full bg-[#0E7C86] transition-transform duration-200 origin-left ${active ? 'scale-x-100' : 'scale-x-0'}`} />
                    </Link>
                  );
                })
              )}
              {categories.length > 5 && (
                <div ref={moreRef} className={`relative ml-auto pl-6 border-l border-[#EEF1F4] ${categories.length > 8 ? '' : 'xl:hidden'}`}>
                  <button type="button" onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-haspopup="true" className={`flex items-center gap-2 h-12 text-[13.5px] font-medium text-[#3C4B5F] hover:text-[#0E7C86] rounded-md ${FOCUS}`}>
                    <MoreHorizontal className="w-[18px] h-[18px]" aria-hidden="true" />More
                  </button>
                  {moreOpen && (
                    <div className="absolute right-0 top-full mt-1 w-[520px] max-w-[90vw] bg-white rounded-2xl border border-[#DDE3E8] shadow-[0_22px_50px_-16px_rgba(11,37,69,0.35)] p-3 z-50 animate-fadeIn">
                      <ul className="grid grid-cols-2 gap-1 max-h-[60vh] overflow-y-auto">
                        {categories.slice(5).map((cat, i) => {
                          const CatIcon = iconForCategory(cat.name);
                          return (
                            <li key={cat._id} className={i < 3 ? 'xl:hidden' : ''}>
                              <Link to={`/category/${cat.slug}`} onClick={() => setMoreOpen(false)} className={`flex items-center gap-3 px-3 h-12 rounded-xl text-sm text-[#2B3A4F] hover:bg-[#F0F6F7] hover:text-[#0B2545] ${FOCUS}`}>
                                <span className="w-9 h-9 rounded-lg bg-[#F0F6F7] flex items-center justify-center shrink-0">
                                  {cat.icon?.url ? <img src={cat.icon.url} alt="" className="w-5 h-5 object-contain" /> : <CatIcon className="w-[18px] h-[18px] text-[#0E7C86]" aria-hidden="true" />}
                                </span>
                                <span className="truncate">{cat.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Categories Row (mobile: unchanged chips) */}
          {isMobileView && (
          <div className="mt-2.5 pt-2.5 border-t border-[#EEF1F4] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categoriesLoading ? (
              <div className="flex gap-2">{[...Array(6)].map((_, i) => <div key={i} className="h-8 w-24 bg-[#E8EDF1] rounded-lg animate-pulse"></div>)}</div>
            ) : categories.length > 0 ? (
              categories.map(cat => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className={`shrink-0 flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#DDE3E8] bg-white text-[#2B3A4F] hover:text-[#0B2545] hover:border-[#0E7C86]/60 hover:bg-[#F0F6F7] text-[13px] font-medium transition-colors whitespace-nowrap ${FOCUS}`}>
                  {cat.icon?.url ? <img src={cat.icon.url} alt={cat.name} className="w-4 h-4 object-contain" /> : <Icon d={P.bolt} className="w-4 h-4 text-[#0E7C86]" />}
                  {cat.name}
                </Link>
              ))
            ) : (
              <div className="text-sm text-[#8A97A8]">No categories available</div>
            )}
          </div>
          )}
        </div>
      </nav>

      {/* Location Popup Modal */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-[#0B2545]/50 backdrop-blur-sm z-[1200] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowLocationPopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-[#EEF1F4] p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#0B2545]">📍 Select Location</h3>
              <button onClick={() => setShowLocationPopup(false)} aria-label="Close" className="p-2 text-[#8A97A8] hover:text-[#0B2545] hover:bg-[#F0F6F7] rounded-lg transition"><Icon d={P.close} sw={2} /></button>
            </div>
            <div className="p-5 space-y-4">
              <button onClick={getCurrentLocation} disabled={isLocating} className="w-full flex items-center justify-center gap-3 bg-[#0E7C86]/10 hover:bg-[#0E7C86]/15 text-[#0B5F67] py-3 px-4 rounded-xl transition border border-[#0E7C86]/30 font-semibold disabled:opacity-70">
                {isLocating ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0E7C86] border-t-transparent"></div><span>Locating...</span></> : <><Icon d={P.pin} sw={2} /><span>Use My Current Location</span></>}
              </button>
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3E8EC]"></div></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-[#8A97A8]">OR SEARCH ADDRESS</span></div></div>
              <div className="flex flex-col gap-2">
                <input type="text" value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} placeholder="Type full address, city, or pincode..." className="w-full bg-white text-[#0B2545] border border-[#DDE3E8] rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15 transition-all" onKeyPress={(e) => e.key === 'Enter' && searchAddressAndShowMap()} />
                <button onClick={searchAddressAndShowMap} disabled={isAddressSearching} className="bg-[#F0F3F6] hover:bg-[#E3E8EC] text-[#0B2545] py-2.5 rounded-xl text-sm font-medium transition">{isAddressSearching ? 'Searching...' : 'Search on Map'}</button>
              </div>
              {showMap && (
                <div className="space-y-2">
                  <div ref={mapContainerRef} className="h-[250px] w-full rounded-xl bg-[#F0F3F6] overflow-hidden border border-[#DDE3E8]"></div>
                  <p className="text-xs text-[#5B6B7F] text-center">📍 Drag the marker to adjust exact location</p>
                  <button onClick={confirmMapLocation} className="w-full bg-[#0E7C86] hover:bg-[#0B6A73] text-white py-3 rounded-xl text-sm font-semibold transition shadow-sm">Confirm This Location</button>
                </div>
              )}
              <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3E8EC]"></div></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-white text-[#8A97A8]">OR ENTER MANUALLY</span></div></div>
              <input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} placeholder="Enter city name (e.g., Mumbai, Delhi)" className="w-full bg-white text-[#0B2545] border border-[#DDE3E8] rounded-xl px-4 py-3 text-base sm:text-sm focus:outline-none focus:border-[#0E7C86] focus:ring-4 focus:ring-[#0E7C86]/15 transition-all" onKeyPress={(e) => e.key === 'Enter' && saveCustomLocation()} />
              <button onClick={saveCustomLocation} className="w-full bg-[#F0F3F6] hover:bg-[#E3E8EC] text-[#0B2545] py-2.5 rounded-xl text-sm font-medium transition">Save Location</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[1300] animate-slideUp max-w-[92vw]">
          <div className="bg-[#0B2545] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"><Icon d={P.check} className="w-5 h-5 text-[#5CD6D0]" sw={2.2} /><span className="text-sm font-medium">{successMessage}</span></div>
        </div>
      )}

      {/* Mobile Menu Drawer - Role-based items, includes Cart */}
      <div className={`fixed inset-0 bg-[#0B2545]/50 backdrop-blur-sm z-[1050] transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setMobileMenuOpen(false)} />
      <div className={`fixed top-0 right-0 bottom-0 w-80 max-w-[88vw] bg-white shadow-2xl z-[1100] transform transition-all duration-300 ease-out flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="bg-[#0B2545] p-5 text-white" style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {user ? (
                <>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0E7C86] flex items-center justify-center border-2 border-white/25 shrink-0">
                    {user.avatar?.url ? <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-white">{getInitials(user.name || user.email)}</span>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{user?.fullName || 'User'}</h3>
                    <p className="text-xs text-white/70 mt-0.5 truncate">{user.email}</p>
                    {user.role === 'provider' && <span className="inline-block mt-1 text-[10px] bg-[#5CD6D0] text-[#0B2545] px-2 py-0.5 rounded-md font-semibold">PROFESSIONAL</span>}
                    {user.role === 'admin' && <span className="inline-block mt-1 text-[10px] bg-white text-[#0B2545] px-2 py-0.5 rounded-md font-semibold">ADMIN</span>}
                  </div>
                </>
              ) : (
                <div className="w-full py-1">
                  <p className="text-sm text-white/80 mb-3">Welcome to INDIAN HOMEY!</p>
                  <div className="flex gap-2">
                    <button onClick={() => { openAuthModal('signin'); setMobileMenuOpen(false); }} className="flex-1 bg-white text-[#0B2545] h-11 rounded-lg text-sm font-semibold hover:bg-[#F0F6F7] transition">Login</button>
                    <button onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }} className="flex-1 bg-[#0E7C86] text-white h-11 rounded-lg text-sm font-semibold hover:bg-[#0B6A73] transition">Sign Up</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="ml-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-10 h-10 flex items-center justify-center rounded-lg transition-colors shrink-0"><Icon d={P.close} sw={2} /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-[#8A97A8] mb-2 px-3">Main menu</p>
            <div className="space-y-0.5">
              <Link to="/" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                <Icon d={P.home} className="w-5 h-5 text-[#5B6B7F]" />Home
              </Link>
              <Link to="/cart" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                <Icon d={P.cart} className="w-5 h-5 text-[#5B6B7F]" />
                My Cart
                {cartCount > 0 && (
                  <span className="ml-auto bg-[#0E7C86] text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              {/* <Link to="/services" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>All Services
              </Link>
              <Link to="/providers" className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-medium" onClick={() => setMobileMenuOpen(false)}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Providers
              </Link> */}
            </div>
          </div>
          {user && (
            <div className="px-4 mb-4">
              <p className="text-xs font-semibold text-[#8A97A8] mb-2 px-3">Account</p>
              <div className="space-y-0.5">
                <Link to="/profile" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                  <Icon d={P.user} className="w-5 h-5 text-[#5B6B7F]" />My Profile
                </Link>
                <Link to="/my-bookings" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                  <Icon d={P.calendar} className="w-5 h-5 text-[#5B6B7F]" />My Bookings
                </Link>
                {user.role === 'provider' && (
                  <>
                    <Link to="/provider" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                      <Icon d={P.dashboard} className="w-5 h-5 text-[#0E7C86]" />Dashboard
                    </Link>
                    <Link to="/provider/bookings" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                      <Icon d={P.calendar} className="w-5 h-5 text-[#5B6B7F]" />Manage Bookings
                    </Link>
                    <button onClick={() => { setShowLocationModal(true); setMobileMenuOpen(false); }} className={DRAWER_ITEM}>
                      <Icon d={P.pin[0]} className="w-5 h-5 text-[#5B6B7F]" />Service Area
                    </button>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className={DRAWER_ITEM} onClick={() => setMobileMenuOpen(false)}>
                    <Icon d={P.gear} className="w-5 h-5 text-[#0E7C86]" />Admin Panel
                  </Link>
                )}
              </div>
            </div>
          )}
          {user?.role !== 'provider' && user?.role !== 'admin' && (
            <div className="px-4 mb-4">
              <Link to="/register-provider" className={`flex items-center justify-between px-4 py-3 bg-[#F0F6F7] border border-[#0E7C86]/30 rounded-xl hover:border-[#0E7C86] transition-colors ${FOCUS}`} onClick={() => setMobileMenuOpen(false)}>
                <div><p className="text-sm font-bold text-[#0B2545]">Become a Professional</p><p className="text-xs text-[#5B6B7F]">Join & grow your business</p></div>
                <Icon d={P.chevRight} className="w-5 h-5 text-[#0E7C86]" sw={2} />
              </Link>
            </div>
          )}
        </div>
        {user && (
          <div className="border-t border-[#EEF1F4] p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-4 h-11 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition font-semibold">
              <Icon d={P.logout} />Logout
            </button>
          </div>
        )}
      </div>

      {showLocationModal && user?.role === 'provider' && <ProviderLocationModal onClose={() => setShowLocationModal(false)} />}
      {showAuth && <Login initialPanel={authPanel} />}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.25s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn, .animate-slideUp { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </>
  );
};

export default Navbar;