// src/components/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google';
import {
  Mail,
  Lock,
  User,
  Phone,
  Smartphone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  IndianRupee,
  Clock,
  Star,
  Wind,
  Sparkles,
  Sofa,
  Droplets,
  Zap,
  PaintRoller,
} from "lucide-react";
import { apiFetch } from "../../services/api";

/* ------------------------------------------------------------------
   UI-ONLY SETTINGS (backend se koi lena-dena nahi)
------------------------------------------------------------------ */

// Left panel me aurat wali photo (transparent PNG best). Khali = sirf gradient + wave dikhega.
const LOGIN_HERO_IMG = ''; // e.g. 'https://res.cloudinary.com/.../hero-woman.png'

// "or continue with" + "Continue with Google" button.
// Google button ke liye app ko <GoogleOAuthProvider clientId="..."> me wrap karna zaruri hai (main.jsx).
// Provider na ho to neeche ka fallback button dikhega (click par "not set up yet" message).
const SHOW_SOCIAL_LOGIN = true;
// "Continue with Mobile Number" button (OTP flow).
const SHOW_MOBILE_LOGIN = true;
// Apple button abhi UI-only hai (click par "coming soon" message). Chahiye to true karo.
const SHOW_APPLE_BUTTON = false;

// Mobile OTP ke liye backend endpoints. Khali = button/flow dikhega par "coming soon" message aayega.
// Jab backend ready ho, yahan paths daalo (jaise '/auth/send-otp' aur '/auth/verify-otp').
// Request body: send -> { phone }, verify -> { phone, otp }. Response: { success, data: { user } }
// (agar aapke backend ke field naam alag hain to handleSendOtp / handleVerifyOtp me badal do).
const MOBILE_LOGIN_API = { send: '', verify: '' };
const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 30;

const LOGO_URL = "https://res.cloudinary.com/djtvxmttf/image/upload/v1792058517/c84c65f3-b34d-403b-b309-ad21b1a71d70.png";
const MOBILE_LOGO_URL = "https://res.cloudinary.com/djtvxmttf/image/upload/v1792058119/ccb32c09-3568-477a-b5c3-11edba5176a0.png";

const FEATURES = [
  { Icon: ShieldCheck, label: 'Verified Professionals' },
  { Icon: IndianRupee, label: 'Transparent Pricing' },
  { Icon: Clock, label: 'On-Time Service' },
  { Icon: Star, label: '100% Satisfaction' },
];

const SERVICE_STRIP = [
  { Icon: Wind, label: 'AC Service' },
  { Icon: Sparkles, label: 'Home Cleaning' },
  { Icon: Sofa, label: 'Sofa Cleaning' },
  { Icon: Droplets, label: 'Plumbing' },
  { Icon: Zap, label: 'Electrician' },
  { Icon: PaintRoller, label: 'Painting' },
];

const INPUT_BASE =
  "w-full h-12 border rounded-xl outline-none transition-all text-base focus:ring-2 focus:ring-[#0E7C86]/30 focus:border-[#0E7C86] disabled:bg-gray-100 disabled:text-gray-500";
const inputState = (error) =>
  error ? "border-red-500 bg-red-50" : "border-gray-200 bg-white";

const SOCIAL_BTN =
  "w-full h-12 border border-gray-200 rounded-xl flex items-center justify-center gap-2.5 text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 transition-colors";

// Agar GoogleOAuthProvider set nahi hai to GoogleLogin error deta hai. Ye boundary page ko crash hone se bachata hai.
class GoogleBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const GoogleG = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
    <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);

const PasswordInput = ({ value, onChange, placeholder, show, toggleShow, error }) => (
  <div>
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ fontSize: '16px' }}
        className={`${INPUT_BASE} pl-11 pr-11 ${inputState(error)}`}
      />
      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
      <button
        type="button"
        onClick={toggleShow}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

