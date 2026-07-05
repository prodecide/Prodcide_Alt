import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Discovery() {
  const navigate = useNavigate();
  
  // Form view states
  const [challengeText, setChallengeText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('Career Path Selection');
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  
  // Chat transition states
  const [mode, setMode] = useState('input'); // 'input' or 'chat'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('discovery_verified_email')
  );
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authStep, setAuthStep] = useState('email'); // 'email' or 'otp'
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Onboarding fields state
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingAge, setOnboardingAge] = useState('');
  const [onboardingClass, setOnboardingClass] = useState('');
  const [onboardingSubject, setOnboardingSubject] = useState('');
  const [onboardingJob, setOnboardingJob] = useState('');
  const [onboardingEducation, setOnboardingEducation] = useState('');
  
  // Context Engine states (extracted dynamically from Gemini)
  const [criticalGaps, setCriticalGaps] = useState([]);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [suggestedPaths, setSuggestedPaths] = useState([]);
  const [readyToSuggest, setReadyToSuggest] = useState(false);

  const domainDropdownRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  const getFallbackResponse = (userMsgText, historyList) => {
    const userHistory = historyList.filter(m => m.sender === 'user').map(m => m.text);
    if (userMsgText && !userHistory.includes(userMsgText)) {
      userHistory.push(userMsgText);
    }

    // Check if onboarding form details are already filled
    const hasName = !!onboardingName;
    const hasAge = !!onboardingAge;
    const hasClass = selectedDomain === 'Career Path Selection' ? !!onboardingClass : false;
    const hasSubject = selectedDomain === 'Career Path Selection' ? !!onboardingSubject : false;
    const hasJob = selectedDomain === 'Strategic Job Transitioning' ? !!onboardingJob : false;
    const hasEducation = selectedDomain === 'Strategic Job Transitioning' ? !!onboardingEducation : false;

    // Check if they are student or professional based on domain selection
    const isStudentFlow = selectedDomain === 'Career Path Selection';
    const isProfessionalFlow = selectedDomain === 'Strategic Job Transitioning';

    let text = "Welcome! Let's map your strategy transition. Could you tell me if you are currently a student or a working professional?";
    let options = ["Student", "Working Professional"];
    let ready = false;

    // If we have onboarding details, skip demographic collection entirely!
    if (isStudentFlow && hasClass && hasSubject) {
      const goalOptions = ["Pivoting to Tech", "Management Consulting", "Higher Studies Abroad", "Starting a Startup"];
      const hasGoal = userHistory.some(t => goalOptions.map(g => g.toLowerCase()).includes(t.toLowerCase()));

      if (!hasGoal) {
        text = `Hello ${onboardingName || 'there'}! I see you are in ${onboardingClass} studying ${onboardingSubject}. What is your primary career goal after this academic phase?`;
        options = goalOptions;
      } else {
        text = "Perfect! I have synthesized your profile. I suggest starting a discovery mapping to AI, consulting, or quantitative finance. Let's look at your roadmap.";
        options = [];
        ready = true;
        
        setCriticalGaps(["System Architecture", "Professional Mentorship", "Data Structures"]);
        setCurrentSkills(["Logical Analysis", "Self-motivation", "Creative Thinking"]);
        setSuggestedPaths([
          { title: "AI & Software Systems", icon: "psychology" },
          { title: "Management Consulting", icon: "trending_up" }
        ]);
      }
    } else if (isProfessionalFlow && hasJob && hasEducation) {
      const goalOptions = ["Pivoting to a new field", "Upskilling in current field", "Starting a business", "Not Sure"];
      const hasGoal = userHistory.some(t => goalOptions.map(g => g.toLowerCase()).includes(t.toLowerCase()));

      if (!hasGoal) {
        text = `Hello ${onboardingName || 'there'}! I see you are working as a ${onboardingJob} with a background in ${onboardingEducation}. What is your primary goal for this career transition?`;
        options = goalOptions;
      } else {
        text = "Perfect! I have mapped your transition metrics. Here are the target paths and expert options.";
        options = [];
        ready = true;

        setCriticalGaps(["System Design", "Cloud Infrastructure", "Quantitative Finance"]);
        setCurrentSkills(["Problem Solving", "Logical Reasoning", "Analytical Thinking"]);
        setSuggestedPaths([
          { title: "AI & Software Systems", icon: "psychology" },
          { title: "Financial Risk & Strategy", icon: "account_balance" }
        ]);
      }
    } else {
      const hasStudent = userHistory.some(t => t.toLowerCase().includes('student')) || isStudentFlow;
      const hasProfessional = userHistory.some(t => t.toLowerCase().includes('professional') || t.toLowerCase().includes('working')) || isProfessionalFlow;

      if (hasStudent) {
        const classOptions = ["10th", "12th", "Grad", "Post Grad"];
        const hasClassChoice = userHistory.some(t => classOptions.map(c => c.toLowerCase()).includes(t.toLowerCase()));

        if (!hasClassChoice) {
          text = "Got it. What class or educational level are you currently in?";
          options = classOptions;
        } else {
          const goalOptions = ["Pivoting to Tech", "Management Consulting", "Higher Studies Abroad", "Starting a Startup"];
          const hasGoal = userHistory.some(t => goalOptions.map(g => g.toLowerCase()).includes(t.toLowerCase()));

          if (!hasGoal) {
            text = "Great! What is your primary career goal after this academic phase?";
            options = goalOptions;
          } else {
            text = "Perfect! I have synthesized your profile. I suggest starting a discovery mapping to AI, consulting, or quantitative finance. Let's look at your roadmap.";
            options = [];
            ready = true;
            
            setCriticalGaps(["System Architecture", "Professional Mentorship", "Data Structures"]);
            setCurrentSkills(["Logical Analysis", "Self-motivation", "Creative Thinking"]);
            setSuggestedPaths([
              { title: "AI & Software Systems", icon: "psychology" },
              { title: "Management Consulting", icon: "trending_up" }
            ]);
          }
        }
      } else if (hasProfessional) {
        const roleOptions = ["Tech / Engineering", "Finance & Banking", "Business Strategy", "Operations / PM"];
        const hasRoleChoice = userHistory.some(t => roleOptions.map(r => r.toLowerCase()).includes(t.toLowerCase()));

        if (!hasRoleChoice) {
          text = "Great. What is your current functional focus or job role?";
          options = roleOptions;
        } else {
          const goalOptions = ["Pivoting to a new field", "Upskilling in current field", "Starting a business", "Not Sure"];
          const hasGoal = userHistory.some(t => goalOptions.map(g => g.toLowerCase()).includes(t.toLowerCase()));

          if (!hasGoal) {
            text = "Understood. What is your primary goal for this career transition?";
            options = goalOptions;
          } else {
            text = "Perfect! I have mapped your transition metrics. Here are the target paths and expert options.";
            options = [];
            ready = true;

            setCriticalGaps(["System Design", "Cloud Infrastructure", "Quantitative Finance"]);
            setCurrentSkills(["Problem Solving", "Logical Reasoning", "Analytical Thinking"]);
            setSuggestedPaths([
              { title: "AI & Software Systems", icon: "psychology" },
              { title: "Financial Risk & Strategy", icon: "account_balance" }
            ]);
          }
        }
      }
    }

    return { text, options, readyToSuggest: ready };
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domainDropdownRef.current && !domainDropdownRef.current.contains(event.target)) {
        setIsDomainOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAITyping]);

  // Sync AI Career Path results to local storage and database
  useEffect(() => {
    if (suggestedPaths.length > 0 || criticalGaps.length > 0 || currentSkills.length > 0) {
      localStorage.setItem('discovery_results', JSON.stringify({
        suggestedPaths,
        criticalGaps,
        currentSkills
      }));

      // Push to database if authenticated
      const email = localStorage.getItem('discovery_verified_email');
      const name = localStorage.getItem('discovery_verified_name');
      const storedProfile = localStorage.getItem('discovery_user_profile');
      let baseProfile = {};
      if (storedProfile) {
        try {
          baseProfile = JSON.parse(storedProfile);
        } catch (e) {
          console.error(e);
        }
      }

      if (email) {
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || baseProfile.name || '',
            ...baseProfile,
            suggestedPaths,
            gaps: criticalGaps,
            currentSkills
          })
        }).catch(err => console.error("Failed to push AI results to database:", err));
      }
    }
  }, [suggestedPaths, criticalGaps, currentSkills]);

  const [isRedirectingToInsights, setIsRedirectingToInsights] = useState(false);

  useEffect(() => {
    if (readyToSuggest && !isRedirectingToInsights) {
      setIsRedirectingToInsights(true);
      
      localStorage.setItem('discovery_results', JSON.stringify({
        suggestedPaths,
        criticalGaps,
        currentSkills
      }));

      window.dispatchEvent(new Event('storage'));

      const email = localStorage.getItem('discovery_verified_email');
      const name = localStorage.getItem('discovery_verified_name');
      const storedProfile = localStorage.getItem('discovery_user_profile');
      let baseProfile = {};
      if (storedProfile) {
        try { baseProfile = JSON.parse(storedProfile); } catch (e) {}
      }
      if (email) {
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: name || baseProfile.name || '',
            ...baseProfile,
            suggestedPaths,
            gaps: criticalGaps,
            currentSkills
          })
        }).catch(err => console.error("Failed to push AI results to database:", err));
      }

      const timer = setTimeout(() => {
        navigate('/dashboard?tab=insights');
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [readyToSuggest, suggestedPaths, criticalGaps, currentSkills, navigate, isRedirectingToInsights]);

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!authName.trim()) {
      setAuthError('Please enter your name.');
      return;
    }
    if (!authEmail.trim() || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const response = await fetch('/api/auth?action=send-general-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP code.');
      
      setAuthStep('otp');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    if (!authOtp.trim() || authOtp.length < 6) {
      setAuthError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setAuthError('');
    setIsAuthLoading(true);
    try {
      const response = await fetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: authOtp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed.');
      
      // Save authenticated details
      localStorage.setItem('discovery_verified_name', authName.trim());
      localStorage.setItem('discovery_verified_email', authEmail.toLowerCase().trim());
      setIsAuthenticated(true);
      setShowAuthModal(false);
      
      // Trigger state sync event so Navbar updates immediately
      window.dispatchEvent(new Event('storage'));
      
      // Proceed to analysis flow
      handleInitialAnalyze();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleAnalyzeClick = () => {
    if (!challengeText.trim()) {
      alert("Please describe your challenge before analyzing.");
      return;
    }
    // Save onboarding form data and challenge to localStorage for state recovery
    localStorage.setItem('discovery_challenge_text', challengeText);
    localStorage.setItem('discovery_onboarding_context', JSON.stringify({
      name: onboardingName,
      age: onboardingAge,
      class: onboardingClass,
      subject: onboardingSubject,
      job: onboardingJob,
      education: onboardingEducation
    }));
    handleInitialAnalyze();
  };

  const handleInitialAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate analyzing overlay for 1.8 seconds before opening the chat
    setTimeout(async () => {
      setIsAnalyzing(false);
      setMode('chat');
      
      const initialUserMsg = {
        sender: 'user',
        text: challengeText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([initialUserMsg]);
      setIsAITyping(true);

      try {
        const response = await fetch('/api/discovery-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [initialUserMsg],
            selectedDomain: selectedDomain,
            onboardingContext: {
              name: onboardingName,
              age: onboardingAge,
              class: onboardingClass,
              subject: onboardingSubject,
              job: onboardingJob,
              education: onboardingEducation
            }
          })
        });

        if (!response.ok) throw new Error("Failed to initialize discovery agent");
        const data = await response.json();
        
        // Update context details
        setCriticalGaps(data.criticalGaps || []);
        setCurrentSkills(data.currentSkills || []);
        setSuggestedPaths(data.suggestedPaths || []);
        setReadyToSuggest(data.readyToSuggest || false);
        if (data.limitExceeded) setLimitExceeded(true);

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: data.text,
            options: data.options || [],
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err) {
        console.error("Discovery error:", err);
        const fallback = getFallbackResponse("", []);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: fallback.text,
            options: fallback.options,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsAITyping(false);
      }
    }, 1800);
  };

  // Handle return redirect from Dashboard authentication & load context on mount
  useEffect(() => {
    const savedChallenge = localStorage.getItem('discovery_challenge_text');
    const savedContextStr = localStorage.getItem('discovery_onboarding_context');
    const email = localStorage.getItem('discovery_verified_email');
    
    if (savedContextStr) {
      try {
        const savedContext = JSON.parse(savedContextStr);
        setOnboardingName(savedContext.name || '');
        setOnboardingAge(savedContext.age || '');
        setOnboardingClass(savedContext.class || '');
        setOnboardingSubject(savedContext.subject || '');
        setOnboardingJob(savedContext.job || '');
        setOnboardingEducation(savedContext.education || '');
      } catch (e) {
        console.error("Failed to parse saved onboarding context", e);
      }
    } else {
      setShowContextModal(true);
    }

    if (savedChallenge && email) {
      setChallengeText(savedChallenge);
      setIsAuthenticated(true);
      
      // Clean up keys
      localStorage.removeItem('discovery_challenge_text');
      localStorage.removeItem('discovery_onboarding_context');
      
      // Auto-trigger analysis
      setTimeout(() => {
        handleInitialAnalyze();
      }, 500);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || limitExceeded) return;

    const userMsg = {
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAITyping(true);

    const updatedMessages = [...messages, userMsg];

    try {
      const response = await fetch('/api/discovery-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          selectedDomain: selectedDomain,
          criticalGaps,
          currentSkills,
          suggestedPaths,
          onboardingContext: {
            name: onboardingName,
            age: onboardingAge,
            class: onboardingClass,
            subject: onboardingSubject,
            job: onboardingJob,
            education: onboardingEducation
          }
        })
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json();

      // Update context details
      if (data.criticalGaps) setCriticalGaps(data.criticalGaps);
      if (data.currentSkills) setCurrentSkills(data.currentSkills);
      if (data.suggestedPaths) setSuggestedPaths(data.suggestedPaths);
      if (data.readyToSuggest !== undefined) setReadyToSuggest(data.readyToSuggest);
      if (data.limitExceeded) setLimitExceeded(true);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.text,
          options: data.options || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Discovery send error:", err);
      const fallback = getFallbackResponse(userMsg.text, updatedMessages);
      if (fallback.readyToSuggest) setReadyToSuggest(true);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: fallback.text,
          options: fallback.options,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleOptionClick = async (optionText) => {
    if (isAITyping || limitExceeded) return;

    const userMsg = {
      sender: 'user',
      text: optionText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => {
      const updated = [...prev];
      if (updated.length > 0 && updated[updated.length - 1].sender === 'ai') {
        updated[updated.length - 1] = { ...updated[updated.length - 1], options: [] };
      }
      return [...updated, userMsg];
    });
    
    setIsAITyping(true);

    const updatedMessages = [...messages.map(m => {
      if (m.options) {
        const { options, ...rest } = m;
        return rest;
      }
      return m;
    }), userMsg];

    try {
      const response = await fetch('/api/discovery-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          selectedDomain: selectedDomain,
          criticalGaps,
          currentSkills,
          suggestedPaths,
          onboardingContext: {
            name: onboardingName,
            age: onboardingAge,
            class: onboardingClass,
            subject: onboardingSubject,
            job: onboardingJob,
            education: onboardingEducation
          }
        })
      });

      if (!response.ok) throw new Error("Failed to send option message");
      const data = await response.json();

      if (data.criticalGaps) setCriticalGaps(data.criticalGaps);
      if (data.currentSkills) setCurrentSkills(data.currentSkills);
      if (data.suggestedPaths) setSuggestedPaths(data.suggestedPaths);
      if (data.readyToSuggest !== undefined) setReadyToSuggest(data.readyToSuggest);
      if (data.limitExceeded) setLimitExceeded(true);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.text,
          options: data.options || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Discovery send option error:", err);
      const fallback = getFallbackResponse(userMsg.text, updatedMessages);
      if (fallback.readyToSuggest) setReadyToSuggest(true);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: fallback.text,
          options: fallback.options,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleSuggestionClick = () => {
    setChallengeText("Help me decide between Option A and Option B considering I want to be employed in 2 years");
  };

  // Navigates directly to matching experts based on the selected career path
  const handleSelectPath = (pathTitle) => {
    navigate('/experts', { state: { challenge: challengeText, domain: selectedDomain, selectedPath: pathTitle } });
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col bg-[#f7f9fb]">
      <Navbar />

      {/* ─── Mode 1: Initial Input Form ─── */}
      {mode === 'input' ? (
        <main className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10 flex-grow w-full">
          {/* Context Preview Bar */}
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Target: {selectedDomain}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {onboardingName || 'Anonymous'} ({onboardingAge || 'N/A'} yrs) • {selectedDomain === 'Career Path Selection' ? `${onboardingClass || 'N/A'} in ${onboardingSubject || 'N/A'}` : `${onboardingJob || 'N/A'} (Degree: ${onboardingEducation || 'N/A'})`}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setShowContextModal(true)}
              className="px-4 py-2 bg-white border border-slate-200 hover:border-[#0052FF]/30 text-xs font-bold rounded-xl text-slate-700 hover:text-primary transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Edit Profile details
            </button>
          </div>

          {/* AI Avatar & Welcome */}
          <div className="flex flex-col gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003ec7] to-[#0052ff] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 mb-3">
                Tell me about the challenge you're facing.
              </h1>
              <p className="text-body-lg text-slate-500 leading-relaxed font-medium">
                What is the core decision you need to make? Be as specific as possible—I'll help you structure the variables and evaluate the outcomes.
              </p>
            </div>
          </div>

          {/* Input Field Area */}
          <div className="relative group">
            <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-[#003ec7] transition-all">
              <textarea 
                value={challengeText}
                onChange={(e) => setChallengeText(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 p-4 text-base placeholder:text-slate-400 resize-none font-body outline-none" 
                placeholder="e.g., I'm deciding between two career paths: staying in my current specialized role or pivoting to a management position. Help me evaluate the long-term impact on my goals." 
                rows="5"
              />
              <div className="flex justify-between items-center px-4 py-3 bg-[#f2f4f6] rounded-xl">
                <div className="flex gap-2"></div>
                <button 
                  type="button"
                  onClick={handleAnalyzeClick}
                  className="bg-[#0052FF] hover:bg-[#003ec7] text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all border-none cursor-pointer shadow-md shadow-blue-500/10"
                >
                  <span>Analyze Problem</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Prompt Suggestion */}
            <div 
              onClick={handleSuggestionClick}
              className="mt-8 bg-blue-50/70 border border-blue-200/50 hover:bg-blue-50 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden cursor-pointer group/suggestion transition-all"
            >
              <div className="flex gap-4 items-start relative z-10">
                <span className="material-symbols-outlined text-[#003ec7] transition-transform group-hover/suggestion:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <div>
                  <h4 className="font-headline text-xs font-bold text-slate-800 tracking-wider uppercase mb-1">PROMPT SUGGESTION</h4>
                  <p className="text-xs text-slate-600 leading-relaxed group-hover/suggestion:text-[#003ec7] transition-colors">
                    "Help me decide between Option A and Option B considering I want to be employed in 2 years"
                  </p>
                </div>
              </div>
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </main>
      ) : (
        /* ─── Mode 2: Chat Discovery View ─── */
        <div className="flex-grow flex overflow-hidden max-w-[1920px] mx-auto w-full">
          {/* Main Chat Interface */}
          <main className="flex-grow flex flex-col relative bg-white border-r border-slate-100">
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-slate-900">AI Discovery Phase</h1>
                <p className="text-sm text-slate-500 font-medium">Navigating complex career transitions with deep intelligence.</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Session Message Limit Indicator */}
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${messages.length >= 8 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  SESSION QUOTA: {messages.length}/8 MESSAGES
                </span>
                <span className="px-3 py-1 bg-blue-50 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">Active Insight</span>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 h-[calc(100vh-320px)]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  {msg.sender === 'ai' ? (
                    <div className="flex items-start gap-4 max-w-3xl">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-[#f2f4f6] p-6 rounded-2xl rounded-tl-none border border-slate-200/40 shadow-sm">
                          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        {i === messages.length - 1 && msg.options && msg.options.length > 0 && !isAITyping && (
                          <div className="flex flex-wrap gap-2 mt-1 ml-1 animate-fade-in">
                            {msg.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleOptionClick(opt)}
                                className="bg-[#0052FF] text-white hover:bg-[#003ec7] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 border-none"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest ml-2">{msg.time || 'AI Agent'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-end max-w-2xl">
                      <div className="bg-primary text-white p-5 rounded-2xl rounded-tr-none shadow-sm">
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-widest">{msg.time || 'SENT'}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isAITyping && (
                <div className="flex items-start gap-4 max-w-3xl mb-8">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#f2f4f6] rounded-2xl rounded-tl-none">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <span className="text-xs italic text-primary ml-2">Mapping technical skill gaps...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 border-t border-slate-100 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <textarea 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={limitExceeded}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pr-36 text-sm focus:ring-4 focus:ring-[#003ec7]/10 focus:border-primary transition-all resize-none shadow-sm placeholder:text-slate-400 disabled:opacity-50" 
                    placeholder={limitExceeded ? "Session message limit reached. Please view recommended paths." : "Describe your goals, experience, or reply to the assistant's questions..."} 
                    rows="2"
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-3">
                    <button 
                      onClick={handleSendMessage}
                      disabled={limitExceeded || !inputValue.trim()}
                      className="bg-primary hover:bg-[#003ec7]/90 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      <span>Send</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
                {limitExceeded && (
                  <p className="text-center text-xs text-red-600 font-semibold mt-3">
                    ⚠️ Session quota reached. Please select a suggested path from the right panel to proceed.
                  </p>
                )}
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest opacity-70">
                  ProDecide Intelligence • Strategic Career Output Verification Required
                </p>
              </div>
            </div>
          </main>

          {/* ─── Context Engine Sidebar ─── */}
          {!readyToSuggest ? (
            <aside className="w-80 h-[calc(100vh-80px)] sticky top-0 hidden lg:flex flex-col bg-[#f2f4f6] border-l border-slate-100">
              <div className="p-6 overflow-y-auto flex-grow space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-sm font-bold text-slate-900 leading-tight">Context Engine</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Discovery Phase Active</p>
                  </div>
                </div>

                {/* Suggested Paths list */}
                {suggestedPaths.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Suggested Paths</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {suggestedPaths.map((path, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => handleSelectPath(path.title)}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-primary transition-all cursor-pointer shadow-sm group"
                        >
                          <div className="flex flex-col gap-2">
                            <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-lg">
                              {path.icon || 'explore'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                              {path.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Current Skills list */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Current Skills</h3>
                  <div className="space-y-2">
                    {currentSkills.length > 0 ? (
                      currentSkills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                          <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                          <span className="text-xs font-semibold text-slate-700">{skill}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs italic text-slate-400 pl-1">Analyzing skills...</p>
                    )}
                  </div>
                </section>

                {/* Critical Gaps list */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Critical Gaps</h3>
                  <div className="flex flex-wrap gap-2">
                    {criticalGaps.length > 0 ? (
                      criticalGaps.map((gap, idx) => (
                        <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 text-[9px] font-extrabold rounded tracking-wide uppercase">
                          {gap}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs italic text-slate-400 pl-1">Mapping transition gaps...</p>
                    )}
                  </div>
                </section>

                {/* Direct Action Trigger */}
                <button 
                  onClick={() => setReadyToSuggest(true)}
                  className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Generate Roadmap</span>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </button>
              </div>

              {/* Sidebar Curator Profile Info */}
              <div className="mt-auto p-6 border-t border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <img alt="AI Agent" className="w-10 h-10 rounded-full border-2 border-[#0052ff]/30 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-lvZ4zMD4SLOVyCgm7AwGzHNkK4YQLKC27eepoXwX8fd4i0KiK5cy9QEQmAFs4Ze7cLlForj_rPBd6JYY3jsjlESfFWn7-KcfS-st0sKMT-6E9Jk7NFJgxHjaabvWt7QysG5BLSju6FjNEksQqnoSzEa6frxzj-iOX5GSkD38YPMuPxiAisHN7JxjQs5JdCgdw2x25hVLFRPd1axTIYsxfF27nzgNBsgQzaEBjEuAgiErw_0utHzn-zZx1fAF4XXfWrE0g0--iM0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Senior Strat-Agent</p>
                    <p className="text-[10px] text-slate-400 italic">Refining Discovery...</p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Session Context: Career Evolution v4.2<br />
                  Data Freshness: Real-time Market Access
                </div>
              </div>
            </aside>
          ) : (
            /* ─── Centered Focus State: Suggested Paths Centered ─── */
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col space-y-6 animate-float">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div>
                      <h2 className="font-headline text-lg font-bold text-slate-900">Suggested Career Pathways</h2>
                      <p className="text-xs text-slate-500">I have synthesized enough insights to recommend these paths.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setReadyToSuggest(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedPaths.map((path, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectPath(path.title)}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-primary bg-slate-50/50 hover:bg-white transition-all cursor-pointer shadow-sm group flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                        <span className="material-symbols-outlined text-xl">
                          {path.icon || 'explore'}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors leading-tight">
                          {path.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Click to explore matching specialists and project frameworks.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary list */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div>
                    <h5 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Acquired Skills</h5>
                    <div className="flex flex-wrap gap-1">
                      {currentSkills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white text-slate-700 text-[9px] font-bold rounded border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Identified Gaps</h5>
                    <div className="flex flex-wrap gap-1">
                      {criticalGaps.slice(0, 3).map((gap, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded border border-red-100">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    onClick={() => setReadyToSuggest(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Continue Chatting
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.setItem('discovery_results', JSON.stringify({
                        suggestedPaths,
                        criticalGaps,
                        currentSkills
                      }));
                      navigate('/dashboard?tab=insights');
                    }}
                    className="px-5 py-2.5 bg-primary hover:bg-[#003ec7] text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/10 transition-colors"
                  >
                    View Strategic Insights & Recommendations
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Context Onboarding Modal ─── */}
      {showContextModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0052FF] text-2xl">account_tree</span>
                <h3 className="font-headline text-xl font-black text-slate-900 tracking-tight">Set Up Your Profile Context</h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  const saved = localStorage.getItem('discovery_onboarding_context');
                  if (saved) {
                    setShowContextModal(false);
                  } else {
                    // Set default context if skipped
                    setOnboardingName('Anonymous');
                    setOnboardingAge('22');
                    setOnboardingClass('Grad');
                    setOnboardingSubject('General');
                    setOnboardingJob('Professional');
                    setOnboardingEducation('Graduate');
                    localStorage.setItem('discovery_onboarding_context', JSON.stringify({
                      name: 'Anonymous',
                      age: '22',
                      class: 'Grad',
                      subject: 'General',
                      job: 'Professional',
                      education: 'Graduate'
                    }));
                    setShowContextModal(false);
                  }
                }} 
                className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              We customize the decision mapping system based on your current academic or professional context.
            </p>

            <div className="space-y-5">
              {/* Domain Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Domain / Flow</label>
                <div className="relative" ref={domainDropdownRef}>
                  <button 
                    type="button"
                    onClick={() => setIsDomainOpen(!isDomainOpen)}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl flex items-center justify-between gap-3 border border-slate-200 hover:border-[#0052FF]/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500 text-sm">business_center</span>
                      <span className="text-xs font-bold text-slate-700 font-manrope">{selectedDomain}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </button>
                  {isDomainOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-[99999]">
                      {[
                        { value: 'Career Path Selection', label: 'Career Path Selection (Student Flow)', disabled: false },
                        { value: 'Strategic Job Transitioning', label: 'Strategic Job Transitioning (Professional Flow)', disabled: false }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setSelectedDomain(opt.value); setIsDomainOpen(false); }}
                          className="w-full px-4 py-2.5 text-left text-xs font-manrope transition-colors font-semibold text-slate-700 hover:bg-slate-50 border-none bg-transparent cursor-pointer"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Age Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name</label>
                  <input 
                    type="text" 
                    value={onboardingName} 
                    onChange={(e) => setOnboardingName(e.target.value)}
                    placeholder="Bobby"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age</label>
                  <input 
                    type="number" 
                    value={onboardingAge} 
                    onChange={(e) => onboardingAge >= 0 ? setOnboardingAge(e.target.value) : null}
                    placeholder="25"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                  />
                </div>
              </div>

              {/* Student Onboarding Fields */}
              {selectedDomain === 'Career Path Selection' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Class</label>
                    <select 
                      value={onboardingClass} 
                      onChange={(e) => setOnboardingClass(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                    >
                      <option value="">Select Level</option>
                      <option value="10th">10th Standard</option>
                      <option value="12th">12th Standard</option>
                      <option value="Grad">Undergraduate</option>
                      <option value="Post Grad">Postgraduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Subject / Major</label>
                    <input 
                      type="text" 
                      value={onboardingSubject} 
                      onChange={(e) => setOnboardingSubject(e.target.value)}
                      placeholder="e.g. Science, CS"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Professional Onboarding Fields */}
              {selectedDomain === 'Strategic Job Transitioning' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Current Role</label>
                    <input 
                      type="text" 
                      value={onboardingJob} 
                      onChange={(e) => setOnboardingJob(e.target.value)}
                      placeholder="e.g. Analyst"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Education / Qualification</label>
                    <input 
                      type="text" 
                      value={onboardingEducation} 
                      onChange={(e) => setOnboardingEducation(e.target.value)}
                      placeholder="e.g. B.Tech CS, MBA"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button"
              onClick={() => {
                if (!onboardingName.trim()) {
                  alert("Please fill in your name.");
                  return;
                }
                localStorage.setItem('discovery_onboarding_context', JSON.stringify({
                  name: onboardingName,
                  age: onboardingAge,
                  class: onboardingClass,
                  subject: onboardingSubject,
                  job: onboardingJob,
                  education: onboardingEducation,
                  domain: selectedDomain
                }));
                setShowContextModal(false);
              }}
              className="w-full bg-primary hover:bg-[#003ec7] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-none shadow-md cursor-pointer active:scale-95"
            >
              <span>Confirm & Start Discovery</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Auth Verification Modal ─── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-headline text-xl font-bold text-slate-900">Verify Identity</h3>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Please enter your name and verify your email address to unlock the AI Discovery chatbot.
            </p>

            {authStep === 'email' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={authName} 
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={authEmail} 
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="name@example.com"
                  />
                </div>
                {authError && <p className="text-xs text-red-500">{authError}</p>}
                <button 
                  onClick={handleSendOtp}
                  disabled={isAuthLoading}
                  className="w-full bg-primary hover:bg-[#003ec7] text-white py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isAuthLoading ? 'Sending OTP...' : 'Send OTP Code'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Verification Code</label>
                  <input 
                    type="text" 
                    value={authOtp} 
                    onChange={(e) => setAuthOtp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-center tracking-widest font-mono text-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                {authError && <p className="text-xs text-red-500">{authError}</p>}
                <button 
                  onClick={handleVerifyOtp}
                  disabled={isAuthLoading}
                  className="w-full bg-primary hover:bg-[#003ec7] text-white py-3 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {isAuthLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
                <button 
                  onClick={() => setAuthStep('email')} 
                  className="w-full text-center text-xs text-slate-500 hover:text-primary font-semibold transition-colors mt-2"
                >
                  Change Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Initial Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999] transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#003ec7]/10 flex items-center justify-center text-[#003ec7] animate-pulse">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-[#003ec7] border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">Analyzing Problem Space</h3>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                Mapping your challenges, detecting constraint vectors, and initiating strategic discovery chat...
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-[#003ec7] h-full progress-bar-slide w-1/3 rounded-full absolute left-0 top-0"></div>
            </div>
          </div>
        </div>
      )}

      {isRedirectingToInsights && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#003ec7] to-blue-400 rounded-full blur-xl opacity-75 animate-pulse"></div>
            <div className="relative w-24 h-24 rounded-full border-4 border-white/20 border-t-white animate-spin flex items-center justify-center bg-slate-900/90">
              <span className="material-symbols-outlined text-4xl text-[#003ec7] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
          </div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight mb-2 animate-bounce">
            Synthesis Complete!
          </h2>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6 font-medium">
            We have generated your strategic roadmap. Directing you to your Strategic Insights...
          </p>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#003ec7] to-blue-400 animate-[loadingBar_2s_ease-out_forwards]"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loadingBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes slideProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .progress-bar-slide {
          animation: slideProgress 1.5s infinite linear;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: #003ec7;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
}
