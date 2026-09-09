import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  const getLinkClass = (path) => {
    const isActive = pathname === path;
    if (isActive) {
      return "text-[#0052FF] font-bold text-sm transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-[#0052FF] after:rounded-full";
    }
    return "text-slate-600 dark:text-slate-300 hover:text-[#0052FF] dark:hover:text-[#0052FF] font-medium text-sm transition-colors";
  };

  const isAdminLoggedIn = localStorage.getItem('prodecide_admin_auth') === 'true';
  const isAnyUserLoggedIn = !!tempUser || !!userName || !!userEmail || !!consultantData || isAdminLoggedIn;

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 max-w-6xl mx-auto pointer-events-none">
      <div className="pointer-events-auto bg-white/85 dark:bg-[#0b132b]/85 backdrop-blur-xl border border-white/90 dark:border-slate-800/80 shadow-[0_10px_35px_rgba(0,0,0,0.06)] rounded-full px-6 py-2.5 flex justify-between items-center transition-all duration-300">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link className="text-xl font-extrabold text-[#03091e] dark:text-white tracking-tight font-headline flex items-center" to="/">
            prodecide<span className="text-[#0052FF]">.ai</span>
          </Link>

          {/* Centered Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 ml-4">
            <Link className={getLinkClass('/discovery')} to="/discovery">Discover</Link>
            <Link className={getLinkClass('/about')} to="/about">About Us</Link>
            <Link className={getLinkClass('/experts')} to="/experts">Consultants</Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Icon */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300 relative flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-lg">notifications</span>
              {((consultantData && incomingRequests.length > 0) || (!consultantData)) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0052FF] rounded-full"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-4 w-80 rounded-2xl bg-white/95 dark:bg-[#191c1e]/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-2xl py-3 z-50 transform origin-top-right transition-all">
                <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Notifications</p>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {consultantData ? `${incomingRequests.length} New` : '2 New'}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto mt-2 divide-y divide-slate-100 dark:divide-slate-800">
                  {consultantData ? (
                    incomingRequests.length > 0 ? (
                      incomingRequests.map((req, reqIdx) => (
                        <div key={reqIdx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <Link to="/consultant-dashboard" onClick={() => setNotificationsOpen(false)} className="block text-left no-underline group">
                            <div className="flex gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0052FF] transition-colors">
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
                      <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Matching algorithm complete</p>
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
                <div className="absolute right-0 mt-4 w-56 rounded-2xl bg-white/95 dark:bg-[#191c1e]/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 shadow-2xl py-2 z-50 transform origin-top-right transition-all">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
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
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">explore</span>
                      User Portal
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                    >
                      <span className="material-symbols-outlined text-base text-slate-400">dashboard</span>
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-all text-xs font-semibold border-none bg-transparent cursor-pointer text-left"
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
              className="px-4 py-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 font-medium text-xs md:text-sm transition-all hidden sm:inline-block"
            >
              Login
            </Link>
          )}

          {/* Primary CTA (Matching reference image "Start selling" -> "Start Discovery") */}
          <Link
            to="/discovery"
            className="px-5 py-2.5 rounded-full bg-[#03091e] hover:bg-[#0a1538] text-white font-semibold text-xs md:text-sm transition-all shadow-md hover:shadow-lg active:scale-95 inline-flex items-center gap-1.5"
          >
            Start Discovery
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 bg-white/95 dark:bg-[#0b132b]/95 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl animate-fade-in">
          <nav className="flex flex-col gap-2">
            <Link
              className="text-slate-800 dark:text-slate-200 hover:text-[#0052FF] font-semibold text-base py-2 border-b border-slate-100 dark:border-slate-800"
              to="/discovery"
            >
              Discover
            </Link>
            <Link
              className="text-slate-800 dark:text-slate-200 hover:text-[#0052FF] font-semibold text-base py-2 border-b border-slate-100 dark:border-slate-800"
              to="/about"
            >
              About Us
            </Link>
            <Link
              className="text-slate-800 dark:text-slate-200 hover:text-[#0052FF] font-semibold text-base py-2 border-b border-slate-100 dark:border-slate-800"
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
    </header>
  );
}
