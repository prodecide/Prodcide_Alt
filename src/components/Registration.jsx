import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.expertise.length === 0) return alert("Select expertise");
    if (!formData.role) return alert("Select role");
    console.log("Submitting:", formData);
    // Mimic API call
    setFormSubmitted(true);
  };

  if (formSubmitted) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
        <header className="bg-white dark:bg-slate-900 border-b border-outline-variant/10 px-6 py-4">
           <Link className="text-xl font-black text-[#0052FF]" to="/">ProDecide</Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-6">
           <div className="max-w-md w-full bg-white rounded-2xl p-12 text-center shadow-xl">
             <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
             </div>
             <h2 className="text-3xl font-extrabold mb-4">Application Sent</h2>
             <p className="text-secondary mb-8">Our screening team will review your profile and reach out within 48 hours for a quick verification call.</p>
             <Link to="/experts" className="primary-gradient text-white px-8 py-3 rounded-lg font-bold block">Back to Experts</Link>
           </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <header className="bg-[#f7f9fb] dark:bg-slate-900 sticky top-0 z-50 flex justify-between items-center w-full px-6 py-3 border-b border-outline-variant/10">
        <Link className="text-xl font-black text-[#0052FF] dark:text-blue-500 font-headline tracking-tight" to="/">ProDecide</Link>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined">help_outline</span></button>
          <button className="p-2 text-slate-600 rounded-full hover:bg-slate-100"><span className="material-symbols-outlined">notifications</span></button>
        </div>
      </header>
      
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Work Email</label>
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
                                {EXPERTISE_OPTIONS.map(group => (
                                    <div key={group.category} className="mb-4 last:mb-0">
                                        <div className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b border-slate-50 pb-1">{group.category}</div>
                                        <div className="space-y-1">
                                            {group.options.map(opt => (
                                                <div key={opt} onClick={() => handleExpertiseToggle(opt)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${formData.expertise.includes(opt) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                                                        {formData.expertise.includes(opt) && <span className="text-white text-[10px]">✓</span>}
                                                    </div>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
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
