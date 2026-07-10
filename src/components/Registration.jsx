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
  const [step, setStep] = useState(1); // 1: Account, 2: OTP, 3: Professional, 4: Profile
  const [authMethod, setAuthMethod] = useState(null); // 'google' or 'manual'
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
    profileImage: null,
    googleId: null
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

  const handleGoogleLink = async (mockGoogleId) => {
    setIsLinkingGoogle(true);
    // Mocking Google Sign In data fetch
    setTimeout(() => {
        setFormData(prev => ({
            ...prev,
            fullName: prev.fullName || 'Alex Consultant',
            email: prev.email || 'alex@example.com',
            googleId: mockGoogleId
        }));
        setAuthMethod('google');
        setIsLinkingGoogle(false);
        setGoogleSelectorOpen(false);
        setStep(3); // Skip OTP, go straight to Professional Details
    }, 1000);
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

  const handleManualAccountSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return alert("Please fill all fields");
    setAuthMethod('manual');
    await sendOtp();
    setStep(2);
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
      
      setStep(3); // Move to Professional details
    } catch (error) {
      alert(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleProfessionalSubmit = (e) => {
      e.preventDefault();
      if (formData.expertise.length === 0) return alert("Select expertise");
      if (!formData.role) return alert("Select profession");
      setStep(4); // Move to Profile
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.organization || !formData.bio) return alert("Please complete all fields");
    
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

      // If Google was used, link it formally on backend
      if (authMethod === 'google' && formData.googleId) {
          const googleRes = await apiFetch('/api/auth?action=google-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              googleId: formData.googleId,
              name: formData.fullName,
              profileImage: formData.profileImage
            }),
          });
          if (googleRes.ok) {
            const result = await googleRes.json();
            localStorage.setItem('consultant_user', JSON.stringify(result.consultant));
            if (result.token) localStorage.setItem('prodecide_jwt', result.token);
          }
      } else {
          // Mock login for manual
          localStorage.setItem('consultant_user', JSON.stringify({ email: formData.email, role: 'consultant' }));
      }
      
      window.location.href = '/consultant-dashboard';
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message);
    }
  };

  const renderProgressBar = () => {
      const displaySteps = [
          { id: 1, label: 'Account' },
          { id: 3, label: 'Professional' },
          { id: 4, label: 'Profile' }
      ];
      
      let currentDisplayStep = 1;
      if (step === 2) currentDisplayStep = 1; // OTP is part of Account
      if (step === 3) currentDisplayStep = 2;
      if (step === 4) currentDisplayStep = 3;

      return (
          <div className="mb-12">
              <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: `${(currentDisplayStep - 1) * 50}%` }}></div>
                  
                  {displaySteps.map((s, idx) => {
                      const isActive = (idx + 1) <= currentDisplayStep;
                      return (
                          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                                  {isActive && (idx + 1) < currentDisplayStep ? <span className="material-symbols-outlined text-lg">check</span> : (idx + 1)}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-primary' : 'text-slate-400'}`}>{s.label}</span>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderGoogleSelector = () => {
    if (!googleSelectorOpen) return null;
    return (
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
                        <button 
                            onClick={() => handleGoogleLink(`google_${Math.random().toString(36).substr(2, 9)}`)}
                            disabled={isLinkingGoogle}
                            className="w-full p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 text-left transition-all group disabled:opacity-50"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-slate-700">Alex Consultant</p>
                                <p className="text-xs text-slate-400">alex@example.com</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-20">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mb-4">
              Join the <span className="text-primary">Decision Architects</span>
            </h1>
            <p className="text-secondary text-base">Complete your profile to start matching with high-impact consultations.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-outline-variant/10">
            {renderProgressBar()}

            {/* Step 1: Account Setup */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="font-headline font-bold text-2xl text-on-surface">Create your account</h2>
                        <p className="text-secondary text-sm mt-1">Choose how you'd like to get started</p>
                    </div>

                    <button 
                        type="button"
                        onClick={() => setGoogleSelectorOpen(true)}
                        className="w-full py-4 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm mb-8"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.466 0-6.29-2.902-6.29-6.514 0-3.611 2.824-6.513 6.29-6.513 1.5 0 2.864.544 3.935 1.442l3.197-3.197C19.165 1.944 15.932 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.875 0 10.875-4.248 10.875-11.24 0-.649-.074-1.286-.195-1.955H12.24z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Or use email</span>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>

                    <form onSubmit={handleManualAccountSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Full Name</label>
                            <input value={formData.fullName} onChange={handleChange} required id="fullName" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Email Address</label>
                            <input value={formData.email} onChange={handleChange} required id="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="email"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Phone Number</label>
                            <input value={formData.phone} onChange={handleChange} required id="phone" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="tel"/>
                        </div>
                        <button type="submit" className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 mt-4">
                            Continue
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">mail</span>
                        </div>
                        <h2 className="font-headline font-extrabold text-2xl text-on-surface">Verify your email</h2>
                        <p className="text-secondary text-sm mt-2">
                            We've sent a 6-digit code to <span className="font-semibold text-slate-800">{formData.email}</span>.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-2">
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
                        <div className="text-center mt-4">
                            <button type="button" onClick={sendOtp} disabled={isSendingOtp} className="text-xs font-bold text-primary hover:underline uppercase tracking-wider disabled:opacity-50">
                                {isSendingOtp ? 'Sending...' : 'Resend Code'}
                            </button>
                            <span className="mx-2 text-slate-300">|</span>
                            <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-secondary hover:text-slate-700 uppercase tracking-wider">
                                Change Email
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 3: Professional Details */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="font-headline font-bold text-2xl text-on-surface">Professional Details</h2>
                        <p className="text-secondary text-sm mt-1">Tell us about your expertise</p>
                    </div>

                    <form onSubmit={handleProfessionalSubmit} className="space-y-6">
                        <div className="space-y-2" ref={professionDropdownRef}>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Profession / Primary Role</label>
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

                        <div className="space-y-2" ref={expertiseDropdownRef}>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Areas of Expertise</label>
                            <div className="relative">
                                <div onClick={() => setIsExpertiseOpen(!isExpertiseOpen)} className="w-full px-4 py-3 rounded-xl bg-slate-50 min-h-[48px] flex flex-wrap justify-between gap-1 items-center cursor-pointer">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {formData.expertise.length > 0 ? (
                                            formData.expertise.map(e => (
                                                <span key={e} className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold">{e}</span>
                                            ))
                                        ) : <span className="text-slate-400 text-sm">Select Expertise Areas</span>}
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Years of Experience</label>
                            <input value={formData.experience} onChange={handleChange} required id="experience" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="number" min="0"/>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {authMethod === 'manual' && (
                                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                            )}
                            <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2">
                                Continue
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 4: Profile Completion */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="font-headline font-bold text-2xl text-on-surface">Complete your profile</h2>
                        <p className="text-secondary text-sm mt-1">Almost there! Add the final touches.</p>
                    </div>

                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                        <div className="flex flex-col items-center justify-center pb-6">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileImage').click()}>
                                <div className="w-28 h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-transparent group-hover:ring-primary/20 transition-all">
                                    {imagePreview || formData.profileImage ? (
                                        <img src={imagePreview || formData.profileImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                                    )}
                                </div>
                                <input type="file" id="profileImage" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </div>
                            <div className="mt-3 text-center">
                                <span className="text-xs font-bold text-primary">Upload Profile Photo</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">City / Country</label>
                                <input value={formData.location} onChange={handleChange} required id="location" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text" placeholder="e.g. New York, USA"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Current Organization</label>
                                <input value={formData.organization} onChange={handleChange} required id="organization" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text" placeholder="Company Name"/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">LinkedIn URL</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 rounded-l-xl bg-slate-200/50 text-slate-500"><span className="material-symbols-outlined text-sm">link</span></span>
                                <input value={formData.linkedin} onChange={handleChange} required id="linkedin" className="w-full px-4 py-3 rounded-r-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="url" placeholder="https://linkedin.com/in/..."/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Short Bio</label>
                            <textarea value={formData.bio} onChange={handleChange} required id="bio" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="Briefly describe your core value proposition..." rows="3"></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setStep(3)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <button type="submit" className="flex-1 py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group">
                                Submit Application
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">check_circle</span>
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-secondary mt-2 uppercase tracking-tighter">
                            By submitting, you agree to ProDecide's <span className="text-primary font-bold cursor-pointer">Terms</span> and <span className="text-primary font-bold cursor-pointer">Privacy Policy</span>.
                        </p>
                    </form>
                </div>
            )}
        </div>
        {renderGoogleSelector()}
      </main>
    </div>
  );
}
