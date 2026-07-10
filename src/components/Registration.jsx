import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import { apiFetch } from '../utils/api.js';
import { useGoogleLogin } from '@react-oauth/google';

const PROFESSION_OPTIONS = [
    // Healthcare & Medicine
    "General Physician (MBBS)", "General Surgeon", "Cardiologist", "Neurologist", "Psychiatrist",
    "Dermatologist", "Orthopedic Surgeon", "Pediatrician", "Gynecologist / Obstetrician",
    "Radiologist", "Anesthesiologist", "Emergency Medicine Doctor", "Dentist", "Ophthalmologist",
    "ENT Specialist", "Oncologist", "Pathologist", "Physiotherapist", "Pharmacist",
    "Nurse / Staff Nurse", "Medical Lab Technician", "Veterinary Doctor", "AYUSH Practitioner",
    "Occupational Therapist", "Dietitian / Nutritionist", "Speech Therapist",
    "Medical Coder / Health Informatics Specialist", "Medical Transcriptionist",
    "Clinical Research Associate", "Biostatistician", "Epidemiologist",
    "Medical Officer (Government)", "Hospital Administrator", "Public Health Officer",
    "Health Insurance Specialist", "Medical Billing Specialist",
    "AIIMS / PGI Resident Doctor", "NEET Aspirant", "USMLE Aspirant",

    // Defense & Armed Forces
    "Indian Army Officer", "Indian Navy Officer", "Indian Air Force Officer",
    "Army Soldier (JCO / OR)", "Navy Sailor", "Air Force Airman",
    "Army Medical Corps Officer", "Military Engineer", "Army Education Corps",
    "Defence Research Scientist (DRDO)", "NDA / CDS Aspirant", "Territorial Army Officer",
    "Coast Guard Officer", "Coast Guard Navik",

    // Police & Paramilitary
    "IPS Officer", "State Police Officer", "Sub Inspector (SI)", "Constable",
    "CRPF Personnel", "BSF Personnel", "CISF Personnel", "SSB Personnel",
    "ITBP Personnel", "Assam Rifles Personnel",
    "NSG / Special Forces", "Forest Guard / Range Officer",
    "Prison / Jail Officer", "Traffic Police Officer", "Cyber Crime Officer",

    // Civil Services & Government
    "IAS Officer", "IRS Officer", "IFS Officer (Foreign Service)", "IFS Officer (Forest Service)",
    "IPoS Officer (Postal Service)", "IRTS Officer (Railway Traffic)", "IRAS Officer (Railway Accounts)",
    "State PSC Officer", "District Collector / DM", "Block Development Officer (BDO)",
    "Government Administrator", "Public Policy Analyst", "Municipal Corporation Officer",
    "Village Officer / Village Field Assistant (VFA)", "Panchayat / Gram Sevak",
    "Tehsildar / Revenue Officer", "Talathi / Village Administrative Officer",
    "Election Officer", "RTI Officer", "Information Officer",

    // Banking & Finance (Government)
    "IBPS Bank PO / Clerk", "SBI PO / Clerk", "RBI Grade B Officer",
    "NABARD Officer", "SIDBI Officer", "NHB Officer",
    "Insurance Officer (LIC / GIC)", "PSU Finance Officer",

    // SSC & Central Government Jobs
    "SSC CGL (Assistant / Inspector)", "SSC CHSL (LDC / DEO)", "SSC MTS", "SSC GD Constable",
    "SSC CPO (Delhi Police / CAPF SI)", "Railway Officer (Group A/B)",
    "Railway Technician / NTPC", "Railway Loco Pilot", "Railway Station Master",
    "India Post (Postal Assistant / GDS)", "Staff Selection Commission Aspirant",
    "UPSC CAPF AC", "Intelligence Bureau (IB) Officer", "CBI Officer",

    // Teaching & Education
    "School Teacher (Primary)", "School Teacher (Secondary / Senior)", "PGT / TGT", "KVS / NVS Teacher",
    "College Lecturer", "University Professor", "Research Scholar (PhD)", "Post-Doctoral Researcher",
    "UPSC / PSC Coach", "Career Counselor", "Educational Administrator",
    "Special Education Teacher", "Montessori / Pre-school Educator",
    "Online Tutor / EdTech Educator", "Training & Development Specialist",
    "Librarian / Information Scientist", "Curriculum Designer", "Instructional Designer",

    // Engineering & Technology
    "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
    "Mobile App Developer", "DevOps / Cloud Engineer", "Data Scientist", "AI / ML Engineer",
    "AI Engineer (Generative AI / LLM)", "Prompt Engineer", "MLOps Engineer",
    "Cloud Architect", "Solutions Architect", "Enterprise Architect",
    "Cybersecurity Analyst", "Ethical Hacker / Penetration Tester", "Network Engineer", "Embedded Systems Engineer",
    "Blockchain Developer", "Web3 Developer", "Smart Contract Developer",
    "Game Developer", "AR / VR Developer", "IoT Engineer",
    "Civil Engineer", "Structural Engineer", "Geotechnical Engineer", "Highway / Transport Engineer",
    "Mechanical Engineer", "Production / Manufacturing Engineer", "Quality Control Engineer",
    "Electrical Engineer", "Power Systems Engineer", "Electronics Engineer", "VLSI Engineer",
    "Chemical Engineer", "Process Engineer", "Polymer / Textile Engineer",
    "Marine Engineer", "Naval Architect", "Port / Harbor Engineer",
    "Petroleum / Oil & Gas Engineer", "Mining Engineer", "Agricultural Engineer",
    "Aerospace / Aeronautical Engineer", "Environmental Engineer",
    "Robotics Engineer", "Automobile / EV Engineer", "Instrumentation Engineer",
    "Biomedical Engineer", "Genetic Engineer", "Nanotechnology Engineer",

    // Law & Judiciary
    "Advocate / Lawyer", "Corporate Lawyer", "Criminal Defense Lawyer", "Civil Litigation Lawyer",
    "Family Law Lawyer", "Intellectual Property (IP) Lawyer", "Tax Lawyer", "Labour Law Lawyer",
    "Environmental Lawyer", "International Law Lawyer",
    "Public Prosecutor", "District Judge", "High Court Judge", "Supreme Court Advocate",
    "Magistrate", "Legal Advisor / In-House Counsel", "Judiciary Aspirant (Judicial Services)",
    "Notary / Legal Draftsman", "Patent Agent",

    // Business, Finance & Management
    "Chartered Accountant (CA)", "Cost & Management Accountant (CMA)", "Company Secretary (CS)",
    "Investment Banker", "Stock Trader / Analyst", "Mutual Fund Distributor",
    "Financial Planner / Wealth Manager", "Venture Capitalist", "Private Equity Analyst",
    "Actuary", "Tax Consultant", "GST Practitioner", "Auditor",
    "Chief Financial Officer (CFO)", "Chief Executive Officer (CEO)",
    "Management Consultant", "Business Analyst", "Strategy Consultant",
    "Product Manager", "Product Owner", "Project Manager (PMP)",
    "Program Manager", "Scrum Master / Agile Coach", "Portfolio Manager",
    "HR Manager", "Talent Acquisition Specialist", "HR Business Partner", "Payroll Specialist",
    "Operations Manager", "Supply Chain Manager", "Logistics Manager", "Procurement Manager",
    "Warehouse Manager", "Import / Export Manager",
    "Entrepreneur / Startup Founder", "Business Development Manager", "Growth Hacker",
    "Sales Director", "Inside Sales Representative", "Account Manager", "Key Account Manager",
    "Marketing Manager", "Performance Marketing Manager", "Brand Manager", "Category Manager",
    "Digital Marketing Specialist", "SEO / SEM Analyst", "Social Media Manager",
    "E-commerce Manager", "Amazon / Flipkart Seller",

    // Real Estate & Construction
    "Real Estate Agent / Broker", "Property Developer / Builder",
    "Real Estate Investor", "RERA Compliance Officer", "Valuation Officer",
    "Site Engineer", "Construction Project Manager", "Quantity Surveyor",
    "Building Inspector", "Facilities Manager", "Property Manager",

    // Agriculture & Allied Sectors
    "Farmer / Agri-Entrepreneur", "Agricultural Officer", "Horticulturist",
    "Sericulture Officer", "Animal Husbandry Officer", "Fisheries Officer",
    "Agricultural Extension Officer", "Food Technologist", "Dairy Technologist",
    "Agri-Tech Entrepreneur", "Organic Farmer", "Plantation Manager",
    "Cold Chain / Food Supply Manager", "Rubber Board / Spice Board Officer",

    // Creative & Media
    "Graphic Designer", "UX / UI Designer", "Product Designer", "Animator / Motion Designer",
    "3D Artist / CGI Artist", "Concept Artist", "Illustrator",
    "Film Director", "Screenwriter", "Video Editor", "Cinematographer / DoP",
    "Photographer", "Photo Editor",
    "Journalist / Reporter", "News Anchor", "Radio Jockey (RJ)", "Podcast Host",
    "Content Creator / Influencer", "YouTube Creator", "Copywriter",
    "PR Manager", "Advertising Professional", "Media Planner / Buyer",
    "Fashion Designer", "Fashion Stylist", "Textile Designer",
    "Interior Designer", "Landscape Designer", "Architect",
    "Game Designer", "Level Designer", "Game Artist",

    // Performing Arts & Entertainment
    "Actor / Actress", "Stand-up Comedian", "Theatre Artist",
    "Musician / Singer", "Music Composer", "Sound Engineer",
    "Dancer / Choreographer", "Circus / Stunt Performer",
    "Voice-Over Artist", "Dubbing Artist",

    // Hospitality, Travel & Tourism
    "Hotel Manager", "Front Office Manager", "Food & Beverage Manager",
    "Chef / Culinary Expert", "Pastry Chef / Baker", "Bartender / Mixologist",
    "Event Manager", "Wedding Planner",
    "Travel Consultant", "Tour Guide", "Tourism Officer",
    "Cruise Ship Officer / Crew",

    // Aviation & Merchant Navy
    "Commercial Pilot (CPL)", "Airline Transport Pilot (ATPL)",
    "Air Traffic Controller", "Cabin Crew / Flight Attendant",
    "Aircraft Maintenance Engineer (AME)", "Aviation Safety Officer",
    "Merchant Navy Officer (Deck)", "Merchant Navy Engineer",
    "Marine Superintendent", "Port Captain",

    // Sports & Fitness
    "Professional Athlete / Player", "Sports Coach", "Fitness Trainer / Gym Instructor",
    "Yoga Instructor", "Sports Physiotherapist",
    "Sports Manager / Agent", "Sports Analyst", "Referee / Umpire",
    "Esports Player / Coach",

    // Science & Research
    "Research Scientist", "Biotechnologist", "Forensic Scientist",
    "Geologist", "Meteorologist / Climatologist", "Oceanographer",
    "Astrophysicist", "Nuclear Scientist", "Material Scientist",
    "Biochemist", "Microbiologist", "Zoologist", "Botanist",
    "Economist", "Psychologist", "Clinical Psychologist", "Counseling Psychologist",
    "Sociologist", "Anthropologist", "Archaeologist",
    "Statistician / Data Analyst", "Urban Planner",
    "Environmental Scientist", "Space Scientist (ISRO)",

    // Finance & Fintech
    "Fintech Product Manager", "Cryptocurrency Analyst", "DeFi Analyst",
    "Insurance Actuary", "Insurance Agent / Advisor", "Risk Manager", "Compliance Officer",
    "Corporate Treasurer", "Credit Analyst", "Loan Officer", "Mortgage Broker",
    "Portfolio Manager (Investments)", "Fund Manager", "Hedge Fund Analyst",

    // Social, Development & NGO
    "Social Worker / NGO Professional", "Diplomat",
    "Political Scientist", "Political Activist / Worker",
    "Development Sector Professional", "Sustainability Consultant",
    "UN / International Organization Professional",
    "Community Development Worker", "Child Rights Advocate",

    // Spiritual & Wellness
    "Yoga Teacher / Therapist", "Ayurvedic Practitioner",
    "Meditation Coach", "Life Coach / NLP Practitioner",
    "Astrologer", "Vastu Consultant",

    // Skilled Trades & Vocational
    "Electrician", "Plumber", "Welder / Fabricator",
    "Carpenter / Furniture Maker", "Painter / Decorator",
    "Auto Mechanic / Technician", "CNC Operator / Machinist",
    "HVAC Technician", "Solar Panel Installer", "Lift / Elevator Technician",

    // IT & Digital (Non-Engineering)
    "IT Support / Help Desk", "System Administrator", "IT Consultant",
    "Database Administrator (DBA)", "IT Project Manager", "IT Manager / CTO",
    "Business Intelligence (BI) Analyst", "Data Engineer", "Data Architect",
    "Technical Writer / Documentation Specialist", "QA / Test Engineer", "Automation Test Engineer",
    "ERP Consultant (SAP / Oracle)", "CRM Specialist (Salesforce)",

    // Journalism, Publishing & PR
    "Editor (Newspaper / Magazine)", "Sub-Editor", "Columnist / Opinion Writer",
    "Publisher", "Literary Agent", "Book Author",
    "Corporate Communications Manager", "Crisis Management Consultant",

    // Environment & Energy
    "Renewable Energy Consultant", "Wind / Solar Energy Engineer",
    "Carbon Credits Analyst", "Climate Change Specialist",
    "Water Resource Engineer", "Waste Management Specialist",

    // Transport & Logistics
    "Truck Driver / Transport Operator", "Taxi / Auto Aggregator Operator",
    "Shipping Agent", "Customs Clearing Agent", "Freight Broker",
    "Drone Pilot / UAV Operator",

    // Retail & Consumer
    "Retail Store Manager", "Visual Merchandiser", "Buyer / Merchandise Planner",
    "Franchise Owner", "Distributor / Dealer",

    // Healthcare Support & Admin
    "Health Insurance TPA Executive", "Pharmaceutical Sales Representative",
    "Medical Device Sales", "Clinical Data Manager", "Drug Regulatory Affairs Specialist",

    // Other
    "Homemaker / Full-time Parent", "Freelancer / Independent Consultant",
    "Student (Undergraduate)", "Student (Postgraduate)", "Career Changer",
    "Aspirant / Job Seeker", "Other"
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
  const [step, setStep] = useState(1); // 1: Account, 2: OTP, 3: Professional, 4: Profile
  const [authMethod, setAuthMethod] = useState(null); // 'google' or 'manual'
  const [otpCode, setOtpCode] = useState('');
  
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  
  const [imagePreview, setImagePreview] = useState(null);
  const [submitError, setSubmitError] = useState('');
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
    profileImage: null,
    googleId: null
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
    setSubmitError('');
    setFormData(prev => ({ 
      ...prev, 
      [id]: id === 'email' ? value.toLowerCase().trim() : value 
    }));
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

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLinkingGoogle(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        
        setFormData(prev => ({
            ...prev,
            fullName: userInfo.name || prev.fullName,
            email: userInfo.email || prev.email,
            profileImage: userInfo.picture || prev.profileImage,
            googleId: userInfo.sub
        }));
        
        if (userInfo.picture) {
           setImagePreview(userInfo.picture);
        }
        
        setAuthMethod('google');
        setStep(3); // Skip OTP, go straight to Professional Details
      } catch (err) {
        console.error("Google login failed", err);
        alert("Failed to pull Google account details.");
      } finally {
        setIsLinkingGoogle(false);
      }
    },
    onError: (error) => console.log('Login Failed:', error)
  });

  const sendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const response = await apiFetch('/api/auth?action=send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP code');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleManualAccountSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.phone) return alert("Please fill all fields");
    setAuthMethod('manual');
    await sendOtp();
    setStep(2);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return alert("Please enter a 6-digit OTP");
    
    setIsVerifyingOtp(true);
    try {
      const response = await apiFetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: otpCode }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid or expired OTP code');
      }
      
      setStep(3); // Move to Professional details
    } catch (error) {
      alert(error.message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleProfessionalSubmit = (e) => {
      e.preventDefault();
      if (formData.expertise.length === 0) return alert("Select expertise");
      if (!formData.role) return alert("Select profession");
      setStep(4); // Move to Profile
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.organization || !formData.bio) return alert("Please complete all fields");
    
    try {
      const response = await apiFetch('/api/consultants', {
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

      // If Google was used, link it formally on backend
      if (authMethod === 'google' && formData.googleId) {
          const googleRes = await apiFetch('/api/auth?action=google-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              googleId: formData.googleId,
              name: formData.fullName,
              profileImage: formData.profileImage
            }),
          });
          if (googleRes.ok) {
            const result = await googleRes.json();
            localStorage.setItem('consultant_user', JSON.stringify(result.consultant));
            if (result.token) localStorage.setItem('prodecide_jwt', result.token);
          }
      } else {
          // Mock login for manual
          localStorage.setItem('consultant_user', JSON.stringify({ email: formData.email, role: 'consultant' }));
      }
      
      window.location.href = '/consultant-dashboard';
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message);
    }
  };

  const renderProgressBar = () => {
      const displaySteps = [
          { id: 1, label: 'Account' },
          { id: 3, label: 'Professional' },
          { id: 4, label: 'Profile' }
      ];
      
      let currentDisplayStep = 1;
      if (step === 2) currentDisplayStep = 1; // OTP is part of Account
      if (step === 3) currentDisplayStep = 2;
      if (step === 4) currentDisplayStep = 3;

      return (
          <div className="mb-12">
              <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0"></div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: `${(currentDisplayStep - 1) * 50}%` }}></div>
                  
                  {displaySteps.map((s, idx) => {
                      const isActive = (idx + 1) <= currentDisplayStep;
                      return (
                          <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                                  {isActive && (idx + 1) < currentDisplayStep ? <span className="material-symbols-outlined text-lg">check</span> : (idx + 1)}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-widest absolute -bottom-6 whitespace-nowrap ${isActive ? 'text-primary' : 'text-slate-400'}`}>{s.label}</span>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };


  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar tempUser={(authMethod === 'google' || formData.email) ? { name: formData.fullName, email: formData.email, picture: formData.profileImage } : null} />
      
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-20">
        <div className="text-center mb-12">
            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-on-surface mb-4">
              Join the <span className="text-primary">Decision Architects</span>
            </h1>
            <p className="text-secondary text-base">Complete your profile to start matching with high-impact consultations.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-outline-variant/10">
            {renderProgressBar()}

            {/* Step 1: Account Setup */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="font-headline font-bold text-2xl text-on-surface">Create your account</h2>
                        <p className="text-secondary text-sm mt-1">Choose how you'd like to get started</p>
                    </div>

                    <button 
                        type="button"
                        onClick={() => login()}
                        className="w-full py-4 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-sm mb-8"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.18 4.114-3.466 0-6.29-2.902-6.29-6.514 0-3.611 2.824-6.513 6.29-6.513 1.5 0 2.864.544 3.935 1.442l3.197-3.197C19.165 1.944 15.932 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.875 0 10.875-4.248 10.875-11.24 0-.649-.074-1.286-.195-1.955H12.24z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Or use email</span>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>

                    <form onSubmit={handleManualAccountSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Full Name</label>
                            <input value={formData.fullName} onChange={handleChange} required id="fullName" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Email Address</label>
                            <input value={formData.email} onChange={handleChange} required id="email" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="email"/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Phone Number</label>
                            <input value={formData.phone} onChange={handleChange} required id="phone" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="tel"/>
                        </div>
                        <button type="submit" className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 mt-4">
                            Continue
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">mail</span>
                        </div>
                        <h2 className="font-headline font-extrabold text-2xl text-on-surface">Verify your email</h2>
                        <p className="text-secondary text-sm mt-2">
                            We've sent a 6-digit code to <span className="font-semibold text-slate-800">{formData.email}</span>.
                        </p>
                    </div>

                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div className="space-y-2">
                            <input 
                                type="text" 
                                maxLength="6"
                                pattern="\d{6}"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="0 0 0 0 0 0" 
                                required
                                className="w-full px-4 py-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-center text-3xl font-extrabold tracking-[12px] placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isVerifyingOtp}
                            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                        >
                            {isVerifyingOtp ? (
                                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                            ) : 'Verify Code'}
                        </button>
                        <div className="text-center mt-4">
                            <button type="button" onClick={sendOtp} disabled={isSendingOtp} className="text-xs font-bold text-primary hover:underline uppercase tracking-wider disabled:opacity-50">
                                {isSendingOtp ? 'Sending...' : 'Resend Code'}
                            </button>
                            <span className="mx-2 text-slate-300">|</span>
                            <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-secondary hover:text-slate-700 uppercase tracking-wider">
                                Change Email
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 3: Professional Details */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="font-headline font-bold text-2xl text-on-surface">Professional Details</h2>
                        <p className="text-secondary text-sm mt-1">Tell us about your expertise</p>
                    </div>

                    <form onSubmit={handleProfessionalSubmit} className="space-y-6">
                        <div className="space-y-2" ref={professionDropdownRef}>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Profession / Primary Role</label>
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

                        <div className="space-y-2" ref={expertiseDropdownRef}>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Areas of Expertise</label>
                            <div className="relative">
                                <div onClick={() => setIsExpertiseOpen(!isExpertiseOpen)} className="w-full px-4 py-3 rounded-xl bg-slate-50 min-h-[48px] flex flex-wrap justify-between gap-1 items-center cursor-pointer">
                                    <div className="flex flex-wrap items-center gap-1">
                                        {formData.expertise.length > 0 ? (
                                            formData.expertise.map(e => (
                                                <span key={e} className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-bold">{e}</span>
                                            ))
                                        ) : <span className="text-slate-400 text-sm">Select Expertise Areas</span>}
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
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
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Years of Experience</label>
                            <input value={formData.experience} onChange={handleChange} required id="experience" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="number" min="0"/>
                        </div>

                        <div className="flex gap-4 pt-4">
                            {authMethod === 'manual' && (
                                <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                </button>
                            )}
                            <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2">
                                Continue
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Step 4: Profile Completion */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-8">
                        <h2 className="font-headline font-bold text-2xl text-on-surface">Complete your profile</h2>
                        <p className="text-secondary text-sm mt-1">Almost there! Add the final touches.</p>
                    </div>

                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                        <div className="flex flex-col items-center justify-center pb-6">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileImage').click()}>
                                <div className="w-28 h-28 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden ring-4 ring-transparent group-hover:ring-primary/20 transition-all">
                                    {imagePreview || formData.profileImage ? (
                                        <img src={imagePreview || formData.profileImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-3xl text-slate-300">add_a_photo</span>
                                    )}
                                </div>
                                <input type="file" id="profileImage" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </div>
                            <div className="mt-3 text-center">
                                <span className="text-xs font-bold text-primary">Upload Profile Photo</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">City / Country</label>
                                <input value={formData.location} onChange={handleChange} required id="location" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text" placeholder="e.g. New York, USA"/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Current Organization</label>
                                <input value={formData.organization} onChange={handleChange} required id="organization" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="text" placeholder="Company Name"/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">LinkedIn URL</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-4 rounded-l-xl bg-slate-200/50 text-slate-500"><span className="material-symbols-outlined text-sm">link</span></span>
                                <input value={formData.linkedin} onChange={handleChange} required id="linkedin" className="w-full px-4 py-3 rounded-r-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" type="url" placeholder="https://linkedin.com/in/..."/>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-secondary">Short Bio</label>
                            <textarea value={formData.bio} onChange={handleChange} required id="bio" className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary text-sm" placeholder="Briefly describe your core value proposition..." rows="3"></textarea>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => setStep(3)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <button type="submit" className="flex-1 py-4 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 group">
                                Submit Application
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">check_circle</span>
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-secondary mt-2 uppercase tracking-tighter">
                            By submitting, you agree to ProDecide's <span className="text-primary font-bold cursor-pointer">Terms</span> and <span className="text-primary font-bold cursor-pointer">Privacy Policy</span>.
                        </p>
                    </form>
                </div>
            )}
        </div>

      </main>
    </div>
  );
}
