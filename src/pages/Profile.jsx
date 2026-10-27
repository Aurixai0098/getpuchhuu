// src/pages/Profile.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  updateUserProfile, 
  uploadUserAvatar, 
  removeUserAvatar,
  changePassword,
  updateNotificationPreferences,
  fetchProviderProfile
} from '../services/api';
import { 
  Camera, 
  Loader2, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CalendarDays,
  CheckCircle, 
  XCircle, 
  Save, 
  X,
  Shield,
  Bell,
  LogOut,
  Settings,
  Star,
  Heart,
  ChevronRight,
  Eye,
  EyeOff,
  MailCheck,
  Smartphone,
  Globe,
  Edit2,
  Briefcase,
  MapPin,
  CreditCard,
  Lock,
  Gift,
  HelpCircle,
  Crown,
  BadgeCheck,
  ArrowRight,
  Tag,
  Zap,
  Percent,
} from 'lucide-react';

/* ------------------------------------------------------------------
   UI-ONLY SETTINGS (backend se koi lena-dena nahi)
------------------------------------------------------------------ */

// Sidebar / banner ke links. Apne project ke asli routes ke hisaab se badal lena.
const ROUTES = {
  bookings: '/bookings',
  favourites: '/favourites',
  refer: '/refer',
  help: '/help',
  offers: '/offers',
};

// Delete Account par support ka mail khulta hai (koi delete API nahi hai)
const SUPPORT_EMAIL = 'help@puchhuu.com';

const INPUT =
  'w-full h-11 px-4 border border-gray-200 bg-white rounded-xl text-sm text-gray-800 outline-none transition focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]';
const CARD = 'bg-white rounded-2xl border border-[#E8EDF1] shadow-sm';
const PRIMARY_BTN =
  'inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-[#0E7C86] to-[#12948F] hover:from-[#0B6A73] hover:to-[#0E7C86] text-white text-sm font-semibold transition-all disabled:opacity-50 shadow-sm';

/* ------------------------------------------------------------------
   Small UI pieces (component ke bahar, taaki typing me focus na jaye)
------------------------------------------------------------------ */

const InfoRow = ({ Icon, label, children }) => (
  <div className="flex items-center gap-4 py-3.5 border-b border-gray-100 last:border-0">
    <Icon size={18} className="text-gray-500 shrink-0" aria-hidden="true" />
    <span className="w-32 sm:w-40 shrink-0 text-sm text-[#5B6B7F]">{label}</span>
    <span className="flex-1 min-w-0 text-sm font-semibold text-[#0B1B33] break-words">{children}</span>
  </div>
);

