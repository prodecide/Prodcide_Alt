import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Experts() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-headline text-5xl font-extrabold tracking-tight text-on-surface mb-4">Consultant Matchmaker</h1>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {consultants.map((c) => (
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
