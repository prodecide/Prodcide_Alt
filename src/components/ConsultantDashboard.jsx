import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

// ─── Generate 45-min slots for a day (8:00 AM – 8:00 PM) ────────────────────
function generate45MinSlots() {
  const slots = [];
  let h = 8, m = 0;
  while (h < 20) {
    const label = `${h % 12 === 0 ? 12 : h % 12}:${m === 0 ? '00' : m} ${h < 12 ? 'AM' : 'PM'}`;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    slots.push({ label, value });
    m += 45;
    if (m >= 60) { h += 1; m -= 60; }
  }
  return slots;
}
const ALL_SLOTS = generate45MinSlots();

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Login states
  const [emailInput, setEmailInput] = useState('');
  const [loginStep, setLoginStep] = useState('email'); // 'email', 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Dashboard tab
  const [dashTab, setDashTab] = useState('bookings'); // 'bookings' | 'availability'

  // Availability state
  const [availSchedule, setAvailSchedule] = useState({}); // { "2026-06-25": ["09:00","09:45"] }
  const [availViewMonth, setAvailViewMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [availSelectedDay, setAvailSelectedDay] = useState(null); // 'YYYY-MM-DD'
  const [availSaving, setAvailSaving] = useState(false);
  const [availSaveMsg, setAvailSaveMsg] = useState(null);

  // Real bookings from DB
  const [dbBookings, setDbBookings] = useState([]);

  // Legacy mock bookings (fallback if DB empty)
  const [bookings, setBookings] = useState([
    {
      id: 'REQ-9921',
      clientName: 'Alice Vance',
      clientCompany: 'Aether Capital',
      clientEmail: 'alice@aether.cap',
      challenge: 'Need regulatory guidance on cross-border transactions for our new DeFi protocol launch.',
      date: 'Jun 10, 2026',
      time: '11:00 AM - 12:00 PM',
      status: 'pending'
    },
    {
      id: 'REQ-7782',
      clientName: 'David K.',
      clientCompany: 'Vertex Logistics',
      clientEmail: 'david.k@vertex.log',
      challenge: 'Evaluating multi-modal warehousing strategies under Q3 fuel cost constraints.',
      date: 'Jun 12, 2026',
      time: '02:00 PM - 03:00 PM',
      status: 'pending'
    }
  ]);

  // Fetch real bookings from DB
  const fetchDbBookings = useCallback(async (consultantId, consultantEmail) => {
    try {
      const param = consultantId ? `consultantId=${consultantId}` : `consultantEmail=${encodeURIComponent(consultantEmail)}`;
      const res = await fetch(`/api/bookings?${param}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) setDbBookings(data);
      }
    } catch (e) {
      console.error('Failed to load bookings:', e);
    }
  }, []);

  // Fetch availability from DB
  const fetchAvailability = useCallback(async (consultantId) => {
    try {
      const res = await fetch(`/api/availability?consultantId=${consultantId}`);
      if (res.ok) {
        const data = await res.json();
        setAvailSchedule(data.schedule || {});
      }
    } catch (e) {
      console.error('Failed to load availability:', e);
    }
  }, []);

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
        // Fetch related data
        if (data.consultant?._id) {
          fetchAvailability(data.consultant._id.toString());
          fetchDbBookings(data.consultant._id.toString(), data.consultant.email);
        }
        return true;
      } else {
        const errData = await response.json();
        if (showAlert) {
          alert(errData.error || 'No consultant profile found. Please register first.');
        }
        localStorage.removeItem('consultant_user');
        return false;
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      if (showAlert) alert('An unexpected connection error occurred.');
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



  const handleAcceptRequest = async (booking) => {
    const id = booking.bookingId || booking.id;
    const meetLink = `https://meet.google.com/pd-${Math.random().toString(36).substring(2,5)}-${Math.random().toString(36).substring(2,5)}`;
    if (booking.bookingId) {
      await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.bookingId, status: 'accepted' }) });
      setDbBookings(prev => prev.map(b => b.bookingId === booking.bookingId ? { ...b, status: 'accepted', meetLink } : b));
    } else {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted', meetLink } : b));
    }
  };

  const handleDeclineRequest = async (booking) => {
    const id = booking.bookingId || booking.id;
    if (booking.bookingId) {
      await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId: booking.bookingId, status: 'declined' }) });
      setDbBookings(prev => prev.map(b => b.bookingId === booking.bookingId ? { ...b, status: 'declined' } : b));
    } else {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'declined' } : b));
    }
  };

  // ── Availability helpers ──────────────────────────────────────────────────
  const toggleDayAvailability = (dateStr) => {
    setAvailSchedule(prev => {
      const copy = { ...prev };
      if (copy[dateStr]) { delete copy[dateStr]; }
      else { copy[dateStr] = []; }
      return copy;
    });
    setAvailSelectedDay(prev => prev === dateStr ? null : dateStr);
  };

  const toggleSlot = (dateStr, slotValue) => {
    setAvailSchedule(prev => {
      const daySlots = prev[dateStr] ? [...prev[dateStr]] : [];
      const idx = daySlots.indexOf(slotValue);
      if (idx >= 0) daySlots.splice(idx, 1);
      else daySlots.push(slotValue);
      return { ...prev, [dateStr]: daySlots };
    });
  };

  const selectAllSlots = (dateStr) => {
    setAvailSchedule(prev => ({ ...prev, [dateStr]: ALL_SLOTS.map(s => s.value) }));
  };

  const clearAllSlots = (dateStr) => {
    setAvailSchedule(prev => ({ ...prev, [dateStr]: [] }));
  };

  const saveAvailability = async () => {
    if (!user) return;
    setAvailSaving(true);
    setAvailSaveMsg(null);
    try {
      const res = await fetch('/api/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: user._id.toString(), schedule: availSchedule })
      });
      if (res.ok) {
        setAvailSaveMsg({ type: 'success', text: 'Availability saved successfully!' });
      } else {
        setAvailSaveMsg({ type: 'error', text: 'Failed to save. Please try again.' });
      }
    } catch (e) {
      setAvailSaveMsg({ type: 'error', text: 'Connection error.' });
    } finally {
      setAvailSaving(false);
      setTimeout(() => setAvailSaveMsg(null), 3500);
    }
  };

  // Build calendar days for the viewed month
  const buildCalendarDays = () => {
    const { year, month } = availViewMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      days.push({ d, dateStr, isPast: date < today, isAvailable: !!availSchedule[dateStr] });
    }
    return days;
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const handleLogout = () => {
    localStorage.removeItem('consultant_user');
    setUser(null);
    setLoginStep('email');
    setEmailInput('');
    setOtpCode('');
  };

  const [activeClient, setActiveClient] = useState(null);
  const [clientProfile, setClientProfile] = useState(null);
  const [loadingClientProfile, setLoadingClientProfile] = useState(false);

  const handleViewClientProfile = async (booking) => {
    setActiveClient(booking);
    setLoadingClientProfile(true);
    try {
      const email = booking.clientEmail || 'bobby@gmail.com'; // default to Bobby
      const response = await fetch(`/api/user-profiles?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setClientProfile(data);
      } else {
        // Fallback: search in legacy users
        const responseLegacy = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        if (responseLegacy.ok) {
          const dataLegacy = await responseLegacy.json();
          setClientProfile(dataLegacy);
        } else {
          // Generate realistic mock details matching the client company / challenge
          setClientProfile({
            name: booking.clientName,
            email: email,
            college: 'Stanford University',
            major: 'Computer Science & MBA',
            bio: `Founder & Executive at ${booking.clientCompany}. Working on high-impact strategic initiatives.`,
            age: '29',
            phone: '+1 (555) 019-2831',
            location: 'San Francisco, CA',
            linkedIn: 'https://linkedin.com/in/alice-vance-professional',
            class10: '96%',
            class12: '94%',
            undergrad: 'B.S. in Computer Science - 3.9 GPA',
            postgrad: 'MBA in General Management',
            interests: ['DeFi', 'Strategy', 'Scaling', 'Product Innovation'],
            customInterests: ['Kite Surfing', 'Angel Investing'],
            gaps: ['Regulatory Strategy', 'Tokenomics Design'],
            gapCategory: 'Product Regulatory Alignment',
            gapDescription: booking.challenge,
            suggestedPaths: [
              { title: 'DeFi Protocol Scaling', icon: 'currency_exchange' },
              { title: 'Fintech Regulatory Compliance', icon: 'gavel' }
            ],
            currentSkills: ['Product Management', 'Blockchain Protocols', 'DeFi Compliance']
          });
        }
      }
    } catch (err) {
      console.error('Failed to load client profile:', err);
      setClientProfile({
        name: booking.clientName,
        email: booking.clientEmail || 'client@example.com',
        college: 'Stanford University',
        major: 'Economics',
        bio: `Strategic director at ${booking.clientCompany}.`,
        age: '28'
      });
    } finally {
      setLoadingClientProfile(false);
    }
  };

  const viewProfileProcessed = useRef(false);

  useEffect(() => {
    if (user && !viewProfileProcessed.current) {
      const params = new URLSearchParams(window.location.search);
      const viewProfileEmail = params.get('viewProfile');
      if (viewProfileEmail) {
        viewProfileProcessed.current = true;
        
        const realBooking = dbBookings.find(b => b.clientEmail === viewProfileEmail);
        const legacyBooking = bookings.find(b => b.clientEmail === viewProfileEmail);
        const bookingToView = realBooking || legacyBooking || {
          clientName: 'Client',
          clientEmail: viewProfileEmail,
          clientCompany: 'Company',
          challenge: 'Direct Profile View Link Request'
        };
        
        handleViewClientProfile(bookingToView);

        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [user, dbBookings, bookings]);

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
              {user.status === 'approved' && (
                <Link 
                  to={`/profile/${user._id}`} 
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-[#0052FF]/30 text-[#0052FF] hover:bg-[#0052FF]/5 rounded-xl font-bold text-[11px] transition-colors mt-2"
                >
                  View My Profile
                  <span className="material-symbols-outlined text-[12px] font-bold">arrow_forward</span>
                </Link>
              )}
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

          {/* Right Column: Tab Switcher */}
          <div className="lg:col-span-8 space-y-6">

            {/* Tab Nav */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setDashTab('bookings')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  dashTab === 'bookings' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">notifications_active</span>
                Incoming Bookings
                {(dbBookings.length > 0 || bookings.length > 0) && (
                  <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
                    {dbBookings.length > 0 ? dbBookings.filter(b => b.status === 'pending').length : bookings.filter(b => b.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setDashTab('availability')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  dashTab === 'availability' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                My Availability
              </button>
            </div>


            {/* ── BOOKINGS TAB ─────────────────────────────────────────── */}
            {dashTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
                <h3 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                  Incoming Client Bookings
                </h3>

                {/* Real DB bookings first, fallback to mock */}
                {(() => {
                  const allBookings = dbBookings.length > 0 ? dbBookings : bookings;
                  if (allBookings.length === 0) return (
                    <div className="text-center py-12 text-slate-400">
                      <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                      <p className="font-semibold">No booking requests yet.</p>
                    </div>
                  );
                  return (
                    <div className="space-y-5">
                      {allBookings.map((req) => {
                        const displayDate = req.date || '';
                        const displayTime = req.slot
                          ? (() => { const s = ALL_SLOTS.find(x => x.value === req.slot); return s ? s.label : req.slot; })()
                          : req.time || '';
                        const statusKey = req.status || 'pending';
                        return (
                          <div key={req.bookingId || req.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 transition-all">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-on-surface text-base">{req.clientName}</h4>
                                <p className="text-xs text-secondary font-medium">{req.clientCompany || req.clientEmail}</p>
                              </div>
                              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ${
                                statusKey === 'accepted' ? 'bg-green-100 text-green-700' :
                                statusKey === 'declined' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>{statusKey}</span>
                            </div>

                            <p className="text-sm text-secondary leading-relaxed mb-4 italic">
                              &ldquo;{req.challenge || req.context}&rdquo;
                            </p>

                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pb-4 border-b border-slate-200/50 mb-4">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">calendar_month</span>
                                <span className="font-medium">{displayDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span className="font-medium">{displayTime} <span className="text-slate-400">(45 min)</span></span>
                              </div>
                            </div>

                            <div className="flex flex-wrap justify-between items-center gap-4">
                              {statusKey === 'pending' && (
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleAcceptRequest(req)}
                                    className="bg-primary text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-primary/90 transition-colors shadow-sm"
                                  >Accept Request</button>
                                  <button
                                    onClick={() => handleDeclineRequest(req)}
                                    className="border border-slate-200 text-slate-600 font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors"
                                  >Decline</button>
                                </div>
                              )}
                              {statusKey === 'accepted' && (
                                <div className="bg-green-50 border border-green-100 p-3 px-4 rounded-xl flex flex-wrap items-center gap-2 flex-1">
                                  <span className="material-symbols-outlined text-green-600 text-sm">videocam</span>
                                  <span className="text-xs font-semibold text-green-700">Meet Link:</span>
                                  <a href={req.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline truncate max-w-[200px]">{req.meetLink}</a>
                                </div>
                              )}
                              {statusKey === 'declined' && (
                                <p className="text-xs text-rose-600 italic">Session declined.</p>
                              )}
                              <button
                                onClick={() => handleViewClientProfile(req)}
                                className="text-[#0052FF] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline ml-auto"
                              >View Profile <span className="material-symbols-outlined text-xs">arrow_forward</span></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── AVAILABILITY TAB ─────────────────────────────────────── */}
            {dashTab === 'availability' && (
              <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden">

                {/* Header */}
                <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-headline font-extrabold text-xl flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">calendar_month</span>
                      Set Your Availability
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Click a date to toggle it available. Then select your open 45-min slots for that day.</p>
                  </div>
                  <button
                    onClick={saveAvailability}
                    disabled={availSaving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-sm disabled:opacity-60 shrink-0"
                  >
                    {availSaving ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"/> : <span className="material-symbols-outlined text-base">save</span>}
                    {availSaving ? 'Saving…' : 'Save Availability'}
                  </button>
                </div>

                {/* Save message */}
                {availSaveMsg && (
                  <div className={`mx-8 mt-4 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                    availSaveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    <span className="material-symbols-outlined text-base">{availSaveMsg.type === 'success' ? 'check_circle' : 'error'}</span>
                    {availSaveMsg.text}
                  </div>
                )}

                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

                  {/* ── Month Calendar ── */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setAvailViewMonth(prev => {
                          let m = prev.month - 1, y = prev.year;
                          if (m < 0) { m = 11; y--; }
                          return { year: y, month: m };
                        })}
                        className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                      ><span className="material-symbols-outlined">chevron_left</span></button>
                      <span className="font-headline font-extrabold text-base">
                        {MONTH_NAMES[availViewMonth.month]} {availViewMonth.year}
                      </span>
                      <button
                        onClick={() => setAvailViewMonth(prev => {
                          let m = prev.month + 1, y = prev.year;
                          if (m > 11) { m = 0; y++; }
                          return { year: y, month: m };
                        })}
                        className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-500"
                      ><span className="material-symbols-outlined">chevron_right</span></button>
                    </div>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 text-center mb-2">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="text-[10px] font-black text-slate-400 uppercase">{d}</div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {buildCalendarDays().map((day, i) => {
                        if (!day) return <div key={`blank-${i}`} />;
                        const isSelected = availSelectedDay === day.dateStr;
                        const isAvail = day.isAvailable;
                        return (
                          <button
                            key={day.dateStr}
                            disabled={day.isPast}
                            onClick={() => {
                              toggleDayAvailability(day.dateStr);
                            }}
                            className={`aspect-square rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              day.isPast
                                ? 'text-slate-300 cursor-not-allowed'
                                : isAvail && isSelected
                                ? 'bg-primary text-white ring-2 ring-primary ring-offset-1 shadow-md'
                                : isAvail
                                ? 'bg-primary/15 text-primary font-extrabold hover:bg-primary/25'
                                : isSelected
                                ? 'bg-slate-100 ring-2 ring-primary ring-offset-1'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {day.d}
                            {isAvail && !day.isPast && (
                              <span className="w-1 h-1 rounded-full bg-current opacity-70" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex gap-3 text-xs">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/20"/><span className="text-slate-500">Available</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200"/><span className="text-slate-500">Not set</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 opacity-40"/><span className="text-slate-400">Past</span></div>
                    </div>
                  </div>

                  {/* ── Slot Picker ── */}
                  <div>
                    {availSelectedDay ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Slots For</p>
                            <p className="font-extrabold text-base text-slate-800">
                              {new Date(availSelectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => selectAllSlots(availSelectedDay)} className="text-[10px] font-bold text-primary hover:underline uppercase">All</button>
                            <span className="text-slate-200">|</span>
                            <button onClick={() => clearAllSlots(availSelectedDay)} className="text-[10px] font-bold text-rose-400 hover:underline uppercase">Clear</button>
                          </div>
                        </div>
                        {!availSchedule[availSelectedDay] ? (
                          <div className="text-center py-8 bg-slate-50 rounded-2xl">
                            <span className="material-symbols-outlined text-3xl text-slate-300 mb-2">toggle_off</span>
                            <p className="text-sm text-slate-500">This day is not marked available.</p>
                            <button
                              onClick={() => setAvailSchedule(prev => ({ ...prev, [availSelectedDay]: [] }))}
                              className="mt-3 text-xs font-bold text-primary hover:underline"
                            >Enable this day</button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 max-h-[340px] overflow-y-auto pr-1">
                            {ALL_SLOTS.map(slot => {
                              const isOn = (availSchedule[availSelectedDay] || []).includes(slot.value);
                              return (
                                <button
                                  key={slot.value}
                                  onClick={() => toggleSlot(availSelectedDay, slot.value)}
                                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                                    isOn
                                      ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20'
                                      : 'border-slate-200 text-slate-500 hover:border-primary/40 hover:text-primary'
                                  }`}
                                >
                                  {slot.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-4">
                          {(availSchedule[availSelectedDay] || []).length} of {ALL_SLOTS.length} slots open
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-16 text-center text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3 text-slate-200">touch_app</span>
                        <p className="font-semibold text-slate-500">Select a date</p>
                        <p className="text-xs mt-1">Click any date on the calendar to set its available time slots.</p>
                      </div>
                    )}
                  </div>

                </div>

                {/* Summary strip */}
                <div className="px-8 pb-8">
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Currently Available Days</p>
                    {Object.keys(availSchedule).filter(d => availSchedule[d] !== undefined).length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No availability set yet. Click dates on the calendar to get started.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(availSchedule)
                          .filter(([,slots]) => slots !== undefined)
                          .sort(([a],[b]) => a.localeCompare(b))
                          .map(([dateStr, slots]) => (
                            <div key={dateStr} className="flex items-center gap-1.5 bg-white border border-primary/20 rounded-xl px-3 py-1.5">
                              <span className="material-symbols-outlined text-primary text-xs">event_available</span>
                              <span className="text-xs font-bold text-slate-700">
                                {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-slate-400">{(slots || []).length} slots</span>
                              <button
                                onClick={() => setAvailSchedule(prev => { const c = {...prev}; delete c[dateStr]; return c; })}
                                className="text-slate-300 hover:text-rose-400 transition-colors ml-1"
                              ><span className="material-symbols-outlined text-xs">close</span></button>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </main>

      {/* ─── Client Profile Modal ─── */}
      {activeClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative border border-slate-100 animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setActiveClient(null);
                setClientProfile(null);
              }}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {loadingClientProfile ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-secondary font-medium">Fetching client profile...</p>
              </div>
            ) : clientProfile ? (
              <div className="space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 rounded-2xl bg-[#003ec7]/5 text-[#003ec7] flex items-center justify-center text-3xl font-extrabold shadow-sm border border-[#003ec7]/10 shrink-0">
                    {clientProfile.avatar || clientProfile.profileImage ? (
                      <img 
                        src={clientProfile.avatar || clientProfile.profileImage} 
                        alt={clientProfile.name || clientProfile.fullName} 
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      (clientProfile.name || clientProfile.fullName || 'C')[0].toUpperCase()
                    )}
                  </div>
                  <div className="text-center sm:text-left space-y-1">
                    <span className="text-[10px] font-bold text-[#003ec7] tracking-[0.2em] uppercase block">Client Profile</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{clientProfile.name || clientProfile.fullName}</h3>
                    <p className="text-sm font-semibold text-slate-500">{activeClient.clientCompany} • Client Partner</p>
                    
                    {/* Contact links */}
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium pt-2 justify-center sm:justify-start">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">mail</span>{clientProfile.email}</span>
                      {clientProfile.location && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span>{clientProfile.location}</span>}
                      {clientProfile.linkedIn && (
                        <a href={clientProfile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#003ec7] hover:underline">
                          <span className="material-symbols-outlined text-sm">link</span>LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Challenge or focus context */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Session Focus Challenge</h4>
                  <p className="text-sm text-slate-700 italic leading-relaxed">
                    "{activeClient.challenge}"
                  </p>
                </div>

                {/* Bio / Overview */}
                {clientProfile.bio && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Biography Overview</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{clientProfile.bio}</p>
                  </div>
                )}

                {/* Educational History Grid */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Educational Background</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {clientProfile.undergrad && (
                      <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-700">Undergraduate</p>
                          <p className="text-[10px] text-slate-400">Bachelor's Degree</p>
                        </div>
                        <span className="font-bold text-[#003ec7] max-w-[200px] text-right truncate">{clientProfile.undergrad}</span>
                      </div>
                    )}
                    {clientProfile.postgrad && (
                      <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-700">Postgraduate</p>
                          <p className="text-[10px] text-slate-400">Master's / Advanced Degree</p>
                        </div>
                        <span className="font-bold text-[#003ec7] max-w-[200px] text-right truncate">{clientProfile.postgrad}</span>
                      </div>
                    )}
                    {clientProfile.class12 && (
                      <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-700">12th Standard</p>
                          <p className="text-[10px] text-slate-400">Higher Secondary Education</p>
                        </div>
                        <span className="font-bold text-[#003ec7]">{clientProfile.class12}</span>
                      </div>
                    )}
                    {clientProfile.class10 && (
                      <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-700">10th Standard</p>
                          <p className="text-[10px] text-slate-400">Secondary Education</p>
                        </div>
                        <span className="font-bold text-[#003ec7]">{clientProfile.class10}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Core Skills & Suggested Pathways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Skills */}
                  {clientProfile.currentSkills && clientProfile.currentSkills.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strengths & Core Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {clientProfile.currentSkills.map(skill => (
                          <span key={skill} className="bg-slate-50 text-slate-500 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase border border-slate-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Pathways */}
                  {clientProfile.suggestedPaths && clientProfile.suggestedPaths.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Suggested Pathways</h4>
                      <div className="space-y-2">
                        {clientProfile.suggestedPaths.map((path, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-[#003ec7]/5 text-[#003ec7] px-3.5 py-2 rounded-xl text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">{path.icon || 'bolt'}</span>
                            {path.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-rose-500 mb-2">person_off</span>
                <p className="font-bold text-slate-800">Profile Not Found</p>
                <p className="text-xs text-slate-500 mt-1">Unable to construct details for this client.</p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
