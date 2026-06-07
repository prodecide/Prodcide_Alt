import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

export default function Discovery() {
  const navigate = useNavigate();
  const [challengeText, setChallengeText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('Career Path Selection');
  const [isDomainOpen, setIsDomainOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const domainDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domainDropdownRef.current && !domainDropdownRef.current.contains(event.target)) {
        setIsDomainOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAnalyze = () => {
    if (!challengeText.trim()) {
      alert("Please describe your challenge before analyzing.");
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/experts', { state: { challenge: challengeText, domain: selectedDomain } });
    }, 1800);
  };

  const handleSuggestionClick = () => {
    setChallengeText("Help me decide between Option A and Option B considering I want to be employed in 2 years");
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col bg-[#f7f9fb]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-12 gap-8 flex-grow w-full">
        {/* Main Chat Area */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-12">
          {/* AI Avatar & Message */}
          <div className="flex flex-col gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#003ec7] to-[#0052ff] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div className="max-w-2xl">
              <h1 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
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
                <div className="flex gap-2">
                  {/* Action buttons placeholder */}
                </div>
                <button 
                  onClick={handleAnalyze}
                  className="bg-gradient-to-br from-[#003ec7] to-[#0052ff] text-white px-6 py-2 rounded-md font-medium flex items-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <span className="">Analyze Problem</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* AI Insight Pulse (Specialized AI Component) */}
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
              {/* Decorative background pulse */}
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Sidebar: Current Context */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#f2f4f6] rounded-xl p-8 sticky top-28 h-fit border border-slate-100">
            <h3 className="font-headline text-lg font-extrabold tracking-tight text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003ec7] text-xl">account_tree</span>
              Current Context
            </h3>
            <div className="space-y-6">
              {/* Context Item 1 */}
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

      {/* Footer */}
      <footer className="bg-[#f2f4f6] mt-auto border-t border-slate-200">
        <div className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto">
          <span className="text-lg font-bold text-slate-700">ProDecide AI</span>
          <div className="flex gap-6">
            <a className="font-inter text-xs leading-relaxed text-slate-500 hover:text-[#0052ff] transition-all" href="#">Privacy Policy</a>
            <a className="font-inter text-xs leading-relaxed text-slate-500 hover:text-[#0052ff] transition-all" href="#">Terms of Service</a>
            <a className="font-inter text-xs leading-relaxed text-slate-500 hover:text-[#0052ff] transition-all" href="#">Contact Support</a>
            <a className="font-inter text-xs leading-relaxed text-slate-500 hover:text-[#0052ff] transition-all" href="#">About Us</a>
          </div>
        </div>
      </footer>

      {/* AI Analysis Overlay */}
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
                Mapping your challenges, detecting constraint vectors, and querying matching consultants...
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative">
              <div className="bg-[#003ec7] h-full progress-bar-slide w-1/3 rounded-full absolute left-0 top-0"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .progress-bar-slide {
          animation: slideProgress 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
}
