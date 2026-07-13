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
      return "text-[#0052FF] border-b-2 border-[#0052FF] pb-1 font-manrope tracking-tight font-bold text-lg";
    }
    return "text-slate-500 dark:text-slate-400 hover:text-[#0052FF] font-manrope tracking-tight font-bold text-lg transition-all duration-200 ease-in-out";
  };

  const isAdminLoggedIn = localStorage.getItem('prodecide_admin_auth') === 'true';
  const isAnyUserLoggedIn = !!tempUser || !!userName || !!userEmail || !!consultantData || isAdminLoggedIn;

  return (
    <header className={`sticky top-0 w-full z-50 transition-all duration-300 ${pathname === '/discovery' ? 'bg-transparent border-none' : 'bg-[#f7f9fb]/90 dark:bg-[#191c1e]/90 backdrop-blur-md border-b border-slate-200/40 shadow-sm'}`}>
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link className="text-xl font-black text-[#0052FF] tracking-tighter font-headline" to="/">ProDecide</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className={getLinkClass('/discovery')} to="/discovery">Discover</Link>
            <Link className={getLinkClass('/about')} to="/about">About Us</Link>
            <Link className={getLinkClass('/experts')} to="/experts">Consultants</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/registration" className="px-5 py-2 rounded-full border border-[#0052FF] text-[#0052FF] font-bold hover:bg-[#0052FF]/5 transition-all text-sm hidden sm:inline-block">
            Join as Expert
          </Link>
          {/* Interactive Search Expandable Input */}
          {pathname !== '/' && (
            <div className="flex items-center">
              {searchOpen ? (
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 animate-fade-in">
                  <input 
                    type="text" 
                    placeholder="Search network..." 
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-32 md:w-44 text-slate-700 dark:text-slate-200 placeholder-slate-400 font-bold"
                    autoFocus
                  />
                  <button onClick={() => { setSearchOpen(false); setSearchVal(''); }} className="text-slate-400 hover:text-slate-600 flex items-center">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => setSearchOpen(true)} className="p-2 rounded-md hover:bg-slate-200/50 transition-all text-slate-600 flex">
                  <span className="material-symbols-outlined text-xl">search</span>
                </button>
              )}
            </div>
          )}

          {/* Interactive Notifications Panel */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-md hover:bg-slate-200/50 transition-all text-slate-600 relative flex"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {((consultantData && incomingRequests.length > 0) || (!consultantData)) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-[#191c1e] border border-slate-200/50 dark:border-slate-800 shadow-xl py-3 z-50 transform origin-top-right transition-all">
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
                      <div className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Welcome to ProDecide AI!</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Click 'Start Your Discovery' to get custom, neural-guided strategy mapping.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {isAnyUserLoggedIn && (
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:inline-block bg-slate-100/60 dark:bg-slate-800/60 px-3 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/50">
              {tempUser ? (tempUser.name || 'User') : consultantData ? (consultantData.name || 'Consultant') : isAdminLoggedIn ? 'Admin' : userName}
            </span>
          )}

          {/* Interactive Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0052FF] transition-all flex"
            >
              <img 
                alt="User Profile" 
                src={tempUser?.picture || consultantData?.profileImage || userPicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(tempUser?.name || consultantData?.name || userName || 'User')}&background=0D8ABC&color=fff`} 
                className="w-full h-full object-cover" 
              />
            </button>
 
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-[#191c1e] border border-slate-200/50 dark:border-slate-800 shadow-xl py-2 z-50 transform origin-top-right transition-all">
                {isAnyUserLoggedIn && (
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    {tempUser ? (
                      <>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{tempUser.name || 'User'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{tempUser.email}</p>
                      </>
                    ) : consultantData ? (
                      <>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{consultantData.name || 'Consultant'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{consultantData.email}</p>
                      </>
                    ) : isAdminLoggedIn ? (
                      <>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Administrator</p>
                        <p className="text-[10px] text-slate-400 truncate">admin@prodecide.com</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{userName}</p>
                        {userEmail && <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>}
                      </>
                    )}
                  </div>
                )}
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Switch Portal</p>
                </div>
                <div className="p-1.5 space-y-1">
                  <Link 
                    to="/admin" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400">admin_panel_settings</span>
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400">dashboard</span>
                    User Dashboard
                  </Link>
                  <Link 
                    to="/discovery" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400">explore</span>
                    User Portal
                  </Link>
                  <Link 
                    to="/consultant-dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-sm font-semibold"
                  >
                    <span className="material-symbols-outlined text-lg text-slate-400">badge</span>
                    Consultant Portal
                  </Link>
                  {isAnyUserLoggedIn && (
                    <>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 hover:text-red-700 transition-all text-sm font-semibold border-none bg-transparent cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-lg text-red-500">logout</span>
                        Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-slate-200/50 transition-all text-slate-600 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#191c1e]/95 backdrop-blur-lg border-t border-slate-200/40 p-6 space-y-4 shadow-lg animate-fade-in">
          <nav className="flex flex-col gap-4">
            <Link 
              className="text-slate-800 dark:text-slate-200 hover:text-[#0052FF] font-manrope font-bold text-lg py-2 border-b border-slate-100 dark:border-slate-800" 
              to="/discovery"
            >
              Discover
            </Link>
            <Link 
              className="text-slate-800 dark:text-slate-200 hover:text-[#0052FF] font-manrope font-bold text-lg py-2 border-b border-slate-100 dark:border-slate-800" 
              to="/about"
            >
              About Us
            </Link>
            <Link 
              className="text-slate-800 dark:text-slate-200 hover:text-[#0052FF] font-manrope font-bold text-lg py-2 border-b border-slate-100 dark:border-slate-800" 
              to="/experts"
            >
              Consultants
            </Link>
            <Link 
              className="text-[#0052FF] hover:underline font-manrope font-bold text-lg py-2" 
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
