import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function ConsultantProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing & Ownership states
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editedName, setEditedName] = useState('');
  const [editedRole, setEditedRole] = useState('');
  const [editedOrg, setEditedOrg] = useState('');
  const [editedLoc, setEditedLoc] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [editedExpertise, setEditedExpertise] = useState('');
  const [editedExperiences, setEditedExperiences] = useState([]);
  const [editedEducation, setEditedEducation] = useState([]);

  useEffect(() => {
    if (consultant) {
      const savedUser = localStorage.getItem('consultant_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === consultant.email || parsed._id === consultant._id) {
          setIsOwner(true);
        }
      }
    }
  }, [consultant]);

  const startEditing = () => {
    setEditedName(consultant.fullName || consultant.name || '');
    setEditedRole(consultant.role || consultant.profession || '');
    setEditedOrg(consultant.organization || '');
    setEditedLoc(consultant.location || '');
    setEditedBio(consultant.bio || '');
    setEditedExpertise(
      Array.isArray(consultant.expertise) 
        ? consultant.expertise.join(', ') 
        : (consultant.expertise || '')
    );
    setEditedExperiences(
      Array.isArray(consultant.experienceDetails) 
        ? JSON.parse(JSON.stringify(consultant.experienceDetails)) 
        : []
    );
    setEditedEducation(
      Array.isArray(consultant.educationDetails) 
        ? JSON.parse(JSON.stringify(consultant.educationDetails)) 
        : []
    );
    setIsEditing(true);
  };

  const saveChanges = async () => {
    try {
      const expList = editedExpertise
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        id: consultant._id,
        fullName: editedName,
        name: editedName,
        role: editedRole,
        profession: editedRole,
        organization: editedOrg,
        location: editedLoc,
        bio: editedBio,
        expertise: expList,
        experienceDetails: editedExperiences,
        educationDetails: editedEducation
      };

      const res = await fetch('/api/consultants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to save profile changes');
      }

      setConsultant(prev => ({
        ...prev,
        fullName: editedName,
        name: editedName,
        role: editedRole,
        profession: editedRole,
        organization: editedOrg,
        location: editedLoc,
        bio: editedBio,
        expertise: expList,
        experienceDetails: editedExperiences,
        educationDetails: editedEducation
      }));

      // Update localStorage consultant_user session data as well
      const savedUser = localStorage.getItem('consultant_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email === consultant.email || parsed._id === consultant._id) {
          const updatedUser = {
            ...parsed,
            fullName: editedName,
            name: editedName,
            role: editedRole,
            profession: editedRole,
            organization: editedOrg,
            location: editedLoc,
            bio: editedBio,
            expertise: expList,
            experienceDetails: editedExperiences,
            educationDetails: editedEducation
          };
          localStorage.setItem('consultant_user', JSON.stringify(updatedUser));
        }
      }

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState('5.0');
  const [newReviewName, setNewReviewName] = useState(localStorage.getItem('discovery_verified_name') || '');
  const [newReviewEmail, setNewReviewEmail] = useState(localStorage.getItem('discovery_verified_email') || '');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/consultants?id=${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Consultant profile not found');
          throw new Error('Failed to load profile details');
        }
        const data = await res.json();
        setConsultant(data);
        setAverageRating(data.rating || '5.0');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?consultantId=${id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          if (data.averageRating) {
            setAverageRating(data.averageRating);
          }
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };
    if (consultant) {
      fetchReviews();
    }
  }, [id, consultant]);

  if (loading) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-secondary font-medium">Retrieving consultant profile...</p>
        </div>
      </div>
    );
  }

  if (error || !consultant) {
    return (
      <div className="bg-surface font-body text-on-surface min-h-screen">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="bg-rose-50 text-rose-600 p-8 rounded-3xl border border-rose-100 shadow-md">
            <span className="material-symbols-outlined text-5xl mb-3">person_off</span>
            <h3 className="text-2xl font-bold">Profile Unavailable</h3>
            <p className="text-sm mt-2">{error || 'The requested consultant could not be found.'}</p>
            <button 
              onClick={() => navigate('/experts')}
              className="mt-6 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-95 duration-200 transition-all shadow-md"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop';
  const expertiseList = Array.isArray(consultant.expertise) 
    ? consultant.expertise 
    : (consultant.expertise ? consultant.expertise.split(',').map(s => s.trim()) : []);

  const experiences = Array.isArray(consultant.experienceDetails) ? consultant.experienceDetails : [];
  const education = Array.isArray(consultant.educationDetails) ? consultant.educationDetails : [];
  const taglineQuote = consultant.title || consultant.role || 'Expert Advisor';

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!newReviewName.trim()) {
      setReviewError('Name is required');
      return;
    }
    if (newReviewRating < 1 || newReviewRating > 5) {
      setReviewError('Rating must be between 1 and 5');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consultantId: id,
          userName: newReviewName,
          userEmail: newReviewEmail,
          rating: newReviewRating,
          comment: newReviewComment
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const data = await res.json();
      
      // Update state
      setReviews(prev => [data.review, ...prev]);
      setAverageRating(data.newAverageRating);
      setNewReviewComment('');
      alert('Review successfully submitted!');
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pb-20 selection:bg-primary/10">
      <Navbar />

      {isOwner && (
        <div className="bg-[#0052FF]/10 border-b border-[#0052FF]/20 py-3.5 px-6 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 text-[#0052FF] font-bold">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>You are viewing your public advisor profile.</span>
          </div>
          {!isEditing ? (
            <button 
              onClick={startEditing}
              className="bg-[#0052FF] text-white px-4 py-1.5 rounded-lg font-bold hover:bg-[#0052FF]/90 transition-colors shadow-sm"
            >
              Edit My Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={saveChanges}
                className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg font-bold hover:bg-slate-300 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex min-h-screen max-w-screen-2xl mx-auto relative">
        
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col p-6 gap-2 h-[calc(100vh-80px)] w-72 sticky top-20 z-40 bg-surface-container-low border-r border-outline-variant/10">
          <div className="mb-8 px-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container overflow-hidden border border-outline-variant/20 shadow-sm">
                <img 
                  alt={consultant.fullName || consultant.name} 
                  className="w-full h-full object-cover" 
                  src={consultant.profileImage || consultant.avatar || defaultAvatar}
                />
              </div>
              <div className="min-w-0">
                <div className="font-headline text-sm font-extrabold text-on-surface leading-tight truncate">
                  {consultant.fullName || consultant.name}
                </div>
                <div className="font-body text-[10px] text-on-surface-variant truncate">
                  {consultant.role || consultant.profession}
                </div>
              </div>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            <a className="bg-surface-container-lowest text-primary rounded-xl shadow-sm flex items-center gap-3 px-4 py-3 font-body text-sm font-medium hover:translate-x-1 transition-transform duration-300" href="#overview">
              <span className="material-symbols-outlined text-lg fill-icon">person</span> Profile Overview
            </a>
            {experiences.length > 0 && (
              <a className="text-on-secondary-fixed-variant hover:bg-surface-container-high/50 flex items-center gap-3 px-4 py-3 font-body text-sm font-medium rounded-xl transition-all hover:translate-x-1" href="#experience">
                <span className="material-symbols-outlined text-lg">work</span> Experience
              </a>
            )}
            {education.length > 0 && (
              <a className="text-on-secondary-fixed-variant hover:bg-surface-container-high/50 flex items-center gap-3 px-4 py-3 font-body text-sm font-medium rounded-xl transition-all hover:translate-x-1" href="#education">
                <span className="material-symbols-outlined text-lg">school</span> Education
              </a>
            )}
            <a className="text-on-secondary-fixed-variant hover:bg-surface-container-high/50 flex items-center gap-3 px-4 py-3 font-body text-sm font-medium rounded-xl transition-all hover:translate-x-1" href="#matching">
              <span className="material-symbols-outlined text-lg">auto_awesome</span> Match Analysis
            </a>
          </nav>
          <div className="mt-auto pt-6 border-t border-outline-variant/15 flex flex-col gap-2">
            {isOwner ? (
              <div className="flex flex-col gap-2 w-full">
                {!isEditing ? (
                  <button 
                    onClick={startEditing}
                    className="bg-primary hover:bg-primary-container text-on-primary text-center w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md shadow-primary/10 flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={saveChanges}
                      className="bg-green-600 hover:bg-green-700 text-white text-center w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md shadow-green-500/10 flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">save</span>
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-center w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Cancel
                    </button>
                  </>
                )}
              </div>
            ) : (
              <Link 
                to="/form" 
                state={{ consultant }}
                className="bg-primary hover:bg-primary-container text-on-primary text-center w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-md shadow-primary/10"
              >
                Book Consultation
              </Link>
            )}
            <button 
              onClick={() => navigate('/experts')}
              className="text-on-secondary-fixed-variant border border-outline-variant/20 hover:bg-surface-container-high/50 flex items-center justify-center gap-2 px-4 py-2.5 font-body text-xs font-semibold rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Experts
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-6 md:px-12 lg:px-16 py-12">
          
          {/* Hero Header Section */}
          <section className="mb-16" id="overview">
            <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
              <div className="relative group">
                <div className="w-48 h-64 rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
                  <img 
                    alt={consultant.fullName || consultant.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={consultant.profileImage || consultant.avatar || defaultAvatar}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-surface-container-lowest p-3 rounded-xl shadow-lg flex items-center gap-2 border border-outline-variant/5">
                  <span className="material-symbols-outlined text-amber-500 fill-icon text-lg">star</span>
                  <span className="font-headline font-bold text-on-surface text-sm">{averageRating}</span>
                </div>
              </div>
              <div className="flex-1 pb-4 text-left">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={editedName} 
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-2xl font-extrabold text-on-surface bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary w-full max-w-md"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-primary uppercase block mb-1">Role / Title</label>
                      <input 
                        type="text" 
                        value={editedRole} 
                        onChange={(e) => setEditedRole(e.target.value)}
                        className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary w-full max-w-md"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-primary uppercase block mb-1">Organization</label>
                        <input 
                          type="text" 
                          placeholder="Organization"
                          value={editedOrg} 
                          onChange={(e) => setEditedOrg(e.target.value)}
                          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary w-40"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-primary uppercase block mb-1">Location</label>
                        <input 
                          type="text" 
                          placeholder="Location"
                          value={editedLoc} 
                          onChange={(e) => setEditedLoc(e.target.value)}
                          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary w-40"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-on-surface leading-tight mb-2">
                      {consultant.fullName || consultant.name}
                    </h1>
                    <p className="text-lg font-headline text-primary font-bold tracking-tight uppercase">
                      {consultant.role || consultant.profession}
                    </p>
                    <p className="text-xs text-outline font-semibold mt-1">
                      {consultant.organization || 'Independent'} • {consultant.location || 'Remote'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Bento Grid: Profile Description & Quote */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
              <div className="md:col-span-7 bg-surface-container-low p-8 md:p-10 rounded-2xl relative overflow-hidden border border-outline-variant/5">
                <div className="relative z-10">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 text-on-surface">Personal Profile</h2>
                  {isEditing ? (
                    <textarea 
                      value={editedBio} 
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={6}
                      className="text-sm md:text-base leading-relaxed text-on-surface-variant font-body bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary w-full resize-none"
                    />
                  ) : (
                    <p className="text-sm md:text-base leading-relaxed text-on-surface-variant font-body">
                      {consultant.bio || 'No biography details provided.'}
                    </p>
                  )}
                </div>
                <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              </div>
              <div className="md:col-span-5 bg-on-tertiary-fixed text-white p-8 md:p-10 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-center">
                <span className="material-symbols-outlined text-tertiary-fixed mb-4 text-4xl">format_quote</span>
                <h3 className="text-lg md:text-xl font-headline font-semibold mb-4 leading-snug">
                  "{taglineQuote}"
                </h3>
                <p className="text-xs text-tertiary-fixed-dim leading-relaxed font-body">
                  Structuring answers for complex career decisions is not just about advice, but about forming scalable templates that work in the real world.
                </p>
              </div>
            </div>
          </section>

          {/* Experience Timeline */}
          {(experiences.length > 0 || isEditing) && (
            <section className="mb-20 text-left" id="experience">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Professional Experience</h2>
                {isEditing && (
                  <button 
                    type="button"
                    onClick={() => setEditedExperiences(prev => [...prev, { duration: '2026 - Present', role: 'New Role', company: 'New Company', description: '' }])}
                    className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">add</span> Add Experience
                  </button>
                )}
                <div className="h-[1px] flex-1 mx-8 bg-outline-variant/30"></div>
              </div>
              <div className="space-y-4">
                {isEditing ? (
                  editedExperiences.map((exp, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-200/50 rounded-2xl relative space-y-3 text-left">
                      <button 
                        type="button"
                        onClick={() => setEditedExperiences(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                          <input 
                            type="text" 
                            value={exp.duration} 
                            onChange={(e) => {
                              const updated = [...editedExperiences];
                              updated[idx].duration = e.target.value;
                              setEditedExperiences(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                          <input 
                            type="text" 
                            value={exp.role} 
                            onChange={(e) => {
                              const updated = [...editedExperiences];
                              updated[idx].role = e.target.value;
                              setEditedExperiences(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                          <input 
                            type="text" 
                            value={exp.company} 
                            onChange={(e) => {
                              const updated = [...editedExperiences];
                              updated[idx].company = e.target.value;
                              setEditedExperiences(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                        <textarea 
                          value={exp.description || ''} 
                          onChange={(e) => {
                            const updated = [...editedExperiences];
                            updated[idx].description = e.target.value;
                            setEditedExperiences(updated);
                          }}
                          rows={2}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-primary outline-none resize-none"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  experiences.map((exp, idx) => (
                    <div 
                      key={idx} 
                      className={`group grid grid-cols-1 md:grid-cols-12 p-6 md:p-8 rounded-xl transition-all duration-300 ${
                        idx % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface hover:bg-surface-container-low'
                      } hover:bg-surface-container-low border border-outline-variant/5`}
                    >
                      <div className="md:col-span-3 pb-4 md:pb-0">
                        <span className="text-primary font-bold font-headline text-base md:text-lg italic">
                          {exp.duration}
                        </span>
                      </div>
                      <div className="md:col-span-9">
                        <h4 className="text-lg md:text-xl font-bold text-on-surface mb-1">{exp.role}</h4>
                        <p className="text-primary font-semibold text-sm mb-3">{exp.company}</p>
                        {exp.description && (
                          <p className="text-xs md:text-sm text-outline leading-relaxed max-w-2xl font-body">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Education & Achievements Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 text-left">
            {/* Education */}
            {(education.length > 0 || isEditing) && (
              <section id="education">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Academic Excellence</h2>
                  {isEditing && (
                    <button 
                      type="button"
                      onClick={() => setEditedEducation(prev => [...prev, { degree: 'New Degree', school: 'New Institution', year: 'Graduation Year' }])}
                      className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">add</span> Add
                    </button>
                  )}
                </div>
                <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl space-y-6 border border-outline-variant/5">
                  {isEditing ? (
                    editedEducation.map((edu, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200/50 rounded-xl relative space-y-2 text-left">
                        <button 
                          type="button"
                          onClick={() => setEditedEducation(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Degree</label>
                          <input 
                            type="text" 
                            value={edu.degree} 
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[idx].degree = e.target.value;
                              setEditedEducation(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Institution / School</label>
                          <input 
                            type="text" 
                            value={edu.school} 
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[idx].school = e.target.value;
                              setEditedEducation(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Year / Timeline</label>
                          <input 
                            type="text" 
                            value={edu.year} 
                            onChange={(e) => {
                              const updated = [...editedEducation];
                              updated[idx].year = e.target.value;
                              setEditedEducation(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    education.map((edu, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="bg-primary/10 text-primary p-2.5 rounded-lg h-fit">
                          <span className="material-symbols-outlined text-2xl">school</span>
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-base md:text-lg text-on-surface">{edu.degree}</h4>
                          <p className="text-on-surface-variant font-medium text-xs md:text-sm">{edu.school}</p>
                          <p className="text-[10px] text-outline mt-1 font-semibold italic">{edu.year}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Key Achievements */}
            <section id="achievements">
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-10">Career Milestones</h2>
              <div className="space-y-4">
                <div className="p-5 bg-surface-container-lowest rounded-xl border-l-4 border-primary shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Experience</span>
                    <span className="text-xl font-bold text-primary">{consultant.experience || '5+'} Years</span>
                  </div>
                  <p className="text-on-surface font-semibold text-sm">Strategic Advisory Tenure</p>
                  <p className="text-[10px] text-outline mt-0.5">Continuous corporate leadership and domain expertise matching.</p>
                </div>
                <div className="p-5 bg-surface-container-lowest rounded-xl border-l-4 border-secondary shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-secondary tracking-widest uppercase">Match Index</span>
                    <span className="text-xl font-bold text-secondary">98%</span>
                  </div>
                  <p className="text-on-surface font-semibold text-sm">Decision Architecture Match</p>
                  <p className="text-[10px] text-outline mt-0.5">Aligned with precision logical modeling profiles.</p>
                </div>
              </div>
            </section>
          </div>

          {/* Insight Pulse (Specialized AI Component) */}
          <section className="text-left" id="matching">
            <div className="bg-primary/5 glass-panel rounded-3xl p-8 md:p-12 border border-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-primary/5 select-none">
                <span className="material-symbols-outlined text-[10rem] rotate-12">auto_awesome</span>
              </div>
              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-primary font-bold tracking-widest text-[10px] uppercase">AI Match Analysis</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-4">
                  Why {consultant.fullName || consultant.name} is your optimal guide.
                </h2>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed mb-6">
                  Based on their rich background, {consultant.fullName || consultant.name}'s historical success in{' '}
                  <span className="font-bold text-primary">{consultant.role || consultant.profession}</span> and strategic execution provides a premium alignment with your learning and growth objectives.
                </p>
                {isEditing ? (
                  <div className="space-y-1.5 w-full">
                    <label className="text-[10px] font-bold text-primary uppercase block">Edit Expertise (Comma separated)</label>
                    <input 
                      type="text" 
                      value={editedExpertise} 
                      onChange={(e) => setEditedExpertise(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-primary w-full text-slate-800"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {expertiseList.length > 0 ? (
                      expertiseList.map((skill, i) => (
                        <div 
                          key={i} 
                          className="bg-surface-container-lowest px-3 py-1.5 rounded-full text-xs font-semibold text-primary border border-primary/10 shadow-sm"
                        >
                          {skill}
                        </div>
                      ))
                    ) : (
                      <div className="bg-surface-container-lowest px-3 py-1.5 rounded-full text-xs font-semibold text-primary border border-primary/10 shadow-sm">
                        Strategic Consulting
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="mt-16 text-left mb-16" id="reviews">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Client Reviews & Feedback</h2>
              <div className="h-[1px] flex-1 mx-8 bg-outline-variant/30"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Review List Column */}
              <div className="lg:col-span-7 space-y-6">
                {reviews.length === 0 ? (
                  <div className="bg-surface-container-low border border-outline-variant/5 rounded-2xl p-8 text-center text-secondary">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">chat_bubble_outline</span>
                    <p className="text-sm font-semibold">No reviews yet</p>
                    <p className="text-xs mt-1">Be the first to share your experience with {consultant.fullName || consultant.name}.</p>
                  </div>
                ) : (
                  reviews.map((r, index) => (
                    <div key={index} className="bg-surface-container-low border border-outline-variant/5 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{r.userName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) : 'Just now'}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 text-sm font-bold">
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span>{parseFloat(r.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed font-body italic">
                        "{r.comment || 'No comment left.'}"
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Write Review Column */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="font-headline font-bold text-lg text-slate-900 mb-2">Write a Review</h3>
                <p className="text-xs text-secondary mb-6">Share your feedback from sessions with this advisor.</p>
                
                {reviewError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-lg font-semibold">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter name"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Your Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="Enter email"
                      value={newReviewEmail}
                      onChange={(e) => setNewReviewEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1.5">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="focus:outline-none transition-transform active:scale-90"
                        >
                          <span className={`material-symbols-outlined text-2xl ${newReviewRating >= star ? 'text-amber-500' : 'text-slate-300'}`} style={newReviewRating >= star ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            star
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Comment</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Describe your session experience..."
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary font-medium text-slate-800 resize-none h-20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-3 bg-[#003ec7] hover:bg-[#003ec7]/90 text-white text-xs font-bold uppercase rounded-xl transition shadow-md hover:shadow-primary/10 flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>

            </div>
          </section>

          {/* Call to Action for Mobile */}
          <div className="mt-12 lg:hidden">
            {isOwner ? (
              <div className="flex flex-col gap-2">
                {!isEditing ? (
                  <button 
                    onClick={startEditing}
                    className="block bg-primary hover:bg-primary-container text-on-primary text-center py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={saveChanges}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-xl font-bold text-sm transition-all active:scale-95"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-center py-4 rounded-xl font-bold text-sm transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                to="/form" 
                state={{ consultant }}
                className="block bg-primary hover:bg-primary-container text-on-primary text-center py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
              >
                Book Strategic Session
              </Link>
            )}
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-high w-full py-10 px-8 mt-20 border-t border-outline-variant/15 text-left">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-screen-2xl mx-auto">
          <div className="mb-6 md:mb-0">
            <div className="font-headline font-bold text-on-surface text-lg mb-1">ProDecide Intelligence Group</div>
            <p className="font-body text-xs text-on-surface-variant">© 2026 ProDecide Intelligence Group. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <a className="font-body text-xs text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">Privacy Policy</a>
            <a className="font-body text-xs text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">Terms of Service</a>
            <a className="font-body text-xs text-on-surface-variant hover:text-primary transition-all hover:underline" href="#">Ethical AI Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
