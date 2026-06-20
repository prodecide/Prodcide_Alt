import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

// Extracted outside Dashboard to prevent remount on every parent render
function InlineField({ fieldName, value, setValue, label, placeholder, type = 'text', multiline = false, className = '', displayClassName = '', inputClassName = '', editingField, setEditingField, debouncedSaveField, saveProfileLocally, setIsDirty }) {
  const isEditing = editingField === fieldName;
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setEditingField(null);
    debouncedSaveField(fieldName, value);
    saveProfileLocally({ [fieldName]: value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  if (isEditing) {
    const sharedClasses = `w-full bg-white border-2 border-[#003ec7]/40 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#003ec7]/30 outline-none font-medium transition-all shadow-sm ${inputClassName}`;
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setIsDirty(true); }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || label}
          rows={3}
          className={`${sharedClasses} resize-none ${className}`}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => { setValue(e.target.value); setIsDirty(true); }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || label}
        className={`${sharedClasses} ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setEditingField(fieldName)}
      className={`group/edit cursor-pointer relative inline-flex items-center gap-1.5 rounded-lg px-1.5 py-0.5 -mx-1.5 transition-all hover:bg-[#003ec7]/5 ${displayClassName}`}
      title={`Click to edit ${label || fieldName}`}
    >
      <span className={className}>
        {value || <span className="text-slate-400 italic">{placeholder || `Add ${label || fieldName}...`}</span>}
      </span>
      <span className="material-symbols-outlined text-[11px] text-slate-400 opacity-0 group-hover/edit:opacity-100 transition-opacity">
        edit
      </span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';

  // Navigation tab: 'profile' or 'insights'
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('discovery_verified_email')
  );

  // Profile Form States & Defaults matching Mockup
  const [profileName, setProfileName] = useState('Bobby');
  const [profileAge, setProfileAge] = useState('25');
  const [profileEmail, setProfileEmail] = useState('bobby@gmail.com');
  const [profileCollege, setProfileCollege] = useState('KMCT');
  const [profileMajor, setProfileMajor] = useState('engineering');
  const [class10, setClass10] = useState('94.2%');
  const [class12, setClass12] = useState('91.8%');
  const [undergrad, setUndergrad] = useState('B.Tech in Systems Engineering, IIT Madras - 8.9 CGPA');
  const [postgrad, setPostgrad] = useState('MBA in Strategic Management, INSEAD - Distinction');
  
  // Interests (Tags) State
  const [interests, setInterests] = useState(['Logistics', 'AI integration']);
  const [newInterest, setNewInterest] = useState('');

  // Extra Custom Interests (Activities) State
  const [customInterests, setCustomInterests] = useState([
    'Strategic Chess', 
    'High-Performance Sailing', 
    'Urban Architecture Photography'
  ]);
  const [newCustomInterest, setNewCustomInterest] = useState('');

  // Gaps State
  const [gaps, setGaps] = useState(['Culture', 'Retention']);
  const [newGap, setNewGap] = useState('');
  const [gapCategory, setGapCategory] = useState('Human Capital Strategy');
  const [gapDescription, setGapDescription] = useState('Bridging the gap between corporate culture and rapid digital expansion.');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // OTP Verification States
  const [otpStep, setOtpStep] = useState('none'); // 'none', 'otp-sent', 'verified'
  const [otpCode, setOtpCode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // AI Career Path Results States
  const [suggestedPaths, setSuggestedPaths] = useState([]);
  const [criticalGaps, setCriticalGaps] = useState([]);
  const [currentSkills, setCurrentSkills] = useState([]);

  // New Profile Fields
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileLinkedIn, setProfileLinkedIn] = useState('');

  // Inline Edit State
  const [editingField, setEditingField] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [isDirty, setIsDirty] = useState(false);
  const saveTimerRef = useRef(null);

  // Debounced auto-save to /api/user-profiles (PUT partial update)
  const debouncedSaveField = useCallback((fieldName, fieldValue) => {
    if (!profileEmail) return;
    setIsDirty(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const res = await fetch('/api/user-profiles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profileEmail, [fieldName]: fieldValue })
        });
        if (res.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
      setIsDirty(false);
    }, 600);
  }, [profileEmail]);

  // Full profile save to /api/user-profiles (POST full upsert)
  const saveFullProfile = useCallback(async () => {
    if (!profileEmail) return;
    setSaveStatus('saving');
    try {
      const profileData = {
        email: profileEmail,
        name: profileName,
        age: profileAge,
        college: profileCollege,
        major: profileMajor,
        phone: profilePhone,
        location: profileLocation,
        bio: profileBio,
        linkedIn: profileLinkedIn,
        class10,
        class12,
        undergrad,
        postgrad,
        interests,
        customInterests,
        gaps,
        gapCategory,
        gapDescription,
        suggestedPaths,
        currentSkills
      };
      const res = await fetch('/api/user-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setSaveStatus('saved');
        setIsDirty(false);
        // Also keep localStorage in sync
        localStorage.setItem('discovery_user_profile', JSON.stringify(profileData));
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [profileEmail, profileName, profileAge, profileCollege, profileMajor, profilePhone, profileLocation, profileBio, profileLinkedIn, class10, class12, undergrad, postgrad, interests, customInterests, gaps, gapCategory, gapDescription, suggestedPaths, currentSkills]);

  const fetchAndSyncProfile = async (email) => {
    try {
      // Try the new user_profiles collection first
      let res = await fetch(`/api/user-profiles?email=${encodeURIComponent(email)}`);
      let data;

      if (res.ok) {
        data = await res.json();
      } else {
        // Fallback: try the legacy users collection
        res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          data = await res.json();
          // Migrate to new collection
          await fetch('/api/user-profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, email })
          });
        } else if (res.status === 404) {
          pushProfileToDatabase(email);
          return;
        }
      }

      if (data) {
        if (data.name) setProfileName(data.name);
        if (data.age) setProfileAge(data.age);
        if (data.college) setProfileCollege(data.college);
        if (data.major) setProfileMajor(data.major);
        if (data.class10) setClass10(data.class10);
        if (data.class12) setClass12(data.class12);
        if (data.undergrad) setUndergrad(data.undergrad);
        if (data.postgrad) setPostgrad(data.postgrad);
        if (data.interests) setInterests(data.interests);
        if (data.customInterests) setCustomInterests(data.customInterests);
        if (data.gaps) setGaps(data.gaps);
        if (data.gapCategory) setGapCategory(data.gapCategory);
        if (data.gapDescription) setGapDescription(data.gapDescription);
        if (data.suggestedPaths) setSuggestedPaths(data.suggestedPaths);
        if (data.currentSkills) setCurrentSkills(data.currentSkills);
        // Load new fields
        if (data.phone) setProfilePhone(data.phone);
        if (data.location) setProfileLocation(data.location);
        if (data.bio) setProfileBio(data.bio);
        if (data.linkedIn) setProfileLinkedIn(data.linkedIn);

        localStorage.setItem('discovery_user_profile', JSON.stringify({
          name: data.name,
          age: data.age,
          college: data.college,
          major: data.major,
          phone: data.phone,
          location: data.location,
          bio: data.bio,
          linkedIn: data.linkedIn,
          class10: data.class10,
          class12: data.class12,
          undergrad: data.undergrad,
          postgrad: data.postgrad,
          interests: data.interests,
          customInterests: data.customInterests,
          gaps: data.gaps,
          gapCategory: data.gapCategory,
          gapDescription: data.gapDescription
        }));
        if (data.suggestedPaths || data.gaps || data.currentSkills) {
          localStorage.setItem('discovery_results', JSON.stringify({
            suggestedPaths: data.suggestedPaths,
            criticalGaps: data.gaps,
            currentSkills: data.currentSkills
          }));
        }
      }
    } catch (e) {
      console.error("Failed to sync profile from db:", e);
    }
  };

  const pushProfileToDatabase = async (email = profileEmail) => {
    if (!email) return;
    try {
      const profileData = {
        email,
        name: profileName,
        age: profileAge,
        college: profileCollege,
        major: profileMajor,
        phone: profilePhone,
        location: profileLocation,
        bio: profileBio,
        linkedIn: profileLinkedIn,
        class10,
        class12,
        undergrad,
        postgrad,
        interests,
        customInterests,
        gaps,
        gapCategory,
        gapDescription,
        suggestedPaths,
        currentSkills
      };
      await fetch('/api/user-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
    } catch (e) {
      console.error("Failed to save profile to database:", e);
    }
  };

  // Load profile data and AI results on mount
  useEffect(() => {
    setActiveTab(activeTabParam);

    // Load user email and name if authenticated
    const storedEmail = localStorage.getItem('discovery_verified_email') || '';
    const storedName = localStorage.getItem('discovery_verified_name') || '';
    if (storedEmail) {
      setProfileEmail(storedEmail);
      fetchAndSyncProfile(storedEmail);
    }
    if (storedName) setProfileName(storedName);

    const savedProfileStr = localStorage.getItem('discovery_user_profile');
    if (savedProfileStr) {
      try {
        const profile = JSON.parse(savedProfileStr);
        if (profile.name) setProfileName(profile.name);
        if (profile.age) setProfileAge(profile.age);
        if (profile.college) setProfileCollege(profile.college);
        if (profile.major) setProfileMajor(profile.major);
        if (profile.class10) setClass10(profile.class10);
        if (profile.class12) setClass12(profile.class12);
        if (profile.undergrad) setUndergrad(profile.undergrad);
        if (profile.postgrad) setPostgrad(profile.postgrad);
        if (profile.interests) setInterests(profile.interests);
        if (profile.customInterests) setCustomInterests(profile.customInterests);
        if (profile.gaps) setGaps(profile.gaps);
        if (profile.gapCategory) setGapCategory(profile.gapCategory);
        if (profile.gapDescription) setGapDescription(profile.gapDescription);
        if (profile.phone) setProfilePhone(profile.phone);
        if (profile.location) setProfileLocation(profile.location);
        if (profile.bio) setProfileBio(profile.bio);
        if (profile.linkedIn) setProfileLinkedIn(profile.linkedIn);
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
          if (onboarding.education || onboarding.class) {
            setUndergrad(onboarding.education || onboarding.class);
          }
          if (onboarding.subject || onboarding.job) {
            setProfileMajor(onboarding.subject || onboarding.job);
          }
        } catch (e) {
          console.error("Failed to parse onboarding context", e);
        }
      }
    }

    // Load AI Results from Discovery Chat
    const savedResultsStr = localStorage.getItem('discovery_results');
    if (savedResultsStr) {
      try {
        const results = JSON.parse(savedResultsStr);
        setSuggestedPaths(results.suggestedPaths || []);
        if (results.criticalGaps && results.criticalGaps.length > 0) {
          setGaps(results.criticalGaps);
          setCriticalGaps(results.criticalGaps);
        }
        setCurrentSkills(results.currentSkills || []);
      } catch (e) {
        console.error("Failed to parse AI results", e);
      }
    }

    // Handle click outside dropdown
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeTabParam]);

  // Tab switching handler
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  // Profile Save
  const saveProfileLocally = (updatedFields = {}) => {
    const name = updatedFields.name !== undefined ? updatedFields.name : profileName;
    const age = updatedFields.age !== undefined ? updatedFields.age : profileAge;
    const college = updatedFields.college !== undefined ? updatedFields.college : profileCollege;
    const major = updatedFields.major !== undefined ? updatedFields.major : profileMajor;
    const class10Val = updatedFields.class10 !== undefined ? updatedFields.class10 : class10;
    const class12Val = updatedFields.class12 !== undefined ? updatedFields.class12 : class12;
    const undergradVal = updatedFields.undergrad !== undefined ? updatedFields.undergrad : undergrad;
    const postgradVal = updatedFields.postgrad !== undefined ? updatedFields.postgrad : postgrad;
    const interestsVal = updatedFields.interests !== undefined ? updatedFields.interests : interests;
    const customInterestsVal = updatedFields.customInterests !== undefined ? updatedFields.customInterests : customInterests;
    const gapsVal = updatedFields.gaps !== undefined ? updatedFields.gaps : gaps;
    const gapCategoryVal = updatedFields.gapCategory !== undefined ? updatedFields.gapCategory : gapCategory;
    const gapDescriptionVal = updatedFields.gapDescription !== undefined ? updatedFields.gapDescription : gapDescription;
    const phoneVal = updatedFields.phone !== undefined ? updatedFields.phone : profilePhone;
    const locationVal = updatedFields.location !== undefined ? updatedFields.location : profileLocation;
    const bioVal = updatedFields.bio !== undefined ? updatedFields.bio : profileBio;
    const linkedInVal = updatedFields.linkedIn !== undefined ? updatedFields.linkedIn : profileLinkedIn;

    const profileData = {
      name,
      age,
      college,
      major,
      phone: phoneVal,
      location: locationVal,
      bio: bioVal,
      linkedIn: linkedInVal,
      class10: class10Val,
      class12: class12Val,
      undergrad: undergradVal,
      postgrad: postgradVal,
      interests: interestsVal,
      customInterests: customInterestsVal,
      gaps: gapsVal,
      gapCategory: gapCategoryVal,
      gapDescription: gapDescriptionVal
    };
    localStorage.setItem('discovery_user_profile', JSON.stringify(profileData));

    if (profileEmail) {
      fetch('/api/user-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profileEmail,
          ...profileData,
          suggestedPaths,
          currentSkills
        })
      }).catch(e => console.error("Cloud save failed:", e));
    }
  };

  // InlineField shared props for all instances
  const inlineProps = { editingField, setEditingField, debouncedSaveField, saveProfileLocally, setIsDirty };

  // Form Submissions for Registration & OTP
  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!profileName.trim()) {
      setAuthError('Name is required.');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      setAuthError('A valid email is required.');
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

  // Verify OTP Code
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
    window.dispatchEvent(new Event('storage'));
    navigate('/discovery');
  };

  // Dynamic Interest Handlers
  const handleAddInterest = () => {
    if (newInterest.trim()) {
      const val = newInterest.trim();
      if (!interests.includes(val)) {
        const updated = [...interests, val];
        setInterests(updated);
        saveProfileLocally({ interests: updated });
      }
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (tag) => {
    const updated = interests.filter(item => item !== tag);
    setInterests(updated);
    saveProfileLocally({ interests: updated });
  };

  // Custom Interest (Activities) Handlers
  const handleAddCustomInterest = () => {
    if (newCustomInterest.trim()) {
      const val = newCustomInterest.trim();
      if (!customInterests.includes(val)) {
        const updated = [...customInterests, val];
        setCustomInterests(updated);
        saveProfileLocally({ customInterests: updated });
      }
      setNewCustomInterest('');
    }
  };

  const handleRemoveCustomInterest = (item) => {
    const updated = customInterests.filter(c => c !== item);
    setCustomInterests(updated);
    saveProfileLocally({ customInterests: updated });
  };

  // Gap Handlers
  const handleAddGap = () => {
    if (newGap.trim()) {
      const val = newGap.trim();
      if (!gaps.includes(val)) {
        const updated = [...gaps, val];
        setGaps(updated);
        saveProfileLocally({ gaps: updated });
      }
      setNewGap('');
    }
  };

  const handleRemoveGap = (tag) => {
    const updated = gaps.filter(item => item !== tag);
    setGaps(updated);
    saveProfileLocally({ gaps: updated });
  };


  // Render specific material icon helper for custom activities
  const getActivityIcon = (activity) => {
    const lower = activity.toLowerCase();
    if (lower.includes('chess')) return 'extension';
    if (lower.includes('sailing') || lower.includes('boat') || lower.includes('yacht')) return 'sailing';
    if (lower.includes('photo') || lower.includes('camera')) return 'photo_camera';
    if (lower.includes('code') || lower.includes('programming') || lower.includes('software')) return 'terminal';
    if (lower.includes('sport') || lower.includes('run') || lower.includes('gym')) return 'sports_soccer';
    if (lower.includes('music') || lower.includes('guitar') || lower.includes('piano')) return 'music_note';
    return 'star';
  };

  return (
    <div className="surface-stack-1 min-h-screen text-on-surface font-body antialiased relative">
      
      {/* ─── TopAppBar Header (Visual Match) ─── */}
      <header className="bg-[#f7f9fb]/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 z-50 w-full px-8 py-4 flex justify-between items-center no-border bg-[#f2f4f6] dark:bg-slate-800">
        <Link to="/" className="text-2xl font-black tracking-tighter text-[#0052FF] dark:text-[#3375ff] headline-anchor">ProDecide</Link>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 relative" ref={dropdownRef}>
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-100/50 rounded-full transition-colors">notifications</span>
            <span className="material-symbols-outlined text-slate-600 cursor-pointer p-2 hover:bg-slate-100/50 rounded-full transition-colors">settings</span>
            
            {/* Interactive User profile dropdown */}
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img 
                alt="User profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSCXL-0gLE1O170SZDAK5qcjkjlHzgDWgCAed04sK9q5lTVyLBY5AWHjBCkQG09u1tnbtWlcRM0g6JSdaKJxbGO_Ig7DNFIgrr3wnP8o3iBTqM-FH8pMQ2W2phyiWzQ4LEi8Qq9bSx4ea516zTUD77k5J4B10TBSWdD-v6XS6LE3L1Ewmt4tMDoP-O6Q_vtIO4y5jG3wGk6o5W_AUTZY-IW8fyX7HzV12RBpB1k27CjcNZsnWZ7rlXHolceeZK8drvj47Vj_efGnA"
                className="w-full h-full object-cover"
              />
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 shadow-xl py-2 z-50 transform origin-top-right transition-all">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{profileName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{profileEmail}</p>
                </div>
                <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Switch Portal</p>
                </div>
                <div className="p-1.5 space-y-1">
                  <Link 
                    to="/admin" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm text-slate-400">admin_panel_settings</span>
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm text-slate-400">dashboard</span>
                    User Dashboard
                  </Link>
                  <Link 
                    to="/discovery" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm text-slate-400">explore</span>
                    User Portal
                  </Link>
                  <Link 
                    to="/consultant-dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:text-[#0052FF] transition-all text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-sm text-slate-400">badge</span>
                    Consultant Portal
                  </Link>
                  {isAuthenticated && (
                    <button 
                      onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-all text-xs font-semibold text-left"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Sign Out
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── SideNavBar (Desktop Only) ─── */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 pt-24 pb-8 bg-[#f2f4f6] dark:bg-slate-900 bg-gradient-to-r from-[#f2f4f6] to-[#f7f9fb] z-40">
        <nav className="flex-grow">
          <div className="space-y-1">
            <button 
              onClick={() => handleTabChange('profile')}
              className={`w-[calc(100%-8px)] flex items-center rounded-l-xl pl-6 py-3 transition-all font-manrope text-sm font-medium ${
                activeTab === 'profile' 
                  ? 'bg-white dark:bg-slate-800 text-[#0052FF] dark:text-white font-semibold translate-x-1 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#0052FF]'
              }`}
            >
              <span className="material-symbols-outlined mr-3">verified_user</span>
              My Profile
            </button>
            <button 
              onClick={() => handleTabChange('insights')}
              className={`w-[calc(100%-8px)] flex items-center rounded-l-xl pl-6 py-3 transition-all font-manrope text-sm font-medium ${
                activeTab === 'insights' 
                  ? 'bg-white dark:bg-slate-800 text-[#0052FF] dark:text-white font-semibold translate-x-1 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-[#0052FF]'
              }`}
            >
              <span className="material-symbols-outlined mr-3">insights</span>
              Strategic Insights
            </button>
          </div>
        </nav>
      </aside>

      {/* ─── Main Content Canvas ─── */}
      <main className="lg:ml-64 pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
        
        {/* ─── CASE A: USER IS NOT AUTHENTICATED ─── */}
        {!isAuthenticated && (
          <section className="animate-fade-in max-w-2xl mx-auto py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold headline-anchor tracking-tight mb-2">Complete Verification</h1>
              <p className="text-slate-500 text-sm font-medium">Please verify your academic details and authenticate to access your dashboard.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm surface-stack-3">
              {authError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center gap-3 text-sm font-semibold">
                  <span className="material-symbols-outlined">error</span>
                  <span>{authError}</span>
                </div>
              )}

              {otpStep === 'otp-sent' ? (
                <div className="space-y-6 max-w-md mx-auto py-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-bounce mb-2">mail_lock</span>
                    <h3 className="font-bold text-lg text-slate-800">Enter OTP</h3>
                    <p className="text-xs text-slate-500 mt-1">We sent a 6-digit code to <span className="font-semibold">{profileEmail}</span>. Use the master code <code className="bg-slate-100 px-1 py-0.5 rounded text-primary font-bold">123456</code> to verify.</p>
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
                        placeholder="e.g. Bobby"
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
                        placeholder="e.g. 25"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="e.g. bobby@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-sm text-primary font-bold">school</span>
                      <h3 className="font-bold text-xs uppercase tracking-widest text-slate-600">Educational History</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Current College/Institution</label>
                        <input 
                          type="text" 
                          value={profileCollege}
                          onChange={(e) => setProfileCollege(e.target.value)}
                          placeholder="e.g. KMCT"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Field of Study / Major</label>
                        <input 
                          type="text" 
                          value={profileMajor}
                          onChange={(e) => setProfileMajor(e.target.value)}
                          placeholder="e.g. engineering"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">10th Standard % / GPA</label>
                        <input 
                          type="text" 
                          required
                          value={class10}
                          onChange={(e) => setClass10(e.target.value)}
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Undergrad CGPA / Degree</label>
                        <input 
                          type="text" 
                          required
                          value={undergrad}
                          onChange={(e) => setUndergrad(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Postgrad Degree / GPA (Optional)</label>
                      <input 
                        type="text" 
                        value={postgrad}
                        onChange={(e) => setPostgrad(e.target.value)}
                        placeholder="e.g. MBA INSEAD"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isAuthLoading}
                    className="w-full bg-primary hover:bg-[#003ec7] text-white p-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    {isAuthLoading ? 'Processing...' : 'Submit Profile & Generate OTP'}
                  </button>
                </form>
              )}
            </div>
          </section>
        )}

        {/* ─── CASE B: USER IS AUTHENTICATED ─── */}
        {isAuthenticated && (
          <div className="animate-fade-in">

            {/* ─── TAB 1: MY PROFILE (MOCKUP MATCH) ─── */}
            {activeTab === 'profile' && (
              <section className="space-y-12">
                
                {/* Editorial Headline & Onboarding Timeline */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div className="max-w-2xl">
                    <h1 className="text-4xl font-extrabold headline-anchor tracking-tight mb-2">My Profile & Matches</h1>
                    <p className="text-slate-500 text-sm font-medium">Verify your strategic assessment journey and consultant matches.</p>

                    <div className="mt-8 flex items-center w-full max-w-4xl">
                      <div className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-[#003ec7] text-white flex items-center justify-center shadow-lg shadow-[#003ec7]/20">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-[#003ec7] bg-primary-container/10 px-3 py-1 rounded-full w-fit">Journey Initiated</span>
                        </div>
                        <div className="h-[2px] flex-1 bg-[#003ec7] mx-2 mb-4"></div>
                      </div>
                      <div className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-[#003ec7] text-white flex items-center justify-center shadow-lg shadow-[#003ec7]/20">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-[#003ec7] bg-primary-container/10 px-3 py-1 rounded-full w-fit">AI Screening</span>
                        </div>
                        <div className="h-[2px] flex-1 bg-[#003ec7] mx-2 mb-4"></div>
                      </div>
                      <div className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-[#003ec7] text-white flex items-center justify-center shadow-lg shadow-[#003ec7]/20">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-[#003ec7] bg-primary-container/10 px-3 py-1 rounded-full w-fit">Career Path Suggested</span>
                        </div>
                        <div className="h-[2px] flex-1 bg-slate-200 mx-2 mb-4"></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full border-2 border-[#003ec7] bg-white text-[#003ec7] flex items-center justify-center animate-pulse">
                          <span className="material-symbols-outlined text-sm">person_search</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-tighter mt-2 text-on-surface">Expert Consultation</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={saveFullProfile}
                    disabled={saveStatus === 'saving'}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all shadow-sm ${
                      saveStatus === 'saved' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : saveStatus === 'saving'
                        ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {saveStatus === 'saved' ? 'check_circle' : saveStatus === 'saving' ? 'sync' : 'save'}
                    </span>
                    {saveStatus === 'saved' ? 'Saved!' : saveStatus === 'saving' ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>

                {/* Expert Grid (Asymmetric Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Featured Match Card (Left Column - Large) */}
                  <div className="md:col-span-8 group">
                    <div className="bg-white rounded-[2rem] overflow-hidden transition-all border border-slate-100 shadow-sm h-full flex flex-col md:flex-row relative surface-stack-3">
                      
                      {/* Photo Column */}
                      <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative bg-slate-50 flex items-center justify-center">
                        <img 
                          alt="Consultant Elena Richardson portrait" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCO1SgPqlUhkSfnxTOJiyV_DkiZgv7CALESNQh5Ir0iPtmcRNzE9LVKjMUGGV0yxYcqYHYtCedF7b3deb07BG4jA1MtIF7W4vEZY9yI7wInhxDDXhoKfYpCcXu2rk1lyrN7wUdZ7NiEwvTlelQkFXjPJAwsplrTqB_6Wv7S3BAPQp3OZNmosCDkzIgIpytB4x86KvwGXx9ZOeL4RaUkWlqHsInb9qXI7u6ZdYy6g_dlb24h-Y19-kD4Talwp9HYosBXpjYyHEMdfKc"
                        />
                        <button className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md text-primary p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all flex items-center justify-center border border-white/20" title="Upload Image">
                          <span className="material-symbols-outlined">add_a_photo</span>
                        </button>
                      </div>

                      {/* Details Column — Inline Editable */}
                      <div className="w-full md:w-3/5 p-10 flex flex-col justify-between">
                        <div>
                          <span className="text-[#003ec7] font-bold text-xs tracking-widest uppercase mb-2 block">Your Profile</span>
                          
                          {/* Editable Name */}
                          <InlineField 
                            {...inlineProps}
                            fieldName="name" value={profileName} setValue={setProfileName}
                            label="Full Name" placeholder="Enter your name"
                            className="headline-anchor text-3xl font-extrabold text-on-surface"
                          />
                          
                          {/* Editable College & Major subtitle */}
                          <div className="flex items-center gap-1 text-slate-500 text-sm font-semibold mb-4 mt-1">
                            <span>Pursuing</span>
                            <InlineField 
                              {...inlineProps}
                              fieldName="major" value={profileMajor} setValue={setProfileMajor}
                              label="Major" placeholder="your major"
                              className="text-sm font-semibold text-slate-700"
                            />
                            <span>at</span>
                            <InlineField 
                              {...inlineProps}
                              fieldName="college" value={profileCollege} setValue={setProfileCollege}
                              label="College" placeholder="your college"
                              className="text-sm font-semibold text-slate-700"
                            />
                          </div>

                          {/* Editable Bio */}
                          <div className="mb-4">
                            <InlineField 
                              {...inlineProps}
                              fieldName="bio" value={profileBio} setValue={setProfileBio}
                              label="Bio" placeholder="Write a short bio about yourself..."
                              multiline={true}
                              className="text-[#434656] leading-relaxed text-sm"
                            />
                          </div>

                          {/* Contact Info Row */}
                          <div className="flex flex-wrap gap-4 mb-6">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-slate-400">mail</span>
                              <span className="text-xs text-slate-600 font-medium">{profileEmail}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-slate-400">call</span>
                              <InlineField 
                                {...inlineProps}
                                fieldName="phone" value={profilePhone} setValue={setProfilePhone}
                                label="Phone" placeholder="Add phone number"
                                className="text-xs text-slate-600 font-medium"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-slate-400">location_on</span>
                              <InlineField 
                                {...inlineProps}
                                fieldName="location" value={profileLocation} setValue={setProfileLocation}
                                label="Location" placeholder="Add location"
                                className="text-xs text-slate-600 font-medium"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-slate-400">link</span>
                              <InlineField 
                                {...inlineProps}
                                fieldName="linkedIn" value={profileLinkedIn} setValue={setProfileLinkedIn}
                                label="LinkedIn" placeholder="Add LinkedIn URL"
                                className="text-xs text-[#003ec7] font-medium"
                              />
                            </div>
                          </div>

                          {/* Age */}
                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Age:</span>
                            <InlineField 
                              {...inlineProps}
                              fieldName="age" value={profileAge} setValue={setProfileAge}
                              label="Age" placeholder="25" type="text"
                              className="text-xs font-semibold text-slate-700"
                            />
                          </div>

                          {/* Dynamic AI Suggested Pathway Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {suggestedPaths.length > 0 ? (
                              suggestedPaths.map((path, idx) => (
                                <span key={idx} className="bg-[#f2f4f6] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight text-on-surface flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">{path.icon || 'bolt'}</span>
                                  {path.title}
                                </span>
                              ))
                            ) : (
                              <>
                                <span className="bg-[#f2f4f6] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight text-on-surface">M&A Strategy</span>
                                <span className="bg-[#f2f4f6] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight text-on-surface">Cloud Transition</span>
                                <span className="bg-[#f2f4f6] px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tight text-on-surface">Series C+</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Educational History Grid — Inline Editable */}
                        <div className="mt-6 border-t border-slate-100 pt-6">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="headline-anchor text-xs font-bold text-on-surface uppercase tracking-widest">Educational History</h4>
                            <span className="text-[9px] text-slate-400 italic">Click any value to edit</span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <div>
                                <p className="text-[11px] font-bold text-on-surface">10th Standard</p>
                                <p className="text-[9px] text-slate-400">Secondary Education</p>
                              </div>
                              <InlineField 
                                {...inlineProps}
                                fieldName="class10" value={class10} setValue={setClass10}
                                label="10th Score" placeholder="94.2%"
                                className="text-xs font-semibold text-[#003ec7]"
                                displayClassName="bg-blue-50 px-2 py-0.5 rounded"
                              />
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <div>
                                <p className="text-[11px] font-bold text-on-surface">12th Standard</p>
                                <p className="text-[9px] text-slate-400">Higher Secondary Education</p>
                              </div>
                              <InlineField 
                                {...inlineProps}
                                fieldName="class12" value={class12} setValue={setClass12}
                                label="12th Score" placeholder="91.8%"
                                className="text-xs font-semibold text-[#003ec7]"
                                displayClassName="bg-blue-50 px-2 py-0.5 rounded"
                              />
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                              <div>
                                <p className="text-[11px] font-bold text-on-surface">Undergraduate</p>
                                <p className="text-[9px] text-slate-400">Bachelor's Degree</p>
                              </div>
                              <InlineField 
                                {...inlineProps}
                                fieldName="undergrad" value={undergrad} setValue={setUndergrad}
                                label="Undergrad" placeholder="B.Tech - 8.9 CGPA"
                                className="text-xs font-semibold text-[#003ec7]"
                                displayClassName="bg-blue-50 px-2 py-0.5 rounded max-w-[200px]"
                              />
                            </div>

                            <div className="flex justify-between items-center py-2">
                              <div>
                                <p className="text-[11px] font-bold text-on-surface">Postgraduate</p>
                                <p className="text-[9px] text-slate-400">Master's / Advanced Degree</p>
                              </div>
                              <InlineField 
                                {...inlineProps}
                                fieldName="postgrad" value={postgrad} setValue={setPostgrad}
                                label="Postgrad" placeholder="Add postgrad degree..."
                                className="text-xs font-semibold text-[#003ec7]"
                                displayClassName="bg-blue-50 px-2 py-0.5 rounded max-w-[200px]"
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Side Cards (Right Column - Stacked) */}
                  <div className="md:col-span-4 space-y-8">
                    
                    {/* Match Card 2: Interests and Hobbies */}
                    <div className="bg-[#f2f4f6] rounded-[2rem] p-8 hover:bg-white hover:shadow-xl transition-all duration-300 group surface-stack-2">
                      <h4 className="headline-anchor font-bold text-xl text-on-surface mb-2">Interests & Hobbies</h4>
                      
                      {/* Dynamic Interests Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {interests.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-slate-700 flex items-center gap-1 shadow-sm"
                          >
                            {tag}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveInterest(tag)}
                              className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Custom Activities Stack */}
                      <div className="mt-6 mb-8 pt-4 border-t border-slate-200/50">
                        <div className="flex flex-wrap gap-3">
                          {customInterests.map((item) => (
                            <span key={item} className="text-xs text-[#434656] flex items-center bg-white/40 px-2.5 py-1.5 rounded-lg">
                              <span className="material-symbols-outlined text-sm mr-1.5 text-[#003ec7]">
                                {getActivityIcon(item)}
                              </span> 
                              {item}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveCustomInterest(item)}
                                className="text-slate-400 hover:text-red-500 font-bold ml-1.5 text-xs"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>

                        {/* Add interest inputs */}
                        <div className="mt-6 flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add interest..."
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), handleAddInterest()) : null}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors font-body"
                          />
                          <button 
                            onClick={handleAddInterest}
                            className="bg-[#003ec7] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#003ec7]/90 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">add</span> Add
                          </button>
                        </div>

                        <div className="mt-2 flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add activity (Chess, Sailing...)"
                            value={newCustomInterest}
                            onChange={(e) => setNewCustomInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), handleAddCustomInterest()) : null}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors font-body"
                          />
                          <button 
                            onClick={handleAddCustomInterest}
                            className="bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">add</span> Activity
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Match Card 3: Identified Gaps */}
                    <div className="bg-[#f2f4f6] rounded-[2rem] p-8 hover:bg-white hover:shadow-xl transition-all duration-300 group surface-stack-2">
                      <h4 className="headline-anchor font-bold text-xl text-on-surface mb-1">Identified Gaps</h4>
                      
                      <div className="mb-4">
                        <input 
                          type="text"
                          value={gapCategory}
                          onChange={(e) => { setGapCategory(e.target.value); saveProfileLocally({ gapCategory: e.target.value }); }}
                          placeholder="Gap Category Title..."
                          className="font-headline font-semibold text-slate-700 border-none bg-transparent hover:bg-white focus:bg-white rounded px-1.5 py-0.5 text-xs w-full focus:outline-none"
                        />
                        <textarea 
                          value={gapDescription}
                          onChange={(e) => { setGapDescription(e.target.value); saveProfileLocally({ gapDescription: e.target.value }); }}
                          placeholder="Gap explanation..."
                          rows={2}
                          className="text-[#434656] text-xs leading-relaxed border-none bg-transparent hover:bg-white focus:bg-white rounded px-1.5 py-0.5 w-full focus:outline-none resize-none"
                        />
                      </div>

                      {/* Gaps tags */}
                      <div className="flex flex-wrap gap-1.5 mb-8">
                        {gaps.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase text-slate-700 flex items-center gap-1 shadow-sm"
                          >
                            {tag}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveGap(tag)}
                              className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add gap input */}
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Search or add gap..."
                          value={newGap}
                          onChange={(e) => setNewGap(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' ? (e.preventDefault(), handleAddGap()) : null}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors font-body"
                        />
                        <button 
                          onClick={handleAddGap}
                          className="bg-[#003ec7] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#003ec7]/90 transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">add</span> Add
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
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm surface-stack-3">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">insights</span>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">No Strategic Insights Found</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
                      You haven't initiated a career path analysis yet. Complete the AI discovery dialogue to map your custom roadmap.
                    </p>
                    <Link to="/discovery" className="bg-[#003ec7] hover:bg-[#003ec7]/90 text-white px-8 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-transform inline-block">
                      Initiate AI Discovery
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-12">
                    
                    {/* Insights Header */}
                    <div className="max-w-2xl mb-8">
                      <h1 className="text-4xl font-extrabold headline-anchor tracking-tight mb-2">Strategic Career Assessment</h1>
                      <p className="text-slate-500 text-sm font-medium">Deep analysis mapping your profile strengths, skill markers, and transition phases.</p>
                    </div>

                    {/* AI Career Path Suggestions (Path Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {suggestedPaths.map((path, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow surface-stack-3">
                          <div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-6">
                              <span className="material-symbols-outlined text-2xl text-[#003ec7]">
                                {path.icon || 'psychology'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-[#003ec7] tracking-[0.2em] uppercase block mb-3">Pathway 0{idx + 1}</span>
                            <h3 className="font-headline text-xl font-bold mb-3 text-slate-900">{path.title}</h3>
                            <p className="text-slate-600 text-xs leading-relaxed mb-6">
                              A career transition target utilizing your analytical capabilities. We recommend this path for optimized market growth.
                            </p>
                          </div>
                          <Link to="/experts" className="text-[#003ec7] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:text-primary-container">
                            Consult matched advisors <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* Skill Analysis Progress Bars */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* Current Skills Meters */}
                      <div className="bg-[#f2f4f6] rounded-[2rem] p-8 surface-stack-2">
                        <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Strengths & Core Skills</h3>
                        <p className="text-xs text-slate-500 mb-6">Your identified skill clusters compared against industry benchmarks.</p>
                        
                        <div className="space-y-4">
                          {currentSkills.map((skill, index) => {
                            // Give them slightly different random percentages for visual flair
                            const score = 80 - (index * 8);
                            return (
                              <div key={skill} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span>{skill}</span>
                                  <span>{score}% Strength</span>
                                </div>
                                <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                                  <div className="h-full bg-[#003ec7] rounded-full" style={{ width: `${score}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                          {currentSkills.length === 0 && (
                            <p className="text-xs text-slate-500 italic">No skill tags loaded. Run Discovery to generate skills.</p>
                          )}
                        </div>
                      </div>

                      {/* Gaps progress and mitigations */}
                      <div className="bg-[#f2f4f6] rounded-[2rem] p-8 surface-stack-2">
                        <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Skill Gaps to Bridge</h3>
                        <p className="text-xs text-slate-500 mb-6">Critical capability gaps mapped relative to recommended transition paths.</p>
                        
                        <div className="space-y-4">
                          {gaps.map((gap, index) => {
                            const completion = 20 + (index * 15);
                            return (
                              <div key={gap} className="space-y-1">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                  <span className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-rose-500 text-xs">warning</span>
                                    {gap}
                                  </span>
                                  <span>{completion}% Actioned</span>
                                </div>
                                <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                                  <div className="h-full bg-rose-500/80 rounded-full" style={{ width: `${completion}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                          {gaps.length === 0 && (
                            <p className="text-xs text-slate-500 italic">No gap tags loaded.</p>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Action Roadmap */}
                    <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm surface-stack-3">
                      <h3 className="font-headline font-bold text-xl text-slate-900 mb-2">Strategic Alignment Roadmap</h3>
                      <p className="text-xs text-slate-500 mb-8">Follow this transition roadmap to prepare for direct consultation sessions.</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                        <div className="flex flex-col">
                          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mb-4 shadow-md">01</span>
                          <h4 className="font-bold text-sm text-slate-800 mb-1">Assessment Completion</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Submit academic records and verify profile variables.</p>
                        </div>
                        <div className="flex flex-col">
                          <span className="w-8 h-8 rounded-full bg-[#003ec7] text-white flex items-center justify-center text-xs font-bold mb-4 shadow-md">02</span>
                          <h4 className="font-bold text-sm text-slate-800 mb-1">Discovery Analysis</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Engage in dialogue to map alignment and isolate skill gaps.</p>
                        </div>
                        <div className="flex flex-col">
                          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold mb-4 border border-slate-200">03</span>
                          <h4 className="font-bold text-sm text-slate-800 mb-1">Gap Mitigation</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Engage in upskilling and self-study courses to bridge requirements.</p>
                        </div>
                        <div className="flex flex-col">
                          <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold mb-4 border border-slate-200">04</span>
                          <h4 className="font-bold text-sm text-slate-800 mb-1">Expert Session</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Direct 1-on-1 strategy validation with Elena Richardson.</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </section>
            )}

          </div>
        )}
      </main>

      {/* ─── Floating Save Status Toast ─── */}
      {saveStatus !== 'idle' && (
        <div className={`fixed bottom-24 md:bottom-8 right-8 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all animate-fade-in ${
          saveStatus === 'saved' 
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-700' 
            : saveStatus === 'saving'
            ? 'bg-blue-50/95 border-blue-200 text-blue-700'
            : 'bg-rose-50/95 border-rose-200 text-rose-700'
        }`}>
          <span className={`material-symbols-outlined text-lg ${saveStatus === 'saving' ? 'animate-spin' : ''}`}>
            {saveStatus === 'saved' ? 'check_circle' : saveStatus === 'saving' ? 'sync' : 'error'}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider">
            {saveStatus === 'saved' ? 'Changes Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save Failed'}
          </span>
        </div>
      )}

      {/* ─── Mobile BottomNavBar ─── */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-4 pt-2 md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl no-border shadow-2xl rounded-t-3xl">
        <button 
          onClick={() => handleTabChange('profile')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
            activeTab === 'profile' ? 'bg-[#0052FF] text-white scale-95' : 'text-slate-400'
          }`}
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] font-semibold uppercase mt-1">Profile</span>
        </button>
        <button 
          onClick={() => handleTabChange('insights')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all ${
            activeTab === 'insights' ? 'bg-[#0052FF] text-white scale-95' : 'text-slate-400'
          }`}
        >
          <span className="material-symbols-outlined">insights</span>
          <span className="text-[10px] font-semibold uppercase mt-1">Insights</span>
        </button>
      </nav>

    </div>
  );
}
