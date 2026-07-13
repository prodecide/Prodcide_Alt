import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { apiFetch } from '../utils/api.js';
import { useGoogleLogin } from '@react-oauth/google';

export default function Discovery() {
  const navigate = useNavigate();
  
  // Form view states
  const [selectedDomain, setSelectedDomain] = useState('Career Path Selection');
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  
  // Chat states
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! Tell me about the challenge you're facing. What is the core decision you need to make? Be as specific as possible—I'll help you structure the variables and evaluate the outcomes.",
      options: ["Help me decide between Option A and Option B considering I want to be employed in 2 years"],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
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

  // Google auth state
  const [isGoogleAuthed, setIsGoogleAuthed] = useState(
    !!localStorage.getItem('discovery_verified_email')
  );
  const [googlePicture, setGooglePicture] = useState(null);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  // Google login hook
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLinkingGoogle(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();

        // Auto-fill name from Google
        if (userInfo.name) setOnboardingName(userInfo.name);

        // Store auth details
        if (userInfo.email) {
          localStorage.setItem('discovery_verified_email', userInfo.email.toLowerCase().trim());
        }
        if (userInfo.name) {
          localStorage.setItem('discovery_verified_name', userInfo.name);
        }
        if (userInfo.picture) {
          setGooglePicture(userInfo.picture);
          localStorage.setItem('discovery_user_picture', userInfo.picture);
        }

        setIsAuthenticated(true);
        setIsGoogleAuthed(true);

        // Trigger Navbar update
        window.dispatchEvent(new Event('storage'));
      } catch (err) {
        console.error('Google login failed', err);
        alert('Failed to pull Google account details.');
      } finally {
        setIsLinkingGoogle(false);
      }
    },
    onError: (error) => console.log('Google Login Failed:', error)
  });

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
  const [synthesisStep, setSynthesisStep] = useState(1);

  const domainDropdownRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  // Sound effect refs for context engine
  const prevSkillsRef = useRef(0);
  const prevGapsRef = useRef(0);

  // Play pop sound when new skills/gaps are added
  useEffect(() => {
    if (currentSkills.length > prevSkillsRef.current || criticalGaps.length > prevGapsRef.current) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        console.log("Audio not supported or blocked");
      }
      prevSkillsRef.current = currentSkills.length;
      prevGapsRef.current = criticalGaps.length;
    }
  }, [currentSkills.length, criticalGaps.length]);

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
        apiFetch('/api/user-profiles', {
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

  // Generate smart fallback results from the conversation context
  const generateFallbackResults = () => {
    const domain = selectedDomain || 'Career Path Selection';
    const userMsgs = messages.filter(m => m.sender === 'user').map(m => m.text).join(' ').toLowerCase();
    
    let paths = [];
    let gaps = [];
    let skills = [];

    // Infer paths from domain and conversation
    if (domain.includes('Job') || userMsgs.includes('transition') || userMsgs.includes('switch')) {
      paths = [
        { title: 'Strategic Industry Pivot', icon: 'trending_up' },
        { title: 'Upskill & Advance', icon: 'school' },
        { title: 'Consulting & Advisory', icon: 'psychology' }
      ];
    } else {
      paths = [
        { title: 'Technology & Innovation', icon: 'psychology' },
        { title: 'Business Strategy', icon: 'trending_up' },
        { title: 'Research & Development', icon: 'science' }
      ];
    }

    // Infer gaps
    if (userMsgs.includes('ai') || userMsgs.includes('machine learning') || userMsgs.includes('tech')) {
      gaps = ['Machine Learning Fundamentals', 'System Design', 'Data Engineering'];
      skills = ['Analytical Thinking', 'Problem Solving', 'Self-Motivation'];
    } else if (userMsgs.includes('finance') || userMsgs.includes('banking')) {
      gaps = ['Financial Modeling', 'Risk Analysis', 'Regulatory Framework'];
      skills = ['Quantitative Analysis', 'Critical Thinking', 'Communication'];
    } else if (userMsgs.includes('consult') || userMsgs.includes('management')) {
      gaps = ['Case Frameworks', 'Client Management', 'Market Sizing'];
      skills = ['Logical Reasoning', 'Stakeholder Management', 'Presentation Skills'];
    } else {
      gaps = ['Domain Expertise', 'Professional Networking', 'Technical Foundations'];
      skills = ['Analytical Thinking', 'Self-Motivation', 'Creative Problem Solving'];
    }

    return { suggestedPaths: paths, criticalGaps: gaps, currentSkills: skills };
  };

  useEffect(() => {
    if (readyToSuggest && !isRedirectingToInsights) {
      setIsRedirectingToInsights(true);

      // Use current state results, or generate fallbacks if empty
      const finalizeAndRedirect = async () => {
        let finalPaths = suggestedPaths;
        let finalGaps = criticalGaps;
        let finalSkills = currentSkills;

        // If results are empty, try one final synthesis API call
        if (finalPaths.length === 0 && finalGaps.length === 0 && finalSkills.length === 0) {
          try {
            const response = await apiFetch('/api/discovery-chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [...messages, { sender: 'user', text: 'Please provide your final analysis now with suggestedPaths, criticalGaps, and currentSkills.' }],
                selectedDomain,
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
            if (response.ok) {
              const data = await response.json();
              if (data.suggestedPaths && data.suggestedPaths.length > 0) finalPaths = data.suggestedPaths;
              if (data.criticalGaps && data.criticalGaps.length > 0) finalGaps = data.criticalGaps;
              if (data.currentSkills && data.currentSkills.length > 0) finalSkills = data.currentSkills;
            }
          } catch (err) {
            console.error('Final synthesis API call failed:', err);
          }
        }

        // If STILL empty after API call, use conversation-based fallback
        if (finalPaths.length === 0 && finalGaps.length === 0 && finalSkills.length === 0) {
          const fallback = generateFallbackResults();
          finalPaths = fallback.suggestedPaths;
          finalGaps = fallback.criticalGaps;
          finalSkills = fallback.currentSkills;
        }

        // Update state so sidebar reflects final data
        if (finalPaths.length > 0) setSuggestedPaths(finalPaths);
        if (finalGaps.length > 0) setCriticalGaps(finalGaps);
        if (finalSkills.length > 0) setCurrentSkills(finalSkills);

        // Save to localStorage
        localStorage.setItem('discovery_results', JSON.stringify({
          suggestedPaths: finalPaths,
          criticalGaps: finalGaps,
          currentSkills: finalSkills
        }));

        window.dispatchEvent(new Event('storage'));

        // Clear the challenge cache so the user doesn't get redirected back to discovery upon logging in
        localStorage.removeItem('discovery_challenge_text');

        // Push to database if authenticated
        const email = localStorage.getItem('discovery_verified_email');
        const name = localStorage.getItem('discovery_verified_name');
        const storedProfile = localStorage.getItem('discovery_user_profile');
        let baseProfile = {};
        if (storedProfile) {
          try { baseProfile = JSON.parse(storedProfile); } catch (e) {}
        }
        if (email) {
          apiFetch('/api/user-profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              name: name || baseProfile.name || '',
              ...baseProfile,
              suggestedPaths: finalPaths,
              gaps: finalGaps,
              currentSkills: finalSkills
            })
          }).catch(err => console.error("Failed to push AI results to database:", err));
        }

        // Navigate after synthesis animation
        setTimeout(() => {
          navigate('/dashboard?tab=insights');
        }, 3200);
      };

      // Step-by-step loading triggers
      const step1 = setTimeout(() => setSynthesisStep(2), 650);
      const step2 = setTimeout(() => setSynthesisStep(3), 1300);
      const step3 = setTimeout(() => setSynthesisStep(4), 1950);
      const step4 = setTimeout(() => setSynthesisStep(5), 2600);

      finalizeAndRedirect();

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
        clearTimeout(step4);
      };
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
      const response = await apiFetch('/api/auth?action=send-general-otp', {
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
      const response = await apiFetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: authOtp })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Verification failed.');
      
      // Save authenticated details
      localStorage.setItem('discovery_verified_name', authName.trim());
      localStorage.setItem('discovery_verified_email', authEmail.toLowerCase().trim());
      if (data.token) localStorage.setItem('prodecide_jwt', data.token);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      
      // Trigger state sync event so Navbar updates immediately
      window.dispatchEvent(new Event('storage'));
      
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle return redirect from Dashboard authentication & load context on mount
  useEffect(() => {
    const savedContextStr = localStorage.getItem('discovery_onboarding_context');
    const email = localStorage.getItem('discovery_verified_email');
    
    if (savedContextStr && email) {
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
    
    // Clean up challenge text only
    localStorage.removeItem('discovery_challenge_text');
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
      const response = await apiFetch('/api/discovery-chat', {
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

      // Only update accumulated results if API returns non-empty data (don't wipe existing)
      if (data.criticalGaps && data.criticalGaps.length > 0) setCriticalGaps(data.criticalGaps);
      if (data.currentSkills && data.currentSkills.length > 0) setCurrentSkills(data.currentSkills);
      if (data.suggestedPaths && data.suggestedPaths.length > 0) setSuggestedPaths(data.suggestedPaths);
      if (data.readyToSuggest) setReadyToSuggest(true);
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
      const response = await apiFetch('/api/discovery-chat', {
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

      // Only update accumulated results if API returns non-empty data (don't wipe existing)
      if (data.criticalGaps && data.criticalGaps.length > 0) setCriticalGaps(data.criticalGaps);
      if (data.currentSkills && data.currentSkills.length > 0) setCurrentSkills(data.currentSkills);
      if (data.suggestedPaths && data.suggestedPaths.length > 0) setSuggestedPaths(data.suggestedPaths);
      if (data.readyToSuggest) setReadyToSuggest(true);
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

  // Navigates directly to matching experts based on the selected career path
  const handleSelectPath = (pathTitle) => {
    navigate('/experts', { state: { domain: selectedDomain, selectedPath: pathTitle } });
  };

  return (
    <div className="font-body text-on-surface min-h-screen flex flex-col chat-gradient-bg">
      <Navbar />

      <div className="flex-grow flex overflow-hidden w-full p-4 md:p-6 lg:p-8">
          <div className="flex-grow flex overflow-hidden w-full max-w-[1920px] mx-auto rounded-[2rem] border border-white/40 shadow-2xl backdrop-blur-xl bg-white/10">
            {/* Main Chat Interface */}
            <main className="flex-grow flex flex-col relative">


              {/* Messages Stream */}
              <div className="flex-grow overflow-y-auto p-8 space-y-8 h-[calc(100vh-320px)]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                  {msg.sender === 'ai' ? (
                    <div className="flex items-start gap-4 max-w-3xl">
                      {/* Animated Waveform Avatar */}
                      <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/40">
                        <div className="waveform-container">
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                          <div className="waveform-bar"></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl rounded-tl-none border border-white/40 shadow-sm">
                          <TypewriterText text={msg.text} isLatest={i === messages.length - 1} />
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
                  <div className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm border border-white/40">
                    <div className="waveform-container">
                      <div className="waveform-bar"></div>
                      <div className="waveform-bar"></div>
                      <div className="waveform-bar"></div>
                      <div className="waveform-bar"></div>
                      <div className="waveform-bar"></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-4 py-3 bg-white/70 backdrop-blur-md rounded-2xl rounded-tl-none border border-white/40">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <span className="text-xs italic text-primary ml-2">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-8 border-t border-white/30 bg-white/40 backdrop-blur-sm">
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
            <aside className="w-80 m-6 ml-0 hidden lg:flex flex-col bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="p-6 overflow-y-auto flex-grow space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                  </div>
                  <div>
                    <h2 className="font-headline text-sm font-bold text-slate-900 leading-tight">Context Engine</h2>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Discovery Phase Active</p>
                  </div>
                </div>

                {/* Current Skills list */}
                {currentSkills.length > 0 && (
                  <section key={`skills-${currentSkills.length}`} className="animate-pop-in">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Current Skills</h3>
                    <div className="space-y-2">
                      {currentSkills.map((skill, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/60 shadow-sm">
                          <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
                          <span className="text-xs font-semibold text-slate-700">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Critical Gaps list */}
                {criticalGaps.length > 0 && (
                  <section key={`gaps-${criticalGaps.length}`} className="animate-pop-in">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Critical Gaps</h3>
                    <div className="flex flex-wrap gap-2">
                      {criticalGaps.map((gap, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-red-50/80 backdrop-blur-md text-red-600 border border-red-200/50 text-[10px] font-extrabold rounded-lg tracking-wide uppercase shadow-sm">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Direct Action Trigger */}
                <button 
                  onClick={() => setReadyToSuggest(true)}
                  className="w-full mt-4 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Generate Roadmap</span>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </button>
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
                  if (saved && isGoogleAuthed) {
                    setShowContextModal(false);
                  }
                }} 
                className={`border-none bg-transparent cursor-pointer ${isGoogleAuthed ? 'text-slate-400 hover:text-slate-600' : 'text-slate-200 cursor-not-allowed'}`}
                disabled={!isGoogleAuthed}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Sign in with Google and customize the decision mapping system based on your current academic or professional context.
            </p>

            {/* Google Sign-In Button */}
            {!isGoogleAuthed ? (
              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={isLinkingGoogle}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-slate-200 hover:border-[#4285F4] rounded-xl text-sm font-bold text-slate-700 hover:text-[#4285F4] transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isLinkingGoogle ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-[#4285F4] rounded-full animate-spin"></div>
                    <span>Connecting Google...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                {googlePicture && (
                  <img src={googlePicture} alt="Google" className="w-8 h-8 rounded-full border border-emerald-300" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800 truncate">{onboardingName || 'Signed in'}</p>
                  <p className="text-[10px] text-emerald-600 truncate">{localStorage.getItem('discovery_verified_email')}</p>
                </div>
                <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
              </div>
            )}

            <div className={`space-y-5 ${!isGoogleAuthed ? 'opacity-40 pointer-events-none' : ''}`}>
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
                    readOnly={isGoogleAuthed}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none ${isGoogleAuthed ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age</label>
                  <input 
                    type="number" 
                    value={onboardingAge} 
                    onChange={(e) => onboardingAge >= 0 ? setOnboardingAge(e.target.value) : null}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                  />
                </div>
              </div>

              {/* Student Onboarding Fields */}
              {selectedDomain === 'Career Path Selection' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in animate-duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Qualification</label>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Education / Qualification</label>
                    <input 
                      type="text" 
                      value={onboardingEducation} 
                      onChange={(e) => setOnboardingEducation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-[#0052FF] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            <button 
              type="button"
              disabled={!isGoogleAuthed}
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
              className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-none shadow-md cursor-pointer active:scale-95 ${isGoogleAuthed ? 'bg-primary hover:bg-[#003ec7] text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              {!isGoogleAuthed ? (
                <>
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Sign in with Google to continue</span>
                </>
              ) : (
                <>
                  <span>Confirm & Start Discovery</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </>
              )}
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


      {isRedirectingToInsights && (
        <div className="fixed inset-0 z-[99999] bg-[#0b0f19]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white text-center">
          {/* Animated Glowing Mesh Backgrounds */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

          {/* 3D WebGL Neural Canvas Container */}
          <div className="w-full h-72 relative mb-6">
            <NeuralSynthesisCanvas />
            {/* Overlay Icon in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-sm">
                <span className="material-symbols-outlined text-3xl text-white animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              </div>
            </div>
          </div>

          <h2 className="font-headline text-3xl font-black tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
            Synthesizing Career Roadmap
          </h2>

          {/* Status Check-off List */}
          <div className="w-full max-w-xs bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-3.5 text-left mb-8 backdrop-blur-md">
            {[
              { id: 1, text: "Analyzing career challenge context..." },
              { id: 2, text: "Synthesizing critical gap vectors..." },
              { id: 3, text: "Generating strategic transition roadmap..." },
              { id: 4, text: "Matching top 1% industry advisors..." }
            ].map((step) => {
              const isActive = synthesisStep === step.id;
              const isCompleted = synthesisStep > step.id;
              return (
                <div key={step.id} className="flex items-center gap-3 transition-all duration-300">
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-green-400 text-sm font-bold animate-[scaleIn_0.2s_ease-out_forwards]">check_circle</span>
                  ) : isActive ? (
                    <div className="w-3.5 h-3.5 rounded-full border border-blue-400 border-t-transparent animate-spin"></div>
                  ) : (
                    <span className="material-symbols-outlined text-slate-600 text-sm">radio_button_unchecked</span>
                  )}
                  <span className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${
                    isCompleted ? 'text-slate-300' : isActive ? 'text-blue-400 font-bold' : 'text-slate-600'
                  }`}>
                    {step.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 rounded-full"
              style={{ width: `${(synthesisStep - 1) * 25}%` }}
            />
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
        @keyframes scaleIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
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
        /* Gradient chat background */
        .chat-gradient-bg {
          background: linear-gradient(135deg, 
            #e8eaf6 0%, 
            #f3e5f5 25%, 
            #e3f2fd 50%, 
            #fce4ec 75%, 
            #e8eaf6 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        /* Animated waveform bars */
        .waveform-container {
          display: flex;
          align-items: center;
          gap: 2px;
          height: 18px;
        }
        .waveform-bar {
          width: 3px;
          background-color: #6b7280;
          border-radius: 2px;
          animation: waveform 1.2s ease-in-out infinite;
        }
        .waveform-bar:nth-child(1) { animation-delay: 0s; height: 8px; }
        .waveform-bar:nth-child(2) { animation-delay: 0.15s; height: 14px; }
        .waveform-bar:nth-child(3) { animation-delay: 0.3s; height: 18px; }
        .waveform-bar:nth-child(4) { animation-delay: 0.45s; height: 12px; }
        .waveform-bar:nth-child(5) { animation-delay: 0.6s; height: 6px; }
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        /* Typewriter cursor blink */
        .typewriter-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background-color: #003ec7;
          margin-left: 2px;
          animation: cursorBlink 0.7s step-end infinite;
          vertical-align: text-bottom;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-pop-in {
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Typewriter Text Effect for AI Messages ───
function TypewriterText({ text, isLatest }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!isLatest) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;
    const speed = 15; // ms per character

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, isLatest]);

  return (
    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
      {displayedText}
      {isLatest && !isComplete && <span className="typewriter-cursor" />}
    </p>
  );
}

// ─── Three.js Neural Sphere Synthesis Canvas ───
function NeuralSynthesisCanvas() {
  const containerRef = useRef(null);

  useEffect(() => {
    const SCRIPT_ID = 'three-js-script';
    let script = document.getElementById(SCRIPT_ID);
    
    const initThree = () => {
      if (!containerRef.current) return;
      const THREE = window.THREE;
      if (!THREE) return;

      const container = containerRef.current;
      container.innerHTML = '';

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      const primaryColor = new THREE.Color('#0052FF');
      const accentColor = new THREE.Color('#00D1FF');
      
      const group = new THREE.Group();
      scene.add(group);

      const particlesCount = 1200;
      const positions = new Float32Array(particlesCount * 3);
      const colors = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount; i++) {
          const phi = Math.acos(-1 + (2 * i) / particlesCount);
          const theta = Math.sqrt(particlesCount * Math.PI) * phi;
          
          const radius = 2 + Math.random() * 0.1;
          positions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
          positions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
          positions[i * 3 + 2] = radius * Math.cos(phi);

          const mix = Math.random();
          colors[i * 3] = THREE.MathUtils.lerp(primaryColor.r, accentColor.r, mix);
          colors[i * 3 + 1] = THREE.MathUtils.lerp(primaryColor.g, accentColor.g, mix);
          colors[i * 3 + 2] = THREE.MathUtils.lerp(primaryColor.b, accentColor.b, mix);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
          size: 0.04,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending
      });

      const points = new THREE.Points(geometry, material);
      group.add(points);

      function createRing(radius, color, speed, axis) {
          const ringGeom = new THREE.TorusGeometry(radius, 0.005, 16, 100);
          const ringMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.rotation.x = Math.random() * Math.PI;
          ring.rotation.y = Math.random() * Math.PI;
          group.add(ring);
          return { mesh: ring, speed: speed, axis: axis };
      }

      const rings = [
          createRing(2.5, primaryColor, 0.01, 'y'),
          createRing(2.8, accentColor, -0.005, 'x'),
          createRing(3.2, primaryColor, 0.008, 'z')
      ];

      let animationFrameId;
      function animate() {
          animationFrameId = requestAnimationFrame(animate);
          
          group.rotation.y += 0.002;
          group.rotation.x += 0.001;
          
          rings.forEach(r => {
              r.mesh.rotation[r.axis] += r.speed;
          });

          const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
          points.scale.set(scale, scale, scale);

          renderer.render(scene, camera);
      }

      const handleResize = () => {
          if (!containerRef.current) return;
          const w = containerRef.current.clientWidth || window.innerWidth;
          const h = containerRef.current.clientHeight || window.innerHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
      };

      window.addEventListener('resize', handleResize);
      animate();

      return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
      };
    };

    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = initThree;
      document.body.appendChild(script);
    } else {
      if (window.THREE) {
        initThree();
      } else {
        script.addEventListener('load', initThree);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initThree);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
