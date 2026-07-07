import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { apiFetch } from '../utils/api.js';

const PROFESSION_OPTIONS = [
    "Software Engineer", "Data Scientist", "Cybersecurity Analyst", "Civil Engineer", "Mechanical Engineer",
    "Architect", "Investment Banker", "Chartered Accountant", "Stock Trader", "Corporate Lawyer",
    "Criminal Lawyer", "Judge / Magistrate", "General Surgeon", "General Physician", "Psychiatrist",
    "Emergency Medicine", "Management Consultant", "HR Manager", "Marketing Manager", "Sales Director",
    "Entrepreneur / Founder", "Product Manager", "Graphic Designer", "UX/UI Designer", "Film Director",
    "Journalist", "Content Creator", "Commercial Pilot", "Air Traffic Controller", "Army Officer",
    "Research Scientist", "Biotechnologist", "Forensic Scientist", "Geologist", "Professor / Academic",
    "School Teacher", "Career Counselor", "Event Manager", "Supply Chain Manager", "Hotel Manager",
    "Political Scientist", "Diplomat", "Social Worker", "Economist", "Fashion Designer", "Interior Designer",
    "Actuary", "Sports Manager", "Sustainability Consult", "Urban Planner"
];

const EXPERTISE_OPTIONS = [
    { category: "Healthcare & Medicine", options: ["Medicine (MBBS / MD / Specializations)", "Allied Healthcare (Physio, Nursing, Pharmacy)", "Mental Health & Psychology"] },
    { category: "Aviation & Aerospace", options: ["Pilot (Commercial / Defense)", "Aerospace Engineering", "Aviation Operations & Safety"] },
    { category: "Defense & Uniformed Services", options: ["Indian Army", "Indian Navy", "Indian Air Force", "Paramilitary / CAPF", "Defense Strategy & Training"] },
    { category: "Civil Services & Government", options: ["Civil Services (UPSC / State PSC)", "Government Jobs (SSC, Banking, PSU)", "Public Policy & Administration"] },
    { category: "Education & Teaching", options: ["Teaching & Academia", "School Education", "Higher Education & Research", "Career Counseling"] },
    { category: "Engineering & Technology", options: ["Software Engineering", "Data Science & AI", "Core Engineering", "Robotics & Emerging Tech"] },
    { category: "Business & Management", options: ["Product Management", "Business Strategy", "Consulting", "Entrepreneurship & Startups", "Finance & Banking"] },
    { category: "Creative & Communication", options: ["Design (UI/UX, Graphic)", "Content & Media", "Public Speaking & Communication"] },
    { category: "Law & Public Services", options: ["Law & Legal Practice", "Judiciary Preparation"] },
    { category: "Other", options: ["Other"] }
];

