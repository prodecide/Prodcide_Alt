import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Experts() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const response = await fetch('/api/consultants');
        if (!response.ok) throw new Error('Failed to fetch consultants');
        const data = await response.json();
        setConsultants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultants();
  }, []);

  // Extract all unique expertise tags from consultants
  const allExpertiseTags = useMemo(() => {
    const tagSet = new Set();
    consultants.forEach(c => {
      if (Array.isArray(c.expertise)) {
        c.expertise.forEach(tag => tagSet.add(tag));
      }
      if (Array.isArray(c.domains)) {
        c.domains.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [consultants]);

  // Apply all filters
  const filteredConsultants = useMemo(() => {
    return consultants.filter(c => {
      // Search filter: match name, role, organization, bio
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [
          c.fullName, c.name, c.role, c.profession,
          c.organization, c.bio
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Expertise filter: consultant must have ALL selected tags
      if (selectedExpertise.length > 0) {
        const cTags = [
          ...(Array.isArray(c.expertise) ? c.expertise : []),
          ...(Array.isArray(c.domains) ? c.domains : [])
        ];
        const hasAll = selectedExpertise.every(tag =>
          cTags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
        if (!hasAll) return false;
      }

      // Rating filter
      if (minRating > 0) {
        const rating = parseFloat(c.rating) || 0;
        if (rating < minRating) return false;
      }

      return true;
    });
  }, [consultants, searchQuery, selectedExpertise, minRating]);

  const toggleExpertise = (tag) => {
    setSelectedExpertise(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedExpertise([]);
    setMinRating(0);
  };

  const hasActiveFilters = searchQuery.trim() || selectedExpertise.length > 0 || minRating > 0;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-headline text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Consultant Matchmaker</h1>
              <p className="text-body text-lg text-on-surface-variant leading-relaxed">
                We've analyzed your project metrics. Here are the experts best equipped to solve your specific scaling and operational bottlenecks.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-tertiary-container/10 p-4 rounded-xl glass-panel">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Live Network</span>
                </div>
                <p className="text-sm font-medium mt-1">{consultants.length} Active specialists</p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Dynamic Filter Bar ─── */}
        {!loading && !error && consultants.length > 0 && (
          <div className="mb-10 animate-fade-in" style={{ animationDuration: '0.5s' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,82,255,0.08)',
                borderRadius: '20px',
                padding: '20px 24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 1px 4px rgba(0,82,255,0.06)',
              }}
            >
              {/* Top row: Search + toggle + clear */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search input */}
                <div style={{
                  flex: '1 1 280px',
                  position: 'relative',
                  minWidth: '200px',
                }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '20px',
                      color: '#94a3b8',
                      pointerEvents: 'none',
                    }}
                  >search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, role, or skill..."
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 44px',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      background: '#fff',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1e293b',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#0052FF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(0,82,255,0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Rating filter */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f8fafc',
                  padding: '8px 16px',
                  borderRadius: '14px',
                  border: '1.5px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min</span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(parseFloat(e.target.value))}
                    style={{
                      width: '80px',
                      accentColor: '#0052FF',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: minRating > 0 ? '#0052FF' : '#94a3b8', minWidth: '24px' }}>
                    {minRating > 0 ? minRating.toFixed(1) : 'Any'}
                  </span>
                </div>

                {/* Expand/collapse toggle */}
                <button
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    background: filtersExpanded ? '#0052FF' : '#f8fafc',
                    color: filtersExpanded ? '#fff' : '#64748b',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
                  Expertise
                  <span className="material-symbols-outlined" style={{
                    fontSize: '16px',
                    transition: 'transform 0.3s',
                    transform: filtersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>expand_more</span>
                </button>

                {/* Clear all */}
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '10px 16px',
                      borderRadius: '14px',
                      border: '1.5px solid #fecaca',
                      background: '#fef2f2',
                      color: '#ef4444',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    Clear
                  </button>
                )}
              </div>

              {/* Expertise pills (collapsible) */}
              <div style={{
                maxHeight: filtersExpanded ? '200px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s, margin-top 0.25s',
                opacity: filtersExpanded ? 1 : 0,
                marginTop: filtersExpanded ? '16px' : '0px',
              }}>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  {allExpertiseTags.map(tag => {
                    const isActive = selectedExpertise.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleExpertise(tag)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '10px',
                          border: isActive ? '1.5px solid #0052FF' : '1.5px solid #e2e8f0',
                          background: isActive ? '#0052FF' : '#fff',
                          color: isActive ? '#fff' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results count */}
              {hasActiveFilters && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0052FF' }}>filter_list</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                    Showing <span style={{ color: '#0052FF', fontWeight: 800 }}>{filteredConsultants.length}</span> of {consultants.length} consultants
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-secondary font-medium">Analyzing expert network...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 text-rose-600 p-8 rounded-2xl text-center border border-rose-100">
            <span className="material-symbols-outlined text-4xl mb-2">database_off</span>
            <p className="font-bold">Database Connection Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : consultants.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_search</span>
            <h3 className="text-2xl font-bold mb-2">No experts found</h3>
            <p className="text-secondary mb-8 max-w-md mx-auto">The network is currently empty. Be the first to register your expertise on our platform.</p>
            <Link to="/registration" className="primary-gradient text-white px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 inline-block">Register Your Profile</Link>
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
            <h3 className="text-2xl font-bold mb-2">No matches found</h3>
            <p className="text-secondary mb-6 max-w-md mx-auto">Try adjusting your filters or search query to find the right consultant.</p>
            <button
              onClick={clearAllFilters}
              style={{
                background: '#0052FF',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: '14px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredConsultants.map((c) => (
              <div key={c._id} className="group bg-white rounded-3xl p-6 border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-inner">
                    <img src={c.profileImage || c.imageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'} alt={c.fullName || c.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-lg text-on-surface">{c.fullName || c.name}</h3>
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                        <span className="material-symbols-outlined text-lg fill-1">star</span>
                        <span>{c.rating || '5.0'}</span>
                      </div>
                    </div>
                    <p className="text-primary font-bold text-[10px] uppercase tracking-widest">{c.role || c.profession}</p>
                    <p className="text-secondary text-[11px] mt-0.5">{c.organization}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(c.expertise) ? c.expertise.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-slate-50 text-slate-500 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter border border-slate-100">{tag}</span>
                    )) : null}
                  </div>
                  <p className="text-sm text-secondary line-clamp-2 leading-relaxed h-10 italic">
                    "{c.bio}"
                  </p>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
                    <Link to={`/profile/${c._id}`} className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors active:scale-95">
                      View Profile
                    </Link>
                    <Link to="/form" state={{ consultant: c }} className="flex-1 text-center bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#003ec7] transition-colors active:scale-95 shadow-lg shadow-primary/10">
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-12 px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-1">
            <Link className="text-lg font-black text-[#0052FF]" to="/">ProDecide</Link>
            <p className="text-[11px] text-slate-400 font-medium">© 2026 AI-First Decision Network</p>
          </div>
          <div className="flex gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
