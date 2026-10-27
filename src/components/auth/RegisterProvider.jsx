import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  fetchCategories, 
  fetchServices, 
  registerProvider, 
  register as registerUser,
  createCustomService
} from '../../services/api';
import { 
  Plus, X, Loader2, Upload, Trash2, 
  User, Users, Calendar, MapPin, CreditCard, 
  Briefcase, Clock, CheckCircle, ChevronLeft, ArrowRight, Check,
  FileText, Mail, Phone, IndianRupee, TrendingUp, ShieldCheck,
  Headphones, Star, Wallet, AlertTriangle
} from 'lucide-react';

/* ------------------------------------------------------------------
   UI-ONLY SETTINGS (backend se koi lena-dena nahi)
------------------------------------------------------------------ */

// Left side me professional ki photo (transparent PNG best). Khali = sirf gradient dikhega.
const PARTNER_HERO_IMG = ''; // e.g. 'https://res.cloudinary.com/.../partner.png'

const PARTNER_BENEFITS = [
  { Icon: IndianRupee, title: 'Get More Bookings', sub: 'Regular leads in your area' },
  { Icon: TrendingUp,  title: 'Grow Your Income', sub: 'Flexible working hours' },
  { Icon: ShieldCheck, title: 'Be a Verified Professional', sub: 'Build customer trust' },
  { Icon: Headphones,  title: 'Dedicated Support', sub: '24/7 partner support' },
];

const PARTNER_PERKS = [
  { Icon: Calendar, line1: 'Flexible', line2: 'Work Schedule' },
  { Icon: Wallet,   line1: 'Fast & Secure', line2: 'Payments' },
  { Icon: Star,     line1: 'Build', line2: 'Your Brand' },
];

const INPUT =
  'w-full h-12 border border-gray-200 bg-white rounded-xl px-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]';
const INPUT_ICON =
  'w-full h-12 border border-gray-200 bg-white rounded-xl pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]';
const INPUT_READONLY = 'bg-gray-50 text-gray-500 cursor-not-allowed';
const LABEL = 'block text-sm font-medium text-[#0B1B33] mb-1.5';
const PRIMARY_BTN =
  'h-12 px-6 rounded-xl bg-gradient-to-r from-[#0E7C86] to-[#12948F] hover:from-[#0B6A73] hover:to-[#0E7C86] text-white font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm';
const SECTION_TITLE = 'flex items-center gap-2 text-[#0E7C86]';
const SECTION_H = 'text-lg sm:text-xl font-bold text-[#0B1B33]';


const compressImageForUpload = async (file) => {
  const maxBytes = 750 * 1024; // 750 KB per image
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Image could not be loaded'));
      image.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Image compression is not supported');

    const initialScale = Math.min(
      1,
      1800 / image.width,
      1800 / image.height
    );

    const qualities = [0.85, 0.78, 0.70, 0.62, 0.55, 0.48];

    for (let attempt = 0; attempt < qualities.length; attempt++) {
      const scale = initialScale * Math.pow(0.85, attempt);

      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error('Image compression failed'));
          },
          'image/jpeg',
          qualities[attempt]
        );
      });

      if (blob.size <= maxBytes || attempt === qualities.length - 1) {
        return new File(
          [blob],
          `${file.name.replace(/\.[^.]+$/, '')}.jpg`,
          { type: 'image/jpeg', lastModified: Date.now() }
        );
      }
    }

    throw new Error('Image compression failed');
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

/* ------------------------------------------------------------------
   UI components (no logic) — component ke bahar define hain taaki
   typing ke time inputs ka focus na jaye
------------------------------------------------------------------ */

