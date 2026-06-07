import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const PROFESSION_OPTIONS = [
    "Software Engineer", "Data Scientist", "Cybersecurity Analyst", "Civil Engineer", "Mechanical Engineer",
    "Architect", "Investment Banker", "Chartered Accountant", "Stock Trader", "Corporate Lawyer",
    "Criminal Lawyer", "Judge / Magistrate", "General Surgeon", "General Physician", "Psychiatrist",
    "Emergency Medicine", "Management Consultant", "HR Manager", "Marketing Manager", "Sales Director",
    "Entrepreneur / Founder", "Product Manager", "Graphic Designer", "UX/UI Designer", "Film Director",
    "Journalist", "Content Creator", "Commercial Pilot", "Air Traffic Controller", "Army Officer",
    "Research Scientist", "Biotechnologist", "Forensic Scientist", "Geologist", "Professor / Academic",
    "School Teacher", "Career Counselor", "Event Manager", "Supply Chain Manager", "Hotel Manager",
    "Political Scientist", "Diplomat", "Social Worker", "Economist", "Fashion Designer", "Interior Designer",
    "Actuary", "Sports Manager", "Sustainability Consult", "Urban Planner"
];

const EXPERTISE_OPTIONS = [
    { category: "Healthcare & Medicine", options: ["Medicine (MBBS / MD / Specializations)", "Allied Healthcare (Physio, Nursing, Pharmacy)", "Mental Health & Psychology"] },
    { category: "Aviation & Aerospace", options: ["Pilot (Commercial / Defense)", "Aerospace Engineering", "Aviation Operations & Safety"] },
    { category: "Defense & Uniformed Services", options: ["Indian Army", "Indian Navy", "Indian Air Force", "Paramilitary / CAPF", "Defense Strategy & Training"] },
    { category: "Civil Services & Government", options: ["Civil Services (UPSC / State PSC)", "Government Jobs (SSC, Banking, PSU)", "Public Policy & Administration"] },
    { category: "Education & Teaching", options: ["Teaching & Academia", "School Education", "Higher Education & Research", "Career Counseling"] },
    { category: "Engineering & Technology", options: ["Software Engineering", "Data Science & AI", "Core Engineering", "Robotics & Emerging Tech"] },
    { category: "Business & Management", options: ["Product Management", "Business Strategy", "Consulting", "Entrepreneurship & Startups", "Finance & Banking"] },
    { category: "Creative & Communication", options: ["Design (UI/UX, Graphic)", "Content & Media", "Public Speaking & Communication"] },
    { category: "Law & Public Services", options: ["Law & Legal Practice", "Judiciary Preparation"] },
    { category: "Other", options: ["Other"] }
];

