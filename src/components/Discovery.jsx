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
  
  // Chat transition states
  const [mode, setMode] = useState('input'); // 'input' or 'chat'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  
  // Context Engine states (extracted dynamically from Gemini)
  const [criticalGaps, setCriticalGaps] = useState([]);
  const [currentSkills, setCurrentSkills] = useState([]);
  const [suggestedPaths, setSuggestedPaths] = useState([]);
  const [readyToSuggest, setReadyToSuggest] = useState(false);

  const domainDropdownRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

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

  const handleInitialAnalyze = async () => {
    if (!challengeText.trim()) {
      alert("Please describe your challenge before analyzing.");
      return;
    }

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
            selectedDomain: selectedDomain
          })
        });

        if (!response.ok) throw new Error("Failed to initialize discovery agent");
        const data = await response.json();
        
        // Update context details
        setCriticalGaps(data.criticalGaps || []);
        setCurrentSkills(data.currentSkills || []);
        setSuggestedPaths(data.suggestedPaths || []);
        setReadyToSuggest(data.readyToSuggest || false);

        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: data.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } catch (err) {
        console.error("Discovery error:", err);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: "I experienced a temporary connection glitch with the main intelligence hub. Please write your next message so we can continue mapping your strategic transition.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } finally {
        setIsAITyping(false);
      }
    }, 1800);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      sender: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsAITyping(true);

    try {
      const updatedMessages = [...messages, userMsg];
      const response = await fetch('/api/discovery-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          selectedDomain: selectedDomain
        })
      });

      if (!response.ok) throw new Error("Failed to send message to discovery agent");
      const data = await response.json();

      // Update context details
      if (data.criticalGaps) setCriticalGaps(data.criticalGaps);
      if (data.currentSkills) setCurrentSkills(data.currentSkills);
      if (data.suggestedPaths) setSuggestedPaths(data.suggestedPaths);
      if (data.readyToSuggest !== undefined) setReadyToSuggest(data.readyToSuggest);

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error("Discovery send error:", err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "My neural bridge is currently running hot. Let me process this details further. What other experience can you share?",
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
        <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-12 gap-8 flex-grow w-full">
          <section className="col-span-12 lg:col-span-8 flex flex-col gap-12">
            {/* AI Avatar & Welcome */}
            <div className="flex flex-col gap-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#003ec7] to-[#0052ff] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <div className="max-w-2xl">
                <h1 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900 mb-4 animate-fade-in">
                  Tell me about the challenge you're facing.
                </h1>
                <p className="text-body-lg text-slate-600 leading-relaxed text-lg">
                  What is the core decision you need to make? Be as specific as possible—I'll help you structure the variables and evaluate the outcomes.
                </p>
              </div>
            </div>

            {/* Input Field Area */}
            <div className="relative group">
              <div className="bg-white rounded-xl p-2 shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-[#003ec7] transition-all">
                <textarea 
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-800 p-4 text-lg placeholder:text-slate-400 resize-none font-body outline-none" 
                  placeholder="e.g., I'm deciding between two career paths: staying in my current specialized role or pivoting to a management position. Help me evaluate the long-term impact on my goals." 
                  rows="4"
                />
                <div className="flex justify-between items-center px-4 py-3 bg-[#f2f4f6] rounded-lg">
                  <div className="flex gap-2"></div>
                  <button 
                    onClick={handleInitialAnalyze}
                    className="bg-gradient-to-br from-[#003ec7] to-[#0052ff] text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <span>Analyze Problem</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Prompt Suggestion */}
              <div 
                onClick={handleSuggestionClick}
                className="mt-8 bg-blue-50/70 border border-blue-200 hover:bg-blue-50 backdrop-blur-md rounded-xl p-6 relative overflow-hidden cursor-pointer group/suggestion transition-all"
              >
                <div className="flex gap-4 items-start relative z-10">
                  <span className="material-symbols-outlined text-[#003ec7] transition-transform group-hover/suggestion:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  <div>
                    <h4 className="font-headline text-sm font-bold text-slate-800 mb-1">PROMPT SUGGESTION</h4>
                    <p className="text-xs text-slate-600 leading-relaxed group-hover/suggestion:text-[#003ec7] transition-colors">
                      "Help me decide between Option A and Option B considering I want to be employed in 2 years"
                    </p>
                  </div>
                </div>
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
              </div>
            </div>
          </section>

          {/* Sidebar Domain Selector */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-[#f2f4f6] rounded-xl p-8 sticky top-28 h-fit border border-slate-100">
              <h3 className="font-headline text-lg font-extrabold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#003ec7] text-xl">account_tree</span>
                Current Context
              </h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">DOMAIN</span>
                  <div className="relative" ref={domainDropdownRef}>
                    <button 
                      onClick={() => setIsDomainOpen(!isDomainOpen)}
                      className="w-full bg-white px-4 py-3 rounded-lg flex items-center justify-between gap-3 border border-slate-200 hover:border-[#003ec7]/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-500 text-sm">business_center</span>
                        <span className="text-sm font-medium text-slate-800 font-manrope">{selectedDomain}</span>
                      </div>
                      <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                    </button>
                    {isDomainOpen && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                        {['Career Path Selection', 'Strategic Job Transition', 'Enterprise Solution Design', 'Personal Problem Resolution'].map(domainOpt => (
                          <button
                            key={domainOpt}
                            onClick={() => { setSelectedDomain(domainOpt); setIsDomainOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm font-manrope text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                          >
                            {domainOpt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 p-4 bg-[#e6e8ea] rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#003ec7] animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-800">AI ANALYSIS ENGINE</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  I am currently mapping your problem space. As you provide details, I will suggest best ways forward and suitable consultants to help you in decisioning.
                </p>
              </div>
            </div>
          </aside>
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
                <p className="text-sm text-slate-500">Navigating complex career transitions with deep intelligence.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-blue-50 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">Active Insight</span>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pr-36 text-sm focus:ring-4 focus:ring-[#003ec7]/10 focus:border-primary transition-all resize-none shadow-sm placeholder:text-slate-400" 
                    placeholder="Describe your goals, experience, or reply to the assistant's questions..." 
                    rows="2"
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-3">
                    <button 
                      onClick={handleSendMessage}
                      className="bg-primary hover:bg-[#003ec7]/90 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                      <span>Send</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                </div>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest opacity-70">
                  ProDecide Intelligence • Strategic Career Output Verification Required
                </p>
              </div>
            </div>
          </main>

          {/* ─── Context Engine Sidebar ─── */}
          {/* If readyToSuggest is false: displays as a clean sidebar on the right */}
          {/* If readyToSuggest is true: layout shifts to put Suggested Paths in focus in the center */}
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

                {/* Additional Summary lists */}
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
                    onClick={() => navigate('/experts', { state: { challenge: challengeText } })}
                    className="px-5 py-2.5 bg-primary hover:bg-[#003ec7] text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/10 transition-colors"
                  >
                    View All Matching Experts
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* Style settings for custom bounce/dot animation */}
      <style>{`
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
