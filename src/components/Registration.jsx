import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { apiFetch } from '../utils/api.js';
import { useGoogleLogin } from '@react-oauth/google';

export default function Registration() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    expertise: 'Strategic Management',
    experience: '',
    role: '',
    organization: '',
    linkedin: '',
    bio: '',
    profileImage: null,
    googleId: null
  });
  
  const [authMethod, setAuthMethod] = useState(null);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [imagePreview, setImagePreview] = useState("https://lh3.googleusercontent.com/aida-public/AB6AXuCrzkwZlJbo5iL01Hilh5a_qdwSjk9OXXteTRJpAa8zeFRuEa95uL4FJD-Cz3RrcDUud4zboPwIkGCg9wjLRmuLGCws3qA2rpDHmipgDQ33LMsspAowx7eG6M-vQUDL2lyxXDKXo4RBA75RaHZgxtv7Y23HpX-Cssm26PJeZC3Q6VRHptlkx2A6MBEAJglCLg3iSc_gYZ4B0nuenHvD0CsiiWa0pMmHpW4fCqXV7f4myA1-cQk4d7PrM4c9b8WKmIhzTJFdIU6X14o");
  const [step, setStep] = useState('form'); // 'form', 'otp', 'success'
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubmitError('');
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'email' ? value.toLowerCase().trim() : value 
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB");
        return;
      }
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLinkingGoogle(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        
        setFormData(prev => ({
            ...prev,
            fullName: userInfo.name || prev.fullName,
            email: userInfo.email || prev.email,
            profileImage: userInfo.picture || prev.profileImage,
            googleId: userInfo.sub
        }));
        
        if (userInfo.picture) {
           setImagePreview(userInfo.picture);
        }
        
        setAuthMethod('google');
      } catch (err) {
        console.error("Google login failed", err);
        alert("Failed to pull Google account details.");
      } finally {
        setIsLinkingGoogle(false);
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const handleFinalSubmit = async (e) => {
    e?.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
        const response = await apiFetch('/api/consultants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                expertise: [formData.expertise],
                verified: true
            })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('consultant_user', JSON.stringify(result.consultant));
            setStep('success');
        } else {
            setSubmitError(result.error || 'Failed to submit application');
            if (step === 'otp') setStep('form');
        }
    } catch {
        setSubmitError('Connection error. Please try again.');
        if (step === 'otp') setStep('form');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSubmitInitial = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.location || !formData.expertise || !formData.experience || !formData.role || !formData.organization || !formData.linkedin || !formData.bio) {
        setSubmitError("Please fill in all mandatory fields.");
        return;
    }

    if (authMethod === 'google') {
        handleFinalSubmit();
    } else {
        setIsSendingOtp(true);
        try {
            const response = await apiFetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            if (response.ok) {
                setStep('otp');
            } else {
                const data = await response.json();
                setSubmitError(data.error || 'Failed to send verification code');
            }
        } catch {
            setSubmitError('Connection error while sending verification code');
        } finally {
            setIsSendingOtp(false);
        }
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setSubmitError('');
    try {
        const response = await apiFetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp: otpCode })
        });
        if (response.ok) {
            setAuthMethod('manual');
            handleFinalSubmit();
        } else {
            setSubmitError('Invalid verification code');
        }
    } catch {
        setSubmitError('Connection error while verifying code');
    } finally {
        setIsVerifyingOtp(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
        <Navbar tempUser={(authMethod === 'google' || formData.email) ? { name: formData.fullName, email: formData.email, picture: formData.profileImage } : null} />
        <main className="max-w-xl mx-auto px-6 py-24 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>
            </div>
            <h2 className="font-headline font-bold text-3xl text-slate-800 mb-4">Application Submitted</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Thank you for applying to join the ProDecide verified expert network. 
                Our team will review your credentials and get back to you within 24-48 hours.
            </p>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm mb-8 text-left">
                <h3 className="font-bold text-slate-800 text-sm mb-4">What happens next?</h3>
                <ul className="space-y-4">
                    <li className="flex gap-3 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">contact_mail</span>
                        Check your email for confirmation and next steps.
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">fact_check</span>
                        Profile verification and background check (if applicable).
                    </li>
                    <li className="flex gap-3 text-sm text-slate-600">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">rocket_launch</span>
                        Gain access to the consultant dashboard and begin taking bookings.
                    </li>
                </ul>
            </div>
            <Link 
                to="/consultant-dashboard"
                className="inline-block w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
                Go to Dashboard
            </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] font-body text-on-surface min-h-screen selection:bg-primary/10 overflow-hidden flex flex-col">
      <Navbar tempUser={(authMethod === 'google' || formData.email) ? { name: formData.fullName, email: formData.email, picture: formData.profileImage } : null} />
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-secondary-fixed/5 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-container/5 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-[1600px] mx-auto px-6 py-12 lg:py-16 flex-grow overflow-y-auto">
          {step === 'otp' ? (
              <div className="max-w-md mx-auto p-8 bg-white rounded-3xl shadow-xl border border-outline-variant/20 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="font-headline font-bold text-2xl mb-2">Verify your email</h2>
                  <p className="text-secondary text-sm mb-6">We sent a verification code to <span className="font-bold text-slate-800">{formData.email}</span></p>
                  
                  {submitError && <div className="mb-4 p-3 bg-error/10 text-error rounded-lg text-xs font-semibold">{submitError}</div>}
                  
                  <form onSubmit={verifyOtp} className="space-y-6">
                      <div>
                          <input 
                              type="text" 
                              required
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value)}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                              className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-center text-xl tracking-[0.5em] font-bold text-on-surface transition-all placeholder:text-secondary/40 placeholder:tracking-normal placeholder:font-normal"
                          />
                      </div>
                      <div className="flex flex-col gap-3">
                          <button 
                              type="submit"
                              disabled={isVerifyingOtp || otpCode.length < 6}
                              className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                              {isVerifyingOtp ? (
                                  <><span className="material-symbols-outlined animate-spin">refresh</span> Verifying...</>
                              ) : (
                                  'Verify & Complete Application'
                              )}
                          </button>
                          <button 
                              type="button"
                              onClick={() => setStep('form')}
                              className="w-full py-3 rounded-xl text-secondary font-semibold hover:bg-surface-container-low transition-colors text-sm"
                          >
                              Back to Form
                          </button>
                      </div>
                  </form>
              </div>
          ) : (
          <>
            {/* Intro */}
            <div className="text-center max-w-3xl mx-auto mb-6">
                <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface leading-tight mb-2">Join the Elite Network of <span className="text-primary">Decision Architects</span>.</h1>
                <p className="text-secondary text-base leading-relaxed mb-4">Your expertise is the foundation of our intelligence platform. Complete your professional profile to begin matching with high-impact consultations.</p>
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/40 border border-white/60 shadow-sm backdrop-blur-sm">
                    <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                </div>
            </div>

            {submitError && <div className="max-w-3xl mx-auto mb-4 p-4 bg-error/10 text-error rounded-xl text-sm font-semibold text-center">{submitError}</div>}

            <form onSubmit={handleSubmitInitial} className="space-y-6">
                {/* Three Columns Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Card 1: Professional Identity */}
                    <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 h-full flex flex-col p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Professional Identity</h2>
                        </div>

                        {/* Google SSO Integration */}
                        <button 
                            type="button" 
                            onClick={() => login()}
                            disabled={isLinkingGoogle}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-8 bg-white border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-all group disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            <span className="text-sm font-semibold text-on-surface">Continue with Google</span>
                        </button>

                        <div className="relative w-full h-px bg-outline-variant/20 mb-8">
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdfdfe] px-3 text-[10px] font-bold uppercase tracking-widest text-secondary/60">Or manual entry</span>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div className="flex justify-center mb-8">
                                <label className="relative group cursor-pointer block" htmlFor="profile_photo">
                                    <div className="w-32 h-32 rounded-2xl bg-surface-container flex items-center justify-center overflow-hidden transition-all group-hover:ring-4 ring-primary-fixed">
                                        <img alt="Profile Preview" className="w-full h-full object-cover opacity-60" src={imagePreview} />
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-primary">Change Photo</p>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="fullName">Full Name *</label>
                                    <input required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="fullName" name="fullName" placeholder="Dr. Julian Pierce" type="text" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="email">Work Email *</label>
                                    <input required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="email" name="email" placeholder="j.pierce@organization.com" type="email" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="phone">Phone *</label>
                                        <input required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="phone" name="phone" placeholder="+1..." type="tel" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="location">Location *</label>
                                        <input required value={formData.location} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="location" name="location" placeholder="London, UK" type="text" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Expertise & Experience */}
                    <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 delay-100 h-full flex flex-col p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">workspace_premium</span>
                            </div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Expertise &amp; Experience</h2>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="expertise">Area of Expertise *</label>
                                <div className="relative">
                                    <select required value={formData.expertise} onChange={handleChange} className="w-full appearance-none px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all text-sm" id="expertise" name="expertise">
                                        <option value="Strategic Management">Strategic Management</option>
                                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                                        <option value="Financial Risk Assessment">Financial Risk Assessment</option>
                                        <option value="Supply Chain Logistics">Supply Chain Logistics</option>
                                        <option value="Healthcare Systems">Healthcare Systems</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-secondary">expand_more</span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="experience">Years of Experience *</label>
                                <input required min="0" max="80" value={formData.experience} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="experience" name="experience" placeholder="12" type="number" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="role">Current Role / Profession *</label>
                                <input required value={formData.role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="role" name="role" placeholder="Senior Strategy Lead" type="text" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="organization">Organization *</label>
                                <input required value={formData.organization} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="organization" name="organization" placeholder="Global Consulting Group" type="text" />
                            </div>

                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 mt-4">
                                <p className="text-xs text-primary font-medium italic leading-relaxed">
                                    "We connect you with consultation opportunities tailored to your expertise."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Professional Presence */}
                    <div className="bg-white/80 backdrop-blur-xl border border-outline-variant/20 rounded-3xl animate-in fade-in slide-in-from-bottom-4 delay-200 h-full flex flex-col p-6 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">public</span>
                            </div>
                            <h2 className="font-headline text-xl font-bold text-on-surface">Professional Presence</h2>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="linkedin">LinkedIn / Portfolio Link *</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-xl bg-surface border border-r-0 border-outline-variant/30 text-secondary">
                                        <span className="material-symbols-outlined text-sm">link</span>
                                    </span>
                                    <input required value={formData.linkedin} onChange={handleChange} className="w-full px-4 py-3 rounded-r-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm" id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/username" type="url" />
                                </div>
                            </div>

                            <div className="space-y-1.5 flex flex-col flex-grow">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary" htmlFor="bio">Short Bio *</label>
                                <textarea required value={formData.bio} onChange={handleChange} maxLength={250} className="w-full px-4 py-3 rounded-xl bg-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-all placeholder:text-secondary/40 text-sm flex-grow min-h-[160px] resize-none" id="bio" name="bio" placeholder="Briefly describe your core value proposition and key achievements..." rows="6"></textarea>
                                <p className="text-[9px] text-secondary text-right font-bold mt-2 uppercase tracking-widest">{formData.bio.length} / 250 characters</p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                                 <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <span className="material-symbols-outlined text-primary text-lg">task_alt</span>
                                    </div>
                                    <p className="text-xs text-secondary leading-tight">By completing this profile, you opt-in to the ProDecide Verified Expert Network.</p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden input for file */}
                <input onChange={handleImageChange} accept="image/png, image/jpeg, image/webp" className="hidden" id="profile_photo" name="profile_photo" type="file" />

                {/* CTA Section */}
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 delay-300 pt-6">
                    <button disabled={isSubmitting || isSendingOtp} className="px-16 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-[0_12px_30px_-8px_rgba(0,62,199,0.5)] hover:scale-[1.02] hover:shadow-[0_18px_35px_-8px_rgba(0,62,199,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto group disabled:opacity-50" type="submit">
                        {isSubmitting || isSendingOtp ? 'Processing...' : 'Submit Application'}
                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </button>
                    <p className="text-xs text-secondary mt-8 max-w-md mx-auto leading-relaxed">
                        By submitting, you agree to ProDecide's <span className="text-primary font-semibold hover:underline cursor-pointer">Expert Service Terms</span> and <span className="text-primary font-semibold hover:underline cursor-pointer">Privacy Policy</span>.
                    </p>
                </div>
            </form>
          </>
          )}
      </main>
    </div>
  );
}