const InputField = ({ icon: Icon, error, prefix, ...props }) => (
  <div>
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
      {prefix && (
        <span className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-gray-600 pr-2 border-r border-gray-200">
          <span aria-hidden="true">🇮🇳</span> {prefix}
        </span>
      )}
      <input
        {...props}
        style={{ fontSize: '16px' }}
        className={`${INPUT_BASE} ${prefix ? 'pl-[6.75rem]' : 'pl-11'} pr-4 ${inputState(error)}`}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

const Login = ({ initialPanel = "signin" }) => {
  const { setShowAuth, register, login, setUser } = useAuth();
  const [activePanel, setActivePanel] = useState(initialPanel);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Registration fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailReg, setEmailReg] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Login fields
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  // Mobile number (OTP) login
  const [mobileMode, setMobileMode] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: "" });

  // UI only ("Keep me signed in" checkbox)
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  useEffect(() => {
    setActivePanel(initialPanel);
  }, [initialPanel]);

  useEffect(() => {
    if (generalError) {
      const timer = setTimeout(() => setGeneralError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [generalError]);

  useEffect(() => {
    setFieldErrors({});
  }, [firstName, lastName, emailReg, phone, passwordReg, confirmPassword, emailLogin, passwordLogin, mobileNumber, otp, activePanel]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (!passwordReg) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }
    let score = 0;
    if (passwordReg.length >= 8) score++;
    if (passwordReg.length >= 12) score++;
    if (/[A-Z]/.test(passwordReg)) score++;
    if (/[0-9]/.test(passwordReg)) score++;
    if (/[^A-Za-z0-9]/.test(passwordReg)) score++;
    let message = "";
    if (score <= 2) message = "Weak";
    else if (score <= 4) message = "Medium";
    else message = "Strong";
    setPasswordStrength({ score, message });
  }, [passwordReg]);

  const parseBackendError = (err, isRegistration) => {
    let fieldErrs = {};
    let general = null;
    if (!err.data) {
      general = err.message === "Failed to fetch" 
        ? "Cannot connect to server. Please check your internet." 
        : err.message || "Something went wrong.";
      return { fieldErrors: fieldErrs, generalError: general };
    }
    const errorData = err.data;
    if (errorData.errors && Array.isArray(errorData.errors)) {
      errorData.errors.forEach(item => {
        const backendField = item.field;
        const message = item.message;
        if (!backendField || !message) return;
        let frontendField = null;
        if (isRegistration) {
          if (backendField === "firstName") frontendField = "firstName";
          else if (backendField === "lastName") frontendField = "lastName";
          else if (backendField === "email") frontendField = "emailReg";
          else if (backendField === "phone") frontendField = "phone";
          else if (backendField === "password") frontendField = "passwordReg";
          else if (backendField === "confirmPassword") frontendField = "confirmPassword";
        } else {
          if (backendField === "email") frontendField = "emailLogin";
          else if (backendField === "password") frontendField = "passwordLogin";
        }
        if (frontendField) fieldErrs[frontendField] = message;
        else general = message;
      });
      if (Object.keys(fieldErrs).length) return { fieldErrors: fieldErrs, generalError: null };
      if (errorData.errors[0]?.message) general = errorData.errors[0].message;
      return { fieldErrors: fieldErrs, generalError: general };
    }
    if (errorData.message) {
      const msg = errorData.message;
      const lower = msg.toLowerCase();
      if (isRegistration) {
        if (lower.includes("email")) fieldErrs.emailReg = msg;
        else if (lower.includes("phone")) fieldErrs.phone = msg;
        else if (lower.includes("password")) fieldErrs.passwordReg = msg;
        else if (lower.includes("first name")) fieldErrs.firstName = msg;
        else if (lower.includes("last name")) fieldErrs.lastName = msg;
        else general = msg;
      } else {
        if (lower.includes("email")) fieldErrs.emailLogin = msg;
        else if (lower.includes("password")) fieldErrs.passwordLogin = msg;
        else general = msg;
      }
      return { fieldErrors: fieldErrs, generalError: general };
    }
    general = "Something went wrong. Please try again.";
    return { fieldErrors: fieldErrs, generalError: general };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!firstName) errors.firstName = "First name required";
    if (!lastName) errors.lastName = "Last name required";
    if (!emailReg) errors.emailReg = "Email required";
    else if (!/\S+@\S+\.\S+/.test(emailReg)) errors.emailReg = "Invalid email";
    if (!phone) errors.phone = "Phone required";
    else if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "10-digit Indian mobile number";
    if (!passwordReg) errors.passwordReg = "Password required";
    else if (passwordReg.length < 8) errors.passwordReg = "Minimum 8 characters";
    if (!confirmPassword) errors.confirmPassword = "Confirm password";
    else if (passwordReg !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    setGeneralError("");
    setFieldErrors({});
    try {
      await register({ firstName, lastName, email: emailReg, phone, password: passwordReg });
    } catch (err) {
      const { fieldErrors, generalError } = parseBackendError(err, true);
      setFieldErrors(fieldErrors);
      if (generalError) setGeneralError(generalError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!emailLogin) errors.emailLogin = "Email required";
    if (!passwordLogin) errors.passwordLogin = "Password required";
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    setGeneralError("");
    setFieldErrors({});
    try {
      await login(emailLogin, passwordLogin);
    } catch (err) {
      const { fieldErrors, generalError } = parseBackendError(err, false);
      setFieldErrors(fieldErrors);
      if (generalError) setGeneralError(generalError);
    } finally {
      setLoading(false);
    }
  };

  const resetMobileFlow = () => {
    setMobileMode(false);
    setMobileNumber("");
    setOtp("");
    setOtpSent(false);
    setResendIn(0);
  };

  const togglePanel = (panel) => {
    setActivePanel(panel);
    setGeneralError("");
    setFieldErrors({});
    resetMobileFlow();
  };

  const openMobileLogin = () => {
    setActivePanel("signin");
    setGeneralError("");
    setFieldErrors({});
    setMobileMode(true);
  };

  // ---------- Mobile number (OTP) login ----------
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setFieldErrors({ mobile: "Enter a valid 10-digit Indian mobile number" });
      return;
    }
    if (!MOBILE_LOGIN_API.send) {
      setGeneralError("Mobile number login is coming soon.");
      return;
    }
    setLoading(true);
    setGeneralError("");
    try {
      const res = await apiFetch(MOBILE_LOGIN_API.send, {
        method: 'POST',
        body: JSON.stringify({ phone: mobileNumber })
      });
      if (res.success) {
        setOtpSent(true);
        setOtp("");
        setResendIn(OTP_RESEND_SECONDS);
      } else {
        setGeneralError(res.message || "Could not send OTP. Please try again.");
      }
    } catch (err) {
      setGeneralError(err.data?.message || err.message || "Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) {
      setFieldErrors({ otp: `Enter the ${OTP_LENGTH}-digit OTP` });
      return;
    }
    if (!MOBILE_LOGIN_API.verify) {
      setGeneralError("Mobile number login is coming soon.");
      return;
    }
    setLoading(true);
    setGeneralError("");
    try {
      const res = await apiFetch(MOBILE_LOGIN_API.verify, {
        method: 'POST',
        body: JSON.stringify({ phone: mobileNumber, otp })
      });
      if (res.success) {
        if (res.data && res.data.user) setUser(res.data.user);
        setShowAuth(false);
      } else {
        setGeneralError(res.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setGeneralError(err.data?.message || err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google login using the built-in component
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setGeneralError("");
    try {
      // The credentialResponse.credential is the ID token (JWT)
      const res = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      if (res.success) {
        setUser(res.data.user);
        setShowAuth(false);
      } else {
        setGeneralError(res.message || 'Google login failed');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setGeneralError(err.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    setGeneralError('Google login failed. Please try again.');
    setGoogleLoading(false);
  };

  /* ---------- UI helpers (no logic) ---------- */
  const isSignin = activePanel === "signin";

  const submitBtnCls =
    "w-full h-12 bg-gradient-to-r from-[#0E7C86] to-[#12948F] hover:from-[#0B6A73] hover:to-[#0E7C86] text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm";

  const renderSocial = (googleText) => {
    if (!SHOW_SOCIAL_LOGIN && !SHOW_MOBILE_LOGIN) return null;
    const googleLabel = googleText === "signup_with" ? "Sign up with Google" : "Continue with Google";
    const googleFallback = (
      <button
        type="button"
        onClick={() => setGeneralError("Google login is not set up yet.")}
        className={SOCIAL_BTN}
      >
        <GoogleG /> {googleLabel}
      </button>
    );
    return (
      <div className="pt-1">
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-xs"><span className="px-3 bg-white text-gray-400">or continue with</span></div>
        </div>
        <div className={`space-y-3 ${googleLoading ? 'opacity-60 pointer-events-none' : ''}`}>
          {SHOW_SOCIAL_LOGIN && (
            <GoogleBoundary fallback={googleFallback}>
              <div className="flex justify-center rounded-xl border border-gray-200 py-1.5 overflow-hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  text={googleText}
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </GoogleBoundary>
          )}
          {SHOW_MOBILE_LOGIN && (
            <button type="button" onClick={openMobileLogin} className={SOCIAL_BTN}>
              <Smartphone size={18} className="text-[#0E7C86]" aria-hidden="true" />
              Continue with Mobile Number
            </button>
          )}
          {SHOW_APPLE_BUTTON && (
            <button
              type="button"
              onClick={() => setGeneralError("Apple login is coming soon.")}
              className={SOCIAL_BTN}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16.4 12.7c0-2.4 2-3.5 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.200-1.200 3-2.300.9-1.300 1.300-2.600 1.300-2.700-.1 0-2.500-1-2.500-3.900zM14 5.600c.7-.8 1.100-1.900 1-3-1 0-2.100.6-2.800 1.400-.6.700-1.200 1.800-1 2.900 1.100.1 2.100-.5 2.800-1.300z" />
              </svg>
              Continue with Apple
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 bg-black/40 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl my-4 sm:my-8 bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row lg:min-h-[700px]">

        {/* ================= LEFT: branding panel (desktop) ================= */}
        <div className="relative hidden lg:flex lg:w-[56%] flex-col bg-gradient-to-br from-[#F4FBFB] via-white to-[#E4F3F2] overflow-hidden">
          <div className="relative z-10 p-8 xl:p-10">
            <img src={LOGO_URL} alt="Puchhuu" className="h-16 w-auto object-contain" />

            <h2 className="mt-10 text-4xl xl:text-[44px] font-extrabold leading-[1.1] text-[#0B1B33] tracking-tight">
              Professional<br />Home Services<br />
              <span className="text-[#10A37F]">At Your Doorstep</span>
            </h2>
            <p className="mt-4 text-[15px] text-[#5B6B7F] max-w-xs">
              Trusted experts for a cleaner, safer and more comfortable home.
            </p>

            <ul className="mt-6 space-y-3.5">
              {FEATURES.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-sm font-medium text-[#1E2E45]">
                  <span className="w-8 h-8 rounded-full bg-[#10A37F] text-white grid place-items-center">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Person photo (optional) */}
          {LOGIN_HERO_IMG && (
            <img
              src={LOGIN_HERO_IMG}
              alt=""
              className="absolute right-0 bottom-24 h-[62%] w-auto object-contain object-bottom"
            />
          )}

          {/* Teal waves */}
          <svg
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-full h-56"
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
          >
            <path d="M0,90 C140,30 300,150 460,100 C600,55 700,70 800,35 L800,220 L0,220 Z" fill="#7FD0CC" opacity="0.55" />
            <path d="M0,130 C160,70 320,170 480,125 C620,85 720,100 800,70 L800,220 L0,220 Z" fill="#0E7C86" opacity="0.92" />
          </svg>

          {/* 50,000+ badge */}
          <div className="absolute left-8 bottom-32 z-10 flex items-center gap-3 rounded-xl bg-[#0B1B33]/90 text-white pl-3 pr-5 py-3 shadow-lg">
            <div className="flex -space-x-2">
              {['from-amber-400 to-orange-500', 'from-pink-400 to-rose-500', 'from-sky-400 to-indigo-500'].map((g, i) => (
                <span key={i} className={`w-9 h-9 rounded-full border-2 border-[#0B1B33] bg-gradient-to-br ${g} grid place-items-center text-xs font-bold`}>
                  {['A', 'R', 'S'][i]}
                </span>
              ))}
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">50,000+</p>
              <p className="text-[11px] text-white/75 leading-tight">Happy Customers in Rajasthan</p>
            </div>
          </div>

          {/* Services strip */}
          <ul className="absolute left-6 right-6 bottom-5 z-10 grid grid-cols-6 gap-2 rounded-2xl bg-white/95 p-2.5 shadow-lg">
            {SERVICE_STRIP.map(({ Icon, label }) => (
              <li key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-[#F4F8F9] py-3 px-1 text-center">
                <Icon className="w-6 h-6 text-[#0E7C86]" aria-hidden="true" />
                <span className="text-[11px] font-medium text-[#1E2E45] leading-tight">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ================= RIGHT: form panel ================= */}
        <div className="relative w-full lg:w-[44%] bg-[#EEF3F5] flex flex-col">
          {/* Back to Home */}
          <div className="flex justify-end px-4 pt-4 sm:px-6 sm:pt-5">
            <button
              type="button"
              onClick={() => setShowAuth(false)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E2E45] hover:text-[#0E7C86] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>

          {/* Mobile / tablet branding */}
          <div className="lg:hidden text-center px-4 pt-2 pb-1">
            <img src={MOBILE_LOGO_URL} alt="Puchhuu" className="h-12 mx-auto object-contain" />
            <p className="text-sm text-gray-600 mt-2">
              {isSignin ? "Welcome back! Sign in to continue" : "Create your account in seconds"}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-5 sm:p-7">

              {/* Tabs */}
              <div className="grid grid-cols-2 border-b border-gray-200 mb-6" role="tablist">
                {[['signin', 'Login'], ['signup', 'Sign Up']].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activePanel === key}
                    onClick={() => togglePanel(key)}
                    className={`pb-3 -mb-px text-sm font-semibold border-b-2 transition-colors ${
                      activePanel === key
                        ? "text-[#0E7C86] border-[#0E7C86]"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {generalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  <span>{generalError}</span>
                </div>
              )}

              {isSignin ? (
                mobileMode ? (
                  <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                    <div className="text-center mb-2">
                      <h2 className="text-2xl font-bold text-[#0B1B33]">Continue with Mobile</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {otpSent ? `Enter the OTP sent to +91 ${mobileNumber}` : "We'll send an OTP to verify your number"}
                      </p>
                    </div>

                    <InputField
                      icon={Phone}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      prefix="+91"
                      placeholder="Mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      error={fieldErrors.mobile}
                      disabled={otpSent}
                    />

                    {otpSent && (
                      <>
                        <InputField
                          icon={ShieldCheck}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          placeholder={`Enter ${OTP_LENGTH}-digit OTP`}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))}
                          error={fieldErrors.otp}
                        />
                        <div className="flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => { setOtpSent(false); setOtp(""); setResendIn(0); }}
                            className="font-medium text-[#0E7C86] hover:underline"
                          >
                            Change number
                          </button>
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={resendIn > 0 || loading}
                            className="font-medium text-[#0E7C86] hover:underline disabled:text-gray-400 disabled:no-underline"
                          >
                            {resendIn > 0 ? `Resend OTP in ${resendIn}s` : "Resend OTP"}
                          </button>
                        </div>
                      </>
                    )}

                    <button type="submit" disabled={loading} className={submitBtnCls}>
                      {loading
                        ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : (otpSent ? "Verify & Continue" : "Send OTP")}
                      {!loading && <ArrowRight size={16} />}
                    </button>

                    <p className="text-center text-sm text-gray-500 pt-1">
                      <button type="button" onClick={resetMobileFlow} className="font-semibold text-[#0E7C86] hover:underline inline-flex items-center gap-1">
                        <ArrowLeft size={14} /> Back to login options
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="text-center mb-2">
                      <h2 className="text-2xl font-bold text-[#0B1B33]">Welcome Back</h2>
                      <p className="text-sm text-gray-500 mt-1">Login to your Puchhuu account</p>
                    </div>

                    <InputField
                      icon={Mail}
                      type="email"
                      placeholder="Enter email address"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                      error={fieldErrors.emailLogin}
                    />
                    <PasswordInput
                      value={passwordLogin}
                      onChange={(e) => setPasswordLogin(e.target.value)}
                      placeholder="Enter password"
                      show={showLoginPassword}
                      toggleShow={() => setShowLoginPassword(!showLoginPassword)}
                      error={fieldErrors.passwordLogin}
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={keepSignedIn}
                          onChange={(e) => setKeepSignedIn(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#0E7C86]"
                          style={{ fontSize: '16px' }}
                        />
                        Keep me signed in
                      </label>
                      <button type="button" className="text-xs font-medium text-[#0E7C86] hover:underline">Forgot Password?</button>
                    </div>

                    <button type="submit" disabled={loading} className={submitBtnCls}>
                      {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Login"}
                      {!loading && <ArrowRight size={16} />}
                    </button>

                    {renderSocial("continue_with")}

                    <p className="text-center text-sm text-gray-500 pt-1">
                      New to Puchhuu?{" "}
                      <button type="button" onClick={() => togglePanel("signup")} className="font-semibold text-[#0E7C86] hover:underline">
                        Create an Account
                      </button>
                    </p>
                  </form>
                )
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="text-center mb-1">
                    <h2 className="text-2xl font-bold text-[#0B1B33]">Create Account</h2>
                    <p className="text-sm text-gray-500 mt-1">Join Puchhuu in seconds</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      icon={User}
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      error={fieldErrors.firstName}
                    />
                    <InputField
                      icon={User}
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      error={fieldErrors.lastName}
                    />
                  </div>
                  <InputField
                    icon={Mail}
                    type="email"
                    placeholder="Email address"
                    value={emailReg}
                    onChange={(e) => setEmailReg(e.target.value)}
                    error={fieldErrors.emailReg}
                  />
                  <InputField
                    icon={Phone}
                    type="tel"
                    prefix="+91"
                    placeholder="Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={fieldErrors.phone}
                  />
                  <PasswordInput
                    value={passwordReg}
                    onChange={(e) => setPasswordReg(e.target.value)}
                    placeholder="Password (min 8 characters)"
                    show={showRegPassword}
                    toggleShow={() => setShowRegPassword(!showRegPassword)}
                    error={fieldErrors.passwordReg}
                  />
                  {passwordReg && (
                    <div className="mt-0">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${passwordStrength.score <= 2 ? "w-1/3 bg-red-500" : passwordStrength.score <= 4 ? "w-2/3 bg-yellow-500" : "w-full bg-green-500"}`} />
                        </div>
                        <span className="text-xs text-gray-500">{passwordStrength.message}</span>
                      </div>
                    </div>
                  )}
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    show={showConfirmPassword}
                    toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={fieldErrors.confirmPassword}
                  />

                  <button type="submit" disabled={loading} className={submitBtnCls}>
                    {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Sign Up"}
                    {!loading && <ArrowRight size={16} />}
                  </button>

                  {renderSocial("signup_with")}

                  <p className="text-center text-sm text-gray-500 pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => togglePanel("signin")} className="font-semibold text-[#0E7C86] hover:underline">
                      Sign In
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0); }
          to { opacity: 1; backdrop-filter: blur(4px); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        input, select, textarea { font-size: 16px !important; }
      `}</style>
    </div>
  );
};

export default Login;