export default function Registration() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [isProfessionsOpen, setIsProfessionsOpen] = useState(false);
  const [isExpertiseOpen, setIsExpertiseOpen] = useState(false);
  const [professionSearch, setProfessionSearch] = useState('');
  const [expertiseSearch, setExpertiseSearch] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    expertise: [],
    experience: '',
    role: '',
    organization: '',
    linkedin: '',
    bio: '',
    profileImage: null
  });

  const professionDropdownRef = useRef(null);
  const expertiseDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (professionDropdownRef.current && !professionDropdownRef.current.contains(event.target)) setIsProfessionsOpen(false);
        if (expertiseDropdownRef.current && !expertiseDropdownRef.current.contains(event.target)) setIsExpertiseOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleExpertiseToggle = (option) => {
    setFormData(prev => {
        const isSelected = prev.expertise.includes(option);
        return {
            ...prev,
            expertise: isSelected ? prev.expertise.filter(e => e !== option) : [...prev.expertise, option]
        };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) return alert('Please upload an image file');
      if (file.size > 2 * 1024 * 1024) return alert('Max 2MB allowed');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.expertise.length === 0) return alert("Select expertise");
    if (!formData.role) return alert("Select role");
    
    try {
      const response = await fetch('/api/consultants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setFormSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message);
    }
  };

  const [mockRequests, setMockRequests] = useState([
    {
      id: 'REQ-9921',
      clientName: 'Alice Vance',
      clientCompany: 'Aether Capital',
      challenge: 'Need regulatory guidance on cross-border transactions for our new DeFi protocol launch.',
      date: 'Jun 10, 2026',
      time: '11:00 AM - 12:00 PM',
      status: 'pending'
    },
    {
      id: 'REQ-7782',
      clientName: 'David K.',
      clientCompany: 'Vertex Logistics',
      challenge: 'Evaluating multi-modal warehousing strategies under Q3 fuel cost constraints.',
      date: 'Jun 12, 2026',
      time: '02:00 PM - 03:00 PM',
      status: 'pending'
    }
  ]);

  const handleAcceptRequest = (id) => {
    setMockRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'accepted', meetLink: 'https://meet.google.com/pd-tux-jmr' } : req));
  };

  const handleDeclineRequest = (id) => {
    setMockRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'declined' } : req));
  };

  if (formSubmitted) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen pb-12">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-10">
          
          {/* Profile Status & Verification Bar */}
          <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-on-surface">Consultant Profile Verification</h3>
                <p className="text-secondary text-xs">Your credential assessment is under review by our screening desk.</p>
              </div>
            </div>
            {/* Steps indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">✓</span>
                <span className="text-xs font-bold text-slate-700">Submitted</span>
              </div>
              <div className="w-8 h-0.5 bg-slate-200"></div>
              <div className="flex items-center gap-1">
                <span className="w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">2</span>
                <span className="text-xs font-bold text-primary">Screening</span>
              </div>
              <div className="w-8 h-0.5 bg-slate-200"></div>
              <div className="flex items-center gap-1 opacity-40">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">3</span>
                <span className="text-xs font-medium text-slate-500">Verified</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Stats & Profile Card */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile card preview */}
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm">
                <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-md">
                    <img 
                      src={imagePreview || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'} 
                      alt={formData.fullName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h3 className="font-extrabold text-xl text-on-surface">{formData.fullName}</h3>
                  <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1">{formData.role}</p>
                  <p className="text-secondary text-xs mt-0.5">{formData.organization}</p>
                </div>
                
                <div className="py-4 border-b border-slate-100 space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Expertise Fields</span>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.expertise.map(tag => (
                      <span key={tag} className="bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-100">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Biography Overview</span>
                  <p className="text-xs text-secondary leading-relaxed italic">"{formData.bio}"</p>
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
                  <p className="text-3xl font-black mt-1 text-primary animate-pulse">12</p>
                </div>
              </div>

            </div>

            {/* Right Column: Client Request Stream */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
                <h3 className="font-headline font-extrabold text-xl mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                  Incoming Client Bookings
                </h3>

                <div className="space-y-6">
                  {mockRequests.map((req) => (
                    <div key={req.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/60 relative overflow-hidden transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-on-surface text-base">{req.clientName}</h4>
                          <p className="text-xs text-secondary font-medium">{req.clientCompany}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                          req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          req.status === 'declined' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <p className="text-sm text-secondary leading-relaxed mb-4 italic">
                        "{req.challenge}"
                      </p>

                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pb-4 border-b border-slate-200/50 mb-4">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                          <span>{req.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span>{req.time}</span>
                        </div>
                      </div>

                      {req.status === 'pending' ? (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleAcceptRequest(req.id)}
                            className="bg-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-primary-container transition-colors"
                          >
                            Accept Request
                          </button>
                          <button 
                            onClick={() => handleDeclineRequest(req.id)}
                            className="border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      ) : req.status === 'accepted' ? (
                        <div className="bg-green-50 border border-green-100 p-3.5 rounded-xl flex justify-between items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600 text-sm">videocam</span>
                            <span className="text-xs font-semibold text-green-700">Scheduled Google Meet:</span>
                            <a href={req.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline">{req.meetLink}</a>
                          </div>
                          <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Ready to join</span>
                        </div>
                      ) : (
                        <p className="text-xs text-rose-600 italic">This session has been declined.</p>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          <div className="lg:col-span-5">
            <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-on-surface leading-tight mb-6">
              Join the Elite Network of <span className="text-primary">Decision Architects</span>.
            </h1>
            <p className="text-secondary text-lg leading-relaxed mb-8">
              Your expertise is the foundation of our intelligence platform. Complete your professional profile to begin matching with high-impact consultations.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Verified Credentials</p>
                <p className="text-xs text-secondary">Join 50,000+ industry leaders globally.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-outline-variant/10">
              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="flex flex-col items-center justify-center pb-8 border-b border-outline-variant/10">
                  <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileImage').click()}>
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-transparent group-hover:ring-primary-fixed transition-all">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-slate-300">add_a_photo</span>
                      )}
                    </div>
                    <input type="file" id="profileImage" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-sm font-bold text-primary">Upload Profile Photo</span>
                    <p className="text-xs text-secondary">JPG, PNG (Max 2MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Full Name</label>
                    <input value={formData.fullName} onChange={handleChange} required id="fullName" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="Dr. Julian Pierce" type="text"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Email</label>
                    <input value={formData.email} onChange={handleChange} required id="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="j.pierce@organization.com" type="email"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Phone Number</label>
                    <input value={formData.phone} onChange={handleChange} required id="phone" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="+1 (555) 000-0000" type="tel"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">City / Country</label>
                    <input value={formData.location} onChange={handleChange} required id="location" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="London, UK" type="text"/>
                  </div>
                </div>
 
                <div className="space-y-6 pt-6 border-t border-outline-variant/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2" ref={expertiseDropdownRef}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Area of Expertise</label>
                      <div className="relative">
                        <div onClick={() => setIsExpertiseOpen(!isExpertiseOpen)} className="w-full px-4 py-3 rounded-xl bg-slate-50 min-h-[44px] flex flex-wrap gap-1 items-center cursor-pointer">
                            {formData.expertise.length > 0 ? (
                                formData.expertise.map(e => (
                                    <span key={e} className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">{e}</span>
                                ))
                            ) : <span className="text-slate-400 text-sm">Select Expertise</span>}
                        </div>
                        {isExpertiseOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-64 overflow-y-auto p-4">
                                <div className="mb-3 sticky top-0 bg-white border-b border-slate-50 pb-2">
                                    <input value={expertiseSearch} onChange={(e) => setExpertiseSearch(e.target.value)} autoFocus className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm outline-none" placeholder="Search expertise..." />
                                </div>
                                {EXPERTISE_OPTIONS.map(group => {
                                    const filteredOptions = group.options.filter(opt => opt.toLowerCase().includes(expertiseSearch.toLowerCase()));
                                    if (filteredOptions.length === 0) return null;
                                    return (
                                        <div key={group.category} className="mb-4 last:mb-0">
                                            <div className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b border-slate-50 pb-1">{group.category}</div>
                                            <div className="space-y-1">
                                                {filteredOptions.map(opt => (
                                                    <div key={opt} onClick={() => handleExpertiseToggle(opt)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.expertise.includes(opt) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                                            {formData.expertise.includes(opt) && <span className="text-white text-[10px]">✓</span>}
                                                        </div>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Experience (Years)</label>
                      <input value={formData.experience} onChange={handleChange} required id="experience" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="12" type="number"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2" ref={professionDropdownRef}>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Profession</label>
                      <div className="relative">
                        <div onClick={() => setIsProfessionsOpen(!isProfessionsOpen)} className="w-full px-4 py-3 rounded-xl bg-slate-50 text-sm flex justify-between items-center cursor-pointer">
                            {formData.role || <span className="text-slate-400">Select Profession</span>}
                            <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                        </div>
                        {isProfessionsOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 max-h-64 overflow-y-auto">
                                <div className="p-3 sticky top-0 bg-white border-b border-slate-50">
                                    <input value={professionSearch} onChange={(e) => setProfessionSearch(e.target.value)} autoFocus className="w-full px-3 py-2 bg-slate-50 rounded-lg text-sm outline-none" placeholder="Search..." />
                                </div>
                                {PROFESSION_OPTIONS.filter(p => p.toLowerCase().includes(professionSearch.toLowerCase())).map(p => (
                                    <div key={p} onClick={() => { setFormData(prev => ({...prev, role: p})); setIsProfessionsOpen(false); }} className="px-4 py-2.5 hover:bg-primary/5 cursor-pointer text-sm font-medium">
                                        {p}
                                    </div>
                                ))}
                            </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Organization</label>
                      <input value={formData.organization} onChange={handleChange} required id="organization" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="Global Consulting Group" type="text"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">LinkedIn Profile</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl bg-slate-200/50 text-slate-500"><span className="material-symbols-outlined text-sm">link</span></span>
                      <input value={formData.linkedin} onChange={handleChange} required id="linkedin" className="w-full px-4 py-3 rounded-r-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="https://linkedin.com/in/username" type="url"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Short Bio</label>
                    <textarea value={formData.bio} onChange={handleChange} required id="bio" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="Briefly describe your core value proposition..." rows="3"></textarea>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group" type="submit">
                    Submit Application
                    <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </button>
                  <p className="text-center text-[10px] text-secondary mt-4 uppercase tracking-tighter">
                    By submitting, you agree to ProDecide's <span className="text-primary font-bold cursor-pointer">Terms</span> and <span className="text-primary font-bold cursor-pointer">Privacy Policy</span>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <section className="p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
              <span className="material-symbols-outlined text-blue-400 text-3xl">auto_awesome</span>
            </div>
            <div>
              <h4 className="font-headline font-bold text-xl">The AI-Matching Edge</h4>
              <p className="text-slate-400 text-sm max-w-2xl">Our platform uses advanced semantic mapping to connect your specific nuances with the most complex corporate challenges. We value depth over volume.</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </section>
      </main>
    </div>
  );
}