export default function Registration() {
  const [step, setStep] = useState('form'); // 'form', 'otp', 'google'
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [googleSelectorOpen, setGoogleSelectorOpen] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [isProfessionsOpen, setIsProfessionsOpen] = useState(false);
  const [isExpertiseOpen, setIsExpertiseOpen] = useState(false);
  const [professionSearch, setProfessionSearch] = useState('');
  const [expertiseSearch, setExpertiseSearch] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    expertise: [],
    experience: '',
    role: '',
    organization: '',
    linkedin: '',
    bio: '',
    profileImage: null
  });

  const professionDropdownRef = useRef(null);
  const expertiseDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (professionDropdownRef.current && !professionDropdownRef.current.contains(event.target)) setIsProfessionsOpen(false);
        if (expertiseDropdownRef.current && !expertiseDropdownRef.current.contains(event.target)) setIsExpertiseOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [id]: id === 'email' ? value.toLowerCase().trim() : value 
    }));
  };

  const handleExpertiseToggle = (option) => {
    setFormData(prev => {
        const isSelected = prev.expertise.includes(option);
        return {
            ...prev,
            expertise: isSelected ? prev.expertise.filter(e => e !== option) : [...prev.expertise, option]
        };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('Please upload an image file');
      if (file.size > 2 * 1024 * 1024) return alert('Max 2MB allowed');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const sendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const response = await apiFetch('/api/auth?action=send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP code');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.expertise.length === 0) return alert("Select expertise");
    if (!formData.role) return alert("Select role");
    
    try {
      const response = await apiFetch('/api/consultants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      await sendOtp();
      setStep('otp');
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return alert("Please enter a 6-digit OTP");
    
    setIsVerifyingOtp(true);
    try {
      const response = await apiFetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid or expired OTP code');
      }
      
      setStep('google');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleGoogleLink = async (googleId) => {
    setIsLinkingGoogle(true);
    try {
      const response = await apiFetch('/api/auth?action=google-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          googleId,
          name: formData.fullName,
          profileImage: imagePreview
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link Google account');
      }
      
      const result = await response.json();
      localStorage.setItem('consultant_user', JSON.stringify(result.consultant));
      if (result.token) localStorage.setItem('prodecide_jwt', result.token);
      window.location.href = '/consultant-dashboard';
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLinkingGoogle(false);
      setGoogleSelectorOpen(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">mail</span>
              </div>
              <h2 className="font-headline font-extrabold text-2xl text-on-surface">Verify your email</h2>
              <p className="text-secondary text-sm mt-2">
                We've sent a 6-digit code to <span className="font-semibold text-slate-800">{formData.email}</span>. Please enter it below.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block text-center">Verification Code</label>
                <input 
                  type="text" 
                  maxLength="6"
                  pattern="\d{6}"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="0 0 0 0 0 0" 
                  required
                  className="w-full px-4 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-center text-3xl font-extrabold tracking-[12px] placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
                />
              </div>

              <button 
                type="submit" 
                disabled={isVerifyingOtp}
                className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                {isVerifyingOtp ? (
                  <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                ) : 'Verify Code'}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  onClick={sendOtp}
                  disabled={isSendingOtp}
                  className="text-xs font-bold text-primary hover:underline uppercase tracking-wider disabled:opacity-50"
                >
                  {isSendingOtp ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'google') {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen pb-12 relative">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">verified_user</span>
            </div>
            <h2 className="font-headline font-extrabold text-2xl text-on-surface">Secure Your Profile</h2>
            <p className="text-secondary text-sm mt-2 mb-8">
              Link your professional Google Account to access your personal Consultant Dashboard and manage bookings.
            </p>

            <button 
              onClick={() => setGoogleSelectorOpen(true)}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.466 0-6.29-2.902-6.29-6.514 0-3.611 2.824-6.513 6.29-6.513 1.5 0 2.864.544 3.935 1.442l3.197-3.197C19.165 1.944 15.932 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.875 0 10.875-4.248 10.875-11.24 0-.649-.074-1.286-.195-1.955H12.24z"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        </main>

        {/* Google Authentication Simulator Popup */}
        {googleSelectorOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="font-semibold text-sm text-slate-700">Sign in with Google</span>
                </div>
                <button onClick={() => setGoogleSelectorOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center pb-2">
                  <h3 className="font-bold text-slate-800 text-lg">Choose an account</h3>
                  <p className="text-xs text-slate-500 mt-1">to continue to <span className="font-semibold text-primary">ProDecide</span></p>
                </div>

                <div className="space-y-2">
                  {/* Option 1: Predetermined user profile from form */}
                  <button 
                    onClick={() => handleGoogleLink(`google_${Math.random().toString(36).substr(2, 9)}`)}
                    disabled={isLinkingGoogle}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 text-left transition-all group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                      <img 
                        src={imagePreview || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate group-hover:text-primary">{formData.fullName || 'Consultant Profile'}</p>
                      <p className="text-xs text-slate-500 truncate">{formData.email}</p>
                    </div>
                    {isLinkingGoogle ? (
                      <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-sm group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                    )}
                  </button>

                  {/* Option 2: Use another account mockup */}
                  <button 
                    onClick={() => handleGoogleLink(`google_${Math.random().toString(36).substr(2, 9)}`)}
                    disabled={isLinkingGoogle}
                    className="w-full p-3 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center gap-3 text-left transition-all group disabled:opacity-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                      <span className="material-symbols-outlined text-xl">person_add</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm text-slate-700">Use another account</p>
                      <p className="text-xs text-slate-400">Sign in with a different email</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-normal">
                To continue, Google will share your name, email address, language preference, and profile picture with ProDecide. See their Privacy Policy.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          <div className="lg:col-span-5">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface leading-tight mb-6">
              Join the Elite Network of <span className="text-primary">Decision Architects</span>.
            </h1>
            <p className="text-secondary text-lg leading-relaxed mb-8">
              Your expertise is the foundation of our intelligence platform. Complete your professional profile to begin matching with high-impact consultations.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Verified Credentials</p>
                <p className="text-xs text-secondary">Join 50,000+ industry leaders globally.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-outline-variant/10">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center pb-8 border-b border-outline-variant/10">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileImage').click()}>
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-transparent group-hover:ring-primary-fixed transition-all">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-slate-300">add_a_photo</span>
                      )}
                    </div>
                    <input type="file" id="profileImage" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-sm font-bold text-primary">Upload Profile Photo</span>
                    <p className="text-xs text-secondary">JPG, PNG (Max 2MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Full Name</label>
                    <input value={formData.fullName} onChange={handleChange} required id="fullName" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Email</label>
                    <input value={formData.email} onChange={handleChange} required id="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="email"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Phone Number</label>
                    <input value={formData.phone} onChange={handleChange} required id="phone" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="tel"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">City / Country</label>
                    <input value={formData.location} onChange={handleChange} required id="location" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text"/>
                  </div>
                </div>
 
                <div className="space-y-6 pt-6 border-t border-outline-variant/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2" ref={expertiseDropdownRef}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Area of Expertise</label>
                      <div className="relative">
                        <div onClick={() => setIsExpertiseOpen(!isExpertiseOpen)} className="w-full px-4 py-3 rounded-xl bg-slate-50 min-h-[44px] flex flex-wrap justify-between gap-1 items-center cursor-pointer">
                          <div className="flex flex-wrap items-center gap-1">
                            {formData.expertise.length > 0 ? (
                              formData.expertise.map(e => (
                                <span key={e} className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">{e}</span>
                              ))
                            ) : <span className="text-slate-400 text-sm">Select Expertise</span>}
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                        </div>
                        {isExpertiseOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-64 overflow-y-auto p-4">
                                <div className="mb-3 sticky top-0 bg-white border-b border-slate-50 pb-2">
                                    <input value={expertiseSearch} onChange={(e) => setExpertiseSearch(e.target.value)} autoFocus className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm outline-none" placeholder="Search expertise..." />
                                </div>
                                {EXPERTISE_OPTIONS.map(group => {
                                    const filteredOptions = group.options.filter(opt => opt.toLowerCase().includes(expertiseSearch.toLowerCase()));
                                    if (filteredOptions.length === 0) return null;
                                    return (
                                        <div key={group.category} className="mb-4 last:mb-0">
                                            <div className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b border-slate-50 pb-1">{group.category}</div>
                                            <div className="space-y-1">
                                                {filteredOptions.map(opt => (
                                                    <div key={opt} onClick={() => handleExpertiseToggle(opt)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.expertise.includes(opt) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                                            {formData.expertise.includes(opt) && <span className="text-white text-[10px]">✓</span>}
                                                        </div>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Experience (Years)</label>
                      <input value={formData.experience} onChange={handleChange} required id="experience" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="number"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2" ref={professionDropdownRef}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Profession</label>
                      <div className="relative">
                        <div onClick={() => setIsProfessionsOpen(!isProfessionsOpen)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm flex justify-between items-center cursor-pointer">
                            {formData.role || <span className="text-slate-400">Select Profession</span>}
                            <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                        </div>
                        {isProfessionsOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-64 overflow-y-auto">
                                <div className="p-3 sticky top-0 bg-white border-b border-slate-50">
                                    <input value={professionSearch} onChange={(e) => setProfessionSearch(e.target.value)} autoFocus className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm outline-none" placeholder="Search..." />
                                </div>
                                {PROFESSION_OPTIONS.filter(p => p.toLowerCase().includes(professionSearch.toLowerCase())).map(p => (
                                    <div key={p} onClick={() => { setFormData(prev => ({...prev, role: p})); setIsProfessionsOpen(false); }} className="px-4 py-2.5 hover:bg-primary/5 cursor-pointer text-sm font-medium">
                                        {p}
                                    </div>
                                ))}
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Organization</label>
                      <input value={formData.organization} onChange={handleChange} required id="organization" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">LinkedIn Profile</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl bg-slate-200/50 text-slate-500"><span className="material-symbols-outlined text-sm">link</span></span>
                      <input value={formData.linkedin} onChange={handleChange} required id="linkedin" className="w-full px-4 py-3 rounded-r-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="url"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Short Bio</label>
                    <textarea value={formData.bio} onChange={handleChange} required id="bio" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="Briefly describe your core value proposition..." rows="3"></textarea>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group" type="submit">
                    Submit Application
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                  <p className="text-center text-[10px] text-secondary mt-4 uppercase tracking-tighter">
                    By submitting, you agree to ProDecide's <span className="text-primary font-bold cursor-pointer">Terms</span> and <span className="text-primary font-bold cursor-pointer">Privacy Policy</span>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <section className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <span className="material-symbols-outlined text-blue-400 text-3xl">auto_awesome</span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-xl">The AI-Matching Edge</h4>
              <p className="text-slate-400 text-sm max-w-2xl">Our platform uses advanced semantic mapping to connect your specific nuances with the most complex corporate challenges. We value depth over volume.</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </section>
      </main>
    </div>
  );
}
