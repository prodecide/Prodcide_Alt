import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Login states
  const [emailInput, setEmailInput] = useState('');
  const [loginStep, setLoginStep] = useState('choice'); // 'choice', 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [googleSelectorOpen, setGoogleSelectorOpen] = useState(false);
  const [isLoggingInGoogle, setIsLoggingInGoogle] = useState(false);

  // Mock bookings
  const [bookings, setBookings] = useState([
    {
      id: 'REQ-9921',
      clientName: 'Alice Vance',
      clientCompany: 'Aether Capital',
      challenge: 'Need regulatory guidance on cross-border transactions for our new DeFi protocol launch.',
      date: 'Jun 10, 2026',
      time: '11:00 AM - 12:00 PM',
      status: 'pending'
    },
    {
      id: 'REQ-7782',
      clientName: 'David K.',
      clientCompany: 'Vertex Logistics',
      challenge: 'Evaluating multi-modal warehousing strategies under Q3 fuel cost constraints.',
      date: 'Jun 12, 2026',
      time: '02:00 PM - 03:00 PM',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    const savedUser = localStorage.getItem('consultant_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      fetchProfile(parsed.email);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (email, showAlert = false) => {
    try {
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.consultant);
        localStorage.setItem('consultant_user', JSON.stringify(data.consultant));
        return true;
      } else {
        const errData = await response.json();
        if (showAlert) {
          alert(errData.error || 'No consultant profile found. Please register first.');
        }
        // Clear stale session
        localStorage.removeItem('consultant_user');
        return false;
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      if (showAlert) {
        alert('An unexpected connection error occurred.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    if (!emailInput) return alert('Please enter your email');
    setIsSendingOtp(true);
    try {
      const res = await fetch('/api/auth?action=send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.toLowerCase().trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send OTP');
      }
      setLoginStep('otp');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return alert('Please enter 6-digit OTP');
    setIsVerifyingOtp(true);
    try {
      const res = await fetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.toLowerCase().trim(), code: otpCode }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid OTP code');
      }
      await fetchProfile(emailInput.toLowerCase().trim(), true);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleGoogleLogin = async (simulatedEmail) => {
    setIsLoggingInGoogle(true);
    try {
      // Lookup or sign in by simulated email
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: simulatedEmail }),
      });
      if (!response.ok) {
        throw new Error('No consultant profile linked with this Google account. Please register first.');
      }
      const data = await response.json();
      setUser(data.consultant);
      localStorage.setItem('consultant_user', JSON.stringify(data.consultant));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoggingInGoogle(false);
      setGoogleSelectorOpen(false);
    }
  };

  const handleAcceptRequest = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted', meetLink: 'https://meet.google.com/pd-tux-jmr' } : b));
  };

  const handleDeclineRequest = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b));
  };

  const handleLogout = () => {
    localStorage.removeItem('consultant_user');
    setUser(null);
    setLoginStep('choice');
    setEmailInput('');
    setOtpCode('');
  };

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
      </div>
    );
  }

  // Render Login Gate
  if (!user) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen pb-12 relative">
        <Navbar />
        <main className="max-w-md mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-xl">
            
            {loginStep === 'choice' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">account_circle</span>
                  </div>
                  <h2 className="font-headline font-extrabold text-2xl text-on-surface">Consultant Portal</h2>
                  <p className="text-secondary text-sm mt-2">
                    Access your account dashboard to check screening status and incoming bookings.
                  </p>
                </div>

                <button 
                  onClick={() => setGoogleSelectorOpen(true)}
                  className="w-full py-3.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.466 0-6.29-2.902-6.29-6.514 0-3.611 2.824-6.513 6.29-6.513 1.5 0 2.864.544 3.935 1.442l3.197-3.197C19.165 1.944 15.932 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.875 0 10.875-4.248 10.875-11.24 0-.649-.074-1.286-.195-1.955H12.24z"/>
                  </svg>
                  Sign in with Google
                </button>

                <div className="relative flex py-2 items-center text-xs text-slate-400 uppercase tracking-widest">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4">Or use Email OTP</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <input 
                    type="email" 
                    required 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your registered email" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <button 
                    type="submit" 
                    disabled={isSendingOtp}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isSendingOtp ? 'Sending...' : 'Request Verification Code'}
                  </button>
                </form>
              </div>
            )}

            {loginStep === 'otp' && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">lock_open</span>
                  </div>
                  <h2 className="font-headline font-extrabold text-2xl text-on-surface">Enter Code</h2>
                  <p className="text-secondary text-sm mt-2">
                    We sent a verification code to <span className="font-semibold text-slate-800">{emailInput}</span>.
                  </p>
                </div>

                <form onSubmit={handleVerifyLoginOtp} className="space-y-6">
                  <input 
                    type="text" 
                    maxLength="6"
                    pattern="\d{6}"
                    required 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="0 0 0 0 0 0" 
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-center text-3xl font-extrabold tracking-[12px] placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
                  />
                  <button 
                    type="submit" 
                    disabled={isVerifyingOtp}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isVerifyingOtp ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : 'Confirm and Log In'}
                  </button>
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setLoginStep('choice')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}

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
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg mb-3">
                    <p className="text-[10px] text-slate-500 text-center">Enter email to simulate login with a specific account</p>
                    <input 
                      type="email" 
                      placeholder="e.g. sarah.jenkins@example.com" 
                      value={emailInput} 
                      onChange={(e) => setEmailInput(e.target.value)} 
                      className="w-full mt-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <button 
                    onClick={() => handleGoogleLogin(emailInput || 'sarah.jenkins@example.com')}
                    disabled={isLoggingInGoogle}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-primary/30 hover:bg-primary/5 flex items-center gap-3 text-left transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-slate-500 font-bold bg-blue-50 text-primary">
                      G
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate group-hover:text-primary">Proceed with Google</p>
                      <p className="text-xs text-slate-500 truncate">{emailInput || 'sarah.jenkins@example.com'}</p>
                    </div>
                    {isLoggingInGoogle ? (
                      <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-sm group-hover:translate-x-0.5 transition-transform">chevron_right</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center leading-normal">
                To continue, Google will share your name, email address, language preference, and profile picture with ProDecide.
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Consultant Dashboard
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Verification Stepper Progress bar */}
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.status === 'approved' ? 'bg-green-50 text-green-600' : user.status === 'declined' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-primary animate-pulse'}`}>
              <span className="material-symbols-outlined text-2xl">
                {user.status === 'approved' ? 'check_circle' : user.status === 'declined' ? 'cancel' : 'hourglass_empty'}
              </span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                {user.status === 'approved' ? 'Profile Activated' : user.status === 'declined' ? 'Application Declined' : 'Profile Under Screening'}
              </h3>
              <p className="text-secondary text-xs">
                {user.status === 'approved' ? 'Your profile is live on ProDecide network.' : user.status === 'declined' ? 'Your credentials do not match our current needs.' : 'Our screening desk is currently reviewing your application.'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">✓</span>
              <span className="text-xs font-bold text-slate-700">Submitted</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-1">
              <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${user.status === 'approved' ? 'bg-green-500 text-white' : user.status === 'declined' ? 'bg-rose-500 text-white' : 'bg-primary text-white animate-pulse'}`}>
                {user.status === 'approved' ? '✓' : user.status === 'declined' ? '✗' : '2'}
              </span>
              <span className={`text-xs font-bold ${user.status === 'approved' ? 'text-green-600' : user.status === 'declined' ? 'text-rose-600' : 'text-primary'}`}>
                Screening
              </span>
            </div>
            <div className="w-8 h-0.5 bg-slate-200"></div>
            <div className="flex items-center gap-1">
              <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${user.status === 'approved' ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {user.status === 'approved' ? '✓' : '3'}
              </span>
              <span className={`text-xs font-bold ${user.status === 'approved' ? 'text-green-600' : 'text-slate-400'}`}>
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Stats & Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-md">
                  <img 
                    src={user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'} 
                    alt={user.fullName} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-extrabold text-xl text-on-surface">{user.fullName}</h3>
                <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{user.role}</p>
                <p className="text-secondary text-xs mt-0.5">{user.organization}</p>
              </div>
              
              <div className="py-4 border-b border-slate-100 space-y-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Expertise Fields</span>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(user.expertise) ? user.expertise.map(tag => (
                    <span key={tag} className="bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-100">{tag}</span>
                  )) : (
                    <span className="bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-100">{user.expertise}</span>
                  )}
                </div>
              </div>

              <div className="py-4 border-b border-slate-100 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Biography Overview</span>
                <p className="text-xs text-secondary leading-relaxed italic">"{user.bio}"</p>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Log Out Portal
                </button>
              </div>
            </div>

            {/* Accrued earnings & analytics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-sm text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Consultations</span>
                <p className="text-3xl font-black mt-1">0</p>
              </div>
              <div className="bg-white rounded-3xl p-5 border border-outline-variant/10 shadow-sm text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Profile Views</span>
                <p className="text-3xl font-black mt-1 text-primary">12</p>
              </div>
            </div>

          </div>

          {/* Right Column: Client Request Stream */}
          <div className="lg:col-span-8 space-y-6">
            
            {user.status === 'pending' && (
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex gap-4 items-start text-blue-800">
                <span className="material-symbols-outlined text-2xl text-blue-600 mt-0.5">info</span>
                <div>
                  <h4 className="font-bold text-sm">Onboarding Review in Progress</h4>
                  <p className="text-xs text-blue-700/90 leading-relaxed mt-1">
                    Your profile details are being checked by the screening desk. Once approved, live bookings will trigger email notifications. You can interact with these sandbox requests below to test accepting bookings.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
              <h3 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notifications_active</span>
                Incoming Client Bookings
              </h3>

              <div className="space-y-6">
                {bookings.map((req) => (
                  <div key={req.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 relative overflow-hidden transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-on-surface text-base">{req.clientName}</h4>
                        <p className="text-xs text-secondary font-medium">{req.clientCompany}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                        req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        req.status === 'declined' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-sm text-secondary leading-relaxed mb-4 italic">
                      "{req.challenge}"
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pb-4 border-b border-slate-200/50 mb-4">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        <span>{req.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{req.time}</span>
                      </div>
                    </div>

                    {req.status === 'pending' ? (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleAcceptRequest(req.id)}
                          className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary-container transition-colors"
                        >
                          Accept Request
                        </button>
                        <button 
                          onClick={() => handleDeclineRequest(req.id)}
                          className="border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    ) : req.status === 'accepted' ? (
                      <div className="bg-green-50 border border-green-100 p-3.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="material-symbols-outlined text-green-600 text-sm">videocam</span>
                          <span className="text-xs font-semibold text-green-700">Scheduled Google Meet:</span>
                          <a href={req.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline truncate max-w-xs">{req.meetLink}</a>
                        </div>
                        <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest self-end sm:self-auto">Ready to join</span>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-600 italic">This session has been declined.</p>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
