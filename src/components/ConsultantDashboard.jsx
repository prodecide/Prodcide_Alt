import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Login states
  const [emailInput, setEmailInput] = useState('');
  const [loginStep, setLoginStep] = useState('email'); // 'email', 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

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



  const handleAcceptRequest = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted', meetLink: 'https://meet.google.com/pd-tux-jmr' } : b));
  };

  const handleDeclineRequest = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b));
  };

  const handleLogout = () => {
    localStorage.removeItem('consultant_user');
    setUser(null);
    setLoginStep('email');
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
          <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {loginStep === 'email' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">account_circle</span>
                  </div>
                  <h2 className="font-headline font-extrabold text-2xl text-on-surface">Consultant Portal</h2>
                  <p className="text-secondary text-sm mt-2">
                    Enter your registered email address to receive an OTP verification code.
                  </p>
                </div>

                <form onSubmit={handleSendLoginOtp} className="space-y-4">
                  <input 
                    type="email" 
                    required 
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your registered email" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={isSendingOtp}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
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
                    className="w-full px-4 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-center text-3xl font-extrabold tracking-[12px] placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300 transition-all"
                  />
                  <button 
                    type="submit" 
                    disabled={isVerifyingOtp}
                    className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                  >
                    {isVerifyingOtp ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    ) : 'Confirm and Log In'}
                  </button>
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setLoginStep('email')}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors"
                    >
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>
    );
  }

  // Render Consultant Dashboard Gate for Pending/Declined Profiles
  if (user && user.status !== 'approved') {
    return (
      <div className="bg-[#f7f9fb] font-body text-slate-800 min-h-screen pb-12">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-12">
          
          {/* Stepper Progress bar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mb-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.status === 'declined' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-primary animate-pulse'}`}>
                <span className="material-symbols-outlined text-2xl">
                  {user.status === 'declined' ? 'cancel' : 'hourglass_empty'}
                </span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-slate-800">
                  {user.status === 'declined' ? 'Application Declined' : 'Profile Under Screening'}
                </h3>
                <p className="text-slate-500 text-xs">
                  {user.status === 'declined' ? 'Your credentials do not match our current needs.' : 'Our screening desk is currently reviewing your application.'}
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
                <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${user.status === 'declined' ? 'bg-rose-500 text-white' : 'bg-primary text-white animate-pulse'}`}>
                  {user.status === 'declined' ? '✗' : '2'}
                </span>
                <span className={`text-xs font-bold ${user.status === 'declined' ? 'text-rose-600' : 'text-primary'}`}>
                  Screening
                </span>
              </div>
              <div className="w-8 h-0.5 bg-slate-200"></div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">3</span>
                <span className="text-xs font-bold text-slate-400">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200/50 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center pb-6 border-b border-slate-100">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 mx-auto mb-4 shadow-sm">
                <img 
                  src={user.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'} 
                  alt={user.fullName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <h2 className="font-headline font-extrabold text-2xl text-slate-800">{user.fullName}</h2>
              <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{user.role}</p>
              <p className="text-slate-500 text-xs mt-0.5">{user.organization}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-6 flex gap-4 items-start text-blue-900">
                <span className="material-symbols-outlined text-2xl text-blue-600 mt-0.5">info</span>
                <div>
                  <h4 className="font-bold text-sm">Application Status: {user.status === 'declined' ? 'Declined' : 'Pending Verification'}</h4>
                  <p className="text-xs text-blue-800/90 leading-relaxed mt-1">
                    {user.status === 'declined' 
                      ? 'Thank you for your interest. Unfortunately, your application has been declined at this time. You can contact support if you believe this was an error.' 
                      : 'Thank you for registering. Your expert application is currently being checked by our screening team. Once approved, your consultant portal will be activated, allowing you to accept client consultations, set availability, and access your dashboard. We will notify you by email as soon as your account is live.'}
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl p-5 space-y-3.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Submitted Details Preview</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Contact Email</span>
                    <span className="text-slate-700 font-bold">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Price per Hour</span>
                    <span className="text-slate-700 font-bold">₹{user.price} / hr</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100/60">
                  <span className="text-slate-400 font-medium text-xs block mb-1">Expertise Fields</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(user.expertise) ? user.expertise.map(tag => (
                      <span key={tag} className="bg-slate-50 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-100">{tag}</span>
                    )) : (
                      <span className="bg-slate-50 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-100">{user.expertise}</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100/60">
                  <span className="text-slate-400 font-medium text-xs block mb-1">Biography</span>
                  <p className="text-slate-600 text-xs italic leading-relaxed">"{user.bio}"</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Log Out of Portal
              </button>
            </div>

          </div>
        </main>
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