const PartnerSide = () => (
  <div className="relative hidden lg:block min-h-[700px] lg:sticky lg:top-6">
    <h1 className="text-5xl xl:text-[56px] font-extrabold leading-[1.05] tracking-tight text-[#0B1B33]">
      Become a<br />
      <span className="text-[#0E7C86]">Puchhuu Partner</span>
    </h1>
    <p className="mt-4 text-[15px] text-[#5B6B7F] max-w-sm">
      Join thousands of verified professionals and grow your business with Puchhuu.
    </p>

    <ul className="mt-7 space-y-4">
      {PARTNER_BENEFITS.map(({ Icon, title, sub }) => (
        <li key={title} className="flex items-center gap-3.5">
          <span className="w-11 h-11 shrink-0 rounded-full bg-[#0B5C63] text-white grid place-items-center">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-[15px] font-semibold text-[#0B1B33] leading-tight">{title}</span>
            <span className="block text-[13px] text-[#5B6B7F] leading-tight mt-0.5">{sub}</span>
          </span>
        </li>
      ))}
    </ul>

    {/* soft blob behind the photo */}
    <div aria-hidden="true" className="absolute right-0 top-40 w-[300px] h-[420px] rounded-[48px] bg-gradient-to-b from-[#CDEBE8] to-transparent opacity-70" />

    {PARTNER_HERO_IMG && (
      <img
        src={PARTNER_HERO_IMG}
        alt=""
        className="absolute right-0 bottom-20 h-[62%] w-auto object-contain object-bottom"
      />
    )}

    {/* 10,000+ badge */}
    <div className="absolute left-0 bottom-24 flex items-center gap-3 rounded-xl bg-white shadow-lg pl-3 pr-5 py-2.5">
      <div className="flex -space-x-2">
        {['from-amber-400 to-orange-500', 'from-pink-400 to-rose-500', 'from-sky-400 to-indigo-500'].map((g, i) => (
          <span key={i} className={`w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br ${g} grid place-items-center text-xs font-bold text-white`}>
            {['A', 'R', 'S'][i]}
          </span>
        ))}
      </div>
      <div>
        <p className="text-lg font-bold text-[#0B1B33] leading-tight">10,000+</p>
        <p className="text-[11px] text-[#5B6B7F] leading-tight">Active Service Partners</p>
      </div>
    </div>

    {/* Perks */}
    <ul className="absolute left-0 right-0 bottom-0 grid grid-cols-3 gap-3">
      {PARTNER_PERKS.map(({ Icon, line1, line2 }) => (
        <li key={line1} className="flex items-center gap-3 rounded-xl bg-white shadow-md px-3.5 py-3">
          <span className="w-10 h-10 shrink-0 rounded-lg bg-[#E3F5F1] text-[#0E7C86] grid place-items-center">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="text-[13px] leading-tight text-[#0B1B33]">
            <span className="block font-semibold">{line1}</span>
            <span className="block">{line2}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const PartnerShell = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#F2FAFA] via-white to-[#E8F4F3] py-6 sm:py-10 px-3 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-12 items-start">
      <PartnerSide />

      <div>
        {/* mobile / tablet heading */}
        <div className="lg:hidden text-center mb-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0B1B33]">
            Become a <span className="text-[#0E7C86]">Puchhuu Partner</span>
          </h1>
          <p className="mt-2 text-sm text-[#5B6B7F]">
            Join thousands of verified professionals and grow your business.
          </p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const Stepper = ({ steps, titles, current }) => {
  const idx = steps.indexOf(current);
  const last = steps.length - 1;
  return (
    <ol className="flex mt-6 mb-7" aria-label="Registration progress">
      {steps.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="relative flex-1 flex flex-col items-center" aria-current={active ? 'step' : undefined}>
            {i !== last && (
              <span
                aria-hidden="true"
                className={`absolute top-[15px] left-1/2 w-full h-0.5 ${done ? 'bg-[#0E7C86]' : 'bg-gray-200'}`}
              />
            )}
            <span
              className={`relative z-10 w-8 h-8 rounded-full grid place-items-center text-sm font-semibold ${
                done || active ? 'bg-[#0E7C86] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {done ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
            </span>
            <span
              className={`mt-2 px-0.5 text-center text-[10px] sm:text-[11px] leading-tight ${
                active ? 'font-semibold text-[#0B1B33]' : 'text-gray-500'
              }`}
            >
              {titles[i]}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

const UploadBox = ({ preview, onPick, onRemove, label, imgClass = 'h-24 object-cover rounded-lg' }) => (
  <div className="border-2 border-dashed border-gray-300 hover:border-[#0E7C86] rounded-xl p-3 text-center transition-colors">
    {preview ? (
      <div className="relative inline-block">
        <img src={preview} alt="" className={imgClass} />
        <button type="button" onClick={onRemove} aria-label="Remove file" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
          <X size={12} />
        </button>
      </div>
    ) : (
      <button type="button" onClick={onPick} className="w-full flex flex-col items-center gap-1.5 py-3 text-gray-500 hover:text-[#0E7C86] transition">
        <Upload size={22} />
        <span className="text-sm">{label}</span>
      </button>
    )}
  </div>
);


const RegisterProvider = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(user ? 2 : 1);
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 7;

  // User registration state (step 1)
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Provider form state
  const [providerData, setProviderData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    avatar: null,
    avatarPreview: null,
    category: '',
    customServices: [],
    experience: '',
    skills: [],
    currentAddress: '',
    state: '',
    city: '',
    pincode: '',
    coordinates: { lat: null, lng: null },
    aadharFront: null,
    aadharFrontPreview: null,
    aadharBack: null,
    aadharBackPreview: null,
    panFront: null,
    panFrontPreview: null,
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    isAvailable: true,
    workingHours: [
      { day: 'monday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'tuesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'wednesday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'thursday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'friday', isWorking: true, slots: [{ startTime: '09:00', endTime: '18:00' }] },
      { day: 'saturday', isWorking: true, slots: [{ startTime: '09:00', endTime: '14:00' }] },
      { day: 'sunday', isWorking: false, slots: [] },
    ],
    emergencyServiceAvailable: false
  });

  // Categories & sub‑services
  const [categories, setCategories] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [filteredSubServices, setFilteredSubServices] = useState([]);
  const [selectedSubServices, setSelectedSubServices] = useState([]);

  // Custom service modal
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServiceDescription, setCustomServiceDescription] = useState('');
  const [customServiceImage, setCustomServiceImage] = useState(null);
  const [customServiceImagePreview, setCustomServiceImagePreview] = useState(null);
  const [creatingCustomService, setCreatingCustomService] = useState(false);
  const [customServiceError, setCustomServiceError] = useState('');
  const customFileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const aadharFrontInputRef = useRef(null);
  const aadharBackInputRef = useRef(null);
  const panFrontInputRef = useRef(null);

  // Load categories
  useEffect(() => {
    loadCategoriesAndServices();
  }, []);

  const loadCategoriesAndServices = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        fetchCategories(),
        fetchServices(1, 100)
      ]);
      if (catRes.success) setCategories(catRes.data.categories || []);
      if (svcRes.success) setSubServices(svcRes.data.services || []);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  useEffect(() => {
    if (providerData.category) {
      const filtered = subServices.filter(s => s.category?._id === providerData.category);
      setFilteredSubServices(filtered);
    } else {
      setFilteredSubServices([]);
    }
  }, [providerData.category, subServices]);

  // Step 1: User registration
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password
      });
      setStep(2);
      setCurrentStep(2);
      if (setUser) setUser(res.data.user);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // File upload handlers
  const handleFileChange = (e, field, previewField) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB. Please compress your image.');
      e.target.value = '';
      return;
    }
    if (providerData[previewField]) {
      URL.revokeObjectURL(providerData[previewField]);
    }
    setProviderData(prev => ({
      ...prev,
      [field]: file,
      [previewField]: URL.createObjectURL(file)
    }));
  };

  const removeFile = (field, previewField) => {
    if (providerData[previewField]) {
      URL.revokeObjectURL(providerData[previewField]);
    }
    setProviderData(prev => ({
      ...prev,
      [field]: null,
      [previewField]: null
    }));
    if (field === 'avatar' && avatarInputRef.current) avatarInputRef.current.value = '';
    if (field === 'aadharFront' && aadharFrontInputRef.current) aadharFrontInputRef.current.value = '';
    if (field === 'aadharBack' && aadharBackInputRef.current) aadharBackInputRef.current.value = '';
    if (field === 'panFront' && panFrontInputRef.current) panFrontInputRef.current.value = '';
  };

  // Custom service creation
  const handleCreateCustomService = async () => {
    setCustomServiceError('');
    if (!providerData.category) {
      setCustomServiceError('Please select a main category first.');
      return;
    }
    if (!customServiceName.trim()) {
      setCustomServiceError('Service name is required.');
      return;
    }
    if (!customServicePrice || isNaN(customServicePrice) || customServicePrice <= 0) {
      setCustomServiceError('Valid price is required.');
      return;
    }
    if (customServiceImage && customServiceImage.size > 5 * 1024 * 1024) {
      setCustomServiceError('Image size must be less than 5MB. Please compress.');
      return;
    }

    setCreatingCustomService(true);
    try {
      const formData = new FormData();
      formData.append('name', customServiceName.trim());
      formData.append('category', providerData.category);
      formData.append('basePrice', customServicePrice);
      formData.append('description', customServiceDescription || customServiceName);
      if (customServiceImage) {
        formData.append('image', customServiceImage);
      }

      const res = await createCustomService(formData);
      if (res.success && res.data.service) {
        const newService = res.data.service;
        setProviderData(prev => ({
          ...prev,
          customServices: [...prev.customServices, {
            _id: newService._id,
            name: newService.name,
            price: newService.basePrice,
            image: newService.images?.[0]?.url || null
          }]
        }));
        setShowCustomServiceModal(false);
        resetCustomServiceForm();
      } else {
        setCustomServiceError(res.message || 'Failed to create custom service.');
      }
    } catch (err) {
      setCustomServiceError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCreatingCustomService(false);
    }
  };

  const resetCustomServiceForm = () => {
    setCustomServiceName('');
    setCustomServicePrice('');
    setCustomServiceDescription('');
    if (customServiceImagePreview) URL.revokeObjectURL(customServiceImagePreview);
    setCustomServiceImage(null);
    setCustomServiceImagePreview(null);
    setCustomServiceError('');
    if (customFileInputRef.current) customFileInputRef.current.value = '';
  };

  const removeCustomService = (index) => {
    setProviderData(prev => ({
      ...prev,
      customServices: prev.customServices.filter((_, i) => i !== index)
    }));
  };

  const toggleSubService = (serviceId) => {
    setSelectedSubServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const skillsList = ['Installation', 'Repair', 'Maintenance', 'Emergency Service'];
  const toggleSkill = (skill) => {
    setProviderData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleWorkingHourChange = (day, field, value) => {
    setProviderData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day ? { ...wh, [field]: value } : wh
      ),
    }));
  };

  const handleTimeChange = (day, slotIndex, field, value) => {
    setProviderData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh =>
        wh.day === day
          ? {
              ...wh,
              slots: wh.slots.map((slot, idx) =>
                idx === slotIndex ? { ...slot, [field]: value } : slot
              ),
            }
          : wh
      ),
    }));
  };

  // Error parser helper
  const parseBackendError = (err) => {
    // Validation error with fields (status 422)
    if (err.data && err.data.errors && Array.isArray(err.data.errors)) {
      const fieldErrors = {};
      err.data.errors.forEach(e => {
        if (e.field) fieldErrors[e.field] = e.message;
      });
      return { fieldErrors, generalMessage: err.data.message || 'Validation failed' };
    }
    // Multer file size error
    if (err.message && err.message.toLowerCase().includes('file too large')) {
      return { fieldErrors: {}, generalMessage: 'Image size should be less than 5MB. Please compress and try again.' };
    }
    return { fieldErrors: {}, generalMessage: err.message || 'Something went wrong. Please try again.' };
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validations
    if (!providerData.fullName.trim()) {
      setError('Please enter your full name');
      setCurrentStep(2);
      setLoading(false);
      return;
    }
    if (!providerData.category) {
      setError('Please select a main service category');
      setCurrentStep(3);
      setLoading(false);
      return;
    }
    if (selectedSubServices.length === 0 && providerData.customServices.length === 0) {
      setError('Please select at least one sub‑service or add a custom service');
      setCurrentStep(3);
      setLoading(false);
      return;
    }
    if (!providerData.currentAddress.trim() || !providerData.city.trim() || !providerData.pincode.trim()) {
      setError('Please fill complete address details (Address, City, Pincode)');
      setCurrentStep(4);
      setLoading(false);
      return;
    }
    if (!providerData.accountHolderName.trim() || !providerData.bankName.trim() || !providerData.accountNumber.trim() || !providerData.ifscCode.trim()) {
      setError('Please fill all bank details (Account Holder, Bank Name, Account Number, IFSC)');
      setCurrentStep(6);
      setLoading(false);
      return;
    }
    if (!providerData.aadharFront && !providerData.panFront) {
      setError('Please upload at least Aadhaar Front or PAN card for KYC');
      setCurrentStep(5);
      setLoading(false);
      return;
    }

    console.log('📎 Files attached:', {
      avatar: !!providerData.avatar,
      aadharFront: !!providerData.aadharFront,
      aadharBack: !!providerData.aadharBack,
      panFront: !!providerData.panFront
    });

    try {
      const formData = new FormData();
      // if (providerData.avatar) formData.append('avatar', providerData.avatar);
      formData.append('fullName', providerData.fullName);
      formData.append('dateOfBirth', providerData.dateOfBirth);
      formData.append('gender', providerData.gender);
      formData.append('bio', providerData.skills.join(', '));

      const allSubServiceIds = [...selectedSubServices, ...providerData.customServices.map(s => s._id)];
      const servicesPayload = [{ category: providerData.category, subServices: allSubServiceIds }];
      formData.append('services', JSON.stringify(servicesPayload));
      const experienceYears = parseInt(providerData.experience) || 0;
      formData.append('experience', JSON.stringify({ years: experienceYears, description: providerData.skills.join(', ') }));

      const serviceArea = {
        address: providerData.currentAddress,
        state: providerData.state,
        city: providerData.city,
        pincode: providerData.pincode,
        radius: 10,
        coordinates: {
          type: 'Point',
          coordinates: providerData.coordinates.lng && providerData.coordinates.lat
            ? [parseFloat(providerData.coordinates.lng), parseFloat(providerData.coordinates.lat)]
            : [0, 0]
        }
      };
      formData.append('serviceArea', JSON.stringify(serviceArea));
      formData.append('currentAddress', providerData.currentAddress);

     
if (providerData.avatar) {
  formData.append(
    'avatar',
    await compressImageForUpload(providerData.avatar)
  );
}

if (providerData.aadharFront) {
  formData.append(
    'aadharFront',
    await compressImageForUpload(providerData.aadharFront)
  );
}

if (providerData.aadharBack) {
  formData.append(
    'aadharBack',
    await compressImageForUpload(providerData.aadharBack)
  );
}

if (providerData.panFront) {
  formData.append(
    'panFront',
    await compressImageForUpload(providerData.panFront)
  );
}


      formData.append('bankDetails', JSON.stringify({
        accountHolderName: providerData.accountHolderName,
        bankName: providerData.bankName,
        accountNumber: providerData.accountNumber,
        ifscCode: providerData.ifscCode,
        upiId: providerData.upiId || ''
      }));

      formData.append('workingHours', JSON.stringify(providerData.workingHours));
      formData.append('isAvailable', providerData.isAvailable);
      formData.append('emergencyServiceAvailable', providerData.emergencyServiceAvailable);
      formData.append('businessName', `${providerData.fullName}'s Services`);

      const res = await registerProvider(formData);
      if (res.success) {
        setSuccess(true);
        if (setUser) setUser(prev => ({ ...prev, role: 'provider' }));
        setTimeout(() => navigate('/provider'), 2000);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      const { fieldErrors, generalMessage } = parseBackendError(err);
      
      if (Object.keys(fieldErrors).length > 0) {
        let step = null;
        let specificError = '';
        if (fieldErrors.fullName || fieldErrors.firstName || fieldErrors.lastName) {
          step = 2;
          specificError = fieldErrors.fullName || fieldErrors.firstName || fieldErrors.lastName || 'Please check your personal information.';
        } else if (fieldErrors.category || fieldErrors.services || fieldErrors.subServices) {
          step = 3;
          specificError = fieldErrors.category || fieldErrors.services || fieldErrors.subServices || 'Please select valid services.';
        } else if (fieldErrors.currentAddress || fieldErrors.city || fieldErrors.pincode) {
          step = 4;
          specificError = fieldErrors.currentAddress || fieldErrors.city || fieldErrors.pincode || 'Please fill complete address.';
        } else if (fieldErrors.aadharFront || fieldErrors.panFront || fieldErrors.documents) {
          step = 5;
          specificError = fieldErrors.aadharFront || fieldErrors.panFront || fieldErrors.documents || 'Please upload valid document images.';
        } else if (fieldErrors.accountHolderName || fieldErrors.bankName || fieldErrors.accountNumber || fieldErrors.ifscCode) {
          step = 6;
          specificError = fieldErrors.accountHolderName || fieldErrors.bankName || fieldErrors.accountNumber || fieldErrors.ifscCode || 'Please check your bank details.';
        } else {
          specificError = generalMessage;
        }
        if (step) setCurrentStep(step);
        setError(specificError);
      } else {
        setError(generalMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 2) setCurrentStep(currentStep - 1);
  };

  /* ---------------- Render functions (UI only) ---------------- */

  const renderPersonalInfo = () => (
    <div className="space-y-5">
      <div className={SECTION_TITLE}>
        <User size={22} />
        <h2 className={SECTION_H}>Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Full Name <span className="text-red-500">*</span></label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Enter your full name" value={providerData.fullName} onChange={e => setProviderData({...providerData, fullName: e.target.value})} className={INPUT_ICON} required />
          </div>
        </div>

        {/* Account details (read-only, comes from the logged-in account) */}
        <div>
          <label className={LABEL}>Mobile Number</label>
          <div className="flex">
            <span className="h-12 px-3 flex items-center gap-1 text-sm text-gray-600 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50">🇮🇳 +91</span>
            <input type="tel" readOnly placeholder="From your account" value={user?.phone || userForm.phone || ''} className={`${INPUT} rounded-l-none ${INPUT_READONLY}`} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" readOnly placeholder="From your account" value={user?.email || userForm.email || ''} className={`${INPUT_ICON} ${INPUT_READONLY}`} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Date of Birth</label>
          <input type="date" value={providerData.dateOfBirth} onChange={e => setProviderData({...providerData, dateOfBirth: e.target.value})} className={INPUT} />
        </div>

        <div className="md:col-span-2">
          <label className={LABEL}>Gender</label>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[['male', 'Male', User], ['female', 'Female', User], ['other', 'Other', Users]].map(([val, text, GIcon]) => {
              const selected = providerData.gender === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setProviderData({...providerData, gender: val})}
                  aria-pressed={selected}
                  className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-sm transition ${
                    selected
                      ? 'border-[#0E7C86] bg-[#E8F6F5] text-[#0E7C86] font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <GIcon size={20} />
                  {text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className={LABEL}>Profile Photo</label>
          <UploadBox
            preview={providerData.avatarPreview}
            onPick={() => avatarInputRef.current?.click()}
            onRemove={() => removeFile('avatar', 'avatarPreview')}
            label="Click to upload photo"
            imgClass="w-28 h-28 rounded-full object-cover mx-auto"
          />
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar', 'avatarPreview')} className="hidden" />
        </div>
      </div>
    </div>
  );

  const renderServiceDetails = () => (
    <div className="space-y-5">
      <div className={SECTION_TITLE}>
        <Briefcase size={22} />
        <h2 className={SECTION_H}>Service Details</h2>
      </div>
      <div>
        <label className={LABEL}>Main Service Category <span className="text-red-500">*</span></label>
        <select value={providerData.category} onChange={e => setProviderData({...providerData, category: e.target.value})} className={INPUT}>
          <option value="">Select a category</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
      </div>
      {providerData.category && (
        <>
          <div>
            <label className={LABEL}>Sub‑Services (Select from existing)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
              {filteredSubServices.length === 0 ? (
                <p className="text-gray-500 text-sm sm:col-span-2">No sub‑services available.</p>
              ) : (
                filteredSubServices.map(service => (
                  <label key={service._id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer text-sm">
                    <input type="checkbox" checked={selectedSubServices.includes(service._id)} onChange={() => toggleSubService(service._id)} className="w-4 h-4 accent-[#0E7C86]" />
                    <span>{service.name} (₹{service.basePrice})</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[#0B1B33]">Custom Services (Add your own)</label>
              <button type="button" onClick={() => setShowCustomServiceModal(true)} className="text-sm bg-[#0E7C86] text-white px-3 py-1.5 rounded-lg hover:bg-[#0B6A73] flex items-center gap-1">
                <Plus size={14} /> Add Service
              </button>
            </div>
            {providerData.customServices.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500">No custom services added yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {providerData.customServices.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    {svc.image ? <img src={svc.image} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center"><FileText size={24} className="text-gray-400" /></div>}
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{svc.name}</p><p className="text-[#0E7C86] font-semibold text-sm">₹{svc.price}</p></div>
                    <button type="button" onClick={() => removeCustomService(idx)} aria-label="Remove service" className="text-red-500 hover:bg-red-50 rounded-lg p-1"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={LABEL}>Experience</label>
            <select value={providerData.experience} onChange={e => setProviderData({...providerData, experience: e.target.value})} className={INPUT}>
              <option value="">Select experience</option>
              <option value="1">0‑1 Year</option>
              <option value="2">1‑3 Years</option>
              <option value="4">3‑5 Years</option>
              <option value="6">5+ Years</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Skills</label>
            <div className="flex flex-wrap gap-2">
              {skillsList.map(skill => {
                const on = providerData.skills.includes(skill);
                return (
                  <label key={skill} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition ${on ? 'border-[#0E7C86] bg-[#E8F6F5] text-[#0E7C86]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="checkbox" checked={on} onChange={() => toggleSkill(skill)} className="w-4 h-4 accent-[#0E7C86]" />
                    <span>{skill}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderLocationDetails = () => (
    <div className="space-y-5">
      <div className={SECTION_TITLE}>
        <MapPin size={22} />
        <h2 className={SECTION_H}>Location Details</h2>
      </div>
      <div>
        <label className={LABEL}>Full Address <span className="text-red-500">*</span></label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <textarea rows={3} value={providerData.currentAddress} onChange={e => setProviderData({...providerData, currentAddress: e.target.value})} className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]" placeholder="Enter your complete address (House/Flat No., Street, Area)" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={LABEL}>State <span className="text-red-500">*</span></label><input type="text" placeholder="e.g. Rajasthan" value={providerData.state} onChange={e => setProviderData({...providerData, state: e.target.value})} className={INPUT} /></div>
        <div><label className={LABEL}>City <span className="text-red-500">*</span></label><input type="text" placeholder="e.g. Jaipur" value={providerData.city} onChange={e => setProviderData({...providerData, city: e.target.value})} className={INPUT} /></div>
        <div><label className={LABEL}>Pincode <span className="text-red-500">*</span></label><input type="text" placeholder="6-digit pincode" value={providerData.pincode} onChange={e => setProviderData({...providerData, pincode: e.target.value})} className={INPUT} /></div>
      </div>
      <div>
        <label className={LABEL}>GPS Location (Optional)</label>
        <button type="button" onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              setProviderData(prev => ({ ...prev, coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude } }));
            });
          }
        }} className="flex items-center gap-2 bg-[#E8F6F5] text-[#0E7C86] px-4 py-2.5 rounded-xl hover:bg-[#D5EFED] text-sm font-medium transition">
          <MapPin size={18} /> Get Current Location
        </button>
        {providerData.coordinates.lat && <p className="text-xs text-gray-500 mt-1.5">Lat: {providerData.coordinates.lat}, Lng: {providerData.coordinates.lng}</p>}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-5">
      <div className={SECTION_TITLE}>
        <FileText size={22} />
        <h2 className={SECTION_H}>Required Documents</h2>
      </div>
      <div className="border border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
        <h3 className="font-semibold text-[#0B1B33]">Aadhaar Card</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Front Side</label>
            <UploadBox preview={providerData.aadharFrontPreview} onPick={() => aadharFrontInputRef.current?.click()} onRemove={() => removeFile('aadharFront', 'aadharFrontPreview')} label="Upload" />
            <input ref={aadharFrontInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharFront', 'aadharFrontPreview')} className="hidden" />
          </div>
          <div>
            <label className={LABEL}>Back Side</label>
            <UploadBox preview={providerData.aadharBackPreview} onPick={() => aadharBackInputRef.current?.click()} onRemove={() => removeFile('aadharBack', 'aadharBackPreview')} label="Upload" />
            <input ref={aadharBackInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadharBack', 'aadharBackPreview')} className="hidden" />
          </div>
        </div>
      </div>
      <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
        <h3 className="font-semibold text-[#0B1B33] mb-3">PAN Card</h3>
        <UploadBox preview={providerData.panFrontPreview} onPick={() => panFrontInputRef.current?.click()} onRemove={() => removeFile('panFront', 'panFrontPreview')} label="Upload Front Side" />
        <input ref={panFrontInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'panFront', 'panFrontPreview')} className="hidden" />
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="space-y-5">
      <div className={SECTION_TITLE}>
        <CreditCard size={22} />
        <h2 className={SECTION_H}>Bank Details (For Withdrawals)</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={LABEL}>Account Holder Name <span className="text-red-500">*</span></label><input placeholder="As per bank records" value={providerData.accountHolderName} onChange={e => setProviderData({...providerData, accountHolderName: e.target.value})} className={INPUT} /></div>
        <div><label className={LABEL}>Bank Name <span className="text-red-500">*</span></label><input placeholder="e.g. State Bank of India" value={providerData.bankName} onChange={e => setProviderData({...providerData, bankName: e.target.value})} className={INPUT} /></div>
        <div><label className={LABEL}>Account Number <span className="text-red-500">*</span></label><input type="number" placeholder="Enter account number" value={providerData.accountNumber} onChange={e => setProviderData({...providerData, accountNumber: e.target.value})} className={INPUT} /></div>
        <div><label className={LABEL}>IFSC Code <span className="text-red-500">*</span></label><input placeholder="e.g. SBIN0001234" value={providerData.ifscCode} onChange={e => setProviderData({...providerData, ifscCode: e.target.value})} className={INPUT} /></div>
        <div><label className={LABEL}>UPI ID (Optional)</label><input value={providerData.upiId} onChange={e => setProviderData({...providerData, upiId: e.target.value})} className={INPUT} placeholder="example@upi" /></div>
      </div>
    </div>
  );

  const toggleBtn = (active, activeCls) =>
    `h-11 px-5 rounded-xl text-sm font-medium transition ${active ? activeCls : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;

  const renderWorkSettings = () => (
    <div className="space-y-5">
      <div className={SECTION_TITLE}>
        <Clock size={22} />
        <h2 className={SECTION_H}>Work Settings</h2>
      </div>
      <div>
        <label className={LABEL}>Availability</label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setProviderData({...providerData, isAvailable: true})} className={toggleBtn(providerData.isAvailable, 'bg-[#0E7C86] text-white')}>Online</button>
          <button type="button" onClick={() => setProviderData({...providerData, isAvailable: false})} className={toggleBtn(!providerData.isAvailable, 'bg-red-600 text-white')}>Offline</button>
        </div>
      </div>
      <div>
        <label className={LABEL}>Working Hours</label>
        <div className="space-y-2">
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
            const wh = providerData.workingHours.find(w => w.day === day);
            return (
              <div key={day} className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-2">
                <div className="w-24 font-medium capitalize text-sm">{day}</div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#0E7C86]" checked={wh.isWorking} onChange={e => handleWorkingHourChange(day, 'isWorking', e.target.checked)} /> Open</label>
                {wh.isWorking && (
                  <div className="flex items-center gap-2">
                    <input type="time" value={wh.slots[0]?.startTime || '09:00'} onChange={e => handleTimeChange(day, 0, 'startTime', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                    <span>–</span>
                    <input type="time" value={wh.slots[0]?.endTime || '18:00'} onChange={e => handleTimeChange(day, 0, 'endTime', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <label className={LABEL}>Emergency Service Available</label>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setProviderData({...providerData, emergencyServiceAvailable: true})} className={toggleBtn(providerData.emergencyServiceAvailable, 'bg-[#0E7C86] text-white')}>Yes</button>
          <button type="button" onClick={() => setProviderData({...providerData, emergencyServiceAvailable: false})} className={toggleBtn(!providerData.emergencyServiceAvailable, 'bg-red-600 text-white')}>No</button>
        </div>
      </div>
    </div>
  );

  // Custom service modal with improved error display and image size check
  const customServiceModal = showCustomServiceModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#0B1B33]">Add Custom Service</h3>
          <button onClick={() => setShowCustomServiceModal(false)} aria-label="Close" className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        {customServiceError && (
          <div className="mb-4 p-2.5 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{customServiceError}</span>
          </div>
        )}
        <div className="space-y-4">
          <div><label className={LABEL}>Service Name *</label><input type="text" value={customServiceName} onChange={e => setCustomServiceName(e.target.value)} className={INPUT} /></div>
          <div><label className={LABEL}>Price (₹) *</label><input type="number" step="1" value={customServicePrice} onChange={e => setCustomServicePrice(e.target.value)} className={INPUT} /></div>
          <div><label className={LABEL}>Description</label><textarea rows="2" value={customServiceDescription} onChange={e => setCustomServiceDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]" /></div>
          <div><label className={LABEL}>Service Image (max 5MB)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
              {customServiceImagePreview ? (
                <div className="relative inline-block"><img src={customServiceImagePreview} alt="" className="w-32 h-32 object-cover rounded-lg" /><button type="button" onClick={() => { URL.revokeObjectURL(customServiceImagePreview); setCustomServiceImage(null); setCustomServiceImagePreview(null); }} aria-label="Remove image" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={14} /></button></div>
              ) : (
                <button type="button" onClick={() => customFileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-gray-500 mx-auto"><Upload size={24} /><span className="text-sm">Click to upload</span></button>
              )}
              <input ref={customFileInputRef} type="file" accept="image/*" onChange={(e) => { 
                const file = e.target.files[0]; 
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    setCustomServiceError('Image size must be less than 5MB. Please compress.');
                    e.target.value = '';
                    return;
                  }
                  setCustomServiceImage(file); 
                  setCustomServiceImagePreview(URL.createObjectURL(file)); 
                  setCustomServiceError('');
                } 
              }} className="hidden" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowCustomServiceModal(false); resetCustomServiceForm(); }} className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium">Cancel</button>
            <button onClick={handleCreateCustomService} disabled={creatingCustomService} className="flex-1 h-11 bg-[#0E7C86] hover:bg-[#0B6A73] text-white rounded-xl flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50">
              {creatingCustomService ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Early returns (already a provider, success)
  if (user?.role === 'provider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2FAFA] via-white to-[#E8F4F3]">
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2 text-[#0B1B33]">You are already a provider</h2>
          <Link to="/provider" className="text-[#0E7C86] font-medium hover:underline">Go to your dashboard</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F2FAFA] via-white to-[#E8F4F3]">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2 text-[#0B1B33]">Registration Submitted!</h2>
          <p className="text-gray-600 mb-5">Your application is under review. You will be notified once verified.</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-[#0E7C86] to-[#12948F] text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition font-semibold">Go Home</Link>
        </div>
      </div>
    );
  }

  // Step 1: User registration
  if (!user && step === 1) {
    return (
      <PartnerShell>
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-7">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1B33]">Create an Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join as a service provider</p>

          {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}

          <form onSubmit={handleUserSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="First Name" value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} className={INPUT} required />
              <input type="text" placeholder="Last Name" value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} className={INPUT} required />
            </div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" placeholder="Email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className={INPUT_ICON} required />
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="tel" placeholder="Phone (10 digits)" value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})} className={INPUT_ICON} required />
            </div>
            <input type="password" placeholder="Password (min 8 chars)" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className={INPUT} required />
            <input type="password" placeholder="Confirm Password" value={userForm.confirmPassword} onChange={e => setUserForm({...userForm, confirmPassword: e.target.value})} className={INPUT} required />
            <button type="submit" disabled={loading} className={`${PRIMARY_BTN} w-full`}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Continue'}
              {!loading && <ArrowRight size={18} />}
            </button>
            <p className="text-center text-sm text-gray-500">Already a partner? <Link to="/login" className="text-[#0E7C86] font-semibold hover:underline">Login Here</Link></p>
          </form>
        </div>
      </PartnerShell>
    );
  }

  // Step 2–7: Provider Registration
  const steps = [2, 3, 4, 5, 6, 7];
  const stepTitles = ['Basic Details', 'Service Details', 'Location', 'Documents', 'Bank Details', 'Work Settings'];

  return (
    <>
      <PartnerShell>
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-7">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1B33]">Register as a Service Provider</h2>
          <p className="text-sm text-gray-500 mt-1">Tell us about yourself and start getting bookings</p>

          <Stepper steps={steps} titles={stepTitles} current={currentStep} />

          {error && <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleProviderSubmit}>
            {currentStep === 2 && renderPersonalInfo()}
            {currentStep === 3 && renderServiceDetails()}
            {currentStep === 4 && renderLocationDetails()}
            {currentStep === 5 && renderDocuments()}
            {currentStep === 6 && renderBankDetails()}
            {currentStep === 7 && renderWorkSettings()}

            <div className="flex items-center gap-3 mt-8">
              {currentStep > 2 && (
                <button type="button" onClick={prevStep} className="h-12 px-5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5 text-sm font-medium">
                  <ChevronLeft size={18} /> Previous
                </button>
              )}
              {currentStep < totalSteps ? (
                <button type="button" onClick={nextStep} className={`${PRIMARY_BTN} flex-1`}>
                  Save &amp; Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button type="submit" disabled={loading} className={`${PRIMARY_BTN} flex-1`}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </PartnerShell>
      {customServiceModal}
    </>
  );
};

export default RegisterProvider;