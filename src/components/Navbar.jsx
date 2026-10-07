import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { apiFetch } from '../utils/api.js';

export default function Navbar({ tempUser = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const dropdownRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userPicture, setUserPicture] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [consultantData, setConsultantData] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem('discovery_verified_name');
    const storedEmail = localStorage.getItem('discovery_verified_email');
    const storedPicture = localStorage.getItem('discovery_user_picture');
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
    if (storedPicture) setUserPicture(storedPicture);
    setMobileMenuOpen(false);

    // Fetch real bookings if logged in as a consultant
    const savedConsultant = localStorage.getItem('consultant_user');
    if (savedConsultant) {
      try {
        const parsed = JSON.parse(savedConsultant);
        setConsultantData(parsed);
        apiFetch(`/api/bookings?consultantEmail=${encodeURIComponent(parsed.email)}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              // Get pending incoming requests
              const pending = data.filter(b => b.status === 'pending');
              setIncomingRequests(pending);
            }
          })
          .catch(err => console.error("Error fetching bookings in Navbar:", err));
      } catch (e) {
        console.error("Error parsing consultant_user:", e);
      }
    } else {
      setConsultantData(null);
      setIncomingRequests([]);
    }
  }, [location.pathname]);

  // Listen for storage events (e.g. from Discovery Google auth)
  useEffect(() => {
    const handleStorageEvent = () => {
      const pic = localStorage.getItem('discovery_user_picture');
      const name = localStorage.getItem('discovery_verified_name');
      const email = localStorage.getItem('discovery_verified_email');
      if (pic) setUserPicture(pic);
      if (name) setUserName(name);
      if (email) setUserEmail(email);
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('discovery_verified_email');
    localStorage.removeItem('discovery_verified_name');
    localStorage.removeItem('discovery_user_profile');
    localStorage.removeItem('discovery_results');
    localStorage.removeItem('discovery_onboarding_context');
    localStorage.removeItem('discovery_user_picture');
    localStorage.removeItem('consultant_user');
    localStorage.removeItem('prodecide_admin_auth');
    setUserName('');
    setUserEmail('');
    setUserPicture('');
    setConsultantData(null);
    setIncomingRequests([]);
    setDropdownOpen(false);
    navigate('/');
    window.location.reload();
  };

  const navItems = [
    { path: '/discovery', label: 'Discover' },
    { path: '/about', label: 'About Us' },
    { path: '/experts', label: 'Consultants' },
  ];

  const isAdminLoggedIn = localStorage.getItem('prodecide_admin_auth') === 'true';
  const isAnyUserLoggedIn = !!tempUser || !!userName || !!userEmail || !!consultantData || isAdminLoggedIn;

  return (
    <header className="fixed top-4 inset-x-0 z-50 px-6 md:px-12 pointer-events-none">
      <div className="max-w-7xl mx-auto">
      <div className={`pointer-events-auto relative grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center bg-[#050a18]/70 backdrop-blur-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-full px-5 md:px-6 transition-all duration-300 ${scrolled ? 'py-1.5 bg-[#050a18]/85 border-cyan-400/20' : 'py-2.5'}`}>

        {/* Brand Logo */}
        <Link className="justify-self-start text-xl font-extrabold text-white tracking-tight font-headline flex items-center" to="/">
          prodecide<span className="text-cyan-400">.ai</span>
        </Link>

        {/* Centered Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`relative px-4 py-1.5 rounded-full text-sm transition-colors ${active ? 'text-white font-semibold' : 'text-slate-300 hover:text-white font-medium'}`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-cyan-400/30 shadow-[0_0_18px_rgba(0,240,255,0.15)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="justify-self-end flex items-center gap-3">
          {/* Notifications Icon */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-full hover:bg-white/10 transition-all text-slate-300 relative flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              {((consultantData && incomingRequests.length > 0) || (!consultantData)) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0052FF] rounded-full"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-4 w-80 rounded-2xl bg-[#0b1226]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-3 z-50 transform origin-top-right transition-all">
                <div className="px-4 pb-2 border-b border-white/10 flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-100 uppercase tracking-wider">Notifications</p>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {consultantData ? `${incomingRequests.length} New` : '2 New'}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto mt-2 divide-y divide-white/10">
                  {consultantData ? (
                    incomingRequests.length > 0 ? (
                      incomingRequests.map((req, reqIdx) => (
                        <div key={reqIdx} className="p-3.5 hover:bg-white/5 transition-colors">
                          <Link to="/consultant-dashboard" onClick={() => setNotificationsOpen(false)} className="block text-left no-underline group">
                            <div className="flex gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                              <div>
                                <p className="text-xs font-bold text-slate-100 group-hover:text-[#0052FF] transition-colors">
                                  Request from {req.clientName}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  {req.date} at {req.slot}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                                  Context: {req.context || 'No context shared.'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 font-medium">
                        No new booking requests.
                      </div>
                    )
                  ) : (
                    <>
                      <div className="p-3.5 hover:bg-white/5 transition-colors">
                        <div className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-100">Matching algorithm complete</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">3 consulting experts have been hand-matched to your assessment.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Login or User Profile */}
          {isAnyUserLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all flex items-center justify-center"
              >
                <img
                  alt="User Profile"
                  src={tempUser?.picture || consultantData?.profileImage || userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(tempUser?.name || consultantData?.name || userName || 'User')}&background=0D8ABC&color=fff`}
                  className="w-full h-full object-cover"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 rounded-2xl bg-[#0b1226]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-sm font-bold text-slate-100 truncate">
                      {tempUser ? tempUser.name : consultantData ? consultantData.name : isAdminLoggedIn ? 'Administrator' : userName || 'User'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {tempUser ? tempUser.email : consultantData ? consultantData.email : isAdminLoggedIn ? 'admin@prodecide.com' : userEmail}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-1">
                    <Link
                      to="/discovery"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">explore</span>
                      User Portal
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">dashboard</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-600 transition-all text-xs font-semibold border-none bg-transparent cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-base text-red-500">logout</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/registration"
              className="px-4 py-2 rounded-full text-slate-300 hover:bg-white/10 font-medium text-xs md:text-sm transition-all hidden sm:inline-block"
            >
              Login
            </Link>
          )}

          {/* Primary CTA (Matching reference image "Start selling" -> "Start Discovery") */}
          <Link
            to="/discovery"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0052FF] to-blue-600 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold text-xs md:text-sm transition-all shadow-[0_0_24px_rgba(0,82,255,0.4)] active:scale-95 inline-flex items-center gap-1.5"
          >
            <span className="sm:hidden">Start</span>
            <span className="hidden sm:inline">Start Discovery</span>
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-white/10 transition-all text-slate-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
        {/* Scroll progress along the pill's bottom edge */}
        <div className="absolute inset-x-8 -bottom-px h-px overflow-hidden rounded-full pointer-events-none">
          <motion.div className="h-full origin-left bg-gradient-to-r from-cyan-400 via-[#0052FF] to-indigo-500 shadow-[0_0_10px_#00f0ff]" style={{ scaleX: progress }} />
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 bg-[#0b1226]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-3 shadow-2xl animate-fade-in">
          <nav className="flex flex-col gap-2">
            <Link
              className="text-slate-100 hover:text-[#0052FF] font-semibold text-base py-2 border-b border-white/10"
              to="/discovery"
            >
              Discover
            </Link>
            <Link
              className="text-slate-100 hover:text-[#0052FF] font-semibold text-base py-2 border-b border-white/10"
              to="/about"
            >
              About Us
            </Link>
            <Link
              className="text-slate-100 hover:text-[#0052FF] font-semibold text-base py-2 border-b border-white/10"
              to="/experts"
            >
              Consultants
            </Link>
            <Link
              className="text-[#0052FF] font-bold text-base py-2"
              to="/registration"
            >
              Join as Expert
            </Link>
          </nav>
        </div>
      )}
      </div>
    </header>
  );
}