const SettingRow = ({ Icon, title, sub, onClick, href, danger = false }) => {
  const inner = (
    <>
      <span className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center ${danger ? 'bg-red-50 text-red-500' : 'bg-[#F1F5F7] text-[#1E2E45]'}`}>
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className={`block text-sm font-semibold leading-tight ${danger ? 'text-red-600' : 'text-[#0B1B33]'}`}>{title}</span>
        <span className="block text-xs text-[#5B6B7F] leading-tight mt-0.5">{sub}</span>
      </span>
      <ChevronRight size={18} className="text-gray-400 shrink-0" aria-hidden="true" />
    </>
  );
  const cls = 'w-full flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors rounded-lg px-1';
  return href ? (
    <a href={href} className={cls}>{inner}</a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>{inner}</button>
  );
};

const Toggle = ({ on, onClick, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${on ? 'bg-[#0E7C86]' : 'bg-gray-300'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const PasswordField = ({ label, value, onChange, placeholder, show, toggle }) => (
  <div>
    <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">{label}</label>
    <div className="relative">
      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className={`${INPUT} pl-10 pr-10`}
      />
      <button type="button" onClick={toggle} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  
  // Active tab
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  // Avatar states
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    sms: true,
    push: true
  });
  const [notifLoading, setNotifLoading] = useState(false);
  
  // Provider info (if user is provider)
  const [providerInfo, setProviderInfo] = useState(null);
  const [providerLoading, setProviderLoading] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
      setAvatarPreview(user.avatar?.url || null);
      setNotifPrefs(user.notificationPreferences || { email: true, sms: true, push: true });
    }
  }, [user]);

  // Load provider profile if user is provider
  useEffect(() => {
    const loadProviderProfile = async () => {
      if (user?.role === 'provider') {
        setProviderLoading(true);
        try {
          const res = await fetchProviderProfile();
          if (res.success) {
            setProviderInfo(res.data.provider);
          }
        } catch (err) {
          console.error('Failed to load provider profile:', err);
        } finally {
          setProviderLoading(false);
        }
      }
    };
    if (user) loadProviderProfile();
  }, [user]);

  // Handle profile form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle profile update (save)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await updateUserProfile(form);
      if (res.success) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
        if (setUser) {
          setUser(prev => ({ ...prev, ...form }));
        }
        setIsEditing(false); // Exit edit mode after save
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    // Reset form to original user data
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
    setAvatarFile(null);
    setAvatarPreview(user?.avatar?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Avatar handlers
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file (JPEG, PNG)');
      setMessageType('error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size should be less than 5MB');
      setMessageType('error');
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setMessage('');
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    
    setUploading(true);
    setMessage('');
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const res = await uploadUserAvatar(formData);
      if (res.success) {
        setAvatarPreview(res.data.avatar.url);
        setAvatarFile(null);
        if (setUser) {
          setUser(prev => ({ ...prev, avatar: res.data.avatar }));
        }
        setMessage('Profile picture updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to upload avatar');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    
    setUploading(true);
    try {
      const res = await removeUserAvatar();
      if (res.success) {
        setAvatarPreview(null);
        setAvatarFile(null);
        if (setUser) {
          setUser(prev => ({ ...prev, avatar: null }));
        }
        setMessage('Profile picture removed successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to remove avatar');
      setMessageType('error');
    } finally {
      setUploading(false);
    }
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setMessage('Password must be at least 8 characters');
      setMessageType('error');
      return;
    }
    
    setPasswordLoading(true);
    setMessage('');
    try {
      const res = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (res.success) {
        setMessage('Password changed successfully!');
        setMessageType('success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to change password');
      setMessageType('error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Notification preferences handler
  const handleNotifChange = async (key, value) => {
    const newPrefs = { ...notifPrefs, [key]: value };
    setNotifPrefs(newPrefs);
    setNotifLoading(true);
    try {
      const res = await updateNotificationPreferences(newPrefs);
      if (res.success) {
        setMessage('Notification preferences updated');
        setMessageType('success');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      setMessage(err.message || 'Failed to update preferences');
      setMessageType('error');
      setNotifPrefs(notifPrefs);
    } finally {
      setNotifLoading(false);
    }
  };

  // Toast auto-dismiss
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  /* ---------------- UI-only helpers ---------------- */
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Your Name';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null;
  const phoneVerified = !!(user?.isPhoneVerified ?? user?.phoneVerified);

  const openEdit = () => { setActiveTab('profile'); setIsEditing(true); };

  const SIDEBAR = [
    { label: 'My Profile', Icon: User, tab: 'profile' },
    { label: 'My Bookings', Icon: CalendarDays, to: ROUTES.bookings },
    { label: 'My Addresses', Icon: MapPin, tab: 'addresses' },
    { label: 'Payment Methods', Icon: CreditCard, tab: 'payments' },
    { label: 'Saved & Favourites', Icon: Heart, to: ROUTES.favourites },
    { label: 'Notifications', Icon: Bell, tab: 'notifications' },
    { label: 'Refer & Earn', Icon: Gift, to: ROUTES.refer },
    { label: 'Help & Support', Icon: HelpCircle, to: ROUTES.help },
    { label: 'Settings', Icon: Settings, tab: 'security' },
  ];

  const TABS = [
    ['profile', 'Personal Information'],
    ['addresses', 'Addresses'],
    ['payments', 'Payment Methods'],
    ['notifications', 'Notifications'],
    ['security', 'Security'],
  ];

  const notifItems = [
    { key: 'email', Icon: MailCheck, color: 'text-[#0E7C86]', title: 'Email Notifications', sub: 'Receive updates about bookings and offers via email' },
    { key: 'sms', Icon: Smartphone, color: 'text-purple-600', title: 'SMS Notifications', sub: 'Get SMS alerts for booking status changes' },
    { key: 'push', Icon: Globe, color: 'text-orange-600', title: 'Push Notifications', sub: 'Receive in-app notifications and reminders' },
  ];

  const placeholderPanel = (Icon, title, text) => (
    <div className={`${CARD} p-10 text-center`}>
      <span className="mx-auto w-14 h-14 rounded-2xl bg-[#E3F5F1] text-[#0E7C86] grid place-items-center">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-[#0B1B33]">{title}</h2>
      <p className="mt-1 text-sm text-[#5B6B7F]">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-5 sm:py-6 px-3 sm:px-6 lg:px-8">
      {/* Toast Message */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-in slide-in-from-right ${
          messageType === 'error' ? 'bg-red-500 text-white' : 'bg-[#0E7C86] text-white'
        }`} role="status">
          {messageType === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          <span className="text-sm font-medium">{message}</span>
          <button onClick={() => setMessage('')} aria-label="Dismiss" className="ml-2 hover:opacity-80">
            <X size={14} />
          </button>
        </div>
      )}

      {/* hidden file input (hero camera + Change Photo dono yahi use karte hain) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelect}
        className="hidden"
      />

      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-5 lg:gap-6">

        {/* ================= SIDEBAR ================= */}
        <aside className="lg:w-60 shrink-0">
          <nav aria-label="Account" className={`${CARD} p-2 lg:p-3 lg:sticky lg:top-24`}>
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 profile-noscroll">
              {SIDEBAR.map(({ label, Icon, tab, to }) => {
                const active = tab && activeTab === tab;
                return (
                  <li key={label} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => (tab ? setActiveTab(tab) : navigate(to))}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors ${
                        active
                          ? 'bg-gradient-to-r from-[#0E7C86] to-[#12948F] text-white font-semibold shadow-sm'
                          : 'text-[#2B3A50] hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </button>
                  </li>
                );
              })}
              <li className="shrink-0 lg:shrink lg:mt-3">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* ================= MAIN ================= */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Hero card */}
          <section className="rounded-2xl bg-gradient-to-br from-[#0A2833] via-[#0C3C48] to-[#0E6670] text-white p-5 sm:p-7 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/90 bg-gradient-to-br from-[#0E7C86] to-[#0B2545] grid place-items-center overflow-hidden shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-white" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Change profile picture"
                  aria-label="Change profile picture"
                >
                  <Camera size={15} className="text-[#0B1B33]" />
                </button>
              </div>

              <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold">
                  <span className="truncate">{fullName}</span>
                  <BadgeCheck size={20} className="text-[#35D6E0] shrink-0" aria-label="Verified account" />
                </h1>
                <p className="mt-1 text-sm text-white/85 truncate">{user?.email}</p>
                <p className="text-sm text-white/85">{user?.phone ? `+91 ${user.phone}` : ''}</p>
                <button
                  type="button"
                  onClick={openEdit}
                  className="mt-3 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white text-[#0B1B33] text-sm font-semibold hover:bg-[#E8F7F8] transition-colors"
                >
                  <Edit2 size={14} /> Edit Profile
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 md:flex md:items-stretch gap-3 md:gap-0 text-center md:divide-x md:divide-white/20">
              <div className="md:px-7 flex flex-col items-center justify-center">
                <CalendarDays size={20} className="text-[#35D6E0] mb-1" aria-hidden="true" />
                <p className="text-xl sm:text-2xl font-bold leading-tight">{stats.totalBookings || 0}</p>
                <p className="text-[11px] sm:text-xs text-white/75">Total Bookings</p>
              </div>
              <div className="md:px-7 flex flex-col items-center justify-center">
                <Star size={20} className="text-amber-400 fill-amber-400 mb-1" aria-hidden="true" />
                <p className="text-xl sm:text-2xl font-bold leading-tight">—</p>
                <p className="text-[11px] sm:text-xs text-white/75">Average Rating</p>
              </div>
              <div className="md:px-7 flex flex-col items-center justify-center">
                <Crown size={20} className="text-[#35D6E0] mb-1" aria-hidden="true" />
                <p className="text-sm sm:text-base font-bold leading-tight">
                  {user?.role === 'provider' ? 'Puchhuu Partner' : 'Puchhuu Member'}
                </p>
                <p className="text-[11px] sm:text-xs text-white/75">{memberSince ? `Since ${memberSince}` : 'Welcome'}</p>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="flex gap-6 overflow-x-auto profile-noscroll border-b border-[#E3E8EC]" role="tablist" aria-label="Profile sections">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setActiveTab(key)}
                className={`shrink-0 pb-3 -mb-px text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === key
                    ? 'text-[#0E7C86] border-[#0E7C86]'
                    : 'text-[#5B6B7F] border-transparent hover:text-[#0B1B33]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ============ TAB: Personal Information ============ */}
          {activeTab === 'profile' && (
            <>
              <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
                {/* Left column */}
                <div className="space-y-5 min-w-0">
                  <section className={`${CARD} p-5 sm:p-6`}>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-[#0B1B33]">Personal Information</h2>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-gray-200 text-sm font-medium text-[#1E2E45] hover:bg-gray-50 transition"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                    </div>

                    {!isEditing ? (
                      // Display mode
                      <div>
                        <InfoRow Icon={User} label="Full Name">{fullName}</InfoRow>
                        <InfoRow Icon={Mail} label="Email Address">{user?.email || '—'}</InfoRow>
                        <InfoRow Icon={Smartphone} label="Mobile Number">
                          <span className="inline-flex flex-wrap items-center gap-2">
                            {user?.phone ? `+91 ${user.phone}` : '—'}
                            {phoneVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E3F5F1] text-[#0E7C86] text-[11px] font-medium">
                                <CheckCircle size={11} /> Verified
                              </span>
                            )}
                          </span>
                        </InfoRow>
                        <InfoRow Icon={Calendar} label="Date of Birth">{formatDate(form.dateOfBirth)}</InfoRow>
                        <InfoRow Icon={User} label="Gender"><span className="capitalize">{form.gender || '—'}</span></InfoRow>
                        <InfoRow Icon={MapPin} label="City">{user?.city || user?.address?.city || '—'}</InfoRow>
                        <InfoRow Icon={Globe} label="Language">
                          {Array.isArray(user?.languages) ? user.languages.join(', ') : user?.language || '—'}
                        </InfoRow>
                      </div>
                    ) : (
                      // Edit mode - form
                      <form onSubmit={handleSaveProfile} className="space-y-4 mt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">First Name</label>
                            <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required className={INPUT} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Last Name</label>
                            <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required className={INPUT} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Email</label>
                            <div className="flex items-center gap-2 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl">
                              <Mail size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-600 truncate">{user?.email}</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Phone</label>
                            <div className="flex items-center gap-2 h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl">
                              <Phone size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-600">{user?.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Gender</label>
                            <select name="gender" value={form.gender} onChange={handleChange} className={INPUT}>
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#0B1B33] mb-1.5">Date of Birth</label>
                            <div className="relative">
                              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={`${INPUT} pl-10`} />
                            </div>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                          <button type="button" onClick={cancelEditing} className="h-11 px-6 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition">
                            Cancel
                          </button>
                          <button type="submit" disabled={loading} className={PRIMARY_BTN}>
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    )}
                  </section>

                  {/* Provider Information Section (only for provider users) */}
                  {user?.role === 'provider' && (
                    <section className={`${CARD} p-5 sm:p-6`}>
                      <div className="flex items-center gap-2.5 mb-4 text-[#0E7C86]">
                        <Briefcase size={22} />
                        <h2 className="text-lg font-bold text-[#0B1B33]">Professional Information</h2>
                      </div>
                      {providerLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 size={30} className="animate-spin text-[#0E7C86]" />
                        </div>
                      ) : providerInfo ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-[#5B6B7F] mb-0.5">Business Name</p>
                              <p className="text-sm font-semibold text-[#0B1B33]">{providerInfo.businessName || '—'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-[#5B6B7F] mb-0.5">Years of Experience</p>
                              <p className="text-sm font-semibold text-[#0B1B33]">{providerInfo.experience?.years || 0} years</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-[#5B6B7F] mb-0.5">Bio</p>
                            <p className="text-sm text-[#2B3A50]">{providerInfo.bio || '—'}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-[#5B6B7F] mb-1">Verification Status</p>
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                providerInfo.verificationStatus === 'verified' 
                                  ? 'bg-green-100 text-green-800'
                                  : providerInfo.verificationStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {providerInfo.verificationStatus === 'verified' ? '✓ Verified' : 
                                 providerInfo.verificationStatus === 'pending' ? '⏳ Pending' : '✗ Rejected'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-[#5B6B7F] mb-0.5">Service Radius</p>
                              <p className="text-sm font-semibold text-[#0B1B33] flex items-center gap-1">
                                <MapPin size={14} /> {providerInfo.serviceArea?.radius || 10} km
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => window.location.href = '/provider/profile'}
                            className="text-[#0E7C86] hover:underline text-sm font-semibold flex items-center gap-1"
                          >
                            Manage Professional Profile <ArrowRight size={14} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">No professional information available</p>
                      )}
                    </section>
                  )}

                  {/* Membership & Offers */}
                  <section className={`${CARD} p-5 sm:p-6`}>
                    <h2 className="text-lg font-bold text-[#0B1B33] mb-4">Membership &amp; Offers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-4">
                      <div className="flex gap-4">
                        <span className="w-16 h-16 shrink-0 rounded-2xl bg-amber-50 text-amber-500 grid place-items-center">
                          <Crown size={32} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="font-bold text-[#0B1B33]">Puchhuu Member</p>
                          <p className="mt-1 text-sm text-[#5B6B7F]">Enjoy exclusive offers, faster bookings and priority support.</p>
                          <button
                            type="button"
                            onClick={() => navigate(ROUTES.offers)}
                            className="mt-3 h-10 px-5 rounded-lg bg-[#E3F5F1] text-[#0E7C86] text-sm font-semibold hover:bg-[#D2EFEA] transition-colors"
                          >
                            View Benefits
                          </button>
                        </div>
                      </div>
                      <ul className="rounded-xl bg-[#E8F6F5] p-3.5 space-y-2.5">
                        {[[Tag, 'Exclusive Offers'], [Zap, 'Priority Booking'], [Percent, 'Special Discounts']].map(([BIcon, text]) => (
                          <li key={text} className="flex items-center gap-3 text-sm font-medium text-[#0B1B33]">
                            <span className="w-8 h-8 rounded-lg bg-white text-[#0E7C86] grid place-items-center">
                              <BIcon size={16} aria-hidden="true" />
                            </span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>

                {/* Right column */}
                <div className="space-y-5 min-w-0">
                  {/* Profile Picture */}
                  <section className={`${CARD} p-5 sm:p-6`}>
                    <h2 className="text-lg font-bold text-[#0B1B33] mb-4">Profile Picture</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 shrink-0 rounded-full bg-gradient-to-br from-[#0E7C86] to-[#0B2545] grid place-items-center overflow-hidden shadow">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-[#2B3A50]">Update your profile picture</p>
                        <p className="text-xs text-[#5B6B7F] mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {avatarFile ? (
                        <button type="button" onClick={handleUploadAvatar} disabled={uploading} className={`${PRIMARY_BTN} px-3`}>
                          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          Save Photo
                        </button>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className={`${PRIMARY_BTN} px-3`}>
                          Change Photo
                        </button>
                      )}
                      {avatarFile ? (
                        <button type="button" onClick={cancelEditing} className="h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          disabled={uploading || !avatarPreview}
                          className="h-11 rounded-xl border border-red-300 text-sm font-semibold text-red-600 hover:bg-red-50 transition disabled:opacity-40"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </section>

                  {/* Account Settings */}
                  <section className={`${CARD} p-5 sm:p-6`}>
                    <h2 className="text-lg font-bold text-[#0B1B33] mb-2">Account Settings</h2>
                    <div>
                      <SettingRow Icon={Edit2} title="Edit Profile" sub="Update your personal information" onClick={openEdit} />
                      <SettingRow Icon={Lock} title="Change Password" sub="Keep your account secure" onClick={() => setActiveTab('security')} />
                      <SettingRow Icon={Bell} title="Manage Notifications" sub="Choose what notifications you receive" onClick={() => setActiveTab('notifications')} />
                      <SettingRow
                        Icon={Trash2}
                        title="Delete Account"
                        sub="Permanently delete your account"
                        danger
                        href={`mailto:${SUPPORT_EMAIL}?subject=Account%20deletion%20request`}
                      />
                    </div>
                  </section>
                </div>
              </div>

              {/* Refer & Earn banner */}
              <section className="rounded-2xl bg-gradient-to-r from-[#0E7C86] via-[#12948F] to-[#5CC7C0] text-white p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                <div className="relative w-28 h-24 shrink-0 hidden sm:block" aria-hidden="true">
                  <span className="absolute left-3 top-0 w-16 h-24 rounded-2xl bg-white/90 text-[#0E7C86] grid place-items-center shadow-lg -rotate-6">
                    <Smartphone size={30} />
                  </span>
                  <span className="absolute right-0 bottom-0 w-14 h-14 rounded-2xl bg-amber-400 text-white grid place-items-center shadow-lg rotate-6">
                    <Gift size={28} />
                  </span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold">Refer &amp; Earn</h2>
                  <p className="mt-1 text-sm sm:text-base text-white/90">Invite your friends and earn exciting rewards</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.refer)}
                  className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-white text-[#0B1B33] text-sm font-semibold hover:bg-[#E8F7F8] transition-colors shrink-0"
                >
                  Refer Now <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}

          {/* ============ TAB: Addresses (UI placeholder) ============ */}
          {activeTab === 'addresses' &&
            placeholderPanel(MapPin, 'My Addresses', 'Your saved addresses will appear here.')}

          {/* ============ TAB: Payment Methods (UI placeholder) ============ */}
          {activeTab === 'payments' &&
            placeholderPanel(CreditCard, 'Payment Methods', 'Your saved payment methods will appear here.')}

          {/* ============ TAB: Security (Change Password) ============ */}
          {activeTab === 'security' && (
            <section className={`${CARD} p-5 sm:p-7`}>
              <div className="flex items-center gap-2.5 mb-5 text-[#0E7C86]">
                <Shield size={22} />
                <h2 className="text-lg font-bold text-[#0B1B33]">Security Settings</h2>
              </div>
              <div className="max-w-lg">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                  <Shield size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 text-sm">Password Security Tips</h3>
                    <p className="text-xs text-amber-700 mt-1">Use at least 8 characters with a mix of letters, numbers, and symbols. Never share your password with anyone.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <PasswordField
                    label="Current Password"
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    show={showCurrentPassword}
                    toggle={() => setShowCurrentPassword(!showCurrentPassword)}
                  />
                  <PasswordField
                    label="New Password"
                    placeholder="Enter new password (min 8 characters)"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    show={showNewPassword}
                    toggle={() => setShowNewPassword(!showNewPassword)}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    show={showConfirmPassword}
                    toggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                  <div className="pt-2 flex justify-end">
                    <button type="submit" disabled={passwordLoading} className={PRIMARY_BTN}>
                      {passwordLoading && <Loader2 size={18} className="animate-spin" />}
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* ============ TAB: Notifications ============ */}
          {activeTab === 'notifications' && (
            <section className={`${CARD} p-5 sm:p-7`}>
              <div className="flex items-center gap-2.5 mb-5 text-[#0E7C86]">
                <Bell size={22} />
                <h2 className="text-lg font-bold text-[#0B1B33]">Notification Preferences</h2>
              </div>
              <div className="space-y-3 max-w-lg">
                {notifItems.map(({ key, Icon, color, title, sub }) => (
                  <div key={key} className="flex items-center justify-between gap-4 p-4 bg-[#F4F8FA] rounded-xl">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon size={20} className={`${color} shrink-0`} />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#0B1B33]">{title}</p>
                        <p className="text-xs text-[#5B6B7F]">{sub}</p>
                      </div>
                    </div>
                    <Toggle
                      on={!!notifPrefs[key]}
                      onClick={() => handleNotifChange(key, !notifPrefs[key])}
                      disabled={notifLoading}
                      label={title}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <style>{`
        .profile-noscroll::-webkit-scrollbar { display: none; }
        .profile-noscroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Profile;