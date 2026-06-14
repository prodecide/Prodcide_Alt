import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';

  // Navigation tabs: 'profile' or 'insights'
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('discovery_verified_email')
  );

  // Profile Form States
  const [profileName, setProfileName] = useState('');
  const [profileAge, setProfileAge] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [class10, setClass10] = useState('');
  const [class12, setClass12] = useState('');
  const [undergrad, setUndergrad] = useState('');
  const [postgrad, setPostgrad] = useState('');
  const [interests, setInterests] = useState(['AI integration', 'Logistics']);
  const [newInterest, setNewInterest] = useState('');

  // OTP Verification States
  const [otpStep, setOtpStep] = useState('none'); // 'none', 'otp-sent', 'verified'
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // AI Career Path Results States
  const [suggestedPaths, setSuggestedPaths] = useState([]);
  const [criticalGaps, setCriticalGaps] = useState([]);
  const [currentSkills, setCurrentSkills] = useState([]);

  // Load profile data and AI results on mount
  useEffect(() => {
    // Synchronize state with tab URL parameter
    setActiveTab(activeTabParam);

    // 1. Pre-fill from existing verified profile
    const storedEmail = localStorage.getItem('discovery_verified_email') || '';
    const storedName = localStorage.getItem('discovery_verified_name') || '';
    if (storedEmail) setProfileEmail(storedEmail);
    if (storedName) setProfileName(storedName);

    const savedProfileStr = localStorage.getItem('discovery_user_profile');
    if (savedProfileStr) {
      try {
        const profile = JSON.parse(savedProfileStr);
        if (profile.name) setProfileName(profile.name);
        if (profile.age) setProfileAge(profile.age);
        if (profile.class10) setClass10(profile.class10);
        if (profile.class12) setClass12(profile.class12);
        if (profile.undergrad) setUndergrad(profile.undergrad);
        if (profile.postgrad) setPostgrad(profile.postgrad);
        if (profile.interests) setInterests(profile.interests);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    } else {
      // Fallback pre-fill from onboarding context if not fully verified yet
      const onboardingContextStr = localStorage.getItem('discovery_onboarding_context');
      if (onboardingContextStr) {
        try {
          const onboarding = JSON.parse(onboardingContextStr);
          if (onboarding.name) setProfileName(onboarding.name);
          if (onboarding.age) setProfileAge(onboarding.age);
        } catch (e) {
          console.error("Failed to parse onboarding context", e);
        }
      }
    }

    // 2. Load AI Results
    const savedResultsStr = localStorage.getItem('discovery_results');
    if (savedResultsStr) {
      try {
        const results = JSON.parse(savedResultsStr);
        setSuggestedPaths(results.suggestedPaths || []);
        setCriticalGaps(results.criticalGaps || []);
        setCurrentSkills(results.currentSkills || []);
      } catch (e) {
        console.error("Failed to parse AI results", e);
      }
    }
  }, [activeTabParam]);

  // Tab switching handler
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Interests Tag Handlers
  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
      saveProfileLocally([...interests, newInterest.trim()]);
    }
  };

  const handleRemoveInterest = (tagToRemove) => {
    const updated = interests.filter(tag => tag !== tagToRemove);
    setInterests(updated);
    saveProfileLocally(updated);
  };

  const saveProfileLocally = (updatedInterests = interests) => {
    const profileData = {
      name: profileName,
      age: profileAge,
      class10,
      class12,
      undergrad,
      postgrad,
      interests: updatedInterests
    };
    localStorage.setItem('discovery_user_profile', JSON.stringify(profileData));
  };

  // Submit Profile & Send OTP
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Validations
    if (!profileName.trim()) {
      setAuthError('Name is required.');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      setAuthError('A valid email is required.');
      return;
    }
    if (!class10.trim()) {
      setAuthError('10th Standard academic score is mandatory.');
      return;
    }
    if (!class12.trim()) {
      setAuthError('12th Standard academic score is mandatory.');
      return;
    }
    if (!undergrad.trim()) {
      setAuthError('Undergraduate academic score is mandatory.');
      return;
    }

    setIsAuthLoading(true);
    try {
      const response = await fetch('/api/auth?action=send-general-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profileEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP.');

      saveProfileLocally();
      setOtpStep('otp-sent');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode.trim() || otpCode.length < 6) {
      setAuthError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const response = await fetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profileEmail, code: otpCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed.');

      // Persist authenticated state
      localStorage.setItem('discovery_verified_email', profileEmail.toLowerCase().trim());
      localStorage.setItem('discovery_verified_name', profileName.trim());
      setIsAuthenticated(true);
      setOtpStep('verified');

      // Save profile locally again to bind name
      saveProfileLocally();

      // Trigger navbar state refresh
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('discovery_verified_email');
    localStorage.removeItem('discovery_verified_name');
    localStorage.removeItem('discovery_user_profile');
    localStorage.removeItem('discovery_results');
    setIsAuthenticated(false);
    setOtpStep('none');
    setProfileEmail('');
    setProfileName('');
    setClass10('');
    setClass12('');
    setUndergrad('');
    setPostgrad('');
    window.dispatchEvent(new Event('storage'));
    navigate('/discovery');
  };

  return (
    <div className="bg-[#f7f9fb] font-body text-[#191c1e] min-h-screen">
      {/* TopAppBar header layout matching user request */}
      <header className="bg-[#f2f4f6]/80 dark:bg-slate-800/80 backdrop-blur-md fixed top-0 z-50 w-full px-8 py-4 flex justify-between items-center border-b border-slate-200/40">
        <Link to="/" className="text-2xl font-black tracking-tighter text-[#0052FF] headline-anchor">ProDecide</Link>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-200/50 rounded-full transition-colors">notifications</span>
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-200/50 rounded-full transition-colors">settings</span>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              <img 
                alt="User profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1WWd7xQb6qdiUpiz5_oeOKw6xBWoVTMA7y4B479iG0DNrsikApleJo_94iD7x7lXra5v3L-xEuo8nhZxjU3QVEbeE37W25W6CGvSMcdB_DLuwwnoSOIoB3CVh6JSjL9hccqHETGcOcpe6eyLL8fXvJvixm2noSb30CNwfOsAXMo9-OKkEAp2P4SCWiFwiasiFEoX1BQDj5rQqnvIs3dcUSXIotMhvzQ3USuJPcgk2tSNsmFsGnh-oeBHuV_KHodkV5nU1zzgUops"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar Desktop layout */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-24 pb-8 bg-[#f2f4f6] z-40 bg-gradient-to-r from-[#f2f4f6] to-[#f7f9fb]">
        <nav className="flex-grow">
          <div className="space-y-1">
            <button 
              onClick={() => handleTabChange('profile')}
              className={`w-full flex items-center pl-6 py-3 transition-all font-medium text-sm border-r-4 ${
                activeTab === 'profile' 
                  ? 'bg-white text-[#0052FF] font-semibold border-[#0052FF] shadow-sm shadow-[#0052FF]/5' 
                  : 'text-slate-500 hover:text-[#0052FF] hover:bg-slate-100/30 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined mr-3">verified_user</span>
              My Profile
            </button>
            <button 
              onClick={() => handleTabChange('insights')}
              className={`w-full flex items-center pl-6 py-3 transition-all font-medium text-sm border-r-4 ${
                activeTab === 'insights' 
                  ? 'bg-white text-[#0052FF] font-semibold border-[#0052FF] shadow-sm shadow-[#0052FF]/5' 
                  : 'text-slate-500 hover:text-[#0052FF] hover:bg-slate-100/30 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined mr-3">insights</span>
              Strategic Insights
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* ─── TAB 1: MY PROFILE ─── */}
        {activeTab === 'profile' && (
          <section className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold headline-anchor tracking-tight mb-2">My User Profile</h1>
              <p className="text-slate-500 text-sm font-medium">
                {isAuthenticated 
                  ? "Your academic profile is verified. You can review or update details below." 
                  : "Please complete your mandatory academic details and authenticate to initiate your AI consulting session."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                
                {otpStep === 'verified' && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-600">verified</span>
                    <div>
                      <p className="font-bold text-sm">Authentication Successful!</p>
                      <p className="text-xs mt-0.5">Your email has been authenticated and academic profile is complete. Click below to continue your career analysis.</p>
                      <button 
                        onClick={() => navigate('/discovery')}
                        className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        Proceed to AI Discovery Chat
                      </button>
                    </div>
                  </div>
                )}

                {authError && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3 text-sm font-semibold">
                    <span className="material-symbols-outlined">error</span>
                    <span>{authError}</span>
                  </div>
                )}

                {otpStep === 'otp-sent' ? (
                  <div className="space-y-6 max-w-md py-4">
                    <div className="text-center md:text-left">
                      <span className="material-symbols-outlined text-4xl text-primary animate-bounce mb-2">mail_lock</span>
                      <h3 className="font-bold text-lg text-slate-800">Verify OTP</h3>
                      <p className="text-xs text-slate-500 mt-1">We sent a 6-digit verification code to <span className="font-semibold">{profileEmail}</span>. Enter it below to complete authentication.</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Verification Code</label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-center tracking-widest font-bold focus:ring-2 focus:ring-primary outline-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleVerifyOtp}
                        disabled={isAuthLoading}
                        className="flex-1 bg-primary text-white p-3 rounded-lg text-xs font-bold hover:bg-[#003ec7] transition-all flex items-center justify-center gap-2"
                      >
                        {isAuthLoading ? 'Verifying...' : 'Verify OTP Code'}
                      </button>
                      <button 
                        onClick={() => setOtpStep('none')}
                        className="bg-slate-100 text-slate-700 p-3 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProfile} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="e.g. Alex"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                        <input 
                          type="number" 
                          required
                          value={profileAge}
                          onChange={(e) => setProfileAge(e.target.value)}
                          placeholder="e.g. 22"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                      <input 
                        type="email" 
                        required
                        disabled={isAuthenticated}
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        placeholder="e.g. alex@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium disabled:opacity-60"
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-sm text-primary font-bold">school</span>
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Academic History (Mandatory)</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">10th Standard % / GPA</label>
                          <input 
                            type="text" 
                            required
                            value={class10}
                            onChange={(e) => setClass10(e.target.value)}
                            placeholder="e.g. 94.2%"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">12th Standard % / GPA</label>
                          <input 
                            type="text" 
                            required
                            value={class12}
                            onChange={(e) => setClass12(e.target.value)}
                            placeholder="e.g. 91.8%"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Undergraduate CGPA / Score</label>
                          <input 
                            type="text" 
                            required
                            value={undergrad}
                            onChange={(e) => setUndergrad(e.target.value)}
                            placeholder="e.g. 8.9 CGPA"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Postgraduate Degree / CGPA (Optional)</label>
                        <input 
                          type="text" 
                          value={postgrad}
                          onChange={(e) => setPostgrad(e.target.value)}
                          placeholder="e.g. Distinction, MBA INSEAD"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                    </div>

                    {!isAuthenticated ? (
                      <button 
                        type="submit" 
                        disabled={isAuthLoading}
                        className="w-full bg-primary hover:bg-[#003ec7] text-white p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2"
                      >
                        {isAuthLoading ? 'Processing...' : 'Submit Profile & Generate OTP'}
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Verified & Authenticated Profile
                        </span>
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => { saveProfileLocally(); alert("Profile updated locally."); }}
                            className="bg-primary hover:bg-[#003ec7] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors"
                          >
                            Update Profile Data
                          </button>
                          <button 
                            type="button"
                            onClick={handleSignOut}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-5 py-2.5 rounded-lg text-xs font-bold uppercase transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Interests Side Panel in Profile */}
              <div className="md:col-span-4 space-y-6">
                <div className="bg-slate-100/50 rounded-[2rem] p-8 border border-slate-200/40">
                  <h4 className="font-headline font-bold text-xl text-[#191c1e] mb-1">Interests and Hobbies</h4>
                  <p className="text-xs text-slate-500 mb-4 font-medium">Add subjects or sectors you are passionate about.</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {interests.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-slate-200/60 flex items-center gap-1 shadow-sm text-slate-700"
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveInterest(tag)}
                          className="text-slate-400 hover:text-red-500 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Add interest..."
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), handleAddInterest()) : null}
                      className="flex-grow bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary font-medium"
                    />
                    <button 
                      type="button"
                      onClick={handleAddInterest}
                      className="bg-primary hover:bg-[#003ec7] text-white px-3 py-2 rounded-lg text-xs font-bold transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── TAB 2: STRATEGIC INSIGHTS ─── */}
        {activeTab === 'insights' && (
          <section className="animate-fade-in">
            {suggestedPaths.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">insights</span>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Strategic Insights Found</h3>
                <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
                  You haven't initiated a career path analysis yet. Complete the AI discovery dialogue to map your roadmap.
                </p>
                <Link to="/discovery" className="bg-primary hover:bg-[#003ec7] text-white px-8 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-transform inline-block">
                  Initiate AI Discovery
                </Link>
              </div>
            ) : (
              <>
                <section className="mb-12">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                      <h1 className="text-4xl font-extrabold headline-anchor tracking-tight mb-2">Strategic Alignment Phase</h1>
                      <p className="text-slate-500 text-sm font-medium">Your profile has been verified. We've identified career paths after deep analysis; please complete your profile for the consulting experience.</p>
                      <span className="text-primary font-bold tracking-widest text-[10px] uppercase mt-4 mb-4 block bg-[#0052ff]/10 px-3 py-1 rounded-full w-fit">Curated Network</span>
                      
                      {/* Timeline steps */}
                      <div className="mt-8 flex items-center w-full max-w-4xl">
                        <div className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-primary bg-primary-container/10 px-3 py-1 rounded-full w-fit">Journey Initiated</span>
                          </div>
                          <div className="h-[2px] flex-1 bg-primary mx-2 mb-4"></div>
                        </div>
                        <div className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-primary bg-primary-container/10 px-3 py-1 rounded-full w-fit">AI Screening</span>
                          </div>
                          <div className="h-[2px] flex-1 bg-primary mx-2 mb-4"></div>
                        </div>
                        <div className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-primary bg-primary-container/10 px-3 py-1 rounded-full w-fit">Career Path Suggested</span>
                          </div>
                          <div className="h-[2px] flex-1 bg-slate-200 mx-2 mb-4"></div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full border-2 border-primary bg-white text-primary flex items-center justify-center animate-pulse">
                            <span className="material-symbols-outlined text-sm">person_search</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-on-surface">Expert Consultation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
                  {/* Featured Match (Elena Richardson or dynamic match) */}
                  <div className="md:col-span-8 group">
                    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm h-full flex flex-col md:flex-row relative">
                      <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative bg-slate-50 flex items-center justify-center">
                        <img 
                          alt="Consultant Elena Richardson" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO1SgPqlUhkSfnxTOJiyV_DkiZgv7CALESNQh5Ir0iPtmcRNzE9LVKjMUGGV0yxYcqYHYtCedF7b3deb07BG4jA1MtIF7W4vEZY9yI7wInhxDDXhoKfYpCcXu2rk1lyrN7wUdZ7NiEwvTlelQkFXjPJAwsplrTqB_6Wv7S3BAPQp3OZNmosCDkzIgIpytB4x86KvwGXx9ZOeL4RaUkWlqHsInb9qXI7u6ZdYy6g_dlb24h-Y19-kD4Talwp9HYosBXpjYyHEMdfKc"
                        />
                        <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md text-primary p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center border border-white/20" title="Upload Image">
                          <span className="material-symbols-outlined">add_a_photo</span>
                        </button>
                      </div>
                      <div className="w-full md:w-3/5 p-8 flex flex-col justify-between">
                        <div>
                          <span className="text-primary font-bold text-xs tracking-widest uppercase mb-1 block">Top Tier Strategy Match</span>
                          <h3 className="headline-anchor text-2xl font-extrabold text-[#191c1e] mb-1">Elena Richardson</h3>
                          <p className="text-slate-500 text-xs font-semibold mb-6">Recommended Advisor for Transition Goals</p>
                          <div className="space-y-4 mb-8">
                            <p className="text-slate-600 leading-relaxed text-xs">
                              Specializing in high-growth ecosystems and structural reorganizations. Elena led the EMEA scaling project for two Fortune 500 tech transitions.
                            </p>
                            
                            {/* Suggested AI Career Paths */}
                            <div className="mt-4">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Suggested Pathways</h4>
                              <div className="flex flex-wrap gap-2">
                                {suggestedPaths.map((path, idx) => (
                                  <span key={idx} className="bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">{path.icon || 'bolt'}</span>
                                    {path.title}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Acquired Skills */}
                            <div className="mt-4">
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Identified Core Skills</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {currentSkills.map((skill, i) => (
                                  <span key={i} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-tight">{skill}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* User Profile Dynamic Educational History */}
                        <div className="mt-2 border-t border-slate-100 pt-4">
                          <h4 className="headline-anchor text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Your Educational History</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-800">10th Standard</p>
                                <p className="text-[9px] text-slate-400">Secondary Education</p>
                              </div>
                              <span className="text-[10px] font-semibold text-primary bg-[#0052ff]/10 px-2 py-0.5 rounded">{class10 || '94.2%'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-800">12th Standard</p>
                                <p className="text-[9px] text-slate-400">Higher Secondary Education</p>
                              </div>
                              <span className="text-[10px] font-semibold text-primary bg-[#0052ff]/10 px-2 py-0.5 rounded">{class12 || '91.8%'}</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                              <div>
                                <p className="text-[10px] font-bold text-slate-800">Undergraduate</p>
                                <p className="text-[9px] text-slate-400">Bachelor Program</p>
                              </div>
                              <span className="text-[10px] font-semibold text-primary bg-[#0052ff]/10 px-2 py-0.5 rounded">{undergrad || '8.9 CGPA'}</span>
                            </div>
                            {postgrad && (
                              <div className="flex justify-between items-center py-1.5">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-800">Postgraduate</p>
                                  <p className="text-[9px] text-slate-400">Advanced Program</p>
                                </div>
                                <span className="text-[10px] font-semibold text-primary bg-[#0052ff]/10 px-2 py-0.5 rounded">{postgrad}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar stats/details */}
                  <div className="md:col-span-4 space-y-8">
                    {/* Interests and Hobbies view */}
                    <div className="bg-slate-100/50 rounded-[2rem] p-8 border border-slate-200/40">
                      <h4 className="font-headline font-bold text-xl text-[#191c1e] mb-1">Interests and Hobbies</h4>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {interests.map((interest, index) => (
                          <span key={index} className="bg-white px-2 py-1 rounded text-[9px] font-bold uppercase border border-slate-200/60 text-slate-600">{interest}</span>
                        ))}
                      </div>
                    </div>

                    {/* Identified Gaps list from AI */}
                    <div className="bg-slate-100/50 rounded-[2rem] p-8 border border-slate-200/40">
                      <h4 className="font-headline font-bold text-xl text-[#191c1e] mb-1">Identified Gaps</h4>
                      <p className="text-slate-500 text-xs mb-4">Gaps to bridge for recommended transition</p>
                      
                      <div className="space-y-2.5 mt-4">
                        {criticalGaps.map((gap, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-rose-500 text-sm">warning</span>
                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </section>
        )}
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-4 pt-2 md:hidden bg-white/80 backdrop-blur-xl border-t border-slate-100 shadow-2xl rounded-t-3xl">
        <button 
          onClick={() => handleTabChange('profile')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
            activeTab === 'profile' ? 'bg-[#0052FF] text-white scale-95' : 'text-slate-400'
          }`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest mt-1">Profile</span>
        </button>
        <button 
          onClick={() => handleTabChange('insights')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
            activeTab === 'insights' ? 'bg-[#0052FF] text-white scale-95' : 'text-slate-400'
          }`}
        >
          <span className="material-symbols-outlined">insights</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest mt-1">Insights</span>
        </button>
      </nav>
    </div>
  );
}